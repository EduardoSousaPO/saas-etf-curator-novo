/**
 * DEMONSTRAÇÃO DO PIPELINE DE ETFs
 * 
 * Este script demonstra como executar o pipeline completo de coleta de dados
 * de ETFs usando os MCPs reais (Supabase, Excel, Memory, etc.).
 * 
 * Para executar: node scripts/etf-pipeline/demo.js
 */

import { runEtfPipeline } from './main.js';
import { logger } from './utils/logger.js';

/**
 * Simulação dos clientes MCP
 * Em produção, estes seriam os clientes MCP reais
 */
class MockMCPClients {
  constructor() {
    this.supabase = new MockSupabaseClient();
    this.excel = new MockExcelClient();
    this.memory = new MockMemoryClient();
  }
}

/**
 * Cliente mock do Supabase
 * Em produção, seria o MCP Supabase real
 */
class MockSupabaseClient {
  constructor() {
    this.projectId = 'nniabnjuwzeqmflrruga';
  }

  async execute_sql({ project_id, query }) {
    logger.debug(`Executando SQL: ${query.substring(0, 100)}...`);
    
    // Simular diferentes tipos de queries
    if (query.includes('SELECT COUNT(*)')) {
      return [{ total: Math.floor(Math.random() * 10) }];
    }
    
    if (query.includes('SELECT symbol FROM')) {
      // Simular que alguns ETFs já existem
      return Math.random() < 0.1 ? [{ symbol: 'SPY' }] : [];
    }
    
    if (query.includes('INSERT INTO') || query.includes('CREATE TABLE')) {
      // Simular sucesso na inserção/criação
      await this.delay(100 + Math.random() * 300);
      return { success: true };
    }
    
    return [];
  }

  async apply_migration({ project_id, name, query }) {
    logger.debug(`Aplicando migration: ${name}`);
    await this.delay(500 + Math.random() * 1000);
    return { success: true, migration: name };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Cliente mock do Excel
 * Em produção, seria o MCP Excel real
 */
class MockExcelClient {
  async read_excel_file({ file_path, sheet_name = 0, nrows = null }) {
    logger.debug(`Lendo arquivo Excel: ${file_path}`);
    
    // Simular leitura da planilha real
    await this.delay(1000 + Math.random() * 2000);
    
    // Retornar dados simulados baseados na estrutura real
    const mockData = this.generateMockExcelData(nrows || 50);
    
    return {
      data: mockData,
      shape: [mockData.length, Object.keys(mockData[0] || {}).length],
      columns: ['symbol', 'name', 'price', 'exchange', 'exchangeShortName', 'type']
    };
  }

  async list_excel_sheets({ file_path }) {
    logger.debug(`Listando sheets do arquivo: ${file_path}`);
    await this.delay(200);
    return ['Sheet1', 'ETFs_USA'];
  }

  generateMockExcelData(count) {
    const etfs = [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 445.67, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 378.12, exchange: 'NASDAQ', exchangeShortName: 'NASDAQ', type: 'etf' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 234.89, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'IWM', name: 'iShares Russell 2000 ETF', price: 198.45, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', price: 67.23, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'VWO', name: 'Vanguard Emerging Markets Stock Index Fund', price: 41.78, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'GLD', name: 'SPDR Gold Shares', price: 189.34, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', price: 93.56, exchange: 'NASDAQ', exchangeShortName: 'NASDAQ', type: 'etf' },
      { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', price: 34.12, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', price: 178.90, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'ARKK', name: 'ARK Innovation ETF', price: 45.67, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', price: 76.89, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', price: 109.23, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', price: 58.45, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', price: 78.12, exchange: 'NASDAQ', exchangeShortName: 'NASDAQ', type: 'etf' }
    ];
    
    // Retornar quantidade solicitada, repetindo se necessário
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(etfs[i % etfs.length]);
    }
    
    return result;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Cliente mock do Memory
 * Em produção, seria o MCP Memory real
 */
class MockMemoryClient {
  constructor() {
    this.memory = new Map();
  }

  async create_entities({ entities }) {
    logger.debug(`Criando ${entities.length} entidades no memory`);
    entities.forEach(entity => {
      this.memory.set(entity.name, entity);
    });
    return { success: true, created: entities.length };
  }

  async search_nodes({ query }) {
    logger.debug(`Buscando nodes: ${query}`);
    const results = Array.from(this.memory.values()).filter(entity => 
      entity.name.toLowerCase().includes(query.toLowerCase()) ||
      entity.observations.some(obs => obs.toLowerCase().includes(query.toLowerCase()))
    );
    return { nodes: results };
  }

  async add_observations({ observations }) {
    logger.debug(`Adicionando observações para ${observations.length} entidades`);
    observations.forEach(obs => {
      const entity = this.memory.get(obs.entityName);
      if (entity) {
        entity.observations.push(...obs.contents);
      }
    });
    return { success: true };
  }
}

/**
 * Função principal da demonstração
 */
async function runDemo() {
  console.log('🚀 INICIANDO DEMONSTRAÇÃO DO PIPELINE DE ETFs');
  console.log('='.repeat(60));
  
  try {
    // Configurar clientes MCP mock
    const clients = new MockMCPClients();
    
    // Caminho do arquivo Excel (simulado)
    const excelFilePath = 'C:\\Users\\edusp\\Projetos_App_Desktop\\etf_curator\\etfcurator\\etfs_eua.xlsx';
    
    logger.info('🔧 Configurando pipeline com clientes MCP...');
    logger.info(`📁 Arquivo Excel: ${excelFilePath}`);
    
    // Executar pipeline
    const startTime = Date.now();
    const report = await runEtfPipeline(excelFilePath, clients);
    const endTime = Date.now();
    
    // Exibir resultados
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`⏱️  Tempo total: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`📊 ETFs processados: ${report.pipeline.totalEtfsProcessed}`);
    console.log(`✅ Sucessos: ${report.pipeline.successful}`);
    console.log(`❌ Falhas: ${report.pipeline.failed}`);
    console.log(`⏭️  Pulados: ${report.pipeline.skipped}`);
    console.log(`💾 Salvos no banco: ${report.pipeline.savedToDatabase}`);
    
    console.log('\n📈 ESTATÍSTICAS DE CAMPOS:');
    Object.entries(report.fieldStatistics.fieldsWithData).forEach(([field, percentage]) => {
      console.log(`  ${field}: ${percentage}`);
    });
    
    console.log('\n💡 RECOMENDAÇÕES:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n📋 RELATÓRIO COMPLETO SALVO NOS LOGS');
    console.log('='.repeat(60));
    
    return report;
    
  } catch (error) {
    console.error('\n❌ ERRO NA DEMONSTRAÇÃO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

/**
 * Função para testar apenas a coleta de dados de um ETF específico
 */
async function testSingleEtf(symbol = 'SPY') {
  console.log(`🧪 TESTANDO COLETA DE DADOS PARA ${symbol}`);
  console.log('='.repeat(40));
  
  try {
    const { yfinanceCollector } = await import('./collectors/yfinance-collector.js');
    const { fallbackCollector } = await import('./collectors/fallback-collector.js');
    
    // Testar yfinance
    console.log('📊 Testando yfinance collector...');
    const yfinanceResult = await yfinanceCollector.collectEtfData(symbol);
    console.log('Resultado yfinance:', yfinanceResult.success ? '✅ Sucesso' : '❌ Falha');
    
    if (yfinanceResult.success) {
      console.log(`Campos coletados: ${yfinanceResult.fieldsCollected.length}`);
      console.log('Principais campos:', yfinanceResult.fieldsCollected.slice(0, 10).join(', '));
    }
    
    // Testar fallback
    console.log('\n🔄 Testando fallback collector...');
    const fallbackResult = await fallbackCollector.collectEtfData(symbol);
    console.log('Resultado fallback:', fallbackResult.success ? '✅ Sucesso' : '❌ Falha');
    
    if (fallbackResult.success) {
      console.log(`Campos coletados: ${fallbackResult.fieldsCollected.length}`);
      console.log('Fontes utilizadas:', fallbackResult.sources.join(', '));
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--test-etf')) {
  const symbol = args[args.indexOf('--test-etf') + 1] || 'SPY';
  testSingleEtf(symbol);
} else if (args.includes('--help')) {
  console.log('📖 USO DO SCRIPT DE DEMONSTRAÇÃO:');
  console.log('');
  console.log('node scripts/etf-pipeline/demo.js                 # Executar demo completo');
  console.log('node scripts/etf-pipeline/demo.js --test-etf SPY  # Testar coleta para um ETF específico');
  console.log('node scripts/etf-pipeline/demo.js --help          # Mostrar esta ajuda');
} else {
  // Executar demonstração completa
  runDemo();
}

export { runDemo, testSingleEtf }; 
 * DEMONSTRAÇÃO DO PIPELINE DE ETFs
 * 
 * Este script demonstra como executar o pipeline completo de coleta de dados
 * de ETFs usando os MCPs reais (Supabase, Excel, Memory, etc.).
 * 
 * Para executar: node scripts/etf-pipeline/demo.js
 */

import { runEtfPipeline } from './main.js';
import { logger } from './utils/logger.js';

/**
 * Simulação dos clientes MCP
 * Em produção, estes seriam os clientes MCP reais
 */
class MockMCPClients {
  constructor() {
    this.supabase = new MockSupabaseClient();
    this.excel = new MockExcelClient();
    this.memory = new MockMemoryClient();
  }
}

/**
 * Cliente mock do Supabase
 * Em produção, seria o MCP Supabase real
 */
class MockSupabaseClient {
  constructor() {
    this.projectId = 'nniabnjuwzeqmflrruga';
  }

  async execute_sql({ project_id, query }) {
    logger.debug(`Executando SQL: ${query.substring(0, 100)}...`);
    
    // Simular diferentes tipos de queries
    if (query.includes('SELECT COUNT(*)')) {
      return [{ total: Math.floor(Math.random() * 10) }];
    }
    
    if (query.includes('SELECT symbol FROM')) {
      // Simular que alguns ETFs já existem
      return Math.random() < 0.1 ? [{ symbol: 'SPY' }] : [];
    }
    
    if (query.includes('INSERT INTO') || query.includes('CREATE TABLE')) {
      // Simular sucesso na inserção/criação
      await this.delay(100 + Math.random() * 300);
      return { success: true };
    }
    
    return [];
  }

  async apply_migration({ project_id, name, query }) {
    logger.debug(`Aplicando migration: ${name}`);
    await this.delay(500 + Math.random() * 1000);
    return { success: true, migration: name };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Cliente mock do Excel
 * Em produção, seria o MCP Excel real
 */
class MockExcelClient {
  async read_excel_file({ file_path, sheet_name = 0, nrows = null }) {
    logger.debug(`Lendo arquivo Excel: ${file_path}`);
    
    // Simular leitura da planilha real
    await this.delay(1000 + Math.random() * 2000);
    
    // Retornar dados simulados baseados na estrutura real
    const mockData = this.generateMockExcelData(nrows || 50);
    
    return {
      data: mockData,
      shape: [mockData.length, Object.keys(mockData[0] || {}).length],
      columns: ['symbol', 'name', 'price', 'exchange', 'exchangeShortName', 'type']
    };
  }

  async list_excel_sheets({ file_path }) {
    logger.debug(`Listando sheets do arquivo: ${file_path}`);
    await this.delay(200);
    return ['Sheet1', 'ETFs_USA'];
  }

  generateMockExcelData(count) {
    const etfs = [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 445.67, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 378.12, exchange: 'NASDAQ', exchangeShortName: 'NASDAQ', type: 'etf' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 234.89, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'IWM', name: 'iShares Russell 2000 ETF', price: 198.45, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', price: 67.23, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'VWO', name: 'Vanguard Emerging Markets Stock Index Fund', price: 41.78, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'GLD', name: 'SPDR Gold Shares', price: 189.34, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', price: 93.56, exchange: 'NASDAQ', exchangeShortName: 'NASDAQ', type: 'etf' },
      { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', price: 34.12, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', price: 178.90, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'ARKK', name: 'ARK Innovation ETF', price: 45.67, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', price: 76.89, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', price: 109.23, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', price: 58.45, exchange: 'NYSE', exchangeShortName: 'NYSE', type: 'etf' },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', price: 78.12, exchange: 'NASDAQ', exchangeShortName: 'NASDAQ', type: 'etf' }
    ];
    
    // Retornar quantidade solicitada, repetindo se necessário
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(etfs[i % etfs.length]);
    }
    
    return result;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Cliente mock do Memory
 * Em produção, seria o MCP Memory real
 */
class MockMemoryClient {
  constructor() {
    this.memory = new Map();
  }

  async create_entities({ entities }) {
    logger.debug(`Criando ${entities.length} entidades no memory`);
    entities.forEach(entity => {
      this.memory.set(entity.name, entity);
    });
    return { success: true, created: entities.length };
  }

  async search_nodes({ query }) {
    logger.debug(`Buscando nodes: ${query}`);
    const results = Array.from(this.memory.values()).filter(entity => 
      entity.name.toLowerCase().includes(query.toLowerCase()) ||
      entity.observations.some(obs => obs.toLowerCase().includes(query.toLowerCase()))
    );
    return { nodes: results };
  }

  async add_observations({ observations }) {
    logger.debug(`Adicionando observações para ${observations.length} entidades`);
    observations.forEach(obs => {
      const entity = this.memory.get(obs.entityName);
      if (entity) {
        entity.observations.push(...obs.contents);
      }
    });
    return { success: true };
  }
}

/**
 * Função principal da demonstração
 */
async function runDemo() {
  console.log('🚀 INICIANDO DEMONSTRAÇÃO DO PIPELINE DE ETFs');
  console.log('='.repeat(60));
  
  try {
    // Configurar clientes MCP mock
    const clients = new MockMCPClients();
    
    // Caminho do arquivo Excel (simulado)
    const excelFilePath = 'C:\\Users\\edusp\\Projetos_App_Desktop\\etf_curator\\etfcurator\\etfs_eua.xlsx';
    
    logger.info('🔧 Configurando pipeline com clientes MCP...');
    logger.info(`📁 Arquivo Excel: ${excelFilePath}`);
    
    // Executar pipeline
    const startTime = Date.now();
    const report = await runEtfPipeline(excelFilePath, clients);
    const endTime = Date.now();
    
    // Exibir resultados
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`⏱️  Tempo total: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`📊 ETFs processados: ${report.pipeline.totalEtfsProcessed}`);
    console.log(`✅ Sucessos: ${report.pipeline.successful}`);
    console.log(`❌ Falhas: ${report.pipeline.failed}`);
    console.log(`⏭️  Pulados: ${report.pipeline.skipped}`);
    console.log(`💾 Salvos no banco: ${report.pipeline.savedToDatabase}`);
    
    console.log('\n📈 ESTATÍSTICAS DE CAMPOS:');
    Object.entries(report.fieldStatistics.fieldsWithData).forEach(([field, percentage]) => {
      console.log(`  ${field}: ${percentage}`);
    });
    
    console.log('\n💡 RECOMENDAÇÕES:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n📋 RELATÓRIO COMPLETO SALVO NOS LOGS');
    console.log('='.repeat(60));
    
    return report;
    
  } catch (error) {
    console.error('\n❌ ERRO NA DEMONSTRAÇÃO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

/**
 * Função para testar apenas a coleta de dados de um ETF específico
 */
async function testSingleEtf(symbol = 'SPY') {
  console.log(`🧪 TESTANDO COLETA DE DADOS PARA ${symbol}`);
  console.log('='.repeat(40));
  
  try {
    const { yfinanceCollector } = await import('./collectors/yfinance-collector.js');
    const { fallbackCollector } = await import('./collectors/fallback-collector.js');
    
    // Testar yfinance
    console.log('📊 Testando yfinance collector...');
    const yfinanceResult = await yfinanceCollector.collectEtfData(symbol);
    console.log('Resultado yfinance:', yfinanceResult.success ? '✅ Sucesso' : '❌ Falha');
    
    if (yfinanceResult.success) {
      console.log(`Campos coletados: ${yfinanceResult.fieldsCollected.length}`);
      console.log('Principais campos:', yfinanceResult.fieldsCollected.slice(0, 10).join(', '));
    }
    
    // Testar fallback
    console.log('\n🔄 Testando fallback collector...');
    const fallbackResult = await fallbackCollector.collectEtfData(symbol);
    console.log('Resultado fallback:', fallbackResult.success ? '✅ Sucesso' : '❌ Falha');
    
    if (fallbackResult.success) {
      console.log(`Campos coletados: ${fallbackResult.fieldsCollected.length}`);
      console.log('Fontes utilizadas:', fallbackResult.sources.join(', '));
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--test-etf')) {
  const symbol = args[args.indexOf('--test-etf') + 1] || 'SPY';
  testSingleEtf(symbol);
} else if (args.includes('--help')) {
  console.log('📖 USO DO SCRIPT DE DEMONSTRAÇÃO:');
  console.log('');
  console.log('node scripts/etf-pipeline/demo.js                 # Executar demo completo');
  console.log('node scripts/etf-pipeline/demo.js --test-etf SPY  # Testar coleta para um ETF específico');
  console.log('node scripts/etf-pipeline/demo.js --help          # Mostrar esta ajuda');
} else {
  // Executar demonstração completa
  runDemo();
}

export { runDemo, testSingleEtf }; 