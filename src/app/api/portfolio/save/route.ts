import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Schema de validação para salvar portfólio
const SavePortfolioSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_name: z.string().min(1).max(100),
  etfs: z.array(z.object({
    symbol: z.string(),
    name: z.string(),
    allocation: z.number(),
    amount: z.number()
  })),
  metrics: z.object({
    expectedReturn: z.number(),
    expectedVolatility: z.number(),
    sharpeRatio: z.number()
  }),
  objective: z.string(),
  riskProfile: z.string(),
  investmentAmount: z.number(),
  monthlyContribution: z.number().optional(),
  timeHorizon: z.number().optional(),
  currency: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SavePortfolioSchema.parse(body);

    // Preparar dados para inserção
    const portfolioData = {
      user_id: validatedData.user_id,
      portfolio_name: validatedData.portfolio_name,
      etf_symbols: validatedData.etfs.map(etf => etf.symbol),
      target_allocations: validatedData.etfs.reduce((acc, etf) => {
        acc[etf.symbol] = etf.allocation;
        return acc;
      }, {} as Record<string, number>),
      invested_amounts: validatedData.etfs.reduce((acc, etf) => {
        acc[etf.symbol] = etf.amount;
        return acc;
      }, {} as Record<string, number>),
      total_invested: validatedData.investmentAmount,
      rebalance_threshold: 5.0, // 5% por padrão
      auto_rebalance: false,
      is_active: true
    };

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('user_portfolio_allocations')
      .insert(portfolioData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar portfólio:', error);
      console.error('Dados enviados:', JSON.stringify(portfolioData, null, 2));
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao salvar portfólio no banco de dados',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      portfolio: data,
      message: 'Portfólio salvo com sucesso!' 
    });

  } catch (error) {
    console.error('Erro na API de salvamento:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// API para listar portfólios do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id é obrigatório' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_portfolio_allocations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar portfólios:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar portfólios' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      portfolios: data || [] 
    });

  } catch (error) {
    console.error('Erro na API de listagem:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
} 