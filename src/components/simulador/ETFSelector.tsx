"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, Shield } from 'lucide-react';

interface ETF {
  symbol: string;
  name?: string | null;
  assetclass?: string | null;
  etfcompany?: string | null;
  returns_12m?: number | null;
  volatility_12m?: number | null;
  sharpe_12m?: number | null;
  expense_ratio?: number | null;
}

interface ETFSelectorProps {
  onSelectETF: (etf: ETF) => void;
  selectedSymbols: string[];
  maxSelections: number;
}

export default function ETFSelector({ onSelectETF, selectedSymbols, maxSelections }: ETFSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ETF[]>([]);
  const [popularETFs, setPopularETFs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Carregar ETFs populares ao montar o componente
  useEffect(() => {
    loadPopularETFs();
  }, []);

  // Buscar ETFs quando o termo de busca muda
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchETFs();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const loadPopularETFs = async () => {
    try {
      const response = await fetch('/api/etfs/popular');
      if (response.ok) {
        const data = await response.json();
        setPopularETFs(data.etfs?.slice(0, 8) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar ETFs populares:', error);
      // Fallback para ETFs conhecidos
      setPopularETFs([
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', assetclass: 'Equity' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', assetclass: 'Equity' },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetclass: 'Equity' },
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetclass: 'Fixed Income' }
      ]);
    }
  };

  const searchETFs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/etfs/screener?search=${encodeURIComponent(searchTerm)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.etfs || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Erro ao buscar ETFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectETF = (etf: ETF) => {
    if (selectedSymbols.includes(etf.symbol)) return;
    if (selectedSymbols.length >= maxSelections) return;
    
    onSelectETF(etf);
    setSearchTerm('');
    setShowResults(false);
  };

  const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  // CORREÇÃO: Os dados já vêm em formato percentual do banco
  return `${Number(value).toFixed(2)}%`;
};

  const getReturnColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const ETFCard = ({ etf, isSelected, onSelect }: { etf: ETF; isSelected: boolean; onSelect: () => void }) => (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
      onClick={isSelected ? undefined : onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-gray-900">{etf.symbol}</h4>
            {etf.assetclass && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {etf.assetclass}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate mt-1">{etf.name}</p>
          
          {/* Métricas */}
          <div className="flex items-center space-x-4 mt-2 text-xs">
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              <span className={getReturnColor(etf.returns_12m)}>
                {formatPercentage(etf.returns_12m)}
              </span>
            </div>
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1 text-orange-600" />
              <span className="text-gray-600">
                Vol: {formatPercentage(etf.volatility_12m)}
              </span>
            </div>
            {etf.sharpe_12m && (
              <div className="text-gray-600">
                Sharpe: {etf.sharpe_12m.toFixed(2)}
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-3">
          {isSelected ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600">✓</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700">
              <Plus className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ETFs por símbolo ou nome (ex: SPY, QQQ)..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={selectedSymbols.length >= maxSelections}
          />
        </div>
        
        {/* Resultados da busca */}
        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2">Buscando...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2 space-y-2">
                {searchResults.map((etf) => (
                  <ETFCard
                    key={etf.symbol}
                    etf={etf}
                    isSelected={selectedSymbols.includes(etf.symbol)}
                    onSelect={() => handleSelectETF(etf)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Nenhum ETF encontrado
              </div>
            )}
          </div>
        )}
      </div>

      {/* ETFs Populares */}
      {!showResults && popularETFs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">ETFs Populares</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularETFs.map((etf) => (
              <ETFCard
                key={etf.symbol}
                etf={etf}
                isSelected={selectedSymbols.includes(etf.symbol)}
                onSelect={() => handleSelectETF(etf)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {selectedSymbols.length >= maxSelections && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Limite máximo de {maxSelections} ETFs atingido. Remova um ETF para adicionar outro.
          </p>
        </div>
      )}
    </div>
  );
} 