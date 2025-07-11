import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    
    console.log('🔧 Criando assinatura PRO para:', { userId, email });
    
    // Verificar se o usuário já tem assinatura ativa
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .single();
    
    if (existingSubscription) {
      console.log('⚠️ Usuário já tem assinatura ativa:', existingSubscription.plan);
      return NextResponse.json({
        success: false,
        message: 'Usuário já tem assinatura ativa',
        currentPlan: existingSubscription.plan
      });
    }
    
    // Cancelar assinaturas pendentes
    await supabase
      .from('subscriptions')
      .update({ status: 'CANCELLED' })
      .eq('user_id', userId)
      .in('status', ['PENDING', 'EXPIRED']);
    
    // Criar nova assinatura PRO
    const { data: newSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: 'PRO',
        status: 'ACTIVE',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (subscriptionError) {
      console.error('❌ Erro ao criar assinatura:', subscriptionError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar assinatura',
        details: subscriptionError.message
      }, { status: 500 });
    }
    
    console.log('✅ Assinatura PRO criada:', newSubscription);
    
    return NextResponse.json({
      success: true,
      message: 'Assinatura PRO criada com sucesso',
      subscription: newSubscription
    });
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 