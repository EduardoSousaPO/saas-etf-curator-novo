import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import MercadoPagoService from '@/lib/payments/mercadopago';
import { SubscriptionService } from '@/lib/subscriptions/subscription-service';
import { SubscriptionPlan, getPlanConfig } from '@/types/subscriptions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      planId, 
      userId, 
      assetsUnderManagement,
      userEmail,
      userName 
    } = body;

    // Validações
    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'planId e userId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se é um plano válido
    const planConfig = getPlanConfig(planId as SubscriptionPlan);
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Se for plano STARTER, ativar imediatamente
    if (planId === 'STARTER') {
      const subscription = await SubscriptionService.createSubscription(
        userId,
        'STARTER'
      );

      if (subscription) {
        // Ativar assinatura imediatamente
        await SubscriptionService.updateSubscriptionStatus(subscription.id, 'ACTIVE');
        
        return NextResponse.json({
          success: true,
          subscription,
          redirect: '/dashboard'
        });
      } else {
        return NextResponse.json(
          { error: 'Erro ao criar assinatura gratuita' },
          { status: 500 }
        );
      }
    }

    // Para planos pagos, criar assinatura pendente
    const subscription = await SubscriptionService.createSubscription(
      userId,
      planId as SubscriptionPlan,
      assetsUnderManagement
    );

    if (!subscription) {
      return NextResponse.json(
        { error: 'Erro ao criar assinatura' },
        { status: 500 }
      );
    }

    // Calcular valor do pagamento
    let paymentAmount: number;
    let paymentDescription: string;

    if (planConfig.priceType === 'monthly') {
      paymentAmount = planConfig.price || 0;
      paymentDescription = `${planConfig.name} - Mensalidade`;
    } else if (planConfig.priceType === 'fee_based' && assetsUnderManagement) {
      // Para planos fee-based, calcular taxa mensal
      paymentAmount = (subscription.monthly_fee as number) || 0;
      paymentDescription = `${planConfig.name} - Taxa mensal sobre patrimônio`;
    } else {
      return NextResponse.json(
        { error: 'Não foi possível calcular o valor do pagamento' },
        { status: 400 }
      );
    }

    // Criar registro de pagamento
    const now = new Date();
    const periodStart = now.toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        subscription_id: subscription.id,
        user_id: userId,
        amount: paymentAmount,
        currency: 'BRL',
        status: 'PENDING',
        method: 'MERCADO_PAGO',
        period_start: periodStart,
        period_end: periodEnd,
        description: paymentDescription
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Erro ao criar pagamento:', paymentError);
      return NextResponse.json(
        { error: 'Erro ao criar registro de pagamento' },
        { status: 500 }
      );
    }

    // Criar preferência no MercadoPago
    const mercadoPagoService = new MercadoPagoService();
    const preference = await mercadoPagoService.createPaymentPreference({
      items: [{
        id: planId,
        title: paymentDescription,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: paymentAmount
      }],
      external_reference: payment.id, // ID do pagamento no nosso banco
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?payment_id=${payment.id}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?payment_id=${payment.id}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?payment_id=${payment.id}`
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      payment_methods: {
        installments: planId === 'PRO' ? 12 : 6 // Mais parcelas para plano Pro
      }
    });

    if (!preference.success) {
      return NextResponse.json(
        { error: 'Erro ao criar preferência de pagamento no MercadoPago' },
        { status: 500 }
      );
    }

    // Atualizar pagamento com ID do MercadoPago
    await supabase
      .from('payments')
      .update({
        external_payment_id: preference.preference_id,
        external_data: preference
      })
      .eq('id', payment.id);

    return NextResponse.json({
      success: true,
      subscription,
      payment,
      checkout_url: preference.init_point,
      sandbox_checkout_url: preference.sandbox_init_point
    });

  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 