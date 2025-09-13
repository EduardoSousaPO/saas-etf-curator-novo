/**
 * Sistema de Intents Universal - Vista AI Chat
 * Expande o sistema de intents para cobrir qualquer tipo de pergunta
 */

import { IntentName, Intent } from './intents';
import { SupportedLanguage } from './language-detector';

// Novos intents universais
export type UniversalIntentName = IntentName 
  | "EXPLAIN_CONCEPT"              // Explicar conceitos financeiros
  | "GENERAL_QUESTION"             // Pergunta geral sobre investimentos
  | "VISTA_NAVIGATION"             // Ajuda com navegação no Vista
  | "EDUCATIONAL_CONTENT"          // Conteúdo educativo
  | "MARKET_ANALYSIS"              // Análise de mercado geral
  | "INVESTMENT_ADVICE"            // Conselhos de investimento
  | "TROUBLESHOOTING"              // Ajuda com problemas técnicos
  | "FEATURE_REQUEST"              // Solicitação de funcionalidades
  | "GREETING"                     // Saudações e conversas casuais
  | "FALLBACK_SMART";              // Fallback inteligente

// Intents universais expandidos
export const UNIVERSAL_INTENTS: Record<UniversalIntentName, Intent & { 
  multilingual: boolean;
  fallbackStrategy: 'vista_redirect' | 'web_search' | 'educational' | 'conversational';
  keywords: {
    'pt-BR': string[];
    'en-US': string[];
  };
}> = {
  // Intents existentes (referência)
  CREATE_OPTIMIZED_PORTFOLIO: {
    name: "CREATE_OPTIMIZED_PORTFOLIO",
    description: "Criar carteira otimizada usando Portfolio Master",
    requiredFields: ["goal", "risk_profile", "amount", "currency"],
    optionalFields: ["time_horizon", "existing_portfolio"],
    allowedTools: ["portfolio_create_optimized"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'high',
    estimatedTimeMs: 8000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['carteira', 'portfolio', 'otimizar', 'investir', 'aposentadoria', 'casa', 'emergência'],
      'en-US': ['portfolio', 'optimize', 'invest', 'retirement', 'house', 'emergency']
    }
  },
  
  COMPARE_ETFS: {
    name: "COMPARE_ETFS",
    description: "Comparar múltiplos ETFs",
    requiredFields: ["symbols"],
    optionalFields: ["period", "metrics"],
    allowedTools: ["compare_etfs"],
    simulateByDefault: true,
    category: 'analysis',
    complexity: 'medium',
    estimatedTimeMs: 5000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['comparar', 'versus', 'vs', 'diferença', 'qual melhor'],
      'en-US': ['compare', 'versus', 'vs', 'difference', 'which better']
    }
  },
  
  FILTER_ETFS: {
    name: "FILTER_ETFS",
    description: "Filtrar ETFs usando screener",
    requiredFields: ["filters"],
    optionalFields: ["sort_primary", "limit"],
    allowedTools: ["screener_filter"],
    simulateByDefault: true,
    category: 'analysis',
    complexity: 'medium',
    estimatedTimeMs: 3000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['filtrar', 'screener', 'buscar', 'encontrar', 'critério'],
      'en-US': ['filter', 'screener', 'search', 'find', 'criteria']
    }
  },
  
  GET_RANKINGS: {
    name: "GET_RANKINGS",
    description: "Obter rankings de ETFs",
    requiredFields: ["category"],
    optionalFields: ["limit", "time_period"],
    allowedTools: ["rankings_get"],
    simulateByDefault: true,
    category: 'data',
    complexity: 'low',
    estimatedTimeMs: 2000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['ranking', 'melhores', 'top', 'lista', 'categoria'],
      'en-US': ['ranking', 'best', 'top', 'list', 'category']
    }
  },
  
  GET_DASHBOARD_PERFORMANCE: {
    name: "GET_DASHBOARD_PERFORMANCE",
    description: "Performance do dashboard",
    requiredFields: ["portfolio_id"],
    optionalFields: ["period", "benchmark"],
    allowedTools: ["dashboard_performance"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'medium',
    estimatedTimeMs: 4000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['performance', 'dashboard', 'carteira', 'retorno'],
      'en-US': ['performance', 'dashboard', 'portfolio', 'returns']
    }
  },
  
  GET_NEWS_RECENT: {
    name: "GET_NEWS_RECENT",
    description: "Notícias recentes sobre mercado",
    requiredFields: ["query"],
    optionalFields: ["recencyDays", "sources"],
    allowedTools: ["perplexity_news_search"],
    simulateByDefault: true,
    category: 'news',
    complexity: 'medium',
    estimatedTimeMs: 5000,
    multilingual: true,
    fallbackStrategy: 'web_search',
    keywords: {
      'pt-BR': ['notícias', 'news', 'acontecendo', 'mercado hoje', 'últimas'],
      'en-US': ['news', 'happening', 'market today', 'latest', 'recent']
    }
  },
  
  // Novos intents universais
  EXPLAIN_CONCEPT: {
    name: "EXPLAIN_CONCEPT",
    description: "Explicar conceitos financeiros",
    requiredFields: ["concept"],
    optionalFields: ["level", "examples", "language"],
    allowedTools: [],
    simulateByDefault: true,
    category: 'data',
    complexity: 'low',
    estimatedTimeMs: 3000,
    multilingual: true,
    fallbackStrategy: 'educational',
    keywords: {
      'pt-BR': ['explicar', 'o que é', 'como funciona', 'conceito', 'definição', 'entender'],
      'en-US': ['explain', 'what is', 'how does', 'concept', 'definition', 'understand']
    }
  },
  
  GENERAL_QUESTION: {
    name: "GENERAL_QUESTION",
    description: "Pergunta geral sobre investimentos",
    requiredFields: ["question"],
    optionalFields: ["context", "user_level"],
    allowedTools: ["web_search", "educational_content"],
    simulateByDefault: true,
    category: 'data',
    complexity: 'low',
    estimatedTimeMs: 4000,
    multilingual: true,
    fallbackStrategy: 'web_search',
    keywords: {
      'pt-BR': ['como', 'quando', 'onde', 'porque', 'qual', 'devo', 'posso'],
      'en-US': ['how', 'when', 'where', 'why', 'what', 'should', 'can']
    }
  },
  
  VISTA_NAVIGATION: {
    name: "VISTA_NAVIGATION",
    description: "Ajuda com navegação no Vista",
    requiredFields: ["feature"],
    optionalFields: ["specific_action"],
    allowedTools: ["vista_guide"],
    simulateByDefault: true,
    category: 'config',
    complexity: 'low',
    estimatedTimeMs: 2000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['como usar', 'onde encontro', 'como acessar', 'ajuda', 'tutorial'],
      'en-US': ['how to use', 'where to find', 'how to access', 'help', 'tutorial']
    }
  },
  
  EDUCATIONAL_CONTENT: {
    name: "EDUCATIONAL_CONTENT",
    description: "Conteúdo educativo sobre investimentos",
    requiredFields: ["topic"],
    optionalFields: ["level", "format"],
    allowedTools: ["educational_generator"],
    simulateByDefault: true,
    category: 'data',
    complexity: 'medium',
    estimatedTimeMs: 5000,
    multilingual: true,
    fallbackStrategy: 'educational',
    keywords: {
      'pt-BR': ['aprender', 'estudar', 'curso', 'educação', 'ensinar', 'básico'],
      'en-US': ['learn', 'study', 'course', 'education', 'teach', 'basic']
    }
  },
  
  MARKET_ANALYSIS: {
    name: "MARKET_ANALYSIS",
    description: "Análise de mercado geral",
    requiredFields: ["market_topic"],
    optionalFields: ["timeframe", "region"],
    allowedTools: ["market_analyzer", "web_search"],
    simulateByDefault: true,
    category: 'analysis',
    complexity: 'high',
    estimatedTimeMs: 6000,
    multilingual: true,
    fallbackStrategy: 'web_search',
    keywords: {
      'pt-BR': ['mercado', 'análise', 'tendência', 'cenário', 'perspectiva'],
      'en-US': ['market', 'analysis', 'trend', 'scenario', 'outlook']
    }
  },
  
  INVESTMENT_ADVICE: {
    name: "INVESTMENT_ADVICE",
    description: "Conselhos de investimento",
    requiredFields: ["situation"],
    optionalFields: ["risk_tolerance", "goals"],
    allowedTools: ["advice_generator"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'high',
    estimatedTimeMs: 7000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['conselho', 'dica', 'recomendação', 'sugestão', 'orientação'],
      'en-US': ['advice', 'tip', 'recommendation', 'suggestion', 'guidance']
    }
  },
  
  TROUBLESHOOTING: {
    name: "TROUBLESHOOTING",
    description: "Ajuda com problemas técnicos",
    requiredFields: ["problem"],
    optionalFields: ["error_message", "context"],
    allowedTools: ["troubleshoot_guide"],
    simulateByDefault: true,
    category: 'config',
    complexity: 'medium',
    estimatedTimeMs: 3000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['problema', 'erro', 'não funciona', 'bug', 'falha'],
      'en-US': ['problem', 'error', 'not working', 'bug', 'issue']
    }
  },
  
  FEATURE_REQUEST: {
    name: "FEATURE_REQUEST",
    description: "Solicitação de funcionalidades",
    requiredFields: ["feature_description"],
    optionalFields: ["priority", "use_case"],
    allowedTools: ["feature_tracker"],
    simulateByDefault: true,
    category: 'config',
    complexity: 'low',
    estimatedTimeMs: 2000,
    multilingual: true,
    fallbackStrategy: 'conversational',
    keywords: {
      'pt-BR': ['gostaria', 'seria bom', 'funcionalidade', 'recurso', 'implementar'],
      'en-US': ['would like', 'would be nice', 'feature', 'functionality', 'implement']
    }
  },
  
  GREETING: {
    name: "GREETING",
    description: "Saudações e conversas casuais",
    requiredFields: [],
    optionalFields: ["context"],
    allowedTools: [],
    simulateByDefault: true,
    category: 'data',
    complexity: 'low',
    estimatedTimeMs: 1000,
    multilingual: true,
    fallbackStrategy: 'conversational',
    keywords: {
      'pt-BR': ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tchau'],
      'en-US': ['hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'bye']
    }
  },
  
  FALLBACK_SMART: {
    name: "FALLBACK_SMART",
    description: "Fallback inteligente para perguntas não classificadas",
    requiredFields: ["original_message"],
    optionalFields: ["context", "language"],
    allowedTools: ["smart_fallback", "web_search"],
    simulateByDefault: true,
    category: 'data',
    complexity: 'medium',
    estimatedTimeMs: 4000,
    multilingual: true,
    fallbackStrategy: 'web_search',
    keywords: {
      'pt-BR': [], // Não usa keywords - é fallback
      'en-US': []
    }
  },
  
  // Intents existentes que faltavam
  SUGGEST_REBALANCING: {
    name: "SUGGEST_REBALANCING",
    description: "Sugerir rebalanceamento de carteira",
    requiredFields: ["portfolio_id"],
    optionalFields: ["next_contribution", "rebalance_type"],
    allowedTools: ["rebalance_suggest"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'high',
    estimatedTimeMs: 6000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['rebalancear', 'rebalanceamento', 'ajustar', 'realinhar'],
      'en-US': ['rebalance', 'rebalancing', 'adjust', 'realign']
    }
  },
  
  PLAN_CONTRIBUTION: {
    name: "PLAN_CONTRIBUTION",
    description: "Planejar aportes ideais",
    requiredFields: ["portfolio_id", "amount"],
    optionalFields: ["frequency", "auto_invest"],
    allowedTools: ["contribution_optimizer"],
    simulateByDefault: true,
    category: 'portfolio',
    complexity: 'medium',
    estimatedTimeMs: 4000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['aporte', 'contribuição', 'investir mais', 'onde aportar'],
      'en-US': ['contribution', 'invest more', 'where to invest', 'add money']
    }
  },
  
  CONFIGURE_ALERTS: {
    name: "CONFIGURE_ALERTS",
    description: "Configurar alertas inteligentes",
    requiredFields: ["portfolio_id", "rules"],
    optionalFields: ["frequency", "channels"],
    allowedTools: ["alerts_configure"],
    simulateByDefault: false,
    category: 'config',
    complexity: 'medium',
    estimatedTimeMs: 3000,
    multilingual: true,
    fallbackStrategy: 'vista_redirect',
    keywords: {
      'pt-BR': ['alerta', 'notificação', 'avisar', 'configurar', 'monitorar'],
      'en-US': ['alert', 'notification', 'notify', 'configure', 'monitor']
    }
  }
};

/**
 * Classifica intent universal baseada na mensagem e idioma
 */
export function classifyUniversalIntent(
  message: string, 
  language: SupportedLanguage
): UniversalIntentName | null {
  const normalizedMessage = message.toLowerCase();
  
  // Buscar por palavras-chave específicas do idioma
  for (const [intentName, intent] of Object.entries(UNIVERSAL_INTENTS)) {
    const keywords = intent.keywords[language];
    
    for (const keyword of keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        return intentName as UniversalIntentName;
      }
    }
  }
  
  // Se não encontrou intent específica, usar fallback inteligente
  return 'FALLBACK_SMART';
}

/**
 * Obtém estratégia de fallback para um intent
 */
export function getFallbackStrategy(intent: UniversalIntentName): string {
  return UNIVERSAL_INTENTS[intent]?.fallbackStrategy || 'web_search';
}

/**
 * Verifica se intent suporta múltiplos idiomas
 */
export function isMultilingualIntent(intent: UniversalIntentName): boolean {
  return UNIVERSAL_INTENTS[intent]?.multilingual || false;
}

/**
 * Obtém todas as keywords para um intent em um idioma específico
 */
export function getIntentKeywords(intent: UniversalIntentName, language: SupportedLanguage): string[] {
  return UNIVERSAL_INTENTS[intent]?.keywords[language] || [];
}
