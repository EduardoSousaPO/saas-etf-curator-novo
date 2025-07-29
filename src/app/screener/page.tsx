// src/app/screener/page.tsx
"use client";

import React from "react";
import { useEffect, useState, ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";
import { Filters } from "@/components/screener/Filters";
import ETFDetailCard from "@/components/screener/ETFDetailCard";
import ETFTable from "@/components/screener/ETFTable";
import { FeatureGate, useUsageLimits } from "@/components/subscriptions/FeatureGate";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle, Database, Target, BarChart3, TrendingUp, Eye } from "lucide-react";
import { ETF, ETFDetails, AdvancedFilters } from "@/types/etf";
import { Button } from "@/components/ui/button";


export default function ScreenerPage() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalETFs, setTotalETFs] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Estados para filtros avançados
  const [filters, setFilters] = useState<AdvancedFilters>({
    searchTerm: '',
    assetclass: '',
    onlyComplete: false
  });

  // Estados para ordenação
  const [sortBy, setSortBy] = useState<string>("returns_12m");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Estados para card de detalhes
  const [expandedETF, setExpandedETF] = useState<string | null>(null);
  const [etfDetails, setEtfDetails] = useState<ETFDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const { checkAndExecute, getRemainingUsage } = useUsageLimits();

  // Analytics tracking para filtros mais usados
  const trackFilterUsage = async (filterData: AdvancedFilters) => {
    try {
      const activeFilters = Object.entries(filterData)
        .filter(([key, value]) => {
          if (key === 'searchTerm' || key === 'assetclass') return false;
          return value !== undefined && value !== null && value !== '' && value !== false;
        })
        .map(([key]) => key);

      if (activeFilters.length > 0) {
        // Enviar dados para analytics (implementar endpoint se necessário)
        await fetch('/api/analytics/filter-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filters: activeFilters,
            timestamp: new Date().toISOString(),
            totalFilters: activeFilters.length
          })
        }).catch(err => console.log('Analytics tracking failed:', err));
      }
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  const fetchETFs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [DEBUG] fetchETFs iniciado com estado atual:', { 
        sortBy, 
        sortOrder, 
        currentPage, 
        itemsPerPage 
      });

      // Construir parâmetros da API com todos os filtros avançados
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        onlyComplete: (filters.onlyComplete || false).toString(),
      });

      // Filtros básicos
      if (filters.searchTerm?.trim()) {
        params.append('search_term', filters.searchTerm.trim());
      }
      if (filters.assetclass && filters.assetclass !== '') {
        params.append('assetclass', filters.assetclass);
      }
      if (filters.etfCompany?.trim()) {
        params.append('etf_company', filters.etfCompany.trim());
      }
      if (filters.domicile) {
        params.append('domicile', filters.domicile);
      }
      if (filters.etfType) {
        params.append('etf_type', filters.etfType);
      }

      // Filtros financeiros
      if (filters.totalAssetsMin !== undefined && filters.totalAssetsMin !== null) {
        params.append('total_assets_min', filters.totalAssetsMin.toString());
      }
      if (filters.totalAssetsMax !== undefined && filters.totalAssetsMax !== null) {
        params.append('total_assets_max', filters.totalAssetsMax.toString());
      }
      if (filters.expenseRatioMin !== undefined && filters.expenseRatioMin !== null) {
        params.append('expense_ratio_min', filters.expenseRatioMin.toString());
      }
      if (filters.expenseRatioMax !== undefined && filters.expenseRatioMax !== null) {
        params.append('expense_ratio_max', filters.expenseRatioMax.toString());
      }
      if (filters.navMin !== undefined && filters.navMin !== null) {
        params.append('nav_min', filters.navMin.toString());
      }
      if (filters.navMax !== undefined && filters.navMax !== null) {
        params.append('nav_max', filters.navMax.toString());
      }
      if (filters.volumeMin !== undefined && filters.volumeMin !== null) {
        params.append('volume_min', filters.volumeMin.toString());
      }
      if (filters.volumeMax !== undefined && filters.volumeMax !== null) {
        params.append('volume_max', filters.volumeMax.toString());
      }
      if (filters.holdingsCountMin !== undefined && filters.holdingsCountMin !== null) {
        params.append('holdings_count_min', filters.holdingsCountMin.toString());
      }
      if (filters.holdingsCountMax !== undefined && filters.holdingsCountMax !== null) {
        params.append('holdings_count_max', filters.holdingsCountMax.toString());
      }

      // Filtros de performance - Retornos
      if (filters.returns12mMin !== undefined && filters.returns12mMin !== null) {
        params.append('returns_12m_min', filters.returns12mMin.toString());
      }
      if (filters.returns12mMax !== undefined && filters.returns12mMax !== null) {
        params.append('returns_12m_max', filters.returns12mMax.toString());
      }
      if (filters.returns24mMin !== undefined && filters.returns24mMin !== null) {
        params.append('returns_24m_min', filters.returns24mMin.toString());
      }
      if (filters.returns24mMax !== undefined && filters.returns24mMax !== null) {
        params.append('returns_24m_max', filters.returns24mMax.toString());
      }
      if (filters.returns36mMin !== undefined && filters.returns36mMin !== null) {
        params.append('returns_36m_min', filters.returns36mMin.toString());
      }
      if (filters.returns36mMax !== undefined && filters.returns36mMax !== null) {
        params.append('returns_36m_max', filters.returns36mMax.toString());
      }
      if (filters.returns5yMin !== undefined && filters.returns5yMin !== null) {
        params.append('returns_5y_min', filters.returns5yMin.toString());
      }
      if (filters.returns5yMax !== undefined && filters.returns5yMax !== null) {
        params.append('returns_5y_max', filters.returns5yMax.toString());
      }

      // Filtros de performance - Volatilidade
      if (filters.volatility12mMin !== undefined && filters.volatility12mMin !== null) {
        params.append('volatility_12m_min', filters.volatility12mMin.toString());
      }
      if (filters.volatility12mMax !== undefined && filters.volatility12mMax !== null) {
        params.append('volatility_12m_max', filters.volatility12mMax.toString());
      }
      if (filters.volatility24mMin !== undefined && filters.volatility24mMin !== null) {
        params.append('volatility_24m_min', filters.volatility24mMin.toString());
      }
      if (filters.volatility24mMax !== undefined && filters.volatility24mMax !== null) {
        params.append('volatility_24m_max', filters.volatility24mMax.toString());
      }
      if (filters.volatility36mMin !== undefined && filters.volatility36mMin !== null) {
        params.append('volatility_36m_min', filters.volatility36mMin.toString());
      }
      if (filters.volatility36mMax !== undefined && filters.volatility36mMax !== null) {
        params.append('volatility_36m_max', filters.volatility36mMax.toString());
      }
      if (filters.volatility5yMin !== undefined && filters.volatility5yMin !== null) {
        params.append('volatility_5y_min', filters.volatility5yMin.toString());
      }
      if (filters.volatility5yMax !== undefined && filters.volatility5yMax !== null) {
        params.append('volatility_5y_max', filters.volatility5yMax.toString());
      }

      // Filtros de performance - Sharpe Ratio
      if (filters.sharpe12mMin !== undefined && filters.sharpe12mMin !== null) {
        params.append('sharpe_12m_min', filters.sharpe12mMin.toString());
      }
      if (filters.sharpe12mMax !== undefined && filters.sharpe12mMax !== null) {
        params.append('sharpe_12m_max', filters.sharpe12mMax.toString());
      }
      if (filters.sharpe24mMin !== undefined && filters.sharpe24mMin !== null) {
        params.append('sharpe_24m_min', filters.sharpe24mMin.toString());
      }
      if (filters.sharpe24mMax !== undefined && filters.sharpe24mMax !== null) {
        params.append('sharpe_24m_max', filters.sharpe24mMax.toString());
      }
      if (filters.sharpe36mMin !== undefined && filters.sharpe36mMin !== null) {
        params.append('sharpe_36m_min', filters.sharpe36mMin.toString());
      }
      if (filters.sharpe36mMax !== undefined && filters.sharpe36mMax !== null) {
        params.append('sharpe_36m_max', filters.sharpe36mMax.toString());
      }
      if (filters.sharpe5yMin !== undefined && filters.sharpe5yMin !== null) {
        params.append('sharpe_5y_min', filters.sharpe5yMin.toString());
      }
      if (filters.sharpe5yMax !== undefined && filters.sharpe5yMax !== null) {
        params.append('sharpe_5y_max', filters.sharpe5yMax.toString());
      }

      // Filtros de risco
      if (filters.maxDrawdownMin !== undefined && filters.maxDrawdownMin !== null) {
        params.append('max_drawdown_min', filters.maxDrawdownMin.toString());
      }
      if (filters.maxDrawdownMax !== undefined && filters.maxDrawdownMax !== null) {
        params.append('max_drawdown_max', filters.maxDrawdownMax.toString());
      }

      // Filtros de dividendos
      if (filters.dividendYieldMin !== undefined && filters.dividendYieldMin !== null) {
        params.append('dividend_yield_min', filters.dividendYieldMin.toString());
      }
      if (filters.dividendYieldMax !== undefined && filters.dividendYieldMax !== null) {
        params.append('dividend_yield_max', filters.dividendYieldMax.toString());
      }
      if (filters.dividends12mMin !== undefined && filters.dividends12mMin !== null) {
        params.append('dividends_12m_min', filters.dividends12mMin.toString());
      }
      if (filters.dividends12mMax !== undefined && filters.dividends12mMax !== null) {
        params.append('dividends_12m_max', filters.dividends12mMax.toString());
      }
      if (filters.dividends24mMin !== undefined && filters.dividends24mMin !== null) {
        params.append('dividends_24m_min', filters.dividends24mMin.toString());
      }
      if (filters.dividends24mMax !== undefined && filters.dividends24mMax !== null) {
        params.append('dividends_24m_max', filters.dividends24mMax.toString());
      }
      if (filters.dividends36mMin !== undefined && filters.dividends36mMin !== null) {
        params.append('dividends_36m_min', filters.dividends36mMin.toString());
      }
      if (filters.dividends36mMax !== undefined && filters.dividends36mMax !== null) {
        params.append('dividends_36m_max', filters.dividends36mMax.toString());
      }

      // Filtros de categorização
      if (filters.sizeCategory) {
        params.append('size_category', filters.sizeCategory);
      }
      if (filters.liquidityCategory) {
        params.append('liquidity_category', filters.liquidityCategory);
      }
      if (filters.liquidityRating) {
        params.append('liquidity_rating', filters.liquidityRating);
      }

      // Filtros temporais
      if (filters.inceptionDateAfter) {
        params.append('inception_date_after', filters.inceptionDateAfter);
      }
      if (filters.inceptionDateBefore) {
        params.append('inception_date_before', filters.inceptionDateBefore);
      }
      if (filters.etfAgeMinYears !== undefined && filters.etfAgeMinYears !== null) {
        params.append('etf_age_min_years', filters.etfAgeMinYears.toString());
      }
      if (filters.etfAgeMaxYears !== undefined && filters.etfAgeMaxYears !== null) {
        params.append('etf_age_max_years', filters.etfAgeMaxYears.toString());
      }

      // Filtros de qualidade (switches)
      if (filters.highQualityOnly) {
        params.append('high_quality_only', 'true');
      }
      if (filters.lowCostOnly) {
        params.append('low_cost_only', 'true');
      }
      if (filters.highLiquidityOnly) {
        params.append('high_liquidity_only', 'true');
      }

      // Presets
      if (filters.filterPreset) {
        params.append('filter_preset', filters.filterPreset);
      }
      if (filters.sortPreset) {
        params.append('sort_preset', filters.sortPreset);
      }

      // Adicionar parâmetros de ordenação
      if (sortBy) {
        params.append('sort_by', sortBy);
        console.log('📤 [DEBUG] Adicionado sort_by:', sortBy);
      }
      if (sortOrder) {
        params.append('sort_order', sortOrder);
        console.log('📤 [DEBUG] Adicionado sort_order:', sortOrder);
      }
      
      const finalUrl = `/api/etfs/screener?${params.toString()}`;
      console.log('🌐 [DEBUG] URL final da API:', finalUrl);

      const response = await fetch(finalUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar ETFs');
      }

      setEtfs(data.etfs || []);
      setTotalPages(data.totalPages || 1);
      setTotalETFs(data.totalCount || 0);

      // Track filter usage para analytics
      trackFilterUsage(filters);
      
    } catch (err) {
      console.error("Erro ao buscar ETFs:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setEtfs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchETFDetails = async (symbol: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/etfs/details/${symbol}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar detalhes do ETF");
      }

      setEtfDetails(data.data);
      setExpandedETF(symbol);
    } catch (err) {
      console.error("Erro ao buscar detalhes do ETF:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar detalhes");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleETFClick = (symbol: string) => {
    if (expandedETF === symbol) {
      // Se já está expandido, fechar
      setExpandedETF(null);
      setEtfDetails(null);
    } else {
      // Buscar detalhes e expandir
      fetchETFDetails(symbol);
    }
  };

  const handleCloseDetails = () => {
    setExpandedETF(null);
    setEtfDetails(null);
  };

  const handleFilterChange = (newFilters: AdvancedFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página quando filtros mudam
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchETFs();
  };

  const handleSort = (field: string, order: string) => {
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1); // Reset para primeira página
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    console.log('📥 [DEBUG] handleSortChange recebido:', { sortBy, sortOrder });
    setSortBy(sortBy);
    setSortOrder(sortOrder as "asc" | "desc");
    setCurrentPage(1); // Reset para primeira página
    console.log('📥 [DEBUG] Estado atualizado, useEffect vai disparar fetchETFs');
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página quando muda itens por página
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Buscar ETFs quando página ou ordenação mudarem (não filtros, que são manuais agora)
  useEffect(() => {
    console.log('🔄 [DEBUG] useEffect fetchETFs disparado por mudança em:', { currentPage, sortBy, sortOrder, itemsPerPage });
    fetchETFs();
  }, [currentPage, sortBy, sortOrder, itemsPerPage]);

  const remainingQueries = getRemainingUsage('screener_queries');

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      
        <div className="max-w-7xl mx-auto px-6 py-12">
          

          
          {/* Header Tesla-style */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-light text-[#202636] mb-6 leading-tight">
              ETF
              <span className="block text-[#0090d8]">Screener</span>
            </h1>
            <p className="text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubra os ETFs perfeitos para sua carteira usando filtros avançados 
              e análise científica de mais de 1.370 fundos globais.
            </p>
            
            {/* Stats Tesla-style */}
            <div className="flex flex-wrap justify-center gap-12 mt-12">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-[#0090d8]" />
                </div>
                <div>
                  <div className="text-2xl font-light text-[#202636]">1.370+</div>
                  <div className="text-sm text-gray-600">ETFs Analisados</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#0090d8]" />
                </div>
                <div>
                  <div className="text-2xl font-light text-[#202636]">50+</div>
                  <div className="text-sm text-gray-600">Filtros Avançados</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#0090d8]" />
                </div>
                <div>
                  <div className="text-2xl font-light text-[#202636]">96.5%</div>
                  <div className="text-sm text-gray-600">Dados Completos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sistema de Filtros Avançados */}
          <div className="mb-8">
                <Filters 
              filters={filters}
              onFiltersChange={handleFilterChange}
              onSearch={handleSearch}
              onSortChange={handleSortChange}
              isLoading={loading}
              totalResults={totalETFs}
                />
          </div>

          {/* Alertas */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Estatísticas de Resultados */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {totalETFs.toLocaleString()} ETFs encontrados
              </Badge>
              {remainingQueries !== null && (
                <Badge variant="secondary" className="text-sm">
                    {remainingQueries} consultas restantes
                  </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Itens por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
                </div>
              </div>

            {/* Tabela de ETFs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <ETFTable 
                    etfs={etfs}
              loading={loading}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
                    onETFClick={handleETFClick}
              expandedETF={expandedETF}
            />
                </div>
                
          {/* Card de Detalhes */}
          {expandedETF && etfDetails && (
            <div className="mt-8">
                  <ETFDetailCard 
                    etf={etfDetails}
                    onClose={handleCloseDetails}
                loading={loadingDetails}
              />
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={loading}
                      className="w-10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
                  <Button 
                    variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                  >
                Próxima
                <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
            )}
        </div>
      </div>
    </RequireAuth>
  );
}

