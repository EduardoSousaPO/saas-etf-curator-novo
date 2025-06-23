import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Tipos para o sistema de assinatura
interface CheckoutRequest {
  planId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
}

interface PlanConfig {
  id: string;
  name: string;
  price: number;
  type: 'paid' | 'contact' | 'free';
  features: string[];
}

// Configuração dos planos
const PLANS: Record<string, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'STARTER',
    price: 0,
    type: 'free',
    features: ['Comparação básica', 'Rankings', 'Análise simples']
  },
  pro: {
    id: 'pro', 
    name: 'PRO',
    price: 39.90,
    type: 'paid',
    features: ['Tudo do STARTER', 'IA Avançada', 'Alertas', 'Dashboard']
  },
  wealth: {
    id: 'wealth',
    name: 'WEALTH',
    price: 0,
    type: 'contact',
    features: ['Gestão personalizada', 'Consultoria exclusiva', 'Relatórios avançados']
  },
  offshore: {
    id: 'offshore',
    name: 'OFFSHORE',
    price: 0,
    type: 'contact',
    features: ['Investimentos internacionais', 'Estruturação offshore', 'Consultoria especializada']
  }
};

// Cliente Supabase com configuração otimizada
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔧 Configurações Supabase:');
  console.log('   - URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'UNDEFINED');
  console.log('   - Service Role Key:', serviceRoleKey ? `${serviceRoleKey.substring(0, 30)}...` : 'UNDEFINED');
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Variáveis de ambiente Supabase não configuradas');
    throw new Error('Variáveis de ambiente Supabase não configuradas');
  }

  console.log('✅ Criando cliente Supabase com configurações válidas');
  
  // Configuração simplificada para service role
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Função para criar checkout no MercadoPago
async function createMercadoPagoCheckout(plan: PlanConfig, userId: string, userEmail: string) {
  try {
    console.log('💳 Iniciando criação de checkout MercadoPago...');
    console.log('📊 Dados do plano:', JSON.stringify(plan, null, 2));
    console.log('👤 User ID:', userId);
    console.log('📧 Email:', userEmail);
    
    const { default: MercadoPagoService } = await import('@/lib/payments/mercadopago');
    console.log('✅ Classe MercadoPagoService importada com sucesso');
    
    const mercadopagoService = new MercadoPagoService();
    console.log('✅ Instância MercadoPagoService criada');
    
    const preferenceData = {
      items: [{
        id: plan.id,
        title: `${plan.name} - ETF Curator`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: plan.price
      }],
      external_reference: `subscription_${userId}_${plan.id}_${Date.now()}`,
      payer: {
        email: userEmail
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=pending`
      }
    };

    console.log('📋 Dados da preferência:', JSON.stringify(preferenceData, null, 2));
    console.log('🚀 Chamando createPaymentPreference...');

    const result = await mercadopagoService.createPaymentPreference(preferenceData);
    
    console.log('📥 Resultado do MercadoPago:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error('❌ MercadoPago retornou falha:', result.error);
      throw new Error(`MercadoPago falhou: ${result.error}`);
    }
    
    if (!result.init_point) {
      console.error('❌ MercadoPago não retornou init_point');
      throw new Error('MercadoPago não retornou URL de checkout');
    }

    console.log('✅ Checkout URL criada com sucesso:', result.init_point);
    return result.init_point;
    
  } catch (error: unknown) {
    console.error('❌ Erro detalhado na criação do checkout MercadoPago:');
    
    if (error instanceof Error) {
      console.error('   - Tipo:', error.constructor.name);
      console.error('   - Mensagem:', error.message);
      console.error('   - Stack:', error.stack);
    } else {
      console.error('   - Erro desconhecido:', error);
    }
    
    // Re-lançar o erro com mais contexto
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new Error(`Falha na integração com MercadoPago: ${errorMessage}`);
  }
}

// Função para verificar assinatura existente
async function checkExistingSubscription(supabase: any, userId: string) {
  console.log('🔍 Verificando assinatura existente para userId:', userId);
  
  // Teste simplificado de conectividade
  try {
    const testQuery = await supabase.from('subscriptions').select('id').limit(1);
    console.log('✅ Teste de conectividade Supabase:', testQuery.error ? 'FALHOU' : 'SUCESSO');
    if (testQuery.error) {
      console.error('❌ Erro no teste de conectividade:', testQuery.error);
      console.error('❌ Detalhes completos:', JSON.stringify(testQuery.error, null, 2));
    }
  } catch (testError) {
    console.error('❌ Erro crítico na conectividade Supabase:', testError);
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  console.log('📊 Resultado da consulta:', { data, error });

  if (error) {
    console.error('❌ Erro ao verificar assinatura:', error);
    console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2));
    throw new Error('Erro ao verificar assinatura existente');
  }

  console.log('✅ Assinatura encontrada:', data ? 'SIM' : 'NÃO');
  return data;
}

// Função para criar assinatura
async function createSubscription(supabase: any, userId: string, plan: PlanConfig) {
  const now = new Date().toISOString();
  const expiresAt = plan.type === 'free' 
    ? null 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 dias

  const subscriptionData = {
    user_id: userId,
    plan: plan.name.toUpperCase(), // Corrigido: usar UPPERCASE para o ENUM
    status: plan.type === 'free' ? 'ACTIVE' : 'PENDING', // Corrigido: usar UPPERCASE para o ENUM
    started_at: plan.type === 'free' ? now : null,
    expires_at: expiresAt,
    monthly_fee: plan.price,
    metadata: {
      plan_type: plan.type,
      features: plan.features,
      created_via: 'checkout_api'
    },
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar assinatura:', error);
    throw new Error('Erro ao criar assinatura');
  }

  return data;
}

// Função para criar limites de uso
async function createUsageLimits(supabase: any, userId: string, plan: PlanConfig) {
  // Primeiro, precisamos criar uma assinatura para referenciar
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .single();

  if (!subscription) {
    console.error('Nenhuma assinatura ativa encontrada para criar limites de uso');
    return; // Não é crítico, pode continuar sem limites
  }

  const limits = {
    starter: { 
      screener_queries: 10, 
      export_reports: 2, 
      portfolio_simulations: 5,
      ai_analyses: 5 
    },
    pro: { 
      screener_queries: -1, 
      export_reports: -1, 
      portfolio_simulations: -1,
      ai_analyses: -1 
    }, // -1 = ilimitado
    wealth: { 
      screener_queries: -1, 
      export_reports: -1, 
      portfolio_simulations: -1,
      ai_analyses: -1 
    },
    offshore: { 
      screener_queries: -1, 
      export_reports: -1, 
      portfolio_simulations: -1,
      ai_analyses: -1 
    }
  };

  const planLimits = limits[plan.id as keyof typeof limits] || limits.starter;
  const periodStart = new Date();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const usageLimitData = {
    subscription_id: subscription.id,
    user_id: userId,
    screener_queries_limit: planLimits.screener_queries === -1 ? null : planLimits.screener_queries,
    screener_queries_used: 0,
    export_reports_limit: planLimits.export_reports === -1 ? null : planLimits.export_reports,
    export_reports_used: 0,
    portfolio_simulations_limit: planLimits.portfolio_simulations === -1 ? null : planLimits.portfolio_simulations,
    portfolio_simulations_used: 0,
    ai_analyses_limit: planLimits.ai_analyses === -1 ? null : planLimits.ai_analyses,
    current_ai_analyses: 0,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('usage_limits')
    .upsert(usageLimitData, { onConflict: 'user_id' });

  if (error) {
    console.error('Erro ao criar limites de uso:', error);
    // Não vamos mais lançar erro aqui para não bloquear o checkout
    console.warn('Continuando sem limites de uso configurados');
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DO CHECKOUT ===');
    
    // Validar e extrair dados da requisição
    const body: CheckoutRequest = await request.json();
    const { planId, userId, userEmail, userName } = body;

    console.log('Dados recebidos:', { planId, userId, userEmail: userEmail || 'não fornecido' });

    // Validar entrada
    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, error: 'planId e userId são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se userId é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { success: false, error: 'userId deve ser um UUID válido' },
        { status: 400 }
      );
    }

    // Verificar se o plano existe
    const plan = PLANS[planId.toLowerCase()];
    if (!plan) {
      return NextResponse.json(
        { success: false, error: `Plano ${planId} não encontrado` },
        { status: 400 }
      );
    }

    console.log('Plano encontrado:', plan);

    // Criar cliente Supabase
    const supabase = createSupabaseClient();
    console.log('Cliente Supabase criado com sucesso');

    // Verificar assinatura existente
    const existingSubscription = await checkExistingSubscription(supabase, userId);
    if (existingSubscription) {
      // Se já tem o mesmo plano, retornar erro
      if (existingSubscription.plan === plan.name.toUpperCase()) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Você já possui o plano ${plan.name}`,
            currentPlan: existingSubscription.plan 
          },
          { status: 409 }
        );
      }
      
      // Se tem plano diferente, permitir upgrade/downgrade
      console.log(`🔄 Upgrade detectado: ${existingSubscription.plan} → ${plan.name.toUpperCase()}`);
      
      // Desativar assinatura atual
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');
        
      console.log('✅ Assinatura anterior cancelada');
    }

    console.log('Nenhuma assinatura existente encontrada');

    // Processar baseado no tipo de plano
    if (plan.type === 'free') {
      // Plano STARTER - ativação imediata
      console.log('Processando plano gratuito');
      
      const subscription = await createSubscription(supabase, userId, plan);
      await createUsageLimits(supabase, userId, plan);

      const message = existingSubscription 
        ? `Upgrade para ${plan.name} realizado com sucesso!`
        : 'Plano STARTER ativado com sucesso!';
        
      return NextResponse.json({
        success: true,
        type: 'immediate',
        subscription,
        message,
        upgrade: !!existingSubscription
      });

    } else if (plan.type === 'contact') {
      // Planos WEALTH/OFFSHORE - redirecionamento para contato
      console.log('Processando plano de contato');

      const contactMessage = existingSubscription
        ? `Upgrade para ${plan.name} solicitado! Entre em contato conosco para finalizar a mudança de plano.`
        : `Para o plano ${plan.name}, entre em contato conosco para uma proposta personalizada.`;
        
      return NextResponse.json({
        success: true,
        type: 'contact',
        redirectUrl: '/contato',
        message: contactMessage,
        upgrade: !!existingSubscription
      });

    } else if (plan.type === 'paid') {
      // Plano PRO - checkout MercadoPago
      console.log('Processando plano pago');

      const finalUserEmail = userEmail || `user-${userId}@etfcurator.com`;
      
      // Criar assinatura pendente
      const subscription = await createSubscription(supabase, userId, plan);
      await createUsageLimits(supabase, userId, plan);

      // Criar checkout no MercadoPago
      console.log('🚀 CHAMANDO createMercadoPagoCheckout...');
      console.log('📊 Parâmetros:', { plan: plan.name, userId, email: finalUserEmail });
      
      const checkoutUrl = await createMercadoPagoCheckout(plan, userId, finalUserEmail);
      
      console.log('✅ createMercadoPagoCheckout retornou:', checkoutUrl);

      const paymentMessage = existingSubscription
        ? `Upgrade para ${plan.name} iniciado! Redirecionando para pagamento...`
        : 'Redirecionando para pagamento...';
        
      return NextResponse.json({
        success: true,
        type: 'payment',
        checkoutUrl,
        subscription,
        message: paymentMessage,
        upgrade: !!existingSubscription
      });
    }

    // Fallback - não deveria chegar aqui
    return NextResponse.json(
      { success: false, error: 'Tipo de plano não reconhecido' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('=== ERRO NO CHECKOUT ===');
    console.error('Erro completo:', error);
    console.error('Stack trace:', error.stack);

    // Retornar erro específico baseado no tipo
    if (error.message.includes('Variáveis de ambiente')) {
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor incorreta' },
        { status: 500 }
      );
    }

    if (error.message.includes('MercadoPago')) {
      return NextResponse.json(
        { success: false, error: 'Serviço de pagamento temporariamente indisponível' },
        { status: 503 }
      );
    }

    if (error.message.includes('Supabase') || error.message.includes('assinatura')) {
      return NextResponse.json(
        { success: false, error: 'Erro no banco de dados' },
        { status: 500 }
      );
    }

    // Erro genérico
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