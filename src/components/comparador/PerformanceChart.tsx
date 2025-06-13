"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface ETF {
  symbol: string;
  name?: string | null;
}

interface PriceData {
  date: string;
  close: number;
  symbol: string;
}

interface ChartData {
  date: string;
  [key: string]: string | number; // Para permitir dados dinâmicos por símbolo
}

interface PerformanceChartProps {
  etfs: ETF[];
  period?: '1m' | '3m' | '6m' | '1y' | '2y';
}

// Cores para as linhas dos ETFs
const CHART_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
];

export default function PerformanceChart({ etfs, period = '1y' }: PerformanceChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Carregar dados históricos
  useEffect(() => {
    if (etfs.length === 0) {
      setChartData([]);
      return;
    }

    loadHistoricalData();
  }, [etfs, selectedPeriod]);

  const loadHistoricalData = async () => {
    setLoading(true);
    setError(null);

    try {
      const symbols = etfs.map(etf => etf.symbol).join(',');
      console.log('🔍 Carregando dados históricos para:', symbols);
      
      const response = await fetch(`/api/etfs/historical?symbols=${symbols}&period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar dados históricos');
      }

      const data = await response.json();
      console.log('📊 Dados recebidos da API:', data);
      
      // Processar dados para o formato do gráfico
      const processedData = processHistoricalData(data.data || {});
      console.log('📈 Dados processados para o gráfico:', processedData);
      
      setChartData(processedData);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados históricos:', error);
      setError('Erro ao carregar dados históricos');
    } finally {
      setLoading(false);
    }
  };

  // Processar dados históricos para formato do gráfico
  const processHistoricalData = (data: Record<string, any>): ChartData[] => {
    console.log('🔧 Processando dados históricos:', data);
    console.log('🔧 Tipo de data:', typeof data);
    console.log('🔧 É array?', Array.isArray(data));
    console.log('🔧 Keys de data:', Object.keys(data || {}));
    
    const dateMap = new Map<string, ChartData>();

    // Verificar se data é um objeto válido
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Dados inválidos recebidos:', data);
      return [];
    }

    // Processar dados de cada ETF
    Object.entries(data).forEach(([symbol, symbolData]) => {
      console.log(`📊 Processando ${symbol}:`, symbolData);
      console.log(`📊 Tipo de symbolData para ${symbol}:`, typeof symbolData);
      console.log(`📊 É array symbolData?`, Array.isArray(symbolData));
      console.log(`📊 Keys de symbolData:`, Object.keys(symbolData || {}));
      
      // VERIFICAÇÃO CRÍTICA: Se symbolData é um array, usar diretamente
      let prices;
      if (Array.isArray(symbolData)) {
        console.log(`🔄 ${symbol}: symbolData é array direto, usando como prices`);
        prices = symbolData;
      } else if (symbolData && typeof symbolData === 'object' && symbolData.prices) {
        console.log(`🔄 ${symbol}: symbolData é objeto, usando symbolData.prices`);
        prices = symbolData.prices;
      } else {
        console.warn(`⚠️ Formato inesperado para ${symbol}:`, symbolData);
        return;
      }
      
      console.log(`📊 Prices para ${symbol}:`, prices);
      console.log(`📊 Tipo de prices:`, typeof prices);
      console.log(`📊 É array prices?`, Array.isArray(prices));
      
      if (!prices || !Array.isArray(prices) || prices.length === 0) {
        console.warn(`⚠️ Dados inválidos para ${symbol}:`, { symbolData, prices });
        return;
      }

      console.log(`✅ ${symbol} tem ${prices.length} pontos de preço`);

      // Calcular performance normalizada (base 100)
      const basePrice = prices[0]?.close || 100;
      console.log(`📈 Preço base para ${symbol}: ${basePrice}`);

      prices.forEach((price, index) => {
        if (!price || typeof price.close !== 'number' || !price.date) {
          console.warn(`⚠️ Ponto de dados inválido para ${symbol} no índice ${index}:`, price);
          return; // Pular dados inválidos
        }

        const date = price.date;
        const normalizedValue = ((price.close / basePrice) * 100);

        if (!dateMap.has(date)) {
          dateMap.set(date, { date });
        }

        const existing = dateMap.get(date)!;
        existing[symbol] = normalizedValue;
      });
    });

    // Converter para array e ordenar por data
    const result = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    console.log(`📊 Resultado final: ${result.length} pontos de dados`);
    return result;
  };

  // Formatador para tooltip
  const formatTooltip = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(2)}%`, name];
    }
    return [value, name];
  };

  // Formatador para eixo Y
  const formatYAxis = (value: number) => `${value.toFixed(0)}%`;

  // Formatador para eixo X
  const formatXAxis = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (etfs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Histórica</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          Selecione ETFs para visualizar a performance histórica
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Histórica</h3>
        </div>
        
        {/* Seletor de período */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">1 Mês</option>
            <option value="3m">3 Meses</option>
            <option value="6m">6 Meses</option>
            <option value="1y">1 Ano</option>
            <option value="2y">2 Anos</option>
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando dados...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-600">
            <span>{error}</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <span>Nenhum dado histórico disponível</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString('pt-BR')}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              
              {/* Linhas para cada ETF */}
              {etfs.map((etf, index) => (
                <Line
                  key={etf.symbol}
                  type="monotone"
                  dataKey={etf.symbol}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={etf.symbol}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legenda adicional */}
      {chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            * Performance normalizada com base 100 no início do período selecionado
          </p>
        </div>
      )}
    </div>
  );
} 