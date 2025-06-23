'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from '@/components/subscriptions/FeatureGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function SubscriptionTestPage() {
  const { user } = useAuth();
  const { 
    subscription, 
    currentPlan, 
    features, 
    usageLimits, 
    loading,
    canAccessFeature,
    refreshSubscription 
  } = useSubscription();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchSubscriptionStatus = async () => {
    if (!user?.id) return;
    
    setStatusLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/status?userId=${user.id}`);
      const data = await response.json();
      setSubscriptionStatus(data.data);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user?.id]);

  const testFeatures = [
    'screener_advanced',
    'export_reports', 
    'dashboard_complete',
    'simulator_scenarios',
    'rankings_top10',
    'comparator_advanced',
    'consultant_dedicated',
    'offshore_structuring'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teste do Sistema de Assinatura</h1>
              <p className="text-gray-600">Verificação completa do sistema de pagamento e controle de acesso</p>
            </div>
            <Button onClick={fetchSubscriptionStatus} disabled={statusLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Status da Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Assinatura</CardTitle>
              <CardDescription>Informações do plano atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Usuário:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Plano Atual:</span>
                <Badge variant="secondary">{currentPlan}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <div className="flex items-center gap-2">
                  {subscription?.status === 'ACTIVE' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : subscription?.status === 'PENDING' ? (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{subscription?.status || 'STARTER'}</span>
                </div>
              </div>
              
              {subscription && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Criada em:</span>
                    <span>{new Date(subscription.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {subscription.started_at && (
                    <div className="flex items-center justify-between">
                      <span>Iniciada em:</span>
                      <span>{new Date(subscription.started_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Limites de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>Limites de Uso</CardTitle>
              <CardDescription>Controle de consumo das funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {usageLimits ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Consultas Screener:</span>
                    <span>
                      {usageLimits.screener_queries_used} / {usageLimits.screener_queries_limit || '∞'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Relatórios Exportados:</span>
                    <span>
                      {usageLimits.export_reports_used} / {usageLimits.export_reports_limit || '∞'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Simulações de Portfolio:</span>
                    <span>
                      {usageLimits.portfolio_simulations_used} / {usageLimits.portfolio_simulations_limit || '∞'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Nenhum limite definido</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features do Plano */}
        <Card>
          <CardHeader>
            <CardTitle>Features do Plano {currentPlan}</CardTitle>
            <CardDescription>Funcionalidades disponíveis no seu plano atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{feature.feature_name}</div>
                    <div className="text-sm text-gray-600">{feature.feature_key}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {feature.is_enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    {feature.limit_value && (
                      <Badge variant="outline">{feature.limit_value}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teste de Controle de Acesso */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Controle de Acesso</CardTitle>
            <CardDescription>Verificação das funcionalidades com FeatureGate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testFeatures.map((featureKey) => (
              <div key={featureKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{featureKey}</span>
                  <div className="flex items-center gap-2">
                    {canAccessFeature(featureKey) ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      {canAccessFeature(featureKey) ? 'Permitido' : 'Bloqueado'}
                    </span>
                  </div>
                </div>
                
                <FeatureGate featureKey={featureKey}>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-green-800">✅ Funcionalidade liberada! Você pode usar {featureKey}</p>
                  </div>
                </FeatureGate>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pagamentos Recentes */}
        {subscriptionStatus?.recentPayments && subscriptionStatus.recentPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Recentes</CardTitle>
              <CardDescription>Histórico de transações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptionStatus.recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">R$ {payment.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <Badge 
                      variant={payment.status === 'PAID' ? 'default' : 
                               payment.status === 'PENDING' ? 'secondary' : 'destructive'}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 