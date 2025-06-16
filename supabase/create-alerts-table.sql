-- Script para criar tabela de alertas de ETFs
-- Execute no SQL Editor do Supabase

-- Criar enum para tipos de alerta
CREATE TYPE alert_type AS ENUM (
    'price_above',
    'price_below', 
    'return_above',
    'return_below',
    'volume_spike',
    'dividend_announcement'
);

-- Criar tabela de alertas
CREATE TABLE IF NOT EXISTS public.etf_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    etf_symbol VARCHAR(10) NOT NULL,
    alert_type alert_type NOT NULL,
    target_value DECIMAL(15,4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT etf_alerts_target_value_positive CHECK (target_value > 0),
    CONSTRAINT etf_alerts_user_etf_type_unique UNIQUE (user_id, etf_symbol, alert_type, target_value)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_etf_alerts_user_id ON public.etf_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_etf_alerts_etf_symbol ON public.etf_alerts(etf_symbol);
CREATE INDEX IF NOT EXISTS idx_etf_alerts_active ON public.etf_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_etf_alerts_triggered ON public.etf_alerts(is_triggered) WHERE is_triggered = false;
CREATE INDEX IF NOT EXISTS idx_etf_alerts_created_at ON public.etf_alerts(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.etf_alerts ENABLE ROW LEVEL SECURITY;

-- Política para usuarios verem apenas seus próprios alertas
CREATE POLICY "Users can view own alerts" ON public.etf_alerts
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuarios criarem alertas
CREATE POLICY "Users can create own alerts" ON public.etf_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuarios atualizarem seus alertas
CREATE POLICY "Users can update own alerts" ON public.etf_alerts
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuarios deletarem seus alertas
CREATE POLICY "Users can delete own alerts" ON public.etf_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_etf_alerts_updated_at
    BEFORE UPDATE ON public.etf_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns exemplos de alertas (opcional)
-- Comentar se não quiser dados de exemplo
/*
INSERT INTO public.etf_alerts (user_id, etf_symbol, alert_type, target_value) VALUES
    ('00000000-0000-0000-0000-000000000000', 'SPY', 'return_above', 15.0),
    ('00000000-0000-0000-0000-000000000000', 'QQQ', 'volume_spike', 1000000),
    ('00000000-0000-0000-0000-000000000000', 'VTI', 'return_below', -5.0);
*/

-- Verificar se foi criado com sucesso
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'etf_alerts' 
AND table_schema = 'public'
ORDER BY ordinal_position; 