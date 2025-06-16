// Este arquivo contém funções de análise com IA
// analyzeETFComparison só deve ser usada no servidor (API routes)
// As funções de cache podem ser usadas no cliente

import { ETF } from '../../types';

interface ComparisonAnalysis {
  summary: string;
  keyDifferences: string[];
  recommendation: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  strengths: Record<string, string[]>;
  warnings: string[];
}

// Função principal de análise - APENAS PARA USO NO SERVIDOR
export async function analyzeETFComparison(etfs: ETF[]): Promise<ComparisonAnalysis> {
  if (etfs.length < 2) {
    throw new Error('Pelo menos 2 ETFs são necessários para comparação');
  }

  // Se não tiver OpenAI configurado, usar análise básica
  if (!process.env.OPENAI_API_KEY) {
    return generateBasicAnalysis(etfs);
  }

  try {
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Como especialista em ETFs brasileiro, analise os seguintes fundos e forneça insights claros para investidores:

${etfs.map(etf => `
ETF: ${etf.symbol} - ${etf.name}
- Retorno 12m: ${etf.returns_12m}%
- Volatilidade: ${etf.volatility_12m}%
- Sharpe: ${etf.sharpe_12m}
- Taxa: ${etf.expense_ratio}%
- Dividend Yield: ${etf.dividend_yield}%
- Total Assets: $${Number(etf.total_assets).toLocaleString()}
- Volume: ${Number(etf.volume).toLocaleString()}
- Max Drawdown: ${etf.max_drawdown}%
`).join('\n')}

Forneça uma análise em português brasileiro seguindo EXATAMENTE este formato JSON (sem markdown ou formatação adicional):
{
  "summary": "Resumo da comparação em 2-3 frases, destacando as principais diferenças",
  "keyDifferences": ["diferença específica 1", "diferença específica 2", "diferença específica 3"],
  "recommendation": "Recomendação prática baseada em diferentes perfis de investidor",
  "riskProfile": "conservative ou moderate ou aggressive",
  "strengths": {
    "${etfs[0].symbol}": ["ponto forte 1", "ponto forte 2"],
    "${etfs[1].symbol}": ["ponto forte 1", "ponto forte 2"]
  },
  "warnings": ["alerta importante 1", "alerta importante 2"]
}

Diretrizes:
- Use linguagem simples e acessível
- Evite jargões técnicos desnecessários
- Seja específico com números e percentuais
- Considere tanto iniciantes quanto investidores experientes
- Foque em insights práticos para tomada de decisão`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Resposta vazia da API');

    // Limpar possível formatação markdown
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanContent) as ComparisonAnalysis;
  } catch (error) {
    console.error('Erro na análise de IA:', error);
    // Fallback para análise básica
    return generateBasicAnalysis(etfs);
  }
}

function generateBasicAnalysis(etfs: ETF[]): ComparisonAnalysis {
  // Calcular métricas básicas
  const returns = etfs.map(etf => Number(etf.returns_12m) || 0);
  const volatilities = etfs.map(etf => Number(etf.volatility_12m) || 0);
  const expenses = etfs.map(etf => Number(etf.expense_ratio) || 0);
  const sharpes = etfs.map(etf => Number(etf.sharpe_12m) || 0);
  
  const bestReturnIndex = returns.indexOf(Math.max(...returns));
  const lowestVolIndex = volatilities.indexOf(Math.min(...volatilities));
  const lowestExpenseIndex = expenses.indexOf(Math.min(...expenses));
  const bestSharpeIndex = sharpes.indexOf(Math.max(...sharpes));
  
  const bestPerformer = etfs[bestReturnIndex];
  const safestOption = etfs[lowestVolIndex];
  const cheapestOption = etfs[lowestExpenseIndex];

  // Determinar perfil de risco geral
  const avgVolatility = volatilities.reduce((a, b) => a + b, 0) / volatilities.length;
  const riskProfile: 'conservative' | 'moderate' | 'aggressive' = 
    avgVolatility < 15 ? 'conservative' : 
    avgVolatility < 25 ? 'moderate' : 'aggressive';

  // Gerar insights específicos para cada ETF
  const strengths: Record<string, string[]> = {};
  etfs.forEach((etf, index) => {
    const etfStrengths: string[] = [];
    
    if (index === bestReturnIndex) etfStrengths.push('Melhor retorno nos últimos 12 meses');
    if (index === lowestVolIndex) etfStrengths.push('Menor volatilidade (mais estável)');
    if (index === lowestExpenseIndex) etfStrengths.push('Menor taxa de administração');
    if (index === bestSharpeIndex) etfStrengths.push('Melhor relação risco-retorno');
    if (Number(etf.dividend_yield) > 3) etfStrengths.push('Boa distribuição de dividendos');
    if (Number(etf.total_assets) > 1000000000) etfStrengths.push('Alto patrimônio líquido (boa liquidez)');
    
    strengths[etf.symbol] = etfStrengths.length > 0 ? etfStrengths : ['ETF com características específicas'];
  });

  // Gerar alertas
  const warnings: string[] = [];
  if (Math.max(...volatilities) > 30) {
    warnings.push('Alguns ETFs apresentam alta volatilidade - adequados para perfil arrojado');
  }
  if (Math.max(...expenses) > 1) {
    warnings.push('Atenção às taxas de administração que podem impactar retornos de longo prazo');
  }
  if (etfs.some(etf => Number(etf.total_assets) < 100000000)) {
    warnings.push('ETFs com baixo patrimônio podem ter menor liquidez');
  }
  
  return {
    summary: `Comparando ${etfs.length} ETFs: ${bestPerformer.symbol} lidera em retorno (${returns[bestReturnIndex].toFixed(1)}%), ${safestOption.symbol} é mais estável (volatilidade ${volatilities[lowestVolIndex].toFixed(1)}%), e ${cheapestOption.symbol} tem menor custo (${expenses[lowestExpenseIndex].toFixed(2)}%).`,
    keyDifferences: [
      `Retorno: variação de ${Math.min(...returns).toFixed(1)}% a ${Math.max(...returns).toFixed(1)}%`,
      `Volatilidade: de ${Math.min(...volatilities).toFixed(1)}% a ${Math.max(...volatilities).toFixed(1)}%`,
      `Taxas: variam de ${Math.min(...expenses).toFixed(2)}% a ${Math.max(...expenses).toFixed(2)}% ao ano`
    ],
    recommendation: `Para investidores conservadores: considere ${safestOption.symbol}. Para busca de retorno: ${bestPerformer.symbol}. Para custo baixo: ${cheapestOption.symbol}.`,
    riskProfile,
    strengths,
    warnings: warnings.length > 0 ? warnings : ['Analise sempre seu perfil de risco antes de investir']
  };
}

// Função auxiliar para cache de análises - PODE SER USADA NO CLIENTE
const analysisCache = new Map<string, { analysis: ComparisonAnalysis; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export function getCachedAnalysis(etfSymbols: string[]): ComparisonAnalysis | null {
  const cacheKey = etfSymbols.sort().join('-');
  const cached = analysisCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.analysis;
  }
  
  return null;
}

export function setCachedAnalysis(etfSymbols: string[], analysis: ComparisonAnalysis): void {
  const cacheKey = etfSymbols.sort().join('-');
  analysisCache.set(cacheKey, {
    analysis,
    timestamp: Date.now()
  });
} 