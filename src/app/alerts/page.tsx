"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  Volume2,
  DollarSign,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface ETFAlert {
  id: string;
  user_id: string;
  etf_symbol: string;
  alert_type: 'price_above' | 'price_below' | 'return_above' | 'return_below' | 'volume_spike' | 'dividend_announcement';
  target_value: number;
  current_value?: number;
  is_active: boolean;
  is_triggered: boolean;
  created_at: Date;
  triggered_at?: Date;
  etf_name?: string;
  message?: string;
}

interface AlertsResponse {
  alerts: ETFAlert[];
  total: number;
  active: number;
  triggered: number;
}

interface CreateAlertForm {
  etf_symbol: string;
  alert_type: ETFAlert['alert_type'];
  target_value: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ETFAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, triggered: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateAlertForm>({
    etf_symbol: '',
    alert_type: 'return_above',
    target_value: ''
  });
  const router = useRouter();

  // Mock user ID - em produção, pegar do sistema de autenticação
  const userId = "user-123";

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await fetch(`/api/alerts?user_id=${userId}`);
      if (response.ok) {
        const data: AlertsResponse = await response.json();
        setAlerts(data.alerts);
        setStats({ total: data.total, active: data.active, triggered: data.triggered });
      } else {
        toast.error('Falha ao carregar alertas');
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!form.etf_symbol || !form.target_value) {
      toast.error('Preencha todos os campos');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          target_value: parseFloat(form.target_value),
          user_id: userId
        })
      });

      if (response.ok) {
        toast.success('Alerta criado com sucesso!');
        setForm({ etf_symbol: '', alert_type: 'return_above', target_value: '' });
        setShowCreateForm(false);
        loadAlerts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Falha ao criar alerta');
      }
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      toast.error('Erro ao criar alerta');
    } finally {
      setCreating(false);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${alertId}&user_id=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Alerta deletado com sucesso!');
        loadAlerts();
      } else {
        toast.error('Falha ao deletar alerta');
      }
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      toast.error('Erro ao deletar alerta');
    }
  };

  const getAlertIcon = (alertType: ETFAlert['alert_type']) => {
    switch (alertType) {
      case 'price_above':
      case 'price_below':
        return <DollarSign className="w-4 h-4" />;
      case 'return_above':
      case 'return_below':
        return <TrendingUp className="w-4 h-4" />;
      case 'volume_spike':
        return <Volume2 className="w-4 h-4" />;
      case 'dividend_announcement':
        return <Activity className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertTypeLabel = (alertType: ETFAlert['alert_type']) => {
    switch (alertType) {
      case 'price_above': return 'Preço acima';
      case 'price_below': return 'Preço abaixo';
      case 'return_above': return 'Retorno acima';
      case 'return_below': return 'Retorno abaixo';
      case 'volume_spike': return 'Pico de volume';
      case 'dividend_announcement': return 'Dividendos';
      default: return alertType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Alertas de ETFs</h1>
                <p className="text-gray-600">Monitore seus ETFs favoritos em tempo real</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Alerta</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total de Alertas</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-sm text-gray-600">Alertas Ativos</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.triggered}</div>
                <div className="text-sm text-gray-600">Disparados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Criação */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Criar Novo Alerta</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Símbolo do ETF
                  </label>
                  <input
                    type="text"
                    value={form.etf_symbol}
                    onChange={(e) => setForm({ ...form, etf_symbol: e.target.value.toUpperCase() })}
                    placeholder="Ex: SPY, QQQ, VTI"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Alerta
                  </label>
                  <select
                    value={form.alert_type}
                    onChange={(e) => setForm({ ...form, alert_type: e.target.value as ETFAlert['alert_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="return_above">Retorno acima de (%)</option>
                    <option value="return_below">Retorno abaixo de (%)</option>
                    <option value="price_above">Preço acima de ($)</option>
                    <option value="price_below">Preço abaixo de ($)</option>
                    <option value="volume_spike">Volume acima de</option>
                    <option value="dividend_announcement">Anúncio de dividendos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Alvo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.target_value}
                    onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                    placeholder="Ex: 15.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-6">
                <Button 
                  onClick={createAlert}
                  disabled={creating}
                  className="flex items-center space-x-2"
                >
                  {creating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{creating ? 'Criando...' : 'Criar Alerta'}</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Alertas */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Seus Alertas</h3>
          </div>

          {alerts.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum alerta configurado
              </h3>
              <p className="text-gray-600 mb-6">
                Crie seu primeiro alerta para monitorar ETFs em tempo real
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Alerta</span>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        alert.is_triggered 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : alert.is_active 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{alert.etf_symbol}</span>
                          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {getAlertTypeLabel(alert.alert_type)}
                          </span>
                          {alert.is_triggered && (
                            <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                              Disparado
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </div>
                        
                        {alert.current_value !== undefined && (
                          <div className="text-sm text-gray-500 mt-1">
                            Valor atual: {alert.current_value.toFixed(2)}
                            {alert.alert_type.includes('return') ? '%' : ''}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-1">
                          Criado em {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {alert.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {alert.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 