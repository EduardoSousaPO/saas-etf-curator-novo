// src/app/rankings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ETF } from "../../types";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";
import { toast } from "react-hot-toast";
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  BarChart3, 
  Volume2, 
  Shield, 
  Star,
  Info,
  ChevronRight,
  Trophy,
  Target,
  Zap,
  TrendingDown,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Eye,
  Gauge
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Função auxiliar para formatar patrimônio
const formatAssets = (value: number | null | undefined): string => {
  if (!value || value === 0) return 'N/A';
  
  if (value >= 1000000000000) {
    return `$${(value / 1000000000000).toFixed(1)}T`;
  } else if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
};

interface RankingsData {
  data: {
    top_returns_12m: ETF[];
    top_sharpe_12m: ETF[];
    top_dividend_yield: ETF[];
    highest_volume: ETF[];
    lowest_max_drawdown: ETF[];
    lowest_volatility_12m: ETF[];
  };
  metadata: {
    total_etfs_analyzed: number;
    categories_count: number;
    etfs_per_category: number;
    data_source: string;
    last_updated: string;
    methodology: string;
    quality_filters: {
      minimum_assets: number;
      data_validation: string;
      ranking_criteria: string;
    };
    statistics: {
      valid_returns_12m: number;
      valid_sharpe_12m: number;
      valid_dividends: number;
      valid_volume: number;
      valid_drawdown: number;
      valid_volatility: number;
    };
  };
}

// Configuração das categorias com design Tesla - sem emojis, linguagem limpa
const RANKING_CATEGORIES = {
  top_returns_12m: {
    title: "Melhor Performance",
    subtitle: "Maiores retornos em 12 meses",
    description: "ETFs com o melhor desempenho nos últimos 12 meses",
    icon: TrendingUp,
    valueKey: "returns_12m",
    valueFormatter: (value: number) => `+${value.toFixed(2)}%`,
    explanation: "Retorno percentual em 12 meses"
  },
  top_sharpe_12m: {
    title: "Retornos Ajustados ao Risco",
    subtitle: "Melhor relação risco-retorno",
    description: "ETFs que entregam retornos superiores em relação ao risco assumido",
    icon: Star,
    valueKey: "sharpe_12m",
    valueFormatter: (value: number) => value.toFixed(2),
    explanation: "Índice Sharpe mede retorno por unidade de risco"
  },
  top_dividend_yield: {
    title: "Geração de Renda",
    subtitle: "Maiores rendimentos de dividendos",
    description: "ETFs que oferecem renda consistente através de dividendos",
    icon: DollarSign,
    valueKey: "dividend_yield",
    valueFormatter: (value: number) => `${value.toFixed(2)}%`,
    explanation: "Rendimento anual de dividendos"
  },
  highest_volume: {
    title: "Liquidez de Mercado",
    subtitle: "ETFs mais negociados",
    description: "ETFs com maior volume de negociação e liquidez",
    icon: Activity,
    valueKey: "avgvolume",
    valueFormatter: (value: number) => {
      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    },
    explanation: "Volume médio diário de negociação"
  },
  lowest_max_drawdown: {
    title: "Proteção Contra Perdas",
    subtitle: "Menor queda máxima",
    description: "ETFs com menor declínio do pico até o vale",
    icon: Shield,
    valueKey: "max_drawdown",
    valueFormatter: (value: number) => `${Math.abs(value).toFixed(2)}%`,
    explanation: "Máxima queda do pico até o vale"
  },
  lowest_volatility_12m: {
    title: "Estabilidade de Preços",
    subtitle: "Menor volatilidade",
    description: "ETFs com movimentos de preço mais consistentes",
    icon: Gauge,
    valueKey: "volatility_12m",
    valueFormatter: (value: number) => `${value.toFixed(2)}%`,
    explanation: "Volatilidade de preços em 12 meses"
  }
};

// Componente para badges de qualidade mais sofisticados
const QualityBadge = ({ tier, rank }: { tier: string; rank: number }) => {
  const getBadgeStyle = (tier: string, rank: number) => {
    if (rank === 1) return { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: 'text-yellow-900', label: '1º' };
    if (rank <= 3) return { bg: 'bg-gradient-to-r from-emerald-400 to-emerald-600', text: 'text-emerald-900', label: 'TOP 3' };
    if (rank <= 5) return { bg: 'bg-gradient-to-r from-blue-400 to-blue-600', text: 'text-blue-900', label: 'TOP 5' };
    if (rank <= 7) return { bg: 'bg-gradient-to-r from-gray-400 to-gray-600', text: 'text-gray-900', label: 'TOP 7' };
    return { bg: 'bg-gradient-to-r from-slate-300 to-slate-500', text: 'text-slate-900', label: `#${rank}` };
  };

  const style = getBadgeStyle(tier, rank);
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} shadow-sm`}>
      {style.label}
    </div>
  );
};

// Componente para sparkline simples
const MiniSparkline = ({ value, color }: { value: number | null; color: string }) => {
  if (!value) return null;
  
  const isPositive = value > 0;
  const height = Math.min(Math.abs(value) * 2, 20);
  
  return (
    <div className="flex items-center justify-center w-12 h-6">
      <div 
        className={`w-1 rounded-full transition-all duration-300 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch('/api/etfs/rankings');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setRankings(data);
        setError(null);
        
      } catch (err) {
        console.error('Error loading rankings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        toast.error('Error loading rankings');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  // Loading state - Tesla style
  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-8"></div>
                             <p className="text-lg text-gray-600">Carregando rankings...</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  // Error state - Tesla style
  if (error) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center">
              <div className="text-red-500 mb-8">
                <TrendingDown className="h-12 w-12 mx-auto" />
              </div>
                             <h2 className="text-2xl font-light text-[#202636] mb-4">Não foi possível carregar os rankings</h2>
               <p className="text-lg text-gray-600 mb-8">{error}</p>
               <Button 
                 onClick={() => window.location.reload()}
                 className="bg-[#0090d8] text-white px-8 py-3 rounded-xl hover:bg-[#0090d8]/90"
               >
                 Tentar Novamente
               </Button>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <Navbar />
        
        {/* Hero Section - Tesla style */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                         <h1 className="text-6xl font-light text-[#202636] mb-6 tracking-tight">
               Rankings de ETFs
             </h1>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
               Descubra os ETFs com melhor desempenho em métricas-chave de performance. 
               Insights baseados em dados para orientar suas decisões de investimento.
             </p>
            
            {/* Stats - Tesla minimalist style */}
            {rankings?.metadata && (
              <div className="flex items-center justify-center gap-16 text-gray-500">
                                 <div className="text-center">
                   <div className="text-3xl font-light text-[#202636]">{rankings.metadata.categories_count}</div>
                   <div className="text-sm uppercase tracking-wide">Categorias</div>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl font-light text-[#202636]">{rankings.metadata.total_etfs_analyzed}</div>
                   <div className="text-sm uppercase tracking-wide">ETFs Analisados</div>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl font-light text-[#202636]">Ao Vivo</div>
                   <div className="text-sm uppercase tracking-wide">Dados</div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid - Tesla card style */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(RANKING_CATEGORIES).map(([key, category]) => {
                const data = rankings?.data?.[key as keyof typeof rankings.data] as ETF[] || [];
                const hasData = data && data.length > 0;
                
                return (
                  <div 
                    key={key} 
                    className="bg-white cursor-pointer transition-all duration-300 hover:shadow-lg group"
                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  >
                    {/* Card Header */}
                    <div className="p-8 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <category.icon className="h-6 w-6 text-[#0090d8]" />
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#0090d8] transition-colors" />
                      </div>
                      <h3 className="text-2xl font-light text-[#202636] mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm uppercase tracking-wide">
                        {category.subtitle}
                      </p>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-8">
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        {category.description}
                      </p>
                      
                      {hasData ? (
                        <div className="space-y-4">
                          {/* Top 3 Preview */}
                          {data.slice(0, 3).map((etf, index) => (
                            <div key={etf.symbol} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-[#0090d8] text-white text-sm flex items-center justify-center font-light">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-[#202636]">{etf.symbol}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-[200px]">{etf.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-[#202636]">
                                  {category.valueFormatter(etf[category.valueKey as keyof ETF] as number)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                                             ) : (
                         <div className="text-center py-8">
                           <p className="text-gray-400">
                             Dados não disponíveis
                           </p>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed View - Tesla style */}
        {selectedCategory && rankings && (
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-6 py-24">
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-light text-[#202636] mb-4">
                      {RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES].title}
                    </h2>
                    <p className="text-xl text-gray-600">
                      {RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES].description}
                    </p>
                  </div>
                                     <Button 
                     variant="outline" 
                     onClick={() => setSelectedCategory(null)}
                     className="border-[#0090d8] text-[#0090d8] hover:bg-[#0090d8] hover:text-white px-8 py-3 rounded-xl"
                   >
                     Fechar
                   </Button>
                </div>
                
                {/* Full Rankings List - Enhanced Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(rankings.data?.[selectedCategory as keyof typeof rankings.data] as ETF[])?.map((etf, index) => {
                    const category = RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES];
                    const IconComponent = category.icon;
                    
                    return (
                      <div key={etf.symbol} className="group relative p-6 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer hover:border-blue-300">
                        {/* Header com posição e badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-blue-50">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-gray-800 transition-colors">
                                {etf.symbol}
                              </h3>
                              <p className="text-sm text-gray-600 font-medium">{etf.etfcompany}</p>
                            </div>
                          </div>
                          <QualityBadge tier={etf.quality_tier || (index < 3 ? 'Excellent' : index < 7 ? 'Good' : 'Fair')} rank={index + 1} />
                        </div>

                        {/* Nome do ETF */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                            {etf.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{etf.assetclass}</p>
                        </div>

                        {/* Métrica principal com sparkline */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {category.valueFormatter(etf[category.valueKey as keyof ETF] as number)}
                            </p>
                            <p className="text-xs text-gray-500">{category.explanation}</p>
                          </div>
                          <MiniSparkline value={etf[category.valueKey as keyof ETF] as number} color="#3B82F6" />
                        </div>

                        {/* Métricas secundárias em grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {etf.expense_ratio && (
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">Taxa</p>
                              <p className="text-sm font-semibold text-gray-900">{(etf.expense_ratio).toFixed(2)}%</p>
                            </div>
                          )}
                          {etf.total_assets && (
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">Patrimônio</p>
                              <p className="text-sm font-semibold text-gray-900">{formatAssets(etf.total_assets)}</p>
                            </div>
                          )}
                        </div>

                        {/* Indicador de qualidade */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (index < 3 ? 5 : index < 7 ? 4 : 3)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer - Tesla style */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="bg-white p-8 border border-gray-200">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                                     <h3 className="text-lg font-medium text-[#202636] mb-4">
                     Aviso Importante
                   </h3>
                   <p className="text-gray-600 leading-relaxed">
                     Rentabilidade passada não garante resultados futuros. Estes rankings são baseados em dados históricos 
                     e são fornecidos apenas para fins educacionais. Sempre consulte um consultor financeiro qualificado 
                     antes de tomar decisões de investimento e considere seus objetivos de investimento, horizonte de tempo e tolerância ao risco.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
