/**
 * Intent Classifier Prompt - Vista ETF AI
 * Responsável por classificar mensagens do usuário em intents específicas
 */

export const CLASSIFIER_PROMPT = `
Você é um classificador de intenções INTELIGENTE para o Vista ETF AI.

IMPORTANTE: Considere o CONTEXTO CONVERSACIONAL antes de classificar.

Classifique a seguinte mensagem do usuário em UMA das intents abaixo:

## INTENTS DISPONÍVEIS (MVP):
- **CREATE_OPTIMIZED_PORTFOLIO**: Criar/otimizar carteira, alocar dinheiro, Portfolio Master
- **FILTER_ETFS**: Buscar/filtrar ETFs, screener, encontrar por critérios
- **GET_RANKINGS**: Rankings, melhores ETFs, top performers, listas por categoria
- **COMPARE_ETFS**: Comparar ETFs, análise comparativa, "X vs Y"
- **GET_DASHBOARD_PERFORMANCE**: Performance da carteira, dashboard, como está indo

## INTENTS FUTURAS (não implementadas ainda):
- **SUGGEST_REBALANCING**: Rebalanceamento, ajustar alocação, regra 5/25
- **PLAN_CONTRIBUTION**: Aportes, onde investir próximo dinheiro, distribuir
- **EXPLAIN_CONCEPT**: Explicar conceitos, "o que é", educação, definições
- **GET_NEWS_RECENT**: Notícias, últimas novidades, mercado hoje
- **CONFIGURE_ALERTS**: Alertas, notificações, monitoramento

## EXEMPLOS DE CLASSIFICAÇÃO:

**Mensagem**: "Quero criar uma carteira conservadora para aposentadoria com R$ 50.000"
**Intent**: CREATE_OPTIMIZED_PORTFOLIO

**Mensagem**: "Compare SPY vs VTI vs SCHB"
**Intent**: COMPARE_ETFS

**Mensagem**: "Quais são os melhores ETFs de dividendos?"
**Intent**: GET_RANKINGS

**Mensagem**: "Busco ETFs com taxa menor que 0.1% e patrimônio acima de $1B"
**Intent**: FILTER_ETFS

**Mensagem**: "Como está minha carteira? Qual a performance?"
**Intent**: GET_DASHBOARD_PERFORMANCE

**Mensagem**: "Minha carteira está desbalanceada, preciso rebalancear"
**Intent**: SUGGEST_REBALANCING

**Mensagem**: "Tenho R$ 5.000 para investir, onde devo alocar?"
**Intent**: PLAN_CONTRIBUTION

**Mensagem**: "O que é expense ratio?"
**Intent**: EXPLAIN_CONCEPT

**Mensagem**: "Quais as últimas notícias sobre ETFs?"
**Intent**: GET_NEWS_RECENT

## REGRAS DE CLASSIFICAÇÃO OTIMIZADAS:
1. Responda APENAS com o nome da intent (ex: CREATE_OPTIMIZED_PORTFOLIO)
2. Se ambíguo, escolha a intent mais específica baseada no contexto
3. Se menciona ETFs específicos com "vs", "versus", "comparar" → COMPARE_ETFS
4. Se pede "filtrar", "buscar", "encontrar" com critérios → FILTER_ETFS  
5. Se pede "melhores", "ranking", "top", "lista" → GET_RANKINGS
6. Se quer "criar", "otimizar", "alocar" carteira → CREATE_OPTIMIZED_PORTFOLIO
7. Se pergunta sobre "performance", "como está", "dashboard" → GET_DASHBOARD_PERFORMANCE
8. **PRIORIDADE**: Palavras-chave específicas têm precedência sobre contexto geral
9. **CONTEXTO**: Considere a intenção principal, não palavras secundárias

## PALAVRAS-CHAVE POR INTENT:

**CREATE_OPTIMIZED_PORTFOLIO**: criar, carteira, portfolio, otimizar, alocar, investir, aposentadoria, casa, emergência, crescimento, markowitz, diversificar, "quero investir", "preciso de uma carteira", "200 mil", valores monetários

**FILTER_ETFS**: filtrar, buscar, encontrar, screener, critério, taxa baixa, dividendo, setor, região, patrimônio, volume

**GET_RANKINGS**: ranking, melhores, top, lista, categoria, performance, mais rentável, menor risco, maior liquidez

**COMPARE_ETFS**: comparar, versus, vs, diferença, qual melhor, análise comparativa, correlação

**GET_DASHBOARD_PERFORMANCE**: performance, carteira, dashboard, retorno, como está, evolução, resultado, rendimento

Mensagem para classificar: "{{MESSAGE}}"

Responda apenas com o nome da intent:`;

export const CLASSIFIER_PROMPT_WITH_CONFIDENCE = `
${CLASSIFIER_PROMPT}

Além da intent, inclua um score de confiança (0-100):

Formato da resposta:
Intent: [NOME_DA_INTENT]
Confidence: [0-100]
Reasoning: [breve explicação]
`;

export const INTENT_EXAMPLES = {
  CREATE_OPTIMIZED_PORTFOLIO: [
    "Quero criar uma carteira conservadora para aposentadoria",
    "Como alocar R$ 100.000 em ETFs?",
    "Preciso de uma carteira diversificada para crescimento",
    "Otimizar meu portfolio com teoria de Markowitz",
    "Criar carteira para comprar casa em 5 anos"
  ],
  
  FILTER_ETFS: [
    "Busco ETFs com taxa menor que 0.1%",
    "ETFs de dividendos com yield acima de 3%",
    "Filtrar por setor tecnológico e baixo custo",
    "Encontrar ETFs internacionais com patrimônio >$1B",
    "Screener para ETFs de bonds com baixa volatilidade"
  ],
  
  GET_RANKINGS: [
    "Quais os melhores ETFs de 2024?",
    "Top 10 ETFs com melhor performance",
    "Ranking de ETFs por categoria",
    "Lista dos ETFs mais líquidos",
    "Melhores ETFs de baixo custo"
  ],
  
  COMPARE_ETFS: [
    "Compare SPY vs VTI",
    "Diferença entre QQQ e VGT",
    "SPY vs VTI vs SCHB - qual melhor?",
    "Análise comparativa BND vs AGG",
    "VEA versus VTIAX para internacional"
  ],
  
  GET_DASHBOARD_PERFORMANCE: [
    "Como está minha carteira?",
    "Performance do meu portfolio",
    "Quanto ganhei este ano?",
    "Dashboard da minha carteira",
    "Evolução dos meus investimentos"
  ]
};

export function buildClassifierPrompt(message: string): string {
  return CLASSIFIER_PROMPT.replace('{{MESSAGE}}', message);
}
