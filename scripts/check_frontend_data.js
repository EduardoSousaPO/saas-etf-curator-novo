const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class FrontendDataChecker {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
  }

  async checkAPI(endpoint) {
    try {
      console.log(`🔍 Checking ${endpoint}...`);
      const response = await axios.get(`${this.baseUrl}${endpoint}`, { timeout: 10000 });
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status || 'No response'
      };
    }
  }

  async checkDatabaseData() {
    try {
      console.log('🔍 Checking database data...');
      
      // Verificar alguns ETFs específicos
      const testSymbols = ['SPY', 'QQQ', 'VTI', 'IVV', 'VOO'];
      
      const { data, error } = await supabase
        .from('calculated_metrics_teste')
        .select('*')
        .in('symbol', testSymbols);
      
      if (error) throw error;
      
      console.log('📊 Database data for test symbols:');
      data.forEach(etf => {
        console.log(`${etf.symbol}:`);
        console.log(`  Returns 12m: ${etf.returns_12m}`);
        console.log(`  Volatility 12m: ${etf.volatility_12m}`);
        console.log(`  Sharpe 12m: ${etf.sharpe_12m}`);
        console.log(`  Max Drawdown: ${etf.max_drawdown}`);
        console.log('');
      });
      
      return data;
      
    } catch (error) {
      console.error('❌ Database error:', error.message);
      return null;
    }
  }

  formatValue(value, type = 'number') {
    if (value === null || value === undefined) return 'N/A';
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    
    switch (type) {
      case 'percentage':
        return `${(num * 100).toFixed(2)}%`;
      case 'decimal':
        return num.toFixed(4);
      default:
        return num.toFixed(2);
    }
  }

  compareData(dbData, apiData, symbol) {
    console.log(`\n🔍 Comparing data for ${symbol}:`);
    console.log('Database vs API:');
    
    const metrics = ['returns_12m', 'volatility_12m', 'sharpe_12m', 'max_drawdown'];
    
    metrics.forEach(metric => {
      const dbValue = dbData[metric];
      const apiValue = this.extractValueFromAPI(apiData, metric, symbol);
      
      console.log(`  ${metric}:`);
      console.log(`    DB: ${this.formatValue(dbValue, metric.includes('return') || metric.includes('volatility') || metric.includes('drawdown') ? 'percentage' : 'decimal')}`);
      console.log(`    API: ${this.formatValue(apiValue, metric.includes('return') || metric.includes('volatility') || metric.includes('drawdown') ? 'percentage' : 'decimal')}`);
      
      if (dbValue && apiValue) {
        const diff = Math.abs(dbValue - apiValue);
        const percentDiff = dbValue !== 0 ? (diff / Math.abs(dbValue)) * 100 : 0;
        console.log(`    Diff: ${percentDiff.toFixed(2)}%`);
      }
    });
  }

  extractValueFromAPI(apiData, metric, symbol) {
    // Tentar extrair valor da resposta da API
    if (!apiData) return null;
    
    // Para rankings
    if (apiData.top_returns_12m) {
      const etf = Object.values(apiData).flat().find(e => e.symbol === symbol);
      return etf ? etf[metric] : null;
    }
    
    // Para métricas de mercado
    if (apiData.topPerformers) {
      const etf = apiData.topPerformers.find(e => e.symbol === symbol);
      return etf ? etf[metric] : null;
    }
    
    // Para dados individuais
    return apiData[metric] || null;
  }

  async run() {
    console.log('🚀 Starting frontend data check...\n');
    
    // 1. Verificar dados do banco
    const dbData = await this.checkDatabaseData();
    
    if (!dbData) {
      console.log('❌ Cannot proceed without database data');
      return;
    }
    
    // 2. Verificar APIs do frontend
    const endpoints = [
      '/api/market/metrics',
      '/api/landing/stats',
      '/api/etfs/rankings',
      '/api/etfs/screener'
    ];
    
    console.log('\n📡 Checking API endpoints...\n');
    
    for (const endpoint of endpoints) {
      const result = await this.checkAPI(endpoint);
      
      if (result.success) {
        console.log(`✅ ${endpoint}: OK (${result.status})`);
        
        // Comparar dados específicos para alguns endpoints
        if (endpoint === '/api/market/metrics' && result.data) {
          console.log(`   Avg Return: ${this.formatValue(result.data.avgReturn, 'percentage')}`);
          console.log(`   Avg Volatility: ${this.formatValue(result.data.avgVolatility, 'percentage')}`);
          console.log(`   Avg Sharpe: ${this.formatValue(result.data.avgSharpe)}`);
          console.log(`   Data Quality: ${result.data.dataQuality?.filterEfficiency || 'N/A'}`);
        }
        
        if (endpoint === '/api/etfs/rankings' && result.data) {
          console.log(`   Top Returns Count: ${result.data.top_returns_12m?.length || 0}`);
          console.log(`   Top Sharpe Count: ${result.data.top_sharpe_12m?.length || 0}`);
          
          // Comparar dados do SPY se disponível
          const spyData = dbData.find(d => d.symbol === 'SPY');
          if (spyData && result.data.top_returns_12m) {
            const spyAPI = result.data.top_returns_12m.find(e => e.symbol === 'SPY');
            if (spyAPI) {
              this.compareData(spyData, { returns_12m: spyAPI.returns_12m }, 'SPY');
            }
          }
        }
        
      } else {
        console.log(`❌ ${endpoint}: FAILED (${result.status})`);
        console.log(`   Error: ${result.error}`);
      }
      
      console.log('');
    }
    
    // 3. Verificar formatação específica
    console.log('🔍 Data format analysis:');
    const spyData = dbData.find(d => d.symbol === 'SPY');
    if (spyData) {
      console.log('\nSPY data formats:');
      console.log(`Raw returns_12m: ${spyData.returns_12m} (type: ${typeof spyData.returns_12m})`);
      console.log(`As percentage: ${this.formatValue(spyData.returns_12m, 'percentage')}`);
      console.log(`As decimal: ${this.formatValue(spyData.returns_12m, 'decimal')}`);
      
      // Verificar se está em formato decimal ou percentual
      const returnValue = parseFloat(spyData.returns_12m);
      if (returnValue > 0 && returnValue < 1) {
        console.log('✅ Data appears to be in decimal format (0.1356 = 13.56%)');
      } else if (returnValue > 1) {
        console.log('⚠️ Data appears to be in percentage format (13.56 = 13.56%)');
      }
    }
    
    console.log('\n🎉 Frontend data check completed!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const checker = new FrontendDataChecker();
  checker.run().catch(console.error);
}

module.exports = FrontendDataChecker; 