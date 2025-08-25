// src/app/stocks/rankings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import UnifiedNavbar from "@/components/layout/UnifiedNavbar";
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
  Gauge,
  ExternalLink,
  Building2
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  stock_price: number;
  market_cap: number;
  returns_12m: number;
  volatility_12m: number;
  sharpe_12m: number;
  dividend_yield_12m: number;
  pe_ratio: number;
  max_drawdown: number;
  volume_avg_30d: number;
}

// Função auxiliar para formatar market cap
const formatMarketCap = (value: number | null | undefined): string => {
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

// Função para obter label da métrica por categoria
const getCategoryMetricLabel = (categoryKey: string): string => {
  switch (categoryKey) {
    case 'best_performers':
    case 'growth_stocks':
    case 'momentum_stocks':
      return 'Retorno 12m';
    case 'value_stocks':
      return 'P/E Ratio';
    case 'dividend_champions':
      return 'Dividend Yield';
    case 'low_volatility':
      return 'Volatilidade';
    default:
      return 'Métrica';
  }
};

// Função para formatar valor da métrica por categoria - CORRIGIDA
const formatCategoryValue = (categoryKey: string, stock: any): string => {
  switch (categoryKey) {
    case 'best_performers':
    case 'growth_stocks':
    case 'momentum_stocks':
      const returns = stock.returns_12m;
      if (!returns) return 'N/A';
      // CORREÇÃO: Dados do banco já estão em formato percentual (25.4 = 25.4%)
      const returnsPct = parseFloat(returns);
      return returnsPct >= 0 ? `+${returnsPct.toFixed(1)}%` : `${returnsPct.toFixed(1)}%`;
    
    case 'value_stocks':
      return stock.pe_ratio ? `${parseFloat(stock.pe_ratio).toFixed(1)}x` : 'N/A';
    
    case 'dividend_champions':
      const divYield = stock.dividend_yield_12m;
      if (!divYield) return 'N/A';
      // CORREÇÃO: Dados do banco em formato decimal (0.0224 = 2.24%)
      const divPct = parseFloat(divYield) * 100;
      return `${divPct.toFixed(2)}%`;
    
    case 'low_volatility':
      const vol = stock.volatility_12m;
      if (!vol) return 'N/A';
      // CORREÇÃO: Dados do banco já estão em formato percentual
      const volPct = parseFloat(vol);
      return `${volPct.toFixed(1)}%`;
    
    default:
      return 'N/A';
  }
};

interface RankingsData {
  rankings: {
    best_performers: Stock[];
    value_stocks: Stock[];
    growth_stocks: Stock[];
    dividend_champions: Stock[];
    low_volatility: Stock[];
    momentum_stocks: Stock[];
  };
  category: string;
  limit: number;
  available_categories: string[];
  _source: string;
  _timestamp: string;
}

// Configuração das categorias com design Tesla e explicações didáticas
const RANKING_CATEGORIES = {
  best_performers: {
    title: "Melhor Performance",
    subtitle: "Maiores retornos em 12 meses",
    description: "Top 10 ações que mais valorizaram nos últimos 12 meses, ordenadas por retorno decrescente.",
    explanation: "Retorno percentual em 12 meses"
  },
  value_stocks: {
    title: "Ações de Valor",
    subtitle: "Melhores oportunidades de valor",
    description: "Ações de empresas sólidas, negociadas a preços baixos em relação ao lucro (P/E), consideradas \"baratas\" e com bons fundamentos.",
    explanation: "Relação Preço/Lucro"
  },
  growth_stocks: {
    title: "Ações de Crescimento",
    subtitle: "Maior potencial de crescimento",
    description: "Ações de empresas que apresentam forte crescimento de receita e potencial de expansão acima da média.",
    explanation: "Crescimento em 12 meses"
  },
  dividend_champions: {
    title: "Campeões de Dividendos",
    subtitle: "Maiores rendimentos em dividendos",
    description: "Ações que pagaram os maiores dividend yields, gerando renda passiva consistente aos acionistas.",
    explanation: "Dividend yield anual"
  },
  low_volatility: {
    title: "Baixa Volatilidade",
    subtitle: "Menor risco e estabilidade",
    description: "Ações consideradas mais estáveis, com variações de preço menores e menor risco para o investidor.",
    explanation: "Volatilidade em 12 meses"
  },
  momentum_stocks: {
    title: "Momentum Positivo",
    subtitle: "Tendência de alta consistente",
    description: "Ações com tendência recente de alta nos preços, mostrando forte desempenho no curto prazo.",
    explanation: "Performance recente"
  }
};

export default function StocksRankingsPage() {
  const [rankingsData, setRankingsData] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('best_performers');

  useEffect(() => {
    loadRankingsData();
  }, []);

  const loadRankingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stocks/rankings');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.rankings) {
        throw new Error('Dados de rankings não encontrados');
      }

      setRankingsData(data);
      console.log('✅ Rankings de stocks carregados:', data);

    } catch (error) {
      console.error('❌ Erro ao carregar rankings de stocks:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Erro ao carregar rankings de ações');
    } finally {
      setLoading(false);
    }
  };

  const handleStockClick = (symbol: string) => {
    window.open(`/stocks/${symbol}`, '_blank');
  };

  const renderStockCard = (stock: Stock, index: number, categoryKey: string) => {
    const category = RANKING_CATEGORIES[categoryKey as keyof typeof RANKING_CATEGORIES];
    const IconComponent = category.icon;
    const value = stock[category.valueKey as keyof Stock] as number;

    return (
      <div
        key={stock.symbol}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => handleStockClick(stock.symbol)}
      >
        {/* Header com ranking */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{stock.symbol}</h3>
              <p className="text-sm text-gray-600 truncate max-w-xs">{stock.company_name}</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
        </div>

        {/* Setor e Indústria */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs mb-1">
            {stock.sector}
          </Badge>
          {stock.industry && (
            <p className="text-xs text-gray-500">{stock.industry}</p>
          )}
        </div>

        {/* Métricas principais */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Preço</span>
            <span className="font-semibold">
              ${stock.stock_price?.toFixed(2) || 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Market Cap</span>
            <span className="font-semibold">
              {formatMarketCap(stock.market_cap)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{category.explanation}</span>
            <span className="font-bold text-blue-600">
              {category.valueFormatter(value)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCategorySection = (categoryKey: string) => {
    const category = RANKING_CATEGORIES[categoryKey as keyof typeof RANKING_CATEGORIES];
    const stocks = rankingsData?.rankings[categoryKey as keyof typeof rankingsData.rankings]?.stocks || [];

    return (
      <div key={categoryKey} className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          {/* Header Tesla-style */}
          <h2 className="text-3xl font-light text-black mb-4">{category.title}</h2>
          {/* Texto explicativo didático */}
          <p className="text-gray-600 font-light text-lg mb-12 max-w-4xl leading-relaxed">
            {category.description}
          </p>
          
          {/* Grid Tesla-style - 5 colunas para mostrar top 10 */}
          {stocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {stocks.slice(0, 10).map((stock: any, index: number) => (
                <div key={stock.symbol} className="group cursor-pointer">
                  <div className="mb-4">
                    {/* Numeração Tesla-style */}
                    <div className="text-4xl font-thin text-gray-400 mb-2">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-xl font-medium text-black">{stock.symbol}</h3>
                    <p className="text-gray-600 font-light text-sm truncate">
                      {stock.company_name}
                    </p>
                  </div>
                  
                  {/* Métricas Tesla-style */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Preço</span>
                      <span className="font-medium">
                        ${stock.stock_price?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Market Cap</span>
                      <span className="font-medium">
                        {formatMarketCap(stock.market_cap)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">
                        {getCategoryMetricLabel(categoryKey)}
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCategoryValue(categoryKey, stock)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg font-light">
                Nenhuma ação encontrada nesta categoria
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <UnifiedNavbar />
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8">
                <h1 className="text-6xl font-light text-black mb-4">Rankings de Ações</h1>
                <p className="text-gray-600 text-lg">Carregando rankings...</p>
              </div>
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
          <UnifiedNavbar />
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8">
                <h1 className="text-6xl font-light text-black mb-4">Rankings de Ações</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-800">Erro: {error}</p>
                  <Button 
                    onClick={loadRankingsData}
                    className="mt-4"
                    variant="outline"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <UnifiedNavbar />
        
        {/* HEADER TESLA-STYLE MINIMALISTA */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-6xl font-thin text-black mb-6">Rankings de Ações</h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl">
              Descubra as melhores ações americanas organizadas por categoria
            </p>
            
            {/* Estatísticas Tesla-style */}
            {rankingsData && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-thin text-black mb-2">
                    {Object.keys(rankingsData.rankings).length}
                  </div>
                  <div className="text-gray-600 font-light">Categorias</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-thin text-black mb-2">60</div>
                  <div className="text-gray-600 font-light">Ações Selecionadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-thin text-black mb-2">Real-time</div>
                  <div className="text-gray-600 font-light">Dados Atualizados</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Tesla-style - Seções por categoria */}
        {rankingsData && Object.keys(RANKING_CATEGORIES).map(categoryKey => 
          renderCategorySection(categoryKey)
        )}
      </div>
    </RequireAuth>
  );
}

