-- Script SQL para criar tabelas do Stocks Wealth AI
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Tabela principal de planos de portfólio de ações
CREATE TABLE public.stock_portfolio_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    objective VARCHAR(50) NOT NULL,
    risk_profile VARCHAR(20) NOT NULL,
    base_currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_portfolio_plans_user ON public.stock_portfolio_plans(user_id);

-- 2. Tabela de versões dos planos
CREATE TABLE public.stock_portfolio_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.stock_portfolio_plans(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_portfolio_versions_plan ON public.stock_portfolio_versions(plan_id);
CREATE UNIQUE INDEX idx_stock_portfolio_versions_unique ON public.stock_portfolio_versions(plan_id, version_number);

-- 3. Tabela de alocações
CREATE TABLE public.stock_portfolio_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES public.stock_portfolio_versions(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    allocation_percentage DECIMAL(5,2) NOT NULL,
    target_amount DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_portfolio_allocations_version ON public.stock_portfolio_allocations(version_id);
CREATE INDEX idx_stock_portfolio_allocations_symbol ON public.stock_portfolio_allocations(stock_symbol);

-- 4. Tabela de trades
CREATE TABLE public.stock_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.stock_portfolio_plans(id) ON DELETE CASCADE,
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

CREATE INDEX idx_stock_trades_plan ON public.stock_trades(plan_id);
CREATE INDEX idx_stock_trades_user ON public.stock_trades(user_id);
CREATE INDEX idx_stock_trades_symbol ON public.stock_trades(stock_symbol);
CREATE INDEX idx_stock_trades_date ON public.stock_trades(trade_date);

-- 5. Tabela de timeline de eventos
CREATE TABLE public.stock_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.stock_portfolio_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL,
    event_date TIMESTAMPTZ DEFAULT NOW(),
    stock_symbol VARCHAR(10),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_timeline_events_plan ON public.stock_timeline_events(plan_id);
CREATE INDEX idx_stock_timeline_events_user ON public.stock_timeline_events(user_id);
CREATE INDEX idx_stock_timeline_events_type ON public.stock_timeline_events(event_type);
CREATE INDEX idx_stock_timeline_events_date ON public.stock_timeline_events(event_date);

-- Comentários
COMMENT ON TABLE public.stock_portfolio_plans IS 'Planos de portfólio de ações dos usuários';
COMMENT ON TABLE public.stock_portfolio_versions IS 'Versões dos planos de portfólio';
COMMENT ON TABLE public.stock_portfolio_allocations IS 'Alocações alvo para cada ação';
COMMENT ON TABLE public.stock_trades IS 'Registro de negociações de ações';
COMMENT ON TABLE public.stock_timeline_events IS 'Timeline de eventos do portfólio';



