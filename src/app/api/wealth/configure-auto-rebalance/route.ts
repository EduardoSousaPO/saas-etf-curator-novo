import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ConfigureAutoRebalanceSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  enabled: z.boolean(),
  threshold: z.number().min(1).max(50).default(5.0),
  frequency: z.enum(['monthly', 'quarterly', 'when_needed']).default('when_needed')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ConfigureAutoRebalanceSchema.parse(body);

    // Verificar se já existe configuração
    const { data: existing } = await supabase
      .from('auto_rebalance_settings')
      .select('*')
      .eq('user_id', validatedData.user_id)
      .eq('portfolio_id', validatedData.portfolio_id)
      .single();

    if (existing) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from('auto_rebalance_settings')
        .update({
          enabled: validatedData.enabled,
          threshold: validatedData.threshold,
          frequency: validatedData.frequency,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar auto-rebalanceamento:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar configuração de auto-rebalanceamento' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from('auto_rebalance_settings')
        .insert({
          user_id: validatedData.user_id,
          portfolio_id: validatedData.portfolio_id,
          enabled: validatedData.enabled,
          threshold: validatedData.threshold,
          frequency: validatedData.frequency
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar auto-rebalanceamento:', error);
        return NextResponse.json(
          { error: 'Erro ao configurar auto-rebalanceamento' },
          { status: 500 }
        );
      }

      // Registrar evento na timeline
      await supabase
        .from('timeline_events')
        .insert({
          user_id: validatedData.user_id,
          portfolio_id: validatedData.portfolio_id,
          event_type: 'AUTO_REBALANCE_CONFIGURED',
          payload: {
            enabled: validatedData.enabled,
            threshold: validatedData.threshold,
            frequency: validatedData.frequency
          }
        });

      return NextResponse.json({ success: true, data });
    }

  } catch (error) {
    console.error('Erro na API de auto-rebalanceamento:', error);
    
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
      .from('auto_rebalance_settings')
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
    console.error('Erro na API de auto-rebalanceamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
