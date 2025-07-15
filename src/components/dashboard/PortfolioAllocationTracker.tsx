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
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PortfolioAllocation {
  id: string;
  etf_symbol: string;
  allocation_percentage: number;
  target_amount: number;
  current_amount: number;
  created_at: string;
}

interface RebalanceSuggestion {
  id: string;
  etf_symbol: string;
  current_allocation: number;
  target_allocation: number;
  deviation: number;
  deviation_percentage: number;
  suggested_action: 'BUY' | 'SELL' | 'HOLD';
  priority: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  created_at: string;
}

interface PortfolioAllocationTrackerProps {
  portfolioId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function PortfolioAllocationTracker({ portfolioId }: PortfolioAllocationTrackerProps) {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>([]);
  const [suggestions, setSuggestions] = useState<RebalanceSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && portfolioId) {
      loadAllocationData();
      loadRebalanceSuggestions();
    }
  }, [user, portfolioId]);

  const loadAllocationData = async () => {
    try {
      const response = await fetch(`/api/portfolio/populate-allocations?portfolio_id=${portfolioId}&user_id=${user?.id}`);
      const data = await response.json();
      
      if (data.data) {
        setAllocations(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar alocações:', err);
      setError('Erro ao carregar dados de alocações');
    }
  };

  const loadRebalanceSuggestions = async () => {
    try {
      const response = await fetch(`/api/portfolio/rebalance-suggestions?portfolio_id=${portfolioId}&user_id=${user?.id}`);
      const data = await response.json();
      
      if (data.data) {
        setSuggestions(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar sugestões:', err);
      setError('Erro ao carregar sugestões de rebalanceamento');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSuggestion = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/portfolio/rebalance-suggestions/${suggestionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      
      if (response.ok) {
        setSuggestions(prev => prev.map(s => 
          s.id === suggestionId ? { ...s, status: 'APPROVED' } : s
        ));
      }
    } catch (err) {
      console.error('Erro ao aprovar sugestão:', err);
    }
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/portfolio/rebalance-suggestions/${suggestionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      
      if (response.ok) {
        setSuggestions(prev => prev.map(s => 
          s.id === suggestionId ? { ...s, status: 'REJECTED' } : s
        ));
      }
    } catch (err) {
      console.error('Erro ao rejeitar sugestão:', err);
    }
  };

  // Preparar dados para gráfico de pizza
  const pieChartData = allocations.map((allocation, index) => ({
    name: allocation.etf_symbol,
    value: allocation.allocation_percentage,
    current: allocation.current_amount,
    target: allocation.target_amount,
    color: COLORS[index % COLORS.length]
  }));

  // Preparar dados para gráfico de barras (atual vs target)
  const barChartData = allocations.map(allocation => ({
    etf: allocation.etf_symbol,
    target: allocation.target_amount,
    current: allocation.current_amount,
    deviation: allocation.current_amount - allocation.target_amount
  }));

  // Calcular métricas gerais
  const totalTarget = allocations.reduce((sum, a) => sum + a.target_amount, 0);
  const totalCurrent = allocations.reduce((sum, a) => sum + a.current_amount, 0);
  const totalDeviation = totalCurrent - totalTarget;
  const deviationPercentage = totalTarget > 0 ? (totalDeviation / totalTarget) * 100 : 0;

  const prioritySuggestions = suggestions.filter(s => s.status === 'PENDING').sort((a, b) => b.priority - a.priority);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando dados de alocação...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Target</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Desvio Total</p>
                <p className={`text-2xl font-bold ${totalDeviation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalDeviation >= 0 ? '+' : ''}R$ {totalDeviation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {totalDeviation >= 0 ? 
                <TrendingUp className="w-8 h-8 text-green-500" /> : 
                <TrendingDown className="w-8 h-8 text-red-500" />
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sugestões Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {prioritySuggestions.length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Visualização */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="allocations">Alocações</TabsTrigger>
          <TabsTrigger value="rebalancing">Rebalanceamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza - Composição Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Composição do Portfólio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Alocação']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Atual vs Target */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Atual vs Target</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="etf" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                    <Bar dataKey="target" fill="#8884d8" name="Target" />
                    <Bar dataKey="current" fill="#82ca9d" name="Atual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alocações Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocations.map((allocation) => {
                  const deviation = allocation.current_amount - allocation.target_amount;
                  const deviationPercent = allocation.target_amount > 0 ? 
                    (deviation / allocation.target_amount) * 100 : 0;
                  
                  return (
                    <div key={allocation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{allocation.etf_symbol}</h3>
                        <Badge variant={Math.abs(deviationPercent) > 5 ? "destructive" : "secondary"}>
                          {allocation.allocation_percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Target</p>
                          <p className="font-medium">R$ {allocation.target_amount.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Atual</p>
                          <p className="font-medium">R$ {allocation.current_amount.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Desvio</p>
                          <p className={`font-medium ${deviation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {deviation >= 0 ? '+' : ''}R$ {deviation.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Desvio %</p>
                          <p className={`font-medium ${deviationPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {deviationPercent >= 0 ? '+' : ''}{deviationPercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebalancing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Sugestões de Rebalanceamento</span>
                <Badge variant="outline">{prioritySuggestions.length} pendentes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prioritySuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma sugestão de rebalanceamento no momento</p>
                  <p className="text-sm text-gray-500">Seu portfólio está dentro dos parâmetros da regra 5/25</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prioritySuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{suggestion.etf_symbol}</h3>
                          <Badge variant={suggestion.suggested_action === 'BUY' ? 'default' : 'destructive'}>
                            {suggestion.suggested_action}
                          </Badge>
                          <Badge variant="outline">
                            Prioridade {suggestion.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Atual</p>
                          <p className="font-medium">{suggestion.current_allocation.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Target</p>
                          <p className="font-medium">{suggestion.target_allocation.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Desvio</p>
                          <p className={`font-medium ${suggestion.deviation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {suggestion.deviation >= 0 ? '+' : ''}{suggestion.deviation.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Desvio Relativo</p>
                          <p className="font-medium text-orange-600">{suggestion.deviation_percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveSuggestion(suggestion.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectSuggestion(suggestion.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 