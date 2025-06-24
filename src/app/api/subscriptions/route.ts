import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SubscriptionService } from '@/lib/subscriptions/subscription-service';
import { SubscriptionPlan } from '@/types/subscriptions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Criar cliente Supabase para o request
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar autenticação via header ou cookie
    let user: any = null;
    let authError: any = null;

    // Tentar via Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const result = await supabase.auth.getUser(token);
      user = result.data.user;
      authError = result.error;
    }

    // Se não funcionou via header, tentar via cookie de sessão
    if (!user) {
      const result = await supabaseClient.auth.getUser();
      user = result.data.user;
      authError = result.error;
    }
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return NextResponse.json({ 
        error: 'Usuário não autenticado',
        debug: {
          hasAuthHeader: !!authHeader,
          authError: authError?.message
        }
      }, { status: 401 });
    }

    // Buscar assinatura do usuário
    const subscription = await SubscriptionService.getUserSubscription(user.id);
    const usageLimits = await SubscriptionService.getCurrentUsageLimits(user.id);
    
    return NextResponse.json({
      subscription,
      usageLimits,
      currentPlan: subscription?.plan || 'STARTER'
    });

  } catch (error) {
    console.error('Erro na API de assinaturas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização requerido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, assetsUnderManagement } = body;

    // Validar plano
    if (!['STARTER', 'PRO', 'WEALTH', 'OFFSHORE'].includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Validar patrimônio para planos fee-based
    if ((plan === 'WEALTH' && (!assetsUnderManagement || assetsUnderManagement < 200000)) ||
        (plan === 'OFFSHORE' && (!assetsUnderManagement || assetsUnderManagement < 1000000))) {
      return NextResponse.json({ 
        error: 'Patrimônio mínimo não atingido para este plano' 
      }, { status: 400 });
    }

    // Verificar se já tem assinatura ativa
    const existingSubscription = await SubscriptionService.getUserSubscription(user.id);
    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      return NextResponse.json({ 
        error: 'Usuário já possui assinatura ativa' 
      }, { status: 400 });
    }

    // Criar assinatura
    const subscription = await SubscriptionService.createSubscription(
      user.id,
      plan as SubscriptionPlan,
      assetsUnderManagement
    );

    if (!subscription) {
      return NextResponse.json({ 
        error: 'Erro ao criar assinatura' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      subscription 
    });

  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 