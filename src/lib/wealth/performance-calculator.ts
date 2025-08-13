// src/lib/wealth/performance-calculator.ts

/**
 * Calculadora de Performance para o módulo Dashboard
 * Calcula TWR (Time-Weighted Return), XIRR (Extended Internal Rate of Return),
 * dividendos e rendimentos considerando multi-moeda
 */

interface CashFlow {
  date: Date;
  amount: number;
  currency: string;
  type: 'CONTRIBUTION' | 'WITHDRAWAL' | 'DIVIDEND' | 'FEE';
}

interface Trade {
  date: Date;
  etf_symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  currency: string;
}

interface PortfolioValue {
  date: Date;
  value: number;
  currency: string;
}

interface PerformanceMetrics {
  twr: number; // Time-Weighted Return (%)
  xirr: number; // Extended Internal Rate of Return (%)
  total_return: number; // Retorno total (%)
  total_dividends: number; // Total de dividendos recebidos
  total_fees: number; // Total de taxas pagas
  current_value: number; // Valor atual da carteira
  invested_amount: number; // Valor total investido
  profit_loss: number; // Lucro/Prejuízo
  base_currency: string;
  period_days: number;
  annualized_return: number; // Retorno anualizado
}

interface ExchangeRates {
  [fromCurrency: string]: {
    [toCurrency: string]: {
      [date: string]: number;
    };
  };
}

export class PerformanceCalculator {
  private exchangeRates: ExchangeRates = {};
  private baseCurrency: string;

  constructor(baseCurrency: string = 'USD') {
    this.baseCurrency = baseCurrency;
  }

  /**
   * Define as taxas de câmbio para conversões multi-moeda
   */
  setExchangeRates(rates: ExchangeRates) {
    this.exchangeRates = rates;
  }

  /**
   * Converte um valor para a moeda base
   */
  private convertToBaseCurrency(
    amount: number,
    fromCurrency: string,
    date: Date
  ): number {
    if (fromCurrency === this.baseCurrency) {
      return amount;
    }

    const dateStr = date.toISOString().split('T')[0];
    const rate = this.exchangeRates[fromCurrency]?.[this.baseCurrency]?.[dateStr];

    if (!rate) {
      console.warn(`Taxa de câmbio não encontrada para ${fromCurrency} -> ${this.baseCurrency} em ${dateStr}`);
      // Usar taxa padrão ou mais recente disponível
      return amount; // Simplificado para MVP
    }

    return amount * rate;
  }

  /**
   * Calcula o Time-Weighted Return (TWR)
   * TWR elimina o efeito dos fluxos de caixa, medindo apenas a performance dos investimentos
   */
  calculateTWR(
    portfolioValues: PortfolioValue[],
    cashFlows: CashFlow[]
  ): number {
    if (portfolioValues.length < 2) {
      return 0;
    }

    // Ordenar por data
    const sortedValues = portfolioValues.sort((a, b) => a.date.getTime() - b.date.getTime());
    const sortedCashFlows = cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulativeReturn = 1;
    
    for (let i = 1; i < sortedValues.length; i++) {
      const startValue = this.convertToBaseCurrency(
        sortedValues[i - 1].value,
        sortedValues[i - 1].currency,
        sortedValues[i - 1].date
      );
      
      const endValue = this.convertToBaseCurrency(
        sortedValues[i].value,
        sortedValues[i].currency,
        sortedValues[i].date
      );

      // Encontrar fluxos de caixa no período
      const periodCashFlows = sortedCashFlows.filter(cf => 
        cf.date >= sortedValues[i - 1].date && cf.date < sortedValues[i].date
      );

      // Ajustar valor inicial pelos fluxos de caixa
      let adjustedStartValue = startValue;
      for (const cf of periodCashFlows) {
        const convertedAmount = this.convertToBaseCurrency(cf.amount, cf.currency, cf.date);
        if (cf.type === 'CONTRIBUTION') {
          adjustedStartValue += convertedAmount;
        } else if (cf.type === 'WITHDRAWAL') {
          adjustedStartValue -= convertedAmount;
        }
      }

      if (adjustedStartValue > 0) {
        const periodReturn = endValue / adjustedStartValue;
        cumulativeReturn *= periodReturn;
      }
    }

    return (cumulativeReturn - 1) * 100; // Retorna em percentual
  }

  /**
   * Calcula o XIRR (Extended Internal Rate of Return)
   * XIRR considera o timing dos fluxos de caixa
   */
  calculateXIRR(cashFlows: CashFlow[], finalValue: number): number {
    if (cashFlows.length === 0) {
      return 0;
    }

    // Converter todos os valores para moeda base
    const convertedFlows = cashFlows.map(cf => ({
      date: cf.date,
      amount: this.convertToBaseCurrency(cf.amount, cf.currency, cf.date) * 
              (cf.type === 'CONTRIBUTION' ? -1 : 1), // Contribuições são negativas
    }));

    // Adicionar valor final como fluxo positivo
    const lastDate = new Date();
    convertedFlows.push({
      date: lastDate,
      amount: finalValue,
    });

    // Implementação simplificada do XIRR usando método de Newton-Raphson
    return this.xirr(convertedFlows.map(f => f.amount), convertedFlows.map(f => f.date));
  }

  /**
   * Implementação do algoritmo XIRR
   */
  private xirr(values: number[], dates: Date[]): number {
    if (values.length !== dates.length) {
      throw new Error('Values and dates arrays must have the same length');
    }

    const guess = 0.1; // Taxa inicial de 10%
    const epsilon = 1e-6; // Precisão
    const maxIterations = 100;

    let rate = guess;
    
    for (let i = 0; i < maxIterations; i++) {
      const f = this.xirrFunction(values, dates, rate);
      const df = this.xirrDerivative(values, dates, rate);
      
      if (Math.abs(df) < epsilon) {
        break;
      }
      
      const newRate = rate - f / df;
      
      if (Math.abs(newRate - rate) < epsilon) {
        return newRate * 100; // Retorna em percentual
      }
      
      rate = newRate;
    }

    return rate * 100;
  }

  private xirrFunction(values: number[], dates: Date[], rate: number): number {
    const baseDate = dates[0];
    let sum = 0;
    
    for (let i = 0; i < values.length; i++) {
      const daysDiff = (dates[i].getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
      const yearsDiff = daysDiff / 365.25;
      sum += values[i] / Math.pow(1 + rate, yearsDiff);
    }
    
    return sum;
  }

  private xirrDerivative(values: number[], dates: Date[], rate: number): number {
    const baseDate = dates[0];
    let sum = 0;
    
    for (let i = 0; i < values.length; i++) {
      const daysDiff = (dates[i].getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
      const yearsDiff = daysDiff / 365.25;
      sum -= (yearsDiff * values[i]) / Math.pow(1 + rate, yearsDiff + 1);
    }
    
    return sum;
  }

  /**
   * Calcula métricas completas de performance
   */
  calculateCompletePerformance(
    trades: Trade[],
    cashFlows: CashFlow[],
    portfolioValues: PortfolioValue[]
  ): PerformanceMetrics {
    // Valores convertidos para moeda base
    const totalInvested = cashFlows
      .filter(cf => cf.type === 'CONTRIBUTION')
      .reduce((sum, cf) => sum + this.convertToBaseCurrency(cf.amount, cf.currency, cf.date), 0);

    const totalWithdrawn = cashFlows
      .filter(cf => cf.type === 'WITHDRAWAL')
      .reduce((sum, cf) => sum + this.convertToBaseCurrency(cf.amount, cf.currency, cf.date), 0);

    const totalDividends = cashFlows
      .filter(cf => cf.type === 'DIVIDEND')
      .reduce((sum, cf) => sum + this.convertToBaseCurrency(cf.amount, cf.currency, cf.date), 0);

    const totalFees = cashFlows
      .filter(cf => cf.type === 'FEE')
      .reduce((sum, cf) => sum + this.convertToBaseCurrency(cf.amount, cf.currency, cf.date), 0);

    const currentValue = portfolioValues.length > 0 
      ? this.convertToBaseCurrency(
          portfolioValues[portfolioValues.length - 1].value,
          portfolioValues[portfolioValues.length - 1].currency,
          portfolioValues[portfolioValues.length - 1].date
        )
      : 0;

    const profitLoss = currentValue + totalWithdrawn + totalDividends - totalInvested - totalFees;
    const totalReturn = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    // Calcular período em dias
    const firstDate = cashFlows.length > 0 
      ? Math.min(...cashFlows.map(cf => cf.date.getTime()))
      : Date.now();
    const lastDate = portfolioValues.length > 0
      ? portfolioValues[portfolioValues.length - 1].date.getTime()
      : Date.now();
    const periodDays = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));

    // Retorno anualizado
    const yearsElapsed = periodDays / 365.25;
    const annualizedReturn = yearsElapsed > 0 && totalReturn !== 0
      ? (Math.pow(1 + totalReturn / 100, 1 / yearsElapsed) - 1) * 100
      : 0;

    const twr = this.calculateTWR(portfolioValues, cashFlows);
    const xirr = this.calculateXIRR(cashFlows, currentValue);

    return {
      twr,
      xirr,
      total_return: totalReturn,
      total_dividends: totalDividends,
      total_fees: totalFees,
      current_value: currentValue,
      invested_amount: totalInvested,
      profit_loss: profitLoss,
      base_currency: this.baseCurrency,
      period_days: Math.round(periodDays),
      annualized_return: annualizedReturn,
    };
  }

  /**
   * Calcula performance por ETF individual
   */
  calculateETFPerformance(
    etfSymbol: string,
    trades: Trade[],
    cashFlows: CashFlow[],
    currentPrice: number,
    currentPriceCurrency: string = 'USD'
  ): {
    symbol: string;
    total_shares: number;
    average_cost: number;
    current_value: number;
    unrealized_pnl: number;
    unrealized_pnl_percent: number;
    dividends_received: number;
    total_invested: number;
  } {
    const etfTrades = trades.filter(t => t.etf_symbol === etfSymbol);
    const etfDividends = cashFlows.filter(cf => 
      cf.type === 'DIVIDEND' && 
      (cf as any).metadata?.etf === etfSymbol
    );

    let totalShares = 0;
    let totalInvested = 0;

    // Calcular posição atual e custo médio
    for (const trade of etfTrades) {
      const convertedAmount = this.convertToBaseCurrency(
        trade.quantity * trade.price,
        trade.currency,
        trade.date
      );

      if (trade.side === 'BUY') {
        totalShares += trade.quantity;
        totalInvested += convertedAmount;
      } else {
        totalShares -= trade.quantity;
        totalInvested -= convertedAmount * (trade.quantity / totalShares); // Proporcionalmente
      }
    }

    const averageCost = totalShares > 0 ? totalInvested / totalShares : 0;
    
    const convertedCurrentPrice = this.convertToBaseCurrency(
      currentPrice,
      currentPriceCurrency,
      new Date()
    );
    
    const currentValue = totalShares * convertedCurrentPrice;
    const unrealizedPnL = currentValue - (totalShares * averageCost);
    const unrealizedPnLPercent = averageCost > 0 ? (unrealizedPnL / (totalShares * averageCost)) * 100 : 0;

    const dividendsReceived = etfDividends.reduce((sum, div) => 
      sum + this.convertToBaseCurrency(div.amount, div.currency, div.date), 0
    );

    return {
      symbol: etfSymbol,
      total_shares: totalShares,
      average_cost: averageCost,
      current_value: currentValue,
      unrealized_pnl: unrealizedPnL,
      unrealized_pnl_percent: unrealizedPnLPercent,
      dividends_received: dividendsReceived,
      total_invested: totalShares * averageCost,
    };
  }
}

// Utilitários para formatação
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};

export const formatNumber = (number: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};


