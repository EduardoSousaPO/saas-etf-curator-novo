// src/types/etf.ts
export interface ETF {
  // Identificação básica
  id: string;
  symbol: string;
  name: string | null;
  description: string | null;
  isin: string | null;
  
  // Classificação
  assetclass: string | null;
  etfcompany: string | null;
  etf_type: string | null;
  domicile: string | null;
  
  // Dados financeiros básicos
  expense_ratio: number | null;
  totalasset: number | null;
  nav: number | null;
  navcurrency: string | null;
  volume: number | null;
  avgvolume: number | null; // Mantido para compatibilidade
  holdings_count: number | null;
  holdingscount: number | null; // Mantido para compatibilidade
  inception_date: string | null;
  inceptiondate: string | null; // Mantido para compatibilidade
  
  // Retornos
  returns_12m: number | null;
  returns_24m: number | null;
  returns_36m: number | null;
  returns_5y: number | null;
  ten_year_return: number | null;
  
  // Volatilidade
  volatility_12m: number | null;
  volatility_24m: number | null;
  volatility_36m: number | null;
  ten_year_volatility: number | null;
  
  // Sharpe Ratio
  sharpe_12m: number | null;
  sharpe_24m: number | null;
  sharpe_36m: number | null;
  ten_year_sharpe: number | null;
  
  // Risco
  max_drawdown: number | null;
  
  // Dividendos
  dividends_12m: number | null;
  dividends_24m: number | null;
  dividends_36m: number | null;
  dividends_all_time: number | null;
  dividend_yield: number | null; // Calculado
  
  // Categorização
  size_category: string | null;
  liquidity_category: string | null;
  liquidity_rating: string | null;
  size_rating: string | null;
  
  // Metadados
  website: string | null;
  securitycusip: string | null;
  sectorslist: any | null; // JSON
  updatedat: string | null;
}

export interface ETFDetails extends ETF {
  // Dados históricos de dividendos
  dividendHistory?: DividendHistory[];
  
  // Dados de preços históricos
  priceHistory?: PriceHistory[];
  
  // Métricas calculadas adicionais
  ytdReturn?: number | null;
  averageVolume30d?: number | null;
  beta?: number | null;
  
  // Informações de setor (se disponível)
  topSectors?: SectorAllocation[];
  topHoldings?: Holding[];

  // Campos enriquecidos do pipeline
  beta_12m?: number | null;
  morningstar_rating?: number | null;
  top_10_holdings?: any[] | null; // JSONB array
  sector_allocation?: Record<string, number> | null; // JSONB object
  
  // AI Insights enriquecidos
  ai_investment_thesis?: string | null;
  ai_risk_analysis?: string | null;
  ai_market_context?: string | null;
  ai_use_cases?: string | null;
}

export interface DividendHistory {
  ex_date: string;
  pay_date: string | null;
  amount: number;
  frequency: string | null;
  yield_percentage: number | null;
}

export interface PriceHistory {
  date: string;
  price: number;
  volume: number | null;
}

export interface SectorAllocation {
  sector: string;
  percentage: number;
}

export interface Holding {
  name: string;
  symbol: string;
  percentage: number;
}

// Filtros avançados expandidos
export interface AdvancedFilters {
  // Filtros básicos existentes
  searchTerm?: string;
  assetclass?: string;
  onlyComplete?: boolean;
  
  // Filtros de valor financeiro
  totalAssetsMin?: number;
  totalAssetsMax?: number;
  expenseRatioMin?: number;
  expenseRatioMax?: number;
  navMin?: number;
  navMax?: number;
  volumeMin?: number;
  volumeMax?: number;
  holdingsCountMin?: number;
  holdingsCountMax?: number;
  
  // Filtros de performance - períodos curtos
  returns12mMin?: number;
  returns12mMax?: number;
  returns24mMin?: number;
  returns24mMax?: number;
  returns36mMin?: number;
  returns36mMax?: number;
  
  // Filtros de performance - períodos longos
  returns5yMin?: number;
  returns5yMax?: number;
  returns10yMin?: number;
  returns10yMax?: number;
  
  // Filtros de risco - períodos curtos
  volatility12mMin?: number;
  volatility12mMax?: number;
  volatility24mMin?: number;
  volatility24mMax?: number;
  volatility36mMin?: number;
  volatility36mMax?: number;
  
  // Filtros de risco - períodos longos
  volatility5yMin?: number;
  volatility5yMax?: number;
  volatility10yMin?: number;
  volatility10yMax?: number;
  
  // Filtros Sharpe - todos os períodos
  sharpe12mMin?: number;
  sharpe12mMax?: number;
  sharpe24mMin?: number;
  sharpe24mMax?: number;
  sharpe36mMin?: number;
  sharpe36mMax?: number;
  sharpe5yMin?: number;
  sharpe5yMax?: number;
  sharpe10yMin?: number;
  sharpe10yMax?: number;
  
  // Filtros de risco adicional
  maxDrawdownMin?: number;
  maxDrawdownMax?: number;
  
  // Filtros de dividendos
  dividendYieldMin?: number;
  dividendYieldMax?: number;
  dividends12mMin?: number;
  dividends12mMax?: number;
  dividends24mMin?: number;
  dividends24mMax?: number;
  dividends36mMin?: number;
  dividends36mMax?: number;
  dividendsAllTimeMin?: number;
  dividendsAllTimeMax?: number;
  
  // Filtros de categorização
  sizeCategory?: string;
  liquidityCategory?: string;
  liquidityRating?: string;
  sizeRating?: string;
  etfType?: string;
  domicile?: string;
  navcurrency?: string;
  
  // Filtros de empresa
  etfCompany?: string;
  
  // Filtros temporais
  inceptionDateAfter?: string;
  inceptionDateBefore?: string;
  etfAgeMinYears?: number;
  etfAgeMaxYears?: number;
  
  // Filtros de qualidade combinados
  highQualityOnly?: boolean;
  lowCostOnly?: boolean;
  highLiquidityOnly?: boolean;
  establishedOnly?: boolean;
  
  // Filtros de setor (JSON)
  topSector?: string;
  excludeSectors?: string[];
  
  // Presets
  filterPreset?: FilterPreset;
  sortPreset?: SortPreset;
}

// Tipos para ordenação expandidos
export type SortField = 
  // Identificação
  | 'symbol'
  | 'name'
  | 'assetclass'
  | 'etfcompany'
  
  // Financeiros
  | 'totalasset'
  | 'nav'
  | 'volume'
  | 'avgvolume'
  | 'expense_ratio'
  | 'holdings_count'
  
  // Performance - períodos curtos
  | 'returns_12m'
  | 'returns_24m'
  | 'returns_36m'
  
  // Performance - períodos longos
  | 'returns_5y'
  | 'ten_year_return'
  
  // Volatilidade - todos os períodos
  | 'volatility_12m'
  | 'volatility_24m'
  | 'volatility_36m'
  | 'ten_year_volatility'
  
  // Sharpe - todos os períodos
  | 'sharpe_12m'
  | 'sharpe_24m'
  | 'sharpe_36m'
  | 'ten_year_sharpe'
  
  // Risco
  | 'max_drawdown'
  
  // Dividendos
  | 'dividend_yield'
  | 'dividends_12m'
  | 'dividends_24m'
  | 'dividends_36m'
  | 'dividends_all_time'
  
  // Temporal
  | 'inception_date'
  | 'etf_age'
  
  // Categorização
  | 'size_category'
  | 'liquidity_category'
  | 'liquidity_rating'
  | 'size_rating';

export type SortOrder = 'ASC' | 'DESC';

// Sistema de ordenação avançado
export interface SortConfig {
  primary: {
    field: SortField;
    order: SortOrder;
  };
  secondary?: {
    field: SortField;
    order: SortOrder;
  };
}

// Presets de ordenação comuns
export type SortPreset = 
  | 'best_performers_12m'
  | 'best_performers_5y'
  | 'lowest_fees'
  | 'highest_dividends'
  | 'most_liquid'
  | 'newest_etfs'
  | 'largest_assets'
  | 'best_sharpe'
  | 'lowest_volatility'
  | 'best_risk_adjusted';

// Presets de filtros comuns
export type FilterPreset = 
  | 'high_quality'
  | 'low_cost'
  | 'dividend_focused'
  | 'growth_focused'
  | 'conservative'
  | 'aggressive'
  | 'large_cap_only'
  | 'established_etfs'
  | 'high_liquidity'
  | 'us_domiciled';

// Configuração de preset de filtro
export interface FilterPresetConfig {
  name: string;
  description: string;
  filters: Partial<AdvancedFilters>;
  sort?: SortConfig;
}

// Resposta da API
export interface ETFScreenerResponse {
  etfs: ETF[];
  totalCount: number;
  page: number;
  totalPages: number;
  itemsPerPage: number;
  hasMore: boolean;
  filters: AdvancedFilters;
  sort: {
    sortBy: SortField;
    sortOrder: SortOrder;
  };
  _source: string;
  _message: string;
  _timestamp: string;
  _performance?: string;
}

// Tipos para comparação
export interface ETFComparison {
  etfs: ETF[];
  metrics: string[];
  benchmark?: string;
}

// Tipos para estatísticas
export interface ETFStats {
  totalETFs: number;
  averageExpenseRatio: number;
  averageReturn12m: number;
  averageVolatility12m: number;
  averageSharpe12m: number;
  topPerformers: ETF[];
  worstPerformers: ETF[];
} 