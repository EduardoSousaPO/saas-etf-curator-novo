// src/app/api/etfs/screener/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const searchTerm = searchParams.get("search_term");
    const categoryFilter = searchParams.get("category_filter");
    const exchangeFilter = searchParams.get("exchange_filter");
    const assetsMin = searchParams.get("assets_min") ? parseFloat(searchParams.get("assets_min")!) : null;
    const assetsMax = searchParams.get("assets_max") ? parseFloat(searchParams.get("assets_max")!) : null;
    const return12mMin = searchParams.get("return_12m_min") ? parseFloat(searchParams.get("return_12m_min")!) : null;
    const sharpe12mMin = searchParams.get("sharpe_12m_min") ? parseFloat(searchParams.get("sharpe_12m_min")!) : null;
    const dividendYieldMin = searchParams.get("dividend_yield_min") ? parseFloat(searchParams.get("dividend_yield_min")!) : null;
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    // Build the where clause for Prisma
    const where: any = {};
    
    // Search term filter (symbol or name)
    if (searchTerm) {
      where.OR = [
        { symbol: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    // Category filter
    if (categoryFilter && categoryFilter !== "all") {
      where.category = { equals: categoryFilter };
    }
    
    // Exchange filter
    if (exchangeFilter && exchangeFilter !== "all") {
      where.exchange = { equals: exchangeFilter };
    }
    
    // Total assets range filter
    if (assetsMin !== null) {
      where.total_assets = { ...where.total_assets, gte: assetsMin };
    }
    if (assetsMax !== null) {
      where.total_assets = { ...where.total_assets, lte: assetsMax };
    }
    
    // Return 12m minimum filter
    if (return12mMin !== null) {
      where.returns_12m = { gte: return12mMin };
    }
    
    // Sharpe 12m minimum filter
    if (sharpe12mMin !== null) {
      where.sharpe_12m = { gte: sharpe12mMin };
    }
    
    // Dividend yield minimum filter
    if (dividendYieldMin !== null) {
      where.dividend_yield = { gte: dividendYieldMin };
    }
    
    // Execute count query for pagination
    const totalCount = await prisma.etfs.count({ where });
    
    // Execute main query with pagination
    const etfs = await prisma.etfs.findMany({
      where,
      orderBy: { symbol: 'asc' },
      skip,
      take: limit,
    });
    
    return NextResponse.json({
      etfs,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
    
  } catch (error) {
    console.error("Error in ETF screener API:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred while fetching ETFs" },
      { status: 500 }
    );
  }
}
