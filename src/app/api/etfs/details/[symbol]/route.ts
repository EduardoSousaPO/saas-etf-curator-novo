import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol?.toUpperCase();
    
    if (!symbol) {
      return NextResponse.json(
        { error: "Símbolo do ETF é obrigatório" },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando detalhes para ETF: ${symbol}`);

    // Buscar dados completos do ETF usando a view active_etfs
    const etfDetails = await prisma.$queryRaw`
      SELECT 
        symbol,
        name,
        description,
        assetclass,
        etfcompany,
        expenseratio as expense_ratio,
        avgvolume as volume,
        inceptiondate as inception_date,
        nav,
        holdingscount as holdings_count,
        totalasset,
        returns_12m,
        returns_24m,
        returns_36m,
        returns_5y as ten_year_return,
        volatility_12m,
        volatility_24m,
        volatility_36m,
        sharpe_12m,
        sharpe_24m,
        sharpe_36m,
        max_drawdown,
        dividends_12m,
        dividends_24m,
        dividends_36m,
        dividends_all_time,
        size_category,
        liquidity_category,
        etf_type
      FROM active_etfs
      WHERE symbol = ${symbol}
      LIMIT 1
    `;

    if (!etfDetails || (etfDetails as any[]).length === 0) {
      return NextResponse.json(
        { error: "ETF não encontrado" },
        { status: 404 }
      );
    }

    const etf = (etfDetails as any[])[0];
    
    console.log(`✅ ETF encontrado: ${etf.symbol}`);

    return NextResponse.json({
      success: true,
      data: etf
    });

  } catch (error) {
    console.error("❌ Erro ao buscar detalhes do ETF:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 