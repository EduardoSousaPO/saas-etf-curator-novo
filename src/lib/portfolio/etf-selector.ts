import { createClient } from '@supabase/supabase-js';

export interface ETFCriteria {
  minReturn?: number;
  maxVolatility?: number;
  minSharpe?: number;
  minAUM?: number;
  minDividendYield?: number;
  maxExpenseRatio?: number;
  categories?: string[];
  excludeSymbols?: string[];
}

export interface SelectedETF {
  symbol: string;
  name: string;
  returns_12m: number;
  volatility: number;
  sharpe_ratio: number;
  dividend_yield: number;
  expense_ratio: number;
  assets_under_management: number;
  category: string;
  score: number;
  rationale: string;
}

export interface PortfolioAllocation {
  etf: SelectedETF;
  allocation: number;
  rationale: string;
}

export class ETFSelector {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Busca ETFs da base de dados com critérios específicos
   */
  async searchETFs(criteria: ETFCriteria): Promise<SelectedETF[]> {
    let query = this.supabase
      .from('etfs_ativos_reais')
      .select('*')
      .not('returns_12m', 'is', null)
      .not('volatility', 'is', null);

    // Aplicar filtros
    if (criteria.minReturn) {
      query = query.gte('returns_12m', criteria.minReturn);
    }
    if (criteria.maxVolatility) {
      query = query.lte('volatility', criteria.maxVolatility);
    }
    if (criteria.minAUM) {
      query = query.gte('assets_under_management', criteria.minAUM);
    }
    if (criteria.maxExpenseRatio) {
      query = query.lte('expense_ratio', criteria.maxExpenseRatio);
    }
    if (criteria.excludeSymbols && criteria.excludeSymbols.length > 0) {
      query = query.not('symbol', 'in', `(${criteria.excludeSymbols.join(',')})`);
    }

    const { data: etfs, error } = await query.limit(100);

    if (error) {
      console.error('Erro ao buscar ETFs:', error);
      return [];
    }

    if (!etfs) return [];

    // Calcular scores e filtrar
    return etfs
      .map(etf => this.calculateETFScore(etf, criteria))
      .filter(etf => etf.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Calcula score de adequação do ETF aos critérios
   */
  private calculateETFScore(etf: any, criteria: ETFCriteria): SelectedETF {
    let score = 0;
    let rationale = '';

    // Calcular Sharpe Ratio se não existir
    const sharpeRatio = etf.sharpe_ratio || (etf.returns_12m && etf.volatility ? 
      etf.returns_12m / etf.volatility : 0);

    // Score baseado em Sharpe Ratio (peso 30%)
    if (sharpeRatio > 0) {
      score += Math.min(sharpeRatio * 10, 30);
      if (sharpeRatio > 1) rationale += 'Alto Sharpe; ';
    }

    // Score baseado em retorno (peso 25%)
    if (etf.returns_12m > 0) {
      score += Math.min(etf.returns_12m, 25);
      if (etf.returns_12m > 10) rationale += 'Bom retorno; ';
    }

    // Penalizar alta volatilidade (peso -20%)
    if (etf.volatility > 0) {
      const volPenalty = Math.min(etf.volatility, 20);
      score -= volPenalty;
      if (etf.volatility < 15) rationale += 'Baixa volatilidade; ';
    }

    // Score baseado em AUM (peso 15%)
    if (etf.assets_under_management > 0) {
      const aumScore = Math.min(Math.log10(etf.assets_under_management / 1000000) * 3, 15);
      score += aumScore;
      if (etf.assets_under_management > 1000000000) rationale += 'Grande AUM; ';
    }

    // Score baseado em dividend yield (peso 10%)
    if (etf.dividend_yield > 0) {
      score += Math.min(etf.dividend_yield * 2, 10);
      if (etf.dividend_yield > 3) rationale += 'Bons dividendos; ';
    }

    // Penalizar alto expense ratio
    if (etf.expense_ratio > 0) {
      score -= etf.expense_ratio * 10;
      if (etf.expense_ratio < 0.2) rationale += 'Baixo custo; ';
    }

    return {
      symbol: etf.symbol,
      name: etf.name || etf.symbol,
      returns_12m: etf.returns_12m || 0,
      volatility: etf.volatility || 0,
      sharpe_ratio: sharpeRatio,
      dividend_yield: etf.dividend_yield || 0,
      expense_ratio: etf.expense_ratio || 0,
      assets_under_management: etf.assets_under_management || 0,
      category: this.categorizeETF(etf.symbol, etf.name),
      score: Math.max(score, 0),
      rationale: rationale.trim() || 'ETF selecionado'
    };
  }

  /**
   * Categoriza ETF baseado no símbolo e nome
   */
  private categorizeETF(symbol: string, name: string = ''): string {
    const symbolUpper = symbol.toUpperCase();
    const nameUpper = (name || '').toUpperCase();

    // Bonds
    if (symbolUpper.includes('BND') || nameUpper.includes('BOND') || 
        symbolUpper.includes('AGG') || nameUpper.includes('TLT')) {
      return 'BONDS';
    }

    // Technology
    if (symbolUpper.includes('QQQ') || nameUpper.includes('TECH') || 
        symbolUpper.includes('XLK') || nameUpper.includes('VGT')) {
      return 'TECHNOLOGY';
    }

    // International Developed
    if (symbolUpper.includes('VEA') || symbolUpper.includes('EFA') || 
        nameUpper.includes('EUROPE') || nameUpper.includes('DEVELOPED')) {
      return 'INTERNATIONAL_DEVELOPED';
    }

    // Emerging Markets
    if (symbolUpper.includes('VWO') || symbolUpper.includes('EEM') || 
        nameUpper.includes('EMERGING')) {
      return 'EMERGING_MARKETS';
    }

    // Small Cap
    if (symbolUpper.includes('IWM') || symbolUpper.includes('VB') || 
        nameUpper.includes('SMALL')) {
      return 'SMALL_CAP';
    }

    // Growth
    if (symbolUpper.includes('VUG') || nameUpper.includes('GROWTH')) {
      return 'GROWTH';
    }

    // Dividend
    if (symbolUpper.includes('VYM') || symbolUpper.includes('SCHD') || 
        nameUpper.includes('DIVIDEND')) {
      return 'DIVIDEND';
    }

    // Large Cap / Broad Market
    if (symbolUpper.includes('SPY') || symbolUpper.includes('VTI') || 
        symbolUpper.includes('VOO') || nameUpper.includes('S&P')) {
      return 'LARGE_CAP';
    }

    return 'OTHER';
  }

  /**
   * Seleciona carteira otimizada para perfil específico
   */
  async selectPortfolioForProfile(profile: 'CONSERVADOR' | 'MODERADO' | 'ARROJADO'): Promise<PortfolioAllocation[]> {
    const allocations: PortfolioAllocation[] = [];

    switch (profile) {
      case 'CONSERVADOR':
        return this.buildConservativePortfolio();
      
      case 'MODERADO':
        return this.buildModeratePortfolio();
      
      case 'ARROJADO':
        return this.buildAggressivePortfolio();
      
      default:
        return [];
    }
  }

  /**
   * Constrói carteira conservadora
   */
  private async buildConservativePortfolio(): Promise<PortfolioAllocation[]> {
    // 1. Buscar bonds (50% target)
    const bonds = await this.searchETFs({
      maxVolatility: 8,
      minAUM: 1000000000, // 1B+
      categories: ['BONDS']
    });

    // 2. Buscar large caps defensivos (30% target)
    const largeCaps = await this.searchETFs({
      maxVolatility: 25,
      minAUM: 10000000000, // 10B+
      minReturn: 5,
      categories: ['LARGE_CAP']
    });

    // 3. Buscar dividend ETFs (20% target)
    const dividends = await this.searchETFs({
      minDividendYield: 2,
      maxVolatility: 20,
      minAUM: 1000000000
    });

    const portfolio: PortfolioAllocation[] = [];

    // Alocar bonds
    if (bonds.length > 0) {
      portfolio.push({
        etf: bonds[0],
        allocation: 50,
        rationale: 'Base de renda fixa para estabilidade'
      });
    }

    // Alocar large caps
    if (largeCaps.length > 0) {
      portfolio.push({
        etf: largeCaps[0],
        allocation: 30,
        rationale: 'Exposição defensiva a ações'
      });
    }

    // Alocar dividendos
    if (dividends.length > 0) {
      const dividendETF = dividends.find(etf => etf.category === 'DIVIDEND') || dividends[0];
      portfolio.push({
        etf: dividendETF,
        allocation: 20,
        rationale: 'Renda de dividendos consistente'
      });
    }

    return this.normalizeAllocations(portfolio);
  }

  /**
   * Constrói carteira moderada
   */
  private async buildModeratePortfolio(): Promise<PortfolioAllocation[]> {
    // 1. Core equity (40%)
    const coreEquity = await this.searchETFs({
      maxVolatility: 22,
      minAUM: 10000000000,
      minReturn: 8
    });

    // 2. Bonds (25%)
    const bonds = await this.searchETFs({
      maxVolatility: 8,
      minAUM: 1000000000
    });

    // 3. International (20%)
    const international = await this.searchETFs({
      maxVolatility: 25,
      minAUM: 5000000000
    });

    // 4. Emerging markets (10%)
    const emerging = await this.searchETFs({
      minReturn: 5,
      maxVolatility: 35,
      minAUM: 1000000000
    });

    // 5. Dividends (5%)
    const dividends = await this.searchETFs({
      minDividendYield: 2,
      maxVolatility: 20
    });

    const portfolio: PortfolioAllocation[] = [];

    if (coreEquity.length > 0) {
      portfolio.push({
        etf: coreEquity[0],
        allocation: 40,
        rationale: 'Core equity exposure'
      });
    }

    if (bonds.length > 0) {
      portfolio.push({
        etf: bonds[0],
        allocation: 25,
        rationale: 'Componente de renda fixa'
      });
    }

    if (international.length > 0) {
      const intlETF = international.find(etf => etf.category === 'INTERNATIONAL_DEVELOPED') || international[0];
      portfolio.push({
        etf: intlETF,
        allocation: 20,
        rationale: 'Diversificação internacional'
      });
    }

    if (emerging.length > 0) {
      const emETF = emerging.find(etf => etf.category === 'EMERGING_MARKETS') || emerging[0];
      portfolio.push({
        etf: emETF,
        allocation: 10,
        rationale: 'Crescimento de mercados emergentes'
      });
    }

    if (dividends.length > 0) {
      portfolio.push({
        etf: dividends[0],
        allocation: 5,
        rationale: 'Renda adicional'
      });
    }

    return this.normalizeAllocations(portfolio);
  }

  /**
   * Constrói carteira arrojada
   */
  private async buildAggressivePortfolio(): Promise<PortfolioAllocation[]> {
    // 1. Large cap foundation (35%)
    const largeCap = await this.searchETFs({
      minReturn: 10,
      maxVolatility: 25,
      minAUM: 10000000000
    });

    // 2. Technology/Growth (25%)
    const tech = await this.searchETFs({
      minReturn: 15,
      maxVolatility: 30,
      minAUM: 5000000000
    });

    // 3. Emerging markets (15%)
    const emerging = await this.searchETFs({
      minReturn: 8,
      maxVolatility: 40,
      minAUM: 1000000000
    });

    // 4. Growth stocks (15%)
    const growth = await this.searchETFs({
      minReturn: 12,
      maxVolatility: 28,
      minAUM: 2000000000
    });

    // 5. Small cap (10%)
    const smallCap = await this.searchETFs({
      minReturn: 8,
      maxVolatility: 35,
      minAUM: 1000000000
    });

    const portfolio: PortfolioAllocation[] = [];

    if (largeCap.length > 0) {
      portfolio.push({
        etf: largeCap[0],
        allocation: 35,
        rationale: 'Base sólida de large caps'
      });
    }

    if (tech.length > 0) {
      const techETF = tech.find(etf => etf.category === 'TECHNOLOGY') || tech[0];
      portfolio.push({
        etf: techETF,
        allocation: 25,
        rationale: 'Crescimento tecnológico'
      });
    }

    if (emerging.length > 0) {
      const emETF = emerging.find(etf => etf.category === 'EMERGING_MARKETS') || emerging[0];
      portfolio.push({
        etf: emETF,
        allocation: 15,
        rationale: 'Alto potencial de crescimento'
      });
    }

    if (growth.length > 0) {
      const growthETF = growth.find(etf => etf.category === 'GROWTH') || growth[0];
      portfolio.push({
        etf: growthETF,
        allocation: 15,
        rationale: 'Ações de crescimento'
      });
    }

    if (smallCap.length > 0) {
      const scETF = smallCap.find(etf => etf.category === 'SMALL_CAP') || smallCap[0];
      portfolio.push({
        etf: scETF,
        allocation: 10,
        rationale: 'Exposição a small caps'
      });
    }

    return this.normalizeAllocations(portfolio);
  }

  /**
   * Normaliza alocações para somar 100%
   */
  private normalizeAllocations(portfolio: PortfolioAllocation[]): PortfolioAllocation[] {
    const total = portfolio.reduce((sum, item) => sum + item.allocation, 0);
    
    if (total === 0) return portfolio;

    return portfolio.map(item => ({
      ...item,
      allocation: Math.round((item.allocation / total) * 100 * 100) / 100 // 2 casas decimais
    }));
  }
}

export default ETFSelector; 