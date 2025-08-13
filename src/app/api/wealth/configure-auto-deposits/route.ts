import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ConfigureAutoDepositsSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  monthly_amount: z.number().min(1),
  enabled: z.boolean(),
  day_of_month: z.number().min(1).max(31).default(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ConfigureAutoDepositsSchema.parse(body);

    // Verificar se já existe configuração
    const { data: existing } = await supabase
      .from('auto_deposit_settings')
      .select('*')
      .eq('user_id', validatedData.user_id)
      .eq('portfolio_id', validatedData.portfolio_id)
      .single();

    if (existing) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from('auto_deposit_settings')
        .update({
          monthly_amount: validatedData.monthly_amount,
          enabled: validatedData.enabled,
          day_of_month: validatedData.day_of_month,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar auto-depósitos:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar configuração de auto-depósitos' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from('auto_deposit_settings')
        .insert({
          user_id: validatedData.user_id,
          portfolio_id: validatedData.portfolio_id,
          monthly_amount: validatedData.monthly_amount,
          enabled: validatedData.enabled,
          day_of_month: validatedData.day_of_month
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar auto-depósitos:', error);
        return NextResponse.json(
          { error: 'Erro ao configurar auto-depósitos' },
          { status: 500 }
        );
      }

      // Registrar evento na timeline
      await supabase
        .from('timeline_events')
        .insert({
          user_id: validatedData.user_id,
          portfolio_id: validatedData.portfolio_id,
          event_type: 'AUTO_DEPOSITS_CONFIGURED',
          payload: {
            monthly_amount: validatedData.monthly_amount,
            enabled: validatedData.enabled,
            day_of_month: validatedData.day_of_month
          }
        });

      return NextResponse.json({ success: true, data });
    }

  } catch (error) {
    console.error('Erro na API de auto-depósitos:', error);
    
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
    const portfolio_id = searchParams.get('portfolio_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('auto_deposit_settings')
      .select('*')
      .eq('user_id', user_id);

    if (portfolio_id) {
      query = query.eq('portfolio_id', portfolio_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar configurações' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });

  } catch (error) {
    console.error('Erro na API de auto-depósitos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
