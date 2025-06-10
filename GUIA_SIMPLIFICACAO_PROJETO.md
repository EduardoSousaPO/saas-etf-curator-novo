# Guia de Simplificação do Projeto ETF Curator

## Objetivo
Simplificar o projeto ETF Curator mantendo apenas as funcionalidades essenciais de **Rankings** e **Screener**, removendo todas as outras funcionalidades para criar uma aplicação mais focada e performática.

## Análise Atual do Projeto

### Funcionalidades Identificadas (Para Remoção)
1. **Dashboard** - `/dashboard`
2. **Analytics** - `/analytics`
3. **Comparator** - `/comparator`
4. **Assistant/AI Chat** - `/assistant`
5. **Alerts** - `/alerts`
6. **Coaching** - `/coaching`
7. **Learning** - `/learn`
8. **Recommendations** - `/recommendations`
9. **Simulator** - `/simulator`
10. **Onboarding** - `/onboarding`
11. **Payment/Pricing** - `/payment`, `/pricing`
12. **Portfolios** - Gerenciamento de portfólios
13. **Auth System** - Sistema de autenticação
14. **Webhooks** - Integrações externas
15. **Admin Panel** - Painel administrativo

### Funcionalidades a Manter
1. **Rankings** - `/rankings` ✅
2. **Screener** - `/screener` ✅
3. **Estrutura básica** - Layout, navegação simplificada
4. **APIs essenciais** - ETFs data, rankings, screener

## Estrutura do Banco de Dados

### Tabelas Essenciais (Manter)
- `etf_list` - Dados mestres dos ETFs
- `calculated_metrics` - Métricas calculadas para rankings/screener
- `etf_prices` - Histórico de preços (para cálculos)
- `etf_dividends` - Histórico de dividendos
- `etf_holdings` - Composição dos ETFs (opcional, para detalhes)

### Tabelas para Remoção
- `portfolios` e `portfolio_holdings` - Sistema de portfólios
- `etf_correlations` - Analytics avançados
- `sector_analysis` - Analytics setoriais
- `user_subscriptions` - Sistema de pagamentos
- `payment_history` - Histórico de pagamentos
- `user_usage_tracking` - Tracking de uso

## Plano de Execução

### Fase 1: Backup e Preparação
```bash
# 1. Criar backup do projeto atual
git checkout -b backup-full-version
git add .
git commit -m "Backup completo antes da simplificação"

# 2. Criar branch para simplificação
git checkout main
git checkout -b simplify-to-rankings-screener
```

### Fase 2: Remoção de Páginas e Rotas

#### Páginas a Remover
```bash
# Remover diretórios de páginas
rm -rf src/app/dashboard
rm -rf src/app/analytics
rm -rf src/app/comparator
rm -rf src/app/assistant
rm -rf src/app/alerts
rm -rf src/app/coaching
rm -rf src/app/learn
rm -rf src/app/recommendations
rm -rf src/app/simulator
rm -rf src/app/onboarding
rm -rf src/app/payment
rm -rf src/app/pricing
rm -rf src/app/auth
rm -rf src/app/privacy
rm -rf src/app/terms
```

#### APIs a Remover
```bash
# Remover APIs desnecessárias
rm -rf src/app/api/ai
rm -rf src/app/api/analytics
rm -rf src/app/api/payments
rm -rf src/app/api/portfolios
rm -rf src/app/api/admin
rm -rf src/app/api/alerts
rm -rf src/app/api/webhooks
rm -rf src/app/api/assistant
rm -rf src/app/api/appsumo-redeem
rm -rf src/app/api/checkout-sessions
rm -rf src/app/api/stripe-webhook

# Manter apenas:
# src/app/api/etfs/rankings
# src/app/api/etfs/screener
# src/app/api/data (para dados básicos)
```

### Fase 3: Remoção de Componentes

#### Componentes a Remover
```bash
# Remover componentes desnecessários
rm -rf src/components/dashboard
rm -rf src/components/analytics
rm -rf src/components/assistant
rm -rf src/components/alerts
rm -rf src/components/landing
rm -rf src/components/learning
rm -rf src/components/recommendations
rm -rf src/components/pricing
rm -rf src/components/comparator
rm -rf src/components/admin
rm -rf src/components/auth
rm -rf src/components/onboarding
rm -rf src/components/workflow

# Manter apenas:
# src/components/ui (componentes base)
# src/components/layout (layout básico)
# src/components/screener
# src/components/rankings
```

### Fase 4: Simplificação da Navegação

#### Atualizar Navbar
```typescript
// src/components/layout/Navbar.tsx
const navItems = [
  { href: "/rankings", label: "Rankings" },
  { href: "/screener", label: "Screener" },
];
```

#### Atualizar Layout Principal
```typescript
// src/app/layout.tsx - Remover:
// - AIChat component
// - GlobalAppLogic (se contém lógica de auth/payment)
// - ThemeProvider (simplificar)
```

### Fase 5: Limpeza do Banco de Dados

#### Script de Migração
```sql
-- Remover tabelas desnecessárias
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS portfolio_holdings CASCADE;
DROP TABLE IF EXISTS etf_correlations CASCADE;
DROP TABLE IF EXISTS sector_analysis CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS user_usage_tracking CASCADE;

-- Manter apenas tabelas essenciais:
-- etf_list, calculated_metrics, etf_prices, etf_dividends, etf_holdings
```

### Fase 6: Limpeza de Dependências

#### Dependências a Remover
```json
{
  "dependencies_to_remove": [
    "stripe",
    "mercadopago",
    "openai",
    "react-joyride",
    "framer-motion",
    "@supabase/ssr",
    "next-intl",
    "next-themes"
  ]
}
```

#### Comando de Limpeza
```bash
npm uninstall stripe mercadopago openai react-joyride framer-motion @supabase/ssr next-intl next-themes
npm install --save-dev
npm audit fix
```

### Fase 7: Simplificação de Scripts

#### Scripts a Remover/Simplificar
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "fmp-enrich": "tsx scripts/fmp-integration.ts",
    "diagnose": "tsx scripts/diagnose-data.ts",
    "prisma:generate": "prisma generate",
    "update-etf-data": "tsx scripts/update_etf_data.ts"
  }
}
```

### Fase 8: Atualização da Página Inicial

#### Nova Landing Page Simples
```typescript
// src/app/page.tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ETF Curator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Rankings e Screening de ETFs Americanos
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/rankings" className="btn-primary">
              Ver Rankings
            </Link>
            <Link href="/screener" className="btn-secondary">
              Usar Screener
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Rankings</h3>
            <p className="text-gray-600">
              Veja os ETFs mais bem ranqueados por diferentes métricas de performance.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Screener</h3>
            <p className="text-gray-600">
              Filtre e encontre ETFs baseado em critérios específicos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Estrutura Final Simplificada

```
etfcurator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── etfs/
│   │   │   │   ├── rankings/
│   │   │   │   └── screener/
│   │   │   └── data/
│   │   ├── rankings/
│   │   ├── screener/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── rankings/
│   │   └── screener/
│   ├── lib/
│   │   ├── utils.ts
│   │   └── supabaseClient.ts
│   └── types.ts
├── prisma/
│   └── schema.prisma (simplificado)
├── package.json (dependências reduzidas)
└── README.md (atualizado)
```

## Benefícios da Simplificação

### Performance
- **Bundle size reduzido**: Remoção de dependências desnecessárias
- **Menos JavaScript**: Componentes e lógica simplificados
- **Queries otimizadas**: Apenas dados essenciais

### Manutenibilidade
- **Código mais limpo**: Foco em duas funcionalidades principais
- **Menos bugs**: Menos código = menos pontos de falha
- **Deploy mais rápido**: Build e deploy simplificados

### Experiência do Usuário
- **Interface mais clara**: Foco nas funcionalidades principais
- **Navegação simples**: Apenas 2 seções principais
- **Performance melhor**: Carregamento mais rápido

## Checklist de Execução

### Preparação
- [ ] Criar backup completo do projeto
- [ ] Documentar funcionalidades atuais
- [ ] Criar branch para simplificação

### Remoção de Código
- [ ] Remover páginas desnecessárias
- [ ] Remover APIs não utilizadas
- [ ] Remover componentes obsoletos
- [ ] Limpar dependências

### Banco de Dados
- [ ] Criar script de migração
- [ ] Backup do banco atual
- [ ] Executar limpeza das tabelas
- [ ] Testar integridade dos dados

### Testes
- [ ] Testar funcionalidade de Rankings
- [ ] Testar funcionalidade de Screener
- [ ] Verificar performance
- [ ] Testar build de produção

### Finalização
- [ ] Atualizar documentação
- [ ] Atualizar README
- [ ] Commit das mudanças
- [ ] Deploy da versão simplificada

## Comandos de Execução Rápida

```bash
# 1. Backup
git checkout -b backup-full-version
git add . && git commit -m "Backup completo"

# 2. Simplificação
git checkout -b simplify-project

# 3. Remoção em massa
rm -rf src/app/{dashboard,analytics,comparator,assistant,alerts,coaching,learn,recommendations,simulator,onboarding,payment,pricing,auth,privacy,terms}
rm -rf src/app/api/{ai,analytics,payments,portfolios,admin,alerts,webhooks,assistant,appsumo-redeem,checkout-sessions,import-xlsx,stripe-webhook}
rm -rf src/components/{dashboard,analytics,assistant,alerts,landing,learning,recommendations,pricing,comparator,admin,auth,onboarding,workflow}

# 4. Limpeza de dependências
npm uninstall stripe mercadopago openai react-joyride framer-motion @supabase/ssr next-intl next-themes

# 5. Teste
npm run build
npm run dev
```

## Considerações Finais

Esta simplificação transformará o ETF Curator de uma plataforma complexa com múltiplas funcionalidades em uma ferramenta focada e eficiente para rankings e screening de ETFs. O resultado será uma aplicação mais rápida, mais fácil de manter e com melhor experiência do usuário para as funcionalidades principais.

A estrutura simplificada permitirá futuras expansões de forma mais controlada e organizada, mantendo sempre o foco nas funcionalidades core do produto. 