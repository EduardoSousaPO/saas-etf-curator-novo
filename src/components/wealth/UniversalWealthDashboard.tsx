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
  HelpCircle,
  BarChart3,
  Building2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import UniversalTradeEntry from './UniversalTradeEntry'
import UniversalTimeline from './UniversalTimeline'
import { EducationalTooltip, InlineTooltip, educationalDefinitions } from '@/components/ui/tooltip-educational'

interface UniversalPortfolioPlan {
  id: string
  name: string
  objective: string
  risk_profile: string
  created_at: string
  asset_types: {
    etfs: boolean
    stocks: boolean
    mixed: boolean
  }
  latest_version: {
    portfolio_target_allocations: Array<{
      symbol: string
      asset_type: 'ETF' | 'STOCK'
      allocation_percentage: number
      asset_name?: string
    }>
  }
}

interface UniversalDashboardData {
  target_vs_current: Array<{
    symbol: string
    asset_type: 'ETF' | 'STOCK'
    asset_name: string
    target_percentage: number
    current_percentage: number
    current_value: number
    sector: string
  }>
  performance: {
    total_value: number
    total_invested: number
    return_value: number
    return_percentage: number
  }
  next_actions: Array<{
    type: string
    symbol?: string
    asset_type?: 'ETF' | 'STOCK'
    amount?: number
    priority: number
    description: string
  }>
  portfolio_composition: {
    etf_percentage: number
    stock_percentage: number
    total_assets: number
  }
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

export default function UniversalWealthDashboard() {
  const { user } = useAuth()
  const [portfolioPlans, setPortfolioPlans] = useState<UniversalPortfolioPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<UniversalPortfolioPlan | null>(null)
  const [dashboardData, setDashboardData] = useState<UniversalDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTradeEntry, setShowTradeEntry] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newContribution, setNewContribution] = useState('')
  const [rebalanceData, setRebalanceData] = useState<any>(null)
  const [showRebalanceModal, setShowRebalanceModal] = useState(false)

  // Carregar planos de portfolio do usuário
  useEffect(() => {
    if (user?.id) {
      loadPortfolioPlans()
    }
  }, [user?.id])

  // Carregar dados do dashboard quando um plano é selecionado
  useEffect(() => {
    if (selectedPlan) {
      loadDashboardData(selectedPlan.id)
    }
  }, [selectedPlan])

  const loadPortfolioPlans = async () => {
    try {
      setLoading(true)

      // Buscar planos de ETF existentes
      const etfResponse = await fetch(`/api/wealth/portfolio-plans?user_id=${user?.id}`)
      const etfData = await etfResponse.json()

      // Por enquanto, apenas planos de ETF unificados
      const unifiedPlans: UniversalPortfolioPlan[] = []

      // Converter planos de ETF existentes para formato universal
      const convertedETFPlans: UniversalPortfolioPlan[] = (etfData.data || []).map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        objective: plan.objective,
        risk_profile: plan.risk_profile,
        created_at: plan.created_at,
        asset_types: {
          etfs: true,
          stocks: false,
          mixed: false
        },
        latest_version: {
          portfolio_target_allocations: plan.latest_version?.portfolio_target_allocations?.map((alloc: any) => ({
            symbol: alloc.etf_symbol,
            asset_type: 'ETF' as const,
            allocation_percentage: alloc.allocation_percentage,
            asset_name: alloc.etf_symbol
          })) || []
        }
      }))

      const allPlans = [...convertedETFPlans, ...unifiedPlans]
      setPortfolioPlans(allPlans)

      // Selecionar o primeiro plano automaticamente
      if (allPlans.length > 0 && !selectedPlan) {
        setSelectedPlan(allPlans[0])
      }

    } catch (err) {
      console.error('Erro ao carregar planos:', err)
      setError('Erro ao carregar seus portfolios')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async (planId: string) => {
    try {
      setLoading(true)
      
      // Primeiro, atualizar preços em tempo real
      await updateRealTimePrices(planId)
      
      // Determinar qual API usar baseado no tipo de plano
      const plan = portfolioPlans.find(p => p.id === planId)
      if (!plan) return

      let response
      if (plan.asset_types.etfs && !plan.asset_types.stocks) {
        // Plano apenas de ETFs - usar API existente
        response = await fetch(`/api/wealth/dashboard/${planId}`)
      } else {
        // Plano unificado - usar nova API (ainda não implementada)
        // Por enquanto, usar dados simulados
        const simulatedData: UniversalDashboardData = {
          target_vs_current: plan.latest_version.portfolio_target_allocations.map(alloc => ({
            symbol: alloc.symbol,
            asset_type: alloc.asset_type,
            asset_name: alloc.asset_name || alloc.symbol,
            target_percentage: alloc.allocation_percentage,
            current_percentage: alloc.allocation_percentage * 0.95, // Simular pequeno desvio
            current_value: 10000 * (alloc.allocation_percentage / 100),
            sector: alloc.asset_type === 'ETF' ? 'Diversified' : 'Technology'
          })),
          performance: {
            total_value: 95000,
            total_invested: 90000,
            return_value: 5000,
            return_percentage: 5.56
          },
          next_actions: [
            {
              type: 'REBALANCE',
              description: 'Rebalancear portfolio para manter alocação alvo',
              priority: 1
            }
          ],
          portfolio_composition: {
            etf_percentage: plan.asset_types.etfs ? 70 : 0,
            stock_percentage: plan.asset_types.stocks ? 30 : 0,
            total_assets: plan.latest_version.portfolio_target_allocations.length
          }
        }
        
        setDashboardData(simulatedData)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const data = await response.json()
      
      // Converter dados de ETF para formato universal
      const universalData: UniversalDashboardData = {
        target_vs_current: data.data.target_vs_current?.map((item: any) => ({
          symbol: item.etf_symbol,
          asset_type: 'ETF' as const,
          asset_name: item.etf_symbol,
          target_percentage: item.target_percentage,
          current_percentage: item.current_percentage,
          current_value: item.current_value,
          sector: 'Diversified'
        })) || [],
        performance: {
          total_value: data.data.total_value || 0,
          total_invested: data.data.total_invested || 0,
          return_value: data.data.total_return || 0,
          return_percentage: data.data.return_percentage || 0
        },
        next_actions: data.data.next_actions?.map((action: any) => ({
          type: action.type,
          symbol: action.etf_symbol,
          asset_type: 'ETF' as const,
          amount: action.amount,
          priority: action.priority,
          description: action.description
        })) || [],
        portfolio_composition: {
          etf_percentage: 100,
          stock_percentage: 0,
          total_assets: data.data.target_vs_current?.length || 0
        }
      }

      setDashboardData(universalData)

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setError('Erro ao carregar dados do dashboard')
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
        console.log('Preços atualizados:', result.data?.prices)
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
          loadDashboardData(selectedPlan.id)
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

  // Preparar dados para gráficos
  const allocationData = dashboardData?.target_vs_current.map(item => ({
    name: item.symbol,
    target: item.target_percentage,
    current: item.current_percentage,
    value: item.current_value
  })) || []

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => {
                  setError(null)
                  loadPortfolioPlans()
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
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
            onClick={() => window.location.href = '/portfolio-master'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Começar a investir
          </Button>
        </div>
      </div>
    )
  }

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
                onClick={() => selectedPlan && loadDashboardData(selectedPlan.id)}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Seletor de Plano */}
        {portfolioPlans.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Seus Portfolios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <div className="flex space-x-1">
                        {plan.asset_types.etfs && (
                          <Badge variant="secondary" className="text-xs">ETF</Badge>
                        )}
                        {plan.asset_types.stocks && (
                          <Badge variant="secondary" className="text-xs">Stock</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {humanizeText[plan.objective as keyof typeof humanizeText] || plan.objective}
                    </p>
                    <p className="text-xs text-gray-500">
                      {humanizeText[plan.risk_profile as keyof typeof humanizeText] || plan.risk_profile}
                    </p>
                    <p className="text-xs text-gray-500">
                      {plan.latest_version.portfolio_target_allocations.length} ativos
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                      <div key={allocation.symbol} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-900">{allocation.symbol}</span>
                          <span className="text-sm font-semibold text-blue-700">
                            {allocation.allocation_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {allocation.asset_type}
                        </Badge>
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
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quanto você tem</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData.performance.total_value?.toLocaleString() || '0'}
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
                      ${dashboardData.performance.total_invested?.toLocaleString() || '0'}
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
                        content="Valor total ganho ou perdido com seus investimentos"
                        title="Retorno Total"
                      />
                    </div>
                    <p className={`text-2xl font-bold ${
                      (dashboardData.performance.return_value || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${dashboardData.performance.return_value?.toLocaleString() || '0'}
                    </p>
                    <div className="flex items-center space-x-1">
                      <p className={`text-sm ${
                        (dashboardData.performance.return_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dashboardData.performance.return_percentage?.toFixed(1) || '0'}%
                      </p>
                      <EducationalTooltip 
                        content="Percentual de retorno sobre o valor investido"
                        title="Percentual de Retorno"
                      />
                    </div>
                  </div>
                  {(dashboardData.performance.return_value || 0) >= 0 ? (
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
                      {dashboardData.next_actions?.length === 0 ? (
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
        )}

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
                      {action.symbol && action.amount && (
                        <p className="text-sm text-gray-600">
                          {action.symbol} ({action.asset_type}): ${action.amount.toLocaleString()}
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
        {dashboardData && allocationData.length > 0 && (
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

            {/* Composição por tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Composição da Carteira</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="current"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Registro de operações */}
        {showTradeEntry && selectedPlan && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registrar compra ou venda</CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalTradeEntry 
                planId={selectedPlan.id}
                onClose={() => setShowTradeEntry(false)}
                onSuccess={() => {
                  setShowTradeEntry(false)
                  if (selectedPlan) {
                    loadDashboardData(selectedPlan.id)
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Timeline humanizada */}
        {selectedPlan && (
          <div className="mb-8">
            <UniversalTimeline 
              planId={selectedPlan.id}
              userId={user?.id}
            />
          </div>
        )}

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
                            <p className="font-medium">{action.symbol || action.etf_symbol}</p>
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