"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, Shield, DollarSign, BarChart3, Sparkles, AlertCircle, Loader2, Target } from 'lucide-react'

interface ETFRecommendation {
  symbol: string
  name: string
  asset_class: string
  quality_score: number
  sharpe_ratio: number
  returns_12m: number
  volatility: number
  expense_ratio: number
  assets_under_management: number
  dividend_yield: number
  recommendation?: string
}

interface PortfolioItem {
  etf: ETFRecommendation
  allocation_percent: number
  allocation_amount: number
  rationale: string
}

interface DiscoveryResult {
  success: boolean
  strategy: string
  investment_amount: string
  optimized_portfolio: {
    portfolio: PortfolioItem[]
    expected_return: number
    expected_volatility: number
    sharpe_ratio: number
    diversification_analysis?: {
      diversification_index: number
    }
  }
  alternative_suggestions?: {
    count: number
    top_alternatives: ETFRecommendation[]
  }
  technical_analysis?: {
    database_coverage: string
    quality_filters: string
    scoring_components: string[]
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

export default function AdvancedRecommendations() {
  const [strategy, setStrategy] = useState('MODERATE')
  const [amount, setAmount] = useState(100000)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DiscoveryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const strategies = [
    { value: 'CONSERVATIVE', label: 'Conservador', description: 'Baixo risco, foco em preservação' },
    { value: 'MODERATE', label: 'Moderado', description: 'Risco equilibrado, crescimento moderado' },
    { value: 'AGGRESSIVE', label: 'Arrojado', description: 'Alto risco, máximo crescimento' }
  ]

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/portfolio/real-advanced-discovery?strategy=${strategy}&amount=${amount}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error('Falha na busca de recomendações')
      }
      
      setResults(data)
    } catch (err) {
      console.error('Erro ao buscar recomendações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%'
    return `${value.toFixed(1)}%`
  }

  const getQualityBadge = (score: number) => {
    if (!score || isNaN(score)) return <Badge variant="outline">N/A</Badge>
    
    if (score >= 85) return <Badge className="bg-green-100 text-green-800 border-green-200">Elite</Badge>
    if (score >= 70) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Excelente</Badge>
    if (score >= 55) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Bom</Badge>
    return <Badge variant="outline" className="border-gray-300">Regular</Badge>
  }

  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue
    } catch {
      return defaultValue
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Configuração de Recomendações
          </CardTitle>
          <CardDescription>
            Configure sua estratégia e valor para receber recomendações personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy">Estratégia</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma estratégia" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs text-gray-500">{s.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Investimento (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="100000"
                min="10000"
                step="10000"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={fetchRecommendations} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Gerar Recomendações
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <strong>Erro:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {results && results.optimized_portfolio && (
        <Tabs defaultValue="portfolio" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio Recomendado</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4">
            <div className="grid gap-4">
              {safeGet(results, 'optimized_portfolio.portfolio', []).map((portfolioItem: PortfolioItem, index: number) => (
                <Card key={safeGet(portfolioItem, 'etf.symbol', index)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{safeGet(portfolioItem, 'etf.symbol', 'N/A')}</h3>
                          {getQualityBadge(safeGet(portfolioItem, 'etf.quality_score', 0))}
                          <span className="text-sm font-medium text-blue-600">
                            {formatPercentage(safeGet(portfolioItem, 'allocation_percent', 0))}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{safeGet(portfolioItem, 'etf.name', 'N/A')}</p>
                        <p className="text-xs text-gray-500">{safeGet(portfolioItem, 'etf.asset_class', 'N/A')}</p>
                        <p className="text-sm italic text-blue-600">{safeGet(portfolioItem, 'rationale', 'N/A')}</p>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{formatPercentage(safeGet(portfolioItem, 'etf.returns_12m', 0))}</span>
                        </div>
                        <div className="text-xs text-gray-500">Retorno 12m</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(safeGet(portfolioItem, 'allocation_amount', 0))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Sharpe Ratio</div>
                        <div className="font-medium">{safeGet(portfolioItem, 'etf.sharpe_ratio', 0)?.toFixed(2) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Volatilidade</div>
                        <div className="font-medium">{formatPercentage(safeGet(portfolioItem, 'etf.volatility', 0))}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Taxa</div>
                        <div className="font-medium">{safeGet(portfolioItem, 'etf.expense_ratio', 0)?.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">AUM</div>
                        <div className="font-medium">{formatCurrency(safeGet(portfolioItem, 'etf.assets_under_management', 0))}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(safeGet(results, 'optimized_portfolio.expected_return', 0))}
                      </div>
                      <div className="text-sm text-gray-500">Retorno Esperado</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPercentage(safeGet(results, 'optimized_portfolio.expected_volatility', 0))}
                      </div>
                      <div className="text-sm text-gray-500">Volatilidade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {safeGet(results, 'optimized_portfolio.sharpe_ratio', 0)?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">Sharpe Ratio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Diversificação */}
            {safeGet(results, 'optimized_portfolio.diversification_analysis') && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Análise de Diversificação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {((safeGet(results, 'optimized_portfolio.diversification_analysis.diversification_index', 0) || 0) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Índice de Diversificação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Análise Técnica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Informações da Base de Dados */}
                  <div>
                    <h4 className="font-medium mb-3">Cobertura da Base de Dados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xl font-bold text-blue-600">1.370+ ETFs</div>
                        <div className="text-sm text-gray-500">Base analisada</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">
                          {safeGet(results, 'optimized_portfolio.portfolio', []).length}
                        </div>
                        <div className="text-sm text-gray-500">ETFs selecionados</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Componentes de Scoring */}
                  <div>
                    <h4 className="font-medium mb-3">Componentes do Scoring Técnico</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Sharpe Ratio otimizado (30% do peso)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Performance 12 meses (25% do peso)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Controle de volatilidade (20% do peso)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">AUM e liquidez (15% do peso)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Custo-benefício (10% do peso)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* ETFs Alternativos */}
                  {safeGet(results, 'alternative_suggestions.count', 0) > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Sugestões Alternativas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xl font-bold text-purple-600">{safeGet(results, 'alternative_suggestions.count', 0)}</div>
                          <div className="text-sm text-gray-500">ETFs alternativos identificados</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-orange-600">{safeGet(results, 'alternative_suggestions.top_alternatives', []).length}</div>
                          <div className="text-sm text-gray-500">Top alternativas</div>
                        </div>
                      </div>
                      
                      {safeGet(results, 'alternative_suggestions.top_alternatives', []).length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h5 className="text-sm font-medium">Top 3 Alternativas:</h5>
                          {safeGet(results, 'alternative_suggestions.top_alternatives', []).slice(0, 3).map((etf: ETFRecommendation, index: number) => (
                            <div key={etf.symbol || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{etf.symbol || 'N/A'}</span>
                                <span className="text-sm text-gray-500 ml-2">{etf.asset_class || 'N/A'}</span>
                              </div>
                              <div className="text-sm">
                                {getQualityBadge(etf.quality_score || 0)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 