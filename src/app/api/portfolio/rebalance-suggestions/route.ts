import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema para gerar sugestões de rebalanceamento
const RebalanceSuggestionsSchema = z.object({
  portfolio_id: z.string().uuid(),
  user_id: z.string().uuid(),
  current_portfolio_value: z.number().positive(),
  rebalance_threshold: z.number().min(1).max(50).default(5), // Regra 5/25 - padrão 5%
  force_rebalance: z.boolean().default(false)
});

interface ETFAllocation {
  etf_symbol: string;
  allocation_percentage: number;
  target_amount: number;
}

interface TrackingData {
  etf_symbol: string;
  total_shares: number;
  total_invested: number;
  current_value: number;
  current_allocation: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RebalanceSuggestionsSchema.parse(body);

    console.log('🔄 Gerando sugestões de rebalanceamento para portfolio:', validatedData.portfolio_id);

    // 1. Buscar alocações target do portfólio
    const { data: allocations, error: allocationsError } = await supabase
      .from('portfolio_allocations')
      .select('*')
      .eq('portfolio_id', validatedData.portfolio_id)
      .eq('user_id', validatedData.user_id);

    if (allocationsError || !allocations || allocations.length === 0) {
      console.error('❌ Erro ao buscar alocações:', allocationsError);
      return NextResponse.json(
        { error: 'Alocações do portfólio não encontradas' },
        { status: 404 }
      );
    }

    // 2. Buscar dados de tracking (compras reais)
    const { data: trackingData, error: trackingError } = await supabase
      .from('portfolio_tracking')
      .select('*')
      .eq('portfolio_id', validatedData.portfolio_id)
      .eq('user_id', validatedData.user_id);

    if (trackingError) {
      console.error('❌ Erro ao buscar dados de tracking:', trackingError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados de tracking' },
        { status: 500 }
      );
    }

    // 3. Calcular alocações atuais baseadas nas compras
    const currentAllocations = calculateCurrentAllocations(
      trackingData || [],
      validatedData.current_portfolio_value
    );

    // 4. Gerar sugestões de rebalanceamento
    const suggestions = generateRebalanceSuggestions(
      allocations,
      currentAllocations,
      validatedData.current_portfolio_value,
      validatedData.rebalance_threshold,
      validatedData.force_rebalance
    );

    // 5. Salvar sugestões no banco se houver alguma
    let savedSuggestions: any[] = [];
    if (suggestions.length > 0) {
      // Deletar sugestões antigas
      await supabase
        .from('rebalance_suggestions')
        .delete()
        .eq('portfolio_id', validatedData.portfolio_id)
        .eq('user_id', validatedData.user_id)
        .eq('status', 'PENDING');

      // Inserir novas sugestões
      const { data: insertedSuggestions, error: insertError } = await supabase
        .from('rebalance_suggestions')
        .insert(suggestions.map(s => ({
          portfolio_id: validatedData.portfolio_id,
          user_id: validatedData.user_id,
          etf_symbol: s.etf_symbol,
          current_allocation: s.current_allocation,
          target_allocation: s.target_allocation,
          deviation: s.deviation,
          suggested_action: s.suggested_action,
          suggested_amount: s.suggested_amount,
          suggested_shares: s.suggested_shares,
          priority: s.priority,
          status: 'PENDING'
        })))
        .select();

      if (insertError) {
        console.error('❌ Erro ao salvar sugestões:', insertError);
      } else {
        savedSuggestions = insertedSuggestions || [];
      }
    }

    console.log('✅ Sugestões de rebalanceamento geradas:', suggestions.length);

    return NextResponse.json({
      success: true,
      data: {
        portfolio_id: validatedData.portfolio_id,
        current_portfolio_value: validatedData.current_portfolio_value,
        rebalance_threshold: validatedData.rebalance_threshold,
        needs_rebalancing: suggestions.length > 0,
        suggestions_count: suggestions.length,
        suggestions: savedSuggestions,
        analysis: {
          total_etfs: allocations.length,
          etfs_with_tracking: currentAllocations.length,
          etfs_needing_rebalance: suggestions.length,
          max_deviation: Math.max(...suggestions.map(s => s.deviation), 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de sugestões de rebalanceamento:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolio_id = searchParams.get('portfolio_id');
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status') || 'PENDING';

    if (!portfolio_id || !user_id) {
      return NextResponse.json(
        { error: 'portfolio_id e user_id são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando sugestões de rebalanceamento para portfolio:', portfolio_id);

    // Buscar sugestões de rebalanceamento (sem JOIN problemático)
    const { data: suggestions, error } = await supabase
      .from('rebalance_suggestions')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id)
      .eq('status', status)
      .order('priority', { ascending: true })
      .order('deviation', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar sugestões:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar sugestões' },
        { status: 500 }
      );
    }

    // Buscar informações do portfolio separadamente
    const { data: portfolioInfo, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('portfolio_name, total_invested')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError) {
      console.error('❌ Erro ao buscar informações do portfolio:', portfolioError);
    }

    console.log('✅ Sugestões encontradas:', suggestions?.length || 0);

    // Calcular estatísticas
    const totalSuggestedAmount = suggestions?.reduce((sum, s) => sum + (s.suggested_amount || 0), 0) || 0;
    const avgDeviation = suggestions?.length ? 
      suggestions.reduce((sum, s) => sum + s.deviation, 0) / suggestions.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        portfolio_id,
        portfolio_info: portfolioInfo || null,
        suggestions: suggestions || [],
        statistics: {
          total_suggestions: suggestions?.length || 0,
          total_suggested_amount: totalSuggestedAmount,
          average_deviation: avgDeviation,
          actions_summary: {
            buy: suggestions?.filter(s => s.suggested_action === 'BUY').length || 0,
            sell: suggestions?.filter(s => s.suggested_action === 'SELL').length || 0,
            hold: suggestions?.filter(s => s.suggested_action === 'HOLD').length || 0
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de buscar sugestões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para calcular alocações atuais baseadas nas compras
function calculateCurrentAllocations(trackingData: any[], totalPortfolioValue: number): TrackingData[] {
  const etfGroups = trackingData.reduce((groups, track) => {
    if (!groups[track.etf_symbol]) {
      groups[track.etf_symbol] = {
        etf_symbol: track.etf_symbol,
        total_shares: 0,
        total_invested: 0,
        purchases: []
      };
    }
    
    groups[track.etf_symbol].total_shares += track.shares_bought;
    groups[track.etf_symbol].total_invested += track.amount_invested;
    groups[track.etf_symbol].purchases.push(track);
    
    return groups;
  }, {} as any);

  return Object.values(etfGroups).map((group: any) => {
    // Calcular preço médio ponderado
    const avgPrice = group.total_invested / group.total_shares;
    
    // Estimar valor atual (aqui poderia integrar com API de preços reais)
    const currentValue = group.total_shares * avgPrice; // Simplificado
    
    return {
      etf_symbol: group.etf_symbol,
      total_shares: group.total_shares,
      total_invested: group.total_invested,
      current_value: currentValue,
      current_allocation: (currentValue / totalPortfolioValue) * 100
    };
  });
}

// Função para gerar sugestões de rebalanceamento baseadas na regra 5/25
function generateRebalanceSuggestions(
  targetAllocations: ETFAllocation[],
  currentAllocations: TrackingData[],
  totalPortfolioValue: number,
  threshold: number,
  forceRebalance: boolean
): any[] {
  const suggestions: any[] = [];

  targetAllocations.forEach(target => {
    const current = currentAllocations.find(c => c.etf_symbol === target.etf_symbol);
    const currentAllocation = current?.current_allocation || 0;
    const targetAllocation = target.allocation_percentage;
    
    // Calcular desvio absoluto
    const deviation = Math.abs(currentAllocation - targetAllocation);
    
    // Aplicar regra 5/25: rebalancear se desvio > 5% absoluto OU > 25% do target
    const absoluteThreshold = threshold; // 5%
    const relativeThreshold = (targetAllocation * 0.25); // 25% do target
    
    const needsRebalancing = forceRebalance || 
      deviation > absoluteThreshold || 
      deviation > relativeThreshold;

    if (needsRebalancing && deviation > 0.1) { // Mínimo 0.1% para evitar micro-ajustes
      const targetValue = (targetAllocation / 100) * totalPortfolioValue;
      const currentValue = current?.current_value || 0;
      const difference = targetValue - currentValue;
      
      let suggestedAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let suggestedAmount = 0;
      
      if (difference > 0) {
        suggestedAction = 'BUY';
        suggestedAmount = difference;
      } else if (difference < 0) {
        suggestedAction = 'SELL';
        suggestedAmount = Math.abs(difference);
      }
      
      // Calcular prioridade baseada no desvio
      let priority = 3; // Média
      if (deviation > absoluteThreshold * 2) priority = 1; // Alta
      else if (deviation > absoluteThreshold) priority = 2; // Média-alta
      else if (deviation > absoluteThreshold * 0.5) priority = 3; // Média
      else priority = 4; // Baixa
      
      suggestions.push({
        etf_symbol: target.etf_symbol,
        current_allocation: currentAllocation,
        target_allocation: targetAllocation,
        deviation: deviation,
        suggested_action: suggestedAction,
        suggested_amount: suggestedAmount,
        suggested_shares: suggestedAmount / 100, // Simplificado - precisa preço real
        priority: priority
      });
    }
  });

  return suggestions.sort((a, b) => a.priority - b.priority || b.deviation - a.deviation);
} 