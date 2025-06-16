import { InvestorProfile } from '@/lib/onboarding/profiles';
import { ETF } from '@/types';

export interface ETFRecommendation {
  etf: ETF;
  score: number;
  reasons: string[];
  category: 'core' | 'growth' | 'defensive' | 'opportunistic';
  confidence: number;
}

export interface RecommendationRequest {
  profile: InvestorProfile;
  availableETFs: ETF[];
  currentHoldings?: ETF[];
  preferences?: {
    sectors?: string[];
    regions?: string[];
    maxExpenseRatio?: number;
    minAssets?: number;
  };
}

export interface RecommendationResponse {
  recommendations: ETFRecommendation[];
  summary: string;
  portfolioAllocation: {
    category: string;
    percentage: number;
    rationale: string;
  }[];
  warnings: string[];
  timestamp: Date;
}

// Cache para recomendações
const recommendationCache = new Map<string, RecommendationResponse>();

export async function generateETFRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const cacheKey = generateCacheKey(request);
  
  // Verificar cache primeiro
  if (recommendationCache.has(cacheKey)) {
    const cached = recommendationCache.get(cacheKey)!;
    // Usar cache por 1 hora
    if (Date.now() - cached.timestamp.getTime() < 3600000) {
      return cached;
    }
  }

  try {
    // Usar OpenAI para análise avançada
    const aiRecommendations = await generateAIRecommendations(request);
    
    // Cache do resultado
    recommendationCache.set(cacheKey, aiRecommendations);
    
    return aiRecommendations;
  } catch (error) {
    console.error('Erro ao gerar recomendações IA:', error);
    
    // Fallback para recomendações baseadas em regras
    return generateRuleBasedRecommendations(request);
  }
}

async function generateAIRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const { profile, availableETFs, currentHoldings, preferences } = request;

  // Preparar contexto para IA
  const context = {
    investorProfile: {
      type: profile.name,
      riskTolerance: profile.riskTolerance,
      characteristics: profile.characteristics,
      preferredCategories: profile.preferredCategories
    },
    currentPortfolio: currentHoldings?.map(etf => ({
      symbol: etf.symbol,
      name: etf.name,
      sector: etf.sector,
      returns12m: etf.returns_12m,
      expenseRatio: etf.expense_ratio,
      totalAssets: etf.total_assets
    })) || [],
    preferences: preferences || {},
    marketContext: {
      date: new Date().toISOString(),
      availableETFsCount: availableETFs.length
    }
  };

  const prompt = `
Como especialista em ETFs, analise o perfil do investidor e recomende uma carteira otimizada.

PERFIL DO INVESTIDOR:
- Tipo: ${context.investorProfile.type}
- Tolerância ao Risco: ${context.investorProfile.riskTolerance}
- Características: ${context.investorProfile.characteristics.join(', ')}
- Categorias Preferidas: ${context.investorProfile.preferredCategories.join(', ')}

CARTEIRA ATUAL:
${context.currentPortfolio.length > 0 ? 
  context.currentPortfolio.map(etf => `- ${etf.symbol}: ${etf.name} (Retorno 12m: ${etf.returns12m}%)`).join('\n') :
  'Nenhum ETF na carteira atual'
}

CRITÉRIOS DE ANÁLISE:
1. Diversificação adequada ao perfil
2. Balanceamento risco/retorno
3. Eficiência de custos (expense ratio)
4. Liquidez (total assets)
5. Performance histórica consistente

Forneça sua análise no seguinte formato JSON:
{
  "summary": "Resumo da estratégia recomendada",
  "portfolioAllocation": [
    {
      "category": "Core Holdings",
      "percentage": 60,
      "rationale": "Explicação da alocação"
    }
  ],
  "topRecommendations": [
    {
      "symbol": "VTI",
      "reasons": ["Razão 1", "Razão 2"],
      "category": "core",
      "confidence": 0.9
    }
  ],
  "warnings": ["Aviso importante se houver"]
}
  `;

  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        context: 'etf_recommendations',
        model: 'gpt-4'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    return processAIResponse(aiResponse, availableETFs, request);
  } catch (error) {
    console.error('Erro na chamada OpenAI:', error);
    throw error;
  }
}

function processAIResponse(
  aiResponse: any, 
  availableETFs: ETF[], 
  request: RecommendationRequest
): RecommendationResponse {
  const recommendations: ETFRecommendation[] = [];
  
  // Processar recomendações da IA
  if (aiResponse.topRecommendations) {
    aiResponse.topRecommendations.forEach((rec: any) => {
      const etf = availableETFs.find(e => e.symbol === rec.symbol);
      if (etf) {
        recommendations.push({
          etf,
          score: calculateETFScore(etf, request.profile),
          reasons: rec.reasons || [],
          category: rec.category || 'core',
          confidence: rec.confidence || 0.8
        });
      }
    });
  }

  // Se não tiver recomendações suficientes, complementar com análise baseada em regras
  if (recommendations.length < 5) {
    const ruleBasedRecs = generateRuleBasedRecommendations(request);
    const additionalRecs = ruleBasedRecs.recommendations
      .filter(rec => !recommendations.some(r => r.etf.symbol === rec.etf.symbol))
      .slice(0, 5 - recommendations.length);
    
    recommendations.push(...additionalRecs);
  }

  return {
    recommendations: recommendations.sort((a, b) => b.score - a.score),
    summary: aiResponse.summary || 'Recomendações baseadas no seu perfil de investidor',
    portfolioAllocation: aiResponse.portfolioAllocation || [],
    warnings: aiResponse.warnings || [],
    timestamp: new Date()
  };
}

function generateRuleBasedRecommendations(
  request: RecommendationRequest
): RecommendationResponse {
  const { profile, availableETFs, preferences } = request;
  const recommendations: ETFRecommendation[] = [];

  // Filtrar ETFs baseado no perfil e preferências
  let filteredETFs = availableETFs.filter(etf => {
    // Filtros básicos de qualidade
    if (!etf.total_assets || etf.total_assets < 100000000) return false; // Min $100M assets
    if (!etf.expense_ratio || etf.expense_ratio > 1.0) return false; // Max 1% expense ratio
    
    // Filtros de preferência
    if (preferences?.maxExpenseRatio && etf.expense_ratio > preferences.maxExpenseRatio) return false;
    if (preferences?.minAssets && etf.total_assets < preferences.minAssets) return false;
    
    return true;
  });

  // Categorizar ETFs por perfil
  const etfsByCategory = categorizeETFsByProfile(filteredETFs, profile);

  // Selecionar top ETFs por categoria
  Object.entries(etfsByCategory).forEach(([category, etfs]) => {
    const categoryRecs = etfs
      .map(etf => ({
        etf,
        score: calculateETFScore(etf, profile),
        reasons: generateRecommendationReasons(etf, profile, category),
        category: category as any,
        confidence: 0.7
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, category === 'core' ? 3 : 2);

    recommendations.push(...categoryRecs);
  });

  // Gerar alocação de portfólio baseada no perfil
  const portfolioAllocation = generatePortfolioAllocation(profile);

  return {
    recommendations: recommendations.slice(0, 8),
    summary: `Recomendações baseadas no perfil ${profile.name}`,
    portfolioAllocation,
    warnings: generateWarnings(profile, recommendations),
    timestamp: new Date()
  };
}

function categorizeETFsByProfile(etfs: ETF[], _profile: InvestorProfile) {
  const categories: Record<string, ETF[]> = {
    core: [],
    growth: [],
    defensive: [],
    opportunistic: []
  };

  etfs.forEach(etf => {
    // Lógica de categorização baseada no setor e características
    if (isCoreholding(etf)) {
      categories.core.push(etf);
    } else if (isGrowthETF(etf)) {
      categories.growth.push(etf);
    } else if (isDefensiveETF(etf)) {
      categories.defensive.push(etf);
    } else {
      categories.opportunistic.push(etf);
    }
  });

  return categories;
}

function isCoreholding(etf: ETF): boolean {  const coreKeywords = ['total', 'market', 'broad', 's&p', 'russell', 'msci world'];  const name = etf.name?.toLowerCase() || '';  return coreKeywords.some(keyword => name.includes(keyword));}function isGrowthETF(etf: ETF): boolean {  const growthKeywords = ['growth', 'technology', 'innovation', 'emerging'];  const name = etf.name?.toLowerCase() || '';  return growthKeywords.some(keyword => name.includes(keyword));}function isDefensiveETF(etf: ETF): boolean {  const defensiveKeywords = ['dividend', 'utilities', 'consumer', 'bond', 'value'];  const name = etf.name?.toLowerCase() || '';  return defensiveKeywords.some(keyword => name.includes(keyword));}

function calculateETFScore(etf: ETF, profile: InvestorProfile): number {
  let score = 50; // Score base

  // Score baseado na performance
  if (etf.returns_12m) {
    score += Math.min(etf.returns_12m / 2, 25); // Max 25 pontos para retorno
  }

  // Score baseado no Sharpe ratio
  if (etf.sharpe_12m) {
    score += Math.min(etf.sharpe_12m * 10, 15); // Max 15 pontos para Sharpe
  }

  // Score baseado no tamanho (liquidez)
  if (etf.total_assets) {
    const assetsScore = Math.log10(etf.total_assets / 1000000) * 2;
    score += Math.min(assetsScore, 10); // Max 10 pontos para tamanho
  }

  // Penalidade por expense ratio alto
  if (etf.expense_ratio) {
    score -= etf.expense_ratio * 20; // Penalidade por taxa alta
  }

  // Ajustes baseados no perfil
  if (profile.riskTolerance === 'conservative') {
    // Bonus para baixa volatilidade e dividendos
    if (etf.volatility_12m && etf.volatility_12m < 15) score += 10;
    if (etf.dividend_yield && etf.dividend_yield > 2) score += 5;
  } else if (profile.riskTolerance === 'aggressive') {
    // Bonus para alta performance e crescimento
    if (etf.returns_12m && etf.returns_12m > 20) score += 10;
    if (isGrowthETF(etf)) score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function generateRecommendationReasons(etf: ETF, profile: InvestorProfile, _category: string): string[] {
  const reasons: string[] = [];

  // Razões baseadas na performance
  if (etf.returns_12m && etf.returns_12m > 15) {
    reasons.push(`Excelente performance: ${etf.returns_12m.toFixed(1)}% nos últimos 12 meses`);
  }

  if (etf.sharpe_12m && etf.sharpe_12m > 1) {
    reasons.push(`Boa relação risco-retorno (Sharpe: ${etf.sharpe_12m.toFixed(2)})`);
  }

  // Razões baseadas em custos
  if (etf.expense_ratio && etf.expense_ratio < 0.2) {
    reasons.push(`Baixo custo (Taxa: ${(etf.expense_ratio * 100).toFixed(2)}%)`);
  }

  // Razões baseadas no tamanho
  if (etf.total_assets && etf.total_assets > 1000000000) {
    reasons.push('Alta liquidez e estabilidade');
  }

  // Razões específicas do perfil
  if (profile.riskTolerance === 'conservative') {
    if (etf.dividend_yield && etf.dividend_yield > 2) {
      reasons.push(`Bom rendimento de dividendos: ${etf.dividend_yield.toFixed(1)}%`);
    }
    if (etf.volatility_12m && etf.volatility_12m < 15) {
      reasons.push('Baixa volatilidade');
    }
  }

  return reasons.slice(0, 3); // Máximo 3 razões
}

function generatePortfolioAllocation(profile: InvestorProfile) {
  const allocations = {
    conservative: [
      { category: 'Core Holdings (Broad Market)', percentage: 50, rationale: 'Base estável da carteira' },
      { category: 'Bonds/Fixed Income', percentage: 30, rationale: 'Proteção e renda estável' },
      { category: 'Dividend ETFs', percentage: 15, rationale: 'Geração de renda passiva' },
      { category: 'International Diversification', percentage: 5, rationale: 'Diversificação geográfica' }
    ],
    moderate: [
      { category: 'Core Holdings (Broad Market)', percentage: 40, rationale: 'Fundação sólida da carteira' },
      { category: 'Growth ETFs', percentage: 25, rationale: 'Potencial de crescimento' },
      { category: 'International/Emerging Markets', percentage: 20, rationale: 'Diversificação global' },
      { category: 'Sector Specific', percentage: 15, rationale: 'Oportunidades setoriais' }
    ],
    aggressive: [
      { category: 'Growth ETFs', percentage: 40, rationale: 'Máximo potencial de crescimento' },
      { category: 'Core Holdings', percentage: 30, rationale: 'Estabilidade base' },
      { category: 'Emerging Markets', percentage: 20, rationale: 'Alta exposição ao crescimento' },
      { category: 'Sector Rotation/Momentum', percentage: 10, rationale: 'Captura de tendências' }
    ]
  };

  return allocations[profile.riskTolerance] || allocations.moderate;
}

function generateWarnings(profile: InvestorProfile, recommendations: ETFRecommendation[]): string[] {
  const warnings: string[] = [];

  // Verificar concentração excessiva
  const sectors = recommendations.map(r => r.etf.sector).filter(s => s);
  const sectorCounts = sectors.reduce((acc, sector) => {
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

    Object.entries(sectorCounts).forEach(([sector, count]) => {    if ((count as number) > 3) {      warnings.push(`Alta concentração no setor ${sector} - considere diversificar`);    }  });

  // Verificar se expense ratios são altos
  const highExpenseETFs = recommendations.filter(r => r.etf.expense_ratio && r.etf.expense_ratio > 0.5);
  if (highExpenseETFs.length > 2) {
    warnings.push('Algumas recomendações têm taxas altas - revise os custos totais');
  }

  return warnings;
}

function generateCacheKey(request: RecommendationRequest): string {
  return `${request.profile.id}_${request.availableETFs.length}_${JSON.stringify(request.preferences)}`;
} 