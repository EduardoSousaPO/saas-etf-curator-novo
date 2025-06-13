import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const symbolUpper = symbol.toUpperCase();
    console.log(`🔍 Buscando dados reais para ETF: ${symbolUpper}`);

    // Buscar dados básicos do ETF
    const { data: etfData, error: etfError } = await supabase
      .from('etf_list')
      .select('*')
      .eq('symbol', symbolUpper)
      .single();

    if (etfError || !etfData) {
      console.log(`❌ ETF ${symbolUpper} não encontrado no banco`);
      return NextResponse.json(
        { error: `ETF ${symbolUpper} not found` },
        { status: 404 }
      );
    }

    // Buscar métricas calculadas
    const { data: metricsData } = await supabase
      .from('calculated_metrics')
      .select('*')
      .eq('symbol', symbolUpper)
      .single();

    // Buscar preço mais recente
    const { data: priceData } = await supabase
      .from('etf_prices')
      .select('*')
      .eq('symbol', symbolUpper)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // Buscar dividendos do último ano
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { data: dividendsData } = await supabase
      .from('etf_dividends')
      .select('*')
      .eq('symbol', symbolUpper)
      .gte('ex_date', oneYearAgo.toISOString().split('T')[0])
      .order('ex_date', { ascending: false });

    // Calcular dividend yield anual
    const totalDividends = dividendsData?.reduce((sum, div) => sum + (div.amount || 0), 0) || 0;
    const currentPrice = priceData?.close || etfData.nav || 100;
    const dividendYield = currentPrice > 0 ? (totalDividends / currentPrice) * 100 : 0;

    // Montar resposta com dados reais
    const response = {
      symbol: symbolUpper,
      shortName: etfData.name || `${symbolUpper} ETF`,
      longName: etfData.description || etfData.name || `${symbolUpper} Exchange Traded Fund`,
      
      // Dados financeiros básicos
      totalAssets: etfData.aum || null,
      nav: etfData.nav || priceData?.close || null,
      currentPrice: priceData?.close || etfData.nav || null,
      
      // Performance
      returns_12m: metricsData?.returns_12m || null,
      returns_24m: metricsData?.returns_24m || null,
      returns_36m: metricsData?.returns_36m || null,
      ten_year_return: metricsData?.ten_year_return || null,
      
      // Risco
      volatility_12m: metricsData?.volatility_12m || null,
      volatility_24m: metricsData?.volatility_24m || null,
      volatility_36m: metricsData?.volatility_36m || null,
      sharpe_12m: metricsData?.sharpe_12m || null,
      sharpe_24m: metricsData?.sharpe_24m || null,
      sharpe_36m: metricsData?.sharpe_36m || null,
      max_drawdown: metricsData?.max_drawdown || null,
      
      // Dividendos
      dividendYield: dividendYield,
      dividends_12m: totalDividends,
      lastDividendDate: dividendsData?.[0]?.ex_date || null,
      lastDividendAmount: dividendsData?.[0]?.amount || null,
      
      // Dados fundamentais
      expenseRatio: etfData.expense_ratio || null,
      averageVolume: etfData.volume || null,
      beta: metricsData?.beta || null,
      
      // Classificação
      assetClass: etfData.assetclass || null,
      sector: etfData.sector || null,
      etfCompany: etfData.etfcompany || null,
      inceptionDate: etfData.inception_date || null,
      
      // Metadados
      data_source: 'supabase_real_data',
      last_updated: new Date().toISOString(),
      quality_score: metricsData ? 95 : 75,
      has_metrics: !!metricsData,
      has_price_data: !!priceData,
      has_dividend_data: (dividendsData?.length || 0) > 0
    };

    console.log(`✅ Dados reais carregados para ${symbolUpper} (qualidade: ${response.quality_score})`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erro na API YFinance ETF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch ETF data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 