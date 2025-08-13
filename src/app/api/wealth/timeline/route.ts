import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TimelineRequestSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  event_type: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

const CreateEventSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  event_type: z.string().min(1),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payload: z.record(z.any()).default({}),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validatedData = TimelineRequestSchema.parse({
      user_id: searchParams.get('user_id'),
      portfolio_id: searchParams.get('portfolio_id'),
      event_type: searchParams.get('event_type'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      limit: parseInt(searchParams.get('limit') || '50'),
    });

    const { user_id, portfolio_id, event_type, start_date, end_date, limit } = validatedData;

    // Construir query
    let query = supabase
      .from('timeline_events')
      .select('*')
      .eq('user_id', user_id)
      .eq('portfolio_id', portfolio_id)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (event_type) {
      query = query.eq('event_type', event_type);
    }

    if (start_date) {
      query = query.gte('event_date', start_date);
    }

    if (end_date) {
      query = query.lte('event_date', end_date);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching timeline events:', error);
      return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
    }

    // Enriquecer eventos com informações adicionais
    const enrichedEvents = await enrichTimelineEvents(events || []);

    return NextResponse.json({ success: true, data: enrichedEvents });

  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json({ 
      error: 'Internal server error or invalid parameters' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateEventSchema.parse(body);

    const { user_id, portfolio_id, event_type, event_date, payload } = validatedData;

    // Verificar se o portfolio pertence ao usuário
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolio_plans')
      .select('id')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found or access denied' }, { status: 404 });
    }

    // Criar evento na timeline
    const { data: event, error } = await supabase
      .from('timeline_events')
      .insert({
        user_id,
        portfolio_id,
        event_type,
        event_date,
        payload,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline event:', error);
      return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: event });

  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json({ 
      error: 'Invalid request data or internal server error' 
    }, { status: 400 });
  }
}

// Função auxiliar para enriquecer eventos com informações contextuais
async function enrichTimelineEvents(events: any[]): Promise<any[]> {
  const enrichedEvents: any[] = [];

  for (const event of events) {
    let enrichedEvent = { ...event };

    try {
      switch (event.event_type) {
        case 'TRADE_RECORDED':
          // Adicionar informações do ETF se disponível
          if (event.payload.etf_symbol) {
            const { data: etfInfo } = await supabase
              .from('etfs_ativos_reais')
              .select('name, expense_ratio')
              .eq('symbol', event.payload.etf_symbol)
              .single();

            if (etfInfo) {
              enrichedEvent.payload = {
                ...event.payload,
                etf_name: etfInfo.name,
                etf_expense_ratio: etfInfo.expense_ratio,
              };
            }
          }
          break;

        case 'REBALANCE_SUGGESTED':
          // Adicionar estatísticas do rebalanceamento
          const { data: rebalanceSuggestion } = await supabase
            .from('rebalance_suggestions')
            .select('*')
            .eq('portfolio_id', event.portfolio_id)
            .eq('created_at', event.created_at)
            .single();

          if (rebalanceSuggestion) {
            enrichedEvent.payload = {
              ...event.payload,
              actions_count: rebalanceSuggestion.total_trades,
              estimated_cost: rebalanceSuggestion.estimated_cost,
              suggestion_type: rebalanceSuggestion.suggestion_type,
            };
          }
          break;

        case 'PERFORMANCE_MILESTONE':
          // Adicionar contexto de performance
          enrichedEvent.payload = {
            ...event.payload,
            milestone_type: event.payload.milestone || 'return_threshold',
            benchmark_comparison: event.payload.vs_benchmark || null,
          };
          break;

        default:
          // Manter evento como está
          break;
      }
    } catch (enrichError) {
      console.warn(`Warning: Failed to enrich event ${event.id}:`, enrichError);
      // Continuar com evento não enriquecido
    }

    enrichedEvents.push(enrichedEvent);
  }

  return enrichedEvents;
}

// Função utilitária para criar eventos automáticos
export async function createAutomaticTimelineEvent(
  userId: string,
  portfolioId: string,
  eventType: string,
  eventDate: string,
  payload: any
) {
  try {
    const { error } = await supabase
      .from('timeline_events')
      .insert({
        user_id: userId,
        portfolio_id: portfolioId,
        event_type: eventType,
        event_date: eventDate,
        payload,
      });

    if (error) {
      console.error('Error creating automatic timeline event:', error);
    }
  } catch (error) {
    console.error('Error in createAutomaticTimelineEvent:', error);
  }
}
