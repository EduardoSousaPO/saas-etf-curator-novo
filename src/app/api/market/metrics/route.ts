import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterOutliers, calculateSafeStats } from '@/lib/data-filters';

export async function GET() {
  try {
    console.log('🔍 Calculando métricas de mercado em tempo real...');

    // Buscar estatísticas gerais
    const totalETFs = await prisma.etfs_ativos_reais.count();

    // Buscar métricas de performance
    const metricsData = await prisma.etfs_ativos_reais.findMany({
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

    // Converter Decimal para number e filtrar outliers
    const convertedData = metricsData.map(m => ({
      symbol: m.symbol,
      returns_12m: m.returns_12m ? Number(m.returns_12m) : null,
      volatility_12m: m.volatility_12m ? Number(m.volatility_12m) : null,
      sharpe_12m: m.sharpe_12m ? Number(m.sharpe_12m) : null
    }));

    const filteredData = filterOutliers(convertedData);
    
    // Garantir que os dados filtrados têm valores válidos
    const validData = filteredData.filter(item => 
      item.returns_12m !== null && 
      item.volatility_12m !== null && 
      item.sharpe_12m !== null
    );
    console.log(`✅ Dados após filtro de outliers: ${filteredData.length} (removidos: ${metricsData.length - filteredData.length})`);
    console.log(`✅ Dados válidos para cálculos: ${validData.length}`);

    // Calcular estatísticas seguras usando dados válidos
    const returns = validData.map(m => m.returns_12m as number);
    const volatilities = validData.map(m => m.volatility_12m as number);
    const sharpes = validData.map(m => m.sharpe_12m as number);

    const returnStats = calculateSafeStats(returns);
    const volatilityStats = calculateSafeStats(volatilities);
    const sharpeStats = calculateSafeStats(sharpes);

    // Encontrar top performer (dos dados válidos)
    const topPerformer = validData.length > 0
      ? validData.reduce((max, current) => 
          (current.returns_12m as number) > (max.returns_12m as number) ? current : max
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
    const assetClassData = await prisma.etfs_ativos_reais.findMany({
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

    // Buscar ETFs com melhor performance recente (dados válidos)
    const topETFs = validData
      .sort((a, b) => (b.returns_12m as number) - (a.returns_12m as number))
      .slice(0, 10);

    // Buscar ETFs com pior performance (para alertas, mas ainda dentro dos limites válidos)
    const worstETFs = validData
      .sort((a, b) => (a.returns_12m as number) - (b.returns_12m as number))
      .slice(0, 5);

    // Calcular volatilidade do mercado
    const highVolatilityCount = validData.filter(m => (m.volatility_12m as number) > 0.25).length; // 25%
    const volatilityPercentage = validData.length > 0 
      ? (highVolatilityCount / validData.length) * 100 
      : 0;

    const response = {
      // Estatísticas básicas
      totalETFs,
      etfsWithMetrics: validData.length,
      dataCompleteness: totalETFs ? (validData.length / totalETFs) * 100 : 0,
      outliersRemoved: metricsData.length - validData.length,

      // Métricas de performance (dados já estão em formato decimal no banco)
      avgReturn: Number(returnStats.mean.toFixed(4)),
      avgVolatility: Number(volatilityStats.mean.toFixed(4)),
      avgSharpe: Number(sharpeStats.mean.toFixed(2)),

      // Tendência do mercado
      marketTrend,
      topPerformer: topPerformer?.symbol || 'N/A',
      topPerformerReturn: topPerformer ? Number((topPerformer.returns_12m as number).toFixed(4)) : 0,

      // Distribuição
      assetClassDistribution,
      highVolatilityPercentage: Number(volatilityPercentage.toFixed(1)),

      // Top performers (dados já em formato decimal)
      topPerformers: topETFs.slice(0, 5).map(etf => ({
        symbol: etf.symbol,
        return: Number((etf.returns_12m as number).toFixed(4)),
        sharpe: Number((etf.sharpe_12m as number).toFixed(2)),
        volatility: Number((etf.volatility_12m as number).toFixed(4))
      })),

      // Alertas (ETFs com performance ruim, mas ainda válida)
      alerts: worstETFs.map(etf => ({
        symbol: etf.symbol,
        return: Number((etf.returns_12m as number).toFixed(4)),
        volatility: Number((etf.volatility_12m as number).toFixed(4)),
        type: (etf.returns_12m as number) < -0.20 ? 'severe_loss' : 'underperforming'
      })),

      // Metadados
      lastUpdated: new Date().toISOString(),
      dataSource: 'prisma_filtered_data',
      calculationTime: new Date().toISOString(),
      dataQuality: {
        totalRawData: metricsData.length,
        validData: validData.length,
        filterEfficiency: metricsData.length > 0 ? ((validData.length / metricsData.length) * 100).toFixed(1) + '%' : '0%'
      }
    };

    console.log(`✅ Métricas de mercado calculadas: ${response.totalETFs} ETFs, ${response.etfsWithMetrics} com dados válidos`);
    console.log(`🔧 Outliers removidos: ${response.outliersRemoved}, Eficiência do filtro: ${response.dataQuality.filterEfficiency}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao calcular métricas de mercado:', error);
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