"use client";

import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  BarChart3,
  Info,
  Calendar,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';

interface ETFDetailCardProps {
  etf: any;
  isExpanded: boolean;
  onToggle: () => void;
}

interface ETFDetails {
  symbol: string;
  name: string;
  description?: string;
  category?: string;
  exchange?: string;
  inception_date?: string;
  // Retornos em diferentes prazos
  returns_12m?: number;
  returns_24m?: number;
  returns_36m?: number;
  returns_5y?: number;
  ten_year_return?: number;
  // Volatilidade em diferentes prazos
  volatility_12m?: number;
  volatility_24m?: number;
  volatility_36m?: number;
  ten_year_volatility?: number;
  // Sharpe em diferentes prazos
  sharpe_12m?: number;
  sharpe_24m?: number;
  sharpe_36m?: number;
  ten_year_sharpe?: number;
  // Outras métricas
  max_drawdown?: number;
  dividend_yield?: number;
  dividends_12m?: number;
  dividends_24m?: number;
  dividends_36m?: number;
  dividends_all_time?: number;
  expense_ratio?: number;
  total_assets?: number;
  volume?: number;
  beta?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  // Holdings (se disponível)
  holdings?: Array<{
    symbol: string;
    name: string;
    weight: number;
  }>;
}

export default function ETFDetailCard({ etf, isExpanded, onToggle }: ETFDetailCardProps) {
  const [details, setDetails] = useState<ETFDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && !details) {
      fetchETFDetails();
    }
  }, [isExpanded]);

  const fetchETFDetails = async () => {
    setLoading(true);
    try {
      // Buscar dados detalhados do ETF
      const response = await fetch(`/api/etfs/enhanced?symbol=${etf.symbol}`);
      if (response.ok) {
        const data = await response.json();
        if (data.etfs && data.etfs.length > 0) {
          setDetails(data.etfs[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do ETF:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any, type: 'percent' | 'currency' | 'number' = 'percent') => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'percent':
        // Os valores estão padronizados como decimais no banco (0.10 = 10%)
        // Então precisamos multiplicar por 100 para exibir
        return `${(Number(value) * 100).toFixed(2)}%`;
      case 'currency':
        if (Number(value) >= 1_000_000_000) {
          return `$${(Number(value) / 1_000_000_000).toFixed(2)}B`;
        }
        return `$${Number(value).toLocaleString()}`;
      case 'number':
        return Number(value).toFixed(2);
      default:
        return value;
    }
  };

  const getReturnColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-950 px-6 py-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Carregando detalhes...</span>
        </div>
      ) : details ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Informações Básicas e Descrição */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Informações Gerais
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Categoria:</span>
                  <span className="font-medium">{details.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bolsa:</span>
                  <span className="font-medium">{details.exchange || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Início:</span>
                  <span className="font-medium">
                    {details.inception_date ? new Date(details.inception_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    <GlossaryTooltip termKey="expense_ratio" showIcon={false}>
                      Taxa Admin.:
                    </GlossaryTooltip>
                  </span>
                  <span className="font-medium">{formatValue(details.expense_ratio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    <GlossaryTooltip termKey="aum" showIcon={false}>
                      AUM:
                    </GlossaryTooltip>
                  </span>
                  <span className="font-medium">{formatValue(details.total_assets, 'currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    <GlossaryTooltip termKey="volume" showIcon={false}>
                      Volume:
                    </GlossaryTooltip>
                  </span>
                  <span className="font-medium">
                    {details.volume ? `${(details.volume / 1_000_000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            {details.description && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Descrição</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line max-w-2xl break-words" style={{ marginBottom: '1rem' }}>
                  {details.description}
                </p>
              </div>
            )}
          </div>

          {/* Coluna 2: Performance */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retorno 12m:</span>
                  <span className={`font-medium ${getReturnColor(details.returns_12m || 0)}`}>
                    {formatValue(details.returns_12m, 'percent')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retorno 24m:</span>
                  <span className={`font-medium ${getReturnColor(details.returns_24m || 0)}`}>
                    {formatValue(details.returns_24m, 'percent')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retorno 36m:</span>
                  <span className={`font-medium ${getReturnColor(details.returns_36m || 0)}`}>
                    {formatValue(details.returns_36m, 'percent')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retorno 5 Anos:</span>
                  <span className={`font-medium ${getReturnColor(details.returns_5y || 0)}`}>
                    {formatValue(details.returns_5y, 'percent')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retorno 10 Anos:</span>
                  <span className={`font-medium ${getReturnColor(details.ten_year_return || 0)}`}>
                    {formatValue(details.ten_year_return, 'percent')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Dividendos
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dividend Yield:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatValue(details.dividend_yield, 'percent')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dividendos (12m):</span>
                   <span className="font-medium text-gray-700 dark:text-gray-300">
                     {formatValue(details.dividends_12m, 'currency')}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3: Risco e Sharpe */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Risco
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Volatilidade 12m:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatValue(details.volatility_12m, 'percent')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sharpe 12m:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatValue(details.sharpe_12m, 'number')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    <GlossaryTooltip termKey="max_drawdown" showIcon={false}>
                      Max Drawdown:
                    </GlossaryTooltip>
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatValue(details.max_drawdown, 'percent')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                     <GlossaryTooltip termKey="beta" showIcon={false}>
                        Beta:
                     </GlossaryTooltip>
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatValue(details.beta, 'number')} 
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Múltiplos
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    <GlossaryTooltip termKey="price_to_earnings_ratio" showIcon={false}>
                      P/L:
                    </GlossaryTooltip>
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatValue(details.pe_ratio, 'number')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    <GlossaryTooltip termKey="price_to_book_ratio" showIcon={false}>
                      P/VP:
                    </GlossaryTooltip>
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatValue(details.pb_ratio, 'number')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">Não foi possível carregar os detalhes do ETF.</div>
      )}

      {/* Botões de Ação */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-4">
        <button
          onClick={() => window.open(`/comparator?symbols=${etf.symbol}`, '_blank')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Comparar ETF
        </button>
        <button
          onClick={() => window.open(`/analytics?symbols=${etf.symbol}`, '_blank')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          Análise Avançada
        </button>
      </div>
    </div>
  );
} 