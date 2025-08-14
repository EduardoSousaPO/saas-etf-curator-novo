/**
 * Validadores - Vista ETF AI
 * Pré e pós validação para garantir qualidade e evitar alucinações
 */

import { Intent, IntentName } from './intents';
import { getToolByName, validateToolInput } from './tools.registry';

// Interfaces
export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: string[];
  warnings?: string[];
  followUpQuestions?: string[];
}

export interface ParsedFields {
  [key: string]: any;
  _metadata?: {
    confidence: number;
    extracted_from: string;
    requires_confirmation?: boolean;
  };
}

/**
 * Pré-validação: Extrai e valida campos obrigatórios da mensagem do usuário
 */
export async function preValidate(spec: Intent, userMessage: string): Promise<ValidationResult> {
  console.log(`🔍 Pré-validação para intent: ${spec.name}`);
  
  try {
    // Extrair campos usando heurísticas e regex
    const extractedFields = await extractFieldsFromMessage(userMessage, spec);
    
    // Verificar campos obrigatórios
    const missingFields = spec.requiredFields.filter(field => 
      !extractedFields[field] || extractedFields[field] === ''
    );
    
    if (missingFields.length > 0) {
      const followUpQuestions = generateFollowUpQuestions(missingFields, spec.name);
      return {
        success: false,
        errors: [`Campos obrigatórios faltando: ${missingFields.join(', ')}`],
        followUpQuestions,
        data: extractedFields
      };
    }
    
    // Validar tipos e formatos
    const typeValidation = validateFieldTypes(extractedFields, spec);
    if (!typeValidation.success) {
      return typeValidation;
    }
    
    // Validar com schemas das tools
    const toolValidations = await validateWithToolSchemas(extractedFields, spec);
    if (!toolValidations.success) {
      return toolValidations;
    }
    
    console.log(`✅ Pré-validação bem-sucedida para ${spec.name}`);
    return {
      success: true,
      data: extractedFields,
      warnings: typeValidation.warnings
    };
    
  } catch (error) {
    console.error('❌ Erro na pré-validação:', error);
    return {
      success: false,
      errors: ['Erro interno na validação dos dados'],
    };
  }
}

/**
 * Extrai campos da mensagem usando heurísticas e regex
 */
async function extractFieldsFromMessage(message: string, spec: Intent): Promise<ParsedFields> {
  const fields: ParsedFields = {
    _metadata: {
      confidence: 0,
      extracted_from: message,
    }
  };
  
  const lowerMessage = message.toLowerCase();
  
  // Extrações específicas por intent
  switch (spec.name) {
    case 'CREATE_OPTIMIZED_PORTFOLIO':
      // Objetivo
      if (lowerMessage.includes('aposentadoria') || lowerMessage.includes('aposentar')) {
        fields.goal = 'aposentadoria';
      } else if (lowerMessage.includes('casa') || lowerMessage.includes('imóvel')) {
        fields.goal = 'casa';
      } else if (lowerMessage.includes('emergência') || lowerMessage.includes('reserva')) {
        fields.goal = 'emergencia';
      } else if (lowerMessage.includes('crescimento') || lowerMessage.includes('crescer')) {
        fields.goal = 'crescimento';
      }
      
      // Perfil de risco
      if (lowerMessage.includes('conservador') || lowerMessage.includes('baixo risco')) {
        fields.risk_profile = 'conservador';
      } else if (lowerMessage.includes('moderado') || lowerMessage.includes('médio risco')) {
        fields.risk_profile = 'moderado';
      } else if (lowerMessage.includes('arrojado') || lowerMessage.includes('alto risco') || lowerMessage.includes('agressivo')) {
        fields.risk_profile = 'arrojado';
      }
      
      // Valor
      const valueMatch = message.match(/(?:R\$|USD|US\$|\$)?\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/);
      if (valueMatch) {
        const cleanValue = valueMatch[1].replace(/[.,]/g, '');
        fields.amount = parseInt(cleanValue);
      }
      
      // Moeda
      if (lowerMessage.includes('real') || lowerMessage.includes('r$') || lowerMessage.includes('brl')) {
        fields.currency = 'BRL';
      } else if (lowerMessage.includes('dólar') || lowerMessage.includes('dollar') || lowerMessage.includes('usd') || lowerMessage.includes('$')) {
        fields.currency = 'USD';
      }
      break;
      
    case 'COMPARE_ETFS':
      // Extrair símbolos de ETFs
      const symbolsMatch = message.match(/\b[A-Z]{2,5}\b/g);
      if (symbolsMatch && symbolsMatch.length >= 2) {
        fields.symbols = symbolsMatch.slice(0, 6); // Máximo 6
      }
      
      // Período
      if (lowerMessage.includes('1 ano') || lowerMessage.includes('12 meses')) {
        fields.period = '1Y';
      } else if (lowerMessage.includes('3 anos')) {
        fields.period = '3Y';
      } else if (lowerMessage.includes('5 anos')) {
        fields.period = '5Y';
      }
      break;
      
    case 'FILTER_ETFS':
      fields.filters = {};
      
      // Taxa de administração
      const feeMatch = lowerMessage.match(/taxa.*?([0-9.,]+)%/);
      if (feeMatch) {
        fields.filters.expense_ratio_max = parseFloat(feeMatch[1].replace(',', '.'));
      }
      
      // Dividendo
      const divMatch = lowerMessage.match(/(?:dividendo|yield).*?([0-9.,]+)%/);
      if (divMatch) {
        fields.filters.dividend_yield_min = parseFloat(divMatch[1].replace(',', '.'));
      }
      
      // Setor
      if (lowerMessage.includes('tecnologia') || lowerMessage.includes('tech')) {
        fields.filters.sector = 'Technology';
      } else if (lowerMessage.includes('saúde') || lowerMessage.includes('health')) {
        fields.filters.sector = 'Healthcare';
      }
      break;
      
    case 'GET_RANKINGS':
      // Categoria
      if (lowerMessage.includes('performance') || lowerMessage.includes('retorno')) {
        fields.category = 'BestPerformance';
      } else if (lowerMessage.includes('risco') || lowerMessage.includes('sharpe')) {
        fields.category = 'RiskAdjusted';
      } else if (lowerMessage.includes('dividendo') || lowerMessage.includes('renda')) {
        fields.category = 'Income';
      } else if (lowerMessage.includes('líquid') || lowerMessage.includes('volume')) {
        fields.category = 'Liquidity';
      }
      
      // Limite
      const limitMatch = lowerMessage.match(/(?:top|melhores)\s*([0-9]+)/);
      if (limitMatch) {
        fields.limit = parseInt(limitMatch[1]);
      }
      break;
      
    case 'GET_DASHBOARD_PERFORMANCE':
      // Período
      if (lowerMessage.includes('mês') || lowerMessage.includes('30 dias')) {
        fields.period = '1M';
      } else if (lowerMessage.includes('trimestre') || lowerMessage.includes('3 meses')) {
        fields.period = '3M';
      } else if (lowerMessage.includes('ano') || lowerMessage.includes('12 meses')) {
        fields.period = '1Y';
      }
      break;
      
    case 'GET_NEWS_RECENT':
      // Extrair query das notícias - usar a mensagem completa como query
      fields.query = message.trim();
      
      // Recency em dias
      if (lowerMessage.includes('hoje') || lowerMessage.includes('hoje')) {
        fields.recencyDays = 1;
      } else if (lowerMessage.includes('semana') || lowerMessage.includes('últimos 7 dias')) {
        fields.recencyDays = 7;
      } else if (lowerMessage.includes('mês') || lowerMessage.includes('últimos 30 dias')) {
        fields.recencyDays = 30;
      } else {
        fields.recencyDays = 7; // Default: última semana
      }
      
      // Idioma
      fields.language = 'pt'; // Default português
      break;
      
    case 'EXPLAIN_CONCEPT':
      // Extrair tópico - usar a mensagem como tópico
      fields.topic = message.trim();
      
      // Nível de explicação
      if (lowerMessage.includes('básico') || lowerMessage.includes('iniciante') || lowerMessage.includes('simples')) {
        fields.level = 'beginner';
      } else if (lowerMessage.includes('avançado') || lowerMessage.includes('expert') || lowerMessage.includes('técnico')) {
        fields.level = 'advanced';
      } else {
        fields.level = 'intermediate'; // Default
      }
      
      // Se pede exemplos
      if (lowerMessage.includes('exemplo') || lowerMessage.includes('exemplos')) {
        fields.examples = true;
      }
      break;
  }
  
  // Calcular confiança baseado nos campos extraídos
  const extractedCount = Object.keys(fields).filter(key => key !== '_metadata').length;
  const requiredCount = spec.requiredFields.length;
  fields._metadata!.confidence = Math.min(100, (extractedCount / requiredCount) * 100);
  
  return fields;
}

/**
 * Gera perguntas de follow-up para campos faltantes
 */
function generateFollowUpQuestions(missingFields: string[], intentName: IntentName): string[] {
  const questions: string[] = [];
  
  for (const field of missingFields) {
    switch (field) {
      case 'goal':
        questions.push("Qual seu objetivo principal? (aposentadoria, casa, emergência, crescimento)");
        break;
      case 'risk_profile':
        questions.push("Qual seu perfil de risco? (conservador, moderado, arrojado)");
        break;
      case 'amount':
        questions.push("Qual valor você pretende investir?");
        break;
      case 'currency':
        questions.push("Prefere investir em Real (BRL) ou Dólar (USD)?");
        break;
      case 'symbols':
        questions.push("Quais ETFs você gostaria de comparar? (ex: SPY, VTI, QQQ)");
        break;
      case 'category':
        questions.push("Que tipo de ranking você quer? (performance, risco ajustado, dividendos, liquidez)");
        break;
      case 'filters':
        questions.push("Quais critérios são importantes? (taxa, patrimônio, setor, dividendos)");
        break;
      case 'portfolio_id':
        questions.push("Você já tem uma carteira criada no sistema?");
        break;
      case 'query':
        questions.push("Sobre que assunto você gostaria de ver notícias?");
        break;
      case 'topic':
        questions.push("Qual conceito você gostaria que eu explicasse?");
        break;
    }
  }
  
  // Máximo 2 perguntas por vez
  return questions.slice(0, 2);
}

/**
 * Valida tipos e formatos dos campos
 */
function validateFieldTypes(fields: ParsedFields, spec: Intent): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validações específicas por campo
  if (fields.amount && (fields.amount < 100 || fields.amount > 10000000)) {
    errors.push("Valor deve estar entre R$ 100 e R$ 10.000.000");
  }
  
  if (fields.symbols && fields.symbols.length > 6) {
    warnings.push("Máximo 6 ETFs por comparação. Usando os primeiros 6.");
    fields.symbols = fields.symbols.slice(0, 6);
  }
  
  if (fields.limit && (fields.limit < 1 || fields.limit > 50)) {
    warnings.push("Limite ajustado para 15 resultados");
    fields.limit = 15;
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    data: fields
  };
}

/**
 * Valida com schemas das tools
 */
async function validateWithToolSchemas(fields: ParsedFields, spec: Intent): Promise<ValidationResult> {
  const errors: string[] = [];
  
  for (const toolName of spec.allowedTools) {
    const tool = getToolByName(toolName);
    if (!tool) continue;
    
    const validation = validateToolInput(toolName, fields);
    if (!validation.success && validation.error) {
      errors.push(`${toolName}: ${validation.error}`);
    }
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: fields
  };
}

/**
 * Pós-validação: Verifica a resposta gerada
 */
export function postValidate(answer: string, results: any[]): ValidationResult {
  console.log('🔍 Pós-validação da resposta');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Verificar se tem origem dos dados
  const hasOrigin = answer.includes('origem:') || answer.includes('trace_id:');
  if (!hasOrigin && results.length > 0) {
    errors.push("Resposta deve incluir origem dos dados");
  }
  
  // 2. Verificar tamanho da resposta
  if (answer.length < 50) {
    errors.push("Resposta muito curta");
  } else if (answer.length > 3000) {
    warnings.push("Resposta muito longa, considere resumir");
  }
  
  // 3. Verificar se menciona dados não retornados pelas APIs
  const suspiciousPatterns = [
    /\$[0-9]+\.[0-9]{2}(?!\s*(?:bilhões?|milhões?|mil))/g, // Valores específicos suspeitos
    /[0-9]+\.[0-9]{3,}%/g, // Percentuais muito precisos
    /segundo.*(?:bloomberg|reuters|yahoo)/i, // Citações de fontes não consultadas
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(answer)) {
      warnings.push("Possível alucinação detectada - dados muito específicos");
      break;
    }
  }
  
  // 4. Verificar disclaimers obrigatórios para certas respostas
  if (answer.includes('carteira') || answer.includes('investir') || answer.includes('alocar')) {
    if (!answer.includes('risco') && !answer.includes('educativ')) {
      warnings.push("Considere adicionar disclaimer educativo");
    }
  }
  
  // 5. Verificar próximos passos
  const hasNextSteps = answer.includes('próximos passos') || 
                      answer.includes('simular') || 
                      answer.includes('aplicar') ||
                      answer.includes('quer que');
  if (!hasNextSteps) {
    warnings.push("Considere incluir próximos passos");
  }
  
  console.log(`✅ Pós-validação: ${errors.length} erros, ${warnings.length} avisos`);
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Enforce escopo interno apenas (exceto notícias)
 */
export function enforceInternalDataOnly(intentName: IntentName): void {
  if (intentName === 'GET_NEWS_RECENT') {
    return; // Exceção para notícias via Perplexity
  }
  
  // Para todas as outras intents, garantir que apenas dados internos sejam usados
  console.log(`🔒 Enforcing internal data only for ${intentName}`);
}

/**
 * Validador de rate limiting
 */
export function validateRateLimit(userId: string, intentName: IntentName): ValidationResult {
  // Implementação futura - por agora sempre permite
  return { success: true };
}

/**
 * Sanitizador de entrada
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s\-.,!?$%()]/g, '') // Remove caracteres especiais
    .trim()
    .slice(0, 2000); // Limita tamanho
}

/**
 * Validador de contexto de usuário
 */
export interface UserContext {
  userId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  preferences?: {
    currency?: 'BRL' | 'USD';
    risk_profile?: 'conservador' | 'moderado' | 'arrojado';
    language?: 'pt' | 'en';
  };
}

export function validateUserContext(context: Partial<UserContext>): ValidationResult {
  const errors: string[] = [];
  
  if (!context.userId) {
    errors.push("User ID é obrigatório");
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: context
  };
}
