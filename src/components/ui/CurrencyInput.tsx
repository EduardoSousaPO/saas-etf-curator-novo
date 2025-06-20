"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, RefreshCw, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { currencyService } from '@/lib/currency';
import { debounce } from 'lodash';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number, currency: 'BRL' | 'USD') => void;
  label?: string;
  placeholder?: string;
  className?: string;
  showConverter?: boolean;
}

export default function CurrencyInput({
  value,
  onChange,
  label = "Valor",
  placeholder = "0,00",
  className = "",
  showConverter = true
}: CurrencyInputProps) {
  const [currency, setCurrency] = useState<'BRL' | 'USD'>('BRL');
  const [convertedValue, setConvertedValue] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(5.50);
  const [currencyInfo, setCurrencyInfo] = useState({
    variation: '0.00',
    pctChange: '0.00',
    lastUpdate: ''
  });
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Debounced function para conversão
  const debouncedConvert = useCallback(
    debounce(async (amount: number, fromCurrency: 'BRL' | 'USD') => {
      if (amount === 0) {
        setConvertedValue(0);
        return;
      }

      try {
        setLoading(true);
        let converted: number;
        
        if (fromCurrency === 'BRL') {
          converted = await currencyService.convertBRLToUSD(amount);
        } else {
          converted = await currencyService.convertUSDToBRL(amount);
        }
        
        setConvertedValue(converted);
      } catch (error) {
        console.error('Erro na conversão:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Carregar informações da moeda
  const loadCurrencyInfo = async () => {
    try {
      const info = await currencyService.getCurrencyInfo();
      setExchangeRate(info.rate);
      setCurrencyInfo({
        variation: info.variation,
        pctChange: info.pctChange,
        lastUpdate: info.lastUpdate
      });
    } catch (error) {
      console.error('Erro ao carregar informações da moeda:', error);
    }
  };

  useEffect(() => {
    loadCurrencyInfo();
  }, []);

  useEffect(() => {
    if (showConverter && value > 0) {
      debouncedConvert(value, currency);
    } else {
      setConvertedValue(0);
    }
  }, [value, currency, debouncedConvert, showConverter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
    const numValue = parseFloat(inputValue) || 0;
    onChange(numValue, currency);
  };

  const toggleCurrency = () => {
    const newCurrency = currency === 'BRL' ? 'USD' : 'BRL';
    setCurrency(newCurrency);
    
    // Se houver valor convertido, usar ele como novo valor principal
    if (convertedValue > 0) {
      onChange(convertedValue, newCurrency);
    }
  };

  const formatInputValue = (val: number): string => {
    if (val === 0) return '';
    return val.toFixed(2).replace('.', ',');
  };

  const getCurrencySymbol = (curr: 'BRL' | 'USD'): string => {
    return curr === 'BRL' ? 'R$' : 'US$';
  };

  const getVariationColor = (variation: string): string => {
    const num = parseFloat(variation);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (variation: string) => {
    const num = parseFloat(variation);
    if (num > 0) return <TrendingUp className="w-3 h-3" />;
    if (num < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Input Principal */}
      <div className="relative">
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {getCurrencySymbol(currency)}
          </span>
          <input
            type="text"
            value={formatInputValue(value)}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {showConverter && (
            <button
              onClick={toggleCurrency}
              className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
              title={`Converter para ${currency === 'BRL' ? 'USD' : 'BRL'}`}
            >
              <ArrowRightLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Conversão e Informações */}
      {showConverter && (
        <div className="space-y-2">
          {/* Valor Convertido */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Equivale a:
              </span>
              {loading && <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />}
            </div>
            <div className="font-medium text-gray-900">
              {currencyService.formatCurrency(
                convertedValue, 
                currency === 'BRL' ? 'USD' : 'BRL'
              )}
            </div>
          </div>

          {/* Informações do Câmbio */}
          <div className="relative">
            <div 
              className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer"
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-blue-800">
                  USD/BRL: {currencyService.formatNumber(exchangeRate)}
                </span>
                <div className={`flex items-center space-x-1 ${getVariationColor(currencyInfo.variation)}`}>
                  {getVariationIcon(currencyInfo.variation)}
                  <span className="text-xs font-medium">
                    {currencyInfo.pctChange}%
                  </span>
                </div>
              </div>
              <Info className="w-4 h-4 text-blue-600" />
            </div>

            {/* Tooltip com Informações Detalhadas */}
            {showTooltip && (
              <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa atual:</span>
                    <span className="font-medium">R$ {currencyService.formatNumber(exchangeRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variação:</span>
                    <span className={`font-medium ${getVariationColor(currencyInfo.variation)}`}>
                      R$ {currencyInfo.variation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última atualização:</span>
                    <span className="font-medium">{currencyInfo.lastUpdate}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-500 text-xs">
                      💡 Os ETFs são negociados em dólares americanos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 