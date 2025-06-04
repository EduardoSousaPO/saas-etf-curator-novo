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

    // Construir condições de filtro
    let whereCondition: any = {};
    
    if (symbol) {
      whereCondition.symbol = symbol.toUpperCase();
    }
    
    if (category) {
      whereCondition.category = {
        contains: category,
      };
    }
    
    if (minReturns !== null) {
      whereCondition.returns_12m = {
        gte: minReturns,
      };
    }
    
    if (maxVolatility !== null) {
      whereCondition.volatility_12m = {
        lte: maxVolatility,
      };
    }
    
    if (minSharpe !== null) {
      whereCondition.sharpe_12m = {
        gte: minSharpe,
      };
    }
    
    if (minDividendYield !== null) {
      whereCondition.dividend_yield = {
        gte: minDividendYield,
      };
    }

    // Buscar ETFs no banco de dados
    const etfs = await prisma.etfs.findMany({
      where: whereCondition,
      orderBy: {
        updated_at: 'desc',
      },
      take: limit > 100 ? 100 : limit, // Limitar a 100 resultados
    });
    
    // Transformar os resultados
    const enhancedETFs: ETFEnhanced[] = etfs.map((etf) => {
      // Extrair dados FMP da description
      const fmpData = extractFMPData(etf.description);
      
      // Converter para os tipos corretos
      return {
        id: etf.id,
        symbol: etf.symbol,
        name: etf.name,
        description: etf.description ? (etf.description.includes('FMP_DATA:') 
          ? etf.description.substring(0, etf.description.indexOf('FMP_DATA:'))
          : etf.description) : null,
        category: etf.category,
        exchange: etf.exchange,
        inception_date: etf.inception_date,
        total_assets: etf.total_assets ? Number(etf.total_assets) : null,
        volume: etf.volume ? Number(etf.volume) : null,
        returns_12m: etf.returns_12m ? Number(etf.returns_12m) : null,
        returns_24m: etf.returns_24m ? Number(etf.returns_24m) : null,
        returns_36m: etf.returns_36m ? Number(etf.returns_36m) : null,
        volatility_12m: etf.volatility_12m ? Number(etf.volatility_12m) : null,
        volatility_24m: etf.volatility_24m ? Number(etf.volatility_24m) : null,
        volatility_36m: etf.volatility_36m ? Number(etf.volatility_36m) : null,
        sharpe_12m: etf.sharpe_12m ? Number(etf.sharpe_12m) : null,
        sharpe_24m: etf.sharpe_24m ? Number(etf.sharpe_24m) : null,
        sharpe_36m: etf.sharpe_36m ? Number(etf.sharpe_36m) : null,
        dividend_yield: etf.dividend_yield ? Number(etf.dividend_yield) : null,
        max_drawdown: etf.max_drawdown ? Number(etf.max_drawdown) : null,
        updated_at: etf.updated_at,
        fmp_data: fmpData,
      };
    });

    if (enhancedETFs.length === 0) {
      return NextResponse.json({
        success: false,
        etfs: [],
        message: "ETF não encontrado."
      }, { status: 404 });
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