const { PrismaClient } = require('@prisma/client');
const { enrichETFData, validateCrossSource } = require('./advanced_data_enrichment');
const prisma = new PrismaClient();

// Função para buscar dados existentes do banco
async function getExistingData(symbol) {
  try {
    const data = await prisma.calculated_metrics_teste.findUnique({
      where: { symbol },
      select: {
        symbol: true,
        returns_12m: true,
        returns_24m: true,
        returns_36m: true,
        returns_5y: true,
        volatility_12m: true,
        volatility_24m: true,
        volatility_36m: true,
        sharpe_12m: true,
        sharpe_24m: true,
        sharpe_36m: true,
        max_drawdown: true
      }
    });
    
    if (!data) return null;
    
    // Converter para formato compatível
    const metrics = {};
    Object.keys(data).forEach(key => {
      if (key !== 'symbol' && data[key] !== null) {
        metrics[key] = Number(data[key]);
      }
    });
    
    return {
      source: 'database',
      symbol,
      metrics,
      dataPoints: Object.keys(metrics).length,
      lastUpdate: new Date()
    };
    
  } catch (error) {
    console.error(`❌ Erro ao buscar dados do banco para ${symbol}:`, error.message);
    return null;
  }
}

// Função para validar um ETF específico
async function validateETF(symbol) {
  console.log(`🔍 Validando ${symbol}...`);
  
  try {
    // Buscar dados existentes do banco
    const existingData = await getExistingData(symbol);
    if (!existingData) {
      return {
        symbol,
        status: 'no_data',
        message: 'Nenhum dado encontrado no banco'
      };
    }
    
    // Buscar dados de fontes externas
    const externalData = await enrichETFData(symbol);
    if (!externalData) {
      return {
        symbol,
        status: 'no_external_data',
        message: 'Não foi possível obter dados de fontes externas',
        existingMetrics: Object.keys(existingData.metrics).length
      };
    }
    
    // Comparar dados
    const validation = validateCrossSource(existingData, externalData.data, 0.15); // 15% de tolerância
    
    const result = {
      symbol,
      status: validation.isValid ? 'valid' : 'discrepancy',
      existingSource: 'database',
      externalSources: externalData.sources,
      confidence: externalData.confidence,
      commonMetrics: validation.commonMetrics,
      differences: validation.differences || [],
      existingMetrics: Object.keys(existingData.metrics).length,
      externalMetrics: Object.keys(externalData.data.metrics).length
    };
    
    if (!validation.isValid && validation.differences.length > 0) {
      console.log(`⚠️ Discrepâncias encontradas para ${symbol}:`);
      validation.differences.forEach(diff => {
        console.log(`   ${diff.metric}: DB=${diff.value1.toFixed(4)}, ${diff.source2}=${diff.value2.toFixed(4)} (diff: ${diff.relativeDiff})`);
      });
    } else {
      console.log(`✅ Dados validados para ${symbol}`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Erro na validação de ${symbol}:`, error.message);
    return {
      symbol,
      status: 'error',
      message: error.message
    };
  }
}

// Função para gerar relatório de qualidade
async function generateQualityReport(validationResults) {
  const report = {
    totalValidated: validationResults.length,
    valid: 0,
    discrepancies: 0,
    noData: 0,
    noExternalData: 0,
    errors: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    majorDiscrepancies: [],
    summary: {}
  };
  
  validationResults.forEach(result => {
    switch (result.status) {
      case 'valid':
        report.valid++;
        break;
      case 'discrepancy':
        report.discrepancies++;
        if (result.differences && result.differences.length > 3) {
          report.majorDiscrepancies.push(result);
        }
        break;
      case 'no_data':
        report.noData++;
        break;
      case 'no_external_data':
        report.noExternalData++;
        break;
      case 'error':
        report.errors++;
        break;
    }
    
    if (result.confidence === 'high') report.highConfidence++;
    else if (result.confidence === 'medium') report.mediumConfidence++;
    else if (result.confidence === 'low') report.lowConfidence++;
  });
  
  // Calcular percentuais
  report.summary = {
    validPercentage: ((report.valid / report.totalValidated) * 100).toFixed(1),
    discrepancyPercentage: ((report.discrepancies / report.totalValidated) * 100).toFixed(1),
    dataAvailabilityPercentage: (((report.valid + report.discrepancies) / report.totalValidated) * 100).toFixed(1),
    highConfidencePercentage: ((report.highConfidence / report.totalValidated) * 100).toFixed(1)
  };
  
  return report;
}

// Função principal de validação
async function runDataValidation() {
  try {
    console.log('🔍 Iniciando validação de dados existentes...\n');
    
    // Buscar ETFs com dados para validar (amostra representativa)
    const etfsToValidate = await prisma.$queryRaw`
      SELECT cm.symbol, el.name, el.etfcompany
      FROM calculated_metrics_teste cm
      JOIN etf_list el ON cm.symbol = el.symbol
      WHERE cm.returns_12m IS NOT NULL 
        AND cm.volatility_12m IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 30
    `;
    
    console.log(`📊 Validando amostra de ${etfsToValidate.length} ETFs...\n`);
    
    const validationResults = [];
    const startTime = new Date();
    
    for (let i = 0; i < etfsToValidate.length; i++) {
      const etf = etfsToValidate[i];
      console.log(`\n📈 Validando ${etf.symbol} (${i + 1}/${etfsToValidate.length})`);
      
      const result = await validateETF(etf.symbol);
      validationResults.push(result);
      
      // Progress report a cada 10 ETFs
      if ((i + 1) % 10 === 0) {
        const elapsed = (new Date() - startTime) / 1000;
        const rate = (i + 1) / elapsed;
        const remaining = etfsToValidate.length - (i + 1);
        const eta = remaining / rate;
        
        console.log(`\n📊 PROGRESSO: ${i + 1}/${etfsToValidate.length} (${(((i + 1)/etfsToValidate.length)*100).toFixed(1)}%)`);
        console.log(`   Taxa: ${rate.toFixed(2)} ETFs/seg, ETA: ${(eta/60).toFixed(1)} min`);
      }
    }
    
    // Gerar relatório de qualidade
    const qualityReport = await generateQualityReport(validationResults);
    
    // Exibir relatório
    console.log('\n🎯 RELATÓRIO DE QUALIDADE DOS DADOS:');
    console.log(`   Total validado: ${qualityReport.totalValidated}`);
    console.log(`   Dados válidos: ${qualityReport.valid} (${qualityReport.summary.validPercentage}%)`);
    console.log(`   Discrepâncias: ${qualityReport.discrepancies} (${qualityReport.summary.discrepancyPercentage}%)`);
    console.log(`   Sem dados: ${qualityReport.noData}`);
    console.log(`   Sem dados externos: ${qualityReport.noExternalData}`);
    console.log(`   Erros: ${qualityReport.errors}`);
    
    console.log('\n📊 CONFIANÇA DOS DADOS:');
    console.log(`   Alta confiança: ${qualityReport.highConfidence} (${qualityReport.summary.highConfidencePercentage}%)`);
    console.log(`   Média confiança: ${qualityReport.mediumConfidence}`);
    console.log(`   Baixa confiança: ${qualityReport.lowConfidence}`);
    
    console.log(`\n📈 DISPONIBILIDADE GERAL: ${qualityReport.summary.dataAvailabilityPercentage}%`);
    
    // Discrepâncias maiores
    if (qualityReport.majorDiscrepancies.length > 0) {
      console.log('\n⚠️ DISCREPÂNCIAS MAIORES (>3 diferenças):');
      qualityReport.majorDiscrepancies.forEach(result => {
        console.log(`   ${result.symbol}: ${result.differences.length} diferenças`);
        result.differences.slice(0, 3).forEach(diff => {
          console.log(`     ${diff.metric}: DB=${diff.value1.toFixed(4)}, ${diff.source2}=${diff.value2.toFixed(4)}`);
        });
      });
    }
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    if (qualityReport.discrepancies > 0) {
      console.log(`   • Revisar ${qualityReport.discrepancies} ETFs com discrepâncias`);
    }
    if (qualityReport.noExternalData > 0) {
      console.log(`   • ${qualityReport.noExternalData} ETFs não têm dados externos disponíveis`);
    }
    if (qualityReport.lowConfidence > 0) {
      console.log(`   • ${qualityReport.lowConfidence} ETFs têm baixa confiança nos dados`);
    }
    if (parseFloat(qualityReport.summary.validPercentage) < 90) {
      console.log('   • Considerar enriquecimento adicional dos dados');
    } else {
      console.log('   • Qualidade dos dados está boa (>90% válidos)');
    }
    
    const totalTime = (new Date() - startTime) / 1000;
    console.log(`\n⏱️ Tempo total: ${(totalTime/60).toFixed(1)} minutos`);
    
    return qualityReport;
    
  } catch (error) {
    console.error('❌ Erro na validação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runDataValidation();
}

module.exports = {
  validateETF,
  runDataValidation,
  generateQualityReport
}; 