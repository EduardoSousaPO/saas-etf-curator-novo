// src/app/api/stocks/details/[symbol]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol.toUpperCase();
    
    console.log(`Buscando detalhes da ação: ${symbol}`);

    // Buscar dados completos da ação
    const { data: stockData, error: stockError } = await supabase
      .from('stocks_unified')
      .select('*')
      .eq('ticker', symbol)
      .single();

    if (stockError) {
      console.error('Erro ao buscar ação:', stockError);
      return NextResponse.json(
        { error: 'Ação não encontrada', details: stockError.message },
        { status: 404 }
      );
    }

    if (!stockData) {
      return NextResponse.json(
        { error: 'Ação não encontrada' },
        { status: 404 }
      );
    }

    // Dados históricos não disponíveis na estrutura atual
    const priceHistory: any[] = [];
    const aiInsights: any[] = [];

    // Processar dados da ação para formato detalhado compatível com o modal Tesla-style
    const detailedStock = {
      // Informações básicas
      ticker: stockData.ticker,
      name: stockData.name,
      business_description: stockData.business_description,
      sector: stockData.sector,
      industry: stockData.industry,
      exchange: stockData.exchange,
      current_price: stockData.current_price ? Number(stockData.current_price) : null,
      market_cap: stockData.market_cap ? Number(stockData.market_cap) : null,
      shares_outstanding: stockData.shares_outstanding ? Number(stockData.shares_outstanding) : null,
      volume_avg_30d: stockData.volume_avg_30d ? Number(stockData.volume_avg_30d) : null,

      // Performance Multi-Período
      returns_12m: stockData.returns_12m ? Number(stockData.returns_12m) : null,
      returns_24m: stockData.returns_24m ? Number(stockData.returns_24m) : null,
      returns_36m: stockData.returns_36m ? Number(stockData.returns_36m) : null,
      returns_5y: stockData.returns_5y ? Number(stockData.returns_5y) : null,
      ten_year_return: stockData.ten_year_return ? Number(stockData.ten_year_return) : null,
      
      // Métricas de Risco
      volatility_12m: stockData.volatility_12m ? Number(stockData.volatility_12m) : null,
      volatility_24m: stockData.volatility_24m ? Number(stockData.volatility_24m) : null,
      volatility_36m: stockData.volatility_36m ? Number(stockData.volatility_36m) : null,
      ten_year_volatility: stockData.ten_year_volatility ? Number(stockData.ten_year_volatility) : null,
      max_drawdown: stockData.max_drawdown ? Number(stockData.max_drawdown) : null,
      beta_coefficient: stockData.beta_coefficient ? Number(stockData.beta_coefficient) : null,
      
      // Sharpe Ratios
      sharpe_12m: stockData.sharpe_12m ? Number(stockData.sharpe_12m) : null,
      sharpe_24m: stockData.sharpe_24m ? Number(stockData.sharpe_24m) : null,
      sharpe_36m: stockData.sharpe_36m ? Number(stockData.sharpe_36m) : null,
      ten_year_sharpe: stockData.ten_year_sharpe ? Number(stockData.ten_year_sharpe) : null,

      // Dividendos
      dividend_yield_12m: stockData.dividend_yield_12m ? Number(stockData.dividend_yield_12m) : null,
      dividends_12m: stockData.dividends_12m ? Number(stockData.dividends_12m) : null,
      dividends_24m: stockData.dividends_24m ? Number(stockData.dividends_24m) : null,
      dividends_36m: stockData.dividends_36m ? Number(stockData.dividends_36m) : null,
      dividends_all_time: stockData.dividends_all_time ? Number(stockData.dividends_all_time) : null,

      // Fundamentais - Múltiplos
      pe_ratio: stockData.pe_ratio ? Number(stockData.pe_ratio) : null,
      pb_ratio: stockData.pb_ratio ? Number(stockData.pb_ratio) : null,
      ps_ratio: stockData.ps_ratio ? Number(stockData.ps_ratio) : null,
      peg_ratio: stockData.peg_ratio ? Number(stockData.peg_ratio) : null,
      
      // Fundamentais - Rentabilidade  
      roe: stockData.roe ? Number(stockData.roe) : null,
      roa: stockData.roa ? Number(stockData.roa) : null,
      roi: stockData.roi ? Number(stockData.roi) : null,
      profit_margin: stockData.profit_margin ? Number(stockData.profit_margin) : null,
      
      // Fundamentais - Solidez Financeira
      debt_to_equity: stockData.debt_to_equity ? Number(stockData.debt_to_equity) : null,
      current_ratio: stockData.current_ratio ? Number(stockData.current_ratio) : null,
      revenue: stockData.revenue ? Number(stockData.revenue) : null,
      net_income: stockData.net_income ? Number(stockData.net_income) : null,
      total_assets: stockData.total_assets ? Number(stockData.total_assets) : null,
      total_debt: stockData.total_debt ? Number(stockData.total_debt) : null,
      free_cash_flow: stockData.free_cash_flow ? Number(stockData.free_cash_flow) : null,
      book_value: stockData.book_value ? Number(stockData.book_value) : null,
      enterprise_value: stockData.enterprise_value ? Number(stockData.enterprise_value) : null,
      ebitda: stockData.ebitda ? Number(stockData.ebitda) : null,

      // Análise de IA
      ai_investment_thesis: stockData.ai_investment_thesis,
      ai_risk_analysis: stockData.ai_risk_analysis,
      ai_market_context: stockData.ai_market_context,
      ai_use_cases: stockData.ai_use_cases,
      ai_analysis_date: stockData.ai_analysis_date,

      // Categorização
      size_category: stockData.size_category,
      liquidity_category: stockData.liquidity_category,
      
      // Metadados
      source_meta: stockData.source_meta,
      snapshot_date: stockData.snapshot_date
    };

    return NextResponse.json({
      success: true,
      stock: detailedStock,
      metadata: {
        data_quality: calculateDataQuality(stockData),
        completeness_score: calculateCompletenessScore(stockData),
        _source: 'stocks-details-api',
        _timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`Erro ao buscar detalhes da ação:`, error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        _source: 'stocks-details-error'
      },
      { status: 500 }
    );
  }
}

// Funções auxiliares
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

function calculateDataQuality(stockData: any): string {
  let score = 0;
  let total = 0;

  // Campos essenciais
  const essentialFields = [
    'company_name', 'sector', 'stock_price', 'market_cap', 
    'returns_12m', 'volatility_12m', 'pe_ratio'
  ];

  essentialFields.forEach(field => {
    total += 3; // Peso 3 para campos essenciais
    if (stockData[field] !== null && stockData[field] !== undefined) {
      score += 3;
    }
  });

  // Campos importantes
  const importantFields = [
    'business_description', 'industry', 'employees_count', 'dividend_yield_12m',
    'roe', 'debt_to_equity', 'ai_quality_score'
  ];

  importantFields.forEach(field => {
    total += 2; // Peso 2 para campos importantes
    if (stockData[field] !== null && stockData[field] !== undefined) {
      score += 2;
    }
  });

  const percentage = (score / total) * 100;
  
  if (percentage >= 90) return 'Excelente';
  if (percentage >= 75) return 'Boa';
  if (percentage >= 60) return 'Adequada';
  if (percentage >= 40) return 'Limitada';
  return 'Insuficiente';
}

function calculateCompletenessScore(stockData: any): number {
  const allFields = Object.keys(stockData);
  const filledFields = allFields.filter(field => 
    stockData[field] !== null && 
    stockData[field] !== undefined && 
    stockData[field] !== ''
  );

  return Math.round((filledFields.length / allFields.length) * 100);
}
