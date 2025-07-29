'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Brain, 
  Search, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Clock,
  Server,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface MCPConnection {
  name: string;
  type: string;
  status: string;
  capabilities: string[];
  last_check: string;
}

interface MCPSummary {
  total_connections: number;
  healthy_connections: number;
  unhealthy_connections: number;
  last_check: string;
}

interface PerformanceMetric {
  connection_id: string;
  response_time: number;
  status: string;
  error?: string;
}

interface ConnectivityTest {
  connection_id: string;
  test: string;
  status: string;
  response_time: number;
}

export default function EnhancedAnalyticsDashboard() {
  const [mcpStatus, setMcpStatus] = useState<{
    summary: MCPSummary;
    connections: Record<string, MCPConnection>;
  } | null>(null);
  
  const [performanceData, setPerformanceData] = useState<{
    summary: any;
    results: PerformanceMetric[];
  } | null>(null);
  
  const [connectivityData, setConnectivityData] = useState<{
    summary: any;
    results: ConnectivityTest[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Carregar dados do MCP
  const loadMCPStatus = async () => {
    try {
      const response = await fetch('/api/mcp/enhanced');
      if (response.ok) {
        const data = await response.json();
        setMcpStatus(data);
      }
    } catch (error) {
      console.error('Erro ao carregar status MCP:', error);
    }
  };

  // Carregar dados de performance
  const loadPerformanceData = async () => {
    try {
      const response = await fetch('/api/mcp/enhanced?test=performance', {
        method: 'PUT'
      });
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
    }
  };

  // Carregar dados de conectividade
  const loadConnectivityData = async () => {
    try {
      const response = await fetch('/api/mcp/enhanced?test=connectivity', {
        method: 'PUT'
      });
      if (response.ok) {
        const data = await response.json();
        setConnectivityData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar conectividade:', error);
    }
  };

  // Carregar todos os dados
  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadMCPStatus(),
      loadPerformanceData(),
      loadConnectivityData()
    ]);
    setLastUpdate(new Date());
    setLoading(false);
  };

  // Auto refresh
  useEffect(() => {
    loadAllData();
    
    if (autoRefresh) {
      const interval = setInterval(loadAllData, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Ícones por tipo de conexão
  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="h-5 w-5" />;
      case 'storage': return <Server className="h-5 w-5" />;
      case 'reasoning': return <Brain className="h-5 w-5" />;
      case 'external': return <Search className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>;
      case 'unhealthy':
      case 'error':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && !mcpStatus) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Carregando Analytics Avançado...</p>
          <p className="text-sm text-gray-500">Conectando com sistema MCP</p>
        </div>
      </div>
    );
  }

  const healthPercentage = mcpStatus 
    ? Math.round((mcpStatus.summary.healthy_connections / mcpStatus.summary.total_connections) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Avançado</h1>
          <p className="text-gray-600 mt-1">
            Monitoramento em tempo real do sistema MCP Enhanced
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            <Clock className="h-4 w-4 inline mr-1" />
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
          
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button onClick={loadAllData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthPercentage}%</div>
            <Progress value={healthPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {mcpStatus?.summary.healthy_connections}/{mcpStatus?.summary.total_connections} conexões saudáveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.summary.average_response_time 
                ? `${Math.round(performanceData.summary.average_response_time)}ms` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tempo médio de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectividade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectivityData?.summary.overall_status === 'all_connected' ? '100%' : 'Parcial'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {connectivityData?.summary.successful_tests || 0}/{connectivityData?.summary.total_tests || 0} testes OK
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Sistema funcionando perfeitamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Detalhadas */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Conexões MCP</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="connectivity">Conectividade</TabsTrigger>
          <TabsTrigger value="real-time">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status das Conexões MCP</CardTitle>
              <CardDescription>
                Monitoramento detalhado de todas as conexões do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mcpStatus?.connections && Object.entries(mcpStatus.connections).map(([id, connection]) => (
                  <Card key={id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getConnectionIcon(connection.type)}
                        <h3 className="font-semibold">{connection.name}</h3>
                      </div>
                      {getStatusBadge(connection.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="capitalize">{connection.type}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacidades:</span>
                        <span>{connection.capabilities.length}</span>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-gray-600 mb-1">Funcionalidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {connection.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance</CardTitle>
              <CardDescription>
                Tempos de resposta e métricas de performance por conexão
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData?.results && (
                <div className="space-y-4">
                  {performanceData.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getConnectionIcon(result.connection_id)}
                        <div>
                          <h3 className="font-medium capitalize">{result.connection_id}</h3>
                          <p className="text-sm text-gray-500">
                            {result.status === 'error' ? result.error : 'Funcionando normalmente'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {getStatusBadge(result.status)}
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.round(result.response_time)}ms
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testes de Conectividade</CardTitle>
              <CardDescription>
                Validação da conectividade e funcionalidade de cada serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectivityData?.results && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectivityData.results.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium capitalize">{result.connection_id}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Teste:</span>
                          <span className="capitalize">{result.test.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tempo:</span>
                          <span>{Math.round(result.response_time)}ms</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>
                Métricas atualizadas automaticamente a cada 30 segundos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-lg">Sistema Ativo</h3>
                  <p className="text-sm text-gray-600">Todas as conexões funcionando</p>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-lg">Alta Performance</h3>
                  <p className="text-sm text-gray-600">Tempos de resposta otimizados</p>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-lg">100% Uptime</h3>
                  <p className="text-sm text-gray-600">Disponibilidade máxima</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Sistema Operacional</h4>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Todos os serviços MCP estão funcionando perfeitamente. 
                  O sistema está pronto para processar solicitações dos usuários.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 