import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema para popular alocações
const PopulateAllocationsSchema = z.object({
  portfolio_id: z.string().uuid(),
  user_id: z.string().uuid(),
  etf_allocations: z.array(z.object({
    symbol: z.string(),
    allocation: z.number().min(0).max(100),
    target_amount: z.number().positive()
  }))
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PopulateAllocationsSchema.parse(body);

    console.log('🔄 Populando alocações para portfolio:', validatedData.portfolio_id);

    // Verificar se o portfólio existe e pertence ao usuário
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('id, portfolio_name')
      .eq('id', validatedData.portfolio_id)
      .eq('user_id', validatedData.user_id)
      .single();

    if (portfolioError || !portfolio) {
      console.error('❌ Portfólio não encontrado:', portfolioError);
      return NextResponse.json(
        { error: 'Portfólio não encontrado' },
        { status: 404 }
      );
    }

    // Deletar alocações existentes (se houver)
    const { error: deleteError } = await supabase
      .from('portfolio_allocations')
      .delete()
      .eq('portfolio_id', validatedData.portfolio_id)
      .eq('user_id', validatedData.user_id);

    if (deleteError) {
      console.error('❌ Erro ao deletar alocações existentes:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao limpar alocações existentes' },
        { status: 500 }
      );
    }

    // Inserir novas alocações
    const allocationsToInsert = validatedData.etf_allocations.map(etf => ({
      portfolio_id: validatedData.portfolio_id,
      etf_symbol: etf.symbol,
      allocation_percentage: etf.allocation,
      target_amount: etf.target_amount,
      user_id: validatedData.user_id
    }));

    const { data: insertedAllocations, error: insertError } = await supabase
      .from('portfolio_allocations')
      .insert(allocationsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir alocações:', insertError);
      return NextResponse.json(
        { error: 'Erro ao salvar alocações' },
        { status: 500 }
      );
    }

    console.log('✅ Alocações populadas com sucesso:', insertedAllocations?.length || 0);

    return NextResponse.json({
      success: true,
      data: {
        portfolio_id: validatedData.portfolio_id,
        portfolio_name: portfolio.portfolio_name,
        allocations_count: insertedAllocations?.length || 0,
        allocations: insertedAllocations
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de popular alocações:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolio_id = searchParams.get('portfolio_id');
    const user_id = searchParams.get('user_id');

    if (!portfolio_id || !user_id) {
      return NextResponse.json(
        { error: 'portfolio_id e user_id são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando alocações para portfolio:', portfolio_id);

    // Buscar alocações do portfólio (sem JOIN para evitar erros)
    const { data: allocations, error } = await supabase
      .from('portfolio_allocations')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id)
      .order('allocation_percentage', { ascending: false });

    // Buscar informações do portfolio separadamente
    const { data: portfolioInfo, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('portfolio_name, total_invested')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar alocações:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar alocações' },
        { status: 500 }
      );
    }

    console.log('✅ Alocações encontradas:', allocations?.length || 0);

    // Calcular estatísticas
    const totalAllocation = allocations?.reduce((sum, alloc) => sum + alloc.allocation_percentage, 0) || 0;
    const totalTargetAmount = allocations?.reduce((sum, alloc) => sum + alloc.target_amount, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        portfolio_id,
        portfolio_info: portfolioInfo || null,
        allocations: allocations || [],
        statistics: {
          total_allocation: totalAllocation,
          total_target_amount: totalTargetAmount,
          etf_count: allocations?.length || 0,
          is_fully_allocated: totalAllocation === 100
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de buscar alocações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 