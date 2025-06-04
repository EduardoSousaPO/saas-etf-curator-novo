import { NextRequest, NextResponse } from 'next/server';

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

    // Em produção, aqui usaria yfinance real via Python/API
    // Por agora, retorna dados simulados para manter compatibilidade
    const mockData = {
      symbol: symbol.toUpperCase(),
      shortName: `${symbol.toUpperCase()} ETF`,
      longName: `${symbol.toUpperCase()} Exchange Traded Fund`,
      totalAssets: Math.random() * 10000000000, // Random asset size
      dividendYield: Math.random() * 0.05, // Random dividend yield 0-5%
      returns_12m: (Math.random() - 0.5) * 40, // Random returns -20% to +20%
      volatility_12m: Math.random() * 30 + 5, // Random volatility 5-35%
      averageVolume: Math.floor(Math.random() * 1000000), // Random volume
      beta: Math.random() * 2, // Random beta 0-2
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('YFinance ETF API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ETF data' },
      { status: 500 }
    );
  }
} 