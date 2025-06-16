import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando API bulk...');
    
    const body = await request.json();
    console.log('📝 Body recebido:', body);
    
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols)) {
      console.log('❌ Symbols array inválido');
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    if (symbols.length > 50) {
      console.log('❌ Muitos símbolos');
      return NextResponse.json(
        { error: 'Maximum 50 symbols allowed per request' },
        { status: 400 }
      );
    }

    const symbolsUpper = symbols.map(s => s.toUpperCase());
    console.log(`🔍 Buscando dados reais em lote para ${symbolsUpper.length} ETFs: ${symbolsUpper.join(', ')}`);

    // Buscar dados básicos dos ETFs
    console.log('📊 Buscando dados básicos...');
    const { data: etfsData, error: etfsError } = await supabase
      .from('etf_list')
      .select('*')
      .in('symbol', symbolsUpper);

    if (etfsError) {
      console.error('❌ Erro ao buscar ETFs:', etfsError);
      throw etfsError;
    }

    console.log(`✅ Encontrados ${etfsData?.length || 0} ETFs básicos`);

    // Buscar métricas calculadas
    console.log('📈 Buscando métricas...');
    const { data: metricsData, error: metricsError } = await supabase
      .from('calculated_metrics_teste')
      .select('*')
      .in('symbol', symbolsUpper);

    if (metricsError) {
      console.error('⚠️ Erro ao buscar métricas (continuando):', metricsError);
    }

    console.log(`✅ Encontradas ${metricsData?.length || 0} métricas`);

    // Buscar preços mais recentes
    console.log('💰 Buscando preços...');
    const { data: pricesData, error: pricesError } = await supabase
      .from('etf_prices')
      .select('symbol, close, date')
      .in('symbol', symbolsUpper)
      .order('date', { ascending: false });

    if (pricesError) {
      console.error('⚠️ Erro ao buscar preços (continuando):', pricesError);
    }

    console.log(`✅ Encontrados ${pricesData?.length || 0} preços`);

    // Agrupar preços por símbolo (pegar o mais recente)
    const latestPrices = new Map();
    pricesData?.forEach(price => {
      if (!latestPrices.has(price.symbol)) {
        latestPrices.set(price.symbol, price);
      }
    });

    // Buscar dividendos do último ano
    console.log('💵 Buscando dividendos...');
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { data: dividendsData, error: dividendsError } = await supabase
      .from('etf_dividends')
      .select('symbol, amount, ex_date')
      .in('symbol', symbolsUpper)
      .gte('ex_date', oneYearAgo.toISOString().split('T')[0]);

    if (dividendsError) {
      console.error('⚠️ Erro ao buscar dividendos (continuando):', dividendsError);
    }

    console.log(`✅ Encontrados ${dividendsData?.length || 0} dividendos`);

    // Agrupar dividendos por símbolo
    const dividendsBySymbol = new Map();
    dividendsData?.forEach(div => {
      if (!dividendsBySymbol.has(div.symbol)) {
        dividendsBySymbol.set(div.symbol, []);
      }
      dividendsBySymbol.get(div.symbol).push(div);
    });

    // Montar resultado
    console.log('🔧 Montando resultado...');
    const result: Record<string, any> = {};
    const foundSymbols: string[] = [];
    const notFoundSymbols: string[] = [];

    symbolsUpper.forEach(symbol => {
      const etfData = etfsData?.find(etf => etf.symbol === symbol);
      
      if (etfData) {
        foundSymbols.push(symbol);
        
        const metrics = metricsData?.find(m => m.symbol === symbol);
        const priceData = latestPrices.get(symbol);
        const dividends = dividendsBySymbol.get(symbol) || [];
        
        // Calcular dividend yield anual
        const totalDividends = dividends.reduce((sum, div) => sum + (div.amount || 0), 0);
        const currentPrice = priceData?.close || etfData.nav || 100;
        const dividendYield = currentPrice > 0 ? (totalDividends / currentPrice) * 100 : 0;

        result[symbol] = {
          symbol: symbol,
          shortName: etfData.name || `${symbol} ETF`,
          longName: etfData.description || etfData.name || `${symbol} Exchange Traded Fund`,
          
          // Dados financeiros básicos
          totalAssets: etfData.aum || null,
          nav: etfData.nav || priceData?.close || null,
          currentPrice: priceData?.close || etfData.nav || null,
          
          // Performance
          returns_12m: metrics?.returns_12m || null,
          returns_24m: metrics?.returns_24m || null,
          returns_36m: metrics?.returns_36m || null,
          ten_year_return: metrics?.ten_year_return || null,
          
          // Risco
          volatility_12m: metrics?.volatility_12m || null,
          volatility_24m: metrics?.volatility_24m || null,
          volatility_36m: metrics?.volatility_36m || null,
          sharpe_12m: metrics?.sharpe_12m || null,
          sharpe_24m: metrics?.sharpe_24m || null,
          sharpe_36m: metrics?.sharpe_36m || null,
          max_drawdown: metrics?.max_drawdown || null,
          
          // Dividendos
          dividendYield: dividendYield,
          dividends_12m: totalDividends,
          lastDividendDate: dividends[0]?.ex_date || null,
          lastDividendAmount: dividends[0]?.amount || null,
          
          // Dados fundamentais
          expenseRatio: etfData.expense_ratio || null,
          averageVolume: etfData.volume || null,
          beta: metrics?.beta || null,
          
          // Classificação
          assetClass: etfData.assetclass || null,
          sector: etfData.sector || null,
          etfCompany: etfData.etfcompany || null,
          inceptionDate: etfData.inception_date || null,
          
          // Metadados
          data_source: 'supabase_real_data',
          last_updated: new Date().toISOString(),
          quality_score: metrics ? 95 : 75,
          has_metrics: !!metrics,
          has_price_data: !!priceData,
          has_dividend_data: dividends.length > 0
        };
      } else {
        notFoundSymbols.push(symbol);
      }
    });

    console.log(`✅ Dados reais carregados para ${foundSymbols.length}/${symbolsUpper.length} ETFs`);
    if (notFoundSymbols.length > 0) {
      console.log(`⚠️ ETFs não encontrados: ${notFoundSymbols.join(', ')}`);
    }

    const response = {
      data: result,
      metadata: {
        total_requested: symbolsUpper.length,
        found: foundSymbols.length,
        not_found: notFoundSymbols.length,
        found_symbols: foundSymbols,
        not_found_symbols: notFoundSymbols,
        data_source: 'supabase_real_data',
        timestamp: new Date().toISOString()
      }
    };

    console.log('🎉 Resposta montada com sucesso');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Erro na API YFinance bulk:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch bulk ETF data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 