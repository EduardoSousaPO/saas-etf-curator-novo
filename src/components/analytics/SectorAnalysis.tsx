"use client";

import { useState, useEffect } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Crown,
  Zap,
  Shield
} from 'lucide-react';
import { toast } from "react-hot-toast";

interface SectorData {
  sector_name: string;
  total_etfs: number;
  avg_return_12m: number;
  avg_volatility: number;
  avg_sharpe_ratio: number;
  best_performer_symbol?: string;
  performance_rank: number;
  sharpe_rank?: number;
}

export default function SectorAnalysis() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'performance' | 'sharpe' | 'volatility'>('performance');

  useEffect(() => {
    loadSectorAnalysis();
  }, []);

  const loadSectorAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/correlations?type=sector_analysis');
      
      if (response.ok) {
        const data = await response.json();
        setSectors(data.sectors || []);
      } else {
        toast.error('Erro ao carregar análise setorial');
      }
    } catch (error) {
      console.error('Erro ao carregar análise setorial:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getSortedSectors = () => {
    const sorted = [...sectors];
    switch (sortBy) {
      case 'performance':
        return sorted.sort((a, b) => (b.avg_return_12m || 0) - (a.avg_return_12m || 0));
      case 'sharpe':
        return sorted.sort((a, b) => (b.avg_sharpe_ratio || 0) - (a.avg_sharpe_ratio || 0));
      case 'volatility':
        return sorted.sort((a, b) => (a.avg_volatility || 0) - (b.avg_volatility || 0));
      default:
        return sorted;
    }
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(decimals);
  };

  const getPerformanceColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'text-gray-500';
    if (value > 0.15) return 'text-green-600';
    if (value > 0.05) return 'text-blue-600';
    if (value > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value: number | null | undefined) => {
    if (value === null || value === undefined) return null;
    return value > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getRiskBadge = (volatility: number | null | undefined): { label: string; color: string } => {
    if (volatility === null || volatility === undefined) return { label: 'N/A', color: 'bg-gray-100 text-gray-800' };
    if (volatility < 0.15) return { label: 'Baixo', color: 'bg-green-100 text-green-800' };
    if (volatility < 0.25) return { label: 'Médio', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Alto', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <PieChart className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Análise Setorial</h2>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="performance">Performance 12m</option>
              <option value="sharpe">Sharpe Ratio</option>
              <option value="volatility">Menor Risco</option>
            </select>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          Análise comparativa de performance e risco por setor baseada em {sectors.length} setores
        </p>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Melhor Performance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Crown className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Melhor Performance</h3>
          </div>
          {sectors.length > 0 && (
            <div>
              <div className="text-lg font-bold text-green-900">
                {getSortedSectors()[0]?.sector_name}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(getSortedSectors()[0]?.avg_return_12m)}
              </div>
              <div className="text-sm text-green-700">
                {getSortedSectors()[0]?.total_etfs} ETFs
              </div>
            </div>
          )}
        </div>

        {/* Melhor Sharpe */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Melhor Risco/Retorno</h3>
          </div>
          {sectors.length > 0 && (
            <div>
              <div className="text-lg font-bold text-blue-900">
                {[...sectors].sort((a, b) => (b.avg_sharpe_ratio || 0) - (a.avg_sharpe_ratio || 0))[0]?.sector_name}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber([...sectors].sort((a, b) => (b.avg_sharpe_ratio || 0) - (a.avg_sharpe_ratio || 0))[0]?.avg_sharpe_ratio)}
              </div>
              <div className="text-sm text-blue-700">
                Sharpe Ratio
              </div>
            </div>
          )}
        </div>

        {/* Menor Risco */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Menor Risco</h3>
          </div>
          {sectors.length > 0 && (
            <div>
              <div className="text-lg font-bold text-purple-900">
                {[...sectors].sort((a, b) => (a.avg_volatility || 0) - (b.avg_volatility || 0))[0]?.sector_name}
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage([...sectors].sort((a, b) => (a.avg_volatility || 0) - (b.avg_volatility || 0))[0]?.avg_volatility)}
              </div>
              <div className="text-sm text-purple-700">
                Volatilidade
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Sector Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ranking Detalhado</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Setor</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">ETFs</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Retorno 12m</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Volatilidade</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Sharpe</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Risco</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Top ETF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getSortedSectors().map((sector, index) => {
                const riskBadge = getRiskBadge(sector.avg_volatility);
                return (
                  <tr key={sector.sector_name} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{sector.sector_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {sector.total_etfs}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`flex items-center justify-center space-x-1 ${getPerformanceColor(sector.avg_return_12m)}`}>
                        {getPerformanceIcon(sector.avg_return_12m)}
                        <span className="font-medium">{formatPercentage(sector.avg_return_12m)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {formatPercentage(sector.avg_volatility)}
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-medium text-gray-900">
                      {formatNumber(sector.avg_sharpe_ratio)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskBadge.color}`}>
                        {riskBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-medium text-blue-600">
                      {sector.best_performer_symbol || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">📊 Insights da Análise</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="mb-2">
              <strong>🚀 Setores de Growth:</strong> Tecnologia e energia lideram em performance
            </p>
            <p className="mb-2">
              <strong>🛡️ Setores Defensivos:</strong> Utilities e bonds oferecem menor volatilidade
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>⚖️ Melhor Risco/Retorno:</strong> Procure setores com alto Sharpe ratio
            </p>
            <p>
              <strong>🌍 Diversificação:</strong> Combine setores com diferentes características de risco
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 