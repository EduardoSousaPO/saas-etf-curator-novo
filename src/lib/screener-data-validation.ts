// src/lib/screener-data-validation.ts
export interface DataValidationConfig {
  dividendYield: {
    min: number;
    max: number;
  };
  volatility: {
    min: number;
    max: number;
  };
  sharpeRatio: {
    min: number;
    max: number;
  };
  returns: {
    min: number;
    max: number;
  };
  expenseRatio: {
    min: number;
    max: number;
  };
}

// Configuração de limites realistas para ETFs
export const DEFAULT_VALIDATION_CONFIG: DataValidationConfig = {
  dividendYield: {
    min: 0,
    max: 15, // 15% é um limite alto mas realista para ETFs de dividendos
  },
  volatility: {
    min: 0.01, // 1% mínimo (excluir zeros suspeitos)
    max: 2.0,  // 200% máximo para ETFs alavancados
  },
  sharpeRatio: {
    min: -5.0,
    max: 15.0, // Treasury ETFs podem ter Sharpe muito alto em certas condições
  },
  returns: {
    min: -0.95, // -95% máximo para ETFs inversos
    max: 15.0,  // 1500% máximo para ETFs alavancados em bull markets
  },
  expenseRatio: {
    min: 0,
    max: 0.05, // 5% máximo (alguns ETFs complexos podem ter taxas altas)
  },
};

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  excludeFromResults?: boolean;
}

export class DataValidator {
  private config: DataValidationConfig;

  constructor(config: DataValidationConfig = DEFAULT_VALIDATION_CONFIG) {
    this.config = config;
  }

  validateETF(etf: any): ValidationResult {
    const warnings: string[] = [];
    let excludeFromResults = false;

    // Validar dividend yield calculado - MAIS RESTRITIVO
    if (etf.dividends_12m && etf.nav && etf.nav > 0) {
      const dividendYield = (Number(etf.dividends_12m) / Number(etf.nav)) * 100;
      if (dividendYield > this.config.dividendYield.max) {
        warnings.push(`Dividend yield suspeito: ${dividendYield.toFixed(2)}% (máx: ${this.config.dividendYield.max}%)`);
        // ETFs com dividend yield > 15% são excluídos automaticamente
        excludeFromResults = true;
      }
    }

    // Validar volatilidade
    if (etf.volatility_12m !== null && etf.volatility_12m !== undefined) {
      const vol = Number(etf.volatility_12m);
      if (vol === 0) {
        warnings.push(`Volatilidade zerada suspeita para ${etf.symbol}`);
        excludeFromResults = true;
      } else if (vol > this.config.volatility.max) {
        warnings.push(`Volatilidade muito alta: ${(vol * 100).toFixed(2)}% (máx: ${this.config.volatility.max * 100}%)`);
      }
    }

    // Validar Sharpe Ratio
    if (etf.sharpe_12m !== null && etf.sharpe_12m !== undefined) {
      const sharpe = Number(etf.sharpe_12m);
      if (sharpe === 0 && etf.returns_12m !== 0) {
        warnings.push(`Sharpe ratio zerado suspeito para ${etf.symbol}`);
      } else if (sharpe > this.config.sharpeRatio.max) {
        warnings.push(`Sharpe ratio muito alto: ${sharpe.toFixed(2)} (máx: ${this.config.sharpeRatio.max})`);
      }
    }

    // Validar retornos
    if (etf.returns_12m !== null && etf.returns_12m !== undefined) {
      const returns = Number(etf.returns_12m);
      if (returns === 0 && etf.volatility_12m !== 0) {
        warnings.push(`Retorno zerado suspeito para ${etf.symbol}`);
        excludeFromResults = true;
      } else if (returns > this.config.returns.max) {
        warnings.push(`Retorno muito alto: ${(returns * 100).toFixed(2)}% (máx: ${this.config.returns.max * 100}%)`);
      }
    }

    // Validar expense ratio
    if (etf.expenseratio !== null && etf.expenseratio !== undefined) {
      const er = Number(etf.expenseratio);
      if (er > this.config.expenseRatio.max) {
        warnings.push(`Taxa de administração muito alta: ${(er * 100).toFixed(2)}% (máx: ${this.config.expenseRatio.max * 100}%)`);
      }
    }

    // Validação especial para ETFs inversos com dividend yields anômalos
    if (etf.assetclass && etf.assetclass.includes('Inverse') && etf.dividends_12m && etf.nav) {
      const dividendYield = (Number(etf.dividends_12m) / Number(etf.nav)) * 100;
      if (dividendYield > 50) {
        warnings.push(`ETF inverso com dividend yield anômalo: ${dividendYield.toFixed(2)}% - provavelmente distribuição especial`);
        excludeFromResults = true;
      }
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      excludeFromResults,
    };
  }

  // Filtrar lista de ETFs removendo dados anômalos
  filterValidETFs(etfs: any[], logWarnings = false): any[] {
    const validETFs: any[] = [];
    const excludedETFs: any[] = [];

    etfs.forEach((etf) => {
      const validation = this.validateETF(etf);
      
      if (validation.excludeFromResults) {
        excludedETFs.push({ etf: etf.symbol, warnings: validation.warnings });
      } else {
        validETFs.push(etf);
      }

      if (logWarnings && validation.warnings.length > 0) {
        console.warn(`⚠️ ${etf.symbol}:`, validation.warnings.join(', '));
      }
    });

    if (logWarnings && excludedETFs.length > 0) {
      console.warn(`🚫 ${excludedETFs.length} ETFs excluídos por dados anômalos:`, 
        excludedETFs.map(e => e.etf).join(', '));
    }

    return validETFs;
  }

  // Validar parâmetros de filtro do usuário
  validateFilterParams(filters: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar ranges de dividend yield
    if (filters.dividendYieldMin && filters.dividendYieldMax) {
      if (filters.dividendYieldMin > filters.dividendYieldMax) {
        errors.push('Dividend yield mínimo não pode ser maior que o máximo');
      }
    }

    if (filters.dividendYieldMax && filters.dividendYieldMax > this.config.dividendYield.max) {
      errors.push(`Dividend yield máximo muito alto (máx: ${this.config.dividendYield.max}%)`);
    }

    // Validar ranges de volatilidade
    if (filters.volatility12mMin && filters.volatility12mMax) {
      if (filters.volatility12mMin > filters.volatility12mMax) {
        errors.push('Volatilidade mínima não pode ser maior que a máxima');
      }
    }

    // Validar ranges de retornos
    if (filters.returns12mMin && filters.returns12mMax) {
      if (filters.returns12mMin > filters.returns12mMax) {
        errors.push('Retorno mínimo não pode ser maior que o máximo');
      }
    }

    // Validar expense ratio
    if (filters.expenseRatioMax && filters.expenseRatioMax > this.config.expenseRatio.max * 100) {
      errors.push(`Taxa de administração muito alta (máx: ${this.config.expenseRatio.max * 100}%)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Instância singleton para uso global
export const dataValidator = new DataValidator();

// Função helper para uso rápido
export function validateAndFilterETFs(etfs: any[], logWarnings = false): any[] {
  return dataValidator.filterValidETFs(etfs, logWarnings);
}

// Função helper para validar parâmetros de filtro
export function validateFilterParameters(filters: any) {
  return dataValidator.validateFilterParams(filters);
} 