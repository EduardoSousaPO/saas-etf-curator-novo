// src/components/comparator/ComparisonTable.tsx
"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ETF } from "@/types";
import { ETF_METRIC_CATEGORIES, CategoryKey } from '@/lib/etf-categories';
import MetricTooltip from '@/components/ui/MetricTooltip';
import ContextualGlossary from '@/components/ui/ContextualGlossary';

interface ComparisonTableProps {
  etfs: ETF[];
}

// Mapeamento de métricas para campos do ETF
const metricMapping: Record<string, { key: keyof ETF; label: string; higherIsBetter?: boolean; format?: (value: any) => string }> = {
  // Performance
  returns_12m: { key: "returns_12m", label: "Retorno 12m", higherIsBetter: true, format: (v) => v !== null && v !== undefined ? `${(parseFloat(String(v)) * 100).toFixed(2)}%` : "N/A" },
  returns_5y: { key: "returns_5y", label: "Retorno 5 anos", higherIsBetter: true, format: (v) => v !== null && v !== undefined ? `${(parseFloat(String(v)) * 100).toFixed(2)}%` : "N/A" },
  sharpe_12m: { key: "sharpe_12m", label: "Sharpe 12m", higherIsBetter: true, format: (v) => v !== null && v !== undefined ? parseFloat(String(v)).toFixed(2) : "N/A" },
  beta: { key: "beta", label: "Beta", higherIsBetter: false, format: (v) => v !== null && v !== undefined ? parseFloat(String(v)).toFixed(2) : "N/A" },
  
  // Risk
  volatility_12m: { key: "volatility_12m", label: "Volatilidade 12m", higherIsBetter: false, format: (v) => v !== null && v !== undefined ? `${(parseFloat(String(v)) * 100).toFixed(2)}%` : "N/A" },
  max_drawdown: { key: "max_drawdown", label: "Max Drawdown", higherIsBetter: false, format: (v) => v !== null && v !== undefined ? `${(parseFloat(String(v)) * 100).toFixed(2)}%` : "N/A" },
  
  // Fundamentals
  total_assets: { key: "total_assets", label: "Patrimônio", higherIsBetter: true, format: (v) => v !== null && v !== undefined ? `${(parseFloat(String(v)) / 1_000_000_000).toFixed(2)}B` : "N/A" },
  expense_ratio: { key: "expense_ratio", label: "Taxa Admin.", higherIsBetter: false, format: (v) => v !== null && v !== undefined ? `${(parseFloat(String(v)) * 100).toFixed(2)}%` : "N/A" },
  dividend_yield: { key: "dividend_yield", label: "Dividend Yield", higherIsBetter: true, format: (v) => v !== null && v !== undefined ? `${(parseFloat(String(v)) * 100).toFixed(2)}%` : "N/A" },
  volume: { key: "volume", label: "Volume", higherIsBetter: true, format: (v) => v !== null && v !== undefined ? parseFloat(String(v)).toLocaleString() : "N/A" },
  pe_ratio: { key: "pe_ratio", label: "P/L", higherIsBetter: false, format: (v) => v !== null && v !== undefined ? parseFloat(String(v)).toFixed(2) : "N/A" },
  pb_ratio: { key: "pb_ratio", label: "P/VP", higherIsBetter: false, format: (v) => v !== null && v !== undefined ? parseFloat(String(v)).toFixed(2) : "N/A" },
  
  // Composition (placeholders - estes campos podem não existir ainda)
  top_holdings: { key: "top_holdings" as keyof ETF, label: "Top Holdings", format: (v) => v || "N/A" },
  sector_allocation: { key: "sector_allocation" as keyof ETF, label: "Setores", format: (v) => v || "N/A" },
  geographic_exposure: { key: "geographic_exposure" as keyof ETF, label: "Geografia", format: (v) => v || "N/A" },
};

// Informações básicas sempre visíveis
const basicInfo = [
  { key: "symbol", label: "Símbolo" },
  { key: "name", label: "Nome" },
  { key: "category", label: "Categoria" },
  { key: "exchange", label: "Bolsa" },
  { key: "inception_date", label: "Data de Início", format: (v: any) => v ? new Date(v).toLocaleDateString("pt-BR") : "N/A" },
];

export default function ComparisonTable({ etfs }: ComparisonTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<CategoryKey[]>(['performance', 'fundamentals']);

  if (!etfs || etfs.length === 0) {
    return (
      <div className="text-center py-8">
        <ContextualGlossary className="text-gray-500 dark:text-gray-400">
          Selecione ETFs para comparar e analisar suas métricas de desempenho.
        </ContextualGlossary>
      </div>
    );
  }

  const toggleCategory = (categoryKey: CategoryKey) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Função segura para lidar com valores nulos
  const safeFormatValue = (etf: ETF, metricKey: string) => {
    const metric = metricMapping[metricKey];
    if (!metric) return "N/A";
    
    const value = etf[metric.key];
    if (value === undefined || value === null) return "N/A";
    
    try {
      return metric.format ? metric.format(value) : String(value);
    } catch (error) {
      console.error(`Erro ao formatar valor para ${metricKey}:`, error);
      return "Erro";
    }
  };

  const getBestValueIndex = (metricKey: string): number => {
    const metric = metricMapping[metricKey];
    if (!metric) return -1;

    const values = etfs.map(etf => {
      const value = etf[metric.key];
      return value ? parseFloat(String(value)) : null;
    });

    if (values.every(v => v === null)) return -1;

    const validValues = values.map((v, i) => ({ value: v, index: i })).filter(item => item.value !== null);
    
    if (metric.higherIsBetter) {
      return validValues.reduce((best, current) => 
        current.value! > best.value! ? current : best
      ).index;
    } else {
      return validValues.reduce((best, current) => 
        current.value! < best.value! ? current : best
      ).index;
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas - Sempre Visível */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            📊 Informações Básicas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white dark:bg-gray-800 z-10">Métrica</TableHead>
                {etfs.map((etf) => (
                  <TableHead key={etf.symbol} className="text-center min-w-32">
                    {etf.symbol}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {basicInfo.map((info) => (
                <TableRow key={info.key}>
                  <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">
                    {info.label}
                  </TableCell>
                  {etfs.map((etf) => (
                    <TableCell key={`${etf.symbol}-${info.key}`} className="text-center">
                      {info.format ? info.format(etf[info.key as keyof ETF]) : etf[info.key as keyof ETF] || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Categorias Expansíveis */}
      {Object.entries(ETF_METRIC_CATEGORIES).map(([categoryKey, category]) => (
        <div key={categoryKey} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
          <button
            onClick={() => toggleCategory(categoryKey as CategoryKey)}
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{category.icon}</span>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.label}</h3>
                <ContextualGlossary className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </ContextualGlossary>
              </div>
            </div>
            {expandedCategories.includes(categoryKey as CategoryKey) ? 
              <ChevronDown className="w-5 h-5 text-gray-500" /> : 
              <ChevronRight className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedCategories.includes(categoryKey as CategoryKey) && (
            <div className="border-t dark:border-gray-600">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-white dark:bg-gray-800 z-10">Métrica</TableHead>
                      {etfs.map((etf) => (
                        <TableHead key={etf.symbol} className="text-center min-w-32">
                          {etf.symbol}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.metrics.map(metricKey => {
                      const metric = metricMapping[metricKey];
                      if (!metric) return null;

                      const bestIndex = getBestValueIndex(metricKey);

                      return (
                        <TableRow key={metricKey}>
                          <TableCell className="sticky left-0 bg-white dark:bg-gray-800 z-10">
                            <MetricTooltip metric={metricKey}>
                              <span className="font-medium">{metric.label}</span>
                            </MetricTooltip>
                          </TableCell>
                          {etfs.map((etf, index) => {
                            const isBest = index === bestIndex;
                            return (
                              <TableCell 
                                key={`${etf.symbol}-${metricKey}`} 
                                className={`text-center ${
                                  isBest 
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold' 
                                    : ''
                                }`}
                              >
                                {safeFormatValue(etf, metricKey)}
                                {isBest && <span className="ml-1">🏆</span>}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

