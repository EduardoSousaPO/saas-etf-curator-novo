import { ETF } from '@/types';
import { InvestorProfile } from '@/lib/onboarding/profiles';

export interface PortfolioAllocation {
  etfSymbol: string;
  etfName: string;
  percentage: number;
  amount: number;
  shares?: number;
}

export interface PortfolioSimulation {
  id: string;
  name: string;
  description?: string;
  totalAmount: number;
  allocations: PortfolioAllocation[];
  metrics: PortfolioMetrics;
  risk: RiskAssessment;
  createdAt: Date;
  lastUpdated: Date;
}

export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  diversificationScore: number;
  expenseRatio: number;
  dividendYield: number;
  sectorExposure: Record<string, number>;
  regionExposure: Record<string, number>;
}

export interface RiskAssessment {
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  riskScore: number;
  confidence: number;
  warnings: string[];
  recommendations: string[];
}

export interface BacktestResult {
  period: string;
  returns: number[];
  cumulativeReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  sortino: number;
}

export interface SimulationScenario {
  name: string;
  description: string;
  marketCondition: 'bull' | 'bear' | 'neutral' | 'crisis';
  adjustments: {
    returnMultiplier: number;
    volatilityMultiplier: number;
    correlationIncrease: number;
  };
}

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    name: 'Mercado Normal',
    description: 'Condições normais de mercado',
    marketCondition: 'neutral',
    adjustments: {
      returnMultiplier: 1.0,
      volatilityMultiplier: 1.0,
      correlationIncrease: 0
    }
  },
  {
    name: 'Mercado em Alta',
    description: 'Período de crescimento sustentado',
    marketCondition: 'bull',
    adjustments: {
      returnMultiplier: 1.3,
      volatilityMultiplier: 0.8,
      correlationIncrease: -0.1
    }
  },
  {
    name: 'Mercado em Baixa',
    description: 'Período de declínio prolongado',
    marketCondition: 'bear',
    adjustments: {
      returnMultiplier: 0.6,
      volatilityMultiplier: 1.4,
      correlationIncrease: 0.2
    }
  },
  {
    name: 'Crise Financeira',
    description: 'Condições extremas de stress',
    marketCondition: 'crisis',
    adjustments: {
      returnMultiplier: 0.3,
      volatilityMultiplier: 2.0,
      correlationIncrease: 0.4
    }
  }
];

export class PortfolioSimulator {
  
  // Criar nova simulação
  static createSimulation(
    name: string,
    allocations: PortfolioAllocation[],
    etfs: ETF[],
    description?: string
  ): PortfolioSimulation {
    
    const totalAmount = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    
    // Calcular shares para cada ETF
    const allocationsWithShares = allocations.map(alloc => {
      const _etf = etfs.find(e => e.symbol === alloc.etfSymbol);
      const mockPrice = 100; // Em produção, usar preço real
      return {
        ...alloc,
        shares: Math.floor(alloc.amount / mockPrice)
      };
    });

    const metrics = this.calculatePortfolioMetrics(allocationsWithShares, etfs);
    const risk = this.assessRisk(metrics, allocationsWithShares, etfs);

    return {
      id: this.generateId(),
      name,
      description,
      totalAmount,
      allocations: allocationsWithShares,
      metrics,
      risk,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  // Calcular métricas da carteira
  static calculatePortfolioMetrics(
    allocations: PortfolioAllocation[],
    etfs: ETF[]
  ): PortfolioMetrics {
    
    const totalAmount = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    
    // Calcular retorno esperado ponderado
    let expectedReturn = 0;
    let volatility = 0;
    let expenseRatio = 0;
    let dividendYield = 0;
    
    allocations.forEach(alloc => {
      const etf = etfs.find(e => e.symbol === alloc.etfSymbol);
      if (!etf) return;
      
      const weight = alloc.amount / totalAmount;
      
      expectedReturn += (etf.returns_12m || 0) * weight;
      volatility += Math.pow((etf.volatility_12m || 15) * weight, 2);
      expenseRatio += (etf.expense_ratio || 0) * weight;
      dividendYield += (etf.dividend_yield || 0) * weight;
    });
    
    volatility = Math.sqrt(volatility);
    
    // Sharpe Ratio (assumindo risk-free rate de 2%)
    const riskFreeRate = 2;
    const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
    
    // Max Drawdown estimado baseado na volatilidade
    const maxDrawdown = volatility * 1.5;
    
    // Score de diversificação (básico)
    const diversificationScore = Math.min(allocations.length * 20, 100);
    
    // Exposição por setor
    const sectorExposure: Record<string, number> = {};
    allocations.forEach(alloc => {
      const etf = etfs.find(e => e.symbol === alloc.etfSymbol);
      if (etf?.sector) {
        const weight = alloc.percentage;
        sectorExposure[etf.sector] = (sectorExposure[etf.sector] || 0) + weight;
      }
    });
    
    // Exposição por região (simulada)
    const regionExposure = {
      'Estados Unidos': 70,
      'Internacional': 20,
      'Emergentes': 10
    };

    return {
      expectedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      diversificationScore,
      expenseRatio,
      dividendYield,
      sectorExposure,
      regionExposure
    };
  }

  // Avaliar risco da carteira
  static assessRisk(
    metrics: PortfolioMetrics,
    allocations: PortfolioAllocation[],
    etfs: ETF[]
  ): RiskAssessment {
    
    let riskScore = 0;
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Calcular score de risco baseado em volatilidade
    if (metrics.volatility > 25) {
      riskScore += 40;
      warnings.push('Alta volatilidade detectada');
    } else if (metrics.volatility > 15) {
      riskScore += 25;
    } else {
      riskScore += 10;
    }
    
    // Penalizar concentração excessiva
    const maxAllocation = Math.max(...allocations.map(a => a.percentage));
    if (maxAllocation > 50) {
      riskScore += 20;
      warnings.push('Concentração excessiva em um ETF');
    }
    
    // Verificar diversificação setorial
    const sectors = Object.keys(metrics.sectorExposure);
    if (sectors.length < 3) {
      riskScore += 15;
      warnings.push('Baixa diversificação setorial');
    }
    
    // Verificar expense ratio
    if (metrics.expenseRatio > 0.5) {
      warnings.push('Taxas de administração elevadas');
      recommendations.push('Considere ETFs com taxas menores');
    }
    
    // Determinar nível de risco
    let riskLevel: 'conservative' | 'moderate' | 'aggressive';
    if (riskScore < 30) {
      riskLevel = 'conservative';
    } else if (riskScore < 60) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'aggressive';
    }
    
    // Gerar recomendações baseadas no risco
    if (metrics.sharpeRatio < 0.5) {
      recommendations.push('Considere rebalancear para melhorar a relação risco-retorno');
    }
    
    if (metrics.diversificationScore < 60) {
      recommendations.push('Adicione mais ETFs para melhor diversificação');
    }

    return {
      riskLevel,
      riskScore,
      confidence: 0.8,
      warnings,
      recommendations
    };
  }

  // Simular performance em diferentes cenários
  static simulateScenarios(
    simulation: PortfolioSimulation,
    etfs: ETF[]
  ): Record<string, BacktestResult> {
    
    const results: Record<string, BacktestResult> = {};
    
    SIMULATION_SCENARIOS.forEach(scenario => {
      const result = this.runScenarioSimulation(simulation, etfs, scenario);
      results[scenario.name] = result;
    });
    
    return results;
  }

  // Executar simulação de cenário específico
  private static runScenarioSimulation(
    simulation: PortfolioSimulation,
    _etfs: ETF[],
    scenario: SimulationScenario
  ): BacktestResult {
    
    const months = 12;
    const returns: number[] = [];
    
    // Simular retornos mensais
    for (let i = 0; i < months; i++) {
      let monthlyReturn = 0;
      
      simulation.allocations.forEach(alloc => {
        const etf = etfs.find(e => e.symbol === alloc.etfSymbol);
        if (!etf) return;
        
        const weight = alloc.percentage / 100;
        const baseReturn = (etf.returns_12m || 0) / 12; // Retorno mensal
        
        // Aplicar ajustes do cenário
        const adjustedReturn = baseReturn * scenario.adjustments.returnMultiplier;
        
        // Adicionar volatilidade (simulação simples)
        const volatility = (etf.volatility_12m || 15) / Math.sqrt(12);
        const randomFactor = (Math.random() - 0.5) * volatility * scenario.adjustments.volatilityMultiplier;
        
        monthlyReturn += (adjustedReturn + randomFactor) * weight;
      });
      
      returns.push(monthlyReturn);
    }
    
    // Calcular métricas do backtest
    const cumulativeReturn = returns.reduce((cum, ret) => cum * (1 + ret / 100), 1) - 1;
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = avgReturn / volatility;
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    const calmarRatio = avgReturn / Math.abs(maxDrawdown);
    const sortino = this.calculateSortino(returns);
    
    return {
      period: '12 meses',
      returns,
      cumulativeReturn: cumulativeReturn * 100,
      volatility,
      sharpeRatio,
      maxDrawdown,
      calmarRatio,
      sortino
    };
  }

  // Otimizar carteira baseada no perfil
  static optimizeForProfile(
    currentAllocations: PortfolioAllocation[],
    profile: InvestorProfile,
    availableETFs: ETF[]
  ): PortfolioAllocation[] {
    
    // Lógica de otimização baseada no perfil
    const optimized = [...currentAllocations];
    
    if (profile.riskTolerance === 'conservative') {
      // Aumentar ETFs defensivos
      optimized.forEach(alloc => {
        const etf = availableETFs.find(e => e.symbol === alloc.etfSymbol);
        if (etf?.sector === 'Bond' || etf?.dividend_yield && etf.dividend_yield > 3) {
          alloc.percentage = Math.min(alloc.percentage * 1.2, 40);
        }
      });
    } else if (profile.riskTolerance === 'aggressive') {
      // Aumentar ETFs de crescimento
      optimized.forEach(alloc => {
        const etf = availableETFs.find(e => e.symbol === alloc.etfSymbol);
        if (etf?.sector === 'Technology' || (etf?.returns_12m && etf.returns_12m > 15)) {
          alloc.percentage = Math.min(alloc.percentage * 1.3, 35);
        }
      });
    }
    
    // Normalizar percentuais
    const totalPercentage = optimized.reduce((sum, alloc) => sum + alloc.percentage, 0);
    optimized.forEach(alloc => {
      alloc.percentage = (alloc.percentage / totalPercentage) * 100;
    });
    
    return optimized;
  }

  // Comparar duas carteiras
  static comparePortfolios(
    portfolio1: PortfolioSimulation,
    portfolio2: PortfolioSimulation
  ) {
    return {
      returns: {
        portfolio1: portfolio1.metrics.expectedReturn,
        portfolio2: portfolio2.metrics.expectedReturn,
        difference: portfolio1.metrics.expectedReturn - portfolio2.metrics.expectedReturn
      },
      risk: {
        portfolio1: portfolio1.metrics.volatility,
        portfolio2: portfolio2.metrics.volatility,
        difference: portfolio1.metrics.volatility - portfolio2.metrics.volatility
      },
      sharpe: {
        portfolio1: portfolio1.metrics.sharpeRatio,
        portfolio2: portfolio2.metrics.sharpeRatio,
        difference: portfolio1.metrics.sharpeRatio - portfolio2.metrics.sharpeRatio
      },
      efficiency: {
        portfolio1: portfolio1.metrics.expectedReturn / portfolio1.metrics.volatility,
        portfolio2: portfolio2.metrics.expectedReturn / portfolio2.metrics.volatility,
        winner: portfolio1.metrics.expectedReturn / portfolio1.metrics.volatility >
                portfolio2.metrics.expectedReturn / portfolio2.metrics.volatility ? 'portfolio1' : 'portfolio2'
      }
    };
  }

  // Utilitários para cálculos estatísticos
  private static calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private static calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;
    
    returns.forEach(ret => {
      cumulative += ret;
      peak = Math.max(peak, cumulative);
      const drawdown = (peak - cumulative) / peak * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });
    
    return maxDrawdown;
  }

  private static calculateSortino(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const downside = returns.filter(ret => ret < 0);
    if (downside.length === 0) return Infinity;
    
    const downsideDeviation = Math.sqrt(
      downside.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / downside.length
    );
    
    return mean / downsideDeviation;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 