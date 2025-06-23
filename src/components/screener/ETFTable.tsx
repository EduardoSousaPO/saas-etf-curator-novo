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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onETFClick?: (symbol: string) => void;
}

const ETFTable: React.FC<ETFTableProps> = ({
  etfs,
  currentPage,
  totalPages,
  onPageChange,
  onETFClick,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleRowClick = (symbol: string) => {
    if (onETFClick) {
      onETFClick(symbol);
    }
  };

  // Se não houver dados, mostrar mensagem
  if (!etfs || etfs.length === 0) {
    return <p className="text-center text-gray-500">Nenhum ETF encontrado com esses critérios.</p>;
  }

  // Define quais colunas mostrar (versão original)
  const columns: { key: keyof ETF; label: string; numeric?: boolean }[] = [
    { key: "symbol", label: "Símbolo" },
    { key: "name", label: "Nome" },
    { key: "assetclass", label: "Asset Class" },
    { key: "total_assets", label: "Total Assets (M)", numeric: true },
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
      case 'total_assets':
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
                  className={`font-semibold text-gray-700 ${
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
                className="hover:bg-gray-50 cursor-pointer transition-colors"
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

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ETFTable;

