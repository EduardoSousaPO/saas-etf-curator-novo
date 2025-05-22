// src/components/comparator/ComparisonInsights.tsx
"use client";

import { ETF } from "@/types";
// Removendo temporariamente a importação do Card que está causando problemas
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonInsightsProps {
  etfs: ETF[];
}

// Helper function to safely format a number with fixed decimal places
const safeNumberFormat = (value: any, decimals: number = 2): string => {
  // Check if value is a number or can be converted to a number
  const num = Number(value);
  if (isNaN(num)) return "N/A";
  return num.toFixed(decimals);
};

// Helper function to find the ETF with the best (or worst) value for a given metric
const findBestOrWorst = (
  etfs: ETF[], 
  metricKey: keyof ETF, 
  higherIsBetter: boolean
): { etf: ETF | null, value: number | null } => {
  if (!etfs || etfs.length === 0) return { etf: null, value: null };

  let bestEtf: ETF | null = null;
  let bestValue: number | null = null;

  for (const etf of etfs) {
    // Explicitly parse as number to avoid string values
    const rawValue = etf[metricKey];
    const currentValue = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
    
    // Skip if not a valid number
    if (currentValue === null || isNaN(currentValue)) continue;

    if (bestEtf === null) {
      bestEtf = etf;
      bestValue = currentValue;
    } else {
      if (higherIsBetter) {
        if (currentValue > (bestValue!)) {
          bestEtf = etf;
          bestValue = currentValue;
        }
      } else {
        if (currentValue < (bestValue!)) {
          bestEtf = etf;
          bestValue = currentValue;
        }
      }
    }
  }
  return { etf: bestEtf, value: bestValue };
};

export default function ComparisonInsights({ etfs }: ComparisonInsightsProps) {
  if (!etfs || etfs.length === 0) {
    return null; // No ETFs selected, no insights to display
  }

  const insights: string[] = [];

  // Generate insights based on key metrics
  const bestReturn12m = findBestOrWorst(etfs, "returns_12m", true);
  if (bestReturn12m.etf && bestReturn12m.value !== null) {
    insights.push(
      `${bestReturn12m.etf.symbol} apresentou o maior retorno nos últimos 12 meses (${safeNumberFormat(bestReturn12m.value)}%).`
    );
  }

  const lowestVolatility12m = findBestOrWorst(etfs, "volatility_12m", false);
  if (lowestVolatility12m.etf && lowestVolatility12m.value !== null) {
    insights.push(
      `${lowestVolatility12m.etf.symbol} demonstrou a menor volatilidade nos últimos 12 meses (${safeNumberFormat(lowestVolatility12m.value)}%).`
    );
  }

  const bestSharpe12m = findBestOrWorst(etfs, "sharpe_12m", true);
  if (bestSharpe12m.etf && bestSharpe12m.value !== null) {
    insights.push(
      `${bestSharpe12m.etf.symbol} teve o melhor Índice de Sharpe nos últimos 12 meses (${safeNumberFormat(bestSharpe12m.value)}), indicando um bom equilíbrio risco/retorno.`
    );
  }

  const highestDividendYield = findBestOrWorst(etfs, "dividend_yield", true);
  if (highestDividendYield.etf && highestDividendYield.value !== null) {
    insights.push(
      `${highestDividendYield.etf.symbol} oferece o maior Dividend Yield (${safeNumberFormat(highestDividendYield.value)}%).`
    );
  }
  
  const largestTotalAssets = findBestOrWorst(etfs, "total_assets", true);
  if (largestTotalAssets.etf && largestTotalAssets.value !== null) {
    insights.push(
      `${largestTotalAssets.etf.symbol} possui o maior volume de ativos sob gestão (Total Assets: ${safeNumberFormat(largestTotalAssets.value / 1_000_000_000)}B).`
    );
  }

  const lowestMaxDrawdown = findBestOrWorst(etfs, "max_drawdown", false); // Max drawdown is negative, so 'less negative' is better
  if (lowestMaxDrawdown.etf && lowestMaxDrawdown.value !== null) {
    insights.push(
      `${lowestMaxDrawdown.etf.symbol} apresentou a menor perda máxima histórica (Max Drawdown: ${safeNumberFormat(lowestMaxDrawdown.value)}%).`
    );
  }

  // Add more insights as needed
  if (etfs.length > 1) {
    const categories = new Set(etfs.map(etf => etf.category).filter(Boolean));
    if (categories.size === 1) {
      insights.push(`Todos os ETFs selecionados pertencem à categoria: ${Array.from(categories)[0]}.`);
    } else if (categories.size > 0) {
      insights.push(`Os ETFs selecionados cobrem diversas categorias, incluindo: ${Array.from(categories).slice(0,2).join(", ")}.`);
    }
  }

  // Substituindo os componentes Card por divs simples com classes Tailwind
  return (
    <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 pb-3">
        <h3 className="text-xl font-semibold dark:text-white">Análise Comparativa Rápida</h3>
      </div>
      <div className="p-6 pt-3">
        {insights.length > 0 ? (
          <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Não foi possível gerar insights com os ETFs selecionados ou dados disponíveis.</p>
        )}
      </div>
    </div>
  );
}

