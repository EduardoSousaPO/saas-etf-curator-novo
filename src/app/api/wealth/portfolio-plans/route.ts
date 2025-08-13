import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema para criar plano de carteira
const CreatePlanSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  objective: z.string(),
  risk_profile: z.string(),
  base_currency: z.string().default('USD'),
  etfs: z.array(z.object({
    symbol: z.string(),
    name: z.string(),
    allocation_percentage: z.number().min(0).max(100),
    band_lower: z.number().default(5.0),
    band_upper: z.number().default(5.0)
  })),
  notes: z.string().optional()
});

// Schema para atualizar plano
const UpdatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  objective: z.string().optional(),
  risk_profile: z.string().optional(),
  base_currency: z.string().optional(),
  notes: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePlanSchema.parse(body);

    // 1. Criar o plano principal
    const { data: plan, error: planError } = await supabase
      .from('portfolio_plans')
      .insert({
        user_id: validatedData.user_id,
        name: validatedData.name,
        objective: validatedData.objective,
        risk_profile: validatedData.risk_profile,
        base_currency: validatedData.base_currency
      })
      .select()
      .single();

    if (planError || !plan) {
      console.error('Erro ao criar plano:', planError);
      return NextResponse.json(
        { error: 'Erro ao criar plano de carteira' },
        { status: 500 }
      );
    }

    // 2. Criar versão inicial
    const { data: version, error: versionError } = await supabase
      .from('portfolio_plan_versions')
      .insert({
        plan_id: plan.id,
        version: 1,
        notes: validatedData.notes || 'Versão inicial criada pelo Portfolio Master'
      })
      .select()
      .single();

    if (versionError || !version) {
      console.error('Erro ao criar versão:', versionError);
      return NextResponse.json(
        { error: 'Erro ao criar versão do plano' },
        { status: 500 }
      );
    }

    // 3. Criar alocações alvo
    const allocations = validatedData.etfs.map(etf => ({
      plan_version_id: version.id,
      etf_symbol: etf.symbol,
      allocation_percentage: etf.allocation_percentage,
      band_lower: etf.band_lower,
      band_upper: etf.band_upper
    }));

    const { error: allocationsError } = await supabase
      .from('portfolio_target_allocations')
      .insert(allocations);

    if (allocationsError) {
      console.error('Erro ao criar alocações:', allocationsError);
      return NextResponse.json(
        { error: 'Erro ao criar alocações do plano' },
        { status: 500 }
      );
    }

    // 4. Registrar evento na timeline
    await supabase
      .from('timeline_events')
      .insert({
        user_id: validatedData.user_id,
        event_type: 'PLAN_CREATED',
        payload: {
          plan_id: plan.id,
          plan_name: plan.name,
          etf_count: validatedData.etfs.length,
          objective: plan.objective,
          risk_profile: plan.risk_profile
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        plan,
        version,
        allocations_count: validatedData.etfs.length
      }
    });

  } catch (error) {
    console.error('Erro na API de planos:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar planos com versões e alocações
    const { data: plans, error } = await supabase
      .from('portfolio_plans')
      .select(`
        *,
        portfolio_plan_versions!inner (
          id,
          version,
          notes,
          created_at,
          portfolio_target_allocations (
            etf_symbol,
            allocation_percentage,
            band_lower,
            band_upper
          )
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar planos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar planos' },
        { status: 500 }
      );
    }

    // Formatar dados para o frontend
    const formattedPlans = plans?.map(plan => ({
      ...plan,
      latest_version: plan.portfolio_plan_versions
        .sort((a: any, b: any) => b.version - a.version)[0],
      total_allocations: plan.portfolio_plan_versions[0]?.portfolio_target_allocations?.length || 0
    }));

    return NextResponse.json({
      success: true,
      data: formattedPlans || []
    });

  } catch (error) {
    console.error('Erro na API de planos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan_id = searchParams.get('id');

    if (!plan_id) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdatePlanSchema.parse(body);

    const { data: plan, error } = await supabase
      .from('portfolio_plans')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', plan_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar plano:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar plano' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('Erro na API de planos:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

