import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ETFEnhanced {
  id: string;
  symbol: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  exchange?: string | null;
  inception_date?: Date | null;
  total_assets?: number | null;
  volume?: number | null;
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  volatility_12m?: number | null;
  volatility_24m?: number | null;
  volatility_36m?: number | null;
  sharpe_12m?: number | null;
  sharpe_24m?: number | null;
  sharpe_36m?: number | null;
  dividend_yield?: number | null;
  max_drawdown?: number | null;
  updated_at: Date;
  // Dados enriquecidos
  fmp_data?: any;
}

// Função para extrair dados FMP da description
function extractFMPData(description: string | null): any {
  if (!description || !description.includes('FMP_DATA:')) {
    return null;
  }
  
  try {
    const fmpDataStart = description.indexOf('FMP_DATA:') + 9;
    const fmpDataJson = description.substring(fmpDataStart);
    return JSON.parse(fmpDataJson);
  } catch (error) {
    console.error('Erro ao extrair dados FMP:', error);
    return null;
  }
}

// Função para limpar description removendo dados FMP
function cleanDescription(description: string | null): string | null {
  if (!description) return null;
  return description.replace(/\[FMP_DATA\][\s\S]*?\[\/FMP_DATA\]/, '').trim() || null;
}

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros de query
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const symbol = searchParams.get('symbol');
    const category = searchParams.get('category');
    const minReturns = searchParams.get('min_returns') ? parseFloat(searchParams.get('min_returns') || '0') : null;
    const maxVolatility = searchParams.get('max_volatility') ? parseFloat(searchParams.get('max_volatility') || '1') : null;
    const minSharpe = searchParams.get('min_sharpe') ? parseFloat(searchParams.get('min_sharpe') || '0') : null;
    const minDividendYield = searchParams.get('min_dividend_yield') ? parseFloat(searchParams.get('min_dividend_yield') || '0') : null;

    // Construir condições de filtro para etf_list
    let etfListWhere: any = {};
    if (symbol) etfListWhere.symbol = symbol.toUpperCase();
    if (category) etfListWhere.category = { contains: category };
    // Buscar símbolos que batem com os filtros cadastrais
    const etfList = await prisma.etf_list.findMany({
      where: etfListWhere,
      select: { symbol: true }
    });
    const symbols = etfList.map(e => e.symbol);
    if (symbols.length === 0) {
      return NextResponse.json({ success: false, etfs: [], message: "ETF não encontrado." }, { status: 404 });
    }
    // Construir condições de filtro para calculated_metrics
    let metricsWhere: any = { symbol: { in: symbols } };
    if (minReturns !== null) metricsWhere.returns_12m = { gte: minReturns };
    if (maxVolatility !== null) metricsWhere.volatility_12m = { lte: maxVolatility };
    if (minSharpe !== null) metricsWhere.sharpe_12m = { gte: minSharpe };
    if (minDividendYield !== null) metricsWhere.dividends_12m = { gte: minDividendYield };
    // Buscar métricas filtradas
    const metrics = await prisma.calculated_metrics.findMany({
      where: metricsWhere,
      orderBy: { symbol: 'asc' },
      take: limit > 100 ? 100 : limit
    });
    const metricsSymbols = metrics.map(m => m.symbol);
    // Buscar dados cadastrais completos dos símbolos filtrados
    const etfListFull = await prisma.etf_list.findMany({
      where: { symbol: { in: metricsSymbols } }
    });
    // Merge dos dados
    const enhancedETFs: ETFEnhanced[] = metrics.map(m => {
      const etf = etfListFull.find(e => e.symbol === m.symbol);
      const fmpData = extractFMPData(etf?.description || null);
      return {
        ...etf,
        ...m,
        description: cleanDescription(etf?.description || null),
        fmp_data: fmpData,
      };
    });
    if (enhancedETFs.length === 0) {
      return NextResponse.json({ success: false, etfs: [], message: "ETF não encontrado." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      etfs: enhancedETFs,
      count: enhancedETFs.length,
      message: `${enhancedETFs.length} ETFs retornados com sucesso.`,
    });
  } catch (error) {
    console.error('Erro ao buscar ETFs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar ETFs',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// POST endpoint para forçar atualização de ETFs específicos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbols } = body;

    if (action === 'refresh' && symbols && Array.isArray(symbols)) {
      // Aqui integraria com o script de enriquecimento FMP
      // Por agora, apenas retorna status
      
      return NextResponse.json({
        success: true,
        message: `Refresh initiated for ${symbols.length} ETFs`,
        symbols,
        status: 'queued' // Em produção, usaria uma fila de jobs
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action or parameters'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in enhanced ETFs POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
} 