const { HistoricalSchemaManager } = require('./database/historical-schema');
const { MetricsProcessor } = require('./processors/metrics-processor');
const { PipelineLogger } = require('./utils/logger');

class HistoricalPipeline {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.logger = new PipelineLogger('Historical Pipeline');
    this.schemaManager = new HistoricalSchemaManager(supabaseClient);
    this.metricsProcessor = new MetricsProcessor(supabaseClient, this.logger);
    
    this.config = {
      projectId: 'nniabnjuwzeqmflrruga',
      targetEndDate: '2025-05-15',
      batchSize: 10,
      maxRetries: 3
    };
  }

  /**
   * Executa o pipeline completo de dados históricos
   */
  async run(options = {}) {
    const startTime = Date.now();
    this.logger.info('🚀 Iniciando Pipeline de Dados Históricos');
    
    try {
      // 1. Configurar opções
      const config = {
        setupTables: options.setupTables !== false,
        processAll: options.processAll !== false,
        specificETFs: options.specificETFs || null,
        sampleSize: options.sampleSize || null
      };

      this.logger.info(`📋 Configuração:`, config);

      // 2. Setup das tabelas históricas
      if (config.setupTables) {
        await this.setupHistoricalTables();
      }

      // 3. Processar ETFs
      let results;
      if (config.specificETFs && config.specificETFs.length > 0) {
        results = await this.metricsProcessor.processSpecificETFs(config.specificETFs);
      } else if (config.sampleSize) {
        results = await this.processSampleETFs(config.sampleSize);
      } else {
        results = await this.metricsProcessor.processAllActiveETFs();
      }

      // 4. Gerar relatório final
      const report = this.metricsProcessor.generateProcessingReport(results);
      const duration = Date.now() - startTime;

      this.logger.success(`✅ Pipeline concluído em ${this.formatDuration(duration)}`);
      this.logger.info('📊 Relatório Final:', JSON.stringify(report.summary, null, 2));

      return {
        success: true,
        duration,
        results,
        report
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Pipeline falhou após ${this.formatDuration(duration)}:`, error.message);
      
      return {
        success: false,
        duration,
        error: error.message,
        results: null
      };
    }
  }

  /**
   * Configura as tabelas históricas
   */
  async setupHistoricalTables() {
    this.logger.info('🔧 Configurando tabelas históricas...');

    try {
      // Verificar se tabelas já existem
      const existingTables = await this.schemaManager.checkTablesExist();
      this.logger.info('📋 Status das tabelas:', existingTables);

      const tablesToCreate = [];
      for (const [tableName, exists] of Object.entries(existingTables)) {
        if (!exists) {
          tablesToCreate.push(tableName);
        }
      }

      if (tablesToCreate.length > 0) {
        this.logger.info(`🏗️ Criando tabelas: ${tablesToCreate.join(', ')}`);
        const createResults = await this.schemaManager.createHistoricalTables();
        
        if (createResults.errors.length > 0) {
          this.logger.warn('⚠️ Alguns erros durante criação das tabelas:', createResults.errors);
        }

        this.logger.success(`✅ Tabelas criadas: ${createResults.success.join(', ')}`);
      } else {
        this.logger.info('✓ Todas as tabelas históricas já existem');
      }

    } catch (error) {
      this.logger.error('❌ Erro ao configurar tabelas históricas:', error.message);
      throw error;
    }
  }

  /**
   * Processa uma amostra de ETFs para teste
   */
  async processSampleETFs(sampleSize) {
    this.logger.info(`🎯 Processando amostra de ${sampleSize} ETFs`);

    try {
      // Buscar ETFs ativos
      const allETFs = await this.metricsProcessor.getActiveETFs();
      
      if (allETFs.length === 0) {
        throw new Error('Nenhum ETF ativo encontrado');
      }

      // Selecionar amostra
      const sampleETFs = this.selectSampleETFs(allETFs, sampleSize);
      this.logger.info(`📊 Amostra selecionada: ${sampleETFs.map(e => e.symbol).join(', ')}`);

      // Processar amostra
      const results = await this.metricsProcessor.processSpecificETFs(
        sampleETFs.map(e => e.symbol)
      );

      return results;

    } catch (error) {
      this.logger.error('❌ Erro ao processar amostra:', error.message);
      throw error;
    }
  }

  /**
   * Seleciona uma amostra representativa de ETFs
   */
  selectSampleETFs(allETFs, sampleSize) {
    // Garantir que temos ETFs conhecidos na amostra
    const knownETFs = ['SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'VEA', 'VWO', 'AGG', 'TLT', 'GLD'];
    const sample = [];

    // Adicionar ETFs conhecidos se disponíveis
    for (const symbol of knownETFs) {
      const etf = allETFs.find(e => e.symbol === symbol);
      if (etf && sample.length < sampleSize) {
        sample.push(etf);
      }
    }

    // Completar amostra com ETFs aleatórios
    const remaining = allETFs.filter(e => !sample.some(s => s.symbol === e.symbol));
    while (sample.length < sampleSize && remaining.length > 0) {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      sample.push(remaining.splice(randomIndex, 1)[0]);
    }

    return sample.slice(0, sampleSize);
  }

  /**
   * Verifica status das tabelas históricas
   */
  async checkHistoricalTablesStatus() {
    this.logger.info('🔍 Verificando status das tabelas históricas...');

    try {
      const tablesExist = await this.schemaManager.checkTablesExist();
      
      for (const [tableName, exists] of Object.entries(tablesExist)) {
        if (exists) {
          // Contar registros
          const countResult = await this.supabase.execute_sql({
            project_id: this.config.projectId,
            query: `SELECT COUNT(*) as count FROM ${tableName}`
          });
          
          const count = countResult.data?.[0]?.count || 0;
          this.logger.info(`✓ ${tableName}: ${count} registros`);
        } else {
          this.logger.warn(`✗ ${tableName}: não existe`);
        }
      }

      return tablesExist;

    } catch (error) {
      this.logger.error('❌ Erro ao verificar status das tabelas:', error.message);
      throw error;
    }
  }

  /**
   * Limpa dados históricos (usar com cuidado!)
   */
  async clearHistoricalData(tableName = null) {
    this.logger.warn(`⚠️ Limpando dados históricos${tableName ? ` da tabela ${tableName}` : ' de todas as tabelas'}`);

    try {
      if (tableName) {
        await this.supabase.execute_sql({
          project_id: this.config.projectId,
          query: `TRUNCATE TABLE ${tableName} CASCADE`
        });
        this.logger.info(`✓ Tabela ${tableName} limpa`);
      } else {
        // Limpar todas as tabelas históricas
        const tables = ['historic_etfs_dividends', 'etf_prices']; // Ordem importante para FKs
        
        for (const table of tables) {
          await this.supabase.execute_sql({
            project_id: this.config.projectId,
            query: `TRUNCATE TABLE ${table} CASCADE`
          });
          this.logger.info(`✓ Tabela ${table} limpa`);
        }
      }

    } catch (error) {
      this.logger.error('❌ Erro ao limpar dados históricos:', error.message);
      throw error;
    }
  }

  /**
   * Gera relatório de cobertura de dados
   */
  async generateCoverageReport() {
    this.logger.info('📊 Gerando relatório de cobertura de dados...');

    try {
      // ETFs com dados de preços
      const pricesResult = await this.supabase.execute_sql({
        project_id: this.config.projectId,
        query: `
          SELECT 
            symbol,
            COUNT(*) as price_records,
            MIN(date) as first_date,
            MAX(date) as last_date
          FROM etf_prices 
          GROUP BY symbol 
          ORDER BY price_records DESC
        `
      });

      // ETFs com dados de dividendos
      const dividendsResult = await this.supabase.execute_sql({
        project_id: this.config.projectId,
        query: `
          SELECT 
            symbol,
            COUNT(*) as dividend_records,
            MIN(ex_date) as first_dividend,
            MAX(ex_date) as last_dividend
          FROM historic_etfs_dividends 
          GROUP BY symbol 
          ORDER BY dividend_records DESC
        `
      });

      // ETFs com métricas calculadas
      const metricsResult = await this.supabase.execute_sql({
        project_id: this.config.projectId,
        query: `
          SELECT 
            symbol,
            CASE WHEN returns_12m IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN volatility_12m IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN sharpe_12m IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN max_drawdown IS NOT NULL THEN 1 ELSE 0 END as metrics_count
          FROM etfs_ativos_reais 
          WHERE symbol IS NOT NULL
          ORDER BY metrics_count DESC
        `
      });

      const report = {
        prices: pricesResult.data || [],
        dividends: dividendsResult.data || [],
        metrics: metricsResult.data || [],
        summary: {
          etfs_with_prices: (pricesResult.data || []).length,
          etfs_with_dividends: (dividendsResult.data || []).length,
          etfs_with_metrics: (metricsResult.data || []).filter(m => m.metrics_count > 0).length,
          total_price_records: (pricesResult.data || []).reduce((sum, e) => sum + parseInt(e.price_records), 0),
          total_dividend_records: (dividendsResult.data || []).reduce((sum, e) => sum + parseInt(e.dividend_records), 0)
        }
      };

      this.logger.info('📊 Relatório de Cobertura:', JSON.stringify(report.summary, null, 2));
      return report;

    } catch (error) {
      this.logger.error('❌ Erro ao gerar relatório de cobertura:', error.message);
      throw error;
    }
  }

  /**
   * Reprocessa métricas para ETFs que já têm dados históricos
   */
  async reprocessMetrics(symbols = null) {
    this.logger.info(`🔄 Reprocessando métricas${symbols ? ` para: ${symbols.join(', ')}` : ' para todos os ETFs'}`);

    try {
      let targetETFs;
      
      if (symbols) {
        targetETFs = symbols;
      } else {
        // Buscar ETFs que têm dados históricos
        const etfsWithDataResult = await this.supabase.execute_sql({
          project_id: this.config.projectId,
          query: `
            SELECT DISTINCT p.symbol 
            FROM etf_prices p
            INNER JOIN etfs_ativos_reais e ON p.symbol = e.symbol
            ORDER BY p.symbol
          `
        });
        
        targetETFs = (etfsWithDataResult.data || []).map(row => row.symbol);
      }

      if (targetETFs.length === 0) {
        this.logger.warn('⚠️ Nenhum ETF encontrado para reprocessamento');
        return { success: 0, errors: 0, total: 0 };
      }

      this.logger.info(`🎯 Reprocessando ${targetETFs.length} ETFs`);
      
      const results = await this.metricsProcessor.processSpecificETFs(targetETFs);
      
      this.logger.success(`✅ Reprocessamento concluído: ${results.success}/${results.total} ETFs`);
      return results;

    } catch (error) {
      this.logger.error('❌ Erro no reprocessamento:', error.message);
      throw error;
    }
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

module.exports = { HistoricalPipeline }; 
const { MetricsProcessor } = require('./processors/metrics-processor');
const { PipelineLogger } = require('./utils/logger');

class HistoricalPipeline {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.logger = new PipelineLogger('Historical Pipeline');
    this.schemaManager = new HistoricalSchemaManager(supabaseClient);
    this.metricsProcessor = new MetricsProcessor(supabaseClient, this.logger);
    
    this.config = {
      projectId: 'nniabnjuwzeqmflrruga',
      targetEndDate: '2025-05-15',
      batchSize: 10,
      maxRetries: 3
    };
  }

  /**
   * Executa o pipeline completo de dados históricos
   */
  async run(options = {}) {
    const startTime = Date.now();
    this.logger.info('🚀 Iniciando Pipeline de Dados Históricos');
    
    try {
      // 1. Configurar opções
      const config = {
        setupTables: options.setupTables !== false,
        processAll: options.processAll !== false,
        specificETFs: options.specificETFs || null,
        sampleSize: options.sampleSize || null
      };

      this.logger.info(`📋 Configuração:`, config);

      // 2. Setup das tabelas históricas
      if (config.setupTables) {
        await this.setupHistoricalTables();
      }

      // 3. Processar ETFs
      let results;
      if (config.specificETFs && config.specificETFs.length > 0) {
        results = await this.metricsProcessor.processSpecificETFs(config.specificETFs);
      } else if (config.sampleSize) {
        results = await this.processSampleETFs(config.sampleSize);
      } else {
        results = await this.metricsProcessor.processAllActiveETFs();
      }

      // 4. Gerar relatório final
      const report = this.metricsProcessor.generateProcessingReport(results);
      const duration = Date.now() - startTime;

      this.logger.success(`✅ Pipeline concluído em ${this.formatDuration(duration)}`);
      this.logger.info('📊 Relatório Final:', JSON.stringify(report.summary, null, 2));

      return {
        success: true,
        duration,
        results,
        report
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Pipeline falhou após ${this.formatDuration(duration)}:`, error.message);
      
      return {
        success: false,
        duration,
        error: error.message,
        results: null
      };
    }
  }

  /**
   * Configura as tabelas históricas
   */
  async setupHistoricalTables() {
    this.logger.info('🔧 Configurando tabelas históricas...');

    try {
      // Verificar se tabelas já existem
      const existingTables = await this.schemaManager.checkTablesExist();
      this.logger.info('📋 Status das tabelas:', existingTables);

      const tablesToCreate = [];
      for (const [tableName, exists] of Object.entries(existingTables)) {
        if (!exists) {
          tablesToCreate.push(tableName);
        }
      }

      if (tablesToCreate.length > 0) {
        this.logger.info(`🏗️ Criando tabelas: ${tablesToCreate.join(', ')}`);
        const createResults = await this.schemaManager.createHistoricalTables();
        
        if (createResults.errors.length > 0) {
          this.logger.warn('⚠️ Alguns erros durante criação das tabelas:', createResults.errors);
        }

        this.logger.success(`✅ Tabelas criadas: ${createResults.success.join(', ')}`);
      } else {
        this.logger.info('✓ Todas as tabelas históricas já existem');
      }

    } catch (error) {
      this.logger.error('❌ Erro ao configurar tabelas históricas:', error.message);
      throw error;
    }
  }

  /**
   * Processa uma amostra de ETFs para teste
   */
  async processSampleETFs(sampleSize) {
    this.logger.info(`🎯 Processando amostra de ${sampleSize} ETFs`);

    try {
      // Buscar ETFs ativos
      const allETFs = await this.metricsProcessor.getActiveETFs();
      
      if (allETFs.length === 0) {
        throw new Error('Nenhum ETF ativo encontrado');
      }

      // Selecionar amostra
      const sampleETFs = this.selectSampleETFs(allETFs, sampleSize);
      this.logger.info(`📊 Amostra selecionada: ${sampleETFs.map(e => e.symbol).join(', ')}`);

      // Processar amostra
      const results = await this.metricsProcessor.processSpecificETFs(
        sampleETFs.map(e => e.symbol)
      );

      return results;

    } catch (error) {
      this.logger.error('❌ Erro ao processar amostra:', error.message);
      throw error;
    }
  }

  /**
   * Seleciona uma amostra representativa de ETFs
   */
  selectSampleETFs(allETFs, sampleSize) {
    // Garantir que temos ETFs conhecidos na amostra
    const knownETFs = ['SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'VEA', 'VWO', 'AGG', 'TLT', 'GLD'];
    const sample = [];

    // Adicionar ETFs conhecidos se disponíveis
    for (const symbol of knownETFs) {
      const etf = allETFs.find(e => e.symbol === symbol);
      if (etf && sample.length < sampleSize) {
        sample.push(etf);
      }
    }

    // Completar amostra com ETFs aleatórios
    const remaining = allETFs.filter(e => !sample.some(s => s.symbol === e.symbol));
    while (sample.length < sampleSize && remaining.length > 0) {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      sample.push(remaining.splice(randomIndex, 1)[0]);
    }

    return sample.slice(0, sampleSize);
  }

  /**
   * Verifica status das tabelas históricas
   */
  async checkHistoricalTablesStatus() {
    this.logger.info('🔍 Verificando status das tabelas históricas...');

    try {
      const tablesExist = await this.schemaManager.checkTablesExist();
      
      for (const [tableName, exists] of Object.entries(tablesExist)) {
        if (exists) {
          // Contar registros
          const countResult = await this.supabase.execute_sql({
            project_id: this.config.projectId,
            query: `SELECT COUNT(*) as count FROM ${tableName}`
          });
          
          const count = countResult.data?.[0]?.count || 0;
          this.logger.info(`✓ ${tableName}: ${count} registros`);
        } else {
          this.logger.warn(`✗ ${tableName}: não existe`);
        }
      }

      return tablesExist;

    } catch (error) {
      this.logger.error('❌ Erro ao verificar status das tabelas:', error.message);
      throw error;
    }
  }

  /**
   * Limpa dados históricos (usar com cuidado!)
   */
  async clearHistoricalData(tableName = null) {
    this.logger.warn(`⚠️ Limpando dados históricos${tableName ? ` da tabela ${tableName}` : ' de todas as tabelas'}`);

    try {
      if (tableName) {
        await this.supabase.execute_sql({
          project_id: this.config.projectId,
          query: `TRUNCATE TABLE ${tableName} CASCADE`
        });
        this.logger.info(`✓ Tabela ${tableName} limpa`);
      } else {
        // Limpar todas as tabelas históricas
        const tables = ['historic_etfs_dividends', 'etf_prices']; // Ordem importante para FKs
        
        for (const table of tables) {
          await this.supabase.execute_sql({
            project_id: this.config.projectId,
            query: `TRUNCATE TABLE ${table} CASCADE`
          });
          this.logger.info(`✓ Tabela ${table} limpa`);
        }
      }

    } catch (error) {
      this.logger.error('❌ Erro ao limpar dados históricos:', error.message);
      throw error;
    }
  }

  /**
   * Gera relatório de cobertura de dados
   */
  async generateCoverageReport() {
    this.logger.info('📊 Gerando relatório de cobertura de dados...');

    try {
      // ETFs com dados de preços
      const pricesResult = await this.supabase.execute_sql({
        project_id: this.config.projectId,
        query: `
          SELECT 
            symbol,
            COUNT(*) as price_records,
            MIN(date) as first_date,
            MAX(date) as last_date
          FROM etf_prices 
          GROUP BY symbol 
          ORDER BY price_records DESC
        `
      });

      // ETFs com dados de dividendos
      const dividendsResult = await this.supabase.execute_sql({
        project_id: this.config.projectId,
        query: `
          SELECT 
            symbol,
            COUNT(*) as dividend_records,
            MIN(ex_date) as first_dividend,
            MAX(ex_date) as last_dividend
          FROM historic_etfs_dividends 
          GROUP BY symbol 
          ORDER BY dividend_records DESC
        `
      });

      // ETFs com métricas calculadas
      const metricsResult = await this.supabase.execute_sql({
        project_id: this.config.projectId,
        query: `
          SELECT 
            symbol,
            CASE WHEN returns_12m IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN volatility_12m IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN sharpe_12m IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN max_drawdown IS NOT NULL THEN 1 ELSE 0 END as metrics_count
          FROM etfs_ativos_reais 
          WHERE symbol IS NOT NULL
          ORDER BY metrics_count DESC
        `
      });

      const report = {
        prices: pricesResult.data || [],
        dividends: dividendsResult.data || [],
        metrics: metricsResult.data || [],
        summary: {
          etfs_with_prices: (pricesResult.data || []).length,
          etfs_with_dividends: (dividendsResult.data || []).length,
          etfs_with_metrics: (metricsResult.data || []).filter(m => m.metrics_count > 0).length,
          total_price_records: (pricesResult.data || []).reduce((sum, e) => sum + parseInt(e.price_records), 0),
          total_dividend_records: (dividendsResult.data || []).reduce((sum, e) => sum + parseInt(e.dividend_records), 0)
        }
      };

      this.logger.info('📊 Relatório de Cobertura:', JSON.stringify(report.summary, null, 2));
      return report;

    } catch (error) {
      this.logger.error('❌ Erro ao gerar relatório de cobertura:', error.message);
      throw error;
    }
  }

  /**
   * Reprocessa métricas para ETFs que já têm dados históricos
   */
  async reprocessMetrics(symbols = null) {
    this.logger.info(`🔄 Reprocessando métricas${symbols ? ` para: ${symbols.join(', ')}` : ' para todos os ETFs'}`);

    try {
      let targetETFs;
      
      if (symbols) {
        targetETFs = symbols;
      } else {
        // Buscar ETFs que têm dados históricos
        const etfsWithDataResult = await this.supabase.execute_sql({
          project_id: this.config.projectId,
          query: `
            SELECT DISTINCT p.symbol 
            FROM etf_prices p
            INNER JOIN etfs_ativos_reais e ON p.symbol = e.symbol
            ORDER BY p.symbol
          `
        });
        
        targetETFs = (etfsWithDataResult.data || []).map(row => row.symbol);
      }

      if (targetETFs.length === 0) {
        this.logger.warn('⚠️ Nenhum ETF encontrado para reprocessamento');
        return { success: 0, errors: 0, total: 0 };
      }

      this.logger.info(`🎯 Reprocessando ${targetETFs.length} ETFs`);
      
      const results = await this.metricsProcessor.processSpecificETFs(targetETFs);
      
      this.logger.success(`✅ Reprocessamento concluído: ${results.success}/${results.total} ETFs`);
      return results;

    } catch (error) {
      this.logger.error('❌ Erro no reprocessamento:', error.message);
      throw error;
    }
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

module.exports = { HistoricalPipeline }; 