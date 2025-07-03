class FinancialMetricsCalculator {
  constructor(logger = null) {
    this.logger = logger || console;
    this.riskFreeRate = 0.02; // 2% taxa livre de risco anual
    this.tradingDaysPerYear = 252;
  }

  /**
   * Calcula todas as métricas financeiras para um ETF
   * @param {Array} priceData - Dados históricos de preços ordenados por data
   * @param {Array} dividendData - Dados históricos de dividendos
   * @returns {Object} Objeto com todas as métricas calculadas
   */
  calculateAllMetrics(priceData, dividendData = []) {
    if (!priceData || priceData.length === 0) {
      return this.getEmptyMetrics();
    }

    // Ordenar dados por data (mais antigo primeiro)
    const sortedPrices = priceData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedDividends = dividendData.sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date));

    // Calcular retornos diários
    const dailyReturns = this.calculateDailyReturns(sortedPrices, sortedDividends);

    // Calcular métricas para diferentes períodos
    const metrics = {
      // Returns
      returns_12m: this.calculatePeriodReturn(sortedPrices, sortedDividends, 12),
      returns_24m: this.calculatePeriodReturn(sortedPrices, sortedDividends, 24),
      returns_36m: this.calculatePeriodReturn(sortedPrices, sortedDividends, 36),
      returns_5y: this.calculatePeriodReturn(sortedPrices, sortedDividends, 60),
      ten_year_return: this.calculatePeriodReturn(sortedPrices, sortedDividends, 120),

      // Volatility
      volatility_12m: this.calculatePeriodVolatility(dailyReturns, 12),
      volatility_24m: this.calculatePeriodVolatility(dailyReturns, 24),
      volatility_36m: this.calculatePeriodVolatility(dailyReturns, 36),
      ten_year_volatility: this.calculatePeriodVolatility(dailyReturns, 120),

      // Sharpe Ratios
      sharpe_12m: null,
      sharpe_24m: null,
      sharpe_36m: null,
      ten_year_sharpe: null,

      // Max Drawdown
      max_drawdown: this.calculateMaxDrawdown(sortedPrices)
    };

    // Calcular Sharpe ratios
    metrics.sharpe_12m = this.calculateSharpeRatio(metrics.returns_12m, metrics.volatility_12m);
    metrics.sharpe_24m = this.calculateSharpeRatio(metrics.returns_24m, metrics.volatility_24m);
    metrics.sharpe_36m = this.calculateSharpeRatio(metrics.returns_36m, metrics.volatility_36m);
    metrics.ten_year_sharpe = this.calculateSharpeRatio(metrics.ten_year_return, metrics.ten_year_volatility);

    return metrics;
  }

  /**
   * Calcula retornos diários incluindo dividendos
   */
  calculateDailyReturns(priceData, dividendData = []) {
    const returns = [];
    const dividendMap = this.createDividendMap(dividendData);

    for (let i = 1; i < priceData.length; i++) {
      const currentPrice = priceData[i];
      const previousPrice = priceData[i - 1];
      const currentDate = currentPrice.date;

      // Retorno de preço
      const priceReturn = (currentPrice.adjusted_close - previousPrice.adjusted_close) / previousPrice.adjusted_close;

      // Adicionar dividendo se houver
      const dividendYield = dividendMap[currentDate] || 0;
      const totalReturn = priceReturn + dividendYield;

      returns.push({
        date: currentDate,
        return: totalReturn,
        priceReturn: priceReturn,
        dividendYield: dividendYield
      });
    }

    return returns;
  }

  /**
   * Calcula retorno total para um período específico (em meses)
   */
  calculatePeriodReturn(priceData, dividendData, months) {
    if (priceData.length === 0) return null;

    const endDate = new Date(priceData[priceData.length - 1].date);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);

    // Encontrar preços mais próximos das datas
    const startPrice = this.findClosestPrice(priceData, startDate);
    const endPrice = priceData[priceData.length - 1];

    if (!startPrice) return null;

    // Calcular dividendos no período
    const periodDividends = this.calculatePeriodDividends(dividendData, startDate, endDate);

    // Retorno total = (preço_final - preço_inicial + dividendos) / preço_inicial
    const priceChange = endPrice.adjusted_close - startPrice.adjusted_close;
    const totalReturn = (priceChange + periodDividends) / startPrice.adjusted_close;

    // Anualizar o retorno
    const years = months / 12;
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

    return Number(annualizedReturn.toFixed(6));
  }

  /**
   * Calcula volatilidade para um período específico (em meses)
   */
  calculatePeriodVolatility(dailyReturns, months) {
    if (dailyReturns.length === 0) return null;

    const endDate = new Date(dailyReturns[dailyReturns.length - 1].date);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);

    // Filtrar retornos do período
    const periodReturns = dailyReturns.filter(r => {
      const returnDate = new Date(r.date);
      return returnDate >= startDate && returnDate <= endDate;
    });

    if (periodReturns.length < 30) return null; // Mínimo de 30 observações

    // Calcular desvio padrão dos retornos
    const returns = periodReturns.map(r => r.return);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const dailyVolatility = Math.sqrt(variance);

    // Anualizar volatilidade
    const annualizedVolatility = dailyVolatility * Math.sqrt(this.tradingDaysPerYear);

    return Number(annualizedVolatility.toFixed(6));
  }

  /**
   * Calcula Sharpe Ratio
   */
  calculateSharpeRatio(annualizedReturn, annualizedVolatility) {
    if (annualizedReturn === null || annualizedVolatility === null || annualizedVolatility === 0) {
      return null;
    }

    const excessReturn = annualizedReturn - this.riskFreeRate;
    const sharpeRatio = excessReturn / annualizedVolatility;

    return Number(sharpeRatio.toFixed(4));
  }

  /**
   * Calcula Maximum Drawdown
   */
  calculateMaxDrawdown(priceData) {
    if (priceData.length === 0) return null;

    let maxDrawdown = 0;
    let peak = priceData[0].adjusted_close;

    for (const price of priceData) {
      const currentPrice = price.adjusted_close;
      
      // Atualizar pico
      if (currentPrice > peak) {
        peak = currentPrice;
      }

      // Calcular drawdown atual
      const drawdown = (peak - currentPrice) / peak;
      
      // Atualizar max drawdown
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return Number(maxDrawdown.toFixed(6));
  }

  /**
   * Cria mapa de dividendos por data
   */
  createDividendMap(dividendData) {
    const dividendMap = {};
    
    for (const dividend of dividendData) {
      const date = dividend.ex_date;
      dividendMap[date] = dividend.amount;
    }

    return dividendMap;
  }

  /**
   * Calcula total de dividendos em um período
   */
  calculatePeriodDividends(dividendData, startDate, endDate) {
    let totalDividends = 0;

    for (const dividend of dividendData) {
      const dividendDate = new Date(dividend.ex_date);
      if (dividendDate >= startDate && dividendDate <= endDate) {
        totalDividends += dividend.amount;
      }
    }

    return totalDividends;
  }

  /**
   * Encontra preço mais próximo de uma data específica
   */
  findClosestPrice(priceData, targetDate) {
    let closest = null;
    let minDiff = Infinity;

    for (const price of priceData) {
      const priceDate = new Date(price.date);
      const diff = Math.abs(priceDate - targetDate);
      
      if (diff < minDiff) {
        minDiff = diff;
        closest = price;
      }
    }

    return closest;
  }

  /**
   * Retorna métricas vazias quando não há dados suficientes
   */
  getEmptyMetrics() {
    return {
      returns_12m: null,
      returns_24m: null,
      returns_36m: null,
      returns_5y: null,
      ten_year_return: null,
      volatility_12m: null,
      volatility_24m: null,
      volatility_36m: null,
      ten_year_volatility: null,
      sharpe_12m: null,
      sharpe_24m: null,
      sharpe_36m: null,
      ten_year_sharpe: null,
      max_drawdown: null
    };
  }

  /**
   * Valida se há dados suficientes para calcular métricas de um período
   */
  hasEnoughDataForPeriod(priceData, months) {
    if (!priceData || priceData.length === 0) return false;

    const endDate = new Date(priceData[priceData.length - 1].date);
    const startDate = new Date(priceData[0].date);
    const monthsDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44); // Aproximação

    return monthsDiff >= months * 0.8; // Pelo menos 80% do período
  }

  /**
   * Calcula estatísticas resumidas dos dados
   */
  calculateSummaryStats(priceData, dividendData) {
    if (!priceData || priceData.length === 0) {
      return null;
    }

    const startDate = priceData[0].date;
    const endDate = priceData[priceData.length - 1].date;
    const totalDays = priceData.length;
    const totalDividends = dividendData.reduce((sum, d) => sum + d.amount, 0);

    return {
      startDate,
      endDate,
      totalDays,
      totalDividends,
      startPrice: priceData[0].adjusted_close,
      endPrice: priceData[priceData.length - 1].adjusted_close,
      minPrice: Math.min(...priceData.map(p => p.adjusted_close)),
      maxPrice: Math.max(...priceData.map(p => p.adjusted_close)),
      avgVolume: priceData.reduce((sum, p) => sum + (p.volume || 0), 0) / priceData.length
    };
  }
}

module.exports = { FinancialMetricsCalculator }; 
  constructor(logger = null) {
    this.logger = logger || console;
    this.riskFreeRate = 0.02; // 2% taxa livre de risco anual
    this.tradingDaysPerYear = 252;
  }

  /**
   * Calcula todas as métricas financeiras para um ETF
   * @param {Array} priceData - Dados históricos de preços ordenados por data
   * @param {Array} dividendData - Dados históricos de dividendos
   * @returns {Object} Objeto com todas as métricas calculadas
   */
  calculateAllMetrics(priceData, dividendData = []) {
    if (!priceData || priceData.length === 0) {
      return this.getEmptyMetrics();
    }

    // Ordenar dados por data (mais antigo primeiro)
    const sortedPrices = priceData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedDividends = dividendData.sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date));

    // Calcular retornos diários
    const dailyReturns = this.calculateDailyReturns(sortedPrices, sortedDividends);

    // Calcular métricas para diferentes períodos
    const metrics = {
      // Returns
      returns_12m: this.calculatePeriodReturn(sortedPrices, sortedDividends, 12),
      returns_24m: this.calculatePeriodReturn(sortedPrices, sortedDividends, 24),
      returns_36m: this.calculatePeriodReturn(sortedPrices, sortedDividends, 36),
      returns_5y: this.calculatePeriodReturn(sortedPrices, sortedDividends, 60),
      ten_year_return: this.calculatePeriodReturn(sortedPrices, sortedDividends, 120),

      // Volatility
      volatility_12m: this.calculatePeriodVolatility(dailyReturns, 12),
      volatility_24m: this.calculatePeriodVolatility(dailyReturns, 24),
      volatility_36m: this.calculatePeriodVolatility(dailyReturns, 36),
      ten_year_volatility: this.calculatePeriodVolatility(dailyReturns, 120),

      // Sharpe Ratios
      sharpe_12m: null,
      sharpe_24m: null,
      sharpe_36m: null,
      ten_year_sharpe: null,

      // Max Drawdown
      max_drawdown: this.calculateMaxDrawdown(sortedPrices)
    };

    // Calcular Sharpe ratios
    metrics.sharpe_12m = this.calculateSharpeRatio(metrics.returns_12m, metrics.volatility_12m);
    metrics.sharpe_24m = this.calculateSharpeRatio(metrics.returns_24m, metrics.volatility_24m);
    metrics.sharpe_36m = this.calculateSharpeRatio(metrics.returns_36m, metrics.volatility_36m);
    metrics.ten_year_sharpe = this.calculateSharpeRatio(metrics.ten_year_return, metrics.ten_year_volatility);

    return metrics;
  }

  /**
   * Calcula retornos diários incluindo dividendos
   */
  calculateDailyReturns(priceData, dividendData = []) {
    const returns = [];
    const dividendMap = this.createDividendMap(dividendData);

    for (let i = 1; i < priceData.length; i++) {
      const currentPrice = priceData[i];
      const previousPrice = priceData[i - 1];
      const currentDate = currentPrice.date;

      // Retorno de preço
      const priceReturn = (currentPrice.adjusted_close - previousPrice.adjusted_close) / previousPrice.adjusted_close;

      // Adicionar dividendo se houver
      const dividendYield = dividendMap[currentDate] || 0;
      const totalReturn = priceReturn + dividendYield;

      returns.push({
        date: currentDate,
        return: totalReturn,
        priceReturn: priceReturn,
        dividendYield: dividendYield
      });
    }

    return returns;
  }

  /**
   * Calcula retorno total para um período específico (em meses)
   */
  calculatePeriodReturn(priceData, dividendData, months) {
    if (priceData.length === 0) return null;

    const endDate = new Date(priceData[priceData.length - 1].date);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);

    // Encontrar preços mais próximos das datas
    const startPrice = this.findClosestPrice(priceData, startDate);
    const endPrice = priceData[priceData.length - 1];

    if (!startPrice) return null;

    // Calcular dividendos no período
    const periodDividends = this.calculatePeriodDividends(dividendData, startDate, endDate);

    // Retorno total = (preço_final - preço_inicial + dividendos) / preço_inicial
    const priceChange = endPrice.adjusted_close - startPrice.adjusted_close;
    const totalReturn = (priceChange + periodDividends) / startPrice.adjusted_close;

    // Anualizar o retorno
    const years = months / 12;
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

    return Number(annualizedReturn.toFixed(6));
  }

  /**
   * Calcula volatilidade para um período específico (em meses)
   */
  calculatePeriodVolatility(dailyReturns, months) {
    if (dailyReturns.length === 0) return null;

    const endDate = new Date(dailyReturns[dailyReturns.length - 1].date);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);

    // Filtrar retornos do período
    const periodReturns = dailyReturns.filter(r => {
      const returnDate = new Date(r.date);
      return returnDate >= startDate && returnDate <= endDate;
    });

    if (periodReturns.length < 30) return null; // Mínimo de 30 observações

    // Calcular desvio padrão dos retornos
    const returns = periodReturns.map(r => r.return);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const dailyVolatility = Math.sqrt(variance);

    // Anualizar volatilidade
    const annualizedVolatility = dailyVolatility * Math.sqrt(this.tradingDaysPerYear);

    return Number(annualizedVolatility.toFixed(6));
  }

  /**
   * Calcula Sharpe Ratio
   */
  calculateSharpeRatio(annualizedReturn, annualizedVolatility) {
    if (annualizedReturn === null || annualizedVolatility === null || annualizedVolatility === 0) {
      return null;
    }

    const excessReturn = annualizedReturn - this.riskFreeRate;
    const sharpeRatio = excessReturn / annualizedVolatility;

    return Number(sharpeRatio.toFixed(4));
  }

  /**
   * Calcula Maximum Drawdown
   */
  calculateMaxDrawdown(priceData) {
    if (priceData.length === 0) return null;

    let maxDrawdown = 0;
    let peak = priceData[0].adjusted_close;

    for (const price of priceData) {
      const currentPrice = price.adjusted_close;
      
      // Atualizar pico
      if (currentPrice > peak) {
        peak = currentPrice;
      }

      // Calcular drawdown atual
      const drawdown = (peak - currentPrice) / peak;
      
      // Atualizar max drawdown
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return Number(maxDrawdown.toFixed(6));
  }

  /**
   * Cria mapa de dividendos por data
   */
  createDividendMap(dividendData) {
    const dividendMap = {};
    
    for (const dividend of dividendData) {
      const date = dividend.ex_date;
      dividendMap[date] = dividend.amount;
    }

    return dividendMap;
  }

  /**
   * Calcula total de dividendos em um período
   */
  calculatePeriodDividends(dividendData, startDate, endDate) {
    let totalDividends = 0;

    for (const dividend of dividendData) {
      const dividendDate = new Date(dividend.ex_date);
      if (dividendDate >= startDate && dividendDate <= endDate) {
        totalDividends += dividend.amount;
      }
    }

    return totalDividends;
  }

  /**
   * Encontra preço mais próximo de uma data específica
   */
  findClosestPrice(priceData, targetDate) {
    let closest = null;
    let minDiff = Infinity;

    for (const price of priceData) {
      const priceDate = new Date(price.date);
      const diff = Math.abs(priceDate - targetDate);
      
      if (diff < minDiff) {
        minDiff = diff;
        closest = price;
      }
    }

    return closest;
  }

  /**
   * Retorna métricas vazias quando não há dados suficientes
   */
  getEmptyMetrics() {
    return {
      returns_12m: null,
      returns_24m: null,
      returns_36m: null,
      returns_5y: null,
      ten_year_return: null,
      volatility_12m: null,
      volatility_24m: null,
      volatility_36m: null,
      ten_year_volatility: null,
      sharpe_12m: null,
      sharpe_24m: null,
      sharpe_36m: null,
      ten_year_sharpe: null,
      max_drawdown: null
    };
  }

  /**
   * Valida se há dados suficientes para calcular métricas de um período
   */
  hasEnoughDataForPeriod(priceData, months) {
    if (!priceData || priceData.length === 0) return false;

    const endDate = new Date(priceData[priceData.length - 1].date);
    const startDate = new Date(priceData[0].date);
    const monthsDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44); // Aproximação

    return monthsDiff >= months * 0.8; // Pelo menos 80% do período
  }

  /**
   * Calcula estatísticas resumidas dos dados
   */
  calculateSummaryStats(priceData, dividendData) {
    if (!priceData || priceData.length === 0) {
      return null;
    }

    const startDate = priceData[0].date;
    const endDate = priceData[priceData.length - 1].date;
    const totalDays = priceData.length;
    const totalDividends = dividendData.reduce((sum, d) => sum + d.amount, 0);

    return {
      startDate,
      endDate,
      totalDays,
      totalDividends,
      startPrice: priceData[0].adjusted_close,
      endPrice: priceData[priceData.length - 1].adjusted_close,
      minPrice: Math.min(...priceData.map(p => p.adjusted_close)),
      maxPrice: Math.max(...priceData.map(p => p.adjusted_close)),
      avgVolume: priceData.reduce((sum, p) => sum + (p.volume || 0), 0) / priceData.length
    };
  }
}

module.exports = { FinancialMetricsCalculator }; 