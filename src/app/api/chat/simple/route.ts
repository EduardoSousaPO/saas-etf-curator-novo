import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    // Detectar se usuário quer portfolio
    const portfolioKeywords = ['carteira', 'portfolio', 'investir', 'aplicar', 'montar', 'sugestão', 'recomendação'];
    const wantsPortfolio = portfolioKeywords.some(keyword => message.toLowerCase().includes(keyword));

    if (wantsPortfolio) {
      // Extrair parâmetros básicos da mensagem
      const amount = extractAmount(message) || 50000;
      const riskProfile = extractRiskProfile(message) || 'moderate';
      const objective = extractObjective(message) || 'growth';

      // Chamar Portfolio Master API
      try {
        const portfolioResponse = await fetch('http://localhost:3000/api/portfolio/unified-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investmentAmount: amount,
            riskProfile,
            objective,
            timeHorizon: 60,
            preferences: {
              includeInternational: true,
              sustainableOnly: false,
              maxExpenseRatio: 1.0
            },
            includeBenchmarking: true
          })
        });

        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          const portfolio = portfolioData.unified_recommendation?.recommended_portfolio;
          
          if (portfolio?.etfs?.length > 0) {
            return generatePortfolioResponse(portfolio, portfolioData.unified_recommendation, amount, riskProfile, objective);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar portfolio:', error);
      }
    }

    // Para outras mensagens, usar resposta genérica inteligente
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: `Você é o Vista ETF Assistant, especialista em ETFs e investimentos. 
          
          - Mantenha respostas concisas e práticas
          - Use dados reais quando possível
          - Para pedidos de carteira, peça informações específicas (valor, perfil de risco, objetivo)
          - Seja educativo mas não prolixo
          - Use formatação markdown para melhor legibilidade`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Erro no chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function extractAmount(message: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*mil/i,
    /(\d+(?:\.\d+)?)\s*k/i,
    /(\d+(?:\.\d+)?)\s*thousand/i,
    /R?\$?\s*(\d+(?:\.\d+)?)\s*mil/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return parseFloat(match[1]) * 1000;
    }
  }
  
  const directAmount = message.match(/R?\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (directAmount) {
    return parseFloat(directAmount[1].replace(',', ''));
  }
  
  return null;
}

function extractRiskProfile(message: string): string {
  if (/conservador|baixo risco|seguro/i.test(message)) return 'conservative';
  if (/arrojado|alto risco|agressivo/i.test(message)) return 'aggressive';
  return 'moderate';
}

function extractObjective(message: string): string {
  if (/aposentadoria|retirement/i.test(message)) return 'retirement';
  if (/emergência|emergency/i.test(message)) return 'emergency';
  if (/casa|house|imóvel/i.test(message)) return 'house';
  return 'growth';
}

function generatePortfolioResponse(portfolio: any, fullData: any, amount: number, riskProfile: string, objective: string) {
  const etfs = portfolio.etfs || [];
  const metrics = fullData.portfolio_metrics || {};
  
  let response = `# 🎯 **Portfolio Personalizado Vista ETF**

## 💰 **Resumo do Investimento**
- **Valor**: $${amount.toLocaleString()}
- **Perfil**: ${riskProfile === 'conservative' ? 'Conservador' : riskProfile === 'aggressive' ? 'Arrojado' : 'Moderado'}
- **Objetivo**: ${objective === 'retirement' ? 'Aposentadoria' : objective === 'emergency' ? 'Emergência' : objective === 'house' ? 'Casa Própria' : 'Crescimento'}

## 📊 **Composição Recomendada**

`;

  etfs.slice(0, 6).forEach((etf: any, index: number) => {
    const allocation = etf.allocation_percent || 0;
    const expenseRatio = etf.metrics?.expense_ratio || 0;
    
    response += `**${index + 1}. ${etf.symbol}** - ${allocation.toFixed(1)}%
   📈 *${etf.name}*
   💸 Taxa: ${expenseRatio.toFixed(2)}% a.a.

`;
  });

  if (metrics.expected_return || metrics.expected_volatility || metrics.sharpe_ratio) {
    response += `
## 📈 **Métricas Esperadas**
- **Retorno Anual**: ${(metrics.expected_return || 0).toFixed(1)}%
- **Volatilidade**: ${(metrics.expected_volatility || 0).toFixed(1)}%
- **Sharpe Ratio**: ${(metrics.sharpe_ratio || 0).toFixed(2)}

`;
  }

  response += `
## 🎯 **Próximos Passos**
1. Revise a alocação sugerida
2. Considere seu perfil de risco
3. Monitore regularmente o desempenho
4. Rebalanceie quando necessário

*Portfolio gerado usando dados reais de 1.370+ ETFs via Vista ETF Assistant*
`;

  return new Response(response, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
} 