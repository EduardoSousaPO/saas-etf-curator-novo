// src/app/rankings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ETF } from "../../types";
import Navbar from "@/components/layout/Navbar";
import AssistantChat from "@/components/assistant/AssistantChat";
import { toast } from "react-hot-toast";
import { TrendingUp, Award, DollarSign, BarChart3, Volume2, Shield, Activity } from "lucide-react";

interface RankingsData {
  top_returns_12m: ETF[];
  top_sharpe_12m: ETF[];
  top_dividend_yield: ETF[];
  largest_total_assets: ETF[];
  highest_volume: ETF[];
  lowest_max_drawdown: ETF[];
  lowest_volatility_12m: ETF[];
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Fetch rankings from the new Prisma-based API endpoint
        const response = await fetch('/api/etfs/rankings');
        if (!response.ok) {
          throw new Error('Failed to fetch rankings');
        }
        const data = await response.json();
        setRankings(data);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        toast.error('Failed to load ETF rankings');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-light text-gray-900 dark:text-white mb-6 text-center">
              ETF Rankings
            </h1>
            <div className="text-center py-20">
              <div className="animate-pulse text-xl text-gray-600 dark:text-gray-400 font-light">
                Carregando rankings...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rankings) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-light text-gray-900 dark:text-white mb-6 text-center">
              ETF Rankings
            </h1>
            <div className="text-center py-20">
              <div className="text-xl text-red-600 dark:text-red-400 font-light">
                Falha ao carregar rankings. Tente novamente mais tarde.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRankingIcon = (title: string) => {
    if (title.includes('Returns')) return <TrendingUp className="w-6 h-6 text-green-600" />;
    if (title.includes('Sharpe')) return <Award className="w-6 h-6 text-blue-600" />;
    if (title.includes('Dividend')) return <DollarSign className="w-6 h-6 text-purple-600" />;
    if (title.includes('Assets')) return <BarChart3 className="w-6 h-6 text-orange-600" />;
    if (title.includes('Volume')) return <Volume2 className="w-6 h-6 text-cyan-600" />;
    if (title.includes('Drawdown')) return <Shield className="w-6 h-6 text-red-600" />;
    if (title.includes('Volatility')) return <Activity className="w-6 h-6 text-gray-600" />;
    return <BarChart3 className="w-6 h-6 text-gray-600" />;
  };

  const renderRankingTable = (title: string, etfs: ETF[], metric: keyof ETF, isHigherBetter: boolean = true) => {
    return (
      <div className="mb-16">
        <div className="flex items-center space-x-3 mb-6">
          {getRankingIcon(title)}
          <h2 className="text-3xl font-light text-gray-900 dark:text-white">{title}</h2>
        </div>
        
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Rank</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nome</th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.toString().replace('_', ' ').toUpperCase()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {etfs.map((etf, index) => (
                  <tr 
                    key={etf.symbol} 
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                        index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{etf.symbol}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-light max-w-xs truncate">
                      {etf.name}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-900 dark:text-white">
                      {metric === 'dividend_yield' || metric === 'returns_12m' || metric === 'volatility_12m' || metric === 'max_drawdown'
                        ? `${Number(etf[metric]).toFixed(2)}%`
                        : metric === 'total_assets'
                        ? `$${(Number(etf[metric]) / 1_000_000_000).toFixed(2)}B`
                        : metric === 'volume'
                        ? `${(Number(etf[metric]) / 1_000_000).toFixed(1)}M`
                        : Number(etf[metric]).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white mb-6">
              ETF Rankings
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-light">
              Classificações inteligentes baseadas em performance, risco e qualidade dos melhores ETFs do mercado.
            </p>
          </div>
        </div>
      </section>

      {/* Rankings Content */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {renderRankingTable('Maiores Retornos (12 Meses)', rankings.top_returns_12m, 'returns_12m')}
          {renderRankingTable('Melhor Índice Sharpe (12 Meses)', rankings.top_sharpe_12m, 'sharpe_12m')}
          {renderRankingTable('Maior Dividend Yield', rankings.top_dividend_yield, 'dividend_yield')}
          {renderRankingTable('Maiores ETFs por Patrimônio', rankings.largest_total_assets, 'total_assets')}
          {renderRankingTable('Maior Volume de Negociação', rankings.highest_volume, 'volume')}
          {renderRankingTable('Menor Drawdown Máximo', rankings.lowest_max_drawdown, 'max_drawdown', false)}
          {renderRankingTable('Menor Volatilidade (12 Meses)', rankings.lowest_volatility_12m, 'volatility_12m', false)}
        </div>
      </section>
      
      {/* Assistente Virtual */}
      <AssistantChat />
    </div>
  );
}
