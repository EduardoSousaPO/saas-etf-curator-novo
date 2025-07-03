import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando acesso aos dados SPY e BND...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar dados dos benchmarks SPY e BND
    const { data: benchmarkData, error: benchmarkError } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, returns_12m, volatility, assets_under_management, dividend_yield, expense_ratio')
      .in('symbol', ['SPY', 'BND'])
      .order('symbol');

    if (benchmarkError) {
      console.error('❌ Erro ao buscar benchmarks:', benchmarkError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar dados dos benchmarks',
        details: benchmarkError.message
      }, { status: 500 });
    }

    if (!benchmarkData || benchmarkData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum benchmark encontrado',
        message: 'SPY e BND não foram encontrados na base de dados'
      }, { status: 404 });
    }

    const spy = benchmarkData.find(etf => etf.symbol === 'SPY');
    const bnd = benchmarkData.find(etf => etf.symbol === 'BND');

    // Calcular carteira 60/40 clássica
    let classic6040: any = null;
    if (spy && bnd) {
      classic6040 = {
        return: 0.6 * (spy.returns_12m / 100) + 0.4 * (bnd.returns_12m / 100),
        volatility: Math.sqrt(
          Math.pow(0.6 * spy.volatility / 100, 2) + 
          Math.pow(0.4 * bnd.volatility / 100, 2) + 
          2 * 0.6 * 0.4 * 0.3 * (spy.volatility / 100) * (bnd.volatility / 100) // Assumindo correlação 0.3
        ),
        description: "60% SPY + 40% BND (Carteira Clássica)"
      };
    }

    console.log('✅ Dados encontrados:', { 
      total: benchmarkData.length,
      spy: spy ? 'encontrado' : 'não encontrado',
      bnd: bnd ? 'encontrado' : 'não encontrado'
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      benchmarks_found: benchmarkData.length,
      data: {
        spy: spy ? {
          symbol: spy.symbol,
          name: spy.name,
          return_12m: spy.returns_12m,
          volatility: spy.volatility,
          aum: spy.assets_under_management,
          dividend_yield: spy.dividend_yield,
          expense_ratio: spy.expense_ratio
        } : null,
        bnd: bnd ? {
          symbol: bnd.symbol,
          name: bnd.name,
          return_12m: bnd.returns_12m,
          volatility: bnd.volatility,
          aum: bnd.assets_under_management,
          dividend_yield: bnd.dividend_yield,
          expense_ratio: bnd.expense_ratio
        } : null,
        classic_60_40: classic6040 ? {
          expected_return: (classic6040.return * 100).toFixed(2) + '%',
          expected_volatility: (classic6040.volatility * 100).toFixed(2) + '%',
          sharpe_ratio: (classic6040.return / classic6040.volatility).toFixed(2),
          description: classic6040.description
        } : null
      },
      insights: [
        "✅ Conexão com Supabase estabelecida",
        "✅ Acesso à tabela etfs_ativos_reais funcionando",
        spy ? "✅ SPY encontrado com dados completos" : "❌ SPY não encontrado",
        bnd ? "✅ BND encontrado com dados completos" : "❌ BND não encontrado",
        classic6040 ? "✅ Carteira 60/40 calculada com sucesso" : "❌ Não foi possível calcular carteira 60/40"
      ]
    });

  } catch (error: any) {
    console.error('❌ Erro no teste de benchmark:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 