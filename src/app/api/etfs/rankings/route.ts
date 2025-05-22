// src/app/api/etfs/rankings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RankingParams {
  metric: string;
  order: "asc" | "desc";
  limit: number;
}

const getRankingsForMetric = async ({ metric, order, limit }: RankingParams) => {
  let orderBy: any = {};
  // Ensure the metric name matches a valid field in the Etfs model
  // Add more valid metrics as needed based on your schema.prisma
  const validMetrics = [
    "returns_12m", 
    "sharpe_12m", 
    "dividend_yield", 
    "total_assets", 
    "volume", 
    "max_drawdown", 
    "volatility_12m"
    // Add other sortable fields from your Etfs model here
  ];

  if (!validMetrics.includes(metric)) {
    throw new Error(`Invalid metric for ranking: ${metric}`);
  }

  orderBy[metric] = order;

  return prisma.etfs.findMany({
    where: {
      [metric]: { not: null } // Only include ETFs where the metric is not null
    },
    orderBy,
    take: limit,
  });
};

export async function GET(request: NextRequest) {
  try {
    const rankings = {
      top_returns_12m: await getRankingsForMetric({ metric: "returns_12m", order: "desc", limit: 10 }),
      top_sharpe_12m: await getRankingsForMetric({ metric: "sharpe_12m", order: "desc", limit: 10 }),
      top_dividend_yield: await getRankingsForMetric({ metric: "dividend_yield", order: "desc", limit: 10 }),
      largest_total_assets: await getRankingsForMetric({ metric: "total_assets", order: "desc", limit: 10 }),
      highest_volume: await getRankingsForMetric({ metric: "volume", order: "desc", limit: 10 }),
      lowest_max_drawdown: await getRankingsForMetric({ metric: "max_drawdown", order: "asc", limit: 10 }), // Lower is better
      lowest_volatility_12m: await getRankingsForMetric({ metric: "volatility_12m", order: "asc", limit: 10 }), // Lower is better
    };

    return NextResponse.json(rankings);

  } catch (error) {
    console.error("Error in ETF rankings API:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred while fetching ETF rankings" },
      { status: 500 }
    );
  }
}

