-- Criar tabela portfolio_tracking para registrar compras de ETFs
CREATE TABLE IF NOT EXISTS portfolio_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
  etf_symbol VARCHAR(10) NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(15, 4) NOT NULL,
  shares_bought DECIMAL(15, 6) NOT NULL,
  amount_invested DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_user_id ON portfolio_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_portfolio_id ON portfolio_tracking(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_etf_symbol ON portfolio_tracking(etf_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_purchase_date ON portfolio_tracking(purchase_date);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_portfolio_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER portfolio_tracking_updated_at
  BEFORE UPDATE ON portfolio_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_tracking_updated_at();

-- Adicionar RLS (Row Level Security)
ALTER TABLE portfolio_tracking ENABLE ROW LEVEL SECURITY;

-- Política para usuários só verem seus próprios dados
CREATE POLICY "Users can view their own portfolio tracking"
  ON portfolio_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Política para usuários só inserirem seus próprios dados
CREATE POLICY "Users can insert their own portfolio tracking"
  ON portfolio_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários só atualizarem seus próprios dados
CREATE POLICY "Users can update their own portfolio tracking"
  ON portfolio_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para usuários só deletarem seus próprios dados
CREATE POLICY "Users can delete their own portfolio tracking"
  ON portfolio_tracking FOR DELETE
  USING (auth.uid() = user_id); 