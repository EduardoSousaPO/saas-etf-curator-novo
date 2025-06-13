import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterOutliers, calculateSafeStats } from '@/lib/data-filters';

export async function GET() {
  try {
    console.log('🔍 Carregando estatísticas da landing page...');

    // Buscar estatísticas gerais usando Prisma
    const [
      totalETFs,
      metricsData,
      companiesData,
      assetClassData
    ] = await Promise.all([
      // Total de ETFs
      prisma.etf_list.count(),
      
      // ETFs com métricas
      prisma.calculated_metrics.findMany({
        where: {
          returns_12m: { not: null },
          volatility_12m: { not: null }
        },
        select: { 
          symbol: true,
          returns_12m: true,
          volatility_12m: true
        }
      }),
      
      // Gestoras únicas
      prisma.etf_list.findMany({
        where: {
          etfcompany: { not: null }
        },
        select: { etfcompany: true }
      }),
      
      // Asset classes únicas
      prisma.etf_list.findMany({
        where: {
          assetclass: { not: null }
        },
        select: { assetclass: true }
      })
    ]);

    console.log(`📊 Dados brutos de métricas: ${metricsData.length}`);

    // Filtrar outliers extremos
    const filteredMetrics = filterOutliers(metricsData);
    console.log(`✅ Dados após filtro: ${filteredMetrics.length} (removidos: ${metricsData.length - filteredMetrics.length})`);

    // Calcular estatísticas
    const etfsWithMetrics = filteredMetrics.length;
    const metricsPercentage = totalETFs ? ((etfsWithMetrics / totalETFs) * 100) : 0;
    
    const uniqueCompanies = new Set(
      companiesData.map(item => item.etfcompany).filter(Boolean)
    ).size;
    
    const uniqueAssetClasses = new Set(
      assetClassData.map(item => item.assetclass).filter(Boolean)
    ).size;

    // Calcular performance média do mercado usando dados filtrados
    const returns = filteredMetrics.map(m => m.returns_12m).filter(r => r !== null);
    const volatilities = filteredMetrics.map(m => m.volatility_12m).filter(v => v !== null);

    const returnStats = calculateSafeStats(returns);
    const volatilityStats = calculateSafeStats(volatilities);

    const stats = {
      totalETFs,
      etfsWithMetrics,
      metricsPercentage: Math.round(metricsPercentage * 10) / 10,
      uniqueCompanies,
      uniqueAssetClasses,
      avgReturn: Math.round(returnStats.mean * 100 * 100) / 100, // Converter para percentual
      avgVolatility: Math.round(volatilityStats.mean * 100 * 100) / 100, // Converter para percentual
      outliersRemoved: metricsData.length - filteredMetrics.length,
      lastUpdated: new Date().toISOString(),
      dataQuality: {
        totalRawData: metricsData.length,
        validData: filteredMetrics.length,
        filterEfficiency: metricsData.length > 0 ? ((filteredMetrics.length / metricsData.length) * 100).toFixed(1) + '%' : '0%'
      }
    };

    console.log('✅ Estatísticas carregadas:', stats);
    console.log(`🔧 Outliers removidos: ${stats.outliersRemoved}, Eficiência: ${stats.dataQuality.filterEfficiency}`);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erro ao carregar estatísticas:', error);
    
    // Fallback com dados estáticos
    return NextResponse.json({
      success: false,
      data: {
        totalETFs: 4409,
        etfsWithMetrics: 4253,
        metricsPercentage: 96.5,
        uniqueCompanies: 135,
        uniqueAssetClasses: 172,
        avgReturn: 8.2,
        avgVolatility: 16.8,
        outliersRemoved: 0,
        lastUpdated: new Date().toISOString()
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 