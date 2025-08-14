/**
 * API para gerenciamento de conversas de chat - Dashboard ETF Curator
 * FASE 2: Sistema de múltiplas conversas por projeto
 */

import { NextRequest, NextResponse } from 'next/server';

interface ChatConversation {
  id: string;
  project_id: string | null;
  user_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateConversationRequest {
  projectId?: string;
  userId?: string;
  title?: string;
}

interface UpdateConversationRequest {
  title?: string;
  projectId?: string;
}

/**
 * GET /api/ai/conversations - Lista conversas por projeto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    
    if (!projectId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'projectId ou userId é obrigatório'
      }, { status: 400 });
    }

    console.log(`💬 Buscando conversas - Project: ${projectId}, User: ${userId}`);

    // Usar MCP Supabase para buscar conversas
    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    let query = `
      SELECT 
        c.id, c.project_id, c.user_id, c.title, 
        c.created_at, c.updated_at,
        p.name as project_name, p.color as project_color,
        (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM chat_messages WHERE conversation_id = c.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as first_message
      FROM chat_conversations c
      LEFT JOIN chat_projects p ON c.project_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (projectId) {
      query += ` AND c.project_id = $${paramIndex++}`;
      params.push(projectId);
    }

    if (userId) {
      query += ` AND c.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    query += ` ORDER BY c.updated_at DESC`;

    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query,
      params
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao buscar conversas');
    }

    console.log(`✅ Conversas encontradas: ${result.data.length}`);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.data.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar conversas:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao buscar conversas de chat'
    }, { status: 500 });
  }
}

/**
 * POST /api/ai/conversations - Cria nova conversa
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateConversationRequest = await request.json();
    
    console.log(`💬 Criando conversa - Project: ${body.projectId}, Title: ${body.title}`);

    // Usar MCP Supabase para criar conversa
    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `
        INSERT INTO chat_conversations (project_id, user_id, title)
        VALUES ($1, $2, $3)
        RETURNING id, project_id, user_id, title, created_at, updated_at
      `,
      params: [
        body.projectId || null,
        body.userId || null,
        body.title || null
      ]
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar conversa');
    }

    const newConversation = result.data[0];
    console.log(`✅ Conversa criada: ${newConversation.id}`);

    return NextResponse.json({
      success: true,
      data: newConversation,
      message: 'Conversa criada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar conversa:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao criar conversa de chat'
    }, { status: 500 });
  }
}

/**
 * PUT /api/ai/conversations - Atualiza conversa existente
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'conversationId é obrigatório'
      }, { status: 400 });
    }

    const body: UpdateConversationRequest = await request.json();
    
    if (!body.title && !body.projectId) {
      return NextResponse.json({
        success: false,
        error: 'Pelo menos um campo deve ser fornecido para atualização'
      }, { status: 400 });
    }

    console.log(`💬 Atualizando conversa: ${conversationId}`);

    // Construir query dinâmica
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(body.title?.trim() || null);
    }

    if (body.projectId !== undefined) {
      updates.push(`project_id = $${paramIndex++}`);
      params.push(body.projectId || null);
    }

    updates.push(`updated_at = now()`);
    params.push(conversationId);

    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `
        UPDATE chat_conversations 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, project_id, user_id, title, created_at, updated_at
      `,
      params: params
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao atualizar conversa');
    }

    if (result.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Conversa não encontrada'
      }, { status: 404 });
    }

    const updatedConversation = result.data[0];
    console.log(`✅ Conversa atualizada: ${updatedConversation.id}`);

    return NextResponse.json({
      success: true,
      data: updatedConversation,
      message: 'Conversa atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar conversa:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao atualizar conversa de chat'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/conversations - Deleta conversa
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'conversationId é obrigatório'
      }, { status: 400 });
    }

    console.log(`💬 Deletando conversa: ${conversationId}`);

    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    // Primeiro, deletar mensagens relacionadas
    await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `DELETE FROM chat_function_logs WHERE message_id IN (
        SELECT id FROM chat_messages WHERE conversation_id = $1
      )`,
      params: [conversationId]
    });

    await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `DELETE FROM chat_messages WHERE conversation_id = $1`,
      params: [conversationId]
    });

    // Depois, deletar a conversa
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `DELETE FROM chat_conversations WHERE id = $1 RETURNING id`,
      params: [conversationId]
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao deletar conversa');
    }

    if (result.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Conversa não encontrada'
      }, { status: 404 });
    }

    console.log(`✅ Conversa deletada: ${conversationId}`);

    return NextResponse.json({
      success: true,
      message: 'Conversa deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar conversa:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao deletar conversa de chat'
    }, { status: 500 });
  }
}

