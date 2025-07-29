// Integração com OpenAI GPT-4 para os agentes de IA
import OpenAI from 'openai';
import { UserIntent, ExecutionPlan, APIResult } from '../../types/agents';

export interface LLMProvider {
  name: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  model?: string;
}

// Configurações dos provedores LLM (OpenAI como padrão)
export const LLM_PROVIDERS: Record<string, LLMProvider> = {
  GPT_4: {
    name: 'GPT-4',
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7
  },
  GPT_4_TURBO: {
    name: 'GPT-4 Turbo',
    model: 'gpt-4-turbo-preview',
    maxTokens: 4000,
    temperature: 0.7
  },
  GPT_3_5_TURBO: {
    name: 'GPT-3.5 Turbo',
    model: 'gpt-3.5-turbo',
    maxTokens: 4000,
    temperature: 0.7
  }
};

export class LLMService {
  private openai: OpenAI;
  private provider: LLMProvider;

  constructor(providerName: string = 'GPT_4') {
    this.provider = LLM_PROVIDERS[providerName];
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não encontrada nas variáveis de ambiente');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log(`🤖 LLMService inicializado com ${this.provider.name}`);
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    try {
      console.log(`🧠 Gerando resposta com ${this.provider.name}`, {
        messages: request.messages.length,
        temperature: request.temperature || this.provider.temperature
      });

      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: this.provider.model,
        messages: request.messages,
        temperature: request.temperature || this.provider.temperature,
        max_tokens: request.maxTokens || this.provider.maxTokens,
        stream: false
      });

      const processingTime = Date.now() - startTime;
      console.log(`✅ Resposta gerada em ${processingTime}ms`, {
        tokens: response.usage?.total_tokens,
        finishReason: response.choices[0]?.finish_reason
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        } : undefined,
        finishReason: response.choices[0]?.finish_reason,
        model: response.model
      };

    } catch (error) {
      console.error('❌ Erro na geração de resposta:', error);
      
      if (error instanceof Error) {
        // Tratamento específico para erros da OpenAI
        if (error.message.includes('rate_limit_exceeded')) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
        } else if (error.message.includes('insufficient_quota')) {
          throw new Error('Cota da API OpenAI esgotada. Verifique seu plano.');
        } else if (error.message.includes('invalid_api_key')) {
          throw new Error('Chave da API OpenAI inválida. Verifique a configuração.');
        }
      }

      throw new Error(`Erro na API OpenAI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Método específico para análise de intenção
  async analyzeIntent(message: string, context?: any): Promise<{
    intent: UserIntent;
    parameters: Record<string, any>;
    confidence: number;
  }> {
    const systemPrompt = `Você é um especialista em análise de intenções para um sistema de ETFs e investimentos.

Analise a mensagem do usuário e identifique:
1. A intenção principal (intent)
2. Os parâmetros relevantes
3. O nível de confiança (0-1)

Intenções disponíveis:
- PORTFOLIO_OPTIMIZATION: Otimizar ou criar carteiras de investimento
- ETF_SCREENING: Filtrar e encontrar ETFs específicos
- ETF_COMPARISON: Comparar ETFs diferentes
- MARKET_ANALYSIS: Analisar mercado e tendências
- EDUCATIONAL: Explicar conceitos financeiros
- RANKINGS_ANALYSIS: Ver rankings de ETFs
- REBALANCING: Rebalancear carteiras existentes
- PROJECT_MANAGEMENT: Gerenciar projetos de investimento

Responda APENAS em formato JSON válido:
{
  "intent": "INTENT_NAME",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  },
  "confidence": 0.95
}`;

    try {
      const response = await this.generateResponse({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3, // Baixa temperatura para análise mais consistente
        maxTokens: 500
      });

      const parsed = JSON.parse(response.content);
      
      // Validar se o intent é válido
      if (!Object.values(UserIntent).includes(parsed.intent)) {
        parsed.intent = UserIntent.EDUCATIONAL; // Fallback
      }

      return parsed;

    } catch (error) {
      console.error('❌ Erro na análise de intenção:', error);
      
      // Fallback para análise baseada em palavras-chave
      return this.fallbackIntentAnalysis(message);
    }
  }

  // Método específico para formatação de respostas
  async formatResponse(data: any, intent: UserIntent, context?: any): Promise<string> {
    const systemPrompt = `Você é um assistente especializado em ETFs e investimentos financeiros.

Sua tarefa é formatar dados técnicos em respostas claras e educativas para usuários.

Diretrizes:
1. Use linguagem acessível mas profissional
2. Inclua explicações educativas quando relevante
3. Formate números como percentuais, moedas adequadamente
4. Use emojis para melhorar a legibilidade
5. Inclua disclaimers de investimento quando necessário
6. Estruture a resposta com títulos e seções claras

Tipo de resposta: ${intent}
Dados para formatar: ${JSON.stringify(data, null, 2)}

Formate uma resposta completa e profissional:`;

    try {
      const response = await this.generateResponse({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Formate os dados para o tipo de resposta: ${intent}` }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      return response.content;

    } catch (error) {
      console.error('❌ Erro na formatação de resposta:', error);
      return `## ⚠️ Erro na Formatação

Ocorreu um problema ao formatar a resposta. Dados brutos:

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

**Tipo:** ${intent}`;
    }
  }

  // Fallback para análise de intenção sem LLM
  private fallbackIntentAnalysis(message: string): {
    intent: UserIntent;
    parameters: Record<string, any>;
    confidence: number;
  } {
    const messageLower = message.toLowerCase();
    
    // Palavras-chave para cada intenção
    const intentKeywords = {
      [UserIntent.PORTFOLIO_OPTIMIZATION]: ['portfolio', 'carteira', 'otimiz', 'alocar', 'diversif', 'markowitz'],
      [UserIntent.ETF_SCREENING]: ['filtro', 'encontrar', 'buscar', 'screening', 'etf com', 'setor'],
      [UserIntent.ETF_COMPARISON]: ['comparar', 'versus', 'vs', 'diferença', 'melhor entre'],
      [UserIntent.MARKET_ANALYSIS]: ['mercado', 'tendência', 'análise', 'cenário', 'outlook'],
      [UserIntent.EDUCATIONAL]: ['o que é', 'como funciona', 'explicar', 'conceito', 'definição'],
      [UserIntent.RANKINGS_ANALYSIS]: ['ranking', 'melhores', 'top', 'classificação'],
      [UserIntent.REBALANCING]: ['rebalance', 'ajustar', 'realocação']
    };

    let bestIntent = UserIntent.EDUCATIONAL;
    let maxScore = 0;

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      const score = keywords.filter(keyword => messageLower.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent as UserIntent;
      }
    }

    return {
      intent: bestIntent,
      parameters: this.extractBasicParameters(message),
      confidence: maxScore > 0 ? Math.min(maxScore * 0.3, 0.8) : 0.3
    };
  }

  private extractBasicParameters(message: string): Record<string, any> {
    const params: Record<string, any> = {};
    const messageLower = message.toLowerCase();

    // Extrair valores monetários
    const moneyMatch = message.match(/(?:R\$|USD|\$)\s*([0-9,.]+)/i);
    if (moneyMatch) {
      params.investment = parseFloat(moneyMatch[1].replace(',', ''));
    }

    // Extrair perfis de risco
    if (messageLower.includes('conservador') || messageLower.includes('baixo risco')) {
      params.riskProfile = 'conservative';
    } else if (messageLower.includes('agressivo') || messageLower.includes('alto risco')) {
      params.riskProfile = 'aggressive';
    } else if (messageLower.includes('moderado')) {
      params.riskProfile = 'moderate';
    }

    // Extrair objetivos
    if (messageLower.includes('aposentadoria')) {
      params.objective = 'retirement';
    } else if (messageLower.includes('crescimento')) {
      params.objective = 'growth';
    } else if (messageLower.includes('renda') || messageLower.includes('dividendo')) {
      params.objective = 'income';
    }

    return params;
  }

  // Método para obter estatísticas do serviço
  getStats(): {
    provider: string;
    model: string;
    status: string;
    timestamp: string;
  } {
    return {
      provider: this.provider.name,
      model: this.provider.model,
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
}

// Instância singleton do serviço LLM
let llmServiceInstance: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService('GPT_4');
  }
  return llmServiceInstance;
} 