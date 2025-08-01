"use client";

import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Calendar, 
  Building2, 
  Globe, 
  Shield, 
  Target, 
  Activity,
  Download,
  Award,
  ExternalLink,
  PieChart,
  Zap,
  Star,
  TrendingUp as TrendingUpIcon,
  Brain,
  AlertTriangle,
  TrendingUp as MarketIcon,
  Users
} from 'lucide-react';
import { formatPercentage, formatCurrency, formatNumber, formatMetric, METRIC_TYPES, getValueColor, formatDate } from '@/lib/formatters';
import { ETFDetails } from "@/types/etf";
import { exportETFToPDF } from '@/utils/pdfExport';

interface ETFDetailCardProps {
  etf: ETFDetails;
  loading?: boolean;
  onClose: () => void;
}

// Componente para badge de categoria
const CategoryBadge: React.FC<{ label: string; value: string | null; color?: string }> = ({ label, value, color = "bg-gray-100 text-gray-800" }) => {
  if (!value) return null;
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {value}
      </span>
    </div>
  );
};

// Componente para métrica com ícone
const MetricItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: any; 
  fieldName?: string;
  showTrend?: boolean;
}> = ({ icon, label, value, fieldName, showTrend = false }) => {
  const formattedValue = fieldName ? formatMetric(value, METRIC_TYPES[fieldName] || 'number') : (value?.toString() || 'N/A');
  const colorClass = showTrend ? getValueColor(value) : 'text-gray-900';
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="text-gray-500">{icon}</div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className={`font-semibold ${colorClass}`}>
        {formattedValue}
        {showTrend && value !== null && (
          <span className="ml-1">
            {value > 0 ? <TrendingUp className="w-4 h-4 inline" /> : value < 0 ? <TrendingDown className="w-4 h-4 inline" /> : null}
          </span>
        )}
      </span>
    </div>
  );
};

// Componente para Morningstar Rating com estrelas
const MorningstarRating: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (!rating || rating < 1 || rating > 5) return null;
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Morningstar Rating</span>
      </div>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-900">
          {rating}/5
        </span>
      </div>
    </div>
  );
};

// Componente para Top Holdings
const TopHoldingsSection: React.FC<{ holdings: any[] | null }> = ({ holdings }) => {
  if (!holdings || !Array.isArray(holdings) || holdings.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-[#202636] flex items-center mb-4">
        <TrendingUpIcon className="w-5 h-5 mr-2 text-[#0090d8]" />
        Top Holdings
      </h3>
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ativo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticker</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Peso (%)</th>
              </tr>
            </thead>
            <tbody>
              {holdings.slice(0, 10).map((holding, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {holding.name || holding.security || 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-600">
                    {holding.ticker || holding.symbol || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">
                    {holding.weight ? `${Number(holding.weight).toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente para Sector Allocation
const SectorAllocationSection: React.FC<{ allocation: Record<string, number> | null }> = ({ allocation }) => {
  if (!allocation || typeof allocation !== 'object') return null;
  
  const sectors = Object.entries(allocation)
    .filter(([_, value]) => value && value > 0)
    .sort(([_, a], [__, b]) => b - a);
  
  if (sectors.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-[#202636] flex items-center mb-4">
        <PieChart className="w-5 h-5 mr-2 text-[#0090d8]" />
        Alocação por Setores
      </h3>
      <div className="bg-white rounded-lg p-4">
        <div className="space-y-3">
          {sectors.map(([sector, percentage], index) => (
            <div key={sector} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    backgroundColor: `hsl(${(index * 360) / sectors.length}, 70%, 60%)` 
                  }}
                />
                <span className="text-sm font-medium text-gray-700">{sector}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: `hsl(${(index * 360) / sectors.length}, 70%, 60%)` 
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para AI Insights
const AIInsightsSection: React.FC<{ 
  investmentThesis?: string | null;
  riskAnalysis?: string | null;
  marketContext?: string | null;
  useCases?: string | null;
}> = ({ investmentThesis, riskAnalysis, marketContext, useCases }) => {
  // Se não há nenhum insight, não renderiza
  if (!investmentThesis && !riskAnalysis && !marketContext && !useCases) return null;

  const insights = [
    {
      title: "Tese de Investimento",
      content: investmentThesis,
      icon: <Brain className="w-5 h-5" />,
      color: "from-emerald-50 to-green-50",
      iconColor: "text-emerald-600"
    },
    {
      title: "Análise de Risco",
      content: riskAnalysis,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "from-red-50 to-pink-50",
      iconColor: "text-red-600"
    },
    {
      title: "Contexto de Mercado",
      content: marketContext,
      icon: <MarketIcon className="w-5 h-5" />,
      color: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Casos de Uso",
      content: useCases,
      icon: <Users className="w-5 h-5" />,
      color: "from-purple-50 to-violet-50",
      iconColor: "text-purple-600"
    }
  ].filter(insight => insight.content && insight.content.trim() !== '');

  if (insights.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#202636] flex items-center justify-center mb-2">
          <Brain className="w-6 h-6 mr-3 text-[#0090d8]" />
          Análises de IA
        </h2>
        <p className="text-gray-600 text-sm">
          Insights gerados por inteligência artificial baseados em dados de mercado
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className={`bg-gradient-to-r ${insight.color} p-6 rounded-xl`}>
            <h3 className="text-lg font-semibold text-[#202636] flex items-center mb-4">
              <span className={insight.iconColor}>{insight.icon}</span>
              <span className="ml-2">{insight.title}</span>
            </h3>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {insight.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          ⚠️ As análises de IA são baseadas em dados históricos e não constituem recomendações de investimento
        </p>
      </div>
    </div>
  );
};

// Componente para seção de performance
const PerformanceSection: React.FC<{ title: string; data: Array<{ period: string; return: number | null; volatility: number | null; sharpe: number | null }> }> = ({ title, data }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-[#202636] flex items-center">
      <Activity className="w-4 h-4 mr-2 text-[#0090d8]" />
      {title}
    </h4>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 text-gray-600">Período</th>
            <th className="text-right py-2 text-gray-600">Retorno</th>
            <th className="text-right py-2 text-gray-600">Volatilidade</th>
            <th className="text-right py-2 text-gray-600">Sharpe</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-2 font-medium">{row.period}</td>
              <td className={`text-right py-2 font-mono ${getValueColor(row.return)}`}>
                {row.return !== null ? formatPercentage(row.return) : 'N/A'}
              </td>
              <td className="text-right py-2 font-mono">
                {row.volatility !== null ? formatPercentage(row.volatility) : 'N/A'}
              </td>
              <td className="text-right py-2 font-mono">
                {row.sharpe !== null ? formatNumber(row.sharpe, 2) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ETFDetailCard: React.FC<ETFDetailCardProps> = ({ etf, loading = false, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportETFToPDF(etf);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  // Dados de performance organizados
  const performanceData = [
    { period: '12 meses', return: etf.returns_12m, volatility: etf.volatility_12m, sharpe: etf.sharpe_12m },
    { period: '24 meses', return: etf.returns_24m, volatility: etf.volatility_24m, sharpe: etf.sharpe_24m },
    { period: '36 meses', return: etf.returns_36m, volatility: etf.volatility_36m, sharpe: etf.sharpe_36m },
    { period: '5 anos', return: etf.returns_5y, volatility: etf.ten_year_volatility, sharpe: etf.ten_year_sharpe },
  ];

  // Dados de dividendos organizados
  const dividendData = [
    { period: '12 meses', amount: etf.dividends_12m },
    { period: '24 meses', amount: etf.dividends_24m },
    { period: '36 meses', amount: etf.dividends_36m },
    { period: 'All time', amount: etf.dividends_all_time },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header Melhorado */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <PieChart className="w-8 h-8 text-[#0090d8]" />
              </div>
          <div>
                <h2 className="text-3xl font-bold text-[#202636]">{etf.symbol}</h2>
                <p className="text-lg text-gray-600 mt-1">{etf.name || "Nome não disponível"}</p>
                {etf.description && (
                  <p className="text-sm text-gray-500 mt-2 max-w-2xl">{etf.description}</p>
                )}
              </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          </div>
          
          {/* Badges de Categoria */}
          <div className="flex flex-wrap gap-3 mt-4">
            <CategoryBadge label="Classe" value={etf.assetclass} color="bg-blue-100 text-blue-800" />
            <CategoryBadge label="Tipo" value={etf.etf_type} color="bg-green-100 text-green-800" />
            <CategoryBadge label="Tamanho" value={etf.size_category} color="bg-purple-100 text-purple-800" />
            <CategoryBadge label="Liquidez" value={etf.liquidity_category} color="bg-orange-100 text-orange-800" />
            {etf.domicile && <CategoryBadge label="Domicílio" value={etf.domicile} color="bg-gray-100 text-gray-800" />}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Seção 1: Informações Básicas e Financeiras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#202636] flex items-center border-b pb-2">
                <Building2 className="w-5 h-5 mr-2 text-[#0090d8]" />
                Informações Básicas
              </h3>
              <div className="space-y-3">
                <MetricItem 
                  icon={<Building2 className="w-4 h-4" />}
                  label="Gestora"
                  value={etf.etfcompany || "N/A"}
                />
                <MetricItem 
                  icon={<Target className="w-4 h-4" />}
                  label="Taxa de Administração"
                  value={etf.expense_ratio}
                  fieldName="expense_ratio"
                />
                <MetricItem 
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Patrimônio Líquido"
                              value={etf.totalasset}
            fieldName="totalasset"
                />
                <MetricItem 
                  icon={<Calendar className="w-4 h-4" />}
                  label="Data de Criação"
                  value={etf.inception_date ? formatDate(etf.inception_date) : "N/A"}
                />
                <MorningstarRating rating={etf.morningstar_rating} />
                {etf.website && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Website</span>
                </div>
                    <a 
                      href={etf.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#0090d8] hover:text-[#0090d8]/80 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                )}
              </div>
            </div>

            {/* Dados de Mercado */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#202636] flex items-center border-b pb-2">
                <BarChart3 className="w-5 h-5 mr-2 text-[#0090d8]" />
                Dados de Mercado
              </h3>
              <div className="space-y-3">
                <MetricItem 
                  icon={<DollarSign className="w-4 h-4" />}
                  label="NAV"
                  value={etf.nav}
                  fieldName="nav"
                />
                <MetricItem 
                  icon={<Activity className="w-4 h-4" />}
                  label="Volume Médio"
                  value={etf.volume}
                  fieldName="volume"
                />
                <MetricItem 
                  icon={<PieChart className="w-4 h-4" />}
                  label="Número de Holdings"
                  value={etf.holdings_count}
                />
                {etf.navcurrency && (
                  <MetricItem 
                    icon={<Globe className="w-4 h-4" />}
                    label="Moeda"
                    value={etf.navcurrency}
                  />
                )}
                {etf.max_drawdown && (
                  <MetricItem 
                    icon={<TrendingDown className="w-4 h-4" />}
                    label="Max Drawdown"
                    value={etf.max_drawdown}
                    fieldName="max_drawdown"
                    showTrend={true}
                  />
                )}
                {etf.beta_12m && (
                  <MetricItem 
                    icon={<Activity className="w-4 h-4" />}
                    label="Beta (12m)"
                    value={etf.beta_12m}
                    fieldName="beta_12m"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Performance Histórica */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <PerformanceSection title="Performance Histórica" data={performanceData} />
          </div>

          {/* Seção 2.5: Top Holdings */}
          <TopHoldingsSection holdings={etf.top_10_holdings} />

          {/* Seção 2.6: Sector Allocation */}
          <SectorAllocationSection allocation={etf.sector_allocation} />

          {/* Seção 2.7: AI Insights */}
          <AIInsightsSection 
            investmentThesis={etf.ai_investment_thesis}
            riskAnalysis={etf.ai_risk_analysis}
            marketContext={etf.ai_market_context}
            useCases={etf.ai_use_cases}
          />

          {/* Seção 3: Dividendos */}
          {(etf.dividends_12m || etf.dividend_yield) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-[#202636] flex items-center mb-4">
                <DollarSign className="w-5 h-5 mr-2 text-[#0090d8]" />
                Distribuições e Dividendos
            </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <MetricItem 
                    icon={<Award className="w-4 h-4" />}
                    label="Dividend Yield"
                    value={etf.dividend_yield}
                    fieldName="dividend_yield"
                    showTrend={true}
                  />
                  </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#202636]">Histórico de Dividendos</h4>
                  {dividendData.map((item, index) => (
                    item.amount && (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.period}:</span>
                        <span className="font-mono">{formatPercentage(item.amount)}</span>
                  </div>
                    )
                  ))}
                </div>
              </div>
                  </div>
          )}

          {/* Seção 4: Classificações e Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Classificações */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-[#202636] flex items-center mb-4">
                <Shield className="w-5 h-5 mr-2 text-[#0090d8]" />
                Classificações
              </h3>
              <div className="space-y-3">
                {etf.size_rating && (
                  <CategoryBadge label="Rating de Tamanho" value={etf.size_rating} color="bg-purple-100 text-purple-800" />
                )}
                {etf.liquidity_rating && (
                  <CategoryBadge label="Rating de Liquidez" value={etf.liquidity_rating} color="bg-blue-100 text-blue-800" />
                )}
                </div>
              </div>


          </div>



          {/* Footer com ações */}
          <div className="border-t pt-6 flex justify-end items-center">
            <div className="flex space-x-3">
              {etf.website && (
                <a
                  href={etf.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0090d8] text-white rounded-lg hover:bg-[#0090d8]/90 transition-colors flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website
                </a>
              )}
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETFDetailCard; 