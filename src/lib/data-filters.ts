/**
 * Utilitários para filtrar outliers extremos em dados financeiros
 * Previne que dados corrompidos contaminem estatísticas e rankings
 */

export interface MetricData {
  returns_12m?: number | string | null;
  volatility_12m?: number | string | null;
  sharpe_12m?: number | string | null;
  dividends_12m?: number | string | null;
  [key: string]: any;
}

/**
 * Converte valor para número, retornando null se inválido
 */
export function safeNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Verifica se um valor de retorno é válido (entre -95% e +500%)
 */
export function isValidReturn(value: any): boolean {
  const num = safeNumber(value);
  if (num === null) return false;
  return num >= -0.95 && num <= 5.0; // -95% a +500%
}

/**
 * Verifica se um valor de volatilidade é válido (entre 0% e 200%)
 */
export function isValidVolatility(value: any): boolean {
  const num = safeNumber(value);
  if (num === null) return false;
  return num >= 0 && num <= 2.0; // 0% a 200%
}

/**
 * Verifica se um valor de Sharpe ratio é válido (entre -10 e +10)
 */
export function isValidSharpe(value: any): boolean {
  const num = safeNumber(value);
  if (num === null) return false;
  return num >= -10 && num <= 10;
}

/**
 * Verifica se um valor de dividendo é válido (entre 0 e 1000)
 */
export function isValidDividend(value: any): boolean {
  const num = safeNumber(value);
  if (num === null) return false;
  return num >= 0 && num <= 1000; // Até $1000 por ação
}

/**
 * Filtra dados removendo outliers extremos
 */
export function filterOutliers<T extends MetricData>(data: T[]): T[] {
  return data.filter(item => {
    // Se tem retorno, deve ser válido
    if (item.returns_12m !== null && item.returns_12m !== undefined) {
      if (!isValidReturn(item.returns_12m)) return false;
    }
    
    // Se tem volatilidade, deve ser válida
    if (item.volatility_12m !== null && item.volatility_12m !== undefined) {
      if (!isValidVolatility(item.volatility_12m)) return false;
    }
    
    // Se tem Sharpe, deve ser válido
    if (item.sharpe_12m !== null && item.sharpe_12m !== undefined) {
      if (!isValidSharpe(item.sharpe_12m)) return false;
    }
    
    // Se tem dividendo, deve ser válido
    if (item.dividends_12m !== null && item.dividends_12m !== undefined) {
      if (!isValidDividend(item.dividends_12m)) return false;
    }
    
    return true;
  });
}

/**
 * Calcula estatísticas seguras (média, mediana) removendo outliers
 */
export function calculateSafeStats(values: (number | string | null)[]): {
  mean: number;
  median: number;
  count: number;
  validCount: number;
} {
  const validNumbers = values
    .map(v => safeNumber(v))
    .filter(n => n !== null) as number[];
  
  if (validNumbers.length === 0) {
    return { mean: 0, median: 0, count: values.length, validCount: 0 };
  }
  
  const sorted = [...validNumbers].sort((a, b) => a - b);
  const mean = validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  return {
    mean,
    median,
    count: values.length,
    validCount: validNumbers.length
  };
}

/**
 * Formata valor numérico para exibição, tratando casos especiais
 */
export function formatSafeNumber(value: any, decimals: number = 2): string {
  const num = safeNumber(value);
  if (num === null) return 'N/A';
  
  // Se o valor é muito pequeno ou muito grande, usar notação científica
  if (Math.abs(num) > 1000000 || (Math.abs(num) < 0.0001 && num !== 0)) {
    return num.toExponential(2);
  }
  
  return num.toFixed(decimals);
}

/**
 * Converte decimal para percentual de forma segura
 */
export function toPercentage(value: any, decimals: number = 2): string {
  const num = safeNumber(value);
  if (num === null) return 'N/A';
  return `${(num * 100).toFixed(decimals)}%`;
} 