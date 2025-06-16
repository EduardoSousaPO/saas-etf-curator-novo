"use client";

import React from 'react';
import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';

interface RiskIndicatorProps {
  volatility: number;
  sharpeRatio: number;
  expectedReturn: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export default function RiskIndicator({
  volatility,
  sharpeRatio,
  expectedReturn,
  size = 'md',
  showDetails = true
}: RiskIndicatorProps) {
  
  // Determinar nível de risco baseado na volatilidade
  const getRiskLevel = (vol: number): { level: string; color: string; icon: React.ReactNode; description: string } => {
    if (vol < 10) {
      return {
        level: 'Baixo',
        color: 'text-green-600 bg-green-100',
        icon: <Shield className="w-4 h-4" />,
        description: 'Risco conservador'
      };
    } else if (vol < 20) {
      return {
        level: 'Moderado',
        color: 'text-yellow-600 bg-yellow-100',
        icon: <AlertTriangle className="w-4 h-4" />,
        description: 'Risco equilibrado'
      };
    } else {
      return {
        level: 'Alto',
        color: 'text-red-600 bg-red-100',
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'Risco agressivo'
      };
    }
  };

  // Determinar qualidade do Sharpe Ratio
  const getSharpeQuality = (sharpe: number): { quality: string; color: string } => {
    if (sharpe > 1.0) {
      return { quality: 'Excelente', color: 'text-green-600' };
    } else if (sharpe > 0.5) {
      return { quality: 'Bom', color: 'text-blue-600' };
    } else if (sharpe > 0) {
      return { quality: 'Regular', color: 'text-yellow-600' };
    } else {
      return { quality: 'Ruim', color: 'text-red-600' };
    }
  };

  const riskInfo = getRiskLevel(volatility);
  const sharpeInfo = getSharpeQuality(sharpeRatio);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const formatPercentage = (value: number): string => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${(Number(value) * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <div className="space-y-3">
      {/* Indicador Principal de Risco */}
      <div className={`inline-flex items-center rounded-full ${riskInfo.color} ${sizeClasses[size]} font-medium`}>
        {riskInfo.icon}
        <span className="ml-2">Risco {riskInfo.level}</span>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">Volatilidade</div>
              <div className={`text-lg font-bold ${riskInfo.color.split(' ')[0]}`}>
                {formatPercentage(volatility)}
              </div>
              <div className="text-xs text-gray-500">{riskInfo.description}</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">Sharpe Ratio</div>
              <div className={`text-lg font-bold ${sharpeInfo.color}`}>
                {formatNumber(sharpeRatio)}
              </div>
              <div className="text-xs text-gray-500">{sharpeInfo.quality}</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">Retorno Esperado</div>
              <div className={`text-lg font-bold ${expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(expectedReturn)}
              </div>
              <div className="text-xs text-gray-500">Anualizado</div>
            </div>
          </div>

          {/* Barra de Risco Visual */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Conservador</span>
              <span>Moderado</span>
              <span>Agressivo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(volatility * 2, 100)}%`,
                  backgroundColor: volatility < 10 ? '#10b981' : volatility < 20 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </div>

          {/* Interpretação */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Interpretação:</strong> {getInterpretation(volatility, sharpeRatio, expectedReturn)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Função para gerar interpretação automática
function getInterpretation(volatility: number, sharpeRatio: number, expectedReturn: number): string {
  if (sharpeRatio > 1.0 && volatility < 15) {
    return 'Carteira com excelente relação risco-retorno. Ideal para investidores que buscam estabilidade com bons retornos.';
  } else if (sharpeRatio > 0.5 && volatility < 25) {
    return 'Carteira equilibrada com boa relação risco-retorno. Adequada para perfil moderado.';
  } else if (volatility > 25 && expectedReturn > 10) {
    return 'Carteira agressiva com alto potencial de retorno, mas também alto risco. Recomendada para investidores experientes.';
  } else if (volatility < 10 && expectedReturn < 5) {
    return 'Carteira conservadora focada na preservação de capital. Baixo risco, mas retornos limitados.';
  } else if (sharpeRatio < 0.3) {
    return 'Carteira com relação risco-retorno desfavorável. Considere rebalancear para melhorar a eficiência.';
  } else {
    return 'Carteira com características mistas. Avalie se está alinhada com seus objetivos de investimento.';
  }
} 