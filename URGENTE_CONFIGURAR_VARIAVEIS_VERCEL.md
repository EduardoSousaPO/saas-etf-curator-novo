# 🚨 URGENTE: Configurar Variáveis de Ambiente no Vercel

## 📋 **Problema Identificado**

✅ **Deploy funcionando** - Código atualizado em produção  
❌ **Variáveis de ambiente ausentes** - APIs retornando erro 500  
❌ **Banco Supabase não conecta** - DATABASE_URL não configurada  

## 🔧 **Solução: Configurar Variáveis no Vercel**

### **1. Acesse o Painel do Vercel**
1. Vá para: https://vercel.com/dashboard
2. Clique no projeto: **saas-etf-curator-novo**
3. Vá na aba **Settings**
4. Clique em **Environment Variables**

### **2. Adicione as Variáveis OBRIGATÓRIAS**

Copie e cole cada variável abaixo:

#### **🔗 Banco de Dados (CRÍTICO)**
```
DATABASE_URL
postgresql://postgres.nniabnjuwzeqmflrruga:Catolico0204@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

```
DIRECT_URL
postgresql://postgres.nniabnjuwzeqmflrruga:Catolico0204@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

#### **🔑 Supabase (CRÍTICO)**
```
NEXT_PUBLIC_SUPABASE_URL
https://nniabnjuwzeqmflrruga.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODI2NDUsImV4cCI6MjA2MzM1ODY0NX0.kHXT5Hb4GBGFCVvGyQxC9bUJkw77-fdZA3PAC82_NbU
```

```
SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc4MjY0NSwiZXhwIjoyMDYzMzU4NjQ1fQ.SR2r99mB2ayXkbP7nIbkZuGgCzb6-hOa1N_fBMm6w8E
```

#### **📊 APIs Financeiras (OPCIONAL)**
```
FMP_API_KEY
ZFPEZOZgmJGemx5HgZeFMaK6wHEg1VE3
```

```
OPENAI_API_KEY
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
```

### **3. Configuração no Vercel**

Para cada variável:
1. **Name**: Cole o nome da variável (ex: `DATABASE_URL`)
2. **Value**: Cole o valor correspondente
3. **Environment**: Selecione **Production**, **Preview** e **Development**
4. Clique **Save**

### **4. Forçar Redeploy**

Após adicionar todas as variáveis:
1. Vá na aba **Deployments**
2. Clique nos **3 pontos** do último deployment
3. Clique **Redeploy**
4. Aguarde o deploy completar (~2-3 minutos)

## ✅ **Verificação**

Após o redeploy, teste:
- https://saas-etf-curator-novo.vercel.app/
- https://saas-etf-curator-novo.vercel.app/rankings
- https://saas-etf-curator-novo.vercel.app/screener

**Resultado esperado**: Dados reais do banco, sem erros 500

## 🔍 **Status Atual**

- ✅ **Código atualizado**: Fallbacks removidos
- ✅ **Deploy funcionando**: Última versão em produção
- ❌ **Variáveis ausentes**: Precisa configurar no Vercel
- ❌ **Banco desconectado**: DATABASE_URL não encontrada

## 📞 **Próximos Passos**

1. **Configure as variáveis** (5 minutos)
2. **Force o redeploy** (3 minutos)
3. **Teste a aplicação** (1 minuto)
4. **Confirme funcionamento** ✅

---

**⚡ PRIORIDADE MÁXIMA**: Configure `DATABASE_URL` e `NEXT_PUBLIC_SUPABASE_URL` primeiro! 