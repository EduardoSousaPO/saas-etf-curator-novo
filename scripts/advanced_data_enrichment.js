const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuração das APIs
const API_CONFIGS = {
  yahoo: {
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/',
    rateLimit: 2000, // 2 segundos entre requests
    maxRetries: 3
  },
  alphavantage: {
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || 'demo', // Usar chave demo se não configurada
    rateLimit: 12000, // 12 segundos (5 requests por minuto)
    maxRetries: 2
  },
  polygon: {
    baseUrl: 'https://api.polygon.io/v2/aggs/ticker',
    apiKey: process.env.POLYGON_API_KEY || 'demo',
    rateLimit: 12000, // 12 segundos para conta gratuita
    maxRetries: 2
  }
};

// Utilitários
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const calculateMetrics = (prices) => {
  if (!prices || prices.length < 2) return null;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i-1]) / prices[i-1];
    returns.push(dailyReturn);
  }
  
  const totalReturn = (prices[prices.length - 1] - prices[0]) / prices[0];
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance * 252); // Anualizada
  
  // Calcular max drawdown
  let maxDrawdown = 0;
  let peak = prices[0];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    } else {
      const drawdown = (peak - prices[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  // Sharpe ratio (assumindo risk-free rate de 2%)
  const riskFreeRate = 0.02;
  const sharpe = volatility > 0 ? (totalReturn - riskFreeRate) / volatility : 0;
  
  return {
    totalReturn,
    volatility,
    sharpe,
    maxDrawdown: -maxDrawdown // Negativo para representar perda
  };
};

// Função para buscar dados do Yahoo Finance
async function fetchYahooData(symbol) {
  try {
    const url = `${API_CONFIGS.yahoo.baseUrl}${symbol}?interval=1d&range=5y`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      return null;
    }
    
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;
    const volumes = result.indicators.quote[0].volume || [];
    
    // Filtrar dados válidos
    const validData = timestamps.map((timestamp, i) => ({
      date: new Date(timestamp * 1000),
      close: closes[i],
      volume: volumes[i] || 0
    })).filter(d => d.close !== null && !isNaN(d.close));
    
    if (validData.length < 30) return null; // Mínimo de 30 dias
    
    const prices = validData.map(d => d.close);
    const avgVolume = validData.reduce((sum, d) => sum + d.volume, 0) / validData.length;
    
    // Calcular métricas para diferentes períodos
    const metrics = {};
    const periods = [
      { name: '12m', days: 252 },
      { name: '24m', days: 504 },
      { name: '36m', days: 756 },
      { name: '5y', days: 1260 }
    ];
    
    periods.forEach(period => {
      if (validData.length >= period.days) {
        const periodPrices = prices.slice(-period.days);
        const periodMetrics = calculateMetrics(periodPrices);
        if (periodMetrics) {
          metrics[`returns_${period.name}`] = periodMetrics.totalReturn;
          metrics[`volatility_${period.name}`] = periodMetrics.volatility;
          metrics[`sharpe_${period.name}`] = periodMetrics.sharpe;
        }
      }
    });
    
    // Max drawdown para todo o período
    const allMetrics = calculateMetrics(prices);
    if (allMetrics) {
      metrics.max_drawdown = allMetrics.maxDrawdown;
    }
    
    return {
      source: 'yahoo',
      symbol,
      metrics,
      avgVolume,
      dataPoints: validData.length,
      lastUpdate: new Date()
    };
    
  } catch (error) {
    console.error(`❌ Erro Yahoo Finance para ${symbol}:`, error.message);
    return null;
  }
}

// Função para buscar dados do Alpha Vantage
async function fetchAlphaVantageData(symbol) {
  try {
    const url = `${API_CONFIGS.alphavantage.baseUrl}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_CONFIGS.alphavantage.apiKey}&outputsize=full`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      throw new Error(data['Error Message'] || 'API rate limit exceeded');
    }
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) return null;
    
    const validData = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date: new Date(date),
        close: parseFloat(values['5. adjusted close']),
        volume: parseInt(values['6. volume'])
      }))
      .filter(d => !isNaN(d.close) && d.close > 0)
      .sort((a, b) => a.date - b.date);
    
    if (validData.length < 30) return null;
    
    const prices = validData.map(d => d.close);
    const avgVolume = validData.reduce((sum, d) => sum + d.volume, 0) / validData.length;
    
    // Calcular métricas
    const metrics = {};
    const periods = [
      { name: '12m', days: 252 },
      { name: '24m', days: 504 },
      { name: '36m', days: 756 },
      { name: '5y', days: 1260 }
    ];
    
    periods.forEach(period => {
      if (validData.length >= period.days) {
        const periodPrices = prices.slice(-period.days);
        const periodMetrics = calculateMetrics(periodPrices);
        if (periodMetrics) {
          metrics[`returns_${period.name}`] = periodMetrics.totalReturn;
          metrics[`volatility_${period.name}`] = periodMetrics.volatility;
          metrics[`sharpe_${period.name}`] = periodMetrics.sharpe;
        }
      }
    });
    
    const allMetrics = calculateMetrics(prices);
    if (allMetrics) {
      metrics.max_drawdown = allMetrics.maxDrawdown;
    }
    
    return {
      source: 'alphavantage',
      symbol,
      metrics,
      avgVolume,
      dataPoints: validData.length,
      lastUpdate: new Date()
    };
    
  } catch (error) {
    console.error(`❌ Erro Alpha Vantage para ${symbol}:`, error.message);
    return null;
  }
}

// Função para validar dados entre fontes
function validateCrossSource(data1, data2, tolerance = 0.1) {
  if (!data1 || !data2) return { isValid: false, differences: [] };
  
  const differences = [];
  const metrics1 = data1.metrics;
  const metrics2 = data2.metrics;
  
  // Comparar métricas comuns
  const commonMetrics = Object.keys(metrics1).filter(key => key in metrics2);
  
  commonMetrics.forEach(metric => {
    const val1 = metrics1[metric];
    const val2 = metrics2[metric];
    
    if (val1 !== null && val2 !== null) {
      const diff = Math.abs(val1 - val2);
      const avgVal = (Math.abs(val1) + Math.abs(val2)) / 2;
      const relativeDiff = avgVal > 0 ? diff / avgVal : 0;
      
      if (relativeDiff > tolerance) {
        differences.push({
          metric,
          source1: data1.source,
          value1: val1,
          source2: data2.source,
          value2: val2,
          relativeDiff: relativeDiff.toFixed(3)
        });
      }
    }
  });
  
  return {
    isValid: differences.length === 0,
    differences,
    commonMetrics: commonMetrics.length
  };
}

// Função principal de enriquecimento
async function enrichETFData(symbol, existingData = null) {
  console.log(`🔍 Enriquecendo dados para ${symbol}...`);
  
  const results = [];
  
  // Buscar dados do Yahoo Finance
  await sleep(API_CONFIGS.yahoo.rateLimit);
  const yahooData = await fetchYahooData(symbol);
  if (yahooData) results.push(yahooData);
  
  // Buscar dados do Alpha Vantage (apenas se Yahoo falhou ou para validação)
  if (!yahooData || results.length < 2) {
    await sleep(API_CONFIGS.alphavantage.rateLimit);
    const alphaData = await fetchAlphaVantageData(symbol);
    if (alphaData) results.push(alphaData);
  }
  
  if (results.length === 0) {
    console.log(`❌ Nenhuma fonte retornou dados para ${symbol}`);
    return null;
  }
  
  // Validação cruzada se temos múltiplas fontes
  let validationResult = null;
  if (results.length >= 2) {
    validationResult = validateCrossSource(results[0], results[1]);
    console.log(`🔍 Validação cruzada para ${symbol}: ${validationResult.isValid ? '✅' : '⚠️'}`);
    
    if (!validationResult.isValid && validationResult.differences.length > 0) {
      console.log(`   Diferenças encontradas: ${validationResult.differences.length}`);
      validationResult.differences.forEach(diff => {
        console.log(`     ${diff.metric}: ${diff.source1}=${diff.value1.toFixed(4)}, ${diff.source2}=${diff.value2.toFixed(4)} (diff: ${diff.relativeDiff})`);
      });
    }
  }
  
  // Usar dados da fonte mais confiável (Yahoo primeiro, depois Alpha Vantage)
  const bestData = results.find(r => r.source === 'yahoo') || results[0];
  
  return {
    symbol,
    data: bestData,
    validation: validationResult,
    sources: results.map(r => r.source),
    confidence: validationResult?.isValid ? 'high' : (results.length > 1 ? 'medium' : 'low')
  };
}

// Função para salvar dados enriquecidos
async function saveEnrichedData(enrichedData) {
  const { symbol, data } = enrichedData;
  const metrics = data.metrics;
  
  try {
    // Verificar se já existe registro
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
      console.log(`✅ Dados atualizados para ${symbol}`);
    } else {
      await prisma.calculated_metrics_teste.create({
        data: {
          symbol,
          ...updateData,
          dividends_12m: 0, // Placeholder
          dividends_24m: 0,
          dividends_36m: 0,
          dividends_all_time: 0
        }
      });
      console.log(`✅ Novo registro criado para ${symbol}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar dados para ${symbol}:`, error.message);
    return false;
  }
}

// Função principal
async function runAdvancedEnrichment() {
  try {
    console.log('🚀 Iniciando enriquecimento avançado de dados...\n');
    
    // Buscar ETFs que precisam de enriquecimento
    const etfsToEnrich = await prisma.$queryRaw`
      SELECT el.symbol, el.name, el.etfcompany
      FROM etf_list el
      LEFT JOIN calculated_metrics_teste cm ON el.symbol = cm.symbol
      WHERE cm.symbol IS NULL 
         OR cm.returns_12m IS NULL 
         OR cm.volatility_12m IS NULL
      ORDER BY el.symbol
      LIMIT 50
    `;
    
    console.log(`📊 Encontrados ${etfsToEnrich.length} ETFs para enriquecimento\n`);
    
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      validationIssues: 0,
      startTime: new Date()
    };
    
    for (const etf of etfsToEnrich) {
      console.log(`\n📈 Processando ${etf.symbol} (${results.processed + 1}/${etfsToEnrich.length})`);
      
      try {
        const enrichedData = await enrichETFData(etf.symbol);
        
        if (enrichedData) {
          const saved = await saveEnrichedData(enrichedData);
          
          if (saved) {
            results.successful++;
            
            if (enrichedData.validation && !enrichedData.validation.isValid) {
              results.validationIssues++;
            }
          } else {
            results.failed++;
          }
        } else {
          results.failed++;
        }
        
        results.processed++;
        
        // Progress report a cada 10 ETFs
        if (results.processed % 10 === 0) {
          const elapsed = (new Date() - results.startTime) / 1000;
          const rate = results.processed / elapsed;
          const remaining = etfsToEnrich.length - results.processed;
          const eta = remaining / rate;
          
          console.log(`\n📊 PROGRESSO: ${results.processed}/${etfsToEnrich.length} (${((results.processed/etfsToEnrich.length)*100).toFixed(1)}%)`);
          console.log(`   Sucessos: ${results.successful}, Falhas: ${results.failed}`);
          console.log(`   Taxa: ${rate.toFixed(2)} ETFs/seg, ETA: ${(eta/60).toFixed(1)} min`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${etf.symbol}:`, error.message);
        results.failed++;
        results.processed++;
      }
    }
    
    // Relatório final
    const totalTime = (new Date() - results.startTime) / 1000;
    console.log('\n🎯 RELATÓRIO FINAL:');
    console.log(`   ETFs processados: ${results.processed}`);
    console.log(`   Sucessos: ${results.successful}`);
    console.log(`   Falhas: ${results.failed}`);
    console.log(`   Issues de validação: ${results.validationIssues}`);
    console.log(`   Taxa de sucesso: ${((results.successful/results.processed)*100).toFixed(1)}%`);
    console.log(`   Tempo total: ${(totalTime/60).toFixed(1)} minutos`);
    
  } catch (error) {
    console.error('❌ Erro no enriquecimento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAdvancedEnrichment();
}

module.exports = {
  enrichETFData,
  validateCrossSource,
  runAdvancedEnrichment
}; 