# Variáveis de Ambiente - ETF Curator

## 📝 Configuração Completa do .env

Copie e configure as seguintes variáveis no seu arquivo `.env`:

```bash
# ================================================
# BASE DA APLICAÇÃO
# ================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ================================================
# BANCO DE DADOS - SUPABASE
# ================================================
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database

# ================================================
# SUPABASE (AUTENTICAÇÃO E DATABASE)
# ================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ================================================
# OPENAI (OPCIONAL - PARA ANÁLISE IA)
# ================================================
OPENAI_API_KEY=sk-your-openai-api-key

# ================================================
# MERCADO PAGO (SISTEMA DE PAGAMENTOS) - OBRIGATÓRIO
# ================================================
MERCADOPAGO_ACCESS_TOKEN=TEST-your-access-token
MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key

# ================================================
# STRIPE (LEGADO - PODE SER REMOVIDO)
# ================================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ================================================
# NEXTAUTH (SE IMPLEMENTAR AUTENTICAÇÃO)
# ================================================
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# ================================================
# EMAIL (SE IMPLEMENTAR ENVIO DE EMAILS)
# ================================================
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password

# ================================================
# ANALYTICS (SE IMPLEMENTAR)
# ================================================
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# ================================================
# CONFIGURAÇÕES DE AMBIENTE
# ================================================
NODE_ENV=development
```

## 🔑 Como Obter Cada Chave

### **1. Mercado Pago (OBRIGATÓRIO para pagamentos)**

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login ou crie uma conta
3. Crie uma nova aplicação
4. Copie as credenciais de **TEST** (para desenvolvimento):
   - `MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890...`
   - `MERCADOPAGO_PUBLIC_KEY=TEST-abcd1234...`

**⚠️ Para produção, use as credenciais LIVE**

### **2. Supabase (Para banco de dados e autenticação)**

1. Acesse: https://supabase.com
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie:
   - URL do projeto
   - `anon/public` key
   - `service_role` key (mantenha secreta)

### **3. OpenAI (OPCIONAL - para análise IA)**

1. Acesse: https://platform.openai.com
2. Vá em API Keys
3. Crie uma nova chave
4. Configure limite de gastos se necessário

### **4. NEXT_PUBLIC_APP_URL**

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: `https://seudominio.com`

## ⚙️ Configuração Rápida

### **Para Desenvolvimento Básico (sem IA)**

```bash
# Mínimo necessário para funcionar
NEXT_PUBLIC_APP_URL=http://localhost:3000
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token
MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave
```

### **Para Desenvolvimento Completo**

```bash
# Adicione também
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
OPENAI_API_KEY=sk-sua-chave-openai
```

## 🚨 Segurança

### **❌ NUNCA faça:**
- Commit de arquivos `.env` no git
- Exponha chaves `service_role` no frontend
- Use credenciais LIVE em desenvolvimento

### **✅ SEMPRE faça:**
- Use `NEXT_PUBLIC_` apenas para variáveis que podem ser públicas
- Mantenha credenciais de produção seguras
- Use credenciais TEST para desenvolvimento

## 🔄 Ambientes

### **Desenvolvimento**
```bash
NODE_ENV=development
MERCADOPAGO_ACCESS_TOKEN=TEST-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Produção**
```bash
NODE_ENV=production
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...  # LIVE credential
NEXT_PUBLIC_APP_URL=https://seudominio.com
```

## ✅ Validação

Após configurar, teste se está funcionando:

```bash
# 1. Inicie o servidor
npm run dev

# 2. Acesse as páginas:
# http://localhost:3000/pricing     - deve carregar os planos
# http://localhost:3000/comparator  - deve funcionar normalmente

# 3. Teste um pagamento com cartão de teste
```

## 🐛 Problemas Comuns

### **Erro: "MERCADOPAGO_ACCESS_TOKEN não configurado"**
- Adicione a variável no `.env`
- Restart do servidor: `npm run dev`

### **Erro: "Cannot read properties of undefined"**
- Verifique se todas as variáveis `NEXT_PUBLIC_` estão corretas
- Confirm que não há espaços extras nas variáveis

### **Pagamento não funciona**
- Confirme que está usando credenciais TEST
- Verifique se `NEXT_PUBLIC_APP_URL` está correto

---

**💡 Dica**: Sempre restart o servidor após alterar variáveis de ambiente! 