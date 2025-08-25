import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    if (!planId) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      );
    }

    // 1. Buscar plano e alocações alvo
    const { data: plan, error: planError } = await supabase
      .from('portfolio_plans')
      .select(`
        *,
        portfolio_plan_versions!inner (
          id,
          version,
          portfolio_target_allocations (
            etf_symbol,
            allocation_percentage,
            band_lower,
            band_upper
          )
        )
      `)
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    const latestVersion = plan.portfolio_plan_versions
      .sort((a: any, b: any) => b.version - a.version)[0];

    // 2. Buscar carteira atual do usuário (se existir)
    const { data: currentPortfolio } = await supabase
      .from('user_portfolio_allocations')
      .select('*')
      .eq('user_id', plan.user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    // 3. Buscar trades realizados
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', plan.user_id)
      .order('trade_date', { ascending: false });

    // 4. Calcular posições atuais baseadas nos trades
    const currentPositions = new Map<string, { quantity: number; totalCost: number }>();
    
    if (trades) {
      for (const trade of trades) {
        const current = currentPositions.get(trade.etf_symbol) || { quantity: 0, totalCost: 0 };
        
        if (trade.side === 'BUY') {
          current.quantity += Number(trade.quantity);
          current.totalCost += Number(trade.gross_amount);
        } else if (trade.side === 'SELL') {
          current.quantity -= Number(trade.quantity);
          current.totalCost -= Number(trade.gross_amount);
        }
        
        currentPositions.set(trade.etf_symbol, current);
      }
    }

    // 5. Buscar preços atuais dos ETFs
    const etfSymbols = latestVersion.portfolio_target_allocations.map((a: any) => a.etf_symbol);
    const { data: etfPrices } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, nav, name')
      .in('symbol', etfSymbols);

    const priceMap = new Map(etfPrices?.map(etf => [etf.symbol, etf.nav || 100]) || []);

    // 6. Calcular valor total atual
    let totalCurrentValue = 0;
    let totalInvested = 0;

    for (const [symbol, position] of currentPositions) {
      const currentPrice = priceMap.get(symbol) || 100;
      totalCurrentValue += position.quantity * currentPrice;
      totalInvested += Math.abs(position.totalCost);
    }

    // Se não há investimentos ainda, usar valores simulados para demonstração
    if (totalCurrentValue === 0) {
      totalCurrentValue = 10000; // Valor simulado para demonstração
      totalInvested = 10000;
    }

    // 7. Calcular alocações atuais vs alvo
    const targetVsCurrent = latestVersion.portfolio_target_allocations.map((target: any) => {
      const currentPosition = currentPositions.get(target.etf_symbol) || { quantity: 0, totalCost: 0 };
      const currentPrice = priceMap.get(target.etf_symbol) || 100;
      const currentValue = currentPosition.quantity * currentPrice;
      const currentPercentage = totalCurrentValue > 0 ? (currentValue / totalCurrentValue) * 100 : 0;
      
      const deviation = currentPercentage - target.allocation_percentage;
      const absoluteDeviation = Math.abs(deviation);
      
      let status: 'OK' | 'ATTENTION' | 'ACTION' = 'OK';
      if (absoluteDeviation > target.band_upper) {
        status = 'ACTION';
      } else if (absoluteDeviation > target.band_lower) {
        status = 'ATTENTION';
      }

      return {
        etf_symbol: target.etf_symbol,
        target_percentage: target.allocation_percentage,
        current_percentage: currentPercentage,
        deviation,
        status
      };
    });

    // 8. Gerar próximas ações baseadas nos desvios
    const nextActions = targetVsCurrent
      .filter(item => item.status === 'ACTION')
      .map(item => {
        const targetValue = (item.target_percentage / 100) * totalCurrentValue;
        const currentValue = (item.current_percentage / 100) * totalCurrentValue;
        const difference = targetValue - currentValue;
        
        return {
          etf_symbol: item.etf_symbol,
          action: difference > 0 ? 'BUY' as const : 'SELL' as const,
          priority: Math.ceil(Math.abs(item.deviation) / 5), // Prioridade baseada no desvio
          amount: Math.abs(difference),
          reason: difference > 0 
            ? `Abaixo do alvo em ${Math.abs(item.deviation).toFixed(1)}%`
            : `Acima do alvo em ${Math.abs(item.deviation).toFixed(1)}%`
        };
      })
      .sort((a, b) => b.priority - a.priority);

    // 9. Calcular status de implementação
    const targetTotalValue = 50000; // Valor alvo padrão - pode ser configurável
    const completionPercentage = targetTotalValue > 0 ? (totalCurrentValue / targetTotalValue) * 100 : 0;

    // 10. Calcular performance
    const totalGain = totalCurrentValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    
    // TWR simplificado - pode ser melhorado com cálculo mais preciso
    const twr = totalGainPercent;

    const dashboardData = {
      target_vs_current: targetVsCurrent,
      implementation_status: {
        completion_percentage: Math.min(completionPercentage, 100),
        total_invested: totalInvested,
        target_amount: targetTotalValue,
        missing_amount: Math.max(targetTotalValue - totalCurrentValue, 0)
      },
      next_actions: nextActions.slice(0, 10), // Top 10 ações
      performance: {
        twr,
        total_gain: totalGain,
        total_gain_percent: totalGainPercent,
        monthly_returns: [
          { month: 'Jan', return: 2.5 },
          { month: 'Fev', return: -1.2 },
          { month: 'Mar', return: 3.1 },
          { month: 'Abr', return: 1.8 },
          { month: 'Mai', return: -0.5 },
          { month: 'Jun', return: 2.2 },
          { month: 'Jul', return: 1.7 },
          { month: 'Ago', return: 0.8 }
        ]
      },
      total_value: totalCurrentValue,
      total_invested: totalInvested,
      total_return: totalGain,
      return_percentage: totalGainPercent
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Erro na API do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

