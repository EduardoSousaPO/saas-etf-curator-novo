-- Criar tabela rebalance_suggestions para sistema de rebalanceamento automático
CREATE TABLE IF NOT EXISTS rebalance_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
  suggestion_date TIMESTAMPTZ DEFAULT NOW(),
  target_allocations JSONB NOT NULL,
  current_allocations JSONB NOT NULL,
  suggested_trades JSONB NOT NULL,
  deviation_trigger DECIMAL(5, 2) NOT NULL, -- Percentual de desvio que triggou o rebalanceamento
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_user_id ON rebalance_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_portfolio_id ON rebalance_suggestions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_status ON rebalance_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_date ON rebalance_suggestions(suggestion_date);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_rebalance_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER rebalance_suggestions_updated_at
  BEFORE UPDATE ON rebalance_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_rebalance_suggestions_updated_at();

-- Adicionar RLS (Row Level Security)
ALTER TABLE rebalance_suggestions ENABLE ROW LEVEL SECURITY;

-- Política para usuários só verem suas próprias sugestões
CREATE POLICY "Users can view their own rebalance suggestions"
  ON rebalance_suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- Política para usuários só inserirem suas próprias sugestões
CREATE POLICY "Users can insert their own rebalance suggestions"
  ON rebalance_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários só atualizarem suas próprias sugestões
CREATE POLICY "Users can update their own rebalance suggestions"
  ON rebalance_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para usuários só deletarem suas próprias sugestões
CREATE POLICY "Users can delete their own rebalance suggestions"
  ON rebalance_suggestions FOR DELETE
  USING (auth.uid() = user_id); 