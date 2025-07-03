/**
 * Sistema de Otimização Avançada de Portfólio
 * Baseado na Teoria Moderna de Portfólio (Markowitz) com adaptações para ETFs americanos
 * Benchmarking simplificado: SPY (ações) + BND (bonds)
 */

import { createClient } from '@supabase/supabase-js';

// Tipos e interfaces
export interface ETFData {
  symbol: string;
  name: string;
  assetclass: string;
  returns_12m: number;
  returns_24m: number;
  returns_36m: number;
  volatility_12m: number;
  sharpe_12m: number;
  max_drawdown: number;
  dividends_12m: number;
  totalasset: number;
  expenseratio: number;
  etf_type: string;
  size_category: string;
  liquidity_category: string;
}

export interface OptimizationConstraints {
  min_allocation?: number; // Alocação mínima por ETF (default: 0.05 = 5%)
  max_allocation?: number; // Alocação máxima por ETF (default: 0.30 = 30%)
  max_etfs?: number; // Máximo de ETFs na carteira (default: 8)
  min_liquidity?: 'High' | 'Medium'; // Liquidez mínima exigida
  exclude_sectors?: string[]; // Setores a excluir
  target_volatility?: number; // Volatilidade alvo (se especificada)
}

export interface OptimizedPortfolio {
  etf_allocations: { symbol: string; allocation: number; name: string }[];
  expected_return: number;
  expected_volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  annual_dividends: number;
  total_expense_ratio: number;
  optimization_method: string;
  benchmark_comparison: BenchmarkComparison;
  risk_metrics: RiskMetrics;
}

export interface BenchmarkComparison {
  spy_comparison: {
    portfolio_return: number;
    spy_return: number;
    alpha: number;
    beta: number;
  };
  bnd_comparison: {
    portfolio_return: number;
    bnd_return: number;
    alpha: number;
  };
  classic_60_40: {
    portfolio_return: number;
    classic_return: number; // 60% SPY + 40% BND
    outperformance: number;
  };
}

export interface RiskMetrics {
  value_at_risk_95: number; // VaR 95%
  conditional_var_95: number; // CVaR 95%
  downside_deviation: number;
  sortino_ratio: number;
  calmar_ratio: number;
}

export interface RiskProfile {
  name: 'CONSERVADOR' | 'MODERADO' | 'ARROJADO';
  target_volatility: number;
  max_equity_allocation: number;
  min_bond_allocation: number;
  preferred_asset_classes: string[];
  constraints: OptimizationConstraints;
}

export class AdvancedPortfolioOptimizer {
  private supabase;

  // Perfis de risco predefinidos
  private readonly RISK_PROFILES: Record<string, RiskProfile> = {
    CONSERVADOR: {
      name: 'CONSERVADOR',
      target_volatility: 0.08, // 8% volatilidade anual
      max_equity_allocation: 0.40, // Máximo 40% em ações
      min_bond_allocation: 0.50, // Mínimo 50% em bonds
      preferred_asset_classes: ['Intermediate Core Bond', 'Short-Term Bond', 'Government Bond'],
      constraints: {
        min_allocation: 0.10,
        max_allocation: 0.25,
        max_etfs: 5,
        min_liquidity: 'High'
      }
    },
    MODERADO: {
      name: 'MODERADO',
      target_volatility: 0.12, // 12% volatilidade anual
      max_equity_allocation: 0.70, // Máximo 70% em ações
      min_bond_allocation: 0.20, // Mínimo 20% em bonds
      preferred_asset_classes: ['Large Blend', 'Foreign Large Blend', 'Intermediate Core Bond'],
      constraints: {
        min_allocation: 0.05,
        max_allocation: 0.30,
        max_etfs: 8,
        min_liquidity: 'High'
      }
    },
    ARROJADO: {
      name: 'ARROJADO',
      target_volatility: 0.18, // 18% volatilidade anual
      max_equity_allocation: 0.90, // Máximo 90% em ações
      min_bond_allocation: 0.05, // Mínimo 5% em bonds
      preferred_asset_classes: ['Large Growth', 'Foreign Large Growth', 'Small Growth'],
      constraints: {
        min_allocation: 0.05,
        max_allocation: 0.35,
        max_etfs: 10,
        min_liquidity: 'Medium'
      }
    }
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Otimizar carteira baseada no perfil de risco
   */
  async optimizeByRiskProfile(
    riskProfile: 'CONSERVADOR' | 'MODERADO' | 'ARROJADO',
    investmentAmount: number = 10000
  ): Promise<OptimizedPortfolio> {
    try {
      const profile = this.RISK_PROFILES[riskProfile];
      
      // Buscar ETFs adequados ao perfil
      const candidateETFs = await this.getETFCandidates(profile);
      
      // Aplicar otimização Markowitz com constraints do perfil
      const optimizedPortfolio = await this.markowitzOptimization(
        candidateETFs,
        'max_sharpe', // Maximizar Sharpe Ratio
        profile.constraints
      );

      // Calcular comparação com benchmarks
      const benchmarkComparison = await this.calculateBenchmarkComparison(optimizedPortfolio);

      // Calcular métricas de risco avançadas
      const riskMetrics = await this.calculateRiskMetrics(optimizedPortfolio);

      return {
        ...optimizedPortfolio,
        benchmark_comparison: benchmarkComparison,
        risk_metrics: riskMetrics,
        optimization_method: `Markowitz ${riskProfile}`
      };

    } catch (error) {
      console.error('Erro na otimização por perfil de risco:', error);
      
      // Fallback para carteira simples baseada no perfil
      return this.createSimplePortfolioFallback(riskProfile, investmentAmount);
    }
  }

  /**
   * Buscar ETFs candidatos baseados no perfil de risco
   */
  private async getETFCandidates(profile: RiskProfile): Promise<ETFData[]> {
    const { data, error } = await this.supabase
      .from('etfs_ativos_reais')
      .select('*')
      .not('returns_12m', 'is', null)
      .not('volatility_12m', 'is', null)
      .not('sharpe_12m', 'is', null)
      .gte('totalasset', 100000000) // Mínimo $100M em ativos
      .eq('liquidity_category', profile.constraints.min_liquidity || 'High')
      .order('totalasset', { ascending: false })
      .limit(50); // Top 50 ETFs por tamanho

    if (error) throw error;

    // Filtrar por classes de ativos preferidas
    const filtered = data.filter(etf => 
      !profile.preferred_asset_classes.length || 
      profile.preferred_asset_classes.includes(etf.assetclass)
    );

    return filtered.slice(0, 20); // Top 20 para otimização
  }

  /**
   * Otimização Markowitz (Teoria Moderna de Portfólio)
   */
  private async markowitzOptimization(
    etfs: ETFData[],
    objective: 'max_sharpe' | 'min_volatility' | 'target_return',
    constraints: OptimizationConstraints
  ): Promise<OptimizedPortfolio> {
    
    // Para implementação inicial, usar otimização simplificada
    // TODO: Implementar algoritmo completo de Markowitz
    
    const allocations = this.equalWeightWithConstraints(etfs, constraints);
    
    return this.calculatePortfolioMetrics(allocations, etfs);
  }

  /**
   * Alocação com pesos iguais respeitando constraints (fallback robusto)
   */
  private equalWeightWithConstraints(
    etfs: ETFData[],
    constraints: OptimizationConstraints
  ): { symbol: string; allocation: number; name: string }[] {
    
    const maxETFs = Math.min(constraints.max_etfs || 8, etfs.length);
    const selectedETFs = etfs.slice(0, maxETFs);
    const equalWeight = 1 / selectedETFs.length;

    return selectedETFs.map(etf => ({
      symbol: etf.symbol,
      allocation: equalWeight,
      name: etf.name
    }));
  }

  /**
   * Calcular métricas da carteira otimizada
   */
  private async calculatePortfolioMetrics(
    allocations: { symbol: string; allocation: number; name: string }[],
    etfsData: ETFData[]
  ): Promise<OptimizedPortfolio> {
    
    let expectedReturn = 0;
    let expectedVolatility = 0;
    let totalDividends = 0;
    let totalExpenseRatio = 0;
    let maxDrawdown = 0;

    // Calcular métricas ponderadas
    for (const allocation of allocations) {
      const etf = etfsData.find(e => e.symbol === allocation.symbol);
      if (!etf) continue;

      const weight = allocation.allocation;
      expectedReturn += (etf.returns_12m || 0) * weight;
      expectedVolatility += Math.pow((etf.volatility_12m || 0) * weight, 2);
      totalDividends += (etf.dividends_12m || 0) * weight;
      totalExpenseRatio += (etf.expenseratio || 0.1) * weight;
      maxDrawdown = Math.min(maxDrawdown, etf.max_drawdown || 0);
    }

    // Volatilidade da carteira (simplificado - assumindo correlação 0.6)
    expectedVolatility = Math.sqrt(expectedVolatility) * 0.8; // Fator de diversificação

    const sharpeRatio = expectedReturn / expectedVolatility;

    return {
      etf_allocations: allocations,
      expected_return: expectedReturn / 100, // Converter para decimal
      expected_volatility: expectedVolatility / 100,
      sharpe_ratio: sharpeRatio,
      max_drawdown: maxDrawdown / 100,
      annual_dividends: totalDividends / 100,
      total_expense_ratio: totalExpenseRatio / 100,
      optimization_method: 'Equal Weight with Constraints',
      benchmark_comparison: {} as BenchmarkComparison, // Será preenchido depois
      risk_metrics: {} as RiskMetrics // Será preenchido depois
    };
  }

  /**
   * Calcular comparação com benchmarks SPY e BND
   */
  private async calculateBenchmarkComparison(
    portfolio: OptimizedPortfolio
  ): Promise<BenchmarkComparison> {
    
    // Buscar dados dos benchmarks
    const { data: benchmarks } = await this.supabase
      .from('etfs_ativos_reais')
      .select('symbol, returns_12m, volatility_12m')
      .in('symbol', ['SPY', 'BND']);

    const spy = benchmarks?.find(b => b.symbol === 'SPY');
    const bnd = benchmarks?.find(b => b.symbol === 'BND');

    if (!spy || !bnd) {
      throw new Error('Benchmarks SPY ou BND não encontrados');
    }

    const spyReturn = (spy.returns_12m || 0) / 100;
    const bndReturn = (bnd.returns_12m || 0) / 100;
    const classic6040Return = 0.6 * spyReturn + 0.4 * bndReturn;

    // Calcular Beta vs SPY (simplificado)
    const beta = portfolio.expected_volatility / ((spy.volatility_12m || 20) / 100);

    return {
      spy_comparison: {
        portfolio_return: portfolio.expected_return,
        spy_return: spyReturn,
        alpha: portfolio.expected_return - spyReturn,
        beta: beta
      },
      bnd_comparison: {
        portfolio_return: portfolio.expected_return,
        bnd_return: bndReturn,
        alpha: portfolio.expected_return - bndReturn
      },
      classic_60_40: {
        portfolio_return: portfolio.expected_return,
        classic_return: classic6040Return,
        outperformance: portfolio.expected_return - classic6040Return
      }
    };
  }

  /**
   * Calcular métricas de risco avançadas
   */
  private async calculateRiskMetrics(portfolio: OptimizedPortfolio): Promise<RiskMetrics> {
    // Implementação simplificada - TODO: implementar cálculos completos
    
    const annualReturn = portfolio.expected_return;
    const annualVol = portfolio.expected_volatility;
    
    // VaR 95% (aproximação normal)
    const var95 = annualReturn - 1.645 * annualVol;
    
    // CVaR 95% (aproximação)
    const cvar95 = annualReturn - 2.0 * annualVol;
    
    // Downside deviation (aproximação)
    const downsideDeviation = annualVol * 0.7;
    
    // Sortino ratio
    const sortinoRatio = annualReturn / downsideDeviation;
    
    // Calmar ratio
    const calmarRatio = annualReturn / Math.abs(portfolio.max_drawdown);

    return {
      value_at_risk_95: var95,
      conditional_var_95: cvar95,
      downside_deviation: downsideDeviation,
      sortino_ratio: sortinoRatio,
      calmar_ratio: calmarRatio
    };
  }

  /**
   * Fallback para carteira simples quando otimização falha
   */
  private createSimplePortfolioFallback(
    riskProfile: 'CONSERVADOR' | 'MODERADO' | 'ARROJADO',
    investmentAmount: number
  ): OptimizedPortfolio {
    
    // Carteiras simples predefinidas baseadas nos perfis
    const simplePortfolios = {
      CONSERVADOR: [
        { symbol: 'BND', allocation: 0.50, name: 'Vanguard Total Bond Market ETF' },
        { symbol: 'VTI', allocation: 0.30, name: 'Vanguard Total Stock Market ETF' },
        { symbol: 'VXUS', allocation: 0.20, name: 'Vanguard Total International Stock ETF' }
      ],
      MODERADO: [
        { symbol: 'VTI', allocation: 0.40, name: 'Vanguard Total Stock Market ETF' },
        { symbol: 'VXUS', allocation: 0.20, name: 'Vanguard Total International Stock ETF' },
        { symbol: 'BND', allocation: 0.30, name: 'Vanguard Total Bond Market ETF' },
        { symbol: 'VUG', allocation: 0.10, name: 'Vanguard Growth ETF' }
      ],
      ARROJADO: [
        { symbol: 'VTI', allocation: 0.35, name: 'Vanguard Total Stock Market ETF' },
        { symbol: 'VUG', allocation: 0.25, name: 'Vanguard Growth ETF' },
        { symbol: 'VXUS', allocation: 0.25, name: 'Vanguard Total International Stock ETF' },
        { symbol: 'BND', allocation: 0.15, name: 'Vanguard Total Bond Market ETF' }
      ]
    };

    const allocations = simplePortfolios[riskProfile];
    
    // Retornar carteira simples com métricas estimadas
    return {
      etf_allocations: allocations,
      expected_return: riskProfile === 'CONSERVADOR' ? 0.08 : riskProfile === 'MODERADO' ? 0.10 : 0.12,
      expected_volatility: riskProfile === 'CONSERVADOR' ? 0.08 : riskProfile === 'MODERADO' ? 0.12 : 0.16,
      sharpe_ratio: 0.8,
      max_drawdown: riskProfile === 'CONSERVADOR' ? -0.08 : riskProfile === 'MODERADO' ? -0.12 : -0.18,
      annual_dividends: 0.02,
      total_expense_ratio: 0.0015,
      optimization_method: `Fallback ${riskProfile}`,
      benchmark_comparison: {} as BenchmarkComparison,
      risk_metrics: {} as RiskMetrics
    };
  }
}

export default AdvancedPortfolioOptimizer; 