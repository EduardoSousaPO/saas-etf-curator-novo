-- Tabela para analytics de uso de filtros
CREATE TABLE IF NOT EXISTS filter_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filters_used TEXT[] NOT NULL,
    total_filters INTEGER NOT NULL DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_filter_analytics_timestamp ON filter_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_filter_analytics_total_filters ON filter_analytics(total_filters);
CREATE INDEX IF NOT EXISTS idx_filter_analytics_filters_used ON filter_analytics USING GIN(filters_used);

-- RLS (Row Level Security) - opcional
ALTER TABLE filter_analytics ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (analytics)
CREATE POLICY "Allow public insert for analytics" ON filter_analytics
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura apenas para admins (opcional)
CREATE POLICY "Allow admin read for analytics" ON filter_analytics
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Comentários
COMMENT ON TABLE filter_analytics IS 'Tabela para rastrear uso de filtros no screener';
COMMENT ON COLUMN filter_analytics.filters_used IS 'Array com nomes dos filtros utilizados';
COMMENT ON COLUMN filter_analytics.total_filters IS 'Número total de filtros ativos';
COMMENT ON COLUMN filter_analytics.timestamp IS 'Timestamp da busca'; 