'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import TradeManagement from './TradeManagement';
import PortfolioAllocationTracker from './PortfolioAllocationTracker';

interface Portfolio {
  id: string;
  name: string;
  etf_symbols: string[];
  target_allocations: { [key: string]: number };
  total_amount: number;
  currency: string;
  created_at: string;
}

interface PerformanceData {
  totalInvested: number;
  currentValue: number;
  totalGain: number;
  totalGainPercent: number;
  etfPerformance: Array<{
    symbol: string;
    invested: number;
    current: number;
    gain: number;
    gainPercent: number;
  }>;
}

interface TrackingData {
  id: string;
  etf_symbol: string;
  purchase_date: string;
  purchase_price: number;
  shares_bought: number;
  amount_invested: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function PortfolioTracker() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função de formatação segura
  const formatCurrency = (value: number | null | undefined, currency: string = 'BRL'): string => {
    if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return '0,00%';
    
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Carregar portfólios salvos
  const loadPortfolios = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/portfolio/save?user_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.portfolios)) {
        setPortfolios(data.portfolios);
        if (data.portfolios.length > 0 && !selectedPortfolio) {
          setSelectedPortfolio(data.portfolios[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar portfólios:', error);
    }
  };

  // Carregar dados de performance
  const loadPerformanceData = async (portfolioId: string) => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      const response = await fetch(`/api/portfolio/yfinance-performance?portfolio_id=${portfolioId}&user_id=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.performance) {
        setPerformanceData(data.performance);
      } else {
        setPerformanceData(null);
      }
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
      setPerformanceData(null);
    } finally {
      setRefreshing(false);
    }
  };

  // Carregar dados de tracking
  const loadTrackingData = async (portfolioId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/portfolio/tracking?portfolio_id=${portfolioId}&user_id=${user.id}`);
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setTrackingData(data.data);
      } else {
        setTrackingData([]);
      }
    } catch (error) {
      console.error('Erro ao carregar tracking:', error);
      setTrackingData([]);
    }
  };

  // Atualizar dados quando portfólio selecionado muda
  useEffect(() => {
    if (selectedPortfolio) {
      loadPerformanceData(selectedPortfolio.id);
      loadTrackingData(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  // Carregar dados iniciais
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadPortfolios();
      setLoading(false);
    };
    
    if (user) {
      initializeData();
    }
  }, [user]);

  // Preparar dados para gráfico de pizza
  const pieData = selectedPortfolio?.etf_symbols.map((symbol, index) => ({
    name: symbol,
    value: selectedPortfolio.target_allocations[symbol] || 0,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Função para atualizar dados
  const handleRefresh = () => {
    if (selectedPortfolio) {
      loadPerformanceData(selectedPortfolio.id);
      loadTrackingData(selectedPortfolio.id);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Faça login para acessar seus portfólios</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando portfólios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (portfolios.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum portfólio encontrado</h3>
            <p className="text-gray-600 mb-4">Crie seu primeiro portfólio no Portfolio Master</p>
            <Button asChild>
              <a href="/portfolio-master">
                <Plus className="h-4 w-4 mr-2" />
                Criar Portfólio
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Portfólio */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Meus Portfólios</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <Card 
                key={portfolio.id}
                className={`cursor-pointer transition-all ${
                  selectedPortfolio?.id === portfolio.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPortfolio(portfolio)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold">{portfolio.name}</h3>
                  <p className="text-sm text-gray-600">
                    {portfolio.etf_symbols.length} ETFs
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(portfolio.total_amount, portfolio.currency)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Criado em {formatDate(portfolio.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Principal */}
      {selectedPortfolio && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="trades">Gestão de Trades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Investido</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(performanceData?.totalInvested || selectedPortfolio.total_amount, selectedPortfolio.currency)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Atual</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(performanceData?.currentValue, selectedPortfolio.currency)}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ganho Total</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(performanceData?.totalGain)}
                      </p>
                    </div>
                    {(performanceData?.totalGain || 0) >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rentabilidade</p>
                      <p className={`text-2xl font-bold ${(performanceData?.totalGainPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(performanceData?.totalGainPercent)}
                      </p>
                    </div>
                    {(performanceData?.totalGainPercent || 0) >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Composição do Portfólio */}
            <Card>
              <CardHeader>
                <CardTitle>Composição do Portfólio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedPortfolio.etf_symbols.map((symbol, index) => (
                      <div key={symbol} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{symbol}</span>
                        </div>
                        <Badge variant="secondary">
                          {selectedPortfolio.target_allocations[symbol]?.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {performanceData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Performance por ETF</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.etfPerformance.map((etf) => (
                      <div key={etf.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                        <div>
                          <h3 className="font-semibold">{etf.symbol}</h3>
                          <p className="text-sm text-gray-600">
                            Investido: {formatCurrency(etf.invested, selectedPortfolio.currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(etf.current, selectedPortfolio.currency)}
                          </p>
                          <p className={`text-sm ${etf.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(etf.gainPercent)} ({formatCurrency(etf.gain, selectedPortfolio.currency)})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Dados de performance não disponíveis</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Adicione dados de tracking para ver a performance detalhada
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                {trackingData.length > 0 ? (
                  <div className="space-y-2">
                    {trackingData.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{purchase.etf_symbol}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(purchase.purchase_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {purchase.shares_bought} cotas
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(purchase.amount_invested, selectedPortfolio.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma compra registrada</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Adicione suas compras para acompanhar a performance
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            <TradeManagement portfolioId={selectedPortfolio.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 