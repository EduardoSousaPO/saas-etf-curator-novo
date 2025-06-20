import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { 
  validateETFData,
  validateETFDataset, 
  generateDataQualityReport,
  ETFData,
  getDataCompletenessStrategy
} from '@/lib/data-validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const limit = parseInt(searchParams.get('limit') || '1000');

    console.log(`🔍 Iniciando validação de dados (limit: ${limit})`);

    // Buscar dados dos ETFs
    const { data: etfs, error } = await supabase
      .from('calculated_metrics_teste')
      .select(`
        symbol,
        returns_12m,
        returns_24m,
        volatility_12m,
        volatility_24m,
        sharpe_12m,
        max_drawdown,
        dividend_yield,
        expense_ratio,
        total_assets,
        avg_volume
      `)
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }

    if (!etfs || etfs.length === 0) {
      return NextResponse.json({ error: 'Nenhum ETF encontrado' }, { status: 404 });
    }

    console.log(`📊 Validando ${etfs.length} ETFs...`);

    // Executar validação
    const validation = validateETFDataset(etfs as ETFData[]);
    
    // Análise de completude
    const completenessStats = etfs.map(etf => getDataCompletenessStrategy(etf as ETFData));
    const canScreen = completenessStats.filter(s => s.canUseForScreening).length;
    const canRank = completenessStats.filter(s => s.canUseForRankings).length;
    const canSimulate = completenessStats.filter(s => s.canUseForSimulation).length;

    // Estatísticas de campos faltantes
    const missingStats = {
      returns_12m: etfs.filter(e => !e.returns_12m).length,
      volatility_12m: etfs.filter(e => !e.volatility_12m).length,
      sharpe_12m: etfs.filter(e => !e.sharpe_12m).length,
      max_drawdown: etfs.filter(e => !e.max_drawdown).length,
      total_assets: etfs.filter(e => !e.total_assets).length,
      expense_ratio: etfs.filter(e => !e.expense_ratio).length,
      dividend_yield: etfs.filter(e => !e.dividend_yield).length,
      avg_volume: etfs.filter(e => !e.avg_volume).length,
    };

    const result = {
      timestamp: new Date().toISOString(),
      summary: {
        totalETFs: validation.totalETFs,
        validETFs: validation.validETFs,
        invalidETFs: validation.invalidETFs,
        validPercentage: ((validation.validETFs / validation.totalETFs) * 100).toFixed(1),
        averageScore: validation.averageScore.toFixed(1)
      },
      functionality: {
        screening: {
          available: canScreen,
          percentage: ((canScreen / validation.totalETFs) * 100).toFixed(1)
        },
        rankings: {
          available: canRank,
          percentage: ((canRank / validation.totalETFs) * 100).toFixed(1)
        },
        simulation: {
          available: canSimulate,
          percentage: ((canSimulate / validation.totalETFs) * 100).toFixed(1)
        }
      },
      dataCompleteness: {
        missingCounts: missingStats,
        missingPercentages: Object.fromEntries(
          Object.entries(missingStats).map(([key, count]) => [
            key, 
            ((count / validation.totalETFs) * 100).toFixed(1)
          ])
        )
      },
      issues: {
        commonErrors: validation.commonErrors,
        commonWarnings: validation.commonWarnings
      },
      recommendations: [
        'Implementar fonte alternativa para dados de AUM (Total Assets)',
        'Validar e corrigir outliers de retornos extremos',
        'Verificar cálculos de Sharpe Ratio para valores suspeitos',
        'Monitorar dados de volatilidade para inconsistências'
      ]
    };

    if (format === 'report') {
      const report = generateDataQualityReport(etfs as ETFData[]);
      return new NextResponse(report, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    console.log(`✅ Validação concluída: ${validation.validETFs}/${validation.totalETFs} ETFs válidos`);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro na validação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: 'Lista de símbolos é obrigatória' }, { status: 400 });
    }

    console.log(`🔍 Validando ETFs específicos: ${symbols.join(', ')}`);

    // Buscar dados dos ETFs específicos
    const { data: etfs, error } = await supabase
      .from('calculated_metrics_teste')
      .select(`
        symbol,
        returns_12m,
        returns_24m,
        volatility_12m,
        volatility_24m,
        sharpe_12m,
        max_drawdown,
        dividend_yield,
        expense_ratio,
        total_assets,
        avg_volume
      `)
      .in('symbol', symbols);

    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }

    if (!etfs || etfs.length === 0) {
      return NextResponse.json({ error: 'Nenhum ETF encontrado' }, { status: 404 });
    }

    // Validar cada ETF individualmente
    const detailedResults = etfs.map(etf => {
      const validation = validateETFData(etf as ETFData);
      const completeness = getDataCompletenessStrategy(etf as ETFData);
      
      return {
        symbol: etf.symbol,
        validation,
        completeness,
        data: etf
      };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      results: detailedResults
    });

  } catch (error) {
    console.error('❌ Erro na validação específica:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 