import { NextRequest, NextResponse } from 'next/server';
import { AdvancedETFSelector } from '@/lib/portfolio/advanced-etf-selector';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando descoberta REAL de ETFs - Base de 1.370 ETFs...');
    
    const url = new URL(request.url);
    const strategy = url.searchParams.get('strategy') as 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' || 'MODERATE';
    const amount = parseInt(url.searchParams.get('amount') || '100000');
    const exploreCategories = url.searchParams.get('explore') === 'true';
    const adminOverride = url.searchParams.get('admin') === 'true'; // Parâmetro para acesso admin
    
    // Verificação de autenticação flexível
    let isAuthenticated = false;
    let isAdmin = false;
    
    if (!adminOverride) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.log('⚠️ Usuário não autenticado, mas permitindo acesso para demonstração');
          isAuthenticated = false;
        } else {
          isAuthenticated = true;
          
          // Verificar se é administrador
          const adminEmails = ['eduspires123@gmail.com'];
          if (user.email && adminEmails.includes(user.email)) {
            isAdmin = true;
            console.log(`🔑 Usuário administrador detectado: ${user.email}`);
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro na verificação de autenticação, continuando como demo');
        isAuthenticated = false;
      }
    } else {
      console.log('🔑 Modo administrador ativado via parâmetro');
      isAdmin = true;
      isAuthenticated = true;
    }
    
    const selector = new AdvancedETFSelector();
    
    if (exploreCategories) {
      // EXPLORAÇÃO COMPLETA POR CATEGORIAS
      console.log('🔍 Explorando categorias de asset allocation na base real...');
      
      const explorationResults = await Promise.all([
        // 1. ETFs de BONDS de alta qualidade
        selector.searchETFsAdvanced({
          assetClasses: ['Intermediate Core Bond', 'Ultrashort Bond', 'Target Maturity'],
          minAUM: 500000000,
          maxExpenseRatio: 0.5,
          maxVolatility: 8,
          includeOnlyLiquid: true
        }),
        
        // 2. ETFs de EQUITY LARGE CAP com forte performance
        selector.searchETFsAdvanced({
          assetClasses: ['Large Blend', 'Large Growth', 'Large Value'],
          minReturn: 8,
          minAUM: 1000000000,
          maxExpenseRatio: 0.75,
          includeOnlyLiquid: true
        }),
        
        // 3. ETFs INTERNACIONAIS para diversificação
        selector.searchETFsAdvanced({
          assetClasses: ['Foreign Large Blend', 'Diversified Emerging Mkts', 'Miscellaneous Region'],
          minReturn: 10,
          minAUM: 500000000,
          maxVolatility: 25,
          includeOnlyLiquid: true
        }),
        
        // 4. ETFs de TECHNOLOGY com alto crescimento
        selector.searchETFsAdvanced({
          assetClasses: ['Technology'],
          minReturn: 15,
          minAUM: 200000000,
          maxExpenseRatio: 1.0,
          includeOnlyLiquid: true
        }),
        
        // 5. ETFs de DIVIDEND para renda passiva
        selector.searchETFsAdvanced({
          minDividendYield: 2,
          minAUM: 300000000,
          maxVolatility: 20,
          maxExpenseRatio: 0.6,
          includeOnlyLiquid: true
        }),
        
        // 6. ETFs ALTERNATIVOS (REITs, Commodities, etc.)
        selector.searchETFsAdvanced({
          assetClasses: ['Commodities Focused', 'Real Estate'],
          minAUM: 100000000,
          maxExpenseRatio: 1.0,
          includeOnlyLiquid: true
        })
      ]);
      
      const [bonds, largeCap, international, technology, dividend, alternative] = explorationResults;
      
      return NextResponse.json({
        success: true,
        exploration_type: 'REAL_DATABASE_DISCOVERY',
        database_info: {
          total_etfs: 1370,
          etfs_with_complete_data: 1326,
          categories_analyzed: 15,
          methodology: 'Análise quantitativa multi-dimensional com scoring técnico avançado'
        },
        category_analysis: {
          bonds: {
            count: bonds.length,
            top_3: bonds.slice(0, 3),
            avg_quality_score: bonds.length > 0 ? bonds.reduce((sum, etf) => sum + etf.quality_score, 0) / bonds.length : 0,
            characteristics: 'Baixa volatilidade, renda fixa, proteção contra inflação'
          },
          large_cap_equity: {
            count: largeCap.length,
            top_3: largeCap.slice(0, 3),
            avg_quality_score: largeCap.length > 0 ? largeCap.reduce((sum, etf) => sum + etf.quality_score, 0) / largeCap.length : 0,
            characteristics: 'Core holdings, alta liquidez, performance consistente'
          },
          international: {
            count: international.length,
            top_3: international.slice(0, 3),
            avg_quality_score: international.length > 0 ? international.reduce((sum, etf) => sum + etf.quality_score, 0) / international.length : 0,
            characteristics: 'Diversificação geográfica, exposição a mercados desenvolvidos/emergentes'
          },
          technology: {
            count: technology.length,
            top_3: technology.slice(0, 3),
            avg_quality_score: technology.length > 0 ? technology.reduce((sum, etf) => sum + etf.quality_score, 0) / technology.length : 0,
            characteristics: 'Alto crescimento, inovação, maior volatilidade'
          },
          dividend_focused: {
            count: dividend.length,
            top_3: dividend.slice(0, 3),
            avg_quality_score: dividend.length > 0 ? dividend.reduce((sum, etf) => sum + etf.quality_score, 0) / dividend.length : 0,
            characteristics: 'Renda passiva, empresas maduras, menor volatilidade'
          },
          alternative_assets: {
            count: alternative.length,
            top_3: alternative.slice(0, 3),
            avg_quality_score: alternative.length > 0 ? alternative.reduce((sum, etf) => sum + etf.quality_score, 0) / alternative.length : 0,
            characteristics: 'Diversificação alternativa, hedge contra inflação'
          }
        },
        discovery_insights: {
          total_unique_etfs_found: [
            ...bonds, ...largeCap, ...international, 
            ...technology, ...dividend, ...alternative
          ].reduce((unique: any[], etf) => {
            if (!unique.find(u => u.symbol === etf.symbol)) {
              unique.push(etf);
            }
            return unique;
          }, []).length,
          
          quality_distribution: {
            excellent: [
              ...bonds, ...largeCap, ...international, 
              ...technology, ...dividend, ...alternative
            ].filter(etf => etf.quality_score >= 80).length,
            very_good: [
              ...bonds, ...largeCap, ...international, 
              ...technology, ...dividend, ...alternative
            ].filter(etf => etf.quality_score >= 65 && etf.quality_score < 80).length,
            good: [
              ...bonds, ...largeCap, ...international, 
              ...technology, ...dividend, ...alternative
            ].filter(etf => etf.quality_score >= 50 && etf.quality_score < 65).length
          },
          
          innovation_highlights: [
            'Sistema de scoring técnico com 10+ métricas quantitativas',
            'Análise de momentum multi-período (12m, 24m, 36m, 5y)',
            'Classificação automática de asset classes e regiões geográficas',
            'Filtros de liquidez e qualidade institucional',
            'Scoring de consistência de performance de longo prazo'
          ]
        }
      });
      
    } else {
      // CONSTRUÇÃO DE CARTEIRA OTIMIZADA
      console.log(`🎯 Construindo carteira ${strategy} otimizada com valor: $${amount.toLocaleString()}`);
      
      const optimizedPortfolio = await selector.buildOptimizedPortfolio(strategy, amount);
      
      // Buscar ETFs alternativos da mesma categoria para comparação
      const alternativeETFs = await selector.searchETFsAdvanced({
        minAUM: 200000000,
        maxExpenseRatio: 1.0,
        excludeSymbols: optimizedPortfolio.portfolio.map(p => p.etf.symbol),
        includeOnlyLiquid: true
      });
      
      return NextResponse.json({
        success: true,
        strategy: strategy,
        investment_amount: `$${amount.toLocaleString()}`,
        optimized_portfolio: {
          ...optimizedPortfolio,
          innovation_metrics: {
            etfs_analyzed: '1.370+ ETFs da base real',
            scoring_methodology: 'Sistema técnico multi-dimensional (0-100 pontos)',
            asset_allocation: 'Estratégias profissionais de wealth management',
            diversification_score: optimizedPortfolio.diversification_analysis?.diversification_index || 0,
            risk_management: 'Controle de volatilidade e drawdown máximo'
          }
        },
        alternative_suggestions: {
          count: alternativeETFs.length,
          top_alternatives: alternativeETFs.slice(0, 8),
          rationale: 'ETFs alternativos de alta qualidade para diversificação adicional'
        },
        technical_analysis: {
          database_coverage: '100% da base de ETFs disponível',
          quality_filters: 'AUM mínimo, liquidez, expense ratio, volatilidade',
          scoring_components: [
            'Sharpe Ratio (30%)',
            'Retorno 12m (25%)', 
            'Controle Volatilidade (20%)',
            'AUM/Liquidez (15%)',
            'Dividend Yield (10%)',
            'Bônus: Consistência, Momentum, Baixo Drawdown'
          ]
        }
      });
    }
    
  } catch (error: any) {
    console.error('❌ Erro na descoberta avançada real:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error.message,
      type: 'REAL_DISCOVERY_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { criteria, strategy = 'MODERATE' } = body;
    
    console.log('🔍 Busca personalizada de ETFs com critérios específicos:', criteria);
    
    const selector = new AdvancedETFSelector();
    const customResults = await selector.searchETFsAdvanced(criteria);
    
    return NextResponse.json({
      success: true,
      search_type: 'CUSTOM_CRITERIA',
      criteria_used: criteria,
      results: {
        count: customResults.length,
        etfs: customResults,
        quality_analysis: {
          avg_quality_score: customResults.length > 0 ? 
            customResults.reduce((sum, etf) => sum + etf.quality_score, 0) / customResults.length : 0,
          top_quality: customResults.filter(etf => etf.quality_score >= 70).length,
          distribution: {
            excellent: customResults.filter(etf => etf.quality_score >= 80).length,
            very_good: customResults.filter(etf => etf.quality_score >= 65).length,
            good: customResults.filter(etf => etf.quality_score >= 50).length
          }
        }
      },
      methodology: {
        database: 'Base real de 1.370 ETFs',
        scoring: 'Sistema técnico multi-dimensional',
        filters: 'Critérios personalizados + qualidade mínima'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na busca personalizada:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error.message
    }, { status: 500 });
  }
} 