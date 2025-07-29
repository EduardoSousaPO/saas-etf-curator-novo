// src/components/screener/ETFTable.tsx
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Search } from "lucide-react";
import { formatPercentage, formatCurrency, formatNumber, METRIC_TYPES, formatMetric } from "@/lib/formatters";
import { ETF } from "@/types/etf";

// Interface correta das props
interface ETFTableProps {
  etfs: ETF[];
  loading?: boolean;
  onSort?: (field: string, order: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onETFClick?: (symbol: string) => void;
  expandedETF?: string | null;
}

const ETFTable: React.FC<ETFTableProps> = ({
  etfs,
  loading = false,
  onSort,
  sortBy,
  sortOrder,
  onETFClick,
  expandedETF,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleRowClick = (symbol: string) => {
    if (onETFClick) {
      onETFClick(symbol);
    }
  };

  // 🔄 Loading state aprimorado - Inspirado em Morningstar
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Table skeleton */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Rows skeleton */}
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 border-b border-gray-100">
              <div className="grid grid-cols-6 gap-4 items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading indicator */}
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#0090d8] border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Analisando 1.370+ ETFs...</p>
          <p className="text-xs text-gray-500 mt-1">Aplicando filtros e ordenação</p>
        </div>
      </div>
    );
  }

  // 🔍 Estado vazio aprimorado
  if (!etfs || etfs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum ETF encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Não encontramos ETFs que atendam aos seus critérios atuais.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>Dicas:</strong></p>
            <p>• Tente ajustar os filtros de busca</p>
            <p>• Verifique se os valores mínimos/máximos estão corretos</p>
            <p>• Use a busca por texto para ETFs específicos</p>
          </div>
        </div>
      </div>
    );
  }

  // Define quais colunas mostrar (versão original)
  const columns: { key: keyof ETF; label: string; numeric?: boolean }[] = [
    { key: "symbol", label: "Símbolo" },
    { key: "name", label: "Nome" },
    { key: "assetclass", label: "Asset Class" },
    { key: "totalasset", label: "Total Assets (M)", numeric: true },
    { key: "returns_12m", label: "Retorno 12m", numeric: true },
    { key: "sharpe_12m", label: "Sharpe 12m", numeric: true },
    { key: "dividend_yield", label: "Dividendos 12m", numeric: true },
  ];

  // Função para formatar valores
  const formatValue = (value: any, columnKey: keyof ETF) => {
    if (value === null || value === undefined) return "N/A";
    
    // Usar o mapa de tipos para formatação correta
    const metricType = METRIC_TYPES[columnKey as string];
    
    if (metricType) {
      return formatMetric(value, metricType);
    }
    
    // Para colunas específicas não mapeadas
    switch (columnKey) {
      case 'totalasset':
        return formatCurrency(value);
      case 'dividend_yield':
        return formatPercentage(value);
      default:
        return value?.toString() || "N/A";
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-md border bg-white" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`font-semibold text-[#202636] ${
                    column.numeric ? "text-right" : "text-left"
                  }`}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {etfs.map((etf, index) => (
              <TableRow
                key={`${etf.symbol}-${index}`}
                className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                onClick={() => handleRowClick(etf.symbol)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`${
                      column.numeric ? "text-right font-mono" : "text-left"
                    } py-3`}
                  >
                    {formatValue(etf[column.key], column.key as keyof ETF)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


    </div>
  );
};

export default ETFTable;

