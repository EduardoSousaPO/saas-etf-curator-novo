import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando conexão com base de ETFs...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Teste 1: Contar total de ETFs
    const { count: totalCount, error: countError } = await supabase
      .from('etfs_ativos_reais')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar ETFs:', countError);
    }
    
    // Teste 2: Buscar primeiros 10 ETFs
    const { data: sampleETFs, error: sampleError } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, returns_12m, volatility, assets_under_management, expense_ratio')
      .limit(10);
    
    if (sampleError) {
      console.error('❌ Erro ao buscar amostra:', sampleError);
    }
    
    // Teste 3: Buscar ETFs com dados completos
    const { data: completeETFs, error: completeError } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, returns_12m, volatility, assets_under_management')
      .not('returns_12m', 'is', null)
      .not('volatility', 'is', null)
      .not('assets_under_management', 'is', null)
      .limit(20);
    
    if (completeError) {
      console.error('❌ Erro ao buscar ETFs completos:', completeError);
    }
    
    // Teste 4: Estatísticas da base
    const { data: stats, error: statsError } = await supabase
      .from('etfs_ativos_reais')
      .select('returns_12m, volatility, assets_under_management, expense_ratio')
      .not('returns_12m', 'is', null)
      .not('volatility', 'is', null);
    
    let statisticsAnalysis: any = null;
    if (!statsError && stats) {
      const returns = stats.map(s => s.returns_12m).filter(r => r !== null);
      const volatilities = stats.map(s => s.volatility).filter(v => v !== null);
      const aums = stats.map(s => s.assets_under_management).filter(a => a !== null);
      
      statisticsAnalysis = {
        total_with_complete_data: stats.length,
        returns_12m: {
          min: Math.min(...returns).toFixed(2) + '%',
          max: Math.max(...returns).toFixed(2) + '%',
          avg: (returns.reduce((a, b) => a + b, 0) / returns.length).toFixed(2) + '%'
        },
        volatility: {
          min: Math.min(...volatilities).toFixed(2) + '%',
          max: Math.max(...volatilities).toFixed(2) + '%',
          avg: (volatilities.reduce((a, b) => a + b, 0) / volatilities.length).toFixed(2) + '%'
        },
        aum: {
          min: '$' + (Math.min(...aums) / 1000000).toFixed(0) + 'M',
          max: '$' + (Math.max(...aums) / 1000000000).toFixed(0) + 'B',
          avg: '$' + (aums.reduce((a, b) => a + b, 0) / aums.length / 1000000).toFixed(0) + 'M'
        }
      };
    }
    
    return NextResponse.json({
      success: true,
      database_tests: {
        total_etfs_count: totalCount || 'Erro ao contar',
        sample_etfs: sampleETFs || [],
        complete_data_etfs: completeETFs || [],
        statistics: statisticsAnalysis
      },
      errors: {
        count_error: countError?.message,
        sample_error: sampleError?.message,
        complete_error: completeError?.message,
        stats_error: statsError?.message
      },
      diagnosis: {
        database_accessible: !countError && !sampleError,
        has_data: (sampleETFs?.length || 0) > 0,
        has_complete_data: (completeETFs?.length || 0) > 0,
        recommendation: totalCount === 0 ? 
          'Base de dados vazia - executar pipeline de importação' :
          (completeETFs?.length || 0) === 0 ?
            'Dados incompletos - executar enriquecimento' :
            'Base de dados funcional'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro no teste da base de ETFs:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro no teste da base de ETFs',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 