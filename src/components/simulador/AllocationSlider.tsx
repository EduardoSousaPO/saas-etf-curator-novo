"use client";

import React from 'react';
import { X, TrendingUp, Shield, DollarSign } from 'lucide-react';

interface ETFAllocation {
  symbol: string;
  name: string;
  weight: number;
  assetclass?: string;
  returns_12m?: number;
  volatility_12m?: number;
  sharpe_12m?: number;
  expense_ratio?: number;
}

interface AllocationSliderProps {
  allocation: ETFAllocation;
  onWeightChange: (symbol: string, weight: number) => void;
  onRemove: (symbol: string) => void;
}

export default function AllocationSlider({ allocation, onWeightChange, onRemove }: AllocationSliderProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = parseFloat(e.target.value);
    onWeightChange(allocation.symbol, newWeight);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onWeightChange(allocation.symbol, 0);
      return;
    }
    
    const newWeight = parseFloat(value);
    if (!isNaN(newWeight) && newWeight >= 0 && newWeight <= 100) {
      onWeightChange(allocation.symbol, newWeight);
    }
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const getReturnColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getAssetClassColor = (assetClass?: string): string => {
    switch (assetClass) {
      case 'Equity':
        return 'bg-blue-100 text-blue-800';
      case 'Fixed Income':
        return 'bg-green-100 text-green-800';
      case 'International':
      case 'International Equity':
        return 'bg-purple-100 text-purple-800';
      case 'Real Estate':
        return 'bg-orange-100 text-orange-800';
      case 'Commodities':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center">
              <h4 className="font-medium text-gray-900">{allocation.symbol}</h4>
              {allocation.assetclass && (
                <span className={`ml-2 text-xs px-2 py-1 rounded ${getAssetClassColor(allocation.assetclass)}`}>
                  {allocation.assetclass}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate max-w-64">{allocation.name}</p>
          </div>
        </div>
        
        <button
          onClick={() => onRemove(allocation.symbol)}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="Remover ETF"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
        <div className="flex items-center">
          <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
          <span className="text-gray-500 mr-1">Retorno:</span>
          <span className={getReturnColor(allocation.returns_12m)}>
            {formatPercentage(allocation.returns_12m)}
          </span>
        </div>
        <div className="flex items-center">
          <Shield className="w-3 h-3 mr-1 text-orange-600" />
          <span className="text-gray-500 mr-1">Vol:</span>
          <span className="text-gray-700">
            {formatPercentage(allocation.volatility_12m)}
          </span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-3 h-3 mr-1 text-purple-600" />
          <span className="text-gray-500 mr-1">Taxa:</span>
          <span className="text-gray-700">
            {formatPercentage(allocation.expense_ratio)}
          </span>
        </div>
      </div>

      {/* Controles de Alocação */}
      <div className="space-y-3">
        {/* Slider */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 w-16">Peso:</label>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={allocation.weight}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${allocation.weight}%, #E5E7EB ${allocation.weight}%, #E5E7EB 100%)`
              }}
            />
          </div>
          <div className="w-20">
            <input
              type="number"
              value={allocation.weight.toFixed(1)}
              onChange={handleInputChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <span className="text-sm text-gray-500 w-4">%</span>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex space-x-2">
          <button
            onClick={() => onWeightChange(allocation.symbol, 0)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            0%
          </button>
          <button
            onClick={() => onWeightChange(allocation.symbol, 10)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            10%
          </button>
          <button
            onClick={() => onWeightChange(allocation.symbol, 25)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            25%
          </button>
          <button
            onClick={() => onWeightChange(allocation.symbol, 50)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            50%
          </button>
        </div>
      </div>

      {/* Indicador Visual de Peso */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(allocation.weight, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 