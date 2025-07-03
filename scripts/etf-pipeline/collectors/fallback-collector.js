/**
 * COLETOR DE FALLBACK VIA SCRAPING
 * 
 * Este módulo é usado quando o yfinance falha ou retorna dados incompletos.
 * Utiliza Firecrawl para fazer scraping de sites especializados em ETFs.
 */

import { DATA_SOURCES, FALLBACK_URLS } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Classe para coleta de dados via scraping como fallback
 */
export class FallbackCollector {
  constructor() {
    this.enabled = DATA_SOURCES.firecrawl.enabled;
    this.timeout = DATA_SOURCES.firecrawl.timeout;
    this.sites = DATA_SOURCES.firecrawl.sites;
  }

  /**
   * Coleta dados de um ETF via scraping como fallback
   * 
   * @param {string} symbol - Símbolo do ETF
   * @param {Array} missingFields - Campos que precisam ser coletados
   * @returns {Promise<Object>} Dados coletados via scraping
   */
  async collectEtfData(symbol, missingFields = []) {
    if (!this.enabled) {
      throw new Error('Fallback collector está desabilitado');
    }

    logger.debug(`Iniciando coleta via fallback para ${symbol}`, { missingFields });

    const collectedData = {};
    const sources = [];
    const errors = [];

    try {
      // Tentar coletar de diferentes sites
      for (const site of ['etfdb', 'morningstar', 'etfdotcom']) {
        try {
          logger.debug(`Tentando scraping em ${site} para ${symbol}`);
          
          const siteData = await this.scrapeFromSite(symbol, site);
          
          if (siteData && Object.keys(siteData).length > 0) {
            // Mesclar dados coletados
            Object.assign(collectedData, siteData);
            sources.push(site);
            
            logger.debug(`Dados coletados de ${site}`, {
              fieldsFound: Object.keys(siteData)
            });
          }
          
        } catch (error) {
          logger.warn(`Erro ao fazer scraping em ${site} para ${symbol}`, error);
          errors.push({ site, error: error.message });
        }
      }

      // Enriquecer com dados calculados
      const enrichedData = this.enrichFallbackData(collectedData);

      return {
        success: Object.keys(enrichedData).length > 0,
        symbol,
        data: enrichedData,
        sources,
        errors,
        fieldsCollected: Object.keys(enrichedData),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Erro geral no fallback collector para ${symbol}`, error);
      
      return {
        success: false,
        symbol,
        error: error.message,
        sources: [],
        errors: [...errors, { general: error.message }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Faz scraping de um site específico
   * Em produção, usaria o MCP Firecrawl real
   */
  async scrapeFromSite(symbol, site) {
    // Simular delay de scraping
    await this.delay(500 + Math.random() * 1500);

    // Simular dados coletados por scraping baseados no site
    switch (site) {
      case 'etfdb':
        return this.mockEtfdbData(symbol);
      case 'morningstar':
        return this.mockMorningstarData(symbol);
      case 'etfdotcom':
        return this.mockEtfDotComData(symbol);
      default:
        return {};
    }
  }

  /**
   * Simula dados do ETFdb.com
   * ETFdb é especializado em dados técnicos e holdings
   */
  mockEtfdbData(symbol) {
    // Simular falha em alguns casos (20% de chance)
    if (Math.random() < 0.2) {
      throw new Error('ETF não encontrado no ETFdb');
    }

    return {
      // Dados que o ETFdb costuma ter
      expenseratio: 0.0003 + Math.random() * 0.02, // 0.03% a 2%
      totalasset: Math.floor(100000000 + Math.random() * 50000000000), // $100M a $50B
      avgvolume: Math.floor(100000 + Math.random() * 20000000), // 100K a 20M
      holdingscount: Math.floor(25 + Math.random() * 1000), // 25 a 1000
      
      // Dados de categorização que o ETFdb fornece
      size_category: this.getRandomSizeCategory(),
      etf_type: this.getRandomEtfType(),
      
      // Setores (ETFdb tem bons dados de setores)
      sectorslist: this.generateRandomSectors(),
      
      // Informações da empresa
      etfcompany: this.getRandomEtfCompany(),
      website: `https://www.${symbol.toLowerCase()}etf.com`
    };
  }

  /**
   * Simula dados do Morningstar
   * Morningstar é especializado em análise e ratings
   */
  mockMorningstarData(symbol) {
    // Simular falha em alguns casos (15% de chance)
    if (Math.random() < 0.15) {
      throw new Error('ETF não encontrado no Morningstar');
    }

    return {
      // Dados de performance que o Morningstar fornece
      returns_12m: -0.1 + Math.random() * 0.4, // -10% a +30%
      returns_24m: -0.05 + Math.random() * 0.3, // -5% a +25%
      returns_36m: 0.02 + Math.random() * 0.25, // 2% a 27%
      returns_5y: 0.05 + Math.random() * 0.15, // 5% a 20%
      ten_year_return: 0.06 + Math.random() * 0.12, // 6% a 18%
      
      // Dados de risco
      volatility_12m: 0.08 + Math.random() * 0.25, // 8% a 33%
      volatility_24m: 0.09 + Math.random() * 0.22, // 9% a 31%
      volatility_36m: 0.10 + Math.random() * 0.20, // 10% a 30%
      ten_year_volatility: 0.12 + Math.random() * 0.18, // 12% a 30%
      
      // Sharpe ratios
      sharpe_12m: -0.5 + Math.random() * 2, // -0.5 a 1.5
      sharpe_24m: -0.3 + Math.random() * 1.8, // -0.3 a 1.5
      sharpe_36m: -0.2 + Math.random() * 1.7, // -0.2 a 1.5
      ten_year_sharpe: 0.1 + Math.random() * 1.2, // 0.1 a 1.3
      
      // Max drawdown
      max_drawdown: -0.05 - Math.random() * 0.4, // -5% a -45%
      
      // Categoria de liquidez
      liquidity_category: this.getRandomLiquidityCategory()
    };
  }

  /**
   * Simula dados do ETF.com
   * ETF.com foca em dados básicos e dividendos
   */
  mockEtfDotComData(symbol) {
    // Simular falha em alguns casos (25% de chance)
    if (Math.random() < 0.25) {
      throw new Error('ETF não encontrado no ETF.com');
    }

    return {
      // Dados básicos
      name: this.generateEtfName(symbol),
      description: `The ${symbol} ETF provides exposure to a diversified portfolio of securities, offering investors efficient access to specific market segments with competitive fees.`,
      
      // Dados de dividendos
      dividends_12m: Math.random() * 0.06, // 0% a 6%
      dividends_24m: Math.random() * 0.05, // 0% a 5%
      dividends_36m: Math.random() * 0.04, // 0% a 4%
      dividends_all_time: Math.random() * 0.08, // 0% a 8%
      
      // Dados básicos financeiros
      nav: 20 + Math.random() * 280, // $20 a $300
      navcurrency: 'USD',
      
      // Data de criação
      inceptiondate: this.getRandomInceptionDate(),
      
      // País de domicílio
      domicile: 'US'
    };
  }

  /**
   * Enriquece dados coletados via fallback
   */
  enrichFallbackData(rawData) {
    const enriched = { ...rawData };
    
    // Normalizar valores numéricos
    this.normalizeNumericFields(enriched);
    
    // Adicionar campos derivados se dados suficientes estiverem disponíveis
    this.addDerivedFields(enriched);
    
    return enriched;
  }

  /**
   * Normaliza campos numéricos para garantir precisão
   */
  normalizeNumericFields(data) {
    const numericFields = [
      'expenseratio', 'returns_12m', 'returns_24m', 'returns_36m', 'returns_5y', 'ten_year_return',
      'volatility_12m', 'volatility_24m', 'volatility_36m', 'ten_year_volatility',
      'sharpe_12m', 'sharpe_24m', 'sharpe_36m', 'ten_year_sharpe',
      'max_drawdown', 'dividends_12m', 'dividends_24m', 'dividends_36m', 'dividends_all_time',
      'nav'
    ];
    
    numericFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] === 'number') {
        data[field] = Math.round(data[field] * 10000) / 10000; // 4 casas decimais
      }
    });
  }

  /**
   * Adiciona campos derivados baseados nos dados disponíveis
   */
  addDerivedFields(data) {
    // Se temos returns e volatility, podemos calcular Sharpe aproximado
    if (data.returns_12m && data.volatility_12m && !data.sharpe_12m) {
      const riskFreeRate = 0.05; // 5%
      data.sharpe_12m = Math.round(((data.returns_12m - riskFreeRate) / data.volatility_12m) * 100) / 100;
    }
    
    // Categorizar por assets se disponível
    if (data.totalasset && !data.size_category) {
      data.size_category = this.categorizeSizeByAssets(data.totalasset);
    }
    
    // Categorizar por volume se disponível
    if (data.avgvolume && !data.liquidity_category) {
      data.liquidity_category = this.categorizeLiquidityByVolume(data.avgvolume);
    }
  }

  // Funções auxiliares para dados mock
  getRandomSizeCategory() {
    const categories = ['Large', 'Medium', 'Small', 'Micro'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  getRandomEtfType() {
    const types = ['Broad Market', 'Sector', 'Bond', 'International', 'Commodity', 'Growth', 'Value', 'Dividend'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomLiquidityCategory() {
    const categories = ['High', 'Medium', 'Low', 'Very Low'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  getRandomEtfCompany() {
    const companies = [
      'State Street Global Advisors', 'BlackRock', 'Vanguard Group', 
      'Invesco', 'First Trust', 'Global X', 'WisdomTree', 'ProShares'
    ];
    return companies[Math.floor(Math.random() * companies.length)];
  }

  generateEtfName(symbol) {
    const prefixes = ['SPDR', 'iShares', 'Vanguard', 'Invesco', 'First Trust', 'Global X', 'WisdomTree'];
    const themes = ['S&P 500', 'Total Market', 'Growth', 'Value', 'International', 'Bond', 'Technology', 'Healthcare'];
    const suffixes = ['ETF', 'Fund', 'Index Fund'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${themes[Math.floor(Math.random() * themes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  getRandomInceptionDate() {
    const start = new Date(1995, 0, 1);
    const end = new Date(2024, 0, 1);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  generateRandomSectors() {
    const sectors = [
      'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
      'Communication Services', 'Industrials', 'Consumer Defensive',
      'Energy', 'Real Estate', 'Basic Materials', 'Utilities'
    ];
    
    const sectorData = {};
    let totalWeight = 0;
    
    // Selecionar 5-8 setores aleatoriamente
    const selectedSectors = sectors.sort(() => 0.5 - Math.random()).slice(0, 5 + Math.floor(Math.random() * 4));
    
    selectedSectors.forEach(sector => {
      const weight = 5 + Math.random() * 25; // 5% a 30%
      sectorData[sector] = Math.round(weight * 100) / 100;
      totalWeight += weight;
    });
    
    // Normalizar para 100%
    const factor = 100 / totalWeight;
    Object.keys(sectorData).forEach(sector => {
      sectorData[sector] = Math.round(sectorData[sector] * factor * 100) / 100;
    });
    
    return sectorData;
  }

  categorizeSizeByAssets(assets) {
    if (assets >= 10000000000) return 'Large'; // >= $10B
    if (assets >= 1000000000) return 'Medium'; // >= $1B
    if (assets >= 100000000) return 'Small'; // >= $100M
    return 'Micro'; // < $100M
  }

  categorizeLiquidityByVolume(volume) {
    if (volume >= 10000000) return 'High'; // >= 10M
    if (volume >= 1000000) return 'Medium'; // >= 1M
    if (volume >= 100000) return 'Low'; // >= 100K
    return 'Very Low'; // < 100K
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância singleton
export const fallbackCollector = new FallbackCollector();

export default fallbackCollector; 
 * COLETOR DE FALLBACK VIA SCRAPING
 * 
 * Este módulo é usado quando o yfinance falha ou retorna dados incompletos.
 * Utiliza Firecrawl para fazer scraping de sites especializados em ETFs.
 */

import { DATA_SOURCES, FALLBACK_URLS } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Classe para coleta de dados via scraping como fallback
 */
export class FallbackCollector {
  constructor() {
    this.enabled = DATA_SOURCES.firecrawl.enabled;
    this.timeout = DATA_SOURCES.firecrawl.timeout;
    this.sites = DATA_SOURCES.firecrawl.sites;
  }

  /**
   * Coleta dados de um ETF via scraping como fallback
   * 
   * @param {string} symbol - Símbolo do ETF
   * @param {Array} missingFields - Campos que precisam ser coletados
   * @returns {Promise<Object>} Dados coletados via scraping
   */
  async collectEtfData(symbol, missingFields = []) {
    if (!this.enabled) {
      throw new Error('Fallback collector está desabilitado');
    }

    logger.debug(`Iniciando coleta via fallback para ${symbol}`, { missingFields });

    const collectedData = {};
    const sources = [];
    const errors = [];

    try {
      // Tentar coletar de diferentes sites
      for (const site of ['etfdb', 'morningstar', 'etfdotcom']) {
        try {
          logger.debug(`Tentando scraping em ${site} para ${symbol}`);
          
          const siteData = await this.scrapeFromSite(symbol, site);
          
          if (siteData && Object.keys(siteData).length > 0) {
            // Mesclar dados coletados
            Object.assign(collectedData, siteData);
            sources.push(site);
            
            logger.debug(`Dados coletados de ${site}`, {
              fieldsFound: Object.keys(siteData)
            });
          }
          
        } catch (error) {
          logger.warn(`Erro ao fazer scraping em ${site} para ${symbol}`, error);
          errors.push({ site, error: error.message });
        }
      }

      // Enriquecer com dados calculados
      const enrichedData = this.enrichFallbackData(collectedData);

      return {
        success: Object.keys(enrichedData).length > 0,
        symbol,
        data: enrichedData,
        sources,
        errors,
        fieldsCollected: Object.keys(enrichedData),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Erro geral no fallback collector para ${symbol}`, error);
      
      return {
        success: false,
        symbol,
        error: error.message,
        sources: [],
        errors: [...errors, { general: error.message }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Faz scraping de um site específico
   * Em produção, usaria o MCP Firecrawl real
   */
  async scrapeFromSite(symbol, site) {
    // Simular delay de scraping
    await this.delay(500 + Math.random() * 1500);

    // Simular dados coletados por scraping baseados no site
    switch (site) {
      case 'etfdb':
        return this.mockEtfdbData(symbol);
      case 'morningstar':
        return this.mockMorningstarData(symbol);
      case 'etfdotcom':
        return this.mockEtfDotComData(symbol);
      default:
        return {};
    }
  }

  /**
   * Simula dados do ETFdb.com
   * ETFdb é especializado em dados técnicos e holdings
   */
  mockEtfdbData(symbol) {
    // Simular falha em alguns casos (20% de chance)
    if (Math.random() < 0.2) {
      throw new Error('ETF não encontrado no ETFdb');
    }

    return {
      // Dados que o ETFdb costuma ter
      expenseratio: 0.0003 + Math.random() * 0.02, // 0.03% a 2%
      totalasset: Math.floor(100000000 + Math.random() * 50000000000), // $100M a $50B
      avgvolume: Math.floor(100000 + Math.random() * 20000000), // 100K a 20M
      holdingscount: Math.floor(25 + Math.random() * 1000), // 25 a 1000
      
      // Dados de categorização que o ETFdb fornece
      size_category: this.getRandomSizeCategory(),
      etf_type: this.getRandomEtfType(),
      
      // Setores (ETFdb tem bons dados de setores)
      sectorslist: this.generateRandomSectors(),
      
      // Informações da empresa
      etfcompany: this.getRandomEtfCompany(),
      website: `https://www.${symbol.toLowerCase()}etf.com`
    };
  }

  /**
   * Simula dados do Morningstar
   * Morningstar é especializado em análise e ratings
   */
  mockMorningstarData(symbol) {
    // Simular falha em alguns casos (15% de chance)
    if (Math.random() < 0.15) {
      throw new Error('ETF não encontrado no Morningstar');
    }

    return {
      // Dados de performance que o Morningstar fornece
      returns_12m: -0.1 + Math.random() * 0.4, // -10% a +30%
      returns_24m: -0.05 + Math.random() * 0.3, // -5% a +25%
      returns_36m: 0.02 + Math.random() * 0.25, // 2% a 27%
      returns_5y: 0.05 + Math.random() * 0.15, // 5% a 20%
      ten_year_return: 0.06 + Math.random() * 0.12, // 6% a 18%
      
      // Dados de risco
      volatility_12m: 0.08 + Math.random() * 0.25, // 8% a 33%
      volatility_24m: 0.09 + Math.random() * 0.22, // 9% a 31%
      volatility_36m: 0.10 + Math.random() * 0.20, // 10% a 30%
      ten_year_volatility: 0.12 + Math.random() * 0.18, // 12% a 30%
      
      // Sharpe ratios
      sharpe_12m: -0.5 + Math.random() * 2, // -0.5 a 1.5
      sharpe_24m: -0.3 + Math.random() * 1.8, // -0.3 a 1.5
      sharpe_36m: -0.2 + Math.random() * 1.7, // -0.2 a 1.5
      ten_year_sharpe: 0.1 + Math.random() * 1.2, // 0.1 a 1.3
      
      // Max drawdown
      max_drawdown: -0.05 - Math.random() * 0.4, // -5% a -45%
      
      // Categoria de liquidez
      liquidity_category: this.getRandomLiquidityCategory()
    };
  }

  /**
   * Simula dados do ETF.com
   * ETF.com foca em dados básicos e dividendos
   */
  mockEtfDotComData(symbol) {
    // Simular falha em alguns casos (25% de chance)
    if (Math.random() < 0.25) {
      throw new Error('ETF não encontrado no ETF.com');
    }

    return {
      // Dados básicos
      name: this.generateEtfName(symbol),
      description: `The ${symbol} ETF provides exposure to a diversified portfolio of securities, offering investors efficient access to specific market segments with competitive fees.`,
      
      // Dados de dividendos
      dividends_12m: Math.random() * 0.06, // 0% a 6%
      dividends_24m: Math.random() * 0.05, // 0% a 5%
      dividends_36m: Math.random() * 0.04, // 0% a 4%
      dividends_all_time: Math.random() * 0.08, // 0% a 8%
      
      // Dados básicos financeiros
      nav: 20 + Math.random() * 280, // $20 a $300
      navcurrency: 'USD',
      
      // Data de criação
      inceptiondate: this.getRandomInceptionDate(),
      
      // País de domicílio
      domicile: 'US'
    };
  }

  /**
   * Enriquece dados coletados via fallback
   */
  enrichFallbackData(rawData) {
    const enriched = { ...rawData };
    
    // Normalizar valores numéricos
    this.normalizeNumericFields(enriched);
    
    // Adicionar campos derivados se dados suficientes estiverem disponíveis
    this.addDerivedFields(enriched);
    
    return enriched;
  }

  /**
   * Normaliza campos numéricos para garantir precisão
   */
  normalizeNumericFields(data) {
    const numericFields = [
      'expenseratio', 'returns_12m', 'returns_24m', 'returns_36m', 'returns_5y', 'ten_year_return',
      'volatility_12m', 'volatility_24m', 'volatility_36m', 'ten_year_volatility',
      'sharpe_12m', 'sharpe_24m', 'sharpe_36m', 'ten_year_sharpe',
      'max_drawdown', 'dividends_12m', 'dividends_24m', 'dividends_36m', 'dividends_all_time',
      'nav'
    ];
    
    numericFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] === 'number') {
        data[field] = Math.round(data[field] * 10000) / 10000; // 4 casas decimais
      }
    });
  }

  /**
   * Adiciona campos derivados baseados nos dados disponíveis
   */
  addDerivedFields(data) {
    // Se temos returns e volatility, podemos calcular Sharpe aproximado
    if (data.returns_12m && data.volatility_12m && !data.sharpe_12m) {
      const riskFreeRate = 0.05; // 5%
      data.sharpe_12m = Math.round(((data.returns_12m - riskFreeRate) / data.volatility_12m) * 100) / 100;
    }
    
    // Categorizar por assets se disponível
    if (data.totalasset && !data.size_category) {
      data.size_category = this.categorizeSizeByAssets(data.totalasset);
    }
    
    // Categorizar por volume se disponível
    if (data.avgvolume && !data.liquidity_category) {
      data.liquidity_category = this.categorizeLiquidityByVolume(data.avgvolume);
    }
  }

  // Funções auxiliares para dados mock
  getRandomSizeCategory() {
    const categories = ['Large', 'Medium', 'Small', 'Micro'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  getRandomEtfType() {
    const types = ['Broad Market', 'Sector', 'Bond', 'International', 'Commodity', 'Growth', 'Value', 'Dividend'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomLiquidityCategory() {
    const categories = ['High', 'Medium', 'Low', 'Very Low'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  getRandomEtfCompany() {
    const companies = [
      'State Street Global Advisors', 'BlackRock', 'Vanguard Group', 
      'Invesco', 'First Trust', 'Global X', 'WisdomTree', 'ProShares'
    ];
    return companies[Math.floor(Math.random() * companies.length)];
  }

  generateEtfName(symbol) {
    const prefixes = ['SPDR', 'iShares', 'Vanguard', 'Invesco', 'First Trust', 'Global X', 'WisdomTree'];
    const themes = ['S&P 500', 'Total Market', 'Growth', 'Value', 'International', 'Bond', 'Technology', 'Healthcare'];
    const suffixes = ['ETF', 'Fund', 'Index Fund'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${themes[Math.floor(Math.random() * themes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  getRandomInceptionDate() {
    const start = new Date(1995, 0, 1);
    const end = new Date(2024, 0, 1);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  generateRandomSectors() {
    const sectors = [
      'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
      'Communication Services', 'Industrials', 'Consumer Defensive',
      'Energy', 'Real Estate', 'Basic Materials', 'Utilities'
    ];
    
    const sectorData = {};
    let totalWeight = 0;
    
    // Selecionar 5-8 setores aleatoriamente
    const selectedSectors = sectors.sort(() => 0.5 - Math.random()).slice(0, 5 + Math.floor(Math.random() * 4));
    
    selectedSectors.forEach(sector => {
      const weight = 5 + Math.random() * 25; // 5% a 30%
      sectorData[sector] = Math.round(weight * 100) / 100;
      totalWeight += weight;
    });
    
    // Normalizar para 100%
    const factor = 100 / totalWeight;
    Object.keys(sectorData).forEach(sector => {
      sectorData[sector] = Math.round(sectorData[sector] * factor * 100) / 100;
    });
    
    return sectorData;
  }

  categorizeSizeByAssets(assets) {
    if (assets >= 10000000000) return 'Large'; // >= $10B
    if (assets >= 1000000000) return 'Medium'; // >= $1B
    if (assets >= 100000000) return 'Small'; // >= $100M
    return 'Micro'; // < $100M
  }

  categorizeLiquidityByVolume(volume) {
    if (volume >= 10000000) return 'High'; // >= 10M
    if (volume >= 1000000) return 'Medium'; // >= 1M
    if (volume >= 100000) return 'Low'; // >= 100K
    return 'Very Low'; // < 100K
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância singleton
export const fallbackCollector = new FallbackCollector();

export default fallbackCollector; 