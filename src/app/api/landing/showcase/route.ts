import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Carregando ETFs de destaque para showcase...');

    // Verificar se há dados na tabela calculated_metrics_teste
    const metricsCount = await prisma.calculated_metrics_teste.count();
    console.log(`📊 Total de métricas na tabela: ${metricsCount}`);

    if (metricsCount === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhuma métrica encontrada no banco de dados');
      return NextResponse.json({
        success: false,
        error: 'Banco de dados vazio - nenhuma métrica encontrada',
        message: 'Produção deve sempre ter dados reais. Verificar processo de enriquecimento de dados.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Buscar ETFs com métricas válidas usando raw SQL com filtros básicos
    const etfsWithMetrics = await prisma.$queryRaw<any[]>`
      SELECT 
        e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
        m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
      FROM etf_list e
      INNER JOIN calculated_metrics_teste m ON e.symbol = m.symbol
      WHERE m.sharpe_12m IS NOT NULL 
        AND m.returns_12m IS NOT NULL
        AND m.returns_12m BETWEEN -0.95 AND 5.0
        AND m.volatility_12m BETWEEN 0 AND 2.0
        AND m.sharpe_12m BETWEEN -10 AND 10
      LIMIT 100
    `;

    console.log(`📊 ETFs com métricas válidas encontrados: ${etfsWithMetrics.length}`);

    if (etfsWithMetrics.length === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhum ETF com métricas válidas encontrado');
      return NextResponse.json({
        success: false,
        error: 'Nenhum ETF com métricas válidas encontrado no banco',
        message: 'Dados existem mas não passaram nos filtros de qualidade. Verificar processo de enriquecimento.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Processar ETFs encontrados
    const processETFs = (etfs: any[]) => {
      return etfs.map(etf => {
        // Calcular dividend yield se possível (já em formato decimal)
        let dividend_yield = 0;
        if (etf.dividends_12m && etf.nav && etf.nav > 0) {
          dividend_yield = Number(etf.dividends_12m) / Number(etf.nav);
        }

        return {
          symbol: etf.symbol,
          name: etf.name || `${etf.symbol} ETF`,
          assetclass: etf.assetclass || 'Unknown',
          etfcompany: etf.etfcompany || 'Unknown',
          returns_12m: Number(etf.returns_12m) || 0,
          volatility_12m: Number(etf.volatility_12m) || 0,
          sharpe_12m: Number(etf.sharpe_12m) || 0,
          dividend_yield: dividend_yield
        };
      });
    };

    // Buscar diferentes categorias usando raw SQL com filtros de outliers
    const [
      topSharpeETFs,
      topReturnETFs,
      lowVolatilityETFs,
      highDividendETFs
    ] = await Promise.all([
      // Top Sharpe (filtrado)
      prisma.$queryRaw<any[]>`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics_teste m ON e.symbol = m.symbol
        WHERE m.sharpe_12m IS NOT NULL 
          AND m.sharpe_12m BETWEEN 0 AND 10
          AND m.returns_12m BETWEEN -0.50 AND 2.0
          AND m.volatility_12m BETWEEN 0 AND 1.0
        ORDER BY m.sharpe_12m DESC
        LIMIT 6
      `,
      
      // Top Return (filtrado)
      prisma.$queryRaw<any[]>`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics_teste m ON e.symbol = m.symbol
        WHERE m.returns_12m IS NOT NULL 
          AND m.returns_12m BETWEEN 0 AND 2.0
          AND m.volatility_12m BETWEEN 0 AND 1.0
        ORDER BY m.returns_12m DESC
        LIMIT 6
      `,
      
      // Low Volatility (filtrado)
      prisma.$queryRaw<any[]>`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics_teste m ON e.symbol = m.symbol
        WHERE m.volatility_12m IS NOT NULL 
          AND m.volatility_12m BETWEEN 0 AND 0.30
          AND m.returns_12m BETWEEN 0 AND 1.0
        ORDER BY m.volatility_12m ASC
        LIMIT 6
      `,
      
      // High Dividend (filtrado)
      prisma.$queryRaw<any[]>`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics_teste m ON e.symbol = m.symbol
        WHERE m.dividends_12m IS NOT NULL 
          AND m.dividends_12m BETWEEN 0 AND 100
          AND e.nav IS NOT NULL 
          AND e.nav > 0
          AND m.returns_12m BETWEEN -0.20 AND 1.0
        ORDER BY m.dividends_12m DESC
        LIMIT 6
      `
    ]);

    console.log(`📊 Categorias encontradas - Sharpe: ${topSharpeETFs.length}, Return: ${topReturnETFs.length}, Low Vol: ${lowVolatilityETFs.length}, High Div: ${highDividendETFs.length}`);

    // Processar dados de cada categoria
    const processedData = {
      featured: processETFs(topSharpeETFs.slice(0, 4)), // ETFs em destaque baseados no Sharpe
      categories: {
        topSharpe: processETFs(topSharpeETFs),
        topReturn: processETFs(topReturnETFs),
        lowVolatility: processETFs(lowVolatilityETFs),
        highDividend: processETFs(highDividendETFs)
      }
    };

    // Se alguma categoria está vazia, retornar erro
    if (processedData.featured.length === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhum ETF em destaque encontrado após processamento');
      return NextResponse.json({
        success: false,
        error: 'Nenhum ETF em destaque encontrado após aplicar filtros',
        message: 'Dados existem mas não geraram ETFs em destaque. Verificar critérios de filtros.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log(`✅ Showcase carregado com ${processedData.featured.length} ETFs em destaque`);

    return NextResponse.json({
      success: true,
      data: {
        ...processedData,
        lastUpdated: new Date().toISOString(),
        source: 'real_database',
        criteria: {
          featured: 'Melhores ETFs por Sharpe Ratio (dados reais)',
          topSharpe: 'Maior Sharpe Ratio (0 a 10)',
          topReturn: 'Maior Retorno 12m (0% a 200%)',
          lowVolatility: 'Menor Volatilidade (0% a 30%)',
          highDividend: 'Maiores Dividendos (dados reais)'
        }
      }
    });

  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao carregar showcase:', error);
    console.error('🚨 PRODUÇÃO DEVE SEMPRE USAR DADOS REAIS - Verificar conexão com Supabase');
    
    // NUNCA usar fallback - sempre retornar erro para forçar correção
    return NextResponse.json({
      success: false,
      error: `Falha ao conectar com banco de dados: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: 'Produção deve sempre usar dados reais do Supabase. Verificar variáveis de ambiente e conexão.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 