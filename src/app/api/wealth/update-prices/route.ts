import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];
    
    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'Símbolos são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('Atualizando preços para:', symbols);

    // Buscar preços via yfinance usando Python script
    const updatedPrices: any[] = [];
    
    for (const symbol of symbols) {
      try {
        // Simular busca de preço real via yfinance
        // Em produção, isso seria uma chamada real para yfinance
        const mockPrice = await getMockRealTimePrice(symbol);
        
        // Atualizar no banco de dados
        const { data, error } = await supabase
          .from('etfs_ativos_reais')
          .update({ 
            nav: mockPrice,
            updatedat: new Date().toISOString()
          })
          .eq('symbol', symbol.toUpperCase())
          .select()
          .single();

        if (!error && data) {
          updatedPrices.push({
            symbol: symbol.toUpperCase(),
            price: mockPrice,
            updated_at: new Date().toISOString(),
            source: 'yfinance_simulation'
          });
        }
      } catch (error) {
        console.error(`Erro ao atualizar ${symbol}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        updated_count: updatedPrices.length,
        prices: updatedPrices
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar preços:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    
    if (!planId) {
      return NextResponse.json(
        { error: 'planId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar ETFs do plano
    const { data: planData } = await supabase
      .from('portfolio_plans')
      .select(`
        portfolio_plan_versions (
          portfolio_target_allocations (etf_symbol)
        )
      `)
      .eq('id', planId)
      .single();

    if (!planData) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    const latestVersion = planData.portfolio_plan_versions[0];
    const symbols = latestVersion.portfolio_target_allocations.map((a: any) => a.etf_symbol);

    // Buscar preços atuais
    const { data: prices } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, nav, updatedat')
      .in('symbol', symbols);

    const priceMap = new Map(prices?.map(p => [p.symbol, {
      price: p.nav,
      updated_at: p.updatedat
    }]) || []);

    return NextResponse.json({
      success: true,
      data: {
        prices: Object.fromEntries(priceMap),
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para simular preços em tempo real (substituir por yfinance real)
async function getMockRealTimePrice(symbol: string): Promise<number> {
  // Preços base simulados
  const basePrices: { [key: string]: number } = {
    'SPY': 500,
    'QQQ': 450,
    'VTI': 250,
    'BND': 80,
    'VXUS': 60,
    'IWM': 200,
    'VYM': 110,
    'GLD': 200,
    'SMH': 180,
    'ARKK': 45,
    'XLF': 35,
    'XLE': 90
  };

  const basePrice = basePrices[symbol.toUpperCase()] || 100;
  
  // Simular variação de preço (-2% a +2%)
  const variation = (Math.random() - 0.5) * 0.04; // -2% a +2%
  const currentPrice = basePrice * (1 + variation);
  
  return Math.round(currentPrice * 100) / 100; // 2 casas decimais
}
