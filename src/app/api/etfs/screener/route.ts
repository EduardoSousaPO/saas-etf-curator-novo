// src/app/api/etfs/screener/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    console.log('Screener API chamada com parametros:', searchParams.toString());
    
    // Parâmetros básicos
    const searchTerm = searchParams.get('search_term') || '';
    const assetclass = searchParams.get('assetclass') || '';
    const onlyComplete = searchParams.get('only_complete') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    // Parâmetros de ordenação
    const sortBy = searchParams.get('sort_by') || 'symbol';
    const sortOrder = (searchParams.get('sort_order') || 'ASC').toUpperCase();
    
    // Filtros financeiros básicos
    const totalAssetsMin = parseFloat(searchParams.get('total_assets_min') || '0') || null;
    const totalAssetsMax = parseFloat(searchParams.get('total_assets_max') || '0') || null;
    const expenseRatioMin = parseFloat(searchParams.get('expense_ratio_min') || '0') || null;
    const expenseRatioMax = parseFloat(searchParams.get('expense_ratio_max') || '0') || null;
    
    // Filtros de performance
    const returns12mMin = parseFloat(searchParams.get('returns_12m_min') || '0') || null;
    const returns12mMax = parseFloat(searchParams.get('returns_12m_max') || '0') || null;

    // Construir query base
    let query = supabase
      .from('etfs_ativos_reais')
      .select(`
        symbol,
        name,
        description,
        assetclass,
        domicile,
        etfcompany,
        expenseratio,
        totalasset,
        avgvolume,
        inceptiondate,
        nav,
        navcurrency,
        returns_12m,
        returns_24m,
        returns_36m,
        returns_5y,
        ten_year_return,
        volatility_12m,
        volatility_24m,
        volatility_36m,
        ten_year_volatility,
        sharpe_12m,
        sharpe_24m,
        sharpe_36m,
        ten_year_sharpe,
        max_drawdown,
        dividends_12m,
        dividends_24m,
        dividends_36m,
        dividends_all_time,
        size_category,
        liquidity_category,
        etf_type,
        liquidity_rating,
        size_rating
      `, { count: 'exact' });

    // Aplicar filtros de busca
    if (searchTerm) {
      query = query.or(`symbol.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
    }
    
    if (assetclass) {
      query = query.ilike('assetclass', `%${assetclass}%`);
    }
    
    if (onlyComplete) {
      query = query
        .not('name', 'is', null)
        .not('assetclass', 'is', null)
        .not('inceptiondate', 'is', null);
    }
    
    // Aplicar filtros financeiros
    if (totalAssetsMin) {
      query = query.gte('totalasset', totalAssetsMin * 1000000);
    }
    if (totalAssetsMax) {
      query = query.lte('totalasset', totalAssetsMax * 1000000);
    }
    if (expenseRatioMin) {
      query = query.gte('expenseratio', expenseRatioMin / 100);
    }
    if (expenseRatioMax) {
      query = query.lte('expenseratio', expenseRatioMax / 100);
    }
    
    // Aplicar filtros de performance (valores já estão em formato percentual no banco)
    if (returns12mMin) {
      query = query.gte('returns_12m', returns12mMin);
    }
    if (returns12mMax) {
      query = query.lte('returns_12m', returns12mMax);
    }
    
    // Aplicar ordenação
    const orderColumn = sortBy === 'expense_ratio' ? 'expenseratio' : 
                       sortBy === 'totalasset' ? 'totalasset' :
                       sortBy === 'returns_12m' ? 'returns_12m' :
                       sortBy === 'volatility_12m' ? 'volatility_12m' :
                       sortBy === 'sharpe_12m' ? 'sharpe_12m' :
                       'symbol';
                       
    query = query.order(orderColumn, { ascending: sortOrder === 'ASC', nullsFirst: false });
    
    // Aplicar paginação
    query = query.range(offset, offset + limit - 1);

    const { data: etfs, error, count } = await query;

    if (error) {
      console.error('Erro no Supabase:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar ETFs', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Encontrados ${etfs?.length || 0} ETFs de ${count || 0} total`);

    // Processar dados para formato correto
    const processedETFs = (etfs || []).map((etf: any) => ({
      id: etf.symbol,
      symbol: etf.symbol,
      name: etf.name,
      description: etf.description,
      assetclass: etf.assetclass,
      etfcompany: etf.etfcompany,
      etf_type: etf.etf_type,
      domicile: etf.domicile,
      navcurrency: etf.navcurrency,
      
      // Dados financeiros
      expense_ratio: etf.expenseratio ? Number(etf.expenseratio) : null,
      totalasset: etf.totalasset ? Number(etf.totalasset) : null,
      nav: etf.nav ? Number(etf.nav) : null,
      volume: etf.avgvolume ? Number(etf.avgvolume) : null,
      avgvolume: etf.avgvolume ? Number(etf.avgvolume) : null,
      inception_date: etf.inceptiondate,
      inceptiondate: etf.inceptiondate,
      
      // Performance - converter de decimal para percentual
      returns_12m: etf.returns_12m ? Number(etf.returns_12m) : null,
      returns_24m: etf.returns_24m ? Number(etf.returns_24m) : null,
      returns_36m: etf.returns_36m ? Number(etf.returns_36m) : null,
      returns_5y: etf.returns_5y ? Number(etf.returns_5y) : null,
      ten_year_return: etf.ten_year_return ? Number(etf.ten_year_return) : null,
      
      // Volatilidade
      volatility_12m: etf.volatility_12m ? Number(etf.volatility_12m) : null,
      volatility_24m: etf.volatility_24m ? Number(etf.volatility_24m) : null,
      volatility_36m: etf.volatility_36m ? Number(etf.volatility_36m) : null,
      ten_year_volatility: etf.ten_year_volatility ? Number(etf.ten_year_volatility) : null,
      
      // Sharpe Ratio
      sharpe_12m: etf.sharpe_12m ? Number(etf.sharpe_12m) : null,
      sharpe_24m: etf.sharpe_24m ? Number(etf.sharpe_24m) : null,
      sharpe_36m: etf.sharpe_36m ? Number(etf.sharpe_36m) : null,
      ten_year_sharpe: etf.ten_year_sharpe ? Number(etf.ten_year_sharpe) : null,
      
      // Risco
      max_drawdown: etf.max_drawdown ? Number(etf.max_drawdown) : null,
      
      // Dividendos
      dividends_12m: etf.dividends_12m ? Number(etf.dividends_12m) : null,
      dividends_24m: etf.dividends_24m ? Number(etf.dividends_24m) : null,
      dividends_36m: etf.dividends_36m ? Number(etf.dividends_36m) : null,
      dividends_all_time: etf.dividends_all_time ? Number(etf.dividends_all_time) : null,
      
      // Categorização
      size_category: etf.size_category,
      liquidity_category: etf.liquidity_category,
      liquidity_rating: etf.liquidity_rating,
      size_rating: etf.size_rating
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      etfs: processedETFs,
      totalCount,
      page,
      totalPages,
      itemsPerPage: limit,
      hasMore: page < totalPages,
      sort: {
        sortBy,
        sortOrder
      },
      _source: 'screener-supabase-api',
      _message: `Retornando ${processedETFs.length} ETFs de ${totalCount} total`,
      _timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro no Screener API:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        _source: 'screener-error'
      },
      { status: 500 }
    );
  }
}
