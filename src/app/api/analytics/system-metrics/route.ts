import { NextRequest, NextResponse } from 'next/server';

// Cache para métricas em tempo real
let metricsCache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 30000; // 30 segundos

export async function GET(request: NextRequest) {
  try {
    // Verificar cache
    const now = Date.now();
    if (metricsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
      return NextResponse.json(metricsCache);
    }

    // Buscar métricas do sistema Python
    const { spawn } = require('child_process');
    
    const metrics = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        '-c',
        `
import sys
import os
import json
from datetime import datetime, timedelta
sys.path.append('${process.cwd()}/src/agents/agno')

try:
    from VistaETFAgentSystem import vista_etf_system
    from memory.PersistentMemorySystem import memory_system
    
    # Métricas em tempo real
    system_status = vista_etf_system.get_system_status()
    
    # Simular métricas em tempo real (em produção viria de monitoramento)
    realtime_metrics = {
        "activeConversations": 12,
        "averageResponseTime": 2.3,
        "errorRate": 0.05,
        "apiCallsPerMinute": 45,
        "activeUsers": 8
    }
    
    # Métricas diárias (em produção viria do banco de dados)
    daily_metrics = {
        "totalConversations": 156,
        "uniqueUsers": 89,
        "successfulTasks": 142,
        "averageSessionDuration": 4.2
    }
    
    # Métricas semanais
    weekly_metrics = {
        "conversationGrowth": 23.5,
        "userRetention": 78.2,
        "popularIntents": [
            {"intent": "optimize_portfolio", "count": 45},
            {"intent": "screen_etfs", "count": 38},
            {"intent": "analyze_etf", "count": 32},
            {"intent": "compare_etfs", "count": 28},
            {"intent": "market_analysis", "count": 23}
        ],
        "performanceMetrics": [
            {"date": "2025-01-15", "responseTime": 2.1, "success": 95},
            {"date": "2025-01-16", "responseTime": 2.3, "success": 97},
            {"date": "2025-01-17", "responseTime": 2.0, "success": 98},
            {"date": "2025-01-18", "responseTime": 2.4, "success": 96},
            {"date": "2025-01-19", "responseTime": 2.2, "success": 99},
            {"date": "2025-01-20", "responseTime": 2.1, "success": 97},
            {"date": "2025-01-21", "responseTime": 2.3, "success": 98}
        ]
    }
    
    # Métricas de projetos
    projects_metrics = {
        "totalProjects": 234,
        "projectsByType": [
            {"type": "portfolio", "count": 89},
            {"type": "analysis", "count": 67},
            {"type": "screening", "count": 45},
            {"type": "strategy", "count": 33}
        ],
        "recentActivity": [
            {"name": "Carteira Conservadora", "type": "portfolio", "date": "2025-01-21T10:30:00Z"},
            {"name": "Análise VTI vs VOO", "type": "analysis", "date": "2025-01-21T09:15:00Z"},
            {"name": "ETFs de Dividendos", "type": "screening", "date": "2025-01-20T16:45:00Z"}
        ]
    }
    
    # Combinar todas as métricas
    all_metrics = {
        "realtime": realtime_metrics,
        "daily": daily_metrics,
        "weekly": weekly_metrics,
        "projects": projects_metrics,
        "system_status": system_status,
        "timestamp": datetime.now().isoformat()
    }
    
    print(json.dumps(all_metrics))

except Exception as e:
    error_response = {
        "error": str(e),
        "realtime": {
            "activeConversations": 0,
            "averageResponseTime": 0,
            "errorRate": 1.0,
            "apiCallsPerMinute": 0,
            "activeUsers": 0
        },
        "daily": {
            "totalConversations": 0,
            "uniqueUsers": 0,
            "successfulTasks": 0,
            "averageSessionDuration": 0
        },
        "weekly": {
            "conversationGrowth": 0,
            "userRetention": 0,
            "popularIntents": [],
            "performanceMetrics": []
        },
        "projects": {
            "totalProjects": 0,
            "projectsByType": [],
            "recentActivity": []
        },
        "timestamp": datetime.now().isoformat()
    }
    print(json.dumps(error_response))
        `
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          console.error('Erro ao parsear métricas:', e);
          console.error('Output:', output);
          console.error('Error output:', errorOutput);
          
          // Fallback para dados mock
          resolve({
            realtime: {
              activeConversations: 0,
              averageResponseTime: 0,
              errorRate: 1.0,
              apiCallsPerMinute: 0,
              activeUsers: 0
            },
            daily: {
              totalConversations: 0,
              uniqueUsers: 0,
              successfulTasks: 0,
              averageSessionDuration: 0
            },
            weekly: {
              conversationGrowth: 0,
              userRetention: 0,
              popularIntents: [],
              performanceMetrics: []
            },
            projects: {
              totalProjects: 0,
              projectsByType: [],
              recentActivity: []
            },
            error: 'Sistema indisponível',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Timeout após 10 segundos
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Timeout ao buscar métricas'));
      }, 10000);
    });

    // Atualizar cache
    metricsCache = metrics;
    lastCacheUpdate = now;

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Erro na API de métricas:', error);
    
    // Retornar dados mock em caso de erro
    const fallbackMetrics = {
      realtime: {
        activeConversations: 12,
        averageResponseTime: 2.3,
        errorRate: 0.05,
        apiCallsPerMinute: 45,
        activeUsers: 8
      },
      daily: {
        totalConversations: 156,
        uniqueUsers: 89,
        successfulTasks: 142,
        averageSessionDuration: 4.2
      },
      weekly: {
        conversationGrowth: 23.5,
        userRetention: 78.2,
        popularIntents: [
          { intent: 'optimize_portfolio', count: 45 },
          { intent: 'screen_etfs', count: 38 },
          { intent: 'analyze_etf', count: 32 },
          { intent: 'compare_etfs', count: 28 },
          { intent: 'market_analysis', count: 23 }
        ],
        performanceMetrics: [
          { date: '2025-01-15', responseTime: 2.1, success: 95 },
          { date: '2025-01-16', responseTime: 2.3, success: 97 },
          { date: '2025-01-17', responseTime: 2.0, success: 98 },
          { date: '2025-01-18', responseTime: 2.4, success: 96 },
          { date: '2025-01-19', responseTime: 2.2, success: 99 },
          { date: '2025-01-20', responseTime: 2.1, success: 97 },
          { date: '2025-01-21', responseTime: 2.3, success: 98 }
        ]
      },
      projects: {
        totalProjects: 234,
        projectsByType: [
          { type: 'portfolio', count: 89 },
          { type: 'analysis', count: 67 },
          { type: 'screening', count: 45 },
          { type: 'strategy', count: 33 }
        ],
        recentActivity: [
          { name: 'Carteira Conservadora', type: 'portfolio', date: '2025-01-21T10:30:00Z' },
          { name: 'Análise VTI vs VOO', type: 'analysis', date: '2025-01-21T09:15:00Z' },
          { name: 'ETFs de Dividendos', type: 'screening', date: '2025-01-20T16:45:00Z' }
        ]
      },
      error: 'Usando dados simulados',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(fallbackMetrics);
  }
} 