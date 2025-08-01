#!/usr/bin/env node

/**
 * MONITOR DUPLO - ENRIQUECIMENTO IA + VALIDAÇÃO MÉTRICAS
 * 
 * Monitora ambos os pipelines rodando em paralelo
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class DualPipelineMonitor {
  constructor() {
    this.startTime = new Date();
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  /**
   * Verificar progresso do enriquecimento IA
   */
  async checkEnrichmentProgress() {
    try {
      const { data: enrichedData, error: enrichedError } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol', { count: 'exact' })
        .not('ai_investment_thesis', 'is', null);

      if (enrichedError) throw enrichedError;

      const { data: remainingData, error: remainingError } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol', { count: 'exact' })
        .is('ai_investment_thesis', null);

      if (remainingError) throw remainingError;

      return {
        enriched: enrichedData.length,
        remaining: remainingData.length,
        total: enrichedData.length + remainingData.length,
        percentage: ((enrichedData.length / (enrichedData.length + remainingData.length)) * 100).toFixed(1)
      };
    } catch (error) {
      await this.log(`❌ Erro ao verificar enriquecimento: ${error.message}`);
      return null;
    }
  }

  /**
   * Verificar progresso da validação (através de arquivos de log)
   */
  async checkValidationProgress() {
    try {
      // Buscar arquivos de log de validação
      const files = await fs.readdir('.');
      const validationLogFiles = files.filter(file => 
        file.startsWith('metrics-validation-') && file.endsWith('.log')
      );

      if (validationLogFiles.length === 0) {
        return {
          status: 'not_started',
          processed: 0,
          corrections: 0,
          errors: 0
        };
      }

      // Ler o log mais recente
      const latestLogFile = validationLogFiles.sort().pop();
      const logContent = await fs.readFile(latestLogFile, 'utf8');
      
      // Extrair estatísticas do log
      const processedMatches = logContent.match(/✅ \w+ validado/g) || [];
      const correctionMatches = logContent.match(/🔧 \w+:/g) || [];
      const errorMatches = logContent.match(/❌ Erro/g) || [];

      return {
        status: 'running',
        processed: processedMatches.length,
        corrections: correctionMatches.length,
        errors: errorMatches.length,
        log_file: latestLogFile
      };
    } catch (error) {
      return {
        status: 'unknown',
        processed: 0,
        corrections: 0,
        errors: 0
      };
    }
  }

  /**
   * Verificar processos Node.js rodando
   */
  async checkRunningProcesses() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
      
      return {
        node_processes: lines.length,
        processes_running: lines.length >= 2 // Enriquecimento + Validação
      };
    } catch (error) {
      return {
        node_processes: 0,
        processes_running: false
      };
    }
  }

  /**
   * Gerar relatório completo
   */
  async generateReport() {
    try {
      await this.log('📊 RELATÓRIO DUAL PIPELINE - ENRIQUECIMENTO + VALIDAÇÃO');
      await this.log('═'.repeat(80));

      // Processos rodando
      const processes = await this.checkRunningProcesses();
      await this.log('🔄 STATUS DOS PROCESSOS:');
      await this.log(`   🖥️ Processos Node.js: ${processes.node_processes}`);
      await this.log(`   ✅ Pipelines ativos: ${processes.processes_running ? 'SIM' : 'NÃO'}`);

      await this.log('');

      // Progresso do enriquecimento IA
      const enrichment = await this.checkEnrichmentProgress();
      if (enrichment) {
        await this.log('🤖 ENRIQUECIMENTO IA:');
        await this.log(`   ✅ ETFs enriquecidos: ${enrichment.enriched}/${enrichment.total}`);
        await this.log(`   ⏳ Restantes: ${enrichment.remaining}`);
        await this.log(`   📊 Progresso: ${enrichment.percentage}%`);
        
        if (enrichment.remaining > 0) {
          const etaMinutes = enrichment.remaining * 1.5; // 1.5 min por ETF
          await this.log(`   🕐 ETA: ${(etaMinutes / 60).toFixed(1)} horas`);
        }
      }

      await this.log('');

      // Progresso da validação
      const validation = await this.checkValidationProgress();
      await this.log('🔍 VALIDAÇÃO DE MÉTRICAS:');
      
      if (validation.status === 'not_started') {
        await this.log(`   ⚠️ Status: NÃO INICIADO`);
      } else if (validation.status === 'running') {
        await this.log(`   ✅ Status: RODANDO`);
        await this.log(`   📊 ETFs validados: ${validation.processed}`);
        await this.log(`   🔧 Correções aplicadas: ${validation.corrections}`);
        await this.log(`   ❌ Erros: ${validation.errors}`);
        await this.log(`   📄 Log: ${validation.log_file}`);
        
        if (validation.processed > 0) {
          const remainingValidation = 1000 - validation.processed;
          const etaMinutes = remainingValidation * 0.5; // 30s por ETF
          await this.log(`   ⏳ Restantes: ${remainingValidation}`);
          await this.log(`   🕐 ETA: ${(etaMinutes / 60).toFixed(1)} horas`);
        }
      } else {
        await this.log(`   ❓ Status: DESCONHECIDO`);
      }

      await this.log('');

      // Estimativas combinadas
      await this.log('💡 ESTIMATIVAS COMBINADAS:');
      
      const totalCostEnrichment = enrichment ? enrichment.remaining * 0.15 : 0;
      const totalCostValidation = validation.processed < 1000 ? (1000 - validation.processed) * 0.10 : 0;
      const totalCost = totalCostEnrichment + totalCostValidation;
      
      await this.log(`   💰 Custo restante enriquecimento: $${totalCostEnrichment.toFixed(2)}`);
      await this.log(`   💰 Custo restante validação: $${totalCostValidation.toFixed(2)}`);
      await this.log(`   💰 Custo total restante: $${totalCost.toFixed(2)}`);

      await this.log('');
      await this.log('═'.repeat(80));

      const elapsedMinutes = (new Date() - this.startTime) / 1000 / 60;
      await this.log(`📅 Tempo de monitoramento: ${elapsedMinutes.toFixed(1)} minutos`);

    } catch (error) {
      await this.log(`❌ Erro ao gerar relatório: ${error.message}`);
    }
  }

  /**
   * Monitorar continuamente
   */
  async startMonitoring(intervalMinutes = 2) {
    await this.log(`🚀 MONITOR DUAL PIPELINE INICIADO`);
    await this.log(`⏰ Intervalo: ${intervalMinutes} minutos`);
    await this.log('');

    // Relatório inicial
    await this.generateReport();

    // Monitoramento contínuo
    const interval = setInterval(async () => {
      await this.log('\n🔄 ATUALIZANDO STATUS...\n');
      await this.generateReport();
    }, intervalMinutes * 60 * 1000);

    // Cleanup
    process.on('SIGINT', () => {
      clearInterval(interval);
      this.log('\n⚠️ Monitoramento interrompido pelo usuário');
      process.exit(0);
    });
  }
}

// Executar monitor
async function runDualMonitor() {
  const monitor = new DualPipelineMonitor();
  
  try {
    await monitor.startMonitoring(2); // A cada 2 minutos
  } catch (error) {
    console.error('❌ Erro no monitor dual:', error);
    process.exit(1);
  }
}

// Iniciar se executado diretamente
if (require.main === module) {
  runDualMonitor();
}

module.exports = { DualPipelineMonitor };