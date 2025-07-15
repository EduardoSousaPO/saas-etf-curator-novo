import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolio_id = searchParams.get('portfolio_id') || 'd733e728-f27d-40c1-bb44-6c6a1e53e58e';
    const user_id = searchParams.get('user_id') || '9ba39a20-7409-479d-a010-284ad452d4f8';

    console.log('🔍 Debug - Testando dados do portfolio:', portfolio_id);

    // Test 1: Verificar se o portfolio existe
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('*')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    // Test 2: Verificar alocações
    const { data: allocations, error: allocationsError } = await supabase
      .from('portfolio_allocations')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id);

    // Test 3: Verificar sugestões de rebalanceamento
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('rebalance_suggestions')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id);

    // Test 4: Verificar tracking
    const { data: tracking, error: trackingError } = await supabase
      .from('portfolio_tracking')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id);

    return NextResponse.json({
      success: true,
      debug_info: {
        portfolio_id,
        user_id,
        timestamp: new Date().toISOString()
      },
      tests: {
        portfolio: {
          exists: !portfolioError && !!portfolio,
          error: portfolioError?.message || null,
          data: portfolio || null
        },
        allocations: {
          count: allocations?.length || 0,
          error: allocationsError?.message || null,
          data: allocations || []
        },
        suggestions: {
          count: suggestions?.length || 0,
          error: suggestionsError?.message || null,
          data: suggestions || []
        },
        tracking: {
          count: tracking?.length || 0,
          error: trackingError?.message || null,
          data: tracking || []
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error },
      { status: 500 }
    );
  }
} 