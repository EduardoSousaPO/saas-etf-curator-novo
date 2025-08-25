// src/app/api/cache/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Cache Stats API chamada');
    
    const stats = await cacheManager.getStats();
    
    const response = {
      redis: stats,
      cache_info: {
        default_ttl: '300 seconds (5 minutes)',
        prefixes: ['stocks', 'etfs', 'portfolio'],
        auto_invalidation: 'Daily at 6 AM UTC'
      },
      performance: {
        hit_rate: stats.hits + stats.misses > 0 
          ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100) 
          : 0,
        total_requests: stats.hits + stats.misses
      },
      metadata: {
        generated_at: new Date().toISOString(),
        version: '1.0'
      }
    };

    console.log('✅ Cache stats geradas:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro ao buscar stats do cache:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        redis_connected: false
      },
      { status: 500 }
    );
  }
}
