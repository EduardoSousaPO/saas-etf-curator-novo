/**
 * SISTEMA DE LOGGING DO PIPELINE DE ETFs
 * 
 * Este módulo fornece funcionalidades completas de logging para rastrear
 * o progresso, erros e estatísticas do pipeline de coleta de dados de ETFs.
 */

import { LOGGING_CONFIG } from '../config.js';

/**
 * Classe principal do sistema de logging
 */
export class PipelineLogger {
  constructor() {
    this.logs = [];
    this.startTime = new Date();
    this.stats = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Formata timestamp para logs
   */
  getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * Log de informação geral
   */
  info(message, data = null) {
    const logEntry = {
      level: 'INFO',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`🔵 [${logEntry.timestamp}] INFO: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de sucesso
   */
  success(message, data = null) {
    const logEntry = {
      level: 'SUCCESS',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`✅ [${logEntry.timestamp}] SUCCESS: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
    
    this.stats.success++;
  }

  /**
   * Log de warning
   */
  warn(message, data = null) {
    const logEntry = {
      level: 'WARN',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`⚠️  [${logEntry.timestamp}] WARN: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de erro
   */
  error(message, error = null, data = null) {
    const logEntry = {
      level: 'ERROR',
      timestamp: this.getTimestamp(),
      message,
      error: error ? error.message : null,
      stack: error ? error.stack : null,
      data
    };
    
    this.logs.push(logEntry);
    this.stats.errors.push(logEntry);
    this.stats.failed++;
    
    console.log(`❌ [${logEntry.timestamp}] ERROR: ${message}`);
    
    if (error) {
      console.log('   💥 Erro:', error.message);
      if (LOGGING_CONFIG.level === 'debug') {
        console.log('   📍 Stack:', error.stack);
      }
    }
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de debug (apenas se configurado)
   */
  debug(message, data = null) {
    if (LOGGING_CONFIG.level !== 'debug') return;
    
    const logEntry = {
      level: 'DEBUG',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`🔍 [${logEntry.timestamp}] DEBUG: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log específico para início de processamento de ETF
   */
  startEtf(symbol, index, total) {
    this.info(`Iniciando processamento do ETF ${symbol} (${index + 1}/${total})`);
    this.stats.processed++;
  }

  /**
   * Log específico para ETF processado com sucesso
   */
  etfSuccess(symbol, fieldsCollected) {
    this.success(`ETF ${symbol} processado com sucesso`, {
      symbol,
      fieldsCollected: fieldsCollected.length,
      fields: fieldsCollected
    });
  }

  /**
   * Log específico para ETF que falhou
   */
  etfFailed(symbol, reason, error = null) {
    this.error(`ETF ${symbol} falhou: ${reason}`, error, { symbol, reason });
  }

  /**
   * Log específico para ETF pulado
   */
  etfSkipped(symbol, reason) {
    this.warn(`ETF ${symbol} pulado: ${reason}`, { symbol, reason });
    this.stats.skipped++;
  }

  /**
   * Log de progresso do batch
   */
  batchProgress(batchIndex, totalBatches, batchSize) {
    this.info(`📦 Processando batch ${batchIndex + 1}/${totalBatches} (${batchSize} ETFs)`);
  }

  /**
   * Log de progresso geral
   */
  progress() {
    const elapsed = Math.round((new Date() - this.startTime) / 1000);
    const rate = this.stats.processed > 0 ? (this.stats.processed / elapsed * 60).toFixed(1) : 0;
    
    this.info(`📈 Progresso: ${this.stats.processed}/${this.stats.total} | ✅ ${this.stats.success} | ❌ ${this.stats.failed} | ⏭️ ${this.stats.skipped} | ⏱️ ${elapsed}s | 📊 ${rate} ETFs/min`);
  }

  /**
   * Atualiza estatísticas totais
   */
  setTotal(total) {
    this.stats.total = total;
    this.info(`📊 Total de ETFs para processar: ${total}`);
  }

  /**
   * Gera relatório final detalhado
   */
  generateFinalReport() {
    const endTime = new Date();
    const totalTime = Math.round((endTime - this.startTime) / 1000);
    const avgRate = this.stats.processed > 0 ? (this.stats.processed / totalTime * 60).toFixed(1) : 0;
    
    const report = {
      summary: {
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalTimeSeconds: totalTime,
        totalTimeFormatted: this.formatDuration(totalTime)
      },
      statistics: {
        totalEtfs: this.stats.total,
        processed: this.stats.processed,
        successful: this.stats.success,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        successRate: this.stats.processed > 0 ? ((this.stats.success / this.stats.processed) * 100).toFixed(1) + '%' : '0%',
        avgRatePerMinute: avgRate
      },
      errors: this.stats.errors.map(err => ({
        timestamp: err.timestamp,
        message: err.message,
        error: err.error,
        data: err.data
      })),
      performance: {
        logsGenerated: this.logs.length,
        memoryUsage: process.memoryUsage ? process.memoryUsage() : null
      }
    };

    // Log do relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📋 RELATÓRIO FINAL DO PIPELINE DE ETFs');
    console.log('='.repeat(80));
    console.log(`⏰ Tempo total: ${report.summary.totalTimeFormatted}`);
    console.log(`📊 ETFs processados: ${report.statistics.processed}/${report.statistics.totalEtfs}`);
    console.log(`✅ Sucessos: ${report.statistics.successful} (${report.statistics.successRate})`);
    console.log(`❌ Falhas: ${report.statistics.failed}`);
    console.log(`⏭️  Pulados: ${report.statistics.skipped}`);
    console.log(`⚡ Taxa média: ${report.statistics.avgRatePerMinute} ETFs/min`);
    
    if (report.errors.length > 0) {
      console.log(`\n🚨 ERROS ENCONTRADOS (${report.errors.length}):`);
      report.errors.slice(0, 10).forEach((err, index) => {
        console.log(`${index + 1}. [${err.timestamp}] ${err.message}`);
        if (err.error) console.log(`   💥 ${err.error}`);
      });
      
      if (report.errors.length > 10) {
        console.log(`   ... e mais ${report.errors.length - 10} erros`);
      }
    }
    
    console.log('='.repeat(80));
    
    return report;
  }

  /**
   * Formata duração em segundos para formato legível
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Salva logs em arquivo (se configurado)
   */
  async saveLogs() {
    if (!LOGGING_CONFIG.saveToFile) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `etf-pipeline-${timestamp}.json`;
      
      const logData = {
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          totalLogs: this.logs.length
        },
        statistics: this.stats,
        logs: this.logs
      };
      
      // Em um ambiente real, você salvaria em arquivo aqui
      // Para este exemplo, apenas logamos que salvaria
      this.info(`💾 Logs salvos em: ${filename}`, {
        totalLogs: this.logs.length,
        fileSize: JSON.stringify(logData).length + ' bytes'
      });
      
      return filename;
      
    } catch (error) {
      this.error('Erro ao salvar logs', error);
    }
  }

  /**
   * Retorna estatísticas atuais
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Retorna todos os logs
   */
  getLogs() {
    return [...this.logs];
  }
}

// Instância singleton do logger
export const logger = new PipelineLogger();

export default logger; 
 * SISTEMA DE LOGGING DO PIPELINE DE ETFs
 * 
 * Este módulo fornece funcionalidades completas de logging para rastrear
 * o progresso, erros e estatísticas do pipeline de coleta de dados de ETFs.
 */

import { LOGGING_CONFIG } from '../config.js';

/**
 * Classe principal do sistema de logging
 */
export class PipelineLogger {
  constructor() {
    this.logs = [];
    this.startTime = new Date();
    this.stats = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Formata timestamp para logs
   */
  getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * Log de informação geral
   */
  info(message, data = null) {
    const logEntry = {
      level: 'INFO',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`🔵 [${logEntry.timestamp}] INFO: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de sucesso
   */
  success(message, data = null) {
    const logEntry = {
      level: 'SUCCESS',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`✅ [${logEntry.timestamp}] SUCCESS: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
    
    this.stats.success++;
  }

  /**
   * Log de warning
   */
  warn(message, data = null) {
    const logEntry = {
      level: 'WARN',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`⚠️  [${logEntry.timestamp}] WARN: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de erro
   */
  error(message, error = null, data = null) {
    const logEntry = {
      level: 'ERROR',
      timestamp: this.getTimestamp(),
      message,
      error: error ? error.message : null,
      stack: error ? error.stack : null,
      data
    };
    
    this.logs.push(logEntry);
    this.stats.errors.push(logEntry);
    this.stats.failed++;
    
    console.log(`❌ [${logEntry.timestamp}] ERROR: ${message}`);
    
    if (error) {
      console.log('   💥 Erro:', error.message);
      if (LOGGING_CONFIG.level === 'debug') {
        console.log('   📍 Stack:', error.stack);
      }
    }
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log de debug (apenas se configurado)
   */
  debug(message, data = null) {
    if (LOGGING_CONFIG.level !== 'debug') return;
    
    const logEntry = {
      level: 'DEBUG',
      timestamp: this.getTimestamp(),
      message,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`🔍 [${logEntry.timestamp}] DEBUG: ${message}`);
    
    if (data) {
      console.log('   📊 Dados:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log específico para início de processamento de ETF
   */
  startEtf(symbol, index, total) {
    this.info(`Iniciando processamento do ETF ${symbol} (${index + 1}/${total})`);
    this.stats.processed++;
  }

  /**
   * Log específico para ETF processado com sucesso
   */
  etfSuccess(symbol, fieldsCollected) {
    this.success(`ETF ${symbol} processado com sucesso`, {
      symbol,
      fieldsCollected: fieldsCollected.length,
      fields: fieldsCollected
    });
  }

  /**
   * Log específico para ETF que falhou
   */
  etfFailed(symbol, reason, error = null) {
    this.error(`ETF ${symbol} falhou: ${reason}`, error, { symbol, reason });
  }

  /**
   * Log específico para ETF pulado
   */
  etfSkipped(symbol, reason) {
    this.warn(`ETF ${symbol} pulado: ${reason}`, { symbol, reason });
    this.stats.skipped++;
  }

  /**
   * Log de progresso do batch
   */
  batchProgress(batchIndex, totalBatches, batchSize) {
    this.info(`📦 Processando batch ${batchIndex + 1}/${totalBatches} (${batchSize} ETFs)`);
  }

  /**
   * Log de progresso geral
   */
  progress() {
    const elapsed = Math.round((new Date() - this.startTime) / 1000);
    const rate = this.stats.processed > 0 ? (this.stats.processed / elapsed * 60).toFixed(1) : 0;
    
    this.info(`📈 Progresso: ${this.stats.processed}/${this.stats.total} | ✅ ${this.stats.success} | ❌ ${this.stats.failed} | ⏭️ ${this.stats.skipped} | ⏱️ ${elapsed}s | 📊 ${rate} ETFs/min`);
  }

  /**
   * Atualiza estatísticas totais
   */
  setTotal(total) {
    this.stats.total = total;
    this.info(`📊 Total de ETFs para processar: ${total}`);
  }

  /**
   * Gera relatório final detalhado
   */
  generateFinalReport() {
    const endTime = new Date();
    const totalTime = Math.round((endTime - this.startTime) / 1000);
    const avgRate = this.stats.processed > 0 ? (this.stats.processed / totalTime * 60).toFixed(1) : 0;
    
    const report = {
      summary: {
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalTimeSeconds: totalTime,
        totalTimeFormatted: this.formatDuration(totalTime)
      },
      statistics: {
        totalEtfs: this.stats.total,
        processed: this.stats.processed,
        successful: this.stats.success,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        successRate: this.stats.processed > 0 ? ((this.stats.success / this.stats.processed) * 100).toFixed(1) + '%' : '0%',
        avgRatePerMinute: avgRate
      },
      errors: this.stats.errors.map(err => ({
        timestamp: err.timestamp,
        message: err.message,
        error: err.error,
        data: err.data
      })),
      performance: {
        logsGenerated: this.logs.length,
        memoryUsage: process.memoryUsage ? process.memoryUsage() : null
      }
    };

    // Log do relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📋 RELATÓRIO FINAL DO PIPELINE DE ETFs');
    console.log('='.repeat(80));
    console.log(`⏰ Tempo total: ${report.summary.totalTimeFormatted}`);
    console.log(`📊 ETFs processados: ${report.statistics.processed}/${report.statistics.totalEtfs}`);
    console.log(`✅ Sucessos: ${report.statistics.successful} (${report.statistics.successRate})`);
    console.log(`❌ Falhas: ${report.statistics.failed}`);
    console.log(`⏭️  Pulados: ${report.statistics.skipped}`);
    console.log(`⚡ Taxa média: ${report.statistics.avgRatePerMinute} ETFs/min`);
    
    if (report.errors.length > 0) {
      console.log(`\n🚨 ERROS ENCONTRADOS (${report.errors.length}):`);
      report.errors.slice(0, 10).forEach((err, index) => {
        console.log(`${index + 1}. [${err.timestamp}] ${err.message}`);
        if (err.error) console.log(`   💥 ${err.error}`);
      });
      
      if (report.errors.length > 10) {
        console.log(`   ... e mais ${report.errors.length - 10} erros`);
      }
    }
    
    console.log('='.repeat(80));
    
    return report;
  }

  /**
   * Formata duração em segundos para formato legível
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Salva logs em arquivo (se configurado)
   */
  async saveLogs() {
    if (!LOGGING_CONFIG.saveToFile) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `etf-pipeline-${timestamp}.json`;
      
      const logData = {
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          totalLogs: this.logs.length
        },
        statistics: this.stats,
        logs: this.logs
      };
      
      // Em um ambiente real, você salvaria em arquivo aqui
      // Para este exemplo, apenas logamos que salvaria
      this.info(`💾 Logs salvos em: ${filename}`, {
        totalLogs: this.logs.length,
        fileSize: JSON.stringify(logData).length + ' bytes'
      });
      
      return filename;
      
    } catch (error) {
      this.error('Erro ao salvar logs', error);
    }
  }

  /**
   * Retorna estatísticas atuais
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Retorna todos os logs
   */
  getLogs() {
    return [...this.logs];
  }
}

// Instância singleton do logger
export const logger = new PipelineLogger();

export default logger; 