import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema para adicionar tracking de ETF
const AddTrackingSchema = z.object({
  portfolio_id: z.string().uuid(),
  etf_symbol: z.string(),
  purchase_date: z.string(),
  purchase_price: z.number().positive(),
  shares_bought: z.number().positive(),
  amount_invested: z.number().positive(),
  user_id: z.string().uuid()
});

// Schema para atualizar tracking
const UpdateTrackingSchema = z.object({
  id: z.string().uuid(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().positive().optional(),
  shares_bought: z.number().positive().optional(),
  amount_invested: z.number().positive().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = AddTrackingSchema.parse(body);

    // Verificar se o portfólio pertence ao usuário
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('id')
      .eq('id', validatedData.portfolio_id)
      .eq('user_id', validatedData.user_id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: 'Portfólio não encontrado' },
        { status: 404 }
      );
    }

    // Inserir tracking
    const { data, error } = await supabase
      .from('portfolio_tracking')
      .insert({
        portfolio_id: validatedData.portfolio_id,
        etf_symbol: validatedData.etf_symbol,
        purchase_date: validatedData.purchase_date,
        purchase_price: validatedData.purchase_price,
        shares_bought: validatedData.shares_bought,
        amount_invested: validatedData.amount_invested,
        user_id: validatedData.user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir tracking:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar dados de tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na API de tracking:', error);
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

    // Buscar tracking do portfólio
    const { data, error } = await supabase
      .from('portfolio_tracking')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tracking:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar dados de tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Erro na API de tracking:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UpdateTrackingSchema.parse(body);

    const { data, error } = await supabase
      .from('portfolio_tracking')
      .update({
        purchase_date: validatedData.purchase_date,
        purchase_price: validatedData.purchase_price,
        shares_bought: validatedData.shares_bought
      })
      .eq('id', validatedData.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar tracking:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar dados de tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na API de tracking:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('portfolio_tracking')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar tracking:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar dados de tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de tracking:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 