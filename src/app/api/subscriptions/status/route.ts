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
    
    console.log('🔍 Verificando status da assinatura para usuário:', userId);
    
    // Buscar assinatura ativa
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (subscriptionError) {
      console.error('❌ Erro ao buscar assinatura:', subscriptionError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar assinatura',
        details: subscriptionError.message
      }, { status: 500 });
    }
    
    // Buscar features do plano
    const currentPlan = subscription && subscription.length > 0 ? subscription[0].plan : 'STARTER';
    
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan', currentPlan)
      .eq('is_enabled', true);
    
    if (featuresError) {
      console.error('❌ Erro ao buscar features:', featuresError);
    }
    
    const result = {
      success: true,
      userId,
      subscription: subscription && subscription.length > 0 ? subscription[0] : null,
      currentPlan,
      features: features || [],
      hasActiveSubscription: subscription && subscription.length > 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Status da assinatura:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 