import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface ReturnData {
  date: string;
  return: number;
  price: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];
    const period = searchParams.get('period') || '1y'; // 1y, 6m, 3m, 1m
    const interval = searchParams.get('interval') || 'monthly'; // daily, weekly, monthly

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      );
    }

    if (symbols.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 symbols allowed' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando dados históricos para ${symbols.length} ETFs (período: ${period})`);

    // Calcular data de início baseada no período
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1y':
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const symbolsUpper = symbols.map(s => s.toUpperCase());

    // Buscar dados históricos de preços
    const { data: pricesData, error: pricesError } = await supabase
      .from('etf_prices')
      .select('symbol, date, close, volume')
      .in('symbol', symbolsUpper)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (pricesError) {
      throw pricesError;
    }

    // Agrupar dados por símbolo
    const historicalData: Record<string, any> = {};
    
    symbolsUpper.forEach(symbol => {
      const symbolPrices = pricesData?.filter(p => p.symbol === symbol) || [];
      
      // Aplicar intervalo (sampling)
      let sampledPrices = symbolPrices;
      
      if (interval === 'weekly' && symbolPrices.length > 52) {
        // Pegar uma amostra semanal
        sampledPrices = symbolPrices.filter((_, index) => index % 7 === 0);
      } else if (interval === 'monthly' && symbolPrices.length > 12) {
        // Pegar uma amostra mensal
        sampledPrices = symbolPrices.filter((_, index) => index % 30 === 0);
      }

      // Calcular retornos
      const returns: ReturnData[] = [];
      for (let i = 1; i < sampledPrices.length; i++) {
        const currentPrice = sampledPrices[i].close;
        const previousPrice = sampledPrices[i - 1].close;
        
        if (currentPrice && previousPrice && previousPrice > 0) {
          const returnPct = ((currentPrice - previousPrice) / previousPrice) * 100;
          returns.push({
            date: sampledPrices[i].date,
            return: returnPct,
            price: Number(currentPrice)
          });
        }
      }

      // Calcular métricas do período
      const prices = sampledPrices.map(p => p.close).filter(p => p !== null);
      const startPrice = prices[0];
      const endPrice = prices[prices.length - 1];
      
      const totalReturn = startPrice && endPrice && startPrice > 0 
        ? ((endPrice - startPrice) / startPrice) * 100 
        : 0;

      const returnValues = returns.map(r => r.return);
      const avgReturn = returnValues.length > 0 
        ? returnValues.reduce((sum, r) => sum + r, 0) / returnValues.length 
        : 0;

      const volatility = returnValues.length > 1 
        ? Math.sqrt(returnValues.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returnValues.length - 1))
        : 0;

      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const maxDrawdown = maxPrice > 0 ? ((minPrice - maxPrice) / maxPrice) * 100 : 0;

      historicalData[symbol] = {
        symbol,
        period,
        interval,
        dataPoints: sampledPrices.length,
        
        // Dados de preços
        prices: sampledPrices.map(p => ({
          date: p.date,
          close: p.close,
          volume: p.volume
        })),
        
        // Retornos
        returns,
        
        // Métricas do período
        metrics: {
          totalReturn: Number(totalReturn.toFixed(2)),
          avgReturn: Number(avgReturn.toFixed(2)),
          volatility: Number(volatility.toFixed(2)),
          maxDrawdown: Number(maxDrawdown.toFixed(2)),
          startPrice: startPrice,
          endPrice: endPrice,
          maxPrice: maxPrice,
          minPrice: minPrice
        },
        
        // Metadados
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        hasData: sampledPrices.length > 0
      };
    });

    const foundSymbols = Object.keys(historicalData).filter(s => historicalData[s].hasData);
    const notFoundSymbols = symbolsUpper.filter(s => !historicalData[s]?.hasData);

    console.log(`✅ Dados históricos carregados para ${foundSymbols.length}/${symbolsUpper.length} ETFs`);
    
    if (notFoundSymbols.length > 0) {
      console.log(`⚠️ ETFs sem dados históricos: ${notFoundSymbols.join(', ')}`);
    }

    return NextResponse.json({
      data: historicalData,
      metadata: {
        period,
        interval,
        totalSymbols: symbolsUpper.length,
        foundSymbols: foundSymbols.length,
        notFoundSymbols: notFoundSymbols.length,
        foundSymbolsList: foundSymbols,
        notFoundSymbolsList: notFoundSymbols,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dataSource: 'supabase_historical',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de dados históricos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 