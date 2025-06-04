import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ETFContext {
  symbol: string;
  name: string;
  returns_12m: number;
  dividend_yield: number;
  total_assets: number;
  volatility_12m: number;
  sharpe_12m: number;
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    // Detectar se a pergunta é sobre ETFs específicos
    const etfSymbols = extractETFSymbols(message);
    let etfData: ETFContext[] = [];

    if (etfSymbols.length > 0) {
      // Buscar dados dos ETFs mencionados
      const etfs = await prisma.etfs.findMany({
        where: {
          symbol: { in: etfSymbols }
        },
        select: {
          symbol: true,
          name: true,
          returns_12m: true,
          dividend_yield: true,
          total_assets: true,
          volatility_12m: true,
          sharpe_12m: true,
          category: true
        }
      });

      etfData = etfs.map(etf => ({
        symbol: etf.symbol,
        name: etf.name || '',
        returns_12m: Number(etf.returns_12m || 0),
        dividend_yield: Number(etf.dividend_yield || 0),
        total_assets: Number(etf.total_assets || 0),
        volatility_12m: Number(etf.volatility_12m || 0),
        sharpe_12m: Number(etf.sharpe_12m || 0),
        category: etf.category || ''
      }));
    }

    // Gerar resposta baseada na pergunta e dados dos ETFs
    const response = await generateAIResponse(message, etfData, context);

    return NextResponse.json({
      response,
      etfs_analyzed: etfData.length,
      symbols: etfSymbols,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erro no AI Chat:", error);
    return NextResponse.json(
      { error: "Falha ao processar mensagem" },
      { status: 500 }
    );
  }
}

// Função para extrair símbolos de ETFs da mensagem
function extractETFSymbols(message: string): string[] {
  // Regex para capturar símbolos comuns de ETFs (3-5 letras maiúsculas)
  const symbolRegex = /\b[A-Z]{3,5}\b/g;
  const matches = message.match(symbolRegex) || [];
  
  // Lista de símbolos comuns de ETFs para validação
  const commonETFs = ['SPY', 'QQQ', 'VTI', 'IWM', 'VEA', 'VWO', 'AGG', 'BND', 'GLD', 'SLV', 'DIA', 'MDY', 'IVV', 'VXUS', 'VNQ'];
  
  return matches.filter(symbol => commonETFs.includes(symbol) || symbol.length >= 3);
}

// Função para gerar resposta do AI baseada em dados reais
async function generateAIResponse(message: string, etfData: ETFContext[], context?: any): Promise<string> {
  const lowerMessage = message.toLowerCase();

  // Se não há ETFs específicos, dar recomendações gerais
  if (etfData.length === 0) {
    return await generateGeneralRecommendation(lowerMessage);
  }

  // Análise específica de ETFs
  if (etfData.length === 1) {
    return generateSingleETFAnalysis(etfData[0], lowerMessage);
  } else {
    return generateMultipleETFComparison(etfData, lowerMessage);
  }
}

// Recomendações gerais baseadas na base de dados
async function generateGeneralRecommendation(message: string): Promise<string> {
  try {
    if (message.includes('dividendo') || message.includes('yield')) {
      const topDividends = await prisma.etfs.findMany({
        where: { dividend_yield: { gt: 0 } },
        orderBy: { dividend_yield: 'desc' },
        take: 3,
        select: { symbol: true, name: true, dividend_yield: true }
      });

      const recommendations = topDividends.map(etf => 
        `${etf.symbol} (${((Number(etf.dividend_yield) || 0) * 100).toFixed(1)}%)`
      ).join(', ');

      return `Para dividendos, recomendo: ${recommendations}. Estes ETFs oferecem bons yields baseados nos dados atuais.`;
    }

    if (message.includes('crescimento') || message.includes('growth')) {
      const topGrowth = await prisma.etfs.findMany({
        where: { returns_12m: { gt: 0.1 } },
        orderBy: { returns_12m: 'desc' },
        take: 3,
        select: { symbol: true, name: true, returns_12m: true }
      });

      const recommendations = topGrowth.map(etf => 
        `${etf.symbol} (+${((Number(etf.returns_12m) || 0) * 100).toFixed(1)}%)`
      ).join(', ');

      return `Para crescimento, considere: ${recommendations}. Estes ETFs tiveram excelente performance nos últimos 12 meses.`;
    }

    if (message.includes('conservador') || message.includes('baixo risco')) {
      return `Para perfil conservador, recomendo ETFs de bonds como AGG ou BND, e ETFs diversificados como VTI ou SPY. Estes oferecem menor volatilidade e exposição ampla ao mercado.`;
    }

    return `Posso ajudar com análises de ETFs específicos. Mencione símbolos como SPY, QQQ, VTI ou pergunte sobre categorias como dividendos, crescimento ou estratégias conservadoras.`;

  } catch (error) {
    return `Desculpe, tive dificuldade em acessar os dados. Tente mencionar ETFs específicos ou refazer sua pergunta.`;
  }
}

// Análise de um único ETF
function generateSingleETFAnalysis(etf: ETFContext, message: string): string {
  const returns = (etf.returns_12m * 100).toFixed(1);
  const dividend = (etf.dividend_yield * 100).toFixed(1);
  const volatility = (etf.volatility_12m * 100).toFixed(1);
  const assets = (etf.total_assets / 1000000000).toFixed(1);

  let analysis = `📊 **Análise ${etf.symbol}** (${etf.name})\n\n`;
  
  if (message.includes('performance') || message.includes('retorno')) {
    analysis += `**Performance 12m:** +${returns}%\n`;
    analysis += etf.returns_12m > 0.15 ? `🚀 Excelente performance!` : 
                etf.returns_12m > 0.05 ? `📈 Performance sólida` : `⚠️ Performance abaixo da média`;
  }

  if (message.includes('dividendo') || message.includes('yield')) {
    analysis += `\n**Dividend Yield:** ${dividend}%\n`;
    analysis += etf.dividend_yield > 0.03 ? `💰 Bom para renda passiva` : `📊 Foca mais em crescimento`;
  }

  if (message.includes('risco') || message.includes('volatilidade')) {
    analysis += `\n**Volatilidade:** ${volatility}%\n`;
    analysis += etf.volatility_12m < 0.15 ? `✅ Baixo risco` : 
                etf.volatility_12m < 0.25 ? `⚖️ Risco moderado` : `⚠️ Alto risco`;
  }

  if (message.includes('tamanho') || message.includes('assets')) {
    analysis += `\n**Assets:** $${assets}B\n`;
    analysis += etf.total_assets > 10000000000 ? `🏢 ETF de grande porte` : `📊 ETF menor, mais liquidez limitada`;
  }

  // Análise geral se não especificou categoria
  if (!message.includes('performance') && !message.includes('dividendo') && !message.includes('risco')) {
    analysis = `📊 **${etf.symbol}** (${etf.name})\n\n`;
    analysis += `📈 Retorno 12m: +${returns}%\n`;
    analysis += `💰 Dividend Yield: ${dividend}%\n`;
    analysis += `⚡ Volatilidade: ${volatility}%\n`;
    analysis += `💵 Assets: $${assets}B\n\n`;
    
    if (etf.sharpe_12m > 1) {
      analysis += `⭐ Excelente relação risco/retorno (Sharpe: ${etf.sharpe_12m.toFixed(2)})`;
    }
  }

  return analysis;
}

// Comparação de múltiplos ETFs
function generateMultipleETFComparison(etfs: ETFContext[], message: string): string {
  let comparison = `🔍 **Comparação de ${etfs.length} ETFs:**\n\n`;

  // Ordenar por performance
  const sortedByReturns = [...etfs].sort((a, b) => b.returns_12m - a.returns_12m);
  const sortedByDividend = [...etfs].sort((a, b) => b.dividend_yield - a.dividend_yield);
  const sortedByRisk = [...etfs].sort((a, b) => a.volatility_12m - b.volatility_12m);

  if (message.includes('melhor') || message.includes('performance')) {
    comparison += `🏆 **Melhor Performance:**\n`;
    sortedByReturns.slice(0, 3).forEach((etf, i) => {
      comparison += `${i + 1}. ${etf.symbol}: +${(etf.returns_12m * 100).toFixed(1)}%\n`;
    });
  }

  if (message.includes('dividendo')) {
    comparison += `\n💰 **Maiores Dividendos:**\n`;
    sortedByDividend.slice(0, 3).forEach((etf, i) => {
      comparison += `${i + 1}. ${etf.symbol}: ${(etf.dividend_yield * 100).toFixed(1)}%\n`;
    });
  }

  if (message.includes('risco') || message.includes('conservador')) {
    comparison += `\n🛡️ **Menor Risco:**\n`;
    sortedByRisk.slice(0, 3).forEach((etf, i) => {
      comparison += `${i + 1}. ${etf.symbol}: ${(etf.volatility_12m * 100).toFixed(1)}% volatilidade\n`;
    });
  }

  // Comparação geral se não especificou categoria
  if (!message.includes('melhor') && !message.includes('dividendo') && !message.includes('risco')) {
    comparison += `📊 **Resumo Comparativo:**\n\n`;
    etfs.forEach(etf => {
      comparison += `**${etf.symbol}:** ${(etf.returns_12m * 100).toFixed(1)}% retorno, `;
      comparison += `${(etf.dividend_yield * 100).toFixed(1)}% yield, `;
      comparison += `${(etf.volatility_12m * 100).toFixed(1)}% volatilidade\n`;
    });

    const bestPerformer = sortedByReturns[0];
    comparison += `\n🎯 **Destaque:** ${bestPerformer.symbol} lidera com +${(bestPerformer.returns_12m * 100).toFixed(1)}%`;
  }

  return comparison;
} 