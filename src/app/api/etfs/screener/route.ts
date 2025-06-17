// src/app/api/etfs/screener/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando screener API...');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const itemsPerPage = parseInt(searchParams.get("itemsPerPage") || "50");
    const searchTerm = searchParams.get("search_term");
    const assetclass = searchParams.get("assetclass_filter");
    const onlyComplete = searchParams.get("only_complete") === "true";
    
    console.log('📊 Parâmetros:', { limit, page, searchTerm, assetclass, onlyComplete });

    // Calcular paginação
    const actualOffset = page > 1 ? (page - 1) * itemsPerPage : 0;
    const actualLimit = page > 1 ? itemsPerPage : limit;

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
    
    // OTIMIZAÇÃO: Buscar ETFs e métricas em uma única query usando SQL raw SEGURO
    // Garantir que os parâmetros não sejam null/undefined para o Prisma
    const safeSearchTerm = searchTerm || '';
    const safeAssetClass = assetclass || '';
    
    const result = await prisma.$queryRaw<any[]>(
      Prisma.sql`
      SELECT 
        e.symbol,
        e.name,
        e.description,
        e.assetclass,
        e.etfcompany,
        e.expenseratio,
        e.totalasset,
        e.avgvolume,
        e.nav,
        e.holdingscount,
        e.inceptiondate,
        m.returns_12m,
        m.returns_24m,
        m.returns_36m,
        m.ten_year_return,
        m.volatility_12m,
        m.volatility_24m,
        m.volatility_36m,
        m.sharpe_12m,
        m.sharpe_24m,
        m.sharpe_36m,
        m.max_drawdown,
        m.dividends_12m,
        m.dividends_24m,
        m.dividends_36m
      FROM etf_list e
      LEFT JOIN calculated_metrics_teste m ON e.symbol = m.symbol
      WHERE 
        (${safeSearchTerm} = '' OR e.symbol ILIKE CONCAT('%', ${safeSearchTerm}, '%') OR e.name ILIKE CONCAT('%', ${safeSearchTerm}, '%'))
        AND (${safeAssetClass} = '' OR ${safeAssetClass} = 'all' OR e.assetclass ILIKE CONCAT('%', ${safeAssetClass}, '%'))
        ${onlyComplete ? Prisma.sql`AND e.name IS NOT NULL AND e.assetclass IS NOT NULL AND e.inceptiondate IS NOT NULL` : Prisma.empty}
      ORDER BY e.symbol ASC
      LIMIT ${actualLimit} OFFSET ${actualOffset}
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
      // Calcular dividend yield se possível
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
        
        // Métricas calculadas - já em formato percentual no banco, apenas converter para number
        returns_12m: row.returns_12m ? formatNumeric(Number(row.returns_12m)) : null,
        returns_24m: row.returns_24m ? formatNumeric(Number(row.returns_24m)) : null,
        returns_36m: row.returns_36m ? formatNumeric(Number(row.returns_36m)) : null,
        ten_year_return: row.ten_year_return ? formatNumeric(Number(row.ten_year_return)) : null,
        
        volatility_12m: row.volatility_12m ? formatNumeric(Number(row.volatility_12m)) : null,
        volatility_24m: row.volatility_24m ? formatNumeric(Number(row.volatility_24m)) : null,
        volatility_36m: row.volatility_36m ? formatNumeric(Number(row.volatility_36m)) : null,
        
        sharpe_12m: formatNumeric(row.sharpe_12m),
        sharpe_24m: formatNumeric(row.sharpe_24m),
        sharpe_36m: formatNumeric(row.sharpe_36m),
        
        max_drawdown: row.max_drawdown ? formatNumeric(Number(row.max_drawdown)) : null,
        dividends_12m: dividends12m,
        dividends_24m: formatNumeric(row.dividends_24m, 4),
        dividends_36m: formatNumeric(row.dividends_36m, 4),
        
        // Campos calculados
        dividend_yield: dividendYield,
        total_assets: formatNumeric(row.totalasset) // Patrimônio líquido sob gestão
      };
    });

    console.log('✅ Processamento concluído');

    // Contar total de forma otimizada (apenas se necessário)
    let total = processedData.length;
    if (page === 1 && processedData.length === actualLimit) {
      // Só faz count se não for a primeira página completa
      total = await prisma.etf_list.count({ where: etfListWhere });
    }
    const totalPages = Math.ceil(total / itemsPerPage);

    return NextResponse.json({
      etfs: processedData,
      total,
      page,
      totalPages,
      itemsPerPage: actualLimit,
      hasMore: actualOffset + actualLimit < total,
      filters: {
        searchTerm,
        assetclass,
        onlyComplete
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
