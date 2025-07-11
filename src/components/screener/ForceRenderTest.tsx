'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';

export default function ForceRenderTest() {
  const { canAccessFeature, currentPlan, features } = useSubscription();
  
  // Forçar renderização baseada em lógica simples
  const shouldShowFilters = currentPlan === 'PRO' || features.some(f => f.feature_key === 'screener_advanced' && f.is_enabled);
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-green-800 mb-2">🧪 Teste de Renderização Forçada</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Plano:</strong> {currentPlan}</div>
        <div><strong>Should Show Filters:</strong> {shouldShowFilters ? 'SIM' : 'NÃO'}</div>
        <div><strong>canAccessFeature:</strong> {canAccessFeature('screener_advanced') ? 'SIM' : 'NÃO'}</div>
      </div>
      
      {/* Renderização forçada sem FeatureGate */}
      {shouldShowFilters && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-bold text-green-600 mb-2">✅ FILTROS AVANÇADOS (RENDERIZAÇÃO FORÇADA)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Retorno 12m Mínimo:</label>
              <input 
                type="number" 
                placeholder="% mínimo"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sharpe Ratio Mínimo:</label>
              <input 
                type="number" 
                placeholder="Valor mínimo"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Volatilidade Máxima:</label>
              <input 
                type="number" 
                placeholder="% máximo"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dividend Yield Mínimo:</label>
              <input 
                type="number" 
                placeholder="% mínimo"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}
      
      {!shouldShowFilters && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-red-600">❌ Filtros não devem aparecer (lógica forçada)</div>
        </div>
      )}
    </div>
  );
} 