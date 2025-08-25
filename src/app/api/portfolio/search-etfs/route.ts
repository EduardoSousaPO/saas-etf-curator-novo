import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Query deve ter pelo menos 2 caracteres' 
      });
    }

    console.log(`🔍 Buscando ETFs com query: "${query}"`);

    // Buscar ETFs na base real com filtros de qualidade
    const { data: etfs, error } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, expenseratio, totalasset, returns_12m, volatility_12m, sharpe_12m, dividends_12m, assetclass')
      .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
      .not('expenseratio', 'is', null)
      .not('totalasset', 'is', null)
      .gte('totalasset', 10000000) // Mínimo $10M AUM
      .lte('expenseratio', 2.0) // Máximo 2% expense ratio
      .order('totalasset', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro na busca de ETFs:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro interno na busca' 
      }, { status: 500 });
    }

    // Formatar dados para o frontend
    const formattedETFs = etfs?.map(etf => ({
      symbol: etf.symbol,
      name: etf.name,
      expense_ratio: etf.expenseratio,
      total_assets: etf.totalasset,
      returns_12m: etf.returns_12m,
      volatility_12m: etf.volatility_12m,
      sharpe_ratio_12m: etf.sharpe_12m,
      dividend_yield: etf.dividends_12m,
      category: etf.assetclass,
      subcategory: etf.assetclass,
      // Campos calculados para compatibilidade
      allocation_percent: 0,
      risk_score: Math.min(100, Math.max(0, (etf.volatility_12m || 15) * 5)),
      quality_score: calculateQualityScore(etf)
    })) || [];

    console.log(`✅ Encontrados ${formattedETFs.length} ETFs para "${query}"`);

    return NextResponse.json({
      success: true,
      etfs: formattedETFs,
      total: formattedETFs.length,
      query: query
    });

  } catch (error) {
    console.error('❌ Erro na API de busca de ETFs:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Função para calcular score de qualidade
function calculateQualityScore(etf: any): number {
  let score = 50; // Base score

  // Bônus por baixo expense ratio
  if (etf.expenseratio <= 0.1) score += 20;
  else if (etf.expenseratio <= 0.3) score += 15;
  else if (etf.expenseratio <= 0.5) score += 10;
  else if (etf.expenseratio <= 0.75) score += 5;

  // Bônus por alto patrimônio (liquidez)
  if (etf.totalasset >= 1000000000) score += 15; // $1B+
  else if (etf.totalasset >= 500000000) score += 10; // $500M+
  else if (etf.totalasset >= 100000000) score += 5; // $100M+

  // Bônus por Sharpe ratio positivo
  if (etf.sharpe_12m > 1.0) score += 10;
  else if (etf.sharpe_12m > 0.5) score += 5;

  // Penalização por alta volatilidade
  if (etf.volatility_12m > 25) score -= 10;
  else if (etf.volatility_12m > 20) score -= 5;

  return Math.min(100, Math.max(0, score));
}
