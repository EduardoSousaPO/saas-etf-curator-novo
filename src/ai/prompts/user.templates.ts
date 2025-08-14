/**
 * User Templates - Vista ETF AI
 * Templates para síntese final de respostas
 */

import { IntentName } from '../intents';

export interface SynthesisContext {
  intent: IntentName;
  parsed: any;
  results: any[];
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  mode?: 'simulate' | 'execute';
}

/**
 * Template principal para síntese de resposta
 */
export const USER_TEMPLATE_SYNTHESIZE = (context: SynthesisContext) => {
  const { intent, parsed, results, userLevel = 'intermediate', mode = 'simulate' } = context;
  
  const resultsJson = JSON.stringify(results, null, 2).slice(0, 15000); // Limitar tamanho
  
  return `
## CONTEXTO DA SOLICITAÇÃO
**Intent**: ${intent}
**Modo**: ${mode.toUpperCase()}
**Nível do usuário**: ${userLevel}
**Parâmetros**: ${JSON.stringify(parsed, null, 2)}

## RESULTADOS DAS APIS
${resultsJson}

## INSTRUÇÕES PARA RESPOSTA

### Estrutura obrigatória:
1. **Saudação + contexto** (1 linha)
2. **Resultados principais** (formato adequado ao intent)
3. **Próximos passos** (Simular/Aplicar/Exportar)
4. **Disclaimers educativos** (quando apropriado)
5. **Origem dos dados** (endpoint + trace_id)

### Regras de formatação:
- Use PT-BR claro e direto
- Adapte linguagem ao nível do usuário (${userLevel})
- Inclua emojis com moderação para clareza
- Use listas e estruturas visuais
- Máximo 500 palavras (exceto para análises complexas)

### Próximos passos por intent:
- **CREATE_OPTIMIZED_PORTFOLIO**: Simular → Aplicar → Acompanhar no Dashboard
- **FILTER_ETFS**: Refinar filtros → Comparar selecionados → Adicionar à carteira
- **GET_RANKINGS**: Ver detalhes → Comparar top 3 → Analisar adequação
- **COMPARE_ETFS**: Análise detalhada → Escolher melhor → Adicionar à carteira
- **GET_DASHBOARD_PERFORMANCE**: Analisar tendências → Rebalancear se necessário → Planejar aportes

### Disclaimers por contexto:
- **Carteiras**: "Esta é uma sugestão educativa baseada em dados históricos. Investimentos envolvem riscos."
- **Comparações**: "Análise baseada em dados históricos. Performance passada não garante resultados futuros."
- **Rankings**: "Rankings baseados em métricas quantitativas. Considere seus objetivos pessoais."
- **Performance**: "Resultados baseados em dados reais da sua carteira. Consulte um profissional para decisões importantes."

### Tratamento de erros:
- Se results vazio: "Não consegui obter dados no momento. Tente novamente."
- Se erro na API: "Houve um problema técnico. Vou tentar uma abordagem alternativa."
- Se dados incompletos: "Tenho informações parciais. Posso complementar com outra consulta."

Gere uma resposta seguindo exatamente esta estrutura.
`;
};

/**
 * Templates específicos por intent
 */
export const INTENT_TEMPLATES = {
  CREATE_OPTIMIZED_PORTFOLIO: (context: SynthesisContext) => `
${USER_TEMPLATE_SYNTHESIZE(context)}

### Específico para carteiras:
- Mostre alocação percentual clara
- Explique a lógica da otimização
- Inclua métricas de risco (volatilidade, Sharpe)
- Compare com benchmarks relevantes
- Destaque os benefícios da diversificação
- Mencione rebalanceamento futuro
`,

  FILTER_ETFS: (context: SynthesisContext) => `
${USER_TEMPLATE_SYNTHESIZE(context)}

### Específico para filtros:
- Mostre quantos ETFs foram encontrados
- Liste os top 5-10 resultados
- Destaque critérios mais importantes (taxa, patrimônio)
- Sugira refinamentos se muitos resultados
- Ofereça comparação dos melhores
`,

  GET_RANKINGS: (context: SynthesisContext) => `
${USER_TEMPLATE_SYNTHESIZE(context)}

### Específico para rankings:
- Explique critério do ranking
- Mostre top 10 com métricas chave
- Destaque surpresas ou destaques
- Contextualize performance com mercado
- Sugira análise mais detalhada
`,

  COMPARE_ETFS: (context: SynthesisContext) => `
${USER_TEMPLATE_SYNTHESIZE(context)}

### Específico para comparações:
- Tabela comparativa clara
- Destaque prós/contras de cada ETF
- Inclua correlação se relevante
- Recomende baseado em diferentes perfis
- Explique trade-offs (custo vs performance)
`,

  GET_DASHBOARD_PERFORMANCE: (context: SynthesisContext) => `
${USER_TEMPLATE_SYNTHESIZE(context)}

### Específico para performance:
- Mostre retorno total e período
- Compare com benchmarks
- Destaque melhores/piores posições
- Analise tendências recentes
- Sugira ações se necessário (rebalanceamento)
`,
};

/**
 * Templates por nível de usuário
 */
export const USER_LEVEL_ADAPTATIONS = {
  beginner: {
    tone: "explicativo e educativo",
    vocabulary: "simples, evitar jargões",
    context: "explicar conceitos básicos",
    examples: "usar analogias do dia a dia",
    warnings: "enfatizar educação e riscos"
  },
  
  intermediate: {
    tone: "informativo e direto",
    vocabulary: "técnico moderado",
    context: "assumir conhecimento básico",
    examples: "focar em casos práticos",
    warnings: "disclaimers padrão"
  },
  
  advanced: {
    tone: "técnico e preciso",
    vocabulary: "usar termos financeiros",
    context: "análises mais profundas",
    examples: "casos complexos e nuances",
    warnings: "disclaimers concisos"
  }
};

/**
 * Template para modo de execução
 */
export const MODE_TEMPLATES = {
  simulate: `
🔍 **MODO SIMULAÇÃO**: Estes são resultados simulados para análise.

Para aplicar estas mudanças na sua carteira real:
1. Revise os resultados cuidadosamente
2. Clique em "Aplicar" se estiver satisfeito
3. Confirme a execução na próxima tela
`,

  execute: `
✅ **MODO EXECUÇÃO**: Estas alterações foram aplicadas na sua carteira.

Próximos passos:
1. Acompanhe no Dashboard
2. Configure alertas se desejar
3. Revise periodicamente para rebalanceamento
`
};

/**
 * Template para citação de origem
 */
export const ORIGIN_CITATION_TEMPLATE = (results: any[]) => {
  const citations = results
    .filter(r => r.endpoint && r.trace_id)
    .map(r => `${r.tool}: ${r.endpoint} (trace: ${r.trace_id})`)
    .join(', ');
    
  return citations ? `\n\n*Origem: ${citations}*` : '';
};

/**
 * Template para erros
 */
export const ERROR_TEMPLATES = {
  api_timeout: "A consulta está demorando mais que o esperado. Vamos tentar uma abordagem mais rápida.",
  api_error: "Tive um problema técnico ao acessar os dados. Pode tentar novamente em alguns instantes?",
  validation_error: "Alguns parâmetros precisam ser ajustados. Vou te ajudar a corrigir:",
  rate_limit: "Você está fazendo muitas consultas. Aguarde um momento antes de tentar novamente.",
  no_data: "Não encontrei dados para estes critérios. Vamos tentar com parâmetros mais amplos?",
  partial_data: "Consegui informações parciais. Posso complementar com uma consulta adicional."
};

/**
 * Utilitário para construir resposta completa
 */
export function buildUserResponse(context: SynthesisContext): string {
  const template = INTENT_TEMPLATES[context.intent] || USER_TEMPLATE_SYNTHESIZE;
  return template(context);
}

