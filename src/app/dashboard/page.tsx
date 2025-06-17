"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import MarketMetrics from '@/components/dashboard/MarketMetrics';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  BarChart3, 
  Shield, 
  Target, 
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface UserProfile {
  name: string;
  experience: string;
  objective: string;
  riskTolerance: number;
  timeHorizon: string;
  monthlyInvestment: number;
  totalPatrimony: number;
  profile: string;
}

interface ETF {
  symbol: string;
  name?: string | null;
  assetclass?: string | null;
  etfcompany?: string | null;
  expense_ratio?: number | null;
  returns_12m?: number | null;
  volatility_12m?: number | null;
  sharpe_12m?: number | null;
  dividend_yield?: number | null;
  nav?: number | null;
}

interface MarketMetricsData {
  totalETFs: number;
  avgReturn: number;
  avgVolatility: number;
  topPerformer: string;
  marketTrend: 'up' | 'down' | 'stable';
}

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function DashboardPage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedETFs, setRecommendedETFs] = useState<ETF[]>([]);
  const [marketMetrics, setMarketMetrics] = useState<MarketMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário e recomendações
  useEffect(() => {
    if (!authLoading) {
      loadUserData();
      loadRecommendations();
      loadMarketMetrics();
    }
  }, [authLoading, authProfile]);

  const loadUserData = () => {
    // Priorizar dados do usuário autenticado
    if (authProfile) {
      setUserProfile({
        name: authProfile.name || authProfile.full_name || 'Usuário',
        experience: authProfile.experience || authProfile.investment_experience || 'Iniciante',
        objective: authProfile.objective || 'Crescimento',
        riskTolerance: authProfile.risk_tolerance || 5,
        timeHorizon: authProfile.time_horizon || 'Médio prazo',
        monthlyInvestment: authProfile.monthly_investment || 1000,
        totalPatrimony: authProfile.total_patrimony || 10000,
        profile: authProfile.profile || 'Moderado'
      });
    } else {
      // Fallback para localStorage se não estiver autenticado
      const savedProfile = localStorage.getItem('etf-curator-profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    }
  };

  const loadRecommendations = async () => {
    try {
      let profileData: { profile: string } | null = null;
      
      // Priorizar dados do usuário autenticado
      if (authProfile) {
        profileData = {
          profile: authProfile.profile || 'Moderado'
        };
      } else {
        const savedProfile = localStorage.getItem('etf-curator-profile');
        if (savedProfile) {
          profileData = JSON.parse(savedProfile);
        }
      }
      
      if (!profileData) return;
      
      // Buscar ETFs baseados no perfil
      let url = '/api/etfs/screener?limit=10&only_complete=true';
      
      // Filtros baseados no perfil
      switch (profileData.profile) {
        case 'Conservador':
          url += '&return_12m_min=3&sharpe_12m_min=0.5';
          break;
        case 'Moderado':
          url += '&return_12m_min=5&sharpe_12m_min=0.8';
          break;
        case 'Arrojado':
          url += '&return_12m_min=8&sharpe_12m_min=1.0';
          break;
        default:
          url += '&return_12m_min=5';
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecommendedETFs(data.etfs?.slice(0, 6) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    }
  };

  const loadMarketMetrics = async () => {
    try {
      console.log('🔍 Carregando métricas de mercado em tempo real...');
      
      const response = await fetch('/api/market/metrics');
      if (response.ok) {
        const data = await response.json();
        
        setMarketMetrics({
          totalETFs: data.totalETFs,
          avgReturn: data.avgReturn,
          avgVolatility: data.avgVolatility,
          topPerformer: data.topPerformer,
          marketTrend: data.marketTrend
        });
        
        console.log(`✅ Métricas carregadas: ${data.totalETFs} ETFs, retorno médio ${data.avgReturn}%`);
      } else {
        throw new Error('Falha ao carregar métricas');
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      
      // Fallback para dados básicos
      setMarketMetrics({
        totalETFs: 4409,
        avgReturn: 8.2,
        avgVolatility: 16.8,
        topPerformer: 'SGOV',
        marketTrend: 'up'
      });
    } finally {
      setLoading(false);
    }
  };

  // Formatação de valores
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  // CORREÇÃO: Os dados vêm em formato decimal do banco (0.359224 = 35.92%)
  return `${(Number(value) * 100).toFixed(2)}%`;
};

  // Obter insights baseados no perfil
  const getProfileInsights = (): Insight[] => {
    if (!userProfile) return [];

    const insights: Insight[] = [];

    // Insight sobre autenticação
    if (user) {
      insights.push({
        type: 'success',
        title: 'Conta Conectada',
        message: 'Seus dados estão sincronizados e seguros na nuvem.'
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Crie uma Conta',
        message: 'Faça login para sincronizar seus dados e acessar recursos exclusivos.'
      });
    }

    // Insight sobre diversificação
    if (userProfile.monthlyInvestment >= 1000) {
      insights.push({
        type: 'success',
        title: 'Capacidade de Diversificação',
        message: 'Seu aporte mensal permite boa diversificação entre diferentes asset classes.'
      });
    }

    // Insight sobre horizonte temporal
    if (userProfile.timeHorizon === 'Longo prazo (mais de 10 anos)') {
      insights.push({
        type: 'info',
        title: 'Vantagem do Tempo',
        message: 'Seu horizonte longo permite assumir mais riscos para maiores retornos.'
      });
    }

    // Insight sobre tolerância ao risco
    if (userProfile.riskTolerance >= 8) {
      insights.push({
        type: 'warning',
        title: 'Alta Tolerância ao Risco',
        message: 'Considere ETFs de crescimento e mercados emergentes para maximizar retornos.'
      });
    }

    return insights;
  };

  // Obter alocação sugerida baseada no perfil
  const getSuggestedAllocation = () => {
    if (!userProfile) return null;

    switch (userProfile.profile) {
      case 'Conservador':
        return {
          bonds: 60,
          stocks: 30,
          international: 10,
          description: 'Foco em estabilidade e preservação de capital'
        };
      case 'Moderado':
        return {
          bonds: 40,
          stocks: 45,
          international: 15,
          description: 'Equilíbrio entre crescimento e estabilidade'
        };
      case 'Arrojado':
        return {
          bonds: 20,
          stocks: 60,
          international: 20,
          description: 'Foco em crescimento de longo prazo'
        };
      default:
        return {
          bonds: 50,
          stocks: 40,
          international: 10,
          description: 'Alocação balanceada para iniciantes'
        };
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando seu dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Perfil não encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user ? 
                'Complete seu perfil de investidor para acessar recomendações personalizadas' :
                'Complete o onboarding para acessar seu dashboard personalizado'
              }
            </p>
            <div className="mt-6">
              <a
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {user ? 'Completar Perfil' : 'Fazer Onboarding'}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const insights = getProfileInsights();
  const allocation = getSuggestedAllocation();

  return (
    <RequireAuth requireProfile={true}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {userProfile.name}! 👋
          </h1>
          <p className="text-gray-600">
            Seu dashboard personalizado com insights e recomendações
            {user && <span className="ml-2 text-green-600">• Conta conectada</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resumo do Perfil */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Seu Perfil de Investidor</h2>
                {user && (
                  <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Sincronizado
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Perfil</p>
                  <p className="font-medium text-gray-900">{userProfile.profile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experiência</p>
                  <p className="font-medium text-gray-900">{userProfile.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Objetivo</p>
                  <p className="font-medium text-gray-900">{userProfile.objective}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tolerância ao Risco</p>
                  <p className="font-medium text-gray-900">{userProfile.riskTolerance}/10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horizonte</p>
                  <p className="font-medium text-gray-900">{userProfile.timeHorizon}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aporte Mensal</p>
                  <p className="font-medium text-gray-900">{formatCurrency(userProfile.monthlyInvestment)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patrimônio</p>
                  <p className="font-medium text-gray-900">{formatCurrency(userProfile.totalPatrimony)}</p>
                </div>
              </div>
            </div>

            {/* ETFs Recomendados */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">ETFs Recomendados para Você</h2>
                </div>
                <a
                  href="/screener"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>

              {recommendedETFs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedETFs.map((etf) => (
                    <div key={etf.symbol} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{etf.symbol}</h3>
                          <p className="text-sm text-gray-500 truncate">{etf.name}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {etf.assetclass}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Retorno 12m</p>
                          <p className={`font-medium ${(etf.returns_12m || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(etf.returns_12m)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Volatilidade</p>
                          <p className="font-medium text-gray-900">{formatPercentage(etf.volatility_12m)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sharpe</p>
                          <p className="font-medium text-gray-900">{etf.sharpe_12m?.toFixed(2) || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Carregando recomendações personalizadas...
                </p>
              )}
            </div>

            {/* Insights Personalizados */}
            {insights.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Insights Personalizados</h2>
                </div>
                
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'success' ? 'bg-green-50 border-green-400' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start">
                        {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />}
                        {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />}
                        {insight.type === 'info' && <Zap className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />}
                        <div>
                          <h3 className="font-medium text-gray-900">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Métricas de Mercado */}
            {marketMetrics && (
              <MarketMetrics metrics={marketMetrics} loading={loading} />
            )}

            {/* Alocação Sugerida */}
            {allocation && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-5 h-5 mr-2 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Alocação Sugerida</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Renda Fixa</span>
                    <span className="font-medium">{allocation.bonds}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${allocation.bonds}%`}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ações (EUA)</span>
                    <span className="font-medium">{allocation.stocks}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: `${allocation.stocks}%`}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Internacional</span>
                    <span className="font-medium">{allocation.international}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: `${allocation.international}%`}}></div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">{allocation.description}</p>
              </div>
            )}

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <a
                  href="/comparador"
                  className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Comparar ETFs</p>
                      <p className="text-xs text-gray-500">Compare até 4 ETFs lado a lado</p>
                    </div>
                  </div>
                </a>
                
                <a
                  href="/screener"
                  className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Buscar ETFs</p>
                      <p className="text-xs text-gray-500">Use filtros avançados</p>
                    </div>
                  </div>
                </a>
                
                <a
                  href="/rankings"
                  className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Ver Rankings</p>
                      <p className="text-xs text-gray-500">Melhores ETFs por categoria</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </RequireAuth>
  );
} 