const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { enrichETFData, validateCrossSource } = require('./advanced_data_enrichment');
const prisma = new PrismaClient();

// Configurações do processamento em massa
const BATCH_CONFIG = {
  batchSize: 100,           // ETFs por lote
  maxConcurrent: 5,         // Processamento paralelo limitado
  checkpointInterval: 50,   // Salvar progresso a cada X ETFs
  retryAttempts: 3,         // Tentativas para ETFs que falharam
  rateLimit: 2500,          // 2.5 segundos entre ETFs (respeitando APIs)
  progressReportInterval: 25 // Relatório a cada X ETFs
};

// Arquivo de checkpoint para retomar processamento
const CHECKPOINT_FILE = path.join(__dirname, 'enrichment_checkpoint.json');
const FAILED_ETFS_FILE = path.join(__dirname, 'failed_etfs.json');

// Função para salvar checkpoint
function saveCheckpoint(data) {
  try {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro ao salvar checkpoint:', error.message);
  }
}

// Função para carregar checkpoint
function loadCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('❌ Erro ao carregar checkpoint:', error.message);
  }
  return null;
}

// Função para salvar ETFs que falharam
function saveFailedETFs(failedETFs) {
  try {
    fs.writeFileSync(FAILED_ETFS_FILE, JSON.stringify(failedETFs, null, 2));
  } catch (error) {
    console.error('❌ Erro ao salvar ETFs falhados:', error.message);
  }
}

// Função para carregar ETFs que falharam
function loadFailedETFs() {
  try {
    if (fs.existsSync(FAILED_ETFS_FILE)) {
      return JSON.parse(fs.readFileSync(FAILED_ETFS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('❌ Erro ao carregar ETFs falhados:', error.message);
  }
  return [];
}

// Função para limpar arquivos de checkpoint
function clearCheckpoints() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);
    if (fs.existsSync(FAILED_ETFS_FILE)) fs.unlinkSync(FAILED_ETFS_FILE);
    console.log('✅ Arquivos de checkpoint limpos');
  } catch (error) {
    console.error('❌ Erro ao limpar checkpoints:', error.message);
  }
}

// Função para calcular estimativas de tempo
function calculateTimeEstimates(totalETFs, processedETFs, startTime) {
  const elapsed = (new Date() - startTime) / 1000; // segundos
  const rate = processedETFs / elapsed; // ETFs por segundo
  const remaining = totalETFs - processedETFs;
  const etaSeconds = remaining / rate;
  
  return {
    elapsed: elapsed / 60, // minutos
    rate: rate * 60, // ETFs por minuto
    eta: etaSeconds / 60, // minutos
    etaHours: etaSeconds / 3600 // horas
  };
}

// Função para formatar tempo
function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  }
}

// Função para processar um lote de ETFs
async function processBatch(etfs, batchNumber, totalBatches, stats) {
  console.log(`\n📦 LOTE ${batchNumber}/${totalBatches} - Processando ${etfs.length} ETFs`);
  
  const batchResults = {
    successful: 0,
    failed: 0,
    validationIssues: 0,
    failedETFs: []
  };
  
  for (let i = 0; i < etfs.length; i++) {
    const etf = etfs[i];
    const globalIndex = stats.processed + i + 1;
    
    console.log(`📈 ${globalIndex}/${stats.totalETFs} - ${etf.symbol} (${etf.name?.substring(0, 40) || 'N/A'}...)`);
    
    try {
      const enrichedData = await enrichETFData(etf.symbol);
      
      if (enrichedData) {
        const saved = await saveEnrichedData(enrichedData);
        
        if (saved) {
          batchResults.successful++;
          
          if (enrichedData.validation && !enrichedData.validation.isValid) {
            batchResults.validationIssues++;
          }
        } else {
          batchResults.failed++;
          batchResults.failedETFs.push({
            symbol: etf.symbol,
            name: etf.name,
            error: 'Falha ao salvar dados'
          });
        }
      } else {
        batchResults.failed++;
        batchResults.failedETFs.push({
          symbol: etf.symbol,
          name: etf.name,
          error: 'Nenhuma fonte retornou dados'
        });
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.rateLimit));
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${etf.symbol}:`, error.message);
      batchResults.failed++;
      batchResults.failedETFs.push({
        symbol: etf.symbol,
        name: etf.name,
        error: error.message
      });
    }
  }
  
  return batchResults;
}

// Função para salvar dados enriquecidos (copiada do script original)
async function saveEnrichedData(enrichedData) {
  const { symbol, data } = enrichedData;
  const metrics = data.metrics;
  
  try {
    const existing = await prisma.calculated_metrics_teste.findUnique({
      where: { symbol }
    });
    
    const updateData = {
      returns_12m: metrics.returns_12m || null,
      returns_24m: metrics.returns_24m || null,
      returns_36m: metrics.returns_36m || null,
      returns_5y: metrics.returns_5y || null,
      volatility_12m: metrics.volatility_12m || null,
      volatility_24m: metrics.volatility_24m || null,
      volatility_36m: metrics.volatility_36m || null,
      sharpe_12m: metrics.sharpe_12m || null,
      sharpe_24m: metrics.sharpe_24m || null,
      sharpe_36m: metrics.sharpe_36m || null,
      max_drawdown: metrics.max_drawdown || null
    };
    
    if (existing) {
      await prisma.calculated_metrics_teste.update({
        where: { symbol },
        data: updateData
      });
    } else {
      await prisma.calculated_metrics_teste.create({
        data: {
          symbol,
          ...updateData,
          dividends_12m: 0,
          dividends_24m: 0,
          dividends_36m: 0,
          dividends_all_time: 0
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar dados para ${symbol}:`, error.message);
    return false;
  }
}

// Função principal para enriquecimento em massa
async function runBulkEnrichment(options = {}) {
  const {
    limit = null,           // null = todos os ETFs
    resumeFromCheckpoint = true,
    retryFailedOnly = false
  } = options;
  
  try {
    console.log('🚀 INICIANDO ENRIQUECIMENTO EM MASSA DE DADOS ETF\n');
    
    let etfsToProcess = [];
    let checkpoint = null;
    
    if (retryFailedOnly) {
      // Processar apenas ETFs que falharam anteriormente
      const failedETFs = loadFailedETFs();
      if (failedETFs.length === 0) {
        console.log('✅ Nenhum ETF falhado encontrado para reprocessar');
        return;
      }
      
      etfsToProcess = failedETFs.map(f => ({ symbol: f.symbol, name: f.name }));
      console.log(`🔄 Reprocessando ${etfsToProcess.length} ETFs que falharam anteriormente`);
      
    } else if (resumeFromCheckpoint && (checkpoint = loadCheckpoint())) {
      // Retomar do checkpoint
      console.log(`🔄 Retomando processamento do checkpoint...`);
      console.log(`   Processados anteriormente: ${checkpoint.processed}`);
      console.log(`   Sucessos: ${checkpoint.successful}`);
      console.log(`   Falhas: ${checkpoint.failed}`);
      
      // Buscar ETFs restantes
      etfsToProcess = await prisma.$queryRaw`
        SELECT el.symbol, el.name, el.etfcompany
        FROM etf_list el
        LEFT JOIN calculated_metrics_teste cm ON el.symbol = cm.symbol
        WHERE cm.symbol IS NULL 
           OR cm.returns_12m IS NULL 
           OR cm.volatility_12m IS NULL
        ORDER BY el.symbol
        ${limit ? `LIMIT ${limit - checkpoint.processed}` : ''}
      `;
      
    } else {
      // Buscar todos os ETFs que precisam de enriquecimento
      etfsToProcess = await prisma.$queryRaw`
        SELECT el.symbol, el.name, el.etfcompany
        FROM etf_list el
        LEFT JOIN calculated_metrics_teste cm ON el.symbol = cm.symbol
        WHERE cm.symbol IS NULL 
           OR cm.returns_12m IS NULL 
           OR cm.volatility_12m IS NULL
        ORDER BY el.symbol
        ${limit ? `LIMIT ${limit}` : ''}
      `;
      
      // Limpar checkpoints anteriores se começando do zero
      if (!resumeFromCheckpoint) {
        clearCheckpoints();
      }
    }
    
    if (etfsToProcess.length === 0) {
      console.log('✅ Todos os ETFs já possuem dados completos!');
      return;
    }
    
    // Estatísticas iniciais
    const stats = {
      totalETFs: etfsToProcess.length,
      processed: checkpoint?.processed || 0,
      successful: checkpoint?.successful || 0,
      failed: checkpoint?.failed || 0,
      validationIssues: checkpoint?.validationIssues || 0,
      startTime: new Date(),
      failedETFs: []
    };
    
    console.log(`📊 ESTATÍSTICAS INICIAIS:`);
    console.log(`   ETFs para processar: ${stats.totalETFs}`);
    console.log(`   Tamanho do lote: ${BATCH_CONFIG.batchSize}`);
    console.log(`   Rate limit: ${BATCH_CONFIG.rateLimit}ms entre ETFs`);
    
    // Calcular estimativa de tempo
    const estimatedTimeMinutes = (stats.totalETFs * BATCH_CONFIG.rateLimit) / (1000 * 60);
    console.log(`   ⏱️ Tempo estimado: ${formatTime(estimatedTimeMinutes)}`);
    
    if (estimatedTimeMinutes > 120) { // Mais de 2 horas
      console.log(`\n⚠️ ATENÇÃO: Este processo levará ${formatTime(estimatedTimeMinutes)}`);
      console.log(`   Recomendamos executar em horários de menor uso`);
      console.log(`   O progresso será salvo automaticamente para retomar se necessário`);
    }
    
    // Dividir em lotes
    const batches = [];
    for (let i = 0; i < etfsToProcess.length; i += BATCH_CONFIG.batchSize) {
      batches.push(etfsToProcess.slice(i, i + BATCH_CONFIG.batchSize));
    }
    
    console.log(`\n🔄 Processando ${batches.length} lotes de até ${BATCH_CONFIG.batchSize} ETFs cada\n`);
    
    // Processar lotes
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;
      
      const batchResults = await processBatch(batch, batchNumber, batches.length, stats);
      
      // Atualizar estatísticas
      stats.processed += batch.length;
      stats.successful += batchResults.successful;
      stats.failed += batchResults.failed;
      stats.validationIssues += batchResults.validationIssues;
      stats.failedETFs.push(...batchResults.failedETFs);
      
      // Salvar checkpoint
      const checkpointData = {
        processed: stats.processed,
        successful: stats.successful,
        failed: stats.failed,
        validationIssues: stats.validationIssues,
        lastBatch: batchNumber,
        timestamp: new Date().toISOString()
      };
      saveCheckpoint(checkpointData);
      
      // Salvar ETFs que falharam
      if (stats.failedETFs.length > 0) {
        saveFailedETFs(stats.failedETFs);
      }
      
      // Relatório de progresso
      const timeStats = calculateTimeEstimates(stats.totalETFs, stats.processed, stats.startTime);
      
      console.log(`\n📊 PROGRESSO DO LOTE ${batchNumber}:`);
      console.log(`   Sucessos: ${batchResults.successful}/${batch.length}`);
      console.log(`   Falhas: ${batchResults.failed}/${batch.length}`);
      console.log(`   Issues de validação: ${batchResults.validationIssues}`);
      
      console.log(`\n📈 PROGRESSO GERAL:`);
      console.log(`   Processados: ${stats.processed}/${stats.totalETFs} (${((stats.processed/stats.totalETFs)*100).toFixed(1)}%)`);
      console.log(`   Taxa de sucesso: ${((stats.successful/stats.processed)*100).toFixed(1)}%`);
      console.log(`   Tempo decorrido: ${formatTime(timeStats.elapsed)}`);
      console.log(`   Taxa: ${timeStats.rate.toFixed(1)} ETFs/min`);
      console.log(`   ETA: ${formatTime(timeStats.eta)}`);
      
      // Pausa entre lotes para não sobrecarregar as APIs
      if (batchIndex < batches.length - 1) {
        console.log(`\n⏸️ Pausa de 30 segundos entre lotes...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
    
    // Relatório final
    const finalTime = (new Date() - stats.startTime) / 1000;
    console.log('\n🎯 RELATÓRIO FINAL DO ENRIQUECIMENTO EM MASSA:');
    console.log('═'.repeat(60));
    console.log(`📊 ETFs processados: ${stats.processed}`);
    console.log(`✅ Sucessos: ${stats.successful} (${((stats.successful/stats.processed)*100).toFixed(1)}%)`);
    console.log(`❌ Falhas: ${stats.failed} (${((stats.failed/stats.processed)*100).toFixed(1)}%)`);
    console.log(`⚠️ Issues de validação: ${stats.validationIssues}`);
    console.log(`⏱️ Tempo total: ${formatTime(finalTime/60)}`);
    console.log(`📈 Taxa média: ${((stats.processed/(finalTime/60))).toFixed(1)} ETFs/min`);
    
    if (stats.failedETFs.length > 0) {
      console.log(`\n❌ ETFs QUE FALHARAM (${stats.failedETFs.length}):`);
      stats.failedETFs.slice(0, 10).forEach(etf => {
        console.log(`   ${etf.symbol} - ${etf.error}`);
      });
      
      if (stats.failedETFs.length > 10) {
        console.log(`   ... e mais ${stats.failedETFs.length - 10} ETFs`);
      }
      
      console.log(`\n💡 Para reprocessar apenas os ETFs que falharam:`);
      console.log(`   node scripts/bulk_enrichment_all_etfs.js --retry-failed`);
    }
    
    // Limpar checkpoints se completou com sucesso
    if (stats.processed === stats.totalETFs) {
      clearCheckpoints();
      console.log('\n✅ Processamento completo! Checkpoints limpos.');
    }
    
  } catch (error) {
    console.error('❌ Erro no enriquecimento em massa:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função para mostrar menu interativo
async function showInteractiveMenu() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
  
  try {
    console.log('\n🚀 ENRIQUECIMENTO EM MASSA - ETF CURATOR');
    console.log('═'.repeat(60));
    console.log('1. 📊 Processar TODOS os ETFs (~4.409 ETFs, ~20 horas)');
    console.log('2. 🔧 Processar quantidade específica');
    console.log('3. 🔄 Retomar do último checkpoint');
    console.log('4. ❌ Reprocessar apenas ETFs que falharam');
    console.log('5. 📈 Análise rápida do status atual');
    console.log('6. 🧹 Limpar checkpoints e recomeçar');
    console.log('7. 🚪 Sair');
    console.log('═'.repeat(60));
    
    const choice = await question('\n🔹 Escolha uma opção (1-7): ');
    
    switch (choice.trim()) {
      case '1':
        console.log('\n⚠️ PROCESSAMENTO COMPLETO - TODOS OS ETFs');
        console.log('   Tempo estimado: 15-25 horas');
        console.log('   Recomendado executar durante a madrugada');
        console.log('   Progresso será salvo automaticamente');
        
        const confirmAll = await question('\nDeseja continuar? (s/n): ');
        if (confirmAll.toLowerCase() === 's' || confirmAll.toLowerCase() === 'sim') {
          await runBulkEnrichment({ limit: null });
        }
        break;
        
      case '2':
        const limitStr = await question('\nQuantos ETFs processar? (ex: 500): ');
        const limit = parseInt(limitStr);
        
        if (isNaN(limit) || limit <= 0) {
          console.log('❌ Número inválido');
          break;
        }
        
        const estimatedMinutes = (limit * BATCH_CONFIG.rateLimit) / (1000 * 60);
        console.log(`\n⏱️ Tempo estimado para ${limit} ETFs: ${formatTime(estimatedMinutes)}`);
        
        const confirmLimit = await question('Deseja continuar? (s/n): ');
        if (confirmLimit.toLowerCase() === 's' || confirmLimit.toLowerCase() === 'sim') {
          await runBulkEnrichment({ limit });
        }
        break;
        
      case '3':
        const checkpoint = loadCheckpoint();
        if (!checkpoint) {
          console.log('❌ Nenhum checkpoint encontrado');
          break;
        }
        
        console.log(`\n🔄 CHECKPOINT ENCONTRADO:`);
        console.log(`   Processados: ${checkpoint.processed}`);
        console.log(`   Sucessos: ${checkpoint.successful}`);
        console.log(`   Falhas: ${checkpoint.failed}`);
        console.log(`   Último lote: ${checkpoint.lastBatch}`);
        console.log(`   Data: ${new Date(checkpoint.timestamp).toLocaleString()}`);
        
        const confirmResume = await question('\nDeseja retomar? (s/n): ');
        if (confirmResume.toLowerCase() === 's' || confirmResume.toLowerCase() === 'sim') {
          await runBulkEnrichment({ resumeFromCheckpoint: true });
        }
        break;
        
      case '4':
        const failedETFs = loadFailedETFs();
        if (failedETFs.length === 0) {
          console.log('✅ Nenhum ETF falhado encontrado');
          break;
        }
        
        console.log(`\n❌ ETFS QUE FALHARAM: ${failedETFs.length}`);
        failedETFs.slice(0, 5).forEach(etf => {
          console.log(`   ${etf.symbol} - ${etf.error}`);
        });
        
        if (failedETFs.length > 5) {
          console.log(`   ... e mais ${failedETFs.length - 5} ETFs`);
        }
        
        const confirmRetry = await question('\nDeseja reprocessar? (s/n): ');
        if (confirmRetry.toLowerCase() === 's' || confirmRetry.toLowerCase() === 'sim') {
          await runBulkEnrichment({ retryFailedOnly: true });
        }
        break;
        
      case '5':
        // Análise rápida
        console.log('\n📊 ANALISANDO STATUS ATUAL...');
        
        const totalETFs = await prisma.etf_list.count();
        const etfsWithMetrics = await prisma.calculated_metrics_teste.count();
        const missingETFs = totalETFs - etfsWithMetrics;
        
        console.log(`\n📈 STATUS ATUAL:`);
        console.log(`   Total de ETFs: ${totalETFs}`);
        console.log(`   ETFs com métricas: ${etfsWithMetrics}`);
        console.log(`   ETFs sem métricas: ${missingETFs}`);
        console.log(`   Cobertura: ${((etfsWithMetrics / totalETFs) * 100).toFixed(2)}%`);
        
        const checkpoint2 = loadCheckpoint();
        if (checkpoint2) {
          console.log(`\n🔄 CHECKPOINT ATIVO:`);
          console.log(`   Processados: ${checkpoint2.processed}`);
          console.log(`   Sucessos: ${checkpoint2.successful}`);
          console.log(`   Data: ${new Date(checkpoint2.timestamp).toLocaleString()}`);
        }
        
        const failedETFs2 = loadFailedETFs();
        if (failedETFs2.length > 0) {
          console.log(`\n❌ ETFs que falharam: ${failedETFs2.length}`);
        }
        break;
        
      case '6':
        const confirmClear = await question('\n⚠️ Limpar todos os checkpoints? (s/n): ');
        if (confirmClear.toLowerCase() === 's' || confirmClear.toLowerCase() === 'sim') {
          clearCheckpoints();
        }
        break;
        
      case '7':
        console.log('\n👋 Saindo...');
        rl.close();
        return;
        
      default:
        console.log('\n❌ Opção inválida');
    }
    
    if (choice !== '7') {
      await question('\n📱 Pressione Enter para continuar...');
      await showInteractiveMenu();
    }
    
  } catch (error) {
    console.error('❌ Erro no menu:', error);
  } finally {
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--retry-failed')) {
    runBulkEnrichment({ retryFailedOnly: true });
  } else if (args.includes('--resume')) {
    runBulkEnrichment({ resumeFromCheckpoint: true });
  } else if (args.includes('--all')) {
    runBulkEnrichment({ limit: null });
  } else {
    showInteractiveMenu();
  }
}

module.exports = {
  runBulkEnrichment,
  showInteractiveMenu
}; 