'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DataFormatDebug() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('GLD');
  
  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug/etf-data?symbol=${symbol}`);
      const result = await response.json();
      setDebugData(result);
    } catch (error) {
      console.error('Erro ao buscar debug data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-orange-800 mb-2">🔧 Debug de Formatação de Dados</h3>
      
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Símbolo do ETF"
          className="px-3 py-1 border rounded"
        />
        <Button
          onClick={fetchDebugData}
          disabled={loading}
          size="sm"
        >
          {loading ? 'Carregando...' : 'Verificar Dados'}
        </Button>
      </div>
      
      {debugData && (
        <div className="space-y-4">
          {debugData.success ? (
            <>
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium mb-2">📊 Dados Brutos do Banco:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugData.rawData, null, 2)}
                </pre>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium mb-2">🎨 Comparação de Formatação:</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(debugData.formattedData).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {value as string}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium mb-2">📝 Notas:</h4>
                <ul className="text-sm space-y-1">
                  {debugData.notes.map((note: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-red-600">
              Erro: {debugData.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 