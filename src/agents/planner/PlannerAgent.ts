import { ExecutionPlan, UserContext, UserIntent } from '../../types/agents';
import { getLLMService } from '../../lib/ai/llm-integration';

export class PlannerAgent {
  private llmService: any;

  constructor() {
    this.llmService = getLLMService();
    console.log('🧠 PlannerAgent inicializado com GPT-4');
  }

  async analyzeIntent(message: string, context?: UserContext): Promise<ExecutionPlan> {
    try {
      console.log(`🧠 Analisando intenção: "${message.substring(0, 100)}..."`);
      
      // Usar GPT-4 para análise de intenção
      const analysis = await this.llmService.analyzeIntent(message, context);
      
      console.log(`✅ Intenção identificada: ${analysis.intent} (confiança: ${(analysis.confidence * 100).toFixed(1)}%)`);
      
      // Gerar plano de execução baseado na intenção
      const executionPlan: ExecutionPlan = {
        intent: analysis.intent,
        parameters: analysis.parameters,
        executionSteps: this.generateExecutionSteps(analysis.intent),
        requiredAPIs: this.mapIntentToAPIs(analysis.intent),
        confidence: analysis.confidence,
        timestamp: new Date()
      };

      return executionPlan;

    } catch (error) {
      console.error('❌ Erro na análise de intenção:', error);
      
      // Fallback para classificação baseada em palavras-chave
      console.log('🔄 Usando fallback de classificação...');
      return this.fallbackAnalysis(message, context);
    }
  }

  private fallbackAnalysis(message: string, context?: UserContext): ExecutionPlan {
    const intent = this.classifyIntentByKeywords(message);
    const parameters = this.extractParameters(message, intent);
    
    return {
      intent,
      parameters,
      executionSteps: this.generateExecutionSteps(intent),
      requiredAPIs: this.mapIntentToAPIs(intent),
      confidence: 0.6, // Confiança média para fallback
      timestamp: new Date()
    };
  }

  private classifyIntentByKeywords(message: string): UserIntent {
    const messageLower = message.toLowerCase();
    
    // Palavras-chave para cada intenção (mantido como fallback)
    const intentKeywords = {
      [UserIntent.PORTFOLIO_OPTIMIZATION]: [
        'portfolio', 'carteira', 'otimiz', 'alocar', 'diversif', 'markowitz',
        'criar carteira', 'montar portfolio', 'investimento', 'alocação'
      ],
      [UserIntent.ETF_SCREENING]: [
        'filtro', 'encontrar', 'buscar', 'screening', 'etf com', 'setor',
        'procurar', 'listar', 'mostrar etfs', 'filtrar'
      ],
      [UserIntent.ETF_COMPARISON]: [
        'comparar', 'versus', 'vs', 'diferença', 'melhor entre',
        'comparação', 'qual melhor', 'diferenças'
      ],
      [UserIntent.MARKET_ANALYSIS]: [
        'mercado', 'tendência', 'análise', 'cenário', 'outlook',
        'situação', 'panorama', 'contexto'
      ],
      [UserIntent.EDUCATIONAL]: [
        'o que é', 'como funciona', 'explicar', 'conceito', 'definição',
        'ensinar', 'aprender', 'entender', 'significado'
      ],
      [UserIntent.RANKINGS_ANALYSIS]: [
        'ranking', 'melhores', 'top', 'classificação',
        'maiores', 'principais', 'líderes'
      ],
      [UserIntent.REBALANCING]: [
        'rebalance', 'ajustar', 'realocação', 'rebalancear',
        'redistribuir', 'reorganizar'
      ],
      [UserIntent.PROJECT_MANAGEMENT]: [
        'salvar', 'projeto', 'gerenciar', 'organizar',
        'guardar', 'administrar'
      ]
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

    return bestIntent;
  }

  private extractParameters(message: string, intent: UserIntent): Record<string, any> {
    const parameters: Record<string, any> = {};
    const messageLower = message.toLowerCase();

    // Extrair valores monetários
    const moneyPatterns = [
      /(?:R\$|BRL)\s*([0-9,.]+)/i,
      /(?:USD|\$)\s*([0-9,.]+)/i,
      /([0-9,.]+)\s*(?:reais|dólares)/i
    ];

    for (const pattern of moneyPatterns) {
      const match = message.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(/[,.]/g, ''));
        parameters.investment = value;
        parameters.currency = message.includes('R$') || message.includes('reais') ? 'BRL' : 'USD';
        break;
      }
    }

    // Extrair perfil de risco
    if (messageLower.includes('conservador') || messageLower.includes('baixo risco') || messageLower.includes('seguro')) {
      parameters.riskProfile = 'conservative';
    } else if (messageLower.includes('agressivo') || messageLower.includes('alto risco') || messageLower.includes('arriscado')) {
      parameters.riskProfile = 'aggressive';
    } else if (messageLower.includes('moderado') || messageLower.includes('equilibrado')) {
      parameters.riskProfile = 'moderate';
    }

    // Extrair objetivos de investimento
    if (messageLower.includes('aposentadoria') || messageLower.includes('retirement')) {
      parameters.objective = 'retirement';
    } else if (messageLower.includes('crescimento') || messageLower.includes('growth')) {
      parameters.objective = 'growth';
    } else if (messageLower.includes('renda') || messageLower.includes('dividendo') || messageLower.includes('income')) {
      parameters.objective = 'income';
    } else if (messageLower.includes('preservação') || messageLower.includes('preservation')) {
      parameters.objective = 'preservation';
    }

    // Extrair setores específicos
    const sectors = [
      'tecnologia', 'technology', 'tech',
      'saúde', 'healthcare', 'health',
      'financeiro', 'financial', 'banks',
      'energia', 'energy',
      'imobiliário', 'real estate', 'reit',
      'commodities', 'ouro', 'gold'
    ];

    for (const sector of sectors) {
      if (messageLower.includes(sector)) {
        parameters.sector = sector;
        break;
      }
    }

    // Extrair símbolos de ETFs
    const etfSymbols = message.match(/\b[A-Z]{2,5}\b/g);
    if (etfSymbols && etfSymbols.length > 0) {
      parameters.symbols = etfSymbols;
    }

    // Parâmetros específicos por intenção
    switch (intent) {
      case UserIntent.ETF_SCREENING:
        // Extrair critérios de filtro
        if (messageLower.includes('baixa taxa') || messageLower.includes('baixo custo')) {
          parameters.maxExpenseRatio = 0.005; // 0.5%
        }
        if (messageLower.includes('alta liquidez') || messageLower.includes('grande')) {
          parameters.minAUM = 1000000000; // $1B
        }
        break;

      case UserIntent.ETF_COMPARISON:
        if (!parameters.symbols && etfSymbols) {
          parameters.symbols = etfSymbols;
        }
        break;

      case UserIntent.RANKINGS_ANALYSIS:
        if (messageLower.includes('performance') || messageLower.includes('retorno')) {
          parameters.criteria = 'returns_12m';
        } else if (messageLower.includes('dividendo')) {
          parameters.criteria = 'dividend_yield';
        } else if (messageLower.includes('custo') || messageLower.includes('taxa')) {
          parameters.criteria = 'expense_ratio';
        }
        break;
    }

    return parameters;
  }

  private generateExecutionSteps(intent: UserIntent): string[] {
    const steps: Record<UserIntent, string[]> = {
      [UserIntent.PORTFOLIO_OPTIMIZATION]: [
        'Analisar perfil de risco do usuário',
        'Aplicar otimização de Markowitz',
        'Selecionar ETFs adequados',
        'Calcular métricas de risco-retorno',
        'Gerar projeções de cenários'
      ],
      [UserIntent.ETF_SCREENING]: [
        'Aplicar filtros especificados',
        'Consultar base de dados de ETFs',
        'Calcular scores de qualidade',
        'Ordenar resultados por relevância',
        'Formatar lista de recomendações'
      ],
      [UserIntent.ETF_COMPARISON]: [
        'Buscar dados dos ETFs solicitados',
        'Calcular métricas comparativas',
        'Analisar correlações',
        'Identificar pontos fortes/fracos',
        'Gerar recomendação final'
      ],
      [UserIntent.MARKET_ANALYSIS]: [
        'Coletar dados de mercado atuais',
        'Analisar tendências setoriais',
        'Identificar oportunidades',
        'Avaliar riscos sistêmicos',
        'Gerar insights estratégicos'
      ],
      [UserIntent.EDUCATIONAL]: [
        'Identificar conceito a ser explicado',
        'Buscar definições e exemplos',
        'Preparar explicação didática',
        'Incluir exemplos práticos',
        'Sugerir próximos passos de aprendizado'
      ],
      [UserIntent.RANKINGS_ANALYSIS]: [
        'Definir critérios de ranking',
        'Calcular scores dos ETFs',
        'Ordenar por performance',
        'Analisar metodologia',
        'Destacar vencedores e tendências'
      ],
      [UserIntent.REBALANCING]: [
        'Analisar portfolio atual',
        'Identificar desvios da alocação ideal',
        'Calcular transações necessárias',
        'Considerar custos de rebalanceamento',
        'Gerar plano de execução'
      ],
      [UserIntent.PROJECT_MANAGEMENT]: [
        'Identificar dados a serem salvos',
        'Organizar informações do projeto',
        'Definir metadados relevantes',
        'Persistir no sistema',
        'Confirmar salvamento'
      ],
      [UserIntent.ERROR]: [
        'Identificar tipo de erro',
        'Gerar mensagem de erro apropriada',
        'Sugerir ações corretivas'
      ]
    };

    return steps[intent] || ['Processar solicitação', 'Gerar resposta'];
  }

  private mapIntentToAPIs(intent: UserIntent): string[] {
    const apiMapping: Record<UserIntent, string[]> = {
      [UserIntent.PORTFOLIO_OPTIMIZATION]: ['/api/portfolio/unified-master'],
      [UserIntent.ETF_SCREENING]: ['/api/etfs/screener'],
      [UserIntent.ETF_COMPARISON]: ['/api/etfs/details'],
      [UserIntent.MARKET_ANALYSIS]: ['/api/market/metrics'],
      [UserIntent.RANKINGS_ANALYSIS]: ['/api/etfs/rankings'],
      [UserIntent.EDUCATIONAL]: [], // Não precisa de APIs externas
      [UserIntent.REBALANCING]: ['/api/portfolio/rebalance'],
      [UserIntent.PROJECT_MANAGEMENT]: ['/api/portfolio/save'],
      [UserIntent.ERROR]: []
    };

    return apiMapping[intent] || [];
  }

  // Health check
  getStatus(): { status: string; timestamp: string; llmProvider?: string } {
    const llmStats = this.llmService?.getStats();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      llmProvider: llmStats?.provider || 'GPT-4'
    };
  }
} 