-- SCRIPT DE OTIMIZAÇÃO DE PERFORMANCE DO BANCO
-- Aplicar no Supabase para melhorar drasticamente a velocidade

-- 1. ÍNDICES PARA TABELA calculated_metrics_teste
CREATE INDEX IF NOT EXISTS idx_calculated_metrics_returns_12m 
ON calculated_metrics_teste(returns_12m) 
WHERE returns_12m IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calculated_metrics_volatility_12m 
ON calculated_metrics_teste(volatility_12m) 
WHERE volatility_12m IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calculated_metrics_sharpe_12m 
ON calculated_metrics_teste(sharpe_12m) 
WHERE sharpe_12m IS NOT NULL;

-- 2. ÍNDICES PARA TABELA etf_list
CREATE INDEX IF NOT EXISTS idx_etf_list_assetclass 
ON etf_list(assetclass) 
WHERE assetclass IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_etf_list_totalasset 
ON etf_list(totalasset) 
WHERE totalasset IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_etf_list_name_search 
ON etf_list USING gin(to_tsvector('english', name)) 
WHERE name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_etf_list_symbol_search 
ON etf_list USING gin(to_tsvector('english', symbol));

-- 3. ÍNDICE COMPOSTO PARA QUERIES DO SCREENER
CREATE INDEX IF NOT EXISTS idx_etf_list_screener_composite 
ON etf_list(assetclass, totalasset, symbol) 
WHERE name IS NOT NULL AND assetclass IS NOT NULL;

-- 4. ATUALIZAR ESTATÍSTICAS DO BANCO
ANALYZE calculated_metrics_teste;
ANALYZE etf_list; 