/**
 * Configuração do Agente de IA
 * Configurações para OpenAI e funções auxiliares
 */

// Modelos OpenAI disponíveis
export const AI_MODELS = {
  CORE_MODEL: 'gpt-4o-mini',           // Modelo principal para conversas
  HEAVY_MODEL: 'gpt-4o',               // Modelo pesado para análises complexas  
  CLASSIFICATION_MODEL: 'gpt-4o-mini', // Modelo para classificação de intents
  VISION_MODEL: 'gpt-4o'               // Modelo para análise de imagens
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

// Interface para chamadas OpenAI
export interface OpenAICallOptions {
  system?: string;
  user: string;
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

// Interface para resultados de API
export interface APICallResult {
  success: boolean;
  data?: any;
  error?: string;
  execution_time?: number;
  trace_id?: string;
}

/**
 * Chama a API OpenAI para chat completion
 */
export async function callOpenAIChat(options: OpenAICallOptions): Promise<string> {
  const {
    system,
    user,
    model = AI_MODELS.CORE_MODEL,
    maxTokens = 1000,
    temperature = 0.7,
    stream = false
  } = options;

  try {
    const messages: Array<{role: string, content: string}> = [];
    
    if (system) {
      messages.push({ role: 'system', content: system });
    }
    
    messages.push({ role: 'user', content: user });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || '';

  } catch (error) {
    console.error('Erro na chamada OpenAI:', error);
    throw error;
  }
}

/**
 * Chama APIs internas do Vista
 */
export async function callVistaAPI(endpoint: string, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}): Promise<APICallResult> {
  const { method = 'GET', data, headers = {} } = options;
  
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseURL}${endpoint}`;
    
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(data);
    }

    const startTime = Date.now();
    const response = await fetch(url, fetchOptions);
    const execution_time = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
        execution_time
      };
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result,
      execution_time
    };

  } catch (error) {
    console.error(`Erro na API ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Gera ID único para rastreamento
 */
export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Configurações padrão para diferentes tipos de operação
 */
export const OPERATION_CONFIGS = {
  INTENT_CLASSIFICATION: {
    model: AI_MODELS.CLASSIFICATION_MODEL,
    maxTokens: 100,
    temperature: 0.1
  },
  
  DATA_EXTRACTION: {
    model: AI_MODELS.CORE_MODEL,
    maxTokens: 300,
    temperature: 0.2
  },
  
  RESPONSE_GENERATION: {
    model: AI_MODELS.CORE_MODEL,
    maxTokens: 1000,
    temperature: 0.7
  },
  
  COMPLEX_ANALYSIS: {
    model: AI_MODELS.HEAVY_MODEL,
    maxTokens: 2000,
    temperature: 0.5
  }
} as const;

/**
 * Rate limiting básico
 */
export class SimpleRateLimit {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60 * 1000 // 1 minuto
  ) {}
  
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Rate limiter global para OpenAI
export const openaiRateLimit = new SimpleRateLimit(50, 60 * 1000); // 50 req/min
