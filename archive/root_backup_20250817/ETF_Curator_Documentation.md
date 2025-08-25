# ETF Curator - Documentação Completa

## Visão Geral do Projeto

**ETF Curator** é uma aplicação Next.js 15 para análise e curadoria de ETFs americanos, oferecendo ferramentas profissionais para investidores de todos os níveis. A plataforma combina dados reais de mercado com análises quantitativas avançadas para facilitar a tomada de decisão em investimentos.

### Público-Alvo
- **Investidores Iniciantes**: Interface intuitiva com explicações didáticas
- **Investidores Intermediários**: Ferramentas de screener e comparação avançadas
- **Investidores Avançados**: Simulador de portfólio e análise de risco detalhada
- **Consultores Financeiros**: Relatórios e insights para orientação de clientes

### Diferenciais
- **Dados Reais**: 4.409 ETFs com métricas calculadas em tempo real
- **Análise Quantitativa**: Índice Sharpe, volatilidade, máximo drawdown
- **Personalização**: Recomendações baseadas no perfil de risco do usuário
- **Interface Moderna**: Design responsivo com tema claro/escuro

## Arquitetura e Tecnologias

### Stack Principal
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Pagamentos**: MercadoPago
- **UI Components**: Radix UI, Lucide React
- **Charts**: Recharts
- **Deploy**: Vercel

### Estrutura de Diretórios
```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── screener/          # Ferramenta de screening
│   ├── rankings/          # Rankings de performance
│   ├── simulador/         # Simulador de portfólio
│   └── comparador/        # Comparação de ETFs
├── components/            # Componentes React reutilizáveis
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários e configurações
└── types.ts              # Definições de tipos TypeScript
```

## Funcionalidades Principais

### 1. Dashboard (`/dashboard`)
- **Descrição**: Painel principal com visão geral personalizada
- **Dados Consumidos**: Métricas de mercado agregadas, ETFs recomendados baseados no perfil do usuário, insights personalizados de investimento

### 2. Screener (`/screener`)
- **Descrição**: Ferramenta avançada de filtros para descoberta de ETFs
- **Filtros Disponíveis**: Classe de ativo, retornos, volatilidade, Sharpe, dividend yield, busca por nome/símbolo, patrimônio sob gestão

### 3. Rankings (`/rankings`)
- **Descrição**: Rankings automáticos por categoria de performance
- **Categorias**: 6 rankings com top 10 ETFs cada

### 4. Simulador (`/simulador`)
- **Descrição**: Simulador de portfólio para criação de carteiras personalizadas

### 5. Comparador (`/comparador`)
- **Descrição**: Comparação lado a lado de ETFs para análise detalhada

### 6. Portfolio Master (`/portfolio-master`)
- **Descrição**: Criação de carteiras otimizadas com base científica usando dados de 1.370+ ativos globais

## Jornada do Usuário

### 1. Início
- Usuários acessam a página inicial para uma visão geral do ETF Curator e suas funcionalidades.

### 2. Autenticação
- Registro e login através de páginas de autenticação para acesso a funcionalidades personalizadas.

### 3. Onboarding
- Processo de onboarding para definir objetivos de investimento, perfil de risco e preferências.

### 4. Exploração
- Navegação pelas ferramentas como Dashboard, Screener, Rankings, Simulador e Comparador para análise e descoberta de ETFs.

### 5. Criação de Portfólio
- Utilização do Portfolio Master para criar e otimizar carteiras de ETFs baseadas em dados científicos.

### 6. Upgrade de Plano
- Acesso à página de preços para upgrade para planos premium como Pro, Wealth ou Offshore, com integração ao MercadoPago para pagamentos.

## Planos de Assinatura

### 1. Starter
- **Preço**: Gratuito
- **Características**: Funcionalidades básicas, acesso limitado a ferramentas

### 2. Pro
- **Preço**: R$ 39,90/mês
- **Características**: Acesso completo a todas as ferramentas, screener avançado, rankings completos, suporte prioritário

### 3. Wealth
- **Preço**: 1% a.a. sobre patrimônio
- **Características**: Consultoria personalizada, relatórios customizados, suporte VIP

### 4. Offshore
- **Preço**: 0,8% a.a. sobre patrimônio
- **Características**: Aconselhamento para investimentos internacionais, estratégias offshore

## Estrutura do Banco de Dados

### Tabelas Principais
- **etfs_ativos_reais**: 1.370 ETFs líquidos e ativos
- **etf_rankings**: 29 rankings válidos
- **etf_prices**: Registros de preços históricos
- **historic_etfs_dividends**: Registros de dividendos históricos
- **user_profiles**, **subscriptions**, **payments**: Tabelas para gestão de usuários e assinaturas

## Métricas Utilizadas

### 1. Retornos
- **returns_12m, returns_24m, returns_36m, returns_5y, ten_year_return**: Retornos acumulados em diferentes períodos

### 2. Volatilidade
- **volatility_12m, volatility_24m, volatility_36m, ten_year_volatility**: Volatilidade anualizada

### 3. Sharpe Ratio
- **sharpe_12m, sharpe_24m, sharpe_36m, ten_year_sharpe**: Índice Sharpe para avaliação de risco-retorno

### 4. Risco
- **max_drawdown**: Máxima queda desde o pico

### 5. Dividendos
- **dividends_12m, dividends_24m, dividends_36m, dividends_all_time, dividend_yield**: Dados de dividendos e rendimento

## Lógica de Negócios

### 1. Otimização de Portfólio
- Utiliza algoritmos como Markowitz para otimização de carteiras baseada no perfil de risco e objetivos do usuário.

### 2. Recomendações Personalizadas
- Geração de recomendações de ETFs baseadas em dados de mercado e preferências do usuário através de APIs como `/api/portfolio/unified-recommendations`.

### 3. Sistema de Pagamentos
- Integração com MercadoPago para processamento de assinaturas e upgrades de planos.

## Conclusão

O ETF Curator é uma plataforma robusta e inovadora para investidores de ETFs, oferecendo ferramentas avançadas de análise e personalização. Com uma arquitetura moderna baseada em Next.js e Supabase, e uma jornada do usuário bem estruturada, a plataforma está posicionada para atender às necessidades de investidores de todos os níveis, desde iniciantes até consultores financeiros experientes. Os planos de assinatura flexíveis garantem que cada usuário tenha acesso às funcionalidades que melhor atendem aos seus objetivos de investimento. 