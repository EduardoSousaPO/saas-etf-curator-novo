import { NextRequest, NextResponse } from 'next/server';
import MercadoPagoService from '@/lib/payments/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID é obrigatório' },
        { status: 400 }
      );
    }

    // Obter detalhes do plano
    const plan = MercadoPagoService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Criar instância do serviço
    const mercadoPagoService = new MercadoPagoService();

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          id: plan.id,
          title: plan.name,
          quantity: 1,
          currency_id: plan.currency,
          unit_price: plan.price
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?plan=${planId}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
      },
      auto_return: 'approved' as const,
      external_reference: `${planId}_${userId || 'anonymous'}_${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`
    };

    const result = await mercadoPagoService.createPaymentPreference(preferenceData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preference_id: result.preference_id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency
      }
    });

  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST para criar preferência de pagamento' },
    { status: 405 }
  );
} 