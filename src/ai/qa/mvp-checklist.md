# MVP Checklist - Vista ETF AI Chat

## ✅ **FASE 1 - FUNDAÇÃO (MVP)**

### **🏗️ Infraestrutura Base**
- [x] Estrutura `/src/ai/` criada
- [x] Configuração OpenAI (`agent.config.ts`)
- [x] Catálogo de intents fechado (`intents.ts`)
- [x] Registry de tools (`tools.registry.ts`)
- [x] Sistema de validação (`validators.ts`)
- [x] Orquestrador principal (`orchestrator.ts`)
- [x] Prompts sistematizados (`prompts/`)
- [x] Integração Perplexity (`news.perplexity.ts`)

### **🗄️ Base de Dados**
- [x] Tabelas Supabase criadas:
  - [x] `chat_projects` - Organização por projetos
  - [x] `chat_conversations` - Múltiplas conversas
  - [x] `chat_messages` - Mensagens do chat
  - [x] `chat_function_logs` - Logs de execução
  - [x] `chat_insights` - Insights gerados

### **🎯 5 Intents MVP**
- [ ] **CREATE_OPTIMIZED_PORTFOLIO** - Testado e funcional
- [ ] **FILTER_ETFS** - Testado e funcional  
- [ ] **GET_RANKINGS** - Testado e funcional
- [ ] **COMPARE_ETFS** - Testado e funcional
- [ ] **GET_DASHBOARD_PERFORMANCE** - Testado e funcional

---

## 🧪 **TESTES OBRIGATÓRIOS**

### **Teste 1: Classificação de Intent**
```
Input: "Quero criar uma carteira conservadora para aposentadoria com R$ 50.000"
Expected: CREATE_OPTIMIZED_PORTFOLIO
Status: [ ] Passou
```

### **Teste 2: Pré-validação**
```
Input: "Compare SPY vs VTI"
Expected: Extrair symbols=['SPY', 'VTI']
Status: [ ] Passou
```

### **Teste 3: Execução de Tool**
```
Intent: GET_RANKINGS
Input: {category: 'BestPerformance', limit: 5}
Expected: Lista de 5 ETFs com performance
Status: [ ] Passou
```

### **Teste 4: Síntese de Resposta**
```
Input: Dados de comparação SPY vs VTI
Expected: Resposta em PT-BR com prós/contras
Status: [ ] Passou
```

### **Teste 5: Pós-validação**
```
Check: Resposta contém origem dos dados
Check: Resposta tem próximos passos
Check: Resposta tem disclaimers
Status: [ ] Passou
```

---

## 📊 **MÉTRICAS DE QUALIDADE**

### **Performance**
- [ ] Tempo resposta < 8s (p95)
- [ ] Taxa de sucesso > 90%
- [ ] Classificação de intent > 95% precisão

### **Qualidade**
- [ ] Anti-alucinação funcional
- [ ] Todas as respostas citam origem
- [ ] Disclaimers educativos presentes
- [ ] Próximos passos oferecidos

### **Usabilidade**
- [ ] Follow-up questions claras
- [ ] Linguagem adaptada ao usuário
- [ ] Respostas em PT-BR correto

---

## 🔧 **APIs NECESSÁRIAS**

### **Endpoints Existentes (Verificar)**
- [ ] `/api/portfolio/unified-master` - Portfolio Master
- [ ] `/api/etfs/screener` - Filtros avançados
- [ ] `/api/etfs/rankings` - Rankings dinâmicos
- [ ] `/api/etfs/compare` - Comparação de ETFs
- [ ] `/api/wealth/dashboard` - Performance dashboard

### **Novos Endpoints**
- [ ] `/api/ai/chat` - Endpoint principal do chat
- [ ] `/api/ai/projects` - Gerenciar projetos
- [ ] `/api/ai/conversations` - Gerenciar conversas
- [ ] `/api/ai/insights` - Gerar insights

---

## 🎨 **INTERFACE MÍNIMA**

### **Componentes Essenciais**
- [ ] `ChatInterface.tsx` - Interface principal
- [ ] `ProjectSidebar.tsx` - Sidebar de projetos
- [ ] `MessageBubble.tsx` - Bolhas de mensagem
- [ ] `FunctionCallCard.tsx` - Cards de função
- [ ] `InsightCard.tsx` - Cards de insight

### **Funcionalidades UI**
- [ ] Envio de mensagem
- [ ] Histórico de conversa
- [ ] Indicador de typing
- [ ] Botões de ação rápida
- [ ] Export de conversa

---

## 🛡️ **GUARDRAILS CRÍTICOS**

### **Validações Obrigatórias**
- [ ] Escopo restrito a ETFs
- [ ] Dados apenas de APIs internas
- [ ] Rate limiting implementado
- [ ] Sanitização de entrada
- [ ] Logs de auditoria

### **Compliance**
- [ ] Disclaimers educativos
- [ ] Não aconselhamento personalizado
- [ ] Transparência de riscos
- [ ] Rastreabilidade completa

---

## 📋 **CHECKLIST FINAL MVP**

### **Funcional**
- [ ] Usuário consegue fazer pergunta
- [ ] Sistema classifica intent corretamente
- [ ] APIs são chamadas com sucesso
- [ ] Resposta é sintetizada em PT-BR
- [ ] Próximos passos são oferecidos

### **Técnico**
- [ ] TypeScript sem erros
- [ ] Testes unitários passando
- [ ] Performance dentro do alvo
- [ ] Logs estruturados
- [ ] Error handling robusto

### **UX**
- [ ] Interface intuitiva
- [ ] Feedback visual adequado
- [ ] Tempo de resposta aceitável
- [ ] Mensagens de erro claras
- [ ] Onboarding simples

---

## 🚀 **CRITÉRIOS DE SUCESSO**

### **MVP Aprovado Se:**
1. ✅ Todas as 5 intents funcionam
2. ✅ Tempo de resposta < 8s
3. ✅ Taxa de sucesso > 90%
4. ✅ Interface básica funcional
5. ✅ Guardrails implementados
6. ✅ Dados sempre das APIs internas
7. ✅ Respostas em português correto
8. ✅ Sistema não alucina dados
9. ✅ Logs e rastreabilidade OK
10. ✅ Usuário consegue completar jornada

### **Próximo Passo:**
Após MVP aprovado → **FASE 2**: Projetos e organização

---

*Checklist atualizado em: ${new Date().toLocaleDateString('pt-BR')}*

