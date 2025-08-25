# 🎯 GUIA OBJETIVO - EXECUÇÃO NO SUPABASE WEB

## 📋 **PASSO A PASSO DIRETO**

### **1. ACESSAR SUPABASE**
```
🌐 https://supabase.com/dashboard
📂 Projeto: etfcurator (kpjbshzqpqnbdxvtgzau)
🔧 SQL Editor (menu lateral)
```

### **2. EXECUTAR LOTE 1**
```sql
-- COPIE E COLE O CONTEÚDO COMPLETO DE: scripts/mass_batch_001.sql
-- CLIQUE EM "RUN" 
-- AGUARDE CONCLUSÃO
```

### **3. VERIFICAR RESULTADO**
```sql
SELECT COUNT(*) FROM stocks_ativos_reais;
-- Deve mostrar: 59 ações (39 + 20 novas)
```

### **4. REPETIR PARA PRÓXIMOS LOTES**
```
📁 scripts/mass_batch_002.sql → Executar
📁 scripts/mass_batch_003.sql → Executar  
📁 scripts/mass_batch_004.sql → Executar
📁 scripts/mass_batch_005.sql → Executar
📁 scripts/mass_batch_006.sql → Executar
📁 scripts/mass_batch_007.sql → Executar
📁 scripts/mass_batch_008.sql → Executar
📁 scripts/mass_batch_009.sql → Executar
📁 scripts/mass_batch_010.sql → Executar
```

### **5. VERIFICAÇÃO FINAL**
```sql
-- Após todos os lotes:
SELECT COUNT(*) FROM stocks_ativos_reais;
-- Deve mostrar: 239 ações (39 + 200 novas)

-- Verificar diversidade:
SELECT sector, COUNT(*) FROM stocks_ativos_reais 
GROUP BY sector ORDER BY COUNT(*) DESC;
```

---

## 🚀 **EXECUÇÃO ALTERNATIVA VIA TERMINAL**

Se quiser executar via terminal (mais rápido):

### **1. CONFIGURAR SENHA**
```bash
# Editar arquivo:
notepad scripts/execute_batches_direct.py

# Substituir linha:
# "SUA_SENHA" → sua_senha_real_do_supabase
```

### **2. EXECUTAR SCRIPT**
```bash
python scripts/execute_batches_direct.py
```

---

## 📊 **PROGRESSO ESPERADO**

### **APÓS CADA LOTE:**
```
Lote 1: 59 ações   (+20)
Lote 2: 79 ações   (+20) 
Lote 3: 99 ações   (+20)
Lote 4: 119 ações  (+20)
Lote 5: 139 ações  (+20)
Lote 6: 159 ações  (+20)
Lote 7: 179 ações  (+20)
Lote 8: 199 ações  (+20)
Lote 9: 219 ações  (+20)
Lote 10: 239 ações (+20)
```

### **RESULTADO FINAL:**
- ✅ **239 ações** no banco
- ✅ **10.7% de progresso** da meta (2.240)
- ✅ **APIs funcionais** com dataset expandido

---

## ⚡ **QUAL MÉTODO PREFERE?**

**🌐 SUPABASE WEB** (mais seguro):
- Copiar/colar cada arquivo SQL
- Executar um por vez
- Verificar resultado após cada um

**💻 TERMINAL** (mais rápido):
- Configurar senha no script
- Executar `python scripts/execute_batches_direct.py`
- Todos os lotes executados automaticamente

**Escolha o método e me informe o resultado!** 🎯
