"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/hooks/useAuth';
import { formatPercentage } from '@/lib/formatters';
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  ArrowRight,
  Lightbulb,
  Shield
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
  currentValue: number;
  monthlyGain: number;
  monthlyGainPercent: number;
  isOnTrack: boolean;
  monthsToGoal: number;
  dollarImpact: number;
}

interface QuickAction {
  type: 'warning' | 'opportunity' | 'success';
  title: string;
  description: string;
  action: string;
}

export default function DashboardPage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<SimpleMetrics | null>(null);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);

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
        targetAmount: authProfile.target_amount || 1000000,
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

  const calculateSimpleMetrics = () => {
    // Simulação de métricas baseada no perfil
    const baseReturn = 0.08; // 8% ao ano
    const currentValue = userProfile?.totalPatrimony || 50000;
    const monthlyGain = currentValue * (baseReturn / 12);
    const monthlyGainPercent = baseReturn / 12;
    
    // Cálculo simples se está no caminho
    const monthlyNeeded = userProfile?.monthlyInvestment || 1000;
    const targetAmount = userProfile?.targetAmount || 1000000;
    const yearsToGoal = Math.log(targetAmount / currentValue) / Math.log(1 + baseReturn);
    const monthsToGoal = Math.round(yearsToGoal * 12);
    const isOnTrack = monthsToGoal <= 180; // 15 anos

    // Impacto do dólar (simulado)
    const dollarImpact = currentValue * 0.02; // 2% de impacto cambial

    setMetrics({
      currentValue,
      monthlyGain,
      monthlyGainPercent,
      isOnTrack,
      monthsToGoal,
      dollarImpact
    });
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
    actions.push({
      type: 'opportunity',
      title: 'Dólar em alta',
      description: 'Momento favorável para aumentar exposição internacional',
      action: 'Ver ETFs'
    });

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

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatMonths = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${remainingMonths} meses`;
    if (remainingMonths === 0) return `${years} anos`;
    return `${years} anos e ${remainingMonths} meses`;
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
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {userProfile?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Vamos verificar como está seu progresso para {userProfile?.objective.toLowerCase()}
            </p>
          </div>

          {/* Métricas Principais - O que Realmente Importa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Patrimônio Atual */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-600">Meu Patrimônio</h3>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(metrics?.currentValue || 0)}
              </div>
              <div className="flex items-center">
                {metrics && metrics.monthlyGain > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metrics && metrics.monthlyGain > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics ? formatCurrency(Math.abs(metrics.monthlyGain)) : 'R$ 0'} este mês
                </span>
              </div>
            </div>

            {/* Progresso para Meta */}
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
                  Math.round((metrics.currentValue / userProfile.targetAmount) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">
                Faltam {metrics ? formatMonths(metrics.monthsToGoal) : 'calculando...'}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full ${metrics?.isOnTrack ? 'bg-green-600' : 'bg-yellow-600'}`}
                  style={{ 
                    width: `${userProfile && metrics ? 
                      Math.min((metrics.currentValue / userProfile.targetAmount) * 100, 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Impacto do Dólar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-600">Exposição USD</h3>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(metrics?.dollarImpact || 0)}
              </div>
              <div className="text-sm text-gray-600">
                Impacto cambial estimado
              </div>
              <div className="text-xs text-gray-500 mt-2">
                💡 Diversifique com ETFs internacionais
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