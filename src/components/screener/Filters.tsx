// src/components/screener/Filters.tsx
'use client';

import React, { useState, useEffect } from 'react';
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

// 🎯 PRESETS INTELIGENTES - Baseados em benchmarks JustETF e Morningstar
const SMART_PRESETS = {
  'top-performers': {
    name: '🏆 Top Performers',
    description: 'Melhores ETFs dos últimos 12 meses',
    icon: TrendingUp,
    color: 'bg-green-50 border-green-200 text-green-800',
    sortBy: 'returns_12m',
    sortOrder: 'DESC' as const,
    filters: { returns12mMin: 10, totalAssetsMin: 100 }
  },
  'low-cost-leaders': {
    name: '💰 Baixo Custo',
    description: 'ETFs com as menores taxas do mercado',
    icon: DollarSign,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    sortBy: 'expense_ratio',
    sortOrder: 'ASC' as const,
    filters: { expenseRatioMax: 0.3, totalAssetsMin: 50 }
  },
  'dividend-champions': {
    name: '📈 Dividend Champions',
    description: 'Maiores pagadores de dividendos',
    icon: DollarSign,
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    sortBy: 'dividend_yield',
    sortOrder: 'DESC' as const,
    filters: { dividendYieldMin: 3, volatility12mMax: 25 }
  },
  'risk-balanced': {
    name: '⚖️ Risco Equilibrado',
    description: 'Melhor relação risco-retorno',
    icon: Shield,
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    sortBy: 'sharpe_12m',
    sortOrder: 'DESC' as const,
    filters: { sharpe12mMin: 0.5, volatility12mMax: 20 }
  },
  'mega-liquid': {
    name: '🌊 Alta Liquidez',
    description: 'ETFs mais negociados e líquidos',
    icon: TrendingUp,
    color: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    sortBy: 'volume',
    sortOrder: 'DESC' as const,
    filters: { volumeMin: 5000000, totalAssetsMin: 500 }
  },
  'conservative-growth': {
    name: '🛡️ Crescimento Conservador',
    description: 'Crescimento estável com baixo risco',
    icon: Shield,
    color: 'bg-gray-50 border-gray-200 text-gray-800',
    sortBy: 'returns_5y',
    sortOrder: 'DESC' as const,
    filters: { volatility12mMax: 15, maxDrawdownMax: -10, totalAssetsMin: 200 }
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
  
  // Sincronizar com o valor inicial ao montar o componente
  // Sincronizar estado inicial de ordenação com o componente pai
  useEffect(() => {
    if (onSortChange) {
      // Garantir que o estado inicial seja sincronizado corretamente
      onSortChange('returns_12m', 'desc');
    }
  }, [onSortChange]);

  // 🎯 Aplicar preset inteligente
  const applySmartPreset = (presetKey: string) => {
    const preset = SMART_PRESETS[presetKey as keyof typeof SMART_PRESETS];
    if (preset) {
      // Aplicar filtros do preset
      const newFilters = { ...filters, ...preset.filters };
      onFiltersChange(newFilters);
      
      // Aplicar ordenação do preset
      applySort(`${preset.sortBy}:${preset.sortOrder}`);
      
      // Contar filtros ativos
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
              <CardTitle className="text-xl text-[#202636]">Encontrar ETFs</CardTitle>
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
                className="min-w-[120px] bg-[#0090d8] hover:bg-[#0090d8]/90"
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
          {/* 🎯 PRESETS INTELIGENTES - Inspirado em JustETF */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#0090d8]" />
              <Label className="text-sm font-medium text-[#202636]">
                Filtros Rápidos
              </Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(SMART_PRESETS).map(([key, preset]) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={key}
                    onClick={() => applySmartPreset(key)}
                    className={`p-3 rounded-lg border-2 transition-all hover:shadow-md text-left ${preset.color}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium text-sm">{preset.name}</span>
                    </div>
                    <p className="text-xs opacity-80">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

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
            <Label className="text-sm font-medium flex items-center gap-2 text-[#202636]">
              <TrendingUp className="h-4 w-4 text-[#0090d8]" />
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
            <Label className="text-sm font-medium flex items-center gap-2 text-[#202636]">
              <Zap className="h-4 w-4 text-[#0090d8]" />
              Buscas Populares
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(SMART_PRESETS).map(([key, preset]) => {
                const IconComponent = preset.icon;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => applySmartPreset(key)}
                    className="h-auto p-4 text-left justify-start hover:bg-[#0090d8] hover:text-white transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs opacity-75">{preset.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtros Simples */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-[#202636]">Filtros Rápidos</Label>
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

