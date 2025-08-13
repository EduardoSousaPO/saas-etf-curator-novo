"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
  Camera,
  Calendar,
  Sparkles,
  RefreshCw,
  Eye,
  Settings,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import SimplifiedTradeEntry from './SimplifiedTradeEntry'
import HumanizedTimeline from './HumanizedTimeline'
import { EducationalTooltip, InlineTooltip, educationalDefinitions } from '@/components/ui/tooltip-educational'

interface PortfolioPlan {
  id: string
  name: string
  objective: string
  risk_profile: string
  created_at: string
  latest_version: {
    portfolio_target_allocations: Array<{
      etf_symbol: string
      allocation_percentage: number
    }>
  }
}

interface DashboardData {
  target_vs_current: Array<{
    etf_symbol: string
    target_percentage: number
    current_percentage: number
    current_value: number
    target_value: number
    difference: number
  }>
  total_value: number
  total_invested: number
  total_return: number
  return_percentage: number
  next_actions: Array<{
    type: string
    etf_symbol?: string
    amount?: number
    priority: number
    description: string
  }>
  performance: {
    ytd_return: number
    total_return: number
    monthly_returns: Array<{
      month: string
      return: number
    }>
  }
}

interface SimplifiedWealthDashboardProps {
  planId?: string
}

// Função para converter linguagem técnica para humana
const humanizeText = {
  // Objetivos
  'house': 'Comprar casa',
  'retirement': 'Aposentadoria',
  'education': 'Estudar',
  'growth': 'Fazer dinheiro crescer',
  'income': 'Gerar renda',
  'emergency': 'Reserva de emergência',

  // Perfis de risco
  'conservative': 'Crescer devagar (mais seguro)',
  'moderate': 'Crescer no meio termo (equilibrado)',
  'aggressive': 'Crescer mais rápido (mais potencial)',

  // Métricas
  'TWR': 'Quanto você ganhou',
  'XIRR': 'Rendimento considerando seus depósitos',
  'volatility': 'Variação esperada',
  'sharpe_ratio': 'Qualidade do retorno',
  'max_drawdown': 'Maior queda já vista',
  'target_vs_real': 'Onde você está vs onde deveria estar',
  'rebalancing': 'Manter equilibrado',
  'allocation': 'Distribuição do seu dinheiro'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function SimplifiedWealthDashboard({ planId }: SimplifiedWealthDashboardProps) {
  const { user } = useAuth()
  const [plans, setPlans] = useState<PortfolioPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PortfolioPlan | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTradeEntry, setShowTradeEntry] = useState(false)
  const [newContribution, setNewContribution] = useState('')
  const [rebalanceData, setRebalanceData] = useState<any>(null)
  const [showRebalanceModal, setShowRebalanceModal] = useState(false)

  // Buscar planos do usuário
  useEffect(() => {
    if (user) {
      fetchPlans()
    }
  }, [user])

  // Buscar dados do dashboard quando plano é selecionado
  useEffect(() => {
    if (selectedPlan) {
      fetchDashboardData(selectedPlan.id)
    }
  }, [selectedPlan])

  const fetchPlans = async () => {
    try {
      console.log('Buscando planos para usuário:', user?.id)
      const response = await fetch(`/api/wealth/portfolio-plans?user_id=${user?.id}`)
      const result = await response.json()
      
      console.log('Resposta da API planos:', result)
      
      if (result.success) {
        setPlans(result.data)
        console.log('Planos encontrados:', result.data.length)
        
        // Se planId foi fornecido, selecionar esse plano
        if (planId) {
          const plan = result.data.find((p: PortfolioPlan) => p.id === planId)
          if (plan) {
            setSelectedPlan(plan)
            console.log('Plano selecionado via planId:', plan.name)
          }
        } else if (result.data.length > 0) {
          // Selecionar o plano mais recente por padrão
          const latestPlan = result.data[0]
          setSelectedPlan(latestPlan)
          console.log('Plano mais recente selecionado:', latestPlan.name)
        }
      } else {
        console.error('Erro na resposta da API planos:', result.error)
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error)
    }
  }

  const fetchDashboardData = async (planId: string) => {
    setLoading(true)
    try {
      console.log('Buscando dados do dashboard para plano:', planId)
      
      // Primeiro, atualizar preços em tempo real
      await updateRealTimePrices(planId)
      
      const response = await fetch(`/api/wealth/dashboard/${planId}`)
      const result = await response.json()
      
      console.log('Resposta da API dashboard:', result)
      
      if (result.success) {
        setDashboardData(result.data)
        console.log('Dados do dashboard carregados:', result.data)
      } else {
        console.error('Erro na resposta da API:', result.error)
        alert(`Erro ao carregar dashboard: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      alert('Erro de conexão ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  const updateRealTimePrices = async (planId: string) => {
    try {
      console.log('Atualizando preços em tempo real para plano:', planId)
      const response = await fetch(`/api/wealth/update-prices?planId=${planId}`)
      const result = await response.json()
      
      if (result.success) {
        console.log('Preços atualizados:', result.data.prices)
      }
    } catch (error) {
      console.error('Erro ao atualizar preços:', error)
    }
  }

  const handleRebalance = async () => {
    if (!selectedPlan || !user) return
    
    try {
      console.log('Calculando rebalanceamento para plano:', selectedPlan.id)
      const response = await fetch('/api/wealth/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          portfolio_id: selectedPlan.id,
          rebalance_type: 'BAND_TRIGGERED'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRebalanceData(result.data)
        setShowRebalanceModal(true)
        console.log('Rebalanceamento calculado:', result.data)
      } else {
        alert(`Erro ao calcular rebalanceamento: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao calcular rebalanceamento:', error)
      alert('Erro ao calcular rebalanceamento')
    }
  }

  const handleAddContribution = async () => {
    if (!selectedPlan || !newContribution) return

    try {
      setLoading(true)
      
      // Calcular distribuição ideal
      const calcResponse = await fetch('/api/wealth/calculate-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          plan_id: selectedPlan.id,
          amount: parseFloat(newContribution),
          currency: 'USD'
        })
      })

      const calcResult = await calcResponse.json()
      
      if (calcResult.success) {
        // Confirmar contribuição
        const confirmResponse = await fetch('/api/wealth/confirm-contribution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user?.id,
            plan_id: selectedPlan.id,
            amount: parseFloat(newContribution),
            currency: 'USD',
            distribution: calcResult.data.distribution
          })
        })

        if (confirmResponse.ok) {
          setNewContribution('')
          fetchDashboardData(selectedPlan.id)
          alert('Aporte registrado com sucesso!')
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar aporte:', error)
      alert('Erro ao registrar aporte. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando seus investimentos...</p>
        </div>
      </div>
    )
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Dashboard!
          </h1>
          <p className="text-gray-600 mb-8">
            Você ainda não tem um plano de investimentos. Vamos criar um?
          </p>
          <Button 
            onClick={() => window.location.href = '/start-investing'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Começar a investir
          </Button>
        </div>
      </div>
    )
  }

  // Preparar dados para gráficos
  const allocationData = dashboardData?.target_vs_current.map(item => ({
    name: item.etf_symbol,
    target: item.target_percentage,
    current: item.current_percentage,
    value: item.current_value
  })) || []

  const performanceData = dashboardData?.performance.monthly_returns.map(item => ({
    month: item.month,
    return: item.return
  })) || []

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {humanizeText[selectedPlan.objective as keyof typeof humanizeText] || selectedPlan.objective}
              </h1>
              <p className="text-gray-600">
                {humanizeText[selectedPlan.risk_profile as keyof typeof humanizeText] || selectedPlan.risk_profile}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowTradeEntry(!showTradeEntry)}
              >
                <Camera className="mr-2 h-4 w-4" />
                Registrar compra
              </Button>
              <Button
                variant="outline"
                onClick={handleRebalance}
                className="bg-purple-50 hover:bg-purple-100 border-purple-200"
              >
                <Target className="mr-2 h-4 w-4" />
                Rebalancear
              </Button>
              <Button
                variant="outline"
                onClick={() => fetchDashboardData(selectedPlan.id)}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Carteira Alvo - Portfolio Master */}
        <div className="mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Target className="mr-2 h-5 w-5" />
                Sua Carteira Alvo (Portfolio Master)
              </CardTitle>
              <p className="text-sm text-blue-700">
                Esta é a carteira otimizada que você criou no Portfolio Master em{' '}
                {new Date(selectedPlan.created_at).toLocaleDateString('pt-BR')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Informações do Plano */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900">Detalhes do Plano</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Nome:</span> {selectedPlan.name}</p>
                    <p><span className="font-medium">Objetivo:</span> {humanizeText[selectedPlan.objective as keyof typeof humanizeText] || selectedPlan.objective}</p>
                    <p><span className="font-medium">Perfil:</span> {humanizeText[selectedPlan.risk_profile as keyof typeof humanizeText] || selectedPlan.risk_profile}</p>
                  </div>
                </div>

                {/* Lista de ETFs */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-blue-900 mb-2">Alocação Alvo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedPlan.latest_version.portfolio_target_allocations.map((allocation) => (
                      <div key={allocation.etf_symbol} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-900">{allocation.etf_symbol}</span>
                          <span className="text-sm font-semibold text-blue-700">
                            {allocation.allocation_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Link para Portfolio Master */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/portfolio-master'}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Editar no Portfolio Master
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quanto você tem</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData?.total_value?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quanto você colocou</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData?.total_invested?.toLocaleString() || '0'}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="text-sm text-gray-600">Quanto você ganhou</p>
                    <EducationalTooltip 
                      content={educationalDefinitions.total_return.explanation}
                      title={educationalDefinitions.total_return.term}
                    />
                  </div>
                  <p className={`text-2xl font-bold ${
                    (dashboardData?.total_return || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${dashboardData?.total_return?.toLocaleString() || '0'}
                  </p>
                  <div className="flex items-center space-x-1">
                    <p className={`text-sm ${
                      (dashboardData?.return_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {dashboardData?.return_percentage?.toFixed(1) || '0'}%
                    </p>
                    <EducationalTooltip 
                      content={educationalDefinitions.return_percentage.explanation}
                      title={educationalDefinitions.return_percentage.term}
                    />
                  </div>
                </div>
                {(dashboardData?.total_return || 0) >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status da carteira</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dashboardData?.next_actions?.length === 0 ? (
                      <span className="text-green-600">Equilibrada</span>
                    ) : (
                      <span className="text-orange-600">Precisa ajustar</span>
                    )}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximas ações */}
        {dashboardData?.next_actions && dashboardData.next_actions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                O que você precisa fazer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.next_actions.slice(0, 3).map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {action.description}
                      </p>
                      {action.etf_symbol && action.amount && (
                        <p className="text-sm text-gray-600">
                          {action.etf_symbol}: ${action.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Prioridade {action.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adicionar aporte */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5 text-blue-600" />
              Adicionar dinheiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 items-end">
              <div className="flex-1">
                <Label htmlFor="contribution">Quanto você quer adicionar?</Label>
                <Input
                  id="contribution"
                  type="number"
                  placeholder="500"
                  value={newContribution}
                  onChange={(e) => setNewContribution(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleAddContribution}
                disabled={!newContribution || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Calcular distribuição
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Vamos distribuir automaticamente baseado no seu plano
            </p>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribuição atual vs alvo */}
          <Card>
            <CardHeader>
              <CardTitle>Onde você está vs onde deveria estar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={allocationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}%`, 
                      name === 'target' ? 'Deveria ter' : 'Você tem'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="target" fill="#0088FE" name="Deveria ter" />
                  <Bar dataKey="current" fill="#00C49F" name="Você tem" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Como seu dinheiro cresceu nos últimos meses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Ganho no mês']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="return" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Registro de operações */}
        {showTradeEntry && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registrar compra ou venda</CardTitle>
            </CardHeader>
            <CardContent>
              <SimplifiedTradeEntry 
                portfolioId={selectedPlan.id}
                onTradeAdded={() => {
                  setShowTradeEntry(false)
                  fetchDashboardData(selectedPlan.id)
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Timeline humanizada */}
        <div className="mb-8">
          <HumanizedTimeline 
            portfolioId={selectedPlan.id}
            userId={user?.id}
          />
        </div>

        {/* Modal de Rebalanceamento */}
        {showRebalanceModal && rebalanceData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Rebalanceamento da Carteira</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRebalanceModal(false)}
                >
                  ×
                </Button>
              </div>
              
              {rebalanceData.rebalance_needed ? (
                <div className="space-y-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-800 font-medium">
                      Sua carteira precisa de rebalanceamento! 
                      Desvio máximo: {rebalanceData.max_deviation?.toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Ações Recomendadas:</h4>
                    <div className="space-y-3">
                      {rebalanceData.actions?.filter((action: any) => action.action !== 'HOLD').map((action: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{action.etf_symbol}</p>
                            <p className="text-sm text-gray-600">
                              {action.action === 'BUY' ? 'Comprar' : 'Vender'} {action.recommended_shares?.toFixed(2)} cotas
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">
                              ${action.recommended_value?.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Prioridade {action.priority}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-800 font-medium">Total de operações:</p>
                        <p className="text-blue-900">{rebalanceData.summary?.actions_needed || 0}</p>
                      </div>
                      <div>
                        <p className="text-blue-800 font-medium">Valor total:</p>
                        <p className="text-blue-900">${rebalanceData.summary?.total_trade_value?.toFixed(2) || '0'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-green-600 text-6xl mb-4">✓</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Carteira Equilibrada!
                  </h4>
                  <p className="text-gray-600">
                    Sua carteira está dentro das faixas ideais. Nenhum rebalanceamento necessário.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
