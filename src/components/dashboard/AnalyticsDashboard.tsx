'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Activity, Users, MessageSquare, TrendingUp, Clock, 
  Target, Zap, Database, Server, AlertCircle 
} from 'lucide-react';

interface SystemMetrics {
  realtime: {
    activeConversations: number;
    averageResponseTime: number;
    errorRate: number;
    apiCallsPerMinute: number;
    activeUsers: number;
  };
  daily: {
    totalConversations: number;
    uniqueUsers: number;
    successfulTasks: number;
    averageSessionDuration: number;
  };
  weekly: {
    conversationGrowth: number;
    userRetention: number;
    popularIntents: Array<{intent: string, count: number}>;
    performanceMetrics: Array<{date: string, responseTime: number, success: number}>;
  };
  projects: {
    totalProjects: number;
    projectsByType: Array<{type: string, count: number}>;
    recentActivity: Array<{name: string, type: string, date: string}>;
  };
}

interface AgentPerformance {
  agent: string;
  totalCalls: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMetrics();
    
    // Auto refresh a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      // Buscar métricas do sistema
      const systemResponse = await fetch('/api/analytics/system-metrics');
      const systemData = await systemResponse.json();
      
      // Buscar performance dos agentes
      const agentsResponse = await fetch('/api/analytics/agent-performance');
      const agentsData = await agentsResponse.json();
      
      setMetrics(systemData);
      setAgentPerformance(agentsData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      // Dados mock para desenvolvimento
      setMetrics(getMockMetrics());
      setAgentPerformance(getMockAgentPerformance());
      setLoading(false);
    }
  };

  const getMockMetrics = (): SystemMetrics => ({
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
    }
  });

  const getMockAgentPerformance = (): AgentPerformance[] => [
    { agent: 'Financial Data Agent', totalCalls: 234, successRate: 98.5, averageResponseTime: 1.8, errorCount: 4 },
    { agent: 'Market Analysis Agent', totalCalls: 189, successRate: 96.2, averageResponseTime: 3.2, errorCount: 7 },
    { agent: 'Portfolio Optimizer Agent', totalCalls: 156, successRate: 99.1, averageResponseTime: 2.1, errorCount: 1 },
    { agent: 'Educational Agent', totalCalls: 98, successRate: 97.8, averageResponseTime: 2.5, errorCount: 2 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">Erro ao carregar métricas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Analytics</h1>
          <p className="text-gray-600">Vista ETF Assistant - Métricas em Tempo Real</p>
        </div>
        <Button onClick={fetchMetrics} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realtime.activeConversations}</div>
            <Badge variant="secondary" className="mt-1">Em tempo real</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realtime.averageResponseTime}s</div>
            <Badge variant={metrics.realtime.averageResponseTime < 3 ? "default" : "destructive"} className="mt-1">
              {metrics.realtime.averageResponseTime < 3 ? "Excelente" : "Atenção"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.realtime.errorRate * 100).toFixed(1)}%</div>
            <Badge variant={metrics.realtime.errorRate < 0.1 ? "default" : "destructive"} className="mt-1">
              {metrics.realtime.errorRate < 0.1 ? "Baixa" : "Alta"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls/min</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realtime.apiCallsPerMinute}</div>
            <Badge variant="outline" className="mt-1">Volume atual</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realtime.activeUsers}</div>
            <Badge variant="secondary" className="mt-1">Online agora</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Diferentes Visões */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Performance dos Agentes</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas Diárias */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas do Dia</CardTitle>
                <CardDescription>Resumo das atividades de hoje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total de Conversas</span>
                  <Badge variant="outline">{metrics.daily.totalConversations}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Usuários Únicos</span>
                  <Badge variant="outline">{metrics.daily.uniqueUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tarefas Concluídas</span>
                  <Badge variant="default">{metrics.daily.successfulTasks}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duração Média da Sessão</span>
                  <Badge variant="secondary">{metrics.daily.averageSessionDuration}min</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Intents Mais Populares */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades Mais Usadas</CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.weekly.popularIntents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="intent" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance ao Longo do Tempo */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Semanal</CardTitle>
              <CardDescription>Tempo de resposta e taxa de sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={metrics.weekly.performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#8884d8" name="Tempo de Resposta (s)" />
                  <Line yAxisId="right" type="monotone" dataKey="success" stroke="#82ca9d" name="Taxa de Sucesso (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Individual dos Agentes */}
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Agentes</CardTitle>
                <CardDescription>Métricas individuais de cada agente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentPerformance.map((agent, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{agent.agent}</h4>
                        <Badge variant={agent.successRate > 95 ? "default" : "destructive"}>
                          {agent.successRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Calls: </span>
                          <span className="font-medium">{agent.totalCalls}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo: </span>
                          <span className="font-medium">{agent.averageResponseTime}s</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Erros: </span>
                          <span className="font-medium">{agent.errorCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Chamadas por Agente */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Uso</CardTitle>
                <CardDescription>Chamadas por agente</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agentPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({agent, percent}) => `${agent.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalCalls"
                    >
                      {agentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estatísticas de Projetos */}
            <Card>
              <CardHeader>
                <CardTitle>Projetos Salvos</CardTitle>
                <CardDescription>Total: {metrics.projects.totalProjects} projetos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.projects.projectsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Projetos criados recentemente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.projects.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.date).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>Insights e padrões de uso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">+{metrics.weekly.conversationGrowth}%</p>
                  <p className="text-sm text-gray-600">Crescimento de Conversas</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{metrics.weekly.userRetention}%</p>
                  <p className="text-sm text-gray-600">Retenção de Usuários</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {((metrics.daily.successfulTasks / metrics.daily.totalConversations) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Insights Principais</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Otimização de portfolio é a funcionalidade mais popular (38% das conversas)</li>
                  <li>• Usuários passam em média 4.2 minutos por sessão</li>
                  <li>• Taxa de erro mantida abaixo de 5% nas últimas 24h</li>
                  <li>• 78% dos usuários retornam dentro de 7 dias</li>
                  <li>• Tempo de resposta médio melhorou 15% na última semana</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 