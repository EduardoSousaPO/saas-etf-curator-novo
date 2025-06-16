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
      prisma.calculated_metrics_teste.findMany({
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

    // Converter Decimal para number e filtrar outliers
    const convertedMetrics = metricsData.map(m => ({
      symbol: m.symbol,
      returns_12m: m.returns_12m ? Number(m.returns_12m) : null,
      volatility_12m: m.volatility_12m ? Number(m.volatility_12m) : null
    }));

    const filteredMetrics = filterOutliers(convertedMetrics);
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
    const returns = filteredMetrics.map(m => m.returns_12m).filter(r => r !== null) as number[];
    const volatilities = filteredMetrics.map(m => m.volatility_12m).filter(v => v !== null) as number[];

    const returnStats = calculateSafeStats(returns);
    const volatilityStats = calculateSafeStats(volatilities);

    const stats = {
      totalETFs,
      etfsWithMetrics,
      metricsPercentage: Math.round(metricsPercentage * 10) / 10,
      uniqueCompanies,
      uniqueAssetClasses,
      avgReturn: Math.round(returnStats.mean * 10000) / 10000, // Dados já em formato decimal
      avgVolatility: Math.round(volatilityStats.mean * 10000) / 10000, // Dados já em formato decimal
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
    console.error('❌ ERRO CRÍTICO ao carregar estatísticas:', error);
    console.error('🚨 PRODUÇÃO DEVE SEMPRE USAR DADOS REAIS - Verificar conexão com Supabase');
    
    // NUNCA usar fallback - sempre retornar erro para forçar correção
    return NextResponse.json({
      success: false,
      error: `Falha ao conectar com banco de dados: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: 'Produção deve sempre usar dados reais do Supabase. Verificar variáveis de ambiente e conexão.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 