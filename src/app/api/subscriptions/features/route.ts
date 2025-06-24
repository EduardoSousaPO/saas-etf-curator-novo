import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscriptions/subscription-service';
import { SubscriptionPlan } from '@/types/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') as SubscriptionPlan || 'STARTER';
    
    console.log('🔍 Buscando features do plano:', plan);
    
    const features = await SubscriptionService.getPlanFeatures(plan);
    
    console.log('✨ Features encontradas:', features.length);
    
    return NextResponse.json({
      plan,
      featuresCount: features.length,
      features: features,
      screenerAdvanced: features.find(f => f.feature_key === 'screener_advanced')
    });

  } catch (error) {
    console.error('Erro na API de features:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 