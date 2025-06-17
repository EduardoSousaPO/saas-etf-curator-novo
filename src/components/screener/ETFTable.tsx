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
import { formatPercentage, formatCurrency } from "@/lib/formatters";

// Definição correta de ETF
interface ETF {
  id: string;
  symbol: string;
  name?: string;
  assetclass?: string;
  // exchange?: string; // Removido - coluna não existe no banco
  total_assets?: number;
  returns_12m?: number;
  sharpe_12m?: number;
  dividend_yield?: number;
  [key: string]: any; // Para outras propriedades possíveis
}

// Interface correta das props
interface ETFTableProps {
  etfs: ETF[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  itemsPerPage: number;
}

export default function ETFTable({ 
  etfs, 
  currentPage, 
  totalPages, 
  onPageChange,
  totalCount,
  itemsPerPage
}: ETFTableProps) {
  // Referência segura para o componente de tabela
  const tableRef = useRef<HTMLDivElement>(null);

  // Se não houver dados, mostrar mensagem
  if (!etfs || etfs.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Nenhum ETF encontrado com esses critérios.</p>;
  }

  // Define quais colunas mostrar
  const columns: { key: keyof ETF; label: string; numeric?: boolean }[] = [
    { key: "symbol", label: "Símbolo" },
    { key: "name", label: "Nome" },
    { key: "assetclass", label: "Asset Class" },
    // { key: "exchange", label: "Bolsa" }, // Removido - coluna não existe no banco
    { key: "total_assets", label: "Total Assets (M)", numeric: true },
    { key: "returns_12m", label: "Retorno 12m", numeric: true },
    { key: "sharpe_12m", label: "Sharpe 12m", numeric: true },
    { key: "dividend_yield", label: "Dividendos 12m", numeric: true },
  ];

  // Função para formatar valores
  const formatValue = (value: any, numeric?: boolean, key?: keyof ETF) => {
    if (value === null || typeof value === "undefined") return "N/A";
    
    if (numeric && typeof value === "number") {
      if (value === 0) return "0.00";
      
      // Formatação específica para ativos totais
      if (key === "total_assets") {
        return formatCurrency(value);
      }
      
      // Formatação específica para valores percentuais - CORRIGIDO: usar formatPercentage
      if (key === "returns_12m" || key === "returns_24m" || key === "returns_36m" || 
          key === "dividend_yield" || key === "volatility_12m" || key === "max_drawdown") {
        return formatPercentage(value);
      }
      
      return value.toFixed(2);
    }
    
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value).toLocaleDateString("pt-BR");
    }
    
    return String(value);
  };

  return (
    <div ref={tableRef} className="space-y-4">
      <div className="overflow-x-auto border rounded-lg w-full" style={{ maxWidth: '100%' }}>
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed" style={{ minWidth: '800px' }}>
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              {columns.map((col) => (
                <TableHead 
                  key={col.key} 
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${col.numeric ? "text-right" : ""}`}
                  style={{ minWidth: col.key === 'name' ? '200px' : col.key === 'symbol' ? '80px' : '120px' }}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {etfs.map((etf) => (
              <TableRow key={etf.id || etf.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {columns.map((col) => (
                  <TableCell 
                    key={`${etf.id || etf.symbol}-${String(col.key)}`} 
                    className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${col.numeric ? "text-right" : ""}`}
                    style={{ maxWidth: col.key === 'name' ? '200px' : 'auto', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {formatValue(etf[col.key], col.numeric, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> de <span className="font-medium">{totalCount}</span> resultados
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

