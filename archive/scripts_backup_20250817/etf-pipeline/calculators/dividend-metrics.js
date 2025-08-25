class DividendMetricsCalculator {
  constructor(logger = null) {
    this.logger = logger || console;
  }

  /**
   * Calcula todas as métricas de dividendos para um ETF
   * @param {Array} dividendData - Dados históricos de dividendos ordenados por data
   * @param {Array} priceData - Dados históricos de preços para calcular yields
   * @returns {Object} Objeto com todas as métricas de dividendos
   */
  calculateAllDividendMetrics(dividendData, priceData = []) {
    if (!dividendData || dividendData.length === 0) {
      return this.getEmptyDividendMetrics();
    }

    // Ordenar dados por data
    const sortedDividends = dividendData.sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date));
    const sortedPrices = priceData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const metrics = {
      // Dividendos totais por período
      dividends_12m: this.calculatePeriodDividends(sortedDividends, 12),
      dividends_24m: this.calculatePeriodDividends(sortedDividends, 24),
      dividends_36m: this.calculatePeriodDividends(sortedDividends, 36),
      dividends_all_time: this.calculateAllTimeDividends(sortedDividends),

      // Métricas adicionais
      dividend_frequency: this.calculateDividendFrequency(sortedDividends),
      dividend_growth_rate: this.calculateDividendGrowthRate(sortedDividends),
      current_yield: this.calculateCurrentYield(sortedDividends, sortedPrices),
      average_yield: this.calculateAverageYield(sortedDividends, sortedPrices),
      dividend_consistency: this.calculateDividendConsistency(sortedDividends)
    };

    return metrics;
  }

  /**
   * Calcula total de dividendos para um período específico (em meses)
   */
  calculatePeriodDividends(dividendData, months) {
    if (dividendData.length === 0) return null;

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);

    let totalDividends = 0;
    let dividendCount = 0;

    for (const dividend of dividendData) {
      const dividendDate = new Date(dividend.ex_date);
      if (dividendDate >= startDate && dividendDate <= endDate) {
        totalDividends += dividend.amount;
        dividendCount++;
      }
    }

    return {
      total: Number(totalDividends.toFixed(6)),
      count: dividendCount,
      average: dividendCount > 0 ? Number((totalDividends / dividendCount).toFixed(6)) : 0
    };
  }

  /**
   * Calcula total de dividendos de todos os tempos
   */
  calculateAllTimeDividends(dividendData) {
    if (dividendData.length === 0) return null;

    const totalDividends = dividendData.reduce((sum, div) => sum + div.amount, 0);
    const dividendCount = dividendData.length;

    const firstDividend = dividendData[0];
    const lastDividend = dividendData[dividendData.length - 1];

    return {
      total: Number(totalDividends.toFixed(6)),
      count: dividendCount,
      average: Number((totalDividends / dividendCount).toFixed(6)),
      first_date: firstDividend.ex_date,
      last_date: lastDividend.ex_date,
      period_years: this.calculateYearsBetween(firstDividend.ex_date, lastDividend.ex_date)
    };
  }

  /**
   * Calcula frequência de pagamento de dividendos
   */
  calculateDividendFrequency(dividendData) {
    if (dividendData.length < 2) return null;

    // Calcular intervalos entre pagamentos
    const intervals = [];
    for (let i = 1; i < dividendData.length; i++) {
      const currentDate = new Date(dividendData[i].ex_date);
      const previousDate = new Date(dividendData[i - 1].ex_date);
      const daysDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }

    // Calcular intervalo médio
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Determinar frequência baseada no intervalo médio
    let frequency;
    if (averageInterval <= 35) frequency = 'monthly';
    else if (averageInterval <= 100) frequency = 'quarterly';
    else if (averageInterval <= 200) frequency = 'semi-annually';
    else frequency = 'annually';

    return {
      frequency,
      average_days: Math.round(averageInterval),
      payments_per_year: Math.round(365 / averageInterval)
    };
  }

  /**
   * Calcula taxa de crescimento dos dividendos
   */
  calculateDividendGrowthRate(dividendData) {
    if (dividendData.length < 8) return null; // Mínimo 2 anos de dados trimestrais

    // Agrupar dividendos por ano
    const yearlyDividends = this.groupDividendsByYear(dividendData);
    const years = Object.keys(yearlyDividends).sort();

    if (years.length < 2) return null;

    // Calcular crescimento ano a ano
    const growthRates = [];
    for (let i = 1; i < years.length; i++) {
      const currentYear = yearlyDividends[years[i]];
      const previousYear = yearlyDividends[years[i - 1]];
      
      if (previousYear > 0) {
        const growthRate = (currentYear - previousYear) / previousYear;
        growthRates.push(growthRate);
      }
    }

    if (growthRates.length === 0) return null;

    // Calcular crescimento médio anual
    const averageGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;

    // Calcular crescimento composto anual (CAGR)
    const firstYear = yearlyDividends[years[0]];
    const lastYear = yearlyDividends[years[years.length - 1]];
    const yearsPeriod = years.length - 1;
    const cagr = Math.pow(lastYear / firstYear, 1 / yearsPeriod) - 1;

    return {
      average_growth: Number(averageGrowth.toFixed(4)),
      cagr: Number(cagr.toFixed(4)),
      years_analyzed: yearsPeriod,
      first_year_total: firstYear,
      last_year_total: lastYear
    };
  }

  /**
   * Calcula yield atual baseado nos últimos dividendos
   */
  calculateCurrentYield(dividendData, priceData) {
    if (dividendData.length === 0 || priceData.length === 0) return null;

    // Pegar últimos 12 meses de dividendos
    const twelveMonthsDividends = this.calculatePeriodDividends(dividendData, 12);
    if (!twelveMonthsDividends || twelveMonthsDividends.total === 0) return null;

    // Pegar preço atual (último preço)
    const currentPrice = priceData[priceData.length - 1].adjusted_close;

    const currentYield = twelveMonthsDividends.total / currentPrice;

    return Number(currentYield.toFixed(4));
  }

  /**
   * Calcula yield médio histórico
   */
  calculateAverageYield(dividendData, priceData) {
    if (dividendData.length === 0 || priceData.length === 0) return null;

    const yields = [];

    // Calcular yield para cada ano com dados completos
    const yearlyDividends = this.groupDividendsByYear(dividendData);
    const yearlyPrices = this.groupPricesByYear(priceData);

    for (const year of Object.keys(yearlyDividends)) {
      if (yearlyPrices[year]) {
        const yearDividends = yearlyDividends[year];
        const yearAvgPrice = yearlyPrices[year];
        
        if (yearAvgPrice > 0) {
          const yieldValue = yearDividends / yearAvgPrice;
          yields.push(yieldValue);
        }
      }
    }

    if (yields.length === 0) return null;

    const averageYield = yields.reduce((sum, yieldValue) => sum + yieldValue, 0) / yields.length;

    return Number(averageYield.toFixed(4));
  }

  /**
   * Calcula consistência dos dividendos (desvio padrão dos pagamentos)
   */
  calculateDividendConsistency(dividendData) {
    if (dividendData.length < 4) return null;

    // Agrupar por ano
    const yearlyDividends = this.groupDividendsByYear(dividendData);
    const yearlyTotals = Object.values(yearlyDividends);

    if (yearlyTotals.length < 2) return null;

    // Calcular desvio padrão
    const mean = yearlyTotals.reduce((sum, total) => sum + total, 0) / yearlyTotals.length;
    const variance = yearlyTotals.reduce((sum, total) => sum + Math.pow(total - mean, 2), 0) / (yearlyTotals.length - 1);
    const stdDev = Math.sqrt(variance);

    // Coeficiente de variação (menor = mais consistente)
    const coefficientOfVariation = mean > 0 ? stdDev / mean : null;

    return {
      coefficient_of_variation: coefficientOfVariation ? Number(coefficientOfVariation.toFixed(4)) : null,
      standard_deviation: Number(stdDev.toFixed(6)),
      mean_annual_dividend: Number(mean.toFixed(6)),
      consistency_score: this.getConsistencyScore(coefficientOfVariation)
    };
  }

  /**
   * Agrupa dividendos por ano
   */
  groupDividendsByYear(dividendData) {
    const yearlyDividends = {};

    for (const dividend of dividendData) {
      const year = new Date(dividend.ex_date).getFullYear().toString();
      if (!yearlyDividends[year]) {
        yearlyDividends[year] = 0;
      }
      yearlyDividends[year] += dividend.amount;
    }

    return yearlyDividends;
  }

  /**
   * Agrupa preços por ano (média anual)
   */
  groupPricesByYear(priceData) {
    const yearlyPrices = {};
    const yearlyCount = {};

    for (const price of priceData) {
      const year = new Date(price.date).getFullYear().toString();
      if (!yearlyPrices[year]) {
        yearlyPrices[year] = 0;
        yearlyCount[year] = 0;
      }
      yearlyPrices[year] += price.adjusted_close;
      yearlyCount[year]++;
    }

    // Calcular médias
    for (const year of Object.keys(yearlyPrices)) {
      yearlyPrices[year] = yearlyPrices[year] / yearlyCount[year];
    }

    return yearlyPrices;
  }

  /**
   * Calcula anos entre duas datas
   */
  calculateYearsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Number(((end - start) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2));
  }

  /**
   * Converte coeficiente de variação em score de consistência
   */
  getConsistencyScore(coefficientOfVariation) {
    if (coefficientOfVariation === null) return null;

    if (coefficientOfVariation <= 0.1) return 'excellent';
    else if (coefficientOfVariation <= 0.2) return 'good';
    else if (coefficientOfVariation <= 0.3) return 'fair';
    else return 'poor';
  }

  /**
   * Retorna métricas vazias quando não há dados de dividendos
   */
  getEmptyDividendMetrics() {
    return {
      dividends_12m: null,
      dividends_24m: null,
      dividends_36m: null,
      dividends_all_time: null,
      dividend_frequency: null,
      dividend_growth_rate: null,
      current_yield: null,
      average_yield: null,
      dividend_consistency: null
    };
  }

  /**
   * Valida dados de dividendos
   */
  validateDividendData(dividendData) {
    const errors = [];
    
    for (const dividend of dividendData) {
      if (!dividend.symbol || !dividend.ex_date || dividend.amount === undefined) {
        errors.push(`Dados obrigatórios faltando: ${JSON.stringify(dividend)}`);
        continue;
      }

      if (dividend.amount < 0) {
        errors.push(`Valor de dividendo negativo para ${dividend.symbol} em ${dividend.ex_date}`);
      }

      // Validar data
      const date = new Date(dividend.ex_date);
      if (isNaN(date.getTime())) {
        errors.push(`Data inválida para ${dividend.symbol}: ${dividend.ex_date}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount: dividendData.length
    };
  }

  /**
   * Calcula estatísticas resumidas dos dividendos
   */
  calculateDividendSummary(dividendData) {
    if (!dividendData || dividendData.length === 0) {
      return null;
    }

    const amounts = dividendData.map(d => d.amount);
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const average = total / amounts.length;
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    const sortedAmounts = amounts.sort((a, b) => a - b);
    const median = sortedAmounts.length % 2 === 0
      ? (sortedAmounts[sortedAmounts.length / 2 - 1] + sortedAmounts[sortedAmounts.length / 2]) / 2
      : sortedAmounts[Math.floor(sortedAmounts.length / 2)];

    return {
      total_payments: dividendData.length,
      total_amount: Number(total.toFixed(6)),
      average_payment: Number(average.toFixed(6)),
      median_payment: Number(median.toFixed(6)),
      min_payment: Number(min.toFixed(6)),
      max_payment: Number(max.toFixed(6)),
      first_payment: dividendData[0].ex_date,
      last_payment: dividendData[dividendData.length - 1].ex_date
    };
  }
}

module.exports = { DividendMetricsCalculator }; 
  constructor(logger = null) {
    this.logger = logger || console;
  }

  /**
   * Calcula todas as métricas de dividendos para um ETF
   * @param {Array} dividendData - Dados históricos de dividendos ordenados por data
   * @param {Array} priceData - Dados históricos de preços para calcular yields
   * @returns {Object} Objeto com todas as métricas de dividendos
   */
  calculateAllDividendMetrics(dividendData, priceData = []) {
    if (!dividendData || dividendData.length === 0) {
      return this.getEmptyDividendMetrics();
    }

    // Ordenar dados por data
    const sortedDividends = dividendData.sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date));
    const sortedPrices = priceData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const metrics = {
      // Dividendos totais por período
      dividends_12m: this.calculatePeriodDividends(sortedDividends, 12),
      dividends_24m: this.calculatePeriodDividends(sortedDividends, 24),
      dividends_36m: this.calculatePeriodDividends(sortedDividends, 36),
      dividends_all_time: this.calculateAllTimeDividends(sortedDividends),

      // Métricas adicionais
      dividend_frequency: this.calculateDividendFrequency(sortedDividends),
      dividend_growth_rate: this.calculateDividendGrowthRate(sortedDividends),
      current_yield: this.calculateCurrentYield(sortedDividends, sortedPrices),
      average_yield: this.calculateAverageYield(sortedDividends, sortedPrices),
      dividend_consistency: this.calculateDividendConsistency(sortedDividends)
    };

    return metrics;
  }

  /**
   * Calcula total de dividendos para um período específico (em meses)
   */
  calculatePeriodDividends(dividendData, months) {
    if (dividendData.length === 0) return null;

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);

    let totalDividends = 0;
    let dividendCount = 0;

    for (const dividend of dividendData) {
      const dividendDate = new Date(dividend.ex_date);
      if (dividendDate >= startDate && dividendDate <= endDate) {
        totalDividends += dividend.amount;
        dividendCount++;
      }
    }

    return {
      total: Number(totalDividends.toFixed(6)),
      count: dividendCount,
      average: dividendCount > 0 ? Number((totalDividends / dividendCount).toFixed(6)) : 0
    };
  }

  /**
   * Calcula total de dividendos de todos os tempos
   */
  calculateAllTimeDividends(dividendData) {
    if (dividendData.length === 0) return null;

    const totalDividends = dividendData.reduce((sum, div) => sum + div.amount, 0);
    const dividendCount = dividendData.length;

    const firstDividend = dividendData[0];
    const lastDividend = dividendData[dividendData.length - 1];

    return {
      total: Number(totalDividends.toFixed(6)),
      count: dividendCount,
      average: Number((totalDividends / dividendCount).toFixed(6)),
      first_date: firstDividend.ex_date,
      last_date: lastDividend.ex_date,
      period_years: this.calculateYearsBetween(firstDividend.ex_date, lastDividend.ex_date)
    };
  }

  /**
   * Calcula frequência de pagamento de dividendos
   */
  calculateDividendFrequency(dividendData) {
    if (dividendData.length < 2) return null;

    // Calcular intervalos entre pagamentos
    const intervals = [];
    for (let i = 1; i < dividendData.length; i++) {
      const currentDate = new Date(dividendData[i].ex_date);
      const previousDate = new Date(dividendData[i - 1].ex_date);
      const daysDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }

    // Calcular intervalo médio
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Determinar frequência baseada no intervalo médio
    let frequency;
    if (averageInterval <= 35) frequency = 'monthly';
    else if (averageInterval <= 100) frequency = 'quarterly';
    else if (averageInterval <= 200) frequency = 'semi-annually';
    else frequency = 'annually';

    return {
      frequency,
      average_days: Math.round(averageInterval),
      payments_per_year: Math.round(365 / averageInterval)
    };
  }

  /**
   * Calcula taxa de crescimento dos dividendos
   */
  calculateDividendGrowthRate(dividendData) {
    if (dividendData.length < 8) return null; // Mínimo 2 anos de dados trimestrais

    // Agrupar dividendos por ano
    const yearlyDividends = this.groupDividendsByYear(dividendData);
    const years = Object.keys(yearlyDividends).sort();

    if (years.length < 2) return null;

    // Calcular crescimento ano a ano
    const growthRates = [];
    for (let i = 1; i < years.length; i++) {
      const currentYear = yearlyDividends[years[i]];
      const previousYear = yearlyDividends[years[i - 1]];
      
      if (previousYear > 0) {
        const growthRate = (currentYear - previousYear) / previousYear;
        growthRates.push(growthRate);
      }
    }

    if (growthRates.length === 0) return null;

    // Calcular crescimento médio anual
    const averageGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;

    // Calcular crescimento composto anual (CAGR)
    const firstYear = yearlyDividends[years[0]];
    const lastYear = yearlyDividends[years[years.length - 1]];
    const yearsPeriod = years.length - 1;
    const cagr = Math.pow(lastYear / firstYear, 1 / yearsPeriod) - 1;

    return {
      average_growth: Number(averageGrowth.toFixed(4)),
      cagr: Number(cagr.toFixed(4)),
      years_analyzed: yearsPeriod,
      first_year_total: firstYear,
      last_year_total: lastYear
    };
  }

  /**
   * Calcula yield atual baseado nos últimos dividendos
   */
  calculateCurrentYield(dividendData, priceData) {
    if (dividendData.length === 0 || priceData.length === 0) return null;

    // Pegar últimos 12 meses de dividendos
    const twelveMonthsDividends = this.calculatePeriodDividends(dividendData, 12);
    if (!twelveMonthsDividends || twelveMonthsDividends.total === 0) return null;

    // Pegar preço atual (último preço)
    const currentPrice = priceData[priceData.length - 1].adjusted_close;

    const currentYield = twelveMonthsDividends.total / currentPrice;

    return Number(currentYield.toFixed(4));
  }

  /**
   * Calcula yield médio histórico
   */
  calculateAverageYield(dividendData, priceData) {
    if (dividendData.length === 0 || priceData.length === 0) return null;

    const yields = [];

    // Calcular yield para cada ano com dados completos
    const yearlyDividends = this.groupDividendsByYear(dividendData);
    const yearlyPrices = this.groupPricesByYear(priceData);

    for (const year of Object.keys(yearlyDividends)) {
      if (yearlyPrices[year]) {
        const yearDividends = yearlyDividends[year];
        const yearAvgPrice = yearlyPrices[year];
        
        if (yearAvgPrice > 0) {
          const yieldValue = yearDividends / yearAvgPrice;
          yields.push(yieldValue);
        }
      }
    }

    if (yields.length === 0) return null;

    const averageYield = yields.reduce((sum, yieldValue) => sum + yieldValue, 0) / yields.length;

    return Number(averageYield.toFixed(4));
  }

  /**
   * Calcula consistência dos dividendos (desvio padrão dos pagamentos)
   */
  calculateDividendConsistency(dividendData) {
    if (dividendData.length < 4) return null;

    // Agrupar por ano
    const yearlyDividends = this.groupDividendsByYear(dividendData);
    const yearlyTotals = Object.values(yearlyDividends);

    if (yearlyTotals.length < 2) return null;

    // Calcular desvio padrão
    const mean = yearlyTotals.reduce((sum, total) => sum + total, 0) / yearlyTotals.length;
    const variance = yearlyTotals.reduce((sum, total) => sum + Math.pow(total - mean, 2), 0) / (yearlyTotals.length - 1);
    const stdDev = Math.sqrt(variance);

    // Coeficiente de variação (menor = mais consistente)
    const coefficientOfVariation = mean > 0 ? stdDev / mean : null;

    return {
      coefficient_of_variation: coefficientOfVariation ? Number(coefficientOfVariation.toFixed(4)) : null,
      standard_deviation: Number(stdDev.toFixed(6)),
      mean_annual_dividend: Number(mean.toFixed(6)),
      consistency_score: this.getConsistencyScore(coefficientOfVariation)
    };
  }

  /**
   * Agrupa dividendos por ano
   */
  groupDividendsByYear(dividendData) {
    const yearlyDividends = {};

    for (const dividend of dividendData) {
      const year = new Date(dividend.ex_date).getFullYear().toString();
      if (!yearlyDividends[year]) {
        yearlyDividends[year] = 0;
      }
      yearlyDividends[year] += dividend.amount;
    }

    return yearlyDividends;
  }

  /**
   * Agrupa preços por ano (média anual)
   */
  groupPricesByYear(priceData) {
    const yearlyPrices = {};
    const yearlyCount = {};

    for (const price of priceData) {
      const year = new Date(price.date).getFullYear().toString();
      if (!yearlyPrices[year]) {
        yearlyPrices[year] = 0;
        yearlyCount[year] = 0;
      }
      yearlyPrices[year] += price.adjusted_close;
      yearlyCount[year]++;
    }

    // Calcular médias
    for (const year of Object.keys(yearlyPrices)) {
      yearlyPrices[year] = yearlyPrices[year] / yearlyCount[year];
    }

    return yearlyPrices;
  }

  /**
   * Calcula anos entre duas datas
   */
  calculateYearsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Number(((end - start) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2));
  }

  /**
   * Converte coeficiente de variação em score de consistência
   */
  getConsistencyScore(coefficientOfVariation) {
    if (coefficientOfVariation === null) return null;

    if (coefficientOfVariation <= 0.1) return 'excellent';
    else if (coefficientOfVariation <= 0.2) return 'good';
    else if (coefficientOfVariation <= 0.3) return 'fair';
    else return 'poor';
  }

  /**
   * Retorna métricas vazias quando não há dados de dividendos
   */
  getEmptyDividendMetrics() {
    return {
      dividends_12m: null,
      dividends_24m: null,
      dividends_36m: null,
      dividends_all_time: null,
      dividend_frequency: null,
      dividend_growth_rate: null,
      current_yield: null,
      average_yield: null,
      dividend_consistency: null
    };
  }

  /**
   * Valida dados de dividendos
   */
  validateDividendData(dividendData) {
    const errors = [];
    
    for (const dividend of dividendData) {
      if (!dividend.symbol || !dividend.ex_date || dividend.amount === undefined) {
        errors.push(`Dados obrigatórios faltando: ${JSON.stringify(dividend)}`);
        continue;
      }

      if (dividend.amount < 0) {
        errors.push(`Valor de dividendo negativo para ${dividend.symbol} em ${dividend.ex_date}`);
      }

      // Validar data
      const date = new Date(dividend.ex_date);
      if (isNaN(date.getTime())) {
        errors.push(`Data inválida para ${dividend.symbol}: ${dividend.ex_date}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount: dividendData.length
    };
  }

  /**
   * Calcula estatísticas resumidas dos dividendos
   */
  calculateDividendSummary(dividendData) {
    if (!dividendData || dividendData.length === 0) {
      return null;
    }

    const amounts = dividendData.map(d => d.amount);
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const average = total / amounts.length;
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    const sortedAmounts = amounts.sort((a, b) => a - b);
    const median = sortedAmounts.length % 2 === 0
      ? (sortedAmounts[sortedAmounts.length / 2 - 1] + sortedAmounts[sortedAmounts.length / 2]) / 2
      : sortedAmounts[Math.floor(sortedAmounts.length / 2)];

    return {
      total_payments: dividendData.length,
      total_amount: Number(total.toFixed(6)),
      average_payment: Number(average.toFixed(6)),
      median_payment: Number(median.toFixed(6)),
      min_payment: Number(min.toFixed(6)),
      max_payment: Number(max.toFixed(6)),
      first_payment: dividendData[0].ex_date,
      last_payment: dividendData[dividendData.length - 1].ex_date
    };
  }
}

module.exports = { DividendMetricsCalculator }; 