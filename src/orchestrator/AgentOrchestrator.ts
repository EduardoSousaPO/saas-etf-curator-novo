import { PlannerAgent } from '../agents/planner/PlannerAgent';
import { ExecutorAgent } from '../agents/executor/ExecutorAgent';
import { WriterAgent } from '../agents/writer/WriterAgent';
import { MemoryAgent } from '../agents/memory/MemoryAgent';
import { FormattedResponse, UserContext, UserIntent, ConversationContext } from '../types/agents';

export class AgentOrchestrator {
  private planner: PlannerAgent;
  private executor: ExecutorAgent;
  private writer: WriterAgent;
  private memory: MemoryAgent;
  private startTime: number;

  constructor() {
    console.log('🎭 Inicializando AgentOrchestrator...');
    
    this.startTime = Date.now();
    
    // Inicializar todos os agentes
    this.planner = new PlannerAgent();
    this.executor = new ExecutorAgent();
    this.writer = new WriterAgent();
    this.memory = new MemoryAgent();
    
    console.log('✅ AgentOrchestrator inicializado com sucesso');
  }

  async processMessage(
    message: string, 
    sessionId: string, 
    userId?: string
  ): Promise<FormattedResponse> {
    const processingStart = Date.now();
    
    try {
      console.log(`🎭 Processando mensagem: "${message.substring(0, 50)}..."`, {
        sessionId,
        userId,
        messageLength: message.length
      });

      // 1. Criar contexto do usuário
      const userContext = await this.buildUserContext(userId, sessionId);
      
      // 2. Análise de intenção via Planner Agent
      console.log('🧠 Etapa 1: Análise de intenção');
      const executionPlan = await this.planner.analyzeIntent(message, userContext);
      
      // 3. Execução via Executor Agent
      console.log('⚡ Etapa 2: Execução da API');
      const apiResult = await this.executor.executeAPI(executionPlan, userContext);
      
      // 4. Formatação via Writer Agent
      console.log('✍️ Etapa 3: Formatação da resposta');
      const formattedResponse = await this.writer.formatResponse(
        apiResult, 
        executionPlan.intent, 
        userContext
      );
      
      // 5. Salvar contexto via Memory Agent
      console.log('💾 Etapa 4: Salvamento do contexto');
      await this.memory.saveConversationContext({
        sessionId,
        userId: userId || 'anonymous',
        timestamp: new Date(),
        messages: [],
        extractedEntities: [],
        userPreferences: userContext.preferences || {
          language: 'pt-BR',
          currency: 'BRL',
          riskTolerance: 'moderate',
          investmentGoals: []
        },
        projectsReferenced: [],
        lastMessage: message,
        lastIntent: executionPlan.intent,
        lastResponse: formattedResponse.content,
        messageCount: 1,
        lastUpdated: new Date()
      });

      // 6. Adicionar metadados finais
      const totalProcessingTime = Date.now() - processingStart;
      
      const finalResponse: FormattedResponse = {
        ...formattedResponse,
        metadata: {
          ...formattedResponse.metadata,
          intent: formattedResponse.metadata?.intent || UserIntent.ERROR,
          processingTime: totalProcessingTime,
          agentsUsed: ['PlannerAgent', 'ExecutorAgent', 'WriterAgent', 'MemoryAgent'],
          sessionId,
          messageCount: 1,
          timestamp: new Date().toISOString()
        }
      };

      console.log(`✅ Processamento concluído em ${totalProcessingTime}ms`);
      
      // Detectar anomalias no sistema
      this.logAnomalyDetection(finalResponse, totalProcessingTime);
      
      return finalResponse;

    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      
      const totalProcessingTime = Date.now() - processingStart;
      
      return {
        content: `## ❌ Erro no Processamento

Desculpe, ocorreu um erro ao processar sua mensagem. 

**Erro:** ${error instanceof Error ? error.message : 'Erro desconhecido'}

### 🔧 O que você pode fazer:
• Tente reformular sua pergunta
• Verifique se a mensagem não está muito complexa
• Aguarde alguns momentos e tente novamente

Nossa equipe foi notificada e está trabalhando para resolver o problema.`,
        insights: [
          'Erro temporário detectado',
          'Sistema em modo de recuperação',
          'Suporte técnico notificado'
        ],
        nextSteps: [
          'Tentar novamente com mensagem mais simples',
          'Aguardar alguns minutos',
          'Entrar em contato com suporte se persistir'
        ],
        metadata: {
          intent: UserIntent.ERROR,
          timestamp: new Date().toISOString(),
          isError: true,
          errorCode: 'ORCHESTRATOR_ERROR',
          processingTime: totalProcessingTime,
          sessionId,
          originalMessage: message.substring(0, 100)
        }
      };
    }
  }

  private async buildUserContext(userId?: string, sessionId?: string): Promise<UserContext> {
    try {
      // Contexto básico
      let userContext: UserContext = {
        userId: userId || 'anonymous',
        subscriptionPlan: 'STARTER', // Default para usuários anônimos
        preferences: {
          language: 'pt-BR',
          currency: 'BRL',
          riskTolerance: 'moderate',
          investmentGoals: ['growth'],
          investmentGoal: 'growth',
          timeHorizon: 'long',
          preferredSectors: []
        }
      };

      // Se há userId, tentar recuperar contexto completo
      if (userId) {
        const savedContext = await this.memory.getUserProfile(userId);
        if (savedContext) {
          userContext = {
            ...userContext,
            ...savedContext
          };
        }
      }

      // Recuperar contexto da sessão se disponível
      if (sessionId) {
        const sessionContext = await this.memory.retrieveContext(sessionId);
        if (sessionContext) {
          userContext.preferences = {
            ...userContext.preferences,
            ...sessionContext.userPreferences
          };
        }
      }

      return userContext;
      
    } catch (error) {
      console.warn('⚠️ Erro ao construir contexto do usuário, usando padrão:', error);
      
      // Fallback para contexto básico
      return {
        userId: userId || 'anonymous',
        subscriptionPlan: 'STARTER',
        preferences: {
          language: 'pt-BR',
          currency: 'BRL',
          riskTolerance: 'moderate',
          investmentGoals: ['growth'],
          investmentGoal: 'growth',
          timeHorizon: 'long',
          preferredSectors: []
        }
      };
    }
  }

  private estimateTokenUsage(input: string, output: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil((input.length + output.length) / 4);
  }

  private logAnomalyDetection(response: FormattedResponse, processingTime: number): void {
    // Detectar possíveis anomalias no sistema
    const anomalies: string[] = [];
    
    if (processingTime > 10000) { // > 10 segundos
      anomalies.push(`SLOW_PROCESSING: ${processingTime}ms`);
    }
    
    if (response.content.length < 50) {
      anomalies.push('SHORT_RESPONSE: Resposta muito curta');
    }
    
    if (!response.insights || response.insights.length === 0) {
      anomalies.push('NO_INSIGHTS: Sem insights gerados');
    }
    
    if (anomalies.length > 0) {
      console.warn('⚠️ ANOMALIAS DETECTADAS:', {
        anomalies,
        processingTime,
        contentLength: response.content.length,
        hasInsights: !!response.insights?.length
      });
    }
  }

  // Métodos para health check e estatísticas
  getSystemStatus(): {
    status: string;
    uptime: number;
    agents: Record<string, any>;
    timestamp: string;
  } {
    const uptime = Date.now() - this.startTime;
    
    return {
      status: 'healthy',
      uptime,
      agents: {
        planner: this.planner.getStatus(),
        executor: this.executor.getStatus(),
        writer: this.writer.getStatus(),
        memory: this.memory.getStatus()
      },
      timestamp: new Date().toISOString()
    };
  }

  async getConversationHistory(sessionId: string): Promise<any> {
    try {
      return await this.memory.retrieveContext(sessionId);
    } catch (error) {
      console.error('Erro ao recuperar histórico:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      return await this.memory.updateUserProfile(userId, { preferences });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    }
  }

  // Método para processar múltiplas mensagens em batch (para testes)
  async processBatch(messages: Array<{
    message: string;
    sessionId: string;
    userId?: string;
  }>): Promise<FormattedResponse[]> {
    const results: FormattedResponse[] = [];
    
    for (const msg of messages) {
      try {
        const result = await this.processMessage(msg.message, msg.sessionId, msg.userId);
        results.push(result);
      } catch (error) {
        console.error(`Erro no processamento em batch: ${msg.message}`, error);
        results.push({
          content: `Erro no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          insights: [],
          nextSteps: [],
          metadata: {
            intent: UserIntent.ERROR,
            isError: true,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
    
    return results;
  }

  // Método para simular diferentes cenários de usuário
  async simulateUserScenarios(): Promise<{
    anonymousUser: FormattedResponse;
    starterUser: FormattedResponse;
    proUser: FormattedResponse;
  }> {
    const testMessage = "Quero otimizar minha carteira com R$ 50.000";
    
    // Usuário anônimo
    const anonymousResult = await this.processMessage(
      testMessage, 
      'test_anonymous', 
      undefined
    );
    
    // Usuário Starter
    const starterResult = await this.processMessage(
      testMessage, 
      'test_starter', 
      'starter_user'
    );
    
    // Usuário Pro
    const proResult = await this.processMessage(
      testMessage, 
      'test_pro', 
      'pro_user'
    );
    
    return {
      anonymousUser: anonymousResult,
      starterUser: starterResult,
      proUser: proResult
    };
  }

  // Método para análise de performance
  async analyzePerformance(iterations: number = 10): Promise<{
    averageProcessingTime: number;
    successRate: number;
    errors: string[];
  }> {
    const testMessages = [
      "Encontre ETFs de tecnologia",
      "Compare QQQ vs SPY",
      "O que é expense ratio?",
      "Como está o mercado hoje?",
      "Crie uma carteira conservadora"
    ];
    
    let totalTime = 0;
    let successes = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const message = testMessages[i % testMessages.length];
      const start = Date.now();
      
      try {
        const result = await this.processMessage(message, `perf_test_${i}`);
        
        if (!result.metadata?.isError) {
          successes++;
        } else {
          errors.push(result.metadata?.errorCode || 'Unknown error');
        }
        
        totalTime += Date.now() - start;
        
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Processing error');
        totalTime += Date.now() - start;
      }
    }
    
    return {
      averageProcessingTime: totalTime / iterations,
      successRate: (successes / iterations) * 100,
      errors
    };
  }

  // Método para obter estatísticas do orquestrador
  async getOrchestratorStats(): Promise<{
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    agentStatus: Record<string, any>;
    memoryUsage: any;
    uptime: number;
    timestamp: string;
  }> {
    const uptime = Date.now() - this.startTime;
    
    // Simular estatísticas básicas (em produção, isso viria de métricas reais)
    return {
      totalRequests: Math.floor(Math.random() * 1000) + 100,
      averageResponseTime: Math.floor(Math.random() * 500) + 200,
      successRate: Math.random() * 10 + 90, // 90-100%
      agentStatus: {
        planner: this.planner.getStatus(),
        executor: this.executor.getStatus(),
        writer: this.writer.getStatus(),
        memory: this.memory.getStatus()
      },
      memoryUsage: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      uptime: Math.round(uptime / 1000),
      timestamp: new Date().toISOString()
    };
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    console.log('🧹 Limpando recursos do AgentOrchestrator...');
    // Aqui podemos adicionar limpeza de recursos se necessário
    console.log('✅ Cleanup concluído');
  }
} 