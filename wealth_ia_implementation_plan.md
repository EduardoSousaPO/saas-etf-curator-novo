# Plano de Implementação: Wealth IA - Vista

## Análise do Estado Atual

### Funcionalidades Existentes ✅
1. **Portfolio Master Funcional**: Sistema completo de criação de carteiras com otimização Markowitz
2. **Base de Dados Robusta**: 1.370+ ETFs reais com métricas completas
3. **Dashboard de Tracking**: Interface para acompanhar portfolios com performance real
4. **Sistema de Trades**: API básica para registro manual de operações
5. **Estrutura Supabase**: Tabelas fundamentais já criadas
6. **Performance Calculation**: Cálculo básico de TWR via yfinance

### Estrutura de Banco Atual ✅
- `user_portfolio_allocations`: Carteiras dos usuários
- `portfolio_tracking`: Registro de compras
- `portfolio_plans`: Planos de carteira (recém-criado)
- `portfolio_plan_versions`: Versionamento de planos
- `portfolio_target_allocations`: Alocações alvo com bandas
- `trades`: Sistema de trades
- `cashflows`: Fluxos de caixa
- `fx_rates`: Taxas de câmbio
- `timeline_events`: Eventos da timeline
- `planned_contributions`: Aportes programados

### Lacunas Identificadas ❌
1. **Interface Wealth IA**: Dashboard unificado alvo vs real
2. **Gestão de Aportes**: Sistema automatizado de distribuição
3. **OCR para Prints**: Upload e processamento de ordens
4. **Performance Multi-moeda**: XIRR e TWR completos
5. **Rebalanceamento Inteligente**: Sistema por bandas
6. **Timeline Visual**: Interface de eventos
7. **Integração Portfolio Master → Wealth IA**: Fluxo completo

---

## Roadmap de Implementação

### Sprint 1: Fundação e Integração (5 dias)
**Objetivo**: Conectar Portfolio Master ao sistema Wealth IA

#### Tarefas:
1. **Função "Salvar como Plano de Carteira"**
   - Modificar `UnifiedPortfolioMaster.tsx` para salvar em `portfolio_plans`
   - Criar versão inicial em `portfolio_plan_versions`
   - Salvar alocações em `portfolio_target_allocations` com bandas padrão (±5%)

2. **API de Planos de Carteira**
   - `POST /api/wealth/portfolio-plans` - Criar plano
   - `GET /api/wealth/portfolio-plans` - Listar planos do usuário
   - `PUT /api/wealth/portfolio-plans/:id` - Atualizar plano

3. **Função "Iniciar Implementação"**
   - Criar `implementation_run` com lista priorizada
   - Calcular ordem de compras baseada em alocação alvo
   - API `POST /api/wealth/start-implementation`

### Sprint 2: Dashboard Wealth IA (7 dias)
**Objetivo**: Interface principal alvo vs real

#### Tarefas:
1. **Componente WealthDashboard**
   - Visão geral: alvo vs atual
   - Gráfico de pizza comparativo
   - Lista de próximas ações priorizadas
   - Status de implementação (% completo)

2. **Seção de Aportes**
   - Input para novo aporte (valor + data)
   - Cálculo automático da distribuição ideal
   - Preview do impacto na carteira
   - Botão "Confirmar Aporte"

3. **APIs de Suporte**
   - `GET /api/wealth/dashboard/:portfolioId` - Dados do dashboard
   - `POST /api/wealth/calculate-contribution` - Calcular distribuição
   - `POST /api/wealth/confirm-contribution` - Confirmar aporte

### Sprint 3: Registro de Trades Avançado (6 dias)
**Objetivo**: Sistema completo de entrada de operações

#### Tarefas:
1. **Interface Manual Guiada**
   - Formulário inteligente com autocomplete
   - Validação em tempo real
   - Cálculo automático de impacto na carteira

2. **Upload CSV/OFX**
   - Parser para formatos populares (XP, Rico, Inter, etc.)
   - Mapeamento automático de campos
   - Validação e confirmação antes de salvar

3. **OCR para Prints** (Funcionalidade Premium)
   - Upload de imagem via drag & drop
   - Processamento via Perplexity AI para extração
   - Preenchimento automático + confirmação manual
   - API `POST /api/wealth/ocr-trade`

### Sprint 4: Performance Multi-moeda (5 days)
**Objetivo**: Cálculos precisos de TWR e XIRR

#### Tarefas:
1. **Sistema de FX Rates**
   - Coleta automática USD/BRL via API externa
   - Cache diário em `fx_rates`
   - Conversão histórica para cálculos

2. **Engine de Performance**
   - TWR (Time-Weighted Return) considerando multi-moeda
   - XIRR (Internal Rate of Return) para aportes irregulares
   - Cálculo de dividendos recebidos
   - Dedução automática de taxas de ETFs

3. **APIs de Performance**
   - `GET /api/wealth/performance/:portfolioId` - Métricas completas
   - `GET /api/wealth/performance/benchmark` - Comparação com índices

### Sprint 5: Rebalanceamento Inteligente (4 days)
**Objetivo**: Sistema automatizado por bandas

#### Tarefas:
1. **Engine de Rebalanceamento**
   - Detecção automática de desvios das bandas
   - Cálculo de ordens necessárias (compra/venda)
   - Priorização por maior desvio percentual
   - Otimização para minimizar número de trades

2. **Interface de Rebalanceamento**
   - Alertas visuais quando bandas são ultrapassadas
   - Preview das ordens sugeridas
   - Aprovação manual antes da execução
   - Histórico de rebalanceamentos

### Sprint 6: Timeline e UX Final (3 days)
**Objetivo**: Interface visual e experiência fluida

#### Tarefas:
1. **Timeline Visual**
   - Componente de linha do tempo
   - Eventos: aportes, trades, rebalanceamentos, dividendos
   - Filtros por tipo e período
   - Export para PDF

2. **Polimento UX**
   - Animações e transições suaves
   - Loading states inteligentes
   - Tooltips explicativos
   - Design responsivo mobile-first

---

## Especificações Técnicas

### Arquitetura
```
Portfolio Master (Existente)
    ↓ [Salvar como Plano]
Wealth IA Dashboard
    ├── Alvo vs Real
    ├── Gestão de Aportes
    ├── Registro de Trades
    ├── Performance Tracking
    ├── Rebalanceamento
    └── Timeline
```

### Stack Tecnológico
- **Frontend**: React/Next.js + TypeScript + Tailwind
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **OCR**: Perplexity AI MCP
- **Performance**: Custom algorithms
- **FX Data**: ExchangeRate-API ou similar

### Fluxo Principal
1. **Criação**: Portfolio Master → Salvar Plano → Wealth IA
2. **Implementação**: Wealth IA → Registrar Trades → Acompanhar Progresso
3. **Manutenção**: Aportes → Rebalanceamento → Performance Tracking

---

## Critérios de Sucesso

### Funcionalidades Core ✅
- [ ] Salvar carteira recomendada como plano
- [ ] Dashboard alvo vs real funcionando
- [ ] Registro de trades (manual, CSV, OCR)
- [ ] Cálculo de aportes automatizado
- [ ] Performance TWR/XIRR multi-moeda
- [ ] Rebalanceamento por bandas
- [ ] Timeline de eventos

### UX Requirements ✅
- [ ] Interface simples o suficiente para usuário de 12 anos
- [ ] Fluxo de registro de trade em < 3 cliques
- [ ] Tempo de carregamento < 2 segundos
- [ ] Mobile-responsive
- [ ] Sem alucinações ou dados incorretos

### Performance ✅
- [ ] Suporte a portfolios com 50+ ETFs
- [ ] Cálculos em tempo real (< 1s)
- [ ] Histórico de 10+ anos
- [ ] Precisão de 99.9% nos cálculos

---

## Recursos Necessários

### MCPs Utilizados
- **mcp-supabase**: Todas as operações de banco
- **mcp-perplexity**: OCR e análises de mercado
- **mcp-sequential**: Orquestração de tarefas complexas
- **mcp-memory**: Contexto durante desenvolvimento

### APIs Externas
- **ExchangeRate-API**: Taxas de câmbio históricas
- **Yahoo Finance**: Preços e dividendos (via yfinance)

### Estimativa de Tempo
- **Total**: 30 dias úteis (6 sprints)
- **Complexidade**: Média-Alta
- **Risco**: Baixo (base sólida existente)

---

## Próximos Passos

1. ✅ **Análise Completa** - Concluída
2. 🔄 **Sprint 1**: Fundação e Integração
3. ⏳ **Sprint 2**: Dashboard Wealth IA
4. ⏳ **Sprint 3**: Registro de Trades
5. ⏳ **Sprint 4**: Performance Multi-moeda
6. ⏳ **Sprint 5**: Rebalanceamento
7. ⏳ **Sprint 6**: Timeline e UX

**Início da Implementação**: Imediatamente após aprovação
**Entrega Estimada**: 30 dias úteis

---

*Documento criado em: Janeiro 2025*
*Versão: 1.0*
*Status: Aprovado para Implementação*

