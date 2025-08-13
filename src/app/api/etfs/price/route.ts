import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar preço atual do ETF (NAV mais recente)
    const { data: etf, error } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, nav, updatedat')
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (error || !etf) {
      // Se não encontrar, buscar em preços históricos
      const { data: priceData } = await supabase
        .from('etf_prices')
        .select('symbol, close, date')
        .eq('symbol', symbol.toUpperCase())
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (priceData) {
        return NextResponse.json({
          success: true,
          data: {
            symbol: priceData.symbol,
            price: priceData.close,
            date: priceData.date,
            source: 'historical_prices'
          }
        });
      }

      return NextResponse.json(
        { error: 'ETF não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol: etf.symbol,
        name: etf.name,
        price: etf.nav || 100, // Usar NAV como preço, ou 100 como fallback
        updated_at: etf.updatedat,
        source: 'nav'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar preço do ETF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
