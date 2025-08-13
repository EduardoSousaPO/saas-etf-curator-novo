// src/lib/wealth/rebalancing-engine.ts

/**
 * Motor de Rebalanceamento para o módulo Dashboard
 * Implementa rebalanceamento por bandas e hard rebalancing
 */

interface TargetAllocation {
  etf_symbol: string;
  allocation_percentage: number;
  band_lower: number; // Banda inferior (%)
  band_upper: number; // Banda superior (%)
}

interface CurrentHolding {
  etf_symbol: string;
  quantity: number;
  current_price: number;
  current_value: number;
  current_allocation: number; // Percentual atual
  currency: string;
}

interface RebalanceAction {
  etf_symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  current_allocation: number;
  target_allocation: number;
  deviation: number; // Diferença em pontos percentuais
  deviation_percentage: number; // Diferença em % do target
  recommended_quantity: number;
  recommended_value: number;
  priority: number; // 1 = alta, 2 = média, 3 = baixa
  reason: string;
  within_bands: boolean;
}

interface RebalanceRecommendation {
  portfolio_id: string;
  total_portfolio_value: number;
  base_currency: string;
  rebalance_needed: boolean;
  rebalance_type: 'BAND_TRIGGERED' | 'HARD_REBALANCE' | 'DRIFT_CORRECTION';
  max_deviation: number;
  actions: RebalanceAction[];
  estimated_costs: {
    trading_fees: number;
    tax_implications: number;
    total_estimated_cost: number;
  };
  execution_plan: {
    sells_first: RebalanceAction[];
    buys_second: RebalanceAction[];
    cash_needed: number;
    cash_generated: number;
    net_cash_flow: number;
  };
  created_at: Date;
}

export class RebalancingEngine {
  private tradingFeeRate: number;
  private taxRate: number;
  private baseCurrency: string;
  private minTradeValue: number;

  constructor(
    baseCurrency: string = 'USD',
    tradingFeeRate: number = 0.001, // 0.1% fee
    taxRate: number = 0.15, // 15% tax on gains
    minTradeValue: number = 100 // Valor mínimo para executar trade
  ) {
    this.baseCurrency = baseCurrency;
    this.tradingFeeRate = tradingFeeRate;
    this.taxRate = taxRate;
    this.minTradeValue = minTradeValue;
  }

  /**
   * Avalia se rebalanceamento é necessário baseado nas bandas
   */
  evaluateRebalanceNeed(
    targetAllocations: TargetAllocation[],
    currentHoldings: CurrentHolding[]
  ): { needed: boolean; trigger: string; maxDeviation: number } {
    let maxDeviation = 0;
    let triggerReason = '';
    let needed = false;

    for (const target of targetAllocations) {
      const current = currentHoldings.find(h => h.etf_symbol === target.etf_symbol);
      const currentAllocation = current?.current_allocation || 0;
      
      const deviation = Math.abs(currentAllocation - target.allocation_percentage);
      const deviationPercentage = target.allocation_percentage > 0 
        ? (deviation / target.allocation_percentage) * 100 
        : 0;

      if (deviation > maxDeviation) {
        maxDeviation = deviation;
      }

      // Verificar se está fora das bandas
      const lowerBound = target.allocation_percentage - target.band_lower;
      const upperBound = target.allocation_percentage + target.band_upper;

      if (currentAllocation < lowerBound || currentAllocation > upperBound) {
        needed = true;
        if (!triggerReason) {
          triggerReason = `${target.etf_symbol} fora da banda (${currentAllocation.toFixed(2)}% vs ${target.allocation_percentage.toFixed(2)}% ±${target.band_lower}%)`;
        }
      }

      // Verificar desvio crítico (>25% do target)
      if (deviationPercentage > 25) {
        needed = true;
        if (!triggerReason) {
          triggerReason = `${target.etf_symbol} com desvio crítico (${deviationPercentage.toFixed(1)}%)`;
        }
      }
    }

    return {
      needed,
      trigger: triggerReason || 'Dentro das bandas',
      maxDeviation,
    };
  }

  /**
   * Gera recomendação de rebalanceamento por bandas
   */
  generateBandRebalancing(
    portfolioId: string,
    targetAllocations: TargetAllocation[],
    currentHoldings: CurrentHolding[]
  ): RebalanceRecommendation {
    const totalValue = currentHoldings.reduce((sum, h) => sum + h.current_value, 0);
    
    const evaluation = this.evaluateRebalanceNeed(targetAllocations, currentHoldings);
    const actions: RebalanceAction[] = [];

    for (const target of targetAllocations) {
      const current = currentHoldings.find(h => h.etf_symbol === target.etf_symbol);
      const currentAllocation = current?.current_allocation || 0;
      const currentValue = current?.current_value || 0;
      
      const targetValue = (target.allocation_percentage / 100) * totalValue;
      const deviation = currentAllocation - target.allocation_percentage;
      const deviationPercentage = target.allocation_percentage > 0 
        ? (Math.abs(deviation) / target.allocation_percentage) * 100 
        : 0;

      // Determinar se está dentro das bandas
      const lowerBound = target.allocation_percentage - target.band_lower;
      const upperBound = target.allocation_percentage + target.band_upper;
      const withinBands = currentAllocation >= lowerBound && currentAllocation <= upperBound;

      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let recommendedValue = 0;
      let recommendedQuantity = 0;
      let priority = 3;
      let reason = 'Dentro das bandas';

      if (!withinBands) {
        if (currentAllocation < lowerBound) {
          action = 'BUY';
          recommendedValue = targetValue - currentValue;
          recommendedQuantity = current ? recommendedValue / current.current_price : 0;
          priority = deviationPercentage > 25 ? 1 : 2;
          reason = `Abaixo da banda inferior (${currentAllocation.toFixed(2)}% < ${lowerBound.toFixed(2)}%)`;
        } else {
          action = 'SELL';
          recommendedValue = currentValue - targetValue;
          recommendedQuantity = current ? recommendedValue / current.current_price : 0;
          priority = deviationPercentage > 25 ? 1 : 2;
          reason = `Acima da banda superior (${currentAllocation.toFixed(2)}% > ${upperBound.toFixed(2)}%)`;
        }
      }

      // Filtrar trades muito pequenos
      if (Math.abs(recommendedValue) < this.minTradeValue) {
        action = 'HOLD';
        recommendedValue = 0;
        recommendedQuantity = 0;
        reason += ' (valor muito pequeno para trade)';
      }

      actions.push({
        etf_symbol: target.etf_symbol,
        action,
        current_allocation: currentAllocation,
        target_allocation: target.allocation_percentage,
        deviation,
        deviation_percentage: deviationPercentage,
        recommended_quantity: Math.abs(recommendedQuantity),
        recommended_value: Math.abs(recommendedValue),
        priority,
        reason,
        within_bands: withinBands,
      });
    }

    // Calcular custos estimados
    const estimatedCosts = this.calculateEstimatedCosts(actions, currentHoldings);
    
    // Criar plano de execução
    const executionPlan = this.createExecutionPlan(actions);

    return {
      portfolio_id: portfolioId,
      total_portfolio_value: totalValue,
      base_currency: this.baseCurrency,
      rebalance_needed: evaluation.needed,
      rebalance_type: 'BAND_TRIGGERED',
      max_deviation: evaluation.maxDeviation,
      actions: actions.sort((a, b) => a.priority - b.priority), // Ordenar por prioridade
      estimated_costs: estimatedCosts,
      execution_plan: executionPlan,
      created_at: new Date(),
    };
  }

  /**
   * Gera recomendação de hard rebalancing (volta exata aos targets)
   */
  generateHardRebalancing(
    portfolioId: string,
    targetAllocations: TargetAllocation[],
    currentHoldings: CurrentHolding[]
  ): RebalanceRecommendation {
    const totalValue = currentHoldings.reduce((sum, h) => sum + h.current_value, 0);
    const actions: RebalanceAction[] = [];
    let maxDeviation = 0;

    for (const target of targetAllocations) {
      const current = currentHoldings.find(h => h.etf_symbol === target.etf_symbol);
      const currentAllocation = current?.current_allocation || 0;
      const currentValue = current?.current_value || 0;
      
      const targetValue = (target.allocation_percentage / 100) * totalValue;
      const deviation = currentAllocation - target.allocation_percentage;
      const deviationPercentage = target.allocation_percentage > 0 
        ? (Math.abs(deviation) / target.allocation_percentage) * 100 
        : 0;

      maxDeviation = Math.max(maxDeviation, Math.abs(deviation));

      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let recommendedValue = Math.abs(targetValue - currentValue);
      let recommendedQuantity = 0;
      let reason = 'Rebalanceamento completo para target exato';

      if (targetValue > currentValue) {
        action = 'BUY';
        recommendedQuantity = current ? (targetValue - currentValue) / current.current_price : 0;
      } else if (targetValue < currentValue) {
        action = 'SELL';
        recommendedQuantity = current ? (currentValue - targetValue) / current.current_price : 0;
      } else {
        recommendedValue = 0;
        reason = 'Já no target exato';
      }

      // Filtrar trades muito pequenos
      if (recommendedValue < this.minTradeValue) {
        action = 'HOLD';
        recommendedValue = 0;
        recommendedQuantity = 0;
        reason = 'Diferença muito pequena para trade';
      }

      actions.push({
        etf_symbol: target.etf_symbol,
        action,
        current_allocation: currentAllocation,
        target_allocation: target.allocation_percentage,
        deviation,
        deviation_percentage: deviationPercentage,
        recommended_quantity: Math.abs(recommendedQuantity),
        recommended_value: recommendedValue,
        priority: recommendedValue > 1000 ? 1 : 2, // Alta prioridade para valores grandes
        reason,
        within_bands: false, // Hard rebalancing ignora bandas
      });
    }

    const estimatedCosts = this.calculateEstimatedCosts(actions, currentHoldings);
    const executionPlan = this.createExecutionPlan(actions);

    return {
      portfolio_id: portfolioId,
      total_portfolio_value: totalValue,
      base_currency: this.baseCurrency,
      rebalance_needed: actions.some(a => a.action !== 'HOLD'),
      rebalance_type: 'HARD_REBALANCE',
      max_deviation: maxDeviation,
      actions: actions.sort((a, b) => b.recommended_value - a.recommended_value), // Ordenar por valor
      estimated_costs: estimatedCosts,
      execution_plan: executionPlan,
      created_at: new Date(),
    };
  }

  /**
   * Calcula custos estimados do rebalanceamento
   */
  private calculateEstimatedCosts(
    actions: RebalanceAction[],
    currentHoldings: CurrentHolding[]
  ): { trading_fees: number; tax_implications: number; total_estimated_cost: number } {
    let tradingFees = 0;
    let taxImplications = 0;

    for (const action of actions) {
      if (action.action === 'HOLD') continue;

      // Calcular taxa de trading
      tradingFees += action.recommended_value * this.tradingFeeRate;

      // Calcular implicações fiscais (apenas para vendas com lucro)
      if (action.action === 'SELL') {
        const holding = currentHoldings.find(h => h.etf_symbol === action.etf_symbol);
        if (holding) {
          // Assumir lucro de 20% para estimativa (seria calculado com preço médio real)
          const estimatedGain = action.recommended_value * 0.2;
          taxImplications += estimatedGain * this.taxRate;
        }
      }
    }

    return {
      trading_fees: tradingFees,
      tax_implications: taxImplications,
      total_estimated_cost: tradingFees + taxImplications,
    };
  }

  /**
   * Cria plano de execução otimizado
   */
  private createExecutionPlan(actions: RebalanceAction[]): {
    sells_first: RebalanceAction[];
    buys_second: RebalanceAction[];
    cash_needed: number;
    cash_generated: number;
    net_cash_flow: number;
  } {
    const sells = actions.filter(a => a.action === 'SELL').sort((a, b) => b.priority - a.priority);
    const buys = actions.filter(a => a.action === 'BUY').sort((a, b) => a.priority - b.priority);

    const cashGenerated = sells.reduce((sum, s) => sum + s.recommended_value, 0);
    const cashNeeded = buys.reduce((sum, b) => sum + b.recommended_value, 0);
    const netCashFlow = cashNeeded - cashGenerated;

    return {
      sells_first: sells,
      buys_second: buys,
      cash_needed: cashNeeded,
      cash_generated: cashGenerated,
      net_cash_flow: netCashFlow,
    };
  }

  /**
   * Simula o resultado após rebalanceamento
   */
  simulatePostRebalance(
    currentHoldings: CurrentHolding[],
    actions: RebalanceAction[]
  ): CurrentHolding[] {
    const newHoldings = [...currentHoldings];
    const totalValue = newHoldings.reduce((sum, h) => sum + h.current_value, 0);

    for (const action of actions) {
      if (action.action === 'HOLD') continue;

      const holdingIndex = newHoldings.findIndex(h => h.etf_symbol === action.etf_symbol);
      
      if (holdingIndex >= 0) {
        const holding = newHoldings[holdingIndex];
        
        if (action.action === 'BUY') {
          const newQuantity = holding.quantity + action.recommended_quantity;
          const newValue = holding.current_value + action.recommended_value;
          newHoldings[holdingIndex] = {
            ...holding,
            quantity: newQuantity,
            current_value: newValue,
            current_allocation: (newValue / totalValue) * 100,
          };
        } else { // SELL
          const newQuantity = Math.max(0, holding.quantity - action.recommended_quantity);
          const newValue = Math.max(0, holding.current_value - action.recommended_value);
          newHoldings[holdingIndex] = {
            ...holding,
            quantity: newQuantity,
            current_value: newValue,
            current_allocation: (newValue / totalValue) * 100,
          };
        }
      } else if (action.action === 'BUY') {
        // Novo ETF sendo adicionado
        newHoldings.push({
          etf_symbol: action.etf_symbol,
          quantity: action.recommended_quantity,
          current_price: action.recommended_value / action.recommended_quantity,
          current_value: action.recommended_value,
          current_allocation: (action.recommended_value / totalValue) * 100,
          currency: this.baseCurrency,
        });
      }
    }

    return newHoldings.filter(h => h.quantity > 0);
  }
}

// Utilitários para formatação de rebalanceamento
export const formatRebalanceAction = (action: RebalanceAction): string => {
  const actionText = {
    BUY: 'Comprar',
    SELL: 'Vender',
    HOLD: 'Manter'
  }[action.action];

  if (action.action === 'HOLD') {
    return `${actionText} ${action.etf_symbol}`;
  }

  return `${actionText} ${action.recommended_quantity.toFixed(2)} cotas de ${action.etf_symbol} (~$${action.recommended_value.toFixed(2)})`;
};

export const formatDeviation = (deviation: number): string => {
  return `${deviation >= 0 ? '+' : ''}${deviation.toFixed(2)}pp`;
};

export const getPriorityLabel = (priority: number): string => {
  return { 1: 'Alta', 2: 'Média', 3: 'Baixa' }[priority] || 'Baixa';
};

export const getPriorityColor = (priority: number): string => {
  return { 1: 'red', 2: 'yellow', 3: 'green' }[priority] || 'gray';
};


