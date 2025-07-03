// src/app/rankings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ETF } from "../../types";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";

import { toast } from "react-hot-toast";
import { TrendingUp, Award, DollarSign, BarChart3, Volume2, Shield, Activity, Info, CheckCircle, Clock, Database, Target } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  Trophy, 
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  Eye
} from 'lucide-react';

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
      
        <div className="max-w-6xl mx-auto px-6 py-20">
          
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-8 leading-tight">
              Rankings
              <span className="block text-blue-600">de ETFs</span>
            </h1>
            <p className="text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubra os ETFs com melhor performance, menor risco e melhores métricas 
              baseado em análise quantitativa de mais de 1.370 ETFs.
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Filtros e Categorias
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <label className="text-sm font-light text-gray-700">Categoria</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Todos os ETFs</option>
                    <option>Large Cap</option>
                    <option>Technology</option>
                    <option>Bonds</option>
                    <option>International</option>
                    <option>Dividend</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-light text-gray-700">Período</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>1 Ano</option>
                    <option>2 Anos</option>
                    <option>3 Anos</option>
                    <option>5 Anos</option>
                    <option>10 Anos</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-light text-gray-700">Métrica</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Retorno Total</option>
                    <option>Sharpe Ratio</option>
                    <option>Volatilidade</option>
                    <option>Max Drawdown</option>
                    <option>Dividend Yield</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-light text-gray-700">AUM Mínimo</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Qualquer</option>
                    <option>$100M+</option>
                    <option>$500M+</option>
                    <option>$1B+</option>
                    <option>$5B+</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 font-light">
                  💡 Use os filtros para encontrar ETFs específicos para seu perfil
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-light transition-all duration-300 hover:bg-blue-700">
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Top Performers
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 font-light">
                    #1
                  </Badge>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">QQQ</h3>
                <p className="text-gray-600 font-light mb-4">Invesco QQQ Trust</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-light text-green-600">+28.4%</span>
                  <ArrowUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-gray-600" />
                  </div>
                  <Badge className="bg-gray-100 text-gray-800 font-light">
                    #2
                  </Badge>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">SPY</h3>
                <p className="text-gray-600 font-light mb-4">SPDR S&P 500 ETF</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-light text-green-600">+24.1%</span>
                  <ArrowUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-orange-600" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 font-light">
                    #3
                  </Badge>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">VTI</h3>
                <p className="text-gray-600 font-light mb-4">Vanguard Total Stock</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-light text-green-600">+22.8%</span>
                  <ArrowUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Rankings Table */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Ranking Completo
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-6 font-light text-gray-900">Rank</th>
                      <th className="text-left p-6 font-light text-gray-900">ETF</th>
                      <th className="text-left p-6 font-light text-gray-900">Nome</th>
                      <th className="text-center p-6 font-light text-gray-900">Retorno 1Y</th>
                      <th className="text-center p-6 font-light text-gray-900">Volatilidade</th>
                      <th className="text-center p-6 font-light text-gray-900">Sharpe</th>
                      <th className="text-center p-6 font-light text-gray-900">AUM</th>
                      <th className="text-center p-6 font-light text-gray-900">Expense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample Data */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-light text-yellow-600">1</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-900">QQQ</span>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-700">Invesco QQQ Trust</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-green-600">+28.4%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">18.2%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">1.56</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">$220B</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">0.20%</span>
                      </td>
                    </tr>
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-light text-gray-600">2</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-900">SPY</span>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-700">SPDR S&P 500 ETF</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-green-600">+24.1%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">16.8%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">1.43</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">$450B</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">0.09%</span>
                      </td>
                    </tr>
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-light text-orange-600">3</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-900">VTI</span>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-700">Vanguard Total Stock</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-green-600">+22.8%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">17.1%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">1.33</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">$320B</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">0.03%</span>
                      </td>
                    </tr>
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-light text-blue-600">4</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-900">VOO</span>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-700">Vanguard S&P 500</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-green-600">+24.0%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">16.9%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">1.42</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">$280B</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">0.03%</span>
                      </td>
                    </tr>
                    
                    <tr className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-light text-green-600">5</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-900">VEA</span>
                      </td>
                      <td className="p-6">
                        <span className="font-light text-gray-700">Vanguard FTSE Developed</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-green-600">+18.5%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">19.3%</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">0.96</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">$120B</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="font-light text-gray-700">0.05%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 border-t border-gray-100 text-center">
                <button className="text-blue-600 font-light hover:text-blue-700 transition-colors duration-300">
                  Ver Mais ETFs →
                </button>
              </div>
            </div>
          </div>

          {/* Category Rankings */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Rankings por Categoria
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-gray-900">Technology</h3>
                  <Badge className="bg-blue-100 text-blue-800 font-light">
                    45 ETFs
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">1.</span>
                      <span className="font-light text-gray-900">QQQ</span>
                    </div>
                    <span className="font-light text-green-600">+28.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">2.</span>
                      <span className="font-light text-gray-900">VGT</span>
                    </div>
                    <span className="font-light text-green-600">+26.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">3.</span>
                      <span className="font-light text-gray-900">XLK</span>
                    </div>
                    <span className="font-light text-green-600">+25.8%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-gray-900">Healthcare</h3>
                  <Badge className="bg-green-100 text-green-800 font-light">
                    28 ETFs
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">1.</span>
                      <span className="font-light text-gray-900">VHT</span>
                    </div>
                    <span className="font-light text-green-600">+15.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">2.</span>
                      <span className="font-light text-gray-900">XLV</span>
                    </div>
                    <span className="font-light text-green-600">+14.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">3.</span>
                      <span className="font-light text-gray-900">IHI</span>
                    </div>
                    <span className="font-light text-green-600">+12.9%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-gray-900">Bonds</h3>
                  <Badge className="bg-purple-100 text-purple-800 font-light">
                    32 ETFs
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">1.</span>
                      <span className="font-light text-gray-900">AGG</span>
                    </div>
                    <span className="font-light text-green-600">+3.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">2.</span>
                      <span className="font-light text-gray-900">BND</span>
                    </div>
                    <span className="font-light text-green-600">+3.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-light text-gray-600">3.</span>
                      <span className="font-light text-gray-900">VGIT</span>
                    </div>
                    <span className="font-light text-green-600">+2.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-900 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-light text-white mb-6">
              Quer uma Análise Personalizada?
            </h2>
            <p className="text-lg font-light text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Use nosso Portfolio Master para descobrir quais ETFs são ideais 
              para seus objetivos e perfil de risco específicos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-light transition-all duration-300 hover:bg-gray-100">
                Usar Portfolio Master
              </button>
              <button className="border border-gray-600 text-white px-8 py-3 rounded-xl font-light transition-all duration-300 hover:bg-gray-800">
                Ver Screener
              </button>
            </div>
          </div>

        </div>
      </div>
    </RequireAuth>
  );
}
