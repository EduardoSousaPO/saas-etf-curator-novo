/**
 * Detector de Idioma Automático - Vista AI Chat
 * Detecta automaticamente o idioma da mensagem do usuário
 */

export type SupportedLanguage = 'pt-BR' | 'en-US';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  detectedFeatures: string[];
}

/**
 * Detecta o idioma da mensagem do usuário
 */
export function detectLanguage(message: string): LanguageDetectionResult {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Palavras-chave em português brasileiro
  const portugueseKeywords = [
    // Saudações e expressões
    'olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'obrigado', 'obrigada', 'por favor',
    'desculpa', 'desculpe', 'com licença', 'tchau', 'até logo', 'até mais',
    
    // Termos financeiros em português
    'carteira', 'investimento', 'ações', 'fundos', 'renda fixa', 'aposentadoria',
    'poupança', 'aplicação', 'rentabilidade', 'dividendos', 'bolsa de valores',
    'ibovespa', 'selic', 'cdi', 'tesouro direto', 'previdência', 'reserva de emergência',
    
    // Verbos e conectores comuns
    'quero', 'preciso', 'gostaria', 'posso', 'como', 'onde', 'quando', 'porque',
    'qual', 'quais', 'quanto', 'quantos', 'que', 'para', 'com', 'sem', 'sobre',
    'entre', 'durante', 'depois', 'antes', 'agora', 'hoje', 'amanhã', 'ontem',
    
    // Termos específicos do Vista
    'vista', 'screener', 'comparador', 'rankings', 'portfolio master',
    'etfs brasileiros', 'mercado brasileiro', 'real brasileiro', 'reais'
  ];
  
  // Palavras-chave em inglês
  const englishKeywords = [
    // Greetings and expressions
    'hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'thank you', 'thanks',
    'please', 'sorry', 'excuse me', 'goodbye', 'bye', 'see you',
    
    // Financial terms in English
    'portfolio', 'investment', 'stocks', 'etfs', 'bonds', 'retirement',
    'savings', 'returns', 'dividends', 'stock market', 'nasdaq', 'sp500',
    'federal reserve', 'fed', 'treasury', 'mutual funds', 'emergency fund',
    
    // Common verbs and connectors
    'want', 'need', 'would like', 'can', 'could', 'how', 'where', 'when', 'why',
    'what', 'which', 'how much', 'how many', 'that', 'for', 'with', 'without',
    'about', 'between', 'during', 'after', 'before', 'now', 'today', 'tomorrow',
    
    // Vista specific terms
    'vista', 'screener', 'comparator', 'rankings', 'portfolio master',
    'american etfs', 'us market', 'dollar', 'dollars', 'usd'
  ];
  
  // Padrões gramaticais específicos
  const portuguesePatterns = [
    /\b(o|a|os|as)\s+\w+/g, // Artigos definidos
    /\b\w+ção\b/g, // Palavras terminadas em -ção
    /\b\w+mente\b/g, // Advérbios terminados em -mente
    /\bé\b|\bsão\b|\bestá\b|\bestão\b/g, // Verbos ser/estar
    /\bdo\b|\bda\b|\bdos\b|\bdas\b/g, // Contrações
    /\bno\b|\bna\b|\bnos\b|\bnas\b/g, // Contrações
    /\bpelo\b|\bpela\b|\bpelos\b|\bpelas\b/g // Contrações
  ];
  
  const englishPatterns = [
    /\bthe\s+\w+/g, // Artigo definido
    /\b\w+ing\b/g, // Gerúndio
    /\b\w+ed\b/g, // Passado regular
    /\bis\b|\bare\b|\bwas\b|\bwere\b/g, // Verbo to be
    /\bof\s+the\b/g, // Padrão comum
    /\bin\s+the\b/g, // Padrão comum
    /\bto\s+\w+/g // Infinitivo
  ];
  
  let portugueseScore = 0;
  let englishScore = 0;
  const detectedFeatures: string[] = [];
  
  // Contar palavras-chave em português
  portugueseKeywords.forEach(keyword => {
    if (normalizedMessage.includes(keyword)) {
      portugueseScore += 2;
      detectedFeatures.push(`pt-keyword: ${keyword}`);
    }
  });
  
  // Contar palavras-chave em inglês
  englishKeywords.forEach(keyword => {
    if (normalizedMessage.includes(keyword)) {
      englishScore += 2;
      detectedFeatures.push(`en-keyword: ${keyword}`);
    }
  });
  
  // Contar padrões gramaticais em português
  portuguesePatterns.forEach((pattern, index) => {
    const matches = normalizedMessage.match(pattern);
    if (matches) {
      portugueseScore += matches.length;
      detectedFeatures.push(`pt-pattern-${index}: ${matches.length} matches`);
    }
  });
  
  // Contar padrões gramaticais em inglês
  englishPatterns.forEach((pattern, index) => {
    const matches = normalizedMessage.match(pattern);
    if (matches) {
      englishScore += matches.length;
      detectedFeatures.push(`en-pattern-${index}: ${matches.length} matches`);
    }
  });
  
  // Caracteres especiais do português
  const portugueseChars = /[áàâãéêíóôõúüç]/g;
  const portugueseCharMatches = normalizedMessage.match(portugueseChars);
  if (portugueseCharMatches) {
    portugueseScore += portugueseCharMatches.length * 3;
    detectedFeatures.push(`pt-chars: ${portugueseCharMatches.length} special chars`);
  }
  
  // Determinar idioma e confiança
  const totalScore = portugueseScore + englishScore;
  let language: SupportedLanguage;
  let confidence: number;
  
  if (totalScore === 0) {
    // Sem indicadores claros, usar inglês como padrão
    language = 'en-US';
    confidence = 0.5;
    detectedFeatures.push('default: no clear indicators');
  } else if (portugueseScore > englishScore) {
    language = 'pt-BR';
    confidence = Math.min(0.95, portugueseScore / totalScore);
  } else if (englishScore > portugueseScore) {
    language = 'en-US';
    confidence = Math.min(0.95, englishScore / totalScore);
  } else {
    // Empate, usar português como padrão para usuários brasileiros
    language = 'pt-BR';
    confidence = 0.5;
    detectedFeatures.push('tie: defaulting to pt-BR');
  }
  
  return {
    language,
    confidence,
    detectedFeatures
  };
}

/**
 * Detecta idioma usando IA como fallback
 */
export async function detectLanguageWithAI(message: string): Promise<LanguageDetectionResult> {
  try {
    // Primeiro tentar detecção baseada em regras
    const ruleBasedResult = detectLanguage(message);
    
    // Se confiança for alta, usar resultado das regras
    if (ruleBasedResult.confidence > 0.8) {
      return ruleBasedResult;
    }
    
    // Caso contrário, usar IA para confirmar
    const { callOpenAIChat } = await import('./agent.config');
    
    const aiResponse = await callOpenAIChat({
      system: "You are a language detector. Respond ONLY with 'pt-BR' for Portuguese (Brazil) or 'en-US' for English (US). Consider financial and investment context.",
      user: `Detect the language of this message: "${message}"`,
      maxTokens: 10
    });
    
    const detectedLang = aiResponse.trim();
    const isValidLang = detectedLang === 'pt-BR' || detectedLang === 'en-US';
    
    if (isValidLang) {
      return {
        language: detectedLang as SupportedLanguage,
        confidence: 0.9,
        detectedFeatures: [...ruleBasedResult.detectedFeatures, 'ai-confirmed']
      };
    }
    
    // Fallback para resultado das regras
    return ruleBasedResult;
    
  } catch (error) {
    console.error('Erro na detecção de idioma com IA:', error);
    return detectLanguage(message);
  }
}

/**
 * Utilitários para trabalhar com idiomas
 */
export const LanguageUtils = {
  /**
   * Verifica se é português brasileiro
   */
  isPortuguese(language: SupportedLanguage): boolean {
    return language === 'pt-BR';
  },
  
  /**
   * Verifica se é inglês americano
   */
  isEnglish(language: SupportedLanguage): boolean {
    return language === 'en-US';
  },
  
  /**
   * Retorna nome do idioma em formato amigável
   */
  getLanguageName(language: SupportedLanguage): string {
    return language === 'pt-BR' ? 'Português (Brasil)' : 'English (US)';
  },
  
  /**
   * Retorna código ISO curto
   */
  getLanguageCode(language: SupportedLanguage): string {
    return language === 'pt-BR' ? 'pt' : 'en';
  }
};
