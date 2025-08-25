'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  Award,
  Brain,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  Info,
  Target,
  Activity,
  Zap
} from 'lucide-react';

interface StockDetails {
  ticker: string;
  name: string;
  business_description: string;
  sector: string;
  industry: string;
  exchange: string;
  current_price: number;
  market_cap: number;
  shares_outstanding: number;
  volume_avg_30d: number;
  
  // Performance
  returns_12m: number;
  returns_24m: number;
  returns_36m: number;
  returns_5y: number;
  ten_year_return: number;
  
  // Volatilidade e Risco
  volatility_12m: number;
  volatility_24m: number;
  volatility_36m: number;
  ten_year_volatility: number;
  max_drawdown: number;
  
  // Sharpe Ratios
  sharpe_12m: number;
  sharpe_24m: number;
  sharpe_36m: number;
  ten_year_sharpe: number;
  
  // Dividendos
  dividend_yield_12m: number;
  dividends_12m: number;
  dividends_24m: number;
  dividends_36m: number;
  dividends_all_time: number;
  
  // Fundamentais
  pe_ratio: number;
  pb_ratio: number;
  ps_ratio: number;
  roe: number;
  roa: number;
  
  // Categorização
  size_category: string;
  liquidity_category: string;
  
  // Metadados
  source_meta: any;
  snapshot_date: string;
  
  // Análise de IA (se disponível)
  ai_analysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    key_strengths: string[];
    key_risks: string[];
    investment_thesis: string;
    analyst_rating: string;
    price_target: number;
  };
}

interface StockDetailsModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StockDetailsModal({ symbol, isOpen, onClose }: StockDetailsModalProps) {
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && symbol) {
      fetchStockDetails();
    }
  }, [isOpen, symbol]);

  const fetchStockDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stocks/details/${encodeURIComponent(symbol)}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStockDetails(data.stock);

    } catch (error) {
      console.error('Erro ao buscar detalhes da ação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number | null) => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number | null, showSign = true) => {
    if (value === null || value === undefined) return 'N/A';
    const sign = showSign && value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number | null, decimals = 2) => {
    if (!value) return 'N/A';
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const getPerformanceColor = (value: number | null) => {
    if (!value) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span>Detalhes da Ação: {symbol}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando detalhes da ação...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar detalhes</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchStockDetails}>Tentar Novamente</Button>
          </div>
        )}

        {stockDetails && !loading && !error && (
          <div className="space-y-6">
            {/* Header da Ação */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{stockDetails.ticker}</h2>
                  <p className="text-lg text-gray-600 mb-2">{stockDetails.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{stockDetails.sector}</Badge>
                    <Badge variant="outline">{stockDetails.industry}</Badge>
                    <Badge variant="outline">{stockDetails.exchange}</Badge>
                    <Badge variant="outline">{stockDetails.size_category}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stockDetails.current_price)}
                  </div>
                  <div className="text-sm text-gray-500">Preço Atual</div>
                </div>
              </div>
              
              {stockDetails.business_description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Descrição do Negócio</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {stockDetails.business_description}
                  </p>
                </div>
              )}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="fundamentals">Fundamentais</TabsTrigger>
                <TabsTrigger value="risk">Risco</TabsTrigger>
                <TabsTrigger value="ai">Análise IA</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Market Cap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatMarketCap(stockDetails.market_cap)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Volume Médio 30d</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(stockDetails.volume_avg_30d, 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Ações em Circulação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(stockDetails.shares_outstanding, 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Dividend Yield</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(stockDetails.dividend_yield_12m * 100, false)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Retorno 12m
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getPerformanceColor(stockDetails.returns_12m)}`}>
                        {formatPercentage(stockDetails.returns_12m)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Retorno 24m
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getPerformanceColor(stockDetails.returns_24m)}`}>
                        {formatPercentage(stockDetails.returns_24m)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Retorno 5 anos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getPerformanceColor(stockDetails.returns_5y)}`}>
                        {formatPercentage(stockDetails.returns_5y)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Sharpe 12m
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatNumber(stockDetails.sharpe_12m)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Volatilidade 12m
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercentage(stockDetails.volatility_12m, false)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Max Drawdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatPercentage(stockDetails.max_drawdown)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="fundamentals" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">P/E Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {stockDetails.pe_ratio ? `${stockDetails.pe_ratio.toFixed(1)}x` : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">P/B Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {stockDetails.pb_ratio ? `${stockDetails.pb_ratio.toFixed(1)}x` : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">P/S Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {stockDetails.ps_ratio ? `${stockDetails.ps_ratio.toFixed(1)}x` : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">ROE</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(stockDetails.roe, false)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">ROA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(stockDetails.roa, false)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Dividendos Totais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stockDetails.dividends_all_time)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        Análise de Risco
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volatilidade 12m:</span>
                        <span className="font-semibold">{formatPercentage(stockDetails.volatility_12m, false)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volatilidade 36m:</span>
                        <span className="font-semibold">{formatPercentage(stockDetails.volatility_36m, false)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Drawdown:</span>
                        <span className="font-semibold text-red-600">{formatPercentage(stockDetails.max_drawdown)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoria de Liquidez:</span>
                        <Badge variant="outline">{stockDetails.liquidity_category}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Eficiência Ajustada ao Risco
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sharpe Ratio 12m:</span>
                        <span className="font-semibold">{formatNumber(stockDetails.sharpe_12m)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sharpe Ratio 24m:</span>
                        <span className="font-semibold">{formatNumber(stockDetails.sharpe_24m)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sharpe Ratio 10 anos:</span>
                        <span className="font-semibold">{formatNumber(stockDetails.ten_year_sharpe)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                {stockDetails.ai_analysis ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-blue-600" />
                          Análise de IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Sentiment:</span>
                          <Badge className={getSentimentColor(stockDetails.ai_analysis.sentiment)}>
                            {getSentimentIcon(stockDetails.ai_analysis.sentiment)}
                            {stockDetails.ai_analysis.sentiment.charAt(0).toUpperCase() + stockDetails.ai_analysis.sentiment.slice(1)}
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Tese de Investimento</h4>
                          <p className="text-gray-700">{stockDetails.ai_analysis.investment_thesis}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-600 mb-2">Pontos Fortes</h4>
                            <ul className="space-y-1">
                              {stockDetails.ai_analysis.key_strengths.map((strength, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2">Riscos</h4>
                            <ul className="space-y-1">
                              {stockDetails.ai_analysis.key_risks.map((risk, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <span className="text-gray-600">Rating dos Analistas:</span>
                            <Badge variant="outline" className="ml-2">
                              {stockDetails.ai_analysis.analyst_rating}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Price Target:</span>
                            <span className="font-semibold text-blue-600 ml-2">
                              {formatCurrency(stockDetails.ai_analysis.price_target)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Análise de IA não disponível</h3>
                      <p className="text-gray-600">
                        A análise de IA para esta ação ainda não foi processada ou não está disponível.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Footer com ações */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Última atualização: {new Date(stockDetails.snapshot_date).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/stocks/${symbol}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Página Completa
                </Button>
                <Button onClick={onClose}>Fechar</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}



