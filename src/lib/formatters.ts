/**
 * Funções utilitárias para formatação consistente de métricas de ETFs
 * 
 * Padrões de dados:
 * - Percentuais: Armazenados como decimais (0.10 = 10%)
 * - Valores monetários: Em dólares
 * - Sharpe Ratio: Número absoluto (não percentual)
 */

/**
 * Formata um valor percentual
 * @param value - Valor decimal (0.10 = 10%)
 * @returns String formatada com símbolo de porcentagem
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  // CORREÇÃO: Os dados vêm em formato decimal do banco (0.359224 = 35.92%)
  return `${(Number(value) * 100).toFixed(decimals)}%`;
};

/**
 * Formata um valor que já está em formato percentual
 * @param value - Valor já em formato percentual (4.42 = 4.42%)
 * @returns String formatada com símbolo de porcentagem
 */
export const formatPercentageAlready = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  // Para valores como expense_ratio que já vêm em formato percentual (4.42 = 4.42%)
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Formata um valor monetário
 * @param value - Valor em dólares
 * @returns String formatada com símbolo de dólar e sufixo (B/M)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

/**
 * Formata um número genérico
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais
 * @returns String formatada
 */
export const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
};

/**
 * Formata volume de negociação
 * @param value - Volume em unidades
 * @returns String formatada com sufixo (M/K)
 */
export const formatVolume = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

/**
 * Formata uma data
 * @param date - Data em string ou Date
 * @returns String formatada em pt-BR
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  } catch {
    return 'N/A';
  }
};

/**
 * Determina a cor baseada no valor (positivo/negativo)
 * @param value - Valor numérico
 * @returns Classe CSS para a cor
 */
export const getValueColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'text-gray-500';
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Formata métricas baseado no tipo
 * @param value - Valor a ser formatado
 * @param type - Tipo de métrica
 * @returns String formatada apropriadamente
 */
export type MetricType = 'percentage' | 'currency' | 'number' | 'volume' | 'sharpe';

export const formatMetric = (value: number | null | undefined, type: MetricType): string => {
  switch (type) {
    case 'percentage':
      return formatPercentage(value);
    case 'currency':
      return formatCurrency(value);
    case 'volume':
      return formatVolume(value);
    case 'sharpe':
      return formatNumber(value, 2); // Sharpe não é percentual
    case 'number':
    default:
      return formatNumber(value);
  }
};

/**
 * Mapa de tipos de métricas para facilitar formatação
 */
export const METRIC_TYPES: Record<string, MetricType> = {
  // Retornos
  returns_12m: 'percentage',
  returns_24m: 'percentage',
  returns_36m: 'percentage',
  returns_5y: 'percentage',
  ten_year_return: 'percentage',
  
  // Volatilidade
  volatility_12m: 'percentage',
  volatility_24m: 'percentage',
  volatility_36m: 'percentage',
  ten_year_volatility: 'percentage',
  
  // Sharpe (NÃO é percentual)
  sharpe_12m: 'sharpe',
  sharpe_24m: 'sharpe',
  sharpe_36m: 'sharpe',
  ten_year_sharpe: 'sharpe',
  
  // Dividendos
  dividend_yield: 'percentage',
  dividends_12m: 'currency',
  dividends_24m: 'currency',
  dividends_36m: 'currency',
  dividends_all_time: 'currency',
  
  // Outros
  expense_ratio: 'percentage',
  total_assets: 'currency',
  volume: 'volume',
  max_drawdown: 'percentage',
  beta: 'number',
  pe_ratio: 'number',
  pb_ratio: 'number',
}; 