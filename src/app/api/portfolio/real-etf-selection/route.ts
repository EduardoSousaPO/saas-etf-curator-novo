import { NextRequest, NextResponse } from 'next/server';
import { ETFSelector } from '@/lib/portfolio/etf-selector';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando seleção automática de ETFs com dados reais...');
    
    const url = new URL(request.url);
    const profile = url.searchParams.get('profile') || 'MODERADO';
    
    if (!['CONSERVADOR', 'MODERADO', 'ARROJADO'].includes(profile)) {
      return NextResponse.json({ 
        error: 'Perfil inválido. Use: CONSERVADOR, MODERADO, ARROJADO' 
      }, { status: 400 });
    }

    const selector = new ETFSelector();
    
    // Demonstrar processo de seleção para o perfil específico
    const selectedPortfolio = await selector.selectPortfolioForProfile(profile as any);
    
    // Buscar alguns ETFs de exemplo para cada categoria
    const bondETFs = await selector.searchETFs({
      maxVolatility: 10,
      minAUM: 1000000000
    });
    
    const largeCapETFs = await selector.searchETFs({
      minReturn: 8,
      maxVolatility: 25,
      minAUM: 10000000000
    });
    
    const techETFs = await selector.searchETFs({
      minReturn: 15,
      maxVolatility: 35,
      minAUM: 5000000000
    });

    return NextResponse.json({
      success: true,
      demonstration: {
        title: `🤖 Seleção Automática de ETFs - Perfil ${profile}`,
        subtitle: 'Sistema de seleção baseado em dados reais da base ETF Curator',
        profile_selected: profile,
        selection_process: {
          description: 'Processo de seleção automática baseado em critérios quantitativos',
          criteria_used: {
            [profile]: profile === 'CONSERVADOR' ? {
              bonds: { max_volatility: 8, min_aum: '1B+', allocation: '50%' },
              large_caps: { max_volatility: 25, min_aum: '10B+', min_return: 5, allocation: '30%' },
              dividends: { min_dividend_yield: 2, max_volatility: 20, allocation: '20%' }
            } : profile === 'MODERADO' ? {
              core_equity: { max_volatility: 22, min_aum: '10B+', min_return: 8, allocation: '40%' },
              bonds: { max_volatility: 8, min_aum: '1B+', allocation: '25%' },
              international: { max_volatility: 25, min_aum: '5B+', allocation: '20%' },
              emerging: { min_return: 5, max_volatility: 35, allocation: '10%' },
              dividends: { min_dividend_yield: 2, allocation: '5%' }
            } : {
              large_cap: { min_return: 10, max_volatility: 25, min_aum: '10B+', allocation: '35%' },
              technology: { min_return: 15, max_volatility: 30, min_aum: '5B+', allocation: '25%' },
              emerging: { min_return: 8, max_volatility: 40, allocation: '15%' },
              growth: { min_return: 12, max_volatility: 28, allocation: '15%' },
              small_cap: { min_return: 8, max_volatility: 35, allocation: '10%' }
            }
          }
        },
        selected_portfolio: selectedPortfolio.map(item => ({
          symbol: item.etf.symbol,
          name: item.etf.name,
          allocation: item.allocation + '%',
          rationale: item.rationale,
          metrics: {
            return_12m: item.etf.returns_12m.toFixed(2) + '%',
            volatility: item.etf.volatility.toFixed(2) + '%',
            sharpe_ratio: item.etf.sharpe_ratio.toFixed(2),
            dividend_yield: item.etf.dividend_yield.toFixed(2) + '%',
            expense_ratio: item.etf.expense_ratio.toFixed(3) + '%',
            aum: item.etf.assets_under_management > 1000000000 ? 
              '$' + (item.etf.assets_under_management / 1000000000).toFixed(1) + 'B' :
              '$' + (item.etf.assets_under_management / 1000000).toFixed(0) + 'M'
          },
          category: item.etf.category,
          selection_score: item.etf.score.toFixed(1)
        })),
        portfolio_summary: {
          total_etfs: selectedPortfolio.length,
          total_allocation: selectedPortfolio.reduce((sum, item) => sum + item.allocation, 0) + '%',
          weighted_metrics: calculateWeightedMetrics(selectedPortfolio),
          diversification: {
            categories: [...new Set(selectedPortfolio.map(item => item.etf.category))],
            geographic_exposure: analyzeGeographicExposure(selectedPortfolio),
            sector_balance: analyzeSectorBalance(selectedPortfolio)
          }
        },
        available_alternatives: {
          bonds: bondETFs.slice(0, 3).map(etf => ({
            symbol: etf.symbol,
            name: etf.name,
            score: etf.score.toFixed(1),
            rationale: etf.rationale,
            metrics: {
              return_12m: etf.returns_12m.toFixed(2) + '%',
              volatility: etf.volatility.toFixed(2) + '%',
              sharpe_ratio: etf.sharpe_ratio.toFixed(2)
            }
          })),
          large_caps: largeCapETFs.slice(0, 3).map(etf => ({
            symbol: etf.symbol,
            name: etf.name,
            score: etf.score.toFixed(1),
            rationale: etf.rationale,
            metrics: {
              return_12m: etf.returns_12m.toFixed(2) + '%',
              volatility: etf.volatility.toFixed(2) + '%',
              sharpe_ratio: etf.sharpe_ratio.toFixed(2)
            }
          })),
          technology: techETFs.slice(0, 3).map(etf => ({
            symbol: etf.symbol,
            name: etf.name,
            score: etf.score.toFixed(1),
            rationale: etf.rationale,
            metrics: {
              return_12m: etf.returns_12m.toFixed(2) + '%',
              volatility: etf.volatility.toFixed(2) + '%',
              sharpe_ratio: etf.sharpe_ratio.toFixed(2)
            }
          }))
        },
        methodology: {
          scoring_system: {
            sharpe_ratio: '30% (máx 30 pontos)',
            returns_12m: '25% (máx 25 pontos)',
            volatility_penalty: '-20% (máx -20 pontos)',
            aum_score: '15% (máx 15 pontos)',
            dividend_yield: '10% (máx 10 pontos)',
            expense_ratio_penalty: 'Variável (-10x expense ratio)'
          },
          categorization: {
            bonds: 'BND, AGG, TLT, BOND no símbolo/nome',
            technology: 'QQQ, XLK, VGT, TECH no símbolo/nome',
            international: 'VEA, EFA, EUROPE, DEVELOPED no símbolo/nome',
            emerging: 'VWO, EEM, EMERGING no símbolo/nome',
            small_cap: 'IWM, VB, SMALL no símbolo/nome',
            growth: 'VUG, GROWTH no símbolo/nome',
            dividend: 'VYM, SCHD, DIVIDEND no símbolo/nome',
            large_cap: 'SPY, VTI, VOO, S&P no símbolo/nome'
          }
        }
      },
      metadata: {
        generated_at: new Date().toISOString(),
        data_source: 'etfs_ativos_reais table',
        selection_algorithm: 'Quantitative scoring with category optimization',
        version: '1.0'
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na seleção automática de ETFs:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Tente novamente mais tarde'
    }, { status: 500 });
  }
}

// Funções auxiliares
function calculateWeightedMetrics(portfolio: any[]) {
  let weightedReturn = 0;
  let weightedVolatility = 0;
  let weightedSharpe = 0;
  let weightedDividend = 0;
  let weightedExpense = 0;
  let totalWeight = 0;

  portfolio.forEach(item => {
    const weight = item.allocation / 100;
    weightedReturn += item.etf.returns_12m * weight;
    weightedVolatility += item.etf.volatility * weight;
    weightedSharpe += item.etf.sharpe_ratio * weight;
    weightedDividend += item.etf.dividend_yield * weight;
    weightedExpense += item.etf.expense_ratio * weight;
    totalWeight += weight;
  });

  return {
    expected_return: weightedReturn.toFixed(2) + '%',
    expected_volatility: weightedVolatility.toFixed(2) + '%',
    weighted_sharpe: weightedSharpe.toFixed(2),
    expected_dividend_yield: weightedDividend.toFixed(2) + '%',
    blended_expense_ratio: weightedExpense.toFixed(3) + '%'
  };
}

function analyzeGeographicExposure(portfolio: any[]) {
  const geographic = {
    domestic: 0,
    international_developed: 0,
    emerging_markets: 0
  };

  portfolio.forEach(item => {
    const weight = item.allocation;
    const category = item.etf.category;
    
    if (category === 'INTERNATIONAL_DEVELOPED') {
      geographic.international_developed += weight;
    } else if (category === 'EMERGING_MARKETS') {
      geographic.emerging_markets += weight;
    } else {
      geographic.domestic += weight;
    }
  });

  return {
    domestic: geographic.domestic.toFixed(1) + '%',
    international_developed: geographic.international_developed.toFixed(1) + '%',
    emerging_markets: geographic.emerging_markets.toFixed(1) + '%'
  };
}

function analyzeSectorBalance(portfolio: any[]) {
  const sectors = {
    equity: 0,
    bonds: 0,
    technology: 0,
    dividends: 0,
    growth: 0,
    small_cap: 0
  };

  portfolio.forEach(item => {
    const weight = item.allocation;
    const category = item.etf.category;
    
    switch (category) {
      case 'BONDS':
        sectors.bonds += weight;
        break;
      case 'TECHNOLOGY':
        sectors.technology += weight;
        break;
      case 'DIVIDEND':
        sectors.dividends += weight;
        break;
      case 'GROWTH':
        sectors.growth += weight;
        break;
      case 'SMALL_CAP':
        sectors.small_cap += weight;
        break;
      default:
        sectors.equity += weight;
    }
  });

  return {
    equity: sectors.equity.toFixed(1) + '%',
    bonds: sectors.bonds.toFixed(1) + '%',
    technology: sectors.technology.toFixed(1) + '%',
    dividends: sectors.dividends.toFixed(1) + '%',
    growth: sectors.growth.toFixed(1) + '%',
    small_cap: sectors.small_cap.toFixed(1) + '%'
  };
} 