// src/app/screener/page.tsx
"use client";

import React from "react";
import { useEffect, useState, ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";
import Filters from "@/components/screener/Filters";
import ETFDetailCard from "@/components/screener/ETFDetailCard";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface ETF {
  id?: string;
  symbol: string;
  name?: string | null;
  assetclass?: string | null;
  // exchange?: string | null; // Removido - coluna não existe no banco
  [key: string]: any;
}

interface FilterValues {
  searchTerm?: string;
  assetclass?: string;
  // exchange?: string; // Removido - coluna não existe no banco
  totalAssetsMin?: number;
  totalAssetsMax?: number;
  returns_12m_min?: number;
  sharpe_12m_min?: number;
  dividend_yield_min?: number;
  onlyComplete?: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function ScreenerPage() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [debug, setDebug] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [expandedETF, setExpandedETF] = useState<string | null>(null);

  useEffect(() => {
    fetchEtfs(1);
  }, [filters, itemsPerPage]);

  async function fetchEtfs(page: number = 1) {
    try {
      setLoading(true);
      let url = `/api/etfs/screener?page=${page}&limit=${itemsPerPage}`;
      
      // Adicionar filtros à URL se existirem
      if (filters.searchTerm) {
        url += `&search_term=${encodeURIComponent(filters.searchTerm)}`;
      }
      
      if (filters.assetclass && filters.assetclass !== "all") {
        url += `&assetclass_filter=${encodeURIComponent(filters.assetclass)}`;
      }
      
      // if (filters.exchange && filters.exchange !== "all") {
      //   url += `&exchange_filter=${encodeURIComponent(filters.exchange)}`;
      // } // Removido - coluna não existe no banco
      
      // Adicionar outros filtros conforme necessário
      if (filters.totalAssetsMin) {
        url += `&assets_min=${filters.totalAssetsMin}`;
      }
      
      if (filters.totalAssetsMax && filters.totalAssetsMax < 1000) {
        url += `&assets_max=${filters.totalAssetsMax}`;
      }
      
      if (filters.returns_12m_min && filters.returns_12m_min > -50) {
        url += `&return_12m_min=${filters.returns_12m_min}`;
      }
      
      if (filters.sharpe_12m_min && filters.sharpe_12m_min > -2) {
        url += `&sharpe_12m_min=${filters.sharpe_12m_min}`;
      }
      
      if (filters.dividend_yield_min && filters.dividend_yield_min > 0) {
        url += `&dividend_yield_min=${filters.dividend_yield_min}`;
      }
      
      if (filters.onlyComplete) {
        url += `&only_complete=true`;
      }
      
      setDebug(`URL: ${url}`);
      console.log("Fetching URL:", url); // Debug log

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Falha ao buscar os ETFs");
      }
      const data = await response.json();
      console.log("Response data:", data); // Debug log
      
      setEtfs(data.etfs || []);
      setPagination({
        currentPage: page,
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0
      });
      setDebug(prev => `${prev}\nEncontrados: ${data.etfs.length} de ${data.totalCount}`);
    } catch (err: any) {
      console.error("Erro ao buscar ETFs:", err);
      setError(err.message || "Ocorreu um erro ao carregar os dados");
      setDebug(prev => `${prev}\nErro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    console.log("Applying filters:", newFilters); // Debug log
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchEtfs(newPage);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Função para gerar botões de paginação (não utilizada atualmente)
  const _renderPaginationButtons = (): ReactNode[] => {
    const { currentPage, totalPages } = pagination;
    const buttons: ReactNode[] = [];
    
    // Botão Anterior
    buttons.push(
      <button 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded mr-1 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
      >
        &laquo;
      </button>
    );
    
    // Mostrar no máximo 5 botões de página
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    // Primeira página se estiver muito distante
    if (startPage > 1) {
      buttons.push(
        <button 
          key="1" 
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 border rounded mr-1 dark:bg-gray-700 dark:border-gray-600"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }
    
    // Páginas ao redor da página atual
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded mr-1 ${
            i === currentPage 
              ? 'bg-blue-600 text-white dark:bg-blue-800' 
              : 'dark:bg-gray-700 dark:border-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Última página se estiver muito distante
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      buttons.push(
        <button 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 border rounded mr-1 dark:bg-gray-700 dark:border-gray-600"
        >
          {totalPages}
        </button>
      );
    }
    
    // Botão Próximo
    buttons.push(
      <button 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
      >
        &raquo;
      </button>
    );
    
    return buttons;
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">
                ETF Screener
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-light">
              Encontre ETFs que correspondam aos seus critérios de investimento usando nossos filtros avançados.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24">
        <div className="w-full px-2">
          {debug && (
            <div className="text-xs bg-gray-100 dark:bg-gray-900 p-4 mb-6 border border-gray-200 dark:border-gray-800 overflow-auto max-h-40">
              <pre className="text-gray-700 dark:text-gray-300">{debug}</pre>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">Filtros</h2>
                </div>
                <Filters onFilterChange={handleFilterChange} />
              </div>
            </div>
            
            {/* Results Area */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                  <div className="text-xl text-gray-600 dark:text-gray-400 font-light">Carregando ETFs...</div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="text-xl text-red-600 dark:text-red-400 font-light">{error}</div>
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 mb-6 flex justify-between items-center">
                    <div className="text-gray-900 dark:text-white">
                      <span className="font-light">Encontrados: </span>
                      <span className="font-medium">{pagination.totalCount}</span>
                      <span className="font-light"> ETFs</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label htmlFor="itemsPerPage" className="text-sm text-gray-600 dark:text-gray-400 font-light">
                        Por página:
                      </label>
                      <select 
                        id="itemsPerPage" 
                        value={itemsPerPage} 
                        onChange={handleItemsPerPageChange}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 px-3 py-1 text-gray-900 dark:text-white focus:outline-none focus:border-gray-900 dark:focus:border-white"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Results Table */}
                  <div className="overflow-x-auto w-full">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                          <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">Símbolo</th>
                          <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[320px]">Nome</th>
                          <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[180px]">Asset Class</th>
                          <th className="py-4 px-6 text-right text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px]">Retorno 12m</th>
                          <th className="py-4 px-6 text-right text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px]">Sharpe 12m</th>
                          <th className="py-4 px-6 text-right text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[160px]">Dividendos 12m</th>
                          <th className="py-4 px-6 text-right text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px]">Total Assets (M)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {etfs.length > 0 ? (
                          etfs.map((etf) => (
                            <React.Fragment key={etf.id || etf.symbol}>
                              <tr
                                className={
                                  "border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950 cursor-pointer transition-colors" +
                                  (expandedETF === etf.symbol ? " bg-blue-50 dark:bg-blue-950" : "")
                                }
                                onClick={() => setExpandedETF(expandedETF === etf.symbol ? null : etf.symbol)}
                              >
                                <td className="py-4 px-6 font-medium text-gray-900 dark:text-white break-words whitespace-normal">{etf.symbol}</td>
                                <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-light break-words whitespace-normal">{etf.name || "N/A"}</td>
                                <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-light break-words whitespace-normal">{etf.assetclass || "N/A"}</td>
                              <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-400 font-light">
                                {etf.returns_12m !== null && etf.returns_12m !== undefined ? `${Number(etf.returns_12m).toFixed(2)}%` : "N/A"}
                              </td>
                              <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-400 font-light">
                                {etf.sharpe_12m !== null && etf.sharpe_12m !== undefined ? Number(etf.sharpe_12m).toFixed(2) : "N/A"}
                              </td>
                              <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-400 font-light">
                                {etf.dividends_12m !== null && etf.dividends_12m !== undefined ? `$${Number(etf.dividends_12m).toFixed(2)}` : "N/A"}
                              </td>
                              <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-400 font-light">
                                {etf.total_assets !== null && etf.total_assets !== undefined ? `$${(Number(etf.total_assets) / 1_000_000).toFixed(1)}M` : "N/A"}
                              </td>
                            </tr>
                              {expandedETF === etf.symbol && (
                                <tr>
                                  <td colSpan={7} className="p-0">
                                    <div className="p-6">
                                      <ETFDetailCard
                                        details={etf}
                                        onClose={() => setExpandedETF(null)}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-gray-600 dark:text-gray-400 font-light">
                              Nenhum ETF encontrado com os filtros aplicados.<br />
                              {filters.onlyComplete && (
                                <span className="block text-xs text-blue-600 dark:text-blue-300 mt-2">Tente desmarcar "Apenas ETFs com dados completos" para ver todos os ETFs disponíveis.</span>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center space-x-2">
                      <button 
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <span className="text-gray-600 dark:text-gray-400 font-light px-4">
                        Página {pagination.currentPage} de {pagination.totalPages}
                      </span>
                      
                      <button 
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        </section>
      </div>
    </RequireAuth>
  );
}

