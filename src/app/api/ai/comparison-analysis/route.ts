import { NextRequest, NextResponse } from 'next/server';
import { analyzeETFComparison } from '@/lib/ai/text-analysis';

export async function POST(request: NextRequest) {
  try {
    const { etfs } = await request.json();
    
    if (!etfs || !Array.isArray(etfs) || etfs.length < 2) {
      return NextResponse.json(
        { error: 'Pelo menos 2 ETFs são necessários para comparação' },
        { status: 400 }
      );
    }

    const analysis = await analyzeETFComparison(etfs);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro na análise de comparação:', error);
    return NextResponse.json(
      { error: 'Falha ao processar análise de comparação' },
      { status: 500 }
    );
  }
} 