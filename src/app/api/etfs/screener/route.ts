// src/app/api/etfs/screener/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    console.log('🔍 Buscando ETFs...');
    
    // Buscar ETFs
    const etfs = await prisma.etf_list.findMany({
      where: etfListWhere,
      skip: actualOffset,
      take: actualLimit,
      orderBy: { symbol: 'asc' },
      select: {
        symbol: true,
        name: true,
        description: true,
        assetclass: true,
        etfcompany: true,
        expenseratio: true,
        totalasset: true,
        avgvolume: true,
        nav: true,
        holdingscount: true,
        inceptiondate: true
      }
    });

    console.log(`✅ Encontrados ${etfs.length} ETFs`);

    // Buscar métricas para os símbolos encontrados
    const symbols = etfs.map(e => e.symbol);
    const metrics = await prisma.calculated_metrics_teste.findMany({
      where: { symbol: { in: symbols } },
      select: {
        symbol: true,
        returns_12m: true,
        returns_24m: true,
        returns_36m: true,
        ten_year_return: true,
        volatility_12m: true,
        volatility_24m: true,
        volatility_36m: true,
        sharpe_12m: true,
        sharpe_24m: true,
        sharpe_36m: true,
        max_drawdown: true,
        dividends_12m: true,
        dividends_24m: true,
        dividends_36m: true
      }
    });

    console.log(`✅ Encontradas ${metrics.length} métricas`);

    // Função para formatar valores numéricos
    const formatNumeric = (value: any, decimals: number = 2): number | null => {
      if (value === null || value === undefined) return null;
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? null : parseFloat(num.toFixed(decimals));
    };

    // Merge e formatação dos dados
    const result = etfs.map(etf => {
      const metric = metrics.find(m => m.symbol === etf.symbol);
      
      // Calcular dividend yield se possível
      const nav = formatNumeric(etf.nav);
      const dividends12m = formatNumeric(metric?.dividends_12m, 4);
      const dividendYield = (nav && dividends12m && nav > 0) 
        ? formatNumeric((dividends12m / nav) * 100, 2) 
        : null;

      return {
        id: etf.symbol,
        symbol: etf.symbol,
        name: etf.name,
        description: etf.description,
        assetclass: etf.assetclass,
        etfcompany: etf.etfcompany,
        
        // Dados financeiros básicos - formatados
        expense_ratio: formatNumeric(etf.expenseratio, 4),
        volume: formatNumeric(etf.avgvolume, 0),
        nav: formatNumeric(etf.nav),
        holdings_count: etf.holdingscount,
        inception_date: etf.inceptiondate,
        
        // Métricas calculadas - já em formato percentual no banco, apenas converter para number
        returns_12m: metric?.returns_12m ? formatNumeric(Number(metric.returns_12m)) : null,
        returns_24m: metric?.returns_24m ? formatNumeric(Number(metric.returns_24m)) : null,
        returns_36m: metric?.returns_36m ? formatNumeric(Number(metric.returns_36m)) : null,
        ten_year_return: metric?.ten_year_return ? formatNumeric(Number(metric.ten_year_return)) : null,
        
        volatility_12m: metric?.volatility_12m ? formatNumeric(Number(metric.volatility_12m)) : null,
        volatility_24m: metric?.volatility_24m ? formatNumeric(Number(metric.volatility_24m)) : null,
        volatility_36m: metric?.volatility_36m ? formatNumeric(Number(metric.volatility_36m)) : null,
        
        sharpe_12m: formatNumeric(metric?.sharpe_12m),
        sharpe_24m: formatNumeric(metric?.sharpe_24m),
        sharpe_36m: formatNumeric(metric?.sharpe_36m),
        
        max_drawdown: metric?.max_drawdown ? formatNumeric(Number(metric.max_drawdown)) : null,
        dividends_12m: dividends12m,
        dividends_24m: formatNumeric(metric?.dividends_24m, 4),
        dividends_36m: formatNumeric(metric?.dividends_36m, 4),
        
        // Campos calculados
        dividend_yield: dividendYield,
        total_assets: formatNumeric(etf.totalasset) // Patrimônio líquido sob gestão
      };
    });

    // Contar total para paginação
    const total = await prisma.etf_list.count({ where: etfListWhere });
    const totalPages = Math.ceil(total / itemsPerPage);

    console.log('✅ Processamento concluído');

    return NextResponse.json({
      etfs: result,
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
      _source: "supabase_database",
      _message: "Screening realizado com sucesso no banco Supabase",
      _timestamp: new Date().toISOString()
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
