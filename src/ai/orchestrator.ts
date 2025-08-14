/**
 * Orquestrador Principal - Vista ETF AI
 * Coordena todo o pipeline de processamento de mensagens
 */

import { IntentName, INTENTS, isValidIntent } from './intents';
import { getToolByName, TOOLS_REGISTRY } from './tools.registry';
import { preValidate, postValidate, enforceInternalDataOnly, sanitizeInput, UserContext } from './validators';
import { callOpenAIChat, callVistaAPI, generateTraceId, APICallResult } from './agent.config';
import { buildClassifierPrompt } from './prompts/classifier.intent';
import { CORE_SYSTEM_PROMPT } from './prompts/system.core';
import { DEV_GUARDRAILS_PROMPT as GUARDRAILS } from './prompts/developer.guardrails';
import { buildUserResponse, SynthesisContext } from './prompts/user.templates';
import { withCache, responseCache } from './cache/response-cache';

// Interfaces
export interface MessageInput {
  userId: string;
  projectId?: string;
  conversationId?: string;
  message: string;
  simulate?: boolean;
  userContext?: Partial<UserContext>;
}

export interface ProcessingResult {
  success: boolean;
  intent?: IntentName;
  parsed?: any;
  toolResults?: APICallResult[];
  answer?: string;
  trace_id: string;
  execution_time_ms: number;
  error?: string;
  warnings?: string[];
}

export interface ExecutionLog {
  trace_id: string;
  intent: IntentName;
  tools_executed: string[];
  execution_time_ms: number;
  success: boolean;
  user_id: string;
  project_id?: string;
  created_at: Date;
}

/**
 * Função principal do orquestrador
 * Pipeline: Classificar → Pré-validar → Executar → Sintetizar → Pós-validar → Persistir
 */
export async function handleUserMessage(input: MessageInput): Promise<ProcessingResult> {
  const startTime = Date.now();
  const traceId = generateTraceId();
  
  console.log(`🚀 Iniciando processamento: ${traceId}`);
  console.log(`📝 Mensagem: "${input.message.slice(0, 100)}..."`);
  
  try {
    console.log('🔧 Debug: Iniciando try block do orquestrador');
    
    // Sanitizar entrada
    console.log('🔧 Debug: Sanitizando entrada...');
    const sanitizedMessage = sanitizeInput(input.message);
    console.log(`🔧 Debug: Mensagem sanitizada: "${sanitizedMessage}"`);
    
    // 1. CLASSIFICAR INTENT
    console.log('🎯 Etapa 1: Classificando intent...');
    const intent = await classifyIntent(sanitizedMessage);
    console.log('🔧 Debug: classifyIntent retornou:', intent);
    
    if (!intent) {
      throw new Error('Não foi possível classificar a intenção da mensagem');
    }
    
    console.log(`✅ Intent classificada: ${intent}`);
    
    // 2. PRÉ-VALIDAÇÃO
    console.log('🔍 Etapa 2: Pré-validação...');
    const spec = INTENTS[intent];
    const validation = await preValidate(spec, sanitizedMessage);
    
    if (!validation.success) {
      // Retornar perguntas de follow-up se necessário
      if (validation.followUpQuestions && validation.followUpQuestions.length > 0) {
        const followUpAnswer = await generateFollowUpResponse(validation, intent);
        return {
          success: true,
          intent,
          answer: followUpAnswer,
          trace_id: traceId,
          execution_time_ms: Date.now() - startTime,
          warnings: ['Campos obrigatórios faltando - solicitando informações adicionais']
        };
      } else {
        throw new Error(`Validação falhou: ${validation.errors?.join(', ')}`);
      }
    }
    
    console.log('✅ Pré-validação bem-sucedida');
    
    // 3. GUARDRAILS
    console.log('🛡️ Etapa 3: Aplicando guardrails...');
    enforceInternalDataOnly(intent);
    
    // 4. EXECUÇÃO DE TOOLS
    console.log('⚙️ Etapa 4: Executando tools...');
    const toolResults = await executeTools(spec.allowedTools, validation.data, input.simulate);
    
    // 5. SÍNTESE DA RESPOSTA
    console.log('🧠 Etapa 5: Sintetizando resposta...');
    const synthesisContext: SynthesisContext = {
      intent,
      parsed: validation.data,
      results: toolResults,
      userLevel: input.userContext?.level || 'intermediate',
      mode: input.simulate !== false ? 'simulate' : 'execute'
    };
    
    const answer = await synthesizeResponse(synthesisContext);
    
    // 6. PÓS-VALIDAÇÃO
    console.log('🔍 Etapa 6: Pós-validação...');
    const postValidation = postValidate(answer, toolResults);
    
    if (!postValidation.success) {
      console.warn('⚠️ Pós-validação falhou:', postValidation.errors);
      // Continuar mesmo com avisos de pós-validação
    }
    
    // 7. PERSISTIR LOGS
    console.log('💾 Etapa 7: Persistindo logs...');
    await persistConversation(input, intent, validation.data, toolResults, answer, traceId);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Processamento concluído em ${executionTime}ms`);
    
    return {
      success: true,
      intent,
      parsed: validation.data,
      toolResults,
      answer,
      trace_id: traceId,
      execution_time_ms: executionTime,
      warnings: [...(validation.warnings || []), ...(postValidation.warnings || [])]
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ Erro no processamento (${executionTime}ms):`, error);
    
    // Resposta de erro amigável
    const errorAnswer = generateErrorResponse(error instanceof Error ? error.message : 'Erro desconhecido');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      answer: errorAnswer,
      trace_id: traceId,
      execution_time_ms: executionTime
    };
  }
}

/**
 * Classifica a intent da mensagem usando OpenAI
 */
async function classifyIntent(message: string): Promise<IntentName | null> {
  try {
    // Usar cache para classificação de intents
    return await withCache(
      'intent_classification',
      { message: message.toLowerCase().trim() },
      async () => {
        console.log(`🎯 Classificando intent (cache miss): "${message.substring(0, 50)}..."`);
        
        const prompt = buildClassifierPrompt(message);
        const response = await callOpenAIChat({
          system: "Você é um classificador de intenções. Responda APENAS com o nome da intent.",
          user: prompt,
          maxTokens: 50
        });
        
        const cleanResponse = response.trim().toUpperCase();
        
        if (isValidIntent(cleanResponse)) {
          console.log(`✅ Intent classificada e cacheada: ${cleanResponse}`);
          return cleanResponse as IntentName;
        }
        
        console.warn(`⚠️ Intent inválida retornada: ${cleanResponse}`);
        return null;
      },
      30 * 60 * 1000 // 30 minutos de cache
    );
    
  } catch (error) {
    console.error('❌ Erro na classificação de intent:', error);
    return null;
  }
}

/**
 * Executa tools apropriadas para a intent
 */
async function executeTools(allowedTools: string[], parsedData: any, simulate = true): Promise<APICallResult[]> {
  const results: APICallResult[] = [];
  
  // Adicionar flag de simulação aos dados
  const dataWithSimulate = { ...parsedData, simulate };
  
  for (const toolName of allowedTools) {
    const tool = getToolByName(toolName);
    if (!tool) {
      console.warn(`⚠️ Tool não encontrada: ${toolName}`);
      continue;
    }
    
    console.log(`🔧 Executando tool: ${toolName}`);
    
    try {
      if (tool.usesPerplexity) {
        // Para notícias, usar Perplexity (implementação futura)
        const result = await executePerplexityTool(tool, dataWithSimulate);
        results.push(result);
      } else {
        // Para APIs internas, usar callVistaAPI
        const result = await callVistaAPI(tool, dataWithSimulate);
        results.push({
          ...result,
          tool: toolName
        });
      }
    } catch (error) {
      console.error(`❌ Erro na tool ${toolName}:`, error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        tool: toolName,
        trace_id: generateTraceId(),
        execution_time_ms: 0
      });
    }
  }
  
  return results;
}

/**
 * Executa tool do Perplexity
 */
async function executePerplexityTool(tool: any, data: any): Promise<APICallResult> {
  const startTime = Date.now();
  const traceId = generateTraceId();
  
  console.log(`📰 Executando Perplexity tool: ${tool.name}`);
  
  try {
    if (tool.name === 'perplexity_news_search') {
      // Importar função de busca de notícias
      const { searchNews } = await import('./news.perplexity');
      
      // Executar busca
      const result = await searchNews({
        query: data.query,
        recencyDays: data.recencyDays || 7,
        sources: data.sources,
        language: data.language || 'pt',
        max_results: data.max_results || 5
      });
      
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        tool: tool.name,
        trace_id: traceId,
        execution_time_ms: Date.now() - startTime
      };
    }
    
    // Fallback para outras tools do Perplexity (futuras)
    throw new Error(`Tool Perplexity não implementada: ${tool.name}`);
    
  } catch (error) {
    console.error(`❌ Erro na tool Perplexity ${tool.name}:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      tool: tool.name,
      trace_id: traceId,
      execution_time_ms: Date.now() - startTime
    };
  }
}

/**
 * Sintetiza resposta final usando OpenAI
 */
async function synthesizeResponse(context: SynthesisContext): Promise<string> {
  try {
    const userPrompt = buildUserResponse(context);
    
    const response = await callOpenAIChat({
      system: CORE_SYSTEM_PROMPT,
      developer: GUARDRAILS,
      user: userPrompt,
      forceHeavy: context.intent === 'CREATE_OPTIMIZED_PORTFOLIO', // Usar modelo pesado para análises complexas
      maxTokens: 2000
    });
    
    // Adicionar citação de origem se não estiver presente
    const hasOrigin = response.includes('origem:') || response.includes('trace_id:');
    if (!hasOrigin && context.results.length > 0) {
      const origins = context.results
        .filter(r => r.success && r.trace_id)
        .map(r => `${r.tool}: ${r.trace_id}`)
        .join(', ');
      
      if (origins) {
        return response + `\n\n*origem: ${origins}*`;
      }
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro na síntese:', error);
    return 'Desculpe, tive um problema ao processar sua solicitação. Pode tentar novamente?';
  }
}

/**
 * Gera resposta de follow-up para campos faltantes
 */
async function generateFollowUpResponse(validation: any, intent: IntentName): Promise<string> {
  const questions = validation.followUpQuestions?.slice(0, 2).join('\n- ') || '';
  
  const contextualResponses = {
    CREATE_OPTIMIZED_PORTFOLIO: "Vou ajudar você a criar uma carteira otimizada! Preciso de algumas informações:",
    FILTER_ETFS: "Vou buscar os melhores ETFs para você! Preciso saber:",
    GET_RANKINGS: "Vou mostrar os rankings de ETFs! Preciso especificar:",
    COMPARE_ETFS: "Vou comparar os ETFs para você! Preciso saber:",
    GET_DASHBOARD_PERFORMANCE: "Vou analisar sua carteira! Preciso de:",
  };
  
  const contextResponse = contextualResponses[intent] || "Preciso de mais informações:";
  
  return `${contextResponse}\n\n- ${questions}\n\nPode me fornecer essas informações?`;
}

/**
 * Gera resposta de erro amigável
 */
function generateErrorResponse(error: string): string {
  const friendlyErrors: { [key: string]: string } = {
    'timeout': 'A consulta está demorando mais que o esperado. Pode tentar novamente?',
    'network': 'Tive um problema de conexão. Verifique sua internet e tente novamente.',
    'validation': 'Alguns dados precisam ser ajustados. Pode reformular sua pergunta?',
    'not_found': 'Não encontrei informações para essa consulta. Pode tentar com outros termos?',
  };
  
  // Tentar mapear erro para resposta amigável
  for (const [key, message] of Object.entries(friendlyErrors)) {
    if (error.toLowerCase().includes(key)) {
      return message;
    }
  }
  
  // Resposta genérica
  return `Ops, tive um problema técnico. ${error.includes('API') ? 'Nossos sistemas estão temporariamente instáveis.' : 'Pode tentar reformular sua pergunta?'} Se o problema persistir, entre em contato com o suporte.`;
}

/**
 * Persiste conversa e logs no Supabase (via MCP)
 */
async function persistConversation(
  input: MessageInput, 
  intent: IntentName, 
  parsedData: any, 
  toolResults: APICallResult[], 
  answer: string,
  traceId: string
): Promise<void> {
  try {
    // Esta função será implementada usando MCP Supabase
    console.log('💾 Persistindo conversa (placeholder)');
    console.log(`- User: ${input.userId}`);
    console.log(`- Intent: ${intent}`);
    console.log(`- Tools: ${toolResults.map(r => r.tool).join(', ')}`);
    console.log(`- Trace: ${traceId}`);
    
    // TODO: Implementar com MCP Supabase
    // await mcpSupabase.insert('chat_messages', {...});
    // await mcpSupabase.insert('chat_function_logs', {...});
    
  } catch (error) {
    console.error('❌ Erro ao persistir conversa:', error);
    // Não falhar o processamento por erro de persistência
  }
}

/**
 * Utilitário para testar o orquestrador
 */
export async function testOrchestrator(message: string, userId = 'test_user'): Promise<ProcessingResult> {
  return await handleUserMessage({
    userId,
    message,
    simulate: true,
    userContext: {
      userId,
      level: 'intermediate'
    }
  });
}

/**
 * Middleware para rate limiting (implementação futura)
 */
export function rateLimitMiddleware(userId: string): boolean {
  // Implementação futura
  return true;
}

/**
 * Health check do orquestrador
 */
export async function healthCheck(): Promise<{ status: string; components: any }> {
  const components = {
    openai: 'unknown',
    apis: 'unknown',
    database: 'unknown'
  };
  
  try {
    // Testar OpenAI
    await callOpenAIChat({
      system: "Teste",
      user: "Responda apenas 'OK'",
      maxTokens: 10
    });
    components.openai = 'ok';
  } catch {
    components.openai = 'error';
  }
  
  // Testar APIs (implementar conforme necessário)
  // Testar Database (implementar conforme necessário)
  
  const status = Object.values(components).every(s => s === 'ok') ? 'healthy' : 'degraded';
  
  return { status, components };
}
