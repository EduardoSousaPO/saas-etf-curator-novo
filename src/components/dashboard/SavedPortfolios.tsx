import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Edit3, 
  Trash2,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  Plus,
  RefreshCw,
  GripVertical,
  Settings,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  shares_quantity: number;
}

interface PerformanceData {
  etf_symbol: string;
  purchase_price: number;
  current_price: number;
  shares_quantity: number;
  total_invested: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  purchase_date: string;
}

interface PortfolioPerformance {
  portfolio_id: string;
  portfolio_name: string;
  total_invested: number;
  current_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  etfs_performance: PerformanceData[];
}

const SavedPortfolios: React.FC = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<SavedPortfolio | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [newTracking, setNewTracking] = useState({
    etf_symbol: '',
    purchase_date: '',
    purchase_price: '',
    shares_quantity: ''
  });

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`/api/portfolio/save?user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolios(Array.isArray(data.portfolios) ? data.portfolios : []);
      }
    } catch (error) {
      console.error('Erro ao buscar portfólios:', error);
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolio/yfinance-performance?portfolio_id=${portfolioId}&user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setPerformance(data);
      }
    } catch (error) {
      console.error('Erro ao buscar performance:', error);
    }
  };

  const fetchTrackingData = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolio/tracking?portfolio_id=${portfolioId}&user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar tracking:', error);
    }
  };

  const handlePortfolioSelect = (portfolio: SavedPortfolio) => {
    setSelectedPortfolio(portfolio);
    fetchPerformance(portfolio.id);
    fetchTrackingData(portfolio.id);
  };

  const handleAddTracking = async () => {
    if (!selectedPortfolio || !user) return;

    try {
      const response = await fetch('/api/portfolio/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_id: selectedPortfolio.id,
          etf_symbol: newTracking.etf_symbol,
          purchase_date: newTracking.purchase_date,
          purchase_price: parseFloat(newTracking.purchase_price),
          shares_quantity: parseFloat(newTracking.shares_quantity),
          user_id: user.id
        }),
      });

      if (response.ok) {
        setShowTrackingModal(false);
        setNewTracking({
          etf_symbol: '',
          purchase_date: '',
          purchase_price: '',
          shares_quantity: ''
        });
        fetchTrackingData(selectedPortfolio.id);
        fetchPerformance(selectedPortfolio.id);
      }
    } catch (error) {
      console.error('Erro ao adicionar tracking:', error);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(trackingData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTrackingData(items);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="mb-20">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="mb-20">
        <h2 className="text-3xl font-light text-gray-900 mb-12">
          Meus Portfólios
        </h2>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum portfólio salvo
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Crie seu primeiro portfólio otimizado no Portfolio Master
            </p>
            <Link href="/portfolio-master">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Portfólio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-20">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-light text-gray-900">
          Meus Portfólios
        </h2>
        <Link href="/portfolio-master">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Portfólio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Portfólios */}
        <div className="lg:col-span-1 space-y-4">
          {portfolios && portfolios.length > 0 ? portfolios.map((portfolio) => (
            <Card 
              key={portfolio.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedPortfolio?.id === portfolio.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handlePortfolioSelect(portfolio)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {portfolio.portfolio_name}
                  </h3>
                  <Badge variant="outline">
                    {portfolio.etf_symbols.length} ETFs
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{portfolio.metadata?.objective || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>{portfolio.metadata?.riskProfile || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(portfolio.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhum portfólio encontrado</p>
                  <p className="text-sm">Crie seu primeiro portfólio no Portfolio Master</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detalhes do Portfólio Selecionado */}
        <div className="lg:col-span-2">
          {selectedPortfolio ? (
            <div className="space-y-6">
              {/* Performance Summary */}
              {performance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Performance da Carteira
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Investido</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(performance.total_invested)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Atual</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(performance.current_value)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Ganho/Perda</p>
                        <p className={`text-lg font-semibold ${
                          performance.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(performance.total_gain_loss)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Rentabilidade</p>
                        <p className={`text-lg font-semibold ${
                          performance.total_gain_loss_percent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercent(performance.total_gain_loss_percent)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ETFs Performance */}
              {performance && performance.etfs_performance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance por ETF</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="etfs">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef}>
                            {performance.etfs_performance.map((etf, index) => (
                              <Draggable key={etf.etf_symbol} draggableId={etf.etf_symbol} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex items-center justify-between p-4 border rounded-lg mb-2 bg-white hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{etf.etf_symbol}</p>
                                        <p className="text-sm text-gray-600">
                                          {etf.shares_quantity.toFixed(2)} cotas
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900">
                                        {formatCurrency(etf.current_value)}
                                      </p>
                                      <p className={`text-sm ${
                                        etf.gain_loss_percent >= 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {formatPercent(etf.gain_loss_percent)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </CardContent>
                </Card>
              )}

              {/* Tracking Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Acompanhamento de Compras
                    </CardTitle>
                    <Button 
                      onClick={() => setShowTrackingModal(true)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Compra
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {trackingData.length > 0 ? (
                    <div className="space-y-3">
                      {trackingData.map((tracking) => (
                        <div key={tracking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{tracking.etf_symbol}</p>
                            <p className="text-sm text-gray-600">
                              {tracking.shares_quantity} cotas em {new Date(tracking.purchase_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(tracking.purchase_price)}
                            </p>
                            <p className="text-sm text-gray-600">por cota</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      Nenhuma compra registrada ainda
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um portfólio
                </h3>
                <p className="text-gray-600 text-center">
                  Clique em um portfólio para ver detalhes e performance
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para Adicionar Tracking */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Adicionar Compra</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="etf_symbol">ETF</Label>
                <Input
                  id="etf_symbol"
                  value={newTracking.etf_symbol}
                  onChange={(e) => setNewTracking({...newTracking, etf_symbol: e.target.value})}
                  placeholder="Ex: SPY"
                />
              </div>
              <div>
                <Label htmlFor="purchase_date">Data da Compra</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={newTracking.purchase_date}
                  onChange={(e) => setNewTracking({...newTracking, purchase_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="purchase_price">Preço por Cota (USD)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  value={newTracking.purchase_price}
                  onChange={(e) => setNewTracking({...newTracking, purchase_price: e.target.value})}
                  placeholder="Ex: 450.00"
                />
              </div>
              <div>
                <Label htmlFor="shares_quantity">Quantidade de Cotas</Label>
                <Input
                  id="shares_quantity"
                  type="number"
                  step="0.000001"
                  value={newTracking.shares_quantity}
                  onChange={(e) => setNewTracking({...newTracking, shares_quantity: e.target.value})}
                  placeholder="Ex: 10.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowTrackingModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddTracking}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPortfolios; 