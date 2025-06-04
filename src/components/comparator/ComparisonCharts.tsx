// src/components/comparator/ComparisonCharts.tsx
"use client";

import { ETF } from "@/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface ComparisonChartsProps {
  etfs: ETF[];
}

// Tipo para o resultado dos dados de desempenho
interface PerformanceDataPoint {
  name: string;
  [key: string]: string | number;
}

// Helper to generate mock historical data for charts
const generateMockPerformanceData = (etfSymbol: string, months: number): PerformanceDataPoint[] => {
  const data: PerformanceDataPoint[] = [];
  let value = 100;
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleString("default", { month: "short" });
    // Simulate some performance variation
    const randomFactor = (Math.random() - 0.45) * 5; // More variation
    value += randomFactor;
    value = Math.max(50, value); // Ensure value doesn't drop too low
    data.push({ name: monthName, [etfSymbol]: parseFloat(value.toFixed(2)) });
  }
  return data;
};

// Combine data for multi-line chart
const combinePerformanceData = (etfs: ETF[]): PerformanceDataPoint[] => {
    if (!etfs || etfs.length === 0) return [];
    const months = 12;
    
    // Gerar dados para cada ETF e filtrar ETFs sem símbolo
    const validEtfs = etfs.filter(etf => etf.symbol);
    if (validEtfs.length === 0) return [];
    
    const individualData: PerformanceDataPoint[][] = validEtfs
      .map(etf => generateMockPerformanceData(etf.symbol as string, months));
    
    if (individualData.length === 0) return [];

    const combined: PerformanceDataPoint[] = [];
    for (let i = 0; i < months; i++) {
        if (!individualData[0] || !individualData[0][i]) continue;
        
        const entry: PerformanceDataPoint = { name: individualData[0][i].name };
        validEtfs.forEach((etf, index) => {
            if (!etf.symbol || !individualData[index] || !individualData[index][i]) return;
            
            const etfSymbol = etf.symbol;
            if (individualData[index][i][etfSymbol] !== undefined) {
                entry[etfSymbol] = individualData[index][i][etfSymbol] as number;
            }
        });
        combined.push(entry);
    }
    return combined;
};

const colors = ["#E82127", "#186FAF", "#4ECDC4", "#A38AFF"]; // Tesla Red, Blue, Green, Lilac

export default function ComparisonCharts({ etfs }: ComparisonChartsProps) {
  if (!etfs || etfs.length === 0) {
    return null; // No ETFs selected, no charts to display
  }

  try {
    const performanceData = combinePerformanceData(etfs);

    const barChartData = etfs
      .filter(etf => etf.symbol)
      .map(etf => ({
        name: etf.symbol,
        "12m Return": (etf.returns_12m || 0) * 100,
        "Dividend Yield": (etf.dividend_yield || 0) * 100,
        "12m Sharpe": etf.sharpe_12m || 0,
      }));

    // For Radar chart, select a few key metrics and normalize if necessary
    const radarChartMetrics = [
      { subject: "12m Return", key: "returns_12m", fullMark: 50, isPercentage: true }, 
      { subject: "Volatility", key: "volatility_12m", fullMark: 40, isPercentage: true }, 
      { subject: "Sharpe Ratio", key: "sharpe_12m", fullMark: 3, isPercentage: false },
      { subject: "Div. Yield", key: "dividend_yield", fullMark: 10, isPercentage: true },
      { subject: "Max Drawdown", key: "max_drawdown", fullMark: -50, isPercentage: true }, 
    ];

    const radarData = radarChartMetrics.map(metric => {
      const entry: Record<string, any> = { subject: metric.subject, fullMark: metric.fullMark };
      etfs.forEach((etf, index) => {
        if (!etf.symbol) return;
        
        let value = etf[metric.key as keyof ETF] as number | undefined | null;
        if (value === undefined || value === null) value = 0;
        
        entry[etf.symbol] = metric.isPercentage ? value * 100 : value;
      });
      return entry;
    });

    if (performanceData.length === 0 || barChartData.length === 0) {
      return (
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Não há dados suficientes para mostrar os gráficos.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Desempenho Simulado (12 Meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" className="dark:text-gray-400" />
              <YAxis className="dark:text-gray-400" />
              <Tooltip 
                contentStyle={{ backgroundColor: "rgba(30, 41, 59, 0.9)", border: "1px solid #374151", borderRadius: "0.5rem"}} 
                labelStyle={{ color: "#e5e7eb" }}
                itemStyle={{ color: "#d1d5db" }}
              />
              <Legend />
              {etfs.filter(etf => etf.symbol).map((etf, index) => (
                <Line 
                  key={etf.symbol} 
                  type="monotone" 
                  dataKey={etf.symbol} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={2} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Comparação de Métricas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" className="dark:text-gray-400" />
              <YAxis className="dark:text-gray-400" />
              <Tooltip 
                contentStyle={{ backgroundColor: "rgba(30, 41, 59, 0.9)", border: "1px solid #374151", borderRadius: "0.5rem"}} 
                labelStyle={{ color: "#e5e7eb" }}
                itemStyle={{ color: "#d1d5db" }}
              />
              <Legend />
              <Bar dataKey="12m Return" fill={colors[0]} />
              <Bar dataKey="Dividend Yield" fill={colors[1]} />
              <Bar dataKey="12m Sharpe" fill={colors[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {etfs.filter(etf => etf.symbol).length > 0 && etfs.filter(etf => etf.symbol).length <= 4 && (
          <div className="lg:col-span-2 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Análise de Radar</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid className="dark:stroke-gray-700" />
                <PolarAngleAxis dataKey="subject" className="dark:text-gray-400" />
                <PolarRadiusAxis angle={30} domain={[
                    Math.min(...radarData.map(d => d.fullMark < 0 ? d.fullMark : 0)), 
                    Math.max(...radarData.map(d => d.fullMark > 0 ? d.fullMark : 0))
                  ]} className="dark:text-gray-400"/>
                {etfs.filter(etf => etf.symbol).map((etf, index) => (
                  <Radar 
                    key={etf.symbol} 
                    name={etf.symbol} 
                    dataKey={etf.symbol} 
                    stroke={colors[index % colors.length]} 
                    fill={colors[index % colors.length]} 
                    fillOpacity={0.6} 
                  />
                ))}
                <Legend />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(30, 41, 59, 0.9)", border: "1px solid #374151", borderRadius: "0.5rem"}} 
                  labelStyle={{ color: "#e5e7eb" }}
                  itemStyle={{ color: "#d1d5db" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Erro ao renderizar gráficos:", error);
    return (
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
        <p className="text-center text-red-500">
          Erro ao renderizar os gráficos. Verifique o console para mais detalhes.
        </p>
      </div>
    );
  }
}

