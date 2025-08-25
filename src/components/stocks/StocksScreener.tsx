'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StocksFilters } from './StocksFilters';
import { TeslaStockDetailsModal } from './TeslaStockDetailsModal';
import { 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  BarChart3,
  Eye,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  stock_price: number;
  market_cap: number;
  market_cap_formatted: string;
  
  // CAMPOS DE PERFORMANCE - AGORA STRINGS FORMATADAS
  returns_12m: string | null;        // "15.3%" ou null
  returns_24m?: string | null;       // "18.7%" ou null
  volatility_12m: string | null;     // "25.4%" ou null
  sharpe_12m?: string | null;        // "1.25" ou null
  pe_ratio: string | null;           // "18.5" ou null
  pb_ratio?: string | null;          // "3.2" ou null
  roe?: string | null;               // "18.7%" ou null
  roa?: string | null;               // "8.4%" ou null
  dividend_yield_12m: string | null; // "2.1%" ou null
  
  volume_avg_30d?: number;
  quality_score?: number;
  data_completeness?: number;
  last_updated: string;
}

export function StocksScreener() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('returns_12m');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [filters, setFilters] = useState({
    search_term: '',
    sector: '',
    industry: '',
    market_cap_min: null as number | null,
    market_cap_max: null as number | null,
    pe_ratio_min: null as number | null,
    pe_ratio_max: null as number | null,
    dividend_yield_min: null as number | null,
    dividend_yield_max: null as number | null,
    returns_12m_min: null as number | null,
    returns_12m_max: null as number | null,
    volatility_min: null as number | null,
    volatility_max: null as number | null,
    employees_min: null as number | null,
    employees_max: null as number | null,
    size_category: '',
    only_complete: false
  });

  const itemsPerPage = 20;

  useEffect(() => {
    fetchStocks();
  }, [currentPage, sortBy, sortOrder]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validação de parâmetros antes do envio
      const validatedParams = new URLSearchParams({
        page: Math.max(1, currentPage).toString(),
        limit: Math.max(1, Math.min(100, itemsPerPage)).toString(),
        sortBy: ['returns_12m', 'market_cap', 'pe_ratio', 'current_price', 'volatility_12m'].includes(sortBy) ? sortBy : 'returns_12m',
        sortOrder: ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder : 'desc',
      });

      // Adicionar filtros validados
      if (filters.search_term?.trim() && filters.search_term.length >= 2) {
        validatedParams.append('search_term', filters.search_term.trim());
      }
      if (filters.sector?.trim()) {
        validatedParams.append('sector', filters.sector.trim());
      }
      if (filters.industry?.trim()) {
        validatedParams.append('industry', filters.industry.trim());
      }
      if (filters.only_complete) {
        validatedParams.append('only_complete', 'true');
      }

      // Filtros financeiros com validação
      if (filters.market_cap_min !== null && filters.market_cap_min > 0) {
        validatedParams.append('market_cap_min', filters.market_cap_min.toString());
      }
      if (filters.market_cap_max !== null && filters.market_cap_max > 0) {
        validatedParams.append('market_cap_max', filters.market_cap_max.toString());
      }

      // Filtros de performance com validação
      if (filters.returns_12m_min !== null && !isNaN(filters.returns_12m_min)) {
        validatedParams.append('returns_12m_min', filters.returns_12m_min.toString());
      }
      if (filters.returns_12m_max !== null && !isNaN(filters.returns_12m_max)) {
        validatedParams.append('returns_12m_max', filters.returns_12m_max.toString());
      }
      if (filters.volatility_min !== null && !isNaN(filters.volatility_min)) {
        validatedParams.append('volatility_12m_min', filters.volatility_min.toString());
      }
      if (filters.volatility_max !== null && !isNaN(filters.volatility_max)) {
        validatedParams.append('volatility_12m_max', filters.volatility_max.toString());
      }

      // Filtros fundamentais com validação
      if (filters.pe_ratio_min !== null && filters.pe_ratio_min > 0) {
        validatedParams.append('pe_ratio_min', filters.pe_ratio_min.toString());
      }
      if (filters.pe_ratio_max !== null && filters.pe_ratio_max > 0) {
        validatedParams.append('pe_ratio_max', filters.pe_ratio_max.toString());
      }

      // Filtros de dividendos com validação
      if (filters.dividend_yield_min !== null && filters.dividend_yield_min >= 0) {
        validatedParams.append('dividend_yield_min', filters.dividend_yield_min.toString());
      }
      if (filters.dividend_yield_max !== null && filters.dividend_yield_max >= 0) {
        validatedParams.append('dividend_yield_max', filters.dividend_yield_max.toString());
      }

      const response = await fetch(`/api/stocks/screener?${validatedParams}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validação da resposta
      if (!data.success && data.error) {
        throw new Error(data.message || data.error);
      }
      
      console.log('📊 Dados validados recebidos:', {
        stocks: data.stocks?.length || 0,
        totalCount: data.totalCount,
        cached: data.metadata?.cached,
        success: data.success,
        firstStock: data.stocks?.[0]
      });
      
      setStocks(data.stocks || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / itemsPerPage));

    } catch (error) {
      console.error('❌ Erro no fetch de ações:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar ações');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStocks();
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number | null) => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  // RENDERIZAÇÃO COM FALLBACK ADEQUADO
  const renderPerformanceCell = (value: string | null, suffix: string = '') => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 text-sm">N/A</span>;
    }
    
    // Se já tem %, não adicionar suffix
    if (value.includes('%')) {
      return <span className="text-gray-900">{value}</span>;
    }
    
    return <span className="text-gray-900">{value}{suffix}</span>;
  };

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    setShowDetailsModal(true);
  };



  return (
    <div className="space-y-6">
      {/* Filtros Avançados */}
      <StocksFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleSearch}
        onClear={() => {
          setFilters({
            search_term: '',
            sector: '',
            industry: '',
            market_cap_min: null,
            market_cap_max: null,
            pe_ratio_min: null,
            pe_ratio_max: null,
            dividend_yield_min: null,
            dividend_yield_max: null,
            returns_12m_min: null,
            returns_12m_max: null,
            volatility_min: null,
            volatility_max: null,
            employees_min: null,
            employees_max: null,
            size_category: '',
            only_complete: false
          });
          handleSearch();
        }}
        activeCount={Object.values(filters).filter(v => v !== '' && v !== null && v !== false).length}
      />

      {/* Resultados */}
      {error ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar ações</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchStocks}>Tentar Novamente</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Resultados da Busca
              </div>
              <Badge variant="secondary">
                {totalCount.toLocaleString()} ações
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando ações...</p>
              </div>
            ) : stocks.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma ação encontrada</h3>
                <p className="text-gray-600">Tente ajustar os filtros para encontrar mais resultados.</p>
              </div>
            ) : (
              <>
                {/* Tabela de Resultados */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-900">Ação</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-900">Preço</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-900">Market Cap</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-900">Retorno 12m</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-900">P/E</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-900">Div. Yield</th>
                        <th className="text-center py-3 px-2 font-medium text-gray-900">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stocks.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div>
                              <div className="font-semibold text-gray-900">{stock.symbol}</div>
                              <div className="text-sm text-gray-600 truncate max-w-xs">
                                {stock.company_name}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {stock.sector}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="font-semibold">
                              {formatCurrency(stock.stock_price)}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="font-medium">
                              {formatMarketCap(stock.market_cap)}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right" data-testid="performance-cell">
                            <div className={`font-semibold ${
                              stock.returns_12m && stock.returns_12m.includes('-') ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {renderPerformanceCell(stock.returns_12m)}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right" data-testid="performance-cell">
                            <div className="font-medium">
                              {renderPerformanceCell(stock.pe_ratio, 'x')}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right" data-testid="performance-cell">
                            <div className="font-medium">
                              {renderPerformanceCell(stock.dividend_yield_12m)}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStockClick(stock.symbol)}
                                className="flex items-center gap-1"
                              >
                                <Info className="w-4 h-4" />
                                Detalhes
                              </Button>

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages} ({totalCount.toLocaleString()} ações)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || loading}
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Modal de Detalhes da Ação */}
      {selectedStock && (
        <TeslaStockDetailsModal
          symbol={selectedStock}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStock(null);
          }}
        />
      )}
    </div>
  );
}