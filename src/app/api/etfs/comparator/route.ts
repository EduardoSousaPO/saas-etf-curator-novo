import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [COMPARADOR] Iniciando comparação de ETFs...');
    
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    
    console.log(`📝 [COMPARADOR] Parâmetro symbols recebido: ${symbolsParam}`);
    
    if (!symbolsParam) {
      console.log('❌ [COMPARADOR] Parâmetro symbols não fornecido');
      return NextResponse.json({ 
        error: 'Parâmetro symbols é obrigatório. Ex: ?symbols=VTI,SPY,QQQ' 
      }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
    console.log(`📋 [COMPARADOR] Símbolos processados: ${JSON.stringify(symbols)}`);
    
    if (symbols.length < 2) {
      console.log('❌ [COMPARADOR] Menos de 2 ETFs fornecidos');
      return NextResponse.json({ 
        error: 'É necessário pelo menos 2 ETFs para comparação' 
      }, { status: 400 });
    }

    if (symbols.length > 10) {
      console.log('❌ [COMPARADOR] Mais de 10 ETFs fornecidos');
      return NextResponse.json({ 
        error: 'Máximo de 10 ETFs por comparação' 
      }, { status: 400 });
    }

    console.log(`🔍 [COMPARADOR] Comparando ETFs: ${symbols.join(', ')}`);

    // Buscar ETFs na base de dados
    console.log('🗃️ [COMPARADOR] Consultando base de dados...');
    const etfs = await prisma.etfs_ativos_reais.findMany({
      where: {
        symbol: {
          in: symbols
        }
      },
              select: {
          symbol: true,
          name: true,
          expenseratio: true,
          returns_12m: true,
          returns_24m: true,
          returns_36m: true,
          returns_5y: true,
          ten_year_return: true,
          volatility_12m: true,
          sharpe_12m: true,
          dividends_12m: true,
          max_drawdown: true,
          totalasset: true,
          assetclass: true,
          inceptiondate: true
        }
    });

    console.log(`📊 [COMPARADOR] ETFs encontrados na base: ${etfs.length}`);
    console.log(`📋 [COMPARADOR] Símbolos encontrados: ${etfs.map(e => e.symbol).join(', ')}`);

    if (etfs.length === 0) {
      console.log('❌ [COMPARADOR] Nenhum ETF encontrado na base');
      return NextResponse.json({ 
        error: 'Nenhum ETF encontrado com os símbolos fornecidos',
        searched_symbols: symbols
      }, { status: 404 });
    }

    // Identificar símbolos não encontrados
    const foundSymbols = etfs.map(etf => etf.symbol);
    const notFoundSymbols = symbols.filter(symbol => !foundSymbols.includes(symbol));
    
    console.log(`✅ [COMPARADOR] Símbolos encontrados: ${foundSymbols.join(', ')}`);
    console.log(`❌ [COMPARADOR] Símbolos não encontrados: ${notFoundSymbols.join(', ')}`);

    // Calcular estatísticas comparativas
    console.log('🧮 [COMPARADOR] Calculando estatísticas comparativas...');
    
    // Função para converter BigInt para Number de forma segura
    const safeBigIntToNumber = (value: any): number | null => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'bigint') {
        return Number(value);
      }
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      }
      return typeof value === 'number' ? value : null;
    };

    const comparison = {
      etfs: etfs.map(etf => ({
        symbol: etf.symbol,
        name: etf.name,
        metrics: {
          expense_ratio: safeBigIntToNumber(etf.expenseratio),
          returns_12m: safeBigIntToNumber(etf.returns_12m),
          returns_24m: safeBigIntToNumber(etf.returns_24m),
          returns_36m: safeBigIntToNumber(etf.returns_36m),
          returns_5y: safeBigIntToNumber(etf.returns_5y),
          returns_10y: safeBigIntToNumber(etf.ten_year_return),
          volatility_12m: safeBigIntToNumber(etf.volatility_12m),
          sharpe_ratio: safeBigIntToNumber(etf.sharpe_12m),
          dividend_yield: safeBigIntToNumber(etf.dividends_12m),
          max_drawdown: safeBigIntToNumber(etf.max_drawdown),
          total_assets: safeBigIntToNumber(etf.totalasset),
        },
        classification: {
          asset_class: etf.assetclass,
          inception_date: etf.inceptiondate
        }
      })),
      comparison_stats: {
        best_performer_12m: getBestPerformer(etfs, 'returns_12m', safeBigIntToNumber),
        lowest_expense_ratio: getBestPerformer(etfs, 'expenseratio', safeBigIntToNumber, false),
        highest_sharpe: getBestPerformer(etfs, 'sharpe_12m', safeBigIntToNumber),
        highest_dividend: getBestPerformer(etfs, 'dividends_12m', safeBigIntToNumber),
        lowest_volatility: getBestPerformer(etfs, 'volatility_12m', safeBigIntToNumber, false),
        largest_aum: getBestPerformer(etfs, 'totalasset', safeBigIntToNumber)
      },
      summary: {
        total_etfs_compared: etfs.length,
        symbols_found: foundSymbols,
        symbols_not_found: notFoundSymbols,
        comparison_date: new Date().toISOString()
      }
    };

    console.log('✅ [COMPARADOR] Comparação concluída com sucesso');
    console.log(`📊 [COMPARADOR] Retornando dados de ${comparison.etfs.length} ETFs`);

    return NextResponse.json({
      success: true,
      ...comparison
    });

  } catch (error) {
    console.error('❌ [COMPARADOR] Erro na API de comparação:', error);
    console.error('❌ [COMPARADOR] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Erro interno na comparação de ETFs',
      timestamp: new Date().toISOString(),
      debug_info: {
        error_message: error instanceof Error ? error.message : String(error),
        error_type: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 });
  }
}

// Função auxiliar para encontrar o melhor performer
function getBestPerformer(etfs: any[], field: string, converter: (value: any) => number | null, highest: boolean = true): any {
  if (etfs.length === 0) return null;
  
  const validEtfs = etfs.filter(etf => {
    const convertedValue = converter(etf[field]);
    return convertedValue !== null && convertedValue !== undefined && !isNaN(convertedValue);
  });
  
  if (validEtfs.length === 0) return null;
  
  const sortedEtfs = validEtfs.sort((a, b) => {
    const aValue = converter(a[field]) || 0;
    const bValue = converter(b[field]) || 0;
    return highest ? bValue - aValue : aValue - bValue;
  });
  
  const winner = sortedEtfs[0];
  return {
    symbol: winner.symbol,
    name: winner.name,
    value: converter(winner[field])
  };
}

// POST endpoint para comparação com critérios específicos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols, metrics = [] } = body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ 
        error: 'Campo symbols é obrigatório e deve ser um array' 
      }, { status: 400 });
    }

    // Usar GET endpoint interno
    const searchParams = new URLSearchParams({ symbols: symbols.join(',') });
    const getRequest = new NextRequest(`${request.url}?${searchParams}`);
    return await GET(getRequest);

  } catch (error) {
    console.error('❌ Erro no POST da API de comparação:', error);
    return NextResponse.json({ 
      error: 'Erro interno na comparação de ETFs',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 