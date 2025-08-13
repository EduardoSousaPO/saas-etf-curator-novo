import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema para registro manual de trade
const ManualTradeSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid().optional(),
  etf_symbol: z.string().min(1).max(10),
  side: z.enum(['BUY', 'SELL']),
  trade_date: z.string(), // YYYY-MM-DD
  quantity: z.number().positive(),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  source: z.string().default('manual')
});

// Schema para múltiplos trades (CSV)
const BulkTradesSchema = z.object({
  user_id: z.string().uuid(),
  portfolio_id: z.string().uuid().optional(),
  trades: z.array(z.object({
    etf_symbol: z.string(),
    side: z.enum(['BUY', 'SELL']),
    trade_date: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
    currency: z.string().default('USD')
  })),
  source: z.string().default('csv_upload')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Detectar se é um único trade ou múltiplos trades
    if (body.trades && Array.isArray(body.trades)) {
      return await handleBulkTrades(body);
    } else {
      return await handleSingleTrade(body);
    }
  } catch (error) {
    console.error('Erro na API de trades:', error);
    
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

async function handleSingleTrade(body: any) {
  const validatedData = ManualTradeSchema.parse(body);

  // 1. Verificar se o ETF existe na base
  const { data: etfData } = await supabase
    .from('etfs_ativos_reais')
    .select('symbol, name, nav')
    .eq('symbol', validatedData.etf_symbol)
    .single();

  if (!etfData) {
    return NextResponse.json(
      { error: `ETF ${validatedData.etf_symbol} não encontrado na base de dados` },
      { status: 404 }
    );
  }

  // 2. Buscar ou criar carteira se portfolio_id não fornecido
  let portfolioId = validatedData.portfolio_id;
  
  if (!portfolioId) {
    const { data: portfolio } = await supabase
      .from('user_portfolio_allocations')
      .select('id')
      .eq('user_id', validatedData.user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (portfolio?.[0]) {
      portfolioId = portfolio[0].id;
    } else {
      // Criar nova carteira
      const { data: newPortfolio, error: portfolioError } = await supabase
        .from('user_portfolio_allocations')
        .insert({
          user_id: validatedData.user_id,
          portfolio_name: 'Carteira Principal',
          etf_symbols: [],
          target_allocations: {},
          current_allocations: {},
          invested_amounts: {},
          total_invested: 0,
          is_active: true
        })
        .select()
        .single();

      if (portfolioError || !newPortfolio) {
        return NextResponse.json(
          { error: 'Erro ao criar carteira' },
          { status: 500 }
        );
      }

      portfolioId = newPortfolio.id;
    }
  }

  // 3. Registrar o trade
  const { data: trade, error: tradeError } = await supabase
    .from('trades')
    .insert({
      user_id: validatedData.user_id,
      portfolio_id: portfolioId,
      etf_symbol: validatedData.etf_symbol,
      side: validatedData.side,
      trade_date: validatedData.trade_date,
      quantity: validatedData.quantity,
      price: validatedData.price,
      currency: validatedData.currency,
      source: validatedData.source,
      raw_payload: {
        etf_name: etfData.name,
        manual_entry: true,
        entry_timestamp: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (tradeError) {
    console.error('Erro ao registrar trade:', tradeError);
    return NextResponse.json(
      { error: 'Erro ao registrar operação' },
      { status: 500 }
    );
  }

  // 4. Registrar cashflow correspondente
  const cashflowAmount = validatedData.side === 'BUY' 
    ? -Math.abs(validatedData.quantity * validatedData.price) // Saída de dinheiro
    : Math.abs(validatedData.quantity * validatedData.price);  // Entrada de dinheiro

  await supabase
    .from('cashflows')
    .insert({
      user_id: validatedData.user_id,
      portfolio_id: portfolioId,
      flow_date: validatedData.trade_date,
      amount: cashflowAmount,
      currency: validatedData.currency,
      flow_type: validatedData.side === 'BUY' ? 'CONTRIBUTION' : 'WITHDRAWAL',
      reference_id: trade.id,
      metadata: {
        type: 'trade_execution',
        etf_symbol: validatedData.etf_symbol,
        side: validatedData.side,
        quantity: validatedData.quantity,
        price: validatedData.price
      }
    });

  // 5. Registrar evento na timeline
  await supabase
    .from('timeline_events')
    .insert({
      user_id: validatedData.user_id,
      portfolio_id: portfolioId,
      event_type: 'TRADE_EXECUTED',
      payload: {
        trade_id: trade.id,
        etf_symbol: validatedData.etf_symbol,
        etf_name: etfData.name,
        side: validatedData.side,
        quantity: validatedData.quantity,
        price: validatedData.price,
        gross_amount: validatedData.quantity * validatedData.price,
        currency: validatedData.currency,
        source: validatedData.source
      }
    });

  return NextResponse.json({
    success: true,
    data: {
      trade,
      portfolio_id: portfolioId,
      etf_info: etfData,
      message: `${validatedData.side === 'BUY' ? 'Compra' : 'Venda'} de ${validatedData.quantity} cotas de ${validatedData.etf_symbol} registrada com sucesso`
    }
  });
}

async function handleBulkTrades(body: any) {
  const validatedData = BulkTradesSchema.parse(body);

  // 1. Verificar se todos os ETFs existem
  const etfSymbols = [...new Set(validatedData.trades.map(t => t.etf_symbol))];
  const { data: etfData } = await supabase
    .from('etfs_ativos_reais')
    .select('symbol, name, nav')
    .in('symbol', etfSymbols);

  const etfMap = new Map(etfData?.map(etf => [etf.symbol, etf]) || []);
  const missingETFs = etfSymbols.filter(symbol => !etfMap.has(symbol));

  if (missingETFs.length > 0) {
    return NextResponse.json(
      { 
        error: `ETFs não encontrados na base de dados: ${missingETFs.join(', ')}`,
        missing_etfs: missingETFs
      },
      { status: 404 }
    );
  }

  // 2. Buscar ou criar carteira
  let portfolioId = validatedData.portfolio_id;
  
  if (!portfolioId) {
    const { data: portfolio } = await supabase
      .from('user_portfolio_allocations')
      .select('id')
      .eq('user_id', validatedData.user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (portfolio?.[0]) {
      portfolioId = portfolio[0].id;
    } else {
      const { data: newPortfolio, error: portfolioError } = await supabase
        .from('user_portfolio_allocations')
        .insert({
          user_id: validatedData.user_id,
          portfolio_name: 'Carteira Principal',
          etf_symbols: [],
          target_allocations: {},
          current_allocations: {},
          invested_amounts: {},
          total_invested: 0,
          is_active: true
        })
        .select()
        .single();

      if (portfolioError || !newPortfolio) {
        return NextResponse.json(
          { error: 'Erro ao criar carteira' },
          { status: 500 }
        );
      }

      portfolioId = newPortfolio.id;
    }
  }

  // 3. Preparar dados para inserção em lote
  const tradesForInsert = validatedData.trades.map(trade => ({
    user_id: validatedData.user_id,
    portfolio_id: portfolioId,
    etf_symbol: trade.etf_symbol,
    side: trade.side,
    trade_date: trade.trade_date,
    quantity: trade.quantity,
    price: trade.price,
    currency: trade.currency,
    source: validatedData.source,
    raw_payload: {
      etf_name: etfMap.get(trade.etf_symbol)?.name || trade.etf_symbol,
      bulk_upload: true,
      entry_timestamp: new Date().toISOString()
    }
  }));

  // 4. Inserir todos os trades
  const { data: insertedTrades, error: tradesError } = await supabase
    .from('trades')
    .insert(tradesForInsert)
    .select();

  if (tradesError) {
    console.error('Erro ao inserir trades em lote:', tradesError);
    return NextResponse.json(
      { error: 'Erro ao registrar operações' },
      { status: 500 }
    );
  }

  // 5. Criar cashflows correspondentes
  const cashflows = validatedData.trades.map(trade => {
    const amount = trade.side === 'BUY' 
      ? -Math.abs(trade.quantity * trade.price)
      : Math.abs(trade.quantity * trade.price);

    return {
      user_id: validatedData.user_id,
      portfolio_id: portfolioId,
      flow_date: trade.trade_date,
      amount,
      currency: trade.currency,
      flow_type: trade.side === 'BUY' ? 'CONTRIBUTION' : 'WITHDRAWAL',
      metadata: {
        type: 'bulk_trade_execution',
        etf_symbol: trade.etf_symbol,
        side: trade.side,
        quantity: trade.quantity,
        price: trade.price,
        source: validatedData.source
      }
    };
  });

  await supabase.from('cashflows').insert(cashflows);

  // 6. Registrar evento na timeline
  await supabase
    .from('timeline_events')
    .insert({
      user_id: validatedData.user_id,
      portfolio_id: portfolioId,
      event_type: 'BULK_TRADES_IMPORTED',
      payload: {
        total_trades: validatedData.trades.length,
        unique_etfs: etfSymbols.length,
        source: validatedData.source,
        trades_summary: validatedData.trades.reduce((acc: any, trade) => {
          acc[trade.etf_symbol] = (acc[trade.etf_symbol] || 0) + 1;
          return acc;
        }, {})
      }
    });

  return NextResponse.json({
    success: true,
    data: {
      trades_inserted: insertedTrades?.length || 0,
      portfolio_id: portfolioId,
      summary: {
        total_trades: validatedData.trades.length,
        unique_etfs: etfSymbols.length,
        buy_trades: validatedData.trades.filter(t => t.side === 'BUY').length,
        sell_trades: validatedData.trades.filter(t => t.side === 'SELL').length
      },
      message: `${validatedData.trades.length} operações importadas com sucesso`
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const portfolio_id = searchParams.get('portfolio_id');
    const etf_symbol = searchParams.get('etf_symbol');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user_id)
      .order('trade_date', { ascending: false })
      .limit(limit);

    if (portfolio_id) {
      query = query.eq('portfolio_id', portfolio_id);
    }

    if (etf_symbol) {
      query = query.eq('etf_symbol', etf_symbol);
    }

    const { data: trades, error } = await query;

    if (error) {
      console.error('Erro ao buscar trades:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar operações' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trades || [],
      count: trades?.length || 0
    });

  } catch (error) {
    console.error('Erro na API de trades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


