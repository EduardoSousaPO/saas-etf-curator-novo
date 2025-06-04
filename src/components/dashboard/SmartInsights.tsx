"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  BookOpen,
  ExternalLink,
  Brain,
  BarChart3,
  TrendingDown,
  Info
} from 'lucide-react';
import { MarketInsight, PersonalizedRecommendation } from '@/lib/dashboard/insights';
import { Card } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";

interface SmartInsightProps {
  type: 'positive' | 'negative' | 'warning' | 'info';
  title: string;
  description: string;
  value?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SmartInsightsProps {
  insights: SmartInsightProps[];
  recommendations: PersonalizedRecommendation[];
  marketSentiment: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    factors: string[];
  } | null;
  loading: boolean;
}

const InsightIcon = {
  positive: TrendingUp,
  negative: TrendingDown,
  warning: AlertTriangle,
  info: Info
};

const InsightColors = {
  positive: 'text-green-600 bg-green-50',
  negative: 'text-red-600 bg-red-50',
  warning: 'text-yellow-600 bg-yellow-50',
  info: 'text-blue-600 bg-blue-50'
};

export default function SmartInsights({ 
  insights, 
  recommendations, 
  marketSentiment, 
  loading 
}: SmartInsightsProps) {
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'market_trend': return <TrendingUp className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      case 'risk_warning': return <AlertTriangle className="w-5 h-5" />;
      case 'educational': return <BookOpen className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'risk_warning') return 'text-red-600 bg-red-50 border-red-200';
    if (type === 'opportunity') return 'text-green-600 bg-green-50 border-green-200';
    if (type === 'market_trend') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (impact === 'high') return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-50';
      case 'bearish': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Sentiment */}
      {marketSentiment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              Análise de Mercado IA
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(marketSentiment.sentiment)}`}>
              {getSentimentIcon(marketSentiment.sentiment)} {
                marketSentiment.sentiment === 'bullish' ? 'Otimista' :
                marketSentiment.sentiment === 'bearish' ? 'Pessimista' : 'Neutro'
              }
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Confiança da Análise</span>
              <span className="text-sm font-medium">{Math.round(marketSentiment.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${marketSentiment.confidence * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Fatores Analisados:</h4>
            {marketSentiment.factors.map((factor, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                {factor}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights Personalizados */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Insights Personalizados
          </h3>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = InsightIcon[insight.type];
              const colorClass = InsightColors[insight.type];

              return (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{insight.description}</p>
                      {insight.value !== undefined && (
                        <p className={`mt-2 font-semibold ${colorClass.split(' ')[0]}`}>
                          {formatPercentage(insight.value)}
                        </p>
                      )}
                      {insight.action && (
                        <button
                          onClick={insight.action.onClick}
                          className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          {insight.action.label} →
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recomendações Contextuais */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Recomendações Inteligentes
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      {Math.round(rec.confidence * 100)}% confiança
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                
                <div className="space-y-2 mb-4">
                  <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Por que recomendamos:
                  </h5>
                  {rec.reasoning.map((reason, idx) => (
                    <div key={idx} className="flex items-start text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2"></div>
                      {reason}
                    </div>
                  ))}
                </div>

                {rec.relatedETFs && rec.relatedETFs.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                      ETFs Relacionados:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {rec.relatedETFs.map(etf => (
                        <a
                          key={etf.symbol}
                          href={`/comparator?etfs=${etf.symbol}`}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          {etf.symbol}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {insights.length === 0 && recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gerando Insights Personalizados
          </h3>
          <p className="text-gray-600">
            Complete seu perfil para receber análises e recomendações personalizadas
          </p>
        </div>
      )}
    </div>
  );
} 