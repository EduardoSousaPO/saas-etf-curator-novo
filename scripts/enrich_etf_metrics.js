const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuração das APIs
const API_CONFIGS = {
  ALPHA_VANTAGE: {
    baseUrl: 'https://www.alphavantage.co/query',
    key: process.env.ALPHA_VANTAGE_API_KEY,
    rateLimit: 5, // calls per minute
    delay: 12000 // 12 seconds between calls
  },
  YAHOO_FINANCE: {
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    rateLimit: 2000, // calls per hour
    delay: 2000 // 2 seconds between calls
  },
  POLYGON: {
    baseUrl: 'https://api.polygon.io/v2',
    key: process.env.POLYGON_API_KEY,
    rateLimit: 5, // calls per minute
    delay: 12000
  },
  FINNHUB: {
    baseUrl: 'https://finnhub.io/api/v1',
    key: process.env.FINNHUB_API_KEY,
    rateLimit: 60, // calls per minute
    delay: 1000
  }
};

// Limites ajustados para ETFs alavancados
const VALIDATION_LIMITS = {
  // ETFs normais vs alavancados
  NORMAL_ETF: {
    returns_12m: { min: -0.95, max: 3.0 }, // -95% a +300%
    volatility_12m: { min: 0.001, max: 1.5 }, // 0.1% a 150%
    sharpe_12m: { min: -15, max: 15 },
    max_drawdown: { min: -0.99, max: -0.001 } // -99% a -0.1%
  },
  LEVERAGED_ETF: {
    returns_12m: { min: -0.99, max: 10.0 }, // -99% a +1000%
    volatility_12m: { min: 0.001, max: 3.0 }, // 0.1% a 300%
    sharpe_12m: { min: -20, max: 20 },
    max_drawdown: { min: -0.999, max: -0.001 } // -99.9% a -0.1%
  }
};

class ETFDataEnricher {
  constructor() {
    this.processedCount = 0;
    this.enrichedCount = 0;
    this.errorCount = 0;
    this.logFile = `logs/enrichment_${new Date().toISOString().split('T')[0]}.log`;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  // Detectar se ETF é alavancado
  isLeveragedETF(symbol, name = '') {
    const leveragedKeywords = [
      '2x', '3x', 'ultra', 'leveraged', 'bull', 'bear', 
      'inverse', 'short', 'double', 'triple', 'proshares ultra',
      'direxion', 'velocityshares', 'microsectors'
    ];
    
    const searchText = `${symbol} ${name}`.toLowerCase();
    return leveragedKeywords.some(keyword => searchText.includes(keyword));
  }

  // Validar dados baseado no tipo de ETF
  validateMetric(value, metric, isLeveraged = false) {
    if (value === null || value === undefined || isNaN(value)) return false;
    
    const limits = isLeveraged ? VALIDATION_LIMITS.LEVERAGED_ETF : VALIDATION_LIMITS.NORMAL_ETF;
    const range = limits[metric];
    
    if (!range) return true; // Se não há limite definido, aceita
    
    return value >= range.min && value <= range.max;
  }

  // Buscar dados do Yahoo Finance
  async fetchYahooFinanceData(symbol) {
    try {
      const url = `${API_CONFIGS.YAHOO_FINANCE.baseUrl}/${symbol}?interval=1mo&range=5y`;
      
      await this.delay(API_CONFIGS.YAHOO_FINANCE.delay);
      
      const response = await axios.get(url, { timeout: 30000 });
      
      if (!response.data.chart || !response.data.chart.result) {
        return null;
      }
      
      return this.parseYahooFinanceData(response.data.chart.result[0], symbol);
      
    } catch (error) {
      this.log(`❌ Yahoo Finance error for ${symbol}: ${error.message}`);
      return null;
    }
  }

  // Parser para Yahoo Finance
  parseYahooFinanceData(data, symbol) {
    try {
      const timestamps = data.timestamp;
      const closes = data.indicators.adjclose[0].adjclose;
      
      if (!timestamps || !closes) return null;
      
      const prices = timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000),
        close: closes[index]
      })).filter(p => p.close !== null);
      
      if (prices.length < 12) return null;
      
      return this.calculateMetrics(prices, symbol);
      
    } catch (error) {
      this.log(`❌ Parse Yahoo Finance error for ${symbol}: ${error.message}`);
      return null;
    }
  }

  // Calcular métricas financeiras
  calculateMetrics(prices, symbol) {
    try {
      const metrics = {};
      
      // Calcular retornos
      const periods = [12, 24, 36, 60, 120]; // meses
      
      for (const period of periods) {
        if (prices.length >= period) {
          const startPrice = prices[prices.length - period].close;
          const endPrice = prices[prices.length - 1].close;
          const returnValue = (endPrice - startPrice) / startPrice;
          
          if (period === 12) metrics.returns_12m = returnValue;
          if (period === 24) metrics.returns_24m = returnValue;
          if (period === 36) metrics.returns_36m = returnValue;
          if (period === 60) metrics.returns_5y = returnValue;
          if (period === 120) metrics.ten_year_return = returnValue;
        }
      }
      
      // Calcular volatilidade
      const monthlyReturns = [];
      for (let i = 1; i < prices.length; i++) {
        const monthlyReturn = (prices[i].close - prices[i-1].close) / prices[i-1].close;
        monthlyReturns.push(monthlyReturn);
      }
      
      if (monthlyReturns.length >= 12) {
        const volatility12m = this.calculateVolatility(monthlyReturns.slice(-12)) * Math.sqrt(12);
        metrics.volatility_12m = volatility12m;
        
        if (metrics.returns_12m !== undefined) {
          // Assumindo risk-free rate de 2% ao ano
          const riskFreeRate = 0.02;
          metrics.sharpe_12m = (metrics.returns_12m - riskFreeRate) / volatility12m;
        }
      }
      
      if (monthlyReturns.length >= 24) {
        metrics.volatility_24m = this.calculateVolatility(monthlyReturns.slice(-24)) * Math.sqrt(12);
        if (metrics.returns_24m !== undefined) {
          metrics.sharpe_24m = (metrics.returns_24m - 0.02) / metrics.volatility_24m;
        }
      }
      
      if (monthlyReturns.length >= 36) {
        metrics.volatility_36m = this.calculateVolatility(monthlyReturns.slice(-36)) * Math.sqrt(12);
        if (metrics.returns_36m !== undefined) {
          metrics.sharpe_36m = (metrics.returns_36m - 0.02) / metrics.volatility_36m;
        }
      }
      
      // Calcular max drawdown
      metrics.max_drawdown = this.calculateMaxDrawdown(prices);
      
      return metrics;
      
    } catch (error) {
      this.log(`❌ Calculate metrics error for ${symbol}: ${error.message}`);
      return null;
    }
  }

  calculateVolatility(returns) {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  calculateMaxDrawdown(prices) {
    let maxDrawdown = 0;
    let peak = prices[0].close;
    
    for (const price of prices) {
      if (price.close > peak) {
        peak = price.close;
      }
      
      const drawdown = (price.close - peak) / peak;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Buscar ETFs que precisam de enriquecimento
  async getETFsToEnrich() {
    try {
      const { data, error } = await supabase
        .from('calculated_metrics_teste')
        .select(`
          symbol,
          returns_12m,
          volatility_12m,
          sharpe_12m,
          max_drawdown,
          dividends_12m
        `)
        .order('symbol');
      
      if (error) throw error;
      
      // Buscar nomes dos ETFs para detectar alavancados
      const { data: etfNames, error: nameError } = await supabase
        .from('etf_list')
        .select('symbol, name')
        .in('symbol', data.map(d => d.symbol));
      
      if (nameError) throw nameError;
      
      const nameMap = etfNames.reduce((acc, etf) => {
        acc[etf.symbol] = etf.name || '';
        return acc;
      }, {});
      
      // Filtrar ETFs que precisam de dados
      const needEnrichment = data.filter(etf => {
        const hasIncompleteData = !etf.returns_12m || !etf.volatility_12m || !etf.sharpe_12m || !etf.max_drawdown;
        const isLeveraged = this.isLeveragedETF(etf.symbol, nameMap[etf.symbol]);
        
        // Validar dados existentes
        if (!hasIncompleteData) {
          const validReturns = this.validateMetric(etf.returns_12m, 'returns_12m', isLeveraged);
          const validVolatility = this.validateMetric(etf.volatility_12m, 'volatility_12m', isLeveraged);
          const validSharpe = this.validateMetric(etf.sharpe_12m, 'sharpe_12m', isLeveraged);
          const validDrawdown = this.validateMetric(etf.max_drawdown, 'max_drawdown', isLeveraged);
          
          if (validReturns && validVolatility && validSharpe && validDrawdown) {
            return false; // Dados válidos, não precisa enriquecer
          }
        }
        
        return true;
      });
      
      this.log(`📊 Total ETFs: ${data.length}, Precisam enriquecimento: ${needEnrichment.length}`);
      
      return needEnrichment.map(etf => ({
        ...etf,
        name: nameMap[etf.symbol] || '',
        isLeveraged: this.isLeveragedETF(etf.symbol, nameMap[etf.symbol])
      }));
      
    } catch (error) {
      this.log(`❌ Error fetching ETFs: ${error.message}`);
      throw error;
    }
  }

  // Enriquecer dados de um ETF
  async enrichETF(etf) {
    try {
      this.log(`🔍 Enriching ${etf.symbol} (${etf.isLeveraged ? 'Leveraged' : 'Normal'})...`);
      
      // Buscar dados do Yahoo Finance
      const enrichedData = await this.fetchYahooFinanceData(etf.symbol);
      
      if (!enrichedData) {
        this.log(`⚠️ No data available for ${etf.symbol}`);
        return null;
      }
      
      // Validar dados enriquecidos
      const validatedData = {};
      for (const [metric, value] of Object.entries(enrichedData)) {
        if (this.validateMetric(value, metric, etf.isLeveraged)) {
          validatedData[metric] = value;
        } else {
          this.log(`⚠️ Invalid ${metric} for ${etf.symbol}: ${value} (${etf.isLeveraged ? 'Leveraged' : 'Normal'})`);
        }
      }
      
      if (Object.keys(validatedData).length === 0) {
        this.log(`⚠️ No valid metrics for ${etf.symbol}`);
        return null;
      }
      
      // Atualizar banco de dados
      const { error } = await supabase
        .from('calculated_metrics_teste')
        .update(validatedData)
        .eq('symbol', etf.symbol);
      
      if (error) {
        this.log(`❌ Database update error for ${etf.symbol}: ${error.message}`);
        return null;
      }
      
      this.log(`✅ Enriched ${etf.symbol}: ${Object.keys(validatedData).join(', ')}`);
      this.enrichedCount++;
      
      return validatedData;
      
    } catch (error) {
      this.log(`❌ Error enriching ${etf.symbol}: ${error.message}`);
      this.errorCount++;
      return null;
    }
  }

  // Executar enriquecimento
  async run() {
    try {
      this.log('🚀 Starting ETF data enrichment...');
      
      const etfsToEnrich = await this.getETFsToEnrich();
      
      if (etfsToEnrich.length === 0) {
        this.log('✅ All ETFs already have valid data');
        return;
      }
      
      this.log(`📊 Processing ${etfsToEnrich.length} ETFs...`);
      
      // Processar em lotes para respeitar rate limits
      const batchSize = 10;
      for (let i = 0; i < etfsToEnrich.length; i += batchSize) {
        const batch = etfsToEnrich.slice(i, i + batchSize);
        
        this.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(etfsToEnrich.length/batchSize)}`);
        
        for (const etf of batch) {
          await this.enrichETF(etf);
          this.processedCount++;
          
          // Progress report
          if (this.processedCount % 50 === 0) {
            this.log(`📈 Progress: ${this.processedCount}/${etfsToEnrich.length} (${((this.processedCount/etfsToEnrich.length)*100).toFixed(1)}%)`);
          }
        }
        
        // Delay between batches
        if (i + batchSize < etfsToEnrich.length) {
          this.log('⏳ Waiting between batches...');
          await this.delay(10000); // 10 seconds
        }
      }
      
      this.log(`🎉 Enrichment completed!`);
      this.log(`📊 Summary: ${this.processedCount} processed, ${this.enrichedCount} enriched, ${this.errorCount} errors`);
      
    } catch (error) {
      this.log(`❌ Fatal error: ${error.message}`);
      throw error;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const enricher = new ETFDataEnricher();
  enricher.run().catch(console.error);
}

module.exports = ETFDataEnricher; 