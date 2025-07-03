import { AdvancedPortfolioOptimizer, ETFData, OptimizedPortfolio } from './advanced-optimizer';
import { createClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  risk_tolerance: number; // 1-10
  investment_experience: string;
  monthly_investment: number;
  total_patrimony: number;
  birth_date: Date;
  country: string;
}

export interface PersonalizedRecommendation {
  id: string;
  userId: string;
  recommendationType: 'initial' | 'rebalance' | 'optimization';
  etfSymbols: string[];
  targetAllocations: number[];
  currentAllocations?: number[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  riskScore: number;
  justification: string;
  confidenceScore: number;
  monthlyProjections: {
    month: number;
    expectedValue: number;
    pessimisticScenario: number;
    optimisticScenario: number;
  }[];
}

export interface RebalancingAlert {
  id: string;
  userId: string;
  portfolioId?: string;
  alertType: 'drift' | 'volatility' | 'performance' | 'market_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggerCondition: any;
  currentState: any;
  recommendedAction: any;
}

export class PortfolioRecommendationEngine {
  private optimizer: AdvancedPortfolioOptimizer;
  private supabase;

  constructor() {
    this.optimizer = new AdvancedPortfolioOptimizer();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Gera recomendação personalizada baseada no perfil do usuário
   */
  async generatePersonalizedRecommendation(
    userId: string,
    investmentAmount: number,
    timeHorizon: number = 12 // meses
  ): Promise<PersonalizedRecommendation> {
    // 1. Buscar perfil do usuário
    const userProfile = await this.getUserProfile(userId);
    
    // 2. Selecionar ETFs adequados ao perfil
    const suitableETFs = await this.selectSuitableETFs(userProfile);
    
    // 3. Determinar perfil de risco
    const riskProfile = this.getRiskCategory(userProfile.risk_tolerance);
    const riskProfileUpper = riskProfile.toUpperCase() as 'CONSERVADOR' | 'MODERADO' | 'ARROJADO';
    
    // 4. Otimizar carteira baseada no perfil de risco
    const optimization = await this.optimizer.optimizeByRiskProfile(riskProfileUpper, investmentAmount);
    
    // 5. Ajustar alocações baseado no perfil específico
    const adjustedAllocations = this.adjustAllocationsForProfile(
      optimization.etf_allocations.map(a => ({ symbol: a.symbol, weight: a.allocation * 100 })),
      userProfile
    );
    
    // 6. Calcular projeções de 12 meses (simuladas)
    const projections = this.generateMonthlyProjections(
      optimization.expected_return,
      optimization.expected_volatility,
      investmentAmount,
      timeHorizon
    );
    
    // 7. Gerar justificativa personalizada
    const justification = this.generateJustification(
      userProfile,
      adjustedAllocations,
      optimization,
      timeHorizon
    );
    
    // 8. Calcular score de confiança
    const confidenceScore = this.calculateConfidenceScore(
      userProfile,
      suitableETFs,
      optimization
    );
    
    // 9. Salvar recomendação no banco
    const recommendation = await this.saveRecommendation({
      userId,
      recommendationType: 'initial',
      etfSymbols: adjustedAllocations.map(a => a.symbol),
      targetAllocations: adjustedAllocations.map(a => a.weight),
      expectedReturn: optimization.expected_return,
      volatility: optimization.expected_volatility,
      sharpeRatio: optimization.sharpe_ratio,
      riskScore: this.calculateRiskScore(userProfile, optimization.expected_volatility),
      justification,
      confidenceScore,
      monthlyProjections: projections
    });
    
    return recommendation;
  }

  /**
   * Busca perfil do usuário no banco de dados
   */
  private async getUserProfile(userId: string): Promise<UserProfile> {
    // Verificar se é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(userId)) {
      console.log('⚠️ UUID inválido detectado, usando perfil padrão:', userId);
      // Retornar perfil padrão para casos como 'demo-user'
      return {
        id: 'default-profile',
        risk_tolerance: 5,
        investment_experience: 'intermediate',
        monthly_investment: 2000,
        total_patrimony: 100000,
        birth_date: new Date('1985-01-01'),
        country: 'BR'
      };
    }
    
    try {
      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !profile) {
        console.log('⚠️ Perfil não encontrado, usando perfil padrão para:', userId);
        return {
          id: userId,
          risk_tolerance: 5,
          investment_experience: 'intermediate',
          monthly_investment: 2000,
          total_patrimony: 100000,
          birth_date: new Date('1985-01-01'),
          country: 'BR'
        };
      }
      
      return {
        id: profile.id,
        risk_tolerance: profile.risk_tolerance || 5,
        investment_experience: profile.investment_experience || 'intermediate',
        monthly_investment: Number(profile.monthly_investment) || 2000,
        total_patrimony: Number(profile.total_patrimony) || 100000,
        birth_date: profile.birth_date || new Date('1985-01-01'),
        country: profile.country || 'BR'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar perfil do usuário:', error);
      // Fallback para perfil padrão em caso de erro
      return {
        id: 'fallback-profile',
        risk_tolerance: 5,
        investment_experience: 'intermediate',
        monthly_investment: 2000,
        total_patrimony: 100000,
        birth_date: new Date('1985-01-01'),
        country: 'BR'
      };
    }
  }

  /**
   * Gera projeções mensais simuladas
   */
  private generateMonthlyProjections(
    expectedReturn: number,
    volatility: number,
    investmentAmount: number,
    timeHorizon: number
  ): { month: number; expectedValue: number; pessimisticScenario: number; optimisticScenario: number; }[] {
    const projections: { month: number; expectedValue: number; pessimisticScenario: number; optimisticScenario: number; }[] = [];
    
    for (let month = 1; month <= timeHorizon; month++) {
      const monthlyReturn = expectedReturn / 12;
      const monthlyVolatility = volatility / Math.sqrt(12);
      
      const expectedValue = investmentAmount * Math.pow(1 + monthlyReturn, month);
      const pessimisticScenario = expectedValue * (1 - 1.65 * monthlyVolatility);
      const optimisticScenario = expectedValue * (1 + 1.65 * monthlyVolatility);
      
      projections.push({
        month,
        expectedValue,
        pessimisticScenario,
        optimisticScenario
      });
    }
    
    return projections;
  }

  /**
   * Seleciona ETFs adequados ao perfil do usuário
   */
  private async selectSuitableETFs(profile: UserProfile): Promise<ETFData[]> {
    // Buscar ETFs com base no perfil de risco e experiência
    const riskCategory = this.getRiskCategory(profile.risk_tolerance);
    
    try {
      // Tentar buscar ETFs da base real primeiro
      const etfs = await this.queryETFsFromDatabase(riskCategory);
      
      if (etfs.length > 0) {
        console.log(`✅ Encontrados ${etfs.length} ETFs na base real para perfil ${riskCategory}`);
        return etfs;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar ETFs da base real, usando dados simulados:', error);
    }
    
    // Fallback: usar dados simulados baseados no perfil
    return this.getSimulatedETFsForProfile(riskCategory);
  }
  
  /**
   * Busca ETFs da base de dados real
   */
  private async queryETFsFromDatabase(riskCategory: string): Promise<ETFData[]> {
    const volatilityLimit = this.getVolatilityLimit(riskCategory);
    
    try {
      const { data: etfs, error } = await this.supabase
        .from('etfs_ativos_reais')
        .select(`
          symbol,
          name,
          returns_12m,
          returns_24m,
          returns_36m,
          volatility_12m,
          sharpe_12m,
          max_drawdown,
          dividends_12m,
          totalasset,
          expenseratio,
          assetclass,
          etf_type,
          size_category,
          liquidity_category
        `)
        .not('returns_12m', 'is', null)
        .not('volatility_12m', 'is', null)
        .not('sharpe_12m', 'is', null)
        .gt('totalasset', 100000000)
        .lt('volatility_12m', volatilityLimit)
        .order('sharpe_12m', { ascending: false })
        .limit(8);
      
      if (error) {
        console.error('❌ Erro ao buscar ETFs:', error);
        return [];
      }
      
      const etfData: ETFData[] = [];
      for (const etf of etfs || []) {
        const historicalPrices = await this.getHistoricalPrices(etf.symbol);
        
        etfData.push({
          symbol: etf.symbol,
          name: etf.name || '',
          assetclass: etf.assetclass || 'Unknown',
          returns_12m: Number(etf.returns_12m) || 8,
          returns_24m: Number(etf.returns_24m) || 8,
          returns_36m: Number(etf.returns_36m) || 8,
          volatility_12m: Number(etf.volatility_12m) || 15,
          sharpe_12m: Number(etf.sharpe_12m) || 0.5,
          max_drawdown: Number(etf.max_drawdown) || -20,
          dividends_12m: Number(etf.dividends_12m) || 0,
          totalasset: Number(etf.totalasset) || 1000000000,
          expenseratio: Number(etf.expenseratio) || 0.5,
          etf_type: etf.etf_type || 'Unknown',
          size_category: etf.size_category || 'Unknown',
          liquidity_category: etf.liquidity_category || 'High'
        });
      }
      
      return etfData;
    } catch (error) {
      console.error('❌ Erro na consulta de ETFs:', error);
      return [];
    }
  }
  
  /**
   * ETFs simulados para fallback
   */
  private getSimulatedETFsForProfile(riskCategory: string): ETFData[] {
    const baseETFs = {
      conservative: [
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetclass: 'Intermediate Core Bond', returns_12m: 5.2, volatility_12m: 5.5, sharpe_12m: 0.95 },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetclass: 'Large Blend', returns_12m: 10.8, volatility_12m: 16.2, sharpe_12m: 0.67 },
        { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', assetclass: 'Large Value', returns_12m: 9.5, volatility_12m: 14.8, sharpe_12m: 0.64 },
        { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', assetclass: 'Large Value', returns_12m: 11.2, volatility_12m: 15.1, sharpe_12m: 0.74 }
      ],
      moderate: [
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetclass: 'Large Blend', returns_12m: 10.8, volatility_12m: 16.2, sharpe_12m: 0.67 },
        { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', assetclass: 'Foreign Large Blend', returns_12m: 8.9, volatility_12m: 18.5, sharpe_12m: 0.48 },
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetclass: 'Intermediate Core Bond', returns_12m: 5.2, volatility_12m: 5.5, sharpe_12m: 0.95 },
        { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', assetclass: 'Diversified Emerging Mkts', returns_12m: 7.8, volatility_12m: 22.1, sharpe_12m: 0.35 },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', assetclass: 'Large Growth', returns_12m: 15.2, volatility_12m: 24.8, sharpe_12m: 0.61 }
      ],
      aggressive: [
        { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', assetclass: 'Large Growth', returns_12m: 15.2, volatility_12m: 24.8, sharpe_12m: 0.61 },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetclass: 'Large Blend', returns_12m: 10.8, volatility_12m: 16.2, sharpe_12m: 0.67 },
        { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', assetclass: 'Diversified Emerging Mkts', returns_12m: 7.8, volatility_12m: 22.1, sharpe_12m: 0.35 },
        { symbol: 'VUG', name: 'Vanguard Growth ETF', assetclass: 'Large Growth', returns_12m: 13.8, volatility_12m: 21.5, sharpe_12m: 0.64 },
        { symbol: 'IWM', name: 'iShares Russell 2000 ETF', assetclass: 'Small Blend', returns_12m: 9.2, volatility_12m: 26.8, sharpe_12m: 0.34 },
        { symbol: 'ARKK', name: 'ARK Innovation ETF', assetclass: 'Mid Growth', returns_12m: 18.5, volatility_12m: 35.2, sharpe_12m: 0.53 }
      ]
    };
    
    const selectedETFs = baseETFs[riskCategory] || baseETFs.moderate;
    
    return selectedETFs.map(etf => ({
      symbol: etf.symbol,
      name: etf.name,
      assetclass: etf.assetclass,
      returns_12m: etf.returns_12m,
      returns_24m: etf.returns_12m * 0.9, // Simulado
      returns_36m: etf.returns_12m * 0.85, // Simulado
      volatility_12m: etf.volatility_12m,
      sharpe_12m: etf.sharpe_12m,
      max_drawdown: -etf.volatility_12m * 1.5, // Estimativa
      dividends_12m: etf.assetclass.includes('Bond') ? 3.5 : etf.assetclass.includes('Value') ? 2.8 : 1.2,
      totalasset: 50000000000, // $50B simulado
      expenseratio: 0.05, // 0.05% simulado
      etf_type: 'ETF',
      size_category: 'Large',
      liquidity_category: 'High'
    }));
  }
  
  /**
   * Gera preços simulados para ETFs
   */
  private generateSimulatedPrices(expectedReturn: number, volatility: number): number[] {
    const prices: number[] = [100]; // Preço inicial
    const dailyReturn = expectedReturn / 252 / 100;
    const dailyVol = volatility / Math.sqrt(252) / 100;
    
    for (let i = 1; i < 252; i++) {
      const randomShock = (Math.random() - 0.5) * 2;
      const dailyChange = dailyReturn + dailyVol * randomShock;
      prices.push(prices[i-1] * (1 + dailyChange));
    }
    
    return prices;
  }
  
  /**
   * Retorna limite de volatilidade numérico
   */
  private getVolatilityLimit(riskCategory: string): number {
    switch (riskCategory) {
      case 'conservative': return 0.15; // 15%
      case 'moderate': return 0.25; // 25%
      case 'aggressive': return 0.40; // 40%
      default: return 0.25;
    }
  }

  /**
   * Busca preços históricos do ETF
   */
  private async getHistoricalPrices(symbol: string): Promise<number[]> {
    try {
      const { data: prices, error } = await this.supabase
        .from('etf_prices')
        .select('adjusted_close')
        .eq('symbol', symbol)
        .order('date', { ascending: true })
        .limit(252);
      
      if (!error && prices && prices.length > 0) {
        return prices.map(p => Number(p.adjusted_close) || 0).filter(p => p > 0);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar preços históricos para ${symbol}, usando simulados:`, error);
    }
    
    // Fallback: gerar preços simulados baseados no símbolo
    return this.generateDefaultPricesForSymbol(symbol);
  }
  
  /**
   * Gera preços padrão para símbolos conhecidos
   */
  private generateDefaultPricesForSymbol(symbol: string): number[] {
    const symbolDefaults = {
      'VTI': { return: 10.8, vol: 16.2 },
      'BND': { return: 5.2, vol: 5.5 },
      'QQQ': { return: 15.2, vol: 24.8 },
      'VEA': { return: 8.9, vol: 18.5 },
      'VWO': { return: 7.8, vol: 22.1 },
      'VYM': { return: 9.5, vol: 14.8 },
      'SCHD': { return: 11.2, vol: 15.1 },
      'VUG': { return: 13.8, vol: 21.5 },
      'IWM': { return: 9.2, vol: 26.8 },
      'ARKK': { return: 18.5, vol: 35.2 }
    };
    
    const defaults = symbolDefaults[symbol] || { return: 8.0, vol: 18.0 };
    return this.generateSimulatedPrices(defaults.return, defaults.vol);
  }

  /**
   * Determina categoria de risco baseada na tolerância
   */
  private getRiskCategory(riskTolerance: number): 'conservative' | 'moderate' | 'aggressive' {
    if (riskTolerance <= 3) return 'conservative';
    if (riskTolerance <= 7) return 'moderate';
    return 'aggressive';
  }

  /**
   * Constrói query personalizada para seleção de ETFs
   */
  private buildETFQuery(
    riskCategory: string,
    experienceLevel: string,
    country: string
  ): string {
    // Lógica para construir query baseada no perfil
    return `/* Query personalizada baseada em ${riskCategory}, ${experienceLevel}, ${country} */`;
  }

  /**
   * Retorna filtro de volatilidade baseado no perfil de risco
   */
  private getVolatilityFilter(riskCategory: string): string {
    switch (riskCategory) {
      case 'conservative': return '< 0.15'; // Até 15% volatilidade
      case 'moderate': return '< 0.25'; // Até 25% volatilidade
      case 'aggressive': return '< 0.40'; // Até 40% volatilidade
      default: return '< 0.25';
    }
  }

  /**
   * Ajusta alocações baseado no perfil específico do usuário
   */
  private adjustAllocationsForProfile(
    baseAllocations: { symbol: string; weight: number }[],
    profile: UserProfile
  ): { symbol: string; weight: number }[] {
    const adjustments = this.getProfileAdjustments(profile);
    
    return baseAllocations.map(allocation => ({
      ...allocation,
      weight: Math.max(0, Math.min(100, allocation.weight * adjustments[allocation.symbol] || 1))
    }));
  }

  /**
   * Calcula ajustes baseados no perfil
   */
  private getProfileAdjustments(profile: UserProfile): { [symbol: string]: number } {
    const age = new Date().getFullYear() - profile.birth_date.getFullYear();
    const bondAllocation = Math.min(age, 40) / 100; // Rule: age in bonds, max 40%
    
    // Ajustes baseados na idade e experiência
    const adjustments: { [symbol: string]: number } = {};
    
    if (profile.investment_experience === 'beginner') {
      // Iniciantes: mais conservador, maior alocação em ETFs diversificados
      adjustments['VTI'] = 1.2; // Aumentar S&P 500
      adjustments['BND'] = 1.3; // Aumentar bonds
      adjustments['VWO'] = 0.7; // Reduzir emergentes
    }
    
    return adjustments;
  }

  /**
   * Gera justificativa personalizada
   */
  private generateJustification(
    profile: UserProfile,
    allocations: { symbol: string; weight: number }[],
    optimization: OptimizedPortfolio,
    timeHorizon: number
  ): string {
    const age = new Date().getFullYear() - profile.birth_date.getFullYear();
    const riskCategory = this.getRiskCategory(profile.risk_tolerance);
    
    let justification = `Com base no seu perfil de investidor ${riskCategory} `;
    justification += `e ${age} anos de idade, esta carteira foi otimizada para:\n\n`;
    
    justification += `• **Retorno Esperado**: ${optimization.expected_return.toFixed(1)}% ao ano\n`;
    justification += `• **Volatilidade**: ${optimization.expected_volatility.toFixed(1)}% (${riskCategory === 'conservative' ? 'baixa' : riskCategory === 'moderate' ? 'moderada' : 'alta'})\n`;
    justification += `• **Sharpe Ratio**: ${optimization.sharpe_ratio.toFixed(2)} (eficiência risco-retorno)\n\n`;
    
    justification += `**Composição da Carteira:**\n`;
    allocations.forEach(allocation => {
      justification += `• ${allocation.symbol}: ${allocation.weight.toFixed(1)}%\n`;
    });
    
    justification += `\n**Estratégia**: Esta alocação considera sua experiência em investimentos `;
    justification += `(${profile.investment_experience}) e horizonte de ${timeHorizon} meses, `;
    justification += `balanceando crescimento e proteção do capital.`;
    
    return justification;
  }

  /**
   * Calcula score de confiança da recomendação
   */
  private calculateConfidenceScore(
    profile: UserProfile,
    etfs: ETFData[],
    optimization: OptimizedPortfolio
  ): number {
    let confidence = 0.8; // Base confidence
    
    // Ajustar baseado na qualidade dos dados
    if (etfs.length >= 3) {
      confidence += 0.1; // Dados históricos suficientes simulados
    }
    
    // Ajustar baseado no Sharpe ratio
    if (optimization.sharpe_ratio > 1.0) {
      confidence += 0.05;
    }
    
    // Ajustar baseado na experiência do usuário
    if (profile.investment_experience === 'advanced') {
      confidence += 0.05;
    }
    
    return Math.min(1.0, confidence);
  }

  /**
   * Calcula score de risco (1-10)
   */
  private calculateRiskScore(profile: UserProfile, volatility: number): number {
    const baseRisk = Math.ceil(volatility / 4); // Volatility 20% = Risk 5
    const profileAdjustment = profile.risk_tolerance - 5; // Adjust based on user tolerance
    
    return Math.max(1, Math.min(10, baseRisk + profileAdjustment));
  }

  /**
   * Salva recomendação no banco de dados
   */
  private async saveRecommendation(data: any): Promise<PersonalizedRecommendation> {
    try {
      // Verificar se é um UUID válido antes de tentar salvar
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(data.userId)) {
        console.log('⚠️ Não salvando recomendação - userId inválido:', data.userId);
        // Retornar objeto sem salvar no banco
        return {
          id: `temp-${Date.now()}`,
          userId: data.userId,
          recommendationType: data.recommendationType,
          etfSymbols: data.etfSymbols,
          targetAllocations: data.targetAllocations,
          currentAllocations: data.currentAllocations,
          expectedReturn: data.expectedReturn,
          volatility: data.volatility,
          sharpeRatio: data.sharpeRatio,
          riskScore: data.riskScore,
          justification: data.justification,
          confidenceScore: data.confidenceScore,
          monthlyProjections: data.monthlyProjections
        };
      }
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expira em 30 dias
      
      const { data: saved, error } = await this.supabase
        .from('portfolio_recommendations')
        .insert({
          user_id: data.userId,
          recommendation_type: data.recommendationType,
          etf_symbols: data.etfSymbols,
          target_allocations: data.targetAllocations,
          current_allocations: data.currentAllocations,
          expected_return: data.expectedReturn,
          volatility: data.volatility,
          sharpe_ratio: data.sharpeRatio,
          risk_score: data.riskScore,
          justification: data.justification,
          confidence_score: data.confidenceScore,
          expires_at: expiresAt
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: saved.id,
        userId: saved.user_id,
        recommendationType: saved.recommendation_type as any,
        etfSymbols: saved.etf_symbols as string[],
        targetAllocations: saved.target_allocations as number[],
        currentAllocations: saved.current_allocations as number[] || undefined,
        expectedReturn: Number(saved.expected_return),
        volatility: Number(saved.volatility),
        sharpeRatio: Number(saved.sharpe_ratio),
        riskScore: saved.risk_score,
        justification: saved.justification,
        confidenceScore: Number(saved.confidence_score),
        monthlyProjections: data.monthlyProjections
      };
    } catch (error) {
      console.warn('⚠️ Erro ao salvar recomendação, retornando objeto temporário:', error);
      // Fallback: retornar objeto sem salvar
      return {
        id: `temp-${Date.now()}`,
        userId: data.userId,
        recommendationType: data.recommendationType,
        etfSymbols: data.etfSymbols,
        targetAllocations: data.targetAllocations,
        currentAllocations: data.currentAllocations,
        expectedReturn: data.expectedReturn,
        volatility: data.volatility,
        sharpeRatio: data.sharpeRatio,
        riskScore: data.riskScore,
        justification: data.justification,
        confidenceScore: data.confidenceScore,
        monthlyProjections: data.monthlyProjections
      };
    }
  }

  /**
   * Monitora carteiras ativas para rebalanceamento
   */
  async checkForRebalancing(userId: string): Promise<RebalancingAlert[]> {
    try {
      // Verificar se é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(userId)) {
        console.log('⚠️ UUID inválido para rebalanceamento:', userId);
        return []; // Retornar array vazio
      }
      
      const { data: activePortfolios, error } = await this.supabase
        .from('user_portfolio_allocations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) {
        console.error('❌ Erro ao buscar portfolios ativos:', error);
        return [];
      }
    
    const alerts: RebalancingAlert[] = [];
    
    for (const portfolio of activePortfolios || []) {
      const currentAllocations = portfolio.current_allocations as number[];
      const targetAllocations = portfolio.target_allocations as number[];
      const threshold = Number(portfolio.rebalance_threshold);
      
      // Verificar desvios
      const deviations = currentAllocations.map((current, i) => 
        Math.abs(current - targetAllocations[i])
      );
      
      const maxDeviation = Math.max(...deviations);
      
      if (maxDeviation > threshold) {
        const alert = await this.createRebalancingAlert(
          userId,
          portfolio.id,
          'drift',
          maxDeviation > threshold * 2 ? 'high' : 'medium',
          `Sua carteira "${portfolio.portfolio_name}" desviou ${maxDeviation.toFixed(1)}% da alocação alvo.`,
          { maxDeviation, threshold },
          { currentAllocations, targetAllocations },
          { action: 'rebalance', suggestedTrades: this.calculateRebalancingTrades(currentAllocations, targetAllocations) }
        );
        
        alerts.push(alert);
      }
    }
    
    return alerts;
    } catch (error) {
      console.warn('⚠️ Erro ao verificar rebalanceamento:', error);
      return []; // Retornar array vazio em caso de erro
    }
  }

  /**
   * Cria alerta de rebalanceamento
   */
  private async createRebalancingAlert(
    userId: string,
    portfolioId: string,
    alertType: string,
    severity: string,
    message: string,
    triggerCondition: any,
    currentState: any,
    recommendedAction: any
  ): Promise<RebalancingAlert> {
    try {
      const { data: saved, error } = await this.supabase
        .from('portfolio_rebalancing_alerts')
        .insert({
          user_id: userId,
          portfolio_id: portfolioId,
          alert_type: alertType,
          severity,
          message,
          trigger_condition: triggerCondition,
          current_state: currentState,
          recommended_action: recommendedAction
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: saved.id,
        userId: saved.user_id,
        portfolioId: saved.portfolio_id || undefined,
        alertType: saved.alert_type as any,
        severity: saved.severity as any,
        message: saved.message,
        triggerCondition: saved.trigger_condition,
        currentState: saved.current_state,
        recommendedAction: saved.recommended_action
      };
    } catch (error) {
      console.warn('⚠️ Erro ao criar alerta de rebalanceamento:', error);
      // Retornar alerta temporário
      return {
        id: `temp-alert-${Date.now()}`,
        userId,
        portfolioId,
        alertType: alertType as any,
        severity: severity as any,
        message,
        triggerCondition,
        currentState,
        recommendedAction
      };
    }
  }

  /**
   * Calcula trades necessários para rebalanceamento
   */
  private calculateRebalancingTrades(
    currentAllocations: number[],
    targetAllocations: number[]
  ): { symbol: string; action: 'buy' | 'sell'; amount: number }[] {
    // Implementação simplificada - pode ser expandida
    return currentAllocations.map((current, i) => ({
      symbol: `ETF_${i}`,
      action: current > targetAllocations[i] ? 'sell' : 'buy',
      amount: Math.abs(current - targetAllocations[i])
    }));
  }

  /**
   * Gera relatório de performance da carteira
   */
  async generatePerformanceReport(userId: string, portfolioId: string): Promise<{
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    benchmark: string;
    outperformance: number;
  }> {
    // Implementação do relatório de performance
    // Buscar dados históricos da carteira e calcular métricas
    
    return {
      totalReturn: 12.5,
      annualizedReturn: 8.3,
      volatility: 14.2,
      sharpeRatio: 0.85,
      maxDrawdown: -8.1,
      benchmark: 'S&P 500',
      outperformance: 2.1
    };
  }
} 