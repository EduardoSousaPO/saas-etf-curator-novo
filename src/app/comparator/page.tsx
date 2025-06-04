// src/app/comparator/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ETF } from "@/types";
import ETFSelectionForm from "@/components/comparator/ETFSelectionForm";
import ComparisonTable from "@/components/comparator/ComparisonTable";
import ComparisonCharts from "@/components/comparator/ComparisonCharts";
import ComparisonInsights from "@/components/comparator/ComparisonInsights";
import AssistantChat from "@/components/assistant/AssistantChat";
import { toast } from "react-hot-toast";
import { BarChart3, TrendingUp, Award, AlertTriangle } from "lucide-react";

interface ComparisonStats {
  total_compared: number;
  best_performer: string;
  lowest_risk: string;
  highest_quality: string;
  avg_quality_score: number;
}

interface ComparisonResponse {
  etfs: ETF[];
  stats: ComparisonStats;
  enhanced: boolean;
  timestamp: string;
}

export default function ComparatorPage() {
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableETFs, setAvailableETFs] = useState<ETF[]>([]);
  const [comparisonStats, setComparisonStats] = useState<ComparisonStats | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Carregar todos os ETFs da API ao iniciar
  useEffect(() => {
    const fetchAllETFs = async () => {
      try {
        // Buscar todos os ETFs do banco de dados (com limite grande para pegar todos)
        const response = await fetch('/api/etfs/screener?limit=3000');
        if (!response.ok) {
          throw new Error('Falha ao carregar lista de ETFs');
        }
        const data = await response.json();
        setAvailableETFs(data.etfs);
      } catch (error) {
        console.error('Erro ao buscar ETFs:', error);
        toast.error('Falha ao carregar lista de ETFs');
      } finally {
        setLoading(false);
      }
    };

    fetchAllETFs();
  }, []);

  // Função de callback para receber ETFs selecionados
  const onETFSelectionChange = useCallback((symbols: string[]) => {
    if (symbols.length === 0) {
      setSelectedETFs([]);
      setComparisonStats(null);
      return;
    }
    
    // Buscar dados detalhados via API de comparação
    fetchETFDetails(symbols);
  }, []);

  // Função para buscar dados detalhados de ETFs usando a API melhorada
  const fetchETFDetails = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) {
      setSelectedETFs([]);
      setComparisonStats(null);
      return;
    }

    setLoadingComparison(true);
    try {
      const response = await fetch(`/api/etfs/compare?symbols=${symbols.join(',')}&enhanced=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch ETF comparison data');
      }
      
      const data: ComparisonResponse = await response.json();
      setSelectedETFs(data.etfs);
      setComparisonStats(data.stats);
      
      toast.success(`Comparação de ${data.etfs.length} ETFs carregada com sucesso!`);
    } catch (error) {
      console.error('Erro ao buscar dados detalhados de ETF:', error);
      toast.error('Falha ao carregar dados para comparação');
      setSelectedETFs([]);
      setComparisonStats(null);
    } finally {
      setLoadingComparison(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comparador de ETFs</h1>
              <p className="text-gray-600">Compare até 6 ETFs lado a lado com dados reais e métricas avançadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ETF Selection */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Selecionar ETFs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Escolha de 2 a 6 ETFs para análise comparativa detalhada
            </p>
          </div>
          <div className="p-4">
            {loading && availableETFs.length === 0 ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="text-gray-600">Carregando lista de ETFs...</span>
              </div>
            ) : (
              <ETFSelectionForm 
                availableETFs={availableETFs} 
                onSelectionChange={onETFSelectionChange} 
                maxSelection={6} 
              />
            )}
          </div>
        </div>

        {loadingComparison ? (
          <div className="bg-white rounded-lg border shadow-sm p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando comparação...</h3>
              <p className="text-gray-600">Buscando dados detalhados e calculando métricas</p>
            </div>
          </div>
        ) : selectedETFs.length > 0 ? (
          <div className="space-y-6">
            {/* Estatísticas de Comparação */}
            {comparisonStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Melhor Performance</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-green-600">{comparisonStats.best_performer}</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600">Menor Risco</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-yellow-600">{comparisonStats.lowest_risk}</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Maior Qualidade</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-purple-600">{comparisonStats.highest_quality}</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Score Médio</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">{comparisonStats.avg_quality_score}/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de Comparação */}
            <ComparisonTable etfs={selectedETFs} />
            
            {/* Gráficos de Comparação */}
            <ComparisonCharts etfs={selectedETFs} />
            
            {/* Insights de Comparação */}
            <ComparisonInsights etfs={selectedETFs} />
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm p-12">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pronto para Comparar
              </h3>
              <p className="text-gray-600 mb-6">
                Selecione 2 ou mais ETFs acima para iniciar a análise comparativa detalhada
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Métricas de Performance</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Análise de Risco</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Score de Qualidade</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Assistente Virtual */}
      <AssistantChat />
    </div>
  );
}
