import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  Activity,
  RefreshCw,
  Eye,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SavedPortfolio {
  id: string;
  portfolio_name: string;
  etf_symbols: string[];
  target_allocations: Record<string, number>;
  invested_amounts: Record<string, number>;
  total_invested: number;
  created_at: string;
  updated_at: string;
  metadata?: {
    objective: string;
    riskProfile: string;
    currency: string;
    timeHorizon: string;
    expectedReturn: number;
    expectedVolatility: number;
    sharpeRatio: number;
  };
}

interface TrackingData {
  id: string;
  etf_symbol: string;
  purchase_date: string;
  purchase_price: number;
  shares_bought: number;
  amount_invested: number;
  current_price?: number;
  current_value?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
}

interface PerformanceData {
  totalInvested: number;
  currentValue: number;
  totalGain: number;
  totalGainPercent: number;
  etfPerformance: Array<{
    symbol: string;
    name: string;
    invested: number;
    current: number;
    gain: number;
    gainPercent: number;
    currentPrice: number;
    shares: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function EnhancedPortfolioTracking() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<SavedPortfolio | null>(null);
  const [tracking, setTracking] = useState<TrackingData[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    etf_symbol: '',
    purchase_date: '',
    purchase_price: '',
    shares_bought: ''
  });

  // Buscar portfólios salvos
  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user]);

  // Buscar dados quando portfólio é selecionado
  useEffect(() => {
    if (selectedPortfolio) {
      fetchTrackingData();
      fetchPerformanceData();
    }
  }, [selectedPortfolio]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`/api/portfolio/save?user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.portfolios || []);
        if (data.portfolios?.length > 0 && !selectedPortfolio) {
          setSelectedPortfolio(data.portfolios[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar portfólios:', error);
    }
  };

  const fetchTrackingData = async () => {
    if (!selectedPortfolio) return;
    
    try {
      const response = await fetch(`/api/portfolio/tracking?portfolio_id=${selectedPortfolio.id}&user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setTracking(data.tracking || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de tracking:', error);
    }
  };

  const fetchPerformanceData = async () => {
    if (!selectedPortfolio) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/yfinance-performance?portfolio_id=${selectedPortfolio.id}&user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setPerformance(data);
      }
    } catch (error) {
      console.error('Erro ao buscar performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return;

    const amount = parseFloat(formData.purchase_price) * parseFloat(formData.shares_bought);
    
    const purchaseData = {
      portfolio_id: selectedPortfolio.id,
      user_id: user?.id,
      etf_symbol: formData.etf_symbol,
      purchase_date: formData.purchase_date,
      purchase_price: parseFloat(formData.purchase_price),
      shares_bought: parseFloat(formData.shares_bought),
      amount_invested: amount
    };

    try {
      const response = await fetch('/api/portfolio/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });

      if (response.ok) {
        setFormData({ etf_symbol: '', purchase_date: '', purchase_price: '', shares_bought: '' });
        setShowAddForm(false);
        fetchTrackingData();
        fetchPerformanceData();
      }
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
    }
  };

  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Preparar dados para o gráfico de pizza
  const pieData = selectedPortfolio?.etf_symbols.map((symbol, index) => ({
    name: symbol,
    value: selectedPortfolio.target_allocations[symbol] || 0,
    color: COLORS[index % COLORS.length]
  })) || [];

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Faça login para ver seus portfólios</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Portfólio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Seus Portfólios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                onClick={() => setSelectedPortfolio(portfolio)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPortfolio?.id === portfolio.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">{portfolio.portfolio_name}</h3>
                <p className="text-sm text-gray-600">
                  {portfolio.etf_symbols.length} ETFs • {formatCurrency(portfolio.total_invested)}
                </p>
                <div className="flex gap-2 mt-2">
                  {portfolio.metadata && (
                    <>
                      <Badge variant="outline">{portfolio.metadata.objective}</Badge>
                      <Badge variant="outline">{portfolio.metadata.riskProfile}</Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPortfolio && (
        <>
          {/* Resumo do Portfólio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Composição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Composição do Portfólio
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {selectedPortfolio.etf_symbols.map((symbol, index) => (
                    <div key={symbol} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{symbol}</span>
                      </div>
                      <span>{selectedPortfolio.target_allocations[symbol]}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPerformanceData}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : performance ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Investido</p>
                        <p className="text-2xl font-bold">{formatCurrency(performance.totalInvested)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Atual</p>
                        <p className="text-2xl font-bold">{formatCurrency(performance.currentValue)}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Ganho/Perda</p>
                      <p className={`text-3xl font-bold ${performance.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(performance.totalGain)}
                      </p>
                      <p className={`text-lg ${performance.totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(performance.totalGainPercent)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Adicione compras para ver a performance</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Acompanhamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Acompanhamento de Compras
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Compra
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Formulário de Adicionar Compra */}
              {showAddForm && (
                <form onSubmit={handleAddPurchase} className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="etf_symbol">ETF</Label>
                      <select
                        id="etf_symbol"
                        value={formData.etf_symbol}
                        onChange={(e) => setFormData({...formData, etf_symbol: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Selecione um ETF</option>
                        {selectedPortfolio.etf_symbols.map(symbol => (
                          <option key={symbol} value={symbol}>{symbol}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="purchase_date">Data da Compra</Label>
                      <Input
                        id="purchase_date"
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchase_price">Preço por Cota</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shares_bought">Quantidade</Label>
                      <Input
                        id="shares_bought"
                        type="number"
                        step="0.01"
                        value={formData.shares_bought}
                        onChange={(e) => setFormData({...formData, shares_bought: e.target.value})}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="submit">Adicionar</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              {/* Tabela de Compras */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ETF</th>
                      <th className="text-left p-2">Data</th>
                      <th className="text-right p-2">Preço Compra</th>
                      <th className="text-right p-2">Quantidade</th>
                      <th className="text-right p-2">Investido</th>
                      <th className="text-right p-2">Preço Atual</th>
                      <th className="text-right p-2">Valor Atual</th>
                      <th className="text-right p-2">Ganho/Perda</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracking.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.etf_symbol}</td>
                        <td className="p-2">{new Date(item.purchase_date).toLocaleDateString('pt-BR')}</td>
                        <td className="p-2 text-right">{formatCurrency(item.purchase_price)}</td>
                        <td className="p-2 text-right">{item.shares_bought}</td>
                        <td className="p-2 text-right">{formatCurrency(item.amount_invested)}</td>
                        <td className="p-2 text-right">
                          {item.current_price ? formatCurrency(item.current_price) : '-'}
                        </td>
                        <td className="p-2 text-right">
                          {item.current_value ? formatCurrency(item.current_value) : '-'}
                        </td>
                        <td className={`p-2 text-right ${item.profit_loss && item.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.profit_loss ? (
                            <div>
                              <div>{formatCurrency(item.profit_loss)}</div>
                              <div className="text-sm">{formatPercent(item.profit_loss_percent || 0)}</div>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tracking.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma compra registrada. Adicione suas primeiras compras para começar o acompanhamento.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 