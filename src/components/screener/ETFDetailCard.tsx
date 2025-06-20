"use client";

import React from 'react';
import { TrendingUp, Building2, DollarSign, BarChart3, Shield } from 'lucide-react';
import { formatPercentage, formatCurrency, formatNumber, getValueColor, formatDate } from '@/lib/formatters';

interface ETFDetails {
  symbol: string;
  name?: string | null;
  description?: string | null;
  assetclass?: string | null;
  etfcompany?: string | null;
  expense_ratio?: number | null;
  volume?: number | null;
  inception_date?: string | null;
  nav?: number | null;
  holdings_count?: number | null;
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  ten_year_return?: number | null;
  volatility_12m?: number | null;
  volatility_24m?: number | null;
  volatility_36m?: number | null;
  sharpe_12m?: number | null;
  sharpe_24m?: number | null;
  sharpe_36m?: number | null;
  max_drawdown?: number | null;
  dividends_12m?: number | null;
  dividend_yield?: number | null;
}

interface ETFDetailCardProps {
  details: ETFDetails;
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

export default function ETFDetailCard({ details, onClose }: ETFDetailCardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl border shadow-sm">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {details.symbol}
            </h2>
            <p className="text-lg text-gray-600 mt-1">
              {details.name || 'Nome não disponível'}
            </p>
            <div className="flex gap-2 mt-2">
              {details.assetclass && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                  {details.assetclass}
                </span>
              )}
              {details.etfcompany && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground border-border">
                  {details.etfcompany}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Informações Gerais */}
        <div>
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
            <Building2 className="w-5 h-5 mr-2" />
            Informações Gerais
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Asset Class</p>
              <p className="font-medium">{details.assetclass || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gestora</p>
              <p className="font-medium">{details.etfcompany || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Início</p>
              <p className="font-medium">{formatDate(details.inception_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Taxa Admin.</p>
              <p className="font-medium">{details.expense_ratio ? `${Number(details.expense_ratio).toFixed(2)}%` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Volume Médio</p>
              <p className="font-medium">{formatLargeNumber(details.volume)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">NAV</p>
              <p className="font-medium">{formatCurrency(details.nav)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Holdings</p>
              <p className="font-medium">{details.holdings_count || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="font-medium">{formatCurrency(details.nav)}</p>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border"></div>

        {/* Performance */}
        <div>
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Retorno 12m</p>
              <p className={`font-medium ${getReturnColor(details.returns_12m)}`}>
                {formatPercentage(details.returns_12m)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Retorno 24m</p>
              <p className={`font-medium ${getReturnColor(details.returns_24m)}`}>
                {formatPercentage(details.returns_24m)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Retorno 36m</p>
              <p className={`font-medium ${getReturnColor(details.returns_36m)}`}>
                {formatPercentage(details.returns_36m)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Retorno 10 Anos</p>
              <p className={`font-medium ${getReturnColor(details.ten_year_return)}`}>
                {formatPercentage(details.ten_year_return)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border"></div>

        {/* Risco */}
        <div>
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
            <Shield className="w-5 h-5 mr-2" />
            Risco
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Volatilidade 12m</p>
              <p className="font-medium">{formatPercentage(details.volatility_12m)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sharpe 12m</p>
              <p className="font-medium">{formatNumber(details.sharpe_12m)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Drawdown</p>
              <p className={`font-medium ${getReturnColor(details.max_drawdown)}`}>
                {formatPercentage(details.max_drawdown)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Beta</p>
              <p className="font-medium">N/A</p>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border"></div>

        {/* Múltiplos */}
        <div>
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
            <BarChart3 className="w-5 h-5 mr-2" />
            Múltiplos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">P/L</p>
              <p className="font-medium">N/A</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">P/VP</p>
              <p className="font-medium">N/A</p>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border"></div>

        {/* Dividendos */}
        <div>
          <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
            <DollarSign className="w-5 h-5 mr-2" />
            Dividendos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Dividend Yield</p>
              <p className="font-medium">{formatPercentage(details.dividend_yield)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dividendos (12m)</p>
              <p className="font-medium">{formatCurrency(details.dividends_12m)}</p>
            </div>
          </div>
        </div>

        {/* Descrição */}
        {details.description && (
          <>
            <div className="h-[1px] w-full bg-border"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">
                {details.description}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 