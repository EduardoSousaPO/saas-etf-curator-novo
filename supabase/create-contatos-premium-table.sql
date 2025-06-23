-- Tabela para armazenar solicitações de contato dos planos WEALTH e OFFSHORE
CREATE TABLE IF NOT EXISTS contatos_premium (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    
    -- Preferências de contato
    horario_preferido VARCHAR(20), -- 'manha', 'tarde', 'noite'
    melhor_dia VARCHAR(100),
    
    -- Qualificação financeira
    patrimonio_total VARCHAR(50) NOT NULL, -- '200k-500k', '500k-1M', etc.
    renda_mensal VARCHAR(50),
    experiencia_investimentos VARCHAR(20) NOT NULL, -- 'iniciante', 'intermediario', 'avancado'
    
    -- Objetivos
    objetivo_principal TEXT NOT NULL,
    horizonte_tempo VARCHAR(20) NOT NULL, -- '1-2-anos', '3-5-anos', etc.
    
    -- Plano de interesse
    plano_interesse VARCHAR(20) NOT NULL CHECK (plano_interesse IN ('WEALTH', 'OFFSHORE')),
    
    -- Situação atual
    tem_consultor VARCHAR(10), -- 'sim', 'nao'
    principais_investimentos TEXT,
    
    -- Observações
    observacoes TEXT,
    
    -- Status do contato
    status VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO', 'CONTATADO')),
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para busca
    CONSTRAINT unique_email_plano UNIQUE (email, plano_interesse)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contatos_premium_status ON contatos_premium(status);
CREATE INDEX IF NOT EXISTS idx_contatos_premium_plano ON contatos_premium(plano_interesse);
CREATE INDEX IF NOT EXISTS idx_contatos_premium_created_at ON contatos_premium(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contatos_premium_email ON contatos_premium(email);

-- RLS (Row Level Security) Policies
ALTER TABLE contatos_premium ENABLE ROW LEVEL SECURITY;

-- Policy para service role (acesso completo)
CREATE POLICY "service_role_full_access_contatos_premium" ON contatos_premium
    FOR ALL USING (auth.role() = 'service_role');

-- Policy para inserção pública (apenas inserir)
CREATE POLICY "public_insert_contatos_premium" ON contatos_premium
    FOR INSERT WITH CHECK (true);

-- Policy para usuários autenticados verem apenas seus próprios contatos
CREATE POLICY "users_own_contatos_premium" ON contatos_premium
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contatos_premium_updated_at 
    BEFORE UPDATE ON contatos_premium 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE contatos_premium IS 'Tabela para armazenar solicitações de contato dos planos premium WEALTH e OFFSHORE';
COMMENT ON COLUMN contatos_premium.status IS 'Status do processo: PENDENTE, EM_ANALISE, APROVADO, REJEITADO, CONTATADO';
COMMENT ON COLUMN contatos_premium.plano_interesse IS 'Plano de interesse: WEALTH (R$200k+) ou OFFSHORE (R$1M+)';
COMMENT ON COLUMN contatos_premium.patrimonio_total IS 'Faixa de patrimônio total do cliente';
COMMENT ON COLUMN contatos_premium.experiencia_investimentos IS 'Nível de experiência: iniciante, intermediario, avancado'; 