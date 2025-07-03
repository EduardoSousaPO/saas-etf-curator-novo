"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, Shield, BarChart3, Target, AlertTriangle } from 'lucide-react'

interface BenchmarkResult {
  profile: {
    name: string
    targetVolatility: number
    description: string
  }
  portfolio: {
    allocations: Array<{
      etf: {
        symbol: string
        name: string
        returns_12m: number
        volatility: number
      }
      weight: number
      allocation_amount: number
    }>
    expected_return: number
    expected_volatility: number
    sharpe_ratio: number
  }
  benchmarks: {
    spy_comparison: {
      alpha: number
      beta: number
      outperformance_pct: number
    }
    bnd_comparison: {
      alpha: number
      outperformance_pct: number
    }
    classic_60_40: {
      outperformance: number
      outperformance_pct: number
      benchmark_return: number
      benchmark_volatility: number
    }
  }
  risk_metrics: {
    var_95: number
    max_drawdown: number
    downside_deviation: number
    sortino_ratio: number
  }
}

export default function AdvancedBenchmark() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BenchmarkResult[] | null>(null)
  const [selectedProfile, setSelectedProfile] = useState('all')
  const [amount, setAmount] = useState('100000')
  const [error, setError] = useState<string | null>(null)

  const profiles = [
    { value: 'all', label: 'Todos os Perfis' },
    { value: 'CONSERVADOR', label: 'Conservador' },
    { value: 'MODERADO', label: 'Moderado' },
    { value: 'ARROJADO', label: 'Arrojado' }
  ]

  const fetchBenchmarkData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        amount: amount
      })
      
      if (selectedProfile !== 'all') {
        params.append('profile', selectedProfile)
      }
      
      const response = await fetch(`/api/portfolio/complete-benchmark-demo?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de benchmark')
      }
      
      const data = await response.json()
      setResults(Array.isArray(data.results) ? data.results : [data.results])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBenchmarkData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getPerformanceBadge = (value: number) => {
    if (value > 0) return <Badge className="bg-green-100 text-green-800">Superperformance</Badge>
    return <Badge className="bg-red-100 text-red-800">Underperformance</Badge>
  }

  const getRiskBadge = (volatility: number) => {
    if (volatility < 0.1) return <Badge className="bg-green-100 text-green-800">Baixo Risco</Badge>
    if (volatility < 0.15) return <Badge className="bg-yellow-100 text-yellow-800">Risco Moderado</Badge>
    return <Badge className="bg-red-100 text-red-800">Alto Risco</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configuração de Benchmark
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para análise comparativa avançada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile">Perfil de Investimento</Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
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
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100000"
                min="10000"
                step="10000"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={fetchBenchmarkData} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Analisando...' : 'Executar Benchmark'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {results && results.map((result, index) => (
        <Card key={index} className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Portfolio {result.profile.name}
                </CardTitle>
                <CardDescription>{result.profile.description}</CardDescription>
              </div>
              <div className="text-right">
                {getRiskBadge(result.portfolio.expected_volatility)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                <TabsTrigger value="risk">Risco</TabsTrigger>
                <TabsTrigger value="allocation">Alocação</TabsTrigger>
              </TabsList>

              <TabsContent value="performance">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatPercentage(result.portfolio.expected_return)}
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
                            {formatPercentage(result.portfolio.expected_volatility)}
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
                            {result.portfolio.sharpe_ratio?.toFixed(2) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Sharpe Ratio</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="benchmarks">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Comparação vs SPY</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-lg font-semibold">{result.benchmarks.spy_comparison.alpha.toFixed(4)}</div>
                          <div className="text-sm text-gray-500">Alpha</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{result.benchmarks.spy_comparison.beta.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Beta</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold">{formatPercentage(result.benchmarks.spy_comparison.outperformance_pct / 100)}</div>
                          {getPerformanceBadge(result.benchmarks.spy_comparison.outperformance_pct)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Comparação vs BND</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-lg font-semibold">{result.benchmarks.bnd_comparison.alpha.toFixed(4)}</div>
                          <div className="text-sm text-gray-500">Alpha</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold">{formatPercentage(result.benchmarks.bnd_comparison.outperformance_pct / 100)}</div>
                          {getPerformanceBadge(result.benchmarks.bnd_comparison.outperformance_pct)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">vs Portfolio 60/40 Clássico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-lg font-semibold">{formatPercentage(result.benchmarks.classic_60_40.benchmark_return)}</div>
                          <div className="text-sm text-gray-500">Retorno 60/40</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{formatPercentage(result.benchmarks.classic_60_40.benchmark_volatility)}</div>
                          <div className="text-sm text-gray-500">Volatilidade 60/40</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold">{formatPercentage(result.benchmarks.classic_60_40.outperformance_pct / 100)}</div>
                          {getPerformanceBadge(result.benchmarks.classic_60_40.outperformance)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risk">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-lg font-semibold text-red-600">
                        {formatPercentage(Math.abs(result.risk_metrics.var_95))}
                      </div>
                      <div className="text-sm text-gray-500">VaR 95%</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-lg font-semibold text-red-600">
                        {formatPercentage(Math.abs(result.risk_metrics.max_drawdown))}
                      </div>
                      <div className="text-sm text-gray-500">Max Drawdown</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-lg font-semibold">
                        {formatPercentage(result.risk_metrics.downside_deviation)}
                      </div>
                      <div className="text-sm text-gray-500">Downside Deviation</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-lg font-semibold text-purple-600">
                        {result.risk_metrics.sortino_ratio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Sortino Ratio</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="allocation">
                <div className="space-y-4">
                  {result.portfolio.allocations.map((allocation, idx) => (
                    <Card key={allocation.etf.symbol}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">{allocation.etf.symbol}</h3>
                            <p className="text-sm text-gray-600">{allocation.etf.name}</p>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <div className="text-lg font-semibold">{(allocation.weight * 100).toFixed(1)}%</div>
                            <div className="text-sm text-gray-500">{formatCurrency(allocation.allocation_amount)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Retorno 12m:</span>
                            <span className="ml-2 font-medium">{formatPercentage(allocation.etf.returns_12m)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Volatilidade:</span>
                            <span className="ml-2 font-medium">{formatPercentage(allocation.etf.volatility)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 