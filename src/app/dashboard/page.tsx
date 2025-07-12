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
  Star,
  BarChart3,
  PieChart,
  Zap,
  Award,
  Activity,
  Eye,
  Clock
} from 'lucide-react';
import { getPlanConfig } from '@/types/subscriptions';
import MarketMetrics from '@/components/dashboard/MarketMetrics';
import Link from 'next/link';

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
  const { currentPlan } = useSubscription();
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
        
        <div className="max-w-6xl mx-auto px-6 py-20">
          
          {/* Header */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-5xl font-light text-gray-900 mb-4">
                  Dashboard
                </h1>
                <p className="text-xl font-light text-gray-600">
                  Acompanhe o mercado e suas análises em tempo real
                </p>
              </div>
              <Badge className="px-6 py-2 bg-green-100 text-green-800 font-light rounded-full">
                Mercado Aberto
              </Badge>
            </div>
          </div>

          {/* Market Overview */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Visão Geral do Mercado
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" style={{ color: '#0090d8' }} />
                  </div>
                  <Badge className="bg-green-100 text-green-800 font-light">
                    +2.4%
                  </Badge>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">
                  1.370
                </h3>
                <p className="text-gray-600 font-light">
                  ETFs Analisados
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" style={{ color: '#0090d8' }} />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 font-light">
                    +0.8%
                  </Badge>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">
                  $2.4T
                </h3>
                <p className="text-gray-600 font-light">
                  AUM Total
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" style={{ color: '#0090d8' }} />
                  </div>
                  <Badge className="bg-green-100 text-green-800 font-light">
                    +1.2%
                  </Badge>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">
                  12.8%
                </h3>
                <p className="text-gray-600 font-light">
                  Retorno Médio
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-red-600" />
                  </div>
                  <Badge className="bg-red-100 text-red-800 font-light">
                    -0.3%
                  </Badge>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">
                  14.2%
                </h3>
                <p className="text-gray-600 font-light">
                  Volatilidade Média
                </p>
              </div>
            </div>
          </div>

          {/* Market Metrics Component */}
          <div className="mb-20">
            <MarketMetrics 
              metrics={{
                totalETFs: 1370,
                avgReturn: 12.5,
                avgVolatility: 16.8,
                topPerformer: "QQQ",
                marketTrend: "up" as const,
                totalAssets: 25000000000,
                activeETFs: 1370
              }}
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Ações Rápidas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <Target className="w-8 h-8 text-[#0090d8]" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0090d8] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Portfolio Master
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Crie carteiras otimizadas com algoritmos avançados de Markowitz
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <PieChart className="w-8 h-8 text-[#0090d8]" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0090d8] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Simulador Avançado
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Simule cenários com projeções Monte Carlo e backtesting
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <Eye className="w-8 h-8 text-[#0090d8]" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0090d8] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Screener ETFs
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Filtre e descubra ETFs com critérios personalizados
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <BarChart3 className="w-8 h-8 text-[#0090d8]" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0090d8] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Comparador
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Compare performance e métricas de diferentes ETFs
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <TrendingUp className="w-8 h-8 text-[#0090d8]" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0090d8] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Rankings
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Descubra os ETFs com melhor performance do mercado
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md group cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <Award className="w-8 h-8 text-[#0090d8]" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0090d8] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Consultoria CVM
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Assessoria personalizada com consultores certificados
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Atividade Recente
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#0090d8]" />
                      </div>
                      <div>
                        <p className="font-light text-gray-900">
                          Portfolio Master executado
                        </p>
                        <p className="text-sm text-gray-500">
                          Carteira otimizada com 5 ETFs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-light text-gray-600">
                        Há 2 horas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <PieChart className="w-5 h-5 text-[#0090d8]" />
                      </div>
                      <div>
                        <p className="font-light text-gray-900">
                          Simulação Monte Carlo
                        </p>
                        <p className="text-sm text-gray-500">
                          Projeção de 10 anos realizada
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-light text-gray-600">
                        Há 5 horas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Eye className="w-5 h-5 text-[#0090d8]" />
                      </div>
                      <div>
                        <p className="font-light text-gray-900">
                          Screener personalizado
                        </p>
                        <p className="text-sm text-gray-500">
                          12 ETFs encontrados
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-light text-gray-600">
                        Ontem
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Insights de Performance
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-gray-900">
                    Melhores Performers
                  </h3>
                  <Badge className="bg-green-100 text-green-800 font-light">
                    Esta Semana
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-light text-[#0090d8]">1</span>
                      </div>
                      <div>
                        <p className="font-light text-gray-900">QQQ</p>
                        <p className="text-sm text-gray-500">Invesco QQQ Trust</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-light text-green-600">+4.2%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-light text-[#0090d8]">2</span>
                      </div>
                      <div>
                        <p className="font-light text-gray-900">SPY</p>
                        <p className="text-sm text-gray-500">SPDR S&P 500 ETF</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-light text-green-600">+2.8%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-light text-[#0090d8]">3</span>
                      </div>
                      <div>
                        <p className="font-light text-gray-900">VTI</p>
                        <p className="text-sm text-gray-500">Vanguard Total Stock</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-light text-green-600">+2.1%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-light text-gray-900">
                    Setores em Alta
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800 font-light">
                    Hoje
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-light text-gray-900">Technology</p>
                      <p className="text-sm text-gray-500">45 ETFs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-light text-green-600">+3.1%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-light text-gray-900">Healthcare</p>
                      <p className="text-sm text-gray-500">28 ETFs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-light text-green-600">+1.8%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-light text-gray-900">Financials</p>
                      <p className="text-sm text-gray-500">32 ETFs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-light text-green-600">+1.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section - ALTERADO conforme solicitação */}
          <div style={{ backgroundColor: '#202636' }} className="w-full py-16 px-6 text-center">
            <h2 className="text-3xl font-light text-white mb-6">
              Pronto para Otimizar sua Carteira?
            </h2>
            <p className="text-lg font-light text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Use nossas ferramentas avançadas para criar uma carteira de ETFs 
              otimizada baseada em dados científicos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-light transition-all duration-300 hover:bg-gray-100">
                Começar Portfolio Master
              </button>
              <button 
                className="px-8 py-3 rounded-xl font-light transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: '#0090d8', color: 'white' }}
              >
                Agendar Consultoria CVM
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer - ADICIONADO idêntico ao da landing page */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Contato */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contato</h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  <strong>Email:</strong><br />
                  contato@vista.com.br
                </p>
                <p className="text-gray-600">
                  <strong>Suporte:</strong><br />
                  suporte@vista.com.br
                </p>
                <p className="text-gray-600">
                  <strong>Consultoria:</strong><br />
                  consultoria@vista.com.br
                </p>
              </div>
            </div>

            {/* Planos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Planos</h3>
              <div className="space-y-3">
                <div>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                    Starter
                  </Link>
                  <p className="text-sm text-gray-500">Gratuito</p>
                </div>
                <div>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                    Pro
                  </Link>
                  <p className="text-sm text-gray-500">R$ 39,90/mês</p>
                </div>
                <div>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                    Wealth
                  </Link>
                  <p className="text-sm text-gray-500">1% a.a. sobre patrimônio</p>
                </div>
                <div>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                    Offshore
                  </Link>
                  <p className="text-sm text-gray-500">0,8% a.a. sobre patrimônio</p>
                </div>
              </div>
            </div>

            {/* Links Úteis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Suporte</h3>
              <div className="space-y-3">
                <div>
                  <Link href="/faq" className="text-gray-600 hover:text-gray-900">
                    FAQ
                  </Link>
                </div>
                <div>
                  <Link href="/contato" className="text-gray-600 hover:text-gray-900">
                    Central de Ajuda
                  </Link>
                </div>
                <div>
                  <Link href="/consultoria" className="text-gray-600 hover:text-gray-900">
                    Consultoria CVM
                  </Link>
                </div>
                <div>
                  <Link href="/termos" className="text-gray-600 hover:text-gray-900">
                    Termos de Uso
                  </Link>
                </div>
                <div>
                  <Link href="/privacidade" className="text-gray-600 hover:text-gray-900">
                    Política de Privacidade
                  </Link>
                </div>
              </div>
            </div>

            {/* Redes Sociais e CVM */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Conecte-se</h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <a 
                    href="https://instagram.com/vista.etfs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <span>📷</span> Instagram
                  </a>
                  <a 
                    href="https://linkedin.com/company/vista-etfs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <span>💼</span> LinkedIn
                  </a>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Regulamentação CVM</strong>
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Vista é uma plataforma de análise de ETFs. Serviços de consultoria são prestados por consultores registrados na CVM conforme Resolução 179/2023.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé inferior */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-light text-gray-900">Vista</span>
                <span className="text-sm text-gray-500">© 2024 Vista. Todos os direitos reservados.</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>Análise científica de ETFs</span>
                <span>•</span>
                <span>Dados em tempo real</span>
                <span>•</span>
                <span>Consultoria CVM</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </RequireAuth>
  );
} 