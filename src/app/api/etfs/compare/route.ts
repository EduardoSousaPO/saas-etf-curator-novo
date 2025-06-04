// src/app/api/etfs/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ETFComparison {
  id: string;
  symbol: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  exchange?: string | null;
  inception_date?: Date | null;
  total_assets?: number | null;
  volume?: number | null;
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  volatility_12m?: number | null;
  volatility_24m?: number | null;
  volatility_36m?: number | null;
  sharpe_12m?: number | null;
  sharpe_24m?: number | null;
  sharpe_36m?: number | null;
  max_drawdown?: number | null;
  dividend_yield?: number | null;
  dividends_12m?: number | null;
  fmp_data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  quality_score?: number;
  risk_level?: string;
  performance_rating?: string;
}

// Função para extrair dados FMP da description
function extractFMPData(description: string | null): any { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!description) return null;
  
  const fmpMatch = description.match(/\[FMP_DATA\]([\s\S]*?)\[\/FMP_DATA\]/);
  if (!fmpMatch) return null;
  
  try {
    return JSON.parse(fmpMatch[1]);
  } catch {
    return null;
  }
}

// Função para converter Decimal para number
function toNumber(value: any): number | null { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (value === null || value === undefined) return null;
  return typeof value === 'object' && value.toNumber ? value.toNumber() : Number(value);
}

// Função para calcular score de qualidade
function calculateQualityScore(etf: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
  let score = 50; // Score base
  
  // Retorno 12m (peso: 25%)
  if (etf.returns_12m) {
    if (etf.returns_12m > 0.15) score += 20;
    else if (etf.returns_12m > 0.08) score += 15;
    else if (etf.returns_12m > 0.05) score += 10;
    else if (etf.returns_12m < 0) score -= 10;
  }
  
  // Sharpe ratio (peso: 20%)
  if (etf.sharpe_12m) {
    if (etf.sharpe_12m > 1.5) score += 15;
    else if (etf.sharpe_12m > 1.0) score += 10;
    else if (etf.sharpe_12m > 0.5) score += 5;
    else if (etf.sharpe_12m < 0) score -= 5;
  }
  
  // Volatilidade (peso: 15%)
  if (etf.volatility_12m) {
    if (etf.volatility_12m < 0.15) score += 10;
    else if (etf.volatility_12m < 0.25) score += 5;
    else if (etf.volatility_12m > 0.35) score -= 10;
  }
  
  // Patrimônio líquido (peso: 15%)
  if (etf.total_assets) {
    if (etf.total_assets > 10000000000) score += 10; // > $10B
    else if (etf.total_assets > 1000000000) score += 8; // > $1B
    else if (etf.total_assets > 100000000) score += 5; // > $100M
    else if (etf.total_assets < 50000000) score -= 5; // < $50M
  }
  
  // Dividend yield (peso: 10%)
  if (etf.dividend_yield && etf.dividend_yield > 0.02) {
    score += 5;
  }
  
  // Volume (peso: 10%)
  if (etf.volume) {
    if (etf.volume > 1000000) score += 5; // > 1M volume
    else if (etf.volume < 10000) score -= 5; // < 10k volume
  }
  
  // Max drawdown (peso: 5%)
  if (etf.max_drawdown && etf.max_drawdown > -0.20) {
    score += 5; // Drawdown menor que -20% é bom
  }
  
  return Math.min(Math.max(score, 0), 100);
}

// Função para determinar nível de risco
function getRiskLevel(volatility: number | null, maxDrawdown: number | null): string {
  if (!volatility) return 'Desconhecido';
  
  if (volatility < 0.15) return 'Baixo';
  if (volatility < 0.25) return 'Moderado';
  return 'Alto';
}

// Função para rating de performance
function getPerformanceRating(returns12m: number | null, sharpe: number | null): string {
  if (!returns12m) return 'N/A';
  
  if (returns12m > 0.20 && sharpe && sharpe > 1.5) return 'Excelente';
  if (returns12m > 0.15 && sharpe && sharpe > 1.0) return 'Muito Bom';
  if (returns12m > 0.08 && sharpe && sharpe > 0.5) return 'Bom';
  if (returns12m > 0) return 'Regular';
  return 'Ruim';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");
    const enhanced = searchParams.get("enhanced") === "true";

    if (!symbolsParam) {
      return NextResponse.json(
        { error: "Symbols query parameter is required." },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(",").map(s => s.trim().toUpperCase()).filter(s => s);

    if (symbols.length === 0 || symbols.length > 6) {
      return NextResponse.json(
        { error: "Please provide 1 to 6 symbols to compare." },
        { status: 400 }
      );
    }

    // Buscar ETFs do banco
    const etfs = await prisma.etfs.findMany({
      where: {
        symbol: { in: symbols },
      },
      orderBy: {
        total_assets: 'desc'
      }
    });

    if (etfs.length === 0) {
      return NextResponse.json(
        { error: "No ETFs found with the provided symbols." },
        { status: 404 }
      );
    }

    // Processar dados para comparação
    const processedETFs: ETFComparison[] = etfs.map(etf => {
      const fmpData = extractFMPData(etf.description);
      const qualityScore = calculateQualityScore({
        ...etf,
        total_assets: toNumber(etf.total_assets),
        volume: toNumber(etf.volume),
        returns_12m: toNumber(etf.returns_12m),
        volatility_12m: toNumber(etf.volatility_12m),
        sharpe_12m: toNumber(etf.sharpe_12m),
        dividend_yield: toNumber(etf.dividend_yield),
        max_drawdown: toNumber(etf.max_drawdown)
      });
      const riskLevel = getRiskLevel(toNumber(etf.volatility_12m), toNumber(etf.max_drawdown));
      const performanceRating = getPerformanceRating(toNumber(etf.returns_12m), toNumber(etf.sharpe_12m));

      const result: ETFComparison = {
        id: etf.id,
        symbol: etf.symbol,
        name: etf.name,
        description: etf.description?.replace(/\[FMP_DATA\][\s\S]*?\[\/FMP_DATA\]/, '').trim() || null,
        category: etf.category,
        exchange: etf.exchange,
        inception_date: etf.inception_date,
        total_assets: toNumber(etf.total_assets),
        volume: toNumber(etf.volume),
        returns_12m: toNumber(etf.returns_12m),
        returns_24m: toNumber(etf.returns_24m),
        returns_36m: toNumber(etf.returns_36m),
        volatility_12m: toNumber(etf.volatility_12m),
        volatility_24m: toNumber(etf.volatility_24m),
        volatility_36m: toNumber(etf.volatility_36m),
        sharpe_12m: toNumber(etf.sharpe_12m),
        sharpe_24m: toNumber(etf.sharpe_24m),
        sharpe_36m: toNumber(etf.sharpe_36m),
        max_drawdown: toNumber(etf.max_drawdown),
        dividend_yield: toNumber(etf.dividend_yield),
        dividends_12m: toNumber(etf.dividends_12m),
        quality_score: qualityScore,
        risk_level: riskLevel,
        performance_rating: performanceRating
      };

      // Adicionar dados FMP se solicitado
      if (enhanced && fmpData) {
        result.fmp_data = fmpData;
      }

      return result;
    });

    // Ordenar na mesma ordem dos símbolos fornecidos
    const sortedETFs = symbols.map(symbol => 
      processedETFs.find(etf => etf.symbol === symbol)
    ).filter(etf => etf !== undefined);

    // Calcular estatísticas de comparação
    const stats = {
      total_compared: sortedETFs.length,
      best_performer: sortedETFs.reduce((best, current) => 
        (current.returns_12m || 0) > (best.returns_12m || 0) ? current : best
      ).symbol,
      lowest_risk: sortedETFs.reduce((lowest, current) => 
        (current.volatility_12m || Infinity) < (lowest.volatility_12m || Infinity) ? current : lowest
      ).symbol,
      highest_quality: sortedETFs.reduce((highest, current) => 
        (current.quality_score || 0) > (highest.quality_score || 0) ? current : highest
      ).symbol,
      avg_quality_score: Math.round(
        sortedETFs.reduce((sum, etf) => sum + (etf.quality_score || 0), 0) / sortedETFs.length
      )
    };

    return NextResponse.json({
      etfs: sortedETFs,
      stats,
      enhanced: enhanced,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in ETF compare API:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred while fetching ETFs for comparison" },
      { status: 500 }
    );
  }
}

