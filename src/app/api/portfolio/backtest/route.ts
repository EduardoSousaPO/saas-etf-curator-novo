import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BacktestData {
  date: string;
  portfolioValue: number;
  sp500Value: number;
  nasdaqValue: number;
  portfolioReturn: number;
  sp500Return: number;
  nasdaqReturn: number;
  portfolioCumulativeReturn: number;
  sp500CumulativeReturn: number;
  nasdaqCumulativeReturn: number;
}

interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winRate: number;
  bestMonth: number;
  worstMonth: number;
  beta: number;
  alpha: number;
}

export async function POST(request: NextRequest) {
  try {
    const { etfSymbols, allocations, initialAmount, periodYears } = await request.json();

    if (!etfSymbols || !allocations || !initialAmount || !periodYears) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: etfSymbols, allocations, initialAmount, periodYears' },
        { status: 400 }
      );
    }

    if (etfSymbols.length !== allocations.length) {
      return NextResponse.json(
        { error: 'Número de ETFs deve ser igual ao número de alocações' },
        { status: 400 }
      );
    }

    // Calcular data de início baseada no período
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - periodYears);

    console.log(`Executando backtesting para ${periodYears} anos:`, {
      etfSymbols,
      allocations,
      initialAmount,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    // Simular dados históricos (em produção, isso viria de uma API real como Yahoo Finance)
    const backtestData = generateSimulatedBacktestData(
      etfSymbols,
      allocations,
      initialAmount,
      startDate,
      endDate
    );

    // Calcular métricas da carteira
    const portfolioMetrics = calculateMetrics(
      backtestData.map(d => d.portfolioReturn),
      backtestData.map(d => d.portfolioValue),
      initialAmount
    );

    // Calcular métricas do S&P 500
    const sp500Metrics = calculateMetrics(
      backtestData.map(d => d.sp500Return),
      backtestData.map(d => d.sp500Value),
      initialAmount
    );

    // Calcular beta e alpha da carteira vs S&P 500
    const { beta, alpha } = calculateBetaAlpha(
      backtestData.map(d => d.portfolioReturn),
      backtestData.map(d => d.sp500Return)
    );

    portfolioMetrics.beta = beta;
    portfolioMetrics.alpha = alpha;

    return NextResponse.json({
      backtestData,
      portfolioMetrics,
      sp500Metrics,
      period: `${periodYears} anos`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Erro no backtesting:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor durante backtesting' },
      { status: 500 }
    );
  }
}

function generateSimulatedBacktestData(
  etfSymbols: string[],
  allocations: number[],
  initialAmount: number,
  startDate: Date,
  endDate: Date
): BacktestData[] {
  const data: BacktestData[] = [];
  const monthsDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  let portfolioValue = initialAmount;
  let sp500Value = initialAmount;
  let nasdaqValue = initialAmount;
  
  let portfolioCumulativeReturn = 0;
  let sp500CumulativeReturn = 0;
  let nasdaqCumulativeReturn = 0;

  // Parâmetros de simulação baseados em dados históricos reais
  const portfolioParams = {
    monthlyMean: 0.008, // 0.8% ao mês (~10% ao ano)
    monthlyStd: 0.04,   // 4% de volatilidade mensal
    crashProbability: 0.02 // 2% chance de crash por mês
  };

  const sp500Params = {
    monthlyMean: 0.0067, // 0.67% ao mês (~8.5% ao ano)
    monthlyStd: 0.045,   // 4.5% de volatilidade mensal
    crashProbability: 0.015
  };

  const nasdaqParams = {
    monthlyMean: 0.0075, // 0.75% ao mês (~9.5% ao ano)
    monthlyStd: 0.055,   // 5.5% de volatilidade mensal
    crashProbability: 0.025
  };

  for (let i = 0; i <= monthsDiff; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + i);

    // Gerar retornos com correlação e eventos de crise
    const isCrisisPeriod = isCrisisMonth(currentDate);
    const { portfolioReturn, sp500Return, nasdaqReturn } = generateCorrelatedReturns(
      portfolioParams,
      sp500Params,
      nasdaqParams,
      isCrisisPeriod
    );

    // Atualizar valores
    const newPortfolioValue = portfolioValue * (1 + portfolioReturn);
    const newSp500Value = sp500Value * (1 + sp500Return);
    const newNasdaqValue = nasdaqValue * (1 + nasdaqReturn);

    // Calcular retornos cumulativos
    portfolioCumulativeReturn = (newPortfolioValue - initialAmount) / initialAmount;
    sp500CumulativeReturn = (newSp500Value - initialAmount) / initialAmount;
    nasdaqCumulativeReturn = (newNasdaqValue - initialAmount) / initialAmount;

    data.push({
      date: currentDate.toISOString().split('T')[0],
      portfolioValue: newPortfolioValue,
      sp500Value: newSp500Value,
      nasdaqValue: newNasdaqValue,
      portfolioReturn,
      sp500Return,
      nasdaqReturn,
      portfolioCumulativeReturn,
      sp500CumulativeReturn,
      nasdaqCumulativeReturn
    });

    portfolioValue = newPortfolioValue;
    sp500Value = newSp500Value;
    nasdaqValue = newNasdaqValue;
  }

  return data;
}

function isCrisisMonth(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Crise de 2008
  if (year === 2008 && month >= 8 && month <= 11) return true;
  
  // COVID-19
  if (year === 2020 && month >= 1 && month <= 4) return true;
  
  // Inflação/Fed 2022
  if (year === 2022 && month >= 0 && month <= 5) return true;
  
  return false;
}

function generateCorrelatedReturns(
  portfolioParams: any,
  sp500Params: any,
  nasdaqParams: any,
  isCrisis: boolean
) {
  // Durante crises, aumentar volatilidade e reduzir retornos
  const crisisMultiplier = isCrisis ? 2.5 : 1;
  const crisisReturnReduction = isCrisis ? -0.02 : 0;

  // Gerar retorno base do S&P 500
  const sp500Return = gaussianRandom() * sp500Params.monthlyStd * crisisMultiplier + 
                     sp500Params.monthlyMean + crisisReturnReduction;

  // Portfolio com correlação de ~0.8 com S&P 500
  const correlationFactor = 0.8;
  const portfolioReturn = correlationFactor * sp500Return + 
                         (1 - correlationFactor) * (gaussianRandom() * portfolioParams.monthlyStd * crisisMultiplier + 
                         portfolioParams.monthlyMean + crisisReturnReduction);

  // NASDAQ com correlação de ~0.9 com S&P 500, mas mais volátil
  const nasdaqReturn = 0.9 * sp500Return + 
                      0.1 * (gaussianRandom() * nasdaqParams.monthlyStd * crisisMultiplier + 
                      nasdaqParams.monthlyMean + crisisReturnReduction);

  return { portfolioReturn, sp500Return, nasdaqReturn };
}

function gaussianRandom(): number {
  // Box-Muller transform para distribuição normal
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function calculateMetrics(returns: number[], values: number[], initialAmount: number): BacktestMetrics {
  const totalReturn = (values[values.length - 1] - initialAmount) / initialAmount;
  const periods = returns.length;
  const annualizedReturn = Math.pow(1 + totalReturn, 12 / periods) - 1;
  
  // Volatilidade (desvio padrão anualizado)
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
  const volatility = Math.sqrt(variance * 12); // Anualizada

  // Sharpe Ratio (assumindo risk-free rate de 2%)
  const riskFreeRate = 0.02;
  const sharpeRatio = (annualizedReturn - riskFreeRate) / volatility;

  // Max Drawdown
  let maxDrawdown = 0;
  let peak = values[0];
  for (const value of values) {
    if (value > peak) peak = value;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Calmar Ratio
  const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;

  // Win Rate (% de meses positivos)
  const positiveMonths = returns.filter(r => r > 0).length;
  const winRate = positiveMonths / returns.length;

  // Melhor e pior mês
  const bestMonth = Math.max(...returns);
  const worstMonth = Math.min(...returns);

  return {
    totalReturn,
    annualizedReturn,
    volatility,
    sharpeRatio,
    maxDrawdown,
    calmarRatio,
    winRate,
    bestMonth,
    worstMonth,
    beta: 1, // Será calculado separadamente
    alpha: 0 // Será calculado separadamente
  };
}

function calculateBetaAlpha(portfolioReturns: number[], marketReturns: number[]): { beta: number; alpha: number } {
  const n = portfolioReturns.length;
  
  // Médias
  const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / n;
  const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / n;
  
  // Covariância e variância do mercado
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < n; i++) {
    const portfolioDiff = portfolioReturns[i] - portfolioMean;
    const marketDiff = marketReturns[i] - marketMean;
    
    covariance += portfolioDiff * marketDiff;
    marketVariance += marketDiff * marketDiff;
  }
  
  covariance /= (n - 1);
  marketVariance /= (n - 1);
  
  // Beta = Cov(portfolio, market) / Var(market)
  const beta = marketVariance > 0 ? covariance / marketVariance : 1;
  
  // Alpha = Portfolio Return - (Risk Free Rate + Beta * (Market Return - Risk Free Rate))
  const riskFreeRate = 0.02 / 12; // 2% anual convertido para mensal
  const alpha = portfolioMean - (riskFreeRate + beta * (marketMean - riskFreeRate));
  
  return { beta, alpha: alpha * 12 }; // Alpha anualizado
} 