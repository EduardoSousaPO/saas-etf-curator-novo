import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook Mercado Pago recebido:', {
      type: body.type,
      action: body.action,
      data: body.data,
      timestamp: new Date().toISOString()
    });

    // Verificar se é uma notificação de pagamento
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (paymentId) {
        // Aqui você processaria o pagamento
        // Por exemplo: atualizar status do usuário, ativar plano, etc.
        await processPaymentNotification(paymentId, body);
      }
    }

    // Sempre retornar 200 para confirmar recebimento
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    // Retornar 200 mesmo em caso de erro para evitar retry infinito
    return NextResponse.json({ error: 'Internal error' }, { status: 200 });
  }
}

async function processPaymentNotification(paymentId: string, webhookData: any) {
  try {
    // Aqui você implementaria a lógica de processamento do pagamento
    console.log(`Processando pagamento ${paymentId}:`, webhookData);
    
    // Exemplo de implementação:
    // 1. Buscar detalhes do pagamento via API do Mercado Pago
    // 2. Verificar status do pagamento
    // 3. Atualizar banco de dados do usuário
    // 4. Ativar plano de assinatura
    // 5. Enviar email de confirmação
    
    const paymentStatus = webhookData.action; // approved, rejected, etc.
    const externalReference = webhookData.external_reference;
    
    if (paymentStatus === 'payment.created' || paymentStatus === 'payment.updated') {
      // Lógica para processar pagamento aprovado
      console.log('Pagamento processado com sucesso:', {
        paymentId,
        status: paymentStatus,
        reference: externalReference
      });
    }
    
  } catch (error) {
    console.error('Erro ao processar notificação de pagamento:', error);
    throw error;
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Webhook Mercado Pago ativo' },
    { status: 200 }
  );
} 