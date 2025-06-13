-- Criar tabela de rankings pré-calculados
CREATE TABLE IF NOT EXISTS etf_rankings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    rank_position INTEGER NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    value DECIMAL,
    percentage_value DECIMAL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT unique_category_rank UNIQUE (category, rank_position),
    CONSTRAINT unique_category_symbol UNIQUE (category, symbol)
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_etf_rankings_category ON etf_rankings(category);
CREATE INDEX IF NOT EXISTS idx_etf_rankings_symbol ON etf_rankings(symbol);
CREATE INDEX IF NOT EXISTS idx_etf_rankings_updated_at ON etf_rankings(updated_at);

-- Comentários para documentação
COMMENT ON TABLE etf_rankings IS 'Tabela de rankings pré-calculados para ETFs por categoria';
COMMENT ON COLUMN etf_rankings.category IS 'Categoria do ranking (ex: top_returns_12m, top_sharpe_12m)';
COMMENT ON COLUMN etf_rankings.rank_position IS 'Posição no ranking (1 = primeiro lugar)';
COMMENT ON COLUMN etf_rankings.symbol IS 'Símbolo do ETF';
COMMENT ON COLUMN etf_rankings.value IS 'Valor bruto da métrica';
COMMENT ON COLUMN etf_rankings.percentage_value IS 'Valor em percentual quando aplicável'; 