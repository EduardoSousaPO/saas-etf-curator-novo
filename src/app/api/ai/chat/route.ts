/**
 * API Principal do Chat Conversacional - Vista ETF AI
 * Endpoint: POST /api/ai/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleUserMessage, MessageInput } from '../../../../ai/orchestrator';
import { handleSmartMessage, SmartMessageInput } from '../../../../ai/smart-orchestrator';
import { createClient } from '@supabase/supabase-js';
import { withRateLimit, chatRateLimiter } from '../../../../ai/middleware/rate-limiter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const { userId, projectId, conversationId, message, simulate = true, userContext } = body;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId é obrigatório' 
      }, { status: 400 });
    }
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Mensagem não pode estar vazia' 
      }, { status: 400 });
    }
    
    if (message.length > 2000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Mensagem muito longa (máximo 2000 caracteres)' 
      }, { status: 400 });
    }
    
    console.log(`Nova mensagem do chat: User ${userId}, Message: "${message.slice(0, 50)}..."`);
    
    // Preparar input para o orquestrador
    const messageInput: MessageInput = {
      userId,
      projectId,
      conversationId,
      message: message.trim(),
      simulate,
      userContext: {
        userId,
        level: userContext?.level || 'intermediate',
        preferences: userContext?.preferences || {}
      }
    };
    
    // Aplicar rate limiting e processar mensagem COM INTELIGÊNCIA
    const rateLimitedResult = await withRateLimit(
      chatRateLimiter,
      userId,
      async () => {
        // Usar o novo orquestrador inteligente
        const smartInput: SmartMessageInput = {
          userId,
          projectId,
          conversationId,
          message
        };
        
        return await handleSmartMessage(smartInput);
      }
    );
    
    const result = rateLimitedResult.data;
    
    // Persistir mensagem e resposta no Supabase
    if (result.success) {
      await persistChatExchange(messageInput, result);
    }
    
    // Retornar resposta com headers de rate limit
    const response = NextResponse.json({
      success: result.success,
      message: result.answer,
      intent: result.intent,
      execution_time_ms: result.execution_time_ms,
      trace_id: result.trace_id,
      warnings: result.warnings,
      // Dados do sistema inteligente
      metadata: {
        executed_actions: result.executedActions || [],
        extracted_data: result.extractedData,
        needs_more_info: result.needsMoreInfo,
        next_questions: result.nextQuestions,
        mode: 'intelligent_agent'
      }
    });
    
    // Adicionar headers de rate limit
    response.headers.set('X-RateLimit-Limit', '50');
    response.headers.set('X-RateLimit-Remaining', rateLimitedResult.rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitedResult.rateLimit.resetTime / 1000).toString());
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro na API do chat:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Desculpe, tive um problema técnico. Pode tentar novamente em alguns instantes?'
    }, { status: 500 });
  }
}

/**
 * Persiste troca de mensagens no Supabase
 */
async function persistChatExchange(input: MessageInput, result: any) {
  try {
    // Buscar ou criar conversa
    let conversationId = input.projectId;
    
    if (!conversationId) {
      // Criar projeto padrão se não existir
      const { data: project } = await supabase
        .from('chat_projects')
        .select('id')
        .eq('user_id', input.userId)
        .eq('name', 'Conversa Geral')
        .single();
      
      if (!project) {
        const { data: newProject } = await supabase
          .from('chat_projects')
          .insert({
            user_id: input.userId,
            name: 'Conversa Geral',
            description: 'Projeto padrão para conversas gerais'
          })
          .select('id')
          .single();
        
        if (newProject) {
          // Criar conversa no projeto
          const { data: newConversation } = await supabase
            .from('chat_conversations')
            .insert({
              project_id: newProject.id,
              user_id: input.userId,
              title: 'Nova Conversa'
            })
            .select('id')
            .single();
          
          conversationId = newConversation?.id;
        }
      } else {
        // Buscar conversa existente no projeto
        const { data: conversation } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('project_id', project.id)
          .eq('user_id', input.userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        conversationId = conversation?.id;
        
        if (!conversationId) {
          // Criar nova conversa
          const { data: newConversation } = await supabase
            .from('chat_conversations')
            .insert({
              project_id: project.id,
              user_id: input.userId,
              title: 'Nova Conversa'
            })
            .select('id')
            .single();
          
          conversationId = newConversation?.id;
        }
      }
    }
    
    if (conversationId) {
      // Salvar mensagem do usuário
      const { data: userMessage } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: input.message,
          trace_id: result.trace_id,
          metadata: {
            user_context: input.userContext,
            timestamp: new Date().toISOString()
          }
        })
        .select('id')
        .single();
      
      // Salvar resposta do assistente
      const { data: assistantMessage } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: result.answer || '',
          trace_id: result.trace_id,
          metadata: {
            intent: result.intent,
            execution_time_ms: result.execution_time_ms,
            tools_executed: result.toolResults?.map(r => r.tool) || [],
            warnings: result.warnings || []
          },
          function_calls: result.toolResults || []
        })
        .select('id')
        .single();
      
      // Salvar logs de função se houver
      if (result.toolResults && assistantMessage) {
        const functionLogs = result.toolResults.map((toolResult: any) => ({
          message_id: assistantMessage.id,
          function_name: toolResult.tool || 'unknown',
          parameters: toolResult.parameters || {},
          result: toolResult.data || {},
          execution_time_ms: toolResult.execution_time_ms || 0,
          success: toolResult.success || false,
          error_message: toolResult.error || null,
          trace_id: result.trace_id
        }));
        
        await supabase
          .from('chat_function_logs')
          .insert(functionLogs);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao persistir chat:', error);
    // Não falhar o request principal por erro de persistência
  }
}

/**
 * GET - Buscar histórico de conversas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId é obrigatório' 
      }, { status: 400 });
    }
    
    if (conversationId) {
      // Buscar mensagens de uma conversa específica
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          role,
          content,
          metadata,
          function_calls,
          trace_id,
          created_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        data: messages || []
      });
    } else {
      // Buscar projetos e conversas do usuário
      const { data: projects, error } = await supabase
        .from('chat_projects')
        .select(`
          id,
          name,
          description,
          color,
          created_at,
          chat_conversations (
            id,
            title,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        data: projects || []
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
