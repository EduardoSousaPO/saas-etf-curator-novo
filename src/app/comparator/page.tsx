// src/app/comparator/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ETF } from "@/types";
import ETFSelectionForm from "@/components/comparator/ETFSelectionForm";
import ComparisonTable from "@/components/comparator/ComparisonTable";
import ComparisonCharts from "@/components/comparator/ComparisonCharts";
import ComparisonInsights from "@/components/comparator/ComparisonInsights";
import { toast } from "react-hot-toast";

export default function ComparatorPage() {
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableETFs, setAvailableETFs] = useState<ETF[]>([]);

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
  const onETFSelectionChange = useCallback((selectedETFs: ETF[]) => {
    setSelectedETFs(selectedETFs);
  }, []);

  // Função para buscar dados detalhados de ETFs (quando necessário)
  const fetchETFDetails = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) {
      setSelectedETFs([]);
      return;
    }

    setLoading(true);
    try {
      // Se implementar uma API específica para comparação no futuro, usar:
      // const response = await fetch(`/api/etfs/compare?symbols=${symbols.join(',')}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch ETF data');
      // }
      // const data = await response.json();
      // setSelectedETFs(data);

      // Por enquanto, filtramos dos ETFs já carregados
      const filteredETFs = availableETFs.filter(etf => etf.symbol && symbols.includes(etf.symbol));
      setSelectedETFs(filteredETFs);
    } catch (error) {
      console.error('Erro ao buscar dados detalhados de ETF:', error);
      toast.error('Falha ao carregar dados para comparação');
    } finally {
      setLoading(false);
    }
  }, [availableETFs]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Comparador de ETFs</h1>
      
      <div className="mb-8">
        {loading && availableETFs.length === 0 ? (
          <div className="text-center py-4">Carregando lista de ETFs...</div>
        ) : (
          <ETFSelectionForm 
            availableETFs={availableETFs} 
            onSelectionChange={onETFSelectionChange} 
            maxSelection={4} 
          />
        )}
      </div>

      {loading && availableETFs.length === 0 ? (
        <div className="text-center py-10">Carregando dados...</div>
      ) : selectedETFs.length > 0 ? (
        <div className="space-y-10">
          <ComparisonTable etfs={selectedETFs} />
          <ComparisonCharts etfs={selectedETFs} />
          <ComparisonInsights etfs={selectedETFs} />
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Selecione os ETFs acima para compará-los
        </div>
      )}
    </div>
  );
}
