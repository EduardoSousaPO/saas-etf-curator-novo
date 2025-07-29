import { ExecutionPlan, APIResult, UserContext, UserIntent } from '../../types/agents';

export class ExecutorAgent {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
    console.log('⚡ ExecutorAgent inicializado');
  }

  async executeAPI(plan: ExecutionPlan, userContext: UserContext): Promise<APIResult> {
    try {
      console.log(`⚡ Executando plano: ${plan.intent}`, {
        apis: plan.requiredAPIs.length,
        parameters: Object.keys(plan.parameters).length
      });

      // Validar permissões
      if (!this.validatePermissions(plan, userContext)) {
        return this.createPermissionDeniedResult(plan, userContext);
      }

      // Se não há APIs para chamar, retornar resultado educativo
      if (plan.requiredAPIs.length === 0) {
        return this.createEducationalResult(plan);
      }

      // Executar API principal
      const primaryAPI = plan.requiredAPIs[0];
      const result = await this.callAPI(primaryAPI, plan.parameters, userContext);

      console.log(`✅ API executada com sucesso: ${primaryAPI}`);
      return result;

    } catch (error) {
      console.error('❌ Erro na execução:', error);
      return this.createErrorResult(error, plan);
    }
  }

  private async callAPI(endpoint: string, parameters: Record<string, any>, userContext: UserContext): Promise<APIResult> {
    try {
      // Mapear parâmetros para cada endpoint específico
      const apiParams = this.mapParametersForEndpoint(endpoint, parameters);
      
      // Simular chamada para API (por enquanto retornamos dados mock)
      const mockData = this.generateMockData(endpoint, apiParams);
      
      return {
        success: true,
        data: mockData,
        source: endpoint,
        timestamp: new Date(),
        processingTime: 1200 // Simular tempo de processamento
      };

    } catch (error) {
      throw new Error(`Falha na chamada da API ${endpoint}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private mapParametersForEndpoint(endpoint: string, parameters: Record<string, any>): Record<string, any> {
    const mappings: Record<string, (params: any) => any> = {
      '/api/portfolio/unified-master': (params) => ({
        objective: params.objective || 'growth',
        riskProfile: params.riskProfile || 'moderate',
        investment: params.investment || 10000,
        currency: params.currency || 'USD',
        timeHorizon: params.timeHorizon || 'long',
        includeInternational: true,
        includeBonds: params.riskProfile === 'conservative'
      }),
      
      '/api/etfs/screener': (params) => ({
        sector: params.sector,
        maxExpenseRatio: params.maxExpenseRatio || 0.5,
        minAUM: params.minAUM || 100000000,
        sortBy: params.sortBy || 'returns_12m',
        limit: params.limit || 20
      }),
      
      '/api/etfs/details': (params) => ({
        symbols: params.symbols || ['SPY', 'QQQ', 'VTI']
      }),
      
      '/api/market/metrics': (params) => ({
        period: params.period || '1M',
        includeVolatility: true,
        includeSentiment: true
      }),
      
      '/api/etfs/rankings': (params) => ({
        category: params.category || 'all',
        metric: params.metric || 'returns_12m',
        limit: params.limit || 10
      })
    };

    const mapper = mappings[endpoint];
    return mapper ? mapper(parameters) : parameters;
  }

  private generateMockData(endpoint: string, parameters: Record<string, any>): any {
    const mockDataGenerators: Record<string, (params: any) => any> = {
      '/api/portfolio/unified-master': (params) => ({
        portfolio: {
          allocations: [
            {
              symbol: 'VTI',
              name: 'Vanguard Total Stock Market ETF',
              percentage: 0.40,
              expense_ratio: 0.0003,
              returns_12m: 0.284,
              volatility: 0.145,
              sector: 'Total Market'
            },
            {
              symbol: 'VXUS',
              name: 'Vanguard Total International Stock ETF',
              percentage: 0.30,
              expense_ratio: 0.0008,
              returns_12m: 0.156,
              volatility: 0.162,
              sector: 'International'
            },
            {
              symbol: 'BND',
              name: 'Vanguard Total Bond Market ETF',
              percentage: 0.20,
              expense_ratio: 0.0003,
              returns_12m: 0.041,
              volatility: 0.062,
              sector: 'Bonds'
            },
            {
              symbol: 'VYM',
              name: 'Vanguard High Dividend Yield ETF',
              percentage: 0.10,
              expense_ratio: 0.0006,
              returns_12m: 0.218,
              volatility: 0.138,
              sector: 'Dividends'
            }
          ]
        },
        metrics: {
          expectedReturn: 0.182,
          volatility: 0.118,
          sharpeRatio: 1.54,
          totalExpenseRatio: 0.0005,
          maxDrawdown: 0.156
        },
        projections: {
          pessimistic: params.investment * 1.05,
          expected: params.investment * 1.18,
          optimistic: params.investment * 1.32
        }
      }),

      '/api/etfs/screener': (params) => ({
        etfs: [
          {
            symbol: 'VTI',
            name: 'Vanguard Total Stock Market ETF',
            expense_ratio: 0.0003,
            totalasset: 1200000000000,
            returns_12m: 0.284,
            dividend_yield: 0.015,
            volatility: 0.145,
            sector: 'Total Market'
          },
          {
            symbol: 'SCHD',
            name: 'Schwab US Dividend Equity ETF',
            expense_ratio: 0.0006,
            totalasset: 45000000000,
            returns_12m: 0.218,
            dividend_yield: 0.032,
            volatility: 0.138,
            sector: 'Dividends'
          },
          {
            symbol: 'QQQ',
            name: 'Invesco QQQ Trust',
            expense_ratio: 0.0020,
            totalasset: 180000000000,
            returns_12m: 0.342,
            dividend_yield: 0.008,
            volatility: 0.198,
            sector: 'Technology'
          }
        ],
        totalCount: 3,
        appliedFilters: params
      }),

      '/api/etfs/details': (params) => ({
        comparison: params.symbols.map((symbol: string, index: number) => {
          const mockETFs = {
            'SPY': { name: 'SPDR S&P 500 ETF Trust', returns_12m: 0.276, expense_ratio: 0.0945 },
            'QQQ': { name: 'Invesco QQQ Trust', returns_12m: 0.342, expense_ratio: 0.0020 },
            'VTI': { name: 'Vanguard Total Stock Market ETF', returns_12m: 0.284, expense_ratio: 0.0003 }
          };
          
          const etfData = mockETFs[symbol as keyof typeof mockETFs] || mockETFs['SPY'];
          
          return {
            symbol,
            ...etfData,
            totalasset: 100000000000 + (index * 50000000000),
            volatility: 0.15 + (index * 0.02),
            dividend_yield: 0.015 - (index * 0.002)
          };
        })
      }),

      '/api/market/metrics': () => ({
        marketMetrics: {
          totalETFs: 1370,
          totalAUM: 8500000000000,
          avgExpenseRatio: 0.0045,
          avgReturns12m: 0.198
        },
        trends: [
          {
            category: 'Technology',
            description: 'Setor em alta com crescimento sustentado',
            performance: 0.34
          },
          {
            category: 'Bonds',
            description: 'Estabilidade em meio à volatilidade',
            performance: 0.04
          }
        ],
        sectors: [
          {
            name: 'Technology',
            etfCount: 156,
            avgReturn: 0.34,
            avgVolatility: 0.22
          },
          {
            name: 'Healthcare',
            etfCount: 89,
            avgReturn: 0.18,
            avgVolatility: 0.16
          }
        ]
      }),

      '/api/etfs/rankings': (params) => ({
        rankings: [
          { symbol: 'QQQ', name: 'Invesco QQQ Trust', score: 9.2, returns_12m: 0.342 },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', score: 8.8, returns_12m: 0.284 },
          { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', score: 8.5, returns_12m: 0.276 }
        ],
        criteria: params.metric,
        totalEvaluated: 1370
      })
    };

    const generator = mockDataGenerators[endpoint];
    return generator ? generator(parameters) : { message: 'Dados processados com sucesso' };
  }

  private validatePermissions(plan: ExecutionPlan, userContext: UserContext): boolean {
    // Mapeamento de permissões por plano
    const permissionMatrix: Record<string, string[]> = {
      'STARTER': ['ETF_SCREENING', 'EDUCATIONAL', 'MARKET_ANALYSIS'],
      'PRO': ['ETF_SCREENING', 'EDUCATIONAL', 'MARKET_ANALYSIS', 'PORTFOLIO_OPTIMIZATION', 'ETF_COMPARISON'],
      'WEALTH': ['ETF_SCREENING', 'EDUCATIONAL', 'MARKET_ANALYSIS', 'PORTFOLIO_OPTIMIZATION', 'ETF_COMPARISON', 'RANKINGS_ANALYSIS', 'REBALANCING'],
      'OFFSHORE': ['ETF_SCREENING', 'EDUCATIONAL', 'MARKET_ANALYSIS', 'PORTFOLIO_OPTIMIZATION', 'ETF_COMPARISON', 'RANKINGS_ANALYSIS', 'REBALANCING', 'PROJECT_MANAGEMENT']
    };

    // Se não há contexto do usuário, assumir usuário anônimo com permissões básicas
    if (!userContext || !userContext.subscriptionPlan) {
      const allowedForAnonymous = ['ETF_SCREENING', 'EDUCATIONAL', 'MARKET_ANALYSIS'];
      return allowedForAnonymous.includes(plan.intent);
    }

    const userPermissions = permissionMatrix[userContext.subscriptionPlan] || [];
    return userPermissions.includes(plan.intent);
  }

  private createPermissionDeniedResult(plan: ExecutionPlan, userContext: UserContext): APIResult {
    const currentPlan = userContext?.subscriptionPlan || 'STARTER';
    
    return {
      success: false,
      data: {
        error: 'PERMISSION_DENIED',
        message: `Funcionalidade ${plan.intent} não disponível no plano ${currentPlan}`,
        currentPlan,
        requiredPlan: this.getRequiredPlan(plan.intent),
        upgradeUrl: '/pricing'
      },
      source: 'permission_validator',
      timestamp: new Date(),
      processingTime: 50
    };
  }

  private createEducationalResult(plan: ExecutionPlan): APIResult {
    return {
      success: true,
      data: {
        type: 'educational',
        query: plan.parameters.query || 'Conceito financeiro',
        explanation: 'Explicação educativa será gerada pelo WriterAgent',
        examples: [],
        relatedTopics: []
      },
      source: 'educational_processor',
      timestamp: new Date(),
      processingTime: 100
    };
  }

  private createErrorResult(error: any, plan: ExecutionPlan): APIResult {
    return {
      success: false,
      data: {
        error: 'EXECUTION_ERROR',
        message: error.message || 'Erro na execução da API',
        intent: plan.intent,
        timestamp: new Date().toISOString()
      },
      source: 'error_handler',
      timestamp: new Date(),
      processingTime: 0
    };
  }

  private getRequiredPlan(intent: string): string {
    const planRequirements: Record<string, string> = {
      'PORTFOLIO_OPTIMIZATION': 'PRO',
      'REBALANCING': 'WEALTH',
      'PROJECT_MANAGEMENT': 'OFFSHORE',
      'RANKINGS_ANALYSIS': 'WEALTH'
    };

    return planRequirements[intent] || 'PRO';
  }

  // Health check
  getStatus(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
} 