"use client";

import React, { useState, useEffect } from 'react';

interface ETFData {
  symbol: string;
  name: string;
  assetclass: string;
  etfcompany: string;
  returns_12m: number;
  volatility_12m: number;
  sharpe_12m: number;
  dividend_yield: number;
}

interface ShowcaseData {
  featured: ETFData[];
  categories: {
    topSharpe: ETFData[];
    topReturn: ETFData[];
    lowVolatility: ETFData[];
    highDividend: ETFData[];
  };
  lastUpdated: string;
}

function ETFCard({ etf }: { etf: ETFData }) {
  const formatPercentage = (value: number) => {
    // CORREÇÃO: Os dados vêm em formato decimal do banco (0.359224 = 35.92%)
    return `${(Number(value) * 100).toFixed(2)}%`;
  };

  const formatSharpe = (value: number) => {
    return value.toFixed(2);
  };

  const getAssetClassColor = (assetClass: string) => {
    switch (assetClass?.toLowerCase()) {
      case 'equity':
        return 'bg-green-100 text-green-800';
      case 'fixed income':
        return 'bg-blue-100 text-blue-800';
      case 'commodity':
        return 'bg-yellow-100 text-yellow-800';
      case 'real estate':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReturnColor = (returns: number) => {
    return returns >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {etf.symbol}
        </div>
        <div className={`text-sm px-2 py-1 rounded ${getAssetClassColor(etf.assetclass)}`}>
          {etf.assetclass}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3 line-clamp-2">
        {etf.name}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Retorno 12m:</span>
          <span className={`text-sm font-semibold ${getReturnColor(etf.returns_12m)}`}>
            {formatPercentage(etf.returns_12m)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Sharpe:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatSharpe(etf.sharpe_12m)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Volatilidade:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatPercentage(etf.volatility_12m)}
          </span>
        </div>
        
        {etf.dividend_yield > 0 && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Dividend Yield:</span>
            <span className="text-sm font-semibold text-blue-600">
              {formatPercentage(etf.dividend_yield)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          {etf.etfcompany}
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-100 rounded w-20"></div>
      </div>
      <div className="h-4 bg-gray-100 rounded mb-3"></div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded w-20"></div>
          <div className="h-3 bg-gray-100 rounded w-12"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded w-16"></div>
          <div className="h-3 bg-gray-100 rounded w-10"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded w-24"></div>
          <div className="h-3 bg-gray-100 rounded w-14"></div>
        </div>
      </div>
    </div>
  );
}

export default function ETFShowcase() {
  const [showcaseData, setShowcaseData] = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShowcase = async () => {
      try {
        console.log('🔍 Carregando showcase de ETFs...');
        
        const response = await fetch('/api/landing/showcase');
        const result = await response.json();
        
        if (result.success) {
          setShowcaseData(result.data);
          console.log('✅ Showcase carregado:', result.data);
        } else {
          throw new Error(result.error || 'Erro ao carregar showcase');
        }
      } catch (err) {
        console.error('❌ Erro ao carregar showcase:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        
        // Fallback para dados estáticos
        const fallbackETFs = [
          {
            symbol: 'SGOV',
            name: 'iShares 0-3 Month Treasury Bond ETF',
            assetclass: 'Fixed Income',
            etfcompany: 'iShares',
            returns_12m: 0.0541,
            volatility_12m: 0.0024,
            sharpe_12m: 21.79,
            dividend_yield: 0.0528
          },
          {
            symbol: 'SHV',
            name: 'iShares Short Treasury Bond ETF',
            assetclass: 'Fixed Income',
            etfcompany: 'iShares',
            returns_12m: 0.0528,
            volatility_12m: 0.0028,
            sharpe_12m: 18.43,
            dividend_yield: 0.0515
          },
          {
            symbol: 'ARKG',
            name: 'ARK Genomic Revolution ETF',
            assetclass: 'Equity',
            etfcompany: 'ARK',
            returns_12m: 0.0304,
            volatility_12m: 0.1703,
            sharpe_12m: 22.35,
            dividend_yield: 0.0000
          },
          {
            symbol: 'MBCC',
            name: 'Monarch Blue Chips Core ETF',
            assetclass: 'Equity',
            etfcompany: 'Monarch',
            returns_12m: 0.0108,
            volatility_12m: 0.0327,
            sharpe_12m: 27.74,
            dividend_yield: 0.0200
          }
        ];

        setShowcaseData({
          featured: fallbackETFs,
          categories: {
            topSharpe: fallbackETFs,
            topReturn: fallbackETFs,
            lowVolatility: fallbackETFs,
            highDividend: fallbackETFs
          },
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadShowcase();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              ETFs de Destaque
            </h2>
            <p className="text-lg text-gray-600">
              Carregando os melhores ETFs da nossa base de dados...
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!showcaseData) {
    return null;
  }

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            ETFs de Destaque
          </h2>
          <p className="text-lg text-gray-600">
            {error ? 
              'Alguns dos melhores ETFs por índice Sharpe em nossa base de dados' :
              'Os melhores ETFs selecionados em tempo real da nossa base de dados'
            }
          </p>
          
          {error && (
            <div className="mt-2">
              <p className="text-sm text-yellow-600">
                ⚠️ Usando dados em cache devido a erro de conexão
              </p>
            </div>
          )}
          
          {!error && (
            <div className="mt-2">
              <p className="text-sm text-gray-400">
                Atualizado em tempo real • Última atualização: {new Date(showcaseData.lastUpdated).toLocaleTimeString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseData.featured.map((etf, index) => (
            <div 
              key={etf.symbol} 
              className="animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ETFCard etf={etf} />
            </div>
          ))}
        </div>

        {/* Indicador de dados em tempo real */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`}></div>
            <span>
              {error ? 'Dados em cache' : 'Dados em tempo real'}
            </span>
          </div>
        </div>

        {/* Botão CTA */}
        <div className="text-center mt-12">
          <button
            className="px-12 py-4 text-white font-light text-lg rounded-xl hover:opacity-90 transition-all duration-300"
            style={{ backgroundColor: '#202636' }}
            onClick={() => window.location.href = '/screener'}
          >
            Descubra aqui os melhores ETFs para você
          </button>
        </div>
      </div>
    </section>
  );
} 