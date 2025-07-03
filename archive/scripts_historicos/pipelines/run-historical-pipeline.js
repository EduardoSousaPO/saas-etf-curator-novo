#!/usr/bin/env node

const { HistoricalPipeline } = require('./etf-pipeline/historical-pipeline');

// Mock do cliente Supabase para demonstração
const mockSupabaseClient = {
  async execute_sql({ project_id, query }) {
    console.log(`🔍 Executando SQL no projeto ${project_id}:`);
    console.log(query.substring(0, 100) + '...');
    
    // Simular resultados baseados no tipo de query
    if (query.includes('CREATE TABLE')) {
      return { success: true };
    } else if (query.includes('SELECT EXISTS')) {
      return { data: [{ exists: true }] };
    } else if (query.includes('COUNT(*)')) {
      return { data: [{ count: Math.floor(Math.random() * 1000) }] };
    } else if (query.includes('SELECT symbol, name, inceptiondate')) {
      // Simular ETFs ativos
      return {
        data: [
          { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', inceptiondate: '1993-01-22', nav: 420.50 },
          { symbol: 'QQQ', name: 'Invesco QQQ Trust', inceptiondate: '1999-03-10', nav: 350.25 },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', inceptiondate: '2001-05-24', nav: 220.75 },
          { symbol: 'IWM', name: 'iShares Russell 2000 ETF', inceptiondate: '2000-05-22', nav: 180.30 },
          { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', inceptiondate: '2001-08-14', nav: 75.80 }
        ]
      };
    } else if (query.includes('FROM etf_prices') || query.includes('FROM historic_etfs_dividends')) {
      return { data: [] }; // Simular dados vazios inicialmente
    } else if (query.includes('INSERT INTO') || query.includes('UPDATE')) {
      return { success: true };
    }
    
    return { data: [] };
  }
};

async function main() {
  console.log('🚀 ETF Historical Data Pipeline');
  console.log('================================\n');

  // Parse argumentos da linha de comando
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  try {
    // Criar instância do pipeline
    const pipeline = new HistoricalPipeline(mockSupabaseClient);

    // Executar pipeline baseado nas opções
    if (options.command === 'run') {
      await runPipeline(pipeline, options);
    } else if (options.command === 'status') {
      await checkStatus(pipeline);
    } else if (options.command === 'coverage') {
      await generateCoverageReport(pipeline);
    } else if (options.command === 'reprocess') {
      await reprocessMetrics(pipeline, options);
    } else if (options.command === 'clear') {
      await clearData(pipeline, options);
    } else {
      showHelp();
    }

  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    process.exit(1);
  }
}

async function runPipeline(pipeline, options) {
  console.log('🚀 Executando pipeline de dados históricos...\n');

  const pipelineOptions = {
    setupTables: !options.skipSetup,
    processAll: !options.sample && !options.etfs,
    sampleSize: options.sample,
    specificETFs: options.etfs
  };

  console.log('📋 Configurações:');
  console.log(`   - Setup de tabelas: ${pipelineOptions.setupTables ? 'Sim' : 'Não'}`);
  console.log(`   - Processar todos: ${pipelineOptions.processAll ? 'Sim' : 'Não'}`);
  if (pipelineOptions.sampleSize) {
    console.log(`   - Amostra: ${pipelineOptions.sampleSize} ETFs`);
  }
  if (pipelineOptions.specificETFs) {
    console.log(`   - ETFs específicos: ${pipelineOptions.specificETFs.join(', ')}`);
  }
  console.log();

  const result = await pipeline.run(pipelineOptions);

  if (result.success) {
    console.log('\n✅ Pipeline executado com sucesso!');
    console.log(`⏱️  Duração: ${pipeline.formatDuration(result.duration)}`);
    console.log('\n📊 Resultados:');
    console.log(`   - Total: ${result.results.total}`);
    console.log(`   - Sucessos: ${result.results.success}`);
    console.log(`   - Erros: ${result.results.errors}`);
    console.log(`   - Taxa de sucesso: ${result.report.summary.successRate}`);

    if (result.results.errors > 0) {
      console.log('\n⚠️ ETFs com erro:');
      result.report.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error.symbol}: ${error.error}`);
      });
    }
  } else {
    console.log('\n❌ Pipeline falhou!');
    console.log(`❌ Erro: ${result.error}`);
  }
}

async function checkStatus(pipeline) {
  console.log('🔍 Verificando status das tabelas históricas...\n');
  
  const status = await pipeline.checkHistoricalTablesStatus();
  
  console.log('\n📋 Status das Tabelas:');
  for (const [tableName, exists] of Object.entries(status)) {
    console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
  }
}

async function generateCoverageReport(pipeline) {
  console.log('📊 Gerando relatório de cobertura...\n');
  
  const report = await pipeline.generateCoverageReport();
  
  console.log('📊 Relatório de Cobertura:');
  console.log(`   - ETFs com preços: ${report.summary.etfs_with_prices}`);
  console.log(`   - ETFs com dividendos: ${report.summary.etfs_with_dividends}`);
  console.log(`   - ETFs com métricas: ${report.summary.etfs_with_metrics}`);
  console.log(`   - Total registros de preços: ${report.summary.total_price_records}`);
  console.log(`   - Total registros de dividendos: ${report.summary.total_dividend_records}`);

  if (report.prices.length > 0) {
    console.log('\n🏆 Top 5 ETFs por registros de preços:');
    report.prices.slice(0, 5).forEach((etf, index) => {
      console.log(`   ${index + 1}. ${etf.symbol}: ${etf.price_records} registros`);
    });
  }
}

async function reprocessMetrics(pipeline, options) {
  console.log('🔄 Reprocessando métricas...\n');
  
  const result = await pipeline.reprocessMetrics(options.etfs);
  
  console.log(`✅ Reprocessamento concluído: ${result.success}/${result.total} ETFs`);
}

async function clearData(pipeline, options) {
  console.log('⚠️  Limpando dados históricos...\n');
  
  if (!options.confirm) {
    console.log('❌ Use --confirm para confirmar a limpeza de dados');
    return;
  }
  
  await pipeline.clearHistoricalData(options.table);
  console.log('✅ Dados limpos com sucesso');
}

function parseArguments(args) {
  const options = {
    command: 'run',
    sample: null,
    etfs: null,
    skipSetup: false,
    table: null,
    confirm: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case 'run':
      case 'status':
      case 'coverage':
      case 'reprocess':
      case 'clear':
        options.command = arg;
        break;
      case '--sample':
        options.sample = parseInt(args[++i]) || 10;
        break;
      case '--etfs':
        options.etfs = args[++i].split(',').map(s => s.trim());
        break;
      case '--skip-setup':
        options.skipSetup = true;
        break;
      case '--table':
        options.table = args[++i];
        break;
      case '--confirm':
        options.confirm = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🚀 ETF Historical Data Pipeline

COMANDOS:
  run                    Executa o pipeline completo (padrão)
  status                 Verifica status das tabelas históricas
  coverage               Gera relatório de cobertura de dados
  reprocess              Reprocessa métricas para ETFs existentes
  clear                  Limpa dados históricos (use com cuidado!)

OPÇÕES:
  --sample <n>           Processa apenas uma amostra de n ETFs
  --etfs <lista>         Processa ETFs específicos (separados por vírgula)
  --skip-setup           Pula a criação/verificação das tabelas
  --table <nome>         Especifica tabela para limpeza (clear)
  --confirm              Confirma operações destrutivas
  --help, -h             Mostra esta ajuda

EXEMPLOS:
  node run-historical-pipeline.js run
  node run-historical-pipeline.js run --sample 20
  node run-historical-pipeline.js run --etfs SPY,QQQ,VTI
  node run-historical-pipeline.js status
  node run-historical-pipeline.js coverage
  node run-historical-pipeline.js reprocess --etfs SPY,QQQ
  node run-historical-pipeline.js clear --table etf_prices --confirm

NOTAS:
  - O pipeline coleta dados históricos dos últimos 10 anos até 15/05/2025
  - ETFs com menos de 10 anos usam dados desde a inception
  - Métricas calculadas: returns, volatility, sharpe ratios, max drawdown, dividends
  - Dados são armazenados nas tabelas etf_prices e historic_etfs_dividends
  `);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { main, parseArguments }; 

const { HistoricalPipeline } = require('./etf-pipeline/historical-pipeline');

// Mock do cliente Supabase para demonstração
const mockSupabaseClient = {
  async execute_sql({ project_id, query }) {
    console.log(`🔍 Executando SQL no projeto ${project_id}:`);
    console.log(query.substring(0, 100) + '...');
    
    // Simular resultados baseados no tipo de query
    if (query.includes('CREATE TABLE')) {
      return { success: true };
    } else if (query.includes('SELECT EXISTS')) {
      return { data: [{ exists: true }] };
    } else if (query.includes('COUNT(*)')) {
      return { data: [{ count: Math.floor(Math.random() * 1000) }] };
    } else if (query.includes('SELECT symbol, name, inceptiondate')) {
      // Simular ETFs ativos
      return {
        data: [
          { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', inceptiondate: '1993-01-22', nav: 420.50 },
          { symbol: 'QQQ', name: 'Invesco QQQ Trust', inceptiondate: '1999-03-10', nav: 350.25 },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', inceptiondate: '2001-05-24', nav: 220.75 },
          { symbol: 'IWM', name: 'iShares Russell 2000 ETF', inceptiondate: '2000-05-22', nav: 180.30 },
          { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', inceptiondate: '2001-08-14', nav: 75.80 }
        ]
      };
    } else if (query.includes('FROM etf_prices') || query.includes('FROM historic_etfs_dividends')) {
      return { data: [] }; // Simular dados vazios inicialmente
    } else if (query.includes('INSERT INTO') || query.includes('UPDATE')) {
      return { success: true };
    }
    
    return { data: [] };
  }
};

async function main() {
  console.log('🚀 ETF Historical Data Pipeline');
  console.log('================================\n');

  // Parse argumentos da linha de comando
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  try {
    // Criar instância do pipeline
    const pipeline = new HistoricalPipeline(mockSupabaseClient);

    // Executar pipeline baseado nas opções
    if (options.command === 'run') {
      await runPipeline(pipeline, options);
    } else if (options.command === 'status') {
      await checkStatus(pipeline);
    } else if (options.command === 'coverage') {
      await generateCoverageReport(pipeline);
    } else if (options.command === 'reprocess') {
      await reprocessMetrics(pipeline, options);
    } else if (options.command === 'clear') {
      await clearData(pipeline, options);
    } else {
      showHelp();
    }

  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    process.exit(1);
  }
}

async function runPipeline(pipeline, options) {
  console.log('🚀 Executando pipeline de dados históricos...\n');

  const pipelineOptions = {
    setupTables: !options.skipSetup,
    processAll: !options.sample && !options.etfs,
    sampleSize: options.sample,
    specificETFs: options.etfs
  };

  console.log('📋 Configurações:');
  console.log(`   - Setup de tabelas: ${pipelineOptions.setupTables ? 'Sim' : 'Não'}`);
  console.log(`   - Processar todos: ${pipelineOptions.processAll ? 'Sim' : 'Não'}`);
  if (pipelineOptions.sampleSize) {
    console.log(`   - Amostra: ${pipelineOptions.sampleSize} ETFs`);
  }
  if (pipelineOptions.specificETFs) {
    console.log(`   - ETFs específicos: ${pipelineOptions.specificETFs.join(', ')}`);
  }
  console.log();

  const result = await pipeline.run(pipelineOptions);

  if (result.success) {
    console.log('\n✅ Pipeline executado com sucesso!');
    console.log(`⏱️  Duração: ${pipeline.formatDuration(result.duration)}`);
    console.log('\n📊 Resultados:');
    console.log(`   - Total: ${result.results.total}`);
    console.log(`   - Sucessos: ${result.results.success}`);
    console.log(`   - Erros: ${result.results.errors}`);
    console.log(`   - Taxa de sucesso: ${result.report.summary.successRate}`);

    if (result.results.errors > 0) {
      console.log('\n⚠️ ETFs com erro:');
      result.report.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error.symbol}: ${error.error}`);
      });
    }
  } else {
    console.log('\n❌ Pipeline falhou!');
    console.log(`❌ Erro: ${result.error}`);
  }
}

async function checkStatus(pipeline) {
  console.log('🔍 Verificando status das tabelas históricas...\n');
  
  const status = await pipeline.checkHistoricalTablesStatus();
  
  console.log('\n📋 Status das Tabelas:');
  for (const [tableName, exists] of Object.entries(status)) {
    console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
  }
}

async function generateCoverageReport(pipeline) {
  console.log('📊 Gerando relatório de cobertura...\n');
  
  const report = await pipeline.generateCoverageReport();
  
  console.log('📊 Relatório de Cobertura:');
  console.log(`   - ETFs com preços: ${report.summary.etfs_with_prices}`);
  console.log(`   - ETFs com dividendos: ${report.summary.etfs_with_dividends}`);
  console.log(`   - ETFs com métricas: ${report.summary.etfs_with_metrics}`);
  console.log(`   - Total registros de preços: ${report.summary.total_price_records}`);
  console.log(`   - Total registros de dividendos: ${report.summary.total_dividend_records}`);

  if (report.prices.length > 0) {
    console.log('\n🏆 Top 5 ETFs por registros de preços:');
    report.prices.slice(0, 5).forEach((etf, index) => {
      console.log(`   ${index + 1}. ${etf.symbol}: ${etf.price_records} registros`);
    });
  }
}

async function reprocessMetrics(pipeline, options) {
  console.log('🔄 Reprocessando métricas...\n');
  
  const result = await pipeline.reprocessMetrics(options.etfs);
  
  console.log(`✅ Reprocessamento concluído: ${result.success}/${result.total} ETFs`);
}

async function clearData(pipeline, options) {
  console.log('⚠️  Limpando dados históricos...\n');
  
  if (!options.confirm) {
    console.log('❌ Use --confirm para confirmar a limpeza de dados');
    return;
  }
  
  await pipeline.clearHistoricalData(options.table);
  console.log('✅ Dados limpos com sucesso');
}

function parseArguments(args) {
  const options = {
    command: 'run',
    sample: null,
    etfs: null,
    skipSetup: false,
    table: null,
    confirm: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case 'run':
      case 'status':
      case 'coverage':
      case 'reprocess':
      case 'clear':
        options.command = arg;
        break;
      case '--sample':
        options.sample = parseInt(args[++i]) || 10;
        break;
      case '--etfs':
        options.etfs = args[++i].split(',').map(s => s.trim());
        break;
      case '--skip-setup':
        options.skipSetup = true;
        break;
      case '--table':
        options.table = args[++i];
        break;
      case '--confirm':
        options.confirm = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🚀 ETF Historical Data Pipeline

COMANDOS:
  run                    Executa o pipeline completo (padrão)
  status                 Verifica status das tabelas históricas
  coverage               Gera relatório de cobertura de dados
  reprocess              Reprocessa métricas para ETFs existentes
  clear                  Limpa dados históricos (use com cuidado!)

OPÇÕES:
  --sample <n>           Processa apenas uma amostra de n ETFs
  --etfs <lista>         Processa ETFs específicos (separados por vírgula)
  --skip-setup           Pula a criação/verificação das tabelas
  --table <nome>         Especifica tabela para limpeza (clear)
  --confirm              Confirma operações destrutivas
  --help, -h             Mostra esta ajuda

EXEMPLOS:
  node run-historical-pipeline.js run
  node run-historical-pipeline.js run --sample 20
  node run-historical-pipeline.js run --etfs SPY,QQQ,VTI
  node run-historical-pipeline.js status
  node run-historical-pipeline.js coverage
  node run-historical-pipeline.js reprocess --etfs SPY,QQQ
  node run-historical-pipeline.js clear --table etf_prices --confirm

NOTAS:
  - O pipeline coleta dados históricos dos últimos 10 anos até 15/05/2025
  - ETFs com menos de 10 anos usam dados desde a inception
  - Métricas calculadas: returns, volatility, sharpe ratios, max drawdown, dividends
  - Dados são armazenados nas tabelas etf_prices e historic_etfs_dividends
  `);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { main, parseArguments }; 