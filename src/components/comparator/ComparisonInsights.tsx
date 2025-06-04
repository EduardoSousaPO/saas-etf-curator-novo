// src/components/comparator/ComparisonInsights.tsx
"use client";

import { useState, useEffect } from 'react';
import { ETF } from "@/types";
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/ai/text-analysis';
import ContextualGlossary from '@/components/ui/ContextualGlossary';
import { Brain, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface ComparisonInsightsProps {
  etfs: ETF[];
}

interface AIAnalysis {
  summary: string;
  keyDifferences: string[];
  recommendation: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  strengths: Record<string, string[]>;
  warnings: string[];
}

// Helper function to safely format a number with fixed decimal places
const safeNumberFormat = (value: any, decimals: number = 2): string => {
  // Check if value is a number or can be converted to a number
  const num = Number(value);
  if (isNaN(num)) return "N/A";
  return num.toFixed(decimals);
};

// Helper function to find the ETF with the best (or worst) value for a given metric
const findBestOrWorst = (
  etfs: ETF[], 
  metricKey: keyof ETF, 
  higherIsBetter: boolean
): { etf: ETF | null, value: number | null } => {
  if (!etfs || etfs.length === 0) return { etf: null, value: null };

  let bestEtf: ETF | null = null;
  let bestValue: number | null = null;

  for (const etf of etfs) {
    // Explicitly parse as number to avoid string values
    const rawValue = etf[metricKey];
    const currentValue = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
    
    // Skip if not a valid number
    if (currentValue === null || isNaN(currentValue)) continue;

    if (bestEtf === null) {
      bestEtf = etf;
      bestValue = currentValue;
    } else {
      if (higherIsBetter) {
        if (currentValue > (bestValue!)) {
          bestEtf = etf;
          bestValue = currentValue;
        }
      } else {
        if (currentValue < (bestValue!)) {
          bestEtf = etf;
          bestValue = currentValue;
        }
      }
    }
  }
  return { etf: bestEtf, value: bestValue };
};

export default function ComparisonInsights({ etfs }: ComparisonInsightsProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBasicInsights, setShowBasicInsights] = useState(true);

  useEffect(() => {
    if (etfs.length >= 2) {
      const etfSymbols = etfs.map(etf => etf.symbol);
      
      // Verificar cache primeiro
      const cached = getCachedAnalysis(etfSymbols);
      if (cached) {
        setAiAnalysis(cached);
        return;
      }

      // Realizar análise IA via API
      setIsAnalyzing(true);
      fetch('/api/ai/comparison-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ etfs }),
      })
        .then(response => response.json())
        .then(analysis => {
          if (analysis.error) {
            console.error('Erro na análise:', analysis.error);
            return;
          }
          setAiAnalysis(analysis);
          setCachedAnalysis(etfSymbols, analysis);
        })
        .catch(error => {
          console.error('Erro na análise IA:', error);
          // Manter análise básica em caso de erro
        })
        .finally(() => setIsAnalyzing(false));
    } else {
      setAiAnalysis(null);
    }
  }, [etfs]);

  if (!etfs || etfs.length === 0) {
    return null;
  }

  // Gerar insights básicos (fallback)
  const generateBasicInsights = (): string[] => {
    const insights: string[] = [];

    const bestReturn12m = findBestOrWorst(etfs, "returns_12m", true);
    if (bestReturn12m.etf && bestReturn12m.value !== null) {
      insights.push(
        `${bestReturn12m.etf.symbol} apresentou o maior retorno nos últimos 12 meses (${safeNumberFormat(bestReturn12m.value * 100)}%).`
      );
    }

    const lowestVolatility12m = findBestOrWorst(etfs, "volatility_12m", false);
    if (lowestVolatility12m.etf && lowestVolatility12m.value !== null) {
      insights.push(
        `${lowestVolatility12m.etf.symbol} demonstrou a menor volatilidade nos últimos 12 meses (${safeNumberFormat(lowestVolatility12m.value * 100)}%).`
      );
    }

    const bestSharpe12m = findBestOrWorst(etfs, "sharpe_12m", true);
    if (bestSharpe12m.etf && bestSharpe12m.value !== null) {
      insights.push(
        `${bestSharpe12m.etf.symbol} teve o melhor Índice de Sharpe nos últimos 12 meses (${safeNumberFormat(bestSharpe12m.value)}), indicando um bom equilíbrio risco/retorno.`
      );
    }

    return insights;
  };

  const getRiskProfileIcon = (riskProfile: string) => {
    switch (riskProfile) {
      case 'conservative':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'moderate':
        return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      case 'aggressive':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRiskProfileLabel = (riskProfile: string) => {
    switch (riskProfile) {
      case 'conservative':
        return 'Conservador';
      case 'moderate':
        return 'Moderado';
      case 'aggressive':
        return 'Arrojado';
      default:
        return 'Moderado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Análise IA - Principal */}
      {etfs.length >= 2 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Análise Inteligente
              </h3>
              {isAnalyzing && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-4">
                {/* Resumo Principal */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                  <ContextualGlossary className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    {aiAnalysis.summary}
                  </ContextualGlossary>
                </div>

                {/* Perfil de Risco */}
                <div className="flex items-center space-x-2">
                  {getRiskProfileIcon(aiAnalysis.riskProfile)}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Perfil de risco: {getRiskProfileLabel(aiAnalysis.riskProfile)}
                  </span>
                </div>

                {/* Principais Diferenças */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    🔍 Principais Diferenças
                  </h4>
                  <ul className="space-y-2">
                    {aiAnalysis.keyDifferences.map((diff, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <ContextualGlossary className="text-sm text-gray-700 dark:text-gray-300">
                          {diff}
                        </ContextualGlossary>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pontos Fortes */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    ⭐ Pontos Fortes
                  </h4>
                  <div className="grid gap-3">
                    {Object.entries(aiAnalysis.strengths).map(([symbol, strengths]) => (
                      <div key={symbol} className="border-l-4 border-green-400 pl-3">
                        <div className="font-medium text-green-800 dark:text-green-300">
                          {symbol}
                        </div>
                        <ul className="space-y-1 mt-1">
                          {strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendação */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    💡 Recomendação
                  </h4>
                  <ContextualGlossary className="text-sm text-gray-700 dark:text-gray-300">
                    {aiAnalysis.recommendation}
                  </ContextualGlossary>
                </div>

                {/* Alertas */}
                {aiAnalysis.warnings.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                        Pontos de Atenção
                      </h4>
                    </div>
                    <ul className="space-y-1">
                      {aiAnalysis.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-amber-700 dark:text-amber-300">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : isAnalyzing ? (
              <div className="text-center py-6 text-blue-700 dark:text-blue-300">
                Analisando ETFs selecionados...
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600 dark:text-gray-400">
                Selecione pelo menos 2 ETFs para análise comparativa inteligente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Análise Básica */}
      {showBasicInsights && (
        <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold dark:text-white">
                📊 Análise Rápida
              </h3>
              <button
                onClick={() => setShowBasicInsights(!showBasicInsights)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showBasicInsights ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            
            {(() => {
              const basicInsights = generateBasicInsights();
              return basicInsights.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                  {basicInsights.map((insight, index) => (
                    <li key={index}>
                      <ContextualGlossary>{insight}</ContextualGlossary>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Não foi possível gerar insights com os ETFs selecionados.
                </p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

