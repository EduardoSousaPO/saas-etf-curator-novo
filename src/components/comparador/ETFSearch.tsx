"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';

interface ETF {
  symbol: string;
  name?: string | null;
  assetclass?: string | null;
  etfcompany?: string | null;
  expense_ratio?: number | null;
  returns_12m?: number | null;
  volatility_12m?: number | null;
  sharpe_12m?: number | null;
  dividend_yield?: number | null;
  nav?: number | null;
}

interface ETFSearchProps {
  onSelectETF: (etf: ETF) => void;
  selectedSymbols: string[];
  maxSelections?: number;
  placeholder?: string;
}

export default function ETFSearch({ 
  onSelectETF, 
  selectedSymbols, 
  maxSelections = 4,
  placeholder = "Buscar ETFs por símbolo ou nome..."
}: ETFSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Buscar ETFs
  const searchETFs = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/etfs/screener?search_term=${encodeURIComponent(term)}&limit=10`);
      if (!response.ok) throw new Error('Erro ao buscar ETFs');
      
      const data = await response.json();
      const results = data.etfs || [];
      
      // Filtrar ETFs já selecionados
      const filteredResults = results.filter((etf: ETF) => 
        !selectedSymbols.includes(etf.symbol)
      );
      
      setSearchResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchETFs(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSymbols]);

  // Fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectETF = (etf: ETF) => {
    if (selectedSymbols.length >= maxSelections) {
      alert(`Máximo de ${maxSelections} ETFs para comparação`);
      return;
    }

    onSelectETF(etf);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Campo de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          disabled={selectedSymbols.length >= maxSelections}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Mensagem de limite atingido */}
      {selectedSymbols.length >= maxSelections && (
        <p className="mt-2 text-sm text-amber-600">
          Limite de {maxSelections} ETFs atingido. Remova um ETF para adicionar outro.
        </p>
      )}

      {/* Resultados da busca */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {searchResults.map((etf) => (
            <div
              key={etf.symbol}
              onClick={() => handleSelectETF(etf)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{etf.symbol}</h3>
                    {etf.assetclass && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {etf.assetclass}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">{etf.name}</p>
                  
                  {/* Métricas rápidas */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Retorno 12m</p>
                      <p className={`font-medium ${(etf.returns_12m || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(etf.returns_12m)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Volatilidade</p>
                      <p className="font-medium text-gray-700">{formatPercentage(etf.volatility_12m)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Sharpe</p>
                      <p className="font-medium text-gray-700">{etf.sharpe_12m?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {etf.etfcompany && (
                    <p className="text-xs text-gray-400 mt-1">{etf.etfcompany}</p>
                  )}
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  <Plus className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado de busca vazia */}
      {showResults && searchTerm.length >= 2 && searchResults.length === 0 && !loading && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            Nenhum ETF encontrado para "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
} 