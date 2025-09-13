'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Info, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Plus,
  Building2,
  DollarSign,
  BarChart3,
  Award,
  Percent
} from 'lucide-react';
import ScreenerDesignSystem from './ScreenerDesignSystem';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  format?: 'currency' | 'percentage' | 'ratio' | 'marketCap' | 'text';
  align?: 'left' | 'center' | 'right';
  icon?: React.ComponentType<{ className?: string }>;
  tooltip?: string;
  priority: 'essential' | 'important' | 'optional'; // Para responsividade
}

interface OptimizedTableProps {
  type: 'etf' | 'stock';
  data: any[];
  columns: Column[];
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string, order: 'asc' | 'desc') => void;
  onRowClick: (item: any) => void;
  onAddToPortfolio?: (item: any) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const TableHeader: React.FC<{
  column: Column;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string, order: 'asc' | 'desc') => void;
}> = ({ column, sortBy, sortOrder, onSort }) => {
  const isSorted = sortBy === column.key;
  
  const handleSort = () => {
    if (!column.sortable) return;
    const newOrder = isSorted && sortOrder === 'desc' ? 'asc' : 'desc';
    onSort(column.key, newOrder);
  };

  return (
    <th
      className={`${ScreenerDesignSystem.components.table.headerCell} ${
        column.align === 'right' ? 'text-right' : 
        column.align === 'center' ? 'text-center' : 'text-left'
      } ${column.sortable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''} ${
        column.priority === 'optional' ? 'hidden lg:table-cell' : 
        column.priority === 'important' ? 'hidden md:table-cell' : ''
      }`}
      onClick={handleSort}
    >
      <div className="flex items-center gap-2">
        {column.icon && <column.icon className="w-4 h-4 text-[#0090d8]" />}
        <span>{column.label}</span>
        {column.tooltip && (
          <div className="group relative">
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {column.tooltip}
            </div>
          </div>
        )}
        {column.sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              className={`w-3 h-3 ${isSorted && sortOrder === 'asc' ? 'text-[#0090d8]' : 'text-gray-300'}`} 
            />
            <ChevronDown 
              className={`w-3 h-3 -mt-1 ${isSorted && sortOrder === 'desc' ? 'text-[#0090d8]' : 'text-gray-300'}`} 
            />
          </div>
        )}
      </div>
    </th>
  );
};

const TableCell: React.FC<{
  value: any;
  format?: Column['format'];
  align?: Column['align'];
  priority: Column['priority'];
}> = ({ value, format, align, priority }) => {
  const formatValue = () => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return ScreenerDesignSystem.formatters.currency(Number(value));
      case 'percentage':
        return ScreenerDesignSystem.formatters.percentage(value);
      case 'marketCap':
        return ScreenerDesignSystem.formatters.marketCap(Number(value));
      case 'ratio':
        return ScreenerDesignSystem.formatters.ratio(value);
      default:
        return value;
    }
  };

  const getValueColor = () => {
    if (format === 'percentage') {
      return ScreenerDesignSystem.utils.getPerformanceColor(value);
    }
    return 'text-gray-900';
  };

  return (
    <td
      className={`${ScreenerDesignSystem.components.table.cell} ${
        align === 'right' ? 'text-right' : 
        align === 'center' ? 'text-center' : 'text-left'
      } ${priority === 'optional' ? 'hidden lg:table-cell' : 
          priority === 'important' ? 'hidden md:table-cell' : ''
      }`}
    >
      <span className={`font-medium ${getValueColor()}`}>
        {formatValue()}
      </span>
    </td>
  );
};

const SectorBadge: React.FC<{ sector: string }> = ({ sector }) => {
  const icon = ScreenerDesignSystem.utils.getSectorIcon(sector);
  
  return (
    <Badge className={`${ScreenerDesignSystem.components.badge.sector} text-xs`}>
      <span className="mr-1">{icon}</span>
      {sector}
    </Badge>
  );
};

const QualityBadge: React.FC<{ score: number | null }> = ({ score }) => {
  const { label, className } = ScreenerDesignSystem.utils.getQualityBadge(score);
  
  return (
    <Badge className={`${ScreenerDesignSystem.components.badge.base} ${className}`}>
      {label}
    </Badge>
  );
};

export const OptimizedTable: React.FC<OptimizedTableProps> = ({
  type,
  data,
  columns,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  onAddToPortfolio,
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className={ScreenerDesignSystem.components.card.base}>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0090d8] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando {type === 'etf' ? 'ETFs' : 'ações'}...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={ScreenerDesignSystem.components.card.base}>
        <div className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum {type === 'etf' ? 'ETF' : 'ação'} encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros para encontrar mais resultados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Tabela */}
      <div className={ScreenerDesignSystem.components.card.base}>
        <div className={ScreenerDesignSystem.components.card.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center">
                {type === 'etf' ? (
                  <BarChart3 className="w-5 h-5 text-[#0090d8]" />
                ) : (
                  <Building2 className="w-5 h-5 text-[#0090d8]" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#202636]">
                  Resultados da Busca
                </h3>
                <p className="text-sm text-gray-600">
                  {totalCount.toLocaleString()} {type === 'etf' ? 'ETFs' : 'ações'} encontrados
                </p>
              </div>
            </div>
            <Badge className="bg-[#0090d8] text-white px-3 py-1">
              Página {currentPage} de {totalPages}
            </Badge>
          </div>
        </div>

        {/* Tabela Principal */}
        <div className={ScreenerDesignSystem.components.table.container}>
          <table className={ScreenerDesignSystem.components.table.table}>
            <thead className={ScreenerDesignSystem.components.table.header}>
              <tr>
                {columns.map((column) => (
                  <TableHeader
                    key={column.key}
                    column={column}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                ))}
                <th className="py-3 px-4 text-center font-medium text-[#202636]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const isExpanded = expandedRows.has(item.symbol || item.id);
                
                return (
                  <React.Fragment key={item.symbol || item.id}>
                    <tr 
                      className={`${ScreenerDesignSystem.components.table.row} cursor-pointer`}
                      onClick={() => onRowClick(item)}
                    >
                      {/* Coluna Principal (Nome/Símbolo) */}
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-bold text-[#202636] text-lg">
                                {item.symbol}
                              </div>
                              <div className="text-sm text-gray-600 max-w-xs truncate">
                                {item.name || item.company_name}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <SectorBadge sector={item.sector || item.assetclass || 'Mixed'} />
                            {item.quality_score && (
                              <QualityBadge score={item.quality_score} />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Colunas de Dados */}
                      {columns.slice(1).map((column) => (
                        <TableCell
                          key={column.key}
                          value={item[column.key]}
                          format={column.format}
                          align={column.align}
                          priority={column.priority}
                        />
                      ))}

                      {/* Coluna de Ações */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowClick(item);
                            }}
                            className="flex items-center gap-1 hover:bg-[#0090d8] hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          
                          {onAddToPortfolio && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToPortfolio(item);
                              }}
                              className="flex items-center gap-1 hover:bg-green-600 hover:text-white transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * 20) + 1} a {Math.min(currentPage * 20, totalCount)} de {totalCount.toLocaleString()} resultados
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                Anterior
              </Button>
              
              {/* Números das páginas */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className={page === currentPage ? "bg-[#0090d8] text-white" : ""}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Próxima
                <ChevronUp className="w-4 h-4 rotate-90" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Configurações pré-definidas para colunas
export const ETF_COLUMNS: Column[] = [
  { key: 'symbol', label: 'ETF', priority: 'essential' },
  { key: 'returns_12m', label: 'Retorno 12m', format: 'percentage', align: 'right', sortable: true, priority: 'essential', icon: TrendingUp, tooltip: 'Performance dos últimos 12 meses' },
  { key: 'sharpe_ratio', label: 'Sharpe', format: 'ratio', align: 'right', sortable: true, priority: 'important', icon: Award, tooltip: 'Relação retorno/risco' },
  { key: 'totalasset', label: 'Patrimônio', format: 'marketCap', align: 'right', sortable: true, priority: 'important', icon: DollarSign, tooltip: 'Patrimônio sob gestão' },
  { key: 'expense_ratio', label: 'Taxa', format: 'percentage', align: 'right', sortable: true, priority: 'optional', icon: Percent, tooltip: 'Taxa de administração anual' },
  { key: 'dividend_yield', label: 'Yield', format: 'percentage', align: 'right', sortable: true, priority: 'optional', icon: Percent, tooltip: 'Rendimento de dividendos' }
];

export const STOCK_COLUMNS: Column[] = [
  { key: 'symbol', label: 'Ação', priority: 'essential' },
  { key: 'stock_price', label: 'Preço', format: 'currency', align: 'right', sortable: true, priority: 'essential', icon: DollarSign },
  { key: 'market_cap', label: 'Market Cap', format: 'marketCap', align: 'right', sortable: true, priority: 'important', icon: Building2, tooltip: 'Valor de mercado' },
  { key: 'returns_12m', label: 'Retorno 12m', format: 'percentage', align: 'right', sortable: true, priority: 'essential', icon: TrendingUp, tooltip: 'Performance anual' },
  { key: 'pe_ratio', label: 'P/E', format: 'ratio', align: 'right', sortable: true, priority: 'important', icon: BarChart3, tooltip: 'Preço/Lucro' },
  { key: 'dividend_yield_12m', label: 'Div. Yield', format: 'percentage', align: 'right', sortable: true, priority: 'optional', icon: Percent, tooltip: 'Rendimento de dividendos' }
];

export default OptimizedTable;

