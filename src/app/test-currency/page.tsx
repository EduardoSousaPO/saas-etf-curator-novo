"use client";

import React, { useState, useEffect } from 'react';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { currencyService } from '@/lib/currency';
import { 
  ArrowRightLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Globe,
  Calculator,
  RefreshCw
} from 'lucide-react';

export default function TestCurrencyPage() {
  const [amount1, setAmount1] = useState<number>(1000);
  const [currency1, setCurrency1] = useState<'BRL' | 'USD'>('BRL');
  const [amount2, setAmount2] = useState<number>(5000);
  const [currency2, setCurrency2] = useState<'BRL' | 'USD'>('BRL');
  const [exchangeInfo, setExchangeInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExchangeInfo();
  }, []);

  const loadExchangeInfo = async () => {
    setLoading(true);
    try {
      const info = await currencyService.getCurrencyInfo();
      setExchangeInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVariationColor = (variation: string): string => {
    const num = parseFloat(variation);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (variation: string) => {
    const num = parseFloat(variation);
    if (num > 0) return <TrendingUp className="w-4 h-4" />;
    if (num < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🇧🇷 Conversor Inteligente BRL ↔ USD
          </h1>
          <p className="text-xl text-gray-600">
            Desenvolvido especialmente para brasileiros que investem em ETFs americanos
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
            <Globe className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Cotação em tempo real via AwesomeAPI
            </span>
          </div>
        </div>

        {/* Informações do Câmbio */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600" />
              Câmbio USD/BRL Atual
            </h2>
            <button
              onClick={loadExchangeInfo}
              disabled={loading}
              className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {exchangeInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  R$ {currencyService.formatNumber(exchangeInfo.rate)}
                </div>
                <div className="text-sm text-gray-600">Taxa de Compra</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold flex items-center justify-center ${getVariationColor(exchangeInfo.variation)}`}>
                  {getVariationIcon(exchangeInfo.variation)}
                  <span className="ml-1">R$ {exchangeInfo.variation}</span>
                </div>
                <div className="text-sm text-gray-600">Variação</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getVariationColor(exchangeInfo.variation)}`}>
                  {exchangeInfo.pctChange}%
                </div>
                <div className="text-sm text-gray-600">Variação %</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">
                  {exchangeInfo.lastUpdate}
                </div>
                <div className="text-sm text-gray-600">Última Atualização</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando informações do câmbio...</p>
            </div>
          )}
        </div>

        {/* Demonstração dos Conversores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Conversor 1 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-purple-600" />
              Aporte Mensal
            </h3>
            <CurrencyInput
              label="Quanto você investe por mês?"
              value={amount1}
              onChange={(value, currency) => {
                setAmount1(value);
                setCurrency1(currency);
              }}
              placeholder="1.000,00"
              showConverter={true}
            />
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                💡 <strong>Dica:</strong> Clique no botão de conversão para alternar entre BRL e USD
              </p>
            </div>
          </div>

          {/* Conversor 2 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-green-600" />
              Meta Financeira
            </h3>
            <CurrencyInput
              label="Qual sua meta de patrimônio?"
              value={amount2}
              onChange={(value, currency) => {
                setAmount2(value);
                setCurrency2(currency);
              }}
              placeholder="1.000.000,00"
              showConverter={true}
            />
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                💡 <strong>Dica:</strong> A conversão é feita automaticamente com a cotação atual
              </p>
            </div>
          </div>
        </div>

        {/* Exemplos de Conversão */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <ArrowRightLeft className="w-5 h-5 mr-2 text-orange-600" />
            Exemplos de Conversão
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">🇺🇸 De USD para BRL</h4>
              {[100, 500, 1000, 5000].map(usd => (
                <div key={usd} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">
                    ${currencyService.formatNumber(usd)} USD
                  </span>
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {exchangeInfo ? 
                      currencyService.formatCurrency(usd * exchangeInfo.rate, 'BRL') : 
                      'Carregando...'
                    }
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">🇧🇷 De BRL para USD</h4>
              {[500, 1000, 5000, 10000].map(brl => (
                <div key={brl} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-900">
                    {currencyService.formatCurrency(brl, 'BRL')}
                  </span>
                  <ArrowRightLeft className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    {exchangeInfo ? 
                      currencyService.formatCurrency(brl / exchangeInfo.rate, 'USD') : 
                      'Carregando...'
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">
            📚 Por que isso é importante para investidores brasileiros?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">💰 ETFs são em Dólares</h4>
              <p className="text-blue-100 text-sm">
                Todos os ETFs americanos são negociados em USD. Você precisa saber quanto está investindo em dólares.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📈 Impacto Cambial</h4>
              <p className="text-blue-100 text-sm">
                A variação do câmbio afeta diretamente o valor dos seus investimentos em reais.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Planejamento Preciso</h4>
              <p className="text-blue-100 text-sm">
                Com conversão em tempo real, você pode planejar seus aportes de forma mais inteligente.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Atualização Automática</h4>
              <p className="text-blue-100 text-sm">
                As cotações são atualizadas automaticamente, sem necessidade de verificar manualmente.
              </p>
            </div>
          </div>
        </div>

        {/* Botão para voltar */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
} 