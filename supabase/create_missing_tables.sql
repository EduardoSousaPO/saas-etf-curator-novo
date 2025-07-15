-- ================================================================
-- CRIAÇÃO DAS TABELAS FALTANTES PARA SISTEMA DE TRACKING E REBALANCEAMENTO
-- Execute este arquivo via MCP Supabase
-- ================================================================

-- 1. TABELA: portfolio_allocations
-- Armazena as alocações de ETFs em cada portfólio
CREATE TABLE IF NOT EXISTS portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
  etf_symbol VARCHAR(10) NOT NULL,
  allocation_percentage DECIMAL(5,2) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_portfolio_id ON portfolio_allocations(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_user_id ON portfolio_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_etf_symbol ON portfolio_allocations(etf_symbol);

-- 2. TABELA: rebalance_suggestions
-- Armazena sugestões de rebalanceamento automático
CREATE TABLE IF NOT EXISTS rebalance_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
  etf_symbol VARCHAR(10) NOT NULL,
  current_allocation DECIMAL(5,2) NOT NULL,
  target_allocation DECIMAL(5,2) NOT NULL,
  deviation DECIMAL(5,2) NOT NULL,
  suggested_action VARCHAR(10) NOT NULL CHECK (suggested_action IN ('BUY', 'SELL', 'HOLD')),
  suggested_amount DECIMAL(12,2),
  suggested_shares DECIMAL(12,6),
  priority INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_portfolio_id ON rebalance_suggestions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_user_id ON rebalance_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_status ON rebalance_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_priority ON rebalance_suggestions(priority);

-- 3. FUNÇÕES DE TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- Função para atualizar updated_at na tabela portfolio_allocations
CREATE OR REPLACE FUNCTION update_portfolio_allocations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para portfolio_allocations
DROP TRIGGER IF EXISTS trigger_update_portfolio_allocations_updated_at ON portfolio_allocations;
CREATE TRIGGER trigger_update_portfolio_allocations_updated_at
  BEFORE UPDATE ON portfolio_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_allocations_updated_at();

-- Função para atualizar updated_at na tabela rebalance_suggestions
CREATE OR REPLACE FUNCTION update_rebalance_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para rebalance_suggestions
DROP TRIGGER IF EXISTS trigger_update_rebalance_suggestions_updated_at ON rebalance_suggestions;
CREATE TRIGGER trigger_update_rebalance_suggestions_updated_at
  BEFORE UPDATE ON rebalance_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_rebalance_suggestions_updated_at();

-- 4. FUNÇÃO DE VALIDAÇÃO PARA ALOCAÇÕES
-- Garante que a soma das alocações não exceda 100%
CREATE OR REPLACE FUNCTION check_allocation_sum()
RETURNS TRIGGER AS $$
DECLARE
  total_allocation DECIMAL(5,2);
BEGIN
  SELECT SUM(allocation_percentage) INTO total_allocation
  FROM portfolio_allocations
  WHERE portfolio_id = NEW.portfolio_id;
  
  IF total_allocation > 100.00 THEN
    RAISE EXCEPTION 'Total de alocações não pode exceder 100%% (atual: %)', total_allocation;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validação de alocações
DROP TRIGGER IF EXISTS trigger_check_allocation_sum ON portfolio_allocations;
CREATE TRIGGER trigger_check_allocation_sum
  AFTER INSERT OR UPDATE ON portfolio_allocations
  FOR EACH ROW
  EXECUTE FUNCTION check_allocation_sum();

-- 5. FUNÇÃO PARA CALCULAR DESVIOS DE REBALANCEAMENTO
-- Calcula automaticamente os desvios entre alocação atual e target
CREATE OR REPLACE FUNCTION calculate_rebalance_deviation()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deviation = ABS(NEW.current_allocation - NEW.target_allocation);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular desvios automaticamente
DROP TRIGGER IF EXISTS trigger_calculate_rebalance_deviation ON rebalance_suggestions;
CREATE TRIGGER trigger_calculate_rebalance_deviation
  BEFORE INSERT OR UPDATE ON rebalance_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_rebalance_deviation();

-- 6. POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- Habilitar RLS nas tabelas
ALTER TABLE portfolio_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalance_suggestions ENABLE ROW LEVEL SECURITY;

-- Política para portfolio_allocations - usuários só veem seus próprios dados
CREATE POLICY "Users can only see their own portfolio allocations" ON portfolio_allocations
  FOR ALL USING (auth.uid() = user_id);

-- Política para rebalance_suggestions - usuários só veem suas próprias sugestões
CREATE POLICY "Users can only see their own rebalance suggestions" ON rebalance_suggestions
  FOR ALL USING (auth.uid() = user_id);

-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE portfolio_allocations IS 'Armazena as alocações de ETFs em cada portfólio do usuário';
COMMENT ON TABLE rebalance_suggestions IS 'Armazena sugestões de rebalanceamento automático baseadas na regra 5/25';

COMMENT ON COLUMN portfolio_allocations.allocation_percentage IS 'Percentual de alocação do ETF no portfólio (0-100)';
COMMENT ON COLUMN portfolio_allocations.target_amount IS 'Valor monetário alvo para este ETF';

COMMENT ON COLUMN rebalance_suggestions.deviation IS 'Desvio absoluto entre alocação atual e target';
COMMENT ON COLUMN rebalance_suggestions.suggested_action IS 'Ação sugerida: BUY, SELL ou HOLD';
COMMENT ON COLUMN rebalance_suggestions.priority IS 'Prioridade da sugestão (1=alta, 5=baixa)';
COMMENT ON COLUMN rebalance_suggestions.status IS 'Status da sugestão: PENDING, APPROVED, REJECTED, EXECUTED';

-- ================================================================
-- FINALIZAÇÃO
-- ================================================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('portfolio_allocations', 'rebalance_suggestions')
ORDER BY table_name; 