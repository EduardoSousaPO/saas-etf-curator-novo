/**
 * Funções utilitárias para formatação consistente de métricas de ETFs
 * 
 * Padrões de dados DESCOBERTOS pela análise do banco (2025-01-25):
 * - Percentuais (returns, volatility, dividends): FORMATO MISTO no banco
 *   * Alguns ETFs em formato DECIMAL: QQQ 0.3245 = 32.45%, VTI 0.2234 = 22.34%
 *   * Outros ETFs em formato PERCENTUAL: SGOV 4.7112 = 4.71%, ARKK 62.7467 = 62.75%
 * - Valores monetários: Em dólares
 * - Sharpe Ratio: Número absoluto (não percentual)
 * - Expense Ratio: Formato decimal (0.0075 = 0.75%)
 * 
 * SOLUÇÃO INTELIGENTE: formatPercentage() usa detecção automática de formato
 * REGRA: Valores < 3 são decimais (multiplicar por 100), valores >= 3 são percentuais
 */

/**
 * DETECÇÃO INTELIGENTE CORRIGIDA - Formata um valor percentual com detecção de formato
 * @param value - Valor que pode estar em formato decimal (0.3245) ou percentual (89.32)
 * @returns String formatada com símbolo de porcentagem
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  
  const numValue = Number(value);
  
  // DETECÇÃO INTELIGENTE CORRIGIDA baseada em análise real dos dados:
  // - Valores < 1: Provavelmente formato decimal (0.3245 = 32.45%, 0.2234 = 22.34%)
  // - Valores 1-3: Zona cinzenta, mas provavelmente decimal para retornos (1.5 = 150%)
  // - Valores > 3: Provavelmente já formato percentual (4.71 = 4.71%, 89.32 = 89.32%)
  if (Math.abs(numValue) < 3) {
    // Formato decimal, multiplicar por 100
    return `${(numValue * 100).toFixed(decimals)}%`;
  } else {
    // Formato percentual, apenas adicionar %
    return `${numValue.toFixed(decimals)}%`;
  }
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
 * Alias para formatNumber - usado nas APIs
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais
 * @returns Número formatado
 */
export const formatNumeric = (value: number | null | undefined, decimals: number = 2): number | null => {
  if (value === null || value === undefined || isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(decimals));
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
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Formata data e hora
 * @param dateString - Data em string ou Date
 * @returns String formatada em pt-BR
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Formata tempo relativo (ex: "há 2 dias")
 * @param dateString - Data em string ou Date
 * @returns String formatada
 */
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Há ${Math.floor(diffInSeconds / 86400)} dias`;
    if (diffInSeconds < 31536000) return `Há ${Math.floor(diffInSeconds / 2592000)} meses`;
    
    return `Há ${Math.floor(diffInSeconds / 31536000)} anos`;
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Formata ISIN/CUSIP
 * @param code - Código ISIN ou CUSIP
 * @returns String formatado
 */
export const formatSecurityCode = (code: string | null | undefined): string => {
  if (!code) return 'N/A';
  
  // Formatar ISIN (12 caracteres) com espaços
  if (code.length === 12) {
    return `${code.slice(0, 2)} ${code.slice(2, 6)} ${code.slice(6, 9)} ${code.slice(9)}`;
  }
  
  // Formatar CUSIP (9 caracteres) com espaços
  if (code.length === 9) {
    return `${code.slice(0, 3)} ${code.slice(3, 6)} ${code.slice(6)}`;
  }
  
  return code;
};

/**
 * Formata website
 * @param website - URL do website
 * @returns String formatado
 */
export const formatWebsite = (website: string | null | undefined): string => {
  if (!website) return 'N/A';
  
  // Remover protocolo para exibição mais limpa
  return website.replace(/^https?:\/\//, '').replace(/^www\./, '');
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
 * Função para determinar cor baseada na categoria de tamanho
 * @param category - Categoria de tamanho (ex: "Large", "Medium", "Small")
 * @returns Classe CSS para a cor
 */
export const getSizeCategoryColor = (category: string | null): string => {
  if (!category) return 'bg-gray-100 text-gray-800';
  
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('large') || lowerCategory.includes('grande')) {
    return 'bg-green-100 text-green-800';
  }
  if (lowerCategory.includes('medium') || lowerCategory.includes('médio')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (lowerCategory.includes('small') || lowerCategory.includes('pequeno')) {
    return 'bg-orange-100 text-orange-800';
  }
  
  return 'bg-gray-100 text-gray-800';
};

/**
 * Função para determinar cor baseada na categoria de liquidez
 * @param category - Categoria de liquidez (ex: "High", "Medium", "Low")
 * @returns Classe CSS para a cor
 */
export const getLiquidityCategoryColor = (category: string | null): string => {
  if (!category) return 'bg-gray-100 text-gray-800';
  
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('high') || lowerCategory.includes('alta')) {
    return 'bg-green-100 text-green-800';
  }
  if (lowerCategory.includes('medium') || lowerCategory.includes('média')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (lowerCategory.includes('low') || lowerCategory.includes('baixa')) {
    return 'bg-red-100 text-red-800';
  }
  
  return 'bg-gray-100 text-gray-800';
};

/**
 * Função para determinar cor baseada no rating
 * @param rating - Rating (ex: "A", "B", "C", "D")
 * @returns Classe CSS para a cor
 */
export const getRatingColor = (rating: string | null): string => {
  if (!rating) return 'bg-gray-100 text-gray-800';
  
  const lowerRating = rating.toLowerCase();
  
  if (lowerRating.includes('a') || lowerRating.includes('excellent') || lowerRating.includes('excelente')) {
    return 'bg-green-100 text-green-800';
  }
  if (lowerRating.includes('b') || lowerRating.includes('good') || lowerRating.includes('bom')) {
    return 'bg-blue-100 text-blue-800';
  }
  if (lowerRating.includes('c') || lowerRating.includes('average') || lowerRating.includes('médio')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (lowerRating.includes('d') || lowerRating.includes('poor') || lowerRating.includes('ruim')) {
    return 'bg-red-100 text-red-800';
  }
  
  return 'bg-gray-100 text-gray-800';
};

/**
 * Formata setor/composição
 * @param sectorData - Dados do setor (pode ser um objeto JSON ou string)
 * @returns String formatado
 */
export const formatSectorData = (sectorData: any): string => {
  if (!sectorData) return 'N/A';
  
  if (typeof sectorData === 'string') {
    try {
      const parsed = JSON.parse(sectorData);
      return formatSectorData(parsed);
    } catch {
      return sectorData;
    }
  }
  
  if (typeof sectorData === 'object') {
    if (Array.isArray(sectorData)) {
      return sectorData.map(item => 
        typeof item === 'object' ? 
          `${item.name || item.sector}: ${formatPercentage(item.percentage || item.weight)}` :
          item.toString()
      ).join(', ');
    }
    
    return Object.entries(sectorData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
  
  return sectorData.toString();
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
export const METRIC_TYPES = {
  // Retornos
  returns_12m: 'percentage' as const,
  returns_24m: 'percentage' as const,
  returns_36m: 'percentage' as const,
  returns_5y: 'percentage' as const,
  ten_year_return: 'percentage' as const,
  
  // Volatilidade
  volatility_12m: 'percentage' as const,
  volatility_24m: 'percentage' as const,
  volatility_36m: 'percentage' as const,
  ten_year_volatility: 'percentage' as const,
  
  // Sharpe (NÃO é percentual)
  sharpe_12m: 'sharpe' as const,
  sharpe_24m: 'sharpe' as const,
  sharpe_36m: 'sharpe' as const,
  ten_year_sharpe: 'sharpe' as const,
  
  // Dividendos - CORRIGIDO: dividends_12m é percentual, não currency
  dividend_yield: 'percentage' as const,
  dividends_12m: 'percentage' as const, // CORRIGIDO: era currency, agora é percentage
  dividends_24m: 'percentage' as const, // CORRIGIDO: era currency, agora é percentage
  dividends_36m: 'percentage' as const, // CORRIGIDO: era currency, agora é percentage
  dividends_all_time: 'percentage' as const, // CORRIGIDO: era currency, agora é percentage
  
  // Outros
  expense_ratio: 'percentage_already' as const, // Expense ratio já vem em formato percentual
  totalasset: 'currency' as const,
  volume: 'volume' as const,
  max_drawdown: 'percentage' as const,
  beta: 'number' as const,
  beta_12m: 'number' as const,
  pe_ratio: 'number' as const,
  pb_ratio: 'number' as const,
  
  // Novos tipos para campos adicionais
  'isin': 'text' as const,
  'securitycusip': 'text' as const,
  'domicile': 'text' as const,
  'website': 'text' as const,
  'navcurrency': 'text' as const,
  'size_category': 'text' as const,
  'liquidity_category': 'text' as const,
  'etf_type': 'text' as const,
  'liquidity_rating': 'text' as const,
  'size_rating': 'text' as const,
  'sectorslist': 'text' as const,
  'updatedat': 'date' as const,
  'inceptiondate': 'date' as const,
  'inception_date': 'date' as const,
  
  // Performance adicional (removidas duplicatas)
} as const; 