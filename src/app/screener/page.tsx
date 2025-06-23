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
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
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

      // Adicionar parâmetros de ordenação
      if (sortBy) {
        params.append('sort_by', sortBy);
      }
      if (sortOrder) {
        params.append('sort_order', sortOrder);
      }

      console.log('🔍 Buscando ETFs com parâmetros:', params.toString());

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
      <div className="min-h-screen bg-white">
        <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-white">
        <div className="max-w-[95vw] mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Search className="w-8 h-8 text-blue-600" />
              <h1 className="text-5xl md:text-6xl font-light text-gray-900">
                ETF Screener
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Encontre ETFs que correspondam aos seus critérios de investimento usando nossos filtros avançados.
            </p>
            
            {/* Indicador de uso */}
            <FeatureGate 
              featureKey="screener_advanced" 
              fallback={
                <Alert className="mt-6 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Filtros avançados disponíveis apenas no plano PRO.
                  </AlertDescription>
                </Alert>
              }
            >
              <div className="mt-6">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Filter className="w-3 h-3 mr-1" />
                  Screener Ativo
                </Badge>
                {remainingQueries !== null && (
                  <div className="mt-2 text-sm text-gray-600">
                    {remainingQueries} consultas avançadas restantes hoje
                  </div>
                )}
              </div>
            </FeatureGate>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Sidebar com Filtros */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <FeatureGate 
                  featureKey="screener_advanced"
                  requiredPlan="PRO"
                  fallback={
                    <Filters
                      onFilterChange={handleFilterChange}
                      basicOnly={true}
                      onSortChange={handleSort}
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onItemsPerPageChange={handleItemsPerPageChange}
                      currentItemsPerPage={itemsPerPage}
                    />
                  }
                >
                  <Filters
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSort}
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    currentItemsPerPage={itemsPerPage}
                  />
                </FeatureGate>
              </div>
            </div>

            {/* Área Principal */}
            <div className="lg:col-span-4 space-y-6">
              {/* Estatísticas */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Screener de ETFs
                    </h3>
                    <p className="text-gray-600">
                      {loading ? "Carregando..." : `${totalETFs} ETFs encontrados • Mostrando ${itemsPerPage} por página`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Página</div>
                    <div className="text-lg font-semibold">
                      {currentPage} de {totalPages}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Tabela de ETFs */}
              <div className="bg-white rounded-lg border">
                <ETFTable
                  etfs={etfs}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onETFClick={handleETFClick}
                />
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalETFs)} de {totalETFs} ETFs
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando ETFs...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Card de Detalhes */}
      {etfDetails && (
        <ETFDetailCard
          etf={etfDetails}
          onClose={handleCloseDetails}
        />
      )}

      {/* Loading de detalhes */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Carregando detalhes...</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </RequireAuth>
  );
}

