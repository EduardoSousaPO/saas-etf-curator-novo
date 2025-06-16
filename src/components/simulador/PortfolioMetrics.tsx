"use client";

import React from 'react';
import { TrendingUp, Shield, Award, DollarSign, Target, Calculator } from 'lucide-react';

interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  expenseRatio: number;
  totalAllocation: number;
}

interface PortfolioMetricsProps {
  metrics: PortfolioMetrics;
  investmentAmount: number;
}

export default function PortfolioMetrics({ metrics, investmentAmount }: PortfolioMetricsProps) {
  const formatPercentage = (value: number): string => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${(Number(value) * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return value.toFixed(2);
  };

  // Calcular valores projetados
  const projectedReturn = (investmentAmount * metrics.expectedReturn) / 100;
  const projectedValue = investmentAmount + projectedReturn;

  // Obter cor baseada no valor
  const getReturnColor = (value: number): string => {
    if (value >= 15) return 'text-green-600';
    if (value >= 8) return 'text-blue-600';
    if (value >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVolatilityColor = (value: number): string => {
    if (value <= 10) return 'text-green-600';
    if (value <= 20) return 'text-yellow-600';
    if (value <= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSharpeColor = (value: number): string => {
    if (value >= 1.5) return 'text-green-600';
    if (value >= 1.0) return 'text-blue-600';
    if (value >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (volatility: number): string => {
    if (volatility <= 10) return 'Baixo';
    if (volatility <= 20) return 'Moderado';
    if (volatility <= 30) return 'Alto';
    return 'Muito Alto';
  };

  const getPerformanceLevel = (sharpe: number): string => {
    if (sharpe >= 1.5) return 'Excelente';
    if (sharpe >= 1.0) return 'Muito Bom';
    if (sharpe >= 0.5) return 'Bom';
    return 'Precisa Melhorar';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Calculator className="w-5 h-5 mr-2 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Métricas da Carteira</h3>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm text-gray-600">Retorno Esperado</span>
          </div>
          <div className={`text-xl font-bold ${getReturnColor(metrics.expectedReturn)}`}>
            {formatPercentage(metrics.expectedReturn)}
          </div>
          <div className="text-xs text-gray-500">12 meses</div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Shield className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm text-gray-600">Volatilidade</span>
          </div>
          <div className={`text-xl font-bold ${getVolatilityColor(metrics.volatility)}`}>
            {formatPercentage(metrics.volatility)}
          </div>
          <div className="text-xs text-gray-500">Risco: {getRiskLevel(metrics.volatility)}</div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Award className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm text-gray-600">Sharpe Ratio</span>
          </div>
          <div className={`text-xl font-bold ${getSharpeColor(metrics.sharpeRatio)}`}>
            {formatNumber(metrics.sharpeRatio)}
          </div>
          <div className="text-xs text-gray-500">{getPerformanceLevel(metrics.sharpeRatio)}</div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
            <span className="text-sm text-gray-600">Taxa Média</span>
          </div>
          <div className="text-xl font-bold text-purple-600">
            {formatPercentage(metrics.expenseRatio)}
          </div>
          <div className="text-xs text-gray-500">Custo anual</div>
        </div>
      </div>

      {/* Projeções */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Projeção 12 Meses
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Investimento Inicial:</span>
            <span className="font-medium text-gray-900">{formatCurrency(investmentAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Retorno Projetado:</span>
            <span className={`font-medium ${getReturnColor(metrics.expectedReturn)}`}>
              {formatCurrency(projectedReturn)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">Valor Final Estimado:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(projectedValue)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Custo Anual (Taxas):</span>
            <span className="font-medium text-red-600">
              -{formatCurrency((investmentAmount * metrics.expenseRatio) / 100)}
            </span>
          </div>
        </div>
      </div>

      {/* Indicadores de Qualidade */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Indicadores de Qualidade</h4>
        
        <div className="space-y-2">
          {/* Indicador de Diversificação */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Alocação Total:</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                Math.abs(metrics.totalAllocation - 100) < 1 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs font-medium">
                {formatPercentage(metrics.totalAllocation)}
              </span>
            </div>
          </div>

          {/* Indicador de Eficiência */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Eficiência (Sharpe):</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getSharpeColor(metrics.sharpeRatio).replace('text-', 'bg-')}`}></div>
              <span className="text-xs font-medium">
                {getPerformanceLevel(metrics.sharpeRatio)}
              </span>
            </div>
          </div>

          {/* Indicador de Custo */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Custo:</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                metrics.expenseRatio <= 0.2 ? 'bg-green-500' : 
                metrics.expenseRatio <= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs font-medium">
                {metrics.expenseRatio <= 0.2 ? 'Baixo' : 
                 metrics.expenseRatio <= 0.5 ? 'Moderado' : 'Alto'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Aviso:</strong> Projeções baseadas em dados históricos. 
          Rentabilidade passada não garante resultados futuros.
        </p>
      </div>
    </div>
  );
} 