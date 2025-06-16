# ETF Curator - Roadmap de Melhorias

Este documento apresenta um plano de implementação para transformar o ETF Curator em uma consultoria de investimentos digital especializada em ETFs, com base na análise do projeto atual e nas recomendações do arquivo `prompt_manus_melhorias`.

## Visão Geral do Projeto Atual

O ETF Curator atualmente possui:

- Interface para comparação de ETFs
- Sistema de rankings de ETFs
- Screener (filtro) para encontrar ETFs
- Funcionalidades básicas de análise de dados
- Backend com Prisma e Supabase
- Autenticação básica
- Sistema de pagamentos via Stripe

## Priorização de Melhorias

Após análise das recomendações, identificamos as seguintes melhorias organizadas por prioridade e factibilidade técnica:

### Fase 1: Fundação e Quick Wins (1-3 meses)

#### 1. Simplificação do Comparador de ETFs - ALTA PRIORIDADE

**Viabilidade**: Alta - O comparador já existe e pode ser melhorado rapidamente.

**Implementação**:
- Refatorar o componente `ComparisonTable` para agrupar métricas por categorias expansíveis
- Adicionar sistema de tooltips explicativos para cada métrica
- Melhorar o componente `ComparisonInsights` para destacar diferenças significativas
- Implementar visualizações comparativas mais intuitivas no `ComparisonCharts`

**Arquivos envolvidos**:
- `src/components/comparator/ComparisonTable.tsx`
- `src/components/comparator/ComparisonInsights.tsx`
- `src/components/comparator/ComparisonCharts.tsx`

#### 2. Glossário Contextual Inteligente - ALTA PRIORIDADE

**Viabilidade**: Alta - Pode ser implementado como componente de UI reutilizável.

**Implementação**:
- Criar banco de dados de termos e definições financeiras
- Desenvolver componente de tooltip contextual reutilizável
- Implementar sistema para identificar termos técnicos no conteúdo
- Integrar com componentes existentes

**Arquivos novos a criar**:
- `src/lib/glossary/terms.ts` - Base de dados de termos
- `src/components/ui/ContextualGlossary.tsx` - Componente reutilizável

#### 3. Análise de Texto Natural sobre Comparações - MÉDIA PRIORIDADE

**Viabilidade**: Média - Requer integrações com LLMs, mas tem base no componente `ComparisonInsights`.

**Implementação**:
- Integrar API de OpenAI/Anthropic para análise de dados
- Desenvolver templates para diferentes cenários de comparação
- Expandir o componente `ComparisonInsights` para utilizar análise em linguagem natural
- Criar sistema de cache para reduzir chamadas à API

**Arquivos envolvidos**:
- `src/components/comparator/ComparisonInsights.tsx`
- `src/lib/ai/text-analysis.ts` (novo)

#### 4. Assistente Virtual Especializado em ETFs - MÉDIA PRIORIDADE

**Viabilidade**: Média - Requer integração com APIs de LLM e nova interface.

**Implementação**:
- Desenvolver componente de chat flutuante
- Integrar com APIs de OpenAI/Anthropic
- Criar prompts especializados para o contexto de ETFs
- Implementar sistema de feedback e melhoria contínua

**Arquivos novos a criar**:
- `src/components/assistant/AssistantChat.tsx`
- `src/lib/ai/assistant.ts`
- `src/app/api/assistant/route.ts`

#### 5. Onboarding Personalizado por Perfil - BAIXA PRIORIDADE (FASE 1)

**Viabilidade**: Média - Requer modificações no sistema de autenticação e perfil.

**Implementação**:
- Expandir modelo de usuário para incluir perfil e preferências
- Criar fluxo de onboarding com questionário interativo
- Desenvolver sistema para armazenar perfil no Supabase
- Implementar lógica para personalizar a experiência baseada no perfil

**Arquivos envolvidos**:
- `prisma/schema.prisma` (modificação)
- `src/components/onboarding/OnboardingWizard.tsx` (expansão)

### Fase 2: Expansão e Engajamento (3-6 meses)

#### 6. Dashboard Personalizado - ALTA PRIORIDADE (FASE 2)

**Viabilidade**: Média - Requer nova interface e sistema de persistência.

**Implementação**:
- Desenvolver widgets configuráveis para diferentes métricas
- Criar sistema de drag-and-drop para reorganização
- Implementar persistência de layout no banco de dados
- Desenvolver presets para diferentes níveis de experiência

**Arquivos novos a criar**:
- `src/components/dashboard/DashboardLayout.tsx`
- `src/components/dashboard/widgets/`
- `src/app/dashboard/page.tsx`

#### 7. Alertas Inteligentes - MÉDIA PRIORIDADE

**Viabilidade**: Média - Requer sistema de notificação e processamento em background.

**Implementação**:
- Criar modelo de dados para alertas personalizados
- Desenvolver interface para configuração de alertas
- Implementar sistema de processamento de alertas
- Criar sistema de notificações por email/push

**Arquivos novos a criar**:
- `prisma/migrations/alert_system.sql`
- `src/components/alerts/AlertManager.tsx`
- `src/app/api/alerts/route.ts`

#### 8. Recomendador Personalizado de ETFs - ALTA PRIORIDADE (FASE 2)

**Viabilidade**: Média-Alta - Pode aproveitar dados existentes com nova lógica.

**Implementação**:
- Desenvolver sistema de embeddings para características de ETFs
- Implementar algoritmo de matching baseado em perfil
- Criar interface para exibição de recomendações
- Implementar sistema de feedback

**Arquivos novos a criar**:
- `src/lib/ai/recommendations.ts`
- `src/components/recommendations/ETFRecommendations.tsx`
- `src/app/recommendations/page.tsx`

### Fase 3: Diferenciação Avançada (6-12 meses)

#### 9. Simulador de Carteiras com Projeções IA - MÉDIA PRIORIDADE

**Viabilidade**: Baixa-Média - Requer desenvolvimento complexo de algoritmos estatísticos.

**Implementação**:
- Desenvolver modelos estatísticos para projeção de desempenho
- Implementar simulações Monte Carlo para diferentes cenários
- Criar visualizações interativas para resultados
- Permitir comparação entre diferentes composições

**Arquivos novos a criar**:
- `src/lib/simulation/portfolio-simulator.ts`
- `src/components/simulation/PortfolioSimulator.tsx`
- `src/app/simulation/page.tsx`

#### 10. Módulo Educacional Interativo - BAIXA PRIORIDADE (FASE 3)

**Viabilidade**: Média - Requer criação de conteúdo e novos componentes.

**Implementação**:
- Desenvolver estrutura de conteúdo progressivo
- Implementar quizzes e exercícios interativos
- Criar sistema de tracking de progresso
- Integrar com perfil do usuário

**Arquivos novos a criar**:
- `src/app/learn/page.tsx`
- `src/components/learning/Quiz.tsx`
- `src/components/learning/Course.tsx`
- `src/lib/learning/content.ts`

## Estratégia de Implementação

### Abordagem Técnica

1. **Incremental**: Implementar melhorias de forma gradual, começando com "quick wins"
2. **Modular**: Manter o código organizado em componentes reutilizáveis
3. **Testável**: Incluir testes para funcionalidades críticas
4. **Performance**: Otimizar renderização e processamento de dados

### Integrações de IA

1. **OpenAI/Anthropic**: Utilizar para o assistente virtual e análise de texto
2. **Caching**: Implementar estratégias de cache para reduzir chamadas repetitivas
3. **Processamento local quando possível**: Para reduzir custos com APIs

### Considerações sobre UX

1. **Simplicidade**: Manter interfaces intuitivas para diversos perfis de usuário
2. **Progressão**: Revelar complexidade gradualmente conforme o usuário ganha experiência
3. **Feedback**: Fornecer feedback visual sobre processamentos e ações
4. **Mobile-first**: Garantir que todas as interfaces sejam responsivas

## Próximos Passos Imediatos

1. Implementar as melhorias no comparador de ETFs
2. Desenvolver o glossário contextual
3. Integrar análise de texto natural nas comparações
4. Implementar versão inicial do assistente virtual
5. Expandir o sistema de onboarding

## Conclusão

A transformação do ETF Curator em uma consultoria digital de investimentos especializada em ETFs é viável com base nas funcionalidades existentes. O plano proposto mantém o foco em experiência do usuário e adiciona camadas de personalização e inteligência artificial de forma gradual.

As melhorias priorizadas na Fase 1 trarão valor imediato aos usuários, enquanto estabelecem a base para as funcionalidades mais avançadas das Fases 2 e 3.

É recomendável revisar este roadmap regularmente, ajustando prioridades com base no feedback dos usuários e nas capacidades técnicas disponíveis. 