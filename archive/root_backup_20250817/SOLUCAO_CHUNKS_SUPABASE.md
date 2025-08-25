# 🚨 SOLUÇÃO PARA ERRO "Query is too large" - APLICAÇÃO POR CHUNKS

## ❌ PROBLEMA IDENTIFICADO
- **Erro**: "Query is too large to be run via the SQL Editor"
- **Causa**: massive_stocks_final.sql (4.47 MB) excede limite do Supabase
- **Solução**: Aplicar por chunks de ~50KB cada

## ✅ SOLUÇÃO IMEDIATA - APLICAÇÃO POR CHUNKS

### **📊 CHUNKS DISPONÍVEIS**
- **Total**: 180 chunks (chunk_01.sql até chunk_091.sql)
- **Tamanho**: ~50KB cada (dentro do limite do Supabase)
- **Conteúdo**: Dados das 2.240 ações organizados

### **🎯 ESTRATÉGIA RECOMENDADA**

#### **OPÇÃO A: Aplicação Manual (5 chunks por vez)**
1. Aplicar chunks 01-05 primeiro
2. Verificar inserção
3. Continuar com chunks 06-10
4. Repetir até completar

#### **OPÇÃO B: Script Automatizado**
Usar script Python para aplicar via MCP Supabase

## 📋 PASSO A PASSO - OPÇÃO A (MANUAL)

### **PASSO 1: Aplicar Primeiros 5 Chunks**

#### **Chunk 1** (no SQL Editor do Supabase):
```sql
-- Copiar e colar conteúdo de: scripts/chunk_01.sql
```

#### **Chunk 2**:
```sql
-- Copiar e colar conteúdo de: scripts/chunk_02.sql
```

#### **Chunk 3**:
```sql
-- Copiar e colar conteúdo de: scripts/chunk_03.sql
```

#### **Chunk 4**:
```sql
-- Copiar e colar conteúdo de: scripts/chunk_04.sql
```

#### **Chunk 5**:
```sql
-- Copiar e colar conteúdo de: scripts/chunk_05.sql
```

### **PASSO 2: Verificação Intermediária**
```sql
SELECT COUNT(*) as acoes_inseridas FROM assets_master WHERE asset_type = 'STOCK';
```

### **PASSO 3: Continuar com Próximos Lotes**
- Chunks 06-10
- Chunks 11-15
- Chunks 16-20
- ... até chunk_091

## 🚀 SOLUÇÃO AUTOMATIZADA - OPÇÃO B

### **Script Python para Aplicação Automática**
```python
# Executar no terminal:
python scripts/apply_chunks_supabase.py
```

## ⚡ SOLUÇÃO RÁPIDA - PRIMEIROS 10 CHUNKS

Vou criar um script consolidado com os primeiros 10 chunks para você aplicar agora:
