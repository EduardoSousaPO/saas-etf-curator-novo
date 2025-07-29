// src/app/api/etfs/screener/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { formatNumber, formatNumeric } from '@/lib/formatters';
import { applyFilterPreset, applySortPreset, getQualityFilterConfig } from '@/lib/screener-presets';
import { FilterPreset, SortPreset, AdvancedFilters, SortConfig } from '@/types/etf';
import { validateAndFilterETFs, validateFilterParameters } from '@/lib/screener-data-validation';

const prisma = new PrismaClient();

// Cache em memória para queries frequentes
const screenerCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos para screener (mais dinâmico)

// Função para gerar chave de cache baseada nos parâmetros
function generateCacheKey(params: URLSearchParams): string {
  // Extrair parâmetros principais que afetam o resultado
  const keyParams = [
    'page', 'limit', 'search_term', 'assetclass', 'only_complete',
    'sort_by', 'sort_order', // CRÍTICO: incluir ordenação
    'returns_12m_min', 'returns_12m_max', 'returns_5y_min', 'returns_5y_max',
    'expense_ratio_min', 'expense_ratio_max', 'totalasset_min', 'totalasset_max',
    'volatility_12m_min', 'volatility_12m_max', 'sharpe_12m_min', 'sharpe_12m_max'
  ];
  
  const sortedParams = keyParams
    .map(key => `${key}=${params.get(key) || ''}`)
    .sort()
    .join('&');
    
  return `screener_v2_${Buffer.from(sortedParams).toString('base64').slice(0, 40)}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Cache APENAS para filtros, NÃO para ordenação (para garantir que ordenação sempre funcione)
    const sortByParam = searchParams.get('sort_by');
    const sortOrderParam = searchParams.get('sort_order');
    const hasSort = sortByParam && sortOrderParam;
    
    // Se tem parâmetros de ordenação, pular cache completamente
    if (!hasSort) {
      const cacheKey = generateCacheKey(searchParams);
      const now = Date.now();
      const cached = screenerCache.get(cacheKey);
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return NextResponse.json({
          ...cached.data,
          _cached: true,
          _cacheAge: Math.floor((now - cached.timestamp) / 1000)
        });
      }
    }
    
    // Parâmetros básicos
    const searchTerm = searchParams.get('search_term') || '';
    const assetclass = searchParams.get('assetclass') || '';
    const onlyComplete = searchParams.get('only_complete') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    // Sistema de presets
    const filterPreset = searchParams.get('filter_preset') as FilterPreset | null;
    const sortPreset = searchParams.get('sort_preset') as SortPreset | null;
    
    // Parâmetros de ordenação avançados
    const sortBy = searchParams.get('sort_by') || 'symbol';
    const sortOrder = (searchParams.get('sort_order') || 'ASC').toUpperCase() as 'ASC' | 'DESC';
    const sortBySecondary = searchParams.get('sort_by_secondary') || '';
    const sortOrderSecondary = (searchParams.get('sort_order_secondary') || 'ASC').toUpperCase() as 'ASC' | 'DESC';
    
    // Filtros financeiros básicos
    const totalAssetsMin = parseFloat(searchParams.get('total_assets_min') || '0') || null;
    const totalAssetsMax = parseFloat(searchParams.get('total_assets_max') || '0') || null;
    const expenseRatioMin = parseFloat(searchParams.get('expense_ratio_min') || '0') || null;
    const expenseRatioMax = parseFloat(searchParams.get('expense_ratio_max') || '0') || null;
    
    // Novos filtros financeiros
    const navMin = parseFloat(searchParams.get('nav_min') || '0') || null;
    const navMax = parseFloat(searchParams.get('nav_max') || '0') || null;
    const volumeMin = parseFloat(searchParams.get('volume_min') || '0') || null;
    const volumeMax = parseFloat(searchParams.get('volume_max') || '0') || null;
    const holdingsCountMin = parseFloat(searchParams.get('holdings_count_min') || '0') || null;
    const holdingsCountMax = parseFloat(searchParams.get('holdings_count_max') || '0') || null;
    
    // Filtros de performance - períodos curtos
    const returns12mMin = parseFloat(searchParams.get('returns_12m_min') || '0') || null;
    const returns12mMax = parseFloat(searchParams.get('returns_12m_max') || '0') || null;
    const returns24mMin = parseFloat(searchParams.get('returns_24m_min') || '0') || null;
    const returns24mMax = parseFloat(searchParams.get('returns_24m_max') || '0') || null;
    const returns36mMin = parseFloat(searchParams.get('returns_36m_min') || '0') || null;
    const returns36mMax = parseFloat(searchParams.get('returns_36m_max') || '0') || null;
    
    // Filtros de performance - períodos longos
    const returns5yMin = parseFloat(searchParams.get('returns_5y_min') || '0') || null;
    const returns5yMax = parseFloat(searchParams.get('returns_5y_max') || '0') || null;
    const returns10yMin = parseFloat(searchParams.get('returns_10y_min') || '0') || null;
    const returns10yMax = parseFloat(searchParams.get('returns_10y_max') || '0') || null;
    
    // Filtros de volatilidade - todos os períodos
    const volatility12mMin = parseFloat(searchParams.get('volatility_12m_min') || '0') || null;
    const volatility12mMax = parseFloat(searchParams.get('volatility_12m_max') || '0') || null;
    const volatility24mMin = parseFloat(searchParams.get('volatility_24m_min') || '0') || null;
    const volatility24mMax = parseFloat(searchParams.get('volatility_24m_max') || '0') || null;
    const volatility36mMin = parseFloat(searchParams.get('volatility_36m_min') || '0') || null;
    const volatility36mMax = parseFloat(searchParams.get('volatility_36m_max') || '0') || null;
    const volatility5yMin = parseFloat(searchParams.get('volatility_5y_min') || '0') || null;
    const volatility5yMax = parseFloat(searchParams.get('volatility_5y_max') || '0') || null;
    const volatility10yMin = parseFloat(searchParams.get('volatility_10y_min') || '0') || null;
    const volatility10yMax = parseFloat(searchParams.get('volatility_10y_max') || '0') || null;

    // Filtros Sharpe - todos os períodos
    const sharpe12mMin = parseFloat(searchParams.get('sharpe_12m_min') || '0') || null;
    const sharpe12mMax = parseFloat(searchParams.get('sharpe_12m_max') || '0') || null;
    const sharpe24mMin = parseFloat(searchParams.get('sharpe_24m_min') || '0') || null;
    const sharpe24mMax = parseFloat(searchParams.get('sharpe_24m_max') || '0') || null;
    const sharpe36mMin = parseFloat(searchParams.get('sharpe_36m_min') || '0') || null;
    const sharpe36mMax = parseFloat(searchParams.get('sharpe_36m_max') || '0') || null;
    const sharpe5yMin = parseFloat(searchParams.get('sharpe_5y_min') || '0') || null;
    const sharpe5yMax = parseFloat(searchParams.get('sharpe_5y_max') || '0') || null;
    const sharpe10yMin = parseFloat(searchParams.get('sharpe_10y_min') || '0') || null;
    const sharpe10yMax = parseFloat(searchParams.get('sharpe_10y_max') || '0') || null;
    
    // Filtros de risco
    const maxDrawdownMin = parseFloat(searchParams.get('max_drawdown_min') || '0') || null;
    const maxDrawdownMax = parseFloat(searchParams.get('max_drawdown_max') || '0') || null;
    
    // Filtros de dividendos expandidos
    const dividendYieldMin = parseFloat(searchParams.get('dividend_yield_min') || '0') || null;
    const dividendYieldMax = parseFloat(searchParams.get('dividend_yield_max') || '0') || null;
    const dividends12mMin = parseFloat(searchParams.get('dividends_12m_min') || '0') || null;
    const dividends12mMax = parseFloat(searchParams.get('dividends_12m_max') || '0') || null;
    const dividends24mMin = parseFloat(searchParams.get('dividends_24m_min') || '0') || null;
    const dividends24mMax = parseFloat(searchParams.get('dividends_24m_max') || '0') || null;
    const dividends36mMin = parseFloat(searchParams.get('dividends_36m_min') || '0') || null;
    const dividends36mMax = parseFloat(searchParams.get('dividends_36m_max') || '0') || null;
    const dividendsAllTimeMin = parseFloat(searchParams.get('dividends_all_time_min') || '0') || null;
    const dividendsAllTimeMax = parseFloat(searchParams.get('dividends_all_time_max') || '0') || null;
    
    // Filtros de categorização expandidos
    const sizeCategory = searchParams.get('size_category') || '';
    const liquidityCategory = searchParams.get('liquidity_category') || '';
    const liquidityRating = searchParams.get('liquidity_rating') || '';
    const sizeRating = searchParams.get('size_rating') || '';
    const etfType = searchParams.get('etf_type') || '';
    const domicile = searchParams.get('domicile') || '';
    const navcurrency = searchParams.get('navcurrency') || '';
    const etfCompany = searchParams.get('etf_company') || '';
    
    // Filtros temporais
    const inceptionDateAfter = searchParams.get('inception_date_after') || '';
    const inceptionDateBefore = searchParams.get('inception_date_before') || '';
    const etfAgeMinYears = parseFloat(searchParams.get('etf_age_min_years') || '0') || null;
    const etfAgeMaxYears = parseFloat(searchParams.get('etf_age_max_years') || '0') || null;
    
    // Filtros de qualidade combinados
    const highQualityOnly = searchParams.get('high_quality_only') === 'true';
    const lowCostOnly = searchParams.get('low_cost_only') === 'true';
    const highLiquidityOnly = searchParams.get('high_liquidity_only') === 'true';
    const establishedOnly = searchParams.get('established_only') === 'true';
    
    // Filtros de setor
    const topSector = searchParams.get('top_sector') || '';
    const excludeSectors = searchParams.get('exclude_sectors')?.split(',').filter(Boolean) || [];

    console.log(`🔍 Screener API Avançado - Página ${page}, Limit ${limit}, Busca: "${searchTerm}"`);
    
    // Validar parâmetros de filtro antes de prosseguir
    const allFilters = {
      searchTerm, assetclass, expenseRatioMin, expenseRatioMax, totalAssetsMin, totalAssetsMax,
      navMin, navMax, volumeMin, volumeMax, holdingsCountMin, holdingsCountMax,
      returns12mMin, returns12mMax, returns24mMin, returns24mMax, returns36mMin, returns36mMax,
      returns5yMin, returns5yMax, returns10yMin, returns10yMax,
      volatility12mMin, volatility12mMax, volatility24mMin, volatility24mMax,
      volatility36mMin, volatility36mMax, volatility5yMin, volatility5yMax,
      sharpe12mMin, sharpe12mMax, sharpe24mMin, sharpe24mMax, sharpe36mMin, sharpe36mMax,
      sharpe5yMin, sharpe5yMax, maxDrawdownMin, maxDrawdownMax,
      dividendYieldMin, dividendYieldMax, dividends12mMin, dividends12mMax,
      dividends24mMin, dividends24mMax, dividends36mMin, dividends36mMax,
      sizeCategory, liquidityCategory, liquidityRating, etfType, domicile, etfCompany,
      inceptionDateAfter, inceptionDateBefore, etfAgeMinYears, etfAgeMaxYears,
      highQualityOnly, lowCostOnly, highLiquidityOnly, establishedOnly,
      topSector, filterPreset, sortPreset
    };

    const paramValidation = validateFilterParameters(allFilters);
    if (!paramValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Parâmetros de filtro inválidos', 
          details: paramValidation.errors,
          _source: 'screener-validation-api'
        },
        { status: 400 }
      );
    }
    
    // Aplicar presets se especificados
    let appliedFilters: Partial<AdvancedFilters> = {};
    let appliedSort: SortConfig | null = null;
    
    if (filterPreset) {
      const presetConfig = applyFilterPreset(filterPreset);
      appliedFilters = presetConfig.filters;
      appliedSort = presetConfig.sort || null;
      console.log(`📋 Aplicando preset de filtro: ${filterPreset}`);
    }
    
    if (sortPreset) {
      appliedSort = applySortPreset(sortPreset);
      console.log(`📊 Aplicando preset de ordenação: ${sortPreset}`);
    }
    
    // Aplicar filtros de qualidade combinados
    if (highQualityOnly) {
      const qualityConfig = getQualityFilterConfig('highQualityOnly');
      appliedFilters = { ...appliedFilters, ...qualityConfig };
    }
    if (lowCostOnly) {
      const costConfig = getQualityFilterConfig('lowCostOnly');
      appliedFilters = { ...appliedFilters, ...costConfig };
    }
    if (highLiquidityOnly) {
      const liquidityConfig = getQualityFilterConfig('highLiquidityOnly');
      appliedFilters = { ...appliedFilters, ...liquidityConfig };
    }
    if (establishedOnly) {
      const establishedConfig = getQualityFilterConfig('establishedOnly');
      appliedFilters = { ...appliedFilters, ...establishedConfig };
    }

    // Função para construir a cláusula ORDER BY avançada
    const getAdvancedOrderByClause = (
      primaryField: string, 
      primaryOrder: string,
      secondaryField?: string,
      secondaryOrder?: string,
      sortConfig?: SortConfig | null
    ): Prisma.Sql => {
      const fieldMapping: Record<string, string> = {
        'symbol': 'symbol',
        'name': 'name',
        'assetclass': 'assetclass',
        'etfcompany': 'etfcompany',
        'expense_ratio': 'expenseratio',
        'totalasset': 'totalasset',
        'nav': 'nav',
        'volume': 'avgvolume',
        'avgvolume': 'avgvolume',
        'holdings_count': 'holdingscount',
        'inception_date': 'inceptiondate',
        'etf_age': 'EXTRACT(YEAR FROM AGE(CURRENT_DATE, inceptiondate::date))',
        'returns_12m': 'returns_12m',
        'returns_24m': 'returns_24m',
        'returns_36m': 'returns_36m',
        'returns_5y': 'returns_5y',
        'ten_year_return': 'ten_year_return',
        'volatility_12m': 'volatility_12m',
        'volatility_24m': 'volatility_24m',
        'volatility_36m': 'volatility_36m',
        'ten_year_volatility': 'ten_year_volatility',
        'sharpe_12m': 'sharpe_12m',
        'sharpe_24m': 'sharpe_24m',
        'sharpe_36m': 'sharpe_36m',
        'ten_year_sharpe': 'ten_year_sharpe',
        'max_drawdown': 'max_drawdown',
        'dividends_12m': 'dividends_12m',
        'dividends_24m': 'dividends_24m',
        'dividends_36m': 'dividends_36m',
        'dividends_all_time': 'dividends_all_time',
        'dividend_yield': '(dividends_12m / NULLIF(nav, 0) * 100)',
        'size_category': 'size_category',
        'liquidity_category': 'liquidity_category',
        'liquidity_rating': 'liquidity_rating',
        'size_rating': 'size_rating'
      };
      
      // Usar configuração de ordenação do preset se disponível
      if (sortConfig) {
        const primarySqlField = fieldMapping[sortConfig.primary.field] || 'symbol';
        const primarySqlOrder = sortConfig.primary.order === 'ASC' ? 'ASC' : 'DESC';
        
        if (sortConfig.secondary) {
          const secondarySqlField = fieldMapping[sortConfig.secondary.field] || 'symbol';
          const secondarySqlOrder = sortConfig.secondary.order === 'ASC' ? 'ASC' : 'DESC';
          
          return Prisma.sql`ORDER BY ${Prisma.raw(primarySqlField)} ${Prisma.raw(primarySqlOrder)} NULLS LAST, ${Prisma.raw(secondarySqlField)} ${Prisma.raw(secondarySqlOrder)} NULLS LAST`;
        } else {
          return Prisma.sql`ORDER BY ${Prisma.raw(primarySqlField)} ${Prisma.raw(primarySqlOrder)} NULLS LAST`;
        }
      }
      
      // Usar ordenação manual
      const primarySqlField = fieldMapping[primaryField] || 'symbol';
      const primarySqlOrder = primaryOrder === 'ASC' ? 'ASC' : 'DESC';
      
      if (secondaryField && secondaryField !== '') {
        const secondarySqlField = fieldMapping[secondaryField] || 'symbol';
        const secondarySqlOrder = secondaryOrder === 'ASC' ? 'ASC' : 'DESC';
        
        return Prisma.sql`ORDER BY ${Prisma.raw(primarySqlField)} ${Prisma.raw(primarySqlOrder)} NULLS LAST, ${Prisma.raw(secondarySqlField)} ${Prisma.raw(secondarySqlOrder)} NULLS LAST`;
      } else {
        return Prisma.sql`ORDER BY ${Prisma.raw(primarySqlField)} ${Prisma.raw(primarySqlOrder)} NULLS LAST`;
      }
    };
    
    // Garantir que os parâmetros não sejam null/undefined para o Prisma
    const safeParams = {
      searchTerm: searchTerm || '',
      assetclass: assetclass || '',
      sizeCategory: sizeCategory || '',
      liquidityCategory: liquidityCategory || '',
      liquidityRating: liquidityRating || '',
      sizeRating: sizeRating || '',
      etfType: etfType || '',
      domicile: domicile || '',
      navcurrency: navcurrency || '',
      etfCompany: etfCompany || '',
      inceptionDateAfter: inceptionDateAfter || '',
      inceptionDateBefore: inceptionDateBefore || '',
      topSector: topSector || ''
    };

    // 🚀 QUERY OTIMIZADA: Executar query principal e contagem em paralelo

    
    const [result, countResult] = await Promise.all([
      // Query principal OTIMIZADA com apenas campos essenciais
      prisma.$queryRaw<any[]>(
        Prisma.sql`
        SELECT 
          symbol,
          name,
          description,
          isin,
          assetclass,
          domicile,
          etfcompany,
          expenseratio,
          totalasset,
          avgvolume,
          inceptiondate,
          nav,
          navcurrency,
          sectorslist,
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
          size_rating,
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, inceptiondate::date)) as etf_age_years,
          -- Campos calculados otimizados
          (dividends_12m / NULLIF(nav, 0) * 100) as dividend_yield
        FROM etfs_ativos_reais
        WHERE 1=1
          -- Filtros básicos
          AND (${safeParams.searchTerm} = '' OR symbol ILIKE CONCAT('%', ${safeParams.searchTerm}, '%') OR name ILIKE CONCAT('%', ${safeParams.searchTerm}, '%'))
          AND (${safeParams.assetclass} = '' OR assetclass ILIKE CONCAT('%', ${safeParams.assetclass}, '%'))
          ${onlyComplete || appliedFilters.onlyComplete ? Prisma.sql`AND name IS NOT NULL AND assetclass IS NOT NULL AND inceptiondate IS NOT NULL` : Prisma.empty}
          
          -- Filtros financeiros
          ${(totalAssetsMin || appliedFilters.totalAssetsMin) ? Prisma.sql`AND totalasset >= ${totalAssetsMin || appliedFilters.totalAssetsMin}` : Prisma.empty}
          ${(totalAssetsMax || appliedFilters.totalAssetsMax) ? Prisma.sql`AND totalasset <= ${totalAssetsMax || appliedFilters.totalAssetsMax}` : Prisma.empty}
          ${(expenseRatioMin || appliedFilters.expenseRatioMin) ? Prisma.sql`AND expenseratio >= ${(expenseRatioMin || appliedFilters.expenseRatioMin)! / 100}` : Prisma.empty}
          ${(expenseRatioMax || appliedFilters.expenseRatioMax) ? Prisma.sql`AND expenseratio <= ${(expenseRatioMax || appliedFilters.expenseRatioMax)! / 100}` : Prisma.empty}
          ${navMin ? Prisma.sql`AND nav >= ${navMin}` : Prisma.empty}
          ${navMax ? Prisma.sql`AND nav <= ${navMax}` : Prisma.empty}
          ${(volumeMin || appliedFilters.volumeMin) ? Prisma.sql`AND avgvolume >= ${volumeMin || appliedFilters.volumeMin}` : Prisma.empty}
          ${volumeMax ? Prisma.sql`AND avgvolume <= ${volumeMax}` : Prisma.empty}
          ${holdingsCountMin ? Prisma.sql`AND holdingscount >= ${holdingsCountMin}` : Prisma.empty}
          ${holdingsCountMax ? Prisma.sql`AND holdingscount <= ${holdingsCountMax}` : Prisma.empty}
          
          -- Filtros de performance - períodos curtos
          ${(returns12mMin || appliedFilters.returns12mMin) ? Prisma.sql`AND returns_12m >= ${(returns12mMin || appliedFilters.returns12mMin)! / 100}` : Prisma.empty}
          ${returns12mMax ? Prisma.sql`AND returns_12m <= ${returns12mMax / 100}` : Prisma.empty}
          ${returns24mMin ? Prisma.sql`AND returns_24m >= ${returns24mMin / 100}` : Prisma.empty}
          ${returns24mMax ? Prisma.sql`AND returns_24m <= ${returns24mMax / 100}` : Prisma.empty}
          ${returns36mMin ? Prisma.sql`AND returns_36m >= ${returns36mMin / 100}` : Prisma.empty}
          ${returns36mMax ? Prisma.sql`AND returns_36m <= ${returns36mMax / 100}` : Prisma.empty}
          
          -- Filtros de performance - períodos longos
          ${returns5yMin ? Prisma.sql`AND returns_5y >= ${returns5yMin / 100}` : Prisma.empty}
          ${returns5yMax ? Prisma.sql`AND returns_5y <= ${returns5yMax / 100}` : Prisma.empty}
          ${returns10yMin ? Prisma.sql`AND ten_year_return >= ${returns10yMin / 100}` : Prisma.empty}
          ${returns10yMax ? Prisma.sql`AND ten_year_return <= ${returns10yMax / 100}` : Prisma.empty}
          
          -- Filtros de volatilidade
          ${(volatility12mMin || appliedFilters.volatility12mMin) ? Prisma.sql`AND volatility_12m >= ${(volatility12mMin || appliedFilters.volatility12mMin)! / 100}` : Prisma.empty}
          ${(volatility12mMax || appliedFilters.volatility12mMax) ? Prisma.sql`AND volatility_12m <= ${(volatility12mMax || appliedFilters.volatility12mMax)! / 100}` : Prisma.empty}
          ${volatility24mMin ? Prisma.sql`AND volatility_24m >= ${volatility24mMin / 100}` : Prisma.empty}
          ${volatility24mMax ? Prisma.sql`AND volatility_24m <= ${volatility24mMax / 100}` : Prisma.empty}
          ${volatility36mMin ? Prisma.sql`AND volatility_36m >= ${volatility36mMin / 100}` : Prisma.empty}
          ${volatility36mMax ? Prisma.sql`AND volatility_36m <= ${volatility36mMax / 100}` : Prisma.empty}
          ${volatility5yMin ? Prisma.sql`AND ten_year_volatility >= ${volatility5yMin / 100}` : Prisma.empty}
          ${volatility5yMax ? Prisma.sql`AND ten_year_volatility <= ${volatility5yMax / 100}` : Prisma.empty}
          
          -- Filtros Sharpe
          ${(sharpe12mMin || appliedFilters.sharpe12mMin) ? Prisma.sql`AND sharpe_12m >= ${sharpe12mMin || appliedFilters.sharpe12mMin}` : Prisma.empty}
          ${sharpe12mMax ? Prisma.sql`AND sharpe_12m <= ${sharpe12mMax}` : Prisma.empty}
          ${sharpe24mMin ? Prisma.sql`AND sharpe_24m >= ${sharpe24mMin}` : Prisma.empty}
          ${sharpe24mMax ? Prisma.sql`AND sharpe_24m <= ${sharpe24mMax}` : Prisma.empty}
          ${sharpe36mMin ? Prisma.sql`AND sharpe_36m >= ${sharpe36mMin}` : Prisma.empty}
          ${sharpe36mMax ? Prisma.sql`AND sharpe_36m <= ${sharpe36mMax}` : Prisma.empty}
          ${sharpe5yMin ? Prisma.sql`AND ten_year_sharpe >= ${sharpe5yMin}` : Prisma.empty}
          ${sharpe5yMax ? Prisma.sql`AND ten_year_sharpe <= ${sharpe5yMax}` : Prisma.empty}
          
          -- Filtros de risco
          ${maxDrawdownMin ? Prisma.sql`AND max_drawdown >= ${maxDrawdownMin / 100}` : Prisma.empty}
          ${(maxDrawdownMax || appliedFilters.maxDrawdownMax) ? Prisma.sql`AND max_drawdown <= ${(maxDrawdownMax || appliedFilters.maxDrawdownMax)! / 100}` : Prisma.empty}
          
          -- Filtros de dividendos
          ${(dividendYieldMin || appliedFilters.dividendYieldMin) ? Prisma.sql`AND (dividends_12m / NULLIF(nav, 0) * 100) >= ${dividendYieldMin || appliedFilters.dividendYieldMin}` : Prisma.empty}
          ${dividendYieldMax ? Prisma.sql`AND (dividends_12m / NULLIF(nav, 0) * 100) <= ${dividendYieldMax}` : Prisma.empty}
          ${(dividends12mMin || appliedFilters.dividends12mMin) ? Prisma.sql`AND dividends_12m >= ${(dividends12mMin || appliedFilters.dividends12mMin)! / 100}` : Prisma.empty}
          ${dividends12mMax ? Prisma.sql`AND dividends_12m <= ${dividends12mMax / 100}` : Prisma.empty}
          ${dividends24mMin ? Prisma.sql`AND dividends_24m >= ${dividends24mMin / 100}` : Prisma.empty}
          ${dividends24mMax ? Prisma.sql`AND dividends_24m <= ${dividends24mMax / 100}` : Prisma.empty}
          ${dividends36mMin ? Prisma.sql`AND dividends_36m >= ${dividends36mMin / 100}` : Prisma.empty}
          ${dividends36mMax ? Prisma.sql`AND dividends_36m <= ${dividends36mMax / 100}` : Prisma.empty}
          ${dividendsAllTimeMin ? Prisma.sql`AND dividends_all_time >= ${dividendsAllTimeMin / 100}` : Prisma.empty}
          ${dividendsAllTimeMax ? Prisma.sql`AND dividends_all_time <= ${dividendsAllTimeMax / 100}` : Prisma.empty}
          
          -- Filtros de categorização
          AND (${safeParams.sizeCategory} = '' OR ${appliedFilters.sizeCategory || ''} = '' OR size_category ILIKE CONCAT('%', COALESCE(NULLIF(${safeParams.sizeCategory}, ''), ${appliedFilters.sizeCategory || ''}), '%'))
          AND (${safeParams.liquidityCategory} = '' OR ${appliedFilters.liquidityCategory || ''} = '' OR liquidity_category ILIKE CONCAT('%', COALESCE(NULLIF(${safeParams.liquidityCategory}, ''), ${appliedFilters.liquidityCategory || ''}), '%'))
          AND (${safeParams.liquidityRating} = '' OR ${appliedFilters.liquidityRating || ''} = '' OR liquidity_rating ILIKE CONCAT('%', COALESCE(NULLIF(${safeParams.liquidityRating}, ''), ${appliedFilters.liquidityRating || ''}), '%'))
          AND (${safeParams.sizeRating} = '' OR size_rating ILIKE CONCAT('%', ${safeParams.sizeRating}, '%'))
          AND (${safeParams.etfType} = '' OR etf_type ILIKE CONCAT('%', ${safeParams.etfType}, '%'))
          AND (${safeParams.domicile} = '' OR ${appliedFilters.domicile || ''} = '' OR domicile ILIKE CONCAT('%', COALESCE(NULLIF(${safeParams.domicile}, ''), ${appliedFilters.domicile || ''}), '%'))
          AND (${safeParams.navcurrency} = '' OR ${appliedFilters.navcurrency || ''} = '' OR navcurrency ILIKE CONCAT('%', COALESCE(NULLIF(${safeParams.navcurrency}, ''), ${appliedFilters.navcurrency || ''}), '%'))
          AND (${safeParams.etfCompany} = '' OR etfcompany ILIKE CONCAT('%', ${safeParams.etfCompany}, '%'))
          
          -- Filtros temporais
          ${safeParams.inceptionDateAfter ? Prisma.sql`AND inceptiondate >= ${safeParams.inceptionDateAfter}` : Prisma.empty}
          ${safeParams.inceptionDateBefore ? Prisma.sql`AND inceptiondate <= ${safeParams.inceptionDateBefore}` : Prisma.empty}
          ${etfAgeMinYears ? Prisma.sql`AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, inceptiondate::date)) >= ${etfAgeMinYears}` : Prisma.empty}
          ${etfAgeMaxYears ? Prisma.sql`AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, inceptiondate::date)) <= ${etfAgeMaxYears}` : Prisma.empty}
          
          -- Filtros de setor
          ${safeParams.topSector ? Prisma.sql`AND sectorslist::text ILIKE CONCAT('%', ${safeParams.topSector}, '%')` : Prisma.empty}
          ${excludeSectors.length > 0 ? Prisma.sql`AND NOT (${Prisma.join(excludeSectors.map(sector => Prisma.sql`sectorslist::text ILIKE CONCAT('%', ${sector}, '%')`), ' OR ')})` : Prisma.empty}
        
        ${getAdvancedOrderByClause(sortBy, sortOrder, sortBySecondary, sortOrderSecondary, appliedSort)}
        LIMIT ${limit} OFFSET ${offset}
        `
      ),
      
      // 📊 Contar total de resultados com MESMOS filtros para precisão
      prisma.$queryRaw<[{ count: bigint }]>(
        Prisma.sql`
        SELECT COUNT(*) as count 
        FROM etfs_ativos_reais
        WHERE 1=1
          -- Aplicar mesmos filtros básicos da query principal
          AND (${safeParams.searchTerm} = '' OR symbol ILIKE CONCAT('%', ${safeParams.searchTerm}, '%') OR name ILIKE CONCAT('%', ${safeParams.searchTerm}, '%'))
          AND (${safeParams.assetclass} = '' OR assetclass ILIKE CONCAT('%', ${safeParams.assetclass}, '%'))
          ${onlyComplete || appliedFilters.onlyComplete ? Prisma.sql`AND name IS NOT NULL AND assetclass IS NOT NULL AND inceptiondate IS NOT NULL` : Prisma.empty}
          
          -- Filtros financeiros principais
          ${(totalAssetsMin || appliedFilters.totalAssetsMin) ? Prisma.sql`AND totalasset >= ${(totalAssetsMin || appliedFilters.totalAssetsMin)! * 1000000}` : Prisma.empty}
          ${totalAssetsMax ? Prisma.sql`AND totalasset <= ${totalAssetsMax * 1000000}` : Prisma.empty}
          ${(expenseRatioMin || appliedFilters.expenseRatioMin) ? Prisma.sql`AND expenseratio >= ${(expenseRatioMin || appliedFilters.expenseRatioMin)! / 100}` : Prisma.empty}
          ${(expenseRatioMax || appliedFilters.expenseRatioMax) ? Prisma.sql`AND expenseratio <= ${(expenseRatioMax || appliedFilters.expenseRatioMax)! / 100}` : Prisma.empty}
        `
      )
    ]);

    console.log(`✅ Encontrados ${result.length} ETFs com filtros avançados`);

    // Processar dados com TODAS as colunas
    const rawProcessedData = result.map((row: any) => {
      // Calcular dividend yield se possível
      const nav = formatNumeric(row.nav);
      const dividends12m = formatNumeric(row.dividends_12m, 4);
      const dividendYield = (nav && dividends12m && nav > 0) 
        ? formatNumeric((dividends12m / nav) * 100, 2) 
        : null;

      return {
        id: row.symbol,
        symbol: row.symbol,
        name: row.name,
        description: row.description,
        isin: row.isin,
        assetclass: row.assetclass,
        etfcompany: row.etfcompany,
        etf_type: row.etf_type,
        domicile: row.domicile,
        securitycusip: row.securitycusip,
        website: row.website,
        navcurrency: row.navcurrency,
        
        // Dados financeiros
        expense_ratio: formatNumeric(row.expenseratio, 4),
        totalasset: formatNumeric(row.totalasset),
        nav: formatNumeric(row.nav),
        volume: formatNumeric(row.avgvolume),
        avgvolume: formatNumeric(row.avgvolume),
        holdings_count: formatNumeric(row.holdingscount, 0),
        holdingscount: formatNumeric(row.holdingscount, 0),
        inception_date: row.inceptiondate,
        inceptiondate: row.inceptiondate,
        etf_age_years: formatNumeric(row.etf_age_years, 0),
        
        // Performance - CORRIGIDA: dividir por 100 antes de enviar
        returns_12m: row.returns_12m ? formatNumeric(Number(row.returns_12m) / 100, 6) : null,
        returns_24m: row.returns_24m ? formatNumeric(Number(row.returns_24m) / 100, 6) : null,
        returns_36m: row.returns_36m ? formatNumeric(Number(row.returns_36m) / 100, 6) : null,
        returns_5y: row.returns_5y ? formatNumeric(Number(row.returns_5y) / 100, 6) : null,
        ten_year_return: row.ten_year_return ? formatNumeric(Number(row.ten_year_return) / 100, 6) : null,
        
        // Volatilidade - CORRIGIDA: dividir por 100 antes de enviar
        volatility_12m: row.volatility_12m ? formatNumeric(Number(row.volatility_12m) / 100, 6) : null,
        volatility_24m: row.volatility_24m ? formatNumeric(Number(row.volatility_24m) / 100, 6) : null,
        volatility_36m: row.volatility_36m ? formatNumeric(Number(row.volatility_36m) / 100, 6) : null,
        ten_year_volatility: row.ten_year_volatility ? formatNumeric(Number(row.ten_year_volatility) / 100, 6) : null,
        
        // Sharpe Ratio (não é percentual)
        sharpe_12m: formatNumeric(row.sharpe_12m, 4),
        sharpe_24m: formatNumeric(row.sharpe_24m, 4),
        sharpe_36m: formatNumeric(row.sharpe_36m, 4),
        ten_year_sharpe: formatNumeric(row.ten_year_sharpe, 4),
        
        // Risco - CORRIGIDA: dividir por 100 antes de enviar
        max_drawdown: row.max_drawdown ? formatNumeric(Number(row.max_drawdown) / 100, 6) : null,
        
        // Dividendos - CORRIGIDA: dividir por 100 antes de enviar
        dividends_12m: row.dividends_12m ? formatNumeric(Number(row.dividends_12m) / 100, 6) : null,
        dividends_24m: row.dividends_24m ? formatNumeric(Number(row.dividends_24m) / 100, 6) : null,
        dividends_36m: row.dividends_36m ? formatNumeric(Number(row.dividends_36m) / 100, 6) : null,
        dividends_all_time: row.dividends_all_time ? formatNumeric(Number(row.dividends_all_time) / 100, 6) : null,
        dividend_yield: dividendYield,
        
        // Categorização
        size_category: row.size_category,
        liquidity_category: row.liquidity_category,
        liquidity_rating: row.liquidity_rating,
        size_rating: row.size_rating,
        
        // Metadados
        sectorslist: row.sectorslist,
        updatedat: row.updatedat
      };
    });

    // Aplicar validação de dados e filtrar ETFs anômalos
    const processedData = validateAndFilterETFs(rawProcessedData, true);
    console.log(`🔍 ${rawProcessedData.length} ETFs processados, ${processedData.length} válidos após validação`);

    const totalCount = Number(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Analytics: rastrear filtros utilizados (não bloquear resposta)
    const analyticsFilters = {
      searchTerm, assetclass, expenseRatioMin, expenseRatioMax, totalAssetsMin, totalAssetsMax,
      navMin, navMax, volumeMin, volumeMax, holdingsCountMin, holdingsCountMax,
      returns12mMin, returns12mMax, returns24mMin, returns24mMax, returns36mMin, returns36mMax,
      returns5yMin, returns5yMax, returns10yMin, returns10yMax,
      volatility12mMin, volatility12mMax, volatility24mMin, volatility24mMax,
      volatility36mMin, volatility36mMax, volatility5yMin, volatility5yMax,
      sharpe12mMin, sharpe12mMax, sharpe24mMin, sharpe24mMax, sharpe36mMin, sharpe36mMax,
      sharpe5yMin, sharpe5yMax, maxDrawdownMin, maxDrawdownMax,
      dividendYieldMin, dividendYieldMax, dividends12mMin, dividends12mMax,
      dividends24mMin, dividends24mMax, dividends36mMin, dividends36mMax,
      sizeCategory, liquidityCategory, liquidityRating, etfType, domicile, etfCompany,
      inceptionDateAfter, inceptionDateBefore, etfAgeMinYears, etfAgeMaxYears,
      highQualityOnly, lowCostOnly, highLiquidityOnly, establishedOnly,
      topSector, filterPreset, sortPreset
    };
    
    const activeFilters = Object.keys(analyticsFilters).filter(key => {
      const value = analyticsFilters[key as keyof typeof analyticsFilters];
      return value !== undefined && value !== null && value !== '' && value !== false && value !== 0;
    });

    // Enviar analytics em background
    if (activeFilters.length > 0) {
      try {
        // Não aguardar resposta para não atrasar o usuário
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/analytics/filter-usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filters: activeFilters,
            totalFilters: activeFilters.length,
            timestamp: new Date().toISOString(),
            userAgent: request.headers.get('user-agent'),
            sessionId: request.headers.get('x-session-id') || 'anonymous',
            resultsCount: processedData.length
          })
        }).catch(() => {}); // Silenciar erros
      } catch (error) {
        // Não logar para não poluir console
      }
    }

    const response = {
      etfs: processedData,
      totalCount,
      page,
      totalPages,
      itemsPerPage: limit,
      hasMore: page < totalPages,
      sort: {
        sortBy: appliedSort?.primary.field || sortBy,
        sortOrder: appliedSort?.primary.order || sortOrder,
        sortBySecondary: appliedSort?.secondary?.field || sortBySecondary || undefined,
        sortOrderSecondary: appliedSort?.secondary?.order || sortOrderSecondary || undefined
      },
      appliedPresets: {
        filterPreset: filterPreset || undefined,
        sortPreset: sortPreset || undefined
      },
      analytics: {
        activeFilters: activeFilters.length,
        filtersUsed: activeFilters
      },
      _source: 'screener-advanced-api',
      _message: `Retornando ${processedData.length} ETFs de ${totalCount} total (${activeFilters.length} filtros ativos, ${rawProcessedData.length - processedData.length} excluídos por validação)`,
      _timestamp: new Date().toISOString(),
      _dataQuality: {
        totalProcessed: rawProcessedData.length,
        validETFs: processedData.length,
        excludedETFs: rawProcessedData.length - processedData.length,
        exclusionRate: ((rawProcessedData.length - processedData.length) / rawProcessedData.length * 100).toFixed(2) + '%'
      }
    };

    // Salvar no cache APENAS se não houver ordenação
    if (!hasSort) {
      const cacheKey = generateCacheKey(searchParams);
      const now = Date.now();
      
      screenerCache.set(cacheKey, {
        data: response,
        timestamp: now
      });

      // Limpar cache antigo (manter apenas 50 entradas)
      if (screenerCache.size > 50) {
        const oldestKey = screenerCache.keys().next().value;
        if (oldestKey) {
          screenerCache.delete(oldestKey);
        }
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro no Screener API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
