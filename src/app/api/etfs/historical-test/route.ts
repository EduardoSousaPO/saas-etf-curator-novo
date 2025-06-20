import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];
    const period = searchParams.get('period') || '1y';

    console.log(`🔍 Teste da API histórica para ${symbols.length} símbolos`);

    // Resposta simplificada para teste
    const testData = {
      success: true,
      message: 'API histórica funcionando!',
      data: {
        symbols,
        period,
        timestamp: new Date().toISOString(),
        status: 'API_WORKING'
      }
    };

    return NextResponse.json(testData);

  } catch (error) {
    console.error('❌ Erro na API de teste:', error);
    return NextResponse.json(
      { error: 'Test API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 