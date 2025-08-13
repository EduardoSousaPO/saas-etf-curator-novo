import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { RebalancingEngine } from '@/lib/wealth/rebalancing-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RebalanceRequestSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  rebalance_type: z.enum(['BAND_TRIGGERED', 'HARD_REBALANCE']).default('BAND_TRIGGERED'),
  base_currency: z.string().length(3).default('USD'),
  trading_fee_rate: z.number().min(0).max(0.1).default(0.001), // 0.1% default
  tax_rate: z.number().min(0).max(1).default(0.15), // 15% default
  min_trade_value: z.number().positive().default(100), // $100 minimum trade
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RebalanceRequestSchema.parse(body);

    const { 
      user_id, 
      portfolio_id, 
      rebalance_type, 
      base_currency, 
      trading_fee_rate, 
      tax_rate, 
      min_trade_value 
    } = validatedData;

    // 1. Buscar o plano de portfolio e suas alocações alvo
    const { data: planData, error: planError } = await supabase
      .from('portfolio_plans')
      .select(`
        *,
        portfolio_plan_versions (
          *,
          portfolio_target_allocations (*)
        )
      `)
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (planError || !planData) {
      console.error('Error fetching portfolio plan:', planError);
      return NextResponse.json({ error: 'Portfolio plan not found or access denied' }, { status: 404 });
    }

    const latestVersion = planData.portfolio_plan_versions.sort((a: any, b: any) => b.version - a.version)[0];
    if (!latestVersion || !latestVersion.portfolio_target_allocations) {
      return NextResponse.json({ error: 'No target allocations found for this plan' }, { status: 404 });
    }

    const targetAllocations = latestVersion.portfolio_target_allocations.map((alloc: any) => ({
      etf_symbol: alloc.etf_symbol,
      allocation_percentage: alloc.allocation_percentage,
      band_lower: alloc.band_lower,
      band_upper: alloc.band_upper,
    }));

    // 2. Buscar trades atuais para calcular posições
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user_id)
      .eq('portfolio_id', portfolio_id)
      .order('trade_date', { ascending: true });

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      return NextResponse.json({ error: 'Failed to fetch current positions' }, { status: 500 });
    }

    // 3. Calcular holdings atuais
    const currentHoldings = await calculateCurrentHoldings(trades || [], base_currency);

    if (currentHoldings.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: {
          rebalance_needed: false,
          message: 'Nenhuma posição encontrada para rebalancear',
          actions: [],
        }
      });
    }

    // 4. Configurar engine de rebalanceamento
    const engine = new RebalancingEngine(
      base_currency,
      trading_fee_rate,
      tax_rate,
      min_trade_value
    );

    // 5. Gerar recomendação baseada no tipo solicitado
    let recommendation;
    if (rebalance_type === 'HARD_REBALANCE') {
      recommendation = engine.generateHardRebalancing(
        portfolio_id,
        targetAllocations,
        currentHoldings
      );
    } else {
      recommendation = engine.generateBandRebalancing(
        portfolio_id,
        targetAllocations,
        currentHoldings
      );
    }

    // 6. Simular resultado pós-rebalanceamento
    const simulatedHoldings = engine.simulatePostRebalance(
      currentHoldings,
      recommendation.actions
    );

    // 7. Salvar recomendação no banco (opcional)
    if (recommendation.rebalance_needed) {
      const { error: saveError } = await supabase
        .from('rebalance_suggestions')
        .insert({
          user_id,
          portfolio_id,
          suggestion_type: rebalance_type,
          max_deviation: recommendation.max_deviation,
          total_trades: recommendation.actions.filter(a => a.action !== 'HOLD').length,
          estimated_cost: recommendation.estimated_costs.total_estimated_cost,
          status: 'PENDING',
          suggestion_data: recommendation,
        });

      if (saveError) {
        console.warn('Warning: Failed to save rebalance suggestion:', saveError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...recommendation,
        current_holdings: currentHoldings,
        simulated_post_rebalance: simulatedHoldings,
        summary: {
          actions_needed: recommendation.actions.filter(a => a.action !== 'HOLD').length,
          total_trade_value: recommendation.actions
            .filter(a => a.action !== 'HOLD')
            .reduce((sum, a) => sum + a.recommended_value, 0),
          max_deviation_before: recommendation.max_deviation,
          estimated_max_deviation_after: Math.max(...simulatedHoldings.map(h => 
            Math.abs(h.current_allocation - (targetAllocations.find(t => t.etf_symbol === h.etf_symbol)?.allocation_percentage || 0))
          )),
        },
      },
    });

  } catch (error) {
    console.error('Error generating rebalance recommendation:', error);
    return NextResponse.json({ 
      error: 'Internal server error or invalid parameters' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const portfolio_id = searchParams.get('portfolio_id');

    if (!user_id || !portfolio_id) {
      return NextResponse.json({ error: 'user_id and portfolio_id are required' }, { status: 400 });
    }

    // Buscar sugestões de rebalanceamento existentes
    const { data: suggestions, error } = await supabase
      .from('rebalance_suggestions')
      .select('*')
      .eq('user_id', user_id)
      .eq('portfolio_id', portfolio_id)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching rebalance suggestions:', error);
      return NextResponse.json({ error: 'Failed to fetch rebalance suggestions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: suggestions });

  } catch (error) {
    console.error('Error fetching rebalance suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Função auxiliar para calcular holdings atuais
async function calculateCurrentHoldings(
  trades: any[],
  baseCurrency: string
): Promise<Array<{
  etf_symbol: string;
  quantity: number;
  current_price: number;
  current_value: number;
  current_allocation: number;
  currency: string;
}>> {
  if (trades.length === 0) {
    return [];
  }

  // Agrupar trades por ETF
  const positionsByETF: { [symbol: string]: { quantity: number; totalCost: number } } = {};
  
  for (const trade of trades) {
    if (!positionsByETF[trade.etf_symbol]) {
      positionsByETF[trade.etf_symbol] = { quantity: 0, totalCost: 0 };
    }

    const position = positionsByETF[trade.etf_symbol];
    const tradeValue = trade.quantity * trade.price;

    if (trade.side === 'BUY') {
      position.quantity += trade.quantity;
      position.totalCost += tradeValue;
    } else { // SELL
      const soldRatio = trade.quantity / position.quantity;
      position.quantity -= trade.quantity;
      position.totalCost -= position.totalCost * soldRatio;
    }
  }

  // Calcular preços atuais (mock para MVP)
  const mockCurrentPrices: { [symbol: string]: number } = {
    'SPY': 500, 'QQQ': 450, 'ARKK': 45, 'SMH': 180,
    'BND': 80, 'VYM': 110, 'GLD': 200, 'VTI': 250,
    'VXUS': 60, 'IWM': 200, 'XLF': 35, 'XLE': 90
  };

  const holdings: any[] = [];
  let totalPortfolioValue = 0;

  // Calcular valor atual de cada posição
  for (const [symbol, position] of Object.entries(positionsByETF)) {
    if (position.quantity <= 0) continue;

    const currentPrice = mockCurrentPrices[symbol] || (position.totalCost / position.quantity) * 1.05; // +5% mock growth
    const currentValue = position.quantity * currentPrice;
    totalPortfolioValue += currentValue;

    holdings.push({
      etf_symbol: symbol,
      quantity: position.quantity,
      current_price: currentPrice,
      current_value: currentValue,
      current_allocation: 0, // Será calculado após somar total
      currency: baseCurrency,
    });
  }

  // Calcular alocações percentuais
  return holdings.map((holding: any) => ({
    ...holding,
    current_allocation: totalPortfolioValue > 0 ? (holding.current_value / totalPortfolioValue) * 100 : 0,
  }));
}
