'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from '@/components/subscriptions/FeatureGate';
import { useAuth } from '@/hooks/useAuth';

export default function FeatureGateDebug() {
  const { canAccessFeature, currentPlan, features, loading, subscription } = useSubscription();
  const { user } = useAuth();
  const [debugResult, setDebugResult] = useState<any>(null);
  const [localTest, setLocalTest] = useState<boolean>(false);
  
  const hasAccess = canAccessFeature('screener_advanced');
  
  // Testar função manual
  useEffect(() => {
    console.log('🔍 FeatureGateDebug - Estado atual:', {
      loading,
      currentPlan,
      subscription: subscription?.plan,
      featuresCount: features.length,
      hasAccess,
      user: user?.id
    });
    
    // Teste manual da função
    if (features.length > 0) {
      const feature = features.find(f => f.feature_key === 'screener_advanced');
      console.log('🎯 Feature screener_advanced encontrada:', {
        found: !!feature,
        enabled: feature?.is_enabled,
        feature
      });
      setLocalTest(!!feature?.is_enabled);
    }
  }, [loading, currentPlan, subscription, features, hasAccess, user]);
  
  const runFullDebug = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/debug/subscription-check?userId=${user.id}`);
      const result = await response.json();
      setDebugResult(result);
    } catch (error) {
      console.error('Erro no debug:', error);
    }
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 FeatureGate Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Loading:</strong> {loading ? 'SIM' : 'NÃO'}</div>
        <div><strong>Plano Atual:</strong> {currentPlan}</div>
        <div><strong>Subscription Plan:</strong> {subscription?.plan || 'NULL'}</div>
        <div><strong>Features Count:</strong> {features.length}</div>
        <div><strong>canAccessFeature('screener_advanced'):</strong> 
          <span className={hasAccess ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {hasAccess ? 'TRUE' : 'FALSE'}
          </span>
        </div>
        <div><strong>Teste Local:</strong> 
          <span className={localTest ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {localTest ? 'TRUE' : 'FALSE'}
          </span>
        </div>
        
        {features.length > 0 && (
          <div>
            <strong>Features encontradas:</strong>
            <ul className="ml-4 mt-1">
              {features.map(f => (
                <li key={f.feature_key} className={f.feature_key === 'screener_advanced' ? 'font-bold text-green-600' : ''}>
                  {f.feature_key}: {f.is_enabled ? 'ENABLED' : 'DISABLED'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-white rounded border">
        <h4 className="font-medium mb-2">Teste do FeatureGate:</h4>
        <FeatureGate featureKey="screener_advanced" requiredPlan="PRO">
          <div className="text-green-600 font-bold">✅ FILTROS AVANÇADOS LIBERADOS!</div>
        </FeatureGate>
        
        {/* Teste sem FeatureGate */}
        <div className="mt-2 p-2 bg-blue-50 rounded">
          <h5 className="font-medium text-blue-800">Teste Direto (sem FeatureGate):</h5>
          {localTest ? (
            <div className="text-green-600 font-bold">✅ ACESSO DIRETO CONFIRMADO!</div>
          ) : (
            <div className="text-red-600 font-bold">❌ SEM ACESSO DIRETO!</div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <button
          onClick={runFullDebug}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔍 Debug Completo do Banco
        </button>
        
        {debugResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <pre>{JSON.stringify(debugResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 