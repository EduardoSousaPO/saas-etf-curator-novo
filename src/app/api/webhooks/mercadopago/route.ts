import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook MercadoPago recebido:', JSON.stringify(body, null, 2));
    
    // Verificar se é uma notificação de pagamento
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      
      // Aqui você processaria o pagamento
      // Por enquanto, apenas logamos
      console.log(`Processando pagamento ID: ${paymentId}`);
      
      // Atualizar status do pagamento no banco de dados
      await updatePaymentStatus(paymentId, body);
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook MercadoPago:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function updatePaymentStatus(paymentId: string, webhookData: any) {
  try {
    // Buscar o pagamento pelo external_payment_id
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, subscription_id')
      .eq('external_payment_id', paymentId)
      .single();
    
    if (error || !payment) {
      console.log(`Pagamento ${paymentId} não encontrado no banco`);
      return;
    }
    
    // Determinar o novo status baseado no webhook
    let newStatus = 'PENDING';
    let subscriptionStatus = 'PENDING';
    
    if (webhookData.action === 'payment.updated') {
      // Aqui você faria uma chamada à API do MercadoPago para obter o status atual
      // Por simplicidade, assumimos que foi aprovado se a ação for payment.updated
      newStatus = 'PAID';
      subscriptionStatus = 'ACTIVE';
    }
    
    // Atualizar o pagamento
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        external_data: webhookData,
        paid_at: newStatus === 'PAID' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);
    
    if (updateError) {
      console.error('Erro ao atualizar pagamento:', updateError);
      return;
    }
    
    // Se o pagamento foi aprovado, ativar a assinatura
    if (newStatus === 'PAID' && payment.subscription_id) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: subscriptionStatus,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.subscription_id);
      
      if (subError) {
        console.error('Erro ao ativar assinatura:', subError);
      } else {
        console.log(`Assinatura ${payment.subscription_id} ativada com sucesso`);
      }
    }
    
    console.log(`Pagamento ${paymentId} atualizado para ${newStatus}`);
  } catch (error) {
    console.error('Erro ao processar atualização de pagamento:', error);
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 });
} 