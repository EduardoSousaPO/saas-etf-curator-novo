// src/app/api/stocks/comparator/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'Parâmetro symbols é obrigatório' },
        { status: 400 }
      );
    }

    // Processar símbolos (separados por vírgula)
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum símbolo válido fornecido' },
        { status: 400 }
      );
    }

    if (symbols.length > 10) {
      return NextResponse.json(
        { error: 'Máximo de 10 ações podem ser comparadas simultaneamente' },
        { status: 400 }
      );
    }

    console.log(`Comparando ações: ${symbols.join(', ')}`);

    // Buscar dados completos das ações (apenas campos que existem)
    const { data: stocksData, error } = await supabase
      .from('stocks_ativos_reais')
      .select(`
        symbol,
        company_name,
        business_description,
        sector,
        industry,
        exchange,
        headquarters,
        employees_count,
        stock_price,
        market_cap,
        shares_outstanding,
        volume_avg_30d,
        returns_12m,
        returns_24m,
        returns_36m,
        returns_5y,
        ten_year_return,
        volatility_12m,
        volatility_24m,
        volatility_36m,
        ten_year_volatility,
        max_drawdown,
        max_drawdown_12m,
        sharpe_12m,
        sharpe_24m,
        sharpe_36m,
        ten_year_sharpe,
        dividend_yield_12m,
        dividends_12m,
        dividends_24m,
        dividends_36m,
        dividends_all_time,
        size_category,
        liquidity_category,
        source_meta,
        snapshot_date
      `)
      .in('symbol', symbols);

    if (error) {
      console.error('Erro ao buscar ações para comparação:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar dados das ações', details: error.message },
        { status: 500 }
      );
    }

    if (!stocksData || stocksData.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma ação encontrada com os símbolos fornecidos' },
        { status: 404 }
      );
    }

    // Processar dados para comparação
    const processedStocks = stocksData.map(stock => ({
      // Informações básicas
      symbol: stock.symbol,
      company_name: stock.company_name,
      business_description: stock.business_description,
      sector: stock.sector,
      industry: stock.industry,
      exchange: stock.exchange,
      
      // Dados corporativos
      headquarters: stock.headquarters,
      ceo_name: stock.ceo_name,
      employees_count: stock.employees_count ? Number(stock.employees_count) : null,
      website: stock.website,
      
      // Dados financeiros
      stock_price: stock.stock_price ? Number(stock.stock_price) : null,
      market_cap: stock.market_cap ? Number(stock.market_cap) : null,
      market_cap_formatted: stock.market_cap ? formatMarketCap(Number(stock.market_cap)) : null,
      shares_outstanding: stock.shares_outstanding ? Number(stock.shares_outstanding) : null,
      avg_volume: stock.avg_volume ? Number(stock.avg_volume) : null,
      
      // Performance
      performance: {
        returns_1d: stock.returns_1d ? Number(stock.returns_1d) : null,
        returns_1w: stock.returns_1w ? Number(stock.returns_1w) : null,
        returns_1m: stock.returns_1m ? Number(stock.returns_1m) : null,
        returns_3m: stock.returns_3m ? Number(stock.returns_3m) : null,
        returns_6m: stock.returns_6m ? Number(stock.returns_6m) : null,
        returns_12m: stock.returns_12m ? Number(stock.returns_12m) : null,
        returns_24m: stock.returns_24m ? Number(stock.returns_24m) : null,
        returns_36m: stock.returns_36m ? Number(stock.returns_36m) : null,
        returns_5y: stock.returns_5y ? Number(stock.returns_5y) : null,
        ten_year_return: stock.ten_year_return ? Number(stock.ten_year_return) : null,
      },
      
      // Risco
      risk_metrics: {
        volatility_12m: stock.volatility_12m ? Number(stock.volatility_12m) : null,
        volatility_24m: stock.volatility_24m ? Number(stock.volatility_24m) : null,
        volatility_36m: stock.volatility_36m ? Number(stock.volatility_36m) : null,
        ten_year_volatility: stock.ten_year_volatility ? Number(stock.ten_year_volatility) : null,
        max_drawdown: stock.max_drawdown ? Number(stock.max_drawdown) : null,
        beta_12m: stock.beta_12m ? Number(stock.beta_12m) : null,
        sharpe_12m: stock.sharpe_12m ? Number(stock.sharpe_12m) : null,
        sharpe_24m: stock.sharpe_24m ? Number(stock.sharpe_24m) : null,
        sharpe_36m: stock.sharpe_36m ? Number(stock.sharpe_36m) : null,
        ten_year_sharpe: stock.ten_year_sharpe ? Number(stock.ten_year_sharpe) : null,
      },
      
      // Dividendos
      dividends: {
        yield_12m: stock.dividend_yield_12m ? Number(stock.dividend_yield_12m) * 100 : null,
        yield_ttm: stock.dividend_yield_ttm ? Number(stock.dividend_yield_ttm) * 100 : null,
        amount_12m: stock.dividends_12m ? Number(stock.dividends_12m) : null,
      },
      
      // Fundamentais
      fundamentals: {
        valuation: {
          pe_ratio: stock.pe_ratio ? Number(stock.pe_ratio) : null,
          peg_ratio: stock.peg_ratio ? Number(stock.peg_ratio) : null,
          pb_ratio: stock.pb_ratio ? Number(stock.pb_ratio) : null,
          ps_ratio: stock.ps_ratio ? Number(stock.ps_ratio) : null,
          ev_ebitda: stock.ev_ebitda ? Number(stock.ev_ebitda) : null,
        },
        profitability: {
          roe: stock.roe ? Number(stock.roe) * 100 : null,
          roa: stock.roa ? Number(stock.roa) * 100 : null,
          roic: stock.roic ? Number(stock.roic) * 100 : null,
          gross_margin: stock.gross_margin ? Number(stock.gross_margin) * 100 : null,
          operating_margin: stock.operating_margin ? Number(stock.operating_margin) * 100 : null,
          net_margin: stock.net_margin ? Number(stock.net_margin) * 100 : null,
        },
        financial_health: {
          debt_to_equity: stock.debt_to_equity ? Number(stock.debt_to_equity) : null,
          current_ratio: stock.current_ratio ? Number(stock.current_ratio) : null,
          quick_ratio: stock.quick_ratio ? Number(stock.quick_ratio) : null,
        },
        growth: {
          revenue_growth_yoy: stock.revenue_growth_yoy ? Number(stock.revenue_growth_yoy) * 100 : null,
          earnings_growth_yoy: stock.earnings_growth_yoy ? Number(stock.earnings_growth_yoy) * 100 : null,
        }
      },
      
      // Categorização
      size_category: stock.size_category,
      liquidity_category: stock.liquidity_category,
      quality_score: stock.quality_score ? Number(stock.quality_score) : null,
      
      // Scores de IA
      ai_scores: {
        quality: stock.ai_quality_score ? Number(stock.ai_quality_score) : null,
        growth: stock.ai_growth_score ? Number(stock.ai_growth_score) : null,
        value: stock.ai_value_score ? Number(stock.ai_value_score) : null,
        momentum: stock.ai_momentum_score ? Number(stock.ai_momentum_score) : null,
        investment_thesis: stock.ai_investment_thesis,
      },
      
      // Metadata
      last_updated: stock.last_updated
    }));

    // Calcular estatísticas comparativas
    const comparison_stats = calculateComparisonStats(processedStocks);

    // Identificar símbolos não encontrados
    const foundSymbols = processedStocks.map(stock => stock.symbol);
    const notFoundSymbols = symbols.filter(symbol => !foundSymbols.includes(symbol));

    const response = {
      stocks: processedStocks,
      comparison_stats,
      summary: {
        total_requested: symbols.length,
        total_found: processedStocks.length,
        not_found: notFoundSymbols,
        sectors_represented: [...new Set(processedStocks.map(s => s.sector).filter(Boolean))],
        exchanges_represented: [...new Set(processedStocks.map(s => s.exchange).filter(Boolean))],
      },
      _source: 'stocks-comparator-api',
      _timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro no Comparator API:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        _source: 'stocks-comparator-error'
      },
      { status: 500 }
    );
  }
}

// Função para calcular estatísticas comparativas
function calculateComparisonStats(stocks: any[]) {
  if (stocks.length === 0) return null;

  const stats = {
    market_cap: {
      min: Math.min(...stocks.map(s => s.market_cap || 0).filter(v => v > 0)),
      max: Math.max(...stocks.map(s => s.market_cap || 0)),
      avg: stocks.reduce((sum, s) => sum + (s.market_cap || 0), 0) / stocks.filter(s => s.market_cap).length,
    },
    performance_12m: {
      min: Math.min(...stocks.map(s => s.performance.returns_12m || 0).filter(v => v !== null)),
      max: Math.max(...stocks.map(s => s.performance.returns_12m || 0).filter(v => v !== null)),
      avg: stocks.reduce((sum, s) => sum + (s.performance.returns_12m || 0), 0) / stocks.filter(s => s.performance.returns_12m !== null).length,
    },
    volatility_12m: {
      min: Math.min(...stocks.map(s => s.risk_metrics.volatility_12m || 0).filter(v => v !== null)),
      max: Math.max(...stocks.map(s => s.risk_metrics.volatility_12m || 0).filter(v => v !== null)),
      avg: stocks.reduce((sum, s) => sum + (s.risk_metrics.volatility_12m || 0), 0) / stocks.filter(s => s.risk_metrics.volatility_12m !== null).length,
    },
    pe_ratio: {
      min: Math.min(...stocks.map(s => s.fundamentals.valuation.pe_ratio || 0).filter(v => v > 0)),
      max: Math.max(...stocks.map(s => s.fundamentals.valuation.pe_ratio || 0).filter(v => v > 0)),
      avg: stocks.reduce((sum, s) => sum + (s.fundamentals.valuation.pe_ratio || 0), 0) / stocks.filter(s => s.fundamentals.valuation.pe_ratio).length,
    },
    dividend_yield: {
      min: Math.min(...stocks.map(s => s.dividends.yield_12m || 0).filter(v => v > 0)),
      max: Math.max(...stocks.map(s => s.dividends.yield_12m || 0).filter(v => v > 0)),
      avg: stocks.reduce((sum, s) => sum + (s.dividends.yield_12m || 0), 0) / stocks.filter(s => s.dividends.yield_12m).length,
    }
  };

  return stats;
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

