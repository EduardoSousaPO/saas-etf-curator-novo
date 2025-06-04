"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  DollarSign, 
  BarChart3, 
  AlertTriangle,
  ExternalLink,
  Info,
  Plus,
  Check
} from 'lucide-react';
import { RecommendationResponse, ETFRecommendation } from '@/lib/ai/recommendations';
import { InvestorProfile } from '@/lib/onboarding/profiles';
import ContextualGlossary from '@/components/ui/ContextualGlossary';

interface ETFRecommendationsProps {
  recommendations: RecommendationResponse;
  userProfile: InvestorProfile;
  onRefresh: () => void;
}

export default function ETFRecommendations({ 
  recommendations, 
  userProfile, 
  onRefresh 
}: ETFRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'growth' | 'defensive' | 'opportunistic'>('all');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations.recommendations 
    : recommendations.recommendations.filter(rec => rec.category === selectedCategory);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'growth': return 'bg-green-100 text-green-800';
      case 'defensive': return 'bg-gray-100 text-gray-800';
      case 'opportunistic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Shield className="w-4 h-4" />;
      case 'growth': return <TrendingUp className="w-4 h-4" />;
      case 'defensive': return <Shield className="w-4 h-4" />;
      case 'opportunistic': return <Star className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'core': return 'Core Holdings';
      case 'growth': return 'Crescimento';
      case 'defensive': return 'Defensivos';
      case 'opportunistic': return 'Oportunísticos';
      default: return category;
    }
  };

  const formatValue = (value: number | undefined, type: 'currency' | 'percentage' | 'ratio' = 'percentage') => {
    if (value === undefined || value === null) return 'N/A';
    
    switch (type) {
      case 'currency':
        return `$${(value / 1000000).toFixed(0)}M`;
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;
      case 'ratio':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary and Allocation */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Análise Personalizada</h2>
          </div>
          
          <div className="prose prose-sm text-gray-700">
            <ContextualGlossary>{recommendations.summary}</ContextualGlossary>
          </div>

          {recommendations.warnings.length > 0 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Pontos de Atenção</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    {recommendations.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alocação Sugerida</h3>
          
          <div className="space-y-3">
            {recommendations.portfolioAllocation.map((allocation, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{allocation.category}</span>
                  <span className="text-sm font-bold text-gray-900">{allocation.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${allocation.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{allocation.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recomendações Específicas ({filteredRecommendations.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filtrar por:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="core">Core Holdings</option>
              <option value="growth">Crescimento</option>
              <option value="defensive">Defensivos</option>
              <option value="opportunistic">Oportunísticos</option>
            </select>
          </div>
        </div>

        {/* ETF Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.etf.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{recommendation.etf.symbol}</h3>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                      {getCategoryIcon(recommendation.category)}
                      <span>{getCategoryName(recommendation.category)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{recommendation.etf.name}</p>
                </div>
                
                <button
                  onClick={() => toggleWatchlist(recommendation.etf.symbol)}
                  className={`p-2 rounded-lg transition-colors ${
                    watchlist.has(recommendation.etf.symbol)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {watchlist.has(recommendation.etf.symbol) ? 
                    <Check className="w-5 h-5" /> : 
                    <Plus className="w-5 h-5" />
                  }
                </button>
              </div>

              {/* Score and Confidence */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Score: {recommendation.score.toFixed(0)}/100</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${recommendation.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{(recommendation.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Retorno 12m</div>
                                     <div className={`font-semibold ${                     (recommendation.etf.returns_12m || 0) >= 0 ? 'text-green-600' : 'text-red-600'                   }`}>                     {formatValue(recommendation.etf.returns_12m || undefined)}
                  </div>
                </div>
                                 <div className="text-center p-2 bg-gray-50 rounded">                   <div className="text-xs text-gray-600">Volatilidade</div>                   <div className="font-semibold text-gray-900">                     {formatValue(recommendation.etf.volatility_12m || undefined)}                   </div>                 </div>                 <div className="text-center p-2 bg-gray-50 rounded">                   <div className="text-xs text-gray-600">Expense Ratio</div>                   <div className="font-semibold text-gray-900">                     {formatValue(recommendation.etf.expense_ratio || undefined)}                   </div>                 </div>                 <div className="text-center p-2 bg-gray-50 rounded">                   <div className="text-xs text-gray-600">Patrimônio</div>                   <div className="font-semibold text-gray-900">                     {formatValue(recommendation.etf.total_assets || undefined, 'currency')}
                  </div>
                </div>
              </div>

              {/* Reasons */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Por que recomendamos:</h4>
                <ul className="space-y-1">
                  {recommendation.reasons.slice(0, 3).map((reason, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <Check className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <ContextualGlossary>{reason}</ContextualGlossary>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(`/comparator?symbols=${recommendation.etf.symbol}`, '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Analisar
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum ETF encontrado para esta categoria.</p>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Gostou das recomendações?</h3>
            <p className="text-sm text-gray-600 mt-1">
              {watchlist.size > 0 ? 
                `Você adicionou ${watchlist.size} ETF(s) à sua watchlist` :
                'Adicione ETFs à sua watchlist para acompanhar'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Novas Recomendações
            </button>
            {watchlist.size > 0 && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Comparar Selecionados
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 