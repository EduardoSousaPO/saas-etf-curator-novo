"use client";

import React, { useState, useEffect } from 'react';
import UnifiedNavbar from '@/components/layout/UnifiedNavbar';
import RequireAuth from '@/components/auth/RequireAuth';
import ETFSearch from '@/components/comparador/ETFSearch';
import PerformanceChart from '@/components/comparador/PerformanceChart';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Shield, 
  Globe,
  Target,
  Zap,
  ArrowRight,
  Plus,
  X,
  Eye,
  Activity,
  ExternalLink
} from 'lucide-react';
import { useETFNavigation } from '@/hooks/useETFNavigation';

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
  totalasset?: number | null;
  dividends_12m?: number | null;
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
  const { navigateToETF } = useETFNavigation({ openInNewTab: true });

  // Carregar perfil do usuário do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('etf-curator-profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Adicionar ETF à comparação
  const addETF = (etf: ETF) => {
    if (selectedETFs.length >= 5) {
      alert('Máximo de 5 ETFs para comparação');
      return;
    }
    setSelectedETFs([...selectedETFs, etf]);
  };

  // Remover ETF da comparação
  const removeETF = (symbol: string) => {
    setSelectedETFs(selectedETFs.filter(etf => etf.symbol !== symbol));
  };

  // Formatação de valores
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    // CORREÇÃO: Os dados vêm em formato decimal do banco (0.359224 = 35.92%)
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

  const formatAssets = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
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

  // Análise rápida dos ETFs selecionados
  const getQuickAnalysis = () => {
    if (selectedETFs.length === 0) return null;

    // Melhor performance
    const bestPerformance = selectedETFs.reduce((best, etf) => {
      const bestReturn = best.returns_12m || -Infinity;
      const etfReturn = etf.returns_12m || -Infinity;
      return etfReturn > bestReturn ? etf : best;
    });

    // Menor risco (volatilidade)
    const lowestRisk = selectedETFs.reduce((lowest, etf) => {
      const lowestVol = lowest.volatility_12m || Infinity;
      const etfVol = etf.volatility_12m || Infinity;
      return etfVol < lowestVol ? etf : lowest;
    });

    // Melhor custo-benefício (menor expense ratio)
    const bestCostBenefit = selectedETFs.reduce((best, etf) => {
      const bestRatio = best.expense_ratio || Infinity;
      const etfRatio = etf.expense_ratio || Infinity;
      return etfRatio < bestRatio ? etf : best;
    });

    return {
      bestPerformance,
      lowestRisk,
      bestCostBenefit
    };
  };

  const quickAnalysis = getQuickAnalysis();

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
      
        <div className="max-w-6xl mx-auto px-6 py-20">
          
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-8 leading-tight">
              Comparador
              <span className="block text-blue-600">de ETFs</span>
            </h1>
            <p className="text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Compare performance, métricas e características de diferentes ETFs 
              lado a lado para tomar decisões mais informadas.
            </p>
          </div>

          {/* ETF Search Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Selecione ETFs para Comparar
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-gray-900">
                    Buscar ETFs
                  </h3>
                  <p className="text-gray-600 font-light">
                    Digite o símbolo ou nome do ETF
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <ETFSearch 
                  onSelectETF={addETF}
                  selectedSymbols={selectedETFs.map(etf => etf.symbol)}
                  maxSelections={5}
                  placeholder="Buscar ETFs por símbolo ou nome..."
                />
                
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-sm text-gray-500 font-light">
                    💡 Dica: Use símbolos como SPY, QQQ, VTI ou digite nomes como "S&P 500"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected ETFs */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              ETFs Selecionados ({selectedETFs.length}/5)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* ETFs Selecionados Dinamicamente */}
              {selectedETFs.map((etf) => (
                <div key={etf.symbol} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative">
                  {/* Botão de remover */}
                  <button
                    onClick={() => removeETF(etf.symbol)}
                    className="absolute top-4 right-4 w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>

                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 
                      className="text-xl font-medium text-gray-900 text-center mb-2 cursor-pointer hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                      onClick={() => navigateToETF(etf.symbol)}
                      title="Ver detalhes do ETF"
                    >
                      {etf.symbol}
                      <ExternalLink className="w-4 h-4 opacity-50" />
                    </h3>
                    <p className="text-sm text-gray-500 text-center truncate">
                      {etf.name || 'N/A'}
                    </p>
                    {etf.assetclass && (
                      <div className="flex justify-center mt-2">
                        <Badge className="bg-blue-100 text-blue-800 font-light text-xs">
                          {etf.assetclass}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Métricas rápidas */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Retorno 12m</span>
                      <span className={`text-sm font-medium ${getReturnColor(etf.returns_12m)}`}>
                        {formatPercentage(etf.returns_12m)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Volatilidade</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatPercentage(etf.volatility_12m)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Sharpe</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatNumber(etf.sharpe_12m)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Taxa</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatPercentage(etf.expense_ratio)}
                      </span>
                    </div>
                  </div>

                  {/* Recomendação baseada no perfil */}
                  {userProfile && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        {getProfileRecommendation(etf)}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Placeholder Cards para slots vazios */}
              {Array.from({ length: Math.max(0, 3 - selectedETFs.length) }).map((_, index) => (
                <div key={`placeholder-${index}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 border-dashed">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-light text-gray-600 mb-2">
                      Adicionar ETF
                    </h3>
                    <p className="text-sm text-gray-500 font-light">
                      {selectedETFs.length === 0 ? 'Use a busca acima para adicionar ETFs' : 
                       selectedETFs.length === 1 ? 'Compare até 5 ETFs simultaneamente' : 
                       'Análise detalhada de cada ETF'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Comparação de Performance
            </h2>
            
            {selectedETFs.length > 0 ? (
              <PerformanceChart etfs={selectedETFs} period="1y" />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light text-gray-900">
                        Gráfico de Performance
                      </h3>
                      <p className="text-gray-600 font-light">
                        Evolução histórica dos ETFs selecionados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-gray-100 text-gray-700 font-light">
                      1 Ano
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 font-light">
                      5 Anos
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700 font-light">
                      Máximo
                    </Badge>
                  </div>
                </div>
                
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-light text-gray-600 mb-2">
                      Selecione ETFs para ver a comparação
                    </p>
                    <p className="text-sm text-gray-500 font-light">
                      O gráfico será exibido automaticamente
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metrics Comparison */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Comparação de Métricas
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-8 font-light text-gray-900 text-lg">Métrica</th>
                      {selectedETFs.length > 0 ? (
                        selectedETFs.map((etf, index) => (
                          <th key={etf.symbol} className={`text-center p-8 font-light text-gray-600 text-lg ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            {etf.symbol}
                          </th>
                        ))
                      ) : (
                        <>
                          <th className="text-center p-8 font-light text-gray-600 text-lg">ETF 1</th>
                          <th className="text-center p-8 font-light text-gray-600 text-lg bg-gray-50">ETF 2</th>
                          <th className="text-center p-8 font-light text-gray-600 text-lg">ETF 3</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Retorno 1 Ano</td>
                      {selectedETFs.length > 0 ? (
                        selectedETFs.map((etf, index) => (
                          <td key={etf.symbol} className={`text-center p-8 ${getReturnColor(etf.returns_12m)} ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            {formatPercentage(etf.returns_12m)}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="text-center p-8 text-gray-400">—</td>
                          <td className="text-center p-8 bg-gray-50 text-gray-400">—</td>
                          <td className="text-center p-8 text-gray-400">—</td>
                        </>
                      )}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Volatilidade</td>
                      {selectedETFs.length > 0 ? (
                        selectedETFs.map((etf, index) => (
                          <td key={etf.symbol} className={`text-center p-8 text-gray-700 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            {formatPercentage(etf.volatility_12m)}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="text-center p-8 text-gray-400">—</td>
                          <td className="text-center p-8 bg-gray-50 text-gray-400">—</td>
                          <td className="text-center p-8 text-gray-400">—</td>
                        </>
                      )}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Sharpe Ratio</td>
                      {selectedETFs.length > 0 ? (
                        selectedETFs.map((etf, index) => (
                          <td key={etf.symbol} className={`text-center p-8 text-gray-700 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            {formatNumber(etf.sharpe_12m)}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="text-center p-8 text-gray-400">—</td>
                          <td className="text-center p-8 bg-gray-50 text-gray-400">—</td>
                          <td className="text-center p-8 text-gray-400">—</td>
                        </>
                      )}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Expense Ratio</td>
                      {selectedETFs.length > 0 ? (
                        selectedETFs.map((etf, index) => (
                          <td key={etf.symbol} className={`text-center p-8 text-gray-700 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            {formatPercentage(etf.expense_ratio)}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="text-center p-8 text-gray-400">—</td>
                          <td className="text-center p-8 bg-gray-50 text-gray-400">—</td>
                          <td className="text-center p-8 text-gray-400">—</td>
                        </>
                      )}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">AUM</td>
                      {selectedETFs.length > 0 ? (
                        selectedETFs.map((etf, index) => (
                          <td key={etf.symbol} className={`text-center p-8 text-gray-700 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            {formatAssets(etf.totalasset)}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="text-center p-8 text-gray-400">—</td>
                          <td className="text-center p-8 bg-gray-50 text-gray-400">—</td>
                          <td className="text-center p-8 text-gray-400">—</td>
                        </>
                      )}
                    </tr>
                    <tr>
                      <td className="p-8 font-light text-gray-900">Dividend Yield</td>
                      {selectedETFs.length > 0 ? (
                        selectedETFs.map((etf, index) => (
                          <td key={etf.symbol} className={`text-center p-8 text-gray-700 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            {formatPercentage(etf.dividends_12m)}
                          </td>
                        ))
                      ) : (
                        <>
                          <td className="text-center p-8 text-gray-400">—</td>
                          <td className="text-center p-8 bg-gray-50 text-gray-400">—</td>
                          <td className="text-center p-8 text-gray-400">—</td>
                        </>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Analysis */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Análise Rápida
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Melhor Performance
                </h3>
                {quickAnalysis?.bestPerformance ? (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">{quickAnalysis.bestPerformance.symbol}</p>
                    <p className={`text-lg font-bold ${getReturnColor(quickAnalysis.bestPerformance.returns_12m)}`}>
                      {formatPercentage(quickAnalysis.bestPerformance.returns_12m)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Retorno 12 meses</p>
                  </div>
                ) : (
                  <p className="text-gray-600 font-light leading-relaxed">
                    Selecione ETFs para ver qual apresenta melhor retorno histórico
                  </p>
                )}
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Menor Risco
                </h3>
                {quickAnalysis?.lowestRisk ? (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">{quickAnalysis.lowestRisk.symbol}</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPercentage(quickAnalysis.lowestRisk.volatility_12m)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Volatilidade</p>
                  </div>
                ) : (
                  <p className="text-gray-600 font-light leading-relaxed">
                    Identifique o ETF com menor volatilidade e melhor gestão de risco
                  </p>
                )}
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Melhor Custo-Benefício
                </h3>
                {quickAnalysis?.bestCostBenefit ? (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">{quickAnalysis.bestCostBenefit.symbol}</p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatPercentage(quickAnalysis.bestCostBenefit.expense_ratio)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Taxa de administração</p>
                  </div>
                ) : (
                  <p className="text-gray-600 font-light leading-relaxed">
                    Compare expense ratios e encontre a melhor relação custo-benefício
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Popular Comparisons */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Comparações Populares
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md cursor-pointer group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-2">
                      SPY vs QQQ vs VTI
                    </h3>
                    <p className="text-gray-600 font-light">
                      Comparação entre os ETFs mais populares
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-100 text-blue-800 font-light">
                    SPY
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 font-light">
                    QQQ
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 font-light">
                    VTI
                  </Badge>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md cursor-pointer group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-2">
                      VNQ vs REIT vs IYR
                    </h3>
                    <p className="text-gray-600 font-light">
                      ETFs de Real Estate Investment Trusts
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-orange-100 text-orange-800 font-light">
                    VNQ
                  </Badge>
                  <Badge className="bg-red-100 text-red-800 font-light">
                    REIT
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 font-light">
                    IYR
                  </Badge>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md cursor-pointer group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-2">
                      BND vs AGG vs VGIT
                    </h3>
                    <p className="text-gray-600 font-light">
                      ETFs de renda fixa e bonds
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-gray-100 text-gray-800 font-light">
                    BND
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 font-light">
                    AGG
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 font-light">
                    VGIT
                  </Badge>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md cursor-pointer group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-2">
                      VXUS vs VEA vs VWO
                    </h3>
                    <p className="text-gray-600 font-light">
                      ETFs internacionais e mercados emergentes
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-purple-100 text-purple-800 font-light">
                    VXUS
                  </Badge>
                  <Badge className="bg-indigo-100 text-indigo-800 font-light">
                    VEA
                  </Badge>
                  <Badge className="bg-pink-100 text-pink-800 font-light">
                    VWO
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-light text-white mb-6">
              Precisa de Ajuda na Comparação?
            </h2>
            <p className="text-lg font-light text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Use nosso Portfolio Master para receber recomendações personalizadas 
              baseadas em seus objetivos e perfil de risco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-light transition-all duration-300 hover:bg-gray-100">
                Usar Portfolio Master
              </button>
              <button className="border border-gray-600 text-white px-8 py-3 rounded-xl font-light transition-all duration-300 hover:bg-gray-800">
                Ver Rankings
              </button>
            </div>
          </div>

        </div>
      </div>
    </RequireAuth>
  );
} 