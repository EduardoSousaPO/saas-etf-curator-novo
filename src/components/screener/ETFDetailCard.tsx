"use client";

import React from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Building2 } from 'lucide-react';
import { formatPercentage, formatCurrency, formatNumber, formatMetric, METRIC_TYPES, getValueColor } from '@/lib/formatters';
import { ETFDetails } from "@/types/etf";

interface ETFDetailCardProps {
  etf: ETFDetails;
  onClose: () => void;
}

// Função para formatar valores grandes (volume, etc.) - mantida local pois é específica
const formatLargeNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('pt-BR');
};

// Renomeando para usar a versão unificada do formatters.ts
const getReturnColor = getValueColor;

const ETFDetailCard: React.FC<ETFDetailCardProps> = ({ etf, onClose }) => {
  const formatValue = (value: any, fieldName: string) => {
    if (value === null || value === undefined) return "N/A";
    
    // Usar o mapa de tipos para formatação correta
    const metricType = METRIC_TYPES[fieldName];
    
    if (metricType) {
      return formatMetric(value, metricType);
    }
    
    // Para campos específicos
    switch (fieldName) {
      case 'expense_ratio':
        return formatPercentage(value);
      case 'totalasset':
      case 'total_assets':
        return formatCurrency(value);
      case 'inception_date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'nav':
        return formatCurrency(value);
      case 'volume':
        return formatNumber(value, 0);
      case 'holdings_count':
        return formatNumber(value, 0);
      default:
        return value.toString();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{etf.symbol}</h2>
            <p className="text-gray-600">{etf.name || "Nome não disponível"}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Informações Básicas
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gestora:</span>
                  <span className="font-medium">{etf.etfcompany || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classe de Ativo:</span>
                  <span className="font-medium">{etf.assetclass || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de Administração:</span>
                  <span className="font-medium">{formatValue(etf.expense_ratio, 'expense_ratio')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patrimônio Líquido:</span>
                  <span className="font-medium">{formatValue(etf.totalasset, 'totalasset')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Criação:</span>
                  <span className="font-medium">{formatValue(etf.inception_date, 'inception_date')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Dados de Mercado
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">NAV:</span>
                  <span className="font-medium">{formatValue(etf.nav, 'nav')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume Médio:</span>
                  <span className="font-medium">{formatValue(etf.volume, 'volume')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Holdings:</span>
                  <span className="font-medium">{formatValue(etf.holdings_count, 'holdings_count')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Retornos</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>12 meses:</span>
                    <span className={`font-medium ${(etf.returns_12m || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatValue(etf.returns_12m, 'returns_12m')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>24 meses:</span>
                    <span className={`font-medium ${(etf.returns_24m || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatValue(etf.returns_24m, 'returns_24m')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>36 meses:</span>
                    <span className={`font-medium ${(etf.returns_36m || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatValue(etf.returns_36m, 'returns_36m')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Volatilidade</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>12 meses:</span>
                    <span className="font-medium">{formatValue(etf.volatility_12m, 'volatility_12m')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>24 meses:</span>
                    <span className="font-medium">{formatValue(etf.volatility_24m, 'volatility_24m')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>36 meses:</span>
                    <span className="font-medium">{formatValue(etf.volatility_36m, 'volatility_36m')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Sharpe Ratio</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>12 meses:</span>
                    <span className="font-medium">{formatValue(etf.sharpe_12m, 'sharpe_12m')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>24 meses:</span>
                    <span className="font-medium">{formatValue(etf.sharpe_24m, 'sharpe_24m')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>36 meses:</span>
                    <span className="font-medium">{formatValue(etf.sharpe_36m, 'sharpe_36m')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dividendos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Dividendos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">12 meses</div>
                <div className="text-lg font-semibold">{formatValue(etf.dividends_12m, 'dividends_12m')}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">24 meses</div>
                <div className="text-lg font-semibold">{formatValue(etf.dividends_24m, 'dividends_24m')}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">36 meses</div>
                <div className="text-lg font-semibold">{formatValue(etf.dividends_36m, 'dividends_36m')}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Histórico</div>
                <div className="text-lg font-semibold">{formatValue(etf.dividends_all_time, 'dividends_all_time')}</div>
              </div>
            </div>
          </div>

          {/* Risco */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              Análise de Risco
            </h3>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Drawdown Máximo:</span>
                <span className="font-semibold text-red-600">
                  {formatValue(etf.max_drawdown, 'max_drawdown')}
                </span>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {etf.description && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Descrição</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{etf.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ETFDetailCard; 