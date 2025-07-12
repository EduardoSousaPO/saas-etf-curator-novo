import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cache em memória simples
let showcaseCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function GET() {
  try {
    console.log('🔍 Carregando ETFs de destaque para showcase...');

    // Verificar cache
    const now = Date.now();
    if (showcaseCache && (now - showcaseCache.timestamp) < CACHE_DURATION) {
      console.log('⚡ Usando dados do cache (5min TTL)');
      return NextResponse.json({
        success: true,
        data: {
          ...showcaseCache.data,
          cached: true,
          cacheAge: Math.floor((now - showcaseCache.timestamp) / 1000)
        }
      });
    }

    // Verificar se há dados na view active_etfs
    const activeETFsCount = await prisma.$queryRaw<[{count: string}]>`SELECT COUNT(*) as count FROM etfs_ativos_reais`;
    const totalCount = parseInt(activeETFsCount[0].count);
    console.log(`📊 Total de ETFs ativos na view: ${totalCount}`);

    if (totalCount === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhum ETF encontrado na tabela etfs_ativos_reais');
      return NextResponse.json({
        success: false,
        error: 'Tabela etfs_ativos_reais vazia - nenhum ETF ativo encontrado',
        message: 'Verificar tabela etfs_ativos_reais e critérios de filtragem.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // OTIMIZAÇÃO: Uma única consulta para buscar todos os ETFs necessários
    const allETFs = await prisma.$queryRaw<any[]>`
      WITH ranked_etfs AS (
        SELECT 
          symbol, name, assetclass, etfcompany, nav,
          returns_12m, volatility_12m, sharpe_12m, dividends_12m,
          ROW_NUMBER() OVER (ORDER BY returns_12m DESC) as return_rank,
          ROW_NUMBER() OVER (ORDER BY sharpe_12m DESC) as sharpe_rank,
          ROW_NUMBER() OVER (ORDER BY volatility_12m ASC) as vol_rank,
          ROW_NUMBER() OVER (ORDER BY dividends_12m DESC) as div_rank
        FROM etfs_ativos_reais
        WHERE sharpe_12m IS NOT NULL 
          AND returns_12m IS NOT NULL
          AND returns_12m BETWEEN -0.95 AND 5.0
          AND volatility_12m BETWEEN 0 AND 2.0
          AND sharpe_12m BETWEEN -10 AND 10
      )
      SELECT 
        symbol, name, assetclass, etfcompany, nav,
        returns_12m, volatility_12m, sharpe_12m, dividends_12m,
        return_rank, sharpe_rank, vol_rank, div_rank
      FROM ranked_etfs
      WHERE return_rank <= 5 OR sharpe_rank <= 5 OR vol_rank <= 5 OR div_rank <= 5
      ORDER BY sharpe_rank ASC
    `;

    console.log(`📊 ETFs com métricas válidas encontrados: ${allETFs.length}`);

    if (allETFs.length === 0) {
      console.error('❌ ERRO: Nenhum ETF com métricas válidas encontrado');
      return NextResponse.json({
        success: false,
        error: 'Nenhum ETF com métricas válidas encontrado',
        message: 'Verificar se existem dados de performance na tabela etfs_ativos_reais',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Separar ETFs por categoria usando os rankings
    const topPerformers = allETFs.filter(etf => etf.return_rank <= 5);
    const bestSharpe = allETFs.filter(etf => etf.sharpe_rank <= 5);
    const lowVolatility = allETFs.filter(etf => etf.vol_rank <= 5);
    const highDividend = allETFs.filter(etf => etf.div_rank <= 5);

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
      },
      lastUpdated: new Date().toISOString(),
      source: 'real_database',
      criteria: {
        featured: 'Melhores ETFs por Sharpe Ratio (dados reais)',
        topSharpe: 'Maior Sharpe Ratio (0 a 10)',
        topReturn: 'Maior Retorno 12m (0% a 200%)',
        lowVolatility: 'Menor Volatilidade (0% a 30%)',
        highDividend: 'Maiores Dividendos (dados reais)'
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

    // Salvar no cache
    showcaseCache = {
      data: processedData,
      timestamp: now
    };

    console.log(`✅ Showcase carregado com ${processedData.featured.length} ETFs em destaque`);

    return NextResponse.json({
      success: true,
      data: processedData
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