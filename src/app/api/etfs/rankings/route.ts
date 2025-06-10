// src/app/api/etfs/rankings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RankingParams {
  metric: string;
  order: "asc" | "desc";
  limit: number;
}

  const validMetrics = [
    "returns_12m", 
    "sharpe_12m", 
  "dividends_12m",
    "total_assets", 
    "volume", 
    "max_drawdown", 
    "volatility_12m"
  ];

const getRankingsForMetric = async ({ metric, order, limit }: RankingParams) => {
  if (!validMetrics.includes(metric)) {
    throw new Error(`Invalid metric for ranking: ${metric}`);
  }

  if (metric === "total_assets") {
    // Ranking de patrimônio: buscar em etf_list por assetsundermanagement
    const etfList = await prisma.etf_list.findMany({
      where: { assetsundermanagement: { not: null } },
      orderBy: { assetsundermanagement: order },
      take: limit,
    });
    return etfList.map(e => ({
      ...e,
      total_assets: e.assetsundermanagement,
      volume: e.avgvolume ?? null,
    }));
  }

  if (metric === "volume") {
    // Ranking de volume: buscar em etf_list por avgvolume
    const etfList = await prisma.etf_list.findMany({
      where: { avgvolume: { not: null } },
      orderBy: { avgvolume: order },
      take: limit,
    });
    return etfList.map(e => ({
      ...e,
      total_assets: e.assetsundermanagement ?? null,
      volume: e.avgvolume,
    }));
  }

  // Buscar as métricas ordenadas normalmente
  const metrics = await prisma.calculated_metrics.findMany({
    where: { [metric]: { not: null } },
    orderBy: { [metric]: order },
    take: limit,
  });
  if (metrics.length === 0) return [];

  // Buscar os dados cadastrais dos símbolos encontrados
  const symbols = metrics.map(m => m.symbol);
  const etfList = await prisma.etf_list.findMany({
    where: { symbol: { in: symbols } },
  });

  // Merge dos dados
  return metrics.map(m => {
    const etf = etfList.find(e => e.symbol === m.symbol);
    return {
      ...etf,
      ...m,
      total_assets: etf?.assetsundermanagement ?? null,
      volume: etf?.avgvolume ?? null,
    };
  });
};

export async function GET() {
  try {
    console.log("🔗 Conectando ao banco Supabase para buscar rankings...");

    const rankings = {
      top_returns_12m: await getRankingsForMetric({ metric: "returns_12m", order: "desc", limit: 10 }),
      top_sharpe_12m: await getRankingsForMetric({ metric: "sharpe_12m", order: "desc", limit: 10 }),
      top_dividends_12m: await getRankingsForMetric({ metric: "dividends_12m", order: "desc", limit: 10 }),
      largest_total_assets: await getRankingsForMetric({ metric: "total_assets", order: "desc", limit: 10 }),
      highest_volume: await getRankingsForMetric({ metric: "volume", order: "desc", limit: 10 }),
      lowest_max_drawdown: await getRankingsForMetric({ metric: "max_drawdown", order: "asc", limit: 10 }),
      lowest_volatility_12m: await getRankingsForMetric({ metric: "volatility_12m", order: "asc", limit: 10 }),
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


