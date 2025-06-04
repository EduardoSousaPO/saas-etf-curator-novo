"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface CorrelationData {
  etf_a_symbol: string;
  etf_b_symbol: string;
  correlation_coefficient: number;
  data_points: number;
  calculation_date: string;
}

interface CorrelationMatrix {
  [symbol: string]: {
    [symbol: string]: number;
  };
}

export default function CorrelationMatrix() {
  const [symbols, setSymbols] = useState<string[]>(['SPY', 'QQQ', 'VTI', 'AGG']);
  const [newSymbol, setNewSymbol] = useState('');
  const [matrix, setMatrix] = useState<CorrelationMatrix>({});
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadCorrelations();
  }, [symbols]);

  const loadCorrelations = async () => {
    setLoading(true);
    try {
      const symbolsParam = symbols.join(',');
      
      // Buscar matriz de correlações
      const matrixResponse = await fetch(
        `/api/analytics/correlations?type=matrix&symbols=${symbolsParam}`
      );
      
      if (matrixResponse.ok) {
        const matrixData = await matrixResponse.json();
        // Garantir que todos os valores são números
        const cleanMatrix: CorrelationMatrix = {};
        if (matrixData.matrix) {
          Object.keys(matrixData.matrix).forEach(symbolA => {
            cleanMatrix[symbolA] = {};
            Object.keys(matrixData.matrix[symbolA]).forEach(symbolB => {
              const value = matrixData.matrix[symbolA][symbolB];
              cleanMatrix[symbolA][symbolB] = typeof value === 'number' ? value : parseFloat(String(value || '0'));
            });
          });
        }
        setMatrix(cleanMatrix);
      }

      // Buscar lista de correlações
      const correlationsResponse = await fetch(
        `/api/analytics/correlations?type=correlations&symbols=${symbolsParam}&limit=50`
      );
      
      if (correlationsResponse.ok) {
        const correlationsData = await correlationsResponse.json();
        // Garantir que correlation_coefficient é número
        const cleanCorrelations = (correlationsData.correlations || []).map((corr: any) => ({
          ...corr,
          correlation_coefficient: Number(corr.correlation_coefficient) || 0,
          data_points: Number(corr.data_points) || 0
        }));
        setCorrelations(cleanCorrelations);
      }

    } catch (error) {
      console.error('Erro ao carregar correlações:', error);
      toast.error('Erro ao carregar dados de correlação');
    } finally {
      setLoading(false);
    }
  };

  const calculateCorrelations = async () => {
    setCalculating(true);
    try {
      const response = await fetch('/api/analytics/correlations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: symbols,
          force_recalculate: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.total_calculated} correlações calculadas`);
        loadCorrelations(); // Recarregar dados
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao calcular correlações');
      }
    } catch (error) {
      console.error('Erro ao calcular correlações:', error);
      toast.error('Erro ao processar cálculo');
    } finally {
      setCalculating(false);
    }
  };

  const addSymbol = async () => {
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol || symbols.includes(symbol) || symbols.length >= 10) {
      return;
    }

    try {
      // Verificar se o ETF existe na base de dados
      const response = await fetch(`/api/etfs/enhanced?symbols=${symbol}&enhanced=false&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data.etfs && data.etfs.length > 0) {
          setSymbols([...symbols, symbol]);
          setNewSymbol('');
          toast.success(`${symbol} adicionado à matriz`);
        } else {
          toast.error(`ETF ${symbol} não encontrado na base de dados`);
        }
      } else {
        toast.error(`Erro ao verificar ETF ${symbol}`);
      }
    } catch (error) {
      console.error('Erro ao validar ETF:', error);
      toast.error(`Erro ao validar ETF ${symbol}`);
    }
  };

  const removeSymbol = (symbolToRemove: string) => {
    setSymbols(symbols.filter(s => s !== symbolToRemove));
  };

  const getCorrelationColor = (value: number | string | null | undefined): string => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value || '0'));
    if (isNaN(numValue)) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    if (numValue >= 0.7) return 'bg-green-100 text-green-800 border-green-200';
    if (numValue >= 0.3) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (numValue >= -0.3) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (numValue >= -0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCorrelationLabel = (value: number | string | null | undefined): string => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value || '0'));
    if (isNaN(numValue)) return 'Inválido';
    
    if (numValue >= 0.7) return 'Forte Positiva';
    if (numValue >= 0.3) return 'Moderada Positiva';
    if (numValue >= -0.3) return 'Fraca';
    if (numValue >= -0.7) return 'Moderada Negativa';
    return 'Forte Negativa';
  };

  const formatCorrelation = (value: number | string | null | undefined): string => {
    // Converter para número e validar
    const numValue = typeof value === 'number' ? value : parseFloat(String(value || '0'));
    
    // Se não for um número válido, retornar 'N/A'
    if (isNaN(numValue)) {
      return 'N/A';
    }
    
    return numValue.toFixed(3);
  };

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Matriz de Correlações</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadCorrelations}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              onClick={calculateCorrelations}
              disabled={calculating || symbols.length < 2}
              size="sm"
            >
              {calculating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              Calcular
            </Button>
          </div>
        </div>

        {/* Adicionar Symbol */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
            placeholder="Adicionar ETF (ex: VEA)"
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={10}
          />
          <Button
            onClick={addSymbol}
            disabled={!newSymbol.trim() || symbols.length >= 10}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-500">
            {symbols.length}/10 ETFs
          </span>
        </div>

        {/* Lista de Symbols */}
        <div className="flex flex-wrap gap-2">
          {symbols.map(symbol => (
            <span
              key={symbol}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {symbol}
              <button
                onClick={() => removeSymbol(symbol)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Matriz de Correlações */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriz</h3>
        
        {symbols.length >= 2 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2"></th>
                  {symbols.map(symbol => (
                    <th key={symbol} className="text-center p-2 font-medium text-gray-700">
                      {symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {symbols.map(symbolA => (
                  <tr key={symbolA}>
                    <td className="p-2 font-medium text-gray-700">{symbolA}</td>
                    {symbols.map(symbolB => {
                      const correlation = matrix[symbolA]?.[symbolB] ?? 
                                        (symbolA === symbolB ? 1.0 : 0.0);
                      
                      return (
                        <td key={symbolB} className="p-1">
                          <div 
                            className={`
                              text-center p-2 rounded border text-xs font-medium
                              ${getCorrelationColor(correlation)}
                            `}
                            title={`${symbolA} vs ${symbolB}: ${getCorrelationLabel(correlation)}`}
                          >
                            {formatCorrelation(correlation)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Adicione pelo menos 2 ETFs para visualizar a matriz</p>
          </div>
        )}
      </div>

      {/* Top Correlações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlações Positivas */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Maiores Correlações</h3>
          </div>
          
          <div className="space-y-2">
            {correlations
              .filter(c => c.correlation_coefficient > 0)
              .sort((a, b) => b.correlation_coefficient - a.correlation_coefficient)
              .slice(0, 5)
              .map((corr, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-sm">
                    <span className="font-medium">{corr.etf_a_symbol}</span>
                    <span className="text-gray-500 mx-2">↔</span>
                    <span className="font-medium">{corr.etf_b_symbol}</span>
                  </div>
                  <div className="text-sm font-bold text-green-700">
                    {formatCorrelation(corr.correlation_coefficient)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Correlações Negativas */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Menores Correlações</h3>
          </div>
          
          <div className="space-y-2">
            {correlations
              .filter(c => c.correlation_coefficient < 0)
              .sort((a, b) => a.correlation_coefficient - b.correlation_coefficient)
              .slice(0, 5)
              .map((corr, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-sm">
                    <span className="font-medium">{corr.etf_a_symbol}</span>
                    <span className="text-gray-500 mx-2">↔</span>
                    <span className="font-medium">{corr.etf_b_symbol}</span>
                  </div>
                  <div className="text-sm font-bold text-red-700">
                    {formatCorrelation(corr.correlation_coefficient)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Como Interpretar</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p><strong>+0.7 a +1.0:</strong> Forte correlação positiva (movem juntos)</p>
            <p><strong>+0.3 a +0.7:</strong> Correlação moderada positiva</p>
            <p><strong>-0.3 a +0.3:</strong> Correlação fraca ou inexistente</p>
          </div>
          <div>
            <p><strong>-0.3 a -0.7:</strong> Correlação moderada negativa</p>
            <p><strong>-0.7 a -1.0:</strong> Forte correlação negativa (movem opostos)</p>
            <p><strong>Para diversificação:</strong> Busque correlações baixas ou negativas</p>
          </div>
        </div>
      </div>
    </div>
  );
} 