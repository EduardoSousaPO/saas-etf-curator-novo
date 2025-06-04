// src/app/api/etfs/screener/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters (ajustado para nomes do front-end)
    const searchTerm = searchParams.get("search_term");
    const category = searchParams.get("category_filter");
    const exchange = searchParams.get("exchange_filter");
    const minAssets = searchParams.get("assets_min");
    const maxAssets = searchParams.get("assets_max");
    const minReturn12m = searchParams.get("return_12m_min");
    const minSharpe12m = searchParams.get("sharpe_12m_min");
    const minDividendYield = searchParams.get("dividend_yield_min");
    const onlyComplete = searchParams.get("only_complete") === "true";
    const sortBy = searchParams.get("sort_by") || "returns_12m";
    const sortOrder = searchParams.get("sort_order") || "desc";
    const limit = parseInt(searchParams.get("limit") || "5000");
    const offset = parseInt(searchParams.get("offset") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const itemsPerPage = parseInt(searchParams.get("itemsPerPage") || "50");

    // Enhanced filters
    const maxVolatility = searchParams.get("max_volatility");
    const maxExpenseRatio = searchParams.get("max_expense_ratio");
    const maxDrawdown = searchParams.get("max_drawdown");

    console.log("🔗 Conectando ao banco Supabase para screening de ETFs...");

    // Build where conditions com nomes do front-end
    const where: any = {};

    if (minAssets) {
      where.total_assets = { ...(where.total_assets || {}), gte: parseFloat(minAssets) };
    }
    if (maxAssets) {
      where.total_assets = { ...(where.total_assets || {}), lte: parseFloat(maxAssets) };
    }
    if (minReturn12m) {
      where.returns_12m = { ...(where.returns_12m || {}), gte: parseFloat(minReturn12m) };
    }
    if (minSharpe12m) {
      where.sharpe_12m = { ...(where.sharpe_12m || {}), gte: parseFloat(minSharpe12m) };
    }
    if (minDividendYield) {
      where.dividend_yield = { ...(where.dividend_yield || {}), gte: parseFloat(minDividendYield) };
    }
    if (category && category !== "all") {
      where.category = { contains: category };
    }
    if (exchange && exchange !== "all") {
      where.exchange = { contains: exchange };
    }
    if (searchTerm) {
      where.OR = [
        { symbol: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    if (onlyComplete) {
      where.name = { not: null };
      where.description = { not: null };
      where.category = { not: null };
      where.exchange = { not: null };
      where.inception_date = { not: null };
      where.total_assets = { not: null };
      where.returns_12m = { not: null };
      where.sharpe_12m = { not: null };
      where.dividend_yield = { not: null };
    }

    // Calculate actual offset for pagination
    const actualOffset = page > 1 ? (page - 1) * itemsPerPage : offset;
    const actualLimit = page > 1 ? itemsPerPage : limit;

    // Set up sorting with more options
    const orderBy: any = {};
    const validSortFields = [
      'returns_12m', 'returns_24m', 'returns_36m', 'sharpe_12m', 'sharpe_24m', 'sharpe_36m',
      'dividend_yield', 'total_assets', 'volume', 'volatility_12m', 'volatility_24m', 'volatility_36m',
      'max_drawdown', 'symbol', 'name', 'category', 'inception_date'
    ];

    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.returns_12m = 'desc';
    }

    const etfs = await prisma.etfs.findMany({
      where,
      orderBy,
      take: actualLimit,
      skip: actualOffset,
      select: {
        id: true,
        symbol: true,
        name: true,
        description: true,
        category: true,
        exchange: true,
        inception_date: true,
        total_assets: true,
        volume: true,
        returns_12m: true,
        returns_24m: true,
        returns_36m: true,
        ten_year_return: true,
        volatility_12m: true,
        volatility_24m: true,
        volatility_36m: true,
        ten_year_volatility: true,
        sharpe_12m: true,
        sharpe_24m: true,
        sharpe_36m: true,
        ten_year_sharpe: true,
        max_drawdown: true,
        dividend_yield: true,
        dividends_12m: true,
        dividends_24m: true,
        dividends_36m: true,
        dividends_all_time: true
      }
    });

    const total = await prisma.etfs.count({ where });
    const totalPages = Math.ceil(total / itemsPerPage);

    console.log(`✅ ${etfs.length} ETFs encontrados no screening do banco Supabase (${total} total)`);

    return NextResponse.json({
      etfs,
      total,
      page,
      totalPages,
      itemsPerPage,
      limit: actualLimit,
      offset: actualOffset,
      hasMore: actualOffset + actualLimit < total,
      filters: {
        searchTerm,
        category,
        exchange,
        minAssets,
        maxAssets,
        minReturn12m,
        minSharpe12m,
        minDividendYield,
        onlyComplete,
        sortBy,
        sortOrder
      },
      _source: "supabase_database",
      _message: "Screening realizado no banco Supabase com filtros avançados",
      _timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erro ao conectar com banco Supabase:", error);
    console.error("💡 Verifique se o arquivo .env.local está configurado com DATABASE_URL");
    
    return NextResponse.json(
      { 
        error: "Falha na conexão com banco de dados", 
        details: (error as Error).message,
        help: "Configure DATABASE_URL no arquivo .env.local"
      },
      { status: 500 }
    );
  }
}
