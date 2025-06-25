import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Carregando ETFs de destaque para showcase...');

    // Verificar se há dados na view active_etfs
    const activeETFsCount = await prisma.$queryRaw<[{count: string}]>`SELECT COUNT(*) as count FROM active_etfs`;
    const totalCount = parseInt(activeETFsCount[0].count);
    console.log(`📊 Total de ETFs ativos na view: ${totalCount}`);

    if (totalCount === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhum ETF encontrado na view active_etfs');
      return NextResponse.json({
        success: false,
        error: 'View active_etfs vazia - nenhum ETF ativo encontrado',
        message: 'Verificar view active_etfs e critérios de filtragem.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Buscar ETFs com métricas válidas usando a nova view active_etfs
    const etfsWithMetrics = await prisma.$queryRaw<any[]>`
      SELECT 
        symbol, name, assetclass, etfcompany, nav,
        returns_12m, volatility_12m, sharpe_12m, dividends_12m
      FROM active_etfs
      WHERE sharpe_12m IS NOT NULL 
        AND returns_12m IS NOT NULL
        AND returns_12m BETWEEN -0.95 AND 5.0
        AND volatility_12m BETWEEN 0 AND 2.0
        AND sharpe_12m BETWEEN -10 AND 10
      LIMIT 100
    `;

    console.log(`📊 ETFs com métricas válidas encontrados: ${etfsWithMetrics.length}`);

    if (etfsWithMetrics.length === 0) {
      console.error('❌ ERRO: Nenhum ETF com métricas válidas encontrado');
      return NextResponse.json({
        success: false,
        error: 'Nenhum ETF com métricas válidas encontrado',
        message: 'Verificar se existem dados de performance na view active_etfs',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // 1. TOP PERFORMERS (Maior retorno 12m)
    const topPerformers = await prisma.$queryRaw<any[]>`
      SELECT 
        symbol, name, assetclass, etfcompany,
        returns_12m, volatility_12m, sharpe_12m
      FROM active_etfs
      WHERE returns_12m IS NOT NULL 
        AND returns_12m BETWEEN -0.95 AND 5.0
        AND sharpe_12m IS NOT NULL
        AND sharpe_12m BETWEEN -10 AND 10
      ORDER BY returns_12m DESC
      LIMIT 5
    `;

    // 2. BEST SHARPE RATIO (Melhor relação risco/retorno)
    const bestSharpe = await prisma.$queryRaw<any[]>`
      SELECT 
        symbol, name, assetclass, etfcompany,
        returns_12m, volatility_12m, sharpe_12m
      FROM active_etfs
      WHERE sharpe_12m IS NOT NULL 
        AND sharpe_12m BETWEEN -10 AND 10
        AND returns_12m IS NOT NULL
        AND returns_12m BETWEEN -0.95 AND 5.0
      ORDER BY sharpe_12m DESC
      LIMIT 5
    `;

    // 3. LOW VOLATILITY (Menor volatilidade)
    const lowVolatility = await prisma.$queryRaw<any[]>`
      SELECT 
        symbol, name, assetclass, etfcompany,
        returns_12m, volatility_12m, sharpe_12m
      FROM active_etfs
      WHERE volatility_12m IS NOT NULL 
        AND volatility_12m BETWEEN 0.01 AND 2.0
        AND returns_12m IS NOT NULL
        AND returns_12m BETWEEN -0.95 AND 5.0
      ORDER BY volatility_12m ASC
      LIMIT 5
    `;

    // 4. HIGH DIVIDEND (Maiores dividendos)
    const highDividend = await prisma.$queryRaw<any[]>`
      SELECT 
        symbol, name, assetclass, etfcompany,
        returns_12m, volatility_12m, dividends_12m
      FROM active_etfs
      WHERE dividends_12m IS NOT NULL 
        AND dividends_12m > 0
        AND dividends_12m < 1.0
      ORDER BY dividends_12m DESC
      LIMIT 5
    `;

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

    console.log(`📊 Categorias encontradas - Performers: ${topPerformers.length}, Sharpe: ${bestSharpe.length}, Low Vol: ${lowVolatility.length}, High Div: ${highDividend.length}`);

    // Processar dados de cada categoria
    const processedData = {
      featured: processETFs(bestSharpe.slice(0, 4)), // ETFs em destaque baseados no Sharpe
      categories: {
        topSharpe: processETFs(bestSharpe),
        topReturn: processETFs(topPerformers),
        lowVolatility: processETFs(lowVolatility),
        highDividend: processETFs(highDividend)
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