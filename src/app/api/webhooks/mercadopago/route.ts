import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service role
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variáveis de ambiente Supabase não configuradas');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Função para atualizar status da assinatura
async function updateSubscriptionStatus(supabase: any, externalReference: string, status: string) {
  // Extrair userId do external_reference: subscription_userId_planId_timestamp
  const parts = externalReference.split('_');
  if (parts.length < 2) {
    throw new Error('External reference inválido');
  }
  
  const userId = parts[1];
  
  const updateData = {
    status: status === 'approved' ? 'ACTIVE' : status === 'rejected' ? 'CANCELLED' : 'PENDING',
    started_at: status === 'approved' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('user_id', userId)
    .eq('status', 'PENDING')
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar assinatura:', error);
    throw new Error('Erro ao atualizar assinatura');
  }

  return data;
}

// Função para criar registro de pagamento
async function createPaymentRecord(supabase: any, paymentData: any) {
  const payment = {
    user_id: paymentData.userId,
    external_payment_id: paymentData.id.toString(),
    amount: paymentData.transaction_amount,
    currency: paymentData.currency_id,
    status: paymentData.status,
    payment_method: paymentData.payment_method_id,
    external_reference: paymentData.external_reference,
    metadata: {
      mercadopago_data: paymentData,
      processed_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar registro de pagamento:', error);
    // Não vamos falhar o webhook por isso
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK MERCADOPAGO RECEBIDO ===');
    
    const body = await request.json();
    console.log('Dados do webhook:', JSON.stringify(body, null, 2));

    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      console.log('Tipo de notificação ignorado:', body.type);
      return NextResponse.json({ success: true, message: 'Notificação ignorada' });
    }

    // Obter dados do pagamento
    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error('Payment ID não encontrado no webhook');
      return NextResponse.json({ success: false, error: 'Payment ID não encontrado' }, { status: 400 });
    }

    // Buscar detalhes do pagamento na API do MercadoPago
    const { default: MercadoPagoService } = await import('@/lib/payments/mercadopago');
    const mercadopagoService = new MercadoPagoService();
    
    // Aqui você implementaria a busca do pagamento
    // Por enquanto, vamos simular os dados
    const paymentData = {
      id: paymentId,
      status: body.action === 'payment.created' ? 'approved' : 'pending',
      external_reference: `subscription_${body.user_id || 'unknown'}_pro_${Date.now()}`,
      transaction_amount: 29.90,
      currency_id: 'BRL',
      payment_method_id: 'pix',
      userId: body.user_id || 'unknown'
    };

    console.log('Dados do pagamento processados:', paymentData);

    // Criar cliente Supabase
    const supabase = createSupabaseClient();

    // Atualizar status da assinatura
    if (paymentData.external_reference && paymentData.status) {
      try {
        const subscription = await updateSubscriptionStatus(
          supabase, 
          paymentData.external_reference, 
          paymentData.status
        );
        console.log('Assinatura atualizada:', subscription);
      } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
      }
    }

    // Criar registro de pagamento
    try {
      await createPaymentRecord(supabase, paymentData);
      console.log('Registro de pagamento criado');
    } catch (error) {
      console.error('Erro ao criar registro de pagamento:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      paymentId: paymentId 
    });

  } catch (error: any) {
    console.error('=== ERRO NO WEBHOOK ===');
    console.error('Erro completo:', error);
    console.error('Stack trace:', error.stack);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Webhook MercadoPago está funcionando',
    timestamp: new Date().toISOString()
  });
} 