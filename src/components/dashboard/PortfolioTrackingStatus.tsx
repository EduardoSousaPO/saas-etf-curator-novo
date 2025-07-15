'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Database, Activity, TrendingUp } from 'lucide-react';

interface APIStatus {
  name: string;
  endpoint: string;
  status: 'loading' | 'success' | 'error' | 'idle';
  data?: any;
  error?: string;
  lastTested?: Date;
}

const PortfolioTrackingStatus: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    {
      name: 'Portfolio Allocations',
      endpoint: '/api/portfolio/populate-allocations',
      status: 'idle'
    },
    {
      name: 'Rebalance Suggestions',
      endpoint: '/api/portfolio/rebalance-suggestions',
      status: 'idle'
    },
    {
      name: 'Portfolio Tracking',
      endpoint: '/api/portfolio/tracking',
      status: 'idle'
    }
  ]);

  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const portfolioId = 'd733e728-f27d-40c1-bb44-6c6a1e53e58e';
  const userId = '9ba39a20-7409-479d-a010-284ad452d4f8';

  const testAPI = async (apiStatus: APIStatus, index: number) => {
    const newStatuses = [...apiStatuses];
    newStatuses[index] = { ...apiStatus, status: 'loading' };
    setApiStatuses(newStatuses);

    try {
      const url = `${apiStatus.endpoint}?portfolio_id=${portfolioId}&user_id=${userId}`;
      const response = await fetch(url);
      const data = await response.json();

      newStatuses[index] = {
        ...apiStatus,
        status: response.ok ? 'success' : 'error',
        data: response.ok ? data : null,
        error: response.ok ? undefined : data.error || 'Erro desconhecido',
        lastTested: new Date()
      };
    } catch (error) {
      newStatuses[index] = {
        ...apiStatus,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro de rede',
        lastTested: new Date()
      };
    }

    setApiStatuses(newStatuses);
  };

  const testDebugEndpoint = async () => {
    try {
      const response = await fetch('/api/debug/portfolio-data');
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
      }
    } catch (error) {
      console.error('Erro ao testar debug endpoint:', error);
    }
  };

  const testAllAPIs = async () => {
    setIsTestingAll(true);
    for (let i = 0; i < apiStatuses.length; i++) {
      await testAPI(apiStatuses[i], i);
      // Pequeno delay entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    await testDebugEndpoint();
    setIsTestingAll(false);
  };

  const getStatusIcon = (status: APIStatus['status']) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: APIStatus['status']) => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline" className="text-blue-600">Testando...</Badge>;
      case 'success':
        return <Badge variant="outline" className="text-green-600">Funcionando</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600">Erro</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Não testado</Badge>;
    }
  };

  useEffect(() => {
    // Teste automático ao carregar
    testAllAPIs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status do Sistema de Portfolio Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Monitoramento das APIs após correções implementadas
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Portfolio ID: {portfolioId}
              </p>
            </div>
            <Button 
              onClick={testAllAPIs} 
              disabled={isTestingAll}
              className="flex items-center gap-2"
            >
              {isTestingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {isTestingAll ? 'Testando...' : 'Testar Todas APIs'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {apiStatuses.map((api, index) => (
          <Card key={api.name}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(api.status)}
                  {api.name}
                </span>
                {getStatusBadge(api.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-gray-500">
                  Endpoint: {api.endpoint}
                </div>
                
                {api.lastTested && (
                  <div className="text-xs text-gray-500">
                    Último teste: {api.lastTested.toLocaleTimeString()}
                  </div>
                )}

                {api.status === 'success' && api.data && (
                  <div className="bg-green-50 p-2 rounded text-xs">
                    <strong>Dados encontrados:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(api.data, null, 2).substring(0, 200)}...
                    </pre>
                  </div>
                )}

                {api.status === 'error' && api.error && (
                  <div className="bg-red-50 p-2 rounded text-xs text-red-700">
                    <strong>Erro:</strong> {api.error}
                  </div>
                )}

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => testAPI(api, index)}
                  disabled={api.status === 'loading'}
                  className="w-full"
                >
                  {api.status === 'loading' ? 'Testando...' : 'Testar API'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Debug Information */}
      {debugInfo && debugInfo.debug_info && debugInfo.debug_info.results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(debugInfo.debug_info.results).map(([table, info]: [string, any]) => (
                  <div key={table} className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm">{table}</h4>
                    <p className="text-lg font-bold text-blue-600">{info?.count || 0}</p>
                    <p className="text-xs text-gray-500">registros</p>
                  </div>
                ))}
              </div>
              
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Ver dados completos</summary>
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>✅ Correções SQL aplicadas (erro 'objective' resolvido)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>✅ Service Role Key configurada para contornar RLS</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>⚠️ Investigar por que APIs não encontram dados inseridos via MCP</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-400" />
              <span>⏳ Implementar visualização completa após resolver acesso aos dados</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioTrackingStatus; 