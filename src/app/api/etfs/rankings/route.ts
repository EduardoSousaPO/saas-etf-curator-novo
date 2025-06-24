// src/app/api/etfs/rankings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeNumber } from '@/lib/data-filters';

// Interface para tipar o resultado da query raw
interface RankingQueryResult {
  category: string;
  rank_position: number;
  symbol: string;
  value: number | null;
  percentage_value: number | null;
  updated_at: Date;
  name: string | null;
  assetclass: string | null;
  etfcompany: string | null;
  nav: number | null;
  expense_ratio: number | null;
  totalasset: number | null;
  avgvolume: number | null;
}

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

export async function GET() {
  try {
    console.log('🔗 Buscando rankings da tabela pré-calculada...');

    // Buscar todos os rankings da tabela etf_rankings
    const rankingsData = await prisma.$queryRaw<RankingQueryResult[]>`
      SELECT 
        r.category,
        r.rank_position,
        r.symbol,
        r.value,
        r.percentage_value,
        r.updated_at,
        el.name,
        el.assetclass,
        el.etfcompany,
        el.nav,
        el.expenseratio as expense_ratio,
        el.totalasset,
        el.avgvolume
      FROM etf_rankings r
      LEFT JOIN etf_list el ON r.symbol = el.symbol
      ORDER BY r.category, r.rank_position
    `;

    console.log(`📊 Dados brutos de rankings: ${rankingsData.length}`);

    // Estatísticas de qualidade por categoria
    const qualityStats = await prisma.$queryRaw<any[]>`
      SELECT 
        category,
        COUNT(*) as total_etfs,
        MIN(updated_at) as oldest_update,
        MAX(updated_at) as newest_update,
        AVG(CASE WHEN percentage_value IS NOT NULL THEN percentage_value END) as avg_percentage,
        STDDEV(CASE WHEN percentage_value IS NOT NULL THEN percentage_value END) as stddev_percentage
      FROM etf_rankings
      GROUP BY category
    `;

    // Total de ETFs disponíveis por categoria para cálculo de percentis
    const universeStats = await prisma.$queryRaw<any[]>`
      SELECT 
        'total_etfs_with_returns' as metric,
        COUNT(*) as count
      FROM calculated_metrics_teste 
      WHERE returns_12m IS NOT NULL 
        AND returns_12m >= -0.95 
        AND returns_12m <= 0.5
      UNION ALL
      SELECT 
        'total_etfs_with_sharpe' as metric,
        COUNT(*) as count
      FROM calculated_metrics_teste 
      WHERE sharpe_12m IS NOT NULL 
        AND sharpe_12m >= -10.0 
        AND sharpe_12m <= 10.0
      UNION ALL
      SELECT 
        'total_etfs_with_volume' as metric,
        COUNT(*) as count
      FROM etf_list 
      WHERE avgvolume IS NOT NULL 
        AND avgvolume > 0
        AND avgvolume < 1000000000
    `;

    // Função para validar dados por categoria com filtros mais flexíveis
    const isValidRanking = (row: RankingQueryResult): boolean => {
      const value = safeNumber(row.value);
      const percentageValue = safeNumber(row.percentage_value);
      
      switch (row.category) {
        case 'top_returns_12m':
          // Mais flexível para retornos - permite valores mais extremos
          return percentageValue !== null && 
                 percentageValue >= -98 && 
                 percentageValue <= 1000; // Permite retornos muito altos
        
        case 'top_sharpe_12m':
          // Sharpe pode ter valores extremos válidos
          return value !== null && 
                 value >= -15 && 
                 value <= 15;
        
        case 'top_dividend_yield':
          // Dividend yield - mantém validação mas mais flexível
          return percentageValue !== null && 
                 percentageValue >= 0.05 && 
                 percentageValue <= 25; // Permite yields muito altos (REITs, etc.)
        
        case 'highest_volume':
          // Volume - sem limite superior rígido
          return value !== null && 
                 value > 0;
        
        case 'lowest_max_drawdown':
          // Max drawdown - permite valores extremos
          return percentageValue !== null && 
                 percentageValue >= -99 && 
                 percentageValue <= 0;
        
        case 'lowest_volatility_12m':
          // Volatilidade - permite valores muito baixos e altos
          return percentageValue !== null && 
                 percentageValue >= 0.01 && 
                 percentageValue <= 300; // Permite volatilidades extremas
        
        default:
          return false;
      }
    };

    // Filtrar dados inválidos
    const validRankingsData = rankingsData.filter(isValidRanking);
    console.log(`✅ Dados após filtro: ${validRankingsData.length} (removidos: ${rankingsData.length - validRankingsData.length})`);

    // Organizar dados por categoria com tipagem correta
    const rankings: RankingsData = {
      top_returns_12m: [],
      top_sharpe_12m: [],
      top_dividend_yield: [],
      highest_volume: [],
      lowest_max_drawdown: [],
      lowest_volatility_12m: []
    };

    // Processar cada ranking válido com informações enriquecidas
    validRankingsData.forEach((row: RankingQueryResult) => {
      const etfData: ETFData = {
        symbol: row.symbol,
        name: row.name || `${row.symbol} ETF`,
        assetclass: row.assetclass || 'Unknown',
        etfcompany: row.etfcompany || 'Unknown',
        nav: safeNumber(row.nav),
        expense_ratio: safeNumber(row.expense_ratio),
        total_assets: safeNumber(row.totalasset),
        avgvolume: safeNumber(row.avgvolume),
        rank_position: row.rank_position,
        value: safeNumber(row.value),
        percentage_value: safeNumber(row.percentage_value),
        // Calcular percentil baseado na posição
        percentile: Math.round(((10 - row.rank_position + 1) / 10) * 100),
        // Classificação de qualidade baseada na posição
        quality_tier: row.rank_position <= 2 ? 'excellent' : 
                     row.rank_position <= 5 ? 'good' : 'average',
        // Mapear valores específicos para compatibilidade
        returns_12m: row.category === 'top_returns_12m' ? safeNumber(row.percentage_value) : null,
        sharpe_12m: row.category === 'top_sharpe_12m' ? safeNumber(row.value) : null,
        dividend_yield: row.category === 'top_dividend_yield' ? safeNumber(row.percentage_value) : null,
        dividends_12m: row.category === 'top_dividend_yield' ? safeNumber(row.value) : null,
        max_drawdown: row.category === 'lowest_max_drawdown' ? safeNumber(row.percentage_value) : null,
        volatility_12m: row.category === 'lowest_volatility_12m' ? safeNumber(row.percentage_value) : null
      };

      // Adicionar à categoria correspondente
      if (rankings[row.category as keyof RankingsData]) {
        rankings[row.category as keyof RankingsData].push(etfData);
      }
    });

    // Reordenar cada categoria e limitar a 10 itens
    Object.keys(rankings).forEach(category => {
      const categoryKey = category as keyof RankingsData;
      rankings[categoryKey] = rankings[categoryKey]
        .sort((a, b) => a.rank_position - b.rank_position)
        .slice(0, 10);
    });

    // Verificar se há dados
    const totalRankings = Object.values(rankings).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalRankings === 0) {
      console.log('⚠️ Nenhum ranking válido encontrado após filtros.');
      return NextResponse.json({
        error: 'Nenhum ranking válido disponível',
        message: 'Dados da tabela etf_rankings contêm outliers extremos. Reprocessamento necessário.',
        rankings: rankings,
        dataQuality: {
          totalRawData: rankingsData.length,
          validData: 0,
          filterEfficiency: '0%'
        }
      }, { status: 404 });
    }

    console.log('✅ Rankings filtrados carregados');
    console.log(`📊 Estatísticas válidas: Returns: ${rankings.top_returns_12m.length}, Sharpe: ${rankings.top_sharpe_12m.length}, Dividend: ${rankings.top_dividend_yield.length}, Volume: ${rankings.highest_volume.length}, Volatility: ${rankings.lowest_volatility_12m.length}`);

    return NextResponse.json({
      ...rankings,
      _metadata: {
        timestamp: new Date().toISOString(),
        source: "etf_rankings_table_filtered",
        total_categories: Object.keys(rankings).length,
        total_etfs: totalRankings,
        last_updated: validRankingsData[0]?.updated_at || null,
        performance: "optimized_pre_calculated_with_filters",
        methodology: {
          description: "Rankings baseados em metodologia inspirada na Morningstar",
          ranking_criteria: {
            top_returns_12m: "Retornos ajustados ao risco dos últimos 12 meses",
            top_sharpe_12m: "Índice Sharpe (retorno por unidade de risco)",
            top_dividend_yield: "Yield de dividendos calculado sobre NAV",
            highest_volume: "Volume médio de negociação",
            lowest_max_drawdown: "Menor perda máxima histórica",
            lowest_volatility_12m: "Menor volatilidade anualizada"
          },
          percentile_system: "Top 10 ETFs representam aproximadamente os 0.2% superiores do universo",
          data_filters: "Filtros flexíveis aplicados para preservar valores extremos válidos",
          update_frequency: "Dados atualizados semanalmente via scripts automatizados"
        },
        dataQuality: {
          totalRawData: rankingsData.length,
          validData: validRankingsData.length,
          outliersRemoved: rankingsData.length - validRankingsData.length,
          filterEfficiency: rankingsData.length > 0 ? ((validRankingsData.length / rankingsData.length) * 100).toFixed(1) + '%' : '0%',
          qualityByCategory: qualityStats.reduce((acc: any, stat: any) => {
            acc[stat.category] = {
              total_etfs: Number(stat.total_etfs),
              data_freshness: stat.newest_update,
              avg_value: stat.avg_percentage ? Number(stat.avg_percentage).toFixed(2) : null,
              consistency: stat.stddev_percentage ? Number(stat.stddev_percentage).toFixed(2) : null
            };
            return acc;
          }, {})
        },
        universeStats: universeStats.reduce((acc: any, stat: any) => {
          acc[stat.metric] = Number(stat.count);
          return acc;
        }, {}),
        validationCriteria: {
          returns: 'Entre -98% e 1000% (filtros flexíveis)',
          sharpe: 'Entre -15 e 15 (permite extremos válidos)',
          dividendYield: 'Entre 0.05% e 25% (inclui REITs)',
          volatility: 'Entre 0.01% e 300% (preserva extremos)',
          maxDrawdown: 'Entre -99% e 0% (permite perdas extremas)',
          volume: 'Maior que 0 (sem limite superior)'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar rankings:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao buscar rankings',
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


