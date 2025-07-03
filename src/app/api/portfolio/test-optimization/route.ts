import { NextRequest, NextResponse } from 'next/server';
import AdvancedPortfolioOptimizer from '@/lib/portfolio/advanced-optimizer';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando teste do sistema de otimização...');
    
    const optimizer = new AdvancedPortfolioOptimizer();
    
    // Testar os 3 perfis de risco
    const profiles: ('CONSERVADOR' | 'MODERADO' | 'ARROJADO')[] = ['CONSERVADOR', 'MODERADO', 'ARROJADO'];
    const results: any[] = [];
    
    for (const profile of profiles) {
      console.log(`📊 Testando perfil: ${profile}`);
      
      try {
        const optimizedPortfolio = await optimizer.optimizeByRiskProfile(profile, 10000);
        
        results.push({
          profile,
          success: true,
          portfolio: {
            etf_count: optimizedPortfolio.etf_allocations.length,
            expected_return: `${(optimizedPortfolio.expected_return * 100).toFixed(2)}%`,
            expected_volatility: `${(optimizedPortfolio.expected_volatility * 100).toFixed(2)}%`,
            sharpe_ratio: optimizedPortfolio.sharpe_ratio.toFixed(2),
            optimization_method: optimizedPortfolio.optimization_method,
            etf_allocations: optimizedPortfolio.etf_allocations.map(etf => ({
              symbol: etf.symbol,
              name: etf.name,
              allocation: `${(etf.allocation * 100).toFixed(1)}%`
            })),
            benchmark_comparison: {
              spy_alpha: optimizedPortfolio.benchmark_comparison?.spy_comparison?.alpha ? 
                `${(optimizedPortfolio.benchmark_comparison.spy_comparison.alpha * 100).toFixed(2)}%` : 'N/A',
              bnd_alpha: optimizedPortfolio.benchmark_comparison?.bnd_comparison?.alpha ? 
                `${(optimizedPortfolio.benchmark_comparison.bnd_comparison.alpha * 100).toFixed(2)}%` : 'N/A',
              vs_60_40: optimizedPortfolio.benchmark_comparison?.classic_60_40?.outperformance ? 
                `${(optimizedPortfolio.benchmark_comparison.classic_60_40.outperformance * 100).toFixed(2)}%` : 'N/A'
            },
            risk_metrics: {
              var_95: optimizedPortfolio.risk_metrics?.value_at_risk_95 ? 
                `${(optimizedPortfolio.risk_metrics.value_at_risk_95 * 100).toFixed(2)}%` : 'N/A',
              sortino_ratio: optimizedPortfolio.risk_metrics?.sortino_ratio?.toFixed(2) || 'N/A'
            }
          }
        });
        
      } catch (profileError: any) {
        console.error(`❌ Erro no perfil ${profile}:`, profileError.message);
        results.push({
          profile,
          success: false,
          error: profileError.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Teste do sistema de otimização concluído',
      benchmarks_used: ['SPY', 'BND'],
      benchmark_strategy: 'Simplificado - apenas SPY (ações) e BND (bonds)',
      results,
      summary: {
        total_profiles_tested: profiles.length,
        successful_optimizations: results.filter(r => r.success).length,
        failed_optimizations: results.filter(r => !r.success).length
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro no teste de otimização:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro no teste de otimização',
      details: error.message
    }, { status: 500 });
  }
} 