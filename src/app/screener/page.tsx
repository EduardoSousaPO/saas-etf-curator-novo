// src/app/screener/page.tsx
"use client";

import React from "react";
import { useEffect, useState, ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";
import Filters from "@/components/screener/Filters";
import ETFDetailCard from "@/components/screener/ETFDetailCard";
import ETFTable from "@/components/screener/ETFTable";
import { FeatureGate, useUsageLimits } from "@/components/subscriptions/FeatureGate";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle, Database, Target, BarChart3, TrendingUp, Eye } from "lucide-react";
import { ETF, ETFDetails } from "@/types/etf";
import { Button } from "@/components/ui/button";

interface FilterValues {
  searchTerm?: string;
  assetclass?: string;
  totalAssetsMin?: number;
  totalAssetsMax?: number;
  returns_12m_min?: number;
  sharpe_12m_min?: number;
  dividend_yield_min?: number;
  onlyComplete: boolean;
}

export default function ScreenerPage() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalETFs, setTotalETFs] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Estados para filtros e ordenação
  const [filters, setFilters] = useState<FilterValues>({
    onlyComplete: false
  });

  // Estados para ordenação
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Estados para card de detalhes
  const [expandedETF, setExpandedETF] = useState<string | null>(null);
  const [etfDetails, setEtfDetails] = useState<ETFDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const { checkAndExecute, getRemainingUsage } = useUsageLimits();

  const fetchETFs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir parâmetros da API
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(), // Usar itemsPerPage como limit
        onlyComplete: filters.onlyComplete.toString(),
      });

      // Adicionar parâmetros de busca se existirem
      if (filters.searchTerm?.trim()) {
        params.append('search_term', filters.searchTerm.trim());
      }

      if (filters.assetclass && filters.assetclass !== 'all') {
        params.append('assetclass_filter', filters.assetclass);
      }

      // Filtros avançados PRO
      if (filters.totalAssetsMin !== undefined) {
        params.append('totalAssetsMin', filters.totalAssetsMin.toString());
      }
      if (filters.totalAssetsMax !== undefined) {
        params.append('totalAssetsMax', filters.totalAssetsMax.toString());
      }
      if (filters.returns_12m_min !== undefined) {
        params.append('returns_12m_min', filters.returns_12m_min.toString());
      }
      if (filters.sharpe_12m_min !== undefined) {
        params.append('sharpe_12m_min', filters.sharpe_12m_min.toString());
      }
      if (filters.dividend_yield_min !== undefined) {
        params.append('dividend_yield_min', filters.dividend_yield_min.toString());
      }

      // Adicionar parâmetros de ordenação
      if (sortBy) {
        params.append('sort_by', sortBy);
      }
      if (sortOrder) {
        params.append('sort_order', sortOrder);
      }

  

      const response = await fetch(`/api/etfs/screener?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar ETFs');
      }

      setEtfs(data.etfs || []);
      setTotalPages(data.totalPages || 1);
      setTotalETFs(data.totalCount || 0);
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

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página quando filtros mudam
  };

  const handleSort = (field: string, order: string) => {
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1); // Reset para primeira página
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página quando muda itens por página
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Buscar ETFs quando filtros, página ou ordenação mudarem
  useEffect(() => {
    fetchETFs();
  }, [currentPage, filters, sortBy, sortOrder, itemsPerPage]);

  // Buscar ETFs na montagem inicial
  useEffect(() => {
    fetchETFs();
  }, []);

  const remainingQueries = getRemainingUsage('screener_queries');

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      
        <div className="max-w-6xl mx-auto px-6 py-20">
          
          {/* Header Tesla-style */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-8 leading-tight">
              ETF
              <span className="block text-blue-600">Screener</span>
            </h1>
            <p className="text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubra os ETFs perfeitos para sua carteira usando filtros avançados 
              e análise científica de mais de 1.370 fundos globais.
            </p>
            
            {/* Stats Tesla-style */}
            <div className="flex flex-wrap justify-center gap-12 mt-16">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-900">1.370+</div>
                  <div className="text-sm text-gray-600">ETFs Analisados</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-900">15+</div>
                  <div className="text-sm text-gray-600">Métricas por ETF</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-900">96.5%</div>
                  <div className="text-sm text-gray-600">Dados Completos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros Tesla-style */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Filter className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">
                    Filtros Avançados
                  </h2>
                  <p className="text-gray-600 font-light">
                    Encontre ETFs baseados em critérios específicos
                  </p>
                </div>
              </div>
              
              <FeatureGate 
                featureKey="screener_filters" 
                fallback={
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Filtros Avançados - Plano PRO
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Acesse filtros por retorno, Sharpe Ratio, dividend yield e muito mais
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
                      Fazer Upgrade
                    </Button>
                  </div>
                }
              >
                <Filters 
                  onFilterChange={handleFilterChange}
                  basicOnly={true}
                  onSortChange={handleSort}
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  currentItemsPerPage={itemsPerPage}
                />
              </FeatureGate>
            </div>
          </div>

          {/* Resultados Tesla-style */}
          <div className="space-y-8">
            {/* Header dos Resultados */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-2">
                  Resultados da Busca
                </h2>
                <p className="text-gray-600 font-light">
                  {totalETFs} ETFs encontrados
                </p>
              </div>
              
              {remainingQueries !== null && (
                <div className="text-right">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {remainingQueries} consultas restantes
                  </Badge>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-light">Analisando ETFs...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-8">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Erro na Busca</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de ETFs */}
            {!loading && !error && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <FeatureGate 
                  featureKey="screener_queries"
                  fallback={
                    <div className="text-center py-20">
                      <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Limite de Consultas Atingido
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Faça upgrade para continuar usando o screener
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
                        Fazer Upgrade
                      </Button>
                    </div>
                  }
                >
                  <ETFTable 
                    etfs={etfs}
                    onETFClick={handleETFClick}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </FeatureGate>
              </div>
            )}

            {/* ETF Details Card */}
            {expandedETF && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">
                        Detalhes do ETF
                      </h3>
                      <p className="text-gray-600 font-light">
                        Análise completa do {expandedETF}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleCloseDetails}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                
                {etfDetails && (
                  <ETFDetailCard 
                    etf={etfDetails}
                    onClose={handleCloseDetails}
                  />
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && etfs.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20">
                <div className="text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum ETF Encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar os filtros para encontrar ETFs que atendam aos seus critérios
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ onlyComplete: false })}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

