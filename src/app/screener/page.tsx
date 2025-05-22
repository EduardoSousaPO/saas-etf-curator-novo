// src/app/screener/page.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import Filters from "@/components/screener/Filters";

interface ETF {
  id?: string;
  symbol: string;
  name?: string | null;
  category?: string | null;
  exchange?: string | null;
  [key: string]: any;
}

interface FilterValues {
  searchTerm?: string;
  category?: string;
  exchange?: string;
  totalAssetsMin?: number;
  totalAssetsMax?: number;
  returns_12m_min?: number;
  sharpe_12m_min?: number;
  dividend_yield_min?: number;
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
  const [itemsPerPage, setItemsPerPage] = useState(20);

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
      
      if (filters.category && filters.category !== "all") {
        url += `&category_filter=${encodeURIComponent(filters.category)}`;
      }
      
      if (filters.exchange && filters.exchange !== "all") {
        url += `&exchange_filter=${encodeURIComponent(filters.exchange)}`;
      }
      
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

  // Função para gerar botões de paginação
  const renderPaginationButtons = (): ReactNode[] => {
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">ETF Screener</h1>
      
      {debug && (
        <div className="text-xs bg-slate-100 dark:bg-slate-800 p-2 mb-4 rounded overflow-auto max-h-40">
          <pre>{debug}</pre>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <Filters onFilterChange={handleFilterChange} />
        </div>
        
        <div className="md:col-span-3">
          {loading ? (
            <div className="text-center py-10">Carregando ETFs...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900 p-3 mb-4 rounded flex justify-between items-center">
                <div>
                  Encontrados: <strong>{pagination.totalCount}</strong> ETFs
                </div>
                <div className="flex items-center">
                  <label htmlFor="itemsPerPage" className="mr-2 text-sm">ETFs por página:</label>
                  <select 
                    id="itemsPerPage" 
                    value={itemsPerPage} 
                    onChange={handleItemsPerPageChange}
                    className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b dark:border-gray-700 dark:text-gray-200">Símbolo</th>
                      <th className="py-2 px-4 border-b dark:border-gray-700 dark:text-gray-200">Nome</th>
                      <th className="py-2 px-4 border-b dark:border-gray-700 dark:text-gray-200">Categoria</th>
                      <th className="py-2 px-4 border-b dark:border-gray-700 dark:text-gray-200">Bolsa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etfs.length > 0 ? (
                      etfs.map((etf) => (
                        <tr key={etf.id || etf.symbol} className="dark:bg-gray-800 dark:text-gray-200">
                          <td className="py-2 px-4 border-b dark:border-gray-700">{etf.symbol}</td>
                          <td className="py-2 px-4 border-b dark:border-gray-700">{etf.name || "N/A"}</td>
                          <td className="py-2 px-4 border-b dark:border-gray-700">{etf.category || "N/A"}</td>
                          <td className="py-2 px-4 border-b dark:border-gray-700">{etf.exchange || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center dark:text-gray-200">
                          Nenhum ETF encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6 flex-wrap">
                  {renderPaginationButtons()}
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Página {pagination.currentPage} de {pagination.totalPages}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

