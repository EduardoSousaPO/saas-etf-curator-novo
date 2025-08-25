'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface StocksFiltersProps {
  filters: {
    search_term: string;
    sector: string;
    industry: string;
    market_cap_min: number | null;
    market_cap_max: number | null;
    pe_ratio_min: number | null;
    pe_ratio_max: number | null;
    dividend_yield_min: number | null;
    dividend_yield_max: number | null;
    returns_12m_min: number | null;
    returns_12m_max: number | null;
    volatility_min: number | null;
    volatility_max: number | null;
    employees_min: number | null;
    employees_max: number | null;
    size_category: string;
    only_complete: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
  activeCount: number;
}

const SECTORS = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Industrials',
  'Energy',
  'Materials',
  'Real Estate',
  'Utilities',
  'Communication Services'
];

const SIZE_CATEGORIES = [
  { value: 'Large Cap', label: 'Large Cap (>$10B)' },
  { value: 'Mid Cap', label: 'Mid Cap ($2B-$10B)' },
  { value: 'Small Cap', label: 'Small Cap (<$2B)' }
];

export function StocksFilters({ 
  filters, 
  onFiltersChange, 
  onApply, 
  onClear, 
  activeCount 
}: StocksFiltersProps) {
  
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateRangeFilter = (key: string, value: string, type: 'min' | 'max') => {
    const numValue = value === '' ? null : parseFloat(value);
    updateFilter(`${key}_${type}`, numValue);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros Avançados</h3>
          {activeCount > 0 && (
            <Badge variant="secondary">{activeCount} ativo{activeCount > 1 ? 's' : ''}</Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
          <Button size="sm" onClick={onApply}>
            Aplicar Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Setor e Indústria */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Classificação</h4>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Select value={filters.sector || 'all'} onValueChange={(value) => updateFilter('sector', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                {SECTORS.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Indústria</Label>
            <Input
              id="industry"
              placeholder="Ex: Software, Biotechnology"
              value={filters.industry}
              onChange={(e) => updateFilter('industry', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size_category">Tamanho da Empresa</Label>
            <Select value={filters.size_category || 'all'} onValueChange={(value) => updateFilter('size_category', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tamanhos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tamanhos</SelectItem>
                {SIZE_CATEGORIES.map(size => (
                  <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Métricas Financeiras */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Métricas Financeiras</h4>
          
          {/* Market Cap */}
          <div className="space-y-2">
            <Label>Market Cap (Bilhões USD)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Mín"
                type="number"
                value={filters.market_cap_min || ''}
                onChange={(e) => updateRangeFilter('market_cap', e.target.value, 'min')}
              />
              <Input
                placeholder="Máx"
                type="number"
                value={filters.market_cap_max || ''}
                onChange={(e) => updateRangeFilter('market_cap', e.target.value, 'max')}
              />
            </div>
          </div>

          {/* P/E Ratio */}
          <div className="space-y-2">
            <Label>P/E Ratio</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Mín"
                type="number"
                value={filters.pe_ratio_min || ''}
                onChange={(e) => updateRangeFilter('pe_ratio', e.target.value, 'min')}
              />
              <Input
                placeholder="Máx"
                type="number"
                value={filters.pe_ratio_max || ''}
                onChange={(e) => updateRangeFilter('pe_ratio', e.target.value, 'max')}
              />
            </div>
          </div>

          {/* Dividend Yield */}
          <div className="space-y-2">
            <Label>Dividend Yield (%)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Mín"
                type="number"
                step="0.1"
                value={filters.dividend_yield_min || ''}
                onChange={(e) => updateRangeFilter('dividend_yield', e.target.value, 'min')}
              />
              <Input
                placeholder="Máx"
                type="number"
                step="0.1"
                value={filters.dividend_yield_max || ''}
                onChange={(e) => updateRangeFilter('dividend_yield', e.target.value, 'max')}
              />
            </div>
          </div>

          {/* Número de Funcionários */}
          <div className="space-y-2">
            <Label>Número de Funcionários</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Mín"
                type="number"
                value={filters.employees_min || ''}
                onChange={(e) => updateRangeFilter('employees', e.target.value, 'min')}
              />
              <Input
                placeholder="Máx"
                type="number"
                value={filters.employees_max || ''}
                onChange={(e) => updateRangeFilter('employees', e.target.value, 'max')}
              />
            </div>
          </div>
        </div>

        {/* Performance e Risco */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Performance & Risco</h4>
          
          {/* Returns 12M */}
          <div className="space-y-2">
            <Label>Retorno 12 Meses (%)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Mín"
                type="number"
                step="0.1"
                value={filters.returns_12m_min || ''}
                onChange={(e) => updateRangeFilter('returns_12m', e.target.value, 'min')}
              />
              <Input
                placeholder="Máx"
                type="number"
                step="0.1"
                value={filters.returns_12m_max || ''}
                onChange={(e) => updateRangeFilter('returns_12m', e.target.value, 'max')}
              />
            </div>
          </div>

          {/* Volatilidade */}
          <div className="space-y-2">
            <Label>Volatilidade 12M (%)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Mín"
                type="number"
                step="0.1"
                value={filters.volatility_min || ''}
                onChange={(e) => updateRangeFilter('volatility', e.target.value, 'min')}
              />
              <Input
                placeholder="Máx"
                type="number"
                step="0.1"
                value={filters.volatility_max || ''}
                onChange={(e) => updateRangeFilter('volatility', e.target.value, 'max')}
              />
            </div>
          </div>

          {/* Qualidade dos Dados */}
          <div className="flex items-center space-x-2">
            <Switch
              id="only_complete"
              checked={filters.only_complete}
              onCheckedChange={(checked) => updateFilter('only_complete', checked)}
            />
            <Label htmlFor="only_complete" className="text-sm">
              Apenas dados completos
            </Label>
          </div>
        </div>
      </div>

      {/* Filtros Ativos */}
      {activeCount > 0 && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-700">Filtros Aplicados:</h5>
            <Button variant="ghost" size="sm" onClick={onClear}>
              Limpar Todos
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.sector && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Setor: {filters.sector}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('sector', '')} />
              </Badge>
            )}
            
            {filters.industry && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Indústria: {filters.industry}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('industry', '')} />
              </Badge>
            )}
            
            {filters.size_category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tamanho: {filters.size_category}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('size_category', '')} />
              </Badge>
            )}
            
            {(filters.market_cap_min || filters.market_cap_max) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Market Cap: {filters.market_cap_min || 0}B - {filters.market_cap_max || '∞'}B
                <X className="w-3 h-3 cursor-pointer" onClick={() => {
                  updateFilter('market_cap_min', null);
                  updateFilter('market_cap_max', null);
                }} />
              </Badge>
            )}
            
            {(filters.pe_ratio_min || filters.pe_ratio_max) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                P/E: {filters.pe_ratio_min || 0} - {filters.pe_ratio_max || '∞'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => {
                  updateFilter('pe_ratio_min', null);
                  updateFilter('pe_ratio_max', null);
                }} />
              </Badge>
            )}
            
            {filters.only_complete && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Dados Completos
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('only_complete', false)} />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





