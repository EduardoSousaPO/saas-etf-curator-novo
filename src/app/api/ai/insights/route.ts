/**
 * API para gerenciamento de insights automáticos - Dashboard ETF Curator
 * FASE 3: Analytics e geração de insights baseados em conversas
 */

import { NextRequest, NextResponse } from 'next/server';

interface ChatInsight {
  id: string;
  project_id: string | null;
  user_id: string | null;
  type: 'recommendation' | 'analysis' | 'warning' | 'opportunity';
  title: string;
  content: string | null;
  data: any;
  created_at: string;
}

interface CreateInsightRequest {
  projectId?: string;
  userId?: string;
  type: 'recommendation' | 'analysis' | 'warning' | 'opportunity';
  title: string;
  content?: string;
  data?: any;
}

interface GenerateInsightsRequest {
  projectId?: string;
  userId?: string;
  conversationId?: string;
  analysisType?: 'conversation' | 'project' | 'user';
}

/**
 * GET /api/ai/insights - Lista insights por projeto/usuário
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!projectId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'projectId ou userId é obrigatório'
      }, { status: 400 });
    }

    console.log(`💡 Buscando insights - Project: ${projectId}, User: ${userId}, Type: ${type}`);

    // Usar MCP Supabase para buscar insights
    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    let query = `
      SELECT 
        i.id, i.project_id, i.user_id, i.type, i.title, 
        i.content, i.data, i.created_at,
        p.name as project_name, p.color as project_color
      FROM chat_insights i
      LEFT JOIN chat_projects p ON i.project_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (projectId) {
      query += ` AND i.project_id = $${paramIndex++}`;
      params.push(projectId);
    }

    if (userId) {
      query += ` AND i.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (type) {
      query += ` AND i.type = $${paramIndex++}`;
      params.push(type);
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query,
      params
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao buscar insights');
    }

    console.log(`✅ Insights encontrados: ${result.data.length}`);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.data.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar insights:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao buscar insights'
    }, { status: 500 });
  }
}

/**
 * POST /api/ai/insights - Cria insight manual ou gera insights automáticos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar se é uma solicitação de geração automática
    if (body.generate === true) {
      return await generateAutomaticInsights(body);
    }
    
    // Criar insight manual
    const createRequest: CreateInsightRequest = body;
    
    if (!createRequest.title?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Título do insight é obrigatório'
      }, { status: 400 });
    }

    console.log(`💡 Criando insight: ${createRequest.title}`);

    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `
        INSERT INTO chat_insights (project_id, user_id, type, title, content, data)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, project_id, user_id, type, title, content, data, created_at
      `,
      params: [
        createRequest.projectId || null,
        createRequest.userId || null,
        createRequest.type,
        createRequest.title.trim(),
        createRequest.content?.trim() || null,
        JSON.stringify(createRequest.data || {})
      ]
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar insight');
    }

    const newInsight = result.data[0];
    console.log(`✅ Insight criado: ${newInsight.id}`);

    return NextResponse.json({
      success: true,
      data: newInsight,
      message: 'Insight criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar insight:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao criar insight'
    }, { status: 500 });
  }
}

/**
 * Gera insights automáticos baseados em conversas
 */
async function generateAutomaticInsights(request: GenerateInsightsRequest): Promise<NextResponse> {
  try {
    console.log(`🤖 Gerando insights automáticos - Type: ${request.analysisType}`);
    
    // Simular análise de conversas e geração de insights
    const insights = await analyzeConversationsAndGenerateInsights(request);
    
    // Salvar insights gerados no banco
    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const savedInsights = [];
    
    for (const insight of insights) {
      const result = await mcp_supabase_execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: `
          INSERT INTO chat_insights (project_id, user_id, type, title, content, data)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, project_id, user_id, type, title, content, data, created_at
        `,
        params: [
          insight.projectId || null,
          insight.userId || null,
          insight.type,
          insight.title,
          insight.content || null,
          JSON.stringify(insight.data || {})
        ]
      });
      
      if (result.success && result.data[0]) {
        savedInsights.push(result.data[0]);
      }
    }
    
    console.log(`✅ ${savedInsights.length} insights automáticos gerados`);
    
    return NextResponse.json({
      success: true,
      data: savedInsights,
      total: savedInsights.length,
      message: `${savedInsights.length} insights automáticos gerados com sucesso`
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar insights automáticos:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao gerar insights automáticos'
    }, { status: 500 });
  }
}

/**
 * Analisa conversas e gera insights inteligentes
 */
async function analyzeConversationsAndGenerateInsights(request: GenerateInsightsRequest) {
  // Simular análise baseada em IA das conversas
  const insights = [];
  
  if (request.analysisType === 'project' || !request.analysisType) {
    insights.push({
      projectId: request.projectId,
      userId: request.userId,
      type: 'analysis' as const,
      title: 'Padrão de Interesse Identificado',
      content: 'Baseado nas suas conversas, você demonstra forte interesse em ETFs de tecnologia, especialmente QQQ e VTI. Considere diversificar com ETFs de outros setores.',
      data: {
        confidence: 0.85,
        keywords: ['QQQ', 'VTI', 'tecnologia', 'diversificação'],
        conversations_analyzed: 5,
        pattern: 'tech_focus'
      }
    });
    
    insights.push({
      projectId: request.projectId,
      userId: request.userId,
      type: 'recommendation' as const,
      title: 'Oportunidade de Diversificação',
      content: 'Com base no seu perfil de investimento, recomendamos adicionar exposição internacional com VXUS e bonds com BND para melhor diversificação.',
      data: {
        recommended_etfs: ['VXUS', 'BND', 'VEA'],
        risk_reduction: 15,
        expected_return: 8.5,
        allocation_suggestion: {
          'QQQ': 30,
          'VTI': 40,
          'VXUS': 20,
          'BND': 10
        }
      }
    });
  }
  
  if (request.analysisType === 'conversation') {
    insights.push({
      projectId: request.projectId,
      userId: request.userId,
      type: 'opportunity' as const,
      title: 'Momento Favorável para Rebalanceamento',
      content: 'O mercado atual apresenta uma oportunidade interessante para rebalancear seu portfolio. ETFs de value estão com desconto.',
      data: {
        market_conditions: 'favorable',
        value_discount: 12,
        suggested_action: 'rebalance',
        timing_score: 0.78
      }
    });
  }
  
  if (request.analysisType === 'user') {
    insights.push({
      projectId: request.projectId,
      userId: request.userId,
      type: 'warning' as const,
      title: 'Concentração de Risco Detectada',
      content: 'Suas discussões indicam alta concentração em um único setor. Considere revisar sua estratégia de diversificação.',
      data: {
        risk_level: 'medium',
        concentration_sector: 'technology',
        concentration_percentage: 70,
        suggested_max: 40
      }
    });
  }
  
  return insights;
}

/**
 * DELETE /api/ai/insights - Remove insight
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const insightId = searchParams.get('insightId');
    
    if (!insightId) {
      return NextResponse.json({
        success: false,
        error: 'insightId é obrigatório'
      }, { status: 400 });
    }

    console.log(`💡 Deletando insight: ${insightId}`);

    const { mcp_supabase_execute_sql } = await import('../../../../lib/mcp/supabase-client');
    
    const result = await mcp_supabase_execute_sql({
      project_id: 'nniabnjuwzeqmflrruga',
      query: `DELETE FROM chat_insights WHERE id = $1 RETURNING id`,
      params: [insightId]
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao deletar insight');
    }

    if (result.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Insight não encontrado'
      }, { status: 404 });
    }

    console.log(`✅ Insight deletado: ${insightId}`);

    return NextResponse.json({
      success: true,
      message: 'Insight deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar insight:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao deletar insight'
    }, { status: 500 });
  }
}

