# 🚀 Configuração de Variáveis de Ambiente na Vercel

## 📋 Instruções para Deploy em Produção

### 1. Acessar o Dashboard da Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Acesse seu projeto: **etf-curator**
3. Clique em **Settings** → **Environment Variables**

### 2. Configurar Variáveis do MercadoPago (PRODUÇÃO)

Adicione as seguintes variáveis com os valores de **PRODUÇÃO**:

```bash
# MercadoPago - Credenciais de Produção
MERCADOPAGO_ACCESS_TOKEN=APP_USR-8537527381073054-061610-1a9b50f7d484cfd5b6a9a779d9b9a567-208600078
MERCADOPAGO_PUBLIC_KEY=APP_USR-c1be4a39-4e31-4dbd-9a1c-7a5751ca15b
MERCADOPAGO_CLIENT_ID=8537527381073054
MERCADOPAGO_CLIENT_SECRET=bMYPeWAeVGJSQ0PNaXZ7A3UkCwi5YsF

# URL da Aplicação
NEXT_PUBLIC_APP_URL=https://etf-curator-pazaqo6gb-eduardosousapos-projects.vercel.app
```

### 3. Configurar Outras Variáveis Necessárias

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# OpenAI (se usando)
OPENAI_API_KEY=sua_openai_key

# FMP API (se usando)
FMP_API_KEY=sua_fmp_key

# Resend Email
RESEND_API_KEY=sua_resend_key
```

### 4. Configurar Ambientes

Para cada variável, configure para os ambientes:
- ✅ **Production**
- ✅ **Preview** 
- ❌ **Development** (usar .env.local)

### 5. Verificar Configuração

Após configurar, acesse:
```
https://seu-dominio.vercel.app/api/test/mercadopago
```

Deve mostrar:
```json
{
  "config": {
    "environment": "PRODUÇÃO",
    "isProduction": true
  }
}
```

## ⚠️ Segurança

- ❌ **NUNCA** commite credenciais de produção no Git
- ✅ **SEMPRE** use variáveis de ambiente na Vercel
- ✅ **MONITORE** transações em produção
- ✅ **CONFIGURE** webhooks do MercadoPago

## 🔄 Webhooks do MercadoPago

Configure no painel do MercadoPago:
```
URL: https://seu-dominio.vercel.app/api/webhooks/mercadopago
Eventos: payment, subscription
```

## 📊 Monitoramento

- Dashboard MercadoPago para transações
- Logs da Vercel para debugging
- Supabase para dados de usuários/assinaturas 