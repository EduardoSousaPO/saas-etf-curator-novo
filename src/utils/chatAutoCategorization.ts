interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CategorizationResult {
  contentType: string;
  suggestedFolder: string;
  confidence: number;
  keywords: string[];
  entities: string[];
  intent: string;
  title: string;
  summary: string;
}

// Padrões para identificação de conteúdo
const CONTENT_PATTERNS = {
  portfolio_analysis: {
    keywords: ['portfolio', 'carteira', 'alocação', 'diversificação', 'otimização', 'markowitz', 'sharpe'],
    phrases: ['criar portfolio', 'otimizar carteira', 'análise de portfolio', 'alocação de ativos'],
    folder: 'portfolios'
  },
  etf_comparison: {
    keywords: ['comparar', 'versus', 'vs', 'diferença', 'melhor', 'escolher'],
    phrases: ['comparar etfs', 'qual etf', 'diferença entre', 'vs', 'melhor opção'],
    folder: 'comparisons'
  },
  screener_query: {
    keywords: ['filtrar', 'buscar', 'encontrar', 'screener', 'critério', 'filtro'],
    phrases: ['filtrar etfs', 'buscar por', 'encontrar etfs', 'com critério', 'que atendem'],
    folder: 'screeners'
  },
  educational_content: {
    keywords: ['explicar', 'como', 'o que é', 'conceito', 'definição', 'entender'],
    phrases: ['o que é', 'como funciona', 'explique', 'conceito de', 'diferença entre'],
    folder: 'education'
  },
  market_analysis: {
    keywords: ['mercado', 'tendência', 'análise', 'previsão', 'outlook', 'perspectiva'],
    phrases: ['análise de mercado', 'tendência do mercado', 'perspectivas', 'cenário'],
    folder: 'reports'
  },
  trade_simulation: {
    keywords: ['comprar', 'vender', 'investir', 'aplicar', 'aportar', 'resgatar'],
    phrases: ['como comprar', 'onde investir', 'quanto aplicar', 'simulação de compra'],
    folder: 'operations'
  }
};

// ETFs conhecidos para extração de entidades
const KNOWN_ETFS = [
  'VTI', 'SPY', 'QQQ', 'IWM', 'EFA', 'EEM', 'VEA', 'VWO', 'BND', 'AGG',
  'TLT', 'IEF', 'SHY', 'GLD', 'SLV', 'VNQ', 'REIT', 'XLF', 'XLE', 'XLK',
  'SCHD', 'VYM', 'HDV', 'NOBL', 'DGRO', 'VIG', 'VXUS', 'ITOT', 'IEFA',
  'BIVA11', 'IVVB11', 'SMAL11', 'DIVO11', 'XBOV11', 'BBOV11'
];

// Conceitos financeiros para extração de entidades
const FINANCIAL_CONCEPTS = [
  'expense ratio', 'dividend yield', 'sharpe ratio', 'volatilidade', 'beta',
  'tracking error', 'patrimônio líquido', 'volume', 'liquidez', 'bid-ask spread',
  'rebalanceamento', 'diversificação', 'correlação', 'drawdown', 'var', 'cvar'
];

/**
 * Categoriza automaticamente uma conversa baseada no contexto
 */
export function categorizeConversation(messages: Message[]): CategorizationResult {
  const conversationText = messages.map(m => m.content).join(' ').toLowerCase();
  
  // Determinar tipo de conteúdo
  const contentType = determineContentType(conversationText);
  
  // Extrair entidades e keywords
  const entities = extractEntities(conversationText);
  const keywords = extractKeywords(conversationText);
  
  // Determinar intenção
  const intent = determineIntent(conversationText, contentType);
  
  // Gerar título e resumo
  const title = generateTitle(messages, contentType, entities);
  const summary = generateSummary(messages, contentType);
  
  // Calcular confiança
  const confidence = calculateConfidence(conversationText, contentType, entities, keywords);
  
  return {
    contentType,
    suggestedFolder: CONTENT_PATTERNS[contentType as keyof typeof CONTENT_PATTERNS]?.folder || 'custom',
    confidence,
    keywords,
    entities,
    intent,
    title,
    summary
  };
}

/**
 * Determina o tipo de conteúdo baseado nos padrões
 */
function determineContentType(text: string): string {
  let bestMatch = 'custom_analysis';
  let bestScore = 0;

  for (const [type, pattern] of Object.entries(CONTENT_PATTERNS)) {
    let score = 0;
    
    // Score por keywords
    pattern.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 2;
      }
    });
    
    // Score por frases (peso maior)
    pattern.phrases.forEach(phrase => {
      if (text.includes(phrase)) {
        score += 5;
      }
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }

  return bestMatch;
}

/**
 * Extrai entidades relevantes do texto
 */
function extractEntities(text: string): string[] {
  const entities: string[] = [];
  
  // Extrair ETFs mencionados
  const etfPattern = /\b[A-Z]{2,6}(?:11)?\b/g;
  const etfMatches = text.toUpperCase().match(etfPattern) || [];
  
  etfMatches.forEach(match => {
    if (KNOWN_ETFS.includes(match) || match.endsWith('11')) {
      entities.push(match);
    }
  });
  
  // Extrair conceitos financeiros
  FINANCIAL_CONCEPTS.forEach(concept => {
    if (text.includes(concept.toLowerCase())) {
      entities.push(concept);
    }
  });
  
  // Extrair valores monetários
  const moneyPattern = /(?:R\$|USD|\$)\s*[\d.,]+(?:\s*(?:mil|milhão|bilhão|k|m|b))?/gi;
  const moneyMatches = text.match(moneyPattern) || [];
  entities.push(...moneyMatches.slice(0, 3)); // Limitar a 3 valores
  
  // Extrair percentuais
  const percentPattern = /\d+(?:[.,]\d+)?%/g;
  const percentMatches = text.match(percentPattern) || [];
  entities.push(...percentMatches.slice(0, 3)); // Limitar a 3 percentuais
  
  return [...new Set(entities)]; // Remove duplicatas
}

/**
 * Extrai keywords relevantes do texto
 */
function extractKeywords(text: string): string[] {
  // Palavras irrelevantes (stop words)
  const stopWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre',
    'entre', 'até', 'desde', 'durante', 'perante', 'ante', 'após', 'contra',
    'e', 'ou', 'mas', 'porém', 'contudo', 'todavia', 'entretanto', 'no entanto',
    'que', 'qual', 'quais', 'quando', 'onde', 'como', 'por que', 'porque',
    'ser', 'estar', 'ter', 'haver', 'fazer', 'ir', 'vir', 'dar', 'ver', 'saber',
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now'
  ]);
  
  // Extrair palavras significativas
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter(word => !/^\d+$/.test(word)); // Remover números puros
  
  // Contar frequência
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Retornar palavras mais frequentes
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Determina a intenção do usuário
 */
function determineIntent(text: string, contentType: string): string {
  const intentMap: { [key: string]: string } = {
    portfolio_analysis: 'portfolio_optimization',
    etf_comparison: 'investment_comparison', 
    screener_query: 'etf_discovery',
    educational_content: 'learning',
    market_analysis: 'market_research',
    trade_simulation: 'trading_action'
  };
  
  let intent = intentMap[contentType] || 'general_analysis';
  
  // Refinar baseado em palavras-chave específicas
  if (text.includes('comprar') || text.includes('investir')) {
    intent = 'purchase_decision';
  } else if (text.includes('vender') || text.includes('resgatar')) {
    intent = 'sell_decision';
  } else if (text.includes('rebalancear') || text.includes('ajustar')) {
    intent = 'portfolio_rebalancing';
  } else if (text.includes('risco') || text.includes('volatilidade')) {
    intent = 'risk_analysis';
  }
  
  return intent;
}

/**
 * Gera título automático para a conversa
 */
function generateTitle(messages: Message[], contentType: string, entities: string[]): string {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return 'Análise sem título';
  
  const firstUserMessage = userMessages[0].content;
  
  // Templates baseados no tipo de conteúdo
  const templates: { [key: string]: (entities: string[], text: string) => string } = {
    portfolio_analysis: (entities, text) => {
      if (entities.length > 0) {
        const etfs = entities.filter(e => /^[A-Z]{2,6}(?:11)?$/.test(e));
        if (etfs.length > 0) {
          return `Análise de Portfolio - ${etfs.slice(0, 3).join(', ')}`;
        }
      }
      return 'Análise de Portfolio Personalizada';
    },
    
    etf_comparison: (entities, text) => {
      const etfs = entities.filter(e => /^[A-Z]{2,6}(?:11)?$/.test(e));
      if (etfs.length >= 2) {
        return `Comparação: ${etfs.slice(0, 2).join(' vs ')}`;
      } else if (etfs.length === 1) {
        return `Análise Comparativa - ${etfs[0]}`;
      }
      return 'Comparação de ETFs';
    },
    
    screener_query: (entities, text) => {
      const criteria: string[] = [];
      if (text.includes('dividendo')) criteria.push('Dividendos');
      if (text.includes('baixo custo')) criteria.push('Baixo Custo');
      if (text.includes('tecnologia')) criteria.push('Tecnologia');
      if (text.includes('internacional')) criteria.push('Internacional');
      
      if (criteria.length > 0) {
        return `Busca por ETFs - ${criteria.join(', ')}`;
      }
      return 'Filtro de ETFs Personalizado';
    },
    
    educational_content: (entities, text) => {
      if (text.includes('o que é')) {
        const concept = text.match(/o que é ([^?]+)/i)?.[1]?.trim();
        if (concept) {
          return `Conceito: ${concept.charAt(0).toUpperCase() + concept.slice(1)}`;
        }
      }
      if (text.includes('como funciona')) {
        return 'Explicação: Como Funciona';
      }
      return 'Conteúdo Educativo';
    },
    
    market_analysis: (entities, text) => {
      if (text.includes('2024') || text.includes('2025')) {
        const year = text.match(/20\d{2}/)?.[0];
        return `Análise de Mercado ${year}`;
      }
      return 'Análise de Mercado';
    },
    
    trade_simulation: (entities, text) => {
      const etfs = entities.filter(e => /^[A-Z]{2,6}(?:11)?$/.test(e));
      if (etfs.length > 0) {
        return `Simulação de Compra - ${etfs[0]}`;
      }
      return 'Simulação de Investimento';
    }
  };
  
  const template = templates[contentType];
  if (template) {
    return template(entities, firstUserMessage);
  }
  
  // Fallback: usar início da primeira mensagem
  const truncated = firstUserMessage.length > 50 
    ? firstUserMessage.substring(0, 50) + '...'
    : firstUserMessage;
  
  return truncated.charAt(0).toUpperCase() + truncated.slice(1);
}

/**
 * Gera resumo automático da conversa
 */
function generateSummary(messages: Message[], contentType: string): string {
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  
  if (userMessages.length === 0) return 'Conversa sem conteúdo identificável.';
  
  const userQuery = userMessages[0].content;
  const hasResponse = assistantMessages.length > 0;
  
  // Templates de resumo baseados no tipo
  const summaryTemplates: { [key: string]: string } = {
    portfolio_analysis: hasResponse 
      ? 'Análise completa de portfolio com recomendações de alocação e otimização.'
      : 'Solicitação de análise de portfolio para otimização de investimentos.',
      
    etf_comparison: hasResponse
      ? 'Comparação detalhada entre ETFs com análise de métricas e recomendações.'
      : 'Solicitação de comparação entre diferentes ETFs para decisão de investimento.',
      
    screener_query: hasResponse
      ? 'Busca personalizada por ETFs com base em critérios específicos definidos.'
      : 'Consulta para filtrar ETFs que atendam critérios específicos de investimento.',
      
    educational_content: hasResponse
      ? 'Explicação educativa sobre conceitos e estratégias de investimento em ETFs.'
      : 'Solicitação de esclarecimento sobre conceitos relacionados a investimentos.',
      
    market_analysis: hasResponse
      ? 'Análise de mercado com perspectivas e tendências para ETFs e investimentos.'
      : 'Consulta sobre cenário de mercado e perspectivas para investimentos.',
      
    trade_simulation: hasResponse
      ? 'Simulação de investimento com cálculos e projeções personalizadas.'
      : 'Solicitação de simulação para decisão de compra ou venda de ETFs.'
  };
  
  let summary = summaryTemplates[contentType] || 'Análise personalizada sobre investimentos em ETFs.';
  
  // Adicionar contexto específico se disponível
  if (userQuery.length > 100) {
    const keyPhrase = userQuery.substring(0, 100) + '...';
    summary += ` Contexto: "${keyPhrase}"`;
  }
  
  return summary;
}

/**
 * Calcula confiança na categorização
 */
function calculateConfidence(
  text: string, 
  contentType: string, 
  entities: string[], 
  keywords: string[]
): number {
  let confidence = 0.5; // Base
  
  // Bonus por entidades relevantes
  const etfCount = entities.filter(e => /^[A-Z]{2,6}(?:11)?$/.test(e)).length;
  confidence += Math.min(etfCount * 0.1, 0.3);
  
  // Bonus por conceitos financeiros
  const conceptCount = entities.filter(e => FINANCIAL_CONCEPTS.includes(e)).length;
  confidence += Math.min(conceptCount * 0.05, 0.2);
  
  // Bonus por keywords específicas do tipo
  const pattern = CONTENT_PATTERNS[contentType as keyof typeof CONTENT_PATTERNS];
  if (pattern) {
    const matchingKeywords = pattern.keywords.filter(k => text.includes(k)).length;
    confidence += Math.min(matchingKeywords * 0.05, 0.2);
    
    const matchingPhrases = pattern.phrases.filter(p => text.includes(p)).length;
    confidence += Math.min(matchingPhrases * 0.1, 0.3);
  }
  
  // Penalidade por texto muito curto
  if (text.length < 50) {
    confidence *= 0.8;
  }
  
  // Bonus por texto estruturado
  if (text.length > 200 && keywords.length > 5) {
    confidence += 0.1;
  }
  
  return Math.min(Math.max(confidence, 0.1), 1.0);
}

/**
 * Sugere tags baseadas no contexto
 */
export function suggestTags(categorizationResult: CategorizationResult): string[] {
  const tags: string[] = [];
  
  // Tags baseadas no tipo de conteúdo
  const contentTypeTags: { [key: string]: string[] } = {
    portfolio_analysis: ['portfolio', 'otimização', 'alocação'],
    etf_comparison: ['comparação', 'análise'],
    screener_query: ['busca', 'filtro', 'critérios'],
    educational_content: ['educação', 'conceitos'],
    market_analysis: ['mercado', 'tendências'],
    trade_simulation: ['simulação', 'compra', 'investimento']
  };
  
  const typeTags = contentTypeTags[categorizationResult.contentType] || [];
  tags.push(...typeTags);
  
  // Tags baseadas em entidades
  const etfs = categorizationResult.entities.filter(e => /^[A-Z]{2,6}(?:11)?$/.test(e));
  if (etfs.length > 0) {
    tags.push('etfs');
    if (etfs.some(etf => etf.endsWith('11'))) {
      tags.push('brasil');
    }
    if (etfs.some(etf => !etf.endsWith('11'))) {
      tags.push('internacional');
    }
  }
  
  // Tags baseadas em conceitos
  if (categorizationResult.entities.some(e => e.includes('dividend'))) {
    tags.push('dividendos');
  }
  if (categorizationResult.entities.some(e => e.includes('expense'))) {
    tags.push('custos');
  }
  if (categorizationResult.keywords.some(k => k.includes('risco'))) {
    tags.push('risco');
  }
  
  return [...new Set(tags)]; // Remove duplicatas
} 