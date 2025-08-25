-- Criação das tabelas necessárias para o Stocks Wealth AI
-- Baseado nas tabelas de ETFs existentes, adaptadas para stocks

-- Tabela principal de planos de portfólio de ações
CREATE TABLE IF NOT EXISTS stock_portfolio_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    objective VARCHAR(50) NOT NULL,
    risk_profile VARCHAR(20) NOT NULL,
    base_currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stock_portfolio_plans
CREATE INDEX IF NOT EXISTS idx_stock_portfolio_plans_user ON stock_portfolio_plans(user_id);

-- Tabela de versões dos planos de portfólio de ações
CREATE TABLE IF NOT EXISTS stock_portfolio_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES stock_portfolio_plans(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stock_portfolio_versions
CREATE INDEX IF NOT EXISTS idx_stock_portfolio_versions_plan ON stock_portfolio_versions(plan_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_portfolio_versions_unique ON stock_portfolio_versions(plan_id, version_number);

-- Tabela de alocações alvo para cada versão do plano
CREATE TABLE IF NOT EXISTS stock_portfolio_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES stock_portfolio_versions(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    allocation_percentage DECIMAL(5,2) NOT NULL,
    target_amount DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stock_portfolio_allocations
CREATE INDEX IF NOT EXISTS idx_stock_portfolio_allocations_version ON stock_portfolio_allocations(version_id);
CREATE INDEX IF NOT EXISTS idx_stock_portfolio_allocations_symbol ON stock_portfolio_allocations(stock_symbol);

-- Tabela de trades/negociações de ações
CREATE TABLE IF NOT EXISTS stock_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES stock_portfolio_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    trade_type VARCHAR(4) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    quantity DECIMAL(15,6) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    trade_date DATE NOT NULL,
    broker VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stock_trades
CREATE INDEX IF NOT EXISTS idx_stock_trades_plan ON stock_trades(plan_id);
CREATE INDEX IF NOT EXISTS idx_stock_trades_user ON stock_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_trades_symbol ON stock_trades(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_stock_trades_date ON stock_trades(trade_date);

-- Tabela de eventos da timeline do portfólio
CREATE TABLE IF NOT EXISTS stock_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES stock_portfolio_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL,
    event_date TIMESTAMPTZ DEFAULT NOW(),
    stock_symbol VARCHAR(10),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stock_timeline_events
CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_plan ON stock_timeline_events(plan_id);
CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_user ON stock_timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_type ON stock_timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_date ON stock_timeline_events(event_date);

-- Comentários nas tabelas
COMMENT ON TABLE stock_portfolio_plans IS 'Planos de portfólio de ações dos usuários';
COMMENT ON TABLE stock_portfolio_versions IS 'Versões dos planos de portfólio, permitindo histórico de mudanças';
COMMENT ON TABLE stock_portfolio_allocations IS 'Alocações alvo para cada ação em uma versão específica do plano';
COMMENT ON TABLE stock_trades IS 'Registro de todas as negociações de ações realizadas';
COMMENT ON TABLE stock_timeline_events IS 'Timeline de eventos do portfólio (trades, rebalanceamentos, etc.)';



