"use client"

import React, { useState, useEffect } from 'react'
import { perplexityEnrichment, type EnrichedAssetData } from '@/services/perplexityEnrichment'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Calendar,
  Building,
  Users,
  Sparkles,
  Target,
  Info,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  LineChart,
  PieChart,
  Activity,
  Bookmark,
  Share2,
  Download
} from 'lucide-react'

interface AssetData {
  // Dados básicos
  symbol: string
  name: string
  company_name?: string
  description?: string
  sector?: string
  industry?: string
  assetclass?: string
  exchange?: string
  domicile?: string
  
  // Preço e mercado
  stock_price?: number
  nav?: number
  market_cap?: number
  market_cap_formatted?: string
  totalasset?: number
  volume?: number
  avgvolume?: number
  
  // Performance
  returns_12m?: string | number
  returns_24m?: string | number
  returns_36m?: string | number
  returns_5y?: string | number
  ten_year_return?: string | number
  
  // Risco
  volatility_12m?: string | number
  volatility_24m?: string | number
  ten_year_volatility?: string | number
  sharpe_12m?: string | number
  sharpe_24m?: string | number
  ten_year_sharpe?: string | number
  max_drawdown?: number
  
  // Fundamentais
  pe_ratio?: string | number
  pb_ratio?: string | number
  roe?: string | number
  roa?: string | number
  expense_ratio?: number
  dividend_yield_12m?: string | number
  dividends_12m?: number
  
  // Qualidade
  quality_score?: number
  data_completeness?: number
  liquidity_rating?: string
  size_rating?: string
  liquidity_category?: string
  size_category?: string
  
  // Datas
  inception_date?: string
  inceptiondate?: string
  last_updated?: string
  
  // ETF específicos
  etfcompany?: string
  etf_type?: string
  navcurrency?: string
  
  // Outros
  beta?: number
  morningstar_rating?: number
  sustainability_rating?: string
}

interface EnhancedDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  asset: AssetData | null
  type: 'etf' | 'stock'
  loading?: boolean
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  format?: 'currency' | 'percentage' | 'number' | 'ratio'
  tooltip?: string
  highlight?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  format = 'number',
  tooltip,
  highlight = false 
}) => {
  const formatValue = (val: string | number) => {
    if (val === null || val === undefined || val === '') return 'N/A'
    
    const numVal = typeof val === 'string' ? parseFloat(val.replace('%', '')) : val
    if (isNaN(numVal)) return 'N/A'
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          notation: numVal > 1000000000 ? 'compact' : 'standard'
        }).format(numVal)
      case 'percentage':
        return `${numVal.toFixed(2)}%`
      case 'ratio':
        return numVal.toFixed(2)
      default:
        return typeof val === 'string' && val.includes('%') ? val : numVal.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-[#202636]'
    }
  }

  return (
    <Card className={`${highlight ? 'ring-2 ring-[#0090d8] bg-blue-50' : 'bg-white'} border-gray-200 hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">{title}</span>
            {tooltip && <Info className="h-3 w-3 text-gray-400" />}
          </div>
          {trend && getTrendIcon()}
        </div>
        <div className={`text-2xl font-light ${getTrendColor()} mb-1`}>
          {formatValue(value)}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function EnhancedDetailsModal({ 
  isOpen, 
  onClose, 
  asset, 
  type, 
  loading = false 
}: EnhancedDetailsModalProps) {
  const [enrichedData, setEnrichedData] = useState<any>(null)
  const [loadingEnrichment, setLoadingEnrichment] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Buscar dados enriquecidos via Perplexity quando modal abre
  useEffect(() => {
    if (isOpen && asset && !enrichedData) {
      fetchEnrichedData()
    }
  }, [isOpen, asset])

  const fetchEnrichedData = async () => {
    if (!asset) return
    
    setLoadingEnrichment(true)
    try {
      console.log('🔍 Buscando dados enriquecidos para:', asset.symbol)
      
      const enrichment = await perplexityEnrichment.enrichAssetData(
        asset.symbol,
        type,
        asset
      )
      
      setEnrichedData(enrichment)
      console.log('✅ Dados enriquecidos recebidos:', enrichment)
      
    } catch (error) {
      console.error('❌ Erro ao enriquecer dados:', error)
      setEnrichedData({
        symbol: asset.symbol,
        type,
        error: 'Falha ao carregar dados enriquecidos'
      })
    } finally {
      setLoadingEnrichment(false)
    }
  }

  if (!isOpen || !asset) return null

  const currentPrice = asset.stock_price || asset.nav || 0
  const returns12m = typeof asset.returns_12m === 'string' 
    ? parseFloat(asset.returns_12m.replace('%', '')) 
    : (asset.returns_12m || 0)

  const getPerformanceTrend = (value: number) => {
    if (value > 5) return 'up'
    if (value < -5) return 'down'
    return 'neutral'
  }

  const getQualityBadge = (score: number) => {
    if (score >= 85) return { label: 'Elite', color: 'bg-green-100 text-green-800' }
    if (score >= 70) return { label: 'Excelente', color: 'bg-blue-100 text-blue-800' }
    if (score >= 55) return { label: 'Boa', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Regular', color: 'bg-gray-100 text-gray-800' }
  }

  const qualityBadge = asset.quality_score ? getQualityBadge(asset.quality_score) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#f8fafc] to-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-[#0090d8]" />
                  <h2 className="text-2xl font-light text-[#202636]">{asset.symbol}</h2>
                </div>
                <Badge variant="outline" className={type === 'etf' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}>
                  {type.toUpperCase()}
                </Badge>
                {asset.exchange && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {asset.exchange}
                  </Badge>
                )}
                {qualityBadge && (
                  <Badge className={qualityBadge.color}>
                    {qualityBadge.label} {asset.quality_score}
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg text-gray-700 mb-2 font-normal">
                {asset.name || asset.company_name}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {asset.sector && (
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {asset.sector}
                  </span>
                )}
                {asset.industry && <span>• {asset.industry}</span>}
                {asset.assetclass && <span>• {asset.assetclass}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-light text-[#202636]">
                  ${currentPrice.toFixed(2)}
                </div>
                <div className={`flex items-center gap-1 text-sm ${getPerformanceTrend(returns12m) === 'up' ? 'text-green-600' : getPerformanceTrend(returns12m) === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {getPerformanceTrend(returns12m) === 'up' ? <TrendingUp className="h-4 w-4" /> : getPerformanceTrend(returns12m) === 'down' ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  {returns12m > 0 ? '+' : ''}{returns12m.toFixed(2)}% (12m)
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://finance.yahoo.com/quote/${asset.symbol}`, '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Yahoo Finance
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mx-6 mt-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="fundamentals" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Fundamentais
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Análise
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 pt-4">
              <div className="space-y-6">
                {/* Métricas Principais */}
                <div>
                  <h4 className="text-lg font-medium text-[#202636] mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#0090d8]" />
                    Métricas Principais
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      title="Preço Atual"
                      value={currentPrice}
                      format="currency"
                      highlight={true}
                    />
                    <MetricCard
                      title="Market Cap"
                      value={asset.market_cap || asset.totalasset || 0}
                      format="currency"
                      subtitle={asset.size_category || ''}
                    />
                    <MetricCard
                      title="Retorno 12m"
                      value={returns12m}
                      format="percentage"
                      trend={getPerformanceTrend(returns12m)}
                    />
                    <MetricCard
                      title={type === 'etf' ? 'Taxa Admin.' : 'P/E Ratio'}
                      value={type === 'etf' ? (asset.expense_ratio || 0) : (asset.pe_ratio || 0)}
                      format={type === 'etf' ? 'percentage' : 'ratio'}
                    />
                  </div>
                </div>

                {/* Informações da Empresa/ETF */}
                {asset.description && (
                  <div>
                    <h4 className="text-lg font-medium text-[#202636] mb-3">Descrição</h4>
                    <p className="text-gray-700 leading-relaxed">{asset.description}</p>
                  </div>
                )}

                {/* Dados Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#0090d8]" />
                        Informações Gerais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {asset.inception_date || asset.inceptiondate ? (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Criação:</span>
                          <span className="text-sm font-medium">
                            {new Date(asset.inception_date || asset.inceptiondate || '').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ) : null}
                      
                      {asset.etfcompany && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gestora:</span>
                          <span className="text-sm font-medium">{asset.etfcompany}</span>
                        </div>
                      )}
                      
                      {asset.domicile && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Domicílio:</span>
                          <span className="text-sm font-medium">{asset.domicile}</span>
                        </div>
                      )}
                      
                      {asset.navcurrency && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Moeda:</span>
                          <span className="text-sm font-medium">{asset.navcurrency}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[#0090d8]" />
                        Liquidez & Volume
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {asset.volume && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Volume:</span>
                          <span className="text-sm font-medium">{asset.volume.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {asset.avgvolume && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Volume Médio:</span>
                          <span className="text-sm font-medium">{asset.avgvolume.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {asset.liquidity_rating && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Liquidez:</span>
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            {asset.liquidity_rating}
                          </Badge>
                        </div>
                      )}
                      
                      {asset.data_completeness && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Completude dos Dados:</span>
                            <span className="text-sm font-medium">{asset.data_completeness}%</span>
                          </div>
                          <Progress value={asset.data_completeness} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="p-6 pt-4">
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-[#202636] flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[#0090d8]" />
                  Análise de Performance
                </h4>
                
                {/* Retornos Históricos */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <MetricCard
                    title="12 Meses"
                    value={asset.returns_12m || 0}
                    format="percentage"
                    trend={getPerformanceTrend(typeof asset.returns_12m === 'string' ? parseFloat(asset.returns_12m.replace('%', '')) : (asset.returns_12m || 0))}
                  />
                  <MetricCard
                    title="24 Meses"
                    value={asset.returns_24m || 0}
                    format="percentage"
                    trend={getPerformanceTrend(typeof asset.returns_24m === 'string' ? parseFloat(asset.returns_24m.replace('%', '')) : (asset.returns_24m || 0))}
                  />
                  <MetricCard
                    title="36 Meses"
                    value={asset.returns_36m || 0}
                    format="percentage"
                    trend={getPerformanceTrend(typeof asset.returns_36m === 'string' ? parseFloat(asset.returns_36m.replace('%', '')) : (asset.returns_36m || 0))}
                  />
                  <MetricCard
                    title="5 Anos"
                    value={asset.returns_5y || 0}
                    format="percentage"
                    trend={getPerformanceTrend(typeof asset.returns_5y === 'string' ? parseFloat(asset.returns_5y.replace('%', '')) : (asset.returns_5y || 0))}
                  />
                  <MetricCard
                    title="10 Anos"
                    value={asset.ten_year_return || 0}
                    format="percentage"
                    trend={getPerformanceTrend(typeof asset.ten_year_return === 'string' ? parseFloat(asset.ten_year_return.replace('%', '')) : (asset.ten_year_return || 0))}
                  />
                </div>

                {/* Métricas de Risco */}
                <div>
                  <h5 className="text-base font-medium text-[#202636] mb-4">Métricas de Risco</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      title="Volatilidade 12m"
                      value={asset.volatility_12m || 0}
                      format="percentage"
                      subtitle="Risco anual"
                    />
                    <MetricCard
                      title="Sharpe Ratio"
                      value={asset.sharpe_12m || 0}
                      format="ratio"
                      subtitle="Retorno/Risco"
                    />
                    <MetricCard
                      title="Max Drawdown"
                      value={asset.max_drawdown || 0}
                      format="percentage"
                      subtitle="Maior queda"
                      trend="down"
                    />
                    <MetricCard
                      title="Beta"
                      value={asset.beta || 1}
                      format="ratio"
                      subtitle="vs. Mercado"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Fundamentals Tab */}
            <TabsContent value="fundamentals" className="p-6 pt-4">
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-[#202636] flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#0090d8]" />
                  Análise Fundamental
                </h4>
                
                {type === 'stock' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      title="P/E Ratio"
                      value={asset.pe_ratio || 0}
                      format="ratio"
                      tooltip="Preço sobre Lucro por Ação"
                    />
                    <MetricCard
                      title="P/B Ratio"
                      value={asset.pb_ratio || 0}
                      format="ratio"
                      tooltip="Preço sobre Valor Patrimonial"
                    />
                    <MetricCard
                      title="ROE"
                      value={asset.roe || 0}
                      format="percentage"
                      tooltip="Retorno sobre Patrimônio"
                    />
                    <MetricCard
                      title="ROA"
                      value={asset.roa || 0}
                      format="percentage"
                      tooltip="Retorno sobre Ativos"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MetricCard
                      title="Taxa de Administração"
                      value={asset.expense_ratio || 0}
                      format="percentage"
                      tooltip="Custo anual do ETF"
                    />
                    <MetricCard
                      title="Dividend Yield"
                      value={asset.dividend_yield_12m || asset.dividends_12m || 0}
                      format="percentage"
                      tooltip="Rendimento de dividendos"
                    />
                    <MetricCard
                      title="Patrimônio"
                      value={asset.totalasset || 0}
                      format="currency"
                      tooltip="Assets Under Management"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="p-6 pt-4">
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-[#202636] flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#0090d8]" />
                  Análise e Insights
                </h4>
                
                {loadingEnrichment ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0090d8] mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando análise via IA...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Análise com IA via Perplexity */}
                    {loadingEnrichment ? (
                      <Card className="border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#0090d8] animate-spin" />
                            Carregando Análise Premium...
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : enrichedData?.insights ? (
                      <div className="space-y-4">
                        {/* Investment Thesis */}
                        {enrichedData.insights.investmentThesis && (
                          <Card className="border-[#0090d8] bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#0090d8]" />
                                Tese de Investimento
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {enrichedData.insights.investmentThesis}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Key Metrics Summary */}
                        {enrichedData.insights.keyMetrics && (
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-[#0090d8]" />
                                Métricas-Chave
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-700">
                                {enrichedData.insights.keyMetrics}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Risk Factors */}
                        {enrichedData.insights.riskFactors && enrichedData.insights.riskFactors.length > 0 && (
                          <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                Fatores de Risco
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {enrichedData.insights.riskFactors.map((risk: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                    {risk}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {/* Market Position */}
                        {enrichedData.insights.marketPosition && (
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4 text-[#0090d8]" />
                                Posição no Mercado
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-700">
                                {enrichedData.insights.marketPosition}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* General Recommendation */}
                        {enrichedData.insights.recommendation && (
                          <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Recomendação Geral
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-700">
                                {enrichedData.insights.recommendation}
                              </p>
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                  ⚠️ Esta análise é apenas educacional e não constitui recomendação de investimento. 
                                  Consulte sempre um profissional qualificado antes de investir.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : enrichedData?.error ? (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            Erro na Análise
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-red-700">
                            {enrichedData.error}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={fetchEnrichedData}
                          >
                            Tentar Novamente
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-[#0090d8] bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#0090d8]" />
                            Análise Premium com IA
                          </CardTitle>
                          <CardDescription>
                            Insights profundos sobre {asset.symbol} gerados por nossa IA
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Análise de sentimento de mercado
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Comparação com pares do setor
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Projeções de preço baseadas em IA
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Alertas de eventos importantes
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="space-y-3">
                            <Button 
                              className="w-full bg-[#0090d8] hover:bg-blue-700 text-white"
                              onClick={() => window.location.href = '/consultoria'}
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Acessar Análise Completa
                            </Button>
                            <p className="text-xs text-center text-gray-500">
                              Disponível para clientes Wealth Management
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Resumo Atual */}
                    <Card className="border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-base">Resumo de Qualidade</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {asset.quality_score && (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Quality Score</span>
                                <span className="text-lg font-medium text-[#202636]">{asset.quality_score}/100</span>
                              </div>
                              <Progress value={asset.quality_score} className="h-2" />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {returns12m > 10 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="text-sm text-gray-700">
                                Performance {returns12m > 10 ? 'forte' : 'moderada'} nos últimos 12 meses
                              </span>
                            </div>
                            
                            {(asset.expense_ratio || 0) < 0.5 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">Taxa de administração baixa</span>
                              </div>
                            )}
                            
                            {asset.liquidity_rating === 'MUITO_ALTA' && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">Alta liquidez</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/consultoria'}
                className="border-[#0090d8] text-[#0090d8] hover:bg-blue-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Consultoria Personalizada
              </Button>
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
