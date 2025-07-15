'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, FileText, Download, Plus, Calendar, DollarSign, Trash2, BarChart3, Activity, BookOpen, Target, Zap } from 'lucide-react';

interface PortfolioAllocationVisualizationProps {
  portfolioId: string;
  userId: string;
}

export default function PortfolioAllocationVisualization({ portfolioId, userId }: PortfolioAllocationVisualizationProps) {
  const [data, setData] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    etf_symbol: '',
    purchase_date: '',
    purchase_price: '',
    shares_bought: '',
    amount_invested: ''
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados reais primeiro
      const realDataResponse = await fetch(`/api/portfolio/real-data?portfolio_id=${portfolioId}&user_id=${userId}`);
      if (!realDataResponse.ok) throw new Error('Erro ao buscar dados reais');
      const realDataResult = await realDataResponse.json();
      setRealData(realDataResult.data);

      // Buscar tracking
      const trackingResponse = await fetch(`/api/portfolio/tracking?portfolio_id=${portfolioId}&user_id=${userId}`);
      if (!trackingResponse.ok) throw new Error('Erro ao buscar tracking');
      const trackingResult = await trackingResponse.json();
      setTrackingData(trackingResult.data || []);

      // Se há compras reais, buscar alocações
      if (realDataResult.data?.has_real_purchases) {
        const allocationsResponse = await fetch(`/api/portfolio/populate-allocations?portfolio_id=${portfolioId}&user_id=${userId}`);
        if (!allocationsResponse.ok) throw new Error('Erro ao buscar alocações');
        const allocationsResult = await allocationsResponse.json();
        setData(allocationsResult.data);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [portfolioId, userId]);

  const handleAddPurchase = async () => {
    try {
      const response = await fetch('/api/portfolio/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPurchase,
          portfolio_id: portfolioId,
          user_id: userId,
          purchase_price: parseFloat(newPurchase.purchase_price),
          shares_bought: parseFloat(newPurchase.shares_bought),
          amount_invested: parseFloat(newPurchase.amount_invested)
        })
      });

      if (!response.ok) throw new Error('Erro ao adicionar compra');

      setNewPurchase({
        etf_symbol: '',
        purchase_date: '',
        purchase_price: '',
        shares_bought: '',
        amount_invested: ''
      });
      setShowTrackingForm(false);
      fetchAllData();
    } catch (err) {
      console.error('Erro ao adicionar compra:', err);
      alert('Erro ao adicionar compra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            <span className="ml-6 text-2xl font-light text-gray-900">Carregando dados...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-light text-gray-900 mb-4">Erro ao carregar dados</h2>
            <p className="text-xl text-gray-600 font-light mb-8">{error}</p>
            <Button 
              onClick={fetchAllData}
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-light"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Portfolio Status Card - Tesla Style
  const renderStatusCard = () => {
    const isSimulated = !realData?.has_real_purchases;
    const statusColor = isSimulated ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';
    const statusTextColor = isSimulated ? 'text-yellow-800' : 'text-green-800';
    const statusIconColor = isSimulated ? 'text-yellow-600' : 'text-green-600';

    return (
      <Card className={`${statusColor} border-2 shadow-sm mb-12`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isSimulated ? (
                <AlertTriangle className={`h-8 w-8 ${statusIconColor}`} />
              ) : (
                <CheckCircle className={`h-8 w-8 ${statusIconColor}`} />
              )}
              <div>
                <h3 className={`text-2xl font-light ${statusTextColor}`}>
                  {isSimulated ? 'Portfolio Simulado' : 'Portfolio Ativo'}
                </h3>
                <p className="text-lg font-light text-gray-600 mt-1">
                  {isSimulated 
                    ? 'Adicione compras reais para ativar o tracking' 
                    : 'Dados baseados em transações reais'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-light text-gray-900">
                {isSimulated ? '$10,000' : `$${realData?.total_invested_real?.toLocaleString() || '0'}`}
              </div>
              <div className="text-lg font-light text-gray-600">
                {isSimulated ? 'Valor Simulado' : 'Valor Real'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Metrics Cards - Tesla Style
  const renderMetricsCards = () => {
    const isSimulated = !realData?.has_real_purchases;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-light text-gray-600">Total Investido</p>
                <p className="text-3xl font-light text-gray-900 mt-2">
                  ${isSimulated ? '10,000' : (realData?.total_invested_real?.toLocaleString() || '0')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-light text-gray-600">ETFs Ativos</p>
                <p className="text-3xl font-light text-gray-900 mt-2">
                  {data?.allocations?.length || 7}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-light text-gray-600">Performance</p>
                <p className="text-3xl font-light text-green-600 mt-2">+12.4%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-light text-gray-600">Última Atualização</p>
                <p className="text-xl font-light text-gray-900 mt-2">Hoje</p>
              </div>
              <RefreshCw className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Guidance Section for Simulated Portfolio
  const renderGuidanceSection = () => {
    if (realData?.has_real_purchases) return null;

    return (
      <Card className="bg-white border-0 shadow-sm mb-16">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-light text-gray-900">
            Como Ativar Seu Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-light text-gray-900">1</span>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-2">Registre Compras</h3>
              <p className="text-gray-600 font-light">
                Adicione suas compras reais de ETFs com data, preço e quantidade
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-light text-gray-900">2</span>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-2">Tracking Automático</h3>
              <p className="text-gray-600 font-light">
                O sistema calculará performance baseada em preços reais
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-light text-gray-900">3</span>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-2">Rebalanceamento</h3>
              <p className="text-gray-600 font-light">
                Receba sugestões inteligentes de rebalanceamento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Purchase Tracking Section
  const renderTrackingSection = () => {
    return (
      <Card className="bg-white border-0 shadow-sm mb-16">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-light text-gray-900">
              Histórico de Compras
            </CardTitle>
            <Button 
              onClick={() => setShowTrackingForm(!showTrackingForm)}
              className="bg-black text-white hover:bg-gray-800 px-6 py-2 font-light"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Compra
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {showTrackingForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-light text-gray-900 mb-6">Nova Compra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label className="text-sm font-light text-gray-600">ETF</Label>
                  <Input
                    value={newPurchase.etf_symbol}
                    onChange={(e) => setNewPurchase({...newPurchase, etf_symbol: e.target.value})}
                    placeholder="SPY"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-light text-gray-600">Data</Label>
                  <Input
                    type="date"
                    value={newPurchase.purchase_date}
                    onChange={(e) => setNewPurchase({...newPurchase, purchase_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-light text-gray-600">Preço</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPurchase.purchase_price}
                    onChange={(e) => setNewPurchase({...newPurchase, purchase_price: e.target.value})}
                    placeholder="450.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-light text-gray-600">Quantidade</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPurchase.shares_bought}
                    onChange={(e) => setNewPurchase({...newPurchase, shares_bought: e.target.value})}
                    placeholder="10"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-light text-gray-600">Valor Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPurchase.amount_invested}
                    onChange={(e) => setNewPurchase({...newPurchase, amount_invested: e.target.value})}
                    placeholder="4500.00"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTrackingForm(false)}
                  className="font-light"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddPurchase}
                  className="bg-black text-white hover:bg-gray-800 font-light"
                >
                  Salvar Compra
                </Button>
              </div>
            </div>
          )}

          {trackingData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-2 text-sm font-light text-gray-600">ETF</th>
                    <th className="text-left py-4 px-2 text-sm font-light text-gray-600">Data</th>
                    <th className="text-right py-4 px-2 text-sm font-light text-gray-600">Preço</th>
                    <th className="text-right py-4 px-2 text-sm font-light text-gray-600">Quantidade</th>
                    <th className="text-right py-4 px-2 text-sm font-light text-gray-600">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingData.map((purchase, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-2 text-gray-900 font-light">{purchase.etf_symbol}</td>
                      <td className="py-4 px-2 text-gray-600 font-light">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-900 font-light">
                        ${purchase.purchase_price}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-900 font-light">
                        {purchase.shares_bought}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-900 font-light">
                        ${purchase.amount_invested}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-light text-gray-600">
                Nenhuma compra registrada ainda
              </p>
              <p className="text-gray-500 font-light mt-2">
                Adicione suas compras para começar o tracking
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Portfolio Allocation Chart Section
  const renderAllocationChart = () => {
    if (!realData?.allocations || realData.allocations.length === 0) {
      return null;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

    const chartData = realData.allocations.map((allocation, index) => ({
      name: allocation.etf_symbol,
      value: allocation.allocation_percentage,
      amount: allocation.current_amount_simulated,
      color: COLORS[index % COLORS.length]
    }));

    return (
      <Card className="bg-white border-0 shadow-sm mb-16">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-light text-gray-900">
            Alocação do Portfolio
          </CardTitle>
          <p className="text-gray-600 font-light mt-2">
            Distribuição atual dos seus investimentos
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gráfico de Pizza */}
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de Alocações */}
            <div className="space-y-4">
              <h3 className="text-xl font-light text-gray-900 mb-6">Detalhes das Alocações</h3>
              <div className="space-y-3">
                {realData.allocations.map((allocation, index) => (
                  <div key={allocation.etf_symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">{allocation.etf_symbol}</p>
                        <p className="text-sm text-gray-600">{allocation.allocation_percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${allocation.current_amount_simulated.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {allocation.shares_owned.toFixed(2)} shares
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStatusCard()}
        {renderMetricsCards()}
        {renderAllocationChart()}
        {renderGuidanceSection()}
        {renderTrackingSection()}
      </div>
    </div>
  );
} 