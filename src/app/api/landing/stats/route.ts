import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache em memória simples
let statsCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function GET() {
  try {
    console.log('🔍 Carregando estatísticas da landing page...');

    // Verificar cache
    const now = Date.now();
    if (statsCache && (now - statsCache.timestamp) < CACHE_DURATION) {
      console.log('⚡ Usando estatísticas do cache (5min TTL)');
      return NextResponse.json({
        success: true,
        stats: {
          ...statsCache.data,
          cached: true,
          cacheAge: Math.floor((now - statsCache.timestamp) / 1000)
        },
        source: 'cache',
        timestamp: new Date().toISOString()
      });
    }

    // Executar consultas usando Supabase
    const [
      totalETFsResult,
      metricsData,
      assetClassStats,
      companyStats
    ] = await Promise.all([
      // Total de ETFs ativos
      supabase.from('etfs_ativos_reais').select('*', { count: 'exact', head: true }),
      
      // Métricas de performance
      supabase
        .from('etfs_ativos_reais')
        .select('returns_12m, volatility_12m, sharpe_12m, totalasset')
        .not('returns_12m', 'is', null)
        .not('volatility_12m', 'is', null)
        .not('sharpe_12m', 'is', null)
        .not('totalasset', 'is', null),
      
      // Estatísticas por classe de ativo
      supabase.rpc('get_asset_class_stats'),
      
      // Estatísticas por gestora
      supabase.rpc('get_company_stats')
    ]);

    const totalETFs = totalETFsResult.count || 0;
    const metrics = metricsData.data || [];
    
    if (totalETFsResult.error) {
      throw new Error(`Erro ao contar ETFs: ${totalETFsResult.error.message}`);
    }
    
    if (metricsData.error) {
      throw new Error(`Erro ao buscar métricas: ${metricsData.error.message}`);
    }

    // Calcular métricas agregadas
    const avgReturn = metrics.length > 0 ? metrics.reduce((sum, etf) => sum + Number(etf.returns_12m || 0), 0) / metrics.length : 0;
    const avgVolatility = metrics.length > 0 ? metrics.reduce((sum, etf) => sum + Number(etf.volatility_12m || 0), 0) / metrics.length : 0;
    const avgSharpe = metrics.length > 0 ? metrics.reduce((sum, etf) => sum + Number(etf.sharpe_12m || 0), 0) / metrics.length : 0;
    const totalAUM = metrics.length > 0 ? metrics.reduce((sum, etf) => sum + Number(etf.totalasset || 0), 0) : 0;

    // Encontrar o melhor ETF por Sharpe ratio
    const bestETF = metrics.length > 0 ? metrics.reduce((best, current) => 
      Number(current.sharpe_12m || 0) > Number(best.sharpe_12m || 0) ? current : best
    ) : { sharpe_12m: 0, returns_12m: 0 };

    console.log(`📊 Estatísticas calculadas: ${totalETFs} ETFs, ${metrics.length} com métricas`);

    const stats = {
      totalETFs,
      etfsWithMetrics: metrics.length,
      metricsPercentage: totalETFs > 0 ? ((metrics.length / totalETFs) * 100) : 0,
      uniqueCompanies: companyStats.data?.length || 0,
      uniqueAssetClasses: assetClassStats.data?.length || 0,
      avgReturn: (avgReturn * 100), // Já em percentual
      avgVolatility: (avgVolatility * 100), // Já em percentual
      lastUpdated: new Date().toISOString()
    };

    // Salvar no cache
    statsCache = {
      data: stats,
      timestamp: now
    };

    console.log('✅ Estatísticas carregadas com sucesso');

    return NextResponse.json({
      success: true,
      data: stats,
      source: 'supabase_direct',
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