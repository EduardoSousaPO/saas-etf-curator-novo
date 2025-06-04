import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simples health check - em produção, testaria uma chamada real
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'yfinance-api'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'yfinance service unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
} 