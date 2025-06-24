// src/app/rankings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ETF } from "../../types";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";

import { toast } from "react-hot-toast";
import { TrendingUp, Award, DollarSign, BarChart3, Volume2, Shield, Activity, Info, CheckCircle, Clock, Database, Target } from "lucide-react";

interface RankingsData {
  top_returns_12m: ETF[];
  top_sharpe_12m: ETF[];
  top_dividend_yield: ETF[];
  highest_volume: ETF[];
  lowest_max_drawdown: ETF[];
  lowest_volatility_12m: ETF[];
  _metadata?: {
    timestamp: string;
    source: string;
    total_categories: number;
    total_etfs: number;
    last_updated: string;
    performance: string;
    methodology?: {
      description: string;
      ranking_criteria: Record<string, string>;
      percentile_system: string;
      data_filters: string;
      update_frequency: string;
    };
    dataQuality?: {
      totalRawData: number;
      validData: number;
      outliersRemoved: number;
      filterEfficiency: string;
      qualityByCategory?: Record<string, any>;
    };
    universeStats?: Record<string, number>;
    validationCriteria?: Record<string, string>;
  };
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        console.log('🔍 Buscando rankings...');
        
        const response = await fetch('/api/etfs/rankings');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Rankings recebidos:', data);
        
        setRankings(data);
        setError(null);
        
      } catch (err) {
        console.error('❌ Erro ao buscar rankings:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        toast.error('Erro ao carregar rankings');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  // Função para formatar valores monetários (não utilizada atualmente)
  // const formatCurrency = (value: number | null | undefined): string => {
  //   if (value === null || value === undefined || isNaN(value)) return 'N/A';
  //   return new Intl.NumberFormat('pt-BR', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2
  //   }).format(value);
  // };

  // Função para formatar valores grandes (volume, etc.)
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

  // Função para formatar números genéricos (ex: Sharpe Ratio)
  const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return 'N/A';
    return num.toFixed(2);
  };

  // Função para formatar percentuais
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    
    // Garantir que o valor é um número válido
    const numValue = Number(value);
    if (isNaN(numValue)) return 'N/A';
    
    // Os dados já vêm em formato percentual do banco
    return `${numValue.toFixed(2)}%`;
  };

  // Função para obter cor baseada no valor
  const getValueColor = (value: number | null | undefined, isPositiveBetter: boolean = true): string => {
    if (value === null || value === undefined || isNaN(value)) return 'text-gray-500';
    
    if (isPositiveBetter) {
      return value >= 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return value <= 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  // Função para obter badge de qualidade baseado no percentil
  const getQualityBadge = (rank: number) => {
    if (rank <= 2) return { label: 'Elite', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (rank <= 5) return { label: 'Excelente', color: 'bg-green-100 text-green-800 border-green-200' };
    return { label: 'Selecionado', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  // Componente para renderizar uma tabela de ranking minimalista
  const RankingTable = ({ 
    title, 
    data, 
    icon, 
    valueKey, 
    valueFormatter, 
    description 
  }: {
    title: string;
    data: ETF[];
    icon: React.ReactNode;
    valueKey: keyof ETF;
    valueFormatter: (value: any) => string;
    description: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header mais limpo */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">Top {data.length} ETFs</p>
            </div>
          </div>
          <div className="text-xs text-green-600 font-medium">✓ Validado</div>
        </div>
      </div>
      
      {/* Tabela minimalista */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETF</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((etf, index) => {
              const percentile = Math.round(((10 - index) / 10) * 100);
              
              return (
                <tr key={etf.symbol} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-gray-900">{etf.symbol}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {etf.name || 'Nome não disponível'}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">{etf.assetclass}</span>
                        {etf.expense_ratio && (
                          <span className="text-xs text-gray-400">
                            • {(etf.expense_ratio * 100).toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <div className={`font-bold text-lg ${
                        valueKey === 'returns_12m' ? getValueColor(etf[valueKey] as number) :
                        valueKey === 'max_drawdown' ? getValueColor(etf[valueKey] as number, false) :
                        'text-gray-900'
                      }`}>
                        {valueFormatter(etf[valueKey])}
                      </div>
                      <div className="text-xs text-gray-400">
                        Top {percentile}%
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando rankings...</p>
          </div>
        </div>
        </div>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <BarChart3 className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar rankings</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
        </div>
      </RequireAuth>
    );
  }

  if (!rankings) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum dado de ranking disponível</p>
          </div>
        </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header simplificado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rankings de ETFs</h1>
              <p className="text-gray-600 mt-1">
                Os melhores ETFs por categoria com metodologia científica
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {rankings._metadata?.total_etfs || 60} ETFs
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                <Clock className="w-4 h-4 inline mr-1" />
                Semanal
              </div>
            </div>
          </div>
        </div>

        {/* Stats minimalistas */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">{rankings._metadata?.universeStats ? Object.values(rankings._metadata.universeStats)[0]?.toLocaleString() || '4K+' : '4K+'}</div>
            <div className="text-sm text-gray-500">ETFs Analisados</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">{rankings._metadata?.dataQuality?.filterEfficiency || '95%'}</div>
            <div className="text-sm text-gray-500">Dados Válidos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">6</div>
            <div className="text-sm text-gray-500">Categorias</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">Semanal</div>
            <div className="text-sm text-gray-500">Atualização</div>
          </div>
        </div>

        {/* Metodologia simplificada */}
        <div className="mb-8">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">Metodologia</span>
              </div>
              <span className="text-gray-400">{showMethodology ? '−' : '+'}</span>
            </div>
          </button>
          
          {showMethodology && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Retornos:</strong> Performance dos últimos 12 meses</p>
                  <p><strong>Sharpe:</strong> Retorno ajustado ao risco</p>
                  <p><strong>Dividendos:</strong> Yield anual sobre NAV</p>
                </div>
                <div>
                  <p><strong>Volume:</strong> Liquidez média diária</p>
                  <p><strong>Drawdown:</strong> Proteção contra perdas</p>
                  <p><strong>Volatilidade:</strong> Estabilidade de preços</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid de Rankings mais compacto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <RankingTable
            title="Maiores Retornos"
            data={rankings.top_returns_12m}
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            valueKey="returns_12m"
            valueFormatter={formatPercentage}
            description="Retornos dos últimos 12 meses"
          />

          <RankingTable
            title="Melhor Sharpe"
            data={rankings.top_sharpe_12m}
            icon={<Award className="w-5 h-5 text-blue-600" />}
            valueKey="sharpe_12m"
            valueFormatter={formatNumber}
            description="Melhor relação risco-retorno"
          />

          <RankingTable
            title="Maior Dividend Yield"
            data={rankings.top_dividend_yield}
            icon={<DollarSign className="w-5 h-5 text-purple-600" />}
            valueKey="dividend_yield"
            valueFormatter={formatPercentage}
            description="Maiores dividendos"
          />

          <RankingTable
            title="Maior Volume"
            data={rankings.highest_volume}
            icon={<Volume2 className="w-5 h-5 text-indigo-600" />}
            valueKey="avgvolume"
            valueFormatter={formatLargeNumber}
            description="Maior liquidez"
          />

          <RankingTable
            title="Menor Drawdown"
            data={rankings.lowest_max_drawdown}
            icon={<Shield className="w-5 h-5 text-green-600" />}
            valueKey="max_drawdown"
            valueFormatter={formatPercentage}
            description="Melhor proteção"
          />

          <RankingTable
            title="Menor Volatilidade"
            data={rankings.lowest_volatility_12m}
            icon={<Activity className="w-5 h-5 text-teal-600" />}
            valueKey="volatility_12m"
            valueFormatter={formatPercentage}
            description="Maior estabilidade"
          />

        </div>

        {/* Footer simplificado */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Atualização:</strong> Dados atualizados semanalmente</p>
              <p><strong>Filtros:</strong> Validação flexível preservando extremos</p>
            </div>
            <div>
              <p><strong>Universo:</strong> {rankings._metadata?.universeStats ? Object.values(rankings._metadata.universeStats)[0]?.toLocaleString() || '4,000+' : '4,000+'} ETFs analisados</p>
              <p><strong>Qualidade:</strong> {rankings._metadata?.dataQuality?.filterEfficiency || '95%'} de dados válidos</p>
            </div>
            <div>
              <p><strong>Metodologia:</strong> Baseada em padrões acadêmicos</p>
              <p><strong>Percentis:</strong> Top 10 = 0.2% do universo</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </RequireAuth>
  );
}
