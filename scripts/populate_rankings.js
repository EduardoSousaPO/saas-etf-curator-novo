const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateRankings() {
  try {
    console.log('🔄 Iniciando população da tabela etf_rankings com filtros aprimorados...');
    
    // Limpar dados antigos
    await prisma.$executeRaw`DELETE FROM etf_rankings`;
    console.log('🧹 Dados antigos removidos');
    
    // 1. TOP RETURNS 12M (filtros rigorosos: -95% a +500%)
    // CORREÇÃO: dados já estão em formato decimal, não multiplicar por 100
    console.log('📈 Calculando top returns 12m...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'top_returns_12m' as category,
        ROW_NUMBER() OVER (ORDER BY cm.returns_12m DESC) as rank_position,
        cm.symbol,
        cm.returns_12m as value,
        cm.returns_12m * 100 as percentage_value
      FROM calculated_metrics_teste cm
      WHERE cm.returns_12m IS NOT NULL 
        AND cm.returns_12m >= -0.95 
        AND cm.returns_12m <= 5.0
      ORDER BY cm.returns_12m DESC
      LIMIT 10
    `;
    
    // 2. TOP SHARPE 12M (filtros: -10 a +10)
    console.log('🏆 Calculando top sharpe 12m...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'top_sharpe_12m' as category,
        ROW_NUMBER() OVER (ORDER BY cm.sharpe_12m DESC) as rank_position,
        cm.symbol,
        cm.sharpe_12m as value,
        NULL as percentage_value
      FROM calculated_metrics_teste cm
      WHERE cm.sharpe_12m IS NOT NULL 
        AND cm.sharpe_12m >= -10.0 
        AND cm.sharpe_12m <= 10.0
        AND cm.returns_12m IS NOT NULL
        AND cm.returns_12m >= -0.95 
        AND cm.returns_12m <= 5.0
      ORDER BY cm.sharpe_12m DESC
      LIMIT 10
    `;
    
    // 3. TOP DIVIDEND YIELD (calculado com filtros mais restritivos: máximo 15%)
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
          cm.symbol,
          cm.dividends_12m,
          CASE 
            WHEN el.nav > 0 AND cm.dividends_12m > 0 
            THEN (cm.dividends_12m / el.nav) * 100
            ELSE NULL
          END as dividend_yield
        FROM calculated_metrics_teste cm
        JOIN etf_list el ON cm.symbol = el.symbol
        WHERE cm.dividends_12m IS NOT NULL 
          AND cm.dividends_12m > 0 
          AND cm.dividends_12m <= 50
          AND el.nav IS NOT NULL 
          AND el.nav > 5
      ) ranked_dividends
      WHERE dividend_yield IS NOT NULL
        AND dividend_yield >= 0.1
        AND dividend_yield <= 15
      ORDER BY dividend_yield DESC
      LIMIT 10
    `;
    
    // 4. HIGHEST VOLUME (filtro: deve ser positivo)
    console.log('📊 Calculando highest volume...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'highest_volume' as category,
        ROW_NUMBER() OVER (ORDER BY el.avgvolume DESC) as rank_position,
        el.symbol,
        el.avgvolume as value,
        NULL as percentage_value
      FROM etf_list el
      WHERE el.avgvolume IS NOT NULL 
        AND el.avgvolume > 0
        AND el.avgvolume < 1000000000
      ORDER BY el.avgvolume DESC
      LIMIT 10
    `;
    
    // 5. LOWEST MAX DRAWDOWN (filtros: entre -100% e 0%, ordenar por ASC para pegar os menores)
    console.log('🛡️ Calculando lowest max drawdown...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'lowest_max_drawdown' as category,
        ROW_NUMBER() OVER (ORDER BY cm.max_drawdown ASC) as rank_position,
        cm.symbol,
        cm.max_drawdown as value,
        cm.max_drawdown * 100 as percentage_value
      FROM calculated_metrics_teste cm
      WHERE cm.max_drawdown IS NOT NULL 
        AND cm.max_drawdown >= -1.0
        AND cm.max_drawdown < 0
        AND cm.max_drawdown != 0
      ORDER BY cm.max_drawdown ASC
      LIMIT 10
    `;
    
    // 6. LOWEST VOLATILITY 12M (filtros: entre 0.1% e 200%, não pode ser zero)
    console.log('📉 Calculando lowest volatility 12m...');
    await prisma.$executeRaw`
      INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
      SELECT 
        'lowest_volatility_12m' as category,
        ROW_NUMBER() OVER (ORDER BY cm.volatility_12m ASC) as rank_position,
        cm.symbol,
        cm.volatility_12m as value,
        cm.volatility_12m * 100 as percentage_value
      FROM calculated_metrics_teste cm
      WHERE cm.volatility_12m IS NOT NULL 
        AND cm.volatility_12m >= 0.001
        AND cm.volatility_12m <= 2.0
      ORDER BY cm.volatility_12m ASC
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
    
    console.log('✅ Rankings populados com sucesso usando filtros aprimorados!');
    console.log('📊 Estatísticas por categoria:');
    totalRankings.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} ETFs`);
    });
    
    console.log('\n🔍 Verificação de qualidade dos dados:');
    suspiciousData.forEach(check => {
      console.log(`   ${check.category}:`);
      console.log(`     - Valores extremos (>1000%): ${check.extreme_percentages}`);
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