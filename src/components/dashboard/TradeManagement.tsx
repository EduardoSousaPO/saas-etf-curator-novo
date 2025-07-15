'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowRightLeft,
  Save,
  X,
  GripVertical
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Tipos para o sistema de trades
interface Trade {
  id: string;
  etf_symbol: string;
  purchase_date: string;
  purchase_price: number;
  shares_bought: number;
  amount_invested: number;
  current_price?: number;
  current_value?: number;
  gain_loss?: number;
  gain_loss_percent?: number;
}

interface ETFPosition {
  symbol: string;
  name: string;
  total_shares: number;
  average_price: number;
  total_invested: number;
  current_price: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  trades: Trade[];
}

interface RebalanceAction {
  type: 'sell' | 'buy';
  etf_symbol: string;
  shares: number;
  amount: number;
  reason: string;
}

const TradeManagement: React.FC<{ portfolioId: string }> = ({ portfolioId }) => {
  const { user } = useAuth();
  const [positions, setPositions] = useState<ETFPosition[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTrade, setEditingTrade] = useState<string | null>(null);
  const [rebalanceActions, setRebalanceActions] = useState<RebalanceAction[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  // Estado do formulário de nova compra
  const [newTrade, setNewTrade] = useState({
    etf_symbol: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    shares_bought: '',
    amount_invested: ''
  });

  // Carregar dados do portfólio
  useEffect(() => {
    if (portfolioId && user) {
      loadTradesData();
    }
  }, [portfolioId, user]);

  const loadTradesData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/tracking?portfolio_id=${portfolioId}&user_id=${user?.id}`);
      const data = await response.json();
      
      if (data.data) {
        setTrades(data.data);
        processPositions(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPositions = (tradesData: Trade[]) => {
    const positionsMap = new Map<string, ETFPosition>();
    
    tradesData.forEach(trade => {
      const existing = positionsMap.get(trade.etf_symbol);
      
      if (existing) {
        existing.total_shares += trade.shares_bought;
        existing.total_invested += trade.amount_invested;
        existing.trades.push(trade);
      } else {
        positionsMap.set(trade.etf_symbol, {
          symbol: trade.etf_symbol,
          name: trade.etf_symbol, // TODO: buscar nome real
          total_shares: trade.shares_bought,
          average_price: trade.purchase_price,
          total_invested: trade.amount_invested,
          current_price: trade.current_price || trade.purchase_price,
          current_value: (trade.current_price || trade.purchase_price) * trade.shares_bought,
          gain_loss: 0,
          gain_loss_percent: 0,
          trades: [trade]
        });
      }
    });

    // Calcular médias e ganhos/perdas
    const processedPositions = Array.from(positionsMap.values()).map(position => {
      position.average_price = position.total_invested / position.total_shares;
      position.current_value = position.current_price * position.total_shares;
      position.gain_loss = position.current_value - position.total_invested;
      position.gain_loss_percent = (position.gain_loss / position.total_invested) * 100;
      return position;
    });

    setPositions(processedPositions);
  };

  const handleAddTrade = async () => {
    if (!newTrade.etf_symbol || !newTrade.purchase_price || !newTrade.shares_bought) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(newTrade.purchase_price) * parseFloat(newTrade.shares_bought);
    
    try {
      const response = await fetch('/api/portfolio/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          user_id: user?.id,
          etf_symbol: newTrade.etf_symbol.toUpperCase(),
          purchase_date: newTrade.purchase_date,
          purchase_price: parseFloat(newTrade.purchase_price),
          shares_bought: parseFloat(newTrade.shares_bought),
          amount_invested: amount
        })
      });

      if (response.ok) {
        setNewTrade({
          etf_symbol: '',
          purchase_date: new Date().toISOString().split('T')[0],
          purchase_price: '',
          shares_bought: '',
          amount_invested: ''
        });
        loadTradesData();
      }
    } catch (error) {
      console.error('Erro ao adicionar trade:', error);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (confirm('Tem certeza que deseja excluir esta compra?')) {
      try {
        const response = await fetch(`/api/portfolio/tracking?id=${tradeId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadTradesData();
        }
      } catch (error) {
        console.error('Erro ao excluir trade:', error);
      }
    }
  };

  // Funcionalidades de Drag & Drop
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetZone: 'sell' | 'buy') => {
    e.preventDefault();
    if (!draggedItem) return;

    const position = positions.find(p => p.symbol === draggedItem);
    if (!position) return;

    const action: RebalanceAction = {
      type: targetZone,
      etf_symbol: position.symbol,
      shares: position.total_shares,
      amount: position.current_value,
      reason: targetZone === 'sell' ? 'Rebalanceamento - Venda' : 'Rebalanceamento - Compra'
    };

    setRebalanceActions(prev => [...prev, action]);
    setDraggedItem(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="positions">Posições</TabsTrigger>
          <TabsTrigger value="trades">Histórico</TabsTrigger>
          <TabsTrigger value="rebalance">Rebalanceamento</TabsTrigger>
        </TabsList>

        {/* Aba de Posições */}
        <TabsContent value="positions" className="space-y-4">
          {/* Formulário de Nova Compra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="etf_symbol">ETF</Label>
                  <Input
                    id="etf_symbol"
                    placeholder="Ex: SPY"
                    value={newTrade.etf_symbol}
                    onChange={(e) => setNewTrade({...newTrade, etf_symbol: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="purchase_date">Data</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={newTrade.purchase_date}
                    onChange={(e) => setNewTrade({...newTrade, purchase_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="purchase_price">Preço</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTrade.purchase_price}
                    onChange={(e) => setNewTrade({...newTrade, purchase_price: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="shares_bought">Quantidade</Label>
                  <Input
                    id="shares_bought"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newTrade.shares_bought}
                    onChange={(e) => setNewTrade({...newTrade, shares_bought: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddTrade} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Posições */}
          <div className="grid gap-4">
            {positions.map((position) => (
              <Card 
                key={position.symbol}
                className="cursor-move hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => handleDragStart(e, position.symbol)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-lg">{position.symbol}</h3>
                        <p className="text-sm text-gray-600">
                          {position.total_shares} cotas • Preço médio: {formatCurrency(position.average_price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatCurrency(position.current_value)}</p>
                      <div className="flex items-center gap-1">
                        {position.gain_loss >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${position.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(position.gain_loss)} ({formatPercent(position.gain_loss_percent)})
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Histórico */}
        <TabsContent value="trades" className="space-y-4">
          <div className="space-y-2">
            {trades.map((trade) => (
              <Card key={trade.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{trade.etf_symbol}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(trade.purchase_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(trade.amount_invested)}</p>
                      <p className="text-sm text-gray-600">
                        {trade.shares_bought} × {formatCurrency(trade.purchase_price)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTrade(trade.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTrade(trade.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Rebalanceamento */}
        <TabsContent value="rebalance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zona de Venda */}
            <Card 
              className="border-red-200 bg-red-50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'sell')}
            >
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Vender
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 mb-4">
                  Arraste ETFs aqui para vender
                </p>
                <div className="space-y-2">
                  {rebalanceActions.filter(a => a.type === 'sell').map((action, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{action.etf_symbol}</span>
                        <span className="text-red-600">{formatCurrency(action.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Zona de Compra */}
            <Card 
              className="border-green-200 bg-green-50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'buy')}
            >
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Comprar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600 mb-4">
                  Arraste ETFs aqui para comprar
                </p>
                <div className="space-y-2">
                  {rebalanceActions.filter(a => a.type === 'buy').map((action, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{action.etf_symbol}</span>
                        <span className="text-green-600">{formatCurrency(action.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botões de Ação */}
          {rebalanceActions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {rebalanceActions.length} ações de rebalanceamento planejadas
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setRebalanceActions([])}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Executar Rebalanceamento
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradeManagement; 