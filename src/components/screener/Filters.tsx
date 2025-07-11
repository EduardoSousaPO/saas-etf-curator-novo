// src/components/screener/Filters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Settings,
  RotateCcw,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { AdvancedFilters, FilterPreset, SortPreset, SortField, SortOrder, SortConfig } from '@/types/etf';
import { 
  FILTER_PRESETS, 
  SORT_PRESETS, 
  SORT_PRESET_LABELS, 
  SORT_FIELD_LABELS,
  applyFilterPreset,
  applySortPreset
} from '@/lib/screener-presets';

interface FiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
  totalResults?: number;
}

export function Filters({ filters, onFiltersChange, onSearch, isLoading = false, totalResults }: FiltersProps) {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    financial: false,
    performance: false,
    risk: false,
    dividends: false,
    categories: false,
    temporal: false,
    quality: false,
    sorting: false
  });

  // Estados para ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    primary: { field: 'symbol' as SortField, order: 'ASC' as SortOrder }
  });

  // Contar filtros ativos
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'searchTerm' || key === 'assetclass') return false;
      return value !== undefined && value !== null && value !== '' && value !== false;
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  // Função para atualizar filtros
  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Função para aplicar preset de filtro
  const applyFilterPresetHandler = (preset: FilterPreset) => {
    const presetConfig = applyFilterPreset(preset);
    onFiltersChange({ ...filters, ...presetConfig.filters });
    if (presetConfig.sort) {
      setSortConfig(presetConfig.sort);
    }
  };

  // Função para aplicar preset de ordenação
  const applySortPresetHandler = (preset: SortPreset) => {
    const sortPresetConfig = applySortPreset(preset);
    setSortConfig(sortPresetConfig);
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      assetclass: '',
      onlyComplete: false
    });
    setSortConfig({
      primary: { field: 'symbol', order: 'ASC' }
    });
  };

  // Função para alternar seção expandida
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Componente para range de valores
  const RangeInput = ({ 
    label, 
    minKey, 
    maxKey, 
    unit = '', 
    step = 0.01, 
    placeholder = '',
    description = ''
  }: {
    label: string;
    minKey: keyof AdvancedFilters;
    maxKey: keyof AdvancedFilters;
    unit?: string;
    step?: number;
    placeholder?: string;
    description?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder={`Mín ${placeholder}`}
          value={filters[minKey] as number || ''}
          onChange={(e) => updateFilter(minKey, e.target.value ? parseFloat(e.target.value) : null)}
          step={step}
          className="w-full"
        />
        <span className="text-muted-foreground">até</span>
        <Input
          type="number"
          placeholder={`Máx ${placeholder}`}
          value={filters[maxKey] as number || ''}
          onChange={(e) => updateFilter(maxKey, e.target.value ? parseFloat(e.target.value) : null)}
          step={step}
          className="w-full"
        />
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalResults !== undefined && (
              <span className="text-sm text-muted-foreground">
                {totalResults.toLocaleString()} ETFs
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={activeFiltersCount === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            <Button
              onClick={onSearch}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </div>
        <CardDescription>
          Configure filtros avançados para encontrar ETFs que atendam seus critérios específicos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Presets Rápidos */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Filtros Pré-configurados
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(FILTER_PRESETS).map(([key, config]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => applyFilterPresetHandler(key as FilterPreset)}
                className="text-xs h-8"
              >
                {config.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tabs para organizar filtros */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="text-xs">Básico</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financeiro</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Avançado</TabsTrigger>
            <TabsTrigger value="sorting" className="text-xs">Ordenação</TabsTrigger>
          </TabsList>

          {/* Tab: Filtros Básicos */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Busca por texto */}
              <div className="space-y-2">
                <Label htmlFor="searchTerm">Buscar ETF</Label>
                <Input
                  id="searchTerm"
                  placeholder="Nome ou símbolo do ETF..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                />
              </div>

              {/* Classe de ativo */}
              <div className="space-y-2">
                <Label htmlFor="assetclass">Classe de Ativo</Label>
                <Select value={filters.assetclass || undefined} onValueChange={(value) => updateFilter('assetclass', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as classes</SelectItem>
                    <SelectItem value="Equity">Equity (Ações)</SelectItem>
                    <SelectItem value="Fixed Income">Fixed Income (Renda Fixa)</SelectItem>
                    <SelectItem value="Commodity">Commodity</SelectItem>
                    <SelectItem value="Currency">Currency (Moedas)</SelectItem>
                    <SelectItem value="Alternative">Alternative</SelectItem>
                    <SelectItem value="Multi-Asset">Multi-Asset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gestora */}
              <div className="space-y-2">
                <Label htmlFor="etfCompany">Gestora</Label>
                <Input
                  id="etfCompany"
                  placeholder="Ex: BlackRock, Vanguard..."
                  value={filters.etfCompany || ''}
                  onChange={(e) => updateFilter('etfCompany', e.target.value)}
                />
              </div>

              {/* Domicílio */}
              <div className="space-y-2">
                <Label htmlFor="domicile">Domicílio</Label>
                <Select value={filters.domicile || undefined} onValueChange={(value) => updateFilter('domicile', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os países</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="IE">Irlanda</SelectItem>
                    <SelectItem value="LU">Luxemburgo</SelectItem>
                    <SelectItem value="UK">Reino Unido</SelectItem>
                    <SelectItem value="CA">Canadá</SelectItem>
                    <SelectItem value="DE">Alemanha</SelectItem>
                    <SelectItem value="FR">França</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros de qualidade rápidos */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Filtros de Qualidade</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="onlyComplete"
                    checked={filters.onlyComplete || false}
                    onCheckedChange={(checked) => updateFilter('onlyComplete', checked)}
                  />
                  <Label htmlFor="onlyComplete" className="text-sm">Dados Completos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="highQualityOnly"
                    checked={filters.highQualityOnly || false}
                    onCheckedChange={(checked) => updateFilter('highQualityOnly', checked)}
                  />
                  <Label htmlFor="highQualityOnly" className="text-sm">Alta Qualidade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lowCostOnly"
                    checked={filters.lowCostOnly || false}
                    onCheckedChange={(checked) => updateFilter('lowCostOnly', checked)}
                  />
                  <Label htmlFor="lowCostOnly" className="text-sm">Baixo Custo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="highLiquidityOnly"
                    checked={filters.highLiquidityOnly || false}
                    onCheckedChange={(checked) => updateFilter('highLiquidityOnly', checked)}
                  />
                  <Label htmlFor="highLiquidityOnly" className="text-sm">Alta Liquidez</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Filtros Financeiros */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RangeInput
                label="Patrimônio Líquido"
                minKey="totalAssetsMin"
                maxKey="totalAssetsMax"
                unit="M USD"
                step={1}
                placeholder="milhões"
                description="Patrimônio total do ETF em milhões de dólares"
              />

              <RangeInput
                label="Taxa de Administração"
                minKey="expenseRatioMin"
                maxKey="expenseRatioMax"
                unit="%"
                step={0.01}
                placeholder="0.50"
                description="Taxa anual de administração em percentual"
              />

              <RangeInput
                label="Preço (NAV)"
                minKey="navMin"
                maxKey="navMax"
                unit="USD"
                step={0.01}
                placeholder="100.00"
                description="Valor patrimonial líquido por cota"
              />

              <RangeInput
                label="Volume Médio Diário"
                minKey="volumeMin"
                maxKey="volumeMax"
                unit="cotas"
                step={1000}
                placeholder="100000"
                description="Volume médio de negociação diária"
              />

              <RangeInput
                label="Número de Holdings"
                minKey="holdingsCountMin"
                maxKey="holdingsCountMax"
                unit="ativos"
                step={1}
                placeholder="100"
                description="Quantidade de ativos na carteira"
              />
            </div>
          </TabsContent>

          {/* Tab: Performance */}
          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="space-y-6">
              {/* Retornos */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Retornos
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RangeInput
                    label="Retorno 12 meses"
                    minKey="returns12mMin"
                    maxKey="returns12mMax"
                    unit="%"
                    step={0.1}
                    placeholder="5.0"
                    description="Performance dos últimos 12 meses"
                  />
                  <RangeInput
                    label="Retorno 24 meses"
                    minKey="returns24mMin"
                    maxKey="returns24mMax"
                    unit="%"
                    step={0.1}
                    placeholder="10.0"
                  />
                  <RangeInput
                    label="Retorno 36 meses"
                    minKey="returns36mMin"
                    maxKey="returns36mMax"
                    unit="%"
                    step={0.1}
                    placeholder="15.0"
                  />
                  <RangeInput
                    label="Retorno 5 anos"
                    minKey="returns5yMin"
                    maxKey="returns5yMax"
                    unit="%"
                    step={0.1}
                    placeholder="8.0"
                  />
                </div>
              </div>

              {/* Volatilidade */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Volatilidade
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RangeInput
                    label="Volatilidade 12 meses"
                    minKey="volatility12mMin"
                    maxKey="volatility12mMax"
                    unit="%"
                    step={0.1}
                    placeholder="15.0"
                    description="Desvio padrão dos retornos"
                  />
                  <RangeInput
                    label="Volatilidade 24 meses"
                    minKey="volatility24mMin"
                    maxKey="volatility24mMax"
                    unit="%"
                    step={0.1}
                    placeholder="18.0"
                  />
                  <RangeInput
                    label="Volatilidade 36 meses"
                    minKey="volatility36mMin"
                    maxKey="volatility36mMax"
                    unit="%"
                    step={0.1}
                    placeholder="20.0"
                  />
                  <RangeInput
                    label="Volatilidade 5 anos"
                    minKey="volatility5yMin"
                    maxKey="volatility5yMax"
                    unit="%"
                    step={0.1}
                    placeholder="16.0"
                  />
                </div>
              </div>

              {/* Sharpe Ratio */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Sharpe Ratio
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RangeInput
                    label="Sharpe 12 meses"
                    minKey="sharpe12mMin"
                    maxKey="sharpe12mMax"
                    step={0.01}
                    placeholder="0.50"
                    description="Relação risco-retorno ajustada"
                  />
                  <RangeInput
                    label="Sharpe 24 meses"
                    minKey="sharpe24mMin"
                    maxKey="sharpe24mMax"
                    step={0.01}
                    placeholder="0.60"
                  />
                  <RangeInput
                    label="Sharpe 36 meses"
                    minKey="sharpe36mMin"
                    maxKey="sharpe36mMax"
                    step={0.01}
                    placeholder="0.70"
                  />
                  <RangeInput
                    label="Sharpe 5 anos"
                    minKey="sharpe5yMin"
                    maxKey="sharpe5yMax"
                    step={0.01}
                    placeholder="0.80"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Filtros Avançados */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-6">
              {/* Risco */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Risco
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RangeInput
                    label="Max Drawdown"
                    minKey="maxDrawdownMin"
                    maxKey="maxDrawdownMax"
                    unit="%"
                    step={0.1}
                    placeholder="-10.0"
                    description="Maior perda desde o pico"
                  />
                </div>
              </div>

              {/* Dividendos */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Dividendos
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RangeInput
                    label="Dividend Yield"
                    minKey="dividendYieldMin"
                    maxKey="dividendYieldMax"
                    unit="%"
                    step={0.1}
                    placeholder="3.0"
                    description="Rendimento anual de dividendos"
                  />
                  <RangeInput
                    label="Dividendos 12 meses"
                    minKey="dividends12mMin"
                    maxKey="dividends12mMax"
                    unit="USD"
                    step={0.01}
                    placeholder="1.50"
                  />
                  <RangeInput
                    label="Dividendos 24 meses"
                    minKey="dividends24mMin"
                    maxKey="dividends24mMax"
                    unit="USD"
                    step={0.01}
                    placeholder="3.00"
                  />
                  <RangeInput
                    label="Dividendos 36 meses"
                    minKey="dividends36mMin"
                    maxKey="dividends36mMax"
                    unit="USD"
                    step={0.01}
                    placeholder="4.50"
                  />
                </div>
              </div>

              {/* Categorização */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Categorização</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sizeCategory">Categoria de Tamanho</Label>
                    <Select value={filters.sizeCategory || undefined} onValueChange={(value) => updateFilter('sizeCategory', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tamanhos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tamanhos</SelectItem>
                        <SelectItem value="Large">Large Cap</SelectItem>
                        <SelectItem value="Mid">Mid Cap</SelectItem>
                        <SelectItem value="Small">Small Cap</SelectItem>
                        <SelectItem value="Micro">Micro Cap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="liquidityCategory">Categoria de Liquidez</Label>
                    <Select value={filters.liquidityCategory || undefined} onValueChange={(value) => updateFilter('liquidityCategory', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as liquidez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as liquidez</SelectItem>
                        <SelectItem value="High">Alta</SelectItem>
                        <SelectItem value="Medium">Média</SelectItem>
                        <SelectItem value="Low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="liquidityRating">Rating de Liquidez</Label>
                    <Select value={filters.liquidityRating || undefined} onValueChange={(value) => updateFilter('liquidityRating', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os ratings</SelectItem>
                        <SelectItem value="A">A (Excelente)</SelectItem>
                        <SelectItem value="B">B (Bom)</SelectItem>
                        <SelectItem value="C">C (Regular)</SelectItem>
                        <SelectItem value="D">D (Baixo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="etfType">Tipo de ETF</Label>
                    <Select value={filters.etfType || undefined} onValueChange={(value) => updateFilter('etfType', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="Index">Index</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Smart Beta">Smart Beta</SelectItem>
                        <SelectItem value="Leveraged">Leveraged</SelectItem>
                        <SelectItem value="Inverse">Inverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Filtros Temporais */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Filtros Temporais
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inceptionDateAfter">Criado Após</Label>
                    <Input
                      id="inceptionDateAfter"
                      type="date"
                      value={filters.inceptionDateAfter || ''}
                      onChange={(e) => updateFilter('inceptionDateAfter', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inceptionDateBefore">Criado Antes</Label>
                    <Input
                      id="inceptionDateBefore"
                      type="date"
                      value={filters.inceptionDateBefore || ''}
                      onChange={(e) => updateFilter('inceptionDateBefore', e.target.value)}
                    />
                  </div>
                  <RangeInput
                    label="Idade do ETF"
                    minKey="etfAgeMinYears"
                    maxKey="etfAgeMaxYears"
                    unit="anos"
                    step={1}
                    placeholder="5"
                    description="Tempo desde a criação"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Ordenação */}
          <TabsContent value="sorting" className="space-y-4 mt-4">
            <div className="space-y-6">
              {/* Presets de Ordenação */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Ordenação Pré-configurada
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(SORT_PRESET_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => applySortPresetHandler(key as SortPreset)}
                      className="text-xs h-8"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ordenação Personalizada */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Ordenação Personalizada</Label>
                
                {/* Ordenação Primária */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Ordenação Primária</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primarySort">Campo</Label>
                      <Select 
                        value={sortConfig.primary.field} 
                        onValueChange={(value) => setSortConfig(prev => ({
                          ...prev,
                          primary: { ...prev.primary, field: value as SortField }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SORT_FIELD_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryOrder">Direção</Label>
                      <Select 
                        value={sortConfig.primary.order} 
                        onValueChange={(value) => setSortConfig(prev => ({
                          ...prev,
                          primary: { ...prev.primary, order: value as SortOrder }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ASC">
                            <div className="flex items-center gap-2">
                              <SortAsc className="h-4 w-4" />
                              Crescente
                            </div>
                          </SelectItem>
                          <SelectItem value="DESC">
                            <div className="flex items-center gap-2">
                              <SortDesc className="h-4 w-4" />
                              Decrescente
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Ordenação Secundária */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Ordenação Secundária (Opcional)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSortConfig(prev => ({ ...prev, secondary: undefined }))}
                      disabled={!sortConfig.secondary}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {sortConfig.secondary ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="secondarySort">Campo</Label>
                        <Select 
                          value={sortConfig.secondary.field} 
                          onValueChange={(value) => setSortConfig(prev => ({
                            ...prev,
                            secondary: { ...prev.secondary!, field: value as SortField }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SORT_FIELD_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryOrder">Direção</Label>
                        <Select 
                          value={sortConfig.secondary.order} 
                          onValueChange={(value) => setSortConfig(prev => ({
                            ...prev,
                            secondary: { ...prev.secondary!, order: value as SortOrder }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ASC">
                              <div className="flex items-center gap-2">
                                <SortAsc className="h-4 w-4" />
                                Crescente
                              </div>
                            </SelectItem>
                            <SelectItem value="DESC">
                              <div className="flex items-center gap-2">
                                <SortDesc className="h-4 w-4" />
                                Decrescente
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setSortConfig(prev => ({
                        ...prev,
                        secondary: { field: 'totalasset', order: 'DESC' }
                      }))}
                    >
                      + Adicionar Ordenação Secundária
                    </Button>
                  )}
                </div>
              </div>

              {/* Preview da Ordenação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview da Ordenação</Label>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">1º:</span>
                    <span>{SORT_FIELD_LABELS[sortConfig.primary.field]}</span>
                    <span className="text-muted-foreground">
                      ({sortConfig.primary.order === 'ASC' ? 'Crescente' : 'Decrescente'})
                    </span>
                  </div>
                  {sortConfig.secondary && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">2º:</span>
                      <span>{SORT_FIELD_LABELS[sortConfig.secondary.field]}</span>
                      <span className="text-muted-foreground">
                        ({sortConfig.secondary.order === 'ASC' ? 'Crescente' : 'Decrescente'})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

