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

    // Buscar dados completos do ETF com colunas corretas
    const etfDetails = await prisma.$queryRaw`
      SELECT 
        e.symbol,
        e.name,
        e.description,
        e.assetclass,
        e.etfcompany,
        e.expenseratio as expense_ratio,
        e.avgvolume as volume,
        e.inceptiondate as inception_date,
        e.nav,
        e.holdingscount as holdings_count,
        e.totalasset,
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
        m.dividends_36m,
        m.dividends_all_time
      FROM etf_list e
      LEFT JOIN calculated_metrics_teste m ON e.symbol = m.symbol
      WHERE e.symbol = ${symbol}
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