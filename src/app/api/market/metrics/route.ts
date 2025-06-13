import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterOutliers, calculateSafeStats, safeNumber } from '@/lib/data-filters';

export async function GET() {
  try {
    console.log('🔍 Calculando métricas de mercado em tempo real...');

    // Buscar estatísticas gerais
    const totalETFs = await prisma.etf_list.count();

    // Buscar métricas de performance
    const metricsData = await prisma.calculated_metrics.findMany({
      where: {
        returns_12m: { not: null },
        volatility_12m: { not: null }
      },
      select: {
        returns_12m: true,
        volatility_12m: true,
        sharpe_12m: true,
        symbol: true
      }
    });

    console.log(`📊 Dados brutos encontrados: ${metricsData.length}`);

    // Filtrar outliers extremos
    const filteredData = filterOutliers(metricsData);
    console.log(`✅ Dados após filtro de outliers: ${filteredData.length} (removidos: ${metricsData.length - filteredData.length})`);

    // Calcular estatísticas seguras usando dados filtrados
    const returns = filteredData.map(m => m.returns_12m).filter(r => r !== null);
    const volatilities = filteredData.map(m => m.volatility_12m).filter(v => v !== null);
    const sharpes = filteredData.map(m => m.sharpe_12m).filter(s => s !== null);

    const returnStats = calculateSafeStats(returns);
    const volatilityStats = calculateSafeStats(volatilities);
    const sharpeStats = calculateSafeStats(sharpes);

    // Encontrar top performer (dos dados filtrados)
    const topPerformer = filteredData.length > 0
      ? filteredData.reduce((max, current) => 
          safeNumber(current.returns_12m) > safeNumber(max.returns_12m) ? current : max
        )
      : null;

    // Determinar tendência do mercado baseada na média de retornos
    let marketTrend: 'up' | 'down' | 'stable' = 'stable';
    if (returnStats.mean > 0.05) { // 5%
      marketTrend = 'up';
    } else if (returnStats.mean < -0.02) { // -2%
      marketTrend = 'down';
    }

    // Buscar distribuição por asset class
    const assetClassData = await prisma.etf_list.findMany({
      where: {
        assetclass: { not: null }
      },
      select: {
        assetclass: true
      }
    });

    const assetClassDistribution = assetClassData.reduce((acc, etf) => {
      const assetClass = etf.assetclass || 'Other';
      acc[assetClass] = (acc[assetClass] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Buscar ETFs com melhor performance recente (filtrados)
    const topETFs = filteredData
      .sort((a, b) => safeNumber(b.returns_12m) - safeNumber(a.returns_12m))
      .slice(0, 10);

    // Buscar ETFs com pior performance (para alertas, mas ainda dentro dos limites válidos)
    const worstETFs = filteredData
      .sort((a, b) => safeNumber(a.returns_12m) - safeNumber(b.returns_12m))
      .slice(0, 5);

    // Calcular volatilidade do mercado
    const highVolatilityCount = filteredData.filter(m => safeNumber(m.volatility_12m) > 0.25).length; // 25%
    const volatilityPercentage = filteredData.length > 0 
      ? (highVolatilityCount / filteredData.length) * 100 
      : 0;

    const response = {
      // Estatísticas básicas
      totalETFs,
      etfsWithMetrics: filteredData.length,
      dataCompleteness: totalETFs ? (filteredData.length / totalETFs) * 100 : 0,
      outliersRemoved: metricsData.length - filteredData.length,

      // Métricas de performance (convertidas para percentual)
      avgReturn: Number((returnStats.mean * 100).toFixed(2)),
      avgVolatility: Number((volatilityStats.mean * 100).toFixed(2)),
      avgSharpe: Number(sharpeStats.mean.toFixed(2)),

      // Tendência do mercado
      marketTrend,
      topPerformer: topPerformer?.symbol || 'N/A',
      topPerformerReturn: topPerformer ? Number((safeNumber(topPerformer.returns_12m) * 100).toFixed(2)) : 0,

      // Distribuição
      assetClassDistribution,
      highVolatilityPercentage: Number(volatilityPercentage.toFixed(1)),

      // Top performers (convertidos para percentual)
      topPerformers: topETFs.slice(0, 5).map(etf => ({
        symbol: etf.symbol,
        return: Number((safeNumber(etf.returns_12m) * 100).toFixed(2)),
        sharpe: Number((safeNumber(etf.sharpe_12m) || 0).toFixed(2)),
        volatility: Number((safeNumber(etf.volatility_12m) * 100).toFixed(2))
      })),

      // Alertas (ETFs com performance ruim, mas ainda válida)
      alerts: worstETFs.map(etf => ({
        symbol: etf.symbol,
        return: Number((safeNumber(etf.returns_12m) * 100).toFixed(2)),
        volatility: Number((safeNumber(etf.volatility_12m) * 100).toFixed(2)),
        type: safeNumber(etf.returns_12m) < -0.20 ? 'severe_loss' : 'underperforming'
      })),

      // Metadados
      lastUpdated: new Date().toISOString(),
      dataSource: 'prisma_filtered_data',
      calculationTime: new Date().toISOString(),
      dataQuality: {
        totalRawData: metricsData.length,
        validData: filteredData.length,
        filterEfficiency: metricsData.length > 0 ? ((filteredData.length / metricsData.length) * 100).toFixed(1) + '%' : '0%'
      }
    };

    console.log(`✅ Métricas de mercado calculadas: ${response.totalETFs} ETFs, ${response.etfsWithMetrics} com dados válidos`);
    console.log(`🔧 Outliers removidos: ${response.outliersRemoved}, Eficiência do filtro: ${response.dataQuality.filterEfficiency}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro ao calcular métricas de mercado:', error);
    
    // Fallback com dados básicos
    return NextResponse.json({
      totalETFs: 4409,
      etfsWithMetrics: 4253,
      dataCompleteness: 96.5,
      outliersRemoved: 0,
      avgReturn: 8.2,
      avgVolatility: 16.8,
      avgSharpe: 0.65,
      marketTrend: 'stable' as const,
      topPerformer: 'SGOV',
      topPerformerReturn: 15.2,
      assetClassDistribution: {
        'Equity': 2500,
        'Fixed Income': 800,
        'International': 600,
        'Sector': 400,
        'Other': 109
      },
      highVolatilityPercentage: 25.3,
      topPerformers: [],
      alerts: [],
      lastUpdated: new Date().toISOString(),
      dataSource: 'fallback_data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
} 