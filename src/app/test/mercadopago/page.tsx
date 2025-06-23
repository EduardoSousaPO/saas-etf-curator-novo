'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  status: string;
  timestamp: string;
  config: {
    hasAccessToken: boolean;
    hasPublicKey: boolean;
    hasAppUrl: boolean;
    accessTokenPreview: string | null;
    publicKeyPreview: string | null;
    appUrl: string;
  };
  serviceTest: {
    success: boolean;
    message: string;
  };
  availablePlans: string[];
  plans: any;
}

export default function MercadoPagoTestPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test/mercadopago');
      const data = await response.json();
      
      if (response.ok) {
        setTestResult(data);
      } else {
        setError(data.message || 'Erro ao executar teste');
      }
    } catch (err) {
      setError('Erro de conexão com a API');
    } finally {
      setLoading(false);
    }
  };

  const testPayment = async (planId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test/mercadopago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.preference?.init_point) {
        // Abrir o checkout do MercadoPago em nova aba
        window.open(data.preference.init_point, '_blank');
      } else {
        setError(data.message || 'Erro ao criar preferência de pagamento');
      }
    } catch (err) {
      setError('Erro de conexão com a API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teste MercadoPago</h1>
        <p className="text-muted-foreground">
          Página de teste para verificar a configuração e funcionamento do MercadoPago
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status da Configuração
              <Button onClick={runTest} disabled={loading} variant="outline" size="sm">
                {loading ? 'Testando...' : 'Testar Novamente'}
              </Button>
            </CardTitle>
            <CardDescription>
              Verificação das variáveis de ambiente e inicialização do serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Access Token:</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={testResult.config.hasAccessToken ? 'default' : 'destructive'}>
                        {testResult.config.hasAccessToken ? 'Configurado' : 'Não configurado'}
                      </Badge>
                      {testResult.config.accessTokenPreview && (
                        <code className="text-sm">{testResult.config.accessTokenPreview}</code>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Public Key:</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={testResult.config.hasPublicKey ? 'default' : 'destructive'}>
                        {testResult.config.hasPublicKey ? 'Configurado' : 'Não configurado'}
                      </Badge>
                      {testResult.config.publicKeyPreview && (
                        <code className="text-sm">{testResult.config.publicKeyPreview}</code>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">App URL:</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={testResult.config.hasAppUrl ? 'default' : 'destructive'}>
                        {testResult.config.hasAppUrl ? 'Configurado' : 'Não configurado'}
                      </Badge>
                      {testResult.config.appUrl && (
                        <code className="text-sm">{testResult.config.appUrl}</code>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Serviço:</p>
                    <Badge variant={testResult.serviceTest.success ? 'default' : 'destructive'}>
                      {testResult.serviceTest.success ? 'OK' : 'Erro'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {testResult.serviceTest.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Executando teste...</p>
            )}
          </CardContent>
        </Card>

        {testResult && testResult.serviceTest.success && (
          <Card>
            <CardHeader>
              <CardTitle>Teste de Pagamento</CardTitle>
              <CardDescription>
                Clique em um plano para testar a criação de preferência e checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(testResult.plans).map(([key, plan]: [string, any]) => (
                  <Card key={key} className="relative">
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      {plan.recommended && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Recomendado
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <span className="text-2xl font-bold">R$ {plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period === 'monthly' ? 'mês' : 'ano'}</span>
                      </div>
                      <Button 
                        onClick={() => testPayment(plan.id)} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Processando...' : 'Testar Pagamento'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Timestamp:</strong> {testResult?.timestamp}</p>
              <p><strong>Status:</strong> {testResult?.status}</p>
              <p><strong>Planos Disponíveis:</strong> {testResult?.availablePlans?.join(', ')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 