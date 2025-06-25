const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateRankings() {
  try {
    console.log('🔄 Iniciando população da tabela etf_rankings usando active_etfs...');
    
    // Limpar dados antigos
    await prisma.$executeRaw`DELETE FROM etf_rankings`;
    console.log('🧹 Dados antigos removidos');
    
    // 1. TOP RETURNS 12M - usando active_etfs
    console.log('📈 Calculando top returns 12m...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'top_returns_12m' as category,
        ROW_NUMBER() OVER (ORDER BY returns_12m DESC) as rank_position,
        symbol,
        returns_12m as value,
        returns_12m * 100 as percentage_value
      FROM active_etfs
      WHERE returns_12m IS NOT NULL 
        AND returns_12m >= -0.98 
        AND returns_12m <= 10.0
      ORDER BY returns_12m DESC
      LIMIT 10
    `;
    
    // 2. TOP SHARPE 12M - usando active_etfs
    console.log('🏆 Calculando top sharpe 12m...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'top_sharpe_12m' as category,
        ROW_NUMBER() OVER (ORDER BY sharpe_12m DESC) as rank_position,
        symbol,
        sharpe_12m as value,
        NULL as percentage_value
      FROM active_etfs
      WHERE sharpe_12m IS NOT NULL 
        AND sharpe_12m >= -15.0 
        AND sharpe_12m <= 15.0
      ORDER BY sharpe_12m DESC
      LIMIT 10
    `;
    
    // 3. TOP DIVIDEND YIELD - usando active_etfs
    console.log('💰 Calculando top dividend yield...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'top_dividend_yield' as category,
        ROW_NUMBER() OVER (ORDER BY dividend_yield DESC) as rank_position,
        symbol,
        dividends_12m as value,
        dividend_yield as percentage_value
      FROM (
        SELECT 
          symbol,
          dividends_12m,
          CASE 
            WHEN nav > 0 AND dividends_12m > 0 
            THEN (dividends_12m / nav) * 100
            ELSE NULL
          END as dividend_yield
        FROM active_etfs
        WHERE dividends_12m IS NOT NULL 
          AND dividends_12m > 0 
          AND dividends_12m <= 500
          AND nav IS NOT NULL 
          AND nav > 1
      ) ranked_dividends
      WHERE dividend_yield IS NOT NULL
        AND dividend_yield >= 0.05
        AND dividend_yield <= 25.0
      ORDER BY dividend_yield DESC
      LIMIT 10
    `;
    
    // 4. HIGHEST VOLUME - usando active_etfs
    console.log('📊 Calculando highest volume...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'highest_volume' as category,
        ROW_NUMBER() OVER (ORDER BY avgvolume DESC) as rank_position,
        symbol,
        avgvolume as value,
        NULL as percentage_value
      FROM active_etfs
      WHERE avgvolume IS NOT NULL 
        AND avgvolume > 0
      ORDER BY avgvolume DESC
      LIMIT 10
    `;
    
    // 5. LOWEST MAX DRAWDOWN - usando active_etfs
    console.log('🛡️ Calculando lowest max drawdown...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'lowest_max_drawdown' as category,
        ROW_NUMBER() OVER (ORDER BY max_drawdown DESC) as rank_position,
        symbol,
        max_drawdown as value,
        max_drawdown * 100 as percentage_value
      FROM active_etfs
      WHERE max_drawdown IS NOT NULL 
        AND max_drawdown >= -0.99
        AND max_drawdown <= 0
      ORDER BY max_drawdown DESC
      LIMIT 10
    `;
    
    // 6. LOWEST VOLATILITY 12M - usando active_etfs
    console.log('📉 Calculando lowest volatility 12m...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'lowest_volatility_12m' as category,
        ROW_NUMBER() OVER (ORDER BY volatility_12m ASC) as rank_position,
        symbol,
        volatility_12m as value,
        volatility_12m * 100 as percentage_value
      FROM active_etfs
      WHERE volatility_12m IS NOT NULL 
        AND volatility_12m >= 0.0001
        AND volatility_12m <= 3.0
      ORDER BY volatility_12m ASC
      LIMIT 10
    `;
    
    // Verificar resultados e qualidade dos dados
    const totalRankings = await prisma.$queryRaw`
      SELECT category, COUNT(*) as count 
      FROM etf_rankings 
      GROUP BY category 
      ORDER BY category
    `;
    
    // Verificar se há dados suspeitos
    const suspiciousData = await prisma.$queryRaw`
      SELECT 
        category,
        COUNT(CASE WHEN percentage_value > 1000 THEN 1 END) as extreme_percentages,
        COUNT(CASE WHEN percentage_value = 0 AND category = 'lowest_volatility_12m' THEN 1 END) as zero_volatility,
        MIN(percentage_value) as min_value,
        MAX(percentage_value) as max_value
      FROM etf_rankings 
      WHERE percentage_value IS NOT NULL
      GROUP BY category
    `;
    
    console.log('✅ Rankings populados com sucesso usando active_etfs!');
    console.log('📊 Estatísticas por categoria:');
    totalRankings.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} ETFs`);
    });
    
    console.log('\n🔍 Verificação de qualidade dos dados:');
    suspiciousData.forEach(check => {
      console.log(`   ${check.category}:`);
      if (check.extreme_percentages > 0) {
        console.log(`     - Valores extremos (>1000%): ${check.extreme_percentages} - PRESERVADOS`);
      }
      if (check.category === 'lowest_volatility_12m') {
        console.log(`     - Volatilidade zero: ${check.zero_volatility}`);
      }
      console.log(`     - Faixa: ${Number(check.min_value).toFixed(2)}% a ${Number(check.max_value).toFixed(2)}%`);
    });
    
    // Verificar se alguma categoria ficou vazia
    const emptyCategories = totalRankings.filter(stat => stat.count === 0);
    if (emptyCategories.length > 0) {
      console.log('\n⚠️ Categorias vazias (podem precisar de filtros menos restritivos):');
      emptyCategories.forEach(cat => {
        console.log(`   - ${cat.category}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao popular rankings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateRankings(); 