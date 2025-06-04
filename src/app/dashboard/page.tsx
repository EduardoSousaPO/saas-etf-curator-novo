"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Filter,
  Brain,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Shield
} from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { personalizeScheduler } from '@/lib/dashboard/personalizer';
import type { 
  PersonalizedDashboard, 
  DashboardWidget as WidgetType 
} from '@/lib/dashboard/personalizer';
import type { InvestorProfile } from '@/lib/onboarding/profiles';
import MobileDashboard from '@/components/dashboard/MobileDashboard';
import { Button } from "@/components/ui/button";

// Types para dados das APIs
interface ETFData {
  symbol: string;
  name: string;
  returns_12m: number;
  dividend_yield: number;
  total_assets: number;
  volatility_12m: number;
  sharpe_12m: number;
  fmp_data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface RankingsData {
  top_returns_12m: ETFData[];
  top_dividend_yield: ETFData[];
  top_sharpe: ETFData[];
  largest_assets: ETFData[];
}

interface MarketIndex {
  symbol: string;
  name: string;
  change: number;
  price?: number;
}

// Função utilitária para converter valores Decimal com segurança
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Função para formatar percentual (dados já vêm em %)
const formatPercentage = (value: any, decimals: number = 1): string => {
  return safeNumber(value).toFixed(decimals);
};

export default function DashboardPage() {
  const [personalizedDashboard, setPersonalizedDashboard] = useState<PersonalizedDashboard | null>(null);
  const [userProfile, setUserProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rankingsData, setRankingsData] = useState<RankingsData | null>(null);
  const router = useRouter();

  const redirectToOnboarding = () => {
    router.push('/onboarding');
  };

  const loadDashboardData = async () => {
    try {
      // Carregar dados de rankings
      const rankingsResponse = await fetch('/api/etfs/rankings');
      if (rankingsResponse.ok) {
        const data = await rankingsResponse.json();
        setRankingsData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  useEffect(() => {
    // Carregar perfil do usuário
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setUserProfile(profileData.profile);
        
        // Gerar dashboard personalizado
        const dashboard = personalizeScheduler(profileData.profile);
        setPersonalizedDashboard(dashboard);
        
        // Carregar dados das APIs
        loadDashboardData();
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        redirectToOnboarding();
      }
    } else {
      redirectToOnboarding();
    }
    
    setIsLoading(false);
  }, []);

  const renderWidget = (widget: WidgetType) => {
    // Renderizar diferentes tipos de widget baseado no component
    switch (widget.component) {
      case 'PortfolioOverview':
        return <PortfolioOverviewWidget rankingsData={rankingsData} />;
      case 'MarketSummary':
        return <MarketSummaryWidget />;
      case 'TopETFs':
        return <TopETFsWidget rankingsData={rankingsData} />;
      case 'AIRecommendations':
        return <AIRecommendationsWidget profile={userProfile!} rankingsData={rankingsData} />;
      case 'RiskAnalysis':
        return <RiskAnalysisWidget rankingsData={rankingsData} />;
      case 'EducationalContent':
        return <EducationalContentWidget />;
      default:
        return <PlaceholderWidget component={widget.component} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard personalizado...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || !personalizedDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Perfil não encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            Para usar o dashboard, você precisa completar seu perfil de investidor.
          </p>
          <button
            onClick={redirectToOnboarding}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Completar Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Dashboard - Mostrado apenas em telas pequenas */}
      <MobileDashboard 
        userProfile={userProfile}
        rankingsData={rankingsData}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />
      
      {/* Desktop Dashboard - Oculto em mobile */}
      <div className="min-h-screen bg-gray-50 hidden lg:block">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <LayoutDashboard className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Dashboard {userProfile.name}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {userProfile.description}
                    </p>
                  </div>
                </div>
                <div className="text-2xl">{userProfile.icon}</div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Widget</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Recomendações */}
          {personalizedDashboard.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                💡 Recomendações para você
              </h3>
              <ul className="space-y-2">
                {personalizedDashboard.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-blue-800">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
            {/* Primary Widgets */}
            {personalizedDashboard.layout.primary.map((widget) => (
              <DashboardWidget
                key={widget.id}
                title={widget.title}
                description={widget.description}
                size={widget.size}
              >
                {renderWidget(widget)}
              </DashboardWidget>
            ))}

            {/* Secondary Widgets */}
            {personalizedDashboard.layout.secondary.map((widget) => (
              <DashboardWidget
                key={widget.id}
                title={widget.title}
                description={widget.description}
                size={widget.size}
              >
                {renderWidget(widget)}
              </DashboardWidget>
            ))}

            {/* Sidebar Widgets */}
            {personalizedDashboard.layout.sidebar.map((widget) => (
              <DashboardWidget
                key={widget.id}
                title={widget.title}
                description={widget.description}
                size={widget.size}
              >
                {renderWidget(widget)}
              </DashboardWidget>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Componentes de Widget com dados REAIS
function PortfolioOverviewWidget({ rankingsData }: { rankingsData: RankingsData | null }) {
  const [portfolioStats, setPortfolioStats] = useState({
    totalReturn: 0,
    totalValue: 0,
    topPerformer: '',
    riskLevel: 'Moderado'
  });

  useEffect(() => {
    if (rankingsData) {
      // Simular portfolio baseado nos top ETFs
      const topETFs = rankingsData.top_returns_12m.slice(0, 3);
      const avgReturn = topETFs.reduce((sum, etf) => sum + safeNumber(etf.returns_12m), 0) / topETFs.length;
      
      setPortfolioStats({
        totalReturn: avgReturn,
        totalValue: 10000 * (1 + avgReturn / 100), // Converter % para decimal para cálculo
        topPerformer: topETFs[0]?.symbol || 'N/A',
        riskLevel: avgReturn > 15 ? 'Alto' : avgReturn > 5 ? 'Moderado' : 'Baixo'
      });
    }
  }, [rankingsData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Portfolio Performance</h3>
            <p className="text-blue-700 text-sm">Retorno médio dos top ETFs</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-blue-900">
          {portfolioStats.totalReturn >= 0 ? '+' : ''}{portfolioStats.totalReturn.toFixed(1)}%
        </div>
        <div className="text-blue-700 text-sm mt-2">Últimos 12 meses</div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">Top Performer</h3>
            <p className="text-green-700 text-sm">Melhor ETF do período</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-900">{portfolioStats.topPerformer}</div>
        <div className="text-green-700 text-sm mt-2">Nível de risco: {portfolioStats.riskLevel}</div>
      </div>
    </div>
  );
}

function MarketSummaryWidget() {
  const [marketData, setMarketData] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        // Buscar dados dos principais índices via nossa API enhanced
        const response = await fetch('/api/etfs/enhanced?symbols=SPY,QQQ,IWM&enhanced=true&limit=3');
        if (response.ok) {
          const data = await response.json();
          const etfs = data.data || [];
          
          const marketIndices = etfs.map((etf: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            symbol: etf.symbol,
            name: etf.symbol === 'SPY' ? 'S&P 500' : 
                  etf.symbol === 'QQQ' ? 'NASDAQ' : 
                  'Russell 2000',
            change: (etf.returns_12m || 0),
            price: etf.fmp_data?.nav || null
          }));
          
          setMarketData(marketIndices);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do mercado:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {marketData.map((index) => (
        <div key={index.symbol} className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">{index.name}</span>
            <div className="text-xs text-gray-500">{index.symbol}</div>
          </div>
          <div className="text-right">
            <span className={`font-medium text-sm ${
              index.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {index.change >= 0 ? '+' : ''}{index.change.toFixed(1)}%
            </span>
            {index.price && (
              <div className="text-xs text-gray-500">${index.price.toFixed(2)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopETFsWidget({ rankingsData }: { rankingsData: RankingsData | null }) {
  if (!rankingsData || !rankingsData.top_returns_12m) {
    return <div className="text-center py-4 text-gray-500">Carregando dados dos ETFs...</div>;
  }

  const topETFs = rankingsData.top_returns_12m.slice(0, 5);

  return (
    <div className="space-y-4">
      {topETFs.map((etf, index) => (
        <div key={etf.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
              {index + 1}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{etf.symbol}</div>
              <div className="text-sm text-gray-600 truncate max-w-[200px]">{etf.name}</div>
            </div>
          </div>
          <div className="text-green-600 font-bold">
            +{formatPercentage(etf.returns_12m)}%
          </div>
        </div>
      ))}
    </div>
  );
}

function AIRecommendationsWidget({ profile, rankingsData }: { profile: InvestorProfile; rankingsData: RankingsData | null }) {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (rankingsData && profile) {
      const recs: string[] = [];
      
      // Recomendações baseadas no perfil e dados reais
      if (profile.id === 'conservative' && rankingsData.top_dividend_yield.length > 0) {
        const topDividend = rankingsData.top_dividend_yield[0];
        recs.push(`Considere ${topDividend.symbol} com dividend yield de ${formatPercentage(topDividend.dividend_yield)}%`);
      }
      
      if (profile.id === 'aggressive' && rankingsData.top_returns_12m.length > 0) {
        const topReturn = rankingsData.top_returns_12m[0];
        recs.push(`${topReturn.symbol} teve retorno de ${formatPercentage(topReturn.returns_12m)}% em 12m`);
      }
      
      if (rankingsData.top_sharpe && rankingsData.top_sharpe.length > 0) {
        const topSharpe = rankingsData.top_sharpe[0];
        recs.push(`${topSharpe.symbol} tem excelente relação risco/retorno`);
      }
      
      setRecommendations(recs.slice(0, 2));
    }
  }, [profile, rankingsData]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium">Baseado em dados reais</span>
      </div>
      <div className="space-y-3 flex-1">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-3 bg-purple-50 rounded-lg">
            <div className="text-sm font-medium text-purple-900">
              ETF Recomendado
            </div>
            <div className="text-xs text-purple-700 mt-1">
              {rec}
            </div>
          </div>
        ))}
        {recommendations.length === 0 && (
          <div className="text-sm text-gray-500 text-center">
            Carregando recomendações...
          </div>
        )}
      </div>
    </div>
  );
}

function RiskAnalysisWidget({ rankingsData }: { rankingsData: RankingsData | null }) {
  const [riskMetrics, setRiskMetrics] = useState({
    volatility: 0,
    level: 'Moderado',
    color: 'yellow'
  });

  useEffect(() => {
    if (rankingsData) {
      // Calcular volatilidade média dos top ETFs
      const topETFs = rankingsData.top_returns_12m.slice(0, 5);
      const avgVolatility = topETFs.reduce((sum, etf) => sum + safeNumber(etf.volatility_12m), 0) / topETFs.length;
      
      let level = 'Baixo';
      let color = 'green';
      
      if (avgVolatility > 25) {
        level = 'Alto';
        color = 'red';
      } else if (avgVolatility > 15) {
        level = 'Moderado';
        color = 'yellow';
      }
      
      setRiskMetrics({
        volatility: avgVolatility,
        level,
        color
      });
    }
  }, [rankingsData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Volatilidade Média</span>
        <span className={`text-${riskMetrics.color}-600 font-medium`}>
          {riskMetrics.volatility.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${riskMetrics.color}-500 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(riskMetrics.volatility * 3, 100)}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 text-center">
        Nível: {riskMetrics.level} | Baseado em dados dos top ETFs
      </div>
    </div>
  );
}

function EducationalContentWidget() {
  return (
    <div className="space-y-3">
      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
        <div className="text-sm font-medium">Como diversificar ETFs</div>
        <div className="text-xs text-gray-500 mt-1">5 min de leitura</div>
      </div>
      <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
        <div className="text-sm font-medium">Entendendo expense ratio</div>
        <div className="text-xs text-gray-500 mt-1">3 min de leitura</div>
      </div>
    </div>
  );
}

function PlaceholderWidget({ component }: { component: string }) {
  return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <div className="text-4xl mb-2">🔧</div>
        <div className="text-sm">Widget {component}</div>
        <div className="text-xs">Em desenvolvimento</div>
      </div>
    </div>
  );
} 