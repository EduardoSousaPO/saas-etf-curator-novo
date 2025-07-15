import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PerformanceData {
  etf_symbol: string;
  purchase_price: number;
  current_price: number;
  shares_quantity: number;
  total_invested: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  purchase_date: string;
}

interface PortfolioPerformance {
  portfolio_id: string;
  portfolio_name: string;
  total_invested: number;
  current_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  etfs_performance: PerformanceData[];
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

    // Buscar dados do portfólio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('*')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: 'Portfólio não encontrado' },
        { status: 404 }
      );
    }

    // Buscar dados de tracking
    const { data: trackingData, error: trackingError } = await supabase
      .from('portfolio_tracking')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id);

    if (trackingError) {
      console.error('Erro ao buscar tracking:', trackingError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados de tracking' },
        { status: 500 }
      );
    }

    if (!trackingData || trackingData.length === 0) {
      return NextResponse.json({
        portfolio_id,
        portfolio_name: portfolio.portfolio_name,
        total_invested: 0,
        current_value: 0,
        total_gain_loss: 0,
        total_gain_loss_percent: 0,
        etfs_performance: []
      });
    }

    // Buscar preços atuais dos ETFs (usando NAV)
    const etfSymbols = [...new Set(trackingData.map(item => item.etf_symbol))];
    const { data: currentPrices, error: pricesError } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, nav, navcurrency')
      .in('symbol', etfSymbols);

    if (pricesError) {
      console.error('Erro ao buscar preços atuais:', pricesError);
      return NextResponse.json(
        { error: 'Erro ao buscar preços atuais' },
        { status: 500 }
      );
    }

    // Criar mapa de preços atuais (usando NAV)
    const priceMap = new Map();
    currentPrices?.forEach(item => {
      priceMap.set(item.symbol, parseFloat(item.nav) || 0);
    });

    // Calcular performance por ETF
    const etfsPerformance: PerformanceData[] = [];
    let totalInvested = 0;
    let currentValue = 0;

    // Agrupar por ETF
    const etfGroups = new Map();
    trackingData.forEach(item => {
      if (!etfGroups.has(item.etf_symbol)) {
        etfGroups.set(item.etf_symbol, []);
      }
      etfGroups.get(item.etf_symbol).push(item);
    });

    // Calcular performance para cada ETF
    etfGroups.forEach((purchases, symbol) => {
      let totalShares = 0;
      let totalCost = 0;
      let weightedAvgPrice = 0;
      let latestPurchaseDate = '';

      purchases.forEach((purchase: any) => {
        const shares = parseFloat(purchase.shares_quantity);
        const price = parseFloat(purchase.purchase_price);
        const cost = shares * price;
        
        totalShares += shares;
        totalCost += cost;
        
        if (purchase.purchase_date > latestPurchaseDate) {
          latestPurchaseDate = purchase.purchase_date;
        }
      });

      weightedAvgPrice = totalCost / totalShares;
      const currentPrice = priceMap.get(symbol) || 0;
      const currentVal = totalShares * currentPrice;
      const gainLoss = currentVal - totalCost;
      const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

      etfsPerformance.push({
        etf_symbol: symbol,
        purchase_price: weightedAvgPrice,
        current_price: currentPrice,
        shares_quantity: totalShares,
        total_invested: totalCost,
        current_value: currentVal,
        gain_loss: gainLoss,
        gain_loss_percent: gainLossPercent,
        purchase_date: latestPurchaseDate
      });

      totalInvested += totalCost;
      currentValue += currentVal;
    });

    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const performance: PortfolioPerformance = {
      portfolio_id,
      portfolio_name: portfolio.portfolio_name,
      total_invested: totalInvested,
      current_value: currentValue,
      total_gain_loss: totalGainLoss,
      total_gain_loss_percent: totalGainLossPercent,
      etfs_performance: etfsPerformance
    };

    return NextResponse.json(performance);
  } catch (error) {
    console.error('Erro na API de performance:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 