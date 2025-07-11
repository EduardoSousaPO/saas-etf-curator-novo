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
  ArrowDown
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  };
}

// Configuração das categorias com design Tesla - sem emojis, linguagem limpa
const RANKING_CATEGORIES = {
  top_returns_12m: {
    title: "Best Performance",
    subtitle: "Highest 12-month returns",
    description: "ETFs with the strongest performance over the past 12 months",
    icon: TrendingUp,
    valueKey: "returns_12m",
    valueFormatter: (value: number) => `+${value.toFixed(2)}%`,
    explanation: "12-month return percentage"
  },
  top_sharpe_12m: {
    title: "Risk-Adjusted Returns",
    subtitle: "Optimal risk-return ratio",
    description: "ETFs delivering superior returns relative to risk taken",
    icon: Star,
    valueKey: "sharpe_12m",
    valueFormatter: (value: number) => value.toFixed(2),
    explanation: "Sharpe ratio measures return per unit of risk"
  },
  top_dividend_yield: {
    title: "Income Generation",
    subtitle: "Highest dividend yields",
    description: "ETFs providing consistent dividend income",
    icon: DollarSign,
    valueKey: "dividend_yield",
    valueFormatter: (value: number) => `${value.toFixed(2)}%`,
    explanation: "Annual dividend yield percentage"
  },
  highest_volume: {
    title: "Market Liquidity",
    subtitle: "Most traded ETFs",
    description: "ETFs with highest trading volume and liquidity",
    icon: Volume2,
    valueKey: "avgvolume",
    valueFormatter: (value: number) => {
      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    },
    explanation: "Average daily trading volume"
  },
  lowest_max_drawdown: {
    title: "Downside Protection",
    subtitle: "Lowest maximum drawdown",
    description: "ETFs with minimal peak-to-trough decline",
    icon: Shield,
    valueKey: "max_drawdown",
    valueFormatter: (value: number) => `${Math.abs(value).toFixed(2)}%`,
    explanation: "Maximum decline from peak to trough"
  },
  lowest_volatility_12m: {
    title: "Price Stability",
    subtitle: "Lowest volatility",
    description: "ETFs with most consistent price movements",
    icon: BarChart3,
    valueKey: "volatility_12m",
    valueFormatter: (value: number) => `${value.toFixed(2)}%`,
    explanation: "12-month price volatility"
  }
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
              <p className="text-lg text-gray-600">Loading rankings...</p>
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
              <h2 className="text-2xl font-light text-black mb-4">Unable to load rankings</h2>
              <p className="text-lg text-gray-600 mb-8">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-black text-white px-8 py-3 rounded-none hover:bg-gray-800"
              >
                Try Again
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
            <h1 className="text-6xl font-light text-black mb-6 tracking-tight">
              ETF Rankings
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
              Discover top-performing ETFs across key performance metrics. 
              Data-driven insights to guide your investment decisions.
            </p>
            
            {/* Stats - Tesla minimalist style */}
            {rankings?._metadata && (
              <div className="flex items-center justify-center gap-16 text-gray-500">
                <div className="text-center">
                  <div className="text-3xl font-light text-black">{rankings._metadata.total_categories}</div>
                  <div className="text-sm uppercase tracking-wide">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-black">{rankings._metadata.total_etfs}</div>
                  <div className="text-sm uppercase tracking-wide">ETFs Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-black">Live</div>
                  <div className="text-sm uppercase tracking-wide">Data</div>
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
                const data = rankings?.[key as keyof RankingsData] as ETF[] || [];
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
                        <category.icon className="h-6 w-6 text-black" />
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                      </div>
                      <h3 className="text-2xl font-light text-black mb-2">
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
                                <div className="w-8 h-8 bg-black text-white text-sm flex items-center justify-center font-light">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-black">{etf.symbol}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-[200px]">{etf.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-black">
                                  {category.valueFormatter(etf[category.valueKey as keyof ETF] as number)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">
                            Data not available
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
                    <h2 className="text-4xl font-light text-black mb-4">
                      {RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES].title}
                    </h2>
                    <p className="text-xl text-gray-600">
                      {RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES].description}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory(null)}
                    className="border-black text-black hover:bg-black hover:text-white px-8 py-3 rounded-none"
                  >
                    Close
                  </Button>
                </div>
                
                {/* Full Rankings List */}
                <div className="space-y-4">
                  {(rankings[selectedCategory as keyof RankingsData] as ETF[])?.map((etf, index) => (
                    <div key={etf.symbol} className="flex items-center justify-between py-6 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 flex items-center justify-center text-lg font-light ${
                          index < 3 ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-xl font-medium text-black mb-1">{etf.symbol}</div>
                          <div className="text-gray-600 max-w-md">{etf.name}</div>
                          <div className="text-sm text-gray-400 mt-1">{etf.assetclass}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-light text-black">
                          {RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES].valueFormatter(etf[RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES].valueKey as keyof ETF] as number)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {RANKING_CATEGORIES[selectedCategory as keyof typeof RANKING_CATEGORIES].explanation}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <h3 className="text-lg font-medium text-black mb-4">
                    Important Notice
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Past performance does not guarantee future results. These rankings are based on historical data 
                    and are provided for educational purposes only. Always consult with a qualified financial advisor 
                    before making investment decisions and consider your investment objectives, time horizon, and risk tolerance.
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
