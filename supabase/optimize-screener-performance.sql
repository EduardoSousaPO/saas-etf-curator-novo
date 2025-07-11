-- Scripts de otimização para performance do screener
-- Execute estes comandos no Supabase SQL Editor para melhorar a performance

-- Índices para filtros financeiros mais usados
CREATE INDEX IF NOT EXISTS idx_etfs_expense_ratio ON etfs_ativos_reais(expense_ratio) WHERE expense_ratio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_totalasset ON etfs_ativos_reais(totalasset) WHERE totalasset IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_nav ON etfs_ativos_reais(nav) WHERE nav IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_avgvolume ON etfs_ativos_reais(avgvolume) WHERE avgvolume IS NOT NULL;

-- Índices para performance (retornos)
CREATE INDEX IF NOT EXISTS idx_etfs_returns_12m ON etfs_ativos_reais(returns_12m) WHERE returns_12m IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_returns_24m ON etfs_ativos_reais(returns_24m) WHERE returns_24m IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_returns_5y ON etfs_ativos_reais(returns_5y) WHERE returns_5y IS NOT NULL;

-- Índices para volatilidade
CREATE INDEX IF NOT EXISTS idx_etfs_volatility_12m ON etfs_ativos_reais(volatility_12m) WHERE volatility_12m IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_volatility_24m ON etfs_ativos_reais(volatility_24m) WHERE volatility_24m IS NOT NULL;

-- Índices para Sharpe Ratio
CREATE INDEX IF NOT EXISTS idx_etfs_sharpe_12m ON etfs_ativos_reais(sharpe_12m) WHERE sharpe_12m IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_sharpe_24m ON etfs_ativos_reais(sharpe_24m) WHERE sharpe_24m IS NOT NULL;

-- Índices para dividendos
CREATE INDEX IF NOT EXISTS idx_etfs_dividend_yield ON etfs_ativos_reais(dividend_yield) WHERE dividend_yield IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_dividends_12m ON etfs_ativos_reais(dividends_12m) WHERE dividends_12m IS NOT NULL;

-- Índices para categorização
CREATE INDEX IF NOT EXISTS idx_etfs_assetclass ON etfs_ativos_reais(assetclass);
CREATE INDEX IF NOT EXISTS idx_etfs_etfcompany ON etfs_ativos_reais(etfcompany);
CREATE INDEX IF NOT EXISTS idx_etfs_domicile ON etfs_ativos_reais(domicile);
CREATE INDEX IF NOT EXISTS idx_etfs_size_category ON etfs_ativos_reais(size_category);
CREATE INDEX IF NOT EXISTS idx_etfs_liquidity_category ON etfs_ativos_reais(liquidity_category);

-- Índices para busca por texto
CREATE INDEX IF NOT EXISTS idx_etfs_symbol_text ON etfs_ativos_reais USING gin(to_tsvector('english', symbol));
CREATE INDEX IF NOT EXISTS idx_etfs_name_text ON etfs_ativos_reais USING gin(to_tsvector('english', name));

-- Índice composto para filtros mais comuns
CREATE INDEX IF NOT EXISTS idx_etfs_common_filters ON etfs_ativos_reais(assetclass, expense_ratio, totalasset) 
WHERE assetclass IS NOT NULL AND expense_ratio IS NOT NULL AND totalasset IS NOT NULL;

-- Índice para data de criação
CREATE INDEX IF NOT EXISTS idx_etfs_inception_date ON etfs_ativos_reais(inception_date) WHERE inception_date IS NOT NULL;

-- Índice para max drawdown
CREATE INDEX IF NOT EXISTS idx_etfs_max_drawdown ON etfs_ativos_reais(max_drawdown) WHERE max_drawdown IS NOT NULL;

-- Atualizar estatísticas das tabelas para otimização do query planner
ANALYZE etfs_ativos_reais; 