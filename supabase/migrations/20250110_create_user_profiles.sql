-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  full_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  birth_date DATE,
  country VARCHAR(50),
  
  -- Perfil de investidor (migrar do localStorage)
  investor_profile JSONB,
  risk_tolerance INTEGER CHECK (risk_tolerance >= 1 AND risk_tolerance <= 10),
  investment_experience VARCHAR(50) CHECK (investment_experience IN ('iniciante', 'intermediario', 'avancado')),
  monthly_investment DECIMAL(12,2),
  total_patrimony DECIMAL(15,2),
  
  -- Preferências
  preferred_language VARCHAR(10) DEFAULT 'pt-BR',
  email_notifications BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_user_profiles_risk_tolerance ON user_profiles(risk_tolerance);
CREATE INDEX IF NOT EXISTS idx_user_profiles_investment_experience ON user_profiles(investment_experience);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver/editar seu próprio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Perfis completos dos usuários do ETF Curator';
COMMENT ON COLUMN user_profiles.investor_profile IS 'Dados do perfil de investidor em formato JSON';
COMMENT ON COLUMN user_profiles.risk_tolerance IS 'Tolerância ao risco de 1 (conservador) a 10 (agressivo)';
COMMENT ON COLUMN user_profiles.investment_experience IS 'Nível de experiência: iniciante, intermediario, avancado';
COMMENT ON COLUMN user_profiles.monthly_investment IS 'Valor mensal disponível para investimento';
COMMENT ON COLUMN user_profiles.total_patrimony IS 'Patrimônio total declarado'; 