const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRankings() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 [CRON] Iniciando atualização semanal dos rankings...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    
    // Verificar última atualização
    const lastUpdate = await prisma.$queryRaw`
      SELECT MAX(updated_at) as last_updated 
      FROM etf_rankings 
      LIMIT 1
    `;
    
    if (lastUpdate[0]?.last_updated) {
      const timeSinceUpdate = Date.now() - new Date(lastUpdate[0].last_updated).getTime();
      const daysSinceUpdate = timeSinceUpdate / (1000 * 60 * 60 * 24);
      
      console.log(`⏰ Última atualização: ${daysSinceUpdate.toFixed(1)} dias atrás`);
      
      // Só atualizar se passou mais de 7 dias (1 semana)
      if (daysSinceUpdate < 7) {
        console.log('✅ Rankings ainda atualizados. Próxima atualização em breve.');
        return;
      }
    }
    
    // Limpar dados antigos
    await prisma.$executeRaw`DELETE FROM etf_rankings`;
    console.log('🧹 Dados antigos removidos');
    
    // Executar todas as queries de ranking em paralelo com filtros mais flexíveis
    const rankingQueries = [
      // 1. TOP RETURNS 12M - Filtros mais flexíveis
      prisma.$executeRaw`
        INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
        SELECT 
          'top_returns_12m' as category,
          ROW_NUMBER() OVER (ORDER BY cm.returns_12m DESC) as rank_position,
          cm.symbol,
          cm.returns_12m as value,
          CASE 
            WHEN cm.returns_12m BETWEEN -1 AND 1 THEN cm.returns_12m * 100
            ELSE cm.returns_12m
          END as percentage_value
        FROM calculated_metrics_teste cm
        WHERE cm.returns_12m IS NOT NULL 
          AND cm.returns_12m >= -0.98 
          AND cm.returns_12m <= 50.0
        ORDER BY cm.returns_12m DESC
        LIMIT 10
      `,
      
      // 2. TOP SHARPE 12M - Permite valores mais extremos
      prisma.$executeRaw`
        INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
        SELECT 
          'top_sharpe_12m' as category,
          ROW_NUMBER() OVER (ORDER BY cm.sharpe_12m DESC) as rank_position,
          cm.symbol,
          cm.sharpe_12m as value,
          NULL as percentage_value
        FROM calculated_metrics_teste cm
        WHERE cm.sharpe_12m IS NOT NULL 
          AND cm.sharpe_12m >= -15.0 
          AND cm.sharpe_12m <= 15.0
        ORDER BY cm.sharpe_12m DESC
        LIMIT 10
      `,
      
      // 3. TOP DIVIDEND YIELD - Permite yields mais altos (REITs)
      prisma.$executeRaw`
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
            AND cm.dividends_12m <= 500
            AND el.nav IS NOT NULL 
            AND el.nav > 0
        ) ranked_dividends
        WHERE dividend_yield IS NOT NULL
          AND dividend_yield >= 0.05
          AND dividend_yield <= 25.0
        ORDER BY dividend_yield DESC
        LIMIT 10
      `,
      
      // 4. HIGHEST VOLUME - Sem limite superior rígido
      prisma.$executeRaw`
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
        ORDER BY el.avgvolume DESC
        LIMIT 10
      `,
      
      // 5. LOWEST MAX DRAWDOWN - Permite perdas mais extremas
      prisma.$executeRaw`
        INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
        SELECT 
          'lowest_max_drawdown' as category,
          ROW_NUMBER() OVER (ORDER BY cm.max_drawdown ASC) as rank_position,
          cm.symbol,
          cm.max_drawdown as value,
          CASE 
            WHEN cm.max_drawdown BETWEEN -1 AND 1 THEN cm.max_drawdown * 100
            ELSE cm.max_drawdown
          END as percentage_value
        FROM calculated_metrics_teste cm
        WHERE cm.max_drawdown IS NOT NULL 
          AND cm.max_drawdown >= -0.99
          AND cm.max_drawdown <= 0
        ORDER BY cm.max_drawdown ASC
        LIMIT 10
      `,
      
      // 6. LOWEST VOLATILITY 12M - Permite volatilidades extremas
      prisma.$executeRaw`
        INSERT INTO etf_rankings (category, rank_position, symbol, value, percentage_value)
        SELECT 
          'lowest_volatility_12m' as category,
          ROW_NUMBER() OVER (ORDER BY cm.volatility_12m ASC) as rank_position,
          cm.symbol,
          cm.volatility_12m as value,
          CASE 
            WHEN cm.volatility_12m BETWEEN 0 AND 1 THEN cm.volatility_12m * 100
            ELSE cm.volatility_12m
          END as percentage_value
        FROM calculated_metrics_teste cm
        WHERE cm.volatility_12m IS NOT NULL 
          AND cm.volatility_12m >= 0.01 
          AND cm.volatility_12m <= 3.0
        ORDER BY cm.volatility_12m ASC
        LIMIT 10
      `
    ];
    
    // Executar todas as queries em paralelo
    console.log('📊 Executando cálculos de ranking com filtros flexíveis...');
    await Promise.all(rankingQueries);
    
    // Verificar resultados
    const stats = await prisma.$queryRaw`
      SELECT category, COUNT(*) as count 
      FROM etf_rankings 
      GROUP BY category 
      ORDER BY category
    `;
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('✅ Rankings atualizados com sucesso!');
    console.log(`⚡ Tempo de execução: ${duration.toFixed(2)}s`);
    console.log('📊 Estatísticas:');
    stats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} ETFs`);
    });
    
    // Log para monitoramento
    console.log(`🎯 [CRON] Atualização semanal concluída em ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ [CRON] Erro na atualização semanal:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateRankings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = updateRankings; 