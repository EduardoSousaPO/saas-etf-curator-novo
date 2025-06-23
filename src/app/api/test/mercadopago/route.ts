import { NextRequest, NextResponse } from 'next/server';
import MercadoPagoService from '@/lib/payments/mercadopago';

export async function GET(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    const config = {
      hasAccessToken: !!accessToken,
      hasPublicKey: !!publicKey,
      hasAppUrl: !!appUrl,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 10)}...` : null,
      publicKeyPreview: publicKey ? `${publicKey.substring(0, 10)}...` : null,
      appUrl
    };
    
    // Tentar criar uma instância do serviço
    let serviceTest = null;
    try {
      const service = new MercadoPagoService();
      serviceTest = { success: true, message: 'Serviço MercadoPago inicializado com sucesso' };
    } catch (error) {
      serviceTest = { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
    
    // Obter planos de assinatura
    const plans = MercadoPagoService.getSubscriptionPlans();
    
    return NextResponse.json({
      status: 'MercadoPago Test',
      timestamp: new Date().toISOString(),
      config,
      serviceTest,
      availablePlans: Object.keys(plans),
      plans: plans
    });
    
  } catch (error) {
    console.error('Erro no teste do MercadoPago:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json(
        { error: 'planId é obrigatório' },
        { status: 400 }
      );
    }
    
    // Obter o plano
    const plan = MercadoPagoService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }
    
    // Criar preferência de pagamento
    const service = new MercadoPagoService();
    const preference = await service.createPaymentPreference({
      items: [{
        id: plan.id,
        title: plan.name,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: plan.price
      }],
      external_reference: `test-${Date.now()}`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/test/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/test/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/test/payment/pending`
      }
    });
    
    return NextResponse.json({
      plan,
      preference,
      testMode: true
    });
    
  } catch (error) {
    console.error('Erro ao criar preferência de teste:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao criar preferência de pagamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 