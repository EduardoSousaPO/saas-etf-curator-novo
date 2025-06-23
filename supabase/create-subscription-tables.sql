-- Criação das tabelas para sistema de assinaturas ETF Curator
-- Executar no SQL Editor do Supabase

-- Enums para sistema de assinaturas
CREATE TYPE subscription_plan AS ENUM ('STARTER', 'PRO', 'WEALTH', 'OFFSHORE');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING', 'TRIAL');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('MERCADO_PAGO', 'CREDIT_CARD', 'PIX', 'BANK_TRANSFER');

-- Tabela de assinaturas
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL,
    status subscription_status DEFAULT 'PENDING',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    
    -- Campos específicos para planos Wealth e Offshore
    assets_under_management DECIMAL(15, 2), -- Para cálculo do fee
    annual_fee DECIMAL(10, 2), -- Fee calculado anualmente
    monthly_fee DECIMAL(10, 2), -- Fee dividido por 12
    
    -- Metadados
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Tabela de pagamentos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados do pagamento
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status payment_status DEFAULT 'PENDING',
    method payment_method,
    
    -- Dados do período
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Integração com Mercado Pago
    external_payment_id VARCHAR(255) UNIQUE, -- ID do Mercado Pago
    external_data JSONB, -- Dados completos da resposta do MP
    
    -- Metadados
    description TEXT,
    metadata JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para payments
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_external_payment_id ON payments(external_payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Tabela de limites de uso
CREATE TABLE usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Limites por funcionalidade
    screener_queries_limit INTEGER, -- Limite de consultas no screener por dia
    screener_queries_used INTEGER DEFAULT 0,
    
    export_reports_limit INTEGER, -- Limite de relatórios exportados por mês
    export_reports_used INTEGER DEFAULT 0,
    
    portfolio_simulations_limit INTEGER, -- Limite de simulações por dia
    portfolio_simulations_used INTEGER DEFAULT 0,
    
    -- Controle de período
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(subscription_id, period_start)
);

-- Índices para usage_limits
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX idx_usage_limits_period ON usage_limits(period_start, period_end);

-- Tabela de features dos planos
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan subscription_plan NOT NULL,
    feature_key VARCHAR(100) NOT NULL, -- Ex: "screener_advanced", "dashboard_widgets"
    feature_name VARCHAR(255) NOT NULL,
    feature_description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    limit_value INTEGER, -- Valor numérico do limite (se aplicável)
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(plan, feature_key)
);

-- Índices para plan_features
CREATE INDEX idx_plan_features_plan ON plan_features(plan);
CREATE INDEX idx_plan_features_feature_key ON plan_features(feature_key);

-- Tabela de onboarding Wealth
CREATE TABLE wealth_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Status do processo
    status VARCHAR(50) DEFAULT 'INITIAL', -- INITIAL, DIAGNOSIS_SCHEDULED, DIAGNOSIS_COMPLETED, PRESENTATION_SCHEDULED, APPROVED, REJECTED
    
    -- Dados do diagnóstico
    current_portfolio_value DECIMAL(15, 2),
    investment_goals JSONB, -- Objetivos estruturados
    risk_tolerance VARCHAR(50),
    investment_experience VARCHAR(50),
    
    -- Agendamentos
    diagnosis_scheduled_at TIMESTAMPTZ,
    presentation_scheduled_at TIMESTAMPTZ,
    
    -- Notas do consultor
    consultant_notes JSONB,
    approval_reason TEXT,
    rejection_reason TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para wealth_onboarding
CREATE INDEX idx_wealth_onboarding_status ON wealth_onboarding(status);
CREATE INDEX idx_wealth_onboarding_created_at ON wealth_onboarding(created_at);

-- Tabela de onboarding Offshore
CREATE TABLE offshore_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Status do processo
    status VARCHAR(50) DEFAULT 'INITIAL', -- INITIAL, DIAGNOSIS_SCHEDULED, DUE_DILIGENCE, STRUCTURE_PLANNED, APPROVED, REJECTED
    
    -- Dados do diagnóstico offshore
    total_assets DECIMAL(15, 2),
    offshore_goals JSONB, -- Objetivos de estruturação
    tax_residency VARCHAR(100),
    business_activities JSONB,
    
    -- Due diligence
    compliance_check JSONB,
    documentation_status JSONB,
    
    -- Estruturação
    recommended_structure JSONB,
    estimated_costs DECIMAL(10, 2),
    
    -- Agendamentos
    diagnosis_scheduled_at TIMESTAMPTZ,
    structure_meeting_at TIMESTAMPTZ,
    
    -- Notas do consultor
    consultant_notes JSONB,
    approval_reason TEXT,
    rejection_reason TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para offshore_onboarding
CREATE INDEX idx_offshore_onboarding_status ON offshore_onboarding(status);
CREATE INDEX idx_offshore_onboarding_created_at ON offshore_onboarding(created_at);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_limits_updated_at BEFORE UPDATE ON usage_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_features_updated_at BEFORE UPDATE ON plan_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wealth_onboarding_updated_at BEFORE UPDATE ON wealth_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offshore_onboarding_updated_at BEFORE UPDATE ON offshore_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Permitir que usuários vejam apenas seus próprios dados
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE offshore_onboarding ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para usage_limits
CREATE POLICY "Users can view own usage limits" ON usage_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage limits" ON usage_limits FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para wealth_onboarding
CREATE POLICY "Users can view own wealth onboarding" ON wealth_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wealth onboarding" ON wealth_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wealth onboarding" ON wealth_onboarding FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para offshore_onboarding
CREATE POLICY "Users can view own offshore onboarding" ON offshore_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own offshore onboarding" ON offshore_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own offshore onboarding" ON offshore_onboarding FOR UPDATE USING (auth.uid() = user_id);

-- Plan features é público para leitura
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plan features" ON plan_features FOR SELECT USING (true); 