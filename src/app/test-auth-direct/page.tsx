'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from '@/components/subscriptions/FeatureGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestAuthDirectPage() {
  const { user } = useAuth();
  const { 
    subscription, 
    currentPlan, 
    features, 
    loading, 
    canAccessFeature,
    refreshSubscription 
  } = useSubscription();

  const testFeature = 'screener_advanced';
  
  // Teste direto da função
  const directTest = canAccessFeature(testFeature);
  
  // Teste da lógica manual
  const manualTest = currentPlan === 'PRO' || currentPlan === 'WEALTH' || currentPlan === 'OFFSHORE';
  
  // Teste da feature no array
  const featureInArray = features.find(f => f.feature_key === testFeature);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Teste Direto de Autorização</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Estado Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Usuário:</strong> {user?.email}
            </div>
            <div>
              <strong>Plano Atual:</strong> <Badge>{currentPlan}</Badge>
            </div>
            <div>
              <strong>Status Assinatura:</strong> {subscription?.status || 'N/A'}
            </div>
            <div>
              <strong>Loading:</strong> {loading ? 'SIM' : 'NÃO'}
            </div>
            <div>
              <strong>Features Carregadas:</strong> {features.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testes de Acesso - screener_advanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Teste Direto</h4>
                <Badge variant={directTest ? 'default' : 'destructive'}>
                  {directTest ? 'ACESSO' : 'BLOQUEADO'}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">
                  canAccessFeature('screener_advanced')
                </p>
              </div>
              
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Teste Manual</h4>
                <Badge variant={manualTest ? 'default' : 'destructive'}>
                  {manualTest ? 'ACESSO' : 'BLOQUEADO'}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">
                  Baseado no plano: {currentPlan}
                </p>
              </div>
              
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Feature no Array</h4>
                <Badge variant={featureInArray?.is_enabled ? 'default' : 'destructive'}>
                  {featureInArray ? (featureInArray.is_enabled ? 'HABILITADA' : 'DESABILITADA') : 'NÃO ENCONTRADA'}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">
                  Feature no banco de dados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste do FeatureGate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold">Teste 1: Sem fallback</h4>
              <FeatureGate featureKey="screener_advanced" requiredPlan="PRO">
                <div className="p-4 bg-green-100 border border-green-300 rounded">
                  ✅ SUCESSO: Você tem acesso aos filtros avançados!
                </div>
              </FeatureGate>
              
              <h4 className="font-semibold">Teste 2: Com fallback customizado</h4>
              <FeatureGate 
                featureKey="screener_advanced" 
                requiredPlan="PRO"
                fallback={
                  <div className="p-4 bg-red-100 border border-red-300 rounded">
                    ❌ BLOQUEADO: Você não tem acesso aos filtros avançados
                  </div>
                }
              >
                <div className="p-4 bg-green-100 border border-green-300 rounded">
                  ✅ SUCESSO: Você tem acesso aos filtros avançados!
                </div>
              </FeatureGate>
              
              <h4 className="font-semibold">Teste 3: Feature inexistente</h4>
              <FeatureGate 
                featureKey="feature_inexistente" 
                requiredPlan="PRO"
                fallback={
                  <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
                    ⚠️ Feature inexistente - deveria mostrar fallback
                  </div>
                }
              >
                <div className="p-4 bg-green-100 border border-green-300 rounded">
                  ✅ Feature inexistente - NÃO deveria aparecer
                </div>
              </FeatureGate>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {features.length > 0 ? (
              <div className="space-y-2">
                {features.map(feature => (
                  <div key={feature.feature_key} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono text-sm">{feature.feature_key}</span>
                    <Badge variant={feature.is_enabled ? 'default' : 'secondary'}>
                      {feature.is_enabled ? 'HABILITADA' : 'DESABILITADA'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma feature carregada</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button onClick={refreshSubscription}>
            Atualizar Dados
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/screener'}>
            Ir para Screener
          </Button>
        </div>
      </div>
    </div>
  );
} 