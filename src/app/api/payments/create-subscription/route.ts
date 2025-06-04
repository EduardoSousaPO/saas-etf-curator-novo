import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    etf_alerts: number;
    portfolios: number;
    ai_queries_daily: number;
    advanced_analytics: boolean;
    email_notifications: boolean;
    api_access: boolean;
  };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  current_period_start: Date;
  current_period_end: Date;
  created_at: Date;
  updated_at: Date;
}

// Planos disponíveis
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Acesso ao dashboard básico',
      'Análise de até 50 ETFs',
      '5 alertas por usuário',
      '2 portfolios',
      '10 consultas AI por dia'
    ],
    limits: {
      etf_alerts: 5,
      portfolios: 2,
      ai_queries_daily: 10,
      advanced_analytics: false,
      email_notifications: false,
      api_access: false
    }
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 29.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Análise ilimitada de ETFs',
      '20 alertas por usuário',
      '10 portfolios',
      '100 consultas AI por dia',
      'Analytics avançadas',
      'Correlações entre ETFs',
      'Notificações por email'
    ],
    limits: {
      etf_alerts: 20,
      portfolios: 10,
      ai_queries_daily: 100,
      advanced_analytics: true,
      email_notifications: true,
      api_access: false
    }
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 99.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Todos os recursos Pro',
      'Alertas ilimitados',
      'Portfolios ilimitados',
      'Consultas AI ilimitadas',
      'Acesso à API',
      'Suporte prioritário',
      'Relatórios personalizados'
    ],
    limits: {
      etf_alerts: -1, // -1 = ilimitado
      portfolios: -1,
      ai_queries_daily: -1,
      advanced_analytics: true,
      email_notifications: true,
      api_access: true
    }
  }
];

// GET - Buscar planos e assinatura do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar assinatura atual do usuário
    const userSubscription = await getUserSubscription(userId);
    
    // Buscar plano ativo
    const activePlan = SUBSCRIPTION_PLANS.find(plan => 
      plan.id === (userSubscription?.plan_id || 'free')
    ) || SUBSCRIPTION_PLANS[0];

    return NextResponse.json({
      plans: SUBSCRIPTION_PLANS,
      current_subscription: userSubscription,
      active_plan: activePlan,
      usage: await getUserUsage(userId)
    });

  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    return NextResponse.json(
      { error: "Falha ao buscar planos" },
      { status: 500 }
    );
  }
}

// POST - Criar/atualizar assinatura
export async function POST(request: NextRequest) {
  try {
    const { user_id, plan_id, payment_method } = await request.json();

    if (!user_id || !plan_id) {
      return NextResponse.json(
        { error: "user_id e plan_id são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o plano existe
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === plan_id);
    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    // Se for plano gratuito, apenas criar registro
    if (plan_id === 'free') {
      const subscription = await createOrUpdateSubscription(user_id, plan_id, 'active');
      return NextResponse.json({
        message: "Plano gratuito ativado",
        subscription
      });
    }

    // Para planos pagos, simular processamento de pagamento
    // Em produção, integrar com Stripe, PayPal, etc.
    const paymentSuccess = await processPayment({
      user_id,
      plan,
      payment_method: payment_method || 'card'
    });

    if (!paymentSuccess) {
      return NextResponse.json(
        { error: "Falha no processamento do pagamento" },
        { status: 400 }
      );
    }

    // Criar assinatura
    const subscription = await createOrUpdateSubscription(user_id, plan_id, 'active');

    return NextResponse.json({
      message: "Assinatura criada com sucesso",
      subscription,
      plan
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    return NextResponse.json(
      { error: "Falha ao criar assinatura" },
      { status: 500 }
    );
  }
}

// Função para buscar assinatura do usuário
async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const query = `
      SELECT * FROM public.user_subscriptions 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await prisma.$queryRawUnsafe(query, userId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if (result.length === 0) return null;
    
    const sub = result[0];
    return {
      id: sub.id,
      user_id: sub.user_id,
      plan_id: sub.plan_id,
      status: sub.status,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      created_at: sub.created_at,
      updated_at: sub.updated_at
    };
  } catch (error) {
    console.log('Tabela user_subscriptions ainda não existe, retornando plano gratuito');
    return null;
  }
}

// Função para buscar uso atual do usuário
async function getUserUsage(userId: string) {
  try {
    // Buscar alertas
    const alertsQuery = `
      SELECT COUNT(*) as count FROM public.etf_alerts 
      WHERE user_id = $1 AND is_active = true
    `;
    const alertsResult = await prisma.$queryRawUnsafe(alertsQuery, userId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    // Buscar portfolios
    const portfoliosQuery = `
      SELECT COUNT(*) as count FROM public.portfolios 
      WHERE user_id = $1
    `;
    const portfoliosResult = await prisma.$queryRawUnsafe(portfoliosQuery, userId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    return {
      alerts_used: Number(alertsResult[0]?.count || 0),
      portfolios_used: Number(portfoliosResult[0]?.count || 0),
      ai_queries_today: 0, // Implementar tracking de queries
      last_updated: new Date()
    };
  } catch (error) {
    return {
      alerts_used: 0,
      portfolios_used: 0,
      ai_queries_today: 0,
      last_updated: new Date()
    };
  }
}

// Função para criar/atualizar assinatura
async function createOrUpdateSubscription(userId: string, planId: string, status: string) {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias
  
  try {
    const upsertQuery = `
      INSERT INTO public.user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        plan_id = $2,
        status = $3,
        current_period_start = $4,
        current_period_end = $5,
        updated_at = NOW()
      RETURNING *
    `;
    
    const result = await prisma.$queryRawUnsafe(
      upsertQuery, 
      userId, 
      planId, 
      status, 
      now, 
      periodEnd
    ) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    return result[0];
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    // Se tabela não existe, retornar mock
    return {
      id: 'mock',
      user_id: userId,
      plan_id: planId,
      status,
      current_period_start: now,
      current_period_end: periodEnd,
      created_at: now,
      updated_at: now
    };
  }
}

// Função para processar pagamento (simulada)
async function processPayment({ user_id, plan, payment_method }: any): Promise<boolean> { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Simular processamento de pagamento
  // Em produção, integrar com gateway de pagamento real
  
  console.log(`Processando pagamento: ${user_id}, Plano: ${plan.name}, Valor: $${plan.price}`);
  
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular sucesso (95% de taxa de sucesso)
  return Math.random() > 0.05;
} 