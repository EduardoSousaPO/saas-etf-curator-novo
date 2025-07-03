import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  // Campos principais
  investmentAmount: z.number().min(100).max(50000000), // Mais flexível: $100 a $50M
  timeHorizon: z.number().min(1).max(600).optional().default(12), // Até 50 anos
  riskOverride: z.number().min(1).max(10).optional(),
  
  // Campos do onboarding (vindos do frontend)
  objective: z.enum(['retirement', 'emergency', 'house', 'growth']).optional(),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  monthlyAmount: z.number().min(50).max(100000).optional(), // $50 a $100k por mês
  
  // Preferências avançadas
  preferences: z.object({
    sectors: z.array(z.string()).optional(),
    excludeETFs: z.array(z.string()).optional(),
    sustainableOnly: z.boolean().optional().default(false)
  }).optional()
});

// Dados simulados de ETFs para garantir funcionamento
const simulatedETFs = [
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    returns_12m: 12.5,
    volatility: 15.2,
    sharpe_ratio: 0.82,
    dividend_yield: 1.3,
    expense_ratio: 0.03,
    assets_under_management: 280000000000,
    asset_class: 'EQUITY_LARGE_CAP',
    geographic_region: 'US_DOMESTIC',
    sector_focus: 'DIVERSIFIED',
    market_cap_exposure: 'LARGE_CAP',
    quality_score: 92,
    diversification_score: 95,
    liquidity_score: 98,
    cost_efficiency_score: 96,
    risk_adjusted_score: 88,
    max_drawdown: -22.1,
    beta_spy: 1.0,
    correlation_spy: 0.99,
    selection_rationale: 'ETF de alta qualidade com excelente diversificação no mercado americano total'
  },
  {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    returns_12m: 5.8,
    volatility: 4.2,
    sharpe_ratio: 1.38,
    dividend_yield: 4.1,
    expense_ratio: 0.03,
    assets_under_management: 95000000000,
    asset_class: 'BONDS',
    geographic_region: 'US_DOMESTIC',
    sector_focus: 'GOVERNMENT_CORPORATE',
    market_cap_exposure: 'ALL_CAP',
    quality_score: 89,
    diversification_score: 92,
    liquidity_score: 95,
    cost_efficiency_score: 96,
    risk_adjusted_score: 94,
    max_drawdown: -8.5,
    beta_spy: 0.15,
    correlation_spy: -0.05,
    selection_rationale: 'ETF de bonds com excelente estabilidade e proteção contra volatilidade'
  },
  {
    symbol: 'VEA',
    name: 'Vanguard FTSE Developed Markets ETF',
    returns_12m: 9.2,
    volatility: 17.8,
    sharpe_ratio: 0.52,
    dividend_yield: 2.8,
    expense_ratio: 0.05,
    assets_under_management: 85000000000,
    asset_class: 'EQUITY_INTERNATIONAL',
    geographic_region: 'INTERNATIONAL_DEVELOPED',
    sector_focus: 'DIVERSIFIED',
    market_cap_exposure: 'LARGE_CAP',
    quality_score: 84,
    diversification_score: 88,
    liquidity_score: 92,
    cost_efficiency_score: 94,
    risk_adjusted_score: 79,
    max_drawdown: -26.3,
    beta_spy: 0.85,
    correlation_spy: 0.78,
    selection_rationale: 'Diversificação internacional com foco em mercados desenvolvidos'
  },
  {
    symbol: 'VWO',
    name: 'Vanguard FTSE Emerging Markets ETF',
    returns_12m: 8.9,
    volatility: 22.5,
    sharpe_ratio: 0.40,
    dividend_yield: 3.2,
    expense_ratio: 0.08,
    assets_under_management: 65000000000,
    asset_class: 'EQUITY_EMERGING',
    geographic_region: 'EMERGING_MARKETS',
    sector_focus: 'DIVERSIFIED',
    market_cap_exposure: 'LARGE_CAP',
    quality_score: 76,
    diversification_score: 82,
    liquidity_score: 88,
    cost_efficiency_score: 89,
    risk_adjusted_score: 72,
    max_drawdown: -32.8,
    beta_spy: 1.15,
    correlation_spy: 0.72,
    selection_rationale: 'Exposição a mercados emergentes para crescimento a longo prazo'
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust ETF',
    returns_12m: 18.7,
    volatility: 24.1,
    sharpe_ratio: 0.78,
    dividend_yield: 0.6,
    expense_ratio: 0.20,
    assets_under_management: 220000000000,
    asset_class: 'EQUITY_TECHNOLOGY',
    geographic_region: 'US_DOMESTIC',
    sector_focus: 'TECHNOLOGY',
    market_cap_exposure: 'LARGE_CAP',
    quality_score: 85,
    diversification_score: 65,
    liquidity_score: 98,
    cost_efficiency_score: 82,
    risk_adjusted_score: 83,
    max_drawdown: -35.2,
    beta_spy: 1.25,
    correlation_spy: 0.89,
    selection_rationale: 'ETF de tecnologia com alto potencial de crescimento'
  }
];

function determineStrategy(
  timeHorizon: number, 
  riskOverride?: number,
  riskProfile?: string,
  objective?: string
): 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' {
  // 1. Prioridade: riskProfile explícito do onboarding
  if (riskProfile) {
    switch (riskProfile) {
      case 'conservative': return 'CONSERVATIVE';
      case 'moderate': return 'MODERATE';
      case 'aggressive': return 'AGGRESSIVE';
    }
  }
  
  // 2. Segunda prioridade: riskOverride numérico
  if (riskOverride) {
    if (riskOverride <= 3) return 'CONSERVATIVE';
    if (riskOverride <= 7) return 'MODERATE';
    return 'AGGRESSIVE';
  }
  
  // 3. Baseado no objetivo
  if (objective) {
    switch (objective) {
      case 'emergency': return 'CONSERVATIVE';
      case 'house': return 'MODERATE';
      case 'retirement': 
      case 'growth': return timeHorizon > 60 ? 'AGGRESSIVE' : 'MODERATE';
    }
  }
  
  // 4. Fallback: baseado no horizonte temporal
  if (timeHorizon <= 3) return 'CONSERVATIVE';
  if (timeHorizon <= 10) return 'MODERATE';
  return 'AGGRESSIVE';
}

function buildPortfolio(strategy: string, amount: number) {
  const strategies = {
    CONSERVATIVE: {
      allocations: [
        { symbol: 'BND', percent: 50 },
        { symbol: 'VTI', percent: 30 },
        { symbol: 'VEA', percent: 15 },
        { symbol: 'VWO', percent: 5 }
      ],
      description: 'Portfolio conservador focado em preservação de capital'
    },
    MODERATE: {
      allocations: [
        { symbol: 'VTI', percent: 40 },
        { symbol: 'BND', percent: 25 },
        { symbol: 'VEA', percent: 20 },
        { symbol: 'VWO', percent: 10 },
        { symbol: 'QQQ', percent: 5 }
      ],
      description: 'Portfolio balanceado com crescimento moderado'
    },
    AGGRESSIVE: {
      allocations: [
        { symbol: 'VTI', percent: 35 },
        { symbol: 'QQQ', percent: 20 },
        { symbol: 'VEA', percent: 20 },
        { symbol: 'VWO', percent: 15 },
        { symbol: 'BND', percent: 10 }
      ],
      description: 'Portfolio agressivo focado em crescimento'
    }
  };

  const strategyData = strategies[strategy as keyof typeof strategies];
  
  const portfolio = strategyData.allocations.map(allocation => {
    const etf = simulatedETFs.find(e => e.symbol === allocation.symbol)!;
    return {
      etf,
      allocation_percent: allocation.percent,
      allocation_amount: (amount * allocation.percent) / 100,
      rationale: `${allocation.percent}% alocado em ${etf.name} - ${etf.selection_rationale}`
    };
  });

  // Calcular métricas do portfolio
  const totalReturn = portfolio.reduce((sum, item) => 
    sum + (item.etf.returns_12m * item.allocation_percent / 100), 0);
  
  const totalVolatility = Math.sqrt(
    portfolio.reduce((sum, item) => 
      sum + Math.pow(item.etf.volatility * item.allocation_percent / 100, 2), 0)
  );

  const portfolioSharpe = totalReturn / totalVolatility;

  return {
    portfolio,
    strategy_info: {
      name: strategy,
      description: strategyData.description,
      expected_return: totalReturn,
      expected_volatility: totalVolatility,
      sharpe_ratio: portfolioSharpe
    },
    portfolio_metrics: {
      total_return_12m: totalReturn,
      volatility_12m: totalVolatility,
      sharpe_ratio: portfolioSharpe,
      total_dividend_yield: portfolio.reduce((sum, item) => 
        sum + (item.etf.dividend_yield * item.allocation_percent / 100), 0),
      weighted_expense_ratio: portfolio.reduce((sum, item) => 
        sum + (item.etf.expense_ratio * item.allocation_percent / 100), 0),
      max_drawdown: portfolio.reduce((min, item) => 
        Math.min(min, item.etf.max_drawdown * item.allocation_percent / 100), 0)
    },
    diversification_analysis: {
      geographic_diversification: {
        us_domestic: portfolio.filter(p => p.etf.geographic_region === 'US_DOMESTIC')
          .reduce((sum, p) => sum + p.allocation_percent, 0),
        international: portfolio.filter(p => p.etf.geographic_region.includes('INTERNATIONAL'))
          .reduce((sum, p) => sum + p.allocation_percent, 0),
        emerging: portfolio.filter(p => p.etf.geographic_region === 'EMERGING_MARKETS')
          .reduce((sum, p) => sum + p.allocation_percent, 0)
      },
      asset_class_diversification: {
        equity: portfolio.filter(p => p.etf.asset_class.includes('EQUITY'))
          .reduce((sum, p) => sum + p.allocation_percent, 0),
        bonds: portfolio.filter(p => p.etf.asset_class === 'BONDS')
          .reduce((sum, p) => sum + p.allocation_percent, 0)
      }
    }
  };
}

/**
 * ⚠️  ENDPOINT OBSOLETO - DEPRECADO
 * 
 * Este endpoint foi substituído pelo sistema unificado de recomendações.
 * 
 * MOTIVOS DA DEPRECIAÇÃO:
 * - Usava dados simulados (5 ETFs hardcoded) ao invés da base real
 * - Funcionalidade duplicada com outros endpoints
 * - Arquitetura inconsistente
 * 
 * MIGRAÇÃO:
 * Use: /api/portfolio/unified-recommendations
 * 
 * BENEFÍCIOS DO NOVO ENDPOINT:
 * - Base real de 1.370 ETFs
 * - Sistema de scoring avançado
 * - Benchmarking integrado
 * - Métricas de risco completas
 * - Projeções temporais
 */

export async function POST(request: NextRequest) {
  console.log('⚠️ [DEPRECATED] Acesso ao endpoint obsoleto advanced-recommendation');
  
  return NextResponse.json({
    success: false,
    deprecated: true,
    message: 'Este endpoint foi descontinuado',
    reason: 'Funcionalidade consolidada no sistema unificado',
    migration: {
      new_endpoint: '/api/portfolio/unified-recommendations',
      benefits: [
        'Base real de 1.370 ETFs (vs 5 ETFs simulados)',
        'Sistema de scoring multi-dimensional',
        'Benchmarking vs SPY+BND integrado',
        'Métricas de risco avançadas (VaR, CVaR, Sortino)',
        'Projeções temporais com cenários',
        'ETFs alternativos para diversificação'
      ],
      breaking_changes: [
        'Estrutura de resposta atualizada',
        'Validação de entrada mais robusta',
        'Campos de saída expandidos'
      ]
    },
    redirect_url: '/api/portfolio/unified-recommendations',
    deprecation_date: '2024-01-15',
    removal_date: '2024-02-15'
  }, { status: 410 }); // 410 Gone - Resource no longer available
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'DEPRECATED',
    message: 'Endpoint descontinuado - use /api/portfolio/unified-recommendations',
    documentation: {
      reason: 'Consolidação de arquitetura - eliminação de duplicação funcional',
      old_functionality: 'Recomendações baseadas em dados simulados',
      new_functionality: 'Recomendações baseadas em base real de 1.370 ETFs',
      migration_guide: 'Atualize suas chamadas para o novo endpoint unificado'
    }
  }, { status: 410 });
}

 