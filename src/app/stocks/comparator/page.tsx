"use client";

import React, { useState, useEffect } from 'react';
import UnifiedNavbar from '@/components/layout/UnifiedNavbar';
import RequireAuth from '@/components/auth/RequireAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ExternalLink,
  Building2,
  Users,
  Gauge
} from 'lucide-react';

interface Stock {
  symbol: string;
  company_name?: string | null;
  sector?: string | null;
  industry?: string | null;
  stock_price?: number | null;
  market_cap?: number | null;
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  volatility_12m?: number | null;
  sharpe_12m?: number | null;
  max_drawdown?: number | null;
  dividend_yield_12m?: number | null;
  pe_ratio?: number | null;
  pb_ratio?: number | null;
  roe?: number | null;
  volume_avg_30d?: number | null;
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

export default function StocksComparatorPage() {
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Carregar perfil do usuário do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('etf-curator-profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Buscar ações
  const searchStocks = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stocks/screener?search_term=${encodeURIComponent(term)}&limit=10`);
      const data = await response.json();
      
      if (data.stocks) {
        setSearchResults(data.stocks);
      }
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Adicionar ação à comparação
  const addStock = (stock: Stock) => {
    if (selectedStocks.length >= 5) {
      alert('Máximo de 5 ações para comparação');
      return;
    }
    
    // Verificar se já está selecionada
    if (selectedStocks.some(s => s.symbol === stock.symbol)) {
      alert('Esta ação já está sendo comparada');
      return;
    }
    
    setSelectedStocks([...selectedStocks, stock]);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Remover ação da comparação
  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.symbol !== symbol));
  };

  // Formatadores
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return `${value.toFixed(2)}x`;
  };

  // Análise rápida baseada no perfil
  const getQuickAnalysis = () => {
    if (selectedStocks.length < 2) return null;

    const analysis = {
      bestPerformer: selectedStocks.reduce((best, current) => 
        (current.returns_12m || 0) > (best.returns_12m || 0) ? current : best
      ),
      mostStable: selectedStocks.reduce((stable, current) => 
        (current.volatility_12m || 999) < (stable.volatility_12m || 999) ? current : stable
      ),
      bestValue: selectedStocks.reduce((value, current) => 
        (current.pe_ratio || 999) < (value.pe_ratio || 999) ? current : value
      ),
      bestDividend: selectedStocks.reduce((dividend, current) => 
        (current.dividend_yield_12m || 0) > (dividend.dividend_yield_12m || 0) ? current : dividend
      )
    };

    return analysis;
  };

  const quickAnalysis = getQuickAnalysis();

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
      
        <div className="max-w-6xl mx-auto px-6 py-20">
          
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-6xl font-light text-black mb-6">Comparador de Ações</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Compare ações lado a lado para tomar decisões de investimento mais informadas
            </p>
          </div>

          {/* Busca de Ações */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Ações para Comparar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Digite o símbolo ou nome da ação (ex: AAPL, Apple)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Resultados da busca */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => addStock(stock)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{stock.symbol}</h3>
                          <p className="text-sm text-gray-600">{stock.company_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(stock.stock_price)}</p>
                        <p className="text-sm text-gray-600">{stock.sector}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loading && (
                <div className="mt-4 text-center text-gray-500">
                  Buscando ações...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Selecionadas */}
          {selectedStocks.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Ações Selecionadas ({selectedStocks.length}/5)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedStocks.map((stock) => (
                    <Badge
                      key={stock.symbol}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1"
                    >
                      {stock.symbol}
                      <button
                        onClick={() => removeStock(stock.symbol)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise Rápida */}
          {quickAnalysis && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Análise Rápida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Melhor Performance</span>
                    </div>
                    <p className="font-bold text-green-900">{quickAnalysis.bestPerformer.symbol}</p>
                    <p className="text-sm text-green-700">
                      {formatPercentage(quickAnalysis.bestPerformer.returns_12m)} em 12m
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Mais Estável</span>
                    </div>
                    <p className="font-bold text-blue-900">{quickAnalysis.mostStable.symbol}</p>
                    <p className="text-sm text-blue-700">
                      {formatPercentage(quickAnalysis.mostStable.volatility_12m)} volatilidade
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Melhor Valor</span>
                    </div>
                    <p className="font-bold text-purple-900">{quickAnalysis.bestValue.symbol}</p>
                    <p className="text-sm text-purple-700">
                      P/E: {formatRatio(quickAnalysis.bestValue.pe_ratio)}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Melhor Dividendo</span>
                    </div>
                    <p className="font-bold text-orange-900">{quickAnalysis.bestDividend.symbol}</p>
                    <p className="text-sm text-orange-700">
                      {formatPercentage(quickAnalysis.bestDividend.dividend_yield_12m * 100)} yield
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabela de Comparação */}
          {selectedStocks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparação Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-gray-900">Métrica</th>
                        {selectedStocks.map((stock) => (
                          <th key={stock.symbol} className="text-center py-3 px-2 font-medium text-gray-900">
                            <div>
                              <div className="font-bold">{stock.symbol}</div>
                              <div className="text-xs text-gray-600 font-normal truncate max-w-24">
                                {stock.company_name}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Informações Básicas */}
                      <tr className="bg-gray-50">
                        <td className="py-2 px-2 font-medium text-gray-700" colSpan={selectedStocks.length + 1}>
                          Informações Básicas
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">Preço Atual</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {formatCurrency(stock.stock_price)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">Market Cap</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {formatMarketCap(stock.market_cap)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">Setor</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center text-xs">
                            {stock.sector || 'N/A'}
                          </td>
                        ))}
                      </tr>

                      {/* Performance */}
                      <tr className="bg-gray-50">
                        <td className="py-2 px-2 font-medium text-gray-700" colSpan={selectedStocks.length + 1}>
                          Performance
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">Retorno 12m</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            <span className={`${(stock.returns_12m || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(stock.returns_12m)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">Volatilidade 12m</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {formatPercentage(stock.volatility_12m)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">Sharpe Ratio</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {stock.sharpe_12m?.toFixed(2) || 'N/A'}
                          </td>
                        ))}
                      </tr>

                      {/* Fundamentais */}
                      <tr className="bg-gray-50">
                        <td className="py-2 px-2 font-medium text-gray-700" colSpan={selectedStocks.length + 1}>
                          Fundamentais
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">P/E Ratio</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {formatRatio(stock.pe_ratio)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">P/B Ratio</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {formatRatio(stock.pb_ratio)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">ROE</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {formatPercentage(stock.roe)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-gray-600">Dividend Yield</td>
                        {selectedStocks.map((stock) => (
                          <td key={stock.symbol} className="py-2 px-2 text-center">
                            {formatPercentage((stock.dividend_yield_12m || 0) * 100)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estado vazio */}
          {selectedStocks.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma ação selecionada
              </h3>
              <p className="text-gray-600 mb-6">
                Use a busca acima para encontrar e comparar ações
              </p>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

