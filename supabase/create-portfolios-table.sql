-- Script para criar tabelas de portfolios
-- Execute no SQL Editor do Supabase

-- Criar tabela de portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT portfolios_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT portfolios_user_name_unique UNIQUE (user_id, name)
);

-- Criar tabela de holdings dos portfolios
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    etf_symbol VARCHAR(10) NOT NULL,
    shares DECIMAL(15,4) NOT NULL,
    average_cost DECIMAL(15,4) NOT NULL,
    current_price DECIMAL(15,4) DEFAULT 100.00,
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT portfolio_holdings_shares_positive CHECK (shares > 0),
    CONSTRAINT portfolio_holdings_cost_positive CHECK (average_cost > 0),
    CONSTRAINT portfolio_holdings_price_positive CHECK (current_price > 0),
    CONSTRAINT portfolio_holdings_unique UNIQUE (portfolio_id, etf_symbol, purchase_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON public.portfolios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON public.portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_etf_symbol ON public.portfolio_holdings(etf_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_purchase_date ON public.portfolio_holdings(purchase_date DESC);

-- RLS (Row Level Security)
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Políticas para portfolios
CREATE POLICY "Users can view own portfolios" ON public.portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolios" ON public.portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON public.portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON public.portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para holdings
CREATE POLICY "Users can view own portfolio holdings" ON public.portfolio_holdings
    FOR SELECT USING (
        portfolio_id IN (
            SELECT id FROM public.portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create holdings in own portfolios" ON public.portfolio_holdings
    FOR INSERT WITH CHECK (
        portfolio_id IN (
            SELECT id FROM public.portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update holdings in own portfolios" ON public.portfolio_holdings
    FOR UPDATE USING (
        portfolio_id IN (
            SELECT id FROM public.portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete holdings in own portfolios" ON public.portfolio_holdings
    FOR DELETE USING (
        portfolio_id IN (
            SELECT id FROM public.portfolios WHERE user_id = auth.uid()
        )
    );

-- Triggers para atualizar updated_at
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at
    BEFORE UPDATE ON public.portfolio_holdings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar portfolio quando holdings mudam
CREATE OR REPLACE FUNCTION public.update_portfolio_on_holdings_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar updated_at do portfolio quando holdings mudam
    UPDATE public.portfolios 
    SET updated_at = NOW() 
    WHERE id = COALESCE(NEW.portfolio_id, OLD.portfolio_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolio_on_holdings_change
    AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_holdings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_portfolio_on_holdings_change();

-- View para estatísticas dos portfolios
CREATE OR REPLACE VIEW public.portfolio_stats AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.description,
    p.created_at,
    p.updated_at,
    COALESCE(stats.total_holdings, 0) as total_holdings,
    COALESCE(stats.total_value, 0) as total_value,
    COALESCE(stats.total_cost, 0) as total_cost,
    COALESCE(stats.total_return, 0) as total_return,
    CASE 
        WHEN stats.total_cost > 0 
        THEN ROUND((stats.total_return / stats.total_cost * 100)::numeric, 2)
        ELSE 0 
    END as return_percentage
FROM public.portfolios p
LEFT JOIN (
    SELECT 
        portfolio_id,
        COUNT(*) as total_holdings,
        SUM(shares * current_price) as total_value,
        SUM(shares * average_cost) as total_cost,
        SUM((current_price - average_cost) * shares) as total_return
    FROM public.portfolio_holdings
    GROUP BY portfolio_id
) stats ON p.id = stats.portfolio_id;

-- Função para buscar portfolios com estatísticas
CREATE OR REPLACE FUNCTION public.get_user_portfolios(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    total_holdings BIGINT,
    total_value NUMERIC,
    total_cost NUMERIC,
    total_return NUMERIC,
    return_percentage NUMERIC,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.name,
        ps.description,
        ps.total_holdings,
        ps.total_value,
        ps.total_cost,
        ps.total_return,
        ps.return_percentage,
        ps.created_at,
        ps.updated_at
    FROM public.portfolio_stats ps
    WHERE ps.user_id = user_uuid
    ORDER BY ps.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir dados de exemplo (opcional)
-- Comentar se não quiser dados de exemplo
/*
INSERT INTO public.portfolios (user_id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Meu Portfolio Principal', 'Portfolio diversificado com ETFs de baixo custo'),
    ('00000000-0000-0000-0000-000000000000', 'Portfolio Conservador', 'Foco em dividendos e baixa volatilidade');

INSERT INTO public.portfolio_holdings (portfolio_id, etf_symbol, shares, average_cost, current_price) VALUES
    ((SELECT id FROM public.portfolios WHERE name = 'Meu Portfolio Principal' LIMIT 1), 'SPY', 10, 450.00, 465.20),
    ((SELECT id FROM public.portfolios WHERE name = 'Meu Portfolio Principal' LIMIT 1), 'QQQ', 5, 380.00, 395.50),
    ((SELECT id FROM public.portfolios WHERE name = 'Portfolio Conservador' LIMIT 1), 'VYM', 15, 110.00, 112.30);
*/

-- Verificar se foi criado com sucesso
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('portfolios', 'portfolio_holdings')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position; 