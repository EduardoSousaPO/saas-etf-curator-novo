/**
 * CONFIGURAÇÃO PRINCIPAL DO PIPELINE DE ETFs
 * 
 * Este arquivo centraliza todas as configurações do pipeline automatizado
 * para coleta e processamento de dados de ETFs dos EUA.
 */

// Configurações do banco de dados
export const DATABASE_CONFIG = {
  // ID do projeto Supabase (será obtido via MCP)
  projectId: 'nniabnjuwzeqmflrruga',
  
  // Nome da tabela principal
  tableName: 'etfs_ativos_reais',
  
  // Timeout para operações de banco (em ms)
  dbTimeout: 30000
};

// Configurações do processamento
export const PROCESSING_CONFIG = {
  // Tamanho do batch para processamento paralelo
  batchSize: 20,
  
  // Delay entre batches (em ms) para evitar rate limiting
  batchDelay: 2000,
  
  // Número máximo de tentativas por ETF
  maxRetries: 3,
  
  // Timeout para cada coleta individual (em ms)
  collectionTimeout: 15000,
  
  // Delay entre tentativas (em ms)
  retryDelay: 1000
};

// Configurações das fontes de dados
export const DATA_SOURCES = {
  // Configuração do yfinance
  yfinance: {
    enabled: true,
    timeout: 10000,
    baseUrl: 'https://query1.finance.yahoo.com/v1/finance/lookup'
  },
  
  // Configuração do Firecrawl para fallback
  firecrawl: {
    enabled: true,
    timeout: 15000,
    sites: [
      'https://etfdb.com/etf/',
      'https://www.morningstar.com/etfs/',
      'https://www.etf.com/'
    ]
  },
  
  // Configuração de web search
  webSearch: {
    enabled: true,
    timeout: 10000,
    maxResults: 5
  }
};

// Configurações de logging
export const LOGGING_CONFIG = {
  // Nível de log (debug, info, warn, error)
  level: 'info',
  
  // Salvar logs em arquivo
  saveToFile: true,
  
  // Pasta para logs
  logDir: './logs',
  
  // Formato de timestamp
  timestampFormat: 'YYYY-MM-DD HH:mm:ss'
};

// Configurações do sistema de memória
export const MEMORY_CONFIG = {
  // Usar MCP Memory para persistir estado
  enabled: true,
  
  // Salvar progresso a cada N ETFs processados
  saveInterval: 50,
  
  // Chave base para armazenamento
  memoryKey: 'etf_pipeline_state'
};

// Schema da tabela de ETFs ativos
export const ETF_TABLE_SCHEMA = {
  // Campos básicos de identificação
  symbol: 'VARCHAR(10) PRIMARY KEY',
  name: 'TEXT',
  description: 'TEXT',
  isin: 'VARCHAR(12)',
  assetclass: 'VARCHAR(50)',
  securitycusip: 'VARCHAR(9)',
  
  // Informações da empresa gestora
  domicile: 'VARCHAR(2)',
  website: 'TEXT',
  etfcompany: 'VARCHAR(100)',
  
  // Métricas financeiras básicas
  expenseratio: 'DECIMAL(5,4)',
  totalasset: 'BIGINT',
  avgvolume: 'BIGINT',
  inceptiondate: 'DATE',
  nav: 'DECIMAL(10,4)',
  navcurrency: 'VARCHAR(3)',
  holdingscount: 'INTEGER',
  updatedat: 'TIMESTAMP DEFAULT NOW()',
  
  // Setores e composição
  sectorslist: 'JSONB',
  
  // Retornos históricos
  returns_12m: 'DECIMAL(8,4)',
  returns_24m: 'DECIMAL(8,4)',
  returns_36m: 'DECIMAL(8,4)',
  returns_5y: 'DECIMAL(8,4)',
  ten_year_return: 'DECIMAL(8,4)',
  
  // Volatilidade
  volatility_12m: 'DECIMAL(8,4)',
  volatility_24m: 'DECIMAL(8,4)',
  volatility_36m: 'DECIMAL(8,4)',
  ten_year_volatility: 'DECIMAL(8,4)',
  
  // Índice de Sharpe
  sharpe_12m: 'DECIMAL(8,4)',
  sharpe_24m: 'DECIMAL(8,4)',
  sharpe_36m: 'DECIMAL(8,4)',
  ten_year_sharpe: 'DECIMAL(8,4)',
  
  // Métricas de risco
  max_drawdown: 'DECIMAL(8,4)',
  
  // Dividendos
  dividends_12m: 'DECIMAL(8,4)',
  dividends_24m: 'DECIMAL(8,4)',
  dividends_36m: 'DECIMAL(8,4)',
  dividends_all_time: 'DECIMAL(8,4)',
  
  // Categorização
  size_category: 'VARCHAR(20)',
  liquidity_category: 'VARCHAR(20)',
  etf_type: 'VARCHAR(50)'
};

// Mapeamento de campos do yfinance para nossa tabela
export const YFINANCE_FIELD_MAPPING = {
  'symbol': 'symbol',
  'longName': 'name',
  'longBusinessSummary': 'description',
  'isin': 'isin',
  'category': 'assetclass',
  'domicile': 'domicile',
  'website': 'website',
  'fundFamily': 'etfcompany',
  'annualReportExpenseRatio': 'expenseratio',
  'totalAssets': 'totalasset',
  'averageVolume': 'avgvolume',
  'fundInceptionDate': 'inceptiondate',
  'navPrice': 'nav',
  'currency': 'navcurrency',
  'holdingsCount': 'holdingscount'
};

// URLs para scraping de fallback por site
export const FALLBACK_URLS = {
  etfdb: (symbol) => `https://etfdb.com/etf/${symbol}/`,
  morningstar: (symbol) => `https://www.morningstar.com/etfs/${symbol}`,
  etfdotcom: (symbol) => `https://www.etf.com/${symbol}`
};

// Campos obrigatórios para considerar um ETF como válido
export const REQUIRED_FIELDS = [
  'symbol',
  'name'
];

// Campos opcionais com alta prioridade
export const HIGH_PRIORITY_FIELDS = [
  'expenseratio',
  'totalasset',
  'avgvolume',
  'nav',
  'returns_12m',
  'volatility_12m'
];

export default {
  DATABASE_CONFIG,
  PROCESSING_CONFIG,
  DATA_SOURCES,
  LOGGING_CONFIG,
  MEMORY_CONFIG,
  ETF_TABLE_SCHEMA,
  YFINANCE_FIELD_MAPPING,
  FALLBACK_URLS,
  REQUIRED_FIELDS,
  HIGH_PRIORITY_FIELDS
}; 
 * CONFIGURAÇÃO PRINCIPAL DO PIPELINE DE ETFs
 * 
 * Este arquivo centraliza todas as configurações do pipeline automatizado
 * para coleta e processamento de dados de ETFs dos EUA.
 */

// Configurações do banco de dados
export const DATABASE_CONFIG = {
  // ID do projeto Supabase (será obtido via MCP)
  projectId: 'nniabnjuwzeqmflrruga',
  
  // Nome da tabela principal
  tableName: 'etfs_ativos_reais',
  
  // Timeout para operações de banco (em ms)
  dbTimeout: 30000
};

// Configurações do processamento
export const PROCESSING_CONFIG = {
  // Tamanho do batch para processamento paralelo
  batchSize: 20,
  
  // Delay entre batches (em ms) para evitar rate limiting
  batchDelay: 2000,
  
  // Número máximo de tentativas por ETF
  maxRetries: 3,
  
  // Timeout para cada coleta individual (em ms)
  collectionTimeout: 15000,
  
  // Delay entre tentativas (em ms)
  retryDelay: 1000
};

// Configurações das fontes de dados
export const DATA_SOURCES = {
  // Configuração do yfinance
  yfinance: {
    enabled: true,
    timeout: 10000,
    baseUrl: 'https://query1.finance.yahoo.com/v1/finance/lookup'
  },
  
  // Configuração do Firecrawl para fallback
  firecrawl: {
    enabled: true,
    timeout: 15000,
    sites: [
      'https://etfdb.com/etf/',
      'https://www.morningstar.com/etfs/',
      'https://www.etf.com/'
    ]
  },
  
  // Configuração de web search
  webSearch: {
    enabled: true,
    timeout: 10000,
    maxResults: 5
  }
};

// Configurações de logging
export const LOGGING_CONFIG = {
  // Nível de log (debug, info, warn, error)
  level: 'info',
  
  // Salvar logs em arquivo
  saveToFile: true,
  
  // Pasta para logs
  logDir: './logs',
  
  // Formato de timestamp
  timestampFormat: 'YYYY-MM-DD HH:mm:ss'
};

// Configurações do sistema de memória
export const MEMORY_CONFIG = {
  // Usar MCP Memory para persistir estado
  enabled: true,
  
  // Salvar progresso a cada N ETFs processados
  saveInterval: 50,
  
  // Chave base para armazenamento
  memoryKey: 'etf_pipeline_state'
};

// Schema da tabela de ETFs ativos
export const ETF_TABLE_SCHEMA = {
  // Campos básicos de identificação
  symbol: 'VARCHAR(10) PRIMARY KEY',
  name: 'TEXT',
  description: 'TEXT',
  isin: 'VARCHAR(12)',
  assetclass: 'VARCHAR(50)',
  securitycusip: 'VARCHAR(9)',
  
  // Informações da empresa gestora
  domicile: 'VARCHAR(2)',
  website: 'TEXT',
  etfcompany: 'VARCHAR(100)',
  
  // Métricas financeiras básicas
  expenseratio: 'DECIMAL(5,4)',
  totalasset: 'BIGINT',
  avgvolume: 'BIGINT',
  inceptiondate: 'DATE',
  nav: 'DECIMAL(10,4)',
  navcurrency: 'VARCHAR(3)',
  holdingscount: 'INTEGER',
  updatedat: 'TIMESTAMP DEFAULT NOW()',
  
  // Setores e composição
  sectorslist: 'JSONB',
  
  // Retornos históricos
  returns_12m: 'DECIMAL(8,4)',
  returns_24m: 'DECIMAL(8,4)',
  returns_36m: 'DECIMAL(8,4)',
  returns_5y: 'DECIMAL(8,4)',
  ten_year_return: 'DECIMAL(8,4)',
  
  // Volatilidade
  volatility_12m: 'DECIMAL(8,4)',
  volatility_24m: 'DECIMAL(8,4)',
  volatility_36m: 'DECIMAL(8,4)',
  ten_year_volatility: 'DECIMAL(8,4)',
  
  // Índice de Sharpe
  sharpe_12m: 'DECIMAL(8,4)',
  sharpe_24m: 'DECIMAL(8,4)',
  sharpe_36m: 'DECIMAL(8,4)',
  ten_year_sharpe: 'DECIMAL(8,4)',
  
  // Métricas de risco
  max_drawdown: 'DECIMAL(8,4)',
  
  // Dividendos
  dividends_12m: 'DECIMAL(8,4)',
  dividends_24m: 'DECIMAL(8,4)',
  dividends_36m: 'DECIMAL(8,4)',
  dividends_all_time: 'DECIMAL(8,4)',
  
  // Categorização
  size_category: 'VARCHAR(20)',
  liquidity_category: 'VARCHAR(20)',
  etf_type: 'VARCHAR(50)'
};

// Mapeamento de campos do yfinance para nossa tabela
export const YFINANCE_FIELD_MAPPING = {
  'symbol': 'symbol',
  'longName': 'name',
  'longBusinessSummary': 'description',
  'isin': 'isin',
  'category': 'assetclass',
  'domicile': 'domicile',
  'website': 'website',
  'fundFamily': 'etfcompany',
  'annualReportExpenseRatio': 'expenseratio',
  'totalAssets': 'totalasset',
  'averageVolume': 'avgvolume',
  'fundInceptionDate': 'inceptiondate',
  'navPrice': 'nav',
  'currency': 'navcurrency',
  'holdingsCount': 'holdingscount'
};

// URLs para scraping de fallback por site
export const FALLBACK_URLS = {
  etfdb: (symbol) => `https://etfdb.com/etf/${symbol}/`,
  morningstar: (symbol) => `https://www.morningstar.com/etfs/${symbol}`,
  etfdotcom: (symbol) => `https://www.etf.com/${symbol}`
};

// Campos obrigatórios para considerar um ETF como válido
export const REQUIRED_FIELDS = [
  'symbol',
  'name'
];

// Campos opcionais com alta prioridade
export const HIGH_PRIORITY_FIELDS = [
  'expenseratio',
  'totalasset',
  'avgvolume',
  'nav',
  'returns_12m',
  'volatility_12m'
];

export default {
  DATABASE_CONFIG,
  PROCESSING_CONFIG,
  DATA_SOURCES,
  LOGGING_CONFIG,
  MEMORY_CONFIG,
  ETF_TABLE_SCHEMA,
  YFINANCE_FIELD_MAPPING,
  FALLBACK_URLS,
  REQUIRED_FIELDS,
  HIGH_PRIORITY_FIELDS
}; 