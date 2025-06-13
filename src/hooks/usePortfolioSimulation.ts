import { useState, useCallback, useMemo } from 'react';

interface ETF {
  symbol: string;
  name: string;
  assetclass: string;
  returns_12m: number;
  volatility_12m: number;
  sharpe_12m: number;
  expense_ratio: number;
}

interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  totalExpenseRatio: number;
}

interface AllocationMap {
  [symbol: string]: number;
}

interface UsePortfolioSimulationReturn {
  allocations: AllocationMap;
  portfolioMetrics: PortfolioMetrics | null;
  totalAllocation: number;
  isValidPortfolio: boolean;
  updateAllocation: (symbol: string, weight: number) => void;
  resetAllocations: () => void;
  applyScenario: (allocations: AllocationMap) => void;
  normalizeAllocations: () => void;
  getRecommendations: () => string[];
}

export function usePortfolioSimulation(etfs: ETF[]): UsePortfolioSimulationReturn {
  const [allocations, setAllocations] = useState<AllocationMap>({});

  // Calcular métricas da carteira usando as fórmulas do plano
  const portfolioMetrics = useMemo((): PortfolioMetrics | null => {
    const totalWeight = Object.values(allocations).reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight === 0) {
      return null;
    }

    // Normalizar pesos para somar 100%
    const normalizedAllocs: AllocationMap = {};
    Object.entries(allocations).forEach(([symbol, weight]) => {
      normalizedAllocs[symbol] = weight / totalWeight;
    });

    // Retorno esperado da carteira: Σ(weight_i × returns_12m_i)
    let expectedReturn = 0;
    let totalExpenseRatio = 0;
    
    // Volatilidade da carteira (simplificada): √(Σ(weight_i² × volatility_12m_i²))
    let portfolioVariance = 0;

    Object.entries(normalizedAllocs).forEach(([symbol, weight]) => {
      const etf = etfs.find(e => e.symbol === symbol);
      if (etf && weight > 0) {
        expectedReturn += weight * (etf.returns_12m / 100);
        totalExpenseRatio += weight * etf.expense_ratio;
        portfolioVariance += Math.pow(weight, 2) * Math.pow(etf.volatility_12m / 100, 2);
      }
    });

    const volatility = Math.sqrt(portfolioVariance);
    const sharpeRatio = volatility > 0 ? expectedReturn / volatility : 0;

    return {
      expectedReturn: expectedReturn * 100,
      volatility: volatility * 100,
      sharpeRatio,
      totalExpenseRatio
    };
  }, [allocations, etfs]);

  // Total de alocação atual
  const totalAllocation = useMemo(() => {
    return Object.values(allocations).reduce((sum, weight) => sum + weight, 0);
  }, [allocations]);

  // Verificar se a carteira é válida
  const isValidPortfolio = useMemo(() => {
    return totalAllocation === 100 && Object.values(allocations).every(weight => weight >= 0);
  }, [totalAllocation, allocations]);

  // Atualizar alocação de um ETF
  const updateAllocation = useCallback((symbol: string, weight: number) => {
    setAllocations(prev => ({
      ...prev,
      [symbol]: Math.max(0, Math.min(100, weight))
    }));
  }, []);

  // Resetar todas as alocações
  const resetAllocations = useCallback(() => {
    setAllocations({});
  }, []);

  // Aplicar cenário predefinido
  const applyScenario = useCallback((newAllocations: AllocationMap) => {
    setAllocations(newAllocations);
  }, []);

  // Normalizar alocações para somar 100%
  const normalizeAllocations = useCallback(() => {
    const total = totalAllocation;
    if (total > 0 && total !== 100) {
      const normalizedAllocs: AllocationMap = {};
      Object.entries(allocations).forEach(([symbol, weight]) => {
        normalizedAllocs[symbol] = (weight / total) * 100;
      });
      setAllocations(normalizedAllocs);
    }
  }, [allocations, totalAllocation]);

  // Gerar recomendações baseadas nas métricas
  const getRecommendations = useCallback((): string[] => {
    if (!portfolioMetrics) return [];

    const recommendations: string[] = [];
    const { expectedReturn, volatility, sharpeRatio, totalExpenseRatio } = portfolioMetrics;

    // Recomendações baseadas no Sharpe Ratio
    if (sharpeRatio < 0.3) {
      recommendations.push('Sharpe Ratio baixo: Considere rebalancear para melhorar a relação risco-retorno.');
    } else if (sharpeRatio > 1.0) {
      recommendations.push('Excelente Sharpe Ratio! Sua carteira tem ótima eficiência.');
    }

    // Recomendações baseadas na volatilidade
    if (volatility > 30) {
      recommendations.push('Alta volatilidade: Considere adicionar ativos mais defensivos (bonds, dividend ETFs).');
    } else if (volatility < 8) {
      recommendations.push('Baixa volatilidade: Você pode considerar adicionar ativos de crescimento para maior retorno.');
    }

    // Recomendações baseadas no retorno esperado
    if (expectedReturn < 3) {
      recommendations.push('Retorno baixo: Considere aumentar a exposição a ações para melhor crescimento.');
    } else if (expectedReturn > 15) {
      recommendations.push('Alto retorno esperado: Verifique se o risco está alinhado com seu perfil.');
    }

    // Recomendações baseadas nas taxas
    if (totalExpenseRatio > 0.5) {
      recommendations.push('Taxas altas: Considere ETFs com expense ratios menores para reduzir custos.');
    } else if (totalExpenseRatio < 0.1) {
      recommendations.push('Excelente controle de custos com taxas baixas!');
    }

    // Recomendações de diversificação
    const activeAllocations = Object.values(allocations).filter(weight => weight > 0).length;
    if (activeAllocations < 3) {
      recommendations.push('Baixa diversificação: Considere adicionar mais ETFs para reduzir risco específico.');
    } else if (activeAllocations > 8) {
      recommendations.push('Muitos ETFs: Considere simplificar para facilitar o gerenciamento.');
    }

    // Verificar concentração
    const maxAllocation = Math.max(...Object.values(allocations));
    if (maxAllocation > 60) {
      recommendations.push('Alta concentração em um ativo: Considere diversificar mais a carteira.');
    }

    return recommendations;
  }, [portfolioMetrics, allocations]);

  return {
    allocations,
    portfolioMetrics,
    totalAllocation,
    isValidPortfolio,
    updateAllocation,
    resetAllocations,
    applyScenario,
    normalizeAllocations,
    getRecommendations
  };
} 