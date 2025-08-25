/**
 * COLETOR DE DADOS VIA YFINANCE
 * 
 * Este módulo é responsável por coletar dados de ETFs usando a API do Yahoo Finance.
 * É a fonte primária de dados devido à sua confiabilidade e abrangência.
 */

import { DATA_SOURCES, YFINANCE_FIELD_MAPPING, REQUIRED_FIELDS } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Classe principal para coleta de dados via yfinance
 */
export class YFinanceCollector {
  constructor() {
    this.baseUrl = DATA_SOURCES.yfinance.baseUrl;
    this.timeout = DATA_SOURCES.yfinance.timeout;
    this.enabled = DATA_SOURCES.yfinance.enabled;
  }

  /**
   * Coleta dados completos de um ETF via yfinance
   * 
   * @param {string} symbol - Símbolo do ETF (ex: 'SPY')
   * @returns {Promise<Object>} Dados coletados do ETF
   */
  async collectEtfData(symbol) {
    if (!this.enabled) {
      throw new Error('YFinance collector está desabilitado');
    }

    logger.debug(`Coletando dados via yfinance para ${symbol}`);

    try {
      // Simular chamada para yfinance (em produção, usaria a API real)
      const etfData = await this.fetchYFinanceData(symbol);
      
      if (!etfData || !this.isValidEtfData(etfData)) {
        throw new Error('Dados inválidos ou ETF não encontrado');
      }

      // Mapear campos do yfinance para nossa estrutura
      const mappedData = this.mapYFinanceFields(etfData);
      
      // Enriquecer com dados calculados
      const enrichedData = this.enrichWithCalculatedFields(mappedData, etfData);
      
      logger.debug(`Dados coletados com sucesso para ${symbol}`, {
        fieldsCollected: Object.keys(enrichedData).length
      });

      return {
        success: true,
        symbol,
        data: enrichedData,
        source: 'yfinance',
        fieldsCollected: Object.keys(enrichedData),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Erro ao coletar dados via yfinance para ${symbol}`, error);
      
      return {
        success: false,
        symbol,
        error: error.message,
        source: 'yfinance',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simula a busca de dados no yfinance
   * Em produção, esta função faria a chamada real para a API
   */
  async fetchYFinanceData(symbol) {
    // Simular delay de rede
    await this.delay(100 + Math.random() * 500);

    // Simular dados do yfinance baseados em padrões reais
    const mockData = this.generateMockYFinanceData(symbol);
    
    // Simular alguns ETFs que não existem (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('ETF não encontrado no yfinance');
    }

    return mockData;
  }

  /**
   * Gera dados mock baseados em estruturas reais do yfinance
   */
  generateMockYFinanceData(symbol) {
    const isLargeEtf = ['SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'VWO'].includes(symbol);
    const baseAssets = isLargeEtf ? 100000000000 : 1000000000; // 100B ou 1B
    
    return {
      symbol: symbol,
      longName: this.generateEtfName(symbol),
      longBusinessSummary: `The ${symbol} ETF seeks to track the performance of its underlying index by investing in a diversified portfolio of securities.`,
      isin: this.generateISIN(symbol),
      category: this.getRandomCategory(),
      domicile: 'US',
      website: `https://www.${symbol.toLowerCase()}.com`,
      fundFamily: this.getRandomFundFamily(),
      annualReportExpenseRatio: 0.0003 + Math.random() * 0.015, // 0.03% a 1.5%
      totalAssets: baseAssets * (0.1 + Math.random() * 2), // Variação de assets
      averageVolume: Math.floor(1000000 + Math.random() * 50000000), // 1M a 50M
      fundInceptionDate: this.getRandomInceptionDate(),
      navPrice: 20 + Math.random() * 300, // $20 a $320
      currency: 'USD',
      holdingsCount: Math.floor(50 + Math.random() * 500), // 50 a 550 holdings
      
      // Dados de performance (últimos 12 meses)
      ytdReturn: -0.1 + Math.random() * 0.4, // -10% a +30%
      oneYearReturn: -0.15 + Math.random() * 0.5, // -15% a +35%
      threeYearReturn: 0.05 + Math.random() * 0.15, // 5% a 20% anualizado
      fiveYearReturn: 0.06 + Math.random() * 0.12, // 6% a 18% anualizado
      
      // Dados de risco
      beta: 0.5 + Math.random() * 1.5, // Beta de 0.5 a 2.0
      standardDeviation: 0.1 + Math.random() * 0.3, // 10% a 40% volatilidade
      
      // Dividendos
      dividendYield: Math.random() * 0.05, // 0% a 5%
      lastDividendValue: Math.random() * 2, // $0 a $2
      
      // Setores (para ETFs diversificados)
      sectorWeightings: this.generateSectorWeightings(),
      
      // Holdings principais
      topHoldings: this.generateTopHoldings(symbol)
    };
  }

  /**
   * Valida se os dados do ETF são válidos
   */
  isValidEtfData(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Verificar campos obrigatórios
    for (const field of REQUIRED_FIELDS) {
      const yfinanceField = Object.keys(YFINANCE_FIELD_MAPPING).find(
        key => YFINANCE_FIELD_MAPPING[key] === field
      );
      
      if (yfinanceField && !data[yfinanceField]) {
        logger.debug(`Campo obrigatório ausente: ${yfinanceField} -> ${field}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Mapeia campos do yfinance para nossa estrutura de dados
   */
  mapYFinanceFields(yfinanceData) {
    const mappedData = {};
    
    // Mapear campos básicos
    for (const [yfinanceField, ourField] of Object.entries(YFINANCE_FIELD_MAPPING)) {
      if (yfinanceData[yfinanceField] !== undefined) {
        mappedData[ourField] = yfinanceData[yfinanceField];
      }
    }
    
    // Tratamentos especiais
    if (yfinanceData.fundInceptionDate) {
      mappedData.inceptiondate = this.formatDate(yfinanceData.fundInceptionDate);
    }
    
    if (yfinanceData.annualReportExpenseRatio) {
      mappedData.expenseratio = Math.round(yfinanceData.annualReportExpenseRatio * 10000) / 10000;
    }
    
    return mappedData;
  }

  /**
   * Enriquece dados com campos calculados e adicionais
   */
  enrichWithCalculatedFields(mappedData, rawData) {
    const enriched = { ...mappedData };
    
    // Calcular retornos baseados nos dados disponíveis
    if (rawData.ytdReturn) {
      enriched.returns_12m = Math.round(rawData.ytdReturn * 10000) / 10000;
    }
    
    if (rawData.threeYearReturn) {
      enriched.returns_36m = Math.round(rawData.threeYearReturn * 10000) / 10000;
    }
    
    if (rawData.fiveYearReturn) {
      enriched.returns_5y = Math.round(rawData.fiveYearReturn * 10000) / 10000;
    }
    
    // Calcular volatilidade
    if (rawData.standardDeviation) {
      enriched.volatility_12m = Math.round(rawData.standardDeviation * 10000) / 10000;
    }
    
    // Calcular Sharpe ratio (aproximado)
    if (rawData.oneYearReturn && rawData.standardDeviation) {
      const riskFreeRate = 0.05; // 5% como taxa livre de risco
      enriched.sharpe_12m = Math.round(((rawData.oneYearReturn - riskFreeRate) / rawData.standardDeviation) * 100) / 100;
    }
    
    // Dividendos
    if (rawData.dividendYield) {
      enriched.dividends_12m = Math.round(rawData.dividendYield * 10000) / 10000;
    }
    
    // Categorização
    enriched.size_category = this.categorizeSizeByAssets(rawData.totalAssets);
    enriched.liquidity_category = this.categorizeLiquidityByVolume(rawData.averageVolume);
    enriched.etf_type = this.categorizeEtfType(rawData.longName, rawData.category);
    
    // Setores em formato JSON
    if (rawData.sectorWeightings) {
      enriched.sectorslist = rawData.sectorWeightings;
    }
    
    return enriched;
  }

  /**
   * Categoriza ETF por tamanho baseado nos assets
   */
  categorizeSizeByAssets(assets) {
    if (!assets) return null;
    
    if (assets >= 10000000000) return 'Large'; // >= $10B
    if (assets >= 1000000000) return 'Medium'; // >= $1B
    if (assets >= 100000000) return 'Small'; // >= $100M
    return 'Micro'; // < $100M
  }

  /**
   * Categoriza liquidez por volume
   */
  categorizeLiquidityByVolume(volume) {
    if (!volume) return null;
    
    if (volume >= 10000000) return 'High'; // >= 10M
    if (volume >= 1000000) return 'Medium'; // >= 1M
    if (volume >= 100000) return 'Low'; // >= 100K
    return 'Very Low'; // < 100K
  }

  /**
   * Categoriza tipo de ETF
   */
  categorizeEtfType(name, category) {
    if (!name) return null;
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('bond') || nameLower.includes('fixed income')) return 'Bond';
    if (nameLower.includes('commodity') || nameLower.includes('gold') || nameLower.includes('oil')) return 'Commodity';
    if (nameLower.includes('international') || nameLower.includes('emerging')) return 'International';
    if (nameLower.includes('sector') || nameLower.includes('industry')) return 'Sector';
    if (nameLower.includes('growth')) return 'Growth';
    if (nameLower.includes('value')) return 'Value';
    if (nameLower.includes('dividend')) return 'Dividend';
    
    return 'Broad Market';
  }

  // Funções auxiliares para geração de dados mock
  generateEtfName(symbol) {
    const prefixes = ['SPDR', 'iShares', 'Vanguard', 'Invesco', 'First Trust', 'Global X'];
    const types = ['S&P 500', 'Total Market', 'Growth', 'Value', 'International', 'Emerging Markets'];
    const suffixes = ['ETF', 'Fund', 'Index Fund'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${types[Math.floor(Math.random() * types.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  generateISIN(symbol) {
    return `US${symbol.padEnd(7, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  }

  getRandomCategory() {
    const categories = ['Large Blend', 'Large Growth', 'Large Value', 'Mid-Cap Blend', 'Small Blend', 'International', 'Emerging Markets', 'Bond'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  getRandomFundFamily() {
    const families = ['State Street Global Advisors', 'BlackRock', 'Vanguard', 'Invesco', 'First Trust', 'Global X'];
    return families[Math.floor(Math.random() * families.length)];
  }

  getRandomInceptionDate() {
    const start = new Date(2000, 0, 1);
    const end = new Date(2023, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  generateSectorWeightings() {
    const sectors = [
      'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
      'Communication Services', 'Industrials', 'Consumer Defensive',
      'Energy', 'Real Estate', 'Basic Materials', 'Utilities'
    ];
    
    const weightings = {};
    let totalWeight = 0;
    
    // Gerar pesos aleatórios
    sectors.forEach(sector => {
      const weight = Math.random() * 20; // 0-20%
      weightings[sector] = Math.round(weight * 100) / 100;
      totalWeight += weight;
    });
    
    // Normalizar para 100%
    const factor = 100 / totalWeight;
    Object.keys(weightings).forEach(sector => {
      weightings[sector] = Math.round(weightings[sector] * factor * 100) / 100;
    });
    
    return weightings;
  }

  generateTopHoldings(symbol) {
    const companies = [
      'Apple Inc', 'Microsoft Corp', 'Amazon.com Inc', 'NVIDIA Corp',
      'Alphabet Inc', 'Tesla Inc', 'Meta Platforms Inc', 'Berkshire Hathaway'
    ];
    
    return companies.slice(0, 5).map((company, index) => ({
      name: company,
      weight: Math.round((10 - index * 1.5) * 100) / 100 // Decrescente de ~10%
    }));
  }

  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância singleton
export const yfinanceCollector = new YFinanceCollector();

export default yfinanceCollector; 
 * COLETOR DE DADOS VIA YFINANCE
 * 
 * Este módulo é responsável por coletar dados de ETFs usando a API do Yahoo Finance.
 * É a fonte primária de dados devido à sua confiabilidade e abrangência.
 */

import { DATA_SOURCES, YFINANCE_FIELD_MAPPING, REQUIRED_FIELDS } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Classe principal para coleta de dados via yfinance
 */
export class YFinanceCollector {
  constructor() {
    this.baseUrl = DATA_SOURCES.yfinance.baseUrl;
    this.timeout = DATA_SOURCES.yfinance.timeout;
    this.enabled = DATA_SOURCES.yfinance.enabled;
  }

  /**
   * Coleta dados completos de um ETF via yfinance
   * 
   * @param {string} symbol - Símbolo do ETF (ex: 'SPY')
   * @returns {Promise<Object>} Dados coletados do ETF
   */
  async collectEtfData(symbol) {
    if (!this.enabled) {
      throw new Error('YFinance collector está desabilitado');
    }

    logger.debug(`Coletando dados via yfinance para ${symbol}`);

    try {
      // Simular chamada para yfinance (em produção, usaria a API real)
      const etfData = await this.fetchYFinanceData(symbol);
      
      if (!etfData || !this.isValidEtfData(etfData)) {
        throw new Error('Dados inválidos ou ETF não encontrado');
      }

      // Mapear campos do yfinance para nossa estrutura
      const mappedData = this.mapYFinanceFields(etfData);
      
      // Enriquecer com dados calculados
      const enrichedData = this.enrichWithCalculatedFields(mappedData, etfData);
      
      logger.debug(`Dados coletados com sucesso para ${symbol}`, {
        fieldsCollected: Object.keys(enrichedData).length
      });

      return {
        success: true,
        symbol,
        data: enrichedData,
        source: 'yfinance',
        fieldsCollected: Object.keys(enrichedData),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Erro ao coletar dados via yfinance para ${symbol}`, error);
      
      return {
        success: false,
        symbol,
        error: error.message,
        source: 'yfinance',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simula a busca de dados no yfinance
   * Em produção, esta função faria a chamada real para a API
   */
  async fetchYFinanceData(symbol) {
    // Simular delay de rede
    await this.delay(100 + Math.random() * 500);

    // Simular dados do yfinance baseados em padrões reais
    const mockData = this.generateMockYFinanceData(symbol);
    
    // Simular alguns ETFs que não existem (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('ETF não encontrado no yfinance');
    }

    return mockData;
  }

  /**
   * Gera dados mock baseados em estruturas reais do yfinance
   */
  generateMockYFinanceData(symbol) {
    const isLargeEtf = ['SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'VWO'].includes(symbol);
    const baseAssets = isLargeEtf ? 100000000000 : 1000000000; // 100B ou 1B
    
    return {
      symbol: symbol,
      longName: this.generateEtfName(symbol),
      longBusinessSummary: `The ${symbol} ETF seeks to track the performance of its underlying index by investing in a diversified portfolio of securities.`,
      isin: this.generateISIN(symbol),
      category: this.getRandomCategory(),
      domicile: 'US',
      website: `https://www.${symbol.toLowerCase()}.com`,
      fundFamily: this.getRandomFundFamily(),
      annualReportExpenseRatio: 0.0003 + Math.random() * 0.015, // 0.03% a 1.5%
      totalAssets: baseAssets * (0.1 + Math.random() * 2), // Variação de assets
      averageVolume: Math.floor(1000000 + Math.random() * 50000000), // 1M a 50M
      fundInceptionDate: this.getRandomInceptionDate(),
      navPrice: 20 + Math.random() * 300, // $20 a $320
      currency: 'USD',
      holdingsCount: Math.floor(50 + Math.random() * 500), // 50 a 550 holdings
      
      // Dados de performance (últimos 12 meses)
      ytdReturn: -0.1 + Math.random() * 0.4, // -10% a +30%
      oneYearReturn: -0.15 + Math.random() * 0.5, // -15% a +35%
      threeYearReturn: 0.05 + Math.random() * 0.15, // 5% a 20% anualizado
      fiveYearReturn: 0.06 + Math.random() * 0.12, // 6% a 18% anualizado
      
      // Dados de risco
      beta: 0.5 + Math.random() * 1.5, // Beta de 0.5 a 2.0
      standardDeviation: 0.1 + Math.random() * 0.3, // 10% a 40% volatilidade
      
      // Dividendos
      dividendYield: Math.random() * 0.05, // 0% a 5%
      lastDividendValue: Math.random() * 2, // $0 a $2
      
      // Setores (para ETFs diversificados)
      sectorWeightings: this.generateSectorWeightings(),
      
      // Holdings principais
      topHoldings: this.generateTopHoldings(symbol)
    };
  }

  /**
   * Valida se os dados do ETF são válidos
   */
  isValidEtfData(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Verificar campos obrigatórios
    for (const field of REQUIRED_FIELDS) {
      const yfinanceField = Object.keys(YFINANCE_FIELD_MAPPING).find(
        key => YFINANCE_FIELD_MAPPING[key] === field
      );
      
      if (yfinanceField && !data[yfinanceField]) {
        logger.debug(`Campo obrigatório ausente: ${yfinanceField} -> ${field}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Mapeia campos do yfinance para nossa estrutura de dados
   */
  mapYFinanceFields(yfinanceData) {
    const mappedData = {};
    
    // Mapear campos básicos
    for (const [yfinanceField, ourField] of Object.entries(YFINANCE_FIELD_MAPPING)) {
      if (yfinanceData[yfinanceField] !== undefined) {
        mappedData[ourField] = yfinanceData[yfinanceField];
      }
    }
    
    // Tratamentos especiais
    if (yfinanceData.fundInceptionDate) {
      mappedData.inceptiondate = this.formatDate(yfinanceData.fundInceptionDate);
    }
    
    if (yfinanceData.annualReportExpenseRatio) {
      mappedData.expenseratio = Math.round(yfinanceData.annualReportExpenseRatio * 10000) / 10000;
    }
    
    return mappedData;
  }

  /**
   * Enriquece dados com campos calculados e adicionais
   */
  enrichWithCalculatedFields(mappedData, rawData) {
    const enriched = { ...mappedData };
    
    // Calcular retornos baseados nos dados disponíveis
    if (rawData.ytdReturn) {
      enriched.returns_12m = Math.round(rawData.ytdReturn * 10000) / 10000;
    }
    
    if (rawData.threeYearReturn) {
      enriched.returns_36m = Math.round(rawData.threeYearReturn * 10000) / 10000;
    }
    
    if (rawData.fiveYearReturn) {
      enriched.returns_5y = Math.round(rawData.fiveYearReturn * 10000) / 10000;
    }
    
    // Calcular volatilidade
    if (rawData.standardDeviation) {
      enriched.volatility_12m = Math.round(rawData.standardDeviation * 10000) / 10000;
    }
    
    // Calcular Sharpe ratio (aproximado)
    if (rawData.oneYearReturn && rawData.standardDeviation) {
      const riskFreeRate = 0.05; // 5% como taxa livre de risco
      enriched.sharpe_12m = Math.round(((rawData.oneYearReturn - riskFreeRate) / rawData.standardDeviation) * 100) / 100;
    }
    
    // Dividendos
    if (rawData.dividendYield) {
      enriched.dividends_12m = Math.round(rawData.dividendYield * 10000) / 10000;
    }
    
    // Categorização
    enriched.size_category = this.categorizeSizeByAssets(rawData.totalAssets);
    enriched.liquidity_category = this.categorizeLiquidityByVolume(rawData.averageVolume);
    enriched.etf_type = this.categorizeEtfType(rawData.longName, rawData.category);
    
    // Setores em formato JSON
    if (rawData.sectorWeightings) {
      enriched.sectorslist = rawData.sectorWeightings;
    }
    
    return enriched;
  }

  /**
   * Categoriza ETF por tamanho baseado nos assets
   */
  categorizeSizeByAssets(assets) {
    if (!assets) return null;
    
    if (assets >= 10000000000) return 'Large'; // >= $10B
    if (assets >= 1000000000) return 'Medium'; // >= $1B
    if (assets >= 100000000) return 'Small'; // >= $100M
    return 'Micro'; // < $100M
  }

  /**
   * Categoriza liquidez por volume
   */
  categorizeLiquidityByVolume(volume) {
    if (!volume) return null;
    
    if (volume >= 10000000) return 'High'; // >= 10M
    if (volume >= 1000000) return 'Medium'; // >= 1M
    if (volume >= 100000) return 'Low'; // >= 100K
    return 'Very Low'; // < 100K
  }

  /**
   * Categoriza tipo de ETF
   */
  categorizeEtfType(name, category) {
    if (!name) return null;
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('bond') || nameLower.includes('fixed income')) return 'Bond';
    if (nameLower.includes('commodity') || nameLower.includes('gold') || nameLower.includes('oil')) return 'Commodity';
    if (nameLower.includes('international') || nameLower.includes('emerging')) return 'International';
    if (nameLower.includes('sector') || nameLower.includes('industry')) return 'Sector';
    if (nameLower.includes('growth')) return 'Growth';
    if (nameLower.includes('value')) return 'Value';
    if (nameLower.includes('dividend')) return 'Dividend';
    
    return 'Broad Market';
  }

  // Funções auxiliares para geração de dados mock
  generateEtfName(symbol) {
    const prefixes = ['SPDR', 'iShares', 'Vanguard', 'Invesco', 'First Trust', 'Global X'];
    const types = ['S&P 500', 'Total Market', 'Growth', 'Value', 'International', 'Emerging Markets'];
    const suffixes = ['ETF', 'Fund', 'Index Fund'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${types[Math.floor(Math.random() * types.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  generateISIN(symbol) {
    return `US${symbol.padEnd(7, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  }

  getRandomCategory() {
    const categories = ['Large Blend', 'Large Growth', 'Large Value', 'Mid-Cap Blend', 'Small Blend', 'International', 'Emerging Markets', 'Bond'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  getRandomFundFamily() {
    const families = ['State Street Global Advisors', 'BlackRock', 'Vanguard', 'Invesco', 'First Trust', 'Global X'];
    return families[Math.floor(Math.random() * families.length)];
  }

  getRandomInceptionDate() {
    const start = new Date(2000, 0, 1);
    const end = new Date(2023, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  generateSectorWeightings() {
    const sectors = [
      'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
      'Communication Services', 'Industrials', 'Consumer Defensive',
      'Energy', 'Real Estate', 'Basic Materials', 'Utilities'
    ];
    
    const weightings = {};
    let totalWeight = 0;
    
    // Gerar pesos aleatórios
    sectors.forEach(sector => {
      const weight = Math.random() * 20; // 0-20%
      weightings[sector] = Math.round(weight * 100) / 100;
      totalWeight += weight;
    });
    
    // Normalizar para 100%
    const factor = 100 / totalWeight;
    Object.keys(weightings).forEach(sector => {
      weightings[sector] = Math.round(weightings[sector] * factor * 100) / 100;
    });
    
    return weightings;
  }

  generateTopHoldings(symbol) {
    const companies = [
      'Apple Inc', 'Microsoft Corp', 'Amazon.com Inc', 'NVIDIA Corp',
      'Alphabet Inc', 'Tesla Inc', 'Meta Platforms Inc', 'Berkshire Hathaway'
    ];
    
    return companies.slice(0, 5).map((company, index) => ({
      name: company,
      weight: Math.round((10 - index * 1.5) * 100) / 100 // Decrescente de ~10%
    }));
  }

  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância singleton
export const yfinanceCollector = new YFinanceCollector();

export default yfinanceCollector; 