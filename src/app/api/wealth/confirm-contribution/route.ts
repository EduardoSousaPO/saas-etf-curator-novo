import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema para confirmar contribuição
const ConfirmContributionSchema = z.object({
  plan_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  date: z.string().optional(), // ISO date string
  distribution: z.array(z.object({
    symbol: z.string(),
    amount: z.number().positive(),
    percentage: z.number().min(0).max(100)
  })),
  notes: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ConfirmContributionSchema.parse(body);

    const contributionDate = validatedData.date ? new Date(validatedData.date) : new Date();

    // 1. Registrar a contribuição como cashflow
    const { data: cashflow, error: cashflowError } = await supabase
      .from('cashflows')
      .insert({
        portfolio_id: validatedData.plan_id,
        type: 'contribution',
        amount: validatedData.amount,
        currency: validatedData.currency,
        date: contributionDate.toISOString(),
        description: `Aporte de ${validatedData.currency} ${validatedData.amount.toLocaleString()}`,
        metadata: {
          distribution: validatedData.distribution,
          notes: validatedData.notes
        }
      })
      .select()
      .single();

    if (cashflowError) {
      console.error('Erro ao registrar cashflow:', cashflowError);
      return NextResponse.json(
        { success: false, error: 'Erro ao registrar contribuição' },
        { status: 500 }
      );
    }

    // 2. Registrar as compras individuais como trades
    const trades = validatedData.distribution.map(item => ({
      portfolio_id: validatedData.plan_id,
      symbol: item.symbol,
      type: 'buy' as const,
      quantity: Math.floor(item.amount / 100), // Estimativa de quantidade (assumindo preço ~$100)
      price: 100, // Preço estimado
      net_amount: item.amount,
      currency: validatedData.currency,
      date: contributionDate.toISOString(),
      source: 'contribution_distribution',
      fees: 0,
      notes: `Distribuição automática de aporte - ${item.percentage.toFixed(2)}%`
    }));

    const { data: tradesData, error: tradesError } = await supabase
      .from('trades')
      .insert(trades)
      .select();

    if (tradesError) {
      console.error('Erro ao registrar trades:', tradesError);
      // Não falha a operação se os trades não forem registrados
    }

    // 3. Registrar evento na timeline
    const { error: timelineError } = await supabase
      .from('timeline_events')
      .insert({
        portfolio_id: validatedData.plan_id,
        type: 'contribution',
        title: 'Aporte Confirmado',
        description: `Aporte de ${validatedData.currency} ${validatedData.amount.toLocaleString()} distribuído automaticamente`,
        date: contributionDate.toISOString(),
        payload: {
          amount: validatedData.amount,
          currency: validatedData.currency,
          distribution: validatedData.distribution,
          trades_created: tradesData?.length || 0
        }
      });

    if (timelineError) {
      console.error('Erro ao registrar timeline:', timelineError);
      // Não falha a operação se o timeline não for registrado
    }

    return NextResponse.json({
      success: true,
      data: {
        cashflow,
        trades: tradesData,
        message: `Aporte de ${validatedData.currency} ${validatedData.amount.toLocaleString()} confirmado com sucesso!`
      }
    });

  } catch (error) {
    console.error('Erro ao confirmar contribuição:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

