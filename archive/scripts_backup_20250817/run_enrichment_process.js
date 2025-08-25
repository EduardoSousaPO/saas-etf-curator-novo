const { PrismaClient } = require('@prisma/client');
const { runAdvancedEnrichment } = require('./advanced_data_enrichment');
const { runDataValidation } = require('./validate_existing_data');
const { showInteractiveMenu: showBulkMenu } = require('./bulk_enrichment_all_etfs');
const prisma = new PrismaClient();

// Função para mostrar menu de opções
function showMenu() {
  console.log('\n🚀 SISTEMA DE ENRIQUECIMENTO DE DADOS ETF CURATOR');
  console.log('═'.repeat(60));
  console.log('1. 📊 Analisar dados faltantes');
  console.log('2. 🔧 Enriquecer dados (50 ETFs)');
  console.log('3. 🔍 Validar dados existentes (amostra)');
  console.log('4. 📈 Executar processo completo');
  console.log('5. 🚀 PROCESSAR TODOS OS ETFs (~4.409 ETFs)');
  console.log('6. ⚙️ Verificar configuração das APIs');
  console.log('7. 🚪 Sair');
  console.log('═'.repeat(60));
}

// Função para analisar dados faltantes
async function analyzeMissingData() {
  try {
    console.log('\n📊 ANALISANDO DADOS FALTANTES...\n');
    
    const totalETFs = await prisma.etf_list.count();
    const etfsWithMetrics = await prisma.calculated_metrics_teste.count();
    const missingETFs = totalETFs - etfsWithMetrics;
    
    console.log('📈 ESTATÍSTICAS GERAIS:');
    console.log(`   Total de ETFs: ${totalETFs}`);
    console.log(`   ETFs com métricas: ${etfsWithMetrics}`);
    console.log(`   ETFs sem métricas: ${missingETFs}`);
    console.log(`   Cobertura: ${((etfsWithMetrics / totalETFs) * 100).toFixed(2)}%`);
    
    // ETFs sem dados
    const etfsWithoutData = await prisma.$queryRaw`
      SELECT el.symbol, el.name, el.etfcompany
      FROM etf_list el
      LEFT JOIN calculated_metrics_teste cm ON el.symbol = cm.symbol
      WHERE cm.symbol IS NULL
      ORDER BY el.symbol
      LIMIT 10
    `;
    
    console.log('\n❌ PRIMEIROS 10 ETFs SEM DADOS:');
    etfsWithoutData.forEach(etf => {
      console.log(`   ${etf.symbol} - ${etf.name || 'N/A'}`);
    });
    
    // ETFs com dados parciais
    const partialData = await prisma.$queryRaw`
      SELECT 
        symbol,
        CASE WHEN returns_12m IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN volatility_12m IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN sharpe_12m IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN max_drawdown IS NOT NULL THEN 1 ELSE 0 END as fields_count
      FROM calculated_metrics_teste
      WHERE (
        CASE WHEN returns_12m IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN volatility_12m IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN sharpe_12m IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN max_drawdown IS NOT NULL THEN 1 ELSE 0 END
      ) BETWEEN 1 AND 3
      ORDER BY fields_count ASC
      LIMIT 10
    `;
    
    console.log('\n⚠️ PRIMEIROS 10 ETFs COM DADOS PARCIAIS:');
    partialData.forEach(etf => {
      console.log(`   ${etf.symbol}: ${etf.fields_count}/4 campos principais`);
    });
    
    console.log('\n💡 RECOMENDAÇÃO:');
    console.log(`   Execute a opção 2 para enriquecer ${missingETFs + partialData.length}+ ETFs`);
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
  }
}

// Função para verificar configuração das APIs
function checkAPIConfiguration() {
  console.log('\n⚙️ VERIFICANDO CONFIGURAÇÃO DAS APIs...\n');
  
  const apis = [
    {
      name: 'Yahoo Finance',
      status: '✅ Ativo',
      description: 'Fonte principal - sem chave necessária',
      rateLimit: '2 segundos entre requests'
    },
    {
      name: 'Alpha Vantage',
      status: process.env.ALPHA_VANTAGE_API_KEY && process.env.ALPHA_VANTAGE_API_KEY !== 'demo' ? '✅ Configurado' : '⚠️ Usando demo',
      description: 'Validação cruzada - 25 requests/dia grátis',
      rateLimit: '12 segundos entre requests',
      setup: 'https://www.alphavantage.co/support/#api-key'
    },
    {
      name: 'Polygon.io',
      status: process.env.POLYGON_API_KEY && process.env.POLYGON_API_KEY !== 'demo' ? '✅ Configurado' : '⚠️ Usando demo',
      description: 'Dados alternativos - 5 requests/minuto grátis',
      rateLimit: '12 segundos entre requests',
      setup: 'https://polygon.io/'
    },
    {
      name: 'Financial Modeling Prep',
      status: process.env.FMP_API_KEY ? '✅ Configurado' : '❌ Não configurado',
      description: 'Dados fundamentais - já configurado',
      rateLimit: 'Conforme plano'
    }
  ];
  
  apis.forEach(api => {
    console.log(`📡 ${api.name}:`);
    console.log(`   Status: ${api.status}`);
    console.log(`   Descrição: ${api.description}`);
    console.log(`   Rate Limit: ${api.rateLimit}`);
    if (api.setup) {
      console.log(`   Setup: ${api.setup}`);
    }
    console.log('');
  });
  
  console.log('💡 DICAS:');
  console.log('   • Yahoo Finance é suficiente para começar');
  console.log('   • Alpha Vantage melhora a validação dos dados');
  console.log('   • Polygon.io oferece dados alternativos');
  console.log('   • Configure as chaves no arquivo .env para melhor cobertura');
}

// Função principal interativa
async function runInteractiveProcess() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
  
  try {
    while (true) {
      showMenu();
      const choice = await question('\n🔹 Escolha uma opção (1-7): ');
      
      switch (choice.trim()) {
        case '1':
          await analyzeMissingData();
          break;
          
        case '2':
          console.log('\n🔧 INICIANDO ENRIQUECIMENTO DE DADOS...');
          console.log('⏱️ Tempo estimado: 2-4 horas para 50 ETFs');
          const confirm = await question('Deseja continuar? (s/n): ');
          if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'sim') {
            await runAdvancedEnrichment();
          }
          break;
          
        case '3':
          console.log('\n🔍 INICIANDO VALIDAÇÃO DE DADOS...');
          console.log('⏱️ Tempo estimado: 30-60 minutos para 30 ETFs');
          const confirmValidation = await question('Deseja continuar? (s/n): ');
          if (confirmValidation.toLowerCase() === 's' || confirmValidation.toLowerCase() === 'sim') {
            await runDataValidation();
          }
          break;
          
        case '4':
          console.log('\n🚀 EXECUTANDO PROCESSO COMPLETO...');
          console.log('1. Análise de dados faltantes');
          console.log('2. Enriquecimento de 50 ETFs');
          console.log('3. Validação de dados existentes');
          console.log('⏱️ Tempo total estimado: 3-5 horas');
          
          const confirmComplete = await question('Deseja executar o processo completo? (s/n): ');
          if (confirmComplete.toLowerCase() === 's' || confirmComplete.toLowerCase() === 'sim') {
            await analyzeMissingData();
            console.log('\n' + '═'.repeat(60));
            await runAdvancedEnrichment();
            console.log('\n' + '═'.repeat(60));
            await runDataValidation();
          }
          break;
          
        case '5':
          console.log('\n🚀 ABRINDO SISTEMA DE ENRIQUECIMENTO EM MASSA...');
          console.log('⚠️ Este sistema pode processar TODOS os 4.409 ETFs');
          console.log('⏱️ Tempo estimado: 15-25 horas');
          console.log('💾 Progresso salvo automaticamente com checkpoints');
          
          const confirmBulk = await question('\nDeseja abrir o sistema avançado? (s/n): ');
          if (confirmBulk.toLowerCase() === 's' || confirmBulk.toLowerCase() === 'sim') {
            rl.close();
            await showBulkMenu();
            return;
          }
          break;
          
        case '6':
          checkAPIConfiguration();
          break;
          
        case '7':
          console.log('\n👋 Saindo do sistema...');
          rl.close();
          return;
          
        default:
          console.log('\n❌ Opção inválida. Escolha entre 1-7.');
      }
      
      if (choice !== '7') {
        await question('\n📱 Pressione Enter para continuar...');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erro no processo:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runInteractiveProcess();
}

module.exports = {
  analyzeMissingData,
  checkAPIConfiguration,
  runInteractiveProcess
}; 