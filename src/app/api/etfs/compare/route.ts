// src/app/api/etfs/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ETF {
  id: string;
  symbol: string;
  name?: string | null;
  category?: string | null;
  exchange?: string | null;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      return NextResponse.json(
        { error: "Symbols query parameter is required." },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(",").map(s => s.trim()).filter(s => s);

    if (symbols.length === 0 || symbols.length > 4) {
      return NextResponse.json(
        { error: "Please provide 1 to 4 symbols to compare." },
        { status: 400 }
      );
    }

    const etfs = await prisma.etfs.findMany({
      where: {
        symbol: { in: symbols },
      },
    });

    // Ensure the order of ETFs in the response matches the order in the query, if possible
    const sortedEtfs = symbols.map(symbol => etfs.find((etf: ETF) => etf.symbol === symbol)).filter(etf => etf);

    return NextResponse.json(sortedEtfs);

  } catch (error) {
    console.error("Error in ETF compare API:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred while fetching ETFs for comparison" },
      { status: 500 }
    );
  }
}

