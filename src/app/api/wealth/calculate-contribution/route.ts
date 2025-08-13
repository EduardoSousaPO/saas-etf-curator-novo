import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CalculateContributionSchema = z.object({
  plan_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  scheduled_date: z.string().nullable().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CalculateContributionSchema.parse(body);

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
      .eq('id', validatedData.plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    const latestVersion = plan.portfolio_plan_versions
      .sort((a: any, b: any) => b.version - a.version)[0];

    // 2. Buscar posições atuais via trades
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', plan.user_id)
      .order('trade_date', { ascending: false });

    // 3. Calcular posições atuais
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

    // 4. Buscar preços atuais
    const etfSymbols = latestVersion.portfolio_target_allocations.map((a: any) => a.etf_symbol);
    const { data: etfPrices } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, nav, name, expenseratio')
      .in('symbol', etfSymbols);

    const priceMap = new Map(etfPrices?.map(etf => [etf.symbol, { 
      price: etf.nav || 100, 
      name: etf.name,
      expense_ratio: etf.expenseratio || 0
    }]) || []);

    // 5. Calcular valor total atual
    let totalCurrentValue = 0;
    for (const [symbol, position] of currentPositions) {
      const etfInfo = priceMap.get(symbol);
      if (etfInfo) {
        totalCurrentValue += position.quantity * etfInfo.price;
      }
    }

    // 6. Calcular valor total após aporte
    const newTotalValue = totalCurrentValue + validatedData.amount;

    // 7. Calcular distribuição ideal do aporte
    const distributionRecommendation = latestVersion.portfolio_target_allocations.map((target: any) => {
      const etfInfo = priceMap.get(target.etf_symbol);
      const currentPosition = currentPositions.get(target.etf_symbol) || { quantity: 0, totalCost: 0 };
      
      if (!etfInfo) {
        return {
          etf_symbol: target.etf_symbol,
          etf_name: target.etf_symbol,
          target_percentage: target.allocation_percentage,
          target_value_after_contribution: 0,
          current_value: 0,
          recommended_purchase: 0,
          recommended_shares: 0,
          current_percentage: 0,
          deviation_after: 0,
          priority: 0
        };
      }

      const currentValue = currentPosition.quantity * etfInfo.price;
      const currentPercentage = totalCurrentValue > 0 ? (currentValue / totalCurrentValue) * 100 : 0;
      
      // Valor alvo após o aporte
      const targetValueAfter = (target.allocation_percentage / 100) * newTotalValue;
      
      // Quanto precisa comprar para atingir o alvo
      const recommendedPurchase = Math.max(0, targetValueAfter - currentValue);
      const recommendedShares = recommendedPurchase > 0 ? recommendedPurchase / etfInfo.price : 0;
      
      // Desvio após a compra recomendada
      const valueAfterPurchase = currentValue + recommendedPurchase;
      const percentageAfterPurchase = (valueAfterPurchase / newTotalValue) * 100;
      const deviationAfter = percentageAfterPurchase - target.allocation_percentage;
      
      // Prioridade baseada no desvio atual e no valor da compra
      const currentDeviation = Math.abs(currentPercentage - target.allocation_percentage);
      const priority = currentDeviation * (recommendedPurchase / validatedData.amount) * 100;

      return {
        etf_symbol: target.etf_symbol,
        etf_name: etfInfo.name || target.etf_symbol,
        target_percentage: target.allocation_percentage,
        target_value_after_contribution: targetValueAfter,
        current_value: currentValue,
        current_percentage: currentPercentage,
        recommended_purchase: recommendedPurchase,
        recommended_shares: recommendedShares,
        deviation_after: deviationAfter,
        priority: Math.round(priority),
        expense_ratio: etfInfo.expense_ratio,
        current_price: etfInfo.price
      };
    }).sort((a, b) => b.priority - a.priority);

    // 8. Verificar se a soma das compras recomendadas bate com o aporte
    const totalRecommendedPurchase = distributionRecommendation.reduce(
      (sum, item) => sum + item.recommended_purchase, 0
    );

    // 9. Ajustar proporcionalmente se necessário
    if (totalRecommendedPurchase > 0 && Math.abs(totalRecommendedPurchase - validatedData.amount) > 0.01) {
      const adjustmentFactor = validatedData.amount / totalRecommendedPurchase;
      
      distributionRecommendation.forEach(item => {
        item.recommended_purchase *= adjustmentFactor;
        item.recommended_shares = item.recommended_purchase / item.current_price;
      });
    }

    // 10. Calcular impacto na carteira
    const portfolioImpact = {
      current_total_value: totalCurrentValue,
      new_total_value: newTotalValue,
      contribution_amount: validatedData.amount,
      contribution_percentage: (validatedData.amount / newTotalValue) * 100,
      number_of_etfs_to_buy: distributionRecommendation.filter(item => item.recommended_purchase > 10).length,
      largest_purchase: Math.max(...distributionRecommendation.map(item => item.recommended_purchase)),
      most_underweight_etf: distributionRecommendation[0]?.etf_symbol || null
    };

    return NextResponse.json({
      success: true,
      data: {
        distribution_recommendation: distributionRecommendation,
        portfolio_impact: portfolioImpact,
        summary: {
          total_contribution: validatedData.amount,
          currency: validatedData.currency,
          scheduled_date: validatedData.scheduled_date,
          calculation_date: new Date().toISOString(),
          plan_name: plan.name
        }
      }
    });

  } catch (error) {
    console.error('Erro no cálculo de contribuição:', error);
    
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

