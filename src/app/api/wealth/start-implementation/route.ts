import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const StartImplementationSchema = z.object({
  user_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  initial_amount: z.number().positive(),
  currency: z.string().default('USD')
});

interface AllocationPriority {
  etf_symbol: string;
  target_percentage: number;
  target_amount: number;
  band_lower: number;
  band_upper: number;
  priority: number;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = StartImplementationSchema.parse(body);

    // 1. Buscar plano e versão mais recente
    const { data: plan, error: planError } = await supabase
      .from('portfolio_plans')
      .select(`
        *,
        portfolio_plan_versions!inner (
          id,
          version,
          portfolio_target_allocations (
            etf_symbol,
            allocation_percentage,
            band_lower,
            band_upper
          )
        )
      `)
      .eq('id', validatedData.plan_id)
      .eq('user_id', validatedData.user_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // 2. Obter versão mais recente
    const latestVersion = plan.portfolio_plan_versions
      .sort((a: any, b: any) => b.version - a.version)[0];

    if (!latestVersion?.portfolio_target_allocations?.length) {
      return NextResponse.json(
        { error: 'Plano não possui alocações definidas' },
        { status: 400 }
      );
    }

    // 3. Calcular lista priorizada de compras
    const allocations = latestVersion.portfolio_target_allocations;
    const totalAmount = validatedData.initial_amount;

    // Buscar dados dos ETFs para enriquecer a análise
    const etfSymbols = allocations.map((a: any) => a.etf_symbol);
    const { data: etfData } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol, name, expenseratio, totalasset, nav')
      .in('symbol', etfSymbols);

    const etfMap = new Map(etfData?.map(etf => [etf.symbol, etf]) || []);

    // Calcular prioridades baseadas em:
    // 1. Alocação percentual (maiores primeiro)
    // 2. Liquidez do ETF (totalasset)
    // 3. Custo (expenseratio - menores primeiro)
    const prioritizedAllocations: AllocationPriority[] = allocations
      .map((allocation: any) => {
        const etf = etfMap.get(allocation.etf_symbol);
        const targetAmount = (allocation.allocation_percentage / 100) * totalAmount;
        
        // Sistema de scoring para priorização
        let priorityScore = 0;
        let reason = '';

        // Prioridade por alocação (peso 40%)
        priorityScore += (allocation.allocation_percentage / 100) * 40;
        
        // Prioridade por liquidez (peso 30%)
        if (etf?.totalasset) {
          const liquidityScore = Math.min(etf.totalasset / 1000000000, 1); // Normalizar para bilhões
          priorityScore += liquidityScore * 30;
        }
        
        // Prioridade por baixo custo (peso 20%)
        if (etf?.expenseratio) {
          const costScore = Math.max(0, (1 - etf.expenseratio / 2)) * 20; // Inverter custo
          priorityScore += costScore;
        }
        
        // Prioridade por facilidade de compra (peso 10%)
        if (etf?.nav && etf.nav < 500) {
          priorityScore += 10; // ETFs mais baratos são mais fáceis de comprar
        }

        // Determinar razão da prioridade
        if (allocation.allocation_percentage >= 20) {
          reason = 'Core holding - alta alocação';
        } else if (etf?.totalasset && etf.totalasset > 5000000000) {
          reason = 'ETF de alta liquidez';
        } else if (etf?.expenseratio && etf.expenseratio < 0.2) {
          reason = 'Baixo custo';
        } else {
          reason = 'Diversificação';
        }

        return {
          etf_symbol: allocation.etf_symbol,
          target_percentage: allocation.allocation_percentage,
          target_amount: targetAmount,
          band_lower: allocation.band_lower,
          band_upper: allocation.band_upper,
          priority: Math.round(priorityScore),
          reason
        };
      })
      .sort((a, b) => b.priority - a.priority); // Maior prioridade primeiro

    // 4. Criar implementation run
    const { data: implementationRun, error: runError } = await supabase
      .from('portfolio_implementation_runs')
      .insert({
        plan_id: validatedData.plan_id,
        plan_version_id: latestVersion.id,
        user_id: validatedData.user_id,
        status: 'PENDING',
        priority_json: prioritizedAllocations
      })
      .select()
      .single();

    if (runError) {
      console.error('Erro ao criar implementation run:', runError);
      return NextResponse.json(
        { error: 'Erro ao iniciar implementação' },
        { status: 500 }
      );
    }

    // 5. Criar entrada de cashflow para o aporte inicial
    await supabase
      .from('cashflows')
      .insert({
        user_id: validatedData.user_id,
        portfolio_id: null, // Será vinculado quando carteira for criada
        flow_date: new Date().toISOString().split('T')[0],
        amount: validatedData.initial_amount,
        currency: validatedData.currency,
        flow_type: 'CONTRIBUTION',
        reference_id: implementationRun.id,
        metadata: {
          type: 'initial_contribution',
          implementation_run_id: implementationRun.id
        }
      });

    // 6. Registrar evento na timeline
    await supabase
      .from('timeline_events')
      .insert({
        user_id: validatedData.user_id,
        event_type: 'IMPLEMENTATION_STARTED',
        payload: {
          plan_id: validatedData.plan_id,
          implementation_run_id: implementationRun.id,
          initial_amount: validatedData.initial_amount,
          currency: validatedData.currency,
          etf_count: prioritizedAllocations.length,
          priority_list: prioritizedAllocations.slice(0, 5) // Top 5 para timeline
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        implementation_run: implementationRun,
        priority_list: prioritizedAllocations,
        total_amount: totalAmount,
        currency: validatedData.currency,
        next_steps: {
          message: 'Implementação iniciada com sucesso',
          recommended_first_purchase: prioritizedAllocations[0],
          total_etfs_to_buy: prioritizedAllocations.length
        }
      }
    });

  } catch (error) {
    console.error('Erro na API de implementação:', error);
    
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

