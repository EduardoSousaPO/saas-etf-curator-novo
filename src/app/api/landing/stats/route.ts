import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterOutliers, calculateSafeStats } from '@/lib/data-filters';

export async function GET() {
  try {
    console.log('🔍 Carregando estatísticas da landing page...');

    // Usar queries mais eficientes com timeout
    const timeoutMs = 30000; // 30 segundos
    
    const statsPromise = Promise.race([
      Promise.all([
        // Total de ETFs - query mais rápida
        prisma.etf_list.count(),
        
        // ETFs com métricas - limitado para performance
        prisma.calculated_metrics_teste.findMany({
          where: {
            returns_12m: { not: null },
            volatility_12m: { not: null }
          },
          select: { 
            symbol: true,
            returns_12m: true,
            volatility_12m: true
          },
          take: 1000 // Limitar para evitar timeout
        }),
        
        // Gestoras únicas - usando query agregada
        prisma.etf_list.groupBy({
          by: ['etfcompany'],
          where: {
            etfcompany: { not: null }
          },
          _count: { etfcompany: true }
        }),
        
        // Asset classes únicas - usando query agregada
        prisma.etf_list.groupBy({
          by: ['assetclass'],
          where: {
            assetclass: { not: null }
          },
          _count: { assetclass: true }
        })
      ]),
      // Timeout para evitar travamento
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
      )
    ]);

    const [
      totalETFs,
      metricsData,
      companiesData,
      assetClassData
    ] = await statsPromise as [number, any[], any[], any[]];

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
    
    // Usar dados agregados para contar únicos
    const uniqueCompanies = companiesData.length;
    const uniqueAssetClasses = assetClassData.length;

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
    console.error('❌ ERRO ao carregar estatísticas:', error);
    
    // Se for timeout ou erro de conexão, usar dados em cache
    if (error instanceof Error && 
        (error.message.includes('timeout') || 
         error.message.includes('connection') ||
         error.message.includes('ECONNRESET'))) {
      
      console.log('⚠️ Usando dados em cache devido a timeout de conexão');
      
      return NextResponse.json({
        success: true,
        data: {
          totalETFs: 4409,
          etfsWithMetrics: 3435,
          metricsPercentage: 77.9,
          uniqueCompanies: 135,
          uniqueAssetClasses: 172,
          avgReturn: 0.067, // 6.7%
          avgVolatility: 0.168, // 16.8%
          outliersRemoved: 0,
          lastUpdated: new Date().toISOString(),
          dataQuality: {
            totalRawData: 3435,
            validData: 3435,
            filterEfficiency: '100%'
          },
          cached: true,
          cacheReason: 'Database timeout - using static data'
        }
      });
    }
    
    // Para outros erros, retornar erro
    return NextResponse.json({
      success: false,
      error: `Falha ao conectar com banco de dados: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: 'Erro de conexão com banco de dados',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 