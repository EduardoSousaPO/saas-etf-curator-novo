import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';

const OCRTradeSchema = z.object({
  user_id: z.string().uuid(),
  image_data: z.string(), // Base64 encoded image
  image_name: z.string()
});

// Cliente OpenAI será inicializado dinamicamente

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = OCRTradeSchema.parse(body);

    // Validar se a imagem está no formato correto
    let imageData = validatedData.image_data;
    if (!imageData.startsWith('data:image/')) {
      imageData = `data:image/jpeg;base64,${imageData}`;
    }

    // Preparar prompt especializado para análise de ordens de ETFs
    const prompt = `
Você é um especialista em análise de documentos financeiros. Analise esta imagem de ordem de compra/venda de ETF e extraia as seguintes informações:

RETORNE APENAS UM OBJETO JSON com os seguintes campos:
{
  "etf_symbol": "símbolo do ETF (ex: SPY, QQQ, VTI)",
  "side": "BUY ou SELL",
  "trade_date": "data no formato YYYY-MM-DD",
  "quantity": número de cotas/ações,
  "price": preço por cota (número decimal),
  "currency": "USD ou BRL",
  "confidence": "HIGH, MEDIUM ou LOW",
  "broker": "nome da corretora se identificável",
  "total_amount": valor total da operação
}

INSTRUÇÕES ESPECÍFICAS:
- Procure por símbolos de ETFs (normalmente 3-4 letras como SPY, QQQ, VTI, BOVA11, etc.)
- Identifique se é compra (BUY/Comprar) ou venda (SELL/Vender)
- Extraia quantidade de cotas/ações
- Extraia preço unitário
- Identifique moeda (USD, BRL, $, R$)
- Se algum campo não estiver claro, coloque null
- Seja preciso com números (não invente valores)

CORRETORAS BRASILEIRAS COMUNS: XP, Rico, BTG, Inter, Clear, Easynvest
CORRETORAS AMERICANAS COMUNS: Schwab, Fidelity, TD Ameritrade, E*TRADE

Retorne APENAS o JSON, sem texto adicional.`;

    let extractedData;
    
    try {
      console.log('🤖 Iniciando análise OCR com OpenAI GPT-4 Vision...');
      
      // Verificar se a API key está disponível
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY não configurada');
      }

      // Inicializar cliente OpenAI dinamicamente
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Chamar OpenAI GPT-4 Vision para análise da imagem
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1 // Baixa temperatura para maior precisão
      });

      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Resposta vazia da OpenAI');
      }

      console.log('📝 Resposta da OpenAI:', aiResponse);

      // Tentar fazer parse do JSON retornado pela IA
      try {
        // Limpar a resposta para extrair apenas o JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
        
        extractedData = JSON.parse(jsonString);
        
        // Validar e limpar os dados extraídos
        extractedData = {
          etf_symbol: extractedData.etf_symbol?.toString().toUpperCase() || null,
          side: extractedData.side?.toString().toUpperCase() || null,
          trade_date: extractedData.trade_date || new Date().toISOString().split('T')[0],
          quantity: extractedData.quantity ? Number(extractedData.quantity) : null,
          price: extractedData.price ? Number(extractedData.price) : null,
          currency: extractedData.currency?.toString().toUpperCase() || 'USD',
          confidence: extractedData.confidence?.toString().toUpperCase() || 'MEDIUM',
          broker: extractedData.broker || null,
          total_amount: extractedData.total_amount ? Number(extractedData.total_amount) : null
        };

        console.log('✅ Dados extraídos e validados:', extractedData);
        
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON da IA:', parseError);
        console.log('Resposta original:', aiResponse);
        
        // Fallback: tentar extrair informações básicas da resposta de texto
        extractedData = {
          etf_symbol: null,
          side: null,
          trade_date: new Date().toISOString().split('T')[0],
          quantity: null,
          price: null,
          currency: 'USD',
          confidence: 'LOW',
          broker: null,
          total_amount: null
        };
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar com OpenAI:', error);
      
      // Fallback para dados mock se OpenAI falhar
      extractedData = {
        etf_symbol: null,
        side: null,
        trade_date: new Date().toISOString().split('T')[0],
        quantity: null,
        price: null,
        currency: 'USD',
        confidence: 'LOW',
        broker: null,
        total_amount: null,
        error: 'Falha na análise da IA - verifique se a imagem está clara'
      };
    }

    // Verificar se conseguimos extrair informações básicas
    const hasMinimalInfo = extractedData.etf_symbol && extractedData.side && 
                          extractedData.quantity && extractedData.price;

    if (!hasMinimalInfo && extractedData.confidence !== 'LOW') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Não foi possível extrair informações suficientes da imagem',
          details: 'Certifique-se de que a imagem está clara e contém informações sobre ETF, operação, quantidade e preço',
          partial_data: extractedData
        },
        { status: 400 }
      );
    }

    // Registrar tentativa de OCR para auditoria
    console.log('📊 OCR concluído:', {
      user_id: validatedData.user_id,
      image_name: validatedData.image_name,
      confidence: extractedData.confidence,
      extracted_symbol: extractedData.etf_symbol
    });

    return NextResponse.json({
      success: true,
      data: {
        etf_symbol: extractedData.etf_symbol,
        side: extractedData.side as 'BUY' | 'SELL',
        trade_date: extractedData.trade_date,
        quantity: extractedData.quantity,
        price: extractedData.price,
        currency: extractedData.currency,
        confidence: extractedData.confidence,
        broker: extractedData.broker,
        total_amount: extractedData.total_amount,
        extracted_at: new Date().toISOString(),
        image_name: validatedData.image_name,
        ai_provider: 'OpenAI GPT-4 Vision'
      },
      message: extractedData.error || 
               `Informações extraídas com confiança ${extractedData.confidence}. ${
                 extractedData.confidence === 'LOW' ? 'Verifique cuidadosamente os dados antes de confirmar.' :
                 extractedData.confidence === 'HIGH' ? 'Dados extraídos com alta precisão.' :
                 'Verifique os dados antes de confirmar.'
               }`
    });

  } catch (error) {
    console.error('Erro no OCR de trade:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para validar símbolos de ETF
function validateETFSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') return false;
  
  // Lista de símbolos conhecidos (pode ser expandida)
  const knownETFs = [
    'SPY', 'QQQ', 'VTI', 'VXUS', 'BND', 'VEA', 'VWO', 'IEMG', 'AGG', 'LQD',
    'IVV', 'VOO', 'VEU', 'VNQ', 'VTEB', 'SCHX', 'SCHA', 'SCHF', 'SCHB',
    'BOVA11', 'IVVB11', 'SMAL11', 'XBOV11', 'BRAX11', 'DIVO11'
  ];
  
  const cleanSymbol = symbol.toUpperCase().trim();
  
  // Verificar se está na lista conhecida
  if (knownETFs.includes(cleanSymbol)) return true;
  
  // Verificar padrões típicos de ETF
  // ETFs americanos: 3-4 letras
  // ETFs brasileiros: 4-5 letras + 11
  const usPattern = /^[A-Z]{3,4}$/;
  const brPattern = /^[A-Z]{4,5}11$/;
  
  return usPattern.test(cleanSymbol) || brPattern.test(cleanSymbol);
}

