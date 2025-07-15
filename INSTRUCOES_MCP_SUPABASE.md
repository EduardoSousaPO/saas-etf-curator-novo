# 🚀 Instruções para Execução via MCP Supabase

## Objetivo
Criar as tabelas faltantes para completar o sistema de tracking e rebalanceamento de portfólios do ETF Curator.

## Status Atual das Tabelas

### ✅ Tabelas Existentes
- `user_portfolio_allocations` - Já existe
- `portfolio_tracking` - Já existe

### ❌ Tabelas Faltantes
- `portfolio_allocations` - Precisa ser criada
- `rebalance_suggestions` - Precisa ser criada

## 📋 Execução via MCP Supabase

### Opção 1: Executar arquivo SQL completo
```bash
# Execute o arquivo SQL completo
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query=open("supabase/create_missing_tables.sql").read()
)
```

### Opção 2: Executar comandos individuais

#### 1. Criar tabela portfolio_allocations
```sql
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query="""
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

CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_portfolio_id ON portfolio_allocations(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_user_id ON portfolio_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_etf_symbol ON portfolio_allocations(etf_symbol);
"""
)
```

#### 2. Criar tabela rebalance_suggestions
```sql
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query="""
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

CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_portfolio_id ON rebalance_suggestions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_user_id ON rebalance_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_status ON rebalance_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_priority ON rebalance_suggestions(priority);
"""
)
```

#### 3. Criar triggers e funções
```sql
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query="""
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
"""
)
```

#### 4. Aplicar políticas de segurança
```sql
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query="""
-- Habilitar RLS nas tabelas
ALTER TABLE portfolio_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalance_suggestions ENABLE ROW LEVEL SECURITY;

-- Política para portfolio_allocations - usuários só veem seus próprios dados
CREATE POLICY "Users can only see their own portfolio allocations" ON portfolio_allocations
  FOR ALL USING (auth.uid() = user_id);

-- Política para rebalance_suggestions - usuários só veem suas próprias sugestões
CREATE POLICY "Users can only see their own rebalance suggestions" ON rebalance_suggestions
  FOR ALL USING (auth.uid() = user_id);
"""
)
```

## 🔍 Verificação das Tabelas

### Verificar se as tabelas foram criadas
```sql
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query="""
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('portfolio_allocations', 'rebalance_suggestions')
ORDER BY table_name;
"""
)
```

### Verificar estrutura das tabelas
```sql
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query="""
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('portfolio_allocations', 'rebalance_suggestions')
ORDER BY table_name, ordinal_position;
"""
)
```

## 🧪 Teste das Tabelas

### Após a criação, execute o script de verificação
```bash
node scripts/create_tables_direct.js
```

### Resultado esperado:
```
✅ Tabela user_portfolio_allocations já existe
✅ Tabela portfolio_allocations já existe
✅ Tabela portfolio_tracking já existe
✅ Tabela rebalance_suggestions já existe
```

## 📊 Estrutura das Tabelas Criadas

### portfolio_allocations
- **Objetivo**: Armazenar as alocações de ETFs em cada portfólio
- **Campos principais**: `portfolio_id`, `etf_symbol`, `allocation_percentage`, `target_amount`
- **Relacionamentos**: FK com `user_portfolio_allocations` e `auth.users`

### rebalance_suggestions
- **Objetivo**: Armazenar sugestões de rebalanceamento automático
- **Campos principais**: `current_allocation`, `target_allocation`, `deviation`, `suggested_action`
- **Status**: `PENDING`, `APPROVED`, `REJECTED`, `EXECUTED`
- **Ações**: `BUY`, `SELL`, `HOLD`

## 🔄 Próximos Passos

1. **Executar os comandos MCP** conforme instruções acima
2. **Verificar criação** das tabelas
3. **Testar APIs** de tracking e rebalanceamento
4. **Implementar funcionalidades** de dois portfólios visuais
5. **Configurar sistema** de rebalanceamento automático

## 📝 Logs Atuais

Baseado nos logs fornecidos:
- **Portfolio ID**: `d733e728-f27d-40c1-bb44-6c6a1e53e58e`
- **User ID**: `9ba39a20-7409-479d-a010-284ad452d4f8`
- **Status**: "Nenhum dado de tracking encontrado"

Após a criação das tabelas, o sistema estará pronto para:
- Salvar alocações do Portfolio Master
- Fazer tracking de compras reais
- Gerar sugestões de rebalanceamento
- Implementar workflow de aprovação

## ⚡ Comando Rápido

Para executar tudo de uma vez:
```bash
mcp_supabase_execute_sql(
  project_id="nniabnjuwzeqmflrruga",
  query=open("supabase/create_missing_tables.sql").read()
)
``` 