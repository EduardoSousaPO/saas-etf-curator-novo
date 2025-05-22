// src/components/comparator/ComparisonTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ETF } from "@/types";

interface ComparisonTableProps {
  etfs: ETF[];
}

// Define which metrics to display in the comparison table
// These should be key metrics useful for direct comparison
const comparisonMetrics: { key: keyof ETF; label: string; higherIsBetter?: boolean; format?: (value: any) => string; unit?: string }[] = [
  { key: "symbol", label: "Símbolo" },
  { key: "name", label: "Nome" },
  { key: "category", label: "Categoria" },
  { key: "exchange", label: "Bolsa" },
  { key: "inception_date", label: "Data de Início", format: (v) => v ? new Date(v).toLocaleDateString("pt-BR") : "N/A" },
  { key: "total_assets", label: "Ativos Totais", higherIsBetter: true, format: (v) => v ? `${(parseFloat(v) / 1_000_000_000).toFixed(2)}B` : "N/A" },
  { key: "volume", label: "Volume Médio", higherIsBetter: true, format: (v) => v ? parseFloat(v).toLocaleString() : "N/A" },
  { key: "returns_12m", label: "Retorno 12m", higherIsBetter: true, format: (v) => v ? `${parseFloat(v).toFixed(2)}%` : "N/A" },
  { key: "volatility_12m", label: "Volatilidade 12m", higherIsBetter: false, format: (v) => v ? `${parseFloat(v).toFixed(2)}%` : "N/A" },
  { key: "sharpe_12m", label: "Sharpe 12m", higherIsBetter: true, format: (v) => v ? parseFloat(v).toFixed(2) : "N/A" },
  { key: "max_drawdown", label: "Perda Máxima", higherIsBetter: false, format: (v) => v ? `${parseFloat(v).toFixed(2)}%` : "N/A" }, // Lower (less negative) is better
  { key: "dividend_yield", label: "Dividend Yield", higherIsBetter: true, format: (v) => v ? `${parseFloat(v).toFixed(2)}%` : "N/A" },
  // Add more relevant metrics for comparison
];

export default function ComparisonTable({ etfs }: ComparisonTableProps) {
  if (!etfs || etfs.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Selecione ETFs para comparar.</p>;
  }

  // Função segura para lidar com valores nulos
  const safeFormatValue = (etf: ETF, metric: typeof comparisonMetrics[0]) => {
    const value = etf[metric.key];
    if (value === undefined || value === null) return "N/A";
    
    try {
      return metric.format ? metric.format(value) : String(value);
    } catch (error) {
      console.error(`Erro ao formatar valor para ${String(metric.key)}:`, error);
      return "Erro";
    }
  };

  return (
    <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">Métrica</TableHead>
            {etfs.map((etf) => (
              <TableHead key={etf.symbol} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {etf.symbol}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
          {comparisonMetrics.map((metric) => (
            <TableRow key={metric.key} className="hover:bg-gray-50 dark:hover:bg-gray-750">
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200 sticky left-0 bg-white dark:bg-gray-800 z-10">
                {metric.label}
              </TableCell>
              {etfs.map((etf) => (
                <TableCell key={`${etf.symbol}-${metric.key}`} className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                  {safeFormatValue(etf, metric)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

