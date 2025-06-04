export const ETF_CATEGORIES = {
  // Ações por Setor
  EQUITY_TECHNOLOGY: 'Ações: Tecnologia',
  EQUITY_FINANCIALS: 'Ações: Financeiro',
  EQUITY_HEALTHCARE: 'Ações: Saúde',
  EQUITY_CONSUMER_DISCRETIONARY: 'Ações: Consumo Discricionário',
  EQUITY_CONSUMER_STAPLES: 'Ações: Consumo Básico',
  EQUITY_INDUSTRIALS: 'Ações: Industrial',
  EQUITY_ENERGY: 'Ações: Energia',
  EQUITY_MATERIALS: 'Ações: Materiais Básicos',
  EQUITY_REAL_ESTATE: 'Ações: Imobiliário (REITs de Ações)',
  EQUITY_UTILITIES: 'Ações: Utilidades',
  EQUITY_COMMUNICATION_SERVICES: 'Ações: Serviços de Comunicação',
  
  // Ações por Região/Estilo (exemplos, pode expandir)
  EQUITY_GLOBAL: 'Ações: Global',
  EQUITY_US_LARGE_CAP: 'Ações: EUA Large Cap',
  EQUITY_US_SMALL_CAP: 'Ações: EUA Small Cap',
  EQUITY_EMERGING_MARKETS: 'Ações: Mercados Emergentes',
  EQUITY_DEVELOPED_MARKETS: 'Ações: Mercados Desenvolvidos',
  EQUITY_FACTOR_MOMENTUM: 'Ações: Fator Momentum',
  EQUITY_FACTOR_VALUE: 'Ações: Fator Value',
  EQUITY_FACTOR_GROWTH: 'Ações: Fator Growth',
  EQUITY_FACTOR_QUALITY: 'Ações: Fator Qualidade',
  EQUITY_FACTOR_LOW_VOLATILITY: 'Ações: Fator Baixa Volatilidade',
  EQUITY_DIVIDEND: 'Ações: Dividendos',

  // Renda Fixa
  FIXED_INCOME_GOVERNMENT_TREASURY: 'Renda Fixa: Tesouro/Governo',
  FIXED_INCOME_CORPORATE: 'Renda Fixa: Corporativo',
  FIXED_INCOME_MUNICIPAL: 'Renda Fixa: Municipal',
  FIXED_INCOME_HIGH_YIELD: 'Renda Fixa: High Yield',
  FIXED_INCOME_AGGREGATE: 'Renda Fixa: Agregado/Amplo',
  FIXED_INCOME_SHORT_TERM: 'Renda Fixa: Curto Prazo',
  FIXED_INCOME_INTERMEDIATE_TERM: 'Renda Fixa: Médio Prazo',
  FIXED_INCOME_LONG_TERM: 'Renda Fixa: Longo Prazo',
  FIXED_INCOME_TIPS: 'Renda Fixa: TIPS (Protegido da Inflação)',
  FIXED_INCOME_GLOBAL: 'Renda Fixa: Global',

  // Commodities
  COMMODITIES_GOLD: 'Commodities: Ouro',
  COMMODITIES_SILVER: 'Commodities: Prata',
  COMMODITIES_OIL: 'Commodities: Petróleo',
  COMMODITIES_AGRICULTURAL: 'Commodities: Agrícola',
  COMMODITIES_BROAD: 'Commodities: Amplo',

  // Moedas
  CURRENCY: 'Moedas',

  // Alternativos e Estratégias
  PREFERRED_STOCK: 'Alternativos: Ações Preferenciais',
  BDC: 'Alternativos: BDC (Business Development Co.)',
  CLO: 'Alternativos: CLO (Collateralized Loan Obligation)',
  OPTIONS_STRATEGY: 'Alternativos: Estratégias com Opções', // Covered Call, etc.
  VOLATILITY_PRODUCTS: 'Alternativos: Produtos de Volatilidade',
  LEVERAGED_INVERSE: 'Alternativos: Alavancado/Inverso',
  MULTI_ASSET_ALLOCATION: 'Alternativos: Multi-Ativos/Alocação',
  
  // Outros
  OTHER: 'Outros',
} as const;

export type EtfCategoryValue = typeof ETF_CATEGORIES[keyof typeof ETF_CATEGORIES]; 