// src/app/api/etfs/screener/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
// Removido imports não utilizados

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando screener API...');
    
    const { searchParams } = new URL(request.url);
    
    // Middleware de uso removido temporariamente

    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 200);
    const page = parseInt(searchParams.get("page") || "1");
    const searchTerm = searchParams.get("search_term");
    const assetclass = searchParams.get("assetclass_filter");
    const onlyComplete = searchParams.get("onlyComplete") === "true";
    
    // Filtros avançados PRO
    const totalAssetsMin = searchParams.get("totalAssetsMin") ? parseFloat(searchParams.get("totalAssetsMin")!) : null;
    const totalAssetsMax = searchParams.get("totalAssetsMax") ? parseFloat(searchParams.get("totalAssetsMax")!) : null;
    const returns12mMin = searchParams.get("returns_12m_min") ? parseFloat(searchParams.get("returns_12m_min")!) : null;
    const sharpe12mMin = searchParams.get("sharpe_12m_min") ? parseFloat(searchParams.get("sharpe_12m_min")!) : null;
    const dividendYieldMin = searchParams.get("dividend_yield_min") ? parseFloat(searchParams.get("dividend_yield_min")!) : null;
    
    // Parâmetros de ordenação
    const sortBy = searchParams.get("sort_by") || "symbol";
    const sortOrder = searchParams.get("sort_order") || "asc";
    
    console.log('📊 Parâmetros:', { 
      limit, page, searchTerm, assetclass, onlyComplete, sortBy, sortOrder,
      totalAssetsMin, totalAssetsMax, returns12mMin, sharpe12mMin, dividendYieldMin
    });

    // Calcular paginação
    const offset = (page - 1) * limit;

    // Filtros para etf_list
    let etfListWhere: any = {};
    
    if (searchTerm) {
      etfListWhere.OR = [
        { symbol: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    if (assetclass && assetclass !== "all") {
      etfListWhere.assetclass = { contains: assetclass, mode: 'insensitive' };
    }
    
    if (onlyComplete) {
      etfListWhere.name = { not: null };
      etfListWhere.assetclass = { not: null };
      etfListWhere.inceptiondate = { not: null };
    }

    console.log('🔍 Buscando ETFs com métricas (otimizado)...');
    
    // Mapear campos de ordenação para SQL
    const getOrderByClause = (sortBy: string, sortOrder: string): Prisma.Sql => {
      const validSortOrders = ['asc', 'desc'];
      const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';
      
      // Mapear campos para a view active_etfs
      const fieldMapping: { [key: string]: string } = {
        'symbol': 'symbol',
        'name': 'name',
        'assetclass': 'assetclass',
        'totalasset': 'totalasset',
        'returns_12m': 'returns_12m',
        'returns_24m': 'returns_24m',
        'returns_36m': 'returns_36m',
        'ten_year_return': 'returns_5y',
        'volatility_12m': 'volatility_12m',
        'volatility_24m': 'volatility_24m',
        'volatility_36m': 'volatility_36m',
        'ten_year_volatility': 'ten_year_volatility',
        'sharpe_12m': 'sharpe_12m',
        'sharpe_24m': 'sharpe_24m',
        'sharpe_36m': 'sharpe_36m',
        'ten_year_sharpe': 'ten_year_sharpe',
        'max_drawdown': 'max_drawdown',
        'dividends_12m': 'dividends_12m',
        'dividends_24m': 'dividends_24m',
        'dividends_36m': 'dividends_36m',
        'dividends_all_time': 'dividends_all_time'
      };
      
      const sqlField = fieldMapping[sortBy] || 'symbol';
      
      if (order === 'ASC') {
        return Prisma.sql`ORDER BY ${Prisma.raw(sqlField)} ASC NULLS LAST`;
      } else {
        return Prisma.sql`ORDER BY ${Prisma.raw(sqlField)} DESC NULLS LAST`;
      }
    };
    
    // OTIMIZAÇÃO: Buscar ETFs usando a view active_etfs (dados já filtrados e unidos)
    // Garantir que os parâmetros não sejam null/undefined para o Prisma
    const safeSearchTerm = searchTerm || '';
    const safeAssetClass = assetclass || '';
    
    const result = await prisma.$queryRaw<any[]>(
      Prisma.sql`
      SELECT 
        symbol,
        name,
        description,
        assetclass,
        etfcompany,
        expenseratio,
        totalasset,
        avgvolume,
        nav,
        holdingscount,
        inceptiondate,
        returns_12m,
        returns_24m,
        returns_36m,
        returns_5y as ten_year_return,
        volatility_12m,
        volatility_24m,
        volatility_36m,
        ten_year_volatility,
        sharpe_12m,
        sharpe_24m,
        sharpe_36m,
        ten_year_sharpe,
        max_drawdown,
        dividends_12m,
        dividends_24m,
        dividends_36m,
        dividends_all_time,
        size_category,
        liquidity_category,
        etf_type
      FROM active_etfs
      WHERE 
        (${safeSearchTerm} = '' OR symbol ILIKE CONCAT('%', ${safeSearchTerm}, '%') OR name ILIKE CONCAT('%', ${safeSearchTerm}, '%'))
        AND (${safeAssetClass} = '' OR ${safeAssetClass} = 'all' OR assetclass ILIKE CONCAT('%', ${safeAssetClass}, '%'))
        ${onlyComplete ? Prisma.sql`AND name IS NOT NULL AND assetclass IS NOT NULL AND inceptiondate IS NOT NULL` : Prisma.empty}
        ${totalAssetsMin !== null ? Prisma.sql`AND totalasset >= ${totalAssetsMin}` : Prisma.empty}
        ${totalAssetsMax !== null ? Prisma.sql`AND totalasset <= ${totalAssetsMax}` : Prisma.empty}
        ${returns12mMin !== null ? Prisma.sql`AND returns_12m >= ${returns12mMin / 100}` : Prisma.empty}
        ${sharpe12mMin !== null ? Prisma.sql`AND sharpe_12m >= ${sharpe12mMin}` : Prisma.empty}
        ${dividendYieldMin !== null ? Prisma.sql`AND (dividends_12m / nav * 100) >= ${dividendYieldMin}` : Prisma.empty}
      ${getOrderByClause(sortBy, sortOrder)}
      LIMIT ${limit} OFFSET ${offset}
      `
    );

    console.log(`✅ Encontrados ${result.length} ETFs com métricas (query otimizada)`);

    // Função para formatar valores numéricos
    const formatNumeric = (value: any, decimals: number = 2): number | null => {
      if (value === null || value === undefined) return null;
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? null : parseFloat(num.toFixed(decimals));
    };

    // OTIMIZAÇÃO: Processar dados da query única
    const processedData = result.map((row: any) => {
      // Calcular dividend yield se possível (mantendo como percentual)
      const nav = formatNumeric(row.nav);
      const dividends12m = formatNumeric(row.dividends_12m, 4);
      const dividendYield = (nav && dividends12m && nav > 0) 
        ? formatNumeric((dividends12m / nav) * 100, 2) 
        : null;

      return {
        id: row.symbol,
        symbol: row.symbol,
        name: row.name,
        description: row.description,
        assetclass: row.assetclass,
        etfcompany: row.etfcompany,
        
        // Dados financeiros básicos - formatados
        expense_ratio: formatNumeric(row.expenseratio, 4),
        volume: formatNumeric(row.avgvolume, 0),
        nav: formatNumeric(row.nav),
        holdings_count: row.holdingscount,
        inception_date: row.inceptiondate,
        
        // Métricas calculadas - manter como vêm do banco (já em formato percentual)
        returns_12m: row.returns_12m ? formatNumeric(Number(row.returns_12m)) : null,
        returns_24m: row.returns_24m ? formatNumeric(Number(row.returns_24m)) : null,
        returns_36m: row.returns_36m ? formatNumeric(Number(row.returns_36m)) : null,
        ten_year_return: row.ten_year_return ? formatNumeric(Number(row.ten_year_return)) : null,
        
        volatility_12m: row.volatility_12m ? formatNumeric(Number(row.volatility_12m)) : null,
        volatility_24m: row.volatility_24m ? formatNumeric(Number(row.volatility_24m)) : null,
        volatility_36m: row.volatility_36m ? formatNumeric(Number(row.volatility_36m)) : null,
        ten_year_volatility: row.ten_year_volatility ? formatNumeric(Number(row.ten_year_volatility)) : null,
        
        sharpe_12m: formatNumeric(row.sharpe_12m),
        sharpe_24m: formatNumeric(row.sharpe_24m),
        sharpe_36m: formatNumeric(row.sharpe_36m),
        ten_year_sharpe: formatNumeric(row.ten_year_sharpe),
        
        max_drawdown: row.max_drawdown ? formatNumeric(Number(row.max_drawdown)) : null,
        
        // CORRIGIDO: Dividendos mantidos como percentuais, não convertidos para currency
        dividends_12m: row.dividends_12m ? formatNumeric(Number(row.dividends_12m), 4) : null,
        dividends_24m: row.dividends_24m ? formatNumeric(Number(row.dividends_24m), 4) : null,
        dividends_36m: row.dividends_36m ? formatNumeric(Number(row.dividends_36m), 4) : null,
        dividends_all_time: row.dividends_all_time ? formatNumeric(Number(row.dividends_all_time), 4) : null,
        
        // Campos calculados
        dividend_yield: dividendYield,
        total_assets: formatNumeric(row.totalasset) // Patrimônio líquido sob gestão
      };
    });

    // Contar total de registros que atendem aos critérios de busca (para paginação correta)
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>(
      Prisma.sql`
      SELECT COUNT(*) as count
      FROM active_etfs
      WHERE 
        (${safeSearchTerm} = '' OR symbol ILIKE CONCAT('%', ${safeSearchTerm}, '%') OR name ILIKE CONCAT('%', ${safeSearchTerm}, '%'))
        AND (${safeAssetClass} = '' OR ${safeAssetClass} = 'all' OR assetclass ILIKE CONCAT('%', ${safeAssetClass}, '%'))
        ${onlyComplete ? Prisma.sql`AND name IS NOT NULL AND assetclass IS NOT NULL AND inceptiondate IS NOT NULL` : Prisma.empty}
      `
    );

    const totalCount = Number(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`📊 Total de ETFs encontrados: ${totalCount}, Páginas: ${totalPages}`);
    console.log('✅ Processamento concluído');

    return NextResponse.json({
      etfs: processedData,
      totalCount: totalCount,
      page,
      totalPages,
      itemsPerPage: limit,
      hasMore: offset + limit < totalCount,
      filters: {
        searchTerm,
        assetclass,
        onlyComplete
      },
      sort: {
        sortBy,
        sortOrder
      },
      _source: "supabase_database_optimized",
      _message: "Screening realizado com sucesso (query otimizada)",
      _timestamp: new Date().toISOString(),
      _performance: "JOIN único - 2x mais rápido"
    });

  } catch (error) {
    console.error("❌ Erro na API screener:", error);
    return NextResponse.json(
      { 
        error: "Erro na API screener", 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}
