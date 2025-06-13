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
}

// Interface para os dados processados do ETF
interface ETFData {
  symbol: string;
  name: string;
  assetclass: string;
  etfcompany: string;
  nav: number | null;
  expense_ratio: number | null;
  rank_position: number;
  value: number | null;
  percentage_value: number | null;
  returns_12m: number | null;
  sharpe_12m: number | null;
  dividend_yield: number | null;
  dividends_12m: number | null;
  avgvolume: number | null;
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
        el.expenseratio as expense_ratio
      FROM etf_rankings r
      LEFT JOIN etf_list el ON r.symbol = el.symbol
      ORDER BY r.category, r.rank_position
    `;

    console.log(`📊 Dados brutos de rankings: ${rankingsData.length}`);

    // Função para validar dados por categoria
    const isValidRankingData = (row: RankingQueryResult) => {
      const value = safeNumber(row.value);
      const percentageValue = safeNumber(row.percentage_value);
      
      switch (row.category) {
        case 'top_returns_12m':
          // Retornos entre -95% e 500%
          return percentageValue !== null && percentageValue >= -95 && percentageValue <= 500;
          
        case 'top_sharpe_12m':
          // Sharpe entre -10 e 10
          return value !== null && value >= -10 && value <= 10;
          
        case 'top_dividend_yield':
          // Dividend yield entre 0.1% e 15%
          return percentageValue !== null && percentageValue >= 0.1 && percentageValue <= 15;
          
        case 'highest_volume':
          // Volume deve ser positivo
          return value !== null && value > 0;
          
        case 'lowest_max_drawdown':
          // Max drawdown entre -100% e -0.1% (deve ser negativo)
          return percentageValue !== null && percentageValue >= -100 && percentageValue < 0;
          
        case 'lowest_volatility_12m':
          // Volatilidade entre 0.1% e 200% (não pode ser zero)
          return percentageValue !== null && percentageValue >= 0.1 && percentageValue <= 200;
          
        default:
          return true;
      }
    };

    // Filtrar dados inválidos
    const validRankingsData = rankingsData.filter(isValidRankingData);
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

    // Processar cada ranking válido
    validRankingsData.forEach((row: RankingQueryResult) => {
      const etfData: ETFData = {
        symbol: row.symbol,
        name: row.name || `${row.symbol} ETF`,
        assetclass: row.assetclass || 'Unknown',
        etfcompany: row.etfcompany || 'Unknown',
        nav: safeNumber(row.nav),
        expense_ratio: safeNumber(row.expense_ratio),
        rank_position: row.rank_position,
        value: safeNumber(row.value),
        percentage_value: safeNumber(row.percentage_value),
        // Mapear valores específicos para compatibilidade
        returns_12m: row.category === 'top_returns_12m' ? safeNumber(row.percentage_value) : null,
        sharpe_12m: row.category === 'top_sharpe_12m' ? safeNumber(row.value) : null,
        dividend_yield: row.category === 'top_dividend_yield' ? safeNumber(row.percentage_value) : null,
        dividends_12m: row.category === 'top_dividend_yield' ? safeNumber(row.value) : null,
        avgvolume: row.category === 'highest_volume' ? safeNumber(row.value) : null,
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
        dataQuality: {
          totalRawData: rankingsData.length,
          validData: validRankingsData.length,
          outliersRemoved: rankingsData.length - validRankingsData.length,
          filterEfficiency: rankingsData.length > 0 ? ((validRankingsData.length / rankingsData.length) * 100).toFixed(1) + '%' : '0%'
        },
        validationCriteria: {
          returns: 'Entre -95% e 500%',
          sharpe: 'Entre -10 e 10',
          dividendYield: 'Entre 0.1% e 15%',
          volatility: 'Entre 0.1% e 200% (não zero)',
          maxDrawdown: 'Entre -100% e -0.1% (negativo)',
          volume: 'Maior que 0'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar rankings:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao buscar rankings',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}


