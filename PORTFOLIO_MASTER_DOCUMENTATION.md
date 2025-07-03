# Portfolio Master - Documentação Técnica

## 📋 Visão Geral

O Portfolio Master é a funcionalidade principal do ETF Curator que permite criar carteiras otimizadas personalizadas através de um processo científico baseado na Teoria de Markowitz, utilizando uma base de 1.370+ ETFs reais.

## 🎯 Funcionalidades Implementadas

### 1. Onboarding Intuitivo (3 Etapas)

**Etapa 1: Objetivo do Investimento**
- 4 opções principais: Aposentadoria, Reserva de Emergência, Comprar Casa, Crescimento Patrimonial
- Interface visual com ícones e descrições claras
- Seleção por clique com feedback visual

**Etapa 2: Valores do Investimento**
- Valor inicial (USD) - mínimo $10.000
- Contribuição mensal (USD) - opcional
- Horizonte de tempo (1 a 20 anos)
- Validação de entrada em tempo real

**Etapa 3: Perfil de Risco**
- Conservador: Baixo risco, preservação de capital
- Moderado: Risco equilibrado, crescimento moderado
- Arrojado: Alto risco, máximo crescimento
- Descrições claras para cada perfil

### 2. Visualização Interativa

**Gráfico de Pizza**
- Visualização da composição da carteira em tempo real
- Cores diferenciadas para cada ETF
- Tooltips com percentuais e valores
- Atualização automática conforme seleção de ETFs

**Gráfico de Backtesting**
- Comparação de performance histórica (10 anos)
- Linha da carteira vs S&P 500
- Cards com valores finais e superioridade
- Dados em USD para consistência

### 3. Seleção Interativa de ETFs

**Funcionalidades:**
- Checkboxes para selecionar/desmarcar ETFs
- Mínimo de 2 ETFs obrigatório para diversificação
- Recálculo automático da carteira via Teoria de Markowitz
- Loading state durante recálculo
- Badges de qualidade score para cada ETF

**Detalhamento Expandível:**
- Modal com métricas completas por ETF
- Volatilidade, Sharpe Ratio, Taxa de Gestão, Dividend Yield
- Informações técnicas organizadas em grid responsivo

### 4. Composição Manual

**Modo Automático:**
- Seleção baseada no algoritmo de otimização
- ETFs pré-selecionados conforme perfil e objetivo

**Modo Manual:**
- Busca de ETFs na base de 1.370+ ativos
- Autocomplete com resultados em tempo real
- Adição/remoção manual de ETFs
- Integração com sistema de recálculo

### 5. Projeções Futuras Claras

**Cenários de Monte Carlo:**
- **Pessimista:** Cenário de crise (percentil 10)
- **Esperado:** Cenário mais provável (mediana)
- **Otimista:** Cenário favorável (percentil 90)

**Características:**
- Valores em USD para consistência
- Explicações didáticas de cada cenário
- Baseado em dados históricos e simulações

### 6. Métricas do Portfolio

**Métricas Principais:**
- Retorno Esperado (%)
- Volatilidade (%)
- Sharpe Ratio
- Cards visuais com cores diferenciadas

**Análise de Risco:**
- Max Drawdown
- Expense Ratio médio
- Dividend Yield médio

### 7. Insights Personalizados

- Recomendações baseadas no perfil do usuário
- Alertas sobre concentração de risco
- Sugestões de rebalanceamento
- Explicações sobre a estratégia escolhida

## 🏗️ Arquitetura Técnica

### Estrutura de Componentes

```
UnifiedPortfolioMaster.tsx
├── Onboarding (3 etapas)
│   ├── renderStep1() - Objetivo
│   ├── renderStep2() - Valores
│   └── renderStep3() - Perfil de Risco
├── Resultados
│   ├── renderResults() - Container principal
│   ├── renderPieChart() - Gráfico de pizza
│   └── renderBacktesting() - Análise histórica
└── Funcionalidades
    ├── handleETFToggle() - Seleção interativa
    ├── recalculatePortfolio() - Recálculo Markowitz
    └── searchETFs() - Busca manual
```

### APIs Integradas

**POST /api/portfolio/unified-master**
- Geração inicial do portfolio
- Input: OnboardingData
- Output: PortfolioResult completo

**PUT /api/portfolio/unified-master**
- Recálculo com ETFs selecionados
- Input: selectedETFs + parâmetros
- Output: Portfolio otimizado

**GET /api/portfolio/unified-master?search=**
- Busca de ETFs na base
- Input: query string
- Output: Lista de ETFs correspondentes

### Tipos TypeScript

```typescript
interface OnboardingData {
  objective: 'retirement' | 'emergency' | 'house' | 'growth'
  investmentAmount: number
  monthlyContribution: number
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  timeHorizon: number
}

interface PortfolioResult {
  recommendedPortfolio: {
    etfs: ETFData[]
    portfolioMetrics: PortfolioMetrics
  }
  backtesting: BacktestingData
  projections: ProjectionData
  insights: string[]
}
```

### Dependências

- **React 18+** - Framework base
- **Recharts** - Gráficos interativos
- **Lucide React** - Ícones modernos
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes base
- **TypeScript** - Tipagem estática

## 🎨 Design System

### Cores Principais
- **Azul (#3B82F6):** Elementos primários, links
- **Verde (#10B981):** Sucesso, retornos positivos
- **Roxo (#8B5CF6):** Métricas avançadas
- **Vermelho (#EF4444):** Alertas, cenários negativos
- **Cinza (#6B7280):** Textos secundários

### Componentes UI
- **Cards:** Container principal para seções
- **Badges:** Indicadores de qualidade e status
- **Tabs:** Organização de conteúdo
- **Buttons:** Ações primárias e secundárias
- **Inputs:** Formulários de entrada

### Responsividade
- **Mobile First:** Design otimizado para dispositivos móveis
- **Breakpoints:** sm, md, lg, xl
- **Grid System:** CSS Grid e Flexbox
- **Touch Friendly:** Elementos com tamanho adequado para toque

## 🔧 Configuração e Deploy

### Requisitos
- Node.js 18+
- npm ou yarn
- Base de dados PostgreSQL (Prisma)
- Variáveis de ambiente configuradas

### Instalação
```bash
npm install recharts lucide-react
npm install @types/recharts --save-dev
```

### Desenvolvimento
```bash
npm run dev
# Acesse http://localhost:3000/portfolio-master
```

### Build
```bash
npm run build
npm start
```

## 📊 Performance

### Otimizações Implementadas
- **Lazy Loading:** Gráficos carregados sob demanda
- **Memoização:** Cálculos custosos em cache
- **Debounce:** Busca de ETFs com delay
- **Batch Updates:** Recálculos agrupados

### Métricas de Performance
- **First Paint:** < 1s
- **Interactive:** < 2s
- **Bundle Size:** Otimizado com tree-shaking
- **API Calls:** Minimizadas com cache

## 🧪 Testes

### Validações Implementadas
- **TypeScript:** Tipagem estática completa
- **Input Validation:** Valores mínimos/máximos
- **Error Handling:** Tratamento de erros de API
- **Loading States:** Feedback visual durante carregamento

### Cenários de Teste
1. Onboarding completo com diferentes perfis
2. Seleção/desmarcação de ETFs
3. Busca manual de ETFs
4. Recálculo automático da carteira
5. Visualização de gráficos
6. Responsividade em diferentes telas

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas
- **Comparação de Carteiras:** Múltiplos portfolios lado a lado
- **Alertas Automáticos:** Notificações de rebalanceamento
- **Histórico de Decisões:** Log de mudanças na carteira
- **Integração com Corretoras:** Execução automática de ordens
- **AI Insights:** Recomendações baseadas em IA

### Otimizações Técnicas
- **PWA:** Aplicativo web progressivo
- **Offline Mode:** Funcionalidade sem internet
- **Real-time Updates:** WebSockets para dados em tempo real
- **Advanced Analytics:** Métricas mais sofisticadas

## 📞 Suporte

### Documentação Adicional
- **API Reference:** `/docs/api`
- **Component Library:** `/docs/components`
- **User Guide:** `/docs/user-guide`

### Contato
- **Desenvolvimento:** Equipe ETF Curator
- **Bugs:** GitHub Issues
- **Sugestões:** Feedback direto na aplicação

---

**Versão:** 2.0.0  
**Última Atualização:** Janeiro 2025  
**Status:** Produção 