/**
 * API para Criação de Carteira Otimizada via Chat
 * Endpoint: POST /api/portfolio/create-optimized
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🎯 Criando carteira otimizada via chat:', body);
    
    const { goal, riskProfile, amount, currency, timeHorizon } = body;
    
    // Mapear para o formato da API unificada
    const unifiedRequest = {
      objective: mapGoalToObjective(goal),
      riskProfile: mapRiskProfile(riskProfile),
      investmentAmount: amount,
      monthlyAmount: 0,
      timeHorizon: timeHorizon || 12,
      currency: currency || 'USD',
      assetTypes: ['etf'] // Focar em ETFs para o chat
    };
    
    // Chamar a API unificada existente
    const unifiedResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/portfolio/unified-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unifiedRequest)
    });
    
    if (!unifiedResponse.ok) {
      throw new Error(`Erro na API unificada: ${unifiedResponse.status}`);
    }
    
    const unifiedData = await unifiedResponse.json();
    
    // Formatar resposta para o chat
    const chatResponse = {
      success: true,
      portfolio: unifiedData.data?.portfolio || [],
      metrics: unifiedData.data?.metrics || {},
      projections: unifiedData.data?.projections || {},
      backtesting: unifiedData.data?.backtesting || {},
      expectedReturn: unifiedData.data?.metrics?.expected_return || 8.5,
      volatility: unifiedData.data?.metrics?.expected_volatility || 12.5,
      etfs: unifiedData.data?.portfolio?.map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.name,
        allocation: asset.allocation,
        type: asset.type
      })) || []
    };
    
    console.log('✅ Carteira otimizada criada via chat');
    
    return NextResponse.json(chatResponse);
    
  } catch (error) {
    console.error('❌ Erro ao criar carteira otimizada via chat:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Mapeia objetivo do chat para objetivo da API
 */
function mapGoalToObjective(goal: string): string {
  const goalMap: Record<string, string> = {
    'aposentadoria': 'retirement',
    'retirement': 'retirement',
    'casa': 'house',
    'house': 'house',
    'emergência': 'emergency',
    'emergency': 'emergency',
    'crescimento': 'growth',
    'growth': 'growth',
    'renda': 'income',
    'income': 'income'
  };
  
  const normalizedGoal = goal.toLowerCase();
  return goalMap[normalizedGoal] || 'growth';
}

/**
 * Mapeia perfil de risco do chat para perfil da API
 */
function mapRiskProfile(riskProfile: string): string {
  const riskMap: Record<string, string> = {
    'conservador': 'conservative',
    'conservative': 'conservative',
    'moderado': 'moderate',
    'moderate': 'moderate',
    'arrojado': 'aggressive',
    'aggressive': 'aggressive',
    'agressivo': 'aggressive'
  };
  
  const normalizedRisk = riskProfile.toLowerCase();
  return riskMap[normalizedRisk] || 'moderate';
}
