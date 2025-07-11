// src/lib/screener-presets.ts
import { FilterPresetConfig, SortConfig, SortPreset, FilterPreset } from '@/types/etf';

/**
 * Configurações de presets de ordenação
 */
export const SORT_PRESETS: Record<SortPreset, SortConfig> = {
  best_performers_12m: {
    primary: { field: 'returns_12m', order: 'DESC' },
    secondary: { field: 'totalasset', order: 'DESC' }
  },
  best_performers_5y: {
    primary: { field: 'returns_5y', order: 'DESC' },
    secondary: { field: 'totalasset', order: 'DESC' }
  },
  lowest_fees: {
    primary: { field: 'expense_ratio', order: 'ASC' },
    secondary: { field: 'totalasset', order: 'DESC' }
  },
  highest_dividends: {
    primary: { field: 'dividend_yield', order: 'DESC' },
    secondary: { field: 'dividends_12m', order: 'DESC' }
  },
  most_liquid: {
    primary: { field: 'avgvolume', order: 'DESC' },
    secondary: { field: 'totalasset', order: 'DESC' }
  },
  newest_etfs: {
    primary: { field: 'inception_date', order: 'DESC' },
    secondary: { field: 'totalasset', order: 'DESC' }
  },
  largest_assets: {
    primary: { field: 'totalasset', order: 'DESC' },
    secondary: { field: 'returns_12m', order: 'DESC' }
  },
  best_sharpe: {
    primary: { field: 'sharpe_12m', order: 'DESC' },
    secondary: { field: 'returns_12m', order: 'DESC' }
  },
  lowest_volatility: {
    primary: { field: 'volatility_12m', order: 'ASC' },
    secondary: { field: 'returns_12m', order: 'DESC' }
  },
  best_risk_adjusted: {
    primary: { field: 'sharpe_12m', order: 'DESC' },
    secondary: { field: 'volatility_12m', order: 'ASC' }
  }
};

/**
 * Configurações de presets de filtros
 */
export const FILTER_PRESETS: Record<FilterPreset, FilterPresetConfig> = {
  high_quality: {
    name: 'Alta Qualidade',
    description: 'ETFs com baixas taxas, alta liquidez e histórico estabelecido',
    filters: {
      expenseRatioMax: 0.5, // Máximo 0.5%
      totalAssetsMin: 500, // Mínimo $500M
      etfAgeMinYears: 3, // Mínimo 3 anos
      liquidityRating: 'High',
      onlyComplete: true
    },
    sort: SORT_PRESETS.best_performers_12m
  },
  
  low_cost: {
    name: 'Baixo Custo',
    description: 'ETFs com as menores taxas de administração',
    filters: {
      expenseRatioMax: 0.2, // Máximo 0.2%
      totalAssetsMin: 100, // Mínimo $100M
      onlyComplete: true
    },
    sort: SORT_PRESETS.lowest_fees
  },
  
  dividend_focused: {
    name: 'Foco em Dividendos',
    description: 'ETFs com alto rendimento de dividendos',
    filters: {
      dividendYieldMin: 3.0, // Mínimo 3%
      dividends12mMin: 0.01, // Tem que pagar dividendos
      totalAssetsMin: 100,
      onlyComplete: true
    },
    sort: SORT_PRESETS.highest_dividends
  },
  
  growth_focused: {
    name: 'Foco em Crescimento',
    description: 'ETFs com foco em crescimento e performance',
    filters: {
      returns12mMin: 5.0, // Mínimo 5% no ano
      volatility12mMax: 30.0, // Máximo 30% volatilidade
      assetclass: 'Equity',
      totalAssetsMin: 200,
      onlyComplete: true
    },
    sort: SORT_PRESETS.best_performers_12m
  },
  
  conservative: {
    name: 'Conservador',
    description: 'ETFs de baixo risco com retornos estáveis',
    filters: {
      volatility12mMax: 15.0, // Máximo 15% volatilidade
      maxDrawdownMax: -10.0, // Máximo 10% drawdown
      sharpe12mMin: 0.5, // Mínimo Sharpe 0.5
      totalAssetsMin: 200,
      onlyComplete: true
    },
    sort: SORT_PRESETS.lowest_volatility
  },
  
  aggressive: {
    name: 'Agressivo',
    description: 'ETFs de alto potencial com maior risco',
    filters: {
      returns12mMin: 10.0, // Mínimo 10% retorno
      volatility12mMin: 20.0, // Mínimo 20% volatilidade (busca volatilidade)
      assetclass: 'Equity',
      totalAssetsMin: 100,
      onlyComplete: true
    },
    sort: SORT_PRESETS.best_performers_12m
  },
  
  large_cap_only: {
    name: 'Large Cap',
    description: 'Apenas ETFs de empresas de grande porte',
    filters: {
      sizeCategory: 'Large',
      totalAssetsMin: 500,
      liquidityCategory: 'High',
      onlyComplete: true
    },
    sort: SORT_PRESETS.largest_assets
  },
  
  established_etfs: {
    name: 'ETFs Estabelecidos',
    description: 'ETFs com histórico longo e comprovado',
    filters: {
      etfAgeMinYears: 5, // Mínimo 5 anos
      totalAssetsMin: 1000, // Mínimo $1B
      liquidityCategory: 'High',
      onlyComplete: true
    },
    sort: SORT_PRESETS.best_performers_5y
  },
  
  high_liquidity: {
    name: 'Alta Liquidez',
    description: 'ETFs com alta liquidez e volume de negociação',
    filters: {
      liquidityCategory: 'High',
      liquidityRating: 'A',
      volumeMin: 100000, // Volume mínimo diário
      totalAssetsMin: 200,
      onlyComplete: true
    },
    sort: SORT_PRESETS.most_liquid
  },
  
  us_domiciled: {
    name: 'Domiciliados nos EUA',
    description: 'Apenas ETFs domiciliados nos Estados Unidos',
    filters: {
      domicile: 'US',
      navcurrency: 'USD',
      totalAssetsMin: 100,
      onlyComplete: true
    },
    sort: SORT_PRESETS.largest_assets
  }
};

/**
 * Configurações de filtros de qualidade combinados
 */
export const QUALITY_FILTER_CONFIGS = {
  highQualityOnly: {
    expenseRatioMax: 0.5,
    totalAssetsMin: 500,
    etfAgeMinYears: 3,
    liquidityRating: 'High',
    onlyComplete: true
  },
  
  lowCostOnly: {
    expenseRatioMax: 0.2,
    totalAssetsMin: 100,
    onlyComplete: true
  },
  
  highLiquidityOnly: {
    liquidityCategory: 'High',
    volumeMin: 50000,
    totalAssetsMin: 200,
    onlyComplete: true
  },
  
  establishedOnly: {
    etfAgeMinYears: 5,
    totalAssetsMin: 1000,
    onlyComplete: true
  }
};

/**
 * Mapeamento de labels para os presets de ordenação
 */
export const SORT_PRESET_LABELS: Record<SortPreset, string> = {
  best_performers_12m: 'Melhores Performance 12m',
  best_performers_5y: 'Melhores Performance 5 anos',
  lowest_fees: 'Menores Taxas',
  highest_dividends: 'Maiores Dividendos',
  most_liquid: 'Mais Líquidos',
  newest_etfs: 'Mais Novos',
  largest_assets: 'Maiores Patrimônios',
  best_sharpe: 'Melhor Sharpe Ratio',
  lowest_volatility: 'Menor Volatilidade',
  best_risk_adjusted: 'Melhor Risco-Retorno'
};

/**
 * Mapeamento de labels para campos de ordenação
 */
export const SORT_FIELD_LABELS: Record<string, string> = {
  symbol: 'Símbolo',
  name: 'Nome',
  assetclass: 'Classe de Ativo',
  etfcompany: 'Gestora',
  totalasset: 'Patrimônio',
  nav: 'Preço (NAV)',
  volume: 'Volume',
  avgvolume: 'Volume Médio',
  expense_ratio: 'Taxa',
  holdings_count: 'Nº Holdings',
  returns_12m: 'Retorno 12m',
  returns_24m: 'Retorno 24m',
  returns_36m: 'Retorno 36m',
  returns_5y: 'Retorno 5a',
  ten_year_return: 'Retorno 10a',
  volatility_12m: 'Volatilidade 12m',
  volatility_24m: 'Volatilidade 24m',
  volatility_36m: 'Volatilidade 36m',
  ten_year_volatility: 'Volatilidade 10a',
  sharpe_12m: 'Sharpe 12m',
  sharpe_24m: 'Sharpe 24m',
  sharpe_36m: 'Sharpe 36m',
  ten_year_sharpe: 'Sharpe 10a',
  max_drawdown: 'Max Drawdown',
  dividend_yield: 'Dividend Yield',
  dividends_12m: 'Dividendos 12m',
  dividends_24m: 'Dividendos 24m',
  dividends_36m: 'Dividendos 36m',
  dividends_all_time: 'Dividendos Total',
  inception_date: 'Data Criação',
  etf_age: 'Idade ETF',
  size_category: 'Categoria Tamanho',
  liquidity_category: 'Categoria Liquidez',
  liquidity_rating: 'Rating Liquidez',
  size_rating: 'Rating Tamanho'
};

/**
 * Função para aplicar preset de filtro
 */
export function applyFilterPreset(preset: FilterPreset): FilterPresetConfig {
  return FILTER_PRESETS[preset];
}

/**
 * Função para aplicar preset de ordenação
 */
export function applySortPreset(preset: SortPreset): SortConfig {
  return SORT_PRESETS[preset];
}

/**
 * Função para obter configuração de filtro de qualidade
 */
export function getQualityFilterConfig(qualityType: keyof typeof QUALITY_FILTER_CONFIGS) {
  return QUALITY_FILTER_CONFIGS[qualityType];
} 