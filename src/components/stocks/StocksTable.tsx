'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Stock {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  stock_price: number;
  market_cap: number;
  market_cap_formatted: string;
  returns_12m: number;
  volatility_12m: number;
  pe_ratio: number;
  dividend_yield_12m: number;
  quality_score: number;
  ai_quality_score: number;
  last_updated: string;
}

interface StocksTableProps {
  stocks: Stock[];
  loading: boolean;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  onSort: (field: string, order: 'ASC' | 'DESC') => void;
  page: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function StocksTable({
  stocks,
  loading,
  sortBy,
  sortOrder,
  onSort,
  page,
  totalCount,
  onPageChange
}: StocksTableProps) {
  
  // Função para formatar valores
  const formatValue = (value: number | null | undefined, type: 'currency' | 'percentage' | 'number' | 'marketCap' = 'number'): string => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    
    switch (type) {
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'marketCap':
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        return `$${value.toLocaleString()}`;
      default:
        return value.toFixed(2);
    }
  };

  // Função para renderizar ícone de ordenação
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'ASC' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  // Função para lidar com clique na coluna
  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSort(field, newOrder);
  };

  // Função para renderizar badge de qualidade
  const renderQualityBadge = (score: number | null | undefined) => {
    if (!score) return <Badge variant="outline">-</Badge>;
    
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 60) return <Badge className="bg-blue-100 text-blue-800">Boa</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
    return <Badge className="bg-red-100 text-red-800">Baixa</Badge>;
  };

  // Calcular paginação
  const totalPages = Math.ceil(totalCount / 20);
  const startItem = (page - 1) * 20 + 1;
  const endItem = Math.min(page * 20, totalCount);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="text-center mt-4 text-gray-500">
          Carregando ações...
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          📊 Nenhuma ação encontrada com os filtros aplicados
        </div>
        <p className="text-sm text-gray-400">
          Tente ajustar os filtros ou termos de busca
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center">
                  Símbolo
                  {renderSortIcon('symbol')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('company_name')}
              >
                <div className="flex items-center">
                  Empresa
                  {renderSortIcon('company_name')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('sector')}
              >
                <div className="flex items-center">
                  Setor
                  {renderSortIcon('sector')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock_price')}
              >
                <div className="flex items-center justify-end">
                  Preço
                  {renderSortIcon('stock_price')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('market_cap')}
              >
                <div className="flex items-center justify-end">
                  Market Cap
                  {renderSortIcon('market_cap')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('returns_12m')}
              >
                <div className="flex items-center justify-end">
                  Retorno 12m
                  {renderSortIcon('returns_12m')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pe_ratio')}
              >
                <div className="flex items-center justify-end">
                  P/E
                  {renderSortIcon('pe_ratio')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dividend_yield_12m')}
              >
                <div className="flex items-center justify-end">
                  Dividend Yield
                  {renderSortIcon('dividend_yield_12m')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quality_score')}
              >
                <div className="flex items-center justify-center">
                  Qualidade
                  {renderSortIcon('quality_score')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock, index) => (
              <tr key={stock.symbol} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {stock.symbol}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {stock.company_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stock.industry}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant="outline" className="text-xs">
                    {stock.sector}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatValue(stock.stock_price, 'currency')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatValue(stock.market_cap, 'marketCap')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <div className={`flex items-center justify-end ${
                    stock.returns_12m > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.returns_12m > 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {formatValue(stock.returns_12m, 'percentage')}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatValue(stock.pe_ratio)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatValue(stock.dividend_yield_12m, 'percentage')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  {renderQualityBadge(stock.quality_score)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/stocks/${stock.symbol}`, '_blank')}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Próximo
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startItem}</span> até{' '}
                <span className="font-medium">{endItem}</span> de{' '}
                <span className="font-medium">{totalCount}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="outline"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-l-md"
                >
                  Anterior
                </Button>
                
                {/* Páginas */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => onPageChange(pageNum)}
                      className="border-l-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-r-md border-l-0"
                >
                  Próximo
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

