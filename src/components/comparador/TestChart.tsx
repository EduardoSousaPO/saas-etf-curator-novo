'use client';

import { useState, useEffect } from 'react';

interface ETF {
  symbol: string;
  name?: string | null;
}

interface TestChartProps {
  etfs: ETF[];
}

export default function TestChart({ etfs }: TestChartProps) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (etfs.length === 0) return;

    const testAPI = async () => {
      try {
        const symbols = etfs.map(etf => etf.symbol).join(',');
        console.log('🧪 TESTE: Carregando dados para:', symbols);
        
        const response = await fetch(`/api/etfs/historical?symbols=${symbols}&period=1m`);
        const result = await response.json();
        
        console.log('🧪 TESTE: Dados recebidos:', result);
        console.log('🧪 TESTE: Tipo de result.data:', typeof result.data);
        console.log('🧪 TESTE: Keys de result.data:', Object.keys(result.data || {}));
        
        // Testar processamento
        Object.entries(result.data || {}).forEach(([symbol, symbolData]) => {
          console.log(`🧪 TESTE ${symbol}:`, symbolData);
          console.log(`🧪 TESTE ${symbol} tipo:`, typeof symbolData);
          console.log(`🧪 TESTE ${symbol} é array:`, Array.isArray(symbolData));
          
          if (symbolData && typeof symbolData === 'object' && 'prices' in symbolData) {
            console.log(`🧪 TESTE ${symbol} prices:`, (symbolData as any).prices);
            console.log(`🧪 TESTE ${symbol} prices é array:`, Array.isArray((symbolData as any).prices));
          }
        });
        
        setData(result);
      } catch (err) {
        console.error('🧪 TESTE: Erro:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    testAPI();
  }, [etfs]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">🧪 Teste de Debug</h3>
      
      {error && (
        <div className="text-red-600 mb-2">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="text-sm">
          <div className="mb-2">
            <strong>ETFs testados:</strong> {etfs.map(e => e.symbol).join(', ')}
          </div>
          <div className="mb-2">
            <strong>Símbolos encontrados:</strong> {Object.keys(data.data || {}).join(', ')}
          </div>
          <div className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 