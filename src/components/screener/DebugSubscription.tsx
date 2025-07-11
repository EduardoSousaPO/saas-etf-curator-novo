'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function DebugSubscription() {
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
  const hasAccess = canAccessFeature(testFeature);

  if (loading) {
    return (
      <Card className="mb-4 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-yellow-600" />
            <span className="text-yellow-800">Carregando dados de assinatura...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm text-blue-900">🔍 Debug - Sistema de Autorização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Usuário:</strong> {user?.email || 'Não logado'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id?.substring(0, 8) || 'N/A'}...
          </div>
          <div>
            <strong>Plano Atual:</strong> 
            <Badge variant={currentPlan === 'PRO' ? 'default' : 'secondary'} className="ml-2">
              {currentPlan}
            </Badge>
          </div>
          <div>
            <strong>Assinatura:</strong> {subscription?.status || 'N/A'}
          </div>
          <div>
            <strong>Features DB:</strong> {features.length} carregadas
          </div>
          <div>
            <strong>screener_advanced:</strong> 
            {hasAccess ? (
              <CheckCircle className="w-4 h-4 text-green-600 inline ml-1" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 inline ml-1" />
            )}
            <span className="ml-1">{hasAccess ? 'ACESSO' : 'BLOQUEADO'}</span>
          </div>
        </div>
        
        {/* Features encontradas */}
        {features.length > 0 && (
          <div className="mt-3 p-2 bg-white rounded border">
            <strong>Features encontradas:</strong>
            <div className="mt-1 text-xs">
              {features.map(f => (
                <div key={f.feature_key} className="flex items-center justify-between">
                  <span>{f.feature_key}</span>
                  <Badge variant={f.is_enabled ? 'default' : 'secondary'}>
                    {f.is_enabled ? 'ON' : 'OFF'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Status da assinatura */}
        {subscription && (
          <div className="mt-3 p-2 bg-white rounded border">
            <strong>Detalhes da Assinatura:</strong>
            <div className="mt-1">
              <div>Plano: {subscription.plan}</div>
              <div>Status: {subscription.status}</div>
              <div>Expira: {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center pt-2">
          <button
            onClick={refreshSubscription}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            Atualizar Dados
          </button>
        </div>
      </CardContent>
    </Card>
  );
} 