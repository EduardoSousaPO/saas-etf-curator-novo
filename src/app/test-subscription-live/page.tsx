'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from '@/components/subscriptions/FeatureGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Plus } from 'lucide-react';

export default function TestSubscriptionLivePage() {
  const { user, loading: authLoading } = useAuth();
  const { 
    subscription, 
    currentPlan, 
    features, 
    loading: subscriptionLoading,
    canAccessFeature,
    refreshSubscription 
  } = useSubscription();
  
  const [testResults, setTestResults] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiTest, setApiTest] = useState<any>(null);

  const testFeatureAccess = () => {
    const featuresToTest = [
      'screener_advanced',
      'screener_queries_daily',
      'screener_all_etfs',
      'rankings_top10',
      'export_reports',
      'dashboard_complete',
      'comparator_advanced',
      'portfolio_optimization'
    ];

    const results = featuresToTest.map(feature => ({
      feature,
      hasAccess: canAccessFeature(feature),
      expectedAccess: currentPlan === 'PRO' || currentPlan === 'WEALTH' || currentPlan === 'OFFSHORE'
    }));

    setTestResults(results);
  };

  const testAPIDirectly = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/subscriptions/status?userId=${user.id}`);
      const data = await response.json();
      setApiTest(data);
    } catch (error) {
      setApiTest({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSubscription();
    setTimeout(() => {
      testFeatureAccess();
      testAPIDirectly();
      setIsRefreshing(false);
    }, 1000);
  };

  const handleCreateProSubscription = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/create-pro-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Assinatura PRO criada com sucesso!');
        await handleRefresh();
      } else {
        alert(`❌ Erro: ${result.message || result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro ao criar assinatura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !subscriptionLoading) {
      testFeatureAccess();
      testAPIDirectly();
    }
  }, [authLoading, subscriptionLoading, currentPlan, features]);

  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações de assinatura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste de Assinatura - LIVE</h1>
          <p className="text-gray-600">Diagnóstico em tempo real do sistema de assinatura</p>
        </div>

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>ID:</strong> {user?.id}</div>
            <div><strong>Email Confirmado:</strong> {user?.email_confirmed_at ? '✅ Sim' : '❌ Não'}</div>
          </CardContent>
        </Card>

        {/* Informações da Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle>💳 Assinatura Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Plano:</strong> <Badge variant={currentPlan === 'PRO' ? 'default' : 'secondary'}>{currentPlan}</Badge></div>
            <div><strong>Status:</strong> {subscription?.status || 'N/A'}</div>
            <div><strong>Início:</strong> {subscription?.started_at ? new Date(subscription.started_at).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Expira:</strong> {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Features Carregadas:</strong> {features.length}</div>
          </CardContent>
        </Card>

        {/* Teste de Features */}
        <Card>
          <CardHeader>
            <CardTitle>🔑 Teste de Acesso às Features</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults ? (
              <div className="space-y-2">
                {testResults.map((result: any) => (
                  <div key={result.feature} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono text-sm">{result.feature}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.hasAccess ? 'default' : 'destructive'}>
                        {result.hasAccess ? 'ACESSO' : 'BLOQUEADO'}
                      </Badge>
                      {result.hasAccess === result.expectedAccess ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Carregando testes...</p>
            )}
          </CardContent>
        </Card>

        {/* Teste do FeatureGate */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Teste do FeatureGate - screener_advanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Teste Direto:</h4>
              <FeatureGate 
                featureKey="screener_advanced"
                requiredPlan="PRO"
                fallback={
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    ❌ SEM ACESSO: screener_advanced
                  </div>
                }
              >
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  ✅ COM ACESSO: screener_advanced
                </div>
              </FeatureGate>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Função canAccessFeature:</h4>
              <p>screener_advanced: <Badge variant={canAccessFeature('screener_advanced') ? 'default' : 'destructive'}>
                {canAccessFeature('screener_advanced') ? 'TRUE' : 'FALSE'}
              </Badge></p>
            </div>
          </CardContent>
        </Card>

        {/* Teste da API */}
        <Card>
          <CardHeader>
            <CardTitle>🔌 Teste da API</CardTitle>
          </CardHeader>
          <CardContent>
            {apiTest ? (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            ) : (
              <p>Carregando dados da API...</p>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </Button>
          
          <Button 
            onClick={handleCreateProSubscription}
            disabled={isRefreshing}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Assinatura PRO</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/screener'}
          >
            Ir para Screener
          </Button>
        </div>
      </div>
    </div>
  );
} 