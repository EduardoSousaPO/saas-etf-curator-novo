/**
 * API para gerenciamento de projetos de chat - Dashboard ETF Curator
 * FASE 2: Sistema de organização por projetos/pastas
 */

import { NextRequest, NextResponse } from 'next/server';

interface ChatProject {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  userId?: string;
}

interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
}

/**
 * GET /api/ai/projects - Lista projetos do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId é obrigatório'
      }, { status: 400 });
    }

    console.log(`📁 Buscando projetos para usuário: ${userId}`);

    // Usar MCP Supabase para buscar projetos
    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `
        SELECT 
          id, user_id, name, description, color, 
          created_at, updated_at,
          (SELECT COUNT(*) FROM chat_conversations WHERE project_id = cp.id) as conversation_count
        FROM chat_projects cp
        WHERE user_id = $1 OR user_id IS NULL
        ORDER BY created_at DESC
      `,
      params: [userId]
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao buscar projetos');
    }

    console.log(`✅ Projetos encontrados: ${result.data.length}`);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.data.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar projetos:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao buscar projetos de chat'
    }, { status: 500 });
  }
}

/**
 * POST /api/ai/projects - Cria novo projeto
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectRequest = await request.json();
    
    if (!body.name?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Nome do projeto é obrigatório'
      }, { status: 400 });
    }

    console.log(`📁 Criando projeto: ${body.name}`);

    // Usar MCP Supabase para criar projeto
    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `
        INSERT INTO chat_projects (user_id, name, description, color)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, name, description, color, created_at, updated_at
      `,
      params: [
        body.userId || null,
        body.name.trim(),
        body.description?.trim() || null,
        body.color || '#0088FE'
      ]
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar projeto');
    }

    const newProject = result.data[0];
    console.log(`✅ Projeto criado: ${newProject.id}`);

    return NextResponse.json({
      success: true,
      data: newProject,
      message: 'Projeto criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao criar projeto de chat'
    }, { status: 500 });
  }
}

/**
 * PUT /api/ai/projects - Atualiza projeto existente
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'projectId é obrigatório'
      }, { status: 400 });
    }

    const body: UpdateProjectRequest = await request.json();
    
    if (!body.name && !body.description && !body.color) {
      return NextResponse.json({
        success: false,
        error: 'Pelo menos um campo deve ser fornecido para atualização'
      }, { status: 400 });
    }

    console.log(`📁 Atualizando projeto: ${projectId}`);

    // Construir query dinâmica
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (body.name?.trim()) {
      updates.push(`name = $${paramIndex++}`);
      params.push(body.name.trim());
    }

    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(body.description?.trim() || null);
    }

    if (body.color) {
      updates.push(`color = $${paramIndex++}`);
      params.push(body.color);
    }

    updates.push(`updated_at = now()`);
    params.push(projectId);

    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `
        UPDATE chat_projects 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, user_id, name, description, color, created_at, updated_at
      `,
      params: params
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao atualizar projeto');
    }

    if (result.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Projeto não encontrado'
      }, { status: 404 });
    }

    const updatedProject = result.data[0];
    console.log(`✅ Projeto atualizado: ${updatedProject.id}`);

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Projeto atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar projeto:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao atualizar projeto de chat'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/projects - Deleta projeto
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'projectId é obrigatório'
      }, { status: 400 });
    }

    console.log(`📁 Deletando projeto: ${projectId}`);

    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    // Primeiro, deletar conversas relacionadas
    await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `
        DELETE FROM chat_messages 
        WHERE conversation_id IN (
          SELECT id FROM chat_conversations WHERE project_id = $1
        )
      `,
      params: [projectId]
    });

    await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `DELETE FROM chat_conversations WHERE project_id = $1`,
      params: [projectId]
    });

    // Depois, deletar o projeto
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `DELETE FROM chat_projects WHERE id = $1 RETURNING id`,
      params: [projectId]
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao deletar projeto');
    }

    if (result.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Projeto não encontrado'
      }, { status: 404 });
    }

    console.log(`✅ Projeto deletado: ${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Projeto deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar projeto:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao deletar projeto de chat'
    }, { status: 500 });
  }
}

