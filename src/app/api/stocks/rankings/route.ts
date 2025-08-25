// src/app/api/stocks/rankings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 50);

    console.log(`Buscando rankings de ações - categoria: ${category}, limit: ${limit}`);

    // Definir rankings específicos para ações - CORRIGIDO COM DADOS REAIS
    const rankings = {
      // 1. Melhores Performers (12 meses) - SIMPLES ORDENAÇÃO POR RETORNO
      best_performers: {
        title: 'Melhor Performance',
        description: 'Top 10 ações com maiores retornos nos últimos 12 meses',
        query: supabase
          .from('stocks_unified')
          .select(`
            ticker, name, sector, industry, current_price, market_cap,
            returns_12m, volatility_12m, sharpe_12m, snapshot_date
          `)
          .not('returns_12m', 'is', null)
          .order('returns_12m', { ascending: false, nullsFirst: false })
          .limit(10)
      },

      // 2. Ações Value (P/E baixo + fundamentals) - CORRIGIDO
      value_stocks: {
        title: 'Ações de Valor',
        description: 'Ações negociadas abaixo do valor intrínseco com fundamentos sólidos',
        query: supabase
          .from('stocks_unified')
          .select(`
            ticker, name, sector, industry, current_price, market_cap,
            pe_ratio, pb_ratio, roe, dividend_yield_12m, returns_12m, snapshot_date
          `)
          .not('pe_ratio', 'is', null)
          .gte('market_cap', 500000000) // Mínimo $500M market cap
          .lte('pe_ratio', 25) // P/E <= 25 (mais flexível)
          .gte('roe', 0.05) // ROE >= 5% (formato decimal: 0.05 = 5%)
          .order('pe_ratio', { ascending: true, nullsFirst: false })
          .limit(10)
      },

      // 3. Ações Growth (Alto retorno + crescimento) - CORRIGIDO
      growth_stocks: {
        title: 'Ações de Crescimento',
        description: 'Ações com forte crescimento de receita e lucros',
        query: supabase
          .from('stocks_unified')
          .select(`
            ticker, name, sector, industry, current_price, market_cap,
            returns_12m, returns_24m, volatility_12m, roe, snapshot_date
          `)
          .not('returns_12m', 'is', null)
          .not('roe', 'is', null)
          .gte('returns_12m', 1) // Retorno > 1% (mais flexível)
          .gte('roe', 0.05) // ROE > 5% (formato decimal: 0.05 = 5%)
          .gte('market_cap', 500000000) // Reduzir para $500M
          .order('returns_12m', { ascending: false, nullsFirst: false })
          .limit(10)
      },

      // 4. Campeões de Dividendos - CORRIGIDO
      dividend_champions: {
        title: 'Campeões de Dividendos',
        description: 'Ações que distribuem os maiores dividendos aos acionistas',
        query: supabase
          .from('stocks_unified')
          .select(`
            ticker, name, sector, industry, current_price, market_cap,
            dividend_yield_12m, dividends_12m, returns_12m, snapshot_date
          `)
          .not('dividend_yield_12m', 'is', null)
          .gte('dividend_yield_12m', 0.015) // Mínimo 1.5% yield (formato decimal: 0.015 = 1.5%)
          .gte('market_cap', 500000000) // Mínimo $500M market cap
          .order('dividend_yield_12m', { ascending: false, nullsFirst: false })
          .limit(10)
      },

      // 5. Baixa Volatilidade (Defensivas) - CORRIGIDO
      low_volatility: {
        title: 'Baixa Volatilidade',
        description: 'Ações com menor risco para investidores conservadores',
        query: supabase
          .from('stocks_unified')
          .select(`
            ticker, name, sector, industry, current_price, market_cap,
            volatility_12m, returns_12m, dividend_yield_12m, snapshot_date
          `)
          .not('volatility_12m', 'is', null)
          .lte('volatility_12m', 30) // Máximo 30% volatilidade (formato percentual)
          .gte('market_cap', 2000000000) // Large caps apenas ($2B+)
          .order('volatility_12m', { ascending: true, nullsFirst: false })
          .limit(10)
      },

      // 6. Momentum (Alta performance consistente) - CORRIGIDO
      momentum_stocks: {
        title: 'Momentum Positivo',
        description: 'Ações com momentum positivo e tendência de valorização',
        query: supabase
          .from('stocks_unified')
          .select(`
            ticker, name, sector, industry, current_price, market_cap,
            returns_12m, returns_24m, volatility_12m, snapshot_date
          `)
          .not('returns_12m', 'is', null)
          .gte('returns_12m', 0) // Qualquer retorno positivo
          .gte('market_cap', 500000000) // Reduzir para $500M
          .lte('volatility_12m', 50) // Volatilidade controlada <= 50% (formato percentual)
          .order('returns_12m', { ascending: false, nullsFirst: false })
          .limit(10)
      }
    };

    let results: any = {};

    if (category === 'all') {
      // Buscar todos os rankings
      for (const [key, ranking] of Object.entries(rankings)) {
        try {
          const { data, error } = await ranking.query;
          if (error) {
            console.error(`Erro no ranking ${key}:`, error);
            continue;
          }

          results[key] = {
            title: ranking.title,
            description: ranking.description,
            stocks: data?.map(formatStockForRanking) || [],
            count: data?.length || 0
          };
        } catch (error) {
          console.error(`Erro ao processar ranking ${key}:`, error);
          results[key] = {
            title: ranking.title,
            description: ranking.description,
            stocks: [],
            count: 0,
            error: 'Erro ao carregar dados'
          };
        }
      }
    } else if (rankings[category as keyof typeof rankings]) {
      // Buscar ranking específico
      const ranking = rankings[category as keyof typeof rankings];
      const { data, error } = await ranking.query;

      if (error) {
        console.error(`Erro no ranking ${category}:`, error);
        return NextResponse.json(
          { error: `Erro ao buscar ranking ${category}`, details: error.message },
          { status: 500 }
        );
      }

      results = {
        title: ranking.title,
        description: ranking.description,
        stocks: data?.map(formatStockForRanking) || [],
        count: data?.length || 0
      };
    } else {
      return NextResponse.json(
        { error: 'Categoria de ranking não encontrada' },
        { status: 400 }
      );
    }

    const response = {
      rankings: results,
      category,
      limit,
      available_categories: Object.keys(rankings),
      _source: 'stocks-rankings-api',
      _timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro no Rankings API:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        _source: 'stocks-rankings-error'
      },
      { status: 500 }
    );
  }
}

// Função para formatar dados da ação para ranking
function formatStockForRanking(stock: any) {
  return {
    symbol: stock.ticker,
    company_name: stock.name,
    sector: stock.sector,
    industry: stock.industry,
    stock_price: stock.current_price ? Number(stock.current_price) : null,
    market_cap: stock.market_cap ? Number(stock.market_cap) : null,
    market_cap_formatted: stock.market_cap ? formatMarketCap(Number(stock.market_cap)) : null,
    
    // Métricas de performance - CORRIGIDAS (dados já em formato percentual)
    returns_1m: stock.returns_1m ? Number(stock.returns_1m) : null,
    returns_3m: stock.returns_3m ? Number(stock.returns_3m) : null,
    returns_6m: stock.returns_6m ? Number(stock.returns_6m) : null,
    returns_12m: stock.returns_12m ? Number(stock.returns_12m) : null,
    
    // Métricas de risco
    volatility_12m: stock.volatility_12m ? Number(stock.volatility_12m) : null,
    beta_12m: stock.beta_12m ? Number(stock.beta_12m) : null,
    sharpe_12m: stock.sharpe_12m ? Number(stock.sharpe_12m) : null,
    max_drawdown: stock.max_drawdown ? Number(stock.max_drawdown) : null,
    
    // Métricas fundamentais
    pe_ratio: stock.pe_ratio ? Number(stock.pe_ratio) : null,
    peg_ratio: stock.peg_ratio ? Number(stock.peg_ratio) : null,
    pb_ratio: stock.pb_ratio ? Number(stock.pb_ratio) : null,
    roe: stock.roe ? Number(stock.roe) : null, // CORRIGIDO: dados já em formato percentual
    debt_to_equity: stock.debt_to_equity ? Number(stock.debt_to_equity) : null,
    current_ratio: stock.current_ratio ? Number(stock.current_ratio) : null,
    
    // Crescimento
    revenue_growth_yoy: stock.revenue_growth_yoy ? Number(stock.revenue_growth_yoy) * 100 : null,
    earnings_growth_yoy: stock.earnings_growth_yoy ? Number(stock.earnings_growth_yoy) * 100 : null,
    
    // Dividendos - CORRIGIDOS (dados já em formato percentual)
    dividend_yield_12m: stock.dividend_yield_12m ? Number(stock.dividend_yield_12m) : null,
    dividends_12m: stock.dividends_12m ? Number(stock.dividends_12m) : null,
    
    // Indicadores técnicos
    rsi_14d: stock.rsi_14d ? Number(stock.rsi_14d) : null,
    price_to_ma50: stock.price_to_ma50 ? Number(stock.price_to_ma50) : null,
    price_to_ma200: stock.price_to_ma200 ? Number(stock.price_to_ma200) : null,
    
    // Scores
    quality_score: stock.quality_score ? Number(stock.quality_score) : null,
    ai_quality_score: stock.ai_quality_score ? Number(stock.ai_quality_score) : null,
    ai_growth_score: stock.ai_growth_score ? Number(stock.ai_growth_score) : null,
    ai_value_score: stock.ai_value_score ? Number(stock.ai_value_score) : null,
    ai_momentum_score: stock.ai_momentum_score ? Number(stock.ai_momentum_score) : null,
    
    // Metadata
    last_updated: stock.last_updated
  };
}

// Função auxiliar para formatar market cap
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
}

// Função para calcular score composto baseado na categoria
function calculateCompositeScore(categoryKey: string, stock: any): number {
  switch (categoryKey) {
    case 'best_performers':
      // Score baseado em performance com ajuste por volatilidade
      const performance = (stock.returns_12m || 0) * 0.7;
      const volatilityAdjustment = Math.max(0, 20 - (stock.volatility_12m || 20)) * 0.2;
      const sharpeBonus = (stock.sharpe_12m || 0) * 0.1;
      return Math.max(0, Math.min(100, performance + volatilityAdjustment + sharpeBonus));
      
    case 'value_stocks':
      // Score baseado em múltiplos de valor
      const peScore = stock.pe_ratio ? Math.max(0, 30 - stock.pe_ratio) * 2 : 0;
      const pbScore = stock.pb_ratio ? Math.max(0, 5 - stock.pb_ratio) * 10 : 0;
      const divYieldScore = (stock.dividend_yield_12m || 0) * 100 * 5;
      return Math.max(0, Math.min(100, (peScore + pbScore + divYieldScore) / 3));
      
    case 'growth_stocks':
      // Score baseado em crescimento e qualidade
      const returnScore = (stock.returns_12m || 0) * 0.6;
      const roeScore = (stock.roe || 0) * 0.3;
      const consistencyScore = stock.sharpe_12m ? Math.min(20, stock.sharpe_12m * 10) : 0;
      return Math.max(0, Math.min(100, returnScore + roeScore + consistencyScore));
      
    case 'dividend_champions':
      // Score baseado em dividendos e sustentabilidade
      const yieldScore = (stock.dividend_yield_12m || 0) * 100 * 8;
      const stabilityScore = stock.volatility_12m ? Math.max(0, 30 - stock.volatility_12m) : 0;
      const profitabilityScore = (stock.roe || 0) * 0.5;
      return Math.max(0, Math.min(100, yieldScore + stabilityScore + profitabilityScore));
      
    case 'low_volatility':
      // Score baseado em estabilidade
      const volScore = stock.volatility_12m ? Math.max(0, 50 - stock.volatility_12m * 2) : 0;
      const consistencyScore2 = stock.sharpe_12m ? Math.min(30, stock.sharpe_12m * 15) : 0;
      const sizeScore = stock.market_cap && stock.market_cap > 10e9 ? 20 : 0;
      return Math.max(0, Math.min(100, volScore + consistencyScore2 + sizeScore));
      
    case 'momentum_stocks':
      // Score baseado em momentum
      const momentum12m = (stock.returns_12m || 0) * 0.5;
      const momentum24m = (stock.returns_24m || 0) * 0.3;
      const volumeScore = stock.volume_avg_30d && stock.volume_avg_30d > 1000000 ? 20 : 0;
      return Math.max(0, Math.min(100, momentum12m + momentum24m + volumeScore));
      
    default:
      return 50; // Score neutro
  }
}

// Função para determinar tier de qualidade
function getQualityTier(position: number, totalItems: number): string {
  const percentile = (totalItems - position) / totalItems;
  
  if (percentile >= 0.9) return 'Excellent';
  if (percentile >= 0.7) return 'Good';
  if (percentile >= 0.5) return 'Fair';
  return 'Poor';
}

// Função para obter valor específico da categoria
function getCategoryValue(categoryKey: string, stock: any): number | null {
  switch (categoryKey) {
    case 'best_performers':
    case 'growth_stocks':
    case 'momentum_stocks':
      return stock.returns_12m;
    case 'value_stocks':
      return stock.pe_ratio;
    case 'dividend_champions':
      return stock.dividend_yield_12m;
    case 'low_volatility':
      return stock.volatility_12m;
    default:
      return null;
  }
}

// Função para calcular estatísticas da categoria
function calculateCategoryStatistics(stocks: any[], categoryKey: string) {
  if (!stocks.length) return {};
  
  const values = stocks
    .map(stock => getCategoryValue(categoryKey, stock))
    .filter(val => val !== null && val !== undefined) as number[];
  
  if (!values.length) return {};
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
  
  return {
    average: avg,
    minimum: min,
    maximum: max,
    median,
    count: values.length,
    spread: max - min
  };
}

