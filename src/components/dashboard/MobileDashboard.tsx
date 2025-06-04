"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Award, 
  AlertTriangle,
  RefreshCw,
  Menu,
  X,
  Bell,
  Search,
  DollarSign,
  ShieldCheck,
  Briefcase,
  Info
} from 'lucide-react';
import { InvestorProfile } from '@/lib/onboarding/profiles';

interface ETFData {
  symbol: string;
  name: string;
  returns_12m: number;
  dividend_yield: number;
  total_assets: number;
  volatility_12m: number;
  sharpe_12m: number;
}

interface RankingsData {
  top_returns_12m: ETFData[];
  top_dividend_yield: ETFData[];
  top_sharpe: ETFData[];
  largest_assets: ETFData[];
}

interface MobileDashboardProps {
  userProfile: InvestorProfile;
  rankingsData: RankingsData | null;
  onRefresh: () => void;
  isLoading: boolean;
}

// Definir tipo para o estado do portfolio
interface PortfolioStatsState {
  totalReturn: number | null;
  totalValue: number;
  topPerformer: string;
  riskLevel: string;
}

export default function MobileDashboard({ 
  userProfile, 
  rankingsData, 
  onRefresh, 
  isLoading 
}: MobileDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'etfs' | 'insights'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStatsState>({
    totalReturn: null, // Inicializa como null
    totalValue: 10000,
    topPerformer: 'N/A',
    riskLevel: 'Baixo'
  });

  useEffect(() => {
    let calculatedTotalReturn: number | null = null;
    let calculatedValue = 10000;
    let calculatedTopPerformer = 'N/A';
    let calculatedRiskLevel = 'Baixo';

    if (rankingsData && rankingsData.top_returns_12m && rankingsData.top_returns_12m.length > 0) {
      const validTopETFs = rankingsData.top_returns_12m.filter(
        etf => etf.returns_12m !== null && etf.returns_12m !== undefined
      );

      if (validTopETFs.length > 0) {
        const sumOfReturns = validTopETFs.reduce((sum, etf) => sum + etf.returns_12m!, 0);
        const avgReturn = sumOfReturns / validTopETFs.length;
        
        calculatedTotalReturn = avgReturn;
        calculatedValue = 10000 * (1 + avgReturn);
        calculatedTopPerformer = validTopETFs[0]?.symbol || 'N/A';
        calculatedRiskLevel = avgReturn > 0.15 ? 'Alto' : avgReturn > 0.05 ? 'Moderado' : 'Baixo';
      } else {
        // No valid ETFs, calculatedTotalReturn remains null, others keep defaults
      }
    } else {
      // No rankingsData, calculatedTotalReturn remains null, others keep defaults
    }

    setPortfolioStats({
      totalReturn: calculatedTotalReturn,
      totalValue: calculatedValue,
      topPerformer: calculatedTopPerformer,
      riskLevel: calculatedRiskLevel
    });
  }, [rankingsData]);

  const TabButton = ({ 
    tab, 
    icon: Icon, 
    label, 
    isActive 
  }: { 
    tab: typeof activeTab; 
    icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    label: string; 
    isActive: boolean;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
        isActive 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  const MobileCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${className}`}>
      {children}
    </div>
  );

  const TopETFsMobile = ({ rankingsData }: { rankingsData: RankingsData | null }) => {
    if (!rankingsData || !rankingsData.top_returns_12m || rankingsData.top_returns_12m.length === 0) {
      return <MobileCard><p className="text-sm text-gray-500 text-center py-2">Dados de Top Retornos indisponíveis.</p></MobileCard>;
    }
    return (
      <MobileCard>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
          Top Retornos (12m)
        </h3>
        <div className="space-y-2">
          {rankingsData.top_returns_12m.slice(0, 5).map((etf, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-700 truncate max-w-[70%]">{etf.name} ({etf.symbol})</span>
              <div className={`text-sm font-semibold ${etf.returns_12m === null || etf.returns_12m === undefined ? 'text-gray-500' : etf.returns_12m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {etf.returns_12m === null || etf.returns_12m === undefined ? 'N/A' : `${etf.returns_12m >= 0 ? '+':''}${(etf.returns_12m * 100).toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>
      </MobileCard>
    );
  };

  const TopDividendsMobile = ({ rankingsData }: { rankingsData: RankingsData | null }) => {
    if (!rankingsData || !rankingsData.top_dividend_yield || rankingsData.top_dividend_yield.length === 0) {
      return <MobileCard><p className="text-sm text-gray-500 text-center py-2">Dados de Top Dividendos indisponíveis.</p></MobileCard>;
    }
    return (
      <MobileCard>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-purple-500" />
          Maiores Dividend Yields
        </h3>
        <div className="space-y-2">
          {rankingsData.top_dividend_yield.slice(0, 5).map((etf, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-700 truncate max-w-[70%]">{etf.name} ({etf.symbol})</span>
              <div className="text-sm font-semibold text-purple-600">
                {etf.dividend_yield === null || etf.dividend_yield === undefined ? 'N/A' : `${(etf.dividend_yield * 100).toFixed(2)}%`}
              </div>
            </div>
          ))}
        </div>
      </MobileCard>
    );
  };

  const AIRecommendationsMobile = ({ 
    profile, 
    rankingsData 
  }: { 
    profile: InvestorProfile; 
    rankingsData: RankingsData | null;
  }) => {
    const [recs, setRecs] = useState<string[]>([]);

    useEffect(() => {
      if (!rankingsData) {
        setRecs(["Dados de ranking indisponíveis para gerar recomendações."]);
        return;
      }
      const newRecs: string[] = [];
      if (profile.id === 'conservative' && rankingsData.top_dividend_yield && rankingsData.top_dividend_yield.length > 0) {
        const topDividend = rankingsData.top_dividend_yield[0];
        const yieldValue = topDividend.dividend_yield === null || topDividend.dividend_yield === undefined ? 'N/A' : `${(topDividend.dividend_yield * 100).toFixed(2)}%`;
        newRecs.push(`${topDividend.symbol} oferece dividend yield de ${yieldValue}.`);
      }
      
      if (profile.id === 'aggressive' && rankingsData.top_returns_12m && rankingsData.top_returns_12m.length > 0) {
        const topReturn = rankingsData.top_returns_12m[0];
        const returnValue = topReturn.returns_12m === null || topReturn.returns_12m === undefined ? 'N/A' : `${(topReturn.returns_12m * 100).toFixed(1)}%`;
        newRecs.push(`${topReturn.symbol} teve um retorno de ${returnValue} nos últimos 12 meses.`);
      }

      if (rankingsData.largest_assets && rankingsData.largest_assets.length > 0){
        const largestETF = rankingsData.largest_assets[0];
        const assetsValue = largestETF.total_assets === null || largestETF.total_assets === undefined ? 'N/A' : `${(largestETF.total_assets / 1000000000).toFixed(1)}B`;
        newRecs.push(`${largestETF.symbol} é um dos maiores ETFs com ${assetsValue} em ativos.`);
      }

      if (newRecs.length === 0) {
        newRecs.push("Não foi possível gerar recomendações específicas no momento.");
      }
      setRecs(newRecs);

    }, [profile, rankingsData]);

    return (
      <MobileCard>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Award className="w-4 h-4 mr-2 text-yellow-500" />
          Sugestões da IA
        </h3>
        <div className="space-y-3">
          {recs.map((rec, index) => (
            <div key={index} className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-900 font-medium">💡 Sugestão {index + 1}</div>
              <div className="text-xs text-blue-700 mt-1">{rec}</div>
            </div>
          ))}
          {recs.length === 0 && (
            <div className="text-center py-4 text-gray-500">Carregando recomendações...</div>
          )}
        </div>
      </MobileCard>
    );
  };

  const RiskAnalysisMobile = ({ rankingsData }: { rankingsData: RankingsData | null }) => {
    if (!rankingsData) {
      return <MobileCard><p className="text-sm text-gray-500 text-center py-2">Dados de ranking indisponíveis.</p></MobileCard>;
    }
  
    const lowestVolatility = rankingsData.top_returns_12m?.length > 0 ? [...rankingsData.top_returns_12m].sort((a,b) => (a.volatility_12m ?? Infinity) - (b.volatility_12m ?? Infinity))[0] : null;
    const highestSharpe = rankingsData.top_sharpe?.length > 0 ? rankingsData.top_sharpe[0] : null;
  
    const volValue = lowestVolatility?.volatility_12m === null || lowestVolatility?.volatility_12m === undefined 
      ? 'N/A' 
      : `${(lowestVolatility.volatility_12m * 100).toFixed(1)}%`;
  
    const sharpeValue = highestSharpe?.sharpe_12m === null || highestSharpe?.sharpe_12m === undefined
      ? 'N/A'
      : highestSharpe.sharpe_12m.toFixed(2);
  
    return (
      <MobileCard>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-blue-500" />
          Análise de Risco e Retorno
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Menor Volatilidade (12m):</span>
            <span className="text-sm font-semibold text-blue-600">
              {lowestVolatility ? `${lowestVolatility.symbol} (${volValue})` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Maior Sharpe Ratio (12m):</span>
            <span className="text-sm font-semibold text-green-600">
              {highestSharpe ? `${highestSharpe.symbol} (${sharpeValue})` : 'N/A'}
            </span>
          </div>
          {/* Adicionar mais análises se necessário */}
        </div>
      </MobileCard>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:hidden">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-600">{userProfile.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-200">
          <TabButton 
            tab="overview" 
            icon={LayoutDashboard} 
            label="Visão Geral" 
            isActive={activeTab === 'overview'} 
          />
          <TabButton 
            tab="etfs" 
            icon={TrendingUp} 
            label="Top ETFs" 
            isActive={activeTab === 'etfs'} 
          />
          <TabButton 
            tab="insights" 
            icon={Award} 
            label="Insights" 
            isActive={activeTab === 'insights'} 
          />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">{userProfile.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userProfile.name}</p>
                  <p className="text-xs text-gray-600">{userProfile.description}</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
              <a href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-700">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
              <a href="/comparator" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <BarChart3 className="w-5 h-5" />
                <span>Comparador</span>
              </a>
              <a href="/alerts" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <Bell className="w-5 h-5" />
                <span>Alertas</span>
              </a>
              <a href="/screener" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <Search className="w-5 h-5" />
                <span>Screener</span>
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Portfolio Summary */}
            <MobileCard>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${portfolioStats.totalValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mb-3">Valor Simulado</div>
                <div className="flex justify-center items-center space-x-4">
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      portfolioStats.totalReturn === null || portfolioStats.totalReturn === undefined ? 'text-gray-600' : portfolioStats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolioStats.totalReturn === null || portfolioStats.totalReturn === undefined ? 'N/A' : `${portfolioStats.totalReturn >= 0 ? '+' : ''}${(portfolioStats.totalReturn * 100).toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-gray-500">Retorno Anual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {portfolioStats.riskLevel}
                    </div>
                    <div className="text-xs text-gray-500">Nível de Risco</div>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <MobileCard className="text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">
                  {portfolioStats.topPerformer}
                </div>
                <div className="text-xs text-gray-600">Top Performer</div>
              </MobileCard>

              <MobileCard className="text-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">
                  {rankingsData?.top_returns_12m.length || 0}
                </div>
                <div className="text-xs text-gray-600">ETFs Analisados</div>
              </MobileCard>
            </div>

            {/* Market Summary Mobile */}
            <MobileCard>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Resumo do Mercado
              </h3>
              <MarketSummaryMobile />
            </MobileCard>
            
            <MobileCard>
              <AIRecommendationsMobile profile={userProfile} rankingsData={rankingsData} />
            </MobileCard>
          </>
        )}

        {activeTab === 'etfs' && (
          <>
            <TopETFsMobile rankingsData={rankingsData} />
            <TopDividendsMobile rankingsData={rankingsData} />
            {/* Adicionar Top Sharpe, Largest Assets se necessário */}
            <MobileCard>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-yellow-500" />
                    Melhor Risco/Retorno (Sharpe 12m)
                </h3>
                {/* Conteúdo para Top Sharpe ETFs */}
                {rankingsData?.top_sharpe && rankingsData.top_sharpe.length > 0 ? (
                    <div className="space-y-2">
                        {rankingsData.top_sharpe.slice(0,5).map((etf, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 truncate max-w-[70%]">{etf.name} ({etf.symbol})</span>
                                <span className="text-sm font-semibold text-yellow-600">
                                    {etf.sharpe_12m === null || etf.sharpe_12m === undefined ? 'N/A' : etf.sharpe_12m.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-2">Dados de Top Sharpe indisponíveis.</p>
                )}
            </MobileCard>
            <MobileCard>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                    Maiores ETFs (Patrimônio)
                </h3>
                {rankingsData?.largest_assets && rankingsData.largest_assets.length > 0 ? (
                    <div className="space-y-2">
                        {rankingsData.largest_assets.slice(0,5).map((etf, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 truncate max-w-[70%]">{etf.name} ({etf.symbol})</span>
                                <span className="text-sm font-semibold text-indigo-600">
                                    {etf.total_assets === null || etf.total_assets === undefined ? 'N/A' : `${(etf.total_assets / 1000000000).toFixed(1)}B`}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-2">Dados de Maiores ETFs indisponíveis.</p>
                )}
            </MobileCard>
          </>
        )}

        {activeTab === 'insights' && (
          <>
            <RiskAnalysisMobile rankingsData={rankingsData} />
            {/* Adicionar mais cartões de insights aqui */}
            <MobileCard>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-gray-500" />
                    Observações Adicionais
                </h3>
                <p className="text-sm text-gray-600">
                    Lembre-se que performance passada não garante resultados futuros. Diversifique seus investimentos.
                </p>
            </MobileCard>
          </>
        )}
      </div>
    </div>
  );
}

// Componentes Mobile específicos
function MarketSummaryMobile() {
  const [marketData, setMarketData] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/etfs/enhanced?symbols=SPY,QQQ,IWM&enhanced=true&limit=3');
        if (response.ok) {
          const data = await response.json();
          const etfs = data.data || [];
          
          const indices = etfs.map((etf: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            symbol: etf.symbol,
            name: etf.symbol === 'SPY' ? 'S&P 500' : 
                  etf.symbol === 'QQQ' ? 'NASDAQ' : 'Russell 2000',
            change: (etf.returns_12m || 0),
            price: etf.fmp_data?.nav || null
          }));
          
          setMarketData(indices);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="text-center py-4 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-3">
      {marketData.map((index) => (
        <div key={index.symbol} className="flex justify-between items-center">
          <div>
            <div className="font-medium text-gray-900">{index.name}</div>
            <div className="text-xs text-gray-500">{index.symbol}</div>
          </div>
          <div className="text-right">
            <div className={`font-semibold ${
              index.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {index.change >= 0 ? '+' : ''}{index.change.toFixed(1)}%
            </div>
            {index.price && (
              <div className="text-xs text-gray-500">${index.price.toFixed(2)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 