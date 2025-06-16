"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Download, Maximize2, Settings, Info } from 'lucide-react';

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
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
];

const PERIOD_LABELS = {
  '1m': '1 Mês',
  '3m': '3 Meses',
  '6m': '6 Meses',
  '1y': '1 Ano',
  '2y': '2 Anos'
};

export default function PerformanceChart({ etfs, period = '1y' }: PerformanceChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    const dateMap = new Map<string, ChartData>();

    // Verificar se data é um objeto válido
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Dados inválidos recebidos:', data);
      return [];
    }

    // Processar dados de cada ETF
    Object.entries(data).forEach(([symbol, symbolData]) => {
      let prices;
      if (Array.isArray(symbolData)) {
        prices = symbolData;
      } else if (symbolData && typeof symbolData === 'object' && symbolData.prices) {
        prices = symbolData.prices;
      } else {
        console.warn(`⚠️ Formato inesperado para ${symbol}:`, symbolData);
        return;
      }
      
      if (!prices || !Array.isArray(prices) || prices.length === 0) {
        console.warn(`⚠️ Dados inválidos para ${symbol}:`, { symbolData, prices });
        return;
      }

      // Calcular performance normalizada (base 100)
      const basePrice = prices[0]?.close || 100;

      prices.forEach((price, index) => {
        if (!price || typeof price.close !== 'number' || !price.date) {
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

    return result;
  };

  // Formatador customizado para tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">
            {new Date(label).toLocaleDateString('pt-BR', { 
              year: 'numeric',
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.dataKey}</span>
              </div>
              <span className={`text-sm font-bold ${
                entry.value >= 100 ? 'text-green-600' : 'text-red-600'
              }`}>
                {entry.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
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

  // Calcular estatísticas de performance
  const getPerformanceStats = () => {
    if (chartData.length === 0) return {};
    
    const stats: Record<string, any> = {};
    
    etfs.forEach(etf => {
      const values = chartData
        .map(d => d[etf.symbol] as number)
        .filter(v => v !== undefined);
      
      if (values.length > 0) {
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const totalReturn = ((lastValue - firstValue) / firstValue) * 100;
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const maxDrawdown = ((minValue - maxValue) / maxValue) * 100;
        
        stats[etf.symbol] = {
          totalReturn: totalReturn.toFixed(2),
          maxDrawdown: maxDrawdown.toFixed(2),
          maxValue: maxValue.toFixed(2),
          minValue: minValue.toFixed(2)
        };
      }
    });
    
    return stats;
  };

  const performanceStats = getPerformanceStats();

  // Exportar dados
  const exportData = () => {
    const csvContent = [
      ['Data', ...etfs.map(etf => etf.symbol)].join(','),
      ...chartData.map(row => [
        row.date,
        ...etfs.map(etf => row[etf.symbol] || '')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etf-comparison-${selectedPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
    <div className={`bg-white rounded-lg border border-gray-200 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Histórica</h3>
          <div className="ml-2 group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Performance normalizada com base 100 no início do período
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Seletor de período */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          
          {/* Controles */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-md text-sm ${showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Toggle Grid"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={exportData}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
            title="Exportar dados"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
            title="Tela cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Estatísticas de Performance */}
      {Object.keys(performanceStats).length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {etfs.map((etf, index) => {
              const stats = performanceStats[etf.symbol];
              if (!stats) return null;
              
              return (
                <div key={etf.symbol} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-900">{etf.symbol}</span>
                  </div>
                  <div className={`text-lg font-bold ${
                    parseFloat(stats.totalReturn) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.totalReturn > 0 ? '+' : ''}{stats.totalReturn}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Max DD: {stats.maxDrawdown}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className={`p-6 ${isFullscreen ? 'h-full' : ''}`}>
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando dados históricos...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-2">❌ {error}</div>
              <button
                onClick={loadHistoricalData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {!loading && !error && chartData.length > 0 && (
          <div className={isFullscreen ? 'h-full' : 'h-96'}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
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
                <Tooltip content={<CustomTooltip />} />
                {showLegend && (
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                )}
                <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="2 2" />
                
                {etfs.map((etf, index) => (
                  <Line
                    key={etf.symbol}
                    type="monotone"
                    dataKey={etf.symbol}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && !error && chartData.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>Nenhum dado histórico disponível para o período selecionado</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer com informações */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        * Performance normalizada com base 100 no início do período selecionado
      </div>
    </div>
  );
} 