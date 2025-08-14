/**
 * Catálogo Fechado de Intents - Vista ETF AI
 * Define todas as intenções possíveis do usuário
 */

// Tipos de Intent (catálogo fechado)
export type IntentName =
  // MVP - 5 intents principais
  | "CREATE_OPTIMIZED_PORTFOLIO"   // Criar carteira otimizada via Portfolio Master
  | "FILTER_ETFS"                  // Filtrar ETFs com screener avançado
  | "GET_RANKINGS"                 // Obter rankings dinâmicos por categoria
  | "COMPARE_ETFS"                 // Comparar 2-6 ETFs
  | "GET_DASHBOARD_PERFORMANCE"    // Performance do dashboard/carteira
  // Futuras expansões
  | "SUGGEST_REBALANCING"          // Sugerir rebalanceamento (regra 5/25)
  | "PLAN_CONTRIBUTION"            // Planejar aportes ideais
  | "EXPLAIN_CONCEPT"              // Explicar conceitos financeiros
  | "GET_NEWS_RECENT"              // Notícias via Perplexity
  | "CONFIGURE_ALERTS";            // Configurar alertas inteligentes

// Interface da Intent
export interface Intent {
  name: IntentName;
  description: string;
  requiredFields: string[];        // Campos obrigatórios para pré-validação
  optionalFields?: string[];       // Campos opcionais
  allowedTools: string[];          // Tools permitidas para esta intent
  simulateByDefault: boolean;      // Se deve simular por padrão
  category: 'portfolio' | 'analysis' | 'data' | 'news' | 'config';
  complexity: 'low' | 'medium' | 'high';
  estimatedTimeMs: number;         // Tempo estimado de execução
}

// Catálogo completo de intents
export const INTENTS: Record<IntentName, Intent> = {
  // ===== MVP INTENTS =====
  CREATE_OPTIMIZED_PORTFOLIO: {
    name: "CREATE_OPTIMIZED_PORTFOLIO",
    description: "Criar carteira otimizada usando Portfolio Master com teoria de Markowitz",
    requiredFields: ["goal", "risk_profile", "amount", "currency"],
    optionalFields: ["time_horizon", "existing_portfolio"],
    allowedTools: ["portfolio_create_optimized", "dashboard_performance"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'high',
    estimatedTimeMs: 8000,
  },

  FILTER_ETFS: {
    name: "FILTER_ETFS",
    description: "Filtrar ETFs usando screener avançado com 50+ critérios",
    requiredFields: ["filters"],
    optionalFields: ["sort_primary", "sort_secondary", "limit"],
    allowedTools: ["screener_filter"],
    simulateByDefault: true,
    category: 'analysis',
    complexity: 'medium',
    estimatedTimeMs: 3000,
  },

  GET_RANKINGS: {
    name: "GET_RANKINGS",
    description: "Obter rankings dinâmicos de ETFs por categoria",
    requiredFields: ["category"],
    optionalFields: ["limit", "time_period"],
    allowedTools: ["rankings_get"],
    simulateByDefault: true,
    category: 'data',
    complexity: 'low',
    estimatedTimeMs: 2000,
  },

  COMPARE_ETFS: {
    name: "COMPARE_ETFS",
    description: "Comparar múltiplos ETFs com análise detalhada",
    requiredFields: ["symbols"],
    optionalFields: ["period", "metrics", "include_correlation"],
    allowedTools: ["compare_etfs", "performance_analysis", "analyze_correlation"],
    simulateByDefault: true,
    category: 'analysis',
    complexity: 'medium',
    estimatedTimeMs: 5000,
  },

  GET_DASHBOARD_PERFORMANCE: {
    name: "GET_DASHBOARD_PERFORMANCE",
    description: "Obter performance detalhada do dashboard/carteira",
    requiredFields: ["portfolio_id"],
    optionalFields: ["period", "benchmark", "include_projections"],
    allowedTools: ["dashboard_performance"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'medium',
    estimatedTimeMs: 4000,
  },

  // ===== FUTURAS EXPANSÕES =====
  SUGGEST_REBALANCING: {
    name: "SUGGEST_REBALANCING",
    description: "Sugerir rebalanceamento usando regra 5/25 de Larry Swedroe",
    requiredFields: ["portfolio_id"],
    optionalFields: ["next_contribution", "rebalance_type"],
    allowedTools: ["rebalance_suggest"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'high',
    estimatedTimeMs: 6000,
  },

  PLAN_CONTRIBUTION: {
    name: "PLAN_CONTRIBUTION",
    description: "Planejar aportes ideais baseado na carteira atual",
    requiredFields: ["portfolio_id", "amount"],
    optionalFields: ["frequency", "auto_invest"],
    allowedTools: ["rebalance_suggest", "contribution_optimizer"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'medium',
    estimatedTimeMs: 4000,
  },

  EXPLAIN_CONCEPT: {
    name: "EXPLAIN_CONCEPT",
    description: "Explicar conceitos financeiros e de ETFs",
    requiredFields: ["topic"],
    optionalFields: ["level", "examples", "context"],
    allowedTools: [], // Apenas texto via OpenAI
    simulateByDefault: true,
    category: 'data',
    complexity: 'low',
    estimatedTimeMs: 3000,
  },

  GET_NEWS_RECENT: {
    name: "GET_NEWS_RECENT",
    description: "Buscar notícias recentes sobre ETFs via Perplexity",
    requiredFields: ["query"],
    optionalFields: ["recencyDays", "sources", "language"],
    allowedTools: ["perplexity_news_search"],
    simulateByDefault: true,
    category: 'news',
    complexity: 'medium',
    estimatedTimeMs: 5000,
  },

  CONFIGURE_ALERTS: {
    name: "CONFIGURE_ALERTS",
    description: "Configurar alertas inteligentes para carteira",
    requiredFields: ["portfolio_id", "rules"],
    optionalFields: ["frequency", "channels"],
    allowedTools: ["alerts_configure"],
    simulateByDefault: false, // Alertas devem ser aplicados diretamente
    category: 'config',
    complexity: 'medium',
    estimatedTimeMs: 3000,
  },
};

// Utilitários para trabalhar com intents
export function getIntentByName(name: IntentName): Intent {
  return INTENTS[name];
}

export function getMVPIntents(): Intent[] {
  return [
    INTENTS.CREATE_OPTIMIZED_PORTFOLIO,
    INTENTS.FILTER_ETFS,
    INTENTS.GET_RANKINGS,
    INTENTS.COMPARE_ETFS,
    INTENTS.GET_DASHBOARD_PERFORMANCE,
  ];
}

export function getIntentsByCategory(category: Intent['category']): Intent[] {
  return Object.values(INTENTS).filter(intent => intent.category === category);
}

export function isValidIntent(name: string): name is IntentName {
  return Object.keys(INTENTS).includes(name as IntentName);
}

export function getIntentComplexity(name: IntentName): Intent['complexity'] {
  return INTENTS[name].complexity;
}

// Mapeamento de palavras-chave para intents (para classificação)
export const INTENT_KEYWORDS: Record<IntentName, string[]> = {
  CREATE_OPTIMIZED_PORTFOLIO: [
    'criar carteira', 'portfolio', 'otimizar', 'markowitz', 'alocação',
    'diversificar', 'investir', 'aposentadoria', 'casa', 'emergência', 'crescimento'
  ],
  FILTER_ETFS: [
    'filtrar', 'screener', 'buscar etfs', 'encontrar', 'critério',
    'taxa baixa', 'dividendo', 'setor', 'região', 'tamanho'
  ],
  GET_RANKINGS: [
    'ranking', 'melhores', 'top', 'lista', 'categoria',
    'performance', 'mais rentável', 'menor risco', 'maior liquidez'
  ],
  COMPARE_ETFS: [
    'comparar', 'versus', 'vs', 'diferença', 'qual melhor',
    'spy vs vti', 'análise comparativa', 'correlação'
  ],
  GET_DASHBOARD_PERFORMANCE: [
    'performance', 'carteira', 'dashboard', 'retorno',
    'como está', 'evolução', 'resultado', 'rendimento'
  ],
  SUGGEST_REBALANCING: [
    'rebalancear', 'rebalanceamento', 'ajustar', 'realinhar',
    'está desbalanceado', 'regra 5/25', 'larry swedroe'
  ],
  PLAN_CONTRIBUTION: [
    'aporte', 'contribuição', 'investir mais', 'onde aportar',
    'próximo investimento', 'distribuir', 'alocar'
  ],
  EXPLAIN_CONCEPT: [
    'explicar', 'o que é', 'como funciona', 'conceito',
    'definição', 'entender', 'aprender', 'educação'
  ],
  GET_NEWS_RECENT: [
    'notícias', 'news', 'acontecendo', 'mercado hoje',
    'últimas', 'recente', 'atualização', 'fed', 'economia'
  ],
  CONFIGURE_ALERTS: [
    'alerta', 'notificação', 'avisar', 'configurar',
    'monitorar', 'acompanhar', 'quando', 'se'
  ],
};

