import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API de teste simples funcionando...');
    
    return NextResponse.json({
      success: true,
      message: 'API de teste funcionando corretamente',
      timestamp: new Date().toISOString(),
      server_status: 'OK'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de teste:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro na API de teste',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📊 Dados recebidos:', body);
    
    // Simular uma recomendação muito simples
    const { investmentAmount = 10000, riskOverride = 5 } = body;
    
    const strategies = {
      conservative: {
        etfs: [
          { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', allocation: 60, amount: investmentAmount * 0.6 },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 40, amount: investmentAmount * 0.4 }
        ],
        expectedReturn: 6.5,
        volatility: 8.2,
        strategy: 'Conservadora'
      },
      moderate: {
        etfs: [
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 50, amount: investmentAmount * 0.5 },
          { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', allocation: 30, amount: investmentAmount * 0.3 },
          { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', allocation: 20, amount: investmentAmount * 0.2 }
        ],
        expectedReturn: 8.7,
        volatility: 12.1,
        strategy: 'Moderada'
      },
      aggressive: {
        etfs: [
          { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', allocation: 40, amount: investmentAmount * 0.4 },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 35, amount: investmentAmount * 0.35 },
          { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', allocation: 25, amount: investmentAmount * 0.25 }
        ],
        expectedReturn: 12.3,
        volatility: 18.5,
        strategy: 'Agressiva'
      }
    };
    
    let selectedStrategy;
    if (riskOverride <= 3) {
      selectedStrategy = strategies.conservative;
    } else if (riskOverride <= 7) {
      selectedStrategy = strategies.moderate;
    } else {
      selectedStrategy = strategies.aggressive;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        investment_amount: investmentAmount,
        risk_level: riskOverride,
        portfolio: selectedStrategy,
        total_allocation: selectedStrategy.etfs.reduce((sum, etf) => sum + etf.allocation, 0),
        generation_method: 'Simulação simples para teste'
      },
      message: 'Recomendação de teste gerada com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API POST de teste:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro no processamento',
      message: error.message
    }, { status: 500 });
  }
} 