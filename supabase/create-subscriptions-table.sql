-- ==========================================
-- 📋 ETF CURATOR - SISTEMA DE ASSINATURAS
-- ==========================================
-- Versão: 0.3.0
-- Data: 2025-01-18
-- Funcionalidade: Sistema Premium com paywall

-- ===================
-- 1. TABELA DE ASSINATURAS
-- ===================

-- Criando tabela principal de assinaturas
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    external_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id),
    CONSTRAINT user_subscriptions_status_check CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    CONSTRAINT user_subscriptions_plan_id_check CHECK (plan_id IN ('free', 'pro', 'enterprise'))
);

-- ===================
-- 2. TABELA DE HISTÓRICO DE PAGAMENTOS
-- ===================

CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subscription_id UUID,
    plan_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    external_payment_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT payment_history_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    CONSTRAINT payment_history_amount_check CHECK (amount >= 0),
    
    -- Foreign Keys
    CONSTRAINT payment_history_subscription_fk 
        FOREIGN KEY (subscription_id) 
        REFERENCES public.user_subscriptions(id) 
        ON DELETE SET NULL
);

-- ===================
-- 3. TABELA DE LIMITES DE USO
-- ===================

CREATE TABLE IF NOT EXISTS public.user_usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    
    -- Contadores diários
    ai_queries_count INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_usage_tracking_unique UNIQUE (user_id, date),
    CONSTRAINT user_usage_tracking_counts_check CHECK (
        ai_queries_count >= 0 AND 
        api_calls_count >= 0
    )
);

-- ===================
-- 4. ÍNDICES PARA PERFORMANCE
-- ===================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON public.payment_history(payment_date);

CREATE INDEX IF NOT EXISTS idx_user_usage_tracking_user_date ON public.user_usage_tracking(user_id, date);

-- ===================
-- 5. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ===================

-- Trigger para atualizar updated_at na tabela de assinaturas
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON public.user_subscriptions;
CREATE TRIGGER trigger_update_subscription_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subscription_updated_at();

-- Trigger para atualizar updated_at na tabela de usage tracking
CREATE OR REPLACE FUNCTION public.update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_usage_tracking_updated_at ON public.user_usage_tracking;
CREATE TRIGGER trigger_update_usage_tracking_updated_at
    BEFORE UPDATE ON public.user_usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.update_usage_tracking_updated_at();

-- ===================
-- 6. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ===================

-- Habilitar RLS nas tabelas
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas para user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
    ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription"
    ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage all subscriptions"
    ON public.user_subscriptions
    FOR ALL
    USING (true);

-- Políticas para payment_history
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
CREATE POLICY "Users can view own payment history"
    ON public.payment_history
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all payments" ON public.payment_history;
CREATE POLICY "Service role can manage all payments"
    ON public.payment_history
    FOR ALL
    USING (true);

-- Políticas para user_usage_tracking
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage_tracking;
CREATE POLICY "Users can view own usage"
    ON public.user_usage_tracking
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all usage" ON public.user_usage_tracking;
CREATE POLICY "Service role can manage all usage"
    ON public.user_usage_tracking
    FOR ALL
    USING (true);

-- ===================
-- 7. VIEWS ÚTEIS
-- ===================

-- View para estatísticas de assinaturas
CREATE OR REPLACE VIEW public.subscription_stats AS
SELECT 
    plan_id,
    status,
    COUNT(*) as user_count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM public.user_subscriptions
GROUP BY plan_id, status
ORDER BY plan_id, status;

-- View para usuários com assinatura ativa
CREATE OR REPLACE VIEW public.active_subscribers AS
SELECT 
    us.*,
    CASE 
        WHEN us.current_period_end < NOW() THEN 'expired'
        ELSE us.status
    END as computed_status
FROM public.user_subscriptions us
WHERE us.status = 'active';

-- ===================
-- 8. FUNÇÕES ÚTEIS
-- ===================

-- Função para verificar se usuário tem acesso a funcionalidade
CREATE OR REPLACE FUNCTION public.user_has_feature_access(
    user_uuid UUID,
    feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    has_access BOOLEAN := false;
BEGIN
    -- Buscar plano do usuário
    SELECT plan_id INTO user_plan
    FROM public.user_subscriptions
    WHERE user_id = user_uuid AND status = 'active'
    LIMIT 1;
    
    -- Se não tem assinatura, usar plano gratuito
    IF user_plan IS NULL THEN
        user_plan := 'free';
    END IF;
    
    -- Verificar acesso baseado no plano e funcionalidade
    CASE feature_name
        WHEN 'advanced_analytics' THEN
            has_access := user_plan IN ('pro', 'enterprise');
        WHEN 'email_notifications' THEN
            has_access := user_plan IN ('pro', 'enterprise');
        WHEN 'api_access' THEN
            has_access := user_plan = 'enterprise';
        WHEN 'unlimited_alerts' THEN
            has_access := user_plan = 'enterprise';
        WHEN 'unlimited_portfolios' THEN
            has_access := user_plan = 'enterprise';
        ELSE
            has_access := true; -- Funcionalidade básica
    END CASE;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- Função para obter limites do usuário
CREATE OR REPLACE FUNCTION public.get_user_limits(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    user_plan TEXT;
    limits JSON;
BEGIN
    -- Buscar plano do usuário
    SELECT plan_id INTO user_plan
    FROM public.user_subscriptions
    WHERE user_id = user_uuid AND status = 'active'
    LIMIT 1;
    
    -- Se não tem assinatura, usar plano gratuito
    IF user_plan IS NULL THEN
        user_plan := 'free';
    END IF;
    
    -- Retornar limites baseado no plano
    CASE user_plan
        WHEN 'free' THEN
            limits := '{"etf_alerts": 5, "portfolios": 2, "ai_queries_daily": 10}';
        WHEN 'pro' THEN
            limits := '{"etf_alerts": 20, "portfolios": 10, "ai_queries_daily": 100}';
        WHEN 'enterprise' THEN
            limits := '{"etf_alerts": -1, "portfolios": -1, "ai_queries_daily": -1}';
        ELSE
            limits := '{"etf_alerts": 5, "portfolios": 2, "ai_queries_daily": 10}';
    END CASE;
    
    RETURN limits;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- 9. DADOS INICIAIS (OPCIONAL)
-- ===================

-- Inserir alguns dados de exemplo (comentado por padrão)
/*
INSERT INTO public.user_subscriptions (user_id, plan_id, status) VALUES
('00000000-0000-0000-0000-000000000001', 'free', 'active'),
('00000000-0000-0000-0000-000000000002', 'pro', 'active'),
('00000000-0000-0000-0000-000000000003', 'enterprise', 'active')
ON CONFLICT (user_id) DO NOTHING;
*/

-- ===================
-- ✅ SCRIPT CONCLUÍDO
-- ===================

-- Verificar se todas as tabelas foram criadas
SELECT 
    'user_subscriptions' as table_name,
    COUNT(*) as row_count
FROM public.user_subscriptions
UNION ALL
SELECT 
    'payment_history' as table_name,
    COUNT(*) as row_count
FROM public.payment_history
UNION ALL
SELECT 
    'user_usage_tracking' as table_name,
    COUNT(*) as row_count
FROM public.user_usage_tracking;

-- 🎉 Sistema de assinaturas criado com sucesso!
-- 📋 Execute este script no SQL Editor do Supabase
-- 🔧 Tabelas: user_subscriptions, payment_history, user_usage_tracking
-- 🛡️ RLS habilitado para segurança
-- ⚡ Triggers para atualizações automáticas
-- 🔍 Views e funções úteis incluídas 