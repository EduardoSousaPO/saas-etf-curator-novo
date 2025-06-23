import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SubscriptionService } from '@/lib/subscriptions/subscription-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    // Buscar assinatura ativa do usuário
    const subscription = await SubscriptionService.getUserSubscription(userId);
    
    // Buscar features do plano atual
    const currentPlan = subscription?.plan || 'STARTER';
    const features = await SubscriptionService.getPlanFeatures(currentPlan);
    
    // Buscar limites de uso
    const usageLimits = await SubscriptionService.getCurrentUsageLimits(userId);

    // Buscar pagamentos recentes
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        currentPlan,
        features,
        usageLimits,
        recentPayments: payments || [],
        hasActiveSubscription: !!subscription && subscription.status === 'ACTIVE'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 