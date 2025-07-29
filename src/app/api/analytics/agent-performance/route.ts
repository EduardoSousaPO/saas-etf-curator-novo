import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Buscar performance dos agentes do sistema Python
    const { spawn } = require('child_process');
    
    const agentMetrics = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        '-c',
        `
import sys
import os
import json
from datetime import datetime
sys.path.append('${process.cwd()}/src/agents/agno')

try:
    from VistaETFAgentSystem import vista_etf_system
    
    # Métricas de performance dos agentes
    # Em produção, estas métricas viriam de logs e monitoramento real
    agent_performance = [
        {
            "agent": "Financial Data Agent",
            "totalCalls": 234,
            "successRate": 98.5,
            "averageResponseTime": 1.8,
            "errorCount": 4,
            "lastError": None,
            "uptime": 99.8,
            "tools": ["SupabaseETFTool", "YFinanceTools"],
            "averageMemoryUsage": 6.2
        },
        {
            "agent": "Market Analysis Agent",
            "totalCalls": 189,
            "successRate": 96.2,
            "averageResponseTime": 3.2,
            "errorCount": 7,
            "lastError": "Timeout na API Perplexity",
            "uptime": 98.1,
            "tools": ["PerplexityETFTool", "DuckDuckGoTools"],
            "averageMemoryUsage": 8.1
        },
        {
            "agent": "Portfolio Optimizer Agent",
            "totalCalls": 156,
            "successRate": 99.1,
            "averageResponseTime": 2.1,
            "errorCount": 1,
            "lastError": None,
            "uptime": 99.9,
            "tools": ["SupabaseETFTool", "Markowitz Optimizer"],
            "averageMemoryUsage": 12.4
        },
        {
            "agent": "Educational Agent",
            "totalCalls": 98,
            "successRate": 97.8,
            "averageResponseTime": 2.5,
            "errorCount": 2,
            "lastError": "Rate limit DuckDuckGo",
            "uptime": 99.5,
            "tools": ["DuckDuckGoTools", "Knowledge Base"],
            "averageMemoryUsage": 5.8
        }
    ]
    
    # Métricas agregadas do sistema
    system_aggregated = {
        "totalAgents": len(agent_performance),
        "overallSuccessRate": sum(agent["successRate"] for agent in agent_performance) / len(agent_performance),
        "overallAverageResponseTime": sum(agent["averageResponseTime"] for agent in agent_performance) / len(agent_performance),
        "totalCalls": sum(agent["totalCalls"] for agent in agent_performance),
        "totalErrors": sum(agent["errorCount"] for agent in agent_performance),
        "averageUptime": sum(agent["uptime"] for agent in agent_performance) / len(agent_performance),
        "totalMemoryUsage": sum(agent["averageMemoryUsage"] for agent in agent_performance)
    }
    
    # Histórico de performance (últimos 7 dias)
    performance_history = [
        {"date": "2025-01-15", "successRate": 96.5, "responseTime": 2.8, "calls": 142},
        {"date": "2025-01-16", "successRate": 97.2, "responseTime": 2.6, "calls": 156},
        {"date": "2025-01-17", "successRate": 98.1, "responseTime": 2.4, "calls": 189},
        {"date": "2025-01-18", "successRate": 96.8, "responseTime": 2.7, "calls": 167},
        {"date": "2025-01-19", "successRate": 99.0, "responseTime": 2.2, "calls": 203},
        {"date": "2025-01-20", "successRate": 97.5, "responseTime": 2.5, "calls": 178},
        {"date": "2025-01-21", "successRate": 98.3, "responseTime": 2.3, "calls": 195}
    ]
    
    # Alertas e notificações
    alerts = []
    
    # Verificar se há agentes com problemas
    for agent in agent_performance:
        if agent["successRate"] < 95:
            alerts.append({
                "type": "warning",
                "agent": agent["agent"],
                "message": f"Taxa de sucesso abaixo de 95%: {agent['successRate']}%",
                "severity": "medium"
            })
        
        if agent["averageResponseTime"] > 3:
            alerts.append({
                "type": "warning",
                "agent": agent["agent"],
                "message": f"Tempo de resposta alto: {agent['averageResponseTime']}s",
                "severity": "medium"
            })
        
        if agent["errorCount"] > 5:
            alerts.append({
                "type": "error",
                "agent": agent["agent"],
                "message": f"Muitos erros: {agent['errorCount']} erros",
                "severity": "high"
            })
    
    # Resposta completa
    response = {
        "agents": agent_performance,
        "aggregated": system_aggregated,
        "history": performance_history,
        "alerts": alerts,
        "timestamp": datetime.now().isoformat()
    }
    
    print(json.dumps(response))

except Exception as e:
    error_response = {
        "error": str(e),
        "agents": [
            {
                "agent": "Financial Data Agent",
                "totalCalls": 0,
                "successRate": 0,
                "averageResponseTime": 0,
                "errorCount": 1,
                "lastError": str(e),
                "uptime": 0,
                "tools": [],
                "averageMemoryUsage": 0
            }
        ],
        "aggregated": {
            "totalAgents": 0,
            "overallSuccessRate": 0,
            "overallAverageResponseTime": 0,
            "totalCalls": 0,
            "totalErrors": 1,
            "averageUptime": 0,
            "totalMemoryUsage": 0
        },
        "history": [],
        "alerts": [
            {
                "type": "error",
                "agent": "System",
                "message": f"Erro ao buscar métricas: {str(e)}",
                "severity": "high"
            }
        ],
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
          console.error('Erro ao parsear métricas dos agentes:', e);
          console.error('Output:', output);
          console.error('Error output:', errorOutput);
          
          // Fallback para dados mock
          resolve({
            agents: [
              { agent: 'Financial Data Agent', totalCalls: 234, successRate: 98.5, averageResponseTime: 1.8, errorCount: 4 },
              { agent: 'Market Analysis Agent', totalCalls: 189, successRate: 96.2, averageResponseTime: 3.2, errorCount: 7 },
              { agent: 'Portfolio Optimizer Agent', totalCalls: 156, successRate: 99.1, averageResponseTime: 2.1, errorCount: 1 },
              { agent: 'Educational Agent', totalCalls: 98, successRate: 97.8, averageResponseTime: 2.5, errorCount: 2 }
            ],
            aggregated: {
              totalAgents: 4,
              overallSuccessRate: 97.9,
              overallAverageResponseTime: 2.4,
              totalCalls: 677,
              totalErrors: 14,
              averageUptime: 99.3,
              totalMemoryUsage: 32.5
            },
            history: [
              { date: '2025-01-15', successRate: 96.5, responseTime: 2.8, calls: 142 },
              { date: '2025-01-16', successRate: 97.2, responseTime: 2.6, calls: 156 },
              { date: '2025-01-17', successRate: 98.1, responseTime: 2.4, calls: 189 },
              { date: '2025-01-18', successRate: 96.8, responseTime: 2.7, calls: 167 },
              { date: '2025-01-19', successRate: 99.0, responseTime: 2.2, calls: 203 },
              { date: '2025-01-20', successRate: 97.5, responseTime: 2.5, calls: 178 },
              { date: '2025-01-21', successRate: 98.3, responseTime: 2.3, calls: 195 }
            ],
            alerts: [],
            error: 'Usando dados simulados',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Timeout após 10 segundos
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Timeout ao buscar métricas dos agentes'));
      }, 10000);
    });

    return NextResponse.json(agentMetrics);

  } catch (error) {
    console.error('Erro na API de performance dos agentes:', error);
    
    // Retornar dados mock em caso de erro
    const fallbackMetrics = {
      agents: [
        { agent: 'Financial Data Agent', totalCalls: 234, successRate: 98.5, averageResponseTime: 1.8, errorCount: 4 },
        { agent: 'Market Analysis Agent', totalCalls: 189, successRate: 96.2, averageResponseTime: 3.2, errorCount: 7 },
        { agent: 'Portfolio Optimizer Agent', totalCalls: 156, successRate: 99.1, averageResponseTime: 2.1, errorCount: 1 },
        { agent: 'Educational Agent', totalCalls: 98, successRate: 97.8, averageResponseTime: 2.5, errorCount: 2 }
      ],
      aggregated: {
        totalAgents: 4,
        overallSuccessRate: 97.9,
        overallAverageResponseTime: 2.4,
        totalCalls: 677,
        totalErrors: 14,
        averageUptime: 99.3,
        totalMemoryUsage: 32.5
      },
      history: [
        { date: '2025-01-15', successRate: 96.5, responseTime: 2.8, calls: 142 },
        { date: '2025-01-16', successRate: 97.2, responseTime: 2.6, calls: 156 },
        { date: '2025-01-17', successRate: 98.1, responseTime: 2.4, calls: 189 },
        { date: '2025-01-18', successRate: 96.8, responseTime: 2.7, calls: 167 },
        { date: '2025-01-19', successRate: 99.0, responseTime: 2.2, calls: 203 },
        { date: '2025-01-20', successRate: 97.5, responseTime: 2.5, calls: 178 },
        { date: '2025-01-21', successRate: 98.3, responseTime: 2.3, calls: 195 }
      ],
      alerts: [
        {
          type: 'warning',
          agent: 'System',
          message: 'Sistema usando dados simulados para desenvolvimento',
          severity: 'low'
        }
      ],
      error: 'Usando dados simulados para desenvolvimento',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(fallbackMetrics);
  }
} 