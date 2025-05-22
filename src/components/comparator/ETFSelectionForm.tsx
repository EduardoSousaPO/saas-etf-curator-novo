// src/components/comparator/ETFSelectionForm.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { ETF } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Not directly used in combobox, but for multi-select logic

interface ETFSelectionFormProps {
  availableETFs: ETF[];
  onSelectionChange: (selectedETFs: ETF[]) => void;
  maxSelection: number;
}

export default function ETFSelectionForm({ availableETFs, onSelectionChange, maxSelection }: ETFSelectionFormProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]); // Store symbols of selected ETFs
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [filteredETFs, setFilteredETFs] = React.useState<ETF[]>([]);

  // Função para filtrar ETFs baseado na consulta de pesquisa
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredETFs(availableETFs);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = availableETFs.filter(etf => 
      (etf.symbol?.toLowerCase().includes(query)) || 
      (etf.name?.toLowerCase().includes(query))
    );
    setFilteredETFs(filtered);
  }, [searchQuery, availableETFs]);

  // Inicializa filteredETFs quando o componente é montado ou availableETFs muda
  React.useEffect(() => {
    setFilteredETFs(availableETFs);
  }, [availableETFs]);

  const handleSelect = (currentSymbol: string) => {
    setSelectedValues(prevSelected => {
      const newSelected = prevSelected.includes(currentSymbol)
        ? prevSelected.filter(s => s !== currentSymbol)
        : [...prevSelected, currentSymbol];
      
      if (newSelected.length > maxSelection) {
        // Optionally, provide feedback to the user that max selection is reached
        // For now, just take the last `maxSelection` items or prevent adding more
        return newSelected.slice(newSelected.length - maxSelection); 
      }
      return newSelected;
    });
  };

  // Efeito para notificar o componente pai sobre mudanças na seleção
  React.useEffect(() => {
    const newlySelectedETFs = availableETFs.filter(etf => 
      etf.symbol && selectedValues.includes(etf.symbol));
    onSelectionChange(newlySelectedETFs);
  }, [selectedValues, availableETFs, onSelectionChange]);

  return (
    <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecione até {maxSelection} ETFs para comparar. Selecionados: {selectedValues.length}
        </p>
        
        {/* Substituindo o Popover por uma solução simples de toggle */}
        <div className="relative">
            <Button
              variant="outline"
              onClick={() => setOpen(!open)}
              className="w-full justify-between dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              {selectedValues.length > 0
                  ? selectedValues.join(", ")
                  : "Selecione ETFs..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            
            {open && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600 shadow-lg">
                <div className="p-2 border-b dark:border-gray-600">
                  <div className="flex items-center border rounded-md pl-3 pr-2 py-1">
                    <Search className="h-4 w-4 mr-2 opacity-50" />
                    <input 
                      className="flex-1 bg-transparent outline-none text-sm dark:text-gray-200" 
                      placeholder="Buscar ETFs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto p-2">
                  {filteredETFs.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhum ETF encontrado.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredETFs.map((etf) => {
                        if (!etf.symbol) return null;
                        return (
                          <div
                            key={etf.symbol || `etf-${filteredETFs.indexOf(etf)}`}
                            className={cn(
                              "flex items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer",
                              selectedValues.includes(etf.symbol) 
                                ? "bg-primary/10 dark:bg-primary/20" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-600"
                            )}
                            onClick={() => handleSelect(etf.symbol)}
                          >
                            <div className="flex items-center">
                              <Checkbox
                                checked={selectedValues.includes(etf.symbol)}
                                onCheckedChange={() => handleSelect(etf.symbol)}
                                className="mr-2"
                                aria-label={`Select ${etf.name}`}
                              />
                              <span className="dark:text-gray-200">{etf.name} ({etf.symbol})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
        
        {selectedValues.length > 0 && (
             <Button variant="outline" onClick={() => setSelectedValues([])} className="w-full mt-2 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                Limpar Seleção
            </Button>
        )}
    </div>
  );
}

