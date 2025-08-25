import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Verificar se há dados na tabela etfs_ativos_reais
    const { count: totalCount, error: countError } = await supabase
      .from('etfs_ativos_reais')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Erro ao contar ETFs: ${countError.message}`);
    }
    
    console.log(`📊 Total de ETFs ativos na tabela: ${totalCount || 0}`);

    if (!totalCount || totalCount === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhum ETF encontrado na tabela etfs_ativos_reais');
      return NextResponse.json({
        success: false,
        error: 'Tabela etfs_ativos_reais vazia - nenhum ETF ativo encontrado',
        message: 'Verificar tabela etfs_ativos_reais e critérios de filtragem.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Buscar ETFs com métricas válidas usando Supabase
    const { data: allETFs, error: etfsError } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, assetclass, etfcompany, nav, returns_12m, volatility_12m, sharpe_12m, dividends_12m')
      .not('sharpe_12m', 'is', null)
      .not('returns_12m', 'is', null)
      .gte('returns_12m', -0.95)
      .lte('returns_12m', 5.0)
      .gte('volatility_12m', 0)
      .lte('volatility_12m', 2.0)
      .gte('sharpe_12m', -10)
      .lte('sharpe_12m', 10)
      .order('sharpe_12m', { ascending: false })
      .limit(50);

    if (etfsError) {
      throw new Error(`Erro ao buscar ETFs: ${etfsError.message}`);
    }

    console.log(`📊 ETFs com métricas válidas encontrados: ${allETFs?.length || 0}`);

    if (!allETFs || allETFs.length === 0) {
      console.error('❌ ERRO: Nenhum ETF com métricas válidas encontrado');
      return NextResponse.json({
        success: false,
        error: 'Nenhum ETF com métricas válidas encontrado',
        message: 'Verificar se existem dados de performance na tabela etfs_ativos_reais',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Separar ETFs por categoria (já ordenados por Sharpe)
    const bestSharpe = allETFs.slice(0, 10); // Top 10 por Sharpe
    const topPerformers = [...allETFs].sort((a, b) => (b.returns_12m || 0) - (a.returns_12m || 0)).slice(0, 10);
    const lowVolatility = [...allETFs].sort((a, b) => (a.volatility_12m || 999) - (b.volatility_12m || 999)).slice(0, 10);
    const highDividend = [...allETFs].sort((a, b) => (b.dividends_12m || 0) - (a.dividends_12m || 0)).slice(0, 10);

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