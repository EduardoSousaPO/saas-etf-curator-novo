# 🚀 GUIA DE EXECUÇÃO - SUPABASE DASHBOARD

## 📋 **PASSO A PASSO PARA APLICAR O MASSIVE_STOCKS_FINAL.SQL**

### **🎯 OBJETIVO:**
Aplicar o arquivo `massive_stocks_final.sql` (4.47 MB) diretamente no Supabase SQL Editor para inserir as métricas das ações.

---

## 🔧 **PREPARAÇÃO**

### **📁 ARQUIVOS NECESSÁRIOS:**
1. ✅ `scripts/massive_stocks_final.sql` (4.47 MB)
2. ✅ `SCRIPT_SUPABASE_DASHBOARD.sql` (script de verificação)

### **🌐 ACESSO NECESSÁRIO:**
1. Login no **Supabase Dashboard**: https://supabase.com/dashboard
2. Projeto: **kpjbshzqpqnbdxvtgzau** (etfcurator)
3. Permissões de **SQL Editor**

---

## 📝 **INSTRUÇÕES DETALHADAS**

### **PASSO 1: Acessar o SQL Editor**
1. Faça login no Supabase Dashboard
2. Selecione o projeto **etfcurator**
3. Vá para **SQL Editor** no menu lateral
4. Clique em **"New query"**

### **PASSO 2: Executar Verificação Inicial**
1. Copie o conteúdo do arquivo `SCRIPT_SUPABASE_DASHBOARD.sql`
2. Cole no SQL Editor
3. Execute apenas a **VERIFICAÇÃO INICIAL** (primeiras linhas)
4. **Anote os resultados** para comparação

### **PASSO 3: Preparar o Arquivo Principal**
1. Abra o arquivo `scripts/massive_stocks_final.sql` em um editor de texto
2. **Copie TODO o conteúdo** (4.47 MB)
3. **IMPORTANTE**: Verifique se copiou desde o início até o final

### **PASSO 4: Aplicar o Arquivo**
1. **Substitua** o comentário `-- [CONTEÚDO DO ARQUIVO...]` no script
2. **Cole** todo o conteúdo do `massive_stocks_final.sql`
3. **Execute** o script completo
4. **Aguarde** a execução (pode levar alguns minutos)

### **PASSO 5: Verificar Resultados**
1. Observe as **mensagens de retorno**
2. Execute a **VERIFICAÇÃO PÓS-INSERÇÃO**
3. Execute o **REFRESH MATERIALIZED VIEW**
4. Execute a **VERIFICAÇÃO FINAL**

---

## ✅ **RESULTADOS ESPERADOS**

### **📊 ANTES DA EXECUÇÃO:**
```sql
assets_master: ~39 stocks
stock_metrics_snapshot: ~39 registros  
stocks_ativos_reais: ~39 ações ativas
```

### **📈 APÓS EXECUÇÃO BEM-SUCEDIDA:**
```sql
stock_metrics_snapshot: ~65 registros (+26 novos)
stocks_ativos_reais: Variável (depende dos asset_id)
```

### **🎯 MÉTRICAS INSERIDAS:**
- **26 novos registros** de métricas
- **Asset IDs**: 2214 até 2240
- **Data**: 2025-08-14
- **Campos**: returns, volatility, sharpe, drawdown, dividends

---

## ⚠️ **POSSÍVEIS PROBLEMAS E SOLUÇÕES**

### **🚨 ERRO: "Query is too large to be run via the SQL Editor"**
**Causa**: Arquivo de 4.47 MB excede limite do SQL Editor
**Solução**: 
1. Dividir em chunks menores
2. Aplicar incrementalmente
3. Usar estratégia de chunks consolidados

### **🚨 ERRO: "violates foreign key constraint"**
**Causa**: asset_id 2214-2240 não existem em assets_master
**Solução**:
1. Inserir registros em assets_master primeiro
2. Usar apenas asset_id existentes
3. Aplicar estratégia incremental

### **🚨 ERRO: "duplicate key value violates unique constraint"**
**Causa**: Registros já existem no banco
**Solução**:
1. Usar `ON CONFLICT DO NOTHING`
2. Verificar dados existentes primeiro
3. Limpar registros duplicados

### **🚨 ERRO: Timeout ou "Connection lost"**
**Causa**: Query muito complexa ou demorada
**Solução**:
1. Dividir em lotes menores
2. Executar em horários de menor tráfego
3. Usar chunks de ~100KB

---

## 🔄 **ESTRATÉGIA ALTERNATIVA: CHUNKS CONSOLIDADOS**

### **Se o arquivo completo falhar:**

1. **Usar chunks menores** (já preparados)
2. **Aplicar incrementalmente** (5-10 ações por vez)
3. **Validar cada chunk** antes do próximo
4. **Monitorar progresso** continuamente

### **Arquivos de Chunk Disponíveis:**
- `CHUNK_CONSOLIDADO_01_05.sql` (5 ações de teste)
- `chunk_001.sql` até `chunk_089.sql` (chunks individuais)

---

## 📞 **SUPORTE E VALIDAÇÃO**

### **🔍 COMANDOS DE VALIDAÇÃO:**
```sql
-- Verificar total de ações
SELECT COUNT(*) FROM stocks_ativos_reais;

-- Verificar últimas inserções
SELECT MAX(asset_id), COUNT(*) FROM stock_metrics_snapshot;

-- Testar API
-- Acesse: /api/stocks/screener
```

### **📊 MÉTRICAS DE SUCESSO:**
- ✅ **0 erros** durante execução
- ✅ **+26 registros** em stock_metrics_snapshot
- ✅ **Materialized View** atualizada
- ✅ **APIs funcionando** com novos dados

---

## 🎯 **PRÓXIMOS PASSOS APÓS SUCESSO**

1. **Validar APIs** com novos dados
2. **Testar Screener** com filtros
3. **Aplicar chunks restantes** para atingir 2.240 ações
4. **Monitorar performance** das queries

---

## 📋 **CHECKLIST DE EXECUÇÃO**

- [ ] Acessar Supabase Dashboard
- [ ] Abrir SQL Editor
- [ ] Executar verificação inicial
- [ ] Copiar massive_stocks_final.sql
- [ ] Colar no script preparado
- [ ] Executar script completo
- [ ] Verificar resultados
- [ ] Atualizar Materialized View
- [ ] Validar APIs
- [ ] Reportar status final

**Execute o script de teste acima agora e me informe o resultado!** 🚀