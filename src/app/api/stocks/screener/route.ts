// src/app/api/stocks/screener/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCache, cacheManager } from '@/lib/cache/redis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Stocks Screener API iniciada:', new Date().toISOString());
    
    const { searchParams } = new URL(request.url);
    console.log('📋 Parâmetros recebidos:', searchParams.toString());
    
    // Validação de parâmetros básicos
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    
    // Parâmetros de busca com validação
    const searchTerm = searchParams.get('search_term')?.trim() || '';
    const sector = searchParams.get('sector')?.trim() || '';
    const industry = searchParams.get('industry')?.trim() || '';
    const exchange = searchParams.get('exchange')?.trim() || '';
    const onlyComplete = searchParams.get('only_complete') === 'true';
    
    // Validação de ordenação com lista permitida
    const allowedSortFields = [
      'ticker', 'name', 'current_price', 'market_cap', 
      'returns_12m', 'volatility_12m', 'pe_ratio', 'dividend_yield_12m',
      'returns_24m', 'sharpe_12m', 'roe', 'roa', 'volume_avg_30d'
    ];
    const sortBy = allowedSortFields.includes(searchParams.get('sortBy') || '') 
      ? searchParams.get('sortBy') 
      : 'returns_12m';
    const sortOrder = ['ASC', 'DESC'].includes((searchParams.get('sortOrder') || 'DESC').toUpperCase())
      ? (searchParams.get('sortOrder') || 'DESC').toUpperCase()
      : 'DESC';
    
    // Criar objeto com todos os parâmetros para cache
    const cacheParams = {
      searchTerm,
      sector,
      industry,
      exchange,
      onlyComplete,
      page,
      limit,
      sortBy,
      sortOrder,
      // Incluir todos os filtros para cache
      priceMin: searchParams.get('price_min'),
      priceMax: searchParams.get('price_max'),
      marketCapMin: searchParams.get('market_cap_min'),
      marketCapMax: searchParams.get('market_cap_max'),
      volumeMin: searchParams.get('volume_min'),
      volumeMax: searchParams.get('volume_max'),
      returns12mMin: searchParams.get('returns_12m_min'),
      returns12mMax: searchParams.get('returns_12m_max'),
      returns24mMin: searchParams.get('returns_24m_min'),
      returns24mMax: searchParams.get('returns_24m_max'),
      volatility12mMin: searchParams.get('volatility_12m_min'),
      volatility12mMax: searchParams.get('volatility_12m_max'),
      peRatioMin: searchParams.get('pe_ratio_min'),
      peRatioMax: searchParams.get('pe_ratio_max'),
      pbRatioMin: searchParams.get('pb_ratio_min'),
      pbRatioMax: searchParams.get('pb_ratio_max'),
      roeMin: searchParams.get('roe_min'),
      roeMax: searchParams.get('roe_max'),
      roaMin: searchParams.get('roa_min'),
      roaMax: searchParams.get('roa_max'),
      dividendYieldMin: searchParams.get('dividend_yield_min'),
      dividendYieldMax: searchParams.get('dividend_yield_max')
    };
    
    // Usar cache para a consulta
    const response = await withCache(
      'stocks-screener',
      cacheParams,
      async () => {
        // Filtros financeiros
        const priceMin = parseFloat(searchParams.get('price_min') || '0') || null;
        const priceMax = parseFloat(searchParams.get('price_max') || '0') || null;
        const marketCapMin = parseFloat(searchParams.get('market_cap_min') || '0') || null;
        const marketCapMax = parseFloat(searchParams.get('market_cap_max') || '0') || null;
        const volumeMin = parseFloat(searchParams.get('volume_min') || '0') || null;
        const volumeMax = parseFloat(searchParams.get('volume_max') || '0') || null;
        
        // Filtros de performance
        const returns12mMin = parseFloat(searchParams.get('returns_12m_min') || '0') || null;
        const returns12mMax = parseFloat(searchParams.get('returns_12m_max') || '0') || null;
        const returns24mMin = parseFloat(searchParams.get('returns_24m_min') || '0') || null;
        const returns24mMax = parseFloat(searchParams.get('returns_24m_max') || '0') || null;
        const volatility12mMin = parseFloat(searchParams.get('volatility_12m_min') || '0') || null;
        const volatility12mMax = parseFloat(searchParams.get('volatility_12m_max') || '0') || null;
        
        // Filtros fundamentais
        const peRatioMin = parseFloat(searchParams.get('pe_ratio_min') || '0') || null;
        const peRatioMax = parseFloat(searchParams.get('pe_ratio_max') || '0') || null;
        const pbRatioMin = parseFloat(searchParams.get('pb_ratio_min') || '0') || null;
        const pbRatioMax = parseFloat(searchParams.get('pb_ratio_max') || '0') || null;
        const roeMin = parseFloat(searchParams.get('roe_min') || '0') || null;
        const roeMax = parseFloat(searchParams.get('roe_max') || '0') || null;
        const roaMin = parseFloat(searchParams.get('roa_min') || '0') || null;
        const roaMax = parseFloat(searchParams.get('roa_max') || '0') || null;
        
        // Filtros de dividendos
        const dividendYieldMin = parseFloat(searchParams.get('dividend_yield_min') || '0') || null;
        const dividendYieldMax = parseFloat(searchParams.get('dividend_yield_max') || '0') || null;

        // Construir query base
        let query = supabase
          .from('stocks_unified')
          .select(`
            ticker,
            name,
            business_description,
            sector,
            industry,
            exchange,
            current_price,
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
            sharpe_12m,
            sharpe_24m,
            sharpe_36m,
            ten_year_sharpe,
            max_drawdown,
            dividend_yield_12m,
            dividends_12m,
            dividends_24m,
            dividends_36m,
            dividends_all_time,
            pe_ratio,
            pb_ratio,
            ps_ratio,
            roe,
            roa,
            size_category,
            liquidity_category,
            source_meta,
            snapshot_date
          `, { count: 'exact' });

        // Aplicar filtros de busca
        if (searchTerm) {
          query = query.or(`ticker.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,business_description.ilike.%${searchTerm}%`);
        }
        
        if (sector) {
          query = query.ilike('sector', `%${sector}%`);
        }
        
        if (industry) {
          query = query.ilike('industry', `%${industry}%`);
        }
        
        if (exchange) {
          query = query.ilike('exchange', `%${exchange}%`);
        }
        
        // Filtro de dados completos aprimorado
        if (onlyComplete) {
          query = query
            .not('current_price', 'is', null)
            .not('market_cap', 'is', null)
            .not('returns_12m', 'is', null)
            .not('pe_ratio', 'is', null)
            .not('name', 'is', null)
            .not('sector', 'is', null);
        }
    
        // Aplicar filtros financeiros
        if (priceMin && priceMin > 0) {
          query = query.gte('current_price', priceMin);
        }
        if (priceMax && priceMax > 0) {
          query = query.lte('current_price', priceMax);
        }
        if (marketCapMin && marketCapMin > 0) {
          query = query.gte('market_cap', marketCapMin);
        }
        if (marketCapMax && marketCapMax > 0) {
          query = query.lte('market_cap', marketCapMax);
        }
        if (volumeMin && volumeMin > 0) {
          query = query.gte('volume_avg_30d', volumeMin);
        }
        if (volumeMax && volumeMax > 0) {
          query = query.lte('volume_avg_30d', volumeMax);
        }
    
        // Aplicar filtros de performance (convertendo % para decimal)
        if (returns12mMin !== null && returns12mMin > 0) {
          query = query.gte('returns_12m', returns12mMin / 100);
        }
        if (returns12mMax !== null && returns12mMax > 0) {
          query = query.lte('returns_12m', returns12mMax / 100);
        }
        if (returns24mMin !== null && returns24mMin > 0) {
          query = query.gte('returns_24m', returns24mMin / 100);
        }
        if (returns24mMax !== null && returns24mMax > 0) {
          query = query.lte('returns_24m', returns24mMax / 100);
        }
        if (volatility12mMin !== null && volatility12mMin > 0) {
          query = query.gte('volatility_12m', volatility12mMin / 100);
        }
        if (volatility12mMax !== null && volatility12mMax > 0) {
          query = query.lte('volatility_12m', volatility12mMax / 100);
        }
        
        // Aplicar filtros fundamentais
        if (peRatioMin && peRatioMin > 0) {
          query = query.gte('pe_ratio', peRatioMin);
        }
        if (peRatioMax && peRatioMax > 0) {
          query = query.lte('pe_ratio', peRatioMax);
        }
        if (pbRatioMin && pbRatioMin > 0) {
          query = query.gte('pb_ratio', pbRatioMin);
        }
        if (pbRatioMax && pbRatioMax > 0) {
          query = query.lte('pb_ratio', pbRatioMax);
        }
        if (roeMin !== null) {
          query = query.gte('roe', roeMin);
        }
        if (roeMax !== null) {
          query = query.lte('roe', roeMax);
        }
        if (roaMin !== null) {
          query = query.gte('roa', roaMin);
        }
        if (roaMax !== null) {
          query = query.lte('roa', roaMax);
        }
        
        // Aplicar filtros de dividendos
        if (dividendYieldMin && dividendYieldMin > 0) {
          query = query.gte('dividend_yield_12m', dividendYieldMin / 100); // Converter % para decimal
        }
        if (dividendYieldMax && dividendYieldMax > 0) {
          query = query.lte('dividend_yield_12m', dividendYieldMax / 100); // Converter % para decimal
        }

        // Aplicar ordenação
        const validSortColumns = [
          'ticker', 'current_price', 'market_cap', 'returns_12m', 'returns_24m',
          'volatility_12m', 'pe_ratio', 'pb_ratio', 'roe', 'roa', 'dividend_yield_12m',
          'volume_avg_30d', 'sharpe_12m'
        ];
        
        const finalSortBy = validSortColumns.includes(sortBy || '') ? (sortBy || 'returns_12m') : 'returns_12m';
        const finalSortOrder = sortOrder === 'ASC' ? true : false; // Supabase usa boolean
        
        // CORREÇÃO CRÍTICA: Ordenar colocando valores NULL no final
        // Para campos de performance, queremos valores reais primeiro
        if (['returns_12m', 'returns_24m', 'volatility_12m', 'dividend_yield_12m', 'sharpe_12m'].includes(finalSortBy)) {
          // Primeiro ordenar por NULL/NOT NULL, depois pelo valor
          query = query.order(finalSortBy, { ascending: finalSortOrder, nullsFirst: false });
        } else {
          query = query.order(finalSortBy, { ascending: finalSortOrder });
        }

        // Aplicar paginação
        query = query.range(offset, offset + limit - 1);

        // Executar query
        const { data, error, count } = await query;

        if (error) {
          console.error('❌ Erro na query do Supabase:', error);
          throw new Error(`Erro na consulta: ${error.message}`);
        }

        // Processar dados com formatação adequada
        const processedStocks = data?.map((stock: any) => {
          console.log('🔍 Processando stock:', {
            ticker: stock.ticker,
            returns_12m_raw: stock.returns_12m,
            pe_ratio_raw: stock.pe_ratio,
            dividend_yield_raw: stock.dividend_yield_12m
          });

          return {
            // DADOS BÁSICOS (já funcionando)
            id: stock.ticker,
            symbol: stock.ticker,
            company_name: stock.name || 'N/A',
            sector: stock.sector || 'N/A',
            industry: stock.industry || 'N/A',
            exchange: stock.exchange || 'N/A',
            stock_price: stock.current_price ? parseFloat(stock.current_price) : null,
            market_cap: stock.market_cap ? parseFloat(stock.market_cap) : null,
            market_cap_formatted: formatMarketCap(stock.market_cap),
            
            // CORREÇÃO CRÍTICA - CAMPOS DE PERFORMANCE:
            returns_12m: stock.returns_12m !== null && stock.returns_12m !== undefined 
              ? formatPercentage(stock.returns_12m) 
              : null,
            
            returns_24m: stock.returns_24m !== null && stock.returns_24m !== undefined 
              ? formatPercentage(stock.returns_24m) 
              : null,
            
            volatility_12m: stock.volatility_12m !== null && stock.volatility_12m !== undefined 
              ? formatPercentage(stock.volatility_12m) 
              : null,
            
            sharpe_12m: stock.sharpe_12m !== null && stock.sharpe_12m !== undefined 
              ? parseFloat(stock.sharpe_12m).toFixed(2) 
              : null,
            
            pe_ratio: stock.pe_ratio !== null && stock.pe_ratio !== undefined 
              ? parseFloat(stock.pe_ratio).toFixed(1) 
              : null,
            
            pb_ratio: stock.pb_ratio !== null && stock.pb_ratio !== undefined 
              ? parseFloat(stock.pb_ratio).toFixed(1) 
              : null,
            
            roe: stock.roe !== null && stock.roe !== undefined 
              ? formatPercentage(stock.roe) 
              : null,
            
            roa: stock.roa !== null && stock.roa !== undefined 
              ? formatPercentage(stock.roa) 
              : null,
            
            dividend_yield_12m: stock.dividend_yield_12m !== null && stock.dividend_yield_12m !== undefined 
              ? formatPercentage(stock.dividend_yield_12m) 
              : null,
            
            volume_avg_30d: stock.volume_avg_30d ? parseFloat(stock.volume_avg_30d) : null,
            
            // METADATA
            quality_score: calculateQualityScore(stock),
            last_updated: stock.snapshot_date || new Date().toISOString(),
            data_completeness: calculateDataCompleteness(stock)
          };
        }) || [];

        return {
          stocks: processedStocks,
          totalCount: count || 0,
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
          hasNextPage: page < Math.ceil((count || 0) / limit),
          hasPreviousPage: page > 1,
          filters: {
            searchTerm,
            sector,
            industry,
            exchange,
            onlyComplete,
            sortBy: finalSortBy,
            sortOrder: sortOrder.toLowerCase()
          },
          metadata: {
            generated_at: new Date().toISOString(),
            data_source: 'stocks_unified',
            version: '2.0',
            cached: false
          }
        };
      },
      {
        ttl: 300, // 5 minutos de cache
        prefix: 'stocks'
      }
    );

    // Marcar como cached se veio do cache
    if (response.metadata) {
      response.metadata.cached = true;
    }

    console.log(`✅ Screener executado com sucesso: ${response.stocks?.length || 0} ações de ${response.totalCount} total`);

    // Adicionar flag de sucesso
    return NextResponse.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error('❌ Erro crítico no Screener de Stocks:', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      url: request.url
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Falha ao processar consulta de ações',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Erro desconhecido') : undefined,
        timestamp: new Date().toISOString(),
        _source: 'stocks-screener-error'
      },
      { status: 500 }
    );
  }
}

// FUNÇÃO DE FORMATAÇÃO DE PERCENTUAL
function formatPercentage(value: any): string | null {
  if (value === null || value === undefined || isNaN(value)) return null;
  
  const numValue = parseFloat(value);
  
  // Se valor > 1, assumir que já está em formato percentual
  if (Math.abs(numValue) > 1) {
    return `${numValue.toFixed(1)}%`;
  }
  // Se valor < 1, assumir formato decimal e converter
  else {
    return `${(numValue * 100).toFixed(1)}%`;
  }
}

// Função auxiliar para formatar market cap
function formatMarketCap(marketCap: any): string {
  const value = parseFloat(marketCap);
  if (!value || value === 0) return 'N/A';
  
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else {
    return `$${value.toLocaleString()}`;
  }
}

// Função auxiliar para calcular quality score
function calculateQualityScore(stock: any): number {
  let score = 50; // Base score
  
  // Performance score (30 pontos)
  const returns12m = parseFloat(stock.returns_12m) || 0;
  if (returns12m > 20) score += 15;
  else if (returns12m > 10) score += 10;
  else if (returns12m > 0) score += 5;
  else if (returns12m < -20) score -= 15;
  else if (returns12m < -10) score -= 10;
  
  const sharpe12m = parseFloat(stock.sharpe_12m) || 0;
  if (sharpe12m > 1.5) score += 15;
  else if (sharpe12m > 1.0) score += 10;
  else if (sharpe12m > 0.5) score += 5;
  else if (sharpe12m < 0) score -= 10;
  
  // Fundamentals score (25 pontos)
  const peRatio = parseFloat(stock.pe_ratio) || 0;
  if (peRatio > 0 && peRatio <= 15) score += 10;
  else if (peRatio > 15 && peRatio <= 25) score += 5;
  else if (peRatio > 50) score -= 10;
  
  const roe = parseFloat(stock.roe) || 0;
  if (roe > 20) score += 10;
  else if (roe > 15) score += 5;
  else if (roe < 5 && roe > 0) score -= 5;
  
  const roa = parseFloat(stock.roa) || 0;
  if (roa > 10) score += 5;
  else if (roa > 5) score += 3;
  
  // Market cap stability (15 pontos)
  const marketCap = parseFloat(stock.market_cap) || 0;
  if (marketCap >= 100e9) score += 15; // Large cap
  else if (marketCap >= 10e9) score += 10; // Mid cap
  else if (marketCap >= 2e9) score += 5; // Small cap
  else score -= 5; // Micro cap
  
  // Dividend score (10 pontos)
  const dividendYield = parseFloat(stock.dividend_yield_12m) || 0;
  if (dividendYield > 0.02 && dividendYield <= 0.06) score += 10;
  else if (dividendYield > 0.06 && dividendYield <= 0.10) score += 5;
  else if (dividendYield > 0.10) score -= 5; // Too high might be unsustainable
  
  // Risk score (10 pontos)
  const volatility = parseFloat(stock.volatility_12m) || 0;
  if (volatility > 0 && volatility <= 15) score += 10;
  else if (volatility <= 25) score += 5;
  else if (volatility > 50) score -= 10;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// FUNÇÃO DE COMPLETUDE DOS DADOS
function calculateDataCompleteness(stock: any): number {
  const fields = [
    'current_price', 'market_cap', 'returns_12m', 'pe_ratio', 
    'dividend_yield_12m', 'volatility_12m', 'pb_ratio', 'roe', 'roa'
  ];
  
  const completedFields = fields.filter(field => 
    stock[field] !== null && stock[field] !== undefined && stock[field] !== ''
  ).length;
  
  return Math.round((completedFields / fields.length) * 100);
}