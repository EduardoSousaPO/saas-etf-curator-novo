/**
 * Sistema de Validação de Dados para ETF Curator
 * 
 * Detecta inconsistências, outliers e problemas de qualidade nos dados
 * Baseado na análise técnica realizada em Janeiro 2025
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100, onde 100 é dados perfeitos
}

export interface ETFData {
  symbol: string;
  returns_12m?: number | null;
  returns_24m?: number | null;
  volatility_12m?: number | null;
  volatility_24m?: number | null;
  sharpe_12m?: number | null;
  max_drawdown?: number | null;
  dividend_yield?: number | null;
  expense_ratio?: number | null;
  total_assets?: number | null;
  avg_volume?: number | null;
}

/**
 * Valida dados de um ETF individual
 */
export const validateETFData = (etf: ETFData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. VALIDAÇÃO DE RETORNOS (formato decimal: -100% a +50%)
  if (etf.returns_12m !== null && etf.returns_12m !== undefined) {
    if (etf.returns_12m < -1.0) {
      errors.push(`Retorno 12m suspeito: ${(etf.returns_12m * 100).toFixed(2)}% (< -100%)`);
      score -= 20;
    } else if (etf.returns_12m > 0.5) {
      errors.push(`Retorno 12m suspeito: ${(etf.returns_12m * 100).toFixed(2)}% (> 50%)`);
      score -= 20;
    }
  }

  if (etf.returns_24m !== null && etf.returns_24m !== undefined) {
    if (etf.returns_24m < -1.0 || etf.returns_24m > 1.0) {
      errors.push(`Retorno 24m suspeito: ${(etf.returns_24m * 100).toFixed(2)}%`);
      score -= 15;
    }
  }

  // 2. VALIDAÇÃO DE VOLATILIDADE (formato decimal: 0.1% a 100%)
  if (etf.volatility_12m !== null && etf.volatility_12m !== undefined) {
    if (etf.volatility_12m < 0.001) {
      warnings.push(`Volatilidade muito baixa: ${(etf.volatility_12m * 100).toFixed(2)}%`);
      score -= 5;
    } else if (etf.volatility_12m > 1.0) {
      errors.push(`Volatilidade suspeita: ${(etf.volatility_12m * 100).toFixed(2)}% (> 100%)`);
      score -= 15;
    }
  }

  // 3. VALIDAÇÃO DE SHARPE RATIO (-5 a +5 é razoável)
  if (etf.sharpe_12m !== null && etf.sharpe_12m !== undefined) {
    if (etf.sharpe_12m < -5.0 || etf.sharpe_12m > 5.0) {
      errors.push(`Sharpe Ratio suspeito: ${etf.sharpe_12m.toFixed(2)}`);
      score -= 10;
    }
  }

  // 4. VALIDAÇÃO DE MAX DRAWDOWN (formato decimal: -50% a 0%)
  if (etf.max_drawdown !== null && etf.max_drawdown !== undefined) {
    if (etf.max_drawdown > 0) {
      errors.push(`Max Drawdown positivo: ${(etf.max_drawdown * 100).toFixed(2)}% (deve ser negativo)`);
      score -= 20;
    } else if (etf.max_drawdown < -0.8) {
      errors.push(`Max Drawdown extremo: ${(etf.max_drawdown * 100).toFixed(2)}% (< -80%)`);
      score -= 15;
    }
  }

  // 5. VALIDAÇÃO DE DIVIDEND YIELD (0% a 15%)
  if (etf.dividend_yield !== null && etf.dividend_yield !== undefined) {
    if (etf.dividend_yield < 0) {
      errors.push(`Dividend Yield negativo: ${etf.dividend_yield.toFixed(2)}%`);
      score -= 10;
    } else if (etf.dividend_yield > 15) {
      warnings.push(`Dividend Yield muito alto: ${etf.dividend_yield.toFixed(2)}%`);
      score -= 5;
    }
  }

  // 6. VALIDAÇÃO DE EXPENSE RATIO (0% a 3%)
  if (etf.expense_ratio !== null && etf.expense_ratio !== undefined) {
    if (etf.expense_ratio < 0) {
      errors.push(`Expense Ratio negativo: ${etf.expense_ratio.toFixed(2)}%`);
      score -= 10;
    } else if (etf.expense_ratio > 3.0) {
      warnings.push(`Expense Ratio muito alto: ${etf.expense_ratio.toFixed(2)}%`);
      score -= 5;
    }
  }

  // 7. VALIDAÇÃO DE TOTAL ASSETS (mínimo $1M)
  if (etf.total_assets !== null && etf.total_assets !== undefined) {
    if (etf.total_assets < 1_000_000) {
      warnings.push(`AUM muito baixo: $${(etf.total_assets / 1_000_000).toFixed(1)}M`);
      score -= 5;
    }
  } else {
    warnings.push('Dados de AUM (Total Assets) não disponíveis');
    score -= 10;
  }

  // 8. VALIDAÇÃO DE VOLUME (mínimo 10K)
  if (etf.avg_volume !== null && etf.avg_volume !== undefined) {
    if (etf.avg_volume < 10_000) {
      warnings.push(`Volume muito baixo: ${etf.avg_volume.toLocaleString()}`);
      score -= 5;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

/**
 * Valida um conjunto de ETFs e retorna estatísticas
 */
export const validateETFDataset = (etfs: ETFData[]): {
  totalETFs: number;
  validETFs: number;
  invalidETFs: number;
  averageScore: number;
  commonErrors: Record<string, number>;
  commonWarnings: Record<string, number>;
} => {
  let validCount = 0;
  let totalScore = 0;
  const errorCounts: Record<string, number> = {};
  const warningCounts: Record<string, number> = {};

  etfs.forEach(etf => {
    const result = validateETFData(etf);
    if (result.isValid) validCount++;
    totalScore += result.score;

    // Contar erros comuns
    result.errors.forEach(error => {
      const errorType = error.split(':')[0];
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

    // Contar warnings comuns
    result.warnings.forEach(warning => {
      const warningType = warning.split(':')[0];
      warningCounts[warningType] = (warningCounts[warningType] || 0) + 1;
    });
  });

  return {
    totalETFs: etfs.length,
    validETFs: validCount,
    invalidETFs: etfs.length - validCount,
    averageScore: etfs.length > 0 ? totalScore / etfs.length : 0,
    commonErrors: errorCounts,
    commonWarnings: warningCounts
  };
};

/**
 * Verifica se os dados estão em formato correto (decimal vs percentual)
 */
export const detectDataFormat = (values: number[]): 'decimal' | 'percentage' | 'unknown' => {
  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (validValues.length === 0) return 'unknown';

  const avgValue = validValues.reduce((sum, v) => sum + Math.abs(v), 0) / validValues.length;
  
  // Se a média dos valores absolutos for < 2, provavelmente é formato decimal
  if (avgValue < 2) return 'decimal';
  
  // Se for > 10, provavelmente é formato percentual
  if (avgValue > 10) return 'percentage';
  
  return 'unknown';
};

/**
 * Estratégia para lidar com dados incompletos
 */
export const getDataCompletenessStrategy = (etf: ETFData): {
  canUseForScreening: boolean;
  canUseForRankings: boolean;
  canUseForSimulation: boolean;
  missingCriticalData: string[];
  recommendedActions: string[];
} => {
  const missingCritical: string[] = [];
  const actions: string[] = [];

  // Dados críticos para screening
  const hasBasicData = etf.returns_12m !== null && etf.volatility_12m !== null;
  
  // Dados críticos para rankings
  const hasRankingData = hasBasicData && etf.sharpe_12m !== null;
  
  // Dados críticos para simulação
  const hasSimulationData = hasRankingData && etf.expense_ratio !== null;

  if (!etf.returns_12m) {
    missingCritical.push('Retorno 12m');
    actions.push('Buscar dados históricos de preços');
  }
  
  if (!etf.volatility_12m) {
    missingCritical.push('Volatilidade 12m');
    actions.push('Calcular volatilidade dos retornos históricos');
  }
  
  if (!etf.sharpe_12m) {
    missingCritical.push('Sharpe Ratio 12m');
    actions.push('Calcular Sharpe usando retorno e volatilidade');
  }
  
  if (!etf.expense_ratio) {
    missingCritical.push('Taxa de administração');
    actions.push('Buscar dados do prospecto do ETF');
  }
  
  if (!etf.total_assets) {
    missingCritical.push('Patrimônio sob gestão');
    actions.push('Implementar fonte alternativa de dados de AUM');
  }

  return {
    canUseForScreening: hasBasicData,
    canUseForRankings: hasRankingData,
    canUseForSimulation: hasSimulationData,
    missingCriticalData: missingCritical,
    recommendedActions: actions
  };
};

/**
 * Gera relatório de qualidade dos dados
 */
export const generateDataQualityReport = (etfs: ETFData[]): string => {
  const validation = validateETFDataset(etfs);
  const completenessStats = etfs.map(getDataCompletenessStrategy);
  
  const canScreen = completenessStats.filter(s => s.canUseForScreening).length;
  const canRank = completenessStats.filter(s => s.canUseForRankings).length;
  const canSimulate = completenessStats.filter(s => s.canUseForSimulation).length;

  return `
📊 RELATÓRIO DE QUALIDADE DOS DADOS ETF CURATOR

🔍 Validação Geral:
- Total de ETFs: ${validation.totalETFs}
- ETFs válidos: ${validation.validETFs} (${((validation.validETFs / validation.totalETFs) * 100).toFixed(1)}%)
- ETFs com problemas: ${validation.invalidETFs}
- Score médio de qualidade: ${validation.averageScore.toFixed(1)}/100

🎯 Funcionalidades Disponíveis:
- Screening: ${canScreen} ETFs (${((canScreen / validation.totalETFs) * 100).toFixed(1)}%)
- Rankings: ${canRank} ETFs (${((canRank / validation.totalETFs) * 100).toFixed(1)}%)
- Simulação: ${canSimulate} ETFs (${((canSimulate / validation.totalETFs) * 100).toFixed(1)}%)

⚠️ Erros Mais Comuns:
${Object.entries(validation.commonErrors)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([error, count]) => `- ${error}: ${count} ocorrências`)
  .join('\n')}

💡 Warnings Mais Comuns:
${Object.entries(validation.commonWarnings)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([warning, count]) => `- ${warning}: ${count} ocorrências`)
  .join('\n')}

🔧 Recomendações:
1. Implementar fonte alternativa para dados de AUM (43.8% faltantes)
2. Validar e corrigir outliers de retornos extremos
3. Verificar cálculos de Sharpe Ratio para valores suspeitos
4. Monitorar dados de volatilidade para inconsistências
`;
}; 