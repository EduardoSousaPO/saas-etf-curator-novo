/**
 * Sistema de Contexto Conversacional - Vista ETF AI
 * Mantém estado e informações entre mensagens para criar um agente inteligente
 */

interface ConversationState {
  userId: string;
  conversationId: string;
  extractedData: Record<string, any>;
  currentGoal?: string;
  lastIntent?: string;
  messageHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: string;
    extractedData?: any;
  }>;
  pendingActions: Array<{
    action: string;
    data: any;
    priority: number;
  }>;
  createdAt: Date;
  lastActivity: Date;
}

class ConversationContextManager {
  private contexts = new Map<string, ConversationState>();
  
  /**
   * Obtém ou cria contexto da conversa
   */
  getContext(userId: string, conversationId?: string): ConversationState {
    const contextKey = `${userId}_${conversationId || 'default'}`;
    
    if (!this.contexts.has(contextKey)) {
      this.contexts.set(contextKey, {
        userId,
        conversationId: conversationId || 'default',
        extractedData: {},
        messageHistory: [],
        pendingActions: [],
        createdAt: new Date(),
        lastActivity: new Date()
      });
    }
    
    const context = this.contexts.get(contextKey)!;
    context.lastActivity = new Date();
    return context;
  }
  
  /**
   * Adiciona mensagem ao histórico
   */
  addMessage(
    userId: string, 
    conversationId: string | undefined,
    role: 'user' | 'assistant',
    content: string,
    intent?: string,
    extractedData?: any
  ): void {
    const context = this.getContext(userId, conversationId);
    
    context.messageHistory.push({
      role,
      content,
      timestamp: new Date(),
      intent,
      extractedData
    });
    
    // Manter apenas últimas 20 mensagens para performance
    if (context.messageHistory.length > 20) {
      context.messageHistory = context.messageHistory.slice(-20);
    }
    
    // Atualizar dados extraídos se fornecidos
    if (extractedData) {
      context.extractedData = { ...context.extractedData, ...extractedData };
    }
    
    if (intent) {
      context.lastIntent = intent;
    }
  }
  
  /**
   * Extrai informações inteligentemente usando contexto + IA
   */
  async extractDataIntelligently(
    userId: string,
    conversationId: string | undefined,
    message: string,
    intent: string
  ): Promise<any> {
    const context = this.getContext(userId, conversationId);
    
    // Usar IA para extrair dados considerando contexto
    const extractedData = await this.smartExtraction(message, intent, context);
    
    // Mesclar com dados já extraídos
    const mergedData = { ...context.extractedData, ...extractedData };
    context.extractedData = mergedData;
    
    return mergedData;
  }
  
  /**
   * Extração inteligente usando IA
   */
  private async smartExtraction(
    message: string,
    intent: string,
    context: ConversationState
  ): Promise<any> {
    const { callOpenAIChat } = await import('../agent.config');
    
    const extractionPrompt = `
Você é um extrator inteligente de dados financeiros. Analise a mensagem do usuário e extraia informações relevantes.

CONTEXTO DA CONVERSA:
${context.messageHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

DADOS JÁ EXTRAÍDOS:
${JSON.stringify(context.extractedData, null, 2)}

MENSAGEM ATUAL: "${message}"
INTENT: ${intent}

INSTRUÇÕES:
1. Extraia APENAS informações novas ou que complementem as existentes
2. Para valores monetários, reconheça: "200 mil", "200k", "200.000", "200,000", etc.
3. Para perfil de risco: conservador, moderado, arrojado, agressivo
4. Para objetivos: aposentadoria, casa, emergência, crescimento
5. Para moedas: USD, BRL, dólares, reais
6. Para prazos: curto (1-2 anos), médio (3-5 anos), longo (5+ anos)

FORMATO DE RESPOSTA (JSON):
{
  "amount": número ou null,
  "currency": "USD" ou "BRL" ou null,
  "goal": "aposentadoria" ou "casa" ou "emergência" ou "crescimento" ou null,
  "risk_profile": "conservador" ou "moderado" ou "arrojado" ou null,
  "time_horizon": "curto" ou "médio" ou "longo" ou null,
  "confidence": 0-100,
  "needs_clarification": ["campo1", "campo2"] ou []
}

Responda APENAS com JSON válido:
`;

    try {
      const response = await callOpenAIChat({
        system: "Você é um extrator de dados financeiros. Responda APENAS com JSON válido.",
        user: extractionPrompt,
        maxTokens: 300
      });
      
      const cleanResponse = response.trim();
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {};
    } catch (error) {
      console.error('Erro na extração inteligente:', error);
      return {};
    }
  }
  
  /**
   * Verifica se tem informações suficientes para executar ação
   */
  canExecuteAction(userId: string, conversationId: string | undefined, intent: string): {
    canExecute: boolean;
    missingFields: string[];
    extractedData: any;
  } {
    const context = this.getContext(userId, conversationId);
    const data = context.extractedData;
    
    const requirements: Record<string, string[]> = {
      'CREATE_OPTIMIZED_PORTFOLIO': ['amount', 'goal', 'risk_profile'],
      'COMPARE_ETFS': ['symbols'],
      'FILTER_ETFS': ['filters'],
      'GET_RANKINGS': ['category'],
      'PLAN_CONTRIBUTION': ['amount']
    };
    
    const required = requirements[intent] || [];
    const missing = required.filter(field => !data[field]);
    
    return {
      canExecute: missing.length === 0,
      missingFields: missing,
      extractedData: data
    };
  }
  
  /**
   * Gera pergunta inteligente para campo faltante
   */
  generateSmartQuestion(missingField: string, context: ConversationState): string {
    const questions: Record<string, string> = {
      'amount': 'Qual valor você pretende investir?',
      'goal': 'Qual é seu objetivo principal? (aposentadoria, comprar casa, reserva de emergência, ou crescimento)',
      'risk_profile': 'Qual seu perfil de investidor? (conservador, moderado ou arrojado)',
      'currency': 'Prefere investir em Reais (BRL) ou Dólares (USD)?',
      'time_horizon': 'Qual seu prazo de investimento? (curto, médio ou longo prazo)',
      'symbols': 'Quais ETFs você gostaria de comparar?',
      'category': 'Que tipo de ranking você quer ver? (performance, dividendos, baixo custo, etc.)'
    };
    
    return questions[missingField] || `Preciso de mais informações sobre: ${missingField}`;
  }
  
  /**
   * Adiciona ação pendente
   */
  addPendingAction(
    userId: string,
    conversationId: string | undefined,
    action: string,
    data: any,
    priority: number = 1
  ): void {
    const context = this.getContext(userId, conversationId);
    
    context.pendingActions.push({
      action,
      data,
      priority
    });
    
    // Ordenar por prioridade
    context.pendingActions.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Obtém próxima ação a executar
   */
  getNextAction(userId: string, conversationId: string | undefined): any {
    const context = this.getContext(userId, conversationId);
    return context.pendingActions.shift();
  }
  
  /**
   * Limpa contexto (para nova conversa)
   */
  clearContext(userId: string, conversationId?: string): void {
    const contextKey = `${userId}_${conversationId || 'default'}`;
    this.contexts.delete(contextKey);
  }
  
  /**
   * Limpeza automática de contextos antigos
   */
  cleanup(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    for (const [key, context] of this.contexts.entries()) {
      if (now.getTime() - context.lastActivity.getTime() > maxAge) {
        this.contexts.delete(key);
      }
    }
  }
}

// Instância singleton
export const conversationContext = new ConversationContextManager();

// Limpeza automática a cada hora
setInterval(() => {
  conversationContext.cleanup();
}, 60 * 60 * 1000);

export default conversationContext;

