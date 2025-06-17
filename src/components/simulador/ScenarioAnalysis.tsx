"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

interface ETFAllocation {
  symbol: string;
  name: string;
  weight: number;
  returns_12m?: number;
  volatility_12m?: number;
}

interface ScenarioAnalysisProps {
  allocations: ETFAllocation[];
  investmentAmount: number;
  selectedScenario: 'conservador' | 'moderado' | 'otimista' | 'pessimista';
  onScenarioChange: (scenario: 'conservador' | 'moderado' | 'otimista' | 'pessimista') => void;
}

interface Scenario {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  multiplier: number;
  volatilityMultiplier: number;
}

export default function ScenarioAnalysis({ 
  allocations, 
  investmentAmount, 
  selectedScenario, 
  onScenarioChange 
}: ScenarioAnalysisProps) {
  
  const scenarios: Record<string, Scenario> = {
    conservador: {
      name: 'Conservador',
      description: 'Cenário de baixo crescimento e estabilidade',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-blue-500',
      multiplier: 0.6,
      volatilityMultiplier: 0.8
    },
    moderado: {
      name: 'Moderado',
      description: 'Cenário base com crescimento normal',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-green-500',
      multiplier: 1.0,
      volatilityMultiplier: 1.0
    },
    otimista: {
      name: 'Otimista',
      description: 'Cenário de alto crescimento econômico',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-500',
      multiplier: 1.4,
      volatilityMultiplier: 1.2
    },
    pessimista: {
      name: 'Pessimista',
      description: 'Cenário de crise e baixo crescimento',
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'bg-red-500',
      multiplier: 0.3,
      volatilityMultiplier: 1.5
    }
  };

  // Calcular métricas do cenário
  const calculateScenarioMetrics = (scenarioKey: string) => {
    const scenario = scenarios[scenarioKey];
    if (!scenario || allocations.length === 0) {
      return {
        expectedReturn: 0,
        volatility: 0,
        projectedValue: investmentAmount,
        projectedReturn: 0
      };
    }

    // Retorno esperado ajustado pelo cenário
    const baseReturn = allocations.reduce((sum, alloc) => {
      const weight = alloc.weight / 100;
      const returns = alloc.returns_12m || 0;
      return sum + (weight * returns);
    }, 0);

    const expectedReturn = baseReturn * scenario.multiplier;

    // Volatilidade ajustada pelo cenário
    const baseVolatility = Math.sqrt(
      allocations.reduce((sum, alloc) => {
        const weight = alloc.weight / 100;
        const vol = alloc.volatility_12m || 0;
        return sum + (weight * weight * vol * vol);
      }, 0)
    );

    const volatility = baseVolatility * scenario.volatilityMultiplier;

    // Projeções
    const projectedReturn = (investmentAmount * expectedReturn) / 100;
    const projectedValue = investmentAmount + projectedReturn;

    return {
      expectedReturn,
      volatility,
      projectedValue,
      projectedReturn
    };
  };

  const formatPercentage = (value: number): string => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    // CORREÇÃO: Os dados já vêm em formato percentual do banco
    return `${Number(value).toFixed(2)}%`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getReturnColor = (value: number): string => {
    if (value >= 15) return 'text-green-600';
    if (value >= 8) return 'text-blue-600';
    if (value >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskAssessment = (volatility: number): { level: string; color: string; icon: React.ReactNode } => {
    if (volatility <= 10) {
      return { level: 'Baixo', color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> };
    } else if (volatility <= 20) {
      return { level: 'Moderado', color: 'text-yellow-600', icon: <Shield className="w-4 h-4" /> };
    } else if (volatility <= 30) {
      return { level: 'Alto', color: 'text-orange-600', icon: <AlertTriangle className="w-4 h-4" /> };
    } else {
      return { level: 'Muito Alto', color: 'text-red-600', icon: <AlertTriangle className="w-4 h-4" /> };
    }
  };

  const currentMetrics = calculateScenarioMetrics(selectedScenario);
  const riskAssessment = getRiskAssessment(currentMetrics.volatility);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-900">Análise de Cenários</h2>
      </div>

      {/* Seletor de Cenários */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(scenarios).map(([key, scenario]) => (
          <button
            key={key}
            onClick={() => onScenarioChange(key as any)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedScenario === key
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <div className={`p-2 rounded-lg ${scenario.color} text-white`}>
                {scenario.icon}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">{scenario.name}</div>
            <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
          </button>
        ))}
      </div>

      {/* Métricas do Cenário Selecionado */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className={`p-2 rounded-lg ${scenarios[selectedScenario].color} text-white mr-3`}>
            {scenarios[selectedScenario].icon}
          </div>
          Cenário {scenarios[selectedScenario].name}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getReturnColor(currentMetrics.expectedReturn)}`}>
              {formatPercentage(currentMetrics.expectedReturn)}
            </div>
            <div className="text-sm text-gray-500">Retorno Esperado</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${riskAssessment.color}`}>
              {formatPercentage(currentMetrics.volatility)}
            </div>
            <div className="text-sm text-gray-500">Volatilidade</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getReturnColor(currentMetrics.expectedReturn)}`}>
              {formatCurrency(currentMetrics.projectedReturn)}
            </div>
            <div className="text-sm text-gray-500">Ganho/Perda</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(currentMetrics.projectedValue)}
            </div>
            <div className="text-sm text-gray-500">Valor Final</div>
          </div>
        </div>
      </div>

      {/* Comparação de Cenários */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Comparação de Cenários</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Cenário</th>
                <th className="text-center py-2 text-gray-600">Retorno</th>
                <th className="text-center py-2 text-gray-600">Risco</th>
                <th className="text-center py-2 text-gray-600">Valor Final</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scenarios).map(([key, scenario]) => {
                const metrics = calculateScenarioMetrics(key);
                const risk = getRiskAssessment(metrics.volatility);
                
                return (
                  <tr 
                    key={key} 
                    className={`border-b border-gray-100 ${
                      selectedScenario === key ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className={`p-1 rounded ${scenario.color} text-white mr-2`}>
                          <div className="w-3 h-3">
                            {scenario.icon}
                          </div>
                        </div>
                        <span className="font-medium">{scenario.name}</span>
                      </div>
                    </td>
                    <td className={`text-center py-3 font-medium ${getReturnColor(metrics.expectedReturn)}`}>
                      {formatPercentage(metrics.expectedReturn)}
                    </td>
                    <td className="text-center py-3">
                      <div className="flex items-center justify-center">
                        <span className={`${risk.color} mr-1`}>{risk.icon}</span>
                        <span className={`font-medium ${risk.color}`}>{risk.level}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 font-medium text-blue-600">
                      {formatCurrency(metrics.projectedValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights do Cenário */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Insights do Cenário {scenarios[selectedScenario].name}</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {selectedScenario === 'conservador' && (
            <>
              <p>• Cenário de baixo crescimento com foco na preservação de capital</p>
              <p>• Retornos menores, mas com menor volatilidade</p>
              <p>• Ideal para investidores com baixa tolerância ao risco</p>
            </>
          )}
          {selectedScenario === 'moderado' && (
            <>
              <p>• Cenário base com crescimento econômico normal</p>
              <p>• Equilíbrio entre risco e retorno</p>
              <p>• Adequado para a maioria dos investidores</p>
            </>
          )}
          {selectedScenario === 'otimista' && (
            <>
              <p>• Cenário de forte crescimento econômico</p>
              <p>• Potencial para retornos elevados</p>
              <p>• Maior volatilidade, adequado para perfis arrojados</p>
            </>
          )}
          {selectedScenario === 'pessimista' && (
            <>
              <p>• Cenário de crise ou recessão econômica</p>
              <p>• Retornos baixos ou negativos</p>
              <p>• Alta volatilidade, teste de resistência da carteira</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 