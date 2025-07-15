import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RealDataResponse {
  has_real_purchases: boolean;
  portfolio_status: 'NEW' | 'ACTIVE' | 'HISTORICAL';
  total_invested_real: number;
  total_invested_simulated: number;
  allocations: {
    etf_symbol: string;
    allocation_percentage: number;
    current_amount_real: number;
    current_amount_simulated: number;
    shares_owned: number;
    current_price: number;
    last_updated: string;
    performance_1d: number;
    performance_1m: number;
    performance_12m: number;
    data_source: 'REAL_PURCHASES' | 'SIMULATED' | 'MIXED';
  }[];
  summary: {
    using_real_data: boolean;
    last_purchase_date: string | null;
    total_purchases: number;
    data_freshness: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolio_id = searchParams.get('portfolio_id');
    const user_id = searchParams.get('user_id');

    if (!portfolio_id || !user_id) {
      return NextResponse.json(
        { error: 'portfolio_id e user_id são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 Analisando dados reais do portfolio:', portfolio_id);

    // 1. Verificar se há compras reais no portfolio_tracking
    const { data: purchases, error: purchasesError } = await supabase
      .from('portfolio_tracking')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id)
      .order('purchase_date', { ascending: false });

    if (purchasesError) {
      console.error('❌ Erro ao buscar compras:', purchasesError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados de compras' },
        { status: 500 }
      );
    }

    const has_real_purchases = purchases && purchases.length > 0;
    console.log(`📊 Compras reais encontradas: ${purchases?.length || 0}`);

    // 2. Buscar alocações do portfolio
    const { data: allocations, error: allocationsError } = await supabase
      .from('portfolio_allocations')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id);

    if (allocationsError) {
      console.error('❌ Erro ao buscar alocações:', allocationsError);
      return NextResponse.json(
        { error: 'Erro ao buscar alocações' },
        { status: 500 }
      );
    }

    // 3. Buscar dados do portfolio principal
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('*')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError || !portfolio) {
      console.error('❌ Erro ao buscar portfolio:', portfolioError);
      return NextResponse.json(
        { error: 'Portfolio não encontrado' },
        { status: 404 }
      );
    }

    // 4. Buscar preços reais dos ETFs (versão simplificada)
    const etf_symbols = allocations?.map(a => a.etf_symbol) || [];
    let etf_prices: any[] = [];
    
    try {
      const { data, error: etfError } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol, nav')
        .in('symbol', etf_symbols);
      
      if (etfError) {
        console.warn('⚠️ Aviso ao buscar preços dos ETFs:', etfError);
        // Continuar com dados mock se não conseguir buscar preços reais
        etf_prices = [];
      } else {
        etf_prices = data || [];
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar preços dos ETFs, usando dados mock:', error);
      etf_prices = [];
    }

    // 5. Calcular dados reais vs simulados
    const real_allocations: any[] = [];
    let total_invested_real = 0;
    let total_invested_simulated = portfolio.total_invested || 0;

    if (has_real_purchases) {
      // Calcular baseado em compras reais
      const purchase_summary = purchases.reduce((acc, purchase) => {
        const key = purchase.etf_symbol;
        if (!acc[key]) {
          acc[key] = { total_shares: 0, total_invested: 0, last_price: 0 };
        }
        acc[key].total_shares += purchase.shares_bought;
        acc[key].total_invested += purchase.amount_invested;
        acc[key].last_price = purchase.purchase_price;
        return acc;
      }, {} as Record<string, any>);

      total_invested_real = Object.values(purchase_summary).reduce(
        (sum: number, item: any) => sum + item.total_invested, 0
      );

      for (const allocation of allocations || []) {
        const etf_data = etf_prices?.find(e => e.symbol === allocation.etf_symbol);
        const purchase_data = purchase_summary[allocation.etf_symbol];
        
        const current_price = etf_data?.nav || purchase_data?.last_price || 0;
        const shares_owned = purchase_data?.total_shares || 0;
        const current_amount_real = shares_owned * current_price;

        real_allocations.push({
          etf_symbol: allocation.etf_symbol,
          allocation_percentage: allocation.allocation_percentage,
          current_amount_real,
          current_amount_simulated: allocation.current_amount,
          shares_owned,
          current_price,
          last_updated: new Date().toISOString(),
          performance_1d: 0, // Não disponível na base atual
          performance_1m: 0, // Não disponível na base atual
          performance_12m: 0, // Não disponível na base atual
          data_source: 'REAL_PURCHASES' as const
        });
      }
    } else {
      // Calcular baseado em preços simulados com dados reais
      for (const allocation of allocations || []) {
        const etf_data = etf_prices?.find(e => e.symbol === allocation.etf_symbol);
        const current_price = etf_data?.nav || 100; // Fallback para $100
        
        // Calcular quantas shares seriam compradas com o valor simulado
        const simulated_amount = allocation.current_amount;
        const shares_owned = simulated_amount / current_price;
        const current_amount_real = shares_owned * current_price;

        real_allocations.push({
          etf_symbol: allocation.etf_symbol,
          allocation_percentage: allocation.allocation_percentage,
          current_amount_real,
          current_amount_simulated: allocation.current_amount,
          shares_owned,
          current_price,
          last_updated: new Date().toISOString(),
          performance_1d: 0, // Não disponível na base atual
          performance_1m: 0, // Não disponível na base atual
          performance_12m: 0, // Não disponível na base atual
          data_source: 'SIMULATED' as const
        });
      }
    }

    // 6. Determinar status do portfolio
    let portfolio_status: 'NEW' | 'ACTIVE' | 'HISTORICAL' = 'NEW';
    if (has_real_purchases) {
      const last_purchase = new Date(purchases[0].purchase_date);
      const days_since_last = (Date.now() - last_purchase.getTime()) / (1000 * 60 * 60 * 24);
      portfolio_status = days_since_last < 30 ? 'ACTIVE' : 'HISTORICAL';
    }

    const response: RealDataResponse = {
      has_real_purchases,
      portfolio_status,
      total_invested_real: has_real_purchases ? total_invested_real : 0,
      total_invested_simulated,
      allocations: real_allocations,
      summary: {
        using_real_data: has_real_purchases,
        last_purchase_date: has_real_purchases ? purchases[0].purchase_date : null,
        total_purchases: purchases?.length || 0,
        data_freshness: has_real_purchases ? 'REAL_TIME' : 'SIMULATED'
      }
    };

    console.log('✅ Análise de dados reais concluída:', {
      has_real_purchases,
      portfolio_status,
      total_real: total_invested_real,
      total_simulated: total_invested_simulated,
      allocations_count: real_allocations.length
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ Erro na análise de dados reais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 