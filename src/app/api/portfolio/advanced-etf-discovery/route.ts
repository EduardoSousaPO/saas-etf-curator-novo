import { NextRequest, NextResponse } from 'next/server';
import { AdvancedETFSelector } from '@/lib/portfolio/advanced-etf-selector';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando descoberta avançada de ETFs...');
    
    const url = new URL(request.url);
    const strategy = url.searchParams.get('strategy') as 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' || 'MODERATE';
    const amount = parseInt(url.searchParams.get('amount') || '100000');
    const exploreAll = url.searchParams.get('explore') === 'true';
    
    const selector = new AdvancedETFSelector();
    
    if (exploreAll) {
      // Explorar toda a base de dados com critérios diferentes
      console.log('🔍 Explorando toda a base de 1.370 ETFs...');
      
      const explorationResults = await Promise.all([
        // Busca por alta qualidade
        selector.searchETFsAdvanced({
          minAUM: 500000000, // 500M+
          maxExpenseRatio: 0.30,
          minReturn: 5,
          includeOnlyLiquid: true
        }),
        
        // Busca por alto dividendo
        selector.searchETFsAdvanced({
          minDividendYield: 3,
          minAUM: 100000000,
          maxExpenseRatio: 0.75,
          maxVolatility: 25
        }),
        
        // Busca por crescimento
        selector.searchETFsAdvanced({
          minReturn: 15,
          minAUM: 200000000,
          maxExpenseRatio: 0.85,
          excludeSymbols: ['SPY', 'VOO', 'VTI'] // Explorar além dos conhecidos
        }),
        
        // Busca por baixa volatilidade
        selector.searchETFsAdvanced({
          maxVolatility: 12,
          minAUM: 300000000,
          maxExpenseRatio: 0.50,
          minReturn: 3
        }),
        
        // Busca por ETFs internacionais
        selector.searchETFsAdvanced({
          minAUM: 250000000,
          maxExpenseRatio: 0.60,
          minReturn: 8,
          geographicRegions: ['INTERNATIONAL_DEVELOPED', 'EMERGING_MARKETS']
        })
      ]);
      
      // Consolidar descobertas
      const allDiscoveries = explorationResults.flat();
      const uniqueETFs = Array.from(
        new Map(allDiscoveries.map(etf => [etf.symbol, etf])).values()
      );
      
      // Categorizar descobertas
      const discoveries = {
        high_quality_etfs: uniqueETFs
          .filter(etf => etf.quality_score > 80)
          .sort((a, b) => b.quality_score - a.quality_score)
          .slice(0, 20),
          
        high_dividend_etfs: uniqueETFs
          .filter(etf => etf.dividend_yield > 3)
          .sort((a, b) => b.dividend_yield - a.dividend_yield)
          .slice(0, 15),
          
        growth_etfs: uniqueETFs
          .filter(etf => etf.returns_12m > 15)
          .sort((a, b) => b.returns_12m - a.returns_12m)
          .slice(0, 15),
          
        low_volatility_etfs: uniqueETFs
          .filter(etf => etf.volatility < 12 && etf.returns_12m > 3)
          .sort((a, b) => b.sharpe_ratio - a.sharpe_ratio)
          .slice(0, 15),
          
        international_etfs: uniqueETFs
          .filter(etf => etf.geographic_region !== 'US_DOMESTIC')
          .sort((a, b) => b.risk_adjusted_score - a.risk_adjusted_score)
          .slice(0, 15),
          
        hidden_gems: uniqueETFs
          .filter(etf => 
            etf.risk_adjusted_score > 50 && 
            etf.assets_under_management < 2000000000 && // Menos de 2B (não mainstream)
            !['SPY', 'VOO', 'VTI', 'QQQ', 'IWM', 'VEA', 'VWO'].includes(etf.symbol)
          )
          .sort((a, b) => b.risk_adjusted_score - a.risk_adjusted_score)
          .slice(0, 20)
      };
      
      // Análise por asset class
      const assetClassAnalysis = {};
      uniqueETFs.forEach(etf => {
        if (!assetClassAnalysis[etf.asset_class]) {
          assetClassAnalysis[etf.asset_class] = [];
        }
        assetClassAnalysis[etf.asset_class].push(etf);
      });
      
      // Top 3 por asset class
      const topByAssetClass = {};
      Object.keys(assetClassAnalysis).forEach(assetClass => {
        topByAssetClass[assetClass] = assetClassAnalysis[assetClass]
          .sort((a, b) => b.risk_adjusted_score - a.risk_adjusted_score)
          .slice(0, 3);
      });
      
      return NextResponse.json({
        success: true,
        exploration_summary: {
          total_etfs_analyzed: uniqueETFs.length,
          database_coverage: `${uniqueETFs.length}/1370 ETFs (${(uniqueETFs.length/1370*100).toFixed(1)}%)`,
          asset_classes_found: Object.keys(assetClassAnalysis).length,
          discovery_timestamp: new Date().toISOString()
        },
        discoveries,
        top_by_asset_class: topByAssetClass,
        asset_class_statistics: Object.keys(assetClassAnalysis).map(assetClass => ({
          asset_class: assetClass,
          count: assetClassAnalysis[assetClass].length,
          avg_quality_score: (assetClassAnalysis[assetClass].reduce((sum, etf) => sum + etf.quality_score, 0) / assetClassAnalysis[assetClass].length).toFixed(1),
          avg_return: (assetClassAnalysis[assetClass].reduce((sum, etf) => sum + etf.returns_12m, 0) / assetClassAnalysis[assetClass].length).toFixed(2) + '%',
          avg_volatility: (assetClassAnalysis[assetClass].reduce((sum, etf) => sum + etf.volatility, 0) / assetClassAnalysis[assetClass].length).toFixed(2) + '%'
        }))
      });
    }
    
    // Construir carteira otimizada com nova lógica
    console.log(`🎯 Construindo carteira ${strategy} com valor: $${amount.toLocaleString()}`);
    
    const portfolioResult = await selector.buildOptimizedPortfolio(strategy, amount);
    
    // Buscar ETFs alternativos para cada posição
    const alternativeOptions = {};
    for (const position of portfolioResult.portfolio) {
      const alternatives = await selector.searchETFsAdvanced({
        minAUM: 100000000,
        maxExpenseRatio: 0.75,
        excludeSymbols: [position.etf.symbol]
      });
      
      alternativeOptions[position.etf.symbol] = alternatives
        .filter(etf => etf.asset_class === position.etf.asset_class)
        .slice(0, 3);
    }
    
    return NextResponse.json({
      success: true,
      strategy: strategy,
      investment_amount: `$${amount.toLocaleString()}`,
      portfolio: portfolioResult,
      alternative_options: alternativeOptions,
      advanced_insights: {
        total_etfs_considered: 'Analisados 1.370+ ETFs da base',
        selection_methodology: 'Asset allocation profissional com critérios técnicos avançados',
        diversification_approach: 'Multi-dimensional: Asset class, geografia, setores, market cap',
        quality_filters: 'AUM mínimo, expense ratio, Sharpe ratio, volatilidade controlada',
        innovation: 'Descoberta automática de ETFs além dos mainstream conhecidos'
      },
      metadata: {
        generated_at: new Date().toISOString(),
        database_version: '1.370 ETFs',
        methodology: 'Advanced Asset Allocation with Technical Scoring'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na descoberta avançada de ETFs:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro na descoberta avançada de ETFs',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      strategy = 'MODERATE',
      amount = 100000,
      custom_criteria = {},
      exclude_mainstream = false 
    } = body;
    
    console.log('🎯 Descoberta personalizada com critérios:', custom_criteria);
    
    const selector = new AdvancedETFSelector();
    
    // Aplicar critérios customizados
    const searchCriteria = {
      minAUM: custom_criteria.minAUM || 100000000,
      maxExpenseRatio: custom_criteria.maxExpenseRatio || 0.85,
      minReturn: custom_criteria.minReturn,
      maxReturn: custom_criteria.maxReturn,
      minVolatility: custom_criteria.minVolatility,
      maxVolatility: custom_criteria.maxVolatility,
      minDividendYield: custom_criteria.minDividendYield,
      excludeSymbols: exclude_mainstream ? 
        ['SPY', 'VOO', 'VTI', 'QQQ', 'IWM', 'VEA', 'VWO', 'BND', 'AGG'] : 
        custom_criteria.excludeSymbols,
      includeOnlyLiquid: true
    };
    
    // Buscar ETFs com critérios personalizados
    const discoveredETFs = await selector.searchETFsAdvanced(searchCriteria);
    
    // Construir carteira personalizada
    const customPortfolio = await selector.buildOptimizedPortfolio(strategy, amount);
    
    // Análise de oportunidades
    const opportunities = discoveredETFs
      .filter(etf => etf.risk_adjusted_score > 60)
      .slice(0, 25)
      .map(etf => ({
        ...etf,
        opportunity_score: etf.risk_adjusted_score + etf.quality_score + etf.diversification_score,
        recommendation: generateOpportunityRecommendation(etf)
      }))
      .sort((a, b) => b.opportunity_score - a.opportunity_score);
    
    return NextResponse.json({
      success: true,
      custom_search: {
        criteria_applied: searchCriteria,
        etfs_discovered: discoveredETFs.length,
        top_opportunities: opportunities
      },
      optimized_portfolio: customPortfolio,
      insights: {
        methodology: 'Busca personalizada na base completa de 1.370 ETFs',
        innovation: exclude_mainstream ? 'Focado em ETFs alternativos (não mainstream)' : 'Incluindo todas as opções disponíveis',
        technical_analysis: 'Scoring multi-dimensional com critérios quantitativos'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na busca personalizada:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro na busca personalizada de ETFs',
      message: error.message
    }, { status: 500 });
  }
}

function generateOpportunityRecommendation(etf: any): string {
  const recommendations: string[] = [];
  
  if (etf.quality_score > 80) recommendations.push('Alta qualidade institucional');
  if (etf.sharpe_ratio > 1.2) recommendations.push('Excelente relação risco-retorno');
  if (etf.dividend_yield > 4) recommendations.push('Renda atrativa de dividendos');
  if (etf.expense_ratio < 0.15) recommendations.push('Custo competitivo');
  if (etf.assets_under_management > 1000000000) recommendations.push('Liquidez institucional');
  
  if (etf.asset_class.includes('INTERNATIONAL')) recommendations.push('Diversificação geográfica');
  if (etf.asset_class.includes('TECHNOLOGY')) recommendations.push('Exposição a crescimento tecnológico');
  if (etf.asset_class.includes('BONDS')) recommendations.push('Estabilidade de renda fixa');
  if (etf.asset_class.includes('EMERGING')) recommendations.push('Potencial de mercados emergentes');
  
  return recommendations.length > 0 ? 
    recommendations.slice(0, 3).join(', ') : 
    'Oportunidade identificada por análise técnica';
} 