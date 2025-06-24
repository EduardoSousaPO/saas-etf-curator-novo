'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeatureGate } from '@/components/subscriptions/FeatureGate';

export default function DebugSubscriptionPage() {
  const { user } = useAuth();
  const { subscription, currentPlan, features, loading, refreshSubscription, canAccessFeature } = useSubscription();
  const [apiTest, setApiTest] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [featuresTest, setFeaturesTest] = useState<any>(null);

  const testDirectAPI = async () => {
    if (!user) return;
    
    setApiLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        headers: {
          'Authorization': `Bearer ${user.access_token || 'no-token'}`
        }
      });
      
      const data = await response.json();
      setApiTest({
        status: response.status,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setApiTest({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    } finally {
      setApiLoading(false);
    }
  };

  const testFeatureAccess = () => {
    const features = [
      'screener_advanced',
      'screener_queries_daily', 
      'screener_all_etfs',
      'rankings_top10',
      'export_reports'
    ];
    
    return features.map(feature => ({
      feature,
      hasAccess: canAccessFeature(feature)
    }));
  };

  const testPlanFeatures = async () => {
    try {
      const response = await fetch('/api/subscriptions/features?plan=PRO');
      const data = await response.json();
      setFeaturesTest({
        status: response.status,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setFeaturesTest({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Debug - Assinatura</h1>
        
        {/* Info do usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Usuário Logado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user?.id || 'Não logado'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Token:</strong> {user?.access_token ? 'Presente' : 'Ausente'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Info da assinatura (Hook) */}
        <Card>
          <CardHeader>
            <CardTitle>Assinatura (useSubscription Hook)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
              <p><strong>Plano Atual:</strong> 
                <Badge className="ml-2" variant={currentPlan === 'PRO' ? 'default' : 'secondary'}>
                  {currentPlan}
                </Badge>
              </p>
              <p><strong>Assinatura:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(subscription, null, 2)}
              </pre>
              <p><strong>Features ({features.length}):</strong></p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {features.map(feature => (
                  <div key={feature.feature_key} className="bg-gray-100 p-1 rounded">
                    <strong>{feature.feature_key}:</strong> {feature.is_enabled ? '✅' : '❌'}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de acesso às features */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Acesso às Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {testFeatureAccess().map(({ feature, hasAccess }) => (
                <div key={feature} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm">{feature}</span>
                  <Badge variant={hasAccess ? 'default' : 'destructive'}>
                    {hasAccess ? 'Permitido' : 'Bloqueado'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teste da API direta */}
        <Card>
          <CardHeader>
            <CardTitle>Teste API Direta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testDirectAPI} 
                disabled={apiLoading || !user}
                className="w-full"
              >
                {apiLoading ? 'Testando...' : 'Testar API /api/subscriptions'}
              </Button>
              
              {apiTest && (
                <div>
                  <p><strong>Status:</strong> {apiTest.status}</p>
                  <p><strong>Timestamp:</strong> {apiTest.timestamp}</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(apiTest, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teste do FeatureGate */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Teste do FeatureGate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Teste: screener_advanced</h4>
              <FeatureGate 
                featureKey="screener_advanced"
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
              <h4 className="font-semibold mb-2">Função canAccessFeature direta:</h4>
              <p>screener_advanced: <Badge variant={canAccessFeature('screener_advanced') ? 'default' : 'destructive'}>
                {canAccessFeature('screener_advanced') ? 'TRUE' : 'FALSE'}
              </Badge></p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={refreshSubscription} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                🔄 Atualizar Dados da Assinatura
              </Button>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                🔄 Recarregar Página Completa
              </Button>
              
              <Button 
                onClick={testPlanFeatures} 
                variant="outline"
                className="w-full"
              >
                🔍 Testar Features do Plano PRO
              </Button>
              
              {featuresTest && (
                <div className="mt-4">
                  <p><strong>Teste Features:</strong></p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(featuresTest, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 