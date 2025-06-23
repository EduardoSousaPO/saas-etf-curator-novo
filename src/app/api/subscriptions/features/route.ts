import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscriptions/subscription-service';
import { SubscriptionPlan } from '@/types/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') as SubscriptionPlan;

    // Validar plano
    if (!plan || !['STARTER', 'PRO', 'WEALTH', 'OFFSHORE'].includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Buscar features do plano
    const features = await SubscriptionService.getPlanFeatures(plan);
    
    return NextResponse.json({
      plan,
      features
    });

  } catch (error) {
    console.error('Erro ao buscar features do plano:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 