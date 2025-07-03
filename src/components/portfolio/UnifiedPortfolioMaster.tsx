"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts'
import { 
  Target, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Sparkles, 
  Home, 
  Umbrella, 
  Rocket,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Save,
  Plus,
  X,
  Info,
  Eye,
  BarChart,
  Trash2,
  Calendar,
  PieChart as PieChartIcon,
  TrendingDown
} from 'lucide-react'

// Interfaces
interface OnboardingData {
  objective: 'retirement' | 'house' | 'emergency' | 'growth'
  initialAmount: number
  monthlyAmount: number
  timeHorizon: number
  currency: 'USD' | 'BRL'
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
}

interface ETFData {
  symbol: string
  name: string
  allocation_percent: number
  allocation_amount: number
  expense_ratio: number
  returns_12m: number
  volatility: number
  sharpe_ratio: number
  dividend_yield: number
  quality_score: number
  asset_class: string
}

interface PortfolioResult {
  portfolio: ETFData[]
  expected_return: number
  expected_volatility: number
  sharpe_ratio: number
  projections: {
    pessimistic: number
    expected: number
    optimistic: number
  } | null
  backtesting: {
    portfolio_return: number
    sp500_return: number
    ibovespa_return: number
    cdi_return: number
    historical_data: Array<{
      year: string
      portfolio: number
      sp500: number
      ibovespa: number
      cdi: number
    }>
  } | null
}

// Cores do Design System conforme documentação
const DESIGN_COLORS = {
  blue: '#3B82F6',      // Elementos primários, links
  green: '#10B981',     // Sucesso, retornos positivos  
  purple: '#8B5CF6',    // Métricas avançadas
  red: '#EF4444',       // Alertas, cenários negativos
  gray: '#6B7280'       // Textos secundários
}

const COLORS = [DESIGN_COLORS.blue, DESIGN_COLORS.green, '#F59E0B', DESIGN_COLORS.red, DESIGN_COLORS.purple, '#06B6D4', '#84CC16', '#F97316']

const objectives = [
  { value: 'retirement', label: 'Aposentadoria', icon: Target, description: 'Planejamento de longo prazo' },
  { value: 'house', label: 'Casa Própria', icon: Home, description: 'Conquista do imóvel' },
  { value: 'emergency', label: 'Reserva de Emergência', icon: Umbrella, description: 'Segurança financeira' },
  { value: 'growth', label: 'Crescimento Patrimonial', icon: Rocket, description: 'Multiplicar patrimônio' }
]

const riskProfiles = [
  { value: 'conservative', label: 'Conservador', description: 'Baixo risco, preservação de capital' },
  { value: 'moderate', label: 'Moderado', description: 'Risco equilibrado, crescimento moderado' },
  { value: 'aggressive', label: 'Arrojado', description: 'Alto risco, máximo crescimento' }
]

export default function UnifiedPortfolioMaster() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    objective: 'growth',
    initialAmount: 10000,
    monthlyAmount: 1000,
    timeHorizon: 60,
    currency: 'USD',
    riskProfile: 'moderate'
  })
  const [results, setResults] = useState<PortfolioResult | null>(null)
  const [selectedETFs, setSelectedETFs] = useState<string[]>([])
  const [compositionMode, setCompositionMode] = useState<'auto' | 'manual'>('auto')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ETFData[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Novos estados para melhorias
  const [selectedETFDetails, setSelectedETFDetails] = useState<any | null>(null)
  const [showETFModal, setShowETFModal] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  // Gerar Portfolio
  const generatePortfolio = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Mapear campos do frontend para o schema da API
      const apiPayload = {
        objective: onboardingData.objective,
        investmentAmount: onboardingData.initialAmount,
        monthlyContribution: onboardingData.monthlyAmount,
        timeHorizon: onboardingData.timeHorizon,
        riskProfile: onboardingData.riskProfile,
        preferences: {
          currency: onboardingData.currency
        }
      }
      
      const response = await fetch('/api/portfolio/unified-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      })
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar portfolio')
      }
      
      // Processar dados do portfolio
      const processedPortfolio = {
        portfolio: data.result.recommendedPortfolio.etfs.map((etf: any) => ({
          symbol: etf.symbol,
          name: etf.name,
          allocation_percent: etf.allocation,
          allocation_amount: etf.amount,
          expense_ratio: etf.metrics.expense_ratio,
          returns_12m: etf.metrics.returns_12m,
          volatility: etf.metrics.volatility_12m,
          sharpe_ratio: etf.metrics.sharpe_12m,
          dividend_yield: etf.metrics.dividend_yield,
          quality_score: etf.qualityScore,
          asset_class: etf.assetclass || 'Mixed'
        })),
        expected_return: data.result.recommendedPortfolio.portfolioMetrics.expectedReturn,
        expected_volatility: data.result.recommendedPortfolio.portfolioMetrics.expectedVolatility,
        sharpe_ratio: data.result.recommendedPortfolio.portfolioMetrics.sharpeRatio,
        projections: data.result.projections?.projecoes_longo_prazo?.[0] ? {
          pessimistic: data.result.projections.projecoes_longo_prazo[0].cenario_pessimista,
          expected: data.result.projections.projecoes_longo_prazo[0].cenario_esperado,
          optimistic: data.result.projections.projecoes_longo_prazo[0].cenario_otimista
        } : null,
        backtesting: data.result.backtesting?.resumo ? {
          portfolio_return: data.result.backtesting.resumo.retorno_total_portfolio,
          sp500_return: data.result.backtesting.resumo.retorno_total_spy,
          ibovespa_return: data.result.backtesting.resumo.retorno_total_ibov,
          cdi_return: data.result.backtesting.resumo.retorno_total_cdi,
          historical_data: data.result.backtesting.dados_anuais?.map((item: any) => ({
            year: item.ano?.toString(),
            portfolio: item.portfolio_acumulado,
            sp500: item.spy_acumulado,
            ibovespa: item.ibov_acumulado,
            cdi: item.cdi_acumulado
          }))
        } : null
      }
      
      setResults(processedPortfolio)
      setSelectedETFs(processedPortfolio.portfolio.map((etf: ETFData) => etf.symbol))
      setStep(4)
    } catch (err) {
      console.error('Erro ao gerar portfolio:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Função para recalcular portfolio quando ETFs são alterados
  const recalculatePortfolio = async (selectedETFs: string[]) => {
    if (selectedETFs.length < 2) {
      setError('Selecione pelo menos 2 ETFs para diversificação')
      return
    }

    setRecalculating(true)
    setError(null)

    try {
      console.log('🔄 Recalculando portfolio com ETFs:', selectedETFs)
      
      const response = await fetch('/api/portfolio/unified-master', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedETFs,
          riskProfile: onboardingData.riskProfile,
          investmentAmount: onboardingData.initialAmount,
          objective: onboardingData.objective, // CORREÇÃO: Campo obrigatório adicionado
          currency: 'USD'
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro no recálculo')
      }

      console.log('✅ Portfolio recalculado:', data.result)

      // Atualizar o portfolio com os novos dados
      const updatedPortfolio = {
        portfolio: data.result.portfolio.etfs.map((etf: any) => ({
          symbol: etf.symbol,
          name: etf.name || etf.symbol,
          allocation_percent: etf.allocation || 0,
          allocation_amount: etf.amount || 0,
          expense_ratio: etf.metrics?.expense_ratio || 0,
          returns_12m: etf.metrics?.returns_12m || 0,
          volatility: etf.metrics?.volatility_12m || 0,
          sharpe_ratio: etf.metrics?.sharpe_12m || 0,
          dividend_yield: etf.metrics?.dividend_yield || 0,
          quality_score: etf.qualityScore || 0,
          asset_class: etf.assetclass || 'Mixed'
        })),
        expected_return: data.result.portfolio.portfolioMetrics?.expectedReturn || 0,
        expected_volatility: data.result.portfolio.portfolioMetrics?.expectedVolatility || 0,
        sharpe_ratio: data.result.portfolio.portfolioMetrics?.sharpeRatio || 0,
        projections: data.result.projections?.projecoes_longo_prazo?.[0] ? {
          pessimistic: data.result.projections.projecoes_longo_prazo[0].cenario_pessimista,
          expected: data.result.projections.projecoes_longo_prazo[0].cenario_esperado,
          optimistic: data.result.projections.projecoes_longo_prazo[0].cenario_otimista
        } : null,
        backtesting: data.result.backtesting?.resumo ? {
          portfolio_return: data.result.backtesting.resumo.retorno_total_portfolio,
          sp500_return: data.result.backtesting.resumo.retorno_total_spy,
          ibovespa_return: data.result.backtesting.resumo.retorno_total_ibov,
          cdi_return: data.result.backtesting.resumo.retorno_total_cdi,
          historical_data: data.result.backtesting.dados_anuais?.map((item: any) => ({
            year: item.ano?.toString(),
            portfolio: item.portfolio_acumulado,
            sp500: item.spy_acumulado,
            ibovespa: item.ibov_acumulado,
            cdi: item.cdi_acumulado
          }))
        } : null
      }

      setResults(updatedPortfolio)
      
      // Atualizar ETFs selecionados
      setSelectedETFs(selectedETFs)
      
      console.log('✅ Portfolio atualizado no frontend')

    } catch (error) {
      console.error('❌ Erro no recálculo:', error)
      setError(error instanceof Error ? error.message : 'Erro no recálculo da carteira')
    } finally {
      setRecalculating(false)
    }
  }

  // Função melhorada para toggle de ETF
  const handleETFToggle = async (symbol: string) => {
    const newSelectedETFs = selectedETFs.includes(symbol)
      ? selectedETFs.filter(s => s !== symbol)
      : [...selectedETFs, symbol]

    console.log(`🔄 Toggle ETF ${symbol}:`, {
      before: selectedETFs,
      after: newSelectedETFs
    })

    // Atualizar imediatamente no estado local
    setSelectedETFs(newSelectedETFs)

    // Recalcular portfolio automaticamente se temos pelo menos 2 ETFs
    if (newSelectedETFs.length >= 2) {
      await recalculatePortfolio(newSelectedETFs)
    } else if (newSelectedETFs.length === 1) {
      setError('Selecione pelo menos 2 ETFs para diversificação')
    } else {
      setError(null)
    }
  }

  // Função para adicionar ETF via busca
  const handleAddETF = async (etf: any) => {
    if (selectedETFs.includes(etf.symbol)) {
      setError('ETF já está na carteira')
      return
    }

    const newSelectedETFs = [...selectedETFs, etf.symbol]
    
    console.log(`➕ Adicionando ETF ${etf.symbol}:`, {
      before: selectedETFs,
      after: newSelectedETFs
    })

    // Adicionar ao portfolio result se não existe
    if (results && !results.portfolio.find(p => p.symbol === etf.symbol)) {
      const updatedPortfolio = {
        ...results,
        portfolio: [
          ...results.portfolio,
          {
            symbol: etf.symbol,
            name: etf.name,
            allocation_percent: 0, // Será recalculado
            allocation_amount: 0, // Será recalculado
            expense_ratio: etf.expense_ratio || 0,
            returns_12m: etf.returns_12m || 0,
            volatility: etf.volatility || 0,
            sharpe_ratio: etf.sharpe_ratio || 0,
            dividend_yield: etf.dividend_yield || 0,
            quality_score: etf.quality_score || 0,
            asset_class: etf.asset_class || 'Mixed'
          }
        ]
      }
      setResults(updatedPortfolio)
    }

    // Recalcular automaticamente
    await recalculatePortfolio(newSelectedETFs)
    setSearchQuery('')
    setSearchResults([])
  }

  // Debounce para busca de ETFs (otimização de performance)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchETFs(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300) // 300ms de delay conforme documentação

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Buscar ETFs
  const searchETFs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setSearchLoading(true)
    
    try {
      // CORREÇÃO: Usar o parâmetro correto conforme documentação
      const response = await fetch(`/api/portfolio/unified-master?search=${encodeURIComponent(query)}&limit=20`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Mapear resultados da busca para estrutura esperada
        const mappedResults = (data.etfs || []).map((etf: any) => ({
          symbol: etf.symbol,
          name: etf.name,
          allocation_percent: 0,
          allocation_amount: 0,
          expense_ratio: etf.expense_ratio || 0,
          returns_12m: etf.returns_12m || 0,
          volatility: etf.volatility || 0,
          sharpe_ratio: etf.sharpe_ratio || 0,
          dividend_yield: etf.dividend_yield || 0,
          quality_score: etf.quality_score || 0,
          asset_class: etf.asset_class || 'Mixed'
        }))
        
        setSearchResults(mappedResults)
        console.log(`✅ Busca realizada: ${mappedResults.length} ETFs encontrados`)
      } else {
        throw new Error(data.error || 'Erro na busca')
      }
    } catch (err) {
      console.error('❌ Erro ao buscar ETFs:', err)
      setError(err instanceof Error ? err.message : 'Erro na busca de ETFs')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Formatters
  const formatCurrency = (value: number, currency: string = 'USD') => {
    if (!value || isNaN(value)) return currency === 'USD' ? '$0' : 'R$ 0'
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%'
    return `${value.toFixed(1)}%`
  }

  const getQualityLabel = (score: number) => {
    if (!score || isNaN(score)) return 'N/A'
    if (score >= 85) return 'Elite'
    if (score >= 70) return 'Excelente'
    if (score >= 55) return 'Boa'
    return 'Regular'
  }

  const getQualityColor = (score: number) => {
    if (!score || isNaN(score)) return 'text-gray-500'
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 55) return 'text-yellow-600'
    return 'text-gray-500'
  }

  // Buscar detalhes de um ETF específico
  const fetchETFDetails = async (symbol: string) => {
    try {
      setShowETFModal(true)
      setSelectedETFDetails({ loading: true })
      
      const response = await fetch(`/api/portfolio/unified-master?action=etf-details&symbol=${encodeURIComponent(symbol)}`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSelectedETFDetails(data.etf)
        console.log(`✅ Detalhes carregados para ${symbol}`)
      } else {
        throw new Error(data.error || 'Erro ao buscar detalhes')
      }
    } catch (err) {
      console.error('❌ Erro ao buscar detalhes do ETF:', err)
      setSelectedETFDetails({ 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      })
    }
  }

  // Render resultados melhorado
  const renderResults = () => {
    if (!results) return null

    const pieData = results.portfolio.map((etf, index) => ({
      name: etf.symbol,
      value: etf.allocation_percent,
      color: COLORS[index % COLORS.length]
    }))

    return (
      <div className="space-y-6">
        {/* Header com Ações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle>Sua Carteira Está Pronta!</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Simulação
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Carteira
                </Button>
              </div>
            </div>
            <CardDescription>
              Portfolio otimizado com base nos seus objetivos
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Controles de Personalização - SIMPLIFICADO */}
        <Card>
          <CardHeader>
            <CardTitle>Personalizar Carteira</CardTitle>
            <CardDescription>
              Ajuste sua carteira buscando novos ETFs ou recalculando a otimização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setCompositionMode(compositionMode === 'auto' ? 'manual' : 'auto')}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Search className="mr-2 h-4 w-4" />
                {compositionMode === 'auto' ? 'Buscar ETFs' : 'Modo Automático'}
              </Button>
              <Button 
                onClick={() => recalculatePortfolio(selectedETFs)}
                disabled={recalculating || selectedETFs.length < 2}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {recalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recalculando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recalcular Carteira
                  </>
                )}
              </Button>
              {selectedETFs.length < 2 && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Selecione pelo menos 2 ETFs para otimizar
                </div>
              )}
            </div>

            {/* Busca Manual de ETFs */}
            {compositionMode === 'manual' && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Label className="text-base font-medium">Buscar ETFs</Label>
                  <CustomTooltip text="Pesquise ETFs na nossa base de 1.370+ ativos para adicionar à sua carteira">
                    <Info className="h-4 w-4 text-gray-400" />
                  </CustomTooltip>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Digite o símbolo (ex: SPY) ou nome do ETF..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  
                  {/* Resultados da Busca */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-600">{searchResults.length} ETFs encontrados:</p>
                      {searchResults.map((etf) => (
                        <div 
                          key={etf.symbol} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer bg-white"
                          onClick={() => handleAddETF(etf)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{etf.symbol}</span>
                              <Badge variant="outline" className="text-xs">
                                Score: {etf.quality_score}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{etf.name}</p>
                            <p className="text-xs text-gray-500">{etf.asset_class}</p>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum ETF encontrado para "{searchQuery}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Layout Principal: Gráfico + Lista ETFs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Distribuição da Carteira</CardTitle>
                <CustomTooltip text="Visualização da alocação percentual de cada ETF na sua carteira">
                  <Info className="h-4 w-4 text-gray-400" />
                </CustomTooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ETFs da Carteira - MELHORADO */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>ETFs da Carteira</CardTitle>
                  <Badge variant="outline">{selectedETFs.length} ativos</Badge>
                </div>
                <CustomTooltip text="Clique nos ETFs para ver detalhes ou usar as checkboxes para remover">
                  <Info className="h-4 w-4 text-gray-400" />
                </CustomTooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {results.portfolio.map((etf, index) => (
                  <div
                    key={etf.symbol}
                    className={`p-3 border rounded-lg transition-all ${
                      selectedETFs.includes(etf.symbol) 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedETFs.includes(etf.symbol)}
                          onCheckedChange={() => handleETFToggle(etf.symbol)}
                        />
                        <div 
                          className="cursor-pointer flex-1" 
                          onClick={() => fetchETFDetails(etf.symbol)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{etf.symbol}</span>
                            <Eye className="h-3 w-3 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500">{etf.asset_class}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <CustomTooltip text="Percentual da carteira alocado neste ETF">
                          <div className="font-medium" style={{ color: COLORS[index % COLORS.length] }}>
                            {formatPercentage(etf.allocation_percent)}
                          </div>
                        </CustomTooltip>
                        <CustomTooltip text="Valor em moeda investido neste ETF">
                          <div className="text-sm text-gray-500">
                            {formatCurrency(etf.allocation_amount, onboardingData.currency)}
                          </div>
                        </CustomTooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas da Carteira */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CustomTooltip text="Retorno anual esperado baseado em dados históricos">
                  <TrendingUp className="h-5 w-5" style={{ color: DESIGN_COLORS.green }} />
                </CustomTooltip>
                <div>
                  <div className="text-2xl font-bold" style={{ color: DESIGN_COLORS.green }}>
                    {results.expected_return.toFixed(1)}%
                  </div>
                  <div className="text-sm" style={{ color: DESIGN_COLORS.gray }}>Retorno Esperado</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CustomTooltip text="Medida de risco - oscilação dos retornos">
                  <Shield className="h-5 w-5" style={{ color: DESIGN_COLORS.blue }} />
                </CustomTooltip>
                <div>
                  <div className="text-2xl font-bold" style={{ color: DESIGN_COLORS.blue }}>
                    {results.expected_volatility.toFixed(1)}%
                  </div>
                  <div className="text-sm" style={{ color: DESIGN_COLORS.gray }}>Volatilidade</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CustomTooltip text="Retorno ajustado pelo risco - quanto maior, melhor">
                  <BarChart3 className="h-5 w-5" style={{ color: DESIGN_COLORS.purple }} />
                </CustomTooltip>
                <div>
                  <div className="text-2xl font-bold" style={{ color: DESIGN_COLORS.purple }}>
                    {results.sharpe_ratio.toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: DESIGN_COLORS.gray }}>Sharpe Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CustomTooltip text="Valor total investido na carteira">
                  <DollarSign className="h-5 w-5" style={{ color: DESIGN_COLORS.green }} />
                </CustomTooltip>
                <div>
                  <div className="text-2xl font-bold" style={{ color: DESIGN_COLORS.green }}>
                    ${onboardingData.initialAmount?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm" style={{ color: DESIGN_COLORS.gray }}>Valor Investido</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backtesting vs Benchmarks - MELHORADO */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Backtesting vs. Benchmarks (10 anos)</CardTitle>
              <CustomTooltip text="Comparação da performance histórica da sua carteira contra os principais benchmarks do mercado">
                <Info className="h-4 w-4 text-gray-400" />
              </CustomTooltip>
            </div>
            <CardDescription>
              Performance histórica simulada comparada aos principais benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabela Resumida de Resultados */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Resumo de Performance (10 anos)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        +{results.backtesting?.portfolio_return.toFixed(1) || '0'}%
                      </div>
                      <div className="text-sm text-blue-700 font-medium">Sua Carteira</div>
                      <div className="text-xs text-blue-500 mt-1">
                        Valor final: {formatCurrency(onboardingData.initialAmount * (1 + (results.backtesting?.portfolio_return || 0) / 100))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">
                        +{results.backtesting?.sp500_return.toFixed(1) || '0'}%
                      </div>
                      <div className="text-sm text-gray-700 font-medium">S&P 500</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Diferença: {((results.backtesting?.portfolio_return || 0) - (results.backtesting?.sp500_return || 0)).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        +{results.backtesting?.ibovespa_return.toFixed(1) || '0'}%
                      </div>
                      <div className="text-sm text-orange-700 font-medium">IBOVESPA</div>
                      <div className="text-xs text-orange-500 mt-1">
                        Diferença: {((results.backtesting?.portfolio_return || 0) - (results.backtesting?.ibovespa_return || 0)).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        +{results.backtesting?.cdi_return.toFixed(1) || '0'}%
                      </div>
                      <div className="text-sm text-green-700 font-medium">CDI</div>
                      <div className="text-xs text-green-500 mt-1">
                        Diferença: {((results.backtesting?.portfolio_return || 0) - (results.backtesting?.cdi_return || 0)).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Gráfico de Performance Histórica - MELHORADO */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3">Evolução Histórica</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.backtesting?.historical_data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, name: string) => [
                        `$${Number(value).toFixed(0)}`,
                        name === 'portfolio' ? 'Sua Carteira' :
                        name === 'sp500' ? 'S&P 500' :
                        name === 'ibovespa' ? 'IBOVESPA' :
                        name === 'cdi' ? 'CDI' : name
                      ]}
                      labelFormatter={(label) => `Ano: ${label}`}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value: string) => 
                        value === 'portfolio' ? 'Sua Carteira' :
                        value === 'sp500' ? 'S&P 500' :
                        value === 'ibovespa' ? 'IBOVESPA' :
                        value === 'cdi' ? 'CDI' : value
                      }
                    />
                    
                    {/* Linha da Carteira - AZUL FORTE */}
                    <Line 
                      type="monotone" 
                      dataKey="portfolio" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: '#2563eb' }}
                      name="portfolio"
                    />
                    
                    {/* Linha S&P 500 - CINZA ESCURO */}
                    <Line 
                      type="monotone" 
                      dataKey="sp500" 
                      stroke="#4b5563" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#4b5563', strokeWidth: 2, r: 4 }}
                      name="sp500"
                    />
                    
                    {/* Linha IBOVESPA - LARANJA */}
                    <Line 
                      type="monotone" 
                      dataKey="ibovespa" 
                      stroke="#ea580c" 
                      strokeWidth={3}
                      strokeDasharray="10 5"
                      dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                      name="ibovespa"
                    />
                    
                    {/* Linha CDI - VERDE */}
                    <Line 
                      type="monotone" 
                      dataKey="cdi" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      strokeDasharray="2 2"
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
                      name="cdi"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Análise de Outperformance */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                <TrendingUp className="h-4 w-4" />
                Análise de Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Melhor que S&P 500:</span>
                  <span className={`ml-2 font-bold ${
                    (results.backtesting?.portfolio_return || 0) > (results.backtesting?.sp500_return || 0) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(results.backtesting?.portfolio_return || 0) > (results.backtesting?.sp500_return || 0) ? 'Sim' : 'Não'} 
                    ({((results.backtesting?.portfolio_return || 0) - (results.backtesting?.sp500_return || 0)).toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <span className="font-medium">Melhor que IBOVESPA:</span>
                  <span className={`ml-2 font-bold ${
                    (results.backtesting?.portfolio_return || 0) > (results.backtesting?.ibovespa_return || 0) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(results.backtesting?.portfolio_return || 0) > (results.backtesting?.ibovespa_return || 0) ? 'Sim' : 'Não'} 
                    ({((results.backtesting?.portfolio_return || 0) - (results.backtesting?.ibovespa_return || 0)).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projeções Monte Carlo - MELHORADAS com percentuais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Projeções para 12 Meses</CardTitle>
              <CustomTooltip text="Simulação Monte Carlo com 1.000 cenários baseados em dados históricos">
                <Info className="h-4 w-4 text-gray-400" />
              </CustomTooltip>
            </div>
            <CardDescription>
              Cenários de Monte Carlo baseados em dados históricos e simulações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cenário Pessimista */}
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-800">Pessimista</span>
                    <CustomTooltip text="Cenário de crise - apenas 15% das simulações resultaram em valores piores que este">
                      <Info className="h-4 w-4 text-red-400" />
                    </CustomTooltip>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {formatCurrency(results.projections?.pessimistic || 0)}
                  </div>
                  <div className="text-lg font-semibold text-red-500">
                    {(((results.projections?.pessimistic || 0) - onboardingData.initialAmount) / onboardingData.initialAmount * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-600 mt-2">
                    Percentil 15 - Se as coisas correrem mal
                  </div>
                </CardContent>
              </Card>

              {/* Cenário Esperado */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Esperado</span>
                    <CustomTooltip text="Cenário mais provável - mediana das simulações">
                      <Info className="h-4 w-4 text-green-400" />
                    </CustomTooltip>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(results.projections?.expected || 0)}
                  </div>
                  <div className="text-lg font-semibold text-green-500">
                    +{(((results.projections?.expected || 0) - onboardingData.initialAmount) / onboardingData.initialAmount * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-600 mt-2">
                    Mediana - O mais provável de acontecer
                  </div>
                </CardContent>
              </Card>

              {/* Cenário Otimista */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Otimista</span>
                    <CustomTooltip text="Cenário favorável - apenas 15% das simulações resultaram em valores melhores que este">
                      <Info className="h-4 w-4 text-blue-400" />
                    </CustomTooltip>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatCurrency(results.projections?.optimistic || 0)}
                  </div>
                  <div className="text-lg font-semibold text-blue-500">
                    +{(((results.projections?.optimistic || 0) - onboardingData.initialAmount) / onboardingData.initialAmount * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    Percentil 85 - Se tudo correr muito bem
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Explicação Didática */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Como interpretar estas projeções
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-red-600">Pessimista:</span> Use para se preparar para cenários adversos. É improvável, mas possível.
                </div>
                <div>
                  <span className="font-medium text-green-600">Esperado:</span> Use para planejamento financeiro. É o cenário mais provável.
                </div>
                <div>
                  <span className="font-medium text-blue-600">Otimista:</span> Representa o potencial máximo. Não conte apenas com este cenário.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Finais */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="flex-1 max-w-xs">
                <Save className="mr-2 h-4 w-4" />
                Implementar Carteira
              </Button>
              <Button variant="outline" size="lg" className="flex-1 max-w-xs">
                <BarChart className="mr-2 h-4 w-4" />
                Análise Detalhada
              </Button>
              <Button variant="outline" size="lg" className="flex-1 max-w-xs" onClick={() => setStep(1)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Nova Simulação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Componente Modal para Detalhes do ETF
  const ETFDetailsModal = () => {
    if (!showETFModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Detalhes do ETF</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowETFModal(false)
                  setSelectedETFDetails(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedETFDetails?.loading && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando detalhes...</p>
              </div>
            )}

            {selectedETFDetails?.error && (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                <p>Erro: {selectedETFDetails.error}</p>
              </div>
            )}

            {selectedETFDetails && !selectedETFDetails.loading && !selectedETFDetails.error && (
              <div className="space-y-6">
                {/* Cabeçalho do ETF */}
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{selectedETFDetails.symbol}</h3>
                    <Badge variant="outline">{selectedETFDetails.assetClass}</Badge>
                    {selectedETFDetails.qualityScore && (
                      <Badge className={getQualityColor(selectedETFDetails.qualityScore)}>
                        {getQualityLabel(selectedETFDetails.qualityScore)} ({selectedETFDetails.qualityScore})
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{selectedETFDetails.name}</p>
                  {selectedETFDetails.rationale && (
                    <p className="text-sm text-blue-600 italic">{selectedETFDetails.rationale}</p>
                  )}
                </div>

                {/* Métricas Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {formatPercentage(selectedETFDetails.returns12m || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Retorno 12m</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {formatPercentage(selectedETFDetails.volatility12m || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Volatilidade</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {(selectedETFDetails.sharpe12m || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Sharpe Ratio</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(selectedETFDetails.aum || 0)}
                    </div>
                    <div className="text-xs text-gray-500">AUM</div>
                  </div>
                </div>

                {/* Métricas Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Métricas Financeiras</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Taxa de Administração:</span>
                        <span>{(selectedETFDetails.expenseRatio || 0).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dividend Yield:</span>
                        <span>{formatPercentage(selectedETFDetails.dividendYield || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Drawdown:</span>
                        <span>{formatPercentage(selectedETFDetails.maxDrawdown || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume Médio:</span>
                        <span>{formatCurrency(selectedETFDetails.avgVolume || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedETFDetails.scoreComponents && (
                    <div>
                      <h4 className="font-semibold mb-3">Score de Qualidade</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Performance:</span>
                          <span>{selectedETFDetails.scoreComponents.performance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Consistência:</span>
                          <span>{selectedETFDetails.scoreComponents.consistency}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Liquidez:</span>
                          <span>{selectedETFDetails.scoreComponents.liquidity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custo:</span>
                          <span>{selectedETFDetails.scoreComponents.cost}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      if (!selectedETFs.includes(selectedETFDetails.symbol)) {
                        setSelectedETFs(prev => [...prev, selectedETFDetails.symbol])
                      }
                      setShowETFModal(false)
                    }}
                    disabled={selectedETFs.includes(selectedETFDetails.symbol)}
                  >
                    {selectedETFs.includes(selectedETFDetails.symbol) ? 'Já Selecionado' : 'Adicionar à Carteira'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowETFModal(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Componente Tooltip customizado
  const CustomTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(text)}
      onMouseLeave={() => setShowTooltip(null)}
    >
      {children}
      {showTooltip === text && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap z-10">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  )

  // Etapa 1: Objetivo
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Qual é o seu objetivo de investimento?
        </CardTitle>
        <CardDescription>
          Escolha o objetivo principal para personalizar sua carteira
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {objectives.map((obj) => {
            const Icon = obj.icon
            return (
              <div
                key={obj.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  onboardingData.objective === obj.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setOnboardingData(prev => ({ ...prev, objective: obj.value as any }))}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium">{obj.label}</div>
                    <div className="text-sm text-gray-500">{obj.description}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setStep(2)}>
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Etapa 2: Valores (com validações em tempo real)
  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Valores do Investimento
        </CardTitle>
        <CardDescription>
          Configure os valores e horizonte temporal do seu investimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="initialAmount">
              Valor Inicial ({onboardingData.currency})
              <CustomTooltip text="Valor mínimo: $10.000 - Valor que você tem disponível para investir imediatamente">
                <Info className="inline h-3 w-3 ml-1 text-gray-400" />
              </CustomTooltip>
            </Label>
            <Input
              id="initialAmount"
              type="number"
              value={onboardingData.initialAmount}
              onChange={(e) => {
                const value = Number(e.target.value)
                setOnboardingData(prev => ({ ...prev, initialAmount: value }))
                // Validação em tempo real
                if (value < 10000) {
                  setError('Valor mínimo de investimento: $10.000')
                } else {
                  setError(null)
                }
              }}
              placeholder="10000"
              min="10000"
              max="50000000"
              step="1000"
              className={`${onboardingData.initialAmount < 10000 ? 'border-red-500' : 'border-gray-300'}`}
            />
            {onboardingData.initialAmount < 10000 && (
              <p className="text-sm text-red-600">Valor mínimo: $10.000</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthlyAmount">
              Aporte Mensal ({onboardingData.currency})
              <CustomTooltip text="Valor que você pretende investir mensalmente (opcional)">
                <Info className="inline h-3 w-3 ml-1 text-gray-400" />
              </CustomTooltip>
            </Label>
            <Input
              id="monthlyAmount"
              type="number"
              value={onboardingData.monthlyAmount}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, monthlyAmount: Number(e.target.value) }))}
              placeholder="1000"
              min="0"
              max="100000"
              step="100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeHorizon">
              Horizonte Temporal (meses)
              <CustomTooltip text="Período de 1 a 20 anos (12 a 240 meses) que você pretende manter o investimento">
                <Info className="inline h-3 w-3 ml-1 text-gray-400" />
              </CustomTooltip>
            </Label>
            <Input
              id="timeHorizon"
              type="number"
              value={onboardingData.timeHorizon}
              onChange={(e) => {
                const value = Number(e.target.value)
                setOnboardingData(prev => ({ ...prev, timeHorizon: value }))
                // Validação em tempo real
                if (value < 12 || value > 240) {
                  setError('Horizonte deve estar entre 12 e 240 meses (1 a 20 anos)')
                } else {
                  setError(null)
                }
              }}
              placeholder="60"
              min="12"
              max="240"
              step="6"
              className={`${onboardingData.timeHorizon < 12 || onboardingData.timeHorizon > 240 ? 'border-red-500' : 'border-gray-300'}`}
            />
            {(onboardingData.timeHorizon < 12 || onboardingData.timeHorizon > 240) && (
              <p className="text-sm text-red-600">Período deve estar entre 1 e 20 anos</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">
              Moeda
              <CustomTooltip text="Moeda base para seus investimentos e relatórios">
                <Info className="inline h-3 w-3 ml-1 text-gray-400" />
              </CustomTooltip>
            </Label>
            <Select 
              value={onboardingData.currency} 
              onValueChange={(value: 'USD' | 'BRL') => setOnboardingData(prev => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep(1)}>
            Voltar
          </Button>
          <Button 
            onClick={() => setStep(3)}
            disabled={onboardingData.initialAmount < 10000 || onboardingData.timeHorizon < 12 || onboardingData.timeHorizon > 240}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Etapa 3: Perfil de Risco
  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Perfil de Risco
        </CardTitle>
        <CardDescription>
          Escolha seu perfil de investimento baseado na sua tolerância ao risco
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {riskProfiles.map((profile) => (
            <div
              key={profile.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                onboardingData.riskProfile === profile.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setOnboardingData(prev => ({ ...prev, riskProfile: profile.value as any }))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{profile.label}</div>
                  <div className="text-sm text-gray-500">{profile.description}</div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {onboardingData.riskProfile === profile.value && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            Voltar
          </Button>
          <Button onClick={generatePortfolio} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Carteira
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Render principal
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Erro</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setError(null)
              setStep(1)
            }}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Progress Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Steps */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderResults()}

      {/* Componentes Modais */}
      <ETFDetailsModal />
    </div>
  )
} 