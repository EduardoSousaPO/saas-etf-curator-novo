import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Carregando estatísticas da landing page...');

    // Executar consultas em paralelo usando a view active_etfs
    const [
      totalETFsResult,
      metricsData,
      assetClassStats,
      companyStats
    ] = await Promise.all([
      // Total de ETFs ativos
      prisma.$queryRaw<[{count: string}]>`SELECT COUNT(*) as count FROM active_etfs`,
      
      // Métricas de performance
      prisma.$queryRaw<any[]>`
        SELECT 
          returns_12m,
          volatility_12m,
          sharpe_12m,
          totalasset
        FROM active_etfs
        WHERE returns_12m IS NOT NULL 
          AND volatility_12m IS NOT NULL
          AND sharpe_12m IS NOT NULL
          AND totalasset IS NOT NULL
      `,
      
      // Estatísticas por classe de ativo
      prisma.$queryRaw<any[]>`
        SELECT 
          assetclass,
          COUNT(*) as count,
          AVG(totalasset) as avg_assets,
          SUM(totalasset) as total_assets
        FROM active_etfs
        WHERE assetclass IS NOT NULL
        GROUP BY assetclass
        ORDER BY count DESC
        LIMIT 10
      `,
      
      // Estatísticas por gestora
      prisma.$queryRaw<any[]>`
        SELECT 
          etfcompany,
          COUNT(*) as count,
          AVG(totalasset) as avg_assets,
          SUM(totalasset) as total_assets
        FROM active_etfs
        WHERE etfcompany IS NOT NULL
        GROUP BY etfcompany
        ORDER BY count DESC
        LIMIT 10
      `
    ]);

    const totalETFs = parseInt(totalETFsResult[0].count);

    // Calcular métricas agregadas
    const avgReturn = metricsData.reduce((sum, etf) => sum + Number(etf.returns_12m), 0) / metricsData.length;
    const avgVolatility = metricsData.reduce((sum, etf) => sum + Number(etf.volatility_12m), 0) / metricsData.length;
    const avgSharpe = metricsData.reduce((sum, etf) => sum + Number(etf.sharpe_12m), 0) / metricsData.length;
    const totalAUM = metricsData.reduce((sum, etf) => sum + Number(etf.totalasset), 0);

    // Encontrar o melhor ETF por Sharpe ratio
    const bestETF = metricsData.reduce((best, current) => 
      Number(current.sharpe_12m) > Number(best.sharpe_12m) ? current : best
    );

    console.log(`📊 Estatísticas calculadas: ${totalETFs} ETFs, ${metricsData.length} com métricas`);

    const stats = {
      totalETFs,
      etfsWithMetrics: metricsData.length,
      coverage: ((metricsData.length / totalETFs) * 100).toFixed(1),
      
      performance: {
        avgReturn: (avgReturn * 100).toFixed(2),
        avgVolatility: (avgVolatility * 100).toFixed(2),
        avgSharpe: avgSharpe.toFixed(2),
        totalAUM: (totalAUM / 1e12).toFixed(2) // Trilhões
      },
      
      bestPerformer: {
        symbol: bestETF.symbol || 'N/A',
        sharpe: Number(bestETF.sharpe_12m).toFixed(2),
        returns: (Number(bestETF.returns_12m) * 100).toFixed(2)
      },
      
      assetClasses: assetClassStats.map(ac => ({
        name: ac.assetclass,
        count: Number(ac.count),
        avgAssets: (Number(ac.avg_assets) / 1e9).toFixed(1), // Bilhões
        totalAssets: (Number(ac.total_assets) / 1e9).toFixed(1)
      })),
      
      topCompanies: companyStats.map(company => ({
        name: company.etfcompany,
        count: Number(company.count),
        avgAssets: (Number(company.avg_assets) / 1e9).toFixed(1),
        totalAssets: (Number(company.total_assets) / 1e9).toFixed(1)
      }))
    };

    console.log('✅ Estatísticas carregadas com sucesso');

    return NextResponse.json({
      success: true,
      stats,
      source: 'active_etfs_view',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao carregar estatísticas:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Falha ao carregar estatísticas da landing page',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 