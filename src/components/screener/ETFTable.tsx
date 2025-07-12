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

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0090d8] mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando ETFs...</p>
      </div>
    );
  }

  // Se não houver dados, mostrar mensagem
  if (!etfs || etfs.length === 0) {
    return <p className="text-center text-gray-500">Nenhum ETF encontrado com esses critérios.</p>;
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

