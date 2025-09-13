'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Info, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Building2,
  Sparkles,
  Crown,
  Gem,
  Rocket
} from 'lucide-react';
import ScreenerDesignSystem from './ScreenerDesignSystem';

interface InteractiveFiltersProps {
  type: 'etf' | 'stock';
  filters: any;
  onFiltersChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
  activeCount: number;
}

interface SliderProps {
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  tooltip?: string;
}

const RangeSlider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  format = (v) => v.toString(),
  tooltip 
}) => {
  const [minVal, maxVal] = value;
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxVal - step);
    onChange([newMin, maxVal]);
  };
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minVal + step);
    onChange([minVal, newMax]);
  };

  return (
    <div className="space-y-3">
      <div className={ScreenerDesignSystem.components.filter.label}>
        <span>{label}</span>
        {tooltip && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-gray-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={minVal}
              onChange={handleMinChange}
              className={ScreenerDesignSystem.components.filter.slider}
              style={{
                background: `linear-gradient(to right, #e5e7eb 0%, #0090d8 ${((minVal - min) / (max - min)) * 100}%, #e5e7eb ${((minVal - min) / (max - min)) * 100}%)`
              }}
            />
          </div>
          <div className="flex-1">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={maxVal}
              onChange={handleMaxChange}
              className={ScreenerDesignSystem.components.filter.slider}
              style={{
                background: `linear-gradient(to right, #e5e7eb 0%, #0090d8 ${((maxVal - min) / (max - min)) * 100}%, #e5e7eb ${((maxVal - min) / (max - min)) * 100}%)`
              }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="bg-gray-100 px-3 py-1 rounded-lg font-medium text-[#202636]">
            {format(minVal)}
          </div>
          <span className="text-gray-400">até</span>
          <div className="bg-gray-100 px-3 py-1 rounded-lg font-medium text-[#202636]">
            {format(maxVal)}
          </div>
        </div>
      </div>
    </div>
  );
};

const PresetButton: React.FC<{
  preset: any;
  active: boolean;
  onClick: () => void;
}> = ({ preset, active, onClick }) => (
  <button
    onClick={onClick}
    className={`${ScreenerDesignSystem.components.filter.preset} ${
      active ? 'bg-[#0090d8] text-white' : ''
    }`}
  >
    <span className="text-lg">{preset.icon}</span>
    <div className="text-left">
      <div className="font-medium">{preset.name}</div>
      <div className="text-xs opacity-80">{preset.description}</div>
    </div>
  </button>
);

export const InteractiveFilters: React.FC<InteractiveFiltersProps> = ({
  type,
  filters,
  onFiltersChange,
  onApply,
  onClear,
  activeCount
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presets = ScreenerDesignSystem.presets[type];

  const handlePresetClick = (preset: any) => {
    setActivePreset(preset.id);
    onFiltersChange({ ...filters, ...preset.filters });
    onApply();
  };

  const handleSliderChange = (field: string, value: [number, number]) => {
    const [min, max] = value;
    onFiltersChange({
      ...filters,
      [`${field}_min`]: min === 0 ? null : min,
      [`${field}_max`]: max === (field === 'marketCap' ? 10000000000000 : 100) ? null : max
    });
  };

  return (
    <div className="space-y-6">
      {/* Presets Rápidos */}
      <Card className={ScreenerDesignSystem.components.card.base}>
        <CardHeader className={ScreenerDesignSystem.components.card.header}>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0090d8]" />
            Filtros Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className={ScreenerDesignSystem.components.card.content}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <PresetButton
                key={preset.id}
                preset={preset}
                active={activePreset === preset.id}
                onClick={() => handlePresetClick(preset)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Busca Principal */}
      <Card className={ScreenerDesignSystem.components.card.base}>
        <CardContent className={ScreenerDesignSystem.components.card.content}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={type === 'etf' ? 'Buscar ETFs (ex: SPY, QQQ)...' : 'Buscar ações (ex: AAPL, TSLA)...'}
                value={filters.searchTerm || filters.search_term || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  [type === 'etf' ? 'searchTerm' : 'search_term']: e.target.value 
                })}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros Avançados
              {activeCount > 0 && (
                <Badge className="bg-[#0090d8] text-white ml-1">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados com Sliders */}
      {showAdvanced && (
        <Card className={ScreenerDesignSystem.components.card.base}>
          <CardHeader className={ScreenerDesignSystem.components.card.header}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0090d8]" />
                Filtros Avançados
              </div>
              <Button
                onClick={onClear}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className={ScreenerDesignSystem.components.card.content}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Filtros Financeiros */}
              <div className="space-y-6">
                <h4 className="font-medium text-[#202636] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Métricas Financeiras
                </h4>
                
                {type === 'etf' ? (
                  <>
                    <RangeSlider
                      label="Patrimônio (AUM)"
                      value={[filters.minAUM || 0, filters.maxAUM || 10000]}
                      onChange={(value) => handleSliderChange('AUM', value)}
                      min={0}
                      max={10000}
                      step={50}
                      format={(v) => v < 1000 ? `$${v}M` : `$${(v/1000).toFixed(1)}B`}
                      tooltip="Patrimônio sob gestão - maior = mais liquidez"
                    />
                    
                    <RangeSlider
                      label="Taxa de Administração"
                      value={[filters.minExpenseRatio || 0, filters.maxExpenseRatio || 2]}
                      onChange={(value) => handleSliderChange('expenseRatio', value)}
                      min={0}
                      max={2}
                      step={0.1}
                      format={(v) => `${v.toFixed(1)}%`}
                      tooltip="Custo anual do ETF - menor = mais retorno líquido"
                    />
                  </>
                ) : (
                  <>
                    <RangeSlider
                      label="Market Cap"
                      value={[filters.market_cap_min || 0, filters.market_cap_max || 10000000000000]}
                      onChange={(value) => handleSliderChange('market_cap', value)}
                      min={0}
                      max={10000000000000}
                      step={1000000000}
                      format={(v) => ScreenerDesignSystem.formatters.marketCap(v)}
                      tooltip="Valor de mercado da empresa"
                    />
                    
                    <RangeSlider
                      label="P/E Ratio"
                      value={[filters.pe_ratio_min || 0, filters.pe_ratio_max || 100]}
                      onChange={(value) => handleSliderChange('pe_ratio', value)}
                      min={0}
                      max={100}
                      step={1}
                      format={(v) => `${v.toFixed(1)}x`}
                      tooltip="Preço/Lucro - menor pode indicar subvalorização"
                    />
                  </>
                )}
              </div>

              {/* Filtros de Performance */}
              <div className="space-y-6">
                <h4 className="font-medium text-[#202636] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance
                </h4>
                
                <RangeSlider
                  label="Retorno 12 meses"
                  value={[filters.returns_12m_min || -50, filters.returns_12m_max || 100]}
                  onChange={(value) => handleSliderChange('returns_12m', value)}
                  min={-50}
                  max={100}
                  step={1}
                  format={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                  tooltip="Performance dos últimos 12 meses"
                />
                
                <RangeSlider
                  label="Volatilidade"
                  value={[filters.volatility_min || 0, filters.volatility_max || 50]}
                  onChange={(value) => handleSliderChange('volatility', value)}
                  min={0}
                  max={50}
                  step={1}
                  format={(v) => `${v}%`}
                  tooltip="Medida de risco - menor = mais estável"
                />

                {type === 'stock' && (
                  <RangeSlider
                    label="Dividend Yield"
                    value={[filters.dividend_yield_min || 0, filters.dividend_yield_max || 10]}
                    onChange={(value) => handleSliderChange('dividend_yield', value)}
                    min={0}
                    max={10}
                    step={0.1}
                    format={(v) => `${v.toFixed(1)}%`}
                    tooltip="Rendimento de dividendos anual"
                  />
                )}
              </div>

              {/* Filtros de Qualidade */}
              <div className="space-y-6">
                <h4 className="font-medium text-[#202636] flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Qualidade
                </h4>
                
                {type === 'etf' && (
                  <RangeSlider
                    label="Rating Morningstar"
                    value={[filters.minMorningstarRating || 0, filters.maxMorningstarRating || 5]}
                    onChange={(value) => handleSliderChange('morningstarRating', value)}
                    min={0}
                    max={5}
                    step={1}
                    format={(v) => `${v}★`}
                    tooltip="Avaliação Morningstar - maior = melhor qualidade"
                  />
                )}
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#202636]">
                    Filtros Especiais
                  </Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onlyComplete || filters.only_complete || false}
                        onChange={(e) => onFiltersChange({ 
                          ...filters, 
                          [type === 'etf' ? 'onlyComplete' : 'only_complete']: e.target.checked 
                        })}
                        className="rounded border-gray-300 text-[#0090d8] focus:ring-[#0090d8]"
                      />
                      <span className="text-sm text-gray-700">
                        Apenas com dados completos
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={onApply}
                className={`${ScreenerDesignSystem.components.button.primary} ${ScreenerDesignSystem.components.button.sizes.lg}`}
              >
                <Search className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
              <Button
                onClick={onClear}
                variant="outline"
                className={ScreenerDesignSystem.components.button.sizes.lg}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar Tudo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveFilters;

