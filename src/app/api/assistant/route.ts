import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
Você é um assistente especializado em ETFs (Exchange Traded Funds) brasileiro e investimentos.

CARACTERÍSTICAS:
- Responda sempre em português brasileiro claro e acessível
- Use linguagem didática, apropriada tanto para iniciantes quanto experientes
- Evite jargões desnecessários, mas explique termos técnicos quando necessário
- Seja preciso mas NUNCA dê conselhos específicos de investimento personalizado
- Sempre lembre que suas respostas são educativas, não aconselhamento financeiro
- Foque em educação, esclarecimento de dúvidas e orientação geral

CONTEXTO:
- Você está ajudando usuários do ETF Curator, uma plataforma de análise de ETFs
- Os usuários podem ter diferentes níveis de conhecimento
- A plataforma oferece comparação, rankings e análise de ETFs
- Sempre mencione que a plataforma não oferece aconselhamento financeiro personalizado

FORMATO DAS RESPOSTAS:
- Seja conciso (máximo 250 palavras por resposta)
- Use exemplos práticos quando possível
- Sugira funcionalidades do ETF Curator quando relevante
- Estruture respostas com quebras de linha para facilitar leitura
- Use emojis ocasionalmente para tornar a conversa mais amigável

TÓPICOS QUE VOCÊ DOMINA:
- ETFs: conceitos, tipos, vantagens e desvantagens
- Métricas financeiras: Sharpe, volatilidade, drawdown, expense ratio, etc.
- Diversificação e gestão de risco
- Fundamentos de investimentos
- Comparação entre diferentes ETFs
- Interpretação de dados financeiros

DISCLAIMER:
Sempre inclua um lembrete sobre não constituir aconselhamento financeiro quando apropriado.
`;

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida' },
        { status: 400 }
      );
    }

    // Se OpenAI não estiver configurada, usar respostas básicas
    if (!process.env.OPENAI_API_KEY) {
      const basicResponse = generateBasicResponse(message);
      return NextResponse.json({ response: basicResponse });
    }

    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Limitar histórico para evitar tokens excessivos
    const limitedHistory = (chatHistory || []).slice(-10);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...limitedHistory,
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 400,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0].message.content;

    if (!response) {
      throw new Error('Resposta vazia da API');
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erro no assistente:', error);
    
    // Fallback para resposta básica em caso de erro
    const basicResponse = generateBasicResponse(
      (await request.json()).message || "Desculpe, tive um problema técnico."
    );
    
    return NextResponse.json({ response: basicResponse });
  }
}

function generateBasicResponse(message: string): string {
  const lowercaseMessage = message.toLowerCase();
  
  // Respostas baseadas em palavras-chave
  if (lowercaseMessage.includes('etf') || lowercaseMessage.includes('fundo')) {
    return `📊 ETFs são fundos de investimento que replicam índices e são negociados na bolsa como ações.

**Vantagens principais:**
• Diversificação automática
• Baixo custo (expense ratio)
• Liquidez durante o pregão
• Transparência das posições

Use o comparador do ETF Curator para analisar diferentes opções e suas métricas de risco/retorno!

*Esta é uma explicação geral, não constitui aconselhamento financeiro.*`;
  }
  
  if (lowercaseMessage.includes('volatilidade') || lowercaseMessage.includes('risco')) {
    return `⚠️ **Volatilidade** mede o quanto o preço de um ETF oscila em relação à sua média.

• **Alta volatilidade** = maior risco, mas também maior potencial de ganho
• **Baixa volatilidade** = investimento mais estável

No ETF Curator, você pode comparar a volatilidade de diferentes ETFs na seção "Risco" do comparador.

*Lembre-se: maior retorno geralmente vem com maior risco!*`;
  }
  
  if (lowercaseMessage.includes('sharpe') || lowercaseMessage.includes('índice')) {
    return `📈 **Índice Sharpe** mede o retorno ajustado ao risco de um investimento.

**Como interpretar:**
• Sharpe > 1.0 = bom
• Sharpe > 1.5 = muito bom  
• Sharpe > 2.0 = excelente

Quanto maior o Sharpe, melhor o equilíbrio entre risco e retorno. Use esta métrica no comparador para encontrar ETFs eficientes!`;
  }
  
  if (lowercaseMessage.includes('como') || lowercaseMessage.includes('começar')) {
    return `🎯 **Para começar com ETFs:**

1. **Defina seu perfil** (conservador, moderado, arrojado)
2. **Use o Screener** para filtrar ETFs por critérios
3. **Compare opções** usando nossa ferramenta de comparação
4. **Analise métricas** como expense ratio, volatilidade e retornos
5. **Diversifique** entre diferentes setores/regiões

O ETF Curator tem todas essas ferramentas! Explore as seções Rankings e Comparador.

*Considere sempre consultar um assessor qualificado.*`;
  }
  
  if (lowercaseMessage.includes('custo') || lowercaseMessage.includes('taxa')) {
    return `💰 **Custos em ETFs:**

• **Expense Ratio**: taxa anual de administração (ex: 0.5% ao ano)
• **Corretagem**: taxa da corretora para compra/venda
• **Spread**: diferença entre preço de compra e venda

**Dica:** ETFs com expense ratio abaixo de 0.5% são considerados de baixo custo. Use o filtro do Screener para encontrá-los!`;
  }
  
  // Resposta padrão
  return `👋 Olá! Sou seu assistente especializado em ETFs.

Posso te ajudar com:
• Conceitos sobre ETFs e investimentos
• Explicação de métricas financeiras
• Como usar as ferramentas do ETF Curator
• Orientações gerais sobre diversificação

Como posso te ajudar hoje? 😊

*Lembre-se: minhas respostas são educativas, não constituem aconselhamento financeiro personalizado.*`;
}

export async function GET() {
  return NextResponse.json(
    { message: 'Assistente ETF Curator ativo! Use POST para enviar mensagens.' },
    { status: 200 }
  );
} 