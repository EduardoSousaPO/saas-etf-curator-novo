"use client";

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Target,
  BarChart3,
  Globe,
  Building,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from "react-hot-toast";

interface DiversificationData {
  current_portfolio: {
    symbols: string[];
    diversification_score: number;
    risk_level: string;
    sector_concentration: Array<{
      sector: string;
      percentage: number;
      risk_level: string;
    }>;
    geographic_exposure: Array<{
      region: string;
      percentage: number;
    }>;
    overlap_analysis: Array<{
      etf1: string;
      etf2: string;
      overlap_percentage: number;
    }>;
  };
  optimization_suggestions: Array<{
    action: string;
    current_etf: string;
    suggested_etf: string;
    reason: string;
    impact_score: number;
  }>;
  efficient_frontier: Array<{
    risk: number;
    return: number;
    allocation: Record<string, number>;
  }>;
}

export default function DiversificationOptimizer() {
  const [diversificationData, setDiversificationData] = useState<DiversificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string[]>(['SPY', 'QQQ', 'VTI', 'IWM']);

  useEffect(() => {
    loadDiversificationAnalysis();
  }, [selectedPortfolio]);

  const loadDiversificationAnalysis = async () => {
    setLoading(true);
    try {
      const symbols = selectedPortfolio.join(',');
      const response = await fetch(`/api/analytics/correlations?type=diversification&symbols=${symbols}`);
      
      if (response.ok) {
        const data = await response.json();
        setDiversificationData(data);
      } else {
        toast.error('Erro ao carregar análise de diversificação');
      }
    } catch (error) {
      console.error('Erro ao carregar análise de diversificação:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getDiversificationColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDiversificationBadge = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Boa', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { label: 'Moderada', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Baixa', color: 'bg-red-100 text-red-800' };
  };

  const getRiskBadge = (risk: string): { color: string } => {
    switch (risk.toLowerCase()) {
      case 'baixo': return { color: 'bg-green-100 text-green-800' };
      case 'moderado': return { color: 'bg-yellow-100 text-yellow-800' };
      case 'alto': return { color: 'bg-red-100 text-red-800' };
      default: return { color: 'bg-gray-100 text-gray-800' };
    }
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
      {/* Portfolio Selector */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Portfolio para Análise
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedPortfolio.map((symbol) => (
            <span 
              key={symbol}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {symbol}
              <button
                onClick={() => setSelectedPortfolio(prev => prev.filter(s => s !== symbol))}
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
            placeholder="Adicionar ETF (ex: BND)"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim().toUpperCase();
                if (value && !selectedPortfolio.includes(value)) {
                  setSelectedPortfolio(prev => [...prev, value]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <button
            onClick={loadDiversificationAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Analisar
          </button>
        </div>
      </div>

      {/* Diversification Score */}
      {diversificationData?.current_portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6 col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Score de Diversificação</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold ${getDiversificationColor(diversificationData.current_portfolio.diversification_score)}`}>
                {diversificationData.current_portfolio.diversification_score.toFixed(0)}/100
              </div>
              <div>
                <span className={`inline-flex px-3 py-2 text-sm font-medium rounded-full ${getDiversificationBadge(diversificationData.current_portfolio.diversification_score).color}`}>
                  {getDiversificationBadge(diversificationData.current_portfolio.diversification_score).label}
                </span>
                <div className="text-sm text-purple-700 mt-2">
                  Nível de Risco: {diversificationData.current_portfolio.risk_level}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Setores</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {diversificationData.current_portfolio.sector_concentration?.length || 0}
            </div>
            <div className="text-sm text-blue-700">
              Diferentes setores
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Geografia</h3>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {diversificationData.current_portfolio.geographic_exposure?.length || 0}
            </div>
            <div className="text-sm text-green-700">
              Regiões expostas
            </div>
          </div>
        </div>
      )}

      {/* Sector Analysis */}
      {diversificationData?.current_portfolio?.sector_concentration && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Concentração Setorial
            </h3>
            <p className="text-sm text-gray-600 mt-1">Distribuição por setores do seu portfolio</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {diversificationData.current_portfolio.sector_concentration.map((sector, index) => {
                const riskBadge = getRiskBadge(sector.risk_level);
                return (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{sector.sector}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskBadge.color}`}>
                          {sector.risk_level}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${sector.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 w-12 text-right">
                        {sector.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      {diversificationData?.optimization_suggestions && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Sugestões de Otimização
            </h3>
            <p className="text-sm text-gray-600 mt-1">Recomendações para melhorar sua diversificação</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {diversificationData.optimization_suggestions.slice(0, 5).map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {suggestion.impact_score > 70 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{suggestion.action}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {suggestion.current_etf && (
                            <>Substituir <strong>{suggestion.current_etf}</strong> por </>
                          )}
                          <strong className="text-blue-600">{suggestion.suggested_etf}</strong>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">{suggestion.reason}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Impacto: {suggestion.impact_score.toFixed(0)}/100
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            suggestion.impact_score > 70 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${suggestion.impact_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlap Analysis */}
      {diversificationData?.current_portfolio?.overlap_analysis && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
              Análise de Sobreposição
            </h3>
            <p className="text-sm text-gray-600 mt-1">ETFs com holdings similares no seu portfolio</p>
          </div>
          
          <div className="p-6">
            {diversificationData.current_portfolio.overlap_analysis.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p>Excelente! Não foram detectadas sobreposições significativas entre seus ETFs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {diversificationData.current_portfolio.overlap_analysis.map((overlap, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {overlap.etf1} ↔ {overlap.etf2}
                        </div>
                        <div className="text-sm text-gray-600">
                          Sobreposição detectada
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">
                        {overlap.overlap_percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="font-semibold text-purple-900 mb-3">🎯 Insights de Diversificação</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
          <div>
            <p className="mb-2">
              <strong>🌍 Diversificação Geográfica:</strong> Mantenha exposição global para reduzir riscos
            </p>
            <p className="mb-2">
              <strong>🏭 Diversificação Setorial:</strong> Evite concentração &gt; 30% em um único setor
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>⚖️ Rebalanceamento:</strong> Revise alocações trimestralmente
            </p>
            <p>
              <strong>🔄 Sobreposição:</strong> Evite ETFs com &gt; 50% de holdings similares
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 