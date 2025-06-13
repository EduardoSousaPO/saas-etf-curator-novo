import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    console.log('🔍 Carregando ETFs de destaque para showcase...');

    // Verificar se há dados na tabela calculated_metrics
    const metricsCount = await prisma.calculated_metrics.count();
    console.log(`📊 Total de métricas na tabela: ${metricsCount}`);

    if (metricsCount === 0) {
      console.log('⚠️ Nenhuma métrica encontrada, usando dados fallback');
      return getFallbackData();
    }

    // Buscar ETFs com métricas válidas usando raw SQL com filtros básicos
    const etfsWithMetrics = await prisma.$queryRaw`
      SELECT 
        e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
        m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
      FROM etf_list e
      INNER JOIN calculated_metrics m ON e.symbol = m.symbol
      WHERE m.sharpe_12m IS NOT NULL 
        AND m.returns_12m IS NOT NULL
        AND m.returns_12m BETWEEN -0.95 AND 5.0
        AND m.volatility_12m BETWEEN 0 AND 2.0
        AND m.sharpe_12m BETWEEN -10 AND 10
      LIMIT 100
    `;

    console.log(`📊 ETFs com métricas válidas encontrados: ${etfsWithMetrics.length}`);

    if (etfsWithMetrics.length === 0) {
      console.log('⚠️ Nenhum ETF com métricas válidas encontrado, usando dados fallback');
      return getFallbackData();
    }

    // Processar ETFs encontrados
    const processETFs = (etfs: any[]) => {
      return etfs.map(etf => {
        // Calcular dividend yield se possível
        let dividend_yield = 0;
        if (etf.dividends_12m && etf.nav && etf.nav > 0) {
          dividend_yield = (Number(etf.dividends_12m) / Number(etf.nav)) * 100;
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
      prisma.$queryRaw`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics m ON e.symbol = m.symbol
        WHERE m.sharpe_12m IS NOT NULL 
          AND m.sharpe_12m BETWEEN 0 AND 10
          AND m.returns_12m BETWEEN -0.50 AND 2.0
          AND m.volatility_12m BETWEEN 0 AND 1.0
        ORDER BY m.sharpe_12m DESC
        LIMIT 6
      `,
      
      // Top Return (filtrado)
      prisma.$queryRaw`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics m ON e.symbol = m.symbol
        WHERE m.returns_12m IS NOT NULL 
          AND m.returns_12m BETWEEN 0 AND 2.0
          AND m.volatility_12m BETWEEN 0 AND 1.0
        ORDER BY m.returns_12m DESC
        LIMIT 6
      `,
      
      // Low Volatility (filtrado)
      prisma.$queryRaw`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics m ON e.symbol = m.symbol
        WHERE m.volatility_12m IS NOT NULL 
          AND m.volatility_12m BETWEEN 0 AND 0.30
          AND m.returns_12m BETWEEN 0 AND 1.0
        ORDER BY m.volatility_12m ASC
        LIMIT 6
      `,
      
      // High Dividend (filtrado)
      prisma.$queryRaw`
        SELECT 
          e.symbol, e.name, e.assetclass, e.etfcompany, e.nav,
          m.returns_12m, m.volatility_12m, m.sharpe_12m, m.dividends_12m
        FROM etf_list e
        INNER JOIN calculated_metrics m ON e.symbol = m.symbol
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

    // Se alguma categoria está vazia, usar fallback
    if (processedData.featured.length === 0) {
      console.log('⚠️ Nenhum ETF em destaque encontrado, usando dados fallback');
      return getFallbackData();
    }

    console.log(`✅ Showcase carregado com ${processedData.featured.length} ETFs em destaque`);

    return NextResponse.json({
      success: true,
      data: {
        ...processedData,
        lastUpdated: new Date().toISOString(),
        source: 'filtered_database',
        criteria: {
          featured: 'Melhores ETFs por Sharpe Ratio (filtrados)',
          topSharpe: 'Maior Sharpe Ratio (0 a 10)',
          topReturn: 'Maior Retorno 12m (0% a 200%)',
          lowVolatility: 'Menor Volatilidade (0% a 30%)',
          highDividend: 'Maiores Dividendos (filtrados)'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao carregar showcase:', error);
    return getFallbackData();
  }
}

function getFallbackData() {
  const fallbackETFs = [
    {
      symbol: 'SGOV',
      name: 'iShares 0-3 Month Treasury Bond ETF',
      assetclass: 'Fixed Income',
      etfcompany: 'iShares',
      returns_12m: 5.41,
      volatility_12m: 0.24,
      sharpe_12m: 21.79,
      dividend_yield: 5.28
    },
    {
      symbol: 'SHV',
      name: 'iShares Short Treasury Bond ETF',
      assetclass: 'Fixed Income',
      etfcompany: 'iShares',
      returns_12m: 5.28,
      volatility_12m: 0.28,
      sharpe_12m: 18.43,
      dividend_yield: 5.15
    },
    {
      symbol: 'ARKG',
      name: 'ARK Genomic Revolution ETF',
      assetclass: 'Equity',
      etfcompany: 'ARK',
      returns_12m: 3.04,
      volatility_12m: 17.03,
      sharpe_12m: 0.18,
      dividend_yield: 0.00
    },
    {
      symbol: 'MBCC',
      name: 'Monarch Blue Chips Core ETF',
      assetclass: 'Equity',
      etfcompany: 'Monarch',
      returns_12m: 1.08,
      volatility_12m: 3.27,
      sharpe_12m: 0.33,
      dividend_yield: 2.00
    }
  ];

  return NextResponse.json({
    success: true,
    data: {
      featured: fallbackETFs,
      categories: {
        topSharpe: fallbackETFs,
        topReturn: fallbackETFs,
        lowVolatility: fallbackETFs,
        highDividend: fallbackETFs
      },
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      criteria: {
        featured: 'Dados de fallback - ETFs conhecidos',
        topSharpe: 'Fallback data',
        topReturn: 'Fallback data',
        lowVolatility: 'Fallback data',
        highDividend: 'Fallback data'
      }
    }
  });
} 