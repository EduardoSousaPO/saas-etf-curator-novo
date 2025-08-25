// src/app/api/portfolio/unified-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UnifiedAsset {
  symbol: string;
  name: string;
  type: 'ETF' | 'STOCK';
  returns_12m: number | null;
  volatility_12m: number | null;
  sharpe_ratio: number | null;
  dividend_yield: number | null;
  expense_ratio?: number | null; // Apenas ETFs
  market_cap?: number | null; // Principalmente Stocks
  sector?: string | null;
  asset_class?: string | null;
  current_price?: number | null;
  total_assets?: number | null; // ETFs
  quality_score?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const assetType = searchParams.get('asset_type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log(`🔍 Busca unificada: "${searchTerm}", tipo: ${assetType}, limite: ${limit}`);

    const results: UnifiedAsset[] = [];

    // 1. Buscar Stocks (usando lógica que funciona)
    if (assetType === 'all' || assetType === 'stock') {
      const { data: stocks, error: stockError } = await supabase
        .from('stocks_unified')
        .select('ticker, name, market_cap, returns_12m, volatility_12m, sharpe_ratio_12m, dividend_yield, sector, current_price')
        .or(`ticker.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .limit(Math.floor(limit / (assetType === 'all' ? 2 : 1)));

      console.log('📊 Stocks encontrados:', stocks?.length || 0);

      if (stocks && stocks.length > 0) {
        const stockResults: UnifiedAsset[] = stocks.map(stock => ({
          symbol: stock.ticker,
          name: stock.name,
          type: 'STOCK' as const,
          returns_12m: stock.returns_12m,
          volatility_12m: stock.volatility_12m,
          sharpe_ratio: stock.sharpe_ratio_12m,
          dividend_yield: stock.dividend_yield,
          market_cap: stock.market_cap,
          sector: stock.sector,
          current_price: stock.current_price,
          quality_score: calculateStockQualityScore(stock)
        }));
        results.push(...stockResults);
      }
    }

    // 2. Buscar ETFs (usando lógica que funciona)
    if (assetType === 'all' || assetType === 'etf') {
      const { data: etfs, error: etfError } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol, name, returns_12m, volatility_12m, sharpe_12m, dividend_yield, expense_ratio, total_assets, assetclass, sector')
        .or(`symbol.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .order('total_assets', { ascending: false })
        .limit(Math.floor(limit / (assetType === 'all' ? 2 : 1)));

      console.log('📊 ETFs encontrados:', etfs?.length || 0);

      if (etfs && etfs.length > 0) {
        const etfResults: UnifiedAsset[] = etfs.map(etf => ({
          symbol: etf.symbol,
          name: etf.name,
          type: 'ETF' as const,
          returns_12m: etf.returns_12m,
          volatility_12m: etf.volatility_12m,
          sharpe_ratio: etf.sharpe_12m,
          dividend_yield: etf.dividend_yield,
          expense_ratio: etf.expense_ratio,
          total_assets: etf.total_assets,
          asset_class: etf.assetclass,
          sector: etf.sector,
          quality_score: calculateETFQualityScore(etf)
        }));
        results.push(...etfResults);
      }
    }

    // 3. Ordenar por qualidade
    results.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));

    console.log(`✅ Busca unificada concluída: ${results.length} ativos encontrados`);

    return NextResponse.json({
      success: true,
      data: results.slice(0, limit),
      metadata: {
        total_found: results.length,
        etfs_count: results.filter(r => r.type === 'ETF').length,
        stocks_count: results.filter(r => r.type === 'STOCK').length,
        search_term: searchTerm,
        asset_type: assetType
      }
    });

  } catch (error) {
    console.error('❌ Erro na busca unificada:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular score de qualidade de ETFs
function calculateETFQualityScore(etf: any): number {
  let score = 50; // Base score

  // Expense ratio (menor é melhor)
  if (etf.expense_ratio !== null) {
    if (etf.expense_ratio <= 0.1) score += 20;
    else if (etf.expense_ratio <= 0.5) score += 10;
    else if (etf.expense_ratio >= 1.0) score -= 10;
  }

  // Total assets (maior é melhor)
  if (etf.total_assets) {
    if (etf.total_assets >= 10000000000) score += 15; // $10B+
    else if (etf.total_assets >= 1000000000) score += 10; // $1B+
    else if (etf.total_assets < 100000000) score -= 15; // <$100M
  }

  // Sharpe ratio (maior é melhor)
  if (etf.sharpe_12m !== null && etf.sharpe_12m > 0) {
    score += Math.min(etf.sharpe_12m * 10, 15);
  }

  return Math.max(0, Math.min(100, score));
}

// Função auxiliar para calcular score de qualidade de Stocks
function calculateStockQualityScore(stock: any): number {
  let score = 50; // Base score

  // Market cap (maior é melhor para estabilidade)
  if (stock.market_cap) {
    if (stock.market_cap >= 100000000000) score += 15; // $100B+
    else if (stock.market_cap >= 10000000000) score += 10; // $10B+
    else if (stock.market_cap < 1000000000) score -= 10; // <$1B
  }

  // Sharpe ratio (maior é melhor)
  if (stock.sharpe_ratio_12m !== null && stock.sharpe_ratio_12m > 0) {
    score += Math.min(stock.sharpe_ratio_12m * 10, 15);
  }

  // Dividend yield (positivo é bom, mas não muito alto)
  if (stock.dividend_yield !== null && stock.dividend_yield > 0) {
    if (stock.dividend_yield <= 5) score += 10;
    else if (stock.dividend_yield > 10) score -= 5; // Muito alto pode indicar problema
  }

  return Math.max(0, Math.min(100, score));
}
