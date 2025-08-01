#!/usr/bin/env node

/**
 * MONITOR ENRIQUECIMENTO IA - 300 ETFs RESTANTES
 * 
 * Monitora o progresso do pipeline de enriquecimento IA
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class EnrichmentMonitor {
  constructor() {
    this.startTime = new Date();
    this.lastCheck = null;
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
      // Total de ETFs com análises IA
      const { data: enrichedData, error: enrichedError } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol, ai_analysis_date, ai_investment_thesis')
        .not('ai_investment_thesis', 'is', null);

      if (enrichedError) throw enrichedError;

      // ETFs enriquecidos hoje
      const today = new Date().toISOString().split('T')[0];
      const enrichedToday = enrichedData.filter(etf => 
        etf.ai_analysis_date && 
        etf.ai_analysis_date.startsWith(today)
      );

      // ETFs sem análises IA
      const { data: remainingData, error: remainingError } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol')
        .is('ai_investment_thesis', null);

      if (remainingError) throw remainingError;

      return {
        total_enriched: enrichedData.length,
        enriched_today: enrichedToday.length,
        remaining: remainingData.length,
        completion_percentage: ((enrichedData.length / 1370) * 100).toFixed(1),
        target_progress: ((enrichedData.length / 600) * 100).toFixed(1) // Meta de 600 ETFs
      };
    } catch (error) {
      await this.log(`❌ Erro ao verificar progresso: ${error.message}`);
      return null;
    }
  }

  /**
   * Verificar qualidade das análises
   */
  async checkAnalysisQuality() {
    try {
      const { data, error } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol, ai_investment_thesis, ai_risk_analysis, ai_market_context, ai_use_cases')
        .not('ai_investment_thesis', 'is', null);

      if (error) throw error;

      const completeAnalyses = data.filter(etf => 
        etf.ai_investment_thesis && 
        etf.ai_risk_analysis && 
        etf.ai_market_context && 
        etf.ai_use_cases &&
        etf.ai_investment_thesis.length > 100 && // Análises com conteúdo substancial
        etf.ai_risk_analysis.length > 100
      );

      const partialAnalyses = data.filter(etf => 
        etf.ai_investment_thesis && (
          !etf.ai_risk_analysis || 
          !etf.ai_market_context || 
          !etf.ai_use_cases ||
          etf.ai_investment_thesis.length <= 100
        )
      );

      return {
        complete_analyses: completeAnalyses.length,
        partial_analyses: partialAnalyses.length,
        quality_percentage: ((completeAnalyses.length / data.length) * 100).toFixed(1)
      };
    } catch (error) {
      await this.log(`❌ Erro ao verificar qualidade: ${error.message}`);
      return null;
    }
  }

  /**
   * Estimar tempo e custo restante
   */
  estimateCompletion(progress) {
    if (!progress || progress.remaining === 0) {
      return {
        time_remaining: '0 minutos',
        cost_remaining: '$0.00',
        eta: 'Concluído'
      };
    }

    const etfsPerMinute = 0.67; // ~1.5 minutos por ETF (incluindo delays)
    const costPerETF = 0.15;

    const minutesRemaining = progress.remaining / etfsPerMinute;
    const costRemaining = progress.remaining * costPerETF;

    const eta = new Date(Date.now() + minutesRemaining * 60 * 1000);

    return {
      time_remaining: `${(minutesRemaining / 60).toFixed(1)} horas`,
      cost_remaining: `$${costRemaining.toFixed(2)}`,
      eta: eta.toLocaleTimeString('pt-BR')
    };
  }

  /**
   * Gerar relatório de progresso
   */
  async generateReport() {
    try {
      await this.log('📊 RELATÓRIO DE PROGRESSO - ENRIQUECIMENTO IA');
      await this.log('═'.repeat(60));

      // Progresso do enriquecimento
      const progress = await this.checkEnrichmentProgress();
      if (progress) {
        await this.log('🤖 ENRIQUECIMENTO IA:');
        await this.log(`   ✅ Total enriquecido: ${progress.total_enriched}/1370 ETFs`);
        await this.log(`   📅 Enriquecido hoje: ${progress.enriched_today} ETFs`);
        await this.log(`   📊 Progresso geral: ${progress.completion_percentage}%`);
        await this.log(`   🎯 Progresso meta (600): ${progress.target_progress}%`);
        await this.log(`   ⏳ Restante: ${progress.remaining} ETFs`);
      }

      await this.log('');

      // Qualidade das análises
      const quality = await this.checkAnalysisQuality();
      if (quality) {
        await this.log('📈 QUALIDADE DAS ANÁLISES:');
        await this.log(`   ✅ Análises completas: ${quality.complete_analyses} ETFs`);
        await this.log(`   ⚠️ Análises parciais: ${quality.partial_analyses} ETFs`);
        await this.log(`   📊 Taxa de qualidade: ${quality.quality_percentage}%`);
      }

      await this.log('');

      // Estimativas
      const estimates = this.estimateCompletion(progress);
      if (progress && progress.remaining > 0) {
        await this.log('⏰ ESTIMATIVAS:');
        await this.log(`   ⏱️ Tempo restante: ${estimates.time_remaining}`);
        await this.log(`   💰 Custo restante: ${estimates.cost_remaining}`);
        await this.log(`   🕐 ETA: ${estimates.eta}`);
      } else {
        await this.log('🎉 PIPELINE CONCLUÍDO!');
        await this.log('   ✅ Todos os ETFs foram enriquecidos');
      }

      await this.log('');
      await this.log('═'.repeat(60));

      const elapsedMinutes = (new Date() - this.startTime) / 1000 / 60;
      await this.log(`📅 Tempo de monitoramento: ${elapsedMinutes.toFixed(1)} minutos`);
      
      this.lastCheck = new Date();

    } catch (error) {
      await this.log(`❌ Erro ao gerar relatório: ${error.message}`);
    }
  }

  /**
   * Monitorar continuamente
   */
  async startMonitoring(intervalMinutes = 3) {
    await this.log(`🚀 INICIANDO MONITORAMENTO - ENRIQUECIMENTO IA`);
    await this.log(`⏰ Intervalo: ${intervalMinutes} minutos`);
    await this.log('');

    // Relatório inicial
    await this.generateReport();

    // Monitoramento contínuo
    const interval = setInterval(async () => {
      await this.log('\n🔄 ATUALIZANDO PROGRESSO...\n');
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
async function runMonitor() {
  const monitor = new EnrichmentMonitor();
  
  try {
    // Monitorar a cada 3 minutos
    await monitor.startMonitoring(3);
  } catch (error) {
    console.error('❌ Erro no monitor:', error);
    process.exit(1);
  }
}

// Iniciar se executado diretamente
if (require.main === module) {
  runMonitor();
}

module.exports = { EnrichmentMonitor };