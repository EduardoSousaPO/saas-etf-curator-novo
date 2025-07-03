import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Testando benchmarking SPY + BND...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar dados dos benchmarks SPY e BND
    const { data: benchmarks, error } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, returns_12m, volatility_12m, sharpe_12m, totalasset')
      .in('symbol', ['SPY', 'BND'])
      .order('symbol');

    if (error) {
      throw error;
    }

    const spy = benchmarks?.find(b => b.symbol === 'SPY');
    const bnd = benchmarks?.find(b => b.symbol === 'BND');

    if (!spy || !bnd) {
      return NextResponse.json({
        success: false,
        error: 'Benchmarks SPY ou BND não encontrados na base de dados'
      }, { status: 404 });
    }

    // Calcular carteira clássica 60/40
    const spyReturn = parseFloat(spy.returns_12m) / 100;
    const bndReturn = parseFloat(bnd.returns_12m) / 100;
    const spyVol = parseFloat(spy.volatility_12m) / 100;
    const bndVol = parseFloat(bnd.volatility_12m) / 100;

    // Carteira 60% SPY + 40% BND
    const classic6040Return = 0.6 * spyReturn + 0.4 * bndReturn;
    const classic6040Vol = Math.sqrt(
      Math.pow(0.6 * spyVol, 2) + 
      Math.pow(0.4 * bndVol, 2) + 
      2 * 0.6 * 0.4 * spyVol * bndVol * 0.3 // Assumindo correlação 0.3
    );
    const classic6040Sharpe = classic6040Return / classic6040Vol;

    // Simular uma carteira otimizada de exemplo
    const portfolioReturn = 0.11; // 11% exemplo
    const portfolioVol = 0.14; // 14% exemplo
    const portfolioSharpe = portfolioReturn / portfolioVol;

    // Calcular comparações
    const spyAlpha = portfolioReturn - spyReturn;
    const bndAlpha = portfolioReturn - bndReturn;
    const vs6040Outperformance = portfolioReturn - classic6040Return;
    const betaVsSpy = portfolioVol / spyVol;

    return NextResponse.json({
      success: true,
      message: 'Benchmarking SPY + BND funcionando corretamente',
      benchmarks: {
        spy: {
          symbol: 'SPY',
          name: spy.name,
          return_12m: `${(spyReturn * 100).toFixed(2)}%`,
          volatility_12m: `${(spyVol * 100).toFixed(2)}%`,
          sharpe_ratio: parseFloat(spy.sharpe_12m).toFixed(2),
          total_assets: `$${(parseFloat(spy.totalasset) / 1e9).toFixed(0)}B`
        },
        bnd: {
          symbol: 'BND',
          name: bnd.name,
          return_12m: `${(bndReturn * 100).toFixed(2)}%`,
          volatility_12m: `${(bndVol * 100).toFixed(2)}%`,
          sharpe_ratio: parseFloat(bnd.sharpe_12m).toFixed(2),
          total_assets: `$${(parseFloat(bnd.totalasset) / 1e9).toFixed(0)}B`
        }
      },
      classic_60_40_portfolio: {
        allocation: '60% SPY + 40% BND',
        expected_return: `${(classic6040Return * 100).toFixed(2)}%`,
        expected_volatility: `${(classic6040Vol * 100).toFixed(2)}%`,
        sharpe_ratio: classic6040Sharpe.toFixed(2)
      },
      example_optimized_portfolio: {
        expected_return: `${(portfolioReturn * 100).toFixed(2)}%`,
        expected_volatility: `${(portfolioVol * 100).toFixed(2)}%`,
        sharpe_ratio: portfolioSharpe.toFixed(2)
      },
      benchmark_comparison: {
        alpha_vs_spy: `${(spyAlpha * 100).toFixed(2)}%`,
        alpha_vs_bnd: `${(bndAlpha * 100).toFixed(2)}%`,
        outperformance_vs_60_40: `${(vs6040Outperformance * 100).toFixed(2)}%`,
        beta_vs_spy: betaVsSpy.toFixed(2)
      },
      strategy: {
        title: 'Benchmarking Simplificado',
        description: 'Usando apenas SPY (ações) e BND (bonds) como referências',
        advantages: [
          'Simplicidade: apenas 2 benchmarks universais',
          'Cobertura completa: ações (SPY) + bonds (BND)',
          'Referência clássica: carteira 60/40',
          'Dados sempre disponíveis na nossa base'
        ]
      }
    });

  } catch (error: any) {
    console.error('❌ Erro no teste de benchmarking:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro no teste de benchmarking',
      details: error.message
    }, { status: 500 });
  }
} 