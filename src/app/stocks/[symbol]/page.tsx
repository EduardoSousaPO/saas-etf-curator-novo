'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UnifiedNavbar from '@/components/layout/UnifiedNavbar';
import RequireAuth from '@/components/auth/RequireAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Activity,
  Building2,
  Globe,
  Users,
  Target,
  Zap,
  ExternalLink,
  Info
} from 'lucide-react';

interface StockDetails {
  symbol: string;
  company_name: string;
  business_description: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  
  financial_data: {
    stock_price: number;
    market_cap: number;
    shares_outstanding: number;
    avg_volume: number;
    market_cap_formatted: string;
  };
  
  performance: {
    returns: {
      '12m': number;
      '24m': number;
      '36m': number;
      '5y': number;
      '10y': number;
    };
    volatility: {
      '12m': number;
      '24m': number;
      '36m': number;
      '10y': number;
    };
    risk_metrics: {
      max_drawdown: number;
      beta_coefficient: number;
      sharpe_12m: number;
      sharpe_24m: number;
      sharpe_36m: number;
      ten_year_sharpe: number;
    };
  };
  
  dividends: {
    yield_12m: number;
    amount_12m: number;
    amount_24m: number;
    amount_36m: number;
    amount_all_time: number;
    frequency: string;
  };
  
  fundamentals: {
    valuation: {
      pe_ratio: number;
      peg_ratio: number;
      pb_ratio: number;
      ps_ratio: number;
    };
    profitability: {
      roe: number;
      roa: number;
      roi: number;
      profit_margin: number;
    };
    financial_health: {
      debt_to_equity: number;
      current_ratio: number;
    };
  };
  
  categories: {
    size_category: string;
    liquidity_category: string;
  };
  
  ai_analysis: {
    investment_thesis: string;
    risk_analysis: string;
    market_context: string;
    use_cases: string;
    analysis_date: string;
    analysis_version: string;
  };
  
  metadata: {
    last_updated: string;
    data_quality: string;
    completeness_score: number;
  };
}

export default function StockDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbol) {
      loadStockDetails();
    }
  }, [symbol]);

  const loadStockDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stocks/details/${symbol.toUpperCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ação não encontrada');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStockDetails(data);

    } catch (error) {
      console.error('Erro ao carregar detalhes da ação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
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

  const formatNumber = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <UnifiedNavbar />
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center py-16">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando detalhes da ação...</p>
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
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Button 
              onClick={() => router.back()} 
              variant="ghost" 
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar ação</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={loadStockDetails}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!stockDetails) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <UnifiedNavbar />
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Ação não encontrada</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
        
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => router.back()} 
              variant="ghost" 
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{stockDetails.symbol}</h1>
                      <h2 className="text-xl text-gray-600">{stockDetails.company_name}</h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{stockDetails.sector}</Badge>
                    <Badge variant="outline">{stockDetails.industry}</Badge>
                    <Badge variant="outline">{stockDetails.exchange}</Badge>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {stockDetails.business_description}
                  </p>
                </div>
                
                <div className="text-right ml-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(stockDetails.financial_data.stock_price)}
                  </div>
                  <div className="text-lg text-gray-600">
                    {stockDetails.financial_data.market_cap_formatted}
                  </div>
                  <div className={`text-sm font-medium ${
                    (stockDetails.performance.returns['12m'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(stockDetails.performance.returns['12m'])} (12m)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance 12m
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (stockDetails.performance.returns['12m'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(stockDetails.performance.returns['12m'])}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Volatilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercentage(stockDetails.performance.volatility['12m'])}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  P/E Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatRatio(stockDetails.fundamentals.valuation.pe_ratio)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Dividend Yield
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercentage(stockDetails.dividends.yield_12m)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seções Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Histórica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">12 meses</span>
                    <span className={`font-semibold ${
                      (stockDetails.performance.returns['12m'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(stockDetails.performance.returns['12m'])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">24 meses</span>
                    <span className={`font-semibold ${
                      (stockDetails.performance.returns['24m'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(stockDetails.performance.returns['24m'])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">36 meses</span>
                    <span className={`font-semibold ${
                      (stockDetails.performance.returns['36m'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(stockDetails.performance.returns['36m'])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">5 anos</span>
                    <span className={`font-semibold ${
                      (stockDetails.performance.returns['5y'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(stockDetails.performance.returns['5y'])}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fundamentais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Indicadores Fundamentais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/E Ratio</span>
                    <span className="font-semibold">{formatRatio(stockDetails.fundamentals.valuation.pe_ratio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/B Ratio</span>
                    <span className="font-semibold">{formatRatio(stockDetails.fundamentals.valuation.pb_ratio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROE</span>
                    <span className="font-semibold">{formatPercentage(stockDetails.fundamentals.profitability.roe)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROA</span>
                    <span className="font-semibold">{formatPercentage(stockDetails.fundamentals.profitability.roa)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debt/Equity</span>
                    <span className="font-semibold">{formatRatio(stockDetails.fundamentals.financial_health.debt_to_equity)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análise de IA */}
          {stockDetails.ai_analysis.investment_thesis && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Análise de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stockDetails.ai_analysis.investment_thesis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tese de Investimento</h4>
                      <p className="text-gray-700">{stockDetails.ai_analysis.investment_thesis}</p>
                    </div>
                  )}
                  
                  {stockDetails.ai_analysis.risk_analysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Análise de Risco</h4>
                      <p className="text-gray-700">{stockDetails.ai_analysis.risk_analysis}</p>
                    </div>
                  )}
                  
                  {stockDetails.ai_analysis.market_context && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contexto de Mercado</h4>
                      <p className="text-gray-700">{stockDetails.ai_analysis.market_context}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Dividendos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yield 12m</span>
                    <span className="font-semibold">{formatPercentage(stockDetails.dividends.yield_12m)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequência</span>
                    <span className="font-semibold">{stockDetails.dividends.frequency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volatilidade</span>
                    <span className="font-semibold">{formatPercentage(stockDetails.performance.volatility['12m'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sharpe Ratio</span>
                    <span className="font-semibold">{stockDetails.performance.risk_metrics.sharpe_12m?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drawdown</span>
                    <span className="font-semibold text-red-600">{formatPercentage(stockDetails.performance.risk_metrics.max_drawdown)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Qualidade dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Qualidade</span>
                    <Badge variant={
                      stockDetails.metadata.data_quality === 'Excelente' ? 'default' :
                      stockDetails.metadata.data_quality === 'Boa' ? 'secondary' : 'outline'
                    }>
                      {stockDetails.metadata.data_quality}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completude</span>
                    <span className="font-semibold">{stockDetails.metadata.completeness_score}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

