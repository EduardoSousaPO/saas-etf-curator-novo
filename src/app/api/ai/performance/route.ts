/**
 * API de Monitoramento de Performance - Dashboard ETF Curator
 * FASE 4: Otimização e monitoramento avançado
 */

import { NextRequest, NextResponse } from 'next/server';
import { responseCache } from '../../../../ai/cache/response-cache';

interface PerformanceMetrics {
  system: {
    uptime: number;
    memory_usage: {
      used: number;
      total: number;
      percentage: number;
    };
    cache_stats: {
      hit_rate: number;
      total_entries: number;
      memory_usage_mb: number;
    };
  };
  api: {
    avg_response_time: number;
    total_requests: number;
    error_rate: number;
    requests_per_minute: number;
  };
  ai: {
    intent_classification_accuracy: number;
    avg_processing_time: number;
    successful_completions: number;
    failed_requests: number;
  };
  user: {
    active_sessions: number;
    avg_session_duration: number;
    most_used_features: Array<{feature: string; usage_count: number}>;
  };
}

// Armazenamento em memória para métricas (em produção seria Redis/DB)
class PerformanceMonitor {
  private metrics = {
    requests: [] as Array<{timestamp: number; duration: number; success: boolean; endpoint: string}>,
    sessions: [] as Array<{id: string; start: number; last_activity: number}>,
    ai_operations: [] as Array<{timestamp: number; type: string; duration: number; success: boolean}>,
    startTime: Date.now()
  };

  recordRequest(endpoint: string, duration: number, success: boolean = true): void {
    this.metrics.requests.push({
      timestamp: Date.now(),
      duration,
      success,
      endpoint
    });

    // Manter apenas últimas 1000 requisições
    if (this.metrics.requests.length > 1000) {
      this.metrics.requests = this.metrics.requests.slice(-1000);
    }
  }

  recordAIOperation(type: string, duration: number, success: boolean = true): void {
    this.metrics.ai_operations.push({
      timestamp: Date.now(),
      type,
      duration,
      success
    });

    // Manter apenas últimas 500 operações
    if (this.metrics.ai_operations.length > 500) {
      this.metrics.ai_operations = this.metrics.ai_operations.slice(-500);
    }
  }

  recordSession(sessionId: string): void {
    const existingSession = this.metrics.sessions.find(s => s.id === sessionId);
    
    if (existingSession) {
      existingSession.last_activity = Date.now();
    } else {
      this.metrics.sessions.push({
        id: sessionId,
        start: Date.now(),
        last_activity: Date.now()
      });
    }

    // Limpar sessões antigas (>24h)
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.metrics.sessions = this.metrics.sessions.filter(s => s.last_activity > dayAgo);
  }

  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const recentRequests = this.metrics.requests.filter(r => r.timestamp > hourAgo);
    const recentAIOperations = this.metrics.ai_operations.filter(op => op.timestamp > hourAgo);

    // Métricas de sistema
    const uptime = Math.round((now - this.metrics.startTime) / 1000);
    const memoryUsage = process.memoryUsage();
    const cacheStats = responseCache.getStats();

    // Métricas de API
    const avgResponseTime = recentRequests.length > 0 
      ? recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length
      : 0;
    
    const errorRate = recentRequests.length > 0
      ? (recentRequests.filter(r => !r.success).length / recentRequests.length) * 100
      : 0;

    const requestsPerMinute = recentRequests.length / 60;

    // Métricas de IA
    const aiSuccessRate = recentAIOperations.length > 0
      ? (recentAIOperations.filter(op => op.success).length / recentAIOperations.length) * 100
      : 100;

    const avgAIProcessingTime = recentAIOperations.length > 0
      ? recentAIOperations.reduce((sum, op) => sum + op.duration, 0) / recentAIOperations.length
      : 0;

    // Métricas de usuário
    const activeSessions = this.metrics.sessions.filter(s => s.last_activity > (now - 30 * 60 * 1000)).length;
    const avgSessionDuration = this.metrics.sessions.length > 0
      ? this.metrics.sessions.reduce((sum, s) => sum + (s.last_activity - s.start), 0) / this.metrics.sessions.length / 1000 / 60
      : 0;

    // Features mais usadas
    const featureUsage = new Map<string, number>();
    recentRequests.forEach(r => {
      const feature = r.endpoint.split('/').pop() || 'unknown';
      featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
    });

    const mostUsedFeatures = Array.from(featureUsage.entries())
      .map(([feature, usage_count]) => ({ feature, usage_count }))
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);

    return {
      system: {
        uptime,
        memory_usage: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        cache_stats: {
          hit_rate: cacheStats.hit_rate,
          total_entries: cacheStats.total_entries,
          memory_usage_mb: cacheStats.memory_usage_mb
        }
      },
      api: {
        avg_response_time: Math.round(avgResponseTime),
        total_requests: recentRequests.length,
        error_rate: Math.round(errorRate * 100) / 100,
        requests_per_minute: Math.round(requestsPerMinute * 100) / 100
      },
      ai: {
        intent_classification_accuracy: aiSuccessRate,
        avg_processing_time: Math.round(avgAIProcessingTime),
        successful_completions: recentAIOperations.filter(op => op.success).length,
        failed_requests: recentAIOperations.filter(op => !op.success).length
      },
      user: {
        active_sessions: activeSessions,
        avg_session_duration: Math.round(avgSessionDuration * 100) / 100,
        most_used_features: mostUsedFeatures
      }
    };
  }

  getDetailedReport() {
    const metrics = this.getMetrics();
    const popularCacheEntries = responseCache.getPopularEntries(5);
    
    return {
      ...metrics,
      cache_details: {
        popular_entries: popularCacheEntries,
        total_cache_hits: responseCache.getStats().cache_hits,
        total_cache_misses: responseCache.getStats().cache_misses
      },
      recommendations: this.generateOptimizationRecommendations(metrics)
    };
  }

  private generateOptimizationRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    // Análise de cache
    if (metrics.system.cache_stats.hit_rate < 50) {
      recommendations.push('Cache hit rate baixo (<50%). Considere ajustar TTLs ou pré-carregar dados comuns.');
    }

    // Análise de memória
    if (metrics.system.memory_usage.percentage > 80) {
      recommendations.push('Uso de memória alto (>80%). Considere implementar limpeza automática de cache.');
    }

    // Análise de performance
    if (metrics.api.avg_response_time > 5000) {
      recommendations.push('Tempo de resposta alto (>5s). Otimize queries ou implemente cache adicional.');
    }

    // Análise de erros
    if (metrics.api.error_rate > 5) {
      recommendations.push('Taxa de erro alta (>5%). Verifique logs e implemente retry automático.');
    }

    // Análise de IA
    if (metrics.ai.intent_classification_accuracy < 85) {
      recommendations.push('Precisão de classificação baixa (<85%). Refine prompts ou adicione exemplos.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Sistema operando dentro dos parâmetros ideais. Continue monitorando.');
    }

    return recommendations;
  }
}

// Instância singleton
const performanceMonitor = new PerformanceMonitor();

/**
 * GET /api/ai/performance - Retorna métricas de performance
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const format = searchParams.get('format') || 'json';

    console.log(`📊 Gerando métricas de performance - Detailed: ${detailed}`);

    const metrics = detailed 
      ? performanceMonitor.getDetailedReport()
      : performanceMonitor.getMetrics();

    // Registrar esta requisição
    const duration = Date.now() - startTime;
    performanceMonitor.recordRequest('/api/ai/performance', duration, true);

    if (format === 'prometheus') {
      // Formato Prometheus para monitoramento
      const prometheusMetrics = generatePrometheusMetrics(metrics);
      return new Response(prometheusMetrics, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      generated_at: new Date().toISOString(),
      generation_time_ms: duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    performanceMonitor.recordRequest('/api/ai/performance', duration, false);
    
    console.error('❌ Erro ao gerar métricas:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao gerar métricas de performance'
    }, { status: 500 });
  }
}

/**
 * POST /api/ai/performance - Registra evento de performance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, event, duration, success = true, metadata } = body;

    if (!type || !event) {
      return NextResponse.json({
        success: false,
        error: 'type e event são obrigatórios'
      }, { status: 400 });
    }

    // Registrar evento baseado no tipo
    switch (type) {
      case 'api_request':
        performanceMonitor.recordRequest(event, duration, success);
        break;
      case 'ai_operation':
        performanceMonitor.recordAIOperation(event, duration, success);
        break;
      case 'user_session':
        performanceMonitor.recordSession(event);
        break;
      default:
        console.warn(`Tipo de evento desconhecido: ${type}`);
    }

    console.log(`📈 Evento registrado: ${type}/${event} (${duration}ms, success: ${success})`);

    return NextResponse.json({
      success: true,
      message: 'Evento de performance registrado'
    });

  } catch (error) {
    console.error('❌ Erro ao registrar evento:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      message: 'Erro ao registrar evento de performance'
    }, { status: 500 });
  }
}

/**
 * Gera métricas no formato Prometheus
 */
function generatePrometheusMetrics(metrics: PerformanceMetrics): string {
  return `
# HELP etf_curator_uptime_seconds System uptime in seconds
# TYPE etf_curator_uptime_seconds counter
etf_curator_uptime_seconds ${metrics.system.uptime}

# HELP etf_curator_memory_usage_bytes Memory usage in bytes
# TYPE etf_curator_memory_usage_bytes gauge
etf_curator_memory_usage_bytes ${metrics.system.memory_usage.used * 1024 * 1024}

# HELP etf_curator_cache_hit_rate Cache hit rate percentage
# TYPE etf_curator_cache_hit_rate gauge
etf_curator_cache_hit_rate ${metrics.system.cache_stats.hit_rate}

# HELP etf_curator_api_response_time_ms Average API response time in milliseconds
# TYPE etf_curator_api_response_time_ms gauge
etf_curator_api_response_time_ms ${metrics.api.avg_response_time}

# HELP etf_curator_api_error_rate API error rate percentage
# TYPE etf_curator_api_error_rate gauge
etf_curator_api_error_rate ${metrics.api.error_rate}

# HELP etf_curator_active_sessions Number of active user sessions
# TYPE etf_curator_active_sessions gauge
etf_curator_active_sessions ${metrics.user.active_sessions}

# HELP etf_curator_ai_accuracy AI classification accuracy percentage
# TYPE etf_curator_ai_accuracy gauge
etf_curator_ai_accuracy ${metrics.ai.intent_classification_accuracy}
  `.trim();
}

// Middleware para instrumentar APIs
export function instrumentAPI(endpoint: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        performanceMonitor.recordRequest(endpoint, duration, success);
      }
    };

    return descriptor;
  };
}

export { performanceMonitor };

