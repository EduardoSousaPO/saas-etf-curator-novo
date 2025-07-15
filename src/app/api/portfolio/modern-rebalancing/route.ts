import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ModernRebalancingConfig {
  drift_tolerance: number; // 3-5% padrão do mercado
  transaction_cost_threshold: number; // Custo mínimo para justificar transação
  min_rebalance_amount: number; // Valor mínimo para rebalanceamento
  tax_sensitivity: boolean; // Considerar impostos
  auto_rebalance_frequency: 'monthly' | 'quarterly' | 'semi-annual';
}

interface RebalancingRecommendation {
  etf_symbol: string;
  current_allocation: number;
  target_allocation: number;
  drift_percentage: number;
  requires_rebalancing: boolean;
  suggested_action: 'BUY' | 'SELL' | 'HOLD';
  suggested_amount: number;
  transaction_cost_estimate: number;
  net_benefit: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
}

interface ModernRebalancingResponse {
  portfolio_id: string;
  analysis_date: string;
  config: ModernRebalancingConfig;
  total_drift: number;
  requires_rebalancing: boolean;
  recommendations: RebalancingRecommendation[];
  summary: {
    total_transactions: number;
    total_transaction_costs: number;
    expected_improvement: number;
    risk_reduction: number;
  };
  next_review_date: string;
}

// Configuração padrão baseada nas melhores práticas
const DEFAULT_CONFIG: ModernRebalancingConfig = {
  drift_tolerance: 5.0, // 5% conforme Betterment e práticas modernas
  transaction_cost_threshold: 0.1, // 0.1% custo de transação
  min_rebalance_amount: 100, // Mínimo $100 para rebalanceamento
  tax_sensitivity: true,
  auto_rebalance_frequency: 'quarterly'
};

function calculateDrift(current: number, target: number): number {
  return Math.abs(current - target);
}

function calculateTransactionCost(amount: number, cost_rate: number = 0.001): number {
  return amount * cost_rate; // 0.1% de custo de transação
}

function calculateNetBenefit(
  amount: number, 
  drift: number, 
  transaction_cost: number
): number {
  // Benefício = redução de risco (drift) - custo de transação
  const risk_reduction_benefit = drift * amount * 0.01; // Simplificado
  return risk_reduction_benefit - transaction_cost;
}

function getPriority(drift: number, net_benefit: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (drift > 10 && net_benefit > 50) return 'HIGH';
  if (drift > 5 && net_benefit > 20) return 'MEDIUM';
  return 'LOW';
}

function generateRationale(
  action: string, 
  drift: number, 
  net_benefit: number,
  etf_symbol: string
): string {
  const reasons: string[] = [];
  
  if (drift > 10) {
    reasons.push(`${etf_symbol} está ${drift.toFixed(1)}% fora do target`);
  }
  
  if (net_benefit > 50) {
    reasons.push(`benefício líquido de $${net_benefit.toFixed(2)}`);
  }
  
  if (action === 'BUY') {
    reasons.push('aumentar exposição para atingir alocação ideal');
  } else if (action === 'SELL') {
    reasons.push('reduzir exposição para atingir alocação ideal');
  }
  
  return reasons.join(', ');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolio_id = searchParams.get('portfolio_id');
    const user_id = searchParams.get('user_id');
    
    if (!portfolio_id || !user_id) {
      return NextResponse.json(
        { error: 'portfolio_id e user_id são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔄 Iniciando análise moderna de rebalanceamento para portfolio:', portfolio_id);

    // 1. PRIMEIRO: Verificar se há compras reais
    const { data: purchases, error: purchasesError } = await supabase
      .from('portfolio_tracking')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id);

    if (purchasesError) {
      console.error('❌ Erro ao verificar compras:', purchasesError);
      return NextResponse.json(
        { error: 'Erro ao verificar compras' },
        { status: 500 }
      );
    }

    const has_real_purchases = purchases && purchases.length > 0;
    console.log(`📊 Compras reais encontradas: ${purchases?.length || 0}`);

    // Se não há compras reais, retornar estado especial
    if (!has_real_purchases) {
      return NextResponse.json({
        success: true,
        data: {
          portfolio_id,
          analysis_date: new Date().toISOString(),
          portfolio_status: 'NEW',
          has_real_purchases: false,
          message: 'Portfolio simulado - Adicione compras reais para ativar rebalanceamento',
          guidance: [
            'Registre suas compras reais na seção "Histórico de Compras"',
            'O rebalanceamento só funciona com dados reais de transações',
            'Dados simulados não geram recomendações de rebalanceamento',
            'Após adicionar compras, o sistema calculará recomendações baseadas em preços reais'
          ],
          recommendations: [],
          summary: {
            total_transactions: 0,
            total_transaction_costs: 0,
            expected_improvement: 0,
            risk_reduction: 0
          }
        }
      });
    }

    // Buscar configuração do usuário (ou usar padrão)
    const config = DEFAULT_CONFIG;

    // Buscar dados do portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('*')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: 'Portfolio não encontrado' },
        { status: 404 }
      );
    }

    // Buscar alocações atuais
    const { data: allocations, error: allocationsError } = await supabase
      .from('portfolio_allocations')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id);

    if (allocationsError) {
      return NextResponse.json(
        { error: 'Erro ao buscar alocações' },
        { status: 500 }
      );
    }

    // Calcular drift total e recomendações
    const recommendations: RebalancingRecommendation[] = [];
    let total_drift = 0;
    let total_transactions = 0;
    let total_transaction_costs = 0;

    for (const allocation of allocations || []) {
      const current_percentage = (allocation.current_amount / portfolio.total_invested) * 100;
      const target_percentage = allocation.allocation_percentage;
      const drift = calculateDrift(current_percentage, target_percentage);
      
      total_drift += drift;

      // Determinar se precisa rebalanceamento
      const requires_rebalancing = drift > config.drift_tolerance;
      
      let suggested_action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let suggested_amount = 0;
      
      if (requires_rebalancing) {
        const target_amount = (target_percentage / 100) * portfolio.total_invested;
        suggested_amount = Math.abs(target_amount - allocation.current_amount);
        
        if (suggested_amount >= config.min_rebalance_amount) {
          suggested_action = allocation.current_amount < target_amount ? 'BUY' : 'SELL';
        }
      }

      const transaction_cost = calculateTransactionCost(suggested_amount, config.transaction_cost_threshold / 100);
      const net_benefit = calculateNetBenefit(suggested_amount, drift, transaction_cost);
      
      // Só recomendar se benefício líquido for positivo
      if (net_benefit > 0 && suggested_action !== 'HOLD') {
        total_transactions++;
        total_transaction_costs += transaction_cost;
      } else if (net_benefit <= 0) {
        suggested_action = 'HOLD';
        suggested_amount = 0;
      }

      recommendations.push({
        etf_symbol: allocation.etf_symbol,
        current_allocation: current_percentage,
        target_allocation: target_percentage,
        drift_percentage: drift,
        requires_rebalancing,
        suggested_action,
        suggested_amount,
        transaction_cost_estimate: transaction_cost,
        net_benefit,
        priority: getPriority(drift, net_benefit),
        rationale: generateRationale(suggested_action, drift, net_benefit, allocation.etf_symbol)
      });
    }

    // Calcular próxima data de revisão
    const next_review_date = new Date();
    switch (config.auto_rebalance_frequency) {
      case 'monthly':
        next_review_date.setMonth(next_review_date.getMonth() + 1);
        break;
      case 'quarterly':
        next_review_date.setMonth(next_review_date.getMonth() + 3);
        break;
      case 'semi-annual':
        next_review_date.setMonth(next_review_date.getMonth() + 6);
        break;
    }

    const response: ModernRebalancingResponse = {
      portfolio_id,
      analysis_date: new Date().toISOString(),
      config,
      total_drift,
      requires_rebalancing: total_drift > config.drift_tolerance,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      summary: {
        total_transactions,
        total_transaction_costs,
        expected_improvement: recommendations.reduce((sum, r) => sum + Math.max(0, r.net_benefit), 0),
        risk_reduction: total_drift
      },
      next_review_date: next_review_date.toISOString()
    };

    console.log('✅ Análise moderna de rebalanceamento concluída:', {
      total_drift,
      requires_rebalancing: response.requires_rebalancing,
      recommendations_count: recommendations.length,
      high_priority: recommendations.filter(r => r.priority === 'HIGH').length
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ Erro na análise moderna de rebalanceamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolio_id, user_id, config } = body;

    // Atualizar configuração de rebalanceamento do usuário
    const { error } = await supabase
      .from('user_portfolio_allocations')
      .update({
        rebalance_threshold: config.drift_tolerance,
        auto_rebalance: config.auto_rebalance_frequency !== 'manual'
      })
      .eq('id', portfolio_id)
      .eq('user_id', user_id);

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar configuração' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuração de rebalanceamento atualizada'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 