'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Percent,
  Star,
  Leaf,
  Activity,
  Calculator,
  Globe,
  Zap,
  TrendingUpIcon,
  AlertTriangle
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import ScreenerDesignSystem from './ScreenerDesignSystem';

interface EnhancedUnifiedDetailsModalProps {
  type: 'etf' | 'stock';
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio?: (symbol: string) => void;
}

interface EnhancedDetailData {
  // Dados básicos
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  exchange?: string;
  current_price?: number;
  stock_price?: number;
  market_cap?: number;
  totalasset?: number;
  
  // Performance Multi-Período
  returns_12m?: number | string | null;
  returns_24m?: number | string | null;
  returns_36m?: number | string | null;
  returns_5y?: number | string | null;
  ten_year_return?: number | string | null;
  
  // Volatilidade Multi-Período
  volatility_12m?: number | string | null;
  volatility_24m?: number | string | null;
  volatility_36m?: number | string | null;
  ten_year_volatility?: number | string | null;
  
  // Sharpe Ratio Multi-Período
  sharpe_12m?: number | string | null;
  sharpe_24m?: number | string | null;
  sharpe_36m?: number | string | null;
  ten_year_sharpe?: number | string | null;
  
  // Métricas de Risco
  max_drawdown?: number | string | null;
  beta_12m?: number | string | null;
  beta_coefficient?: number | string | null;
  
  // Fundamentais (Stocks)
  pe_ratio?: number | string | null;
  pb_ratio?: number | string | null;
  ps_ratio?: number | string | null;
  peg_ratio?: number | string | null;
  roe?: number | string | null;
  roa?: number | string | null;
  roi?: number | string | null;
  profit_margin?: number | string | null;
  debt_to_equity?: number | string | null;
  current_ratio?: number | string | null;
  
  // ETF Específicos
  expense_ratio?: number | string | null;
  dividend_yield?: number | string | null;
  dividend_yield_12m?: number | string | null;
  liquidity_score?: number | string | null;
  premium_discount?: number | string | null;
  
  // Ratings e Qualidade
  morningstar_rating?: number;
  sustainability_rating?: number;
  quality_score?: number;
  
  // Holdings e Alocação (ETFs)
  top_10_holdings?: Array<{
    name: string;
    ticker: string;
    weight: number;
  }>;
  sector_allocation?: Record<string, number>;
  holdings_concentration?: number | string;
  
  // Análise IA
  ai_investment_thesis?: string;
  ai_risk_analysis?: string;
  ai_market_context?: string;
  ai_use_cases?: string;
  
  // Dados históricos
  historical_data?: Array<{
    date: string;
    price: number;
    return: number;
  }>;
}

const formatValue = (value: any, format: 'currency' | 'percentage' | 'ratio' | 'text' | 'rating' = 'text'): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  switch (format) {
    case 'currency':
      if (isNaN(numValue)) return 'N/A';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numValue);
      
    case 'percentage':
      if (isNaN(numValue)) return 'N/A';
      // Se valor > 1, assumir que já está em formato percentual
      const percentValue = Math.abs(numValue) > 1 ? numValue : numValue * 100;
      return `${percentValue.toFixed(1)}%`;
      
    case 'ratio':
      if (isNaN(numValue)) return 'N/A';
      return numValue.toFixed(2);
      
    case 'rating':
      if (isNaN(numValue)) return 'N/A';
      return `${numValue}/5`;
      
    default:
      return String(value);
  }
};

const MetricCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | null;
  format?: 'currency' | 'percentage' | 'ratio' | 'text' | 'rating';
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}> = ({ icon: Icon, label, value, format = 'text', trend, description }) => {
  const formattedValue = formatValue(value, format);
  const isPositive = typeof value === 'number' && value > 0;
  
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          {trend && (
            <div className={`p-1 rounded ${
              trend === 'up' ? 'bg-green-100' : 
              trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-600" />
              ) : (
                <Activity className="h-3 w-3 text-gray-600" />
              )}
            </div>
          )}
        </div>
        <div className={`text-lg font-bold ${
          format === 'percentage' && isPositive ? 'text-green-600' : 
          format === 'percentage' && !isPositive ? 'text-red-600' : 
          'text-gray-900'
        }`}>
          {formattedValue}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const PerformanceChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <LineChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Dados históricos não disponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value: any) => [`${value}%`, 'Retorno']}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="return" 
          stroke="#0090d8" 
          strokeWidth={2}
          dot={{ fill: '#0090d8', strokeWidth: 2, r: 4 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

const SectorAllocationChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Dados de alocação não disponíveis</p>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([sector, weight]) => ({
    name: sector,
    value: weight
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => [`${value}%`, 'Alocação']} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

const AIInsightsSection: React.FC<{ insights: any }> = ({ insights }) => {
  if (!insights || (!insights.ai_investment_thesis && !insights.ai_risk_analysis && !insights.ai_market_context && !insights.ai_use_cases)) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Análise de IA não disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {insights.ai_investment_thesis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tese de Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{insights.ai_investment_thesis}</p>
          </CardContent>
        </Card>
      )}

      {insights.ai_risk_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Análise de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{insights.ai_risk_analysis}</p>
          </CardContent>
        </Card>
      )}

      {insights.ai_market_context && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Contexto de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{insights.ai_market_context}</p>
          </CardContent>
        </Card>
      )}

      {insights.ai_use_cases && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Casos de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{insights.ai_use_cases}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const EnhancedUnifiedDetailsModal: React.FC<EnhancedUnifiedDetailsModalProps> = ({
  type,
  symbol,
  isOpen,
  onClose,
  onAddToPortfolio
}) => {
  const [data, setData] = useState<EnhancedDetailData | null>(null);
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
      <div className={`${ScreenerDesignSystem.components.modal.container} max-w-6xl max-h-[95vh]`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {data?.name || symbol}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{symbol}</Badge>
              {data?.sector && <Badge variant="secondary">{data.sector}</Badge>}
              {data?.industry && <Badge variant="secondary">{data.industry}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onAddToPortfolio && (
              <Button onClick={() => onAddToPortfolio(symbol)} className="bg-[#0090d8] hover:bg-[#007bc0]">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar ao Portfolio
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando detalhes...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-4" />
              <p>Erro: {error}</p>
            </div>
          )}

          {data && !loading && !error && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="risk">Risco</TabsTrigger>
                {type === 'etf' && <TabsTrigger value="holdings">Holdings</TabsTrigger>}
                {type === 'stock' && <TabsTrigger value="fundamentals">Fundamentais</TabsTrigger>}
                <TabsTrigger value="ai">Análise IA</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Métricas Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    icon={DollarSign}
                    label="Preço Atual"
                    value={data.current_price || data.stock_price}
                    format="currency"
                  />
                  <MetricCard
                    icon={Building2}
                    label={type === 'etf' ? 'Patrimônio' : 'Market Cap'}
                    value={data.totalasset || data.market_cap}
                    format="currency"
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="Retorno 12m"
                    value={data.returns_12m}
                    format="percentage"
                    trend={data.returns_12m && parseFloat(String(data.returns_12m)) > 0 ? 'up' : 'down'}
                  />
                  <MetricCard
                    icon={BarChart3}
                    label="Volatilidade 12m"
                    value={data.volatility_12m}
                    format="percentage"
                  />
                </div>

                {/* Ratings e Qualidade */}
                {(data.morningstar_rating || data.sustainability_rating || data.quality_score) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Ratings e Qualidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {data.morningstar_rating && (
                          <MetricCard
                            icon={Star}
                            label="Morningstar"
                            value={data.morningstar_rating}
                            format="rating"
                          />
                        )}
                        {data.sustainability_rating && (
                          <MetricCard
                            icon={Leaf}
                            label="Sustentabilidade"
                            value={data.sustainability_rating}
                            format="rating"
                          />
                        )}
                        {data.quality_score && (
                          <MetricCard
                            icon={Target}
                            label="Quality Score"
                            value={data.quality_score}
                            format="ratio"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                {/* Performance Multi-Período */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Multi-Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <MetricCard
                        icon={TrendingUp}
                        label="12 meses"
                        value={data.returns_12m}
                        format="percentage"
                      />
                      <MetricCard
                        icon={TrendingUp}
                        label="24 meses"
                        value={data.returns_24m}
                        format="percentage"
                      />
                      <MetricCard
                        icon={TrendingUp}
                        label="36 meses"
                        value={data.returns_36m}
                        format="percentage"
                      />
                      <MetricCard
                        icon={TrendingUp}
                        label="5 anos"
                        value={data.returns_5y}
                        format="percentage"
                      />
                      <MetricCard
                        icon={TrendingUp}
                        label="10 anos"
                        value={data.ten_year_return}
                        format="percentage"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sharpe Ratio Multi-Período */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sharpe Ratio Multi-Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricCard
                        icon={Target}
                        label="12 meses"
                        value={data.sharpe_12m}
                        format="ratio"
                      />
                      <MetricCard
                        icon={Target}
                        label="24 meses"
                        value={data.sharpe_24m}
                        format="ratio"
                      />
                      <MetricCard
                        icon={Target}
                        label="36 meses"
                        value={data.sharpe_36m}
                        format="ratio"
                      />
                      <MetricCard
                        icon={Target}
                        label="10 anos"
                        value={data.ten_year_sharpe}
                        format="ratio"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de Performance */}
                {data.historical_data && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Histórica</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PerformanceChart data={data.historical_data} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="risk" className="space-y-6">
                {/* Métricas de Risco */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Métricas de Risco
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricCard
                        icon={AlertTriangle}
                        label="Max Drawdown"
                        value={data.max_drawdown}
                        format="percentage"
                      />
                      <MetricCard
                        icon={Activity}
                        label="Beta"
                        value={data.beta_12m || data.beta_coefficient}
                        format="ratio"
                      />
                      <MetricCard
                        icon={BarChart3}
                        label="Volatilidade 12m"
                        value={data.volatility_12m}
                        format="percentage"
                      />
                      <MetricCard
                        icon={BarChart3}
                        label="Volatilidade 24m"
                        value={data.volatility_24m}
                        format="percentage"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* ETF Específicos */}
                {type === 'etf' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Métricas ETF</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <MetricCard
                          icon={Percent}
                          label="Taxa de Administração"
                          value={data.expense_ratio}
                          format="percentage"
                        />
                        <MetricCard
                          icon={Activity}
                          label="Liquidity Score"
                          value={data.liquidity_score}
                          format="ratio"
                        />
                        <MetricCard
                          icon={Target}
                          label="Premium/Discount"
                          value={data.premium_discount}
                          format="percentage"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {type === 'etf' && (
                <TabsContent value="holdings" className="space-y-6">
                  {/* Top Holdings */}
                  {data.top_10_holdings && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Top 10 Holdings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {data.top_10_holdings.map((holding, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{holding.name}</span>
                                <span className="text-gray-500 ml-2">({holding.ticker})</span>
                              </div>
                              <span className="font-bold">{holding.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Alocação por Setor */}
                  {data.sector_allocation && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Alocação por Setor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SectorAllocationChart data={data.sector_allocation} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Concentração */}
                  {data.holdings_concentration && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Concentração de Holdings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MetricCard
                          icon={PieChart}
                          label="Top 10 Concentração"
                          value={data.holdings_concentration}
                          format="percentage"
                          description="Percentual do patrimônio nos 10 maiores holdings"
                        />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}

              {type === 'stock' && (
                <TabsContent value="fundamentals" className="space-y-6">
                  {/* Múltiplos de Valuation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Múltiplos de Valuation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard
                          icon={Calculator}
                          label="P/E Ratio"
                          value={data.pe_ratio}
                          format="ratio"
                        />
                        <MetricCard
                          icon={Calculator}
                          label="P/B Ratio"
                          value={data.pb_ratio}
                          format="ratio"
                        />
                        <MetricCard
                          icon={Calculator}
                          label="P/S Ratio"
                          value={data.ps_ratio}
                          format="ratio"
                        />
                        <MetricCard
                          icon={Calculator}
                          label="PEG Ratio"
                          value={data.peg_ratio}
                          format="ratio"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rentabilidade */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Rentabilidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard
                          icon={TrendingUp}
                          label="ROE"
                          value={data.roe}
                          format="percentage"
                        />
                        <MetricCard
                          icon={TrendingUp}
                          label="ROA"
                          value={data.roa}
                          format="percentage"
                        />
                        <MetricCard
                          icon={TrendingUp}
                          label="ROI"
                          value={data.roi}
                          format="percentage"
                        />
                        <MetricCard
                          icon={Percent}
                          label="Margem de Lucro"
                          value={data.profit_margin}
                          format="percentage"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Solidez Financeira */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Solidez Financeira</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <MetricCard
                          icon={Shield}
                          label="Debt/Equity"
                          value={data.debt_to_equity}
                          format="ratio"
                        />
                        <MetricCard
                          icon={Shield}
                          label="Current Ratio"
                          value={data.current_ratio}
                          format="ratio"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="ai" className="space-y-6">
                <AIInsightsSection insights={data} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUnifiedDetailsModal;
