// src/app/api/portfolio/unified-search-simple/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const assetType = searchParams.get('asset_type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('🔍 Busca simples:', { searchTerm, assetType, limit });

    const results: any[] = [];

    // Buscar Stocks
    if (assetType === 'all' || assetType === 'stock') {
      const { data: stocks, error: stockError } = await supabase
        .from('stocks_unified')
        .select('ticker, name, market_cap, returns_12m, volatility_12m, dividend_yield, sector')
        .or(`ticker.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .limit(10);

      console.log('📊 Stocks encontrados:', stocks?.length || 0, stockError);

      if (stocks) {
        const stockResults = stocks.map(stock => ({
          symbol: stock.ticker,
          name: stock.name,
          type: 'STOCK',
          market_cap: stock.market_cap,
          returns_12m: stock.returns_12m,
          volatility_12m: stock.volatility_12m,
          dividend_yield: stock.dividend_yield,
          sector: stock.sector,
          quality_score: 75
        }));
        results.push(...stockResults);
      }
    }

    // Buscar ETFs
    if (assetType === 'all' || assetType === 'etf') {
      const { data: etfs, error: etfError } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol, name, total_assets, returns_12m, expense_ratio, sector')
        .or(`symbol.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .limit(10);

      console.log('📊 ETFs encontrados:', etfs?.length || 0, etfError);

      if (etfs) {
        const etfResults = etfs.map(etf => ({
          symbol: etf.symbol,
          name: etf.name,
          type: 'ETF',
          total_assets: etf.total_assets,
          returns_12m: etf.returns_12m,
          expense_ratio: etf.expense_ratio,
          sector: etf.sector,
          quality_score: 80
        }));
        results.push(...etfResults);
      }
    }

    console.log('✅ Total encontrado:', results.length);

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
    console.error('❌ Erro na busca:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}




