import { NextRequest, NextResponse } from 'next/server';

interface RecommendationRequest {
  investmentAmount: number;
  timeHorizon: number;
  riskOverride?: number;
}

interface ETF {
  symbol: string;
  name: string;
  allocation: number;
  amount: number;
  expectedReturn: number;
  volatility: number;
  rationale: string;
}

interface Portfolio {
  etfs: ETF[];
  totalReturn: number;
  totalVolatility: number;
  sharpeRatio: number;
  strategy: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando recomendação simplificada...');
    
    const body = await request.json();
    const { investmentAmount, timeHorizon, riskOverride }: RecommendationRequest = body;
    
    // Validação básica
    if (!investmentAmount || investmentAmount < 1000) {
      return NextResponse.json({
        success: false,
        error: 'Investment amount must be at least $1,000'
      }, { status: 400 });
    }
    
    // Determinar estratégia baseada no risco
    let strategy = 'MODERATE';
    if (riskOverride) {
      if (riskOverride <= 3) strategy = 'CONSERVATIVE';
      else if (riskOverride <= 7) strategy = 'MODERATE';
      else strategy = 'AGGRESSIVE';
    } else if (timeHorizon) {
      if (timeHorizon <= 3) strategy = 'CONSERVATIVE';
      else if (timeHorizon <= 10) strategy = 'MODERATE';
      else strategy = 'AGGRESSIVE';
    }
    
    console.log(`📊 Estratégia selecionada: ${strategy}`);
    
    // Definir alocações por estratégia
    const strategies = {
      CONSERVATIVE: {
        etfs: [
          { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', allocation: 50, expectedReturn: 5.2, volatility: 5.5 },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 30, expectedReturn: 10.8, volatility: 16.2 },
          { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', allocation: 15, expectedReturn: 9.5, volatility: 14.8 },
          { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', allocation: 5, expectedReturn: 11.2, volatility: 15.1 }
        ]
      },
      MODERATE: {
        etfs: [
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 40, expectedReturn: 10.8, volatility: 16.2 },
          { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', allocation: 25, expectedReturn: 5.2, volatility: 5.5 },
          { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', allocation: 20, expectedReturn: 8.9, volatility: 18.5 },
          { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', allocation: 10, expectedReturn: 7.8, volatility: 22.1 },
          { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', allocation: 5, expectedReturn: 15.2, volatility: 24.8 }
        ]
      },
      AGGRESSIVE: {
        etfs: [
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 35, expectedReturn: 10.8, volatility: 16.2 },
          { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', allocation: 25, expectedReturn: 15.2, volatility: 24.8 },
          { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', allocation: 20, expectedReturn: 8.9, volatility: 18.5 },
          { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', allocation: 15, expectedReturn: 7.8, volatility: 22.1 },
          { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', allocation: 5, expectedReturn: 5.2, volatility: 5.5 }
        ]
      }
    };
    
    const selectedStrategy = strategies[strategy as keyof typeof strategies];
    
    // Construir portfolio
    const portfolio: Portfolio = {
      etfs: selectedStrategy.etfs.map(etf => ({
        ...etf,
        amount: (investmentAmount * etf.allocation) / 100,
        rationale: `${etf.allocation}% allocation in ${etf.name} for ${strategy.toLowerCase()} strategy`
      })),
      totalReturn: 0,
      totalVolatility: 0,
      sharpeRatio: 0,
      strategy
    };
    
    // Calcular métricas do portfolio
    portfolio.totalReturn = portfolio.etfs.reduce((sum, etf) => 
      sum + (etf.expectedReturn * etf.allocation / 100), 0);
    
    portfolio.totalVolatility = Math.sqrt(
      portfolio.etfs.reduce((sum, etf) => 
        sum + Math.pow(etf.volatility * etf.allocation / 100, 2), 0)
    );
    
    portfolio.sharpeRatio = portfolio.totalReturn / portfolio.totalVolatility;
    
    // Gerar projeções mensais
    const monthlyProjections: Array<{
      month: number;
      expectedValue: number;
      pessimisticScenario: number;
      optimisticScenario: number;
    }> = [];
    for (let month = 1; month <= timeHorizon; month++) {
      const monthlyReturn = portfolio.totalReturn / 12 / 100;
      const monthlyVol = portfolio.totalVolatility / Math.sqrt(12) / 100;
      
      const expectedValue = investmentAmount * Math.pow(1 + monthlyReturn, month);
      const pessimistic = expectedValue * (1 - 1.65 * monthlyVol);
      const optimistic = expectedValue * (1 + 1.65 * monthlyVol);
      
      monthlyProjections.push({
        month,
        expectedValue: Math.round(expectedValue),
        pessimisticScenario: Math.round(pessimistic),
        optimisticScenario: Math.round(optimistic)
      });
    }
    
    console.log('✅ Portfolio construído com sucesso');
    
    return NextResponse.json({
      success: true,
      data: {
        userId: 'demo-user',
        recommendationType: 'initial',
        strategy: strategy,
        investmentAmount,
        timeHorizon,
        riskLevel: riskOverride || 'auto',
        portfolio,
        monthlyProjections,
        justification: `Portfolio ${strategy.toLowerCase()} otimizado para ${timeHorizon} meses com retorno esperado de ${portfolio.totalReturn.toFixed(2)}% ao ano e volatilidade de ${portfolio.totalVolatility.toFixed(2)}%.`,
        confidenceScore: 0.85,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na recomendação simplificada:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para gerar recomendações',
    example: {
      method: 'POST',
      body: {
        investmentAmount: 50000,
        timeHorizon: 12,
        riskOverride: 5
      }
    }
  });
} 