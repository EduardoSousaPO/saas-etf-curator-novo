'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
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
  Activity,
  Target,
  Zap,
  PieChart,
  LineChart,
  Calculator,
  Briefcase,
  ChevronDown,
  ChevronUp
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
  
  // Performance Multi-Período
  returns_12m: number;
  returns_24m: number;
  returns_36m: number;
  returns_5y: number;
  ten_year_return: number;
  
  // Métricas de Risco
  volatility_12m: number;
  volatility_24m: number;
  volatility_36m: number;
  ten_year_volatility: number;
  max_drawdown: number;
  beta_coefficient: number;
  
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
  
  // Fundamentais - Múltiplos
  pe_ratio: number;
  pb_ratio: number;
  ps_ratio: number;
  peg_ratio: number;
  
  // Fundamentais - Rentabilidade
  roe: number;
  roa: number;
  roi: number;
  profit_margin: number;
  
  // Fundamentais - Solidez Financeira
  debt_to_equity: number;
  current_ratio: number;
  revenue: number;
  net_income: number;
  total_assets: number;
  total_debt: number;
  free_cash_flow: number;
  book_value: number;
  enterprise_value: number;
  ebitda: number;
  
  // Análise de IA
  ai_investment_thesis: string;
  ai_risk_analysis: string;
  ai_market_context: string;
  ai_use_cases: string;
  ai_analysis_date: string;
  
  // Categorização
  size_category: string;
  liquidity_category: string;
  
  // Metadados
  snapshot_date: string;
}

interface TeslaStockDetailsModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeslaStockDetailsModal({ symbol, isOpen, onClose }: TeslaStockDetailsModalProps) {
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || value === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number | null | undefined) => {
    if (!value || value === 0) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number | null | undefined, showSign = true) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Converter decimal para percentual se necessário
    const percentValue = Math.abs(value) < 1 ? value * 100 : value;
    const sign = showSign && percentValue >= 0 ? '+' : '';
    return `${sign}${percentValue.toFixed(1)}%`;
  };

  const formatNumber = (value: number | null | undefined, decimals = 2) => {
    if (!value && value !== 0) return 'N/A';
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatLargeNumber = (value: number | null | undefined) => {
    if (!value && value !== 0) return 'N/A';
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const getPerformanceColor = (value: number | null | undefined) => {
    if (!value && value !== 0) return 'text-gray-400';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getRiskColor = (value: number | null | undefined, type: 'volatility' | 'drawdown' | 'ratio') => {
    if (!value && value !== 0) return 'text-gray-400';
    
    if (type === 'volatility') {
      if (value < 15) return 'text-green-600';
      if (value < 25) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    if (type === 'drawdown') {
      if (value > -10) return 'text-green-600';
      if (value > -20) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    return 'text-gray-900';
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    colorClass = 'text-gray-900',
    subtitle,
    trend
  }: {
    title: string;
    value: string;
    icon: any;
    colorClass?: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-white p-8 rounded-none border-0 border-b border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Icon className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
          </div>
          <div className={`text-3xl font-light ${colorClass} mb-2`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className="ml-4">
            {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
            {trend === 'neutral' && <Activity className="w-5 h-5 text-gray-400" />}
          </div>
        )}
      </div>
    </div>
  );

  const Section = ({ 
    title, 
    id, 
    icon: Icon, 
    children 
  }: { 
    title: string; 
    id: string; 
    icon: any; 
    children: React.ReactNode; 
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="bg-white">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <Icon className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-light text-gray-900">{title}</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-white">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-6" />
              <p className="text-gray-500 font-light">Carregando informações...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-24 px-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-6" />
            <h3 className="text-xl font-light text-gray-900 mb-4">Erro ao carregar</h3>
            <p className="text-gray-500 mb-8">{error}</p>
            <Button onClick={fetchStockDetails} className="bg-black text-white hover:bg-gray-800">
              Tentar Novamente
            </Button>
          </div>
        )}

        {stockDetails && !loading && !error && (
          <div className="overflow-y-auto max-h-[95vh]">
            {/* Header Tesla Style */}
            <div className="bg-black text-white px-8 py-12 relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {stockDetails.exchange}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {stockDetails.sector}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {stockDetails.size_category}
                  </Badge>
                </div>
                
                <h1 className="text-5xl font-thin mb-2">{stockDetails.ticker}</h1>
                <h2 className="text-xl text-gray-300 font-light mb-6">{stockDetails.name}</h2>
                
                <div className="flex items-end gap-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Preço Atual</p>
                    <p className="text-4xl font-light">{formatCurrency(stockDetails.current_price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                    <p className="text-2xl font-light">{formatMarketCap(stockDetails.market_cap)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Retorno 12m</p>
                    <p className={`text-2xl font-light ${getPerformanceColor(stockDetails.returns_12m)}`}>
                      {formatPercentage(stockDetails.returns_12m)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Description */}
            {stockDetails.business_description && (
              <div className="px-8 py-12 bg-gray-50 border-b border-gray-100">
                <div className="max-w-3xl">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sobre a Empresa</h3>
                  <p className="text-gray-600 leading-relaxed font-light">
                    {stockDetails.business_description}
                  </p>
                </div>
              </div>
            )}

            {/* Sections Tesla Style */}
            <div className="divide-y divide-gray-100">
              {/* Overview */}
              <Section title="Visão Geral" id="overview" icon={Building2}>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <MetricCard
                    title="Volume Médio 30d"
                    value={formatLargeNumber(stockDetails.volume_avg_30d)}
                    icon={BarChart3}
                  />
                  <MetricCard
                    title="Ações em Circulação"
                    value={formatLargeNumber(stockDetails.shares_outstanding)}
                    icon={PieChart}
                  />
                  <MetricCard
                    title="Dividend Yield"
                    value={formatPercentage(stockDetails.dividend_yield_12m, false)}
                    icon={DollarSign}
                    colorClass="text-green-600"
                  />
                  <MetricCard
                    title="Categoria de Liquidez"
                    value={stockDetails.liquidity_category || 'N/A'}
                    icon={Activity}
                  />
                </div>
              </Section>

              {/* Performance */}
              <Section title="Performance" id="performance" icon={TrendingUp}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    title="Retorno 12m"
                    value={formatPercentage(stockDetails.returns_12m)}
                    icon={TrendingUp}
                    colorClass={getPerformanceColor(stockDetails.returns_12m)}
                    trend={stockDetails.returns_12m >= 0 ? 'up' : 'down'}
                  />
                  <MetricCard
                    title="Retorno 24m"
                    value={formatPercentage(stockDetails.returns_24m)}
                    icon={TrendingUp}
                    colorClass={getPerformanceColor(stockDetails.returns_24m)}
                  />
                  <MetricCard
                    title="Retorno 5 anos"
                    value={formatPercentage(stockDetails.returns_5y)}
                    icon={TrendingUp}
                    colorClass={getPerformanceColor(stockDetails.returns_5y)}
                  />
                  <MetricCard
                    title="Sharpe Ratio 12m"
                    value={formatNumber(stockDetails.sharpe_12m)}
                    icon={Award}
                    colorClass="text-purple-600"
                  />
                  <MetricCard
                    title="Beta"
                    value={formatNumber(stockDetails.beta_coefficient)}
                    icon={Activity}
                    subtitle="Sensibilidade ao mercado"
                  />
                  <MetricCard
                    title="Volatilidade 12m"
                    value={formatPercentage(stockDetails.volatility_12m, false)}
                    icon={BarChart3}
                    colorClass={getRiskColor(stockDetails.volatility_12m, 'volatility')}
                  />
                </div>
              </Section>

              {/* Fundamentais */}
              <Section title="Análise Fundamentalista" id="fundamentals" icon={Calculator}>
                <div className="space-y-8">
                  {/* Múltiplos */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 px-8 pt-6 pb-4">Múltiplos de Valuation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      <MetricCard
                        title="P/E Ratio"
                        value={stockDetails.pe_ratio ? `${formatNumber(stockDetails.pe_ratio, 1)}x` : 'N/A'}
                        icon={Target}
                      />
                      <MetricCard
                        title="P/B Ratio"
                        value={stockDetails.pb_ratio ? `${formatNumber(stockDetails.pb_ratio, 1)}x` : 'N/A'}
                        icon={Target}
                      />
                      <MetricCard
                        title="P/S Ratio"
                        value={stockDetails.ps_ratio ? `${formatNumber(stockDetails.ps_ratio, 1)}x` : 'N/A'}
                        icon={Target}
                      />
                      <MetricCard
                        title="PEG Ratio"
                        value={stockDetails.peg_ratio ? `${formatNumber(stockDetails.peg_ratio, 2)}` : 'N/A'}
                        icon={Target}
                      />
                    </div>
                  </div>

                  {/* Rentabilidade */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 px-8 pb-4">Indicadores de Rentabilidade</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      <MetricCard
                        title="ROE"
                        value={formatPercentage(stockDetails.roe, false)}
                        icon={Zap}
                        colorClass="text-green-600"
                      />
                      <MetricCard
                        title="ROA"
                        value={formatPercentage(stockDetails.roa, false)}
                        icon={Zap}
                        colorClass="text-green-600"
                      />
                      <MetricCard
                        title="ROI"
                        value={formatPercentage(stockDetails.roi, false)}
                        icon={Zap}
                        colorClass="text-green-600"
                      />
                      <MetricCard
                        title="Margem de Lucro"
                        value={formatPercentage(stockDetails.profit_margin, false)}
                        icon={Zap}
                        colorClass="text-green-600"
                      />
                    </div>
                  </div>

                  {/* Dados Financeiros */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 px-8 pb-4">Dados Financeiros</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <MetricCard
                        title="Receita"
                        value={formatMarketCap(stockDetails.revenue)}
                        icon={DollarSign}
                      />
                      <MetricCard
                        title="Lucro Líquido"
                        value={formatMarketCap(stockDetails.net_income)}
                        icon={DollarSign}
                        colorClass="text-green-600"
                      />
                      <MetricCard
                        title="EBITDA"
                        value={formatMarketCap(stockDetails.ebitda)}
                        icon={DollarSign}
                      />
                      <MetricCard
                        title="Fluxo de Caixa Livre"
                        value={formatMarketCap(stockDetails.free_cash_flow)}
                        icon={DollarSign}
                        colorClass="text-blue-600"
                      />
                      <MetricCard
                        title="Ativos Totais"
                        value={formatMarketCap(stockDetails.total_assets)}
                        icon={Briefcase}
                      />
                      <MetricCard
                        title="Dívida Total"
                        value={formatMarketCap(stockDetails.total_debt)}
                        icon={Briefcase}
                        colorClass="text-red-600"
                      />
                    </div>
                  </div>
                </div>
              </Section>

              {/* Análise de Risco */}
              <Section title="Análise de Risco" id="risk" icon={Shield}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    title="Max Drawdown"
                    value={formatPercentage(stockDetails.max_drawdown)}
                    icon={Shield}
                    colorClass={getRiskColor(stockDetails.max_drawdown, 'drawdown')}
                  />
                  <MetricCard
                    title="Debt/Equity"
                    value={stockDetails.debt_to_equity ? formatNumber(stockDetails.debt_to_equity, 2) : 'N/A'}
                    icon={Shield}
                  />
                  <MetricCard
                    title="Current Ratio"
                    value={stockDetails.current_ratio ? formatNumber(stockDetails.current_ratio, 2) : 'N/A'}
                    icon={Shield}
                  />
                  <MetricCard
                    title="Volatilidade 24m"
                    value={formatPercentage(stockDetails.volatility_24m, false)}
                    icon={BarChart3}
                    colorClass={getRiskColor(stockDetails.volatility_24m, 'volatility')}
                  />
                  <MetricCard
                    title="Sharpe 24m"
                    value={formatNumber(stockDetails.sharpe_24m)}
                    icon={Award}
                    colorClass="text-purple-600"
                  />
                  <MetricCard
                    title="Sharpe 10 anos"
                    value={formatNumber(stockDetails.ten_year_sharpe)}
                    icon={Award}
                    colorClass="text-purple-600"
                  />
                </div>
              </Section>

              {/* Análise de IA */}
              {(stockDetails.ai_investment_thesis || stockDetails.ai_risk_analysis || stockDetails.ai_market_context) && (
                <Section title="Análise de Inteligência Artificial" id="ai" icon={Brain}>
                  <div className="px-8 py-8 space-y-8">
                    {stockDetails.ai_investment_thesis && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Tese de Investimento
                        </h4>
                        <p className="text-gray-600 leading-relaxed font-light">
                          {stockDetails.ai_investment_thesis}
                        </p>
                      </div>
                    )}

                    {stockDetails.ai_risk_analysis && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-600" />
                          Análise de Riscos
                        </h4>
                        <p className="text-gray-600 leading-relaxed font-light">
                          {stockDetails.ai_risk_analysis}
                        </p>
                      </div>
                    )}

                    {stockDetails.ai_market_context && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <LineChart className="w-5 h-5 text-purple-600" />
                          Contexto de Mercado
                        </h4>
                        <p className="text-gray-600 leading-relaxed font-light">
                          {stockDetails.ai_market_context}
                        </p>
                      </div>
                    )}

                    {stockDetails.ai_analysis_date && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-400">
                          Análise gerada em: {new Date(stockDetails.ai_analysis_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>

            {/* Footer Tesla Style */}
            <div className="bg-gray-50 px-8 py-8 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 font-light">
                  Última atualização: {new Date(stockDetails.snapshot_date).toLocaleDateString('pt-BR')}
                </div>
                <Button 
                  onClick={onClose}
                  className="bg-black text-white hover:bg-gray-800 px-8 py-2 font-light"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
