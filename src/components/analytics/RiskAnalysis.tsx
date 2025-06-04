"use client";

import { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Target,
  Activity,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercentage } from "@/lib/utils";

interface RiskMetrics {
  symbol: string;
  name: string;
  volatility_12m: number;
  volatility_24m: number;
  volatility_36m: number;
  max_drawdown: number;
  sharpe_12m: number;
  beta?: number;
  risk_score: number;
}

interface RiskData {
  high_risk_etfs: RiskMetrics[];
  low_risk_etfs: RiskMetrics[];
  volatile_etfs: RiskMetrics[];
  stable_etfs: RiskMetrics[];
  portfolio_risk: {
    avg_volatility: number;
    avg_sharpe: number;
    risk_level: string;
    diversification_score: number;
  };
}

interface RiskAnalysisWidgetProps {
  metrics: RiskMetrics;
  isLoading?: boolean;
}

function getRiskLevel(score: number): {
  level: 'Baixo' | 'Moderado' | 'Alto';
  color: string;
  icon: typeof Shield | typeof AlertTriangle;
} {
  if (score <= 30) {
    return { level: 'Baixo', color: 'text-green-600', icon: Shield };
  } else if (score <= 70) {
    return { level: 'Moderado', color: 'text-yellow-600', icon: Shield };
  } else {
    return { level: 'Alto', color: 'text-red-600', icon: AlertTriangle };
  }
}

// Widget de análise de risco individual
export function RiskAnalysisWidget({ metrics, isLoading = false }: RiskAnalysisWidgetProps) {
  const riskLevel = getRiskLevel(metrics.risk_score);
  const Icon = riskLevel.icon;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-3 rounded-full ${riskLevel.color} bg-opacity-10`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Análise de Risco</h2>
          <p className={`text-sm ${riskLevel.color}`}>
            Nível de Risco: {riskLevel.level}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Score de Risco</span>
            <span className="text-sm font-medium">{metrics.risk_score}/100</span>
          </div>
          <Progress value={metrics.risk_score} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={BarChart2}
            title="Volatilidade"
            value={metrics.volatility_12m}
            description="Variação média dos retornos"
          />
          <MetricCard
            icon={TrendingUp}
            title="Drawdown Máximo"
            value={metrics.max_drawdown}
            description="Maior queda histórica"
            isNegative
          />
          <MetricCard
            icon={Shield}
            title="Índice Sharpe"
            value={metrics.sharpe_12m}
            description="Retorno ajustado ao risco"
          />
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Recomendações de Gestão de Risco
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Mantenha uma carteira diversificada</li>
            <li>• Monitore regularmente a volatilidade</li>
            <li>• Estabeleça stop loss para proteção</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

interface MetricCardProps {
  icon: typeof BarChart2;
  title: string;
  value: number;
  description: string;
  isNegative?: boolean;
}

function MetricCard({ icon: Icon, title, value, description, isNegative }: MetricCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <div className={`text-lg font-semibold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
        {formatPercentage(value)}
      </div>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

// Componente principal de análise de risco
export default function RiskAnalysis() {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedETFs, setSelectedETFs] = useState<string[]>(['SPY', 'QQQ', 'VTI']);

  useEffect(() => {
    loadRiskAnalysis();
  }, [selectedETFs]);

  const loadRiskAnalysis = async () => {
    setLoading(true);
    try {
      const symbols = selectedETFs.join(',');
      const response = await fetch(`/api/analytics/correlations?type=risk_analysis&symbols=${symbols}`);
      
      if (response.ok) {
        const data = await response.json();
        setRiskData(data);
      } else {
        toast.error('Erro ao carregar análise de risco');
      }
    } catch (error) {
      console.error('Erro ao carregar análise de risco:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const getRiskColor = (riskScore: number): string => {
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-600';
    if (riskScore >= 40) return 'text-yellow-600';
    if (riskScore >= 20) return 'text-blue-600';
    return 'text-green-600';
  };

  const getRiskBadge = (volatility: number): { label: string; color: string } => {
    const vol = volatility * 100;
    if (vol < 10) return { label: 'Baixo', color: 'bg-green-100 text-green-800' };
    if (vol < 20) return { label: 'Moderado', color: 'bg-yellow-100 text-yellow-800' };
    if (vol < 30) return { label: 'Alto', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Muito Alto', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ETF Selector */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          ETFs para Análise
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedETFs.map((symbol, index) => (
            <span 
              key={symbol}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {symbol}
              <button
                onClick={() => setSelectedETFs(prev => prev.filter(s => s !== symbol))}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Adicionar ETF (ex: SPY)"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim().toUpperCase();
                if (value && !selectedETFs.includes(value)) {
                  setSelectedETFs(prev => [...prev, value]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <button
            onClick={loadRiskAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Analisar
          </button>
        </div>
      </div>

      {/* Risk Overview */}
      {riskData?.portfolio_risk && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Volatilidade Média</h3>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatPercentage(riskData.portfolio_risk.avg_volatility)}
            </div>
            <div className="text-sm text-red-700">
              Risco: {riskData.portfolio_risk.risk_level}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Sharpe Médio</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {riskData.portfolio_risk.avg_sharpe.toFixed(2)}
            </div>
            <div className="text-sm text-blue-700">
              Risco/Retorno
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Diversificação</h3>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {riskData.portfolio_risk.diversification_score.toFixed(0)}/100
            </div>
            <div className="text-sm text-green-700">
              Score
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">ETFs Analisados</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {selectedETFs.length}
            </div>
            <div className="text-sm text-purple-700">
              Total
            </div>
          </div>
        </div>
      )}

      {/* Risk Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk ETFs */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              ETFs de Alto Risco
            </h3>
            <p className="text-sm text-red-700 mt-1">Maior volatilidade e risco</p>
          </div>
          
          <div className="p-6">
            {riskData?.high_risk_etfs?.slice(0, 5).map((etf, index) => {
              const riskBadge = getRiskBadge(etf.volatility_12m);
              return (
                <div key={etf.symbol} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold text-red-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{etf.symbol}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]">{etf.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {formatPercentage(etf.volatility_12m)}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskBadge.color}`}>
                      {riskBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Risk ETFs */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-semibold text-green-900 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              ETFs de Baixo Risco
            </h3>
            <p className="text-sm text-green-700 mt-1">Menor volatilidade e risco</p>
          </div>
          
          <div className="p-6">
            {riskData?.low_risk_etfs?.slice(0, 5).map((etf, index) => {
              const riskBadge = getRiskBadge(etf.volatility_12m);
              return (
                <div key={etf.symbol} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{etf.symbol}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]">{etf.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {formatPercentage(etf.volatility_12m)}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskBadge.color}`}>
                      {riskBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Insights */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">📊 Insights de Risco</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="mb-2">
              <strong>⚠️ Gestão de Risco:</strong> Diversifique entre ETFs de diferentes volatilidades
            </p>
            <p className="mb-2">
              <strong>📈 Sharpe Ratio:</strong> Procure ETFs com ratio &gt; 1.0 para melhor risco/retorno
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>🛡️ Proteção:</strong> Mantenha pelo menos 30% em ETFs de baixo risco
            </p>
            <p>
              <strong>🎯 Rebalanceamento:</strong> Revise seu portfolio mensalmente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 