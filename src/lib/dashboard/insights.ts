import React from 'react';
import { ETF } from '@/types';
import { InvestorProfile } from '@/lib/onboarding/profiles';

export interface MarketInsight {
  id: string;
  type: 'market_trend' | 'performance_alert' | 'opportunity' | 'risk_warning' | 'educational';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: {
    text: string;
    url: string;
  };
  timestamp: Date;
  relevantETFs?: string[];
}

export interface UserBehaviorPattern {
  userId: string;
  favoriteCategories: string[];
  avgSessionTime: number;
  preferredTimeframe: string;
  riskTolerance: string;
  lastActions: string[];
  searchPatterns: string[];
}

export interface PersonalizedRecommendation {
  type: 'portfolio_adjustment' | 'new_etf' | 'rebalancing' | 'education';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  relatedETFs?: ETF[];
}

class InsightsEngine {
  
  // Gerar insights baseados no comportamento do usuário
  generateUserInsights(
    profile: InvestorProfile,
    behavior: UserBehaviorPattern,
    marketData: ETF[]
  ): MarketInsight[] {
    const insights: MarketInsight[] = [];

    // Insight baseado em performance recente
    const topPerformers = this.getTopPerformers(marketData, behavior.favoriteCategories);
    if (topPerformers.length > 0) {
      insights.push({
        id: `top-performers-${Date.now()}`,
        type: 'opportunity',
        title: '📈 ETFs em alta nas suas categorias favoritas',
        description: `${topPerformers.slice(0, 3).map(etf => etf.symbol).join(', ')} estão com performance acima da média`,
        impact: 'medium',
        actionable: true,
        action: {
          text: 'Ver Detalhes',
          url: `/screener?categories=${behavior.favoriteCategories.join(',')}`
        },
        timestamp: new Date(),
        relevantETFs: topPerformers.slice(0, 3).map(etf => etf.symbol)
      });
    }

    // Insight educacional baseado no perfil
    if (profile.riskTolerance === 'conservative' && behavior.searchPatterns.includes('growth')) {
      insights.push({
        id: `education-risk-${Date.now()}`,
        type: 'educational',
        title: '🎓 Balanceando crescimento e segurança',
        description: 'Você tem pesquisado ETFs de crescimento. Saiba como equilibrar com seu perfil conservador.',
        impact: 'low',
        actionable: true,
        action: {
          text: 'Aprender Mais',
          url: '/learn?topic=risk-balance'
        },
        timestamp: new Date()
      });
    }

    // Alerta de concentração de risco
    if (behavior.favoriteCategories.length <= 2) {
      insights.push({
        id: `diversification-${Date.now()}`,
        type: 'risk_warning',
        title: '⚠️ Considere diversificar sua carteira',
        description: 'Você tem focado em poucas categorias. Diversificação pode reduzir riscos.',
        impact: 'medium',
        actionable: true,
        action: {
          text: 'Ver Sugestões',
          url: '/recommendations'
        },
        timestamp: new Date()
      });
    }

    return insights;
  }

  // Recomendações contextuais baseadas no mercado
  generateMarketContextualRecommendations(
    marketData: ETF[],
    profile: InvestorProfile
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Análise de volatilidade do mercado
    const avgVolatility = this.calculateMarketVolatility(marketData);
    
    if (avgVolatility > 25 && profile.riskTolerance === 'conservative') {
      recommendations.push({
        type: 'portfolio_adjustment',
        title: 'Mercado volátil detectado',
        description: 'Considere aumentar a alocação em ETFs defensivos',
        confidence: 0.8,
        reasoning: [
          'Volatilidade do mercado está acima de 25%',
          'Seu perfil conservador sugere cautela',
          'ETFs defensivos historicamente performam melhor em volatilidade'
        ],
        relatedETFs: marketData.filter(etf => 
                etf.assetclass?.includes('Bond') ||
      etf.assetclass?.includes('Dividend')
        ).slice(0, 3)
      });
    }

    // Oportunidades de rebalanceamento
    const sectorsPerformance = this.analyzeSectorPerformance(marketData);
    const underperformingSectors = Object.entries(sectorsPerformance)
      .filter(([_, performance]) => performance < -5)
      .map(([sector, _]) => sector);

    if (underperformingSectors.length > 0) {
      recommendations.push({
        type: 'rebalancing',
        title: 'Oportunidade de rebalanceamento',
        description: `Setores como ${underperformingSectors.slice(0, 2).join(', ')} estão em queda - pode ser hora de rebalancear`,
        confidence: 0.7,
        reasoning: [
          'Alguns setores estão significativamente abaixo da média',
          'Rebalanceamento pode capturar oportunidades de recuperação',
          'Estratégia de compra na baixa historicamente eficaz'
        ]
      });
    }

    return recommendations;
  }

  // Detectar tendências emergentes
  detectEmergingTrends(marketData: ETF[]): MarketInsight[] {
    const insights: MarketInsight[] = [];

    // Analisar ETFs com maior crescimento recente
    const rapidGrowthETFs = marketData
      .filter(etf => etf.returns_12m && etf.returns_12m > 20)
      .sort((a, b) => (b.returns_12m || 0) - (a.returns_12m || 0))
      .slice(0, 5);

    if (rapidGrowthETFs.length >= 3) {
      const dominantSectors = this.identifyDominantSectors(rapidGrowthETFs);
      
      insights.push({
        id: `trend-${Date.now()}`,
        type: 'market_trend',
        title: '🚀 Tendência emergente detectada',
        description: `Setores como ${dominantSectors.join(', ')} estão mostrando crescimento excepcional`,
        impact: 'high',
        actionable: true,
        action: {
          text: 'Explorar Tendência',
          url: `/screener?sectors=${dominantSectors.join(',')}`
        },
        timestamp: new Date(),
        relevantETFs: rapidGrowthETFs.slice(0, 3).map(etf => etf.symbol)
      });
    }

    return insights;
  }

  // Análise de sentimento do mercado
  analyzeMarketSentiment(marketData: ETF[]): {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    factors: string[];
  } {
    const positivePerformers = marketData.filter(etf => (etf.returns_12m || 0) > 10).length;
    const negativePerformers = marketData.filter(etf => (etf.returns_12m || 0) < -5).length;
    const totalETFs = marketData.length;

    const positiveRatio = positivePerformers / totalETFs;
    const negativeRatio = negativePerformers / totalETFs;

    let sentiment: 'bullish' | 'bearish' | 'neutral';
    let confidence: number;
    const factors: string[] = [];

    if (positiveRatio > 0.6) {
      sentiment = 'bullish';
      confidence = Math.min(0.9, positiveRatio * 1.2);
      factors.push(`${Math.round(positiveRatio * 100)}% dos ETFs com performance positiva`);
    } else if (negativeRatio > 0.4) {
      sentiment = 'bearish';
      confidence = Math.min(0.9, negativeRatio * 1.5);
      factors.push(`${Math.round(negativeRatio * 100)}% dos ETFs com performance negativa`);
    } else {
      sentiment = 'neutral';
      confidence = 0.6;
      factors.push('Mercado sem direção clara definida');
    }

    // Análise de volatilidade
    const avgVolatility = this.calculateMarketVolatility(marketData);
    if (avgVolatility > 25) {
      factors.push('Alta volatilidade detectada');
      if (sentiment === 'bullish') confidence *= 0.8;
    }

    return { sentiment, confidence, factors };
  }

  // Métodos auxiliares
  private getTopPerformers(etfs: ETF[], categories: string[]): ETF[] {
    return etfs
      .filter(etf => categories.some(cat => etf.assetclass?.includes(cat)))
      .filter(etf => etf.returns_12m && etf.returns_12m > 15)
      .sort((a, b) => (b.returns_12m || 0) - (a.returns_12m || 0))
      .slice(0, 5);
  }

  private calculateMarketVolatility(etfs: ETF[]): number {
    const volatilities = etfs
      .map(etf => etf.volatility_12m)
      .filter(vol => vol !== null && vol !== undefined) as number[];
    
    if (volatilities.length === 0) return 20; // default
    
    return volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length * 100;
  }

  private analyzeSectorPerformance(etfs: ETF[]): Record<string, number> {
    const sectorPerformance: Record<string, { total: number; count: number }> = {};

    etfs.forEach(etf => {
      if (etf.sector && etf.returns_12m) {
        if (!sectorPerformance[etf.sector]) {
          sectorPerformance[etf.sector] = { total: 0, count: 0 };
        }
        sectorPerformance[etf.sector].total += etf.returns_12m * 100;
        sectorPerformance[etf.sector].count += 1;
      }
    });

    const result: Record<string, number> = {};
    Object.entries(sectorPerformance).forEach(([sector, data]) => {
      result[sector] = data.total / data.count;
    });

    return result;
  }

  private identifyDominantSectors(etfs: ETF[]): string[] {
    const sectorCount: Record<string, number> = {};
    
    etfs.forEach(etf => {
      if (etf.sector) {
        sectorCount[etf.sector] = (sectorCount[etf.sector] || 0) + 1;
      }
    });

    return Object.entries(sectorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([sector, _]) => sector);
  }
}

export const insightsEngine = new InsightsEngine();

// Hook para usar insights no dashboard
export function useDashboardInsights(profile: InvestorProfile | null, marketData: ETF[]) {
  const [insights, setInsights] = React.useState<MarketInsight[]>([]);
  const [recommendations, setRecommendations] = React.useState<PersonalizedRecommendation[]>([]);
  const [marketSentiment, setMarketSentiment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!profile || marketData.length === 0) return;

    setLoading(true);
    
    // Simular comportamento do usuário (em produção viria do backend)
    const mockBehavior: UserBehaviorPattern = {
      userId: 'user-1',
      favoriteCategories: profile.preferredCategories,
      avgSessionTime: 450, // 7.5 minutes
      preferredTimeframe: '12m',
      riskTolerance: profile.riskTolerance,
      lastActions: ['screener', 'recommendations', 'comparator'],
      searchPatterns: ['growth', 'technology', 'dividend']
    };

    try {
      const userInsights = insightsEngine.generateUserInsights(profile, mockBehavior, marketData);
      const contextualRecs = insightsEngine.generateMarketContextualRecommendations(marketData, profile);
      const emergingTrends = insightsEngine.detectEmergingTrends(marketData);
      const sentiment = insightsEngine.analyzeMarketSentiment(marketData);

      setInsights([...userInsights, ...emergingTrends]);
      setRecommendations(contextualRecs);
      setMarketSentiment(sentiment);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, marketData]);

  return {
    insights,
    recommendations,
    marketSentiment,
    loading
  };
} 