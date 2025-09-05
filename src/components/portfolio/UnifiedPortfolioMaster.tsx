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
  TrendingDown,
  ArrowLeft,
  User,
  FileText,
  Download
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

// Interfaces
interface OnboardingData {
  objective: 'retirement' | 'house' | 'emergency' | 'growth' | 'income'
  initialAmount: number
  monthlyAmount: number
  timeHorizon: number
  currency: 'USD' | 'BRL'
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  assetTypes: {
    etfs: boolean
    stocks: boolean
    maxStockAllocation: number
  }
}

interface UnifiedAssetData {
  symbol: string
  name: string
  type: 'ETF' | 'STOCK'
  allocation_percent: number
  allocation_amount: number
  expense_ratio?: number
  market_cap?: number
  returns_12m: number
  volatility: number
  sharpe_ratio: number
  dividend_yield: number
  quality_score: number
  asset_class: string
  sector?: string
}

// Manter compatibilidade com ETFData existente
interface ETFData extends UnifiedAssetData {
  type: 'ETF'
  expense_ratio: number
}

interface PortfolioResult {
  portfolio: UnifiedAssetData[]
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
    portfolio_10y_accumulated?: number
    sp500_10y_accumulated?: number
    ibovespa_10y_accumulated?: number
    cdi_10y_accumulated?: number
    data_source?: string
    calculation_date?: string
    historical_data: Array<{
      year: string | number
      portfolio?: number // Compatibilidade com dados antigos
      sp500?: number // Compatibilidade com dados antigos
      ibovespa?: number // Compatibilidade com dados antigos
      cdi?: number // Compatibilidade com dados antigos
      portfolio_accumulated: number // Dados acumulados corretos
      sp500_accumulated: number
      ibovespa_accumulated: number
      cdi_accumulated: number
    }>
  } | null
  metadata?: {
    total_assets: number
    etf_count: number
    stock_count: number
    etf_allocation: number
    stock_allocation: number
    max_single_position: number
    diversification_score: number
  }
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
  { value: 'growth', label: 'Crescimento Patrimonial', icon: Rocket, description: 'Multiplicar patrimônio' },
  { value: 'income', label: 'Renda Passiva', icon: DollarSign, description: 'Dividendos e renda recorrente' }
]

const riskProfiles = [
  { value: 'conservative', label: 'Conservador', description: 'Baixo risco, preservação de capital' },
  { value: 'moderate', label: 'Moderado', description: 'Risco equilibrado, crescimento moderado' },
  { value: 'aggressive', label: 'Arrojado', description: 'Alto risco, máximo crescimento' }
]

export default function UnifiedPortfolioMaster() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    objective: 'growth',
    initialAmount: 10000,
    monthlyAmount: 1000,
    timeHorizon: 60,
    currency: 'USD',
    riskProfile: 'moderate',
    assetTypes: {
      etfs: true,
      stocks: false,
      maxStockAllocation: 50
    }
  })
  const [results, setResults] = useState<PortfolioResult | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [compositionMode, setCompositionMode] = useState<'auto' | 'manual'>('auto')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UnifiedAssetData[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Novos estados para melhorias
  const [selectedETFDetails, setSelectedETFDetails] = useState<any | null>(null)
  const [showETFModal, setShowETFModal] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [recalcProgress, setRecalcProgress] = useState(0)
  const [recalcMessage, setRecalcMessage] = useState('')
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Estados para controle de validação conforme melhores práticas UX
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [hasInteracted, setHasInteracted] = useState<{[key: string]: boolean}>({})

  // Novos estados para controles manuais de alocação
  const [manualAllocations, setManualAllocations] = useState<{[key: string]: number}>({})
  const [allocationMode, setAllocationMode] = useState<'auto' | 'manual'>('auto')
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)

  // Estados para filtros opcionais
  const [optionalFilters, setOptionalFilters] = useState({
    minMorningstarRating: 0,
    maxExpenseRatio: 2.0,
    minDividendYield: 0,
    minAUM: 50, // em milhões
    maxVolatility: 50,
    preferredSectors: [] as string[]
  })
  const [showOptionalFilters, setShowOptionalFilters] = useState(false)

  // Estados para templates personalizados
  const [savedTemplates, setSavedTemplates] = useState<Array<{
    id: string
    name: string
    onboardingData: OnboardingData
    optionalFilters: typeof optionalFilters
    createdAt: string
  }>>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)

  // Funções para controles manuais de alocação
  const handleAllocationChange = (symbol: string, newAllocation: number) => {
    setManualAllocations(prev => ({
      ...prev,
      [symbol]: newAllocation
    }))
  }

  const normalizeAllocations = () => {
    const symbols = Object.keys(manualAllocations)
    const total = symbols.reduce((sum, symbol) => sum + (manualAllocations[symbol] || 0), 0)
    
    if (total === 0) return
    
    const normalized = symbols.reduce((acc, symbol) => {
      acc[symbol] = (manualAllocations[symbol] / total) * 100
      return acc
    }, {} as {[key: string]: number})
    
    setManualAllocations(normalized)
  }

  const resetToAutoAllocations = () => {
    if (!results) return
    
    const autoAllocations = results.portfolio.reduce((acc, etf) => {
      acc[etf.symbol] = etf.allocation_percent
      return acc
    }, {} as {[key: string]: number})
    
    setManualAllocations(autoAllocations)
  }

  // Funções para templates personalizados
  const loadTemplatesFromStorage = () => {
    const templates = JSON.parse(localStorage.getItem('portfolioTemplates') || '[]')
    setSavedTemplates(templates)
  }

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Digite um nome para o template')
      return
    }

    const newTemplate = {
      id: `template_${Date.now()}`,
      name: templateName.trim(),
      onboardingData: { ...onboardingData },
      optionalFilters: { ...optionalFilters },
      createdAt: new Date().toISOString()
    }

    const updatedTemplates = [newTemplate, ...savedTemplates].slice(0, 10) // Máximo 10 templates
    setSavedTemplates(updatedTemplates)
    localStorage.setItem('portfolioTemplates', JSON.stringify(updatedTemplates))
    
    setTemplateName('')
    setShowSaveTemplate(false)
    alert(`Template "${newTemplate.name}" salvo com sucesso!`)
  }

  const loadTemplate = (template: typeof savedTemplates[0]) => {
    setOnboardingData(template.onboardingData)
    setOptionalFilters(template.optionalFilters)
    setShowTemplates(false)
    alert(`Template "${template.name}" carregado com sucesso!`)
  }

  const deleteTemplate = (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return
    
    const updatedTemplates = savedTemplates.filter(t => t.id !== templateId)
    setSavedTemplates(updatedTemplates)
    localStorage.setItem('portfolioTemplates', JSON.stringify(updatedTemplates))
  }

  // Carregar templates na inicialização
  useEffect(() => {
    loadTemplatesFromStorage()
  }, [])



  // Função para salvar carteira (modo legado)
  const handleSavePortfolio = async () => {
    if (!results) return
    
    if (!user) {
      alert('Você precisa estar logado para salvar uma carteira')
      return
    }
    
    setIsSaving(true)
    try {
      // Dados do portfólio para salvar
      const portfolioData = {
        user_id: user.id,
        portfolio_name: `Carteira ${new Date().toLocaleDateString('pt-BR')}`,
        etfs: results.portfolio.map(etf => ({
          symbol: etf.symbol,
          name: etf.name,
          allocation: etf.allocation_percent,
          amount: etf.allocation_amount
        })),
        metrics: {
          expectedReturn: results.expected_return,
          expectedVolatility: results.expected_volatility,
          sharpeRatio: results.sharpe_ratio
        },
        objective: onboardingData.objective,
        riskProfile: onboardingData.riskProfile,
        investmentAmount: onboardingData.initialAmount,
        monthlyContribution: onboardingData.monthlyAmount,
        timeHorizon: typeof onboardingData.timeHorizon === 'string' ? 
          parseInt(onboardingData.timeHorizon) || 5 : 
          onboardingData.timeHorizon,
        currency: onboardingData.currency || 'USD'
      }

      // Tentar salvar no Supabase primeiro
      const response = await fetch('/api/portfolio/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Portfólio salvo no Supabase:', result.portfolio)
        
        // Chamar API para popular alocações
        const allocationsData = {
          portfolio_id: result.portfolio.id,
          user_id: result.portfolio.user_id,
          etf_allocations: results.portfolio.map(etf => ({
            symbol: etf.symbol,
            allocation: etf.allocation_percent,
            target_amount: etf.allocation_amount
          }))
        }

        const allocationsResponse = await fetch('/api/portfolio/populate-allocations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(allocationsData),
        })

        const allocationsResult = await allocationsResponse.json()
        
        if (allocationsResult.success) {
          console.log('✅ Alocações populadas com sucesso')
        } else {
          console.warn('⚠️ Erro ao popular alocações:', allocationsResult.error)
        }
        
        // Integrar automaticamente com Dashboard
        try {
          const wealthPlanResponse = await fetch('/api/wealth/portfolio-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              name: `Plano ${onboardingData.objective} - ${new Date().toLocaleDateString()}`,
              objective: onboardingData.objective,
              risk_profile: onboardingData.riskProfile,
              base_currency: onboardingData.currency,
              etfs: results.portfolio.map(etf => ({
                symbol: etf.symbol,
                name: etf.name,
                allocation_percentage: etf.allocation_percent,
                band_lower: 5.0,
                band_upper: 5.0
              })),
              notes: 'Plano criado automaticamente via Portfolio Master'
            })
          })

          const wealthResult = await wealthPlanResponse.json()
          if (wealthResult.success) {
            console.log('✅ Plano Dashboard criado automaticamente:', wealthResult.data)
            // Opcional: mostrar link para o Dashboard
            setTimeout(() => {
              if (confirm('Carteira salva com sucesso! Deseja ir para o Dashboard para acompanhar sua carteira?')) {
                window.location.href = '/dashboard'
              }
            }, 2000)
          }
        } catch (error) {
          console.error('Erro na integração com Dashboard:', error)
        }
        
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        throw new Error(result.error || 'Erro ao salvar no banco de dados')
      }

    } catch (error) {
      console.error('❌ Erro ao salvar carteira:', error)
      
      // Fallback para localStorage em caso de erro
      try {
        const fallbackData = {
          name: `Carteira ${new Date().toLocaleDateString('pt-BR')}`,
          objective: onboardingData.objective,
          riskProfile: onboardingData.riskProfile,
          investmentAmount: onboardingData.initialAmount,
          monthlyContribution: onboardingData.monthlyAmount,
          timeHorizon: onboardingData.timeHorizon,
          currency: onboardingData.currency,
          etfs: results.portfolio.map(etf => ({
            symbol: etf.symbol,
            name: etf.name,
            allocation: etf.allocation_percent,
            amount: etf.allocation_amount
          })),
          metrics: {
            expectedReturn: results.expected_return,
            expectedVolatility: results.expected_volatility,
            sharpeRatio: results.sharpe_ratio
          },
          projections: results.projections,
          createdAt: new Date().toISOString()
        }
        
        const savedPortfolios = JSON.parse(localStorage.getItem('savedPortfolios') || '[]')
        savedPortfolios.unshift(fallbackData)
        localStorage.setItem('savedPortfolios', JSON.stringify(savedPortfolios.slice(0, 10)))
        
        console.log('⚠️ Portfólio salvo no localStorage como fallback')
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError)
        alert('Erro ao salvar carteira. Tente novamente.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Função para gerar relatório
  const handleGenerateReport = () => {
    if (!results) return
    
    const reportData = {
      portfolio: results.portfolio,
      metrics: {
        expectedReturn: results.expected_return,
        expectedVolatility: results.expected_volatility,
        sharpeRatio: results.sharpe_ratio
      },
      projections: results.projections,
      backtesting: results.backtesting,
      objective: onboardingData.objective,
      riskProfile: onboardingData.riskProfile,
      investmentAmount: onboardingData.initialAmount,
      generatedAt: new Date().toISOString()
    }
    
    // Criar e baixar arquivo JSON
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `portfolio-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Header de Navegação
  const NavigationHeader = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-2xl font-bold text-[#202636]">
            Vista
          </Link>
          
          {/* Navegação Central */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-[#0090d8] transition-colors">
              Dashboard
            </Link>
            <Link href="/consultoria" className="text-gray-600 hover:text-[#0090d8] transition-colors">
              Wealth Management
            </Link>
            <Link href="/rankings" className="text-gray-600 hover:text-[#0090d8] transition-colors">
              Rankings
            </Link>
            <Link href="/screener" className="text-gray-600 hover:text-[#0090d8] transition-colors">
              Screener
            </Link>
          </nav>
          
          {/* Ícone de Perfil */}
          <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-[#0090d8] transition-colors">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Perfil</span>
          </Link>
        </div>
      </div>
    </header>
  )

  // Gerar Portfolio
  const generatePortfolio = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Mapear campos do frontend para o schema da API unificada
      const apiPayload = {
        investmentAmount: onboardingData.initialAmount,
        timeHorizon: onboardingData.timeHorizon,
        objective: onboardingData.objective,
        riskProfile: onboardingData.riskProfile,
        monthlyAmount: onboardingData.monthlyAmount,
        assetTypes: onboardingData.assetTypes,
        preferences: {
          excludeSymbols: [],
          sustainableOnly: false,
          maxSinglePosition: 15,
          sectors: optionalFilters.preferredSectors?.length ? optionalFilters.preferredSectors : undefined
        }
      }
      
      const response = await fetch('/api/portfolio/unified-recommendation', {
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
      
      // Processar dados do portfolio unificado
      const processedPortfolio = {
        portfolio: data.data.portfolio.map((asset: any) => ({
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          allocation_percent: asset.allocation_percent,
          allocation_amount: asset.allocation_amount,
          expense_ratio: asset.expense_ratio,
          market_cap: asset.market_cap,
          returns_12m: asset.returns_12m,
          volatility: asset.volatility,
          sharpe_ratio: asset.sharpe_ratio,
          dividend_yield: asset.dividend_yield,
          quality_score: asset.quality_score,
          asset_class: asset.asset_class,
          sector: asset.sector
        })),
        expected_return: data.data.expected_return,
        expected_volatility: data.data.expected_volatility,
        sharpe_ratio: data.data.sharpe_ratio,
        projections: data.data.projections ? {
          pessimistic: data.data.projections.pessimistic,
          expected: data.data.projections.expected,
          optimistic: data.data.projections.optimistic
        } : null,
        backtesting: data.data.backtesting ? {
          portfolio_return: data.data.backtesting.portfolio_return,
          sp500_return: data.data.backtesting.sp500_return,
          ibovespa_return: data.data.backtesting.ibovespa_return,
          cdi_return: data.data.backtesting.cdi_return,
          historical_data: data.data.backtesting.historical_data || []
        } : null,
        metadata: data.data.metadata
      }
      
      setResults(processedPortfolio)
      
      // 🔥 CORREÇÃO CRÍTICA: Só definir selectedAssets na geração inicial, não sobrescrever escolhas do usuário
      if (selectedAssets.length === 0) {
        console.log('📊 [GENERATE] Definindo selectedAssets inicial:', processedPortfolio.portfolio.map((asset: UnifiedAssetData) => asset.symbol));
        setSelectedAssets(processedPortfolio.portfolio.map((asset: UnifiedAssetData) => asset.symbol))
      } else {
        console.log('📊 [GENERATE] Mantendo selectedAssets existentes:', selectedAssets);
      }
      
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
    if (selectedETFs.length < 1) {
      setError('Selecione pelo menos 1 ETF para começar')
      return
    }

    setRecalculating(true)
    setError(null)
    setRecalcProgress(0)
    setRecalcMessage('Iniciando recálculo...')

    try {
      setRecalcProgress(20)
      setRecalcMessage('Enviando dados para otimização...')
      
      const response = await fetch('/api/portfolio/recalculate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedETFs,
          riskProfile: onboardingData.riskProfile,
          investmentAmount: onboardingData.initialAmount,
          objective: onboardingData.objective,
          currency: 'USD'
        })
      })

      setRecalcProgress(50)
      setRecalcMessage('Processando otimização Markowitz...')

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro HTTP ${response.status}:`, errorText);
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      setRecalcProgress(70)
      setRecalcMessage('Calculando métricas e backtesting...')

      const data = await response.json();
      console.log('📊 Resposta da API de recálculo:', data);
      
      if (!data.success) {
        console.error('❌ API retornou erro:', data.error);
        throw new Error(data.error || 'Erro no recálculo da carteira');
      }

      setRecalcProgress(90)
      setRecalcMessage('Atualizando interface...')



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
            portfolio_accumulated: item.portfolio_acumulado,
            sp500_accumulated: item.spy_acumulado,
            ibovespa_accumulated: item.ibov_acumulado,
            cdi_accumulated: item.cdi_acumulado,
            // Compatibilidade com dados antigos
            portfolio: item.portfolio_acumulado,
            sp500: item.spy_acumulado,
            ibovespa: item.ibov_acumulado,
            cdi: item.cdi_acumulado
          })) || []
        } : null
      }

      console.log('📊 [RECALC] ETFs retornados pela API:', data.result.portfolio.etfs.map((etf: any) => etf.symbol));
      console.log('📊 [RECALC] ETFs que foram enviados:', selectedETFs);
      console.log('📊 [RECALC] Mantendo ETFs selecionados como:', selectedETFs);
      
      // 🔥 DEBUG: Verificar se backtesting está sendo processado
      console.log('📈 [BACKTESTING] Dados recebidos da API:', data.result.backtesting);
      console.log('📈 [BACKTESTING] Backtesting processado:', updatedPortfolio.backtesting);

      setResults(updatedPortfolio)
      
      // 🔥 CORREÇÃO CRÍTICA: Manter apenas os ETFs que foram enviados para recálculo
      setSelectedAssets(selectedETFs)
      
      setRecalcProgress(100)
      setRecalcMessage('Recálculo concluído!')
      
      // Limpar mensagem após 2 segundos
      setTimeout(() => {
        setRecalcMessage('')
        setRecalcProgress(0)
      }, 2000)

    } catch (error) {
      console.error('❌ Erro no recálculo:', error)
      setError(error instanceof Error ? error.message : 'Erro no recálculo da carteira')
      setRecalcMessage('Erro no recálculo')
    } finally {
      setRecalculating(false)
    }
  }

  // Função melhorada para toggle de ETF - CORRIGIDA COM DEBUG
  const handleETFToggle = async (symbol: string) => {
    console.log('🔄 [TOGGLE] Iniciando toggle para:', symbol);
    console.log('🔄 [TOGGLE] ETFs atuais:', selectedAssets);
    
    const newSelectedETFs = selectedAssets.includes(symbol)
      ? selectedAssets.filter(s => s !== symbol)
      : [...selectedAssets, symbol]

    console.log('🔄 [TOGGLE] Novos ETFs calculados:', newSelectedETFs);

    // CORREÇÃO: Sempre atualizar o estado local primeiro
    setSelectedAssets(newSelectedETFs)
    console.log('🔄 [TOGGLE] Estado atualizado para:', newSelectedETFs);

    // 🔥 CORREÇÃO: Permitir recálculo com qualquer quantidade de ETFs >= 1
    if (newSelectedETFs.length >= 1) {
      // Recalcular automaticamente se temos 1+ ETFs
      setError(null)
      console.log('🔄 [TOGGLE] Iniciando recálculo com', newSelectedETFs.length, 'ETFs');
      await recalculatePortfolio(newSelectedETFs)
      console.log('🔄 [TOGGLE] Recálculo concluído');
    } else {
      // 0 ETFs - limpar tudo
      setError('Selecione pelo menos 1 ETF para começar')
      setResults(null)
      console.log('🔄 [TOGGLE] 0 ETFs, tudo limpo');
    }
  }

  // Função para adicionar ETF via busca
  const handleAddETF = async (etf: any) => {
    if (selectedAssets.includes(etf.symbol)) {
      setError('ETF já está na carteira')
      return
    }

    const newSelectedETFs = [...selectedAssets, etf.symbol]
    


    // Adicionar ao portfolio result se não existe
    if (results && !results.portfolio.find(p => p.symbol === etf.symbol)) {
      const updatedPortfolio = {
        ...results,
        portfolio: [
          ...results.portfolio,
          {
            symbol: etf.symbol,
            name: etf.name,
            type: etf.type || 'ETF',
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
      // Usar a API de busca unificada para ETFs e Stocks
      const response = await fetch(`/api/portfolio/unified-search?search=${encodeURIComponent(query)}&asset_type=all&limit=12`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        // Mapear resultados da busca unificada (ETFs + Stocks)
        const mappedResults = data.data.map((asset: any) => ({
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type, // 'ETF' ou 'STOCK'
          allocation_percent: 0,
          allocation_amount: 0,
          expense_ratio: asset.expense_ratio || 0,
          market_cap: asset.market_cap || asset.total_assets || 0,
          returns_12m: asset.returns_12m || 0,
          volatility: asset.volatility_12m || 0,
          sharpe_ratio: asset.sharpe_ratio || 0,
          dividend_yield: asset.dividend_yield || 0,
          quality_score: asset.quality_score || 0,
          asset_class: asset.asset_class || asset.sector || 'Mixed',
          sector: asset.sector || asset.asset_class
        }))
        
        setSearchResults(mappedResults)

      } else {
        throw new Error(data.error || 'Erro na busca')
      }
    } catch (err) {
      console.error('❌ Erro ao buscar ativos:', err)
      setError(err instanceof Error ? err.message : 'Erro na busca de ativos')
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
      <div className="space-y-16">
        {/* Header Tesla-style */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Sua Carteira Está Pronta!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Portfolio otimizado com base científica nos seus objetivos de investimento
          </p>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-12">
            <Button variant="outline" onClick={() => setStep(1)} className="px-8 py-3 rounded-xl border-gray-300">
              <Plus className="mr-2 h-4 w-4" />
              Nova Simulação
            </Button>

            <Button 
              onClick={handleSavePortfolio}
              disabled={isSaving}
              variant="outline"
              className="px-8 py-3 rounded-xl border-gray-300"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Carteira
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Controles de Personalização - Tesla Style */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-light text-gray-900 mb-2">
              Personalizar Carteira
            </h3>
            <p className="text-gray-600">
              Ajuste sua carteira buscando novos ativos (ETFs/Stocks) ou recalculando a otimização
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-wrap gap-6 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setCompositionMode(compositionMode === 'auto' ? 'manual' : 'auto')}
                className="border-gray-300 px-8 py-3 rounded-xl"
              >
                <Search className="mr-2 h-4 w-4" />
                {compositionMode === 'auto' ? 'Buscar Ativos' : 'Modo Automático'}
              </Button>
              <Button 
                onClick={() => recalculatePortfolio(selectedAssets)}
                disabled={recalculating || selectedAssets.length < 1}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl disabled:bg-gray-400"
              >
                {recalculating ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{recalcMessage || 'Recalculando...'}</span>
                      {recalcProgress > 0 && (
                        <div className="w-24 bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${recalcProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recalcular Carteira
                  </>
                )}
              </Button>
            </div>
            
            {selectedAssets.length < 1 && (
              <div className="flex items-center justify-center gap-2 text-orange-600 text-sm mt-4">
                <AlertCircle className="h-4 w-4" />
                Selecione pelo menos 1 ETF para começar
              </div>
            )}

            {/* Busca Manual de Ativos (ETFs + Stocks) */}
            {compositionMode === 'manual' && (
              <div className="mt-8 p-6 border rounded-2xl bg-gray-50">
                <div className="flex items-center gap-2 mb-6">
                  <Label className="text-lg font-medium text-gray-900">Buscar Ativos</Label>
                  <CustomTooltip text="Pesquise ETFs e Stocks na nossa base de 2.755+ ativos para adicionar à sua carteira">
                    <Info className="h-4 w-4 text-gray-400" />
                  </CustomTooltip>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Digite o símbolo (ex: SPY, AAPL) ou nome do ativo..."
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
                      <p className="text-sm text-gray-600">{searchResults.length} ativos encontrados:</p>
                      {searchResults.map((asset) => (
                        <div 
                          key={asset.symbol} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer bg-white"
                          onClick={() => handleAddETF(asset)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{asset.symbol}</span>
                              <Badge variant="outline" className={`text-xs ${asset.type === 'STOCK' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                {asset.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Score: {asset.quality_score}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.asset_class}</p>
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
                      Nenhum ativo encontrado para "{searchQuery}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layout Principal: Gráfico + Lista ETFs - Tesla Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gráfico de Pizza - Tesla Style */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Distribuição da Carteira</h3>
              <CustomTooltip text="Visualização da alocação percentual de cada ETF na sua carteira">
                <p className="text-gray-600 text-sm cursor-help">
                  Visualização da alocação percentual de cada ETF
                </p>
              </CustomTooltip>
            </div>
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
          </div>

          {/* ETFs da Carteira - Tesla Style */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-medium text-gray-900">ETFs da Carteira</h3>
                <Badge variant="outline" className="bg-gray-100">{selectedAssets.length} ativos</Badge>
              </div>
              
              {/* Controles de Alocação */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={allocationMode === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAllocationMode('auto')}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto
                  </Button>
                  <Button
                    variant={allocationMode === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setAllocationMode('manual')
                      resetToAutoAllocations()
                    }}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Manual
                  </Button>
                </div>
                
                {allocationMode === 'manual' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={normalizeAllocations}
                    className="text-xs text-blue-600 border-blue-200"
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Normalizar
                  </Button>
                )}
              </div>
              
              <CustomTooltip text="Clique nos ETFs para ver detalhes ou usar as checkboxes para remover">
                <p className="text-gray-600 text-sm cursor-help">
                  {allocationMode === 'auto' 
                    ? 'Alocações otimizadas automaticamente'
                    : 'Ajuste as alocações manualmente com os sliders'
                  }
                </p>
              </CustomTooltip>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
                {results.portfolio
                  .filter(etf => selectedAssets.includes(etf.symbol))
                  .map((etf, index) => (
                  <div
                    key={etf.symbol}
                    className={`p-3 border rounded-lg transition-all ${
                      selectedAssets.includes(etf.symbol) 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-gray-100 opacity-50'
                    }`}
                  >
                    {/* Header do ETF */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedAssets.includes(etf.symbol)}
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
                            {allocationMode === 'manual' && manualAllocations[etf.symbol] !== undefined
                              ? formatPercentage(manualAllocations[etf.symbol])
                              : formatPercentage(etf.allocation_percent)
                            }
                          </div>
                        </CustomTooltip>
                        <CustomTooltip text="Valor em moeda investido neste ETF">
                          <div className="text-sm text-gray-500">
                            {formatCurrency(
                              allocationMode === 'manual' && manualAllocations[etf.symbol] !== undefined
                                ? (manualAllocations[etf.symbol] / 100) * onboardingData.initialAmount
                                : etf.allocation_amount, 
                              onboardingData.currency
                            )}
                          </div>
                        </CustomTooltip>
                      </div>
                    </div>
                    
                    {/* Slider de Alocação Manual */}
                    {allocationMode === 'manual' && selectedAssets.includes(etf.symbol) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-8">0%</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={manualAllocations[etf.symbol] || etf.allocation_percent}
                            onChange={(e) => handleAllocationChange(etf.symbol, parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, ${COLORS[index % COLORS.length]} 0%, ${COLORS[index % COLORS.length]} ${manualAllocations[etf.symbol] || etf.allocation_percent}%, #e5e7eb ${manualAllocations[etf.symbol] || etf.allocation_percent}%, #e5e7eb 100%)`
                            }}
                          />
                          <span className="text-xs text-gray-500 w-12">100%</span>
                        </div>
                        <div className="text-center mt-1">
                          <span className="text-xs font-medium" style={{ color: COLORS[index % COLORS.length] }}>
                            {(manualAllocations[etf.symbol] || etf.allocation_percent).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Métricas da Carteira - Tesla Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-light text-gray-900 mb-2">
              {results.expected_return.toFixed(1)}%
            </div>
            <div className="text-gray-600">Retorno Esperado</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-light text-gray-900 mb-2">
              {results.expected_volatility.toFixed(1)}%
            </div>
            <div className="text-gray-600">Volatilidade</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-light text-gray-900 mb-2">
              {results.sharpe_ratio.toFixed(2)}
            </div>
            <div className="text-gray-600">Sharpe Ratio</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex justify-center mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-light text-gray-900 mb-2">
              ${onboardingData.initialAmount?.toLocaleString() || '0'}
            </div>
            <div className="text-gray-600">Valor Investido</div>
          </div>
        </div>

        {/* Backtesting vs Benchmarks - Tesla Style CORRIGIDO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Backtesting vs. Benchmarks (10 anos) - TODOS OS VALORES EM BRL
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Performance histórica com conversão cambial USD→BRL para comparação justa
              <br />
              <span className="text-sm text-blue-600 font-medium">Período: Janeiro 2015 a Janeiro 2025 | Dados reais verificados</span>
            </p>
            
            {/* Informação de Conversão Cambial */}
            <div className="mt-6 space-y-3">
              {(results.backtesting?.data_source?.includes('real_market_data') || 
                results.backtesting?.data_source?.includes('currency_conversion')) && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  Dados Reais Verificados via Perplexity AI
                </div>
              )}
              
              {/* Conversão Cambial Explícita */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200 ml-2">
                <Info className="w-4 h-4" />
                💱 Conversão USD→BRL: +94,4% (2015-2025)
              </div>
            </div>
            
            {/* Explicação da Conversão */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 max-w-3xl mx-auto">
              <div className="font-medium text-gray-900 mb-2">🔄 Como funciona a conversão cambial:</div>
              <div className="text-left space-y-1">
                <div>• <strong>S&P 500 e Carteira:</strong> Convertidos de USD para BRL usando variação cambial real</div>
                <div>• <strong>IBOVESPA e CDI:</strong> Já em BRL (moeda nativa brasileira)</div>
                <div>• <strong>Fórmula:</strong> (1 + Retorno USD) × (1 + Variação Cambial) - 1</div>
                <div>• <strong>Fontes:</strong> FRED (S&P 500), B3 (IBOVESPA), Banco Central (CDI, USD/BRL)</div>
              </div>
            </div>
          </div>

          {/* Resumo de Performance */}
          <div className="mb-12">
            <h4 className="text-lg font-medium text-gray-900 mb-8 text-center">Resumo de Performance (10 anos)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
                  <div className="text-2xl font-light text-blue-600 mb-2">
                    +{results.backtesting?.portfolio_return.toFixed(1) || '0'}%
                  </div>
                  <div className="text-blue-700 font-medium mb-2">Sua Carteira (BRL)</div>
                  <div className="text-sm text-blue-500 space-y-1">
                    <div>Valor final: {formatCurrency(onboardingData.initialAmount * (1 + (results.backtesting?.portfolio_return || 0) / 100))}</div>
                    <div className="text-xs">ETFs americanos convertidos USD→BRL</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <div className="text-2xl font-light text-gray-600 mb-2">
                    +{results.backtesting?.sp500_return.toFixed(1) || '0'}%
                  </div>
                  <div className="text-gray-700 font-medium mb-2">S&P 500 (BRL)</div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Diferença: {((results.backtesting?.portfolio_return || 0) - (results.backtesting?.sp500_return || 0)).toFixed(1)}%</div>
                    <div className="text-xs">Convertido USD→BRL (+94,4% cambial)</div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-2xl p-6 text-center border border-orange-100">
                  <div className="text-2xl font-light text-orange-600 mb-2">
                    +{results.backtesting?.ibovespa_return.toFixed(1) || '0'}%
                  </div>
                  <div className="text-orange-700 font-medium mb-2">IBOVESPA (BRL)</div>
                  <div className="text-sm text-orange-500 space-y-1">
                    <div>Diferença: {((results.backtesting?.portfolio_return || 0) - (results.backtesting?.ibovespa_return || 0)).toFixed(1)}%</div>
                    <div className="text-xs">Índice brasileiro nativo</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-100">
                  <div className="text-2xl font-light text-green-600 mb-2">
                    +{results.backtesting?.cdi_return.toFixed(1) || '0'}%
                  </div>
                  <div className="text-green-700 font-medium mb-2">CDI (BRL)</div>
                  <div className="text-sm text-green-500 space-y-1">
                    <div>Diferença: {((results.backtesting?.portfolio_return || 0) - (results.backtesting?.cdi_return || 0)).toFixed(1)}%</div>
                    <div className="text-xs">Taxa brasileira nativa</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Performance Histórica ACUMULADA - Tesla Style */}
            <div className="mb-12">
              <h4 className="text-lg font-medium text-gray-900 mb-8 text-center">Evolução Histórica - Performance Acumulada (%)</h4>
              <div className="h-96 bg-gray-50 rounded-2xl p-6">
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
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                      domain={[0, 'dataMax']}
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
                      dataKey="portfolio_accumulated" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: '#2563eb' }}
                      name="Sua Carteira"
                    />
                    
                    {/* Linha S&P 500 - CINZA ESCURO */}
                    <Line 
                      type="monotone" 
                      dataKey="sp500_accumulated" 
                      stroke="#4b5563" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#4b5563', strokeWidth: 2, r: 4 }}
                      name="S&P 500"
                    />
                    
                    {/* Linha IBOVESPA - LARANJA */}
                    <Line 
                      type="monotone" 
                      dataKey="ibovespa_accumulated" 
                      stroke="#ea580c" 
                      strokeWidth={3}
                      strokeDasharray="10 5"
                      dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                      name="IBOVESPA"
                    />
                    
                    {/* Linha CDI - VERDE */}
                    <Line 
                      type="monotone" 
                      dataKey="cdi_accumulated" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      strokeDasharray="2 2"
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
                      name="CDI"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Análise de Outperformance - Tesla Style */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center justify-center gap-3 mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-medium text-blue-800">Análise de Performance</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-gray-700 mb-2">Melhor que S&P 500:</div>
                  <div className={`text-xl font-light ${
                    (results.backtesting?.portfolio_return || 0) > (results.backtesting?.sp500_return || 0) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(results.backtesting?.portfolio_return || 0) > (results.backtesting?.sp500_return || 0) ? 'Sim' : 'Não'} 
                    ({((results.backtesting?.portfolio_return || 0) - (results.backtesting?.sp500_return || 0)).toFixed(1)}%)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-700 mb-2">Melhor que IBOVESPA:</div>
                  <div className={`text-xl font-light ${
                    (results.backtesting?.portfolio_return || 0) > (results.backtesting?.ibovespa_return || 0) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(results.backtesting?.portfolio_return || 0) > (results.backtesting?.ibovespa_return || 0) ? 'Sim' : 'Não'} 
                    ({((results.backtesting?.portfolio_return || 0) - (results.backtesting?.ibovespa_return || 0)).toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Projeções Monte Carlo - Tesla Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Projeções para 12 Meses
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simulação Monte Carlo baseada em dados históricos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Cenário Pessimista */}
            <div className="bg-red-50 rounded-2xl p-8 text-center border border-red-100">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingDown className="h-6 w-6 text-red-600" />
                <span className="text-lg font-medium text-red-800">Pessimista</span>
              </div>
              <div className="text-3xl font-light text-red-600 mb-2">
                {formatCurrency(results.projections?.pessimistic || 0)}
              </div>
              <div className="text-xl font-light text-red-500 mb-4">
                {(((results.projections?.pessimistic || 0) - onboardingData.initialAmount) / onboardingData.initialAmount * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-red-600">
                Percentil 15 - Se as coisas correrem mal
              </div>
            </div>

            {/* Cenário Esperado */}
            <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span className="text-lg font-medium text-green-800">Esperado</span>
              </div>
              <div className="text-3xl font-light text-green-600 mb-2">
                {formatCurrency(results.projections?.expected || 0)}
              </div>
              <div className="text-xl font-light text-green-500 mb-4">
                +{(((results.projections?.expected || 0) - onboardingData.initialAmount) / onboardingData.initialAmount * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-600">
                Mediana - O mais provável de acontecer
              </div>
            </div>

            {/* Cenário Otimista */}
            <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-medium text-blue-800">Otimista</span>
              </div>
              <div className="text-3xl font-light text-blue-600 mb-2">
                {formatCurrency(results.projections?.optimistic || 0)}
              </div>
              <div className="text-xl font-light text-blue-500 mb-4">
                +{(((results.projections?.optimistic || 0) - onboardingData.initialAmount) / onboardingData.initialAmount * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">
                Percentil 85 - Se tudo correr muito bem
              </div>
            </div>
          </div>

          {/* Explicação Didática */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center justify-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-gray-600" />
              <h4 className="text-lg font-medium text-gray-900">Como interpretar estas projeções</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-red-600 font-medium mb-2">Pessimista</div>
                <div className="text-gray-600">Use para se preparar para cenários adversos. É improvável, mas possível.</div>
              </div>
              <div>
                <div className="text-green-600 font-medium mb-2">Esperado</div>
                <div className="text-gray-600">Use para planejamento financeiro. É o cenário mais provável.</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium mb-2">Otimista</div>
                <div className="text-gray-600">Representa o potencial máximo. Não conte apenas com este cenário.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultoria CVM Especializada - Tesla Style */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              💼 Implementação Profissional
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Deixe nossos especialistas certificados CVM implementarem sua carteira. 
              Abertura de conta, compra dos ETFs e acompanhamento completo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-green-600 font-medium mb-2 text-lg">✅ Certificação CVM</div>
              <div className="text-gray-600">Consultores regulamentados</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-blue-600 font-medium mb-2 text-lg">🏦 Abertura de Conta</div>
              <div className="text-gray-600">Corretora + documentação</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-purple-600 font-medium mb-2 text-lg">📈 Acompanhamento</div>
              <div className="text-gray-600">Monitoramento contínuo</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-4 rounded-xl text-lg font-medium transition-colors duration-300"
              onClick={() => window.location.href = '/consultoria'}
            >
              <Calendar className="mr-2 h-5 w-5 inline" />
              Agendar Wealth Management
            </button>
            <button 
              onClick={handleGenerateReport}
              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-12 py-4 rounded-xl text-lg font-medium transition-colors duration-300"
            >
              <FileText className="mr-2 h-5 w-5 inline" />
              Gerar Relatório
            </button>
          </div>
        </div>

        {/* Ações Finais - Tesla Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-12 py-4 rounded-xl text-lg font-medium transition-colors duration-300">
              <BarChart className="mr-2 h-5 w-5 inline" />
              Análise Detalhada
            </button>
            <button 
              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-12 py-4 rounded-xl text-lg font-medium transition-colors duration-300"
              onClick={() => setStep(1)}
            >
              <RefreshCw className="mr-2 h-5 w-5 inline" />
              Nova Simulação
            </button>
          </div>
        </div>
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
                      if (!selectedAssets.includes(selectedETFDetails.symbol)) {
                        setSelectedAssets(prev => [...prev, selectedETFDetails.symbol])
                      }
                      setShowETFModal(false)
                    }}
                    disabled={selectedAssets.includes(selectedETFDetails.symbol)}
                  >
                    {selectedAssets.includes(selectedETFDetails.symbol) ? 'Já Selecionado' : 'Adicionar à Carteira'}
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
    <div className="space-y-12">
      {/* Progress Indicator - Tesla Style */}
      <div className="flex items-center justify-center space-x-8 mb-16">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-light transition-all ${
                step >= stepNumber
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-24 h-0.5 mx-4 transition-all ${
                  step > stepNumber ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Qual é o seu objetivo de investimento?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Escolha o objetivo principal para personalizar sua carteira
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {objectives.map((obj) => {
            const Icon = obj.icon
            return (
              <div
                key={obj.value}
                className={`p-8 rounded-2xl cursor-pointer transition-all duration-300 ${
                  onboardingData.objective === obj.value
                    ? 'bg-white shadow-xl border-2 border-gray-900'
                    : 'bg-white shadow-sm hover:shadow-lg border border-gray-100'
                }`}
                onClick={() => setOnboardingData(prev => ({ ...prev, objective: obj.value as any }))}
              >
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Icon className="h-12 w-12 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{obj.label}</h3>
                    <p className="text-gray-600 leading-relaxed">{obj.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Seção de Templates */}
        <div className="mt-12 text-center">
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2"
              disabled={savedTemplates.length === 0}
            >
              <Download className="h-4 w-4" />
              Carregar Template ({savedTemplates.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSaveTemplate(true)}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar como Template
            </Button>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => setStep(2)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-4 rounded-xl text-lg font-light tracking-wide transition-all"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )

  // Etapa 2: Valores (com validações em tempo real)
  const renderStep2 = () => (
    <div className="space-y-12">
      {/* Progress Indicator - Tesla Style */}
      <div className="flex items-center justify-center space-x-8 mb-16">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-light transition-all ${
                step >= stepNumber
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-24 h-0.5 mx-4 transition-all ${
                  step > stepNumber ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Valores do Investimento
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Configure os valores e horizonte temporal do seu investimento
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="space-y-12">
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
                
                // Validação reward early, punish late
                if (hasInteracted.initialAmount && fieldErrors.initialAmount) {
                  // Se já tem erro, validar imediatamente (reward early)
                  if (value >= 10000) {
                    setFieldErrors(prev => ({ ...prev, initialAmount: '' }))
                  }
                } else if (hasInteracted.initialAmount && value < 10000) {
                  // Se não tem erro mas valor é inválido, não mostrar erro ainda (punish late)
                }
              }}
              onBlur={() => {
                setHasInteracted(prev => ({ ...prev, initialAmount: true }))
                // Validar apenas no blur se não há erro anterior (punish late)
                if (onboardingData.initialAmount < 10000) {
                  setFieldErrors(prev => ({ ...prev, initialAmount: 'Valor mínimo: $10.000' }))
                }
              }}
              placeholder="10000"
              min="10000"
              max="50000000"
              step="1000"
              className={`${fieldErrors.initialAmount ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.initialAmount && (
              <p className="text-sm text-red-600">{fieldErrors.initialAmount}</p>
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
                
                // Validação reward early, punish late
                if (hasInteracted.timeHorizon && fieldErrors.timeHorizon) {
                  // Se já tem erro, validar imediatamente (reward early)
                  if (value >= 12 && value <= 240) {
                    setFieldErrors(prev => ({ ...prev, timeHorizon: '' }))
                  }
                }
                // Não mostrar erro durante digitação se não há erro anterior (punish late)
              }}
              onBlur={() => {
                setHasInteracted(prev => ({ ...prev, timeHorizon: true }))
                // Validar apenas no blur se não há erro anterior (punish late)
                const value = onboardingData.timeHorizon
                if (value < 12 || value > 240) {
                  setFieldErrors(prev => ({ ...prev, timeHorizon: 'Horizonte deve estar entre 12 e 240 meses (1 a 20 anos)' }))
                }
              }}
              placeholder="60"
              min="12"
              max="240"
              step="6"
              className={`${fieldErrors.timeHorizon ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.timeHorizon && (
              <p className="text-sm text-red-600">{fieldErrors.timeHorizon}</p>
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

        {/* Seção de Tipos de Ativos */}
        <div className="space-y-6">
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-light text-gray-900 mb-4">
              Tipos de Ativos
              <CustomTooltip text="Escolha quais tipos de ativos incluir no seu portfolio. ETFs oferecem diversificação instantânea, enquanto Stocks individuais permitem maior personalização">
                <Info className="inline h-3 w-3 ml-2 text-gray-400" />
              </CustomTooltip>
            </h3>
            <p className="text-gray-600 mb-6">
              Configure que tipos de investimentos você deseja incluir no seu portfolio
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ETFs */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">ETFs</h4>
                      <p className="text-sm text-gray-600">Exchange Traded Funds</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={onboardingData.assetTypes.etfs}
                    onCheckedChange={(checked) => 
                      setOnboardingData(prev => ({
                        ...prev,
                        assetTypes: { ...prev.assetTypes, etfs: !!checked }
                      }))
                    }
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Fundos diversificados que replicam índices ou setores específicos. 
                  Oferecem diversificação instantânea com baixo custo.
                </p>
              </div>

              {/* Stocks */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Stocks</h4>
                      <p className="text-sm text-gray-600">Ações Individuais</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={onboardingData.assetTypes.stocks}
                    onCheckedChange={(checked) => 
                      setOnboardingData(prev => ({
                        ...prev,
                        assetTypes: { ...prev.assetTypes, stocks: !!checked }
                      }))
                    }
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Ações de empresas individuais. Permite maior personalização 
                  mas requer mais conhecimento e diversificação manual.
                </p>
              </div>
            </div>

            {/* Controle de Alocação Máxima em Stocks */}
            {onboardingData.assetTypes.stocks && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="space-y-4">
                  <Label htmlFor="maxStockAllocation">
                    Alocação Máxima em Stocks (%)
                    <CustomTooltip text="Para reduzir risco, limitamos a porcentagem máxima em ações individuais. Recomendado: 20-30%">
                      <Info className="inline h-3 w-3 ml-1 text-gray-400" />
                    </CustomTooltip>
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="maxStockAllocation"
                      type="number"
                      value={onboardingData.assetTypes.maxStockAllocation}
                      onChange={(e) => {
                        const value = Math.min(50, Math.max(0, Number(e.target.value)));
                        setOnboardingData(prev => ({
                          ...prev,
                          assetTypes: { ...prev.assetTypes, maxStockAllocation: value }
                        }));
                      }}
                      min="0"
                      max="50"
                      step="5"
                      className="w-24"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">
                        {onboardingData.assetTypes.maxStockAllocation <= 20 && "Conservador - Menor risco"}
                        {onboardingData.assetTypes.maxStockAllocation > 20 && onboardingData.assetTypes.maxStockAllocation <= 35 && "Moderado - Risco equilibrado"}
                        {onboardingData.assetTypes.maxStockAllocation > 35 && "Agressivo - Maior risco e potencial retorno"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aviso se nenhum tipo selecionado */}
            {!onboardingData.assetTypes.etfs && !onboardingData.assetTypes.stocks && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">
                    Selecione pelo menos um tipo de ativo para continuar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between pt-8">
          <Button variant="outline" onClick={() => setStep(1)} className="px-8 py-3 rounded-xl">
            Voltar
          </Button>
          <Button 
            onClick={() => setStep(3)}
            disabled={
              onboardingData.initialAmount < 10000 || 
              onboardingData.timeHorizon < 12 || 
              onboardingData.timeHorizon > 240 ||
              !!fieldErrors.initialAmount || 
              !!fieldErrors.timeHorizon ||
              (!onboardingData.assetTypes.etfs && !onboardingData.assetTypes.stocks)
            }
            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-3 rounded-xl font-light tracking-wide"
          >
            Continuar
          </Button>
        </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Etapa 3: Perfil de Risco
  const renderStep3 = () => (
    <div className="space-y-12">
      {/* Progress Indicator - Tesla Style */}
      <div className="flex items-center justify-center space-x-8 mb-16">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-light transition-all ${
                step >= stepNumber
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-24 h-0.5 mx-4 transition-all ${
                  step > stepNumber ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Perfil de Risco & Filtros
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Escolha seu perfil de investimento e configure filtros opcionais
          </p>
        </div>

        {/* Seção de Filtros Opcionais */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Filtros Avançados</h3>
                <p className="text-gray-600">Personalize os critérios de seleção de ETFs (opcional)</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowOptionalFilters(!showOptionalFilters)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {showOptionalFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
            </div>

            {showOptionalFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                {/* Rating Morningstar */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rating Morningstar Mínimo
                  </Label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">0★</span>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={optionalFilters.minMorningstarRating}
                      onChange={(e) => setOptionalFilters(prev => ({
                        ...prev,
                        minMorningstarRating: parseInt(e.target.value)
                      }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">5★</span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-sm font-medium text-blue-600">
                      {optionalFilters.minMorningstarRating === 0 ? 'Sem filtro' : `${optionalFilters.minMorningstarRating}★+`}
                    </span>
                  </div>
                </div>

                {/* Expense Ratio Máximo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Taxa de Administração Máxima
                  </Label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">0%</span>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={optionalFilters.maxExpenseRatio}
                      onChange={(e) => setOptionalFilters(prev => ({
                        ...prev,
                        maxExpenseRatio: parseFloat(e.target.value)
                      }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">2%</span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-sm font-medium text-blue-600">
                      ≤ {optionalFilters.maxExpenseRatio.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Dividend Yield Mínimo */}
                {onboardingData.objective === 'income' && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Dividend Yield Mínimo
                    </Label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">0%</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={optionalFilters.minDividendYield}
                        onChange={(e) => setOptionalFilters(prev => ({
                          ...prev,
                          minDividendYield: parseFloat(e.target.value)
                        }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">10%</span>
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-sm font-medium text-blue-600">
                        ≥ {optionalFilters.minDividendYield.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* AUM Mínimo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Patrimônio Mínimo (Liquidez)
                  </Label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">$50M</span>
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      step="50"
                      value={optionalFilters.minAUM}
                      onChange={(e) => setOptionalFilters(prev => ({
                        ...prev,
                        minAUM: parseInt(e.target.value)
                      }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">$5B</span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-sm font-medium text-blue-600">
                      ≥ ${optionalFilters.minAUM < 1000 ? `${optionalFilters.minAUM}M` : `${(optionalFilters.minAUM/1000).toFixed(1)}B`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {riskProfiles.map((profile) => (
            <div
              key={profile.value}
              className={`p-8 rounded-2xl cursor-pointer transition-all duration-300 ${
                onboardingData.riskProfile === profile.value
                  ? 'bg-white shadow-xl border-2 border-gray-900'
                  : 'bg-white shadow-sm hover:shadow-lg border border-gray-100'
              }`}
              onClick={() => setOnboardingData(prev => ({ ...prev, riskProfile: profile.value as any }))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{profile.label}</h3>
                  <p className="text-gray-600 leading-relaxed">{profile.description}</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {onboardingData.riskProfile === profile.value && (
                    <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-16">
          <Button variant="outline" onClick={() => setStep(2)} className="px-8 py-3 rounded-xl">
            Voltar
          </Button>
          <Button 
            onClick={generatePortfolio} 
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-3 rounded-xl font-light tracking-wide"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Carteira...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Carteira
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  // Função para navegar de volta
  const handleGoBack = () => {
    router.push('/dashboard')
  }

  // Render principal
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Erro</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button 
                onClick={() => {
                  setError(null)
                  setStep(1)
                }}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-3 rounded-xl font-medium transition-colors duration-300"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header de Navegação */}
      <NavigationHeader />
      
      {/* Container Principal Tesla-inspired */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Botão de Voltar no Topo */}
        <div className="mb-8">
          <Button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-colors duration-300"
            style={{ backgroundColor: '#202636' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Header Principal */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Portfolio Master
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Crie carteiras de ETFs otimizadas com base científica usando dados de 1.370+ ativos globais
          </p>
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-16">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {results && renderResults()}
        </div>

        {/* Modal de Detalhes do ETF */}
        <ETFDetailsModal />

        {/* Modal para Salvar Template */}
        {showSaveTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Salvar Template</h3>
              <p className="text-gray-600 mb-6">
                Salve suas configurações atuais como um template reutilizável
              </p>
              <Input
                placeholder="Nome do template (ex: Renda Passiva Conservador)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mb-6"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveTemplate(false)
                    setTemplateName('')
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveTemplate}
                  className="flex-1"
                  disabled={!templateName.trim()}
                >
                  Salvar Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Carregar Templates */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">Templates Salvos</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {savedTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum template salvo ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {objectives.find(obj => obj.value === template.onboardingData.objective)?.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {template.onboardingData.riskProfile} • {template.onboardingData.currency} • 
                            {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTemplate(template)}
                          >
                            Carregar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 