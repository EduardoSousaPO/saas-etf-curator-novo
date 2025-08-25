const { HistoricalDataCollector } = require('../collectors/historical-data-collector');
const { FinancialMetricsCalculator } = require('../calculators/financial-metrics');
const { DividendMetricsCalculator } = require('../calculators/dividend-metrics');

class MetricsProcessor {
  constructor(supabaseClient, logger = null) {
    this.supabase = supabaseClient;
    this.logger = logger || console;
    this.historicalCollector = new HistoricalDataCollector(logger);
    this.financialCalculator = new FinancialMetricsCalculator(logger);
    this.dividendCalculator = new DividendMetricsCalculator(logger);
    
    this.config = {
      batchSize: 10,
      delayBetweenBatches: 5000,
      maxRetries: 3,
      targetEndDate: '2025-05-15'
    };
  }

  /**
   * Processa métricas históricas para todos os ETFs ativos
   */
  async processAllActiveETFs() {
    this.logger.info && this.logger.info('🚀 Iniciando processamento de métricas históricas para ETFs ativos');

    try {
      // Buscar ETFs ativos
      const activeETFs = await this.getActiveETFs();
      this.logger.info && this.logger.info(`📊 Encontrados ${activeETFs.length} ETFs ativos para processar`);

      if (activeETFs.length === 0) {
        this.logger.warn && this.logger.warn('⚠️ Nenhum ETF ativo encontrado');
        return { success: 0, errors: 0, total: 0 };
      }

      // Processar em batches
      const results = {
        success: 0,
        errors: 0,
        total: activeETFs.length,
        details: []
      };

      for (let i = 0; i < activeETFs.length; i += this.config.batchSize) {
        const batch = activeETFs.slice(i, i + this.config.batchSize);
        const batchNumber = Math.floor(i / this.config.batchSize) + 1;
        const totalBatches = Math.ceil(activeETFs.length / this.config.batchSize);

        this.logger.info && this.logger.info(`\n📦 Processando batch ${batchNumber}/${totalBatches} (${batch.length} ETFs)`);

        const batchResults = await this.processBatch(batch);
        
        results.success += batchResults.success;
        results.errors += batchResults.errors;
        results.details.push(...batchResults.details);

        // Log progresso
        const progressPercent = ((i + batch.length) / activeETFs.length * 100).toFixed(1);
        this.logger.info && this.logger.info(`📈 Progresso: ${progressPercent}% (${results.success} sucessos, ${results.errors} erros)`);

        // Delay entre batches (exceto último)
        if (i + this.config.batchSize < activeETFs.length) {
          this.logger.debug && this.logger.debug(`⏳ Aguardando ${this.config.delayBetweenBatches}ms antes do próximo batch`);
          await this.delay(this.config.delayBetweenBatches);
        }
      }

      this.logger.info && this.logger.info(`\n✅ Processamento concluído: ${results.success}/${results.total} ETFs processados com sucesso`);
      return results;

    } catch (error) {
      this.logger.error && this.logger.error('❌ Erro no processamento geral:', error.message);
      throw error;
    }
  }

  /**
   * Processa um batch de ETFs
   */
  async processBatch(etfs) {
    const results = {
      success: 0,
      errors: 0,
      details: []
    };

    for (const etf of etfs) {
      try {
        const result = await this.processETFMetrics(etf);
        if (result.success) {
          results.success++;
        } else {
          results.errors++;
        }
        results.details.push(result);

      } catch (error) {
        this.logger.error && this.logger.error(`❌ Erro ao processar ${etf.symbol}:`, error.message);
        results.errors++;
        results.details.push({
          symbol: etf.symbol,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Processa métricas históricas para um ETF específico
   */
  async processETFMetrics(etf) {
    const symbol = etf.symbol;
    this.logger.debug && this.logger.debug(`\n📈 Processando métricas para ${symbol}`);

    try {
      // 1. Calcular período de coleta baseado na inception date
      const dateRange = this.historicalCollector.calculateDateRange(
        etf.inceptiondate || '2015-01-01',
        this.config.targetEndDate
      );

      this.logger.debug && this.logger.debug(`📅 Período: ${dateRange.startDate} a ${dateRange.endDate} (${dateRange.totalDays} dias)`);

      // 2. Verificar se já temos dados históricos
      const existingData = await this.checkExistingHistoricalData(symbol);
      
      let priceData = existingData.prices;
      let dividendData = existingData.dividends;

      // 3. Coletar dados históricos se necessário
      if (!priceData || priceData.length === 0) {
        this.logger.debug && this.logger.debug(`🔍 Coletando dados de preços para ${symbol}`);
        priceData = await this.historicalCollector.collectPriceHistory(
          symbol,
          dateRange.startDate,
          dateRange.endDate
        );

        if (priceData.length > 0) {
          await this.storePriceData(symbol, priceData);
          this.logger.debug && this.logger.debug(`💾 Armazenados ${priceData.length} registros de preços`);
        }
      } else {
        this.logger.debug && this.logger.debug(`✓ Dados de preços já existem (${priceData.length} registros)`);
      }

      if (!dividendData || dividendData.length === 0) {
        this.logger.debug && this.logger.debug(`🔍 Coletando dados de dividendos para ${symbol}`);
        dividendData = await this.historicalCollector.collectDividendHistory(
          symbol,
          dateRange.startDate,
          dateRange.endDate
        );

        if (dividendData.length > 0) {
          await this.storeDividendData(symbol, dividendData);
          this.logger.debug && this.logger.debug(`💾 Armazenados ${dividendData.length} registros de dividendos`);
        }
      } else {
        this.logger.debug && this.logger.debug(`✓ Dados de dividendos já existem (${dividendData.length} registros)`);
      }

      // 4. Calcular métricas financeiras
      this.logger.debug && this.logger.debug(`🧮 Calculando métricas financeiras para ${symbol}`);
      const financialMetrics = this.financialCalculator.calculateAllMetrics(priceData, dividendData);
      
      // 5. Calcular métricas de dividendos
      const dividendMetrics = this.dividendCalculator.calculateAllDividendMetrics(dividendData, priceData);

      // 6. Combinar todas as métricas
      const allMetrics = {
        ...financialMetrics,
        ...this.extractDividendMetricsForUpdate(dividendMetrics)
      };

      // 7. Atualizar tabela principal
      await this.updateETFMetrics(symbol, allMetrics);

      this.logger.debug && this.logger.debug(`✅ Métricas calculadas e atualizadas para ${symbol}`);

      return {
        symbol,
        success: true,
        priceRecords: priceData.length,
        dividendRecords: dividendData.length,
        metricsCalculated: Object.keys(allMetrics).filter(key => allMetrics[key] !== null).length,
        dateRange
      };

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao processar ${symbol}:`, error.message);
      return {
        symbol,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca ETFs ativos na tabela principal
   */
  async getActiveETFs() {
    try {
      const result = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: `
          SELECT symbol, name, inceptiondate, nav
          FROM etfs_ativos_reais 
          WHERE symbol IS NOT NULL
          ORDER BY symbol
        `
      });

      return result.data || [];
    } catch (error) {
      this.logger.error && this.logger.error('❌ Erro ao buscar ETFs ativos:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se já existem dados históricos para um ETF
   */
  async checkExistingHistoricalData(symbol) {
    try {
      // Verificar preços
      const pricesResult = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: `
          SELECT * FROM etf_prices 
          WHERE symbol = '${symbol}' 
          ORDER BY date
        `
      });

      // Verificar dividendos
      const dividendsResult = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: `
          SELECT * FROM historic_etfs_dividends 
          WHERE symbol = '${symbol}' 
          ORDER BY ex_date
        `
      });

      return {
        prices: pricesResult.data || [],
        dividends: dividendsResult.data || []
      };

    } catch (error) {
      this.logger.debug && this.logger.debug(`⚠️ Erro ao verificar dados existentes para ${symbol}:`, error.message);
      return { prices: [], dividends: [] };
    }
  }

  /**
   * Armazena dados de preços no banco
   */
  async storePriceData(symbol, priceData) {
    if (!priceData || priceData.length === 0) return;

    try {
      // Preparar dados para inserção
      const values = priceData.map(price => 
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

      await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: insertSQL
      });

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao armazenar preços para ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Armazena dados de dividendos no banco
   */
  async storeDividendData(symbol, dividendData) {
    if (!dividendData || dividendData.length === 0) return;

    try {
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

      await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: insertSQL
      });

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao armazenar dividendos para ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Atualiza métricas na tabela principal
   */
  async updateETFMetrics(symbol, metrics) {
    try {
      const updateFields = [];
      
      for (const [key, value] of Object.entries(metrics)) {
        if (value !== null && value !== undefined) {
          updateFields.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
        }
      }

      if (updateFields.length === 0) {
        this.logger.debug && this.logger.debug(`⚠️ Nenhuma métrica para atualizar para ${symbol}`);
        return;
      }

      const updateSQL = `
        UPDATE etfs_ativos_reais 
        SET ${updateFields.join(', ')}, updatedat = CURRENT_TIMESTAMP
        WHERE symbol = '${symbol}'
      `;

      await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: updateSQL
      });

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao atualizar métricas para ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Extrai métricas de dividendos para atualização da tabela principal
   */
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

  /**
   * Processa apenas ETFs específicos
   */
  async processSpecificETFs(symbols) {
    this.logger.info && this.logger.info(`🎯 Processando ETFs específicos: ${symbols.join(', ')}`);

    const results = {
      success: 0,
      errors: 0,
      total: symbols.length,
      details: []
    };

    for (const symbol of symbols) {
      try {
        // Buscar dados do ETF
        const etfResult = await this.supabase.execute_sql({
          project_id: 'nniabnjuwzeqmflrruga',
          query: `SELECT * FROM etfs_ativos_reais WHERE symbol = '${symbol}'`
        });

        if (!etfResult.data || etfResult.data.length === 0) {
          throw new Error(`ETF ${symbol} não encontrado na tabela principal`);
        }

        const etf = etfResult.data[0];
        const result = await this.processETFMetrics(etf);
        
        if (result.success) {
          results.success++;
        } else {
          results.errors++;
        }
        results.details.push(result);

      } catch (error) {
        this.logger.error && this.logger.error(`❌ Erro ao processar ${symbol}:`, error.message);
        results.errors++;
        results.details.push({
          symbol,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gera relatório de status do processamento
   */
  generateProcessingReport(results) {
    const report = {
      summary: {
        total: results.total,
        success: results.success,
        errors: results.errors,
        successRate: ((results.success / results.total) * 100).toFixed(1) + '%'
      },
      errors: results.details.filter(d => !d.success),
      topPerformers: results.details
        .filter(d => d.success)
        .sort((a, b) => (b.metricsCalculated || 0) - (a.metricsCalculated || 0))
        .slice(0, 10)
    };

    return report;
  }
}

module.exports = { MetricsProcessor }; 
const { FinancialMetricsCalculator } = require('../calculators/financial-metrics');
const { DividendMetricsCalculator } = require('../calculators/dividend-metrics');

class MetricsProcessor {
  constructor(supabaseClient, logger = null) {
    this.supabase = supabaseClient;
    this.logger = logger || console;
    this.historicalCollector = new HistoricalDataCollector(logger);
    this.financialCalculator = new FinancialMetricsCalculator(logger);
    this.dividendCalculator = new DividendMetricsCalculator(logger);
    
    this.config = {
      batchSize: 10,
      delayBetweenBatches: 5000,
      maxRetries: 3,
      targetEndDate: '2025-05-15'
    };
  }

  /**
   * Processa métricas históricas para todos os ETFs ativos
   */
  async processAllActiveETFs() {
    this.logger.info && this.logger.info('🚀 Iniciando processamento de métricas históricas para ETFs ativos');

    try {
      // Buscar ETFs ativos
      const activeETFs = await this.getActiveETFs();
      this.logger.info && this.logger.info(`📊 Encontrados ${activeETFs.length} ETFs ativos para processar`);

      if (activeETFs.length === 0) {
        this.logger.warn && this.logger.warn('⚠️ Nenhum ETF ativo encontrado');
        return { success: 0, errors: 0, total: 0 };
      }

      // Processar em batches
      const results = {
        success: 0,
        errors: 0,
        total: activeETFs.length,
        details: []
      };

      for (let i = 0; i < activeETFs.length; i += this.config.batchSize) {
        const batch = activeETFs.slice(i, i + this.config.batchSize);
        const batchNumber = Math.floor(i / this.config.batchSize) + 1;
        const totalBatches = Math.ceil(activeETFs.length / this.config.batchSize);

        this.logger.info && this.logger.info(`\n📦 Processando batch ${batchNumber}/${totalBatches} (${batch.length} ETFs)`);

        const batchResults = await this.processBatch(batch);
        
        results.success += batchResults.success;
        results.errors += batchResults.errors;
        results.details.push(...batchResults.details);

        // Log progresso
        const progressPercent = ((i + batch.length) / activeETFs.length * 100).toFixed(1);
        this.logger.info && this.logger.info(`📈 Progresso: ${progressPercent}% (${results.success} sucessos, ${results.errors} erros)`);

        // Delay entre batches (exceto último)
        if (i + this.config.batchSize < activeETFs.length) {
          this.logger.debug && this.logger.debug(`⏳ Aguardando ${this.config.delayBetweenBatches}ms antes do próximo batch`);
          await this.delay(this.config.delayBetweenBatches);
        }
      }

      this.logger.info && this.logger.info(`\n✅ Processamento concluído: ${results.success}/${results.total} ETFs processados com sucesso`);
      return results;

    } catch (error) {
      this.logger.error && this.logger.error('❌ Erro no processamento geral:', error.message);
      throw error;
    }
  }

  /**
   * Processa um batch de ETFs
   */
  async processBatch(etfs) {
    const results = {
      success: 0,
      errors: 0,
      details: []
    };

    for (const etf of etfs) {
      try {
        const result = await this.processETFMetrics(etf);
        if (result.success) {
          results.success++;
        } else {
          results.errors++;
        }
        results.details.push(result);

      } catch (error) {
        this.logger.error && this.logger.error(`❌ Erro ao processar ${etf.symbol}:`, error.message);
        results.errors++;
        results.details.push({
          symbol: etf.symbol,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Processa métricas históricas para um ETF específico
   */
  async processETFMetrics(etf) {
    const symbol = etf.symbol;
    this.logger.debug && this.logger.debug(`\n📈 Processando métricas para ${symbol}`);

    try {
      // 1. Calcular período de coleta baseado na inception date
      const dateRange = this.historicalCollector.calculateDateRange(
        etf.inceptiondate || '2015-01-01',
        this.config.targetEndDate
      );

      this.logger.debug && this.logger.debug(`📅 Período: ${dateRange.startDate} a ${dateRange.endDate} (${dateRange.totalDays} dias)`);

      // 2. Verificar se já temos dados históricos
      const existingData = await this.checkExistingHistoricalData(symbol);
      
      let priceData = existingData.prices;
      let dividendData = existingData.dividends;

      // 3. Coletar dados históricos se necessário
      if (!priceData || priceData.length === 0) {
        this.logger.debug && this.logger.debug(`🔍 Coletando dados de preços para ${symbol}`);
        priceData = await this.historicalCollector.collectPriceHistory(
          symbol,
          dateRange.startDate,
          dateRange.endDate
        );

        if (priceData.length > 0) {
          await this.storePriceData(symbol, priceData);
          this.logger.debug && this.logger.debug(`💾 Armazenados ${priceData.length} registros de preços`);
        }
      } else {
        this.logger.debug && this.logger.debug(`✓ Dados de preços já existem (${priceData.length} registros)`);
      }

      if (!dividendData || dividendData.length === 0) {
        this.logger.debug && this.logger.debug(`🔍 Coletando dados de dividendos para ${symbol}`);
        dividendData = await this.historicalCollector.collectDividendHistory(
          symbol,
          dateRange.startDate,
          dateRange.endDate
        );

        if (dividendData.length > 0) {
          await this.storeDividendData(symbol, dividendData);
          this.logger.debug && this.logger.debug(`💾 Armazenados ${dividendData.length} registros de dividendos`);
        }
      } else {
        this.logger.debug && this.logger.debug(`✓ Dados de dividendos já existem (${dividendData.length} registros)`);
      }

      // 4. Calcular métricas financeiras
      this.logger.debug && this.logger.debug(`🧮 Calculando métricas financeiras para ${symbol}`);
      const financialMetrics = this.financialCalculator.calculateAllMetrics(priceData, dividendData);
      
      // 5. Calcular métricas de dividendos
      const dividendMetrics = this.dividendCalculator.calculateAllDividendMetrics(dividendData, priceData);

      // 6. Combinar todas as métricas
      const allMetrics = {
        ...financialMetrics,
        ...this.extractDividendMetricsForUpdate(dividendMetrics)
      };

      // 7. Atualizar tabela principal
      await this.updateETFMetrics(symbol, allMetrics);

      this.logger.debug && this.logger.debug(`✅ Métricas calculadas e atualizadas para ${symbol}`);

      return {
        symbol,
        success: true,
        priceRecords: priceData.length,
        dividendRecords: dividendData.length,
        metricsCalculated: Object.keys(allMetrics).filter(key => allMetrics[key] !== null).length,
        dateRange
      };

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao processar ${symbol}:`, error.message);
      return {
        symbol,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca ETFs ativos na tabela principal
   */
  async getActiveETFs() {
    try {
      const result = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: `
          SELECT symbol, name, inceptiondate, nav
          FROM etfs_ativos_reais 
          WHERE symbol IS NOT NULL
          ORDER BY symbol
        `
      });

      return result.data || [];
    } catch (error) {
      this.logger.error && this.logger.error('❌ Erro ao buscar ETFs ativos:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se já existem dados históricos para um ETF
   */
  async checkExistingHistoricalData(symbol) {
    try {
      // Verificar preços
      const pricesResult = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: `
          SELECT * FROM etf_prices 
          WHERE symbol = '${symbol}' 
          ORDER BY date
        `
      });

      // Verificar dividendos
      const dividendsResult = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: `
          SELECT * FROM historic_etfs_dividends 
          WHERE symbol = '${symbol}' 
          ORDER BY ex_date
        `
      });

      return {
        prices: pricesResult.data || [],
        dividends: dividendsResult.data || []
      };

    } catch (error) {
      this.logger.debug && this.logger.debug(`⚠️ Erro ao verificar dados existentes para ${symbol}:`, error.message);
      return { prices: [], dividends: [] };
    }
  }

  /**
   * Armazena dados de preços no banco
   */
  async storePriceData(symbol, priceData) {
    if (!priceData || priceData.length === 0) return;

    try {
      // Preparar dados para inserção
      const values = priceData.map(price => 
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

      await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: insertSQL
      });

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao armazenar preços para ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Armazena dados de dividendos no banco
   */
  async storeDividendData(symbol, dividendData) {
    if (!dividendData || dividendData.length === 0) return;

    try {
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

      await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: insertSQL
      });

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao armazenar dividendos para ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Atualiza métricas na tabela principal
   */
  async updateETFMetrics(symbol, metrics) {
    try {
      const updateFields = [];
      
      for (const [key, value] of Object.entries(metrics)) {
        if (value !== null && value !== undefined) {
          updateFields.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
        }
      }

      if (updateFields.length === 0) {
        this.logger.debug && this.logger.debug(`⚠️ Nenhuma métrica para atualizar para ${symbol}`);
        return;
      }

      const updateSQL = `
        UPDATE etfs_ativos_reais 
        SET ${updateFields.join(', ')}, updatedat = CURRENT_TIMESTAMP
        WHERE symbol = '${symbol}'
      `;

      await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: updateSQL
      });

    } catch (error) {
      this.logger.error && this.logger.error(`❌ Erro ao atualizar métricas para ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Extrai métricas de dividendos para atualização da tabela principal
   */
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

  /**
   * Processa apenas ETFs específicos
   */
  async processSpecificETFs(symbols) {
    this.logger.info && this.logger.info(`🎯 Processando ETFs específicos: ${symbols.join(', ')}`);

    const results = {
      success: 0,
      errors: 0,
      total: symbols.length,
      details: []
    };

    for (const symbol of symbols) {
      try {
        // Buscar dados do ETF
        const etfResult = await this.supabase.execute_sql({
          project_id: 'nniabnjuwzeqmflrruga',
          query: `SELECT * FROM etfs_ativos_reais WHERE symbol = '${symbol}'`
        });

        if (!etfResult.data || etfResult.data.length === 0) {
          throw new Error(`ETF ${symbol} não encontrado na tabela principal`);
        }

        const etf = etfResult.data[0];
        const result = await this.processETFMetrics(etf);
        
        if (result.success) {
          results.success++;
        } else {
          results.errors++;
        }
        results.details.push(result);

      } catch (error) {
        this.logger.error && this.logger.error(`❌ Erro ao processar ${symbol}:`, error.message);
        results.errors++;
        results.details.push({
          symbol,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gera relatório de status do processamento
   */
  generateProcessingReport(results) {
    const report = {
      summary: {
        total: results.total,
        success: results.success,
        errors: results.errors,
        successRate: ((results.success / results.total) * 100).toFixed(1) + '%'
      },
      errors: results.details.filter(d => !d.success),
      topPerformers: results.details
        .filter(d => d.success)
        .sort((a, b) => (b.metricsCalculated || 0) - (a.metricsCalculated || 0))
        .slice(0, 10)
    };

    return report;
  }
}

module.exports = { MetricsProcessor }; 