// src/components/screener/Filters.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Shield,
  Star,
  RotateCcw,
  Zap
} from 'lucide-react';
import { AdvancedFilters } from '@/types/etf';

interface FiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onSearch: () => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  isLoading?: boolean;
  totalResults?: number;
}

// Presets populares simples
const POPULAR_PRESETS = {
  'melhores-12m': {
    name: 'Melhores 12 Meses',
    description: 'ETFs com melhor performance no último ano',
    icon: TrendingUp,
    sortBy: 'returns_12m',
    sortOrder: 'DESC' as const,
    filters: {}
  },
  'baixo-custo': {
    name: 'Baixo Custo',
    description: 'ETFs com menores taxas de administração',
    icon: DollarSign,
    sortBy: 'expense_ratio',
    sortOrder: 'ASC' as const,
    filters: { expenseRatioMax: 0.5 }
  },
  'alto-dividendo': {
    name: 'Alto Dividendo',
    description: 'ETFs com maiores rendimentos',
    icon: DollarSign,
    sortBy: 'dividend_yield',
    sortOrder: 'DESC' as const,
    filters: { dividendYieldMin: 2 }
  },
  'baixa-volatilidade': {
    name: 'Baixa Volatilidade',
    description: 'ETFs mais estáveis',
    icon: Shield,
    sortBy: 'volatility_12m',
    sortOrder: 'ASC' as const,
    filters: { volatility12mMax: 20 }
  },
  'maior-sharpe': {
    name: 'Melhor Sharpe',
    description: 'Melhor relação risco-retorno',
    icon: Star,
    sortBy: 'sharpe_12m',
    sortOrder: 'DESC' as const,
    filters: {}
  },
  'mais-liquidos': {
    name: 'Mais Líquidos',
    description: 'ETFs com maior volume',
    icon: TrendingUp,
    sortBy: 'volume',
    sortOrder: 'DESC' as const,
    filters: { volumeMin: 1000000 }
  }
};

// Opções de ordenação simples
const SORT_OPTIONS = [
  { value: 'returns_12m:DESC', label: 'Melhor Performance 12m', icon: TrendingUp },
  { value: 'returns_5y:DESC', label: 'Melhor Performance 5 anos', icon: TrendingUp },
  { value: 'sharpe_12m:DESC', label: 'Melhor Sharpe 12m', icon: Star },
  { value: 'sharpe_36m:DESC', label: 'Melhor Sharpe 3 anos', icon: Star },
  { value: 'volatility_12m:ASC', label: 'Menor Volatilidade 12m', icon: Shield },
  { value: 'volatility_24m:ASC', label: 'Menor Volatilidade 2 anos', icon: Shield },
  { value: 'dividend_yield:DESC', label: 'Maior Dividend Yield', icon: DollarSign },
  { value: 'expense_ratio:ASC', label: 'Menor Taxa de Administração', icon: DollarSign },
  { value: 'totalasset:DESC', label: 'Maior Patrimônio', icon: Star },
  { value: 'volume:DESC', label: 'Maior Volume (Liquidez)', icon: TrendingUp },
  { value: 'returns_12m:ASC', label: 'Pior Performance 12m', icon: TrendingDown },
  { value: 'symbol:ASC', label: 'Ordem Alfabética', icon: Search }
];

export function Filters({ filters, onFiltersChange, onSearch, onSortChange, isLoading = false, totalResults }: FiltersProps) {
  const [selectedSort, setSelectedSort] = useState<string>('returns_12m:DESC');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Aplicar preset popular
  const applyPreset = (presetKey: string) => {
    const preset = POPULAR_PRESETS[presetKey as keyof typeof POPULAR_PRESETS];
    if (preset) {
      const newFilters = { ...filters, ...preset.filters };
      onFiltersChange(newFilters);
      setSelectedSort(`${preset.sortBy}:${preset.sortOrder}`);
      
      // Atualizar contador de filtros ativos
      const filterCount = Object.keys(preset.filters).length;
      setActiveFiltersCount(filterCount);
    }
  };

  // Aplicar ordenação
  const applySort = (sortValue: string) => {
    setSelectedSort(sortValue);
    const [sortBy, sortOrder] = sortValue.split(':');
    
    // Comunicar ordenação para o componente pai
    if (onSortChange) {
      onSortChange(sortBy, sortOrder.toLowerCase());
    }
    
    // Trigger search com nova ordenação
    onSearch();
  };

  // Limpar filtros
  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      assetclass: '',
      onlyComplete: false
    });
    setSelectedSort('returns_12m:DESC');
    setActiveFiltersCount(0);
  };

  // Contar filtros ativos
  const countActiveFilters = () => {
    const filterKeys = [
      'assetclass', 'domicile', 'expenseRatioMin', 'expenseRatioMax',
      'totalAssetsMin', 'totalAssetsMax', 'dividendYieldMin', 'dividendYieldMax',
      'volatility12mMin', 'volatility12mMax', 'returns12mMin', 'returns12mMax',
      'volumeMin', 'volumeMax'
    ];
    
    return filterKeys.filter(key => {
      const value = filters[key as keyof AdvancedFilters];
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  React.useEffect(() => {
    setActiveFiltersCount(countActiveFilters());
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header com busca e ações principais */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Encontrar ETFs</CardTitle>
              <CardDescription>
                Descubra os melhores ETFs usando filtros simples e ordenação inteligente
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {totalResults !== undefined && (
                <Badge variant="secondary" className="text-sm">
                  {totalResults.toLocaleString()} ETFs encontrados
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={activeFiltersCount === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button
                onClick={onSearch}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Busca por texto */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Buscar por nome ou símbolo
            </Label>
            <Input
              id="search"
              placeholder="Digite o nome ou símbolo do ETF (ex: SPY, IVVB11, BOVA11)..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="h-12 text-base"
            />
          </div>

          {/* Ordenação - Destaque principal */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ordenar por
            </Label>
            <Select value={selectedSort} onValueChange={applySort}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Escolha como ordenar os resultados" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Presets Populares */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Buscas Populares
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(POPULAR_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => applyPreset(key)}
                  className="h-auto p-4 text-left justify-start hover:bg-primary hover:text-primary-foreground"
                >
                  <div className="flex items-center gap-3">
                    <preset.icon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{preset.name}</div>
                      <div className="text-xs opacity-75">{preset.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Filtros Simples */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Filtros Rápidos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {/* Classe de Ativo */}
               <div className="space-y-2">
                 <Label className="text-xs text-muted-foreground">Tipo de Ativo</Label>
                 <Select
                   value={filters.assetclass || 'all'}
                   onValueChange={(value) => onFiltersChange({ ...filters, assetclass: value === 'all' ? '' : value })}
                 >
                   <SelectTrigger className="h-10">
                     <SelectValue placeholder="Todos" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Todos os tipos</SelectItem>
                     <SelectItem value="Equity">Ações</SelectItem>
                     <SelectItem value="Fixed Income">Renda Fixa</SelectItem>
                     <SelectItem value="Commodity">Commodities</SelectItem>
                     <SelectItem value="Currency">Moedas</SelectItem>
                     <SelectItem value="Alternative">Alternativos</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                             {/* País/Domicílio */}
               <div className="space-y-2">
                 <Label className="text-xs text-muted-foreground">País</Label>
                 <Select
                   value={filters.domicile || 'all'}
                   onValueChange={(value) => onFiltersChange({ ...filters, domicile: value === 'all' ? '' : value })}
                 >
                   <SelectTrigger className="h-10">
                     <SelectValue placeholder="Todos" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Todos os países</SelectItem>
                     <SelectItem value="US">Estados Unidos</SelectItem>
                     <SelectItem value="BR">Brasil</SelectItem>
                     <SelectItem value="IE">Irlanda</SelectItem>
                     <SelectItem value="LU">Luxemburgo</SelectItem>
                     <SelectItem value="UK">Reino Unido</SelectItem>
                     <SelectItem value="CA">Canadá</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

              {/* Taxa máxima */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Taxa máxima (%)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 0.5"
                  value={filters.expenseRatioMax || ''}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    expenseRatioMax: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Indicador de filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{activeFiltersCount}</Badge>
              <span>filtro{activeFiltersCount !== 1 ? 's' : ''} ativo{activeFiltersCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

