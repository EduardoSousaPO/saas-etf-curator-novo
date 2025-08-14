/**
 * API para analytics e métricas de chat - Dashboard ETF Curator
 * FASE 3: Analytics avançadas das conversas e uso do sistema
 */

import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsRequest {
  userId?: string;
  projectId?: string;
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}

interface ConversationMetrics {
  total_conversations: number;
  total_messages: number;
  avg_messages_per_conversation: number;
  active_projects: number;
  most_used_intents: Array<{ intent: string; count: number }>;
  conversation_length_distribution: Array<{ range: string; count: number }>;
  daily_activity: Array<{ date: string; conversations: number; messages: number }>;
}

interface ProjectMetrics {
  project_id: string;
  project_name: string;
  conversation_count: number;
  message_count: number;
  avg_conversation_length: number;
  most_discussed_topics: string[];
  user_engagement: number;
  created_at: string;
}

interface UserBehaviorMetrics {
  session_duration_avg: number;
  preferred_intents: Array<{ intent: string; percentage: number }>;
  peak_usage_hours: Array<{ hour: number; usage_count: number }>;
  topics_of_interest: Array<{ topic: string; mentions: number }>;
  question_complexity_score: number;
}

/**
 * GET /api/ai/analytics - Retorna métricas e analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type') || 'overview';
    const timeframe = searchParams.get('timeframe') || 'month';
    
    if (!userId && !projectId) {
      return NextResponse.json({
        success: false,
        error: 'userId ou projectId é obrigatório'
      }, { status: 400 });
    }

    console.log(`📊 Gerando analytics - Type: ${type}, Timeframe: ${timeframe}`);

    let analytics = {};

    switch (type) {
      case 'overview':
        analytics = await getOverviewAnalytics({ userId, projectId, timeframe });
        break;
      case 'conversations':
        analytics = await getConversationMetrics({ userId, projectId, timeframe });
        break;
      case 'projects':
        analytics = await getProjectMetrics({ userId, timeframe });
        break;
      case 'behavior':
        analytics = await getUserBehaviorMetrics({ userId, timeframe });
        break;
      case 'performance':
        analytics = await getPerformanceMetrics({ userId, projectId, timeframe });
        break;
      default:
        throw new Error(`Tipo de analytics não suportado: ${type}`);
    }

    console.log(`✅ Analytics gerado para tipo: ${type}`);

    return NextResponse.json({
      success: true,
      data: analytics,
      type,
      timeframe,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao gerar analytics:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao gerar analytics'
    }, { status: 500 });
  }
}

/**
 * Gera analytics de overview geral
 */
async function getOverviewAnalytics(params: AnalyticsRequest) {
  // Simular dados de analytics baseados em dados reais esperados
  return {
    summary: {
      total_conversations: 47,
      total_messages: 312,
      total_projects: 8,
      total_insights: 23,
      avg_session_duration: 18.5, // minutos
      growth_rate: 15.2 // percentual
    },
    activity_timeline: [
      { date: '2025-01-07', conversations: 3, messages: 18 },
      { date: '2025-01-08', conversations: 5, messages: 29 },
      { date: '2025-01-09', conversations: 2, messages: 14 },
      { date: '2025-01-10', conversations: 7, messages: 41 },
      { date: '2025-01-11', conversations: 4, messages: 26 },
      { date: '2025-01-12', conversations: 6, messages: 35 },
      { date: '2025-01-13', conversations: 8, messages: 52 }
    ],
    top_intents: [
      { intent: 'COMPARE_ETFS', count: 89, percentage: 28.5 },
      { intent: 'GET_DASHBOARD_PERFORMANCE', count: 67, percentage: 21.5 },
      { intent: 'GET_NEWS_RECENT', count: 54, percentage: 17.3 },
      { intent: 'EXPLAIN_CONCEPT', count: 43, percentage: 13.8 },
      { intent: 'GENERAL_HELP', count: 59, percentage: 18.9 }
    ],
    project_distribution: [
      { name: 'Análise de ETFs', conversations: 15, percentage: 31.9 },
      { name: 'Portfolio Master', conversations: 12, percentage: 25.5 },
      { name: 'Mercado Financeiro', conversations: 8, percentage: 17.0 },
      { name: 'Estratégias', conversations: 7, percentage: 14.9 },
      { name: 'Pesquisa', conversations: 5, percentage: 10.6 }
    ]
  };
}

/**
 * Gera métricas detalhadas de conversas
 */
async function getConversationMetrics(params: AnalyticsRequest): Promise<ConversationMetrics> {
  return {
    total_conversations: 47,
    total_messages: 312,
    avg_messages_per_conversation: 6.6,
    active_projects: 8,
    most_used_intents: [
      { intent: 'COMPARE_ETFS', count: 89 },
      { intent: 'GET_DASHBOARD_PERFORMANCE', count: 67 },
      { intent: 'GET_NEWS_RECENT', count: 54 },
      { intent: 'EXPLAIN_CONCEPT', count: 43 },
      { intent: 'GENERAL_HELP', count: 59 }
    ],
    conversation_length_distribution: [
      { range: '1-3 mensagens', count: 12 },
      { range: '4-7 mensagens', count: 18 },
      { range: '8-15 mensagens', count: 13 },
      { range: '16+ mensagens', count: 4 }
    ],
    daily_activity: [
      { date: '2025-01-07', conversations: 3, messages: 18 },
      { date: '2025-01-08', conversations: 5, messages: 29 },
      { date: '2025-01-09', conversations: 2, messages: 14 },
      { date: '2025-01-10', conversations: 7, messages: 41 },
      { date: '2025-01-11', conversations: 4, messages: 26 },
      { date: '2025-01-12', conversations: 6, messages: 35 },
      { date: '2025-01-13', conversations: 8, messages: 52 }
    ]
  };
}

/**
 * Gera métricas por projeto
 */
async function getProjectMetrics(params: AnalyticsRequest): Promise<ProjectMetrics[]> {
  return [
    {
      project_id: '550e8400-e29b-41d4-a716-446655440000',
      project_name: 'Análise de ETFs',
      conversation_count: 15,
      message_count: 98,
      avg_conversation_length: 6.5,
      most_discussed_topics: ['QQQ', 'VTI', 'diversificação', 'tecnologia', 'performance'],
      user_engagement: 0.85,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      project_name: 'Portfolio Master',
      conversation_count: 12,
      message_count: 79,
      avg_conversation_length: 6.6,
      most_discussed_topics: ['otimização', 'Markowitz', 'rebalanceamento', 'alocação', 'risco'],
      user_engagement: 0.78,
      created_at: '2025-01-02T00:00:00Z'
    },
    {
      project_id: '550e8400-e29b-41d4-a716-446655440002',
      project_name: 'Mercado Financeiro',
      conversation_count: 8,
      message_count: 52,
      avg_conversation_length: 6.5,
      most_discussed_topics: ['notícias', 'tendências', 'análise técnica', 'mercado', 'volatilidade'],
      user_engagement: 0.72,
      created_at: '2025-01-03T00:00:00Z'
    }
  ];
}

/**
 * Gera métricas de comportamento do usuário
 */
async function getUserBehaviorMetrics(params: AnalyticsRequest): Promise<UserBehaviorMetrics> {
  return {
    session_duration_avg: 18.5,
    preferred_intents: [
      { intent: 'COMPARE_ETFS', percentage: 28.5 },
      { intent: 'GET_DASHBOARD_PERFORMANCE', percentage: 21.5 },
      { intent: 'GET_NEWS_RECENT', percentage: 17.3 },
      { intent: 'GENERAL_HELP', percentage: 18.9 },
      { intent: 'EXPLAIN_CONCEPT', percentage: 13.8 }
    ],
    peak_usage_hours: [
      { hour: 9, usage_count: 45 },
      { hour: 14, usage_count: 38 },
      { hour: 19, usage_count: 52 },
      { hour: 21, usage_count: 41 }
    ],
    topics_of_interest: [
      { topic: 'ETFs de tecnologia', mentions: 67 },
      { topic: 'Diversificação', mentions: 54 },
      { topic: 'Performance histórica', mentions: 43 },
      { topic: 'Análise de risco', mentions: 38 },
      { topic: 'Rebalanceamento', mentions: 32 }
    ],
    question_complexity_score: 7.2 // escala 1-10
  };
}

/**
 * Gera métricas de performance do sistema
 */
async function getPerformanceMetrics(params: AnalyticsRequest) {
  return {
    response_times: {
      avg_response_time: 2.3, // segundos
      p95_response_time: 4.8,
      p99_response_time: 8.1,
      fastest_intent: 'GENERAL_HELP',
      slowest_intent: 'COMPARE_ETFS'
    },
    success_rates: {
      overall_success_rate: 0.967,
      intent_classification_accuracy: 0.923,
      tool_execution_success: 0.891,
      user_satisfaction_proxy: 0.847
    },
    usage_patterns: {
      peak_hours: [9, 14, 19, 21],
      busiest_day: 'Wednesday',
      seasonal_trends: 'Increased usage during market volatility',
      feature_adoption: {
        projects: 0.78,
        insights: 0.45,
        analytics: 0.32
      }
    },
    error_analysis: {
      total_errors: 23,
      most_common_error: 'Intent classification uncertainty',
      error_recovery_rate: 0.87,
      user_retry_rate: 0.12
    }
  };
}

/**
 * POST /api/ai/analytics - Gera relatório customizado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, projectId, reportType, customParams } = body;
    
    if (!userId && !projectId) {
      return NextResponse.json({
        success: false,
        error: 'userId ou projectId é obrigatório'
      }, { status: 400 });
    }

    console.log(`📊 Gerando relatório customizado: ${reportType}`);

    // Gerar relatório baseado nos parâmetros
    const report = await generateCustomReport({
      userId,
      projectId,
      reportType,
      ...customParams
    });

    return NextResponse.json({
      success: true,
      data: report,
      report_type: reportType,
      generated_at: new Date().toISOString(),
      message: 'Relatório customizado gerado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao gerar relatório customizado'
    }, { status: 500 });
  }
}

/**
 * Gera relatório customizado baseado nos parâmetros
 */
async function generateCustomReport(params: any) {
  // Simular geração de relatório customizado
  return {
    report_id: `report_${Date.now()}`,
    title: `Relatório ${params.reportType} - ${new Date().toLocaleDateString()}`,
    summary: `Relatório detalhado gerado para análise de ${params.reportType}`,
    data: {
      // Dados específicos baseados no tipo de relatório
      metrics: await getOverviewAnalytics(params),
      insights: [
        'Usuário demonstra forte interesse em ETFs de tecnologia',
        'Padrão de uso concentrado nos horários comerciais',
        'Alta taxa de engajamento com funcionalidades de comparação'
      ],
      recommendations: [
        'Considerar expansão de conteúdo sobre diversificação',
        'Implementar notificações para horários de menor uso',
        'Adicionar mais ferramentas de análise técnica'
      ]
    },
    export_formats: ['json', 'csv', 'pdf'],
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

