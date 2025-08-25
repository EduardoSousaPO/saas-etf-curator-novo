// src/app/api/portfolio/test-unified-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Teste da busca unificada iniciado');
    
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    
    console.log('🔍 Termo de busca:', searchTerm);

    // Teste simples: buscar stocks que contenham o termo
    const { data: stocks, error: stockError } = await supabase
      .from('stocks_unified')
      .select('ticker, name, market_cap')
      .or(`ticker.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(5);

    console.log('📊 Resultado da busca:', {
      error: stockError,
      found: stocks?.length || 0,
      stocks: stocks?.map(s => ({ ticker: s.ticker, name: s.name }))
    });

    if (stockError) {
      throw stockError;
    }

    return NextResponse.json({
      success: true,
      searchTerm,
      found: stocks?.length || 0,
      data: stocks || []
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}




