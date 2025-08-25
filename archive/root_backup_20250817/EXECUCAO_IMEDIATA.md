# ⚡ EXECUÇÃO IMEDIATA - ESCOLHA SEU MÉTODO

## 🎯 **OPÇÃO 1: SUPABASE WEB (RECOMENDADO)**

### **PASSO 1: Acessar**
```
🌐 https://supabase.com/dashboard
📂 Projeto: etfcurator  
🔧 SQL Editor → New Query
```

### **PASSO 2: Executar Primeiro Lote**
```
📁 Abrir: scripts/mass_batch_001.sql
📋 Copiar TODO o conteúdo
📝 Colar no SQL Editor
▶️  Clicar RUN
✅ Aguardar "Success"
```

### **PASSO 3: Verificar**
```sql
SELECT COUNT(*) FROM stocks_ativos_reais;
-- Deve mostrar: 59 (era 39, agora +20)
```

### **PASSO 4: Continuar**
```
Repetir para mass_batch_002.sql até mass_batch_010.sql
Verificar após cada um: SELECT COUNT(*) FROM stocks_ativos_reais;
```

---

## 💻 **OPÇÃO 2: TERMINAL (MAIS RÁPIDO)**

### **PASSO 1: Configurar Senha**
```bash
# Abrir arquivo:
notepad scripts/execute_batches_direct.py

# Linha 15: Substituir "SUA_SENHA" pela senha real do Supabase
```

### **PASSO 2: Executar**
```bash
python scripts/execute_batches_direct.py
```

---

## 🚀 **QUAL VOCÊ PREFERE?**

**Responda:**
- **"WEB"** → Te guio passo a passo no Supabase
- **"TERMINAL"** → Configuro a senha e executo automaticamente
- **"SENHA: xxx"** → Configuro e executo agora mesmo

**Aguardando sua escolha...** ⏳
