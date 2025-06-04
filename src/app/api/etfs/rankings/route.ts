// src/app/api/etfs/rankings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RankingParams {
  metric: string;
  order: "asc" | "desc";
  limit: number;
}

const getRankingsForMetric = async ({ metric, order, limit }: RankingParams) => {
  const orderBy: Record<string, "asc" | "desc"> = {};
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

export async function GET() {
  try {
    console.log("🔗 Conectando ao banco Supabase para buscar rankings...");

    const rankings = {
      top_returns_12m: await getRankingsForMetric({ metric: "returns_12m", order: "desc", limit: 10 }),
      top_sharpe_12m: await getRankingsForMetric({ metric: "sharpe_12m", order: "desc", limit: 10 }),
      top_dividend_yield: await getRankingsForMetric({ metric: "dividend_yield", order: "desc", limit: 10 }),
      largest_total_assets: await getRankingsForMetric({ metric: "total_assets", order: "desc", limit: 10 }),
      highest_volume: await getRankingsForMetric({ metric: "volume", order: "desc", limit: 10 }),
      lowest_max_drawdown: await getRankingsForMetric({ metric: "max_drawdown", order: "asc", limit: 10 }), // Lower is better
      lowest_volatility_12m: await getRankingsForMetric({ metric: "volatility_12m", order: "asc", limit: 10 }), // Lower is better
    };

    console.log("✅ Rankings carregados com sucesso do banco Supabase");
    
    return NextResponse.json({
      ...rankings,
      _source: "supabase_database",
      _message: "Dados reais do banco Supabase",
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

