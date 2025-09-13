/**
 * API para Comparação de ETFs via Chat
 * Endpoint: POST /api/etfs/compare-chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 Comparando ETFs via chat:', body);
    
    const { symbols, period, metrics, includeCorrelation } = body;
    
    if (!symbols || symbols.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'É necessário fornecer pelo menos 2 ETFs para comparação'
      }, { status: 400 });
    }
    
    // Buscar dados dos ETFs no Supabase
    const { data: etfsData, error } = await supabase
      .from('etfs_ativos_reais')
      .select(`
        symbol, name, description, expenseratio, totalasset, nav,
        returns_12m, returns_24m, returns_36m, returns_5y, ten_year_return,
        volatility_12m, volatility_24m, volatility_36m, ten_year_volatility,
        sharpe_12m, sharpe_24m, sharpe_36m, ten_year_sharpe,
        max_drawdown, beta_12m, dividend_yield_12m,
        morningstar_rating, sustainability_rating,
        top_10_holdings, sector_allocation
      `)
      .in('symbol', symbols.map((s: string) => s.toUpperCase()));
    
    if (error) {
      throw new Error(`Erro ao buscar dados dos ETFs: ${error.message}`);
    }
    
    if (!etfsData || etfsData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum ETF encontrado com os símbolos fornecidos'
      }, { status: 404 });
    }
    
    // Processar dados para comparação
    const comparison = etfsData.map(etf => ({
      symbol: etf.symbol,
      name: etf.name,
      description: etf.description,
      
      // Custos
      expenseRatio: etf.expenseratio,
      totalAssets: etf.totalasset,
      nav: etf.nav,
      
      // Performance
      returns: {
        '12m': etf.returns_12m,
        '24m': etf.returns_24m,
        '36m': etf.returns_36m,
        '5y': etf.returns_5y,
        '10y': etf.ten_year_return
      },
      
      // Risco
      volatility: {
        '12m': etf.volatility_12m,
        '24m': etf.volatility_24m,
        '36m': etf.volatility_36m,
        '10y': etf.ten_year_volatility
      },
      
      // Métricas ajustadas ao risco
      sharpe: {
        '12m': etf.sharpe_12m,
        '24m': etf.sharpe_24m,
        '36m': etf.sharpe_36m,
        '10y': etf.ten_year_sharpe
      },
      
      maxDrawdown: etf.max_drawdown,
      beta: etf.beta_12m,
      dividendYield: etf.dividend_yield_12m,
      
      // Ratings
      morningStar: etf.morningstar_rating,
      sustainability: etf.sustainability_rating,
      
      // Holdings
      topHoldings: etf.top_10_holdings,
      sectorAllocation: etf.sector_allocation
    }));
    
    // Calcular métricas de comparação
    const comparisonMetrics = calculateComparisonMetrics(comparison, period);
    
    // Gerar análise textual
    const analysis = generateComparisonAnalysis(comparison, comparisonMetrics);
    
    const response = {
      success: true,
      comparison,
      metrics: comparisonMetrics,
      analysis,
      period: period || '12m',
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Comparação de ETFs concluída via chat');
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao comparar ETFs via chat:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Calcula métricas de comparação
 */
function calculateComparisonMetrics(etfs: any[], period: string = '12m') {
  const periodKey = period as keyof typeof etfs[0]['returns'];
  
  const returns = etfs.map(etf => etf.returns[periodKey]).filter(r => r !== null);
  const volatilities = etfs.map(etf => etf.volatility[periodKey]).filter(v => v !== null);
  const sharpes = etfs.map(etf => etf.sharpe[periodKey]).filter(s => s !== null);
  const expenses = etfs.map(etf => etf.expenseRatio).filter(e => e !== null);
  
  return {
    bestPerformer: etfs.find(etf => etf.returns[periodKey] === Math.max(...returns)),
    lowestRisk: etfs.find(etf => etf.volatility[periodKey] === Math.min(...volatilities)),
    bestSharpe: etfs.find(etf => etf.sharpe[periodKey] === Math.max(...sharpes)),
    lowestCost: etfs.find(etf => etf.expenseRatio === Math.min(...expenses)),
    
    averageReturn: returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : null,
    averageVolatility: volatilities.length > 0 ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length : null,
    averageExpense: expenses.length > 0 ? expenses.reduce((a, b) => a + b, 0) / expenses.length : null,
    
    period
  };
}

/**
 * Gera análise textual da comparação
 */
function generateComparisonAnalysis(etfs: any[], metrics: any): string {
  const analysis = [];
  
  analysis.push(`**Comparação de ${etfs.length} ETFs:**`);
  analysis.push('');
  
  if (metrics.bestPerformer) {
    analysis.push(`🏆 **Melhor Performance (${metrics.period}):** ${metrics.bestPerformer.symbol} com ${metrics.bestPerformer.returns[metrics.period]?.toFixed(2)}%`);
  }
  
  if (metrics.lowestRisk) {
    analysis.push(`🛡️ **Menor Risco:** ${metrics.lowestRisk.symbol} com volatilidade de ${metrics.lowestRisk.volatility[metrics.period]?.toFixed(2)}%`);
  }
  
  if (metrics.bestSharpe) {
    analysis.push(`⚖️ **Melhor Sharpe Ratio:** ${metrics.bestSharpe.symbol} com ${metrics.bestSharpe.sharpe[metrics.period]?.toFixed(2)}`);
  }
  
  if (metrics.lowestCost) {
    analysis.push(`💰 **Menor Custo:** ${metrics.lowestCost.symbol} com taxa de ${metrics.lowestCost.expenseRatio?.toFixed(3)}%`);
  }
  
  analysis.push('');
  analysis.push('**Resumo:**');
  
  etfs.forEach(etf => {
    const return12m = etf.returns['12m'] ? `${etf.returns['12m'].toFixed(1)}%` : 'N/A';
    const vol12m = etf.volatility['12m'] ? `${etf.volatility['12m'].toFixed(1)}%` : 'N/A';
    const expense = etf.expenseRatio ? `${etf.expenseRatio.toFixed(3)}%` : 'N/A';
    
    analysis.push(`• **${etf.symbol}**: Retorno ${return12m}, Risco ${vol12m}, Taxa ${expense}`);
  });
  
  return analysis.join('\n');
}
