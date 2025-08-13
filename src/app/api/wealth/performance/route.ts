import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PerformanceCalculator } from '@/lib/wealth/performance-calculator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PerformanceRequestSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  base_currency: z.string().length(3).default('USD'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validatedData = PerformanceRequestSchema.parse({
      user_id: searchParams.get('user_id'),
      portfolio_id: searchParams.get('portfolio_id'),
      base_currency: searchParams.get('base_currency') || 'USD',
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
    });

    const { user_id, portfolio_id, base_currency, start_date, end_date } = validatedData;

    // 1. Buscar trades
    let tradesQuery = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user_id)
      .eq('portfolio_id', portfolio_id)
      .order('trade_date', { ascending: true });

    if (start_date) tradesQuery = tradesQuery.gte('trade_date', start_date);
    if (end_date) tradesQuery = tradesQuery.lte('trade_date', end_date);

    const { data: trades, error: tradesError } = await tradesQuery;

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }

    // 2. Buscar cashflows
    let cashflowsQuery = supabase
      .from('cashflows')
      .select('*')
      .eq('user_id', user_id)
      .eq('portfolio_id', portfolio_id)
      .order('flow_date', { ascending: true });

    if (start_date) cashflowsQuery = cashflowsQuery.gte('flow_date', start_date);
    if (end_date) cashflowsQuery = cashflowsQuery.lte('flow_date', end_date);

    const { data: cashflows, error: cashflowsError } = await cashflowsQuery;

    if (cashflowsError) {
      console.error('Error fetching cashflows:', cashflowsError);
      return NextResponse.json({ error: 'Failed to fetch cashflows' }, { status: 500 });
    }

    // 3. Buscar taxas de câmbio (simplificado para MVP)
    const { data: fxRates, error: fxError } = await supabase
      .from('fx_rates')
      .select('*')
      .order('rate_date', { ascending: false });

    if (fxError) {
      console.warn('Warning: Failed to fetch FX rates:', fxError);
    }

    // 4. Calcular valores de portfolio históricos
    // Para MVP, vamos simular valores baseados nos trades
    const portfolioValues = await calculatePortfolioValues(trades || [], base_currency);

    // 5. Configurar calculadora de performance
    const calculator = new PerformanceCalculator(base_currency);
    
    // Configurar taxas de câmbio
    if (fxRates && fxRates.length > 0) {
      const exchangeRates = buildExchangeRatesObject(fxRates);
      calculator.setExchangeRates(exchangeRates);
    }

    // 6. Converter dados para formato da calculadora
    const formattedTrades = (trades || []).map(trade => ({
      date: new Date(trade.trade_date),
      etf_symbol: trade.etf_symbol,
      side: trade.side as 'BUY' | 'SELL',
      quantity: trade.quantity,
      price: trade.price,
      currency: trade.currency,
    }));

    const formattedCashflows = (cashflows || []).map(cf => ({
      date: new Date(cf.flow_date),
      amount: cf.amount,
      currency: cf.currency,
      type: cf.flow_type as 'CONTRIBUTION' | 'WITHDRAWAL' | 'DIVIDEND' | 'FEE',
    }));

    // 7. Calcular métricas de performance
    const performanceMetrics = calculator.calculateCompletePerformance(
      formattedTrades,
      formattedCashflows,
      portfolioValues
    );

    // 8. Calcular performance por ETF
    const uniqueETFs = [...new Set(formattedTrades.map(t => t.etf_symbol))];
    const etfPerformances: any[] = [];

    for (const etfSymbol of uniqueETFs) {
      // Para MVP, usar preço mock ou último preço de trade
      const lastTrade = formattedTrades
        .filter(t => t.etf_symbol === etfSymbol)
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      
      const currentPrice = lastTrade ? lastTrade.price * 1.05 : 100; // Mock: +5% do último trade
      
      const etfPerf = calculator.calculateETFPerformance(
        etfSymbol,
        formattedTrades,
        formattedCashflows,
        currentPrice,
        'USD'
      );
      
      etfPerformances.push(etfPerf);
    }

    return NextResponse.json({
      success: true,
      data: {
        performance: performanceMetrics,
        etf_performances: etfPerformances,
        portfolio_values: portfolioValues,
        summary: {
          total_trades: trades?.length || 0,
          total_cashflows: cashflows?.length || 0,
          period_start: start_date || (trades?.[0]?.trade_date),
          period_end: end_date || new Date().toISOString().split('T')[0],
          base_currency,
        },
      },
    });

  } catch (error) {
    console.error('Error calculating performance:', error);
    return NextResponse.json({ 
      error: 'Internal server error or invalid parameters' 
    }, { status: 500 });
  }
}

// Função auxiliar para calcular valores históricos do portfolio
async function calculatePortfolioValues(
  trades: any[],
  baseCurrency: string
): Promise<Array<{ date: Date; value: number; currency: string }>> {
  const values: Array<{ date: Date; value: number; currency: string }> = [];
  
  if (trades.length === 0) {
    return values;
  }

  // Agrupar trades por data
  const tradesByDate = trades.reduce((acc, trade) => {
    const dateKey = trade.trade_date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(trade);
    return acc;
  }, {});

  let portfolioValue = 0;
  const holdings: { [symbol: string]: { quantity: number; avgPrice: number } } = {};

  // Processar trades cronologicamente
  const sortedDates = Object.keys(tradesByDate).sort();
  
  for (const date of sortedDates) {
    const dayTrades = tradesByDate[date];
    
    for (const trade of dayTrades) {
      if (!holdings[trade.etf_symbol]) {
        holdings[trade.etf_symbol] = { quantity: 0, avgPrice: 0 };
      }

      const holding = holdings[trade.etf_symbol];
      
      if (trade.side === 'BUY') {
        const newTotalCost = (holding.quantity * holding.avgPrice) + (trade.quantity * trade.price);
        const newTotalQuantity = holding.quantity + trade.quantity;
        holding.avgPrice = newTotalQuantity > 0 ? newTotalCost / newTotalQuantity : 0;
        holding.quantity = newTotalQuantity;
      } else { // SELL
        holding.quantity = Math.max(0, holding.quantity - trade.quantity);
        if (holding.quantity === 0) {
          holding.avgPrice = 0;
        }
      }
    }

    // Calcular valor total do portfolio (usando preços médios como aproximação)
    portfolioValue = Object.entries(holdings).reduce((total, [symbol, holding]) => {
      // Para MVP, usar preço médio de compra como valor atual (simplificado)
      return total + (holding.quantity * holding.avgPrice);
    }, 0);

    values.push({
      date: new Date(date),
      value: portfolioValue,
      currency: baseCurrency,
    });
  }

  // Adicionar valor atual (hoje)
  if (values.length > 0) {
    values.push({
      date: new Date(),
      value: portfolioValue * 1.03, // Mock: +3% desde último trade
      currency: baseCurrency,
    });
  }

  return values;
}

// Função auxiliar para construir objeto de taxas de câmbio
function buildExchangeRatesObject(fxRates: any[]): any {
  const rates: any = {};
  
  for (const rate of fxRates) {
    if (!rates[rate.from_currency]) {
      rates[rate.from_currency] = {};
    }
    if (!rates[rate.from_currency][rate.to_currency]) {
      rates[rate.from_currency][rate.to_currency] = {};
    }
    rates[rate.from_currency][rate.to_currency][rate.rate_date] = rate.rate;
  }

  return rates;
}
