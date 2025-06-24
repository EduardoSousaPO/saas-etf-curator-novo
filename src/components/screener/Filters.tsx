// src/components/screener/Filters.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

// Define a type for the filters
interface FilterValues {
  searchTerm?: string;
  assetclass?: string;
  // exchange?: string; // Removido - coluna não existe no banco
  totalAssetsMin?: number;
  totalAssetsMax?: number;
  // Add more filters as needed based on the etfs schema
  returns_12m_min?: number;
  sharpe_12m_min?: number;
  dividend_yield_min?: number;
  onlyComplete: boolean;
  itemsPerPage?: number; // Nova propriedade para itens por página
}

interface FiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  basicOnly?: boolean;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  currentSortBy?: string;
  currentSortOrder?: string;
  onItemsPerPageChange?: (itemsPerPage: number) => void; // Nova prop para mudança de itens por página
  currentItemsPerPage?: number; // Prop para valor atual de itens por página
}

export default function Filters({ 
  onFilterChange, 
  basicOnly = false, 
  onSortChange,
  currentSortBy = "symbol",
  currentSortOrder = "asc",
  onItemsPerPageChange,
  currentItemsPerPage = 20
}: FiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({ onlyComplete: false });
  const [assetClasses, setAssetClasses] = useState<string[]>([]);
  // const [exchanges, setExchanges] = useState<string[]>([]); // Removido - coluna não existe
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [onlyComplete, setOnlyComplete] = useState(false);

  // Fetch asset classes on component mount
  useEffect(() => {
    const fetchAssetClasses = async () => {
      try {
        // Usamos a API para buscar dados iniciais de ETFs
        console.log("Buscando asset classes...");
        const response = await fetch("/api/etfs/screener?page=1&limit=100");
        const data = await response.json();
        
        console.log("Dados recebidos:", data);
        
        if (data.etfs && Array.isArray(data.etfs)) {
          // Extraímos asset classes únicas
          const uniqueAssetClasses = Array.from(
            new Set(data.etfs.map((etf: any) => etf.assetclass).filter(Boolean))
          ) as string[];
          
          console.log("Asset classes encontradas:", uniqueAssetClasses);
          
          setAssetClasses(uniqueAssetClasses.sort());
          setDebugInfo(`Carregadas ${uniqueAssetClasses.length} asset classes`);
        }
      } catch (error) {
        console.error("Erro ao buscar asset classes:", error);
        setDebugInfo(`Erro: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssetClasses();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Alterando filtro ${name} para ${value}`);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    console.log(`Alterando slider ${name} para [${value.join(", ")}]`);
    setFilters((prev) => ({ ...prev, [`${name}Min`]: value[0], [`${name}Max`]: value[1] }));
  };

  const handleSingleSliderChange = (name: string, value: number[]) => {
    console.log(`Alterando slider único ${name} para ${value[0]}`);
    setFilters((prev) => ({ ...prev, [name]: value[0] }));
  };

  const handleOnlyCompleteChange = (checked: boolean) => {
    setOnlyComplete(checked);
    setFilters((prev) => ({ ...prev, onlyComplete: checked }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Aplicando filtros:", filters);
    setDebugInfo(`Filtros aplicados: ${JSON.stringify(filters)}`);
    onFilterChange(filters);
  };

  const clearFilters = () => {
    console.log("Limpando todos os filtros");
    setFilters({ onlyComplete: false });
    setDebugInfo("Filtros limpos");
    onFilterChange({ onlyComplete: false });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      {debugInfo && (
        <div className="text-xs bg-blue-100 dark:bg-blue-900 p-2 mb-2 rounded">
          {debugInfo}
        </div>
      )}
      {loading && (
        <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-300 mb-2">
          <span className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></span>
          <span>Carregando asset classes...</span>
        </div>
      )}
      {!loading && assetClasses.length === 0 && (
        <div className="text-xs text-red-600 dark:text-red-400 mb-2">Nenhuma asset class disponível.</div>
      )}
      {/* Exchanges removidas - coluna não existe no banco */}
      
      <div>
        <Label htmlFor="searchTerm" className="dark:text-gray-200">Search Symbol/Name</Label>
        <Input
          id="searchTerm"
          name="searchTerm"
          type="text"
          value={filters.searchTerm || ""}
          onChange={handleInputChange}
          placeholder="e.g., IVV or iShares..."
          className="mt-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        />
      </div>

      {/* Seletor de Itens por Página */}
      <div>
        <Label htmlFor="itemsPerPage" className="dark:text-gray-200">ETFs por Página</Label>
        <Select 
          onValueChange={(value) => onItemsPerPageChange?.(parseInt(value))} 
          value={currentItemsPerPage?.toString()}
        >
          <SelectTrigger className="w-full mt-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <SelectValue placeholder="Selecione quantidade" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
            <SelectItem value="20" className="dark:hover:bg-gray-600">20 ETFs</SelectItem>
            <SelectItem value="50" className="dark:hover:bg-gray-600">50 ETFs</SelectItem>
            <SelectItem value="100" className="dark:hover:bg-gray-600">100 ETFs</SelectItem>
            <SelectItem value="200" className="dark:hover:bg-gray-600">200 ETFs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assetclass" className="dark:text-gray-200">Asset Class</Label>
        <Select onValueChange={(value) => handleSelectChange("assetclass", value)} value={filters.assetclass}>
          <SelectTrigger className="w-full mt-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <SelectValue placeholder="Select Asset Class" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
            <SelectItem value="all" className="dark:hover:bg-gray-600">All Asset Classes</SelectItem>
            {loading ? (
              <SelectItem value="loading" disabled>Carregando...</SelectItem>
            ) : (
              assetClasses.map((assetClass) => (
                <SelectItem key={assetClass} value={assetClass} className="dark:hover:bg-gray-600">{assetClass}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Filtros avançados - apenas para planos PRO+ */}
      {!basicOnly && (
        <>
          <div>
            <Label htmlFor="totalAssets" className="dark:text-gray-200">Total Assets (Min: {filters.totalAssetsMin || 0} - Max: {filters.totalAssetsMax || 1000} Bn)</Label>
            <Slider
              id="totalAssets"
              name="totalAssets"
              min={0}
              max={1000} // Assuming max 1 Trillion, in Billions
              step={10}
              defaultValue={[filters.totalAssetsMin || 0, filters.totalAssetsMax || 1000]}
              onValueChange={(value) => handleSliderChange("totalAssets", value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="returns_12m_min" className="dark:text-gray-200">12m Return (Min: {filters.returns_12m_min || -95}%)</Label>
            <Slider
              id="returns_12m_min"
              name="returns_12m_min"
              min={-95}
              max={300}
              step={1}
              defaultValue={[filters.returns_12m_min || -95]}
              onValueChange={(value) => handleSingleSliderChange("returns_12m_min", value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="sharpe_12m_min" className="dark:text-gray-200">12m Sharpe Ratio (Min: {filters.sharpe_12m_min || -2})</Label>
            <Slider
              id="sharpe_12m_min"
              name="sharpe_12m_min"
              min={-2}
              max={3}
              step={0.1}
              defaultValue={[filters.sharpe_12m_min || -2]}
              onValueChange={(value) => handleSingleSliderChange("sharpe_12m_min", value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="dividend_yield_min" className="dark:text-gray-200">Dividend Yield (Min: {filters.dividend_yield_min || 0}%)</Label>
            <Slider
              id="dividend_yield_min"
              name="dividend_yield_min"
              min={0}
              max={25}
              step={0.1}
              defaultValue={[filters.dividend_yield_min || 0]}
              onValueChange={(value) => handleSingleSliderChange("dividend_yield_min", value)}
              className="mt-2"
            />
          </div>
        </>
      )}
      
      {basicOnly && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            <strong>Plano Starter:</strong> Filtros básicos disponíveis
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            Upgrade para PRO para acessar filtros avançados como Total Assets, Returns, Sharpe Ratio e Dividend Yield.
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox id="onlyComplete" checked={onlyComplete} onCheckedChange={handleOnlyCompleteChange} />
        <Label htmlFor="onlyComplete" className="dark:text-gray-200">Apenas ETFs com dados completos</Label>
      </div>

      {/* Controles de Ordenação */}
      {onSortChange && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <Label className="dark:text-gray-200 font-medium mb-3 block">📊 Ordenação</Label>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="sortBy" className="dark:text-gray-200 text-sm">Ordenar por:</Label>
              <Select onValueChange={(value) => onSortChange(value, currentSortOrder)} value={currentSortBy}>
                <SelectTrigger className="w-full mt-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Selecione o campo" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                  <SelectItem value="symbol">Símbolo</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="assetclass">Asset Class</SelectItem>
                  <SelectItem value="totalasset">Total Assets</SelectItem>
                  <SelectItem value="returns_12m">Retorno 12m</SelectItem>
                  <SelectItem value="returns_24m">Retorno 24m</SelectItem>
                  <SelectItem value="returns_36m">Retorno 36m</SelectItem>
                  <SelectItem value="ten_year_return">Retorno 10 anos</SelectItem>
                  <SelectItem value="volatility_12m">Volatilidade 12m</SelectItem>
                  <SelectItem value="volatility_24m">Volatilidade 24m</SelectItem>
                  <SelectItem value="volatility_36m">Volatilidade 36m</SelectItem>
                  <SelectItem value="ten_year_volatility">Volatilidade 10 anos</SelectItem>
                  <SelectItem value="sharpe_12m">Sharpe 12m</SelectItem>
                  <SelectItem value="sharpe_24m">Sharpe 24m</SelectItem>
                  <SelectItem value="sharpe_36m">Sharpe 36m</SelectItem>
                  <SelectItem value="ten_year_sharpe">Sharpe 10 anos</SelectItem>
                  <SelectItem value="max_drawdown">Max Drawdown</SelectItem>
                  <SelectItem value="dividends_12m">Dividendos 12m</SelectItem>
                  <SelectItem value="dividends_24m">Dividendos 24m</SelectItem>
                  <SelectItem value="dividends_36m">Dividendos 36m</SelectItem>
                  <SelectItem value="dividends_all_time">Dividendos Total</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder" className="dark:text-gray-200 text-sm">Ordem:</Label>
              <Select onValueChange={(value) => onSortChange(currentSortBy, value)} value={currentSortOrder}>
                <SelectTrigger className="w-full mt-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Selecione a ordem" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                  <SelectItem value="asc">🔼 Crescente (A-Z, menor-maior)</SelectItem>
                  <SelectItem value="desc">🔽 Decrescente (Z-A, maior-menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Apply Filters</Button>
        <Button type="button" variant="outline" onClick={clearFilters} className="w-full dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">Clear Filters</Button>
      </div>
    </form>
  );
}

