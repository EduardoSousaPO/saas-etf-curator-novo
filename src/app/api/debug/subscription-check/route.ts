import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId é obrigatório'
      }, { status: 400 });
    }
    
    console.log('🔍 Debug completo da assinatura para:', userId);
    
    // 1. Verificar assinatura
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // 2. Verificar features do plano
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan', subscription?.plan || 'STARTER')
      .eq('is_enabled', true);
    
    // 3. Verificar feature específica
    const { data: screenerFeature, error: screenerError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('feature_key', 'screener_advanced')
      .eq('is_enabled', true);
    
    // 4. Verificar usage limits
    const { data: usageLimits, error: usageError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId);
    
    return NextResponse.json({
      success: true,
      debug: {
        userId,
        subscription: {
          data: subscription,
          error: subError?.message
        },
        features: {
          data: features,
          count: features?.length || 0,
          error: featuresError?.message
        },
        screenerFeature: {
          data: screenerFeature,
          found: screenerFeature && screenerFeature.length > 0,
          error: screenerError?.message
        },
        usageLimits: {
          data: usageLimits,
          error: usageError?.message
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no debug da assinatura:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 