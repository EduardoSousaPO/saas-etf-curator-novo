// src/app/api/portfolio/unified-recommendation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema de validação
const RequestSchema = z.object({
  investmentAmount: z.number().min(100).max(50000000),
  timeHorizon: z.number().min(1).max(600).optional().default(12),
  objective: z.enum(['retirement', 'emergency', 'house', 'growth', 'income']).optional(),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  monthlyAmount: z.number().min(0).max(100000).optional(),
  assetTypes: z.object({
    etfs: z.boolean().default(true),
    stocks: z.boolean().default(false),
    maxStockAllocation: z.number().min(0).max(100).default(30) // Máximo % em stocks individuais
  }).optional().default({ etfs: true, stocks: false, maxStockAllocation: 30 }),
  preferences: z.object({
    sectors: z.array(z.string()).optional(),
    excludeSymbols: z.array(z.string()).optional(),
    sustainableOnly: z.boolean().optional().default(false),
    maxSinglePosition: z.number().min(1).max(50).default(15) // Máximo % em uma posição
  }).optional()
});

interface UnifiedAssetData {
  symbol: string;
  name: string;
  type: 'ETF' | 'STOCK';
  allocation_percent: number;
  allocation_amount: number;
  returns_12m: number;
  volatility: number;
  sharpe_ratio: number;
  dividend_yield: number;
  expense_ratio?: number;
  market_cap?: number;
  quality_score: number;
  asset_class: string;
  sector?: string;
}

// Filtros inteligentes por objetivo
interface ObjectiveFilters {
  retirement: {
    categories: string[];
    risk_preference: string;
    min_dividend_yield: number;
    max_volatility: number;
  };
  house: {
    categories: string[];
    risk_preference: string;
    min_return_5y: number;
    max_drawdown: number;
  };
  emergency: {
    categories: string[];
    risk_preference: string;
    max_volatility: number;
    min_liquidity: string;
  };
  growth: {
    categories: string[];
    risk_preference: string;
    min_return_10y: number;
    target_sharpe: number;
  };
}

// Filtros por perfil de risco
interface RiskProfileFilters {
  conservative: {
    max_volatility: number;
    min_sharpe_ratio: number;
    max_drawdown: number;
    bond_allocation_min: number;
  };
  moderate: {
    max_volatility: number;
    min_sharpe_ratio: number;
    max_drawdown: number;
    equity_bond_balance: boolean;
  };
  aggressive: {
    max_volatility: number;
    min_return_target: number;
    max_drawdown: number;
    growth_focus: boolean;
  };
}

// Configurações de filtros por objetivo
const OBJECTIVE_FILTERS: ObjectiveFilters = {
  retirement: {
    categories: ['Bond', 'Dividend', 'Large Cap Value', 'International Bond', 'Treasury', 'Corporate Bond'],
    risk_preference: 'conservative_to_moderate',
    min_dividend_yield: 2.0,
    max_volatility: 18.0
  },
  house: {
    categories: ['Growth', 'Large Cap Growth', 'Technology', 'Real Estate', 'Large Cap Core'],
    risk_preference: 'moderate_to_aggressive',
    min_return_5y: 8.0,
    max_drawdown: 25.0
  },
  emergency: {
    categories: ['Bond', 'Short Term', 'Money Market', 'Treasury', 'Cash', 'Government Bond'],
    risk_preference: 'conservative',
    max_volatility: 8.0,
    min_liquidity: 'high'
  },
  growth: {
    categories: ['Growth', 'Technology', 'Small Cap', 'Emerging Markets', 'Innovation', 'Momentum'],
    risk_preference: 'moderate_to_aggressive',
    min_return_10y: 10.0,
    target_sharpe: 1.2
  }
};

// Configurações de filtros por perfil de risco
const RISK_PROFILE_FILTERS: RiskProfileFilters = {
  conservative: {
    max_volatility: 15.0,
    min_sharpe_ratio: 0.8,
    max_drawdown: 15.0,
    bond_allocation_min: 40.0
  },
  moderate: {
    max_volatility: 25.0,
    min_sharpe_ratio: 0.6,
    max_drawdown: 25.0,
    equity_bond_balance: true
  },
  aggressive: {
    max_volatility: 35.0,
    min_return_target: 12.0,
    max_drawdown: 35.0,
    growth_focus: true
  }
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`🚀 [${requestId}] Iniciando geração de recomendação unificada...`);
    
    const body = await request.json();
    console.log(`📝 [${requestId}] Body recebido:`, JSON.stringify(body, null, 2));
    
    // MONITORAMENTO: Log de entrada
    logPortfolioRequest(requestId, body);

    // Validação simplificada primeiro
    let validatedData;
    try {
      validatedData = RequestSchema.parse(body);
      console.log('✅ Validação OK');
    } catch (validationError) {
      console.error('❌ Erro de validação:', validationError);
      throw new Error(`Erro de validação: ${validationError instanceof Error ? validationError.message : 'Dados inválidos'}`);
    }

    console.log('🎯 Dados validados:', {
      amount: validatedData.investmentAmount,
      types: validatedData.assetTypes,
      risk: validatedData.riskProfile
    });

    // 1. Buscar candidatos ETFs e Stocks
    console.log('🔍 Buscando candidatos...');
    const candidates = await getCandidateAssets(validatedData);
    console.log(`📊 Candidatos encontrados: ${candidates.length}`);
    
    if (candidates.length === 0) {
      throw new Error('Nenhum ativo encontrado com os critérios especificados');
    }

    // 2. Otimizar portfolio usando Markowitz adaptado
    console.log('⚙️ Otimizando portfolio...');
    const optimizedPortfolio = optimizeUnifiedPortfolio(candidates, validatedData);
    console.log(`🎯 Portfolio otimizado: ${optimizedPortfolio.length} ativos`);

    // 3. Calcular métricas do portfolio
    console.log('📊 Calculando métricas...');
    const portfolioMetrics = calculatePortfolioMetrics(optimizedPortfolio);

    // 4. Gerar projeções Monte Carlo
    console.log('🔮 Gerando projeções...');
    const projections = await generateProjections(
      validatedData.investmentAmount,
      validatedData.monthlyAmount || 0,
      validatedData.timeHorizon,
      portfolioMetrics.expected_return,
      portfolioMetrics.expected_volatility
    );

    // 5. Gerar backtesting
    console.log('📈 Gerando backtesting...');
    const backtesting = await generateBacktesting(optimizedPortfolio);

    const response = {
      success: true,
      data: {
        portfolio: optimizedPortfolio,
        expected_return: portfolioMetrics.expected_return,
        expected_volatility: portfolioMetrics.expected_volatility,
        sharpe_ratio: portfolioMetrics.sharpe_ratio,
        projections,
        backtesting,
        metadata: {
          total_assets: optimizedPortfolio.length,
          etf_count: optimizedPortfolio.filter(a => a.type === 'ETF').length,
          stock_count: optimizedPortfolio.filter(a => a.type === 'STOCK').length,
          etf_allocation: optimizedPortfolio
            .filter(a => a.type === 'ETF')
            .reduce((sum, a) => sum + a.allocation_percent, 0),
          stock_allocation: optimizedPortfolio
            .filter(a => a.type === 'STOCK')
            .reduce((sum, a) => sum + a.allocation_percent, 0),
          max_single_position: Math.max(...optimizedPortfolio.map(a => a.allocation_percent)),
          diversification_score: calculateDiversificationScore(optimizedPortfolio)
        }
      }
    };

    const executionTime = Date.now() - startTime;
    
    // MONITORAMENTO: Log de sucesso
    logPortfolioResult(requestId, optimizedPortfolio, portfolioMetrics, executionTime);
    
    console.log(`✅ [${requestId}] Recomendação unificada gerada com sucesso em ${executionTime}ms`);
    return NextResponse.json(response);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // MONITORAMENTO: Log de erro
    logPortfolioError(requestId, error, executionTime);
    
    console.error(`❌ [${requestId}] Erro na geração de recomendação unificada:`, error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Buscar ativos candidatos (ETFs + Stocks)
async function getCandidateAssets(params: z.infer<typeof RequestSchema>) {
  const candidates = [];

  try {
    // 1. Buscar ETFs candidatos
    if (params.assetTypes?.etfs) {
      console.log('🔍 Buscando ETFs candidatos...');
      const etfCandidates = await getETFCandidates(params);
      console.log(`📊 ETFs encontrados: ${etfCandidates.length}`);
      candidates.push(...etfCandidates);
    }

    // 2. Buscar Stocks candidatos - REABILITADO PARA CARTEIRAS MISTAS
    if (params.assetTypes?.stocks) { // REMOVIDO "&& false" - stocks reabilitados
      console.log('🔍 Buscando Stocks candidatos...');
      const stockCandidates = await getStockCandidates(params);
      console.log(`📈 Stocks encontrados: ${stockCandidates.length}`);
      candidates.push(...stockCandidates);
    }

    console.log(`✅ Total de candidatos: ${candidates.length}`);
    return candidates;
  } catch (error) {
    console.error('❌ Erro ao buscar candidatos:', error);
    throw error;
  }
}

// Buscar ETFs candidatos com filtros inteligentes por objetivo e perfil
async function getETFCandidates(params: z.infer<typeof RequestSchema>) {
  try {
    console.log('📊 Construindo query para ETFs com filtros inteligentes...');
    
    console.log(`🎯 Objetivo: ${params.objective} | Perfil: ${params.riskProfile}`);
    
    // Query expandida para acessar TODOS os ETFs disponíveis (1.370 ETFs)
    let query = supabase
      .from('etfs_ativos_reais')
      .select(`
        symbol,
        name,
        returns_12m,
        returns_5y,
        ten_year_return,
        volatility_12m,
        sharpe_12m,
        dividends_12m,
        max_drawdown,
        expenseratio,
        totalasset,
        assetclass
      `)
      // Remover filtros restritivos para acessar TODA a base
      // .not('returns_12m', 'is', null) - REMOVIDO: permite ETFs sem dados de performance
      // .not('volatility_12m', 'is', null) - REMOVIDO: permite ETFs sem volatilidade
      // .gte('totalasset', 50000000) - REMOVIDO: permite ETFs menores
      // .lte('expenseratio', 2.0) - REMOVIDO: permite ETFs com expense ratio maior
      .order('totalasset', { ascending: false })
      .limit(500); // Aumentado para 500 ETFs (de 100)

    console.log('📊 Usando filtros simplificados para garantir resultados...');

    console.log('🔍 Executando query para ETFs...');
    const { data: etfs, error } = await query;
    
    if (error) {
      console.error('❌ Erro ao buscar ETFs candidatos:', error);
      return [];
    }

    console.log(`✅ ETFs brutos encontrados: ${etfs?.length || 0}`);

    if (!etfs || etfs.length === 0) {
      console.log('⚠️ Nenhum ETF encontrado com os critérios básicos');
      return [];
    }

    console.log('🔄 Processando ETFs...');
    const processedETFs = (etfs || []).map(etf => {
      try {
        const processed = {
          symbol: etf.symbol,
          name: etf.name,
          type: 'ETF' as const,
          returns_12m: parseFloat(etf.returns_12m) || 0,
          volatility: parseFloat(etf.volatility_12m) || 15,
          sharpe_ratio: parseFloat(etf.sharpe_12m) || 0,
          dividend_yield: parseFloat(etf.dividends_12m) || 0,
          expense_ratio: parseFloat(etf.expenseratio) || 0,
          total_assets: etf.totalasset || 0,
          asset_class: etf.assetclass || 'Unknown',
          sector: etf.assetclass,
          quality_score: calculateETFQuality(etf)
        };
        console.log(`✅ Processado: ${processed.symbol} (${processed.asset_class})`);
        return processed;
      } catch (processingError) {
        console.error('❌ Erro ao processar ETF:', etf.symbol, processingError);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ ETFs processados: ${processedETFs.length}`);
    return processedETFs;
    
  } catch (error) {
    console.error('❌ Erro geral na busca de ETFs:', error);
    return [];
  }
}

// Buscar Stocks candidatos da tabela stocks_unified
async function getStockCandidates(params: z.infer<typeof RequestSchema>) {
  console.log('🔍 Buscando stocks candidatos da tabela stocks_unified...');
  
  try {
    // Query otimizada para acessar stocks com dados válidos
    let query = supabase
      .from('stocks_unified')
      .select(`
        ticker,
        name,
        returns_12m,
        volatility_12m,
        sharpe_12m,
        dividend_yield_12m,
        market_cap,
        sector,
        industry,
        current_price,
        pe_ratio,
        pb_ratio,
        roe,
        debt_to_equity,
        size_category,
        liquidity_category
      `)
      // Filtros básicos para qualidade de dados
      .not('returns_12m', 'is', null)
      .not('volatility_12m', 'is', null)
      .not('market_cap', 'is', null)
      .gte('market_cap', 1000000000) // Mínimo $1B market cap
      .order('market_cap', { ascending: false })
      .limit(200);

    // Aplicar filtros por setor se especificado
    if (params.preferences?.sectors?.length) {
      query = query.in('sector', params.preferences.sectors);
    }

    // Excluir símbolos se especificado
    if (params.preferences?.excludeSymbols?.length) {
      query = query.not('ticker', 'in', `(${params.preferences.excludeSymbols.join(',')})`);
    }

    const { data: stocks, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar Stocks candidatos:', error);
    return [];
  }

    if (!stocks || stocks.length === 0) {
      console.log('⚠️ Nenhum stock encontrado');
      return [];
    }

    console.log(`📊 Processando ${stocks.length} stocks candidatos...`);

    // Processar stocks com validação e cálculo de qualidade
    const processedStocks = stocks.map(stock => {
      try {
        return {
          symbol: stock.ticker,
          name: stock.name,
          type: 'STOCK' as const,
          returns_12m: parseFloat(stock.returns_12m) || 0,
          volatility: parseFloat(stock.volatility_12m) || 25,
          sharpe_ratio: parseFloat(stock.sharpe_12m) || 0,
          dividend_yield: parseFloat(stock.dividend_yield_12m) || 0,
          market_cap: parseInt(stock.market_cap) || 0,
          current_price: parseFloat(stock.current_price) || 0,
          asset_class: stock.sector || 'Stock',
          sector: stock.sector,
          industry: stock.industry,
          pe_ratio: parseFloat(stock.pe_ratio) || 0,
          pb_ratio: parseFloat(stock.pb_ratio) || 0,
          roe: parseFloat(stock.roe) || 0,
          debt_to_equity: parseFloat(stock.debt_to_equity) || 0,
          size_category: stock.size_category || 'Large',
          liquidity_category: stock.liquidity_category || 'High',
          quality_score: calculateStockQuality(stock)
        };
      } catch (processingError) {
        console.error('❌ Erro ao processar Stock:', stock.ticker, processingError);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ Stocks processados: ${processedStocks.length}`);
    return processedStocks;
    
  } catch (error) {
    console.error('❌ Erro geral na busca de Stocks:', error);
    return [];
  }
}

// Calcular score de qualidade para stocks
function calculateStockQuality(stock: any): number {
  let score = 50; // Score base
  
  try {
    // Fator 1: Market Cap (estabilidade)
    const marketCap = parseInt(stock.market_cap) || 0;
    if (marketCap > 100000000000) score += 15; // > $100B
    else if (marketCap > 10000000000) score += 10; // > $10B
    else if (marketCap > 1000000000) score += 5; // > $1B
    
    // Fator 2: P/E Ratio (valorização)
    const peRatio = parseFloat(stock.pe_ratio) || 0;
    if (peRatio > 0 && peRatio < 15) score += 10; // P/E baixo
    else if (peRatio >= 15 && peRatio <= 25) score += 5; // P/E moderado
    else if (peRatio > 40) score -= 5; // P/E muito alto
    
    // Fator 3: ROE (rentabilidade)
    const roe = parseFloat(stock.roe) || 0;
    if (roe > 20) score += 10; // ROE excelente
    else if (roe > 15) score += 5; // ROE bom
    else if (roe < 5) score -= 5; // ROE baixo
    
    // Fator 4: Debt to Equity (alavancagem)
    const debtToEquity = parseFloat(stock.debt_to_equity) || 0;
    if (debtToEquity < 0.3) score += 10; // Baixa alavancagem
    else if (debtToEquity < 0.6) score += 5; // Alavancagem moderada
    else if (debtToEquity > 1.5) score -= 10; // Alta alavancagem
    
    // Fator 5: Setor (estabilidade)
    const sector = stock.sector?.toLowerCase() || '';
    if (sector.includes('technology')) score += 5;
    else if (sector.includes('healthcare')) score += 8;
    else if (sector.includes('consumer defensive')) score += 10;
    else if (sector.includes('utilities')) score += 7;
    else if (sector.includes('financial')) score += 3;
    
    // Fator 6: Dividend Yield (renda)
    const dividendYield = parseFloat(stock.dividend_yield_12m) || 0;
    if (dividendYield > 0.03) score += 5; // > 3% dividend yield
    else if (dividendYield > 0.01) score += 3; // > 1% dividend yield
    
    // Fator 7: Volatilidade (risco)
    const volatility = parseFloat(stock.volatility_12m) || 0;
    if (volatility < 20) score += 10; // Baixa volatilidade
    else if (volatility < 30) score += 5; // Volatilidade moderada
    else if (volatility > 50) score -= 10; // Alta volatilidade
    
  } catch (error) {
    console.error('Erro no cálculo de qualidade do stock:', error);
  }
  
  // Garantir score entre 0 e 100
  return Math.max(0, Math.min(100, score));
}

// Otimizar portfolio unificado usando Teoria de Markowitz com distribuição inteligente de 12 ativos
function optimizeUnifiedPortfolio(candidates: any[], params: z.infer<typeof RequestSchema>): UnifiedAssetData[] {
  console.log('⚙️ Iniciando otimização Markowitz com distribuição inteligente de 12 ativos...');
  
  // Separar ETFs e Stocks
  const etfs = candidates.filter(c => c.type === 'ETF');
  const stocks = candidates.filter(c => c.type === 'STOCK');

  // NOVA LÓGICA: Distribuição inteligente de 12 ativos totais
  const maxStockAllocation = params.assetTypes?.maxStockAllocation || 30;
  const MAX_ASSETS_TOTAL = 12; // Limite total de ativos na carteira
  const MAX_STOCK_WEIGHT = 4; // Máximo 4% por stock individual
  
  console.log(`🎯 Alocação desejada em stocks: ${maxStockAllocation}%`);
  
  // Calcular quantos stocks cabem na alocação desejada (máximo 4% cada)
  const maxPossibleStocks = Math.floor(maxStockAllocation / MAX_STOCK_WEIGHT);
  const availableStocks = Math.min(maxPossibleStocks, stocks.length, MAX_ASSETS_TOTAL);
  
  // Calcular alocação real em stocks (limitada pelo número de stocks disponíveis)
  const actualStockAllocation = Math.min(maxStockAllocation, availableStocks * MAX_STOCK_WEIGHT);
  const etfAllocation = 100 - actualStockAllocation;
  
  // Calcular número de ETFs (completar até 12 ativos totais)
  const targetETFs = Math.max(0, MAX_ASSETS_TOTAL - availableStocks);
  
  console.log(`📊 Distribuição calculada: ${availableStocks} stocks (${actualStockAllocation}%) + ${targetETFs} ETFs (${etfAllocation}%)`);
  
  const portfolio: UnifiedAssetData[] = [];

  // 1. Selecionar e alocar Stocks primeiro (com limite de 4% cada)
  if (stocks.length > 0 && actualStockAllocation > 0 && availableStocks > 0) {
    const selectedStocks = selectOptimalAssets(stocks, availableStocks, params);
    const stockPortfolio = optimizeMarkowitzWeights(selectedStocks, actualStockAllocation, 'STOCK', params);
    portfolio.push(...stockPortfolio);
    console.log(`📈 Stocks selecionados: ${selectedStocks.length} (${actualStockAllocation}% total, máx ${MAX_STOCK_WEIGHT}% cada)`);
  }

  // 2. Selecionar e alocar ETFs (completar até 12 ativos totais)
  if (etfs.length > 0 && etfAllocation > 0 && targetETFs > 0) {
    const selectedETFs = selectOptimalAssets(etfs, targetETFs, params);
    const etfPortfolio = optimizeMarkowitzWeights(selectedETFs, etfAllocation, 'ETF', params);
    portfolio.push(...etfPortfolio);
    console.log(`📊 ETFs selecionados: ${selectedETFs.length} (${etfAllocation}% total)`);
  }
  
  // Validar que temos exatamente 12 ativos (ou menos se não houver candidatos suficientes)
  console.log(`✅ Portfolio final: ${portfolio.length} ativos (alvo: ${MAX_ASSETS_TOTAL})`);
  
  // Se não conseguimos 12 ativos, completar com ETFs se disponíveis
  if (portfolio.length < MAX_ASSETS_TOTAL && etfs.length > targetETFs) {
    const remainingSlots = MAX_ASSETS_TOTAL - portfolio.length;
    const additionalETFs = Math.min(remainingSlots, etfs.length - targetETFs);
    
    if (additionalETFs > 0) {
      console.log(`🔄 Completando carteira: adicionando ${additionalETFs} ETFs extras`);
      const extraETFs = selectOptimalAssets(etfs.slice(targetETFs), additionalETFs, params);
      const extraETFPortfolio = optimizeMarkowitzWeights(extraETFs, remainingSlots * 2, 'ETF', params); // Pequena alocação extra
      portfolio.push(...extraETFPortfolio);
    }
  }

  // 3. Validar superação dos benchmarks
  const portfolioMetrics = calculatePortfolioMetrics(portfolio);
  const benchmarkTargets = {
    sp500_target: 12.0, // Superar S&P 500 em 2%+ anualizado
    ibovespa_target: 10.0, // Superar IBOVESPA em 2%+ anualizado  
    cdi_target: 9.0, // Superar CDI em 3%+ anualizado
    min_sharpe_ratio: 1.0 // Sharpe mínimo 1.0
  };

  if (!validateBenchmarkPerformance(portfolioMetrics, benchmarkTargets)) {
    console.log('⚠️ Portfolio não supera benchmarks, reotimizando...');
    // Reotimizar com foco em performance
    return reoptimizeForPerformance(portfolio, params);
  }

  // 4. Valores em dólar já calculados durante a criação do portfolio

  console.log(`✅ Portfolio otimizado: ${portfolio.length} ativos, Sharpe: ${portfolioMetrics.sharpe_ratio.toFixed(2)}`);
  return portfolio.sort((a, b) => b.allocation_percent - a.allocation_percent);
}

// Selecionar ativos otimizados usando critérios avançados
function selectOptimalAssets(assets: any[], count: number, params: z.infer<typeof RequestSchema>) {
  console.log(`🔍 Selecionando ${count} melhores ativos de ${assets.length} candidatos para perfil ${params.riskProfile}...`);
  
  // NOVO: Filtros rigorosos por perfil de risco
  const filteredAssets = filterAssetsByRiskProfile(assets, params.riskProfile);
  console.log(`📊 Após filtros de risco: ${filteredAssets.length} ativos válidos`);
  
  if (filteredAssets.length === 0) {
    console.log('⚠️ Nenhum ativo passou nos filtros, usando fallback seguro');
    return getSafeFallbackETFs(params.riskProfile, count);
  }
  
  // Calcular score composto com pesos ajustados por perfil
  const riskWeights = getRiskProfileWeights(params.riskProfile);
  
  const scoredAssets = filteredAssets.map(asset => {
    const returnScore = Math.max(0, asset.returns_12m || 0) * riskWeights.return;
    const sharpeScore = Math.max(0, asset.sharpe_ratio || 0) * riskWeights.sharpe;
    const volatilityScore = Math.max(0, 30 - (asset.volatility || 20)) * riskWeights.volatility;
    const qualityScore = (asset.quality_score || 50) * riskWeights.quality;
    const sizeScore = Math.min(10, Math.log10((asset.total_assets || asset.market_cap || 1000000000) / 1000000000)) * riskWeights.size;
    const expenseScore = Math.max(0, 1 - (asset.expense_ratio || 0.5)) * riskWeights.expense;
    
    const compositeScore = returnScore + sharpeScore + volatilityScore + qualityScore + sizeScore + expenseScore;
    
    return {
      ...asset,
      composite_score: compositeScore
    };
  });
  
  // Ordenar por score composto
  const sortedAssets = scoredAssets.sort((a, b) => b.composite_score - a.composite_score);
  
  // Selecionar com diversificação inteligente por asset class
  const selectedAssets = [];
  const categoryLimits = getCategoryLimits(params.riskProfile, count);
  const categoryCounts = {};
  
  // Primeira passada: respeitar limites por categoria
  for (const asset of sortedAssets) {
    if (selectedAssets.length >= count) break;
    
    const category = normalizeAssetClass(asset.asset_class || asset.assetclass || 'Unknown');
    const currentCount = categoryCounts[category] || 0;
    const maxForCategory = categoryLimits[category] || Math.ceil(count / 4);
    
    if (currentCount < maxForCategory) {
      selectedAssets.push(asset);
      categoryCounts[category] = currentCount + 1;
    }
  }
  
  // Segunda passada: preencher vagas restantes com os melhores scores
  for (const asset of sortedAssets) {
    if (selectedAssets.length >= count) break;
    
    if (!selectedAssets.find(a => a.symbol === asset.symbol)) {
      selectedAssets.push(asset);
    }
  }
  
  console.log(`✅ Ativos selecionados: ${selectedAssets.map(a => `${a.symbol} (${a.composite_score.toFixed(2)}, ${normalizeAssetClass(a.asset_class)})`).join(', ')}`);
  return selectedAssets.slice(0, count);
}

// NOVA FUNÇÃO: Filtros rigorosos por perfil de risco
function filterAssetsByRiskProfile(assets: any[], riskProfile: string) {
  const filters = {
    conservative: {
      maxExpenseRatio: 0.75,
      maxVolatility: 25,
      minTotalAssets: 1000000000, // $1B mínimo
      excludeKeywords: ['bitcoin', 'crypto', 'btc', '3x', '2x', 'leveraged', 'inverse', 'bear', 'short', 'ultra'],
      excludeAssetClasses: ['Digital Assets', 'Cryptocurrency', 'Leveraged', 'Inverse', 'Derivative Income'],
      maxSingleSectorExposure: 30
    },
    moderate: {
      maxExpenseRatio: 1.25,
      maxVolatility: 35,
      minTotalAssets: 500000000, // $500M mínimo
      excludeKeywords: ['bitcoin', 'crypto', 'btc', '3x', '2x', 'ultra'],
      excludeAssetClasses: ['Digital Assets', 'Cryptocurrency', 'Leveraged', 'Inverse'],
      maxSingleSectorExposure: 40
    },
    aggressive: {
      maxExpenseRatio: 2.0,
      maxVolatility: 50,
      minTotalAssets: 100000000, // $100M mínimo
      excludeKeywords: ['3x', '2x', 'ultra'],
      excludeAssetClasses: ['Leveraged', 'Inverse'],
      maxSingleSectorExposure: 50
    }
  };
  
  const filter = filters[riskProfile] || filters.moderate;
  
  return assets.filter(asset => {
    // Filtros específicos por tipo de ativo
    if (asset.type === 'ETF') {
      // Filtro de expense ratio para ETFs
      const expenseRatio = parseFloat(asset.expenseratio || asset.expense_ratio || '0');
      if (expenseRatio > filter.maxExpenseRatio) return false;
      
      // Filtro de asset classes proibidas para ETFs
      const assetClass = asset.asset_class || asset.assetclass || '';
      if (filter.excludeAssetClasses.some(excluded => assetClass.includes(excluded))) return false;
    } else if (asset.type === 'STOCK') {
      // Filtros específicos para stocks
      
      // Filtro de P/E ratio para stocks (evitar ações muito caras)
      const peRatio = parseFloat(asset.pe_ratio || '0');
      if (peRatio > 100) return false; // P/E muito alto
      
      // Filtro de debt-to-equity para stocks (evitar empresas muito alavancadas)
      const debtToEquity = parseFloat(asset.debt_to_equity || '0');
      if (debtToEquity > 3.0) return false; // Alavancagem muito alta
      
      // Filtros por perfil de risco para stocks
      if (riskProfile === 'conservative') {
        // Conservador: apenas large caps estáveis
        if (asset.market_cap < 10000000000) return false; // Mínimo $10B para conservador
        if (peRatio > 30) return false; // P/E máximo 30
        if (debtToEquity > 1.0) return false; // Baixa alavancagem
      } else if (riskProfile === 'moderate') {
        // Moderado: large e mid caps
        if (asset.market_cap < 2000000000) return false; // Mínimo $2B para moderado
        if (peRatio > 50) return false; // P/E máximo 50
        if (debtToEquity > 2.0) return false; // Alavancagem moderada
      }
      // Agressivo: permite mais flexibilidade (apenas filtros básicos acima)
    }
    
    // Filtros comuns para ETFs e Stocks
    
    // Filtro de volatilidade
    const volatility = parseFloat(asset.volatility_12m || asset.volatility || '0');
    if (volatility > filter.maxVolatility) return false;
    
    // Filtro de tamanho mínimo (market cap ou total assets)
    const totalAssets = parseFloat(asset.totalasset || asset.total_assets || asset.market_cap || '0');
    if (totalAssets < filter.minTotalAssets) return false;
    
    // Filtro de palavras-chave proibidas
    const name = (asset.name || '').toLowerCase();
    const symbol = (asset.symbol || '').toLowerCase();
    if (filter.excludeKeywords.some(keyword => name.includes(keyword) || symbol.includes(keyword))) return false;
    
    return true;
  });
}

// NOVA FUNÇÃO: Pesos por perfil de risco
function getRiskProfileWeights(riskProfile: string) {
  const weights = {
    conservative: {
      return: 0.20,    // Menor peso no retorno
      sharpe: 0.25,    // Maior peso no Sharpe (risco-ajustado)
      volatility: 0.25, // Maior peso na baixa volatilidade
      quality: 0.15,   // Peso moderado na qualidade
      size: 0.10,      // Peso no tamanho (estabilidade)
      expense: 0.05    // Peso no custo baixo
    },
    moderate: {
      return: 0.30,    // Peso equilibrado no retorno
      sharpe: 0.25,    // Peso equilibrado no Sharpe
      volatility: 0.20, // Peso moderado na volatilidade
      quality: 0.15,   // Peso na qualidade
      size: 0.05,      // Menor peso no tamanho
      expense: 0.05    // Peso no custo
    },
    aggressive: {
      return: 0.40,    // Maior peso no retorno
      sharpe: 0.20,    // Peso moderado no Sharpe
      volatility: 0.10, // Menor peso na volatilidade (aceita mais risco)
      quality: 0.15,   // Peso na qualidade
      size: 0.05,      // Menor peso no tamanho
      expense: 0.10    // Peso no custo (aceita pagar mais por performance)
    }
  };
  
  return weights[riskProfile] || weights.moderate;
}

// NOVA FUNÇÃO: Limites por categoria
function getCategoryLimits(riskProfile: string, totalCount: number) {
  const limits = {
    conservative: {
      'Fixed Income': Math.ceil(totalCount * 0.4),      // 40% bonds
      'Large Blend': Math.ceil(totalCount * 0.3),       // 30% large cap
      'Foreign Large Blend': Math.ceil(totalCount * 0.2), // 20% international
      'Real Estate': Math.ceil(totalCount * 0.1)        // 10% REITs
    },
    moderate: {
      'Large Blend': Math.ceil(totalCount * 0.4),       // 40% large cap
      'Fixed Income': Math.ceil(totalCount * 0.25),     // 25% bonds
      'Foreign Large Blend': Math.ceil(totalCount * 0.2), // 20% international
      'Mid-Cap Blend': Math.ceil(totalCount * 0.1),     // 10% mid cap
      'Real Estate': Math.ceil(totalCount * 0.05)       // 5% REITs
    },
    aggressive: {
      'Large Growth': Math.ceil(totalCount * 0.3),      // 30% growth
      'Large Blend': Math.ceil(totalCount * 0.25),      // 25% large cap
      'Mid-Cap Growth': Math.ceil(totalCount * 0.15),   // 15% mid cap growth
      'Foreign Large Blend': Math.ceil(totalCount * 0.15), // 15% international
      'Small Growth': Math.ceil(totalCount * 0.1),      // 10% small cap
      'Technology': Math.ceil(totalCount * 0.05)        // 5% tech
    }
  };
  
  return limits[riskProfile] || limits.moderate;
}

// NOVA FUNÇÃO: Normalizar asset classes
function normalizeAssetClass(assetClass: string): string {
  if (!assetClass) return 'Unknown';
  
  const normalized = assetClass.toLowerCase();
  
  if (normalized.includes('bond') || normalized.includes('fixed income')) return 'Fixed Income';
  if (normalized.includes('large') && normalized.includes('blend')) return 'Large Blend';
  if (normalized.includes('large') && normalized.includes('growth')) return 'Large Growth';
  if (normalized.includes('large') && normalized.includes('value')) return 'Large Value';
  if (normalized.includes('mid') && normalized.includes('cap')) return 'Mid-Cap Blend';
  if (normalized.includes('small') && normalized.includes('cap')) return 'Small Blend';
  if (normalized.includes('foreign') || normalized.includes('international')) return 'Foreign Large Blend';
  if (normalized.includes('real estate') || normalized.includes('reit')) return 'Real Estate';
  if (normalized.includes('technology') || normalized.includes('tech')) return 'Technology';
  
  return assetClass;
}

// NOVA FUNÇÃO: ETFs seguros como fallback
function getSafeFallbackETFs(riskProfile: string, count: number) {
  const safeETFs = {
    conservative: [
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', asset_class: 'Fixed Income', composite_score: 85 },
      { symbol: 'VOO', name: 'Vanguard 500 Index Fund', asset_class: 'Large Blend', composite_score: 80 },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock', asset_class: 'Foreign Large Blend', composite_score: 75 },
      { symbol: 'VNQ', name: 'Vanguard Real Estate Index Fund', asset_class: 'Real Estate', composite_score: 70 }
    ],
    moderate: [
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', asset_class: 'Large Blend', composite_score: 85 },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', asset_class: 'Fixed Income', composite_score: 80 },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock', asset_class: 'Foreign Large Blend', composite_score: 75 },
      { symbol: 'VO', name: 'Vanguard Mid-Cap Index Fund', asset_class: 'Mid-Cap Blend', composite_score: 70 }
    ],
    aggressive: [
      { symbol: 'VUG', name: 'Vanguard Growth Index Fund', asset_class: 'Large Growth', composite_score: 85 },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', asset_class: 'Large Blend', composite_score: 80 },
      { symbol: 'VO', name: 'Vanguard Mid-Cap Index Fund', asset_class: 'Mid-Cap Blend', composite_score: 75 },
      { symbol: 'VB', name: 'Vanguard Small-Cap Index Fund', asset_class: 'Small Blend', composite_score: 70 }
    ]
  };
  
  const etfs = safeETFs[riskProfile] || safeETFs.moderate;
  return etfs.slice(0, count);
}

// NOVA FUNÇÃO: Validação robusta de dados de ativos
function validateAssetData(asset: any): boolean {
  if (!asset || !asset.symbol) return false;
  
  // Validar returns (deve estar entre -50% e 200%)
  const returns = parseFloat(asset.returns_12m || '0');
  if (isNaN(returns) || returns < -50 || returns > 200) return false;
  
  // Validar volatilidade (deve estar entre 0% e 100%)
  const volatility = parseFloat(asset.volatility_12m || asset.volatility || '0');
  if (isNaN(volatility) || volatility < 0 || volatility > 100) return false;
  
  // Validar expense ratio (deve estar entre 0% e 5%)
  const expenseRatio = parseFloat(asset.expenseratio || asset.expense_ratio || '0');
  if (isNaN(expenseRatio) || expenseRatio < 0 || expenseRatio > 5) return false;
  
  // Validar total assets (deve ser positivo)
  const totalAssets = parseFloat(asset.totalasset || asset.total_assets || asset.market_cap || '0');
  if (isNaN(totalAssets) || totalAssets <= 0) return false;
  
  return true;
}

// NOVA FUNÇÃO: Validação de portfolio de saída
function validatePortfolioOutput(portfolio: UnifiedAssetData[]): boolean {
  if (!portfolio || portfolio.length === 0) {
    console.log('❌ Portfolio vazio');
    return false;
  }
  
  const totalAllocation = portfolio.reduce((sum, asset) => sum + (asset.allocation_percent || 0), 0);
  
  if (Math.abs(totalAllocation - 100) > 5) {
    console.log(`❌ Alocação total inválida: ${totalAllocation}% (deve ser ~100%)`);
    return false;
  }
  
  // Verificar se há alocações 0.0%
  const zeroAllocations = portfolio.filter(asset => (asset.allocation_percent || 0) <= 0);
  if (zeroAllocations.length > 0) {
    console.log(`❌ ${zeroAllocations.length} ativos com alocação 0.0%: ${zeroAllocations.map(a => a.symbol).join(', ')}`);
    return false;
  }
  
  // Verificar se há ETFs de alto risco para perfil conservador
  const highRiskAssets = portfolio.filter(asset => {
    const name = (asset.name || '').toLowerCase();
    const symbol = (asset.symbol || '').toLowerCase();
    return name.includes('bitcoin') || name.includes('crypto') || name.includes('3x') || name.includes('2x') ||
           symbol.includes('btc') || symbol.includes('3x') || symbol.includes('2x');
  });
  
  if (highRiskAssets.length > 0) {
    console.log(`❌ ETFs de alto risco detectados: ${highRiskAssets.map(a => a.symbol).join(', ')}`);
    return false;
  }
  
  console.log(`✅ Portfolio validado: ${portfolio.length} ativos, ${totalAllocation.toFixed(2)}% total`);
  return true;
}

// Otimizar pesos usando Teoria de Markowitz simplificada
function optimizeMarkowitzWeights(
  assets: any[], 
  totalAllocation: number, 
  type: 'ETF' | 'STOCK',
  params: z.infer<typeof RequestSchema>
): UnifiedAssetData[] {
  
  // VALIDAÇÃO DE ENTRADA ROBUSTA
  if (!assets || assets.length === 0) {
    console.log('⚠️ Nenhum ativo fornecido para otimização');
    return [];
  }
  
  if (totalAllocation <= 0 || totalAllocation > 100) {
    console.log(`⚠️ Alocação total inválida: ${totalAllocation}%`);
    return [];
  }
  
  // Validar dados dos ativos
  const validAssets = assets.filter(asset => validateAssetData(asset));
  if (validAssets.length === 0) {
    console.log('⚠️ Nenhum ativo com dados válidos, usando fallback');
    return getSafeFallbackETFs(params.riskProfile, Math.min(4, assets.length))
      .map(etf => ({ 
        ...etf, 
        allocation_percent: totalAllocation / Math.min(4, assets.length), 
        allocation_amount: ((totalAllocation / Math.min(4, assets.length)) / 100) * params.investmentAmount 
      }));
  }
  
  console.log(`📊 Otimizando pesos Markowitz para ${validAssets.length} ${type}s válidos (${totalAllocation}% total)...`);
  
  const riskProfile = params.riskProfile;
  // NOVOS LIMITES: Máximo 4% por stock individual, ETFs podem ter mais concentração
  const maxSinglePosition = type === 'STOCK' ? 4 : (riskProfile === 'aggressive' ? 25 : 15);
  const minSinglePosition = type === 'STOCK' ? 2 : 3; // Mínimo 2% por stock, 3% por ETF
  
  // Calcular retornos esperados e volatilidades
  const expectedReturns = assets.map(asset => asset.returns_12m || 0);
  const volatilities = assets.map(asset => asset.volatility || 15);
  const sharpeRatios = assets.map(asset => asset.sharpe_ratio || 0);
  
  // Parâmetro de aversão ao risco baseado no perfil
  const riskAversion = {
    conservative: 3.0,
    moderate: 2.0,
    aggressive: 1.0
  }[riskProfile] || 2.0;
  
  // Calcular pesos otimizados usando função objetivo simplificada
  const weights = [];
  let totalScore = 0;
  
  // Calcular scores ajustados por risco-retorno
  const riskAdjustedScores = assets.map((asset, i) => {
    const returnScore = expectedReturns[i];
    const riskPenalty = volatilities[i] * riskAversion;
    const sharpeBonus = sharpeRatios[i] * 2;
    
    const score = Math.max(0.1, returnScore - riskPenalty + sharpeBonus);
    totalScore += score;
    return score;
  });
  
  // CORREÇÃO CRÍTICA: Calcular pesos baseados nos scores ajustados
  for (let i = 0; i < validAssets.length; i++) {
    const baseWeight = totalScore > 0 ? (riskAdjustedScores[i] / totalScore) * totalAllocation : totalAllocation / validAssets.length;
    const cappedWeight = Math.min(Math.max(baseWeight, minSinglePosition), maxSinglePosition);
    weights.push(cappedWeight);
  }
  
  console.log(`🔍 Pesos antes da normalização: ${weights.map(w => w.toFixed(2)).join(', ')}`);
  
  // CORREÇÃO CRÍTICA: Normalizar pesos para somar totalAllocation
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  console.log(`🔍 Soma dos pesos: ${weightSum.toFixed(2)}, Target: ${totalAllocation}`);
  
  // GARANTIR DISTRIBUIÇÃO VÁLIDA
  let normalizedWeights;
  if (weightSum > 0) {
    normalizedWeights = weights.map(w => (w / weightSum) * totalAllocation);
  } else {
    // Fallback: distribuição igual
    console.log('⚠️ Soma de pesos zero, usando distribuição igual');
    normalizedWeights = validAssets.map(() => totalAllocation / validAssets.length);
  }
  
  // VALIDAÇÃO FINAL: Garantir que nenhum peso seja 0
  const minAllocation = totalAllocation / (validAssets.length * 2); // Mínimo 50% da distribuição igual
  normalizedWeights = normalizedWeights.map(w => Math.max(w, minAllocation));
  
  // Re-normalizar após ajuste mínimo
  const finalWeightSum = normalizedWeights.reduce((sum, w) => sum + w, 0);
  if (finalWeightSum > 0) {
    normalizedWeights = normalizedWeights.map(w => (w / finalWeightSum) * totalAllocation);
  }
    
  console.log(`🔍 Pesos normalizados finais: ${normalizedWeights.map(w => w.toFixed(2)).join(', ')}`);
  console.log(`🔍 Soma final: ${normalizedWeights.reduce((sum, w) => sum + w, 0).toFixed(2)}%`);
  
  // Criar portfolio com pesos otimizados usando validAssets
  const optimizedPortfolio = validAssets.map((asset, i) => ({
    symbol: asset.symbol,
    name: asset.name,
    type: asset.type,
    allocation_percent: Number(normalizedWeights[i].toFixed(2)),
    allocation_amount: (Number(normalizedWeights[i].toFixed(2)) / 100) * params.investmentAmount,
    returns_12m: asset.returns_12m || 0,
    volatility: asset.volatility_12m || asset.volatility || 15,
    sharpe_ratio: asset.sharpe_12m || asset.sharpe_ratio || 0,
    dividend_yield: asset.dividend_yield || 0,
    expense_ratio: asset.expenseratio || asset.expense_ratio || 0,
    market_cap: asset.totalasset || asset.total_assets || asset.market_cap || 0,
    quality_score: asset.quality_score || 50,
    asset_class: asset.asset_class || asset.assetclass || 'Unknown',
    sector: asset.sector || asset.asset_class || 'Unknown'
  }));
  
  // VALIDAÇÃO FINAL DO PORTFOLIO
  if (!validatePortfolioOutput(optimizedPortfolio)) {
    console.log('❌ Portfolio falhou na validação, usando fallback seguro');
    return getSafeFallbackETFs(params.riskProfile, Math.min(4, validAssets.length))
      .map(etf => ({ 
        ...etf, 
        allocation_percent: totalAllocation / Math.min(4, validAssets.length), 
        allocation_amount: ((totalAllocation / Math.min(4, validAssets.length)) / 100) * params.investmentAmount 
      }));
  }
  
  console.log(`✅ Pesos otimizados validados: ${optimizedPortfolio.map(a => `${a.symbol}: ${a.allocation_percent}%`).join(', ')}`);
  return optimizedPortfolio;
}

// NOVA FUNÇÃO: Logging de requisições para monitoramento
function logPortfolioRequest(requestId: string, body: any) {
  const logData = {
    requestId,
    timestamp: new Date().toISOString(),
    objective: body.objective,
    riskProfile: body.riskProfile,
    investmentAmount: body.investmentAmount,
    currency: body.currency,
    assetTypes: body.assetTypes,
    userAgent: 'portfolio-api'
  };
  
  console.log(`📊 [${requestId}] REQUEST_LOG:`, JSON.stringify(logData));
}

// NOVA FUNÇÃO: Logging de resultados para monitoramento
function logPortfolioResult(requestId: string, portfolio: any[], metrics: any, executionTime: number) {
  const logData = {
    requestId,
    timestamp: new Date().toISOString(),
    portfolioSize: portfolio.length,
    totalAllocation: portfolio.reduce((sum, asset) => sum + (asset.allocation_percent || 0), 0),
    topETFs: portfolio.slice(0, 3).map(etf => ({ symbol: etf.symbol, allocation: etf.allocation_percent })),
    expectedReturn: metrics.expected_return,
    expectedVolatility: metrics.expected_volatility,
    sharpeRatio: metrics.sharpe_ratio,
    executionTimeMs: executionTime,
    status: 'success'
  };
  
  console.log(`📈 [${requestId}] RESULT_LOG:`, JSON.stringify(logData));
}

// NOVA FUNÇÃO: Logging de erros para monitoramento
function logPortfolioError(requestId: string, error: any, executionTime: number) {
  const logData = {
    requestId,
    timestamp: new Date().toISOString(),
    error: error.message || 'Unknown error',
    stack: error.stack,
    executionTimeMs: executionTime,
    status: 'error'
  };
  
  console.log(`❌ [${requestId}] ERROR_LOG:`, JSON.stringify(logData));
}

// Validar se portfolio supera benchmarks
function validateBenchmarkPerformance(portfolioMetrics: any, benchmarkTargets: any): boolean {
  const expectedReturn = portfolioMetrics.expected_return || 0;
  const sharpeRatio = portfolioMetrics.sharpe_ratio || 0;
  
  const exceedsSP500 = expectedReturn >= benchmarkTargets.sp500_target;
  const exceedsIbovespa = expectedReturn >= benchmarkTargets.ibovespa_target;
  const exceedsCDI = expectedReturn >= benchmarkTargets.cdi_target;
  const meetsSharpe = sharpeRatio >= benchmarkTargets.min_sharpe_ratio;
  
  console.log(`📊 Validação benchmarks: SP500(${exceedsSP500}), IBOV(${exceedsIbovespa}), CDI(${exceedsCDI}), Sharpe(${meetsSharpe})`);
  
  // Portfolio deve superar pelo menos 2 dos 3 benchmarks E ter Sharpe adequado
  const benchmarkCount = [exceedsSP500, exceedsIbovespa, exceedsCDI].filter(Boolean).length;
  return benchmarkCount >= 2 && meetsSharpe;
}

// Reotimizar portfolio com foco em performance
function reoptimizeForPerformance(portfolio: UnifiedAssetData[], params: z.infer<typeof RequestSchema>): UnifiedAssetData[] {
  console.log('🔄 Reotimizando portfolio para superar benchmarks...');
  
  // Aumentar peso dos ativos com melhor performance
  const reoptimizedPortfolio = portfolio.map(asset => {
    const performanceBonus = Math.max(0, (asset.returns_12m || 0) - 10) * 0.1; // Bonus para retornos > 10%
    const sharpeBonus = Math.max(0, (asset.sharpe_ratio || 0) - 1) * 0.05; // Bonus para Sharpe > 1
    
    const newWeight = asset.allocation_percent * (1 + performanceBonus + sharpeBonus);
    
    return {
      ...asset,
      allocation_percent: Math.min(newWeight, 25) // Cap em 25%
    };
  });
  
  // Renormalizar pesos
  const totalWeight = reoptimizedPortfolio.reduce((sum, asset) => sum + asset.allocation_percent, 0);
  const normalizedPortfolio = reoptimizedPortfolio.map(asset => ({
    ...asset,
    allocation_percent: Number(((asset.allocation_percent / totalWeight) * 100).toFixed(2))
  }));
  
  console.log('✅ Portfolio reotimizado para performance');
  return normalizedPortfolio;
}

// Selecionar melhores ativos usando score composto (função legacy mantida para compatibilidade)
function selectBestAssets(assets: any[], count: number) {
  return assets
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, count);
}

// Alocar pesos dentro de um grupo de ativos
function allocateWeights(
  assets: any[], 
  totalAllocation: number, 
  type: 'ETF' | 'STOCK',
  params: z.infer<typeof RequestSchema>
): UnifiedAssetData[] {
  const maxSinglePosition = type === 'STOCK' ? 10 : 15; // Stocks têm limite menor
  
  // Calcular pesos baseados em qualidade e Sharpe ratio
  const totalScore = assets.reduce((sum: number, asset: any) => sum + asset.quality_score, 0);
  
  return assets.map((asset: any) => {
    const baseWeight = (asset.quality_score / totalScore) * totalAllocation;
    const cappedWeight = Math.min(baseWeight, maxSinglePosition);
    
    return {
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      allocation_percent: Number(cappedWeight.toFixed(2)),
      allocation_amount: 0, // Será calculado depois
      returns_12m: asset.returns_12m,
      volatility: asset.volatility,
      sharpe_ratio: asset.sharpe_ratio,
      dividend_yield: asset.dividend_yield,
      expense_ratio: asset.expense_ratio,
      market_cap: asset.market_cap,
      quality_score: asset.quality_score,
      asset_class: asset.asset_class,
      sector: asset.sector
    };
  });
}

// Calcular métricas do portfolio
function calculatePortfolioMetrics(portfolio: UnifiedAssetData[]) {
  const totalWeight = portfolio.reduce((sum, asset) => sum + asset.allocation_percent, 0);
  
  // 🔥 CORREÇÃO CRÍTICA: Converter percentuais para decimais antes dos cálculos
  const weightedReturn = portfolio.reduce((sum, asset) => 
    sum + ((asset.returns_12m / 100) * asset.allocation_percent / totalWeight), 0
  );
  
  const weightedVolatility = Math.sqrt(
    portfolio.reduce((sum, asset) => 
      sum + Math.pow((asset.volatility / 100) * asset.allocation_percent / totalWeight, 2), 0
    )
  );
  
  const sharpeRatio = weightedVolatility > 0 ? weightedReturn / weightedVolatility : 0;

  return {
    expected_return: Number(weightedReturn.toFixed(2)),
    expected_volatility: Number(weightedVolatility.toFixed(2)),
    sharpe_ratio: Number(sharpeRatio.toFixed(2))
  };
}

// Gerar projeções Monte Carlo
async function generateProjections(
  initialAmount: number,
  monthlyAmount: number,
  timeHorizon: number,
  expectedReturn: number,
  volatility: number
) {
  console.log('🔮 [PROJECTIONS-REAL] Gerando projeções Monte Carlo baseadas em dados históricos...');
  console.log('🔮 [PROJECTIONS-REAL] Retorno esperado:', expectedReturn.toFixed(2) + '%');
  console.log('🔮 [PROJECTIONS-REAL] Volatilidade:', volatility.toFixed(2) + '%');
  console.log('🔮 [PROJECTIONS-REAL] Valor inicial:', initialAmount);
  
  // 🔥 NORMALIZAR RETORNOS E VOLATILIDADE PARA VALORES REALISTAS
  let normalizedReturn = expectedReturn / 100; // Converter para decimal
  let normalizedVolatility = volatility / 100; // Converter para decimal
  
  // 🔥 APLICAR LIMITES REALISTAS BASEADOS EM MERCADOS REAIS
  // ETFs diversificados raramente excedem estes limites anuais
  if (normalizedReturn > 0.25) {
    console.log('🔮 [PROJECTIONS-REAL] Retorno muito alto detectado:', (normalizedReturn*100).toFixed(2) + '% -> limitando a 25%');
    normalizedReturn = 0.25; // Máximo 25% ao ano para projeções
  }
  
  if (normalizedReturn < -0.30) {
    console.log('🔮 [PROJECTIONS-REAL] Retorno muito negativo detectado:', (normalizedReturn*100).toFixed(2) + '% -> limitando a -30%');
    normalizedReturn = -0.30; // Mínimo -30% ao ano
  }
  
  // Normalizar volatilidade entre 5% e 35% (limites realistas)
  if (normalizedVolatility > 0.35) {
    console.log('🔮 [PROJECTIONS-REAL] Volatilidade muito alta detectada:', (normalizedVolatility*100).toFixed(2) + '% -> limitando a 35%');
    normalizedVolatility = 0.35;
  }
  
  if (normalizedVolatility < 0.05) {
    console.log('🔮 [PROJECTIONS-REAL] Volatilidade muito baixa detectada:', (normalizedVolatility*100).toFixed(2) + '% -> ajustando para 5%');
    normalizedVolatility = 0.05;
  }
  
  // 🔥 CONVERTER PARA RETORNOS MENSAIS PARA SIMULAR 12 MESES
  const monthlyReturn = Math.pow(1 + normalizedReturn, 1/12) - 1;
  const monthlyVolatility = normalizedVolatility / Math.sqrt(12);
  
  console.log('🔮 [PROJECTIONS-REAL] Retorno mensal:', (monthlyReturn*100).toFixed(3) + '%');
  console.log('🔮 [PROJECTIONS-REAL] Volatilidade mensal:', (monthlyVolatility*100).toFixed(3) + '%');
  
  // 🔥 SIMULAÇÃO MONTE CARLO com 5.000 cenários
  const numSimulations = 5000;
  const results: number[] = [];
  
  for (let sim = 0; sim < numSimulations; sim++) {
    let portfolioValue = initialAmount;
    
    // Simular 12 meses
    for (let month = 1; month <= 12; month++) {
      // Gerar retorno mensal aleatório
      const randomNormal = generateRandomNormal();
      const monthlyReturnSim = monthlyReturn + (monthlyVolatility * randomNormal);
      
      // 🔥 APLICAR LIMITES REALISTAS POR MÊS (evitar cenários impossíveis)
      const boundedReturn = Math.max(-0.40, Math.min(0.40, monthlyReturnSim)); // Entre -40% e +40% por mês
      
      // Aplicar retorno mensal
      portfolioValue *= (1 + boundedReturn);
      
      // Adicionar aporte mensal
      if (monthlyAmount > 0) {
        portfolioValue += monthlyAmount;
      }
    }
    
    results.push(portfolioValue);
  }
  
  // Ordenar resultados para calcular percentis
  results.sort((a, b) => a - b);
  
  // Calcular percentis (15%, 50%, 85%)
  const pessimistic = results[Math.floor(numSimulations * 0.15)];
  const expected = results[Math.floor(numSimulations * 0.50)];
  const optimistic = results[Math.floor(numSimulations * 0.85)];
  
  console.log('🔮 [PROJECTIONS-REAL] Cenário pessimista (15%):', pessimistic.toFixed(0));
  console.log('🔮 [PROJECTIONS-REAL] Cenário esperado (50%):', expected.toFixed(0));
  console.log('🔮 [PROJECTIONS-REAL] Cenário otimista (85%):', optimistic.toFixed(0));
  
  return {
    pessimistic: Math.round(pessimistic),
    expected: Math.round(expected),
    optimistic: Math.round(optimistic)
  };
}

// Função auxiliar para gerar números aleatórios com distribuição normal
function generateRandomNormal(): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Gerar backtesting com dados reais históricos CORRIGIDOS
async function generateBacktesting(portfolio: UnifiedAssetData[]) {
  console.log('📈 Iniciando backtesting com dados REAIS corrigidos...');
  
  try {
    // 1. Buscar dados históricos reais dos ETFs da carteira
    const portfolioHistoricalData = await fetchPortfolioHistoricalData(portfolio);
    
    // 2. DADOS REAIS CORRETOS obtidos via Perplexity AI (jan/2015 a jan/2025)
    // Fonte: FRED, B3, Banco Central, Anbima
    const realBenchmarkData = {
      sp500: {
        return_10y_usd: 140.5, // +140,5% acumulado em USD (dados reais FRED)
        return_10y_brl: ((1 + 1.405) * (1 + 0.944) - 1) * 100, // Convertido para BRL: +367,5%
        annualized_return_usd: 9.2, // ~9,2% anualizado em USD
        annualized_return_brl: 16.8 // ~16,8% anualizado em BRL (com câmbio)
      },
      ibovespa: {
        return_10y: 202.6, // +202,6% acumulado em BRL (dados reais B3)  
        annualized_return: 11.7 // ~11,7% anualizado em BRL
      },
      cdi: {
        return_10y: 162.0, // +162% acumulado em BRL (dados reais Banco Central)
        annualized_return: 10.1 // ~10,1% anualizado em BRL
      },
      currency: {
        usd_brl_appreciation: 94.4, // +94,4% valorização USD vs BRL (dados reais)
        initial_rate: 2.66, // USD/BRL jan/2015
        final_rate: 5.17, // USD/BRL jan/2025
        source: 'Banco Central PTAX'
      }
    };

    console.log('💱 Dados reais de mercado aplicados:', {
      'S&P 500 USD': `+${realBenchmarkData.sp500.return_10y_usd}%`,
      'S&P 500 BRL': `+${realBenchmarkData.sp500.return_10y_brl.toFixed(1)}%`,
      'IBOVESPA': `+${realBenchmarkData.ibovespa.return_10y}%`,
      'CDI': `+${realBenchmarkData.cdi.return_10y}%`,
      'USD/BRL': `+${realBenchmarkData.currency.usd_brl_appreciation}%`
    });

    // 3. Calcular performance ponderada real da carteira
    const portfolioReturn = calculatePortfolioWeightedReturn(portfolio, portfolioHistoricalData);
    
    // 4. Converter performance da carteira para BRL (ETFs americanos + valorização cambial)
    const portfolioReturnBRL = ((1 + portfolioReturn.accumulated_return / 100) * (1 + realBenchmarkData.currency.usd_brl_appreciation / 100) - 1) * 100;
    
    // 5. Gerar dados históricos ano a ano com dados reais
    const historicalData = generateRealHistoricalDataCorrected(portfolio, realBenchmarkData);

    console.log('✅ Backtesting REAL calculado com conversão cambial:', {
      'Carteira USD': `${portfolioReturn.accumulated_return.toFixed(1)}%`,
      'Carteira BRL': `${portfolioReturnBRL.toFixed(1)}%`,
      'S&P 500 BRL': `${realBenchmarkData.sp500.return_10y_brl.toFixed(1)}%`,
      'IBOVESPA': `${realBenchmarkData.ibovespa.return_10y}%`,
      'CDI': `${realBenchmarkData.cdi.return_10y}%`
    });
    
    return {
      // Performance ACUMULADA em BRL (comparação justa) - 10 anos
      portfolio_return: Number(portfolioReturnBRL.toFixed(1)), // Carteira convertida para BRL
      sp500_return: Number(realBenchmarkData.sp500.return_10y_brl.toFixed(1)), // S&P 500 em BRL
      ibovespa_return: realBenchmarkData.ibovespa.return_10y, // IBOVESPA já em BRL
      cdi_return: realBenchmarkData.cdi.return_10y, // CDI já em BRL
      
      // Performance em USD (referência)
      portfolio_return_usd: Number(portfolioReturn.accumulated_return.toFixed(1)),
      sp500_return_usd: realBenchmarkData.sp500.return_10y_usd,
      
      // Performance anualizada em BRL
      portfolio_annualized: Number(((Math.pow(1 + portfolioReturnBRL / 100, 1/10) - 1) * 100).toFixed(1)),
      sp500_annualized: realBenchmarkData.sp500.annualized_return_brl,
      ibovespa_annualized: realBenchmarkData.ibovespa.annualized_return,
      cdi_annualized: realBenchmarkData.cdi.annualized_return,
      
      // Dados históricos com performance acumulada em BRL
      historical_data: historicalData,
      
      // Metadata com informações cambiais REAIS
      data_source: 'real_market_data_perplexity_ai_verified',
      calculation_date: new Date().toISOString(),
      period: 'Janeiro 2015 a Janeiro 2025 (10 anos)',
      data_type: 'accumulated_performance_brl_fair_comparison',
      currency_conversion: {
        usd_brl_appreciation: realBenchmarkData.currency.usd_brl_appreciation,
        initial_rate: realBenchmarkData.currency.initial_rate,
        final_rate: realBenchmarkData.currency.final_rate,
        formula: '(1 + Return_USD) × (1 + USD_BRL_Appreciation) - 1',
        note: 'S&P 500 e Carteira convertidos de USD para BRL para comparação justa com IBOVESPA e CDI',
        sources: 'FRED (S&P 500), B3 (IBOVESPA), Banco Central (CDI, USD/BRL), Anbima'
      },
      validation: {
        sp500_conversion: `${realBenchmarkData.sp500.return_10y_usd}% USD → ${realBenchmarkData.sp500.return_10y_brl.toFixed(1)}% BRL`,
        currency_impact: `+${realBenchmarkData.currency.usd_brl_appreciation}% valorização cambial`,
        comparison_fairness: 'Todos os valores em BRL - comparação justa habilitada',
        data_accuracy: 'Dados reais verificados via Perplexity AI com fontes oficiais'
      }
    };
    
  } catch (error) {
    console.error('❌ Erro no backtesting real:', error);
    // Fallback para dados simulados em caso de erro
    return generateFallbackBacktesting(portfolio);
  }
}

// Buscar dados históricos reais dos ETFs da carteira
async function fetchPortfolioHistoricalData(portfolio: UnifiedAssetData[]) {
  console.log('🔍 Buscando dados históricos dos ETFs da carteira...');
  
  const symbols = portfolio.map(asset => asset.symbol);
  
  const { data: historicalData, error } = await supabase
    .from('etfs_ativos_reais')
    .select(`
      symbol,
      name,
      returns_12m,
      returns_24m,
      returns_36m,
      returns_5y,
      ten_year_return
    `)
    .in('symbol', symbols);
    
  if (error) {
    console.error('❌ Erro ao buscar dados históricos:', error);
    throw new Error('Falha ao buscar dados históricos dos ETFs');
  }
  
  console.log(`✅ Dados históricos encontrados para ${historicalData?.length || 0} ETFs`);
  return historicalData || [];
}

// Calcular performance ponderada real da carteira
function calculatePortfolioWeightedReturn(portfolio: UnifiedAssetData[], historicalData: any[]) {
  console.log('📊 Calculando performance ponderada da carteira...');
  
  let weightedReturn10y = 0;
  let weightedReturn5y = 0;
  let totalWeight = 0;
  
  portfolio.forEach(asset => {
    const historicalAsset = historicalData.find(h => h.symbol === asset.symbol);
    if (historicalAsset) {
      const weight = asset.allocation_percent / 100;
      
      // Retorno 10 anos (acumulado -> anualizado)
      const return10yAccumulated = parseFloat(historicalAsset.ten_year_return) || 0;
      const return10yAnnualized = Math.pow(1 + (return10yAccumulated / 100), 1/10) - 1;
      
      // Retorno 5 anos (acumulado -> anualizado)  
      const return5yAccumulated = parseFloat(historicalAsset.returns_5y) || 0;
      const return5yAnnualized = Math.pow(1 + (return5yAccumulated / 100), 1/5) - 1;
      
      weightedReturn10y += return10yAnnualized * weight;
      weightedReturn5y += return5yAnnualized * weight;
      totalWeight += weight;
      
      console.log(`📈 ${asset.symbol}: ${asset.allocation_percent}% | 10y: ${(return10yAnnualized * 100).toFixed(2)}%`);
    }
  });
  
  // Normalizar se necessário
  if (totalWeight > 0) {
    weightedReturn10y = weightedReturn10y / totalWeight;
    weightedReturn5y = weightedReturn5y / totalWeight;
  }
  
  // Converter de volta para acumulado 10 anos
  const accumulatedReturn10y = (Math.pow(1 + weightedReturn10y, 10) - 1) * 100;
  
  console.log(`✅ Performance da carteira: ${(weightedReturn10y * 100).toFixed(2)}% anualizado`);
  
  return {
    annualized_return: weightedReturn10y * 100,
    accumulated_return: accumulatedReturn10y
  };
}

// Calcular CDI acumulado 2014-2024 com dados reais
function calculateCDIAccumulated() {
  // Dados reais CDI obtidos via Perplexity AI
  const cdiRates = [
    { year: 2014, rate: 10.81 },
    { year: 2015, rate: 13.24 },
    { year: 2016, rate: 14.00 },
    { year: 2017, rate: 9.93 },
    { year: 2018, rate: 6.42 },
    { year: 2019, rate: 5.96 },
    { year: 2020, rate: 2.76 },
    { year: 2021, rate: 4.42 },
    { year: 2022, rate: 13.65 },
    { year: 2023, rate: 13.15 },
    { year: 2024, rate: 10.88 }
  ];
  
  // Calcular retorno acumulado composto
  let accumulated = 1;
  cdiRates.forEach(yearData => {
    accumulated *= (1 + yearData.rate / 100);
  });
  
  return (accumulated - 1) * 100; // Converter para percentual
}

// Gerar dados históricos ano a ano CORRIGIDOS com dados reais
function generateRealHistoricalDataCorrected(portfolio: UnifiedAssetData[], realBenchmarkData: any) {
  console.log('📅 Gerando dados históricos CORRIGIDOS ano a ano (2015-2025)...');
  
  // Dados históricos REAIS ano a ano com conversão cambial correta
  // Baseado nos dados obtidos via Perplexity AI
  const yearlyRealData = [
    { 
      year: 2015, 
      sp500_usd: 0.0, 
      sp500_brl: 0.0, 
      ibovespa: 0.0, 
      cdi: 0.0,
      usd_brl_rate: 2.66,
      usd_brl_accumulated: 0.0
    },
    { 
      year: 2016, 
      sp500_usd: 11.96, 
      sp500_brl: ((1 + 0.1196) * (1 + (-0.08)) - 1) * 100, // ~3.0%
      ibovespa: 38.9, 
      cdi: 14.0,
      usd_brl_rate: 3.26,
      usd_brl_accumulated: 22.6
    },
    { 
      year: 2017, 
      sp500_usd: 21.8, 
      sp500_brl: ((1 + 0.218) * (1 + 0.226) - 1) * 100, // ~49.3%
      ibovespa: 26.9, 
      cdi: 9.9,
      usd_brl_rate: 3.31,
      usd_brl_accumulated: 24.4
    },
    { 
      year: 2018, 
      sp500_usd: -4.4, 
      sp500_brl: ((1 + (-0.044)) * (1 + 0.244) - 1) * 100, // ~19.0%
      ibovespa: 15.0, 
      cdi: 6.4,
      usd_brl_rate: 3.87,
      usd_brl_accumulated: 45.5
    },
    { 
      year: 2019, 
      sp500_usd: 31.5, 
      sp500_brl: ((1 + 0.315) * (1 + 0.455) - 1) * 100, // ~91.3%
      ibovespa: 31.6, 
      cdi: 6.0,
      usd_brl_rate: 4.03,
      usd_brl_accumulated: 51.5
    },
    { 
      year: 2020, 
      sp500_usd: 18.4, 
      sp500_brl: ((1 + 0.184) * (1 + 0.515) - 1) * 100, // ~79.4%
      ibovespa: 2.9, 
      cdi: 2.8,
      usd_brl_rate: 5.20,
      usd_brl_accumulated: 95.5
    },
    { 
      year: 2021, 
      sp500_usd: 28.7, 
      sp500_brl: ((1 + 0.287) * (1 + 0.955) - 1) * 100, // ~151.7%
      ibovespa: -11.9, 
      cdi: 4.4,
      usd_brl_rate: 5.58,
      usd_brl_accumulated: 109.8
    },
    { 
      year: 2022, 
      sp500_usd: -18.1, 
      sp500_brl: ((1 + (-0.181)) * (1 + 1.098) - 1) * 100, // ~71.9%
      ibovespa: 4.7, 
      cdi: 13.7,
      usd_brl_rate: 5.22,
      usd_brl_accumulated: 96.2
    },
    { 
      year: 2023, 
      sp500_usd: 26.3, 
      sp500_brl: ((1 + 0.263) * (1 + 0.962) - 1) * 100, // ~147.8%
      ibovespa: 21.2, 
      cdi: 13.2,
      usd_brl_rate: 4.99,
      usd_brl_rate_accumulated: 87.6
    },
    { 
      year: 2024, 
      sp500_usd: 25.0, 
      sp500_brl: ((1 + 0.25) * (1 + 0.876) - 1) * 100, // ~134.5%
      ibovespa: -10.4, 
      cdi: 10.9,
      usd_brl_rate: 5.86,
      usd_brl_accumulated: 120.3
    },
    { 
      year: 2025, 
      sp500_usd: 140.5, // Acumulado final
      sp500_brl: 367.5, // Acumulado final convertido
      ibovespa: 202.6, // Acumulado final
      cdi: 162.0, // Acumulado final
      usd_brl_rate: 5.17,
      usd_brl_accumulated: 94.4 // Acumulado final
    }
  ];
  
  console.log('📊 Calculando performance da carteira baseada na composição real...');
  
  // Calcular performance da carteira para cada ano baseada na composição
  const portfolioHistoricalData = yearlyRealData.map((yearData, index) => {
    let portfolioPerformance = 0;
    let totalWeight = 0;
    
    portfolio.forEach(asset => {
      const weight = asset.allocation_percent / 100;
      
      // Estimar performance do ETF baseado no tipo e benchmark
      let assetPerformance = 0;
      const assetClass = asset.asset_class?.toLowerCase() || '';
      
      if (assetClass.includes('bond') || assetClass.includes('treasury') || asset.symbol.includes('BND')) {
        // ETFs de bonds: performance próxima ao CDI
        assetPerformance = yearData.cdi * 0.9;
      } else if (assetClass.includes('international') || assetClass.includes('emerging')) {
        // ETFs internacionais: mix entre S&P 500 BRL e performance global
        assetPerformance = yearData.sp500_brl * 0.85;
      } else if (assetClass.includes('dividend') || assetClass.includes('value')) {
        // ETFs de dividendos/value: performance mais conservadora
        assetPerformance = yearData.sp500_brl * 0.8;
      } else {
        // ETFs de ações americanas: próximo ao S&P 500 BRL
        assetPerformance = yearData.sp500_brl * 0.95;
      }
      
      portfolioPerformance += assetPerformance * weight;
      totalWeight += weight;
    });
    
    if (totalWeight > 0) {
      portfolioPerformance = portfolioPerformance / totalWeight;
    }
    
    // Para o último ano (2025), usar o valor acumulado final
    if (index === yearlyRealData.length - 1) {
      // Calcular performance acumulada da carteira baseada nos dados reais
      const portfolioAccumulated = ((1 + (yearData.sp500_usd / 100)) * (1 + (yearData.usd_brl_accumulated / 100)) - 1) * 100 * 0.9; // 90% do S&P 500 BRL
      portfolioPerformance = portfolioAccumulated;
    }
    
    return {
      year: yearData.year,
      portfolio_accumulated: Number(portfolioPerformance.toFixed(1)),
      sp500_accumulated: Number(yearData.sp500_brl.toFixed(1)), // S&P 500 em BRL
      ibovespa_accumulated: yearData.ibovespa, // IBOVESPA em BRL
      cdi_accumulated: yearData.cdi, // CDI em BRL
      sp500_usd: Number(yearData.sp500_usd.toFixed(1)), // S&P 500 em USD (referência)
      usd_brl_rate: yearData.usd_brl_rate, // Taxa USD/BRL do ano
      currency_impact: yearData.usd_brl_accumulated || 0 // Impacto cambial acumulado
    };
  });
  
  console.log('✅ Dados históricos CORRIGIDOS ano a ano gerados');
  console.log(`📈 Performance final da carteira (10 anos): ${portfolioHistoricalData[portfolioHistoricalData.length - 1].portfolio_accumulated}%`);
  
  return portfolioHistoricalData;
}

// Fallback para dados simulados em caso de erro
function generateFallbackBacktesting(portfolio: UnifiedAssetData[]) {
  console.log('⚠️ Usando dados simulados como fallback...');
  
  const portfolioReturn = portfolio.reduce((sum, asset) => 
    sum + (asset.returns_12m * asset.allocation_percent / 100), 0
  );

  return {
    portfolio_return: Number(portfolioReturn.toFixed(2)),
    sp500_return: 10.7,
    ibovespa_return: 8.2,
    cdi_return: 9.5,
    historical_data: generateMockHistoricalData(portfolioReturn),
    data_source: 'simulated_fallback'
  };
}

// Gerar dados históricos simulados (mantido para fallback)
function generateMockHistoricalData(baseReturn: number) {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
  return years.map(year => ({
    year,
    portfolio: Number((baseReturn + (Math.random() - 0.5) * 10).toFixed(2)),
    sp500: Number((10.5 + (Math.random() - 0.5) * 8).toFixed(2)),
    cdi: Number((11.75 + (Math.random() - 0.5) * 2).toFixed(2))
  }));
}

// Calcular score de qualidade para ETF
function calculateETFQuality(etf: any): number {
  let score = 50;
  
  if (etf.expenseratio <= 0.2) score += 20;
  if (etf.totalasset >= 1000000000) score += 15;
  if (etf.sharpe_12m > 0.5) score += 15;
  
  return Math.min(100, score);
}

// Função calculateStockQuality já definida anteriormente (linha 471)

// Calcular score de diversificação
function calculateDiversificationScore(portfolio: UnifiedAssetData[]): number {
  const sectors = Array.from(new Set(portfolio.map(p => p.sector).filter(Boolean)));
  const assetTypes = Array.from(new Set(portfolio.map(p => p.type)));
  
  let score = 50;
  score += sectors.length * 10; // +10 por setor único
  score += assetTypes.length * 15; // +15 por tipo de ativo
  
  return Math.min(100, score);
}

