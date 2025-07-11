"use client";

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const FinalDiagnostic: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Testar API screener
      const screenerResponse = await fetch('/api/etfs/screener?search=GLD&limit=1');
      const screenerData = await screenerResponse.json();
      const gldFromScreener = screenerData.etfs[0];
      
      // Testar API details
      const detailsResponse = await fetch('/api/etfs/details/GLD');
      const gldFromDetails = await detailsResponse.json();
      
      // Validar valores esperados
      const expectedReturns12m = 0.43; // ~43%
      const expectedVolatility12m = 0.175; // ~17.5%
      const expectedMaxDrawdown = -0.081; // ~-8.1%
      
      const tolerance = 0.1; // 10% de tolerância
      
      const screenerValid = {
        returns12m: Math.abs(gldFromScreener.returns_12m - expectedReturns12m) < tolerance,
        volatility12m: Math.abs(gldFromScreener.volatility_12m - expectedVolatility12m) < tolerance,
        maxDrawdown: Math.abs(gldFromScreener.max_drawdown - expectedMaxDrawdown) < tolerance
      };
      
      const detailsValid = {
        returns12m: Math.abs(gldFromDetails.returns_12m - expectedReturns12m) < tolerance,
        volatility12m: Math.abs(gldFromDetails.volatility_12m - expectedVolatility12m) < tolerance,
        maxDrawdown: Math.abs(gldFromDetails.max_drawdown - expectedMaxDrawdown) < tolerance
      };
      
      setResults({
        screener: {
          data: gldFromScreener,
          valid: screenerValid,
          allValid: Object.values(screenerValid).every(v => v)
        },
        details: {
          data: gldFromDetails,
          valid: detailsValid,
          allValid: Object.values(detailsValid).every(v => v)
        },
        expected: {
          returns_12m: expectedReturns12m,
          volatility_12m: expectedVolatility12m,
          max_drawdown: expectedMaxDrawdown
        }
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAsPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">🔧 Diagnóstico Final - Correção de Percentuais</h3>
        <button
          onClick={runDiagnostic}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Testando...' : 'Executar Diagnóstico'}</span>
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Este diagnóstico valida que a correção de percentuais foi aplicada corretamente.</p>
        <p><strong>Problema:</strong> ETFs mostravam valores 100x maiores (ex: 4269% ao invés de 42.69%)</p>
        <p><strong>Solução:</strong> APIs agora dividem por 100 antes de enviar para o frontend</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Erro:</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Status Geral */}
          <div className={`p-4 rounded-lg ${results.screener.allValid && results.details.allValid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-center space-x-2">
              <CheckCircle className={`w-5 h-5 ${results.screener.allValid && results.details.allValid ? 'text-green-600' : 'text-yellow-600'}`} />
              <span className={`font-medium ${results.screener.allValid && results.details.allValid ? 'text-green-800' : 'text-yellow-800'}`}>
                {results.screener.allValid && results.details.allValid ? '✅ CORREÇÃO APLICADA COM SUCESSO!' : '⚠️ Alguns valores ainda precisam de ajuste'}
              </span>
            </div>
          </div>

          {/* API Screener */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">📊 API Screener (Tabela)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg border ${results.screener.valid.returns12m ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700">Retorno 12m</div>
                <div className="text-lg">{formatAsPercentage(results.screener.data.returns_12m)}</div>
                <div className="text-xs text-gray-500">Esperado: ~{formatAsPercentage(results.expected.returns_12m)}</div>
              </div>
              <div className={`p-3 rounded-lg border ${results.screener.valid.volatility12m ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700">Volatilidade 12m</div>
                <div className="text-lg">{formatAsPercentage(results.screener.data.volatility_12m)}</div>
                <div className="text-xs text-gray-500">Esperado: ~{formatAsPercentage(results.expected.volatility_12m)}</div>
              </div>
              <div className={`p-3 rounded-lg border ${results.screener.valid.maxDrawdown ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700">Max Drawdown</div>
                <div className="text-lg">{formatAsPercentage(results.screener.data.max_drawdown)}</div>
                <div className="text-xs text-gray-500">Esperado: ~{formatAsPercentage(results.expected.max_drawdown)}</div>
              </div>
            </div>
          </div>

          {/* API Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">🔍 API Details (Modal)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg border ${results.details.valid.returns12m ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700">Retorno 12m</div>
                <div className="text-lg">{formatAsPercentage(results.details.data.returns_12m)}</div>
                <div className="text-xs text-gray-500">Esperado: ~{formatAsPercentage(results.expected.returns_12m)}</div>
              </div>
              <div className={`p-3 rounded-lg border ${results.details.valid.volatility12m ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700">Volatilidade 12m</div>
                <div className="text-lg">{formatAsPercentage(results.details.data.volatility_12m)}</div>
                <div className="text-xs text-gray-500">Esperado: ~{formatAsPercentage(results.expected.volatility_12m)}</div>
              </div>
              <div className={`p-3 rounded-lg border ${results.details.valid.maxDrawdown ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700">Max Drawdown</div>
                <div className="text-lg">{formatAsPercentage(results.details.data.max_drawdown)}</div>
                <div className="text-xs text-gray-500">Esperado: ~{formatAsPercentage(results.expected.max_drawdown)}</div>
              </div>
            </div>
          </div>

          {/* Dados Brutos para Debug */}
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-700">🔧 Dados Brutos (Debug)</summary>
            <div className="mt-3 space-y-2">
              <div>
                <strong>Screener API:</strong>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify({
                    returns_12m: results.screener.data.returns_12m,
                    volatility_12m: results.screener.data.volatility_12m,
                    max_drawdown: results.screener.data.max_drawdown
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Details API:</strong>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify({
                    returns_12m: results.details.data.returns_12m,
                    volatility_12m: results.details.data.volatility_12m,
                    max_drawdown: results.details.data.max_drawdown
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default FinalDiagnostic; 