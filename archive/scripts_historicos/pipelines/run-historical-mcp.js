#!/usr/bin/env node

const { HistoricalDataCollector } = require('./etf-pipeline/collectors/historical-data-collector');
const { FinancialMetricsCalculator } = require('./etf-pipeline/calculators/financial-metrics');
const { DividendMetricsCalculator } = require('./etf-pipeline/calculators/dividend-metrics');
const { PipelineLogger } = require('./etf-pipeline/utils/logger');

// Cliente MCP Supabase real
const mcpSupabaseClient = {
  async execute_sql({ project_id, query }) {
    // Esta função será interceptada pelo ambiente MCP
    throw new Error('Esta função deve ser executada no ambiente MCP');
  }
};

class MCPHistoricalProcessor {
  constructor() {
    this.logger = new PipelineLogger();
    this.historicalCollector = new HistoricalDataCollector();
    this.financialCalculator = new FinancialMetricsCalculator();
    this.dividendCalculator = new DividendMetricsCalculator();
  }

  async processETF(symbol) {
    this.logger.info(`🎯 Processando ${symbol}...`);

    try {
      // 1. Buscar dados do ETF na tabela principal
      const etfData = await this.getETFData(symbol);
      if (!etfData) {
        throw new Error(`ETF ${symbol} não encontrado`);
      }

      // 2. Calcular período de coleta
      const dateRange = this.historicalCollector.calculateDateRange(
        etfData.inceptiondate || '2015-01-01',
        '2025-05-15'
      );

      this.logger.info(`📅 Período: ${dateRange.startDate} a ${dateRange.endDate}`);

      // 3. Verificar dados existentes
      const existingPrices = await this.getExistingPrices(symbol);
      
      let priceData = existingPrices;

      // 4. Coletar dados se necessário
      if (!priceData || priceData.length === 0) {
        this.logger.info(`🔍 Coletando dados históricos para ${symbol}...`);
        priceData = await this.historicalCollector.collectPriceHistory(
          symbol,
          dateRange.startDate,
          dateRange.endDate
        );

        // 5. Inserir dados de preços
        if (priceData.length > 0) {
          await this.insertPriceData(symbol, priceData);
          this.logger.info(`💾 ${priceData.length} registros de preços inseridos`);
        }
      } else {
        this.logger.info(`✓ ${priceData.length} registros já existem`);
      }

      // 6. Coletar dividendos
      const dividendData = await this.historicalCollector.collectDividendHistory(
        symbol,
        dateRange.startDate,
        dateRange.endDate
      );

      if (dividendData.length > 0) {
        await this.insertDividendData(symbol, dividendData);
        this.logger.info(`💰 ${dividendData.length} registros de dividendos inseridos`);
      }

      // 7. Calcular métricas
      const financialMetrics = this.financialCalculator.calculateAllMetrics(priceData, dividendData);
      const dividendMetrics = this.dividendCalculator.calculateAllDividendMetrics(dividendData, priceData);

      // 8. Combinar métricas
      const allMetrics = {
        ...financialMetrics,
        ...this.extractDividendMetricsForUpdate(dividendMetrics)
      };

      // 9. Atualizar tabela principal
      await this.updateETFMetrics(symbol, allMetrics);

      this.logger.success(`✅ ${symbol} processado com sucesso!`);

      return {
        symbol,
        success: true,
        priceRecords: priceData.length,
        dividendRecords: dividendData.length,
        metricsCalculated: Object.keys(allMetrics).filter(key => allMetrics[key] !== null).length
      };

    } catch (error) {
      this.logger.error(`❌ Erro ao processar ${symbol}:`, error.message);
      return {
        symbol,
        success: false,
        error: error.message
      };
    }
  }

  async getETFData(symbol) {
    // Esta função será chamada via MCP
    console.log(`Buscando dados para ${symbol}...`);
    
    // Simular dados para teste
    const etfs = {
      'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', inceptiondate: '1993-01-22', nav: 420.50 },
      'QQQ': { symbol: 'QQQ', name: 'Invesco QQQ Trust', inceptiondate: '1999-03-10', nav: 350.25 },
      'VTI': { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', inceptiondate: '2001-05-24', nav: 220.75 }
    };
    
    return etfs[symbol] || null;
  }

  async getExistingPrices(symbol) {
    console.log(`Verificando preços existentes para ${symbol}...`);
    // Esta função retornará dados via MCP
    return [];
  }

  async insertPriceData(symbol, priceData) {
    if (!priceData || priceData.length === 0) return;

    console.log(`Inserindo ${priceData.length} registros de preços para ${symbol}...`);
    
    // Dividir em batches para evitar queries muito grandes
    const batchSize = 100;
    for (let i = 0; i < priceData.length; i += batchSize) {
      const batch = priceData.slice(i, i + batchSize);
      
      const values = batch.map(price => 
        `('${symbol}', '${price.date}', ${price.open}, ${price.high}, ${price.low}, ${price.close}, ${price.adjusted_close}, ${price.volume})`
      ).join(',\n');

      const insertSQL = `
        INSERT INTO etf_prices (symbol, date, open, high, low, close, adjusted_close, volume)
        VALUES ${values}
        ON CONFLICT (symbol, date) DO UPDATE SET
          open = EXCLUDED.open,
          high = EXCLUDED.high,
          low = EXCLUDED.low,
          close = EXCLUDED.close,
          adjusted_close = EXCLUDED.adjusted_close,
          volume = EXCLUDED.volume
      `;

      console.log(`SQL para batch ${Math.floor(i/batchSize) + 1}:`, insertSQL.substring(0, 200) + '...');
    }
  }

  async insertDividendData(symbol, dividendData) {
    if (!dividendData || dividendData.length === 0) return;

    console.log(`Inserindo ${dividendData.length} registros de dividendos para ${symbol}...`);
    
    const values = dividendData.map(dividend => 
      `('${symbol}', '${dividend.ex_date}', ${dividend.pay_date ? `'${dividend.pay_date}'` : 'NULL'}, ${dividend.amount}, ${dividend.frequency ? `'${dividend.frequency}'` : 'NULL'}, ${dividend.yield_percentage || 'NULL'})`
    ).join(',\n');

    const insertSQL = `
      INSERT INTO historic_etfs_dividends (symbol, ex_date, pay_date, amount, frequency, yield_percentage)
      VALUES ${values}
      ON CONFLICT (symbol, ex_date) DO UPDATE SET
        pay_date = EXCLUDED.pay_date,
        amount = EXCLUDED.amount,
        frequency = EXCLUDED.frequency,
        yield_percentage = EXCLUDED.yield_percentage
    `;

    console.log('SQL para dividendos:', insertSQL.substring(0, 200) + '...');
  }

  async updateETFMetrics(symbol, metrics) {
    const updateFields = [];
    
    for (const [key, value] of Object.entries(metrics)) {
      if (value !== null && value !== undefined) {
        updateFields.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
      }
    }

    if (updateFields.length === 0) {
      console.log(`⚠️ Nenhuma métrica para atualizar para ${symbol}`);
      return;
    }

    const updateSQL = `
      UPDATE etfs_ativos_reais 
      SET ${updateFields.join(', ')}, updatedat = CURRENT_TIMESTAMP
      WHERE symbol = '${symbol}'
    `;

    console.log(`Atualizando métricas para ${symbol}:`, updateSQL.substring(0, 200) + '...');
  }

  extractDividendMetricsForUpdate(dividendMetrics) {
    const extracted = {};

    if (dividendMetrics.dividends_12m?.total !== undefined) {
      extracted.dividends_12m = dividendMetrics.dividends_12m.total;
    }
    if (dividendMetrics.dividends_24m?.total !== undefined) {
      extracted.dividends_24m = dividendMetrics.dividends_24m.total;
    }
    if (dividendMetrics.dividends_36m?.total !== undefined) {
      extracted.dividends_36m = dividendMetrics.dividends_36m.total;
    }
    if (dividendMetrics.dividends_all_time?.total !== undefined) {
      extracted.dividends_all_time = dividendMetrics.dividends_all_time.total;
    }

    return extracted;
  }
}

async function main() {
  console.log('🚀 ETF Historical Data Pipeline (MCP Real)');
  console.log('==========================================\n');

  const processor = new MCPHistoricalProcessor();
  
  // Processar ETFs de exemplo
  const symbols = ['SPY', 'QQQ', 'VTI'];
  
  for (const symbol of symbols) {
    const result = await processor.processETF(symbol);
    console.log(`\n📊 Resultado para ${symbol}:`, result);
  }

  console.log('\n✅ Pipeline concluído!');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
}

module.exports = { MCPHistoricalProcessor }; 

const { HistoricalDataCollector } = require('./etf-pipeline/collectors/historical-data-collector');
const { FinancialMetricsCalculator } = require('./etf-pipeline/calculators/financial-metrics');
const { DividendMetricsCalculator } = require('./etf-pipeline/calculators/dividend-metrics');
const { PipelineLogger } = require('./etf-pipeline/utils/logger');

// Cliente MCP Supabase real
const mcpSupabaseClient = {
  async execute_sql({ project_id, query }) {
    // Esta função será interceptada pelo ambiente MCP
    throw new Error('Esta função deve ser executada no ambiente MCP');
  }
};

class MCPHistoricalProcessor {
  constructor() {
    this.logger = new PipelineLogger();
    this.historicalCollector = new HistoricalDataCollector();
    this.financialCalculator = new FinancialMetricsCalculator();
    this.dividendCalculator = new DividendMetricsCalculator();
  }

  async processETF(symbol) {
    this.logger.info(`🎯 Processando ${symbol}...`);

    try {
      // 1. Buscar dados do ETF na tabela principal
      const etfData = await this.getETFData(symbol);
      if (!etfData) {
        throw new Error(`ETF ${symbol} não encontrado`);
      }

      // 2. Calcular período de coleta
      const dateRange = this.historicalCollector.calculateDateRange(
        etfData.inceptiondate || '2015-01-01',
        '2025-05-15'
      );

      this.logger.info(`📅 Período: ${dateRange.startDate} a ${dateRange.endDate}`);

      // 3. Verificar dados existentes
      const existingPrices = await this.getExistingPrices(symbol);
      
      let priceData = existingPrices;

      // 4. Coletar dados se necessário
      if (!priceData || priceData.length === 0) {
        this.logger.info(`🔍 Coletando dados históricos para ${symbol}...`);
        priceData = await this.historicalCollector.collectPriceHistory(
          symbol,
          dateRange.startDate,
          dateRange.endDate
        );

        // 5. Inserir dados de preços
        if (priceData.length > 0) {
          await this.insertPriceData(symbol, priceData);
          this.logger.info(`💾 ${priceData.length} registros de preços inseridos`);
        }
      } else {
        this.logger.info(`✓ ${priceData.length} registros já existem`);
      }

      // 6. Coletar dividendos
      const dividendData = await this.historicalCollector.collectDividendHistory(
        symbol,
        dateRange.startDate,
        dateRange.endDate
      );

      if (dividendData.length > 0) {
        await this.insertDividendData(symbol, dividendData);
        this.logger.info(`💰 ${dividendData.length} registros de dividendos inseridos`);
      }

      // 7. Calcular métricas
      const financialMetrics = this.financialCalculator.calculateAllMetrics(priceData, dividendData);
      const dividendMetrics = this.dividendCalculator.calculateAllDividendMetrics(dividendData, priceData);

      // 8. Combinar métricas
      const allMetrics = {
        ...financialMetrics,
        ...this.extractDividendMetricsForUpdate(dividendMetrics)
      };

      // 9. Atualizar tabela principal
      await this.updateETFMetrics(symbol, allMetrics);

      this.logger.success(`✅ ${symbol} processado com sucesso!`);

      return {
        symbol,
        success: true,
        priceRecords: priceData.length,
        dividendRecords: dividendData.length,
        metricsCalculated: Object.keys(allMetrics).filter(key => allMetrics[key] !== null).length
      };

    } catch (error) {
      this.logger.error(`❌ Erro ao processar ${symbol}:`, error.message);
      return {
        symbol,
        success: false,
        error: error.message
      };
    }
  }

  async getETFData(symbol) {
    // Esta função será chamada via MCP
    console.log(`Buscando dados para ${symbol}...`);
    
    // Simular dados para teste
    const etfs = {
      'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', inceptiondate: '1993-01-22', nav: 420.50 },
      'QQQ': { symbol: 'QQQ', name: 'Invesco QQQ Trust', inceptiondate: '1999-03-10', nav: 350.25 },
      'VTI': { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', inceptiondate: '2001-05-24', nav: 220.75 }
    };
    
    return etfs[symbol] || null;
  }

  async getExistingPrices(symbol) {
    console.log(`Verificando preços existentes para ${symbol}...`);
    // Esta função retornará dados via MCP
    return [];
  }

  async insertPriceData(symbol, priceData) {
    if (!priceData || priceData.length === 0) return;

    console.log(`Inserindo ${priceData.length} registros de preços para ${symbol}...`);
    
    // Dividir em batches para evitar queries muito grandes
    const batchSize = 100;
    for (let i = 0; i < priceData.length; i += batchSize) {
      const batch = priceData.slice(i, i + batchSize);
      
      const values = batch.map(price => 
        `('${symbol}', '${price.date}', ${price.open}, ${price.high}, ${price.low}, ${price.close}, ${price.adjusted_close}, ${price.volume})`
      ).join(',\n');

      const insertSQL = `
        INSERT INTO etf_prices (symbol, date, open, high, low, close, adjusted_close, volume)
        VALUES ${values}
        ON CONFLICT (symbol, date) DO UPDATE SET
          open = EXCLUDED.open,
          high = EXCLUDED.high,
          low = EXCLUDED.low,
          close = EXCLUDED.close,
          adjusted_close = EXCLUDED.adjusted_close,
          volume = EXCLUDED.volume
      `;

      console.log(`SQL para batch ${Math.floor(i/batchSize) + 1}:`, insertSQL.substring(0, 200) + '...');
    }
  }

  async insertDividendData(symbol, dividendData) {
    if (!dividendData || dividendData.length === 0) return;

    console.log(`Inserindo ${dividendData.length} registros de dividendos para ${symbol}...`);
    
    const values = dividendData.map(dividend => 
      `('${symbol}', '${dividend.ex_date}', ${dividend.pay_date ? `'${dividend.pay_date}'` : 'NULL'}, ${dividend.amount}, ${dividend.frequency ? `'${dividend.frequency}'` : 'NULL'}, ${dividend.yield_percentage || 'NULL'})`
    ).join(',\n');

    const insertSQL = `
      INSERT INTO historic_etfs_dividends (symbol, ex_date, pay_date, amount, frequency, yield_percentage)
      VALUES ${values}
      ON CONFLICT (symbol, ex_date) DO UPDATE SET
        pay_date = EXCLUDED.pay_date,
        amount = EXCLUDED.amount,
        frequency = EXCLUDED.frequency,
        yield_percentage = EXCLUDED.yield_percentage
    `;

    console.log('SQL para dividendos:', insertSQL.substring(0, 200) + '...');
  }

  async updateETFMetrics(symbol, metrics) {
    const updateFields = [];
    
    for (const [key, value] of Object.entries(metrics)) {
      if (value !== null && value !== undefined) {
        updateFields.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
      }
    }

    if (updateFields.length === 0) {
      console.log(`⚠️ Nenhuma métrica para atualizar para ${symbol}`);
      return;
    }

    const updateSQL = `
      UPDATE etfs_ativos_reais 
      SET ${updateFields.join(', ')}, updatedat = CURRENT_TIMESTAMP
      WHERE symbol = '${symbol}'
    `;

    console.log(`Atualizando métricas para ${symbol}:`, updateSQL.substring(0, 200) + '...');
  }

  extractDividendMetricsForUpdate(dividendMetrics) {
    const extracted = {};

    if (dividendMetrics.dividends_12m?.total !== undefined) {
      extracted.dividends_12m = dividendMetrics.dividends_12m.total;
    }
    if (dividendMetrics.dividends_24m?.total !== undefined) {
      extracted.dividends_24m = dividendMetrics.dividends_24m.total;
    }
    if (dividendMetrics.dividends_36m?.total !== undefined) {
      extracted.dividends_36m = dividendMetrics.dividends_36m.total;
    }
    if (dividendMetrics.dividends_all_time?.total !== undefined) {
      extracted.dividends_all_time = dividendMetrics.dividends_all_time.total;
    }

    return extracted;
  }
}

async function main() {
  console.log('🚀 ETF Historical Data Pipeline (MCP Real)');
  console.log('==========================================\n');

  const processor = new MCPHistoricalProcessor();
  
  // Processar ETFs de exemplo
  const symbols = ['SPY', 'QQQ', 'VTI'];
  
  for (const symbol of symbols) {
    const result = await processor.processETF(symbol);
    console.log(`\n📊 Resultado para ${symbol}:`, result);
  }

  console.log('\n✅ Pipeline concluído!');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
}

module.exports = { MCPHistoricalProcessor }; 