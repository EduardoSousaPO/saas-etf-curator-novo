"use client";

import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Users } from 'lucide-react';

interface MarketMetrics {
  totalETFs: number;
  avgReturn: number;
  avgVolatility: number;
  topPerformer: string;
  marketTrend: 'up' | 'down' | 'stable';
  totalAssets?: number;
  activeETFs?: number;
}

interface MarketMetricsProps {
  metrics: MarketMetrics;
  loading?: boolean;
}

export default function MarketMetrics({ metrics, loading = false }: MarketMetricsProps) {
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(1)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getTrendIcon = () => {
    switch (metrics.marketTrend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (metrics.marketTrend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mercado Hoje</h3>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mercado Hoje</h3>
        </div>
        <div className="flex items-center">
          {getTrendIcon()}
          <span className={`ml-1 text-sm font-medium ${getTrendColor()}`}>
            {metrics.marketTrend === 'up' ? 'Alta' : metrics.marketTrend === 'down' ? 'Baixa' : 'Estável'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Total de ETFs */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">Total de ETFs</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {metrics.totalETFs.toLocaleString()}
          </span>
        </div>
        
        {/* Retorno Médio */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">Retorno Médio (12m)</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            +{formatPercentage(metrics.avgReturn)}
          </span>
        </div>
        
        {/* Volatilidade Média */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Activity className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Volatilidade Média</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {formatPercentage(metrics.avgVolatility)}
          </span>
        </div>
        
        {/* Top Performer */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-gray-600">Top Performer</span>
          </div>
          <span className="text-lg font-bold text-yellow-600">
            {metrics.topPerformer}
          </span>
        </div>

        {/* Métricas adicionais se disponíveis */}
        {metrics.totalAssets && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">Assets Totais</span>
            </div>
            <span className="text-lg font-bold text-purple-600">
              {formatCurrency(metrics.totalAssets)}
            </span>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Atualizado em {new Date().toLocaleTimeString('pt-BR')}
        </p>
      </div>
    </div>
  );
} 