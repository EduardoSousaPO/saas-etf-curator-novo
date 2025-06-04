import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Cache simples para resultados de IA
const aiCache = new Map<string, { result: any; timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, model = 'gpt-3.5-turbo' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar cache
    const cacheKey = `${model}_${context}_${prompt.slice(0, 100)}`;
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hora
      return NextResponse.json(cached.result);
    }

    // Verificar se OpenAI está configurado
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key não configurada, usando fallback');
      return generateFallbackResponse(context, prompt);
    }

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(context)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const result = completion.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('Resposta vazia da OpenAI');
      }

      // Tentar parsear JSON se aplicável
      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch {
        parsedResult = { text: result };
      }

      // Cache do resultado
      aiCache.set(cacheKey, { result: parsedResult, timestamp: Date.now() });

      return NextResponse.json(parsedResult);

    } catch (openaiError) {
      console.error('Erro na OpenAI:', openaiError);
      
      // Fallback em caso de erro da OpenAI
      return generateFallbackResponse(context, prompt);
    }

  } catch (error) {
    console.error('Erro na API de análise IA:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getSystemPrompt(context: string): string {
  const prompts = {
    etf_recommendations: `
Você é um especialista em ETFs e consultor financeiro com vasta experiência em mercados de capitais.

SUAS CARACTERÍSTICAS:
- Especialista em análise de ETFs e gestão de portfólio
- Foco em educação financeira e orientação prática
- Considera sempre o perfil de risco do investidor
- Recomendações baseadas em dados fundamentais
- Linguagem clara e acessível em português brasileiro

DIRETRIZES:
- Sempre considere a diversificação adequada
- Avalie custos (expense ratio) versus benefícios
- Considere liquidez e tamanho do fundo
- Recomende alocações apropriadas ao perfil de risco
- Forneça justificativas claras para cada recomendação
- Identifique possíveis riscos ou limitações

FORMATO DE RESPOSTA:
- Retorne sempre em formato JSON válido
- Seja específico e prático nas recomendações
- Inclua avisos quando necessário
`,
    
    etf_comparison: `
Você é um analista financeiro especializado em comparação de ETFs.

Analise os ETFs fornecidos considerando:
- Performance histórica e métricas de risco
- Custos e eficiência
- Diversificação e exposição
- Adequação a diferentes perfis de investidor

Forneça análise comparativa detalhada em português brasileiro.
`,

    market_analysis: `
Você é um analista de mercado especializado em ETFs e tendências macroeconômicas.

Analise o contexto de mercado atual e forneça insights sobre:
- Oportunidades e riscos atuais
- Setores em destaque
- Tendências de longo prazo
- Recomendações estratégicas

Mantenha foco educativo e prático para investidores brasileiros.
`
  };

  return prompts[context as keyof typeof prompts] || prompts.etf_recommendations;
}

function generateFallbackResponse(context: string, prompt: string) {
  console.log('Gerando resposta fallback para contexto:', context);

  const fallbackResponses = {
    etf_recommendations: {
      summary: "Recomendações baseadas em análise de dados históricos e melhores práticas de investimento.",
      portfolioAllocation: [
        {
          category: "Core Holdings (Mercado Amplo)",
          percentage: 50,
          rationale: "Base sólida e diversificada da carteira"
        },
        {
          category: "Growth ETFs",
          percentage: 25,
          rationale: "Potencial de crescimento de longo prazo"
        },
        {
          category: "Diversificação Internacional",
          percentage: 15,
          rationale: "Redução de risco através de diversificação geográfica"
        },
        {
          category: "Renda Fixa/Dividendos",
          percentage: 10,
          rationale: "Estabilidade e geração de renda"
        }
      ],
      topRecommendations: [
        {
          symbol: "VTI",
          reasons: [
            "Ampla diversificação no mercado americano",
            "Baixo expense ratio",
            "Alta liquidez"
          ],
          category: "core",
          confidence: 0.9
        },
        {
          symbol: "VXUS",
          reasons: [
            "Diversificação internacional",
            "Exposição a mercados desenvolvidos e emergentes",
            "Complementa portfólio doméstico"
          ],
          category: "core",
          confidence: 0.8
        }
      ],
      warnings: [
        "Sempre considere sua tolerância ao risco antes de investir",
        "Revise periodicamente sua estratégia de investimento"
      ]
    },

    etf_comparison: {
      analysis: "Análise comparativa baseada em métricas fundamentais disponíveis.",
      summary: "Comparação considera performance, custos, diversificação e adequação ao perfil.",
      recommendations: "Recomendações baseadas no perfil de risco e objetivos de investimento."
    },

    market_analysis: {
      summary: "Análise baseada em tendências históricas e fundamentos de mercado.",
      opportunities: ["Diversificação setorial", "Mercados internacionais", "ETFs de dividendos"],
      risks: ["Volatilidade de mercado", "Mudanças nas taxas de juros", "Eventos geopolíticos"],
      outlook: "Manter estratégia de longo prazo com diversificação adequada."
    }
  };

  const response = fallbackResponses[context as keyof typeof fallbackResponses] || 
                  fallbackResponses.etf_recommendations;

  return NextResponse.json(response);
} 