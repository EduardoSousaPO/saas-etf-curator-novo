"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Calendar,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw
} from 'lucide-react'

interface FilterState {
  // Busca
  searchTerm: string
  
  // Categorias principais (ETFs)
  assetClass: string[]
  sector: string[]
  company: string[]
  
  // Categorias principais (Stocks) 
  stockSector: string[]
  industry: string[]
  exchange: string[]
  
  // Performance
  returns12m: [number, number]
  returns24m: [number, number]
  returns5y: [number, number]
  volatility: [number, number]
  sharpeRatio: [number, number]
  
  // Fundamentais
  expenseRatio: [number, number]
  marketCap: [number, number]
  peRatio: [number, number]
  pbRatio: [number, number]
  dividendYield: [number, number]
  
  // Qualidade
  qualityScore: [number, number]
  liquidityRating: string[]
  sizeRating: string[]
  
  // Avançados
  inception: [number, number]
  volume: [number, number]
  maxDrawdown: [number, number]
}

interface PresetFilter {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  filters: Partial<FilterState>
  popular?: boolean
}

interface EnhancedFiltersProps {
  type: 'etf' | 'stock'
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSearch: () => void
  loading?: boolean
  resultCount?: number
}

// Presets baseados nas melhores práticas das wealth techs
const ETF_PRESETS: PresetFilter[] = [
  {
    id: 'blue-chips',
    name: 'Blue Chips',
    description: 'ETFs de grandes empresas estáveis',
    icon: Shield,
    popular: true,
    filters: {
      assetClass: ['Large Cap Focused', 'Broad Market'],
      marketCap: [10000000000, 999999999999],
      expenseRatio: [0, 0.5],
      qualityScore: [70, 100]
    }
  },
  {
    id: 'high-dividend',
    name: 'Dividendos Altos',
    description: 'Foco em renda passiva',
    icon: DollarSign,
    popular: true,
    filters: {
      dividendYield: [3, 15],
      qualityScore: [60, 100],
      assetClass: ['Dividend Focused']
    }
  },
  {
    id: 'growth',
    name: 'Crescimento',
    description: 'ETFs de crescimento acelerado',
    icon: TrendingUp,
    popular: true,
    filters: {
      returns12m: [15, 999],
      assetClass: ['Growth Focused', 'Technology Focused'],
      qualityScore: [65, 100]
    }
  },
  {
    id: 'low-cost',
    name: 'Baixo Custo',
    description: 'Taxas ultra-baixas',
    icon: Target,
    filters: {
      expenseRatio: [0, 0.2],
      marketCap: [1000000000, 999999999999]
    }
  },
  {
    id: 'emerging',
    name: 'Mercados Emergentes',
    description: 'Exposição internacional',
    icon: BarChart3,
    filters: {
      assetClass: ['International Focused', 'Emerging Markets']
    }
  }
]

const STOCK_PRESETS: PresetFilter[] = [
  {
    id: 'mega-caps',
    name: 'Mega Caps',
    description: 'Empresas gigantes (>$200B)',
    icon: Shield,
    popular: true,
    filters: {
      marketCap: [200000000000, 999999999999],
      qualityScore: [70, 100]
    }
  },
  {
    id: 'dividend-aristocrats',
    name: 'Dividend Aristocrats',
    description: 'Dividendos consistentes',
    icon: DollarSign,
    popular: true,
    filters: {
      dividendYield: [2, 10],
      qualityScore: [75, 100],
      peRatio: [5, 25]
    }
  },
  {
    id: 'value-stocks',
    name: 'Value Stocks',
    description: 'Ações subvalorizadas',
    icon: Target,
    filters: {
      peRatio: [5, 15],
      pbRatio: [0.5, 2],
      qualityScore: [60, 100]
    }
  },
  {
    id: 'tech-leaders',
    name: 'Tech Leaders',
    description: 'Líderes em tecnologia',
    icon: Sparkles,
    popular: true,
    filters: {
      stockSector: ['Technology'],
      marketCap: [50000000000, 999999999999],
      returns12m: [10, 999]
    }
  }
]

// Opções de filtros baseadas nos dados reais disponíveis
const ASSET_CLASSES = [
  'Broad Market', 'Large Cap Focused', 'Mid Cap Focused', 'Small Cap Focused',
  'Growth Focused', 'Value Focused', 'Dividend Focused', 'Technology Focused',
  'International Focused', 'Emerging Markets', 'Commodities Focused',
  'Fixed Income Focused', 'Real Estate Focused'
]

const STOCK_SECTORS = [
  'Technology', 'Healthcare', 'Financials', 'Consumer Discretionary',
  'Communication Services', 'Industrials', 'Consumer Staples', 'Energy',
  'Utilities', 'Real Estate', 'Materials'
]

const EXCHANGES = ['NYSE', 'NASDAQ', 'AMEX']

export function EnhancedFilters({ 
  type, 
  filters, 
  onFiltersChange, 
  onSearch, 
  loading = false, 
  resultCount = 0 
}: EnhancedFiltersProps) {
  const [activeTab, setActiveTab] = useState('quick')
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic'])
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const presets = type === 'etf' ? ETF_PRESETS : STOCK_PRESETS
  const popularPresets = presets.filter(p => p.popular)

  // Contar filtros ativos
  useEffect(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.assetClass?.length) count++
    if (filters.sector?.length) count++
    if (filters.stockSector?.length) count++
    if (filters.returns12m?.[0] > -999 || filters.returns12m?.[1] < 999) count++
    if (filters.expenseRatio?.[0] > 0 || filters.expenseRatio?.[1] < 3) count++
    if (filters.marketCap?.[0] > 0 || filters.marketCap?.[1] < 999999999999) count++
    // ... outros filtros
    setActiveFiltersCount(count)
  }, [filters])

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const applyPreset = (preset: PresetFilter) => {
    const newFilters = { ...filters, ...preset.filters }
    onFiltersChange(newFilters)
    onSearch()
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      searchTerm: '',
      assetClass: [],
      sector: [],
      company: [],
      stockSector: [],
      industry: [],
      exchange: [],
      returns12m: [-999, 999],
      returns24m: [-999, 999],
      returns5y: [-999, 999],
      volatility: [0, 100],
      sharpeRatio: [-5, 10],
      expenseRatio: [0, 3],
      marketCap: [0, 999999999999],
      peRatio: [0, 100],
      pbRatio: [0, 10],
      dividendYield: [0, 15],
      qualityScore: [0, 100],
      liquidityRating: [],
      sizeRating: [],
      inception: [1990, 2025],
      volume: [0, 999999999],
      maxDrawdown: [-100, 0]
    }
    onFiltersChange(clearedFilters)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header com estatísticas */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#0090d8]" />
              <h3 className="text-lg font-medium text-[#202636]">
                Filtros Inteligentes
              </h3>
            </div>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-[#0090d8] text-white">
                {activeFiltersCount} ativos
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-[#202636]">{resultCount.toLocaleString()}</span> {type === 'etf' ? 'ETFs' : 'ações'} encontradas
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs para organização */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mx-6 mt-6">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Filtros Rápidos
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Avançados
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Personalizado
          </TabsTrigger>
        </TabsList>

        {/* Filtros Rápidos */}
        <TabsContent value="quick" className="p-6 pt-4">
          <div className="space-y-6">
            {/* Busca Principal */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Buscar ${type === 'etf' ? 'ETFs' : 'ações'}... (ex: ${type === 'etf' ? 'SPY, QQQ' : 'AAPL, GOOGL'})`}
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10 h-12 text-base"
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>

            {/* Presets Populares */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Label className="text-base font-medium text-[#202636]">Seleções Populares</Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularPresets.map((preset) => {
                  const Icon = preset.icon
                  return (
                    <Button
                      key={preset.id}
                      variant="outline"
                      onClick={() => applyPreset(preset)}
                      className="h-auto p-4 flex-col items-start text-left hover:border-[#0090d8] hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-2 mb-2 w-full">
                        <Icon className="h-4 w-4 text-[#0090d8]" />
                        <span className="font-medium text-sm">{preset.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{preset.description}</p>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Filtros Básicos Visuais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Performance 12 Meses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Slider
                      value={filters.returns12m}
                      onValueChange={(value) => updateFilter('returns12m', value)}
                      max={200}
                      min={-50}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filters.returns12m[0]}%</span>
                      <span>{filters.returns12m[1]}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custo */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    {type === 'etf' ? 'Taxa de Administração' : 'P/E Ratio'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {type === 'etf' ? (
                      <Slider
                        value={filters.expenseRatio}
                        onValueChange={(value) => updateFilter('expenseRatio', value)}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                    ) : (
                      <Slider
                        value={filters.peRatio}
                        onValueChange={(value) => updateFilter('peRatio', value)}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    )}
                    <div className="flex justify-between text-xs text-gray-600">
                      {type === 'etf' ? (
                        <>
                          <span>{filters.expenseRatio[0]}%</span>
                          <span>{filters.expenseRatio[1]}%</span>
                        </>
                      ) : (
                        <>
                          <span>{filters.peRatio[0]}</span>
                          <span>{filters.peRatio[1]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Filtros Avançados */}
        <TabsContent value="advanced" className="p-6 pt-4">
          <div className="space-y-4">
            {/* Seções colapsáveis */}
            {[
              { id: 'categories', title: 'Categorias', icon: BarChart3 },
              { id: 'performance', title: 'Performance', icon: TrendingUp },
              { id: 'fundamentals', title: 'Fundamentais', icon: Shield },
              { id: 'quality', title: 'Qualidade', icon: Target }
            ].map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSections.includes(section.id)
              
              return (
                <Card key={section.id} className="border-gray-200">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[#0090d8]" />
                        {section.title}
                      </CardTitle>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      {section.id === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {type === 'etf' ? (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Classe de Ativo</Label>
                              <Select
                                value={filters.assetClass[0] || ''}
                                onValueChange={(value) => updateFilter('assetClass', value ? [value] : [])}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {ASSET_CLASSES.map((asset) => (
                                    <SelectItem key={asset} value={asset}>
                                      {asset}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <>
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Setor</Label>
                                <Select
                                  value={filters.stockSector[0] || ''}
                                  onValueChange={(value) => updateFilter('stockSector', value ? [value] : [])}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STOCK_SECTORS.map((sector) => (
                                      <SelectItem key={sector} value={sector}>
                                        {sector}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Bolsa</Label>
                                <Select
                                  value={filters.exchange[0] || ''}
                                  onValueChange={(value) => updateFilter('exchange', value ? [value] : [])}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {EXCHANGES.map((exchange) => (
                                      <SelectItem key={exchange} value={exchange}>
                                        {exchange}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {section.id === 'performance' && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Volatilidade (%)</Label>
                            <Slider
                              value={filters.volatility}
                              onValueChange={(value) => updateFilter('volatility', value)}
                              max={100}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{filters.volatility[0]}%</span>
                              <span>{filters.volatility[1]}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Sharpe Ratio</Label>
                            <Slider
                              value={filters.sharpeRatio}
                              onValueChange={(value) => updateFilter('sharpeRatio', value)}
                              max={5}
                              min={-2}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{filters.sharpeRatio[0]}</span>
                              <span>{filters.sharpeRatio[1]}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {section.id === 'fundamentals' && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Market Cap</Label>
                            <Slider
                              value={[Math.log10(filters.marketCap[0] || 1000000), Math.log10(filters.marketCap[1])]}
                              onValueChange={(value) => updateFilter('marketCap', [Math.pow(10, value[0]), Math.pow(10, value[1])])}
                              max={13}
                              min={6}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>${(filters.marketCap[0] / 1000000000).toFixed(1)}B</span>
                              <span>${(filters.marketCap[1] / 1000000000).toFixed(1)}B</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Dividend Yield (%)</Label>
                            <Slider
                              value={filters.dividendYield}
                              onValueChange={(value) => updateFilter('dividendYield', value)}
                              max={15}
                              min={0}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{filters.dividendYield[0]}%</span>
                              <span>{filters.dividendYield[1]}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {section.id === 'quality' && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Quality Score</Label>
                          <Slider
                            value={filters.qualityScore}
                            onValueChange={(value) => updateFilter('qualityScore', value)}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{filters.qualityScore[0]}</span>
                            <span>{filters.qualityScore[1]}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Filtros Personalizados */}
        <TabsContent value="custom" className="p-6 pt-4">
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#202636] mb-2">Filtros Personalizados</h3>
            <p className="text-gray-600 mb-6">
              Salve suas combinações favoritas de filtros para reutilizar
            </p>
            <Button variant="outline" className="border-[#0090d8] text-[#0090d8] hover:bg-blue-50">
              Em breve
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ações */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Use os filtros acima para refinar sua busca
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setActiveTab('quick')}
              className="text-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
            <Button
              onClick={onSearch}
              disabled={loading}
              className="bg-[#0090d8] hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Ver Resultados
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
