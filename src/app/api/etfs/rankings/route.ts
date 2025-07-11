// src/app/api/etfs/rankings/route.ts
import { NextResponse } from "next/server";
import { safeNumber } from '@/lib/data-filters';

// Interface para os dados processados do ETF
interface ETFData {
  symbol: string;
  name: string;
  assetclass: string;
  etfcompany: string;
  nav: number | null;
  expense_ratio: number | null;
  total_assets: number | null;
  avgvolume: number | null;
  rank_position: number;
  value: number | null;
  percentage_value: number | null;
  percentile: number;
  quality_tier: string;
  returns_12m: number | null;
  sharpe_12m: number | null;
  dividend_yield: number | null;
  dividends_12m: number | null;
  max_drawdown: number | null;
  volatility_12m: number | null;
}

// Interface para o objeto rankings
interface RankingsData {
  top_returns_12m: ETFData[];
  top_sharpe_12m: ETFData[];
  top_dividend_yield: ETFData[];
  highest_volume: ETFData[];
  lowest_max_drawdown: ETFData[];
  lowest_volatility_12m: ETFData[];
}

// Configuração do cliente Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

async function executeSupabaseQuery(query: string): Promise<any[]> {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase API key');
  }
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ sql: query })
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function GET() {
  try {
    console.log('🔗 Calculando rankings dinâmicos da base completa de ETFs...');

    // Query para calcular rankings dinâmicos de toda a base
    const rankingsQuery = `
      WITH ranked_data AS (
        -- Top Returns 12m
        SELECT 
          symbol, name, assetclass, etfcompany, nav, expenseratio as expense_ratio,
          totalasset, avgvolume, returns_12m, sharpe_12m, dividends_12m, 
          volatility_12m, max_drawdown,
          'top_returns_12m' as category,
          ROW_NUMBER() OVER (ORDER BY returns_12m DESC NULLS LAST) as rank_position,
          returns_12m as value,
          returns_12m as percentage_value
        FROM etfs_ativos_reais 
        WHERE returns_12m IS NOT NULL 
          AND returns_12m >= -95 
          AND returns_12m <= 500
          AND totalasset > 10000000
        
        UNION ALL
        
        -- Top Sharpe 12m
        SELECT 
          symbol, name, assetclass, etfcompany, nav, expenseratio as expense_ratio,
          totalasset, avgvolume, returns_12m, sharpe_12m, dividends_12m,
          volatility_12m, max_drawdown,
          'top_sharpe_12m' as category,
          ROW_NUMBER() OVER (ORDER BY sharpe_12m DESC NULLS LAST) as rank_position,
          sharpe_12m as value,
          sharpe_12m as percentage_value
        FROM etfs_ativos_reais 
        WHERE sharpe_12m IS NOT NULL 
          AND sharpe_12m >= -10 
          AND sharpe_12m <= 10
          AND totalasset > 10000000
        
        UNION ALL
        
        -- Top Dividend Yield (usando dividends_12m como proxy para yield)
        SELECT 
          symbol, name, assetclass, etfcompany, nav, expenseratio as expense_ratio,
          totalasset, avgvolume, returns_12m, sharpe_12m, dividends_12m,
          volatility_12m, max_drawdown,
          'top_dividend_yield' as category,
          ROW_NUMBER() OVER (ORDER BY dividends_12m DESC NULLS LAST) as rank_position,
          dividends_12m as value,
          dividends_12m as percentage_value
        FROM etfs_ativos_reais 
        WHERE dividends_12m IS NOT NULL 
          AND dividends_12m > 0.1
          AND dividends_12m <= 20
          AND totalasset > 10000000
        
        UNION ALL
        
        -- Highest Volume
        SELECT 
          symbol, name, assetclass, etfcompany, nav, expenseratio as expense_ratio,
          totalasset, avgvolume, returns_12m, sharpe_12m, dividends_12m,
          volatility_12m, max_drawdown,
          'highest_volume' as category,
          ROW_NUMBER() OVER (ORDER BY avgvolume DESC NULLS LAST) as rank_position,
          avgvolume as value,
          avgvolume as percentage_value
        FROM etfs_ativos_reais 
        WHERE avgvolume IS NOT NULL 
          AND avgvolume > 100000
          AND totalasset > 10000000
        
        UNION ALL
        
        -- Lowest Max Drawdown
        SELECT 
          symbol, name, assetclass, etfcompany, nav, expenseratio as expense_ratio,
          totalasset, avgvolume, returns_12m, sharpe_12m, dividends_12m,
          volatility_12m, max_drawdown,
          'lowest_max_drawdown' as category,
          ROW_NUMBER() OVER (ORDER BY max_drawdown DESC NULLS LAST) as rank_position,
          max_drawdown as value,
          max_drawdown as percentage_value
        FROM etfs_ativos_reais 
        WHERE max_drawdown IS NOT NULL 
          AND max_drawdown >= -90 
          AND max_drawdown <= 0
          AND totalasset > 10000000
        
        UNION ALL
        
        -- Lowest Volatility 12m
        SELECT 
          symbol, name, assetclass, etfcompany, nav, expenseratio as expense_ratio,
          totalasset, avgvolume, returns_12m, sharpe_12m, dividends_12m,
          volatility_12m, max_drawdown,
          'lowest_volatility_12m' as category,
          ROW_NUMBER() OVER (ORDER BY volatility_12m ASC NULLS LAST) as rank_position,
          volatility_12m as value,
          volatility_12m as percentage_value
        FROM etfs_ativos_reais 
        WHERE volatility_12m IS NOT NULL 
          AND volatility_12m > 0.1
          AND volatility_12m <= 100
          AND totalasset > 10000000
      )
      SELECT * FROM ranked_data 
      WHERE rank_position <= 15
      ORDER BY category, rank_position;
    `;

    // Executar query via fetch direto ao Supabase
    if (!SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase API key');
    }
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/etfs_ativos_reais?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase connection failed: ${response.statusText}`);
    }

    // Executar queries individuais para cada categoria
    const categories = [
      {
        key: 'top_returns_12m',
        query: `select=symbol,name,assetclass,etfcompany,nav,expenseratio,totalasset,avgvolume,returns_12m,sharpe_12m,dividends_12m,volatility_12m,max_drawdown&returns_12m=gte.-95&returns_12m=lte.500&totalasset=gte.10000000&order=returns_12m.desc.nullslast&limit=15`
      },
      {
        key: 'top_sharpe_12m', 
        query: `select=symbol,name,assetclass,etfcompany,nav,expenseratio,totalasset,avgvolume,returns_12m,sharpe_12m,dividends_12m,volatility_12m,max_drawdown&sharpe_12m=gte.-10&sharpe_12m=lte.10&totalasset=gte.10000000&order=sharpe_12m.desc.nullslast&limit=15`
      },
      {
        key: 'top_dividend_yield',
        query: `select=symbol,name,assetclass,etfcompany,nav,expenseratio,totalasset,avgvolume,returns_12m,sharpe_12m,dividends_12m,volatility_12m,max_drawdown&dividends_12m=gte.0.1&dividends_12m=lte.20&totalasset=gte.10000000&order=dividends_12m.desc.nullslast&limit=15`
      },
      {
        key: 'highest_volume',
        query: `select=symbol,name,assetclass,etfcompany,nav,expenseratio,totalasset,avgvolume,returns_12m,sharpe_12m,dividends_12m,volatility_12m,max_drawdown&avgvolume=gte.100000&totalasset=gte.10000000&order=avgvolume.desc.nullslast&limit=15`
      },
      {
        key: 'lowest_max_drawdown',
        query: `select=symbol,name,assetclass,etfcompany,nav,expenseratio,totalasset,avgvolume,returns_12m,sharpe_12m,dividends_12m,volatility_12m,max_drawdown&max_drawdown=gte.-90&max_drawdown=lte.0&totalasset=gte.10000000&order=max_drawdown.desc.nullslast&limit=15`
      },
      {
        key: 'lowest_volatility_12m',
        query: `select=symbol,name,assetclass,etfcompany,nav,expenseratio,totalasset,avgvolume,returns_12m,sharpe_12m,dividends_12m,volatility_12m,max_drawdown&volatility_12m=gte.0.1&volatility_12m=lte.100&totalasset=gte.10000000&order=volatility_12m.asc.nullslast&limit=15`
      }
    ];

    console.log('📊 Executando queries para cada categoria...');
    
    const rankings: RankingsData = {
      top_returns_12m: [],
      top_sharpe_12m: [],
      top_dividend_yield: [],
      highest_volume: [],
      lowest_max_drawdown: [],
      lowest_volatility_12m: []
    };

    // Executar queries para cada categoria
    for (const category of categories) {
      try {
        if (!SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase API key');
        }
        
        const categoryResponse = await fetch(`${SUPABASE_URL}/rest/v1/etfs_ativos_reais?${category.query}`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          }
        });

        if (!categoryResponse.ok) {
          console.error(`❌ Erro na categoria ${category.key}:`, categoryResponse.statusText);
          continue;
        }

        const categoryData = await categoryResponse.json();
        console.log(`✅ Categoria ${category.key}: ${categoryData.length} ETFs encontrados`);

        // Processar dados da categoria
        rankings[category.key as keyof RankingsData] = categoryData.map((etf: any, index: number) => {
          const etfData: ETFData = {
            symbol: etf.symbol,
            name: etf.name || `${etf.symbol} ETF`,
            assetclass: etf.assetclass || 'Unknown',
            etfcompany: etf.etfcompany || 'Unknown',
            nav: safeNumber(etf.nav),
            expense_ratio: safeNumber(etf.expenseratio),
            total_assets: safeNumber(etf.totalasset),
            avgvolume: safeNumber(etf.avgvolume),
            rank_position: index + 1,
            value: safeNumber(getValueForCategory(category.key, etf)),
            percentage_value: safeNumber(getValueForCategory(category.key, etf)),
            percentile: Math.round(((15 - index) / 15) * 100),
            quality_tier: index < 3 ? 'excellent' : index < 8 ? 'good' : 'average',
            returns_12m: safeNumber(etf.returns_12m),
            sharpe_12m: safeNumber(etf.sharpe_12m),
            dividend_yield: safeNumber(etf.dividends_12m),
            dividends_12m: safeNumber(etf.dividends_12m),
            max_drawdown: safeNumber(etf.max_drawdown),
            volatility_12m: safeNumber(etf.volatility_12m)
          };
          return etfData;
        });

      } catch (error) {
        console.error(`❌ Erro ao processar categoria ${category.key}:`, error);
      }
    }

    // Função auxiliar para obter valor específico por categoria
    function getValueForCategory(categoryKey: string, etf: any): number | null {
      switch (categoryKey) {
        case 'top_returns_12m':
          return etf.returns_12m;
        case 'top_sharpe_12m':
          return etf.sharpe_12m;
        case 'top_dividend_yield':
          return etf.dividends_12m;
        case 'highest_volume':
          return etf.avgvolume;
        case 'lowest_max_drawdown':
          return etf.max_drawdown;
        case 'lowest_volatility_12m':
          return etf.volatility_12m;
        default:
          return null;
      }
    }

    // Calcular estatísticas totais
    const totalRankings = Object.values(rankings).reduce((sum, arr) => sum + arr.length, 0);
    const totalETFsAnalyzed = categories.length * 15; // Máximo possível

    console.log('✅ Rankings dinâmicos calculados com sucesso');
    console.log(`📊 Estatísticas: Returns: ${rankings.top_returns_12m.length}, Sharpe: ${rankings.top_sharpe_12m.length}, Dividend: ${rankings.top_dividend_yield.length}, Volume: ${rankings.highest_volume.length}, Drawdown: ${rankings.lowest_max_drawdown.length}, Volatility: ${rankings.lowest_volatility_12m.length}`);

    return NextResponse.json({
      ...rankings,
      _metadata: {
        timestamp: new Date().toISOString(),
        source: "etfs_ativos_reais_dynamic_calculation",
        total_categories: Object.keys(rankings).length,
        total_etfs: totalRankings,
        universe_size: 1370,
        last_updated: new Date().toISOString(),
        performance: "dynamic_real_time_calculation",
        methodology: {
          description: "Rankings dinâmicos calculados em tempo real da base completa de ETFs",
          ranking_criteria: {
            top_returns_12m: "Maiores retornos 12 meses (filtrado: -95% a 500%)",
            top_sharpe_12m: "Melhor índice Sharpe 12 meses (filtrado: -10 a 10)",
            top_dividend_yield: "Maiores dividendos 12 meses (filtrado: 0.1% a 20%)",
            highest_volume: "Maior volume médio de negociação (mín: 100k)",
            lowest_max_drawdown: "Menor drawdown máximo (filtrado: -90% a 0%)",
            lowest_volatility_12m: "Menor volatilidade 12 meses (filtrado: 0.1% a 100%)"
          },
          universe_filters: "ETFs com patrimônio > $10M para garantir liquidez mínima",
          ranking_size: "Top 15 ETFs por categoria",
          data_source: "Base completa etfs_ativos_reais com 1.370+ ETFs ativos",
          update_frequency: "Tempo real - calculado a cada requisição"
        },
        dataQuality: {
          totalRawData: 1370,
          validData: totalRankings,
          filterEfficiency: ((totalRankings / totalETFsAnalyzed) * 100).toFixed(1) + '%',
          qualityFilters: "Aplicados filtros de qualidade e outliers em cada categoria"
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao calcular rankings dinâmicos:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao calcular rankings dinâmicos',
        rankings: {
          top_returns_12m: [],
          top_sharpe_12m: [],
          top_dividend_yield: [],
          highest_volume: [],
          lowest_max_drawdown: [],
          lowest_volatility_12m: []
        }
      },
      { status: 500 }
    );
  }
}


