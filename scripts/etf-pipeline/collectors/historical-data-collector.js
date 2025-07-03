const axios = require('axios');

class HistoricalDataCollector {
  constructor(logger = null) {
    this.logger = logger || console;
    this.riskFreeRate = 0.02; // 2% taxa livre de risco (10-year Treasury)
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  /**
   * Coleta dados históricos de preços para um ETF
   * @param {string} symbol - Símbolo do ETF
   * @param {string} startDate - Data de início (YYYY-MM-DD)
   * @param {string} endDate - Data final (YYYY-MM-DD)
   * @returns {Promise<Array>} Array de dados de preços
   */
  async collectPriceHistory(symbol, startDate, endDate) {
    this.logger.debug && this.logger.debug(`Coletando histórico de preços para ${symbol}: ${startDate} a ${endDate}`);

    try {
      // Primeiro tenta yfinance (simulado - em produção seria API real)
      const priceData = await this.fetchYFinancePrices(symbol, startDate, endDate);
      
      if (priceData && priceData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${priceData.length} registros de preços para ${symbol}`);
        return priceData;
      }

      // Fallback para outras APIs
      const fallbackData = await this.fetchFallbackPrices(symbol, startDate, endDate);
      if (fallbackData && fallbackData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${fallbackData.length} registros via fallback para ${symbol}`);
        return fallbackData;
      }

      this.logger.warn && this.logger.warn(`⚠️ Nenhum dado de preço encontrado para ${symbol}`);
      return [];

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao coletar preços para ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Coleta dados históricos de dividendos para um ETF
   * @param {string} symbol - Símbolo do ETF
   * @param {string} startDate - Data de início (YYYY-MM-DD)
   * @param {string} endDate - Data final (YYYY-MM-DD)
   * @returns {Promise<Array>} Array de dados de dividendos
   */
  async collectDividendHistory(symbol, startDate, endDate) {
    this.logger.debug && this.logger.debug(`Coletando histórico de dividendos para ${symbol}: ${startDate} a ${endDate}`);

    try {
      // Primeiro tenta yfinance (simulado)
      const dividendData = await this.fetchYFinanceDividends(symbol, startDate, endDate);
      
      if (dividendData && dividendData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${dividendData.length} registros de dividendos para ${symbol}`);
        return dividendData;
      }

      // Fallback para outras APIs
      const fallbackData = await this.fetchFallbackDividends(symbol, startDate, endDate);
      if (fallbackData && fallbackData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${fallbackData.length} registros via fallback para ${symbol}`);
        return fallbackData;
      }

      this.logger.debug && this.logger.debug(`ℹ️ Nenhum dividendo encontrado para ${symbol} (normal para alguns ETFs)`);
      return [];

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao coletar dividendos para ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Simula coleta via yfinance (em produção seria biblioteca real)
   */
  async fetchYFinancePrices(symbol, startDate, endDate) {
    // Simular dados históricos realistas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = [];
    
    // Gerar dados diários
    let currentDate = new Date(start);
    let basePrice = this.getBasePriceForSymbol(symbol);
    let previousClose = basePrice;

    while (currentDate <= end) {
      // Pular finais de semana
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Simular variação diária realista (-3% a +3%)
        const dailyChange = (Math.random() - 0.5) * 0.06;
        const volatility = this.getVolatilityForSymbol(symbol);
        const adjustedChange = dailyChange * volatility;

        const open = previousClose * (1 + (Math.random() - 0.5) * 0.01);
        const close = previousClose * (1 + adjustedChange);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        
        // Volume realista
        const baseVolume = this.getBaseVolumeForSymbol(symbol);
        const volume = Math.floor(baseVolume * (0.5 + Math.random()));

        data.push({
          symbol,
          date: currentDate.toISOString().split('T')[0],
          open: Number(open.toFixed(4)),
          high: Number(high.toFixed(4)),
          low: Number(low.toFixed(4)),
          close: Number(close.toFixed(4)),
          adjusted_close: Number(close.toFixed(4)),
          volume
        });

        previousClose = close;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Simular delay da API
    await this.delay(100);

    return data;
  }

  async fetchYFinanceDividends(symbol, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = [];
    
    // Simular dividendos trimestrais para ETFs que pagam
    if (this.etfPaysDividends(symbol)) {
      let currentDate = new Date(start);
      
      // Encontrar primeiro trimestre
      while (currentDate <= end) {
        // Pagamentos trimestrais (março, junho, setembro, dezembro)
        if ([2, 5, 8, 11].includes(currentDate.getMonth())) {
          const baseYield = this.getBaseYieldForSymbol(symbol);
          const quarterlyAmount = (baseYield / 4) * (0.8 + Math.random() * 0.4);
          
          data.push({
            symbol,
            ex_date: currentDate.toISOString().split('T')[0],
            pay_date: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: Number(quarterlyAmount.toFixed(6)),
            frequency: 'quarterly',
            yield_percentage: Number((baseYield * 100).toFixed(4))
          });
        }
        
        currentDate.setMonth(currentDate.getMonth() + 3);
      }
    }

    await this.delay(100);
    return data;
  }

  async fetchFallbackPrices(symbol, startDate, endDate) {
    // Implementar fallback para outras APIs (Alpha Vantage, Polygon, etc.)
    // Por enquanto, retorna dados vazios
    this.logger.debug && this.logger.debug(`Tentando fallback para preços de ${symbol}`);
    return [];
  }

  async fetchFallbackDividends(symbol, startDate, endDate) {
    // Implementar fallback para outras APIs
    this.logger.debug && this.logger.debug(`Tentando fallback para dividendos de ${symbol}`);
    return [];
  }

  /**
   * Calcula período de coleta baseado na data de inception do ETF
   */
  calculateDateRange(inceptionDate, targetEndDate = '2025-05-15') {
    const inception = new Date(inceptionDate);
    const target = new Date(targetEndDate);
    const tenYearsAgo = new Date(target);
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    // Se o ETF tem mais de 10 anos, pega últimos 10 anos
    // Senão, pega desde a inception
    const startDate = inception > tenYearsAgo ? inception : tenYearsAgo;

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: target.toISOString().split('T')[0],
      totalDays: Math.ceil((target - startDate) / (1000 * 60 * 60 * 24)),
      isFullTenYears: inception <= tenYearsAgo
    };
  }

  // Métodos auxiliares para dados realistas
  getBasePriceForSymbol(symbol) {
    const prices = {
      'SPY': 420,
      'QQQ': 350,
      'VTI': 220,
      'IWM': 180,
      'EFA': 75,
      'VEA': 45,
      'VWO': 42,
      'AGG': 105,
      'TLT': 95,
      'GLD': 185
    };
    return prices[symbol] || (50 + Math.random() * 200);
  }

  getVolatilityForSymbol(symbol) {
    const volatilities = {
      'SPY': 1.0,
      'QQQ': 1.3,
      'VTI': 1.0,
      'IWM': 1.5,
      'EFA': 1.2,
      'VEA': 1.2,
      'VWO': 1.8,
      'AGG': 0.3,
      'TLT': 0.8,
      'GLD': 1.4
    };
    return volatilities[symbol] || (0.5 + Math.random() * 1.0);
  }

  getBaseVolumeForSymbol(symbol) {
    const volumes = {
      'SPY': 80000000,
      'QQQ': 45000000,
      'VTI': 4000000,
      'IWM': 25000000,
      'EFA': 8000000,
      'VEA': 6000000,
      'VWO': 15000000,
      'AGG': 5000000,
      'TLT': 12000000,
      'GLD': 8000000
    };
    return volumes[symbol] || (100000 + Math.random() * 1000000);
  }

  etfPaysDividends(symbol) {
    const dividendETFs = ['SPY', 'VTI', 'EFA', 'VEA', 'VWO', 'AGG', 'TLT'];
    return dividendETFs.includes(symbol) || Math.random() > 0.3;
  }

  getBaseYieldForSymbol(symbol) {
    const yields = {
      'SPY': 0.015,
      'VTI': 0.018,
      'EFA': 0.025,
      'VEA': 0.028,
      'VWO': 0.035,
      'AGG': 0.025,
      'TLT': 0.020
    };
    return yields[symbol] || (0.005 + Math.random() * 0.030);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Valida dados de preços coletados
   */
  validatePriceData(data) {
    const errors = [];
    
    for (const record of data) {
      if (!record.symbol || !record.date || !record.close) {
        errors.push(`Dados obrigatórios faltando: ${JSON.stringify(record)}`);
        continue;
      }

      if (record.close <= 0 || record.high < record.low) {
        errors.push(`Dados inválidos para ${record.symbol} em ${record.date}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount: data.length
    };
  }

  /**
   * Valida dados de dividendos coletados
   */
  validateDividendData(data) {
    const errors = [];
    
    for (const record of data) {
      if (!record.symbol || !record.ex_date || !record.amount) {
        errors.push(`Dados obrigatórios faltando: ${JSON.stringify(record)}`);
        continue;
      }

      if (record.amount <= 0) {
        errors.push(`Valor de dividendo inválido para ${record.symbol} em ${record.ex_date}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount: data.length
    };
  }
}

module.exports = { HistoricalDataCollector }; 

class HistoricalDataCollector {
  constructor(logger = null) {
    this.logger = logger || console;
    this.riskFreeRate = 0.02; // 2% taxa livre de risco (10-year Treasury)
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  /**
   * Coleta dados históricos de preços para um ETF
   * @param {string} symbol - Símbolo do ETF
   * @param {string} startDate - Data de início (YYYY-MM-DD)
   * @param {string} endDate - Data final (YYYY-MM-DD)
   * @returns {Promise<Array>} Array de dados de preços
   */
  async collectPriceHistory(symbol, startDate, endDate) {
    this.logger.debug && this.logger.debug(`Coletando histórico de preços para ${symbol}: ${startDate} a ${endDate}`);

    try {
      // Primeiro tenta yfinance (simulado - em produção seria API real)
      const priceData = await this.fetchYFinancePrices(symbol, startDate, endDate);
      
      if (priceData && priceData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${priceData.length} registros de preços para ${symbol}`);
        return priceData;
      }

      // Fallback para outras APIs
      const fallbackData = await this.fetchFallbackPrices(symbol, startDate, endDate);
      if (fallbackData && fallbackData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${fallbackData.length} registros via fallback para ${symbol}`);
        return fallbackData;
      }

      this.logger.warn && this.logger.warn(`⚠️ Nenhum dado de preço encontrado para ${symbol}`);
      return [];

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao coletar preços para ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Coleta dados históricos de dividendos para um ETF
   * @param {string} symbol - Símbolo do ETF
   * @param {string} startDate - Data de início (YYYY-MM-DD)
   * @param {string} endDate - Data final (YYYY-MM-DD)
   * @returns {Promise<Array>} Array de dados de dividendos
   */
  async collectDividendHistory(symbol, startDate, endDate) {
    this.logger.debug && this.logger.debug(`Coletando histórico de dividendos para ${symbol}: ${startDate} a ${endDate}`);

    try {
      // Primeiro tenta yfinance (simulado)
      const dividendData = await this.fetchYFinanceDividends(symbol, startDate, endDate);
      
      if (dividendData && dividendData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${dividendData.length} registros de dividendos para ${symbol}`);
        return dividendData;
      }

      // Fallback para outras APIs
      const fallbackData = await this.fetchFallbackDividends(symbol, startDate, endDate);
      if (fallbackData && fallbackData.length > 0) {
        this.logger.debug && this.logger.debug(`✓ Coletados ${fallbackData.length} registros via fallback para ${symbol}`);
        return fallbackData;
      }

      this.logger.debug && this.logger.debug(`ℹ️ Nenhum dividendo encontrado para ${symbol} (normal para alguns ETFs)`);
      return [];

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao coletar dividendos para ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Simula coleta via yfinance (em produção seria biblioteca real)
   */
  async fetchYFinancePrices(symbol, startDate, endDate) {
    // Simular dados históricos realistas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = [];
    
    // Gerar dados diários
    let currentDate = new Date(start);
    let basePrice = this.getBasePriceForSymbol(symbol);
    let previousClose = basePrice;

    while (currentDate <= end) {
      // Pular finais de semana
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Simular variação diária realista (-3% a +3%)
        const dailyChange = (Math.random() - 0.5) * 0.06;
        const volatility = this.getVolatilityForSymbol(symbol);
        const adjustedChange = dailyChange * volatility;

        const open = previousClose * (1 + (Math.random() - 0.5) * 0.01);
        const close = previousClose * (1 + adjustedChange);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        
        // Volume realista
        const baseVolume = this.getBaseVolumeForSymbol(symbol);
        const volume = Math.floor(baseVolume * (0.5 + Math.random()));

        data.push({
          symbol,
          date: currentDate.toISOString().split('T')[0],
          open: Number(open.toFixed(4)),
          high: Number(high.toFixed(4)),
          low: Number(low.toFixed(4)),
          close: Number(close.toFixed(4)),
          adjusted_close: Number(close.toFixed(4)),
          volume
        });

        previousClose = close;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Simular delay da API
    await this.delay(100);

    return data;
  }

  async fetchYFinanceDividends(symbol, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = [];
    
    // Simular dividendos trimestrais para ETFs que pagam
    if (this.etfPaysDividends(symbol)) {
      let currentDate = new Date(start);
      
      // Encontrar primeiro trimestre
      while (currentDate <= end) {
        // Pagamentos trimestrais (março, junho, setembro, dezembro)
        if ([2, 5, 8, 11].includes(currentDate.getMonth())) {
          const baseYield = this.getBaseYieldForSymbol(symbol);
          const quarterlyAmount = (baseYield / 4) * (0.8 + Math.random() * 0.4);
          
          data.push({
            symbol,
            ex_date: currentDate.toISOString().split('T')[0],
            pay_date: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: Number(quarterlyAmount.toFixed(6)),
            frequency: 'quarterly',
            yield_percentage: Number((baseYield * 100).toFixed(4))
          });
        }
        
        currentDate.setMonth(currentDate.getMonth() + 3);
      }
    }

    await this.delay(100);
    return data;
  }

  async fetchFallbackPrices(symbol, startDate, endDate) {
    // Implementar fallback para outras APIs (Alpha Vantage, Polygon, etc.)
    // Por enquanto, retorna dados vazios
    this.logger.debug && this.logger.debug(`Tentando fallback para preços de ${symbol}`);
    return [];
  }

  async fetchFallbackDividends(symbol, startDate, endDate) {
    // Implementar fallback para outras APIs
    this.logger.debug && this.logger.debug(`Tentando fallback para dividendos de ${symbol}`);
    return [];
  }

  /**
   * Calcula período de coleta baseado na data de inception do ETF
   */
  calculateDateRange(inceptionDate, targetEndDate = '2025-05-15') {
    const inception = new Date(inceptionDate);
    const target = new Date(targetEndDate);
    const tenYearsAgo = new Date(target);
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    // Se o ETF tem mais de 10 anos, pega últimos 10 anos
    // Senão, pega desde a inception
    const startDate = inception > tenYearsAgo ? inception : tenYearsAgo;

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: target.toISOString().split('T')[0],
      totalDays: Math.ceil((target - startDate) / (1000 * 60 * 60 * 24)),
      isFullTenYears: inception <= tenYearsAgo
    };
  }

  // Métodos auxiliares para dados realistas
  getBasePriceForSymbol(symbol) {
    const prices = {
      'SPY': 420,
      'QQQ': 350,
      'VTI': 220,
      'IWM': 180,
      'EFA': 75,
      'VEA': 45,
      'VWO': 42,
      'AGG': 105,
      'TLT': 95,
      'GLD': 185
    };
    return prices[symbol] || (50 + Math.random() * 200);
  }

  getVolatilityForSymbol(symbol) {
    const volatilities = {
      'SPY': 1.0,
      'QQQ': 1.3,
      'VTI': 1.0,
      'IWM': 1.5,
      'EFA': 1.2,
      'VEA': 1.2,
      'VWO': 1.8,
      'AGG': 0.3,
      'TLT': 0.8,
      'GLD': 1.4
    };
    return volatilities[symbol] || (0.5 + Math.random() * 1.0);
  }

  getBaseVolumeForSymbol(symbol) {
    const volumes = {
      'SPY': 80000000,
      'QQQ': 45000000,
      'VTI': 4000000,
      'IWM': 25000000,
      'EFA': 8000000,
      'VEA': 6000000,
      'VWO': 15000000,
      'AGG': 5000000,
      'TLT': 12000000,
      'GLD': 8000000
    };
    return volumes[symbol] || (100000 + Math.random() * 1000000);
  }

  etfPaysDividends(symbol) {
    const dividendETFs = ['SPY', 'VTI', 'EFA', 'VEA', 'VWO', 'AGG', 'TLT'];
    return dividendETFs.includes(symbol) || Math.random() > 0.3;
  }

  getBaseYieldForSymbol(symbol) {
    const yields = {
      'SPY': 0.015,
      'VTI': 0.018,
      'EFA': 0.025,
      'VEA': 0.028,
      'VWO': 0.035,
      'AGG': 0.025,
      'TLT': 0.020
    };
    return yields[symbol] || (0.005 + Math.random() * 0.030);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Valida dados de preços coletados
   */
  validatePriceData(data) {
    const errors = [];
    
    for (const record of data) {
      if (!record.symbol || !record.date || !record.close) {
        errors.push(`Dados obrigatórios faltando: ${JSON.stringify(record)}`);
        continue;
      }

      if (record.close <= 0 || record.high < record.low) {
        errors.push(`Dados inválidos para ${record.symbol} em ${record.date}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount: data.length
    };
  }

  /**
   * Valida dados de dividendos coletados
   */
  validateDividendData(data) {
    const errors = [];
    
    for (const record of data) {
      if (!record.symbol || !record.ex_date || !record.amount) {
        errors.push(`Dados obrigatórios faltando: ${JSON.stringify(record)}`);
        continue;
      }

      if (record.amount <= 0) {
        errors.push(`Valor de dividendo inválido para ${record.symbol} em ${record.ex_date}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount: data.length
    };
  }
}

module.exports = { HistoricalDataCollector }; 