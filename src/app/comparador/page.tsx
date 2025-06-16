"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import ETFSearch from '@/components/comparador/ETFSearch';
import PerformanceChart from '@/components/comparador/PerformanceChart';

import { X, TrendingUp, BarChart3, Shield, DollarSign, Zap } from 'lucide-react';

interface ETF {
  symbol: string;
  name?: string | null;
  assetclass?: string | null;
  etfcompany?: string | null;
  expense_ratio?: number | null;
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  volatility_12m?: number | null;
  sharpe_12m?: number | null;
  max_drawdown?: number | null;
  dividend_yield?: number | null;
  nav?: number | null;
  volume?: number | null;
}

interface UserProfile {
  name: string;
  experience: string;
  objective: string;
  riskTolerance: number;
  timeHorizon: string;
  monthlyInvestment: number;
  totalPatrimony: number;
  profile: string;
}

export default function ComparadorPage() {
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Carregar perfil do usuário do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('etf-curator-profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Adicionar ETF à comparação
  const addETF = (etf: ETF) => {
    setSelectedETFs([...selectedETFs, etf]);
  };

  // Remover ETF da comparação
  const removeETF = (symbol: string) => {
    setSelectedETFs(selectedETFs.filter(etf => etf.symbol !== symbol));
  };

  // Formatação de valores
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${(Number(value) * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return value.toFixed(decimals);
  };

  // Cor baseada no retorno
  const getReturnColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Obter recomendação baseada no perfil
  const getProfileRecommendation = (etf: ETF): string => {
    if (!userProfile) return '';

    const volatility = etf.volatility_12m || 0;
    const returns = etf.returns_12m || 0;
    const sharpe = etf.sharpe_12m || 0;

    switch (userProfile.profile) {
      case 'Conservador':
        if (volatility < 10 && sharpe > 1) return '✅ Ideal para seu perfil';
        if (volatility < 15) return '⚠️ Adequado com cautela';
        return '❌ Alto risco para seu perfil';
      
      case 'Moderado':
        if (volatility >= 10 && volatility <= 20 && returns > 5) return '✅ Ideal para seu perfil';
        if (volatility <= 25) return '⚠️ Adequado';
        return '❌ Muito arriscado';
      
      case 'Arrojado':
        if (volatility > 20 && returns > 8) return '✅ Ideal para seu perfil';
        if (volatility > 15) return '⚠️ Adequado';
        return '❌ Muito conservador';
      
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comparador de ETFs
          </h1>
          <p className="text-gray-600">
            Compare até 4 ETFs lado a lado e tome decisões informadas
          </p>
          {userProfile && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Perfil:</strong> {userProfile.profile} | 
                <strong> Objetivo:</strong> {userProfile.objective} |
                <strong> Tolerância ao Risco:</strong> {userProfile.riskTolerance}/10
              </p>
            </div>
          )}
        </div>

        {/* Busca de ETFs */}
        <div className="mb-8">
          <ETFSearch
            onSelectETF={addETF}
            selectedSymbols={selectedETFs.map(etf => etf.symbol)}
            maxSelections={4}
            placeholder="Buscar ETFs por símbolo ou nome (ex: SPY, QQQ, VTI)..."
          />
        </div>

        {/* ETFs Selecionados */}
        {selectedETFs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ETFs Selecionados ({selectedETFs.length}/4)
            </h2>
            <div className="flex flex-wrap gap-2">
              {selectedETFs.map((etf) => (
                <div
                  key={etf.symbol}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {etf.symbol}
                  <button
                    onClick={() => removeETF(etf.symbol)}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela de Comparação */}
        {selectedETFs.length >= 2 && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Comparação Detalhada</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Métrica
                      </th>
                      {selectedETFs.map((etf) => (
                        <th key={etf.symbol} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>
                            <div className="font-bold text-gray-900">{etf.symbol}</div>
                            <div className="text-xs text-gray-500 normal-case truncate max-w-32">
                              {etf.name}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Informações Básicas */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900" colSpan={selectedETFs.length + 1}>
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Informações Básicas
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Asset Class</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {etf.assetclass || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Gestora</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {etf.etfcompany || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Taxa de Administração</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(etf.expense_ratio)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NAV</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(etf.nav)}
                        </td>
                      ))}
                    </tr>

                    {/* Performance */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900" colSpan={selectedETFs.length + 1}>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Performance
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Retorno 12m</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getReturnColor(etf.returns_12m)}`}>
                          {formatPercentage(etf.returns_12m)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Retorno 24m</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getReturnColor(etf.returns_24m)}`}>
                          {formatPercentage(etf.returns_24m)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Retorno 36m</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getReturnColor(etf.returns_36m)}`}>
                          {formatPercentage(etf.returns_36m)}
                        </td>
                      ))}
                    </tr>

                    {/* Risco */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900" colSpan={selectedETFs.length + 1}>
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Risco
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Volatilidade 12m</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(etf.volatility_12m)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sharpe Ratio 12m</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(etf.sharpe_12m)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Max Drawdown</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getReturnColor(etf.max_drawdown)}`}>
                          {formatPercentage(etf.max_drawdown)}
                        </td>
                      ))}
                    </tr>

                    {/* Dividendos */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900" colSpan={selectedETFs.length + 1}>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Dividendos
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dividend Yield</td>
                      {selectedETFs.map((etf) => (
                        <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(etf.dividend_yield)}
                        </td>
                      ))}
                    </tr>

                    {/* Recomendações baseadas no perfil */}
                    {userProfile && (
                      <>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900" colSpan={selectedETFs.length + 1}>
                            <div className="flex items-center">
                              <Zap className="w-4 h-4 mr-2" />
                              Adequação ao Seu Perfil ({userProfile.profile})
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Recomendação</td>
                          {selectedETFs.map((etf) => (
                            <td key={etf.symbol} className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="text-xs font-medium">
                                {getProfileRecommendation(etf)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Gráfico de Performance Histórica */}
            <PerformanceChart etfs={selectedETFs} />
          </>
        )}

        {/* Estado vazio */}
        {selectedETFs.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum ETF selecionado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Use a busca acima para encontrar e adicionar ETFs para comparação
            </p>
          </div>
        )}

        {/* Apenas 1 ETF selecionado */}
        {selectedETFs.length === 1 && (
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <BarChart3 className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <h3 className="text-sm font-medium text-blue-900">Adicione mais ETFs</h3>
              <p className="mt-1 text-sm text-blue-700">
                Selecione pelo menos 2 ETFs para começar a comparação
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 