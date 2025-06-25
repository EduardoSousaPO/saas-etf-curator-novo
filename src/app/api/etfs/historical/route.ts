import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// Interfaces para tipagem
interface YFinanceData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_close: number;
}

interface HistoricalResponse {
  symbol: string;
  period: string;
  dataPoints: number;
  prices: YFinanceData[];
  metrics: {
    totalReturn: number;
    startPrice: number;
    endPrice: number;
    highestPrice: number;
    lowestPrice: number;
    averageVolume: number;
    volatility: number;
    sharpeRatio: number;
  };
  hasData: boolean;
}

// Função para buscar dados do Yahoo Finance
async function fetchYahooFinanceData(symbol: string, period: string): Promise<YFinanceData[]> {
  try {
    const yahooApiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    // Converter período em segundos
    const periodSecondsMap: Record<string, number> = {
      '1m': 30 * 24 * 60 * 60,    // 30 dias
      '3m': 90 * 24 * 60 * 60,    // 90 dias
      '6m': 180 * 24 * 60 * 60,   // 180 dias
      '1y': 365 * 24 * 60 * 60    // 365 dias
    };
    const periodSeconds = periodSecondsMap[period] || periodSecondsMap['1y'];
    
    const params = new URLSearchParams({
      period1: Math.floor(Date.now() / 1000 - periodSeconds).toString(),
      period2: Math.floor(Date.now() / 1000).toString(),
      interval: '1d',
      includePrePost: 'true',
      events: 'div,splits'
    });

    const response = await fetch(`${yahooApiUrl}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error('No data returned from Yahoo Finance');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];

    const historicalData: YFinanceData[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const date = new Date(timestamps[i] * 1000);
      
      // Pular dados inválidos
      if (!quotes.open?.[i] || !quotes.close?.[i]) continue;

      historicalData.push({
        symbol,
        date: date.toISOString().split('T')[0],
        open: Number(quotes.open[i].toFixed(2)),
        high: Number(quotes.high[i].toFixed(2)),
        low: Number(quotes.low[i].toFixed(2)),
        close: Number(quotes.close[i].toFixed(2)),
        volume: quotes.volume[i] || 0,
        adj_close: Number((adjClose[i] || quotes.close[i]).toFixed(2))
      });
    }

    return historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  } catch (error) {
    console.error(`❌ Erro ao buscar dados do Yahoo Finance para ${symbol}:`, error);
    return [];
  }
}



// Função para calcular métricas dos dados históricos
function calculateMetrics(prices: YFinanceData[]): HistoricalResponse['metrics'] {
  if (prices.length === 0) {
    return {
      totalReturn: 0,
      startPrice: 0,
      endPrice: 0,
      highestPrice: 0,
      lowestPrice: 0,
      averageVolume: 0,
      volatility: 0,
      sharpeRatio: 0
    };
  }

  const startPrice = prices[0].adj_close;
  const endPrice = prices[prices.length - 1].adj_close;
  const totalReturn = ((endPrice - startPrice) / startPrice) * 100;
  
  const highestPrice = Math.max(...prices.map(p => p.high));
  const lowestPrice = Math.min(...prices.map(p => p.low));
  const averageVolume = prices.reduce((sum, p) => sum + p.volume, 0) / prices.length;

  // Calcular volatilidade (desvio padrão dos retornos diários)
  const dailyReturns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i].adj_close - prices[i-1].adj_close) / prices[i-1].adj_close;
    dailyReturns.push(dailyReturn);
  }
  
  const meanReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Anualizada

  // Calcular Sharpe Ratio (assumindo taxa livre de risco de 2%)
  const riskFreeRate = 0.02;
  const annualizedReturn = totalReturn * (365 / prices.length);
  const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / (volatility / 100) : 0;

  return {
    totalReturn: Number(totalReturn.toFixed(2)),
    startPrice: Number(startPrice.toFixed(2)),
    endPrice: Number(endPrice.toFixed(2)),
    highestPrice: Number(highestPrice.toFixed(2)),
    lowestPrice: Number(lowestPrice.toFixed(2)),
    averageVolume: Math.round(averageVolume),
    volatility: Number(volatility.toFixed(2)),
    sharpeRatio: Number(sharpeRatio.toFixed(2))
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];
    const period = searchParams.get('period') || '1y';

    // Validação de parâmetros
    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      );
    }

    if (!['1m', '3m', '6m', '1y'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Use: 1m, 3m, 6m, 1y' },
        { status: 400 }
      );
    }

    // Limitar número de símbolos para evitar sobrecarga
    if (symbols.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 symbols allowed per request' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando dados históricos do Yahoo Finance para ${symbols.length} ETFs (período: ${period})`);

    const symbolsUpper = symbols.map(s => s.toUpperCase());

    // Verificar se os símbolos existem no nosso banco usando active_etfs
    const { data: etfData, error: etfError } = await supabase
      .from('active_etfs')
      .select('symbol, name, nav')
      .in('symbol', symbolsUpper);

    if (etfError) {
      console.error('❌ Erro ao verificar ETFs no banco:', etfError);
      return NextResponse.json(
        { error: 'Database error', details: etfError },
        { status: 500 }
      );
    }

    const validSymbols = etfData?.map(etf => etf.symbol) || [];
    const invalidSymbols = symbolsUpper.filter(symbol => !validSymbols.includes(symbol));

    if (invalidSymbols.length > 0) {
      console.log(`⚠️ Símbolos não encontrados no banco: ${invalidSymbols.join(', ')}`);
    }

    // Buscar dados históricos do Yahoo Finance para símbolos válidos
    const historicalPromises = validSymbols.map(async (symbol) => {
      const prices = await fetchYahooFinanceData(symbol, period);
      
      if (prices.length === 0) {
        return null;
      }

      return {
        symbol,
        period,
        dataPoints: prices.length,
        prices,
        metrics: calculateMetrics(prices),
        hasData: true
      };
    });

    // Executar todas as buscas em paralelo
    const results = await Promise.all(historicalPromises);
    const successfulResults = results.filter(result => result !== null) as HistoricalResponse[];

    // Organizar dados por símbolo
    const historicalData: Record<string, HistoricalResponse> = {};
    successfulResults.forEach(result => {
      historicalData[result.symbol] = result;
    });

    const foundSymbols = Object.keys(historicalData);
    const failedSymbols = validSymbols.filter(symbol => !foundSymbols.includes(symbol));

    console.log(`✅ Dados históricos obtidos para ${foundSymbols.length} ETFs`);
    if (failedSymbols.length > 0) {
      console.log(`⚠️ Falha ao obter dados para: ${failedSymbols.join(', ')}`);
    }

    // Retornar dados mesmo se alguns símbolos falharam
    return NextResponse.json({
      success: true,
      data: historicalData,
      metadata: {
        requestedSymbols: symbolsUpper,
        foundSymbols,
        failedSymbols,
        invalidSymbols,
        period,
        dataSource: 'yahoo_finance_realtime',
        timestamp: new Date().toISOString(),
        totalDataPoints: successfulResults.reduce((sum, result) => sum + result.dataPoints, 0)
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de dados históricos:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 