// src/app/rankings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ETF } from "../../types";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";

import { toast } from "react-hot-toast";
import { TrendingUp, Award, DollarSign, BarChart3, Volume2, Shield, Activity } from "lucide-react";

interface RankingsData {
  top_returns_12m: ETF[];
  top_sharpe_12m: ETF[];
  top_dividend_yield: ETF[];
  highest_volume: ETF[];
  lowest_max_drawdown: ETF[];
  lowest_volatility_12m: ETF[];
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    
    // CORREÇÃO: Os dados já vêm em formato percentual do banco
    // Remover a multiplicação por 100 que estava causando valores incorretos
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

  // Componente para renderizar uma tabela de ranking
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        {icon}
        <div className="ml-3">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">({data.length} ETFs)</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-600">Rank</th>
              <th className="text-left py-2 text-gray-600">Symbol</th>
              <th className="text-left py-2 text-gray-600">Nome</th>
              <th className="text-right py-2 text-gray-600">{title.split(' ').pop()}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((etf, index) => (
              <tr key={etf.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3">
                  <span className="font-medium text-gray-900">{etf.symbol}</span>
                </td>
                <td className="py-3">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {etf.name || 'Nome não disponível'}
                    </p>
                    <p className="text-xs text-gray-500">{etf.assetclass}</p>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className={`font-medium ${
                    valueKey === 'returns_12m' ? getValueColor(etf[valueKey] as number) :
                    valueKey === 'max_drawdown' ? getValueColor(etf[valueKey] as number, false) :
                    'text-gray-900'
                  }`}>
                    {valueFormatter(etf[valueKey])}
                  </span>
                </td>
              </tr>
            ))}
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rankings de ETFs</h1>
          <p className="text-gray-600">
            Descubra os melhores ETFs em diferentes categorias de performance e risco
          </p>
        </div>

        {/* Grid de Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Maiores Retornos */}
          <RankingTable
            title="Maiores Retornos (12 Meses)"
            data={rankings.top_returns_12m}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            valueKey="returns_12m"
            valueFormatter={formatPercentage}
            description="ETFs com os maiores retornos acumulados nos últimos 12 meses"
          />

          {/* Melhor Sharpe */}
          <RankingTable
            title="Melhor Índice Sharpe (12 Meses)"
            data={rankings.top_sharpe_12m}
            icon={<Award className="w-6 h-6 text-blue-600" />}
            valueKey="sharpe_12m"
            valueFormatter={formatNumber}
            description="ETFs com melhor relação risco-retorno (Sharpe Ratio)"
          />

          {/* Maior Dividend Yield */}
          <RankingTable
            title="Maior Dividend Yield"
            data={rankings.top_dividend_yield}
            icon={<DollarSign className="w-6 h-6 text-purple-600" />}
            valueKey="dividend_yield"
            valueFormatter={formatPercentage}
            description="ETFs que pagam os maiores dividendos em relação ao preço"
          />

          {/* Maior Volume - Mudança aqui */}
          <RankingTable
            title="Maior Volume de Negociação"
            data={rankings.highest_volume}
            icon={<Volume2 className="w-6 h-6 text-indigo-600" />}
            valueKey="avgvolume"
            valueFormatter={formatLargeNumber}
            description="ETFs com maior volume médio diário de negociação"
          />

          {/* Menor Drawdown */}
          <RankingTable
            title="Menor Drawdown Máximo"
            data={rankings.lowest_max_drawdown}
            icon={<Shield className="w-6 h-6 text-green-600" />}
            valueKey="max_drawdown"
            valueFormatter={formatPercentage}
            description="ETFs com menor queda máxima desde o pico histórico"
          />

          {/* Menor Volatilidade */}
          <RankingTable
            title="Menor Volatilidade (12 Meses)"
            data={rankings.lowest_volatility_12m}
            icon={<Activity className="w-6 h-6 text-teal-600" />}
            valueKey="volatility_12m"
            valueFormatter={formatPercentage}
            description="ETFs com menor volatilidade nos últimos 12 meses"
          />

        </div>

        {/* Footer com informações */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Sobre os Rankings</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Os dados são atualizados diariamente com base nas cotações mais recentes</p>
            <p>• Rankings filtram valores anômalos para garantir qualidade dos dados</p>
            <p>• Dividend Yield é calculado com base nos dividendos dos últimos 12 meses</p>
            <p>• Volume representa a média diária de negociação dos últimos 30 dias</p>
          </div>
        </div>
        </div>
      </div>
    </RequireAuth>
  );
}
