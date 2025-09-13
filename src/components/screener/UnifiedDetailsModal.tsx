'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Building2,
  Award,
  Info,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
  Target,
  Shield,
  Brain,
  LineChart,
  PieChart,
  Percent
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ScreenerDesignSystem from './ScreenerDesignSystem';

interface UnifiedDetailsModalProps {
  type: 'etf' | 'stock';
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio?: (symbol: string) => void;
}

interface DetailData {
  // Dados básicos
  symbol: string;
  name: string;
  sector: string;
  current_price?: number;
  stock_price?: number;
  market_cap?: number;
  totalasset?: number;
  
  // Performance
  returns_12m: number | string | null;
  returns_24m?: number | string | null;
  returns_5y?: number | string | null;
  volatility_12m?: number | string | null;
  sharpe_ratio?: number | string | null;
  
  // Fundamentais (stocks)
  pe_ratio?: number | string | null;
  pb_ratio?: number | string | null;
  dividend_yield_12m?: number | string | null;
  
  // ETF específicos
  expense_ratio?: number | string | null;
  dividend_yield?: number | string | null;
  
  // Qualidade
  quality_score?: number;
  
  // Dados históricos
  historical_data?: Array<{
    date: string;
    price: number;
    return: number;
  }>;
  
  // Insights IA
  ai_insights?: {
    investment_thesis?: string;
    risk_assessment?: string;
    market_context?: string;
    use_cases?: string[];
  };
}

const MetricCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | null;
  format?: 'currency' | 'percentage' | 'ratio' | 'text';
  tooltip?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}> = ({ icon: Icon, label, value, format = 'text', tooltip, trend }) => {
  const formatValue = () => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return ScreenerDesignSystem.formatters.currency(Number(value));
      case 'percentage':
        return ScreenerDesignSystem.formatters.percentage(value);
      case 'ratio':
        return ScreenerDesignSystem.formatters.ratio(value);
      default:
        return value;
    }
  };

  const getValueColor = () => {
    if (format === 'percentage' && trend) {
      return trend === 'positive' ? 'text-green-600' : 
             trend === 'negative' ? 'text-red-600' : 'text-gray-900';
    }
    return 'text-gray-900';
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#0090d8]" />
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {tooltip && (
            <div className="group relative">
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {tooltip}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`text-2xl font-light ${getValueColor()}`}>
        {formatValue()}
      </div>
    </div>
  );
};

const PerformanceChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <LineChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Dados históricos não disponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Retorno']}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="return" 
            stroke="#0090d8" 
            strokeWidth={2}
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AIInsightsSection: React.FC<{ insights: any }> = ({ insights }) => {
  if (!insights) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <h4 className="text-lg font-medium text-[#202636]">Análise com IA</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.investment_thesis && (
          <Card className="border-blue-100 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Target className="w-4 h-4" />
                Tese de Investimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">{insights.investment_thesis}</p>
            </CardContent>
          </Card>
        )}

        {insights.risk_assessment && (
          <Card className="border-orange-100 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Shield className="w-4 h-4" />
                Avaliação de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">{insights.risk_assessment}</p>
            </CardContent>
          </Card>
        )}

        {insights.market_context && (
          <Card className="border-green-100 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="w-4 h-4" />
                Contexto de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">{insights.market_context}</p>
            </CardContent>
          </Card>
        )}

        {insights.use_cases && insights.use_cases.length > 0 && (
          <Card className="border-purple-100 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Sparkles className="w-4 h-4" />
                Casos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.use_cases.map((useCase: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-purple-700">{useCase}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export const UnifiedDetailsModal: React.FC<UnifiedDetailsModalProps> = ({
  type,
  symbol,
  isOpen,
  onClose,
  onAddToPortfolio
}) => {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && symbol) {
      fetchDetails();
    }
  }, [isOpen, symbol, type]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = type === 'etf' 
        ? `/api/etfs/details/${symbol}`
        : `/api/stocks/details/${symbol}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar detalhes');
      }
      
      // API de ETFs retorna result.data, API de Stocks retorna result.stock
      const detailData = result.data || result.stock;
      setData(detailData);
      
    } catch (err) {
      console.error('Erro ao buscar detalhes:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={ScreenerDesignSystem.components.modal.overlay}>
      <div className={ScreenerDesignSystem.components.modal.container}>
        {/* Header */}
        <div className={ScreenerDesignSystem.components.modal.header}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center">
              {type === 'etf' ? (
                <BarChart3 className="w-6 h-6 text-[#0090d8]" />
              ) : (
                <Building2 className="w-6 h-6 text-[#0090d8]" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-light text-[#202636]">
                {loading ? 'Carregando...' : data?.symbol || symbol}
              </h2>
              <p className="text-gray-600">
                {loading ? 'Buscando detalhes...' : data?.name || 'Detalhes do ativo'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className={ScreenerDesignSystem.components.modal.content}>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#0090d8]" />
              <p className="text-gray-600">Carregando detalhes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDetails}>Tentar Novamente</Button>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Métricas Principais */}
              <div>
                <h3 className="text-lg font-medium text-[#202636] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métricas Principais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    icon={DollarSign}
                    label="Preço Atual"
                    value={data.current_price || data.stock_price || null}
                    format="currency"
                  />
                  <MetricCard
                    icon={Building2}
                    label={type === 'etf' ? 'Patrimônio' : 'Market Cap'}
                    value={data.totalasset || data.market_cap || null}
                    format="currency"
                    tooltip={type === 'etf' ? 'Assets Under Management' : 'Valor de mercado'}
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="Retorno 12m"
                    value={data.returns_12m}
                    format="percentage"
                    tooltip="Performance dos últimos 12 meses"
                    trend={data.returns_12m && Number(data.returns_12m) > 0 ? 'positive' : 'negative'}
                  />
                  <MetricCard
                    icon={Award}
                    label="Sharpe Ratio"
                    value={data.sharpe_ratio || null}
                    format="ratio"
                    tooltip="Relação retorno/risco"
                  />
                  {type === 'etf' && (
                    <MetricCard
                      icon={Percent}
                      label="Taxa Admin."
                      value={data.expense_ratio || null}
                      format="percentage"
                      tooltip="Taxa de administração anual"
                    />
                  )}
                  {type === 'stock' && (
                    <MetricCard
                      icon={BarChart3}
                      label="P/E Ratio"
                      value={data.pe_ratio || null}
                      format="ratio"
                      tooltip="Preço/Lucro"
                    />
                  )}
                  <MetricCard
                    icon={Percent}
                    label="Dividend Yield"
                    value={data.dividend_yield || data.dividend_yield_12m || null}
                    format="percentage"
                    tooltip="Rendimento de dividendos"
                  />
                </div>
              </div>

              {/* Gráfico de Performance */}
              <div>
                <h3 className="text-lg font-medium text-[#202636] mb-4 flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance Histórica
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <PerformanceChart data={data.historical_data || []} />
                </div>
              </div>

              {/* Insights de IA */}
              {data.ai_insights && (
                <AIInsightsSection insights={data.ai_insights} />
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {data && (
          <div className={ScreenerDesignSystem.components.modal.footer}>
            {onAddToPortfolio && (
              <Button
                onClick={() => onAddToPortfolio(data.symbol)}
                className={`${ScreenerDesignSystem.components.button.primary} ${ScreenerDesignSystem.components.button.sizes.lg}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Portfolio
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.open(`https://finance.yahoo.com/quote/${data.symbol}`, '_blank')}
              className={ScreenerDesignSystem.components.button.sizes.lg}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver no Yahoo Finance
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className={ScreenerDesignSystem.components.button.sizes.lg}
            >
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDetailsModal;
