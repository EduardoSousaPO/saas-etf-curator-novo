import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'GLD';
    
    console.log('🔍 Verificando dados brutos para:', symbol);
    
    // Buscar dados brutos do ETF
    const { data: etfData, error } = await supabase
      .from('etfs_ativos_reais')
      .select(`
        symbol,
        name,
        totalasset,
        returns_12m,
        sharpe_12m,

        dividends_12m,
        expense_ratio,
        volatility_12m,
        max_drawdown
      `)
      .eq('symbol', symbol.toUpperCase())
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    if (!etfData) {
      return NextResponse.json({
        success: false,
        error: 'ETF não encontrado'
      }, { status: 404 });
    }
    
    // Retornar dados brutos + formatados para comparação
    return NextResponse.json({
      success: true,
      symbol: symbol.toUpperCase(),
      rawData: etfData,
      formattedData: {
        totalasset: `${etfData.totalasset} (bruto) = ${(etfData.totalasset / 1000000).toFixed(2)}M (formatado)`,
        returns_12m: `${etfData.returns_12m} (bruto) = ${(etfData.returns_12m * 100).toFixed(2)}% (formatado)`,
        sharpe_12m: `${etfData.sharpe_12m} (bruto) = ${etfData.sharpe_12m} (sem conversão)`,

        dividends_12m: `${etfData.dividends_12m} (bruto) = ${(etfData.dividends_12m * 100).toFixed(2)}% (formatado)`,
        expense_ratio: `${etfData.expense_ratio} (bruto) = ${etfData.expense_ratio}% (já em %)`,
        volatility_12m: `${etfData.volatility_12m} (bruto) = ${(etfData.volatility_12m * 100).toFixed(2)}% (formatado)`,
        max_drawdown: `${etfData.max_drawdown} (bruto) = ${(etfData.max_drawdown * 100).toFixed(2)}% (formatado)`
      },
      notes: [
        'totalasset: campo correto confirmado no banco',
        'returns_12m: deve ser multiplicado por 100 para exibir como %',
        'sharpe_12m: não deve ser multiplicado por 100',
        'dividends_12m: deve ser multiplicado por 100 para exibir como %',
        'expense_ratio: já vem em formato percentual, não multiplicar'
      ]
    });
    
  } catch (error) {
    console.error('❌ Erro na API de debug:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 