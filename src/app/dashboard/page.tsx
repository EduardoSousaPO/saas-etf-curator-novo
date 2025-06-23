"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from '@/components/subscriptions/FeatureGate';
import { Badge } from '@/components/ui/badge';
import { currencyService } from '@/lib/currency';
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Lightbulb,
  Shield,
  Globe,
  RefreshCw,
  Crown,
  Star
} from 'lucide-react';

interface UserProfile {
  name: string;
  objective: string;
  monthlyInvestment: number;
  totalPatrimony: number;
  targetAmount: number;
  timeHorizon: string;
  profile: string;
}

interface SimpleMetrics {
  currentValueBRL: number;
  currentValueUSD: number;
  monthlyGainBRL: number;
  monthlyGainUSD: number;
  monthlyGainPercent: number;
  isOnTrack: boolean;
  monthsToGoal: number;
  dollarExposure: number;
  exchangeRate: number;
  exchangeVariation: string;
  exchangePctChange: string;
}

interface QuickAction {
  type: 'warning' | 'opportunity' | 'success';
  title: string;
  description: string;
  action: string;
}

export default function DashboardPage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const { currentPlan, planConfig, canAccessFeature } = useSubscription();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<SimpleMetrics | null>(null);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencyDisplay, setCurrencyDisplay] = useState<'BRL' | 'USD'>('BRL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadUserData();
      calculateSimpleMetrics();
      generateQuickActions();
    }
  }, [authLoading, authProfile]);

  const loadUserData = () => {
    if (authProfile) {
      setUserProfile({
        name: authProfile.name || authProfile.full_name || 'Investidor',
        objective: authProfile.objective || 'Aposentadoria',
        monthlyInvestment: authProfile.monthly_investment || 1000,
        totalPatrimony: authProfile.total_patrimony || 50000,
        targetAmount: 1000000, // Meta padrão já que target_amount não existe no UserProfile
        timeHorizon: authProfile.time_horizon || '10 anos',
        profile: authProfile.profile || 'Moderado'
      });
    } else {
      // Dados exemplo para usuários não logados
      setUserProfile({
        name: 'Visitante',
        objective: 'Aposentadoria',
        monthlyInvestment: 1000,
        totalPatrimony: 50000,
        targetAmount: 1000000,
        timeHorizon: '15 anos',
        profile: 'Moderado'
      });
    }
  };

  const calculateSimpleMetrics = async () => {
    try {
      // Buscar informações da moeda
      const currencyInfo = await currencyService.getCurrencyInfo();
      
      // Simulação de métricas baseada no perfil
      const baseReturn = 0.08; // 8% ao ano
      const currentValueBRL = userProfile?.totalPatrimony || 50000;
      const currentValueUSD = await currencyService.convertBRLToUSD(currentValueBRL);
      
      const monthlyGainBRL = currentValueBRL * (baseReturn / 12);
      const monthlyGainUSD = await currencyService.convertBRLToUSD(monthlyGainBRL);
      const monthlyGainPercent = baseReturn / 12;
      
      // Cálculo simples se está no caminho
      const targetAmount = userProfile?.targetAmount || 1000000;
      const yearsToGoal = Math.log(targetAmount / currentValueBRL) / Math.log(1 + baseReturn);
      const monthsToGoal = Math.round(yearsToGoal * 12);
      const isOnTrack = monthsToGoal <= 180; // 15 anos

      // Exposição ao dólar (assumindo 70% em ETFs americanos)
      const dollarExposure = currentValueUSD * 0.7;

      setMetrics({
        currentValueBRL,
        currentValueUSD,
        monthlyGainBRL,
        monthlyGainUSD,
        monthlyGainPercent,
        isOnTrack,
        monthsToGoal,
        dollarExposure,
        exchangeRate: currencyInfo.rate,
        exchangeVariation: currencyInfo.variation,
        exchangePctChange: currencyInfo.pctChange
      });
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
    }
  };

  const generateQuickActions = () => {
    const actions: QuickAction[] = [];

    if (!user) {
      actions.push({
        type: 'opportunity',
        title: 'Complete seu perfil',
        description: 'Faça login para recomendações personalizadas',
        action: 'Fazer Login'
      });
    }

    if (metrics && !metrics.isOnTrack) {
      actions.push({
        type: 'warning',
        title: 'Ajuste necessário',
        description: 'Aumente o investimento mensal em R$ 200 para atingir sua meta',
        action: 'Ver sugestões'
      });
    }

    // Oportunidade baseada no dólar
    const dollarTrend = parseFloat(metrics?.exchangePctChange || '0');
    if (dollarTrend > 1) {
      actions.push({
        type: 'opportunity',
        title: 'Dólar em alta',
        description: 'Momento favorável para aumentar exposição em ETFs americanos',
        action: 'Ver ETFs'
      });
    } else if (dollarTrend < -1) {
      actions.push({
        type: 'opportunity',
        title: 'Dólar em baixa',
        description: 'Oportunidade para aportar mais em ETFs americanos',
        action: 'Ver ETFs'
      });
    }

    if (metrics && metrics.isOnTrack) {
      actions.push({
        type: 'success',
        title: 'Parabéns! No caminho certo',
        description: 'Você está progredindo bem para sua meta',
        action: 'Otimizar carteira'
      });
    }

    setQuickActions(actions);
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await calculateSimpleMetrics();
    generateQuickActions();
    setRefreshing(false);
  };

  const formatMonths = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${remainingMonths} meses`;
    if (remainingMonths === 0) return `${years} anos`;
    return `${years} anos e ${remainingMonths} meses`;
  };

  const getVariationColor = (variation: string): string => {
    const num = parseFloat(variation);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (variation: string) => {
    const num = parseFloat(variation);
    if (num > 0) return <TrendingUp className="w-4 h-4" />;
    if (num < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Personalizado */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Olá, {userProfile?.name}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  Vamos verificar como está seu progresso para {userProfile?.objective.toLowerCase()}
                </p>
              </div>
              
              {/* Badge do Plano */}
              <div className="flex items-center space-x-3">
                <Badge 
                  variant="secondary" 
                  className={`${
                    currentPlan === 'STARTER' ? 'bg-gray-100 text-gray-800' :
                    currentPlan === 'PRO' ? 'bg-blue-100 text-blue-800' :
                    currentPlan === 'WEALTH' ? 'bg-purple-100 text-purple-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentPlan === 'STARTER' && <Star className="w-4 h-4 mr-1" />}
                  {(currentPlan === 'WEALTH' || currentPlan === 'OFFSHORE') && <Crown className="w-4 h-4 mr-1" />}
                  {planConfig?.name || currentPlan}
                </Badge>
                
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPlan === 'STARTER' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {currentPlan === 'STARTER' ? '⚡ Fazer Upgrade' : '⚙️ Gerenciar Plano'}
                </button>
              </div>
            </div>

            {/* Seção de Assinatura para usuários Starter */}
            {currentPlan === 'STARTER' && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Desbloqueie todo o potencial do ETF Curator
                      </h3>
                      <p className="text-sm text-gray-600">
                        Acesse screener avançado, rankings completos e comparações detalhadas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">A partir de</div>
                      <div className="text-xl font-bold text-blue-600">R$ 39,90/mês</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Assinatura para usuários Premium */}
            {currentPlan !== 'STARTER' && (
              <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Plano {planConfig?.name || currentPlan} Ativo
                      </h3>
                      <p className="text-sm text-gray-600">
                        Você tem acesso completo a todas as funcionalidades premium
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      ✓ Ativo
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
            
          {/* Aviso sobre ETFs */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  <strong>💡 Lembre-se:</strong> ETFs são negociados em dólares (USD)
                </span>
              </div>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>

          {/* Toggle de Moeda */}
          <div className="mb-6 flex justify-center">
            <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
              <button
                onClick={() => setCurrencyDisplay('BRL')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currencyDisplay === 'BRL'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ver em Reais (R$)
              </button>
              <button
                onClick={() => setCurrencyDisplay('USD')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currencyDisplay === 'USD'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ver em Dólares (US$)
              </button>
            </div>
          </div>

          {/* Métricas Principais - O que Realmente Importa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Widget 1: Patrimônio Atual - Sempre disponível */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-600">Meu Patrimônio</h3>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {currencyDisplay === 'BRL' 
                  ? currencyService.formatCurrency(metrics?.currentValueBRL || 0, 'BRL')
                  : currencyService.formatCurrency(metrics?.currentValueUSD || 0, 'USD')
                }
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {metrics && metrics.monthlyGainBRL > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metrics && metrics.monthlyGainBRL > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currencyDisplay === 'BRL'
                      ? currencyService.formatCurrency(Math.abs(metrics?.monthlyGainBRL || 0), 'BRL')
                      : currencyService.formatCurrency(Math.abs(metrics?.monthlyGainUSD || 0), 'USD')
                    } este mês
                  </span>
                </div>
              </div>
              {currencyDisplay === 'BRL' && (
                <div className="text-xs text-gray-500 mt-2">
                  ≈ {currencyService.formatCurrency(metrics?.currentValueUSD || 0, 'USD')} em dólares
                </div>
              )}
              {currencyDisplay === 'USD' && (
                <div className="text-xs text-gray-500 mt-2">
                  ≈ {currencyService.formatCurrency(metrics?.currentValueBRL || 0, 'BRL')} em reais
                </div>
              )}
            </div>

            {/* Widget 2: Progresso para Meta - Sempre disponível */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-600">Progresso da Meta</h3>
                </div>
                {metrics?.isOnTrack ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {userProfile && metrics ? 
                  Math.round((metrics.currentValueBRL / userProfile.targetAmount) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">
                Faltam {metrics ? formatMonths(metrics.monthsToGoal) : 'calculando...'}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full ${metrics?.isOnTrack ? 'bg-green-600' : 'bg-yellow-600'}`}
                  style={{ 
                    width: `${userProfile && metrics ? 
                      Math.min((metrics.currentValueBRL / userProfile.targetAmount) * 100, 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Widget 3: Exposição ao Dólar - Apenas PRO+ */}
            <FeatureGate 
              featureKey="dashboard_complete"
              requiredPlan="PRO"
              fallback={
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
                  <Shield className="w-8 h-8 text-gray-400 mb-2" />
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Widget Premium</h3>
                  <p className="text-xs text-gray-500 mb-3">Análise de exposição ao dólar</p>
                  <Badge variant="outline" className="text-xs">PRO+</Badge>
                </div>
              }
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-600">Exposição USD</h3>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {currencyDisplay === 'BRL'
                    ? currencyService.formatCurrency((metrics?.dollarExposure || 0) * (metrics?.exchangeRate || 5.5), 'BRL')
                    : currencyService.formatCurrency(metrics?.dollarExposure || 0, 'USD')
                  }
                </div>
                <div className="text-sm text-gray-600">
                  70% do patrimônio em ETFs
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  💡 Diversificação internacional
                </div>
              </div>
            </FeatureGate>
          </div>

          {/* Informações do Câmbio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Câmbio USD/BRL
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  R$ {currencyService.formatNumber(metrics?.exchangeRate || 5.5)}
                </div>
                <div className="text-sm text-gray-600">Taxa atual</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold flex items-center justify-center ${getVariationColor(metrics?.exchangeVariation || '0')}`}>
                  {getVariationIcon(metrics?.exchangeVariation || '0')}
                  <span className="ml-1">R$ {metrics?.exchangeVariation || '0.00'}</span>
                </div>
                <div className="text-sm text-gray-600">Variação</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getVariationColor(metrics?.exchangeVariation || '0')}`}>
                  {metrics?.exchangePctChange || '0.00'}%
                </div>
                <div className="text-sm text-gray-600">Variação %</div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas - O que Precisa Fazer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">O que fazer agora?</h2>
            </div>

            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    action.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    action.type === 'opportunity' ? 'border-blue-500 bg-blue-50' :
                    'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {action.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />}
                        {action.type === 'opportunity' && <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />}
                        {action.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mr-2" />}
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    </div>
                    <button className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                      action.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                      action.type === 'opportunity' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                      'bg-green-600 text-white hover:bg-green-700'
                    }`}>
                      {action.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Simular Carteira</h3>
              <p className="text-gray-600 mb-4">
                Teste diferentes combinações de ETFs e veja o impacto no seu objetivo
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Ir para Simulador
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Encontrar ETFs</h3>
              <p className="text-gray-600 mb-4">
                Descubra os melhores ETFs para seu perfil e objetivos
              </p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Ver Rankings
              </button>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
} 