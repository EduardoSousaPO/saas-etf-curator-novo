// src/app/api/cache/invalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern, key, params } = body;
    
    console.log('🧹 Cache Invalidate API chamada:', { pattern, key, params });
    
    let invalidatedCount = 0;
    
    if (pattern) {
      // Invalidar por padrão (ex: "stocks:*", "etfs:*")
      invalidatedCount = await cacheManager.invalidatePattern(pattern);
    } else if (key) {
      // Invalidar chave específica
      const success = await cacheManager.delete(key, params || {});
      invalidatedCount = success ? 1 : 0;
    } else {
      return NextResponse.json(
        { error: 'Parâmetro pattern ou key é obrigatório' },
        { status: 400 }
      );
    }
    
    const response = {
      success: true,
      invalidated_keys: invalidatedCount,
      pattern: pattern || 'specific_key',
      timestamp: new Date().toISOString()
    };

    console.log('✅ Cache invalidado:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro ao invalidar cache:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para invalidações pré-definidas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    let invalidatedCount = 0;
    let message = '';
    
    switch (action) {
      case 'stocks':
        invalidatedCount = await cacheManager.invalidatePattern('stocks:*');
        message = 'Cache de ações invalidado';
        break;
      case 'etfs':
        invalidatedCount = await cacheManager.invalidatePattern('etfs:*');
        message = 'Cache de ETFs invalidado';
        break;
      case 'portfolio':
        invalidatedCount = await cacheManager.invalidatePattern('portfolio:*');
        message = 'Cache de portfolios invalidado';
        break;
      case 'all':
        const stocksCount = await cacheManager.invalidatePattern('stocks:*');
        const etfsCount = await cacheManager.invalidatePattern('etfs:*');
        const portfolioCount = await cacheManager.invalidatePattern('portfolio:*');
        invalidatedCount = stocksCount + etfsCount + portfolioCount;
        message = 'Todo o cache invalidado';
        break;
      default:
        return NextResponse.json(
          { error: 'Ação inválida. Use: stocks, etfs, portfolio, all' },
          { status: 400 }
        );
    }
    
    const response = {
      success: true,
      action,
      message,
      invalidated_keys: invalidatedCount,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Cache invalidado via GET:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro ao invalidar cache via GET:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
