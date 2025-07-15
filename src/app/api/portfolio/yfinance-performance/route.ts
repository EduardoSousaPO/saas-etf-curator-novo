import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface YFinanceResponse {
  portfolio_performance?: {
    total_invested: number;
    current_value: number;
    total_gain_loss: number;
    total_gain_loss_percent: number;
    etfs_performance: Array<{
      etf_symbol: string;
      etf_name: string;
      purchase_date: string;
      purchase_price: number;
      current_price: number;
      shares_quantity: number;
      total_invested: number;
      current_value: number;
      gain_loss: number;
      gain_loss_percent: number;
      volatility: number;
      sharpe_ratio: number;
      max_drawdown: number;
      returns: {
        '1m': number;
        '3m': number;
        '6m': number;
        '1y': number;
      };
    }>;
    portfolio_metrics: {
      weighted_volatility: number;
      portfolio_sharpe: number;
      portfolio_max_drawdown: number;
    };
  };
  etfs_data?: Array<{
    symbol: string;
    current_price: number;
    purchase_price: number;
    currency: string;
    name: string;
    sector: string;
    expense_ratio: number;
    aum: number;
    volatility: number;
    sharpe_ratio: number;
    max_drawdown: number;
    returns: {
      '1m': number;
      '3m': number;
      '6m': number;
      '1y': number;
    };
    last_updated: string;
    success: boolean;
  }>;
  success: boolean;
  error?: string;
}

function callYFinanceScript(inputData: any): Promise<YFinanceResponse> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'yfinance_etf_data.py');
    const inputJson = JSON.stringify(inputData);
    
    const pythonProcess = spawn('python', [scriptPath, inputJson]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python script output: ${error}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python script: ${error}`));
    });
  });
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

    console.log(`🔍 Buscando performance do portfólio ${portfolio_id} para usuário ${user_id}`);

    // Buscar dados do portfólio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolio_allocations')
      .select('*')
      .eq('id', portfolio_id)
      .eq('user_id', user_id)
      .single();

    if (portfolioError || !portfolio) {
      console.error('Erro ao buscar portfólio:', portfolioError);
      return NextResponse.json(
        { error: 'Portfólio não encontrado' },
        { status: 404 }
      );
    }

    // Buscar dados de tracking (compras)
    const { data: trackingData, error: trackingError } = await supabase
      .from('portfolio_tracking')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('user_id', user_id)
      .order('purchase_date', { ascending: true });

    if (trackingError) {
      console.error('Erro ao buscar tracking:', trackingError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados de tracking' },
        { status: 500 }
      );
    }

    if (!trackingData || trackingData.length === 0) {
      console.log('⚠️ Nenhum dado de tracking encontrado');
      return NextResponse.json({
        portfolio_id,
        portfolio_name: portfolio.portfolio_name,
        total_invested: 0,
        current_value: 0,
        total_gain_loss: 0,
        total_gain_loss_percent: 0,
        etfs_performance: [],
        portfolio_metrics: {
          weighted_volatility: 0,
          portfolio_sharpe: 0,
          portfolio_max_drawdown: 0
        },
        message: 'Nenhuma compra registrada para este portfólio'
      });
    }

    // Preparar dados para o script Python
    const etfSymbols = [...new Set(trackingData.map(item => item.etf_symbol))];
    const pythonInput = {
      symbols: etfSymbols,
      tracking_data: trackingData.map(item => ({
        etf_symbol: item.etf_symbol,
        purchase_date: item.purchase_date,
        purchase_price: parseFloat(item.purchase_price),
        shares_quantity: parseFloat(item.shares_quantity)
      }))
    };

    console.log(`📊 Processando ${etfSymbols.length} ETFs com ${trackingData.length} compras via yfinance`);

    // Chamar script Python com yfinance
    const yfinanceResult = await callYFinanceScript(pythonInput);

    if (!yfinanceResult.success) {
      console.error('Erro no script yfinance:', yfinanceResult.error);
      return NextResponse.json(
        { error: `Erro ao buscar dados do yfinance: ${yfinanceResult.error}` },
        { status: 500 }
      );
    }

    if (!yfinanceResult.portfolio_performance) {
      console.error('Resultado do yfinance não contém portfolio_performance');
      return NextResponse.json(
        { error: 'Dados de performance não encontrados' },
        { status: 500 }
      );
    }

    // Preparar resposta final
    const response = {
      portfolio_id,
      portfolio_name: portfolio.portfolio_name,
      ...yfinanceResult.portfolio_performance,
      data_source: 'yfinance',
      last_updated: new Date().toISOString(),
      success: true
    };

    console.log(`✅ Performance calculada: R$ ${response.total_invested.toFixed(2)} → R$ ${response.current_value.toFixed(2)} (${response.total_gain_loss_percent.toFixed(2)}%)`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API yfinance-performance:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Endpoint para buscar dados de ETFs específicos (sem tracking)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Array de símbolos é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📊 Buscando dados de ${symbols.length} ETFs via yfinance`);

    // Preparar dados para o script Python (sem tracking)
    const pythonInput = {
      symbols,
      tracking_data: []
    };

    // Chamar script Python com yfinance
    const yfinanceResult = await callYFinanceScript(pythonInput);

    if (!yfinanceResult.success) {
      console.error('Erro no script yfinance:', yfinanceResult.error);
      return NextResponse.json(
        { error: `Erro ao buscar dados do yfinance: ${yfinanceResult.error}` },
        { status: 500 }
      );
    }

    console.log(`✅ Dados de ${yfinanceResult.etfs_data?.length || 0} ETFs obtidos com sucesso`);

    return NextResponse.json({
      etfs_data: yfinanceResult.etfs_data || [],
      data_source: 'yfinance',
      last_updated: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('Erro na API yfinance-performance POST:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 