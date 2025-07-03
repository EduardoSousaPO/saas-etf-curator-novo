/**
 * Funções utilitárias para formatação consistente de métricas de ETFs
 * 
 * Padrões de dados CONFIRMADOS pela análise do banco:
 * - Percentuais (returns, volatility, dividends): Vêm em formato DECIMAL (0.359224 = 35.92%)
 * - Valores monetários: Em dólares
 * - Sharpe Ratio: Número absoluto (não percentual, não multiplicar por 100)
 * - Expense Ratio: Já vem em formato percentual (4.42 = 4.42%)
 * 
 * CORREÇÃO APLICADA: Dados percentuais do banco precisam ser multiplicados por 100
 */

/**
 * VERSÃO CORRIGIDA - Formata um valor percentual vindo como decimal do banco
 * @param value - Valor em formato decimal do banco (0.359224 = 35.92%)
 * @returns String formatada com símbolo de porcentagem
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  
  const numValue = Number(value);
  
  // CORREÇÃO BASEADA NA ANÁLISE REAL DO BANCO:
  // Os dados vêm em formato DECIMAL e precisam ser multiplicados por 100
  // Ex: 0.359224 = 35.92%, 2.9938 = 299.38%, 0.162 = 16.2%
  return `${(numValue * 100).toFixed(decimals)}%`;
};

/**
 * Formata valores que já vêm em formato percentual (como expense_ratio)
 * @param value - Valor já em formato percentual (4.42 = 4.42%)
 * @returns String formatada com símbolo de porcentagem
 */
export const formatPercentageAlready = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  // Para valores como expense_ratio que já vêm em formato percentual (4.42 = 4.42%)
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Formata um valor monetário
 * @param value - Valor em dólares
 * @param currency - Moeda (USD/BRL) ou boolean para abbreviated
 * @param abbreviated - Se deve usar abreviações (B/M/K)
 * @returns String formatada com símbolo de moeda e sufixo (B/M)
 */
export const formatCurrency = (
  value: number | null | undefined, 
  currency: string | boolean = true, 
  abbreviated?: boolean
): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  
  const numValue = Number(value);
  
  // Backward compatibility: se currency é boolean, é o parâmetro abbreviated
  let currencyCode = 'USD';
  let useAbbreviated = true;
  
  if (typeof currency === 'boolean') {
    useAbbreviated = currency;
  } else if (typeof currency === 'string') {
    currencyCode = currency;
    useAbbreviated = abbreviated !== undefined ? abbreviated : true;
  }
  
  // Símbolo da moeda
  const currencySymbol = currencyCode === 'BRL' ? 'R$' : '$';
  
  if (!useAbbreviated) {
    return `${currencySymbol}${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  if (numValue >= 1_000_000_000) {
    return `${currencySymbol}${(numValue / 1_000_000_000).toFixed(2)}B`;
  }
  if (numValue >= 1_000_000) {
    return `${currencySymbol}${(numValue / 1_000_000).toFixed(2)}M`;
  }
  if (numValue >= 1_000) {
    return `${currencySymbol}${(numValue / 1_000).toFixed(2)}K`;
  }
  return `${currencySymbol}${numValue.toFixed(2)}`;
};

/**
 * Formata um número genérico
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais
 * @returns String formatada
 */
export const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  return Number(value).toFixed(decimals);
};

/**
 * Formata volume de negociação
 * @param value - Volume em unidades
 * @returns String formatada com sufixo (M/K)
 */
export const formatVolume = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  
  const numValue = Number(value);
  
  if (numValue >= 1_000_000) {
    return `${(numValue / 1_000_000).toFixed(1)}M`;
  }
  if (numValue >= 1_000) {
    return `${(numValue / 1_000).toFixed(1)}K`;
  }
  return numValue.toFixed(0);
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
export type MetricType = 'percentage' | 'percentage_already' | 'currency' | 'number' | 'volume' | 'sharpe';

export const formatMetric = (value: number | null | undefined, type: MetricType): string => {
  switch (type) {
    case 'percentage':
      return formatPercentage(value); // Para dados decimais do banco
    case 'percentage_already':
      return formatPercentageAlready(value); // Para dados já em formato percentual
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
  
  // Dividendos - CORRIGIDO: dividends_12m é percentual, não currency
  dividend_yield: 'percentage',
  dividends_12m: 'percentage', // CORRIGIDO: era currency, agora é percentage
  dividends_24m: 'percentage', // CORRIGIDO: era currency, agora é percentage
  dividends_36m: 'percentage', // CORRIGIDO: era currency, agora é percentage
  dividends_all_time: 'percentage', // CORRIGIDO: era currency, agora é percentage
  
  // Outros
  expense_ratio: 'percentage_already', // Expense ratio já vem em formato percentual
  total_assets: 'currency',
  volume: 'volume',
  max_drawdown: 'percentage',
  beta: 'number',
  pe_ratio: 'number',
  pb_ratio: 'number',
}; 