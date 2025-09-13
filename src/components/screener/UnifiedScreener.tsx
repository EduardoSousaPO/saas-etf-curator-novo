'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Filter, 
  BarChart3, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
  Building2
} from 'lucide-react';
import ScreenerDesignSystem from './ScreenerDesignSystem';
import { InteractiveFilters } from './InteractiveFilters';
import { OptimizedTable, ETF_COLUMNS, STOCK_COLUMNS } from './OptimizedTable';
import { EnhancedUnifiedDetailsModal } from './EnhancedUnifiedDetailsModal';
import { LeadMagnets } from './LeadMagnets';
import { EducationalTooltip, useContextualGlossary } from './EducationalTooltips';

interface UnifiedScreenerProps {
  type: 'etf' | 'stock';
  initialStep?: 1 | 2 | 3;
}

interface ScreenerState {
  currentStep: 1 | 2 | 3;
  filters: any;
  results: any[];
  loading: boolean;
  error: string | null;
  selectedAsset: string | null;
  showDetailsModal: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const StepIndicator: React.FC<{
  currentStep: number;
  onStepClick: (step: 1 | 2 | 3) => void;
  canNavigateToStep: (step: number) => boolean;
}> = ({ currentStep, onStepClick, canNavigateToStep }) => {
  const steps = [
    { number: 1, title: 'Filtros Rápidos', description: 'Configure seus critérios', icon: Filter },
    { number: 2, title: 'Tabela Resumida', description: 'Analise os resultados', icon: BarChart3 },
    { number: 3, title: 'Análise Completa', description: 'Detalhes aprofundados', icon: Eye }
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const canNavigate = canNavigateToStep(step.number);

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => canNavigate && onStepClick(step.number as 1 | 2 | 3)}
                  disabled={!canNavigate}
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#0090d8] text-white shadow-lg' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : canNavigate
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </button>
                <div className="space-y-1">
                  <h3 className={`text-sm font-medium ${
                    isActive ? 'text-[#0090d8]' : isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-24">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-6">
        <Progress 
          value={(currentStep / 3) * 100} 
          className="h-1 max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
};

const StepContent: React.FC<{
  step: 1 | 2 | 3;
  type: 'etf' | 'stock';
  state: ScreenerState;
  onStateChange: (updates: Partial<ScreenerState>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSearch: () => void;
}> = ({ step, type, state, onStateChange, onNext, onPrevious, onSearch }) => {
  const { isGlossaryOpen, openGlossary, closeGlossary, GlossaryComponent } = useContextualGlossary();

  // Etapa 1: Filtros Rápidos
  if (step === 1) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-[#202636] mb-4">
            Encontre {type === 'etf' ? 'ETFs' : 'Ações'} Perfeitos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Use nossos filtros inteligentes para descobrir os melhores ativos 
            baseados no seu perfil e objetivos de investimento.
          </p>
        </div>

        <InteractiveFilters
          type={type}
          filters={state.filters}
          onFiltersChange={(filters) => onStateChange({ filters })}
          onApply={onSearch}
          onClear={() => onStateChange({ 
            filters: type === 'etf' ? {
              searchTerm: '',
              assetclass: '',
              onlyComplete: false
            } : {
              search_term: '',
              sector: '',
              industry: '',
              market_cap_min: null,
              market_cap_max: null,
              pe_ratio_min: null,
              pe_ratio_max: null,
              dividend_yield_min: null,
              dividend_yield_max: null,
              returns_12m_min: null,
              returns_12m_max: null,
              volatility_min: null,
              volatility_max: null,
              employees_min: null,
              employees_max: null,
              size_category: '',
              only_complete: false
            }
          })}
          activeCount={Object.values(state.filters).filter(v => v !== '' && v !== null && v !== false).length}
        />

        {/* Botões de navegação */}
        <div className="flex justify-center mt-12">
          <Button
            onClick={onNext}
            disabled={state.results.length === 0}
            className={`${ScreenerDesignSystem.components.button.primary} ${ScreenerDesignSystem.components.button.sizes.lg} flex items-center gap-2`}
          >
            Ver Resultados
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Dica educativa */}
        <div className="text-center">
          <EducationalTooltip 
            content="Clique aqui para aprender sobre termos financeiros"
            title="Glossário Disponível"
          >
            <Button
              variant="ghost"
              onClick={openGlossary}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0090d8]"
            >
              <BookOpen className="w-4 h-4" />
              Não entende algum termo? Consulte nosso glossário
            </Button>
          </EducationalTooltip>
        </div>

        <GlossaryComponent />
      </div>
    );
  }

  // Etapa 2: Tabela Resumida
  if (step === 2) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-[#202636] mb-4">
            Resultados da Busca
          </h2>
          <p className="text-gray-600">
            {state.totalCount.toLocaleString()} {type === 'etf' ? 'ETFs' : 'ações'} encontrados. 
            Clique em qualquer linha para ver detalhes completos.
          </p>
        </div>

        {/* Lead Magnet entre resultados */}
        {state.currentPage === 2 && (
          <LeadMagnets 
            type="premium_data" 
            position="between_results" 
            currentPage={state.currentPage}
            totalResults={state.totalCount}
          />
        )}

        <OptimizedTable
          type={type}
          data={state.results}
          columns={type === 'etf' ? ETF_COLUMNS : STOCK_COLUMNS}
          loading={state.loading}
          sortBy={state.sortBy}
          sortOrder={state.sortOrder}
          onSort={(key, order) => onStateChange({ sortBy: key, sortOrder: order })}
          onRowClick={(item) => {
            onStateChange({ 
              selectedAsset: item.symbol,
              showDetailsModal: true,
              currentStep: 3
            });
            onNext();
          }}
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          totalCount={state.totalCount}
          onPageChange={(page) => onStateChange({ currentPage: page })}
        />

        {/* Navegação */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onPrevious}
            className={`${ScreenerDesignSystem.components.button.sizes.lg} flex items-center gap-2`}
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar aos Filtros
          </Button>
          
          <div className="flex gap-4">
            <EducationalTooltip 
              content="Veja análises detalhadas de qualquer ativo"
              title="Análise Completa"
            >
              <Button
                onClick={onNext}
                disabled={!state.selectedAsset}
                className={`${ScreenerDesignSystem.components.button.primary} ${ScreenerDesignSystem.components.button.sizes.lg} flex items-center gap-2`}
              >
                <Eye className="w-4 h-4" />
                Análise Detalhada
                <ChevronRight className="w-4 h-4" />
              </Button>
            </EducationalTooltip>
          </div>
        </div>

        {/* Lead Magnet para consultoria */}
        {state.currentPage > 2 && (
          <LeadMagnets 
            type="consultation" 
            position="between_results" 
            currentPage={state.currentPage}
            totalResults={state.totalCount}
          />
        )}
      </div>
    );
  }

  // Etapa 3: Análise Completa
  if (step === 3) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-[#202636] mb-4">
            Análise Completa
          </h2>
          <p className="text-gray-600">
            Explore dados detalhados, gráficos de performance e insights de IA
          </p>
        </div>

        {/* Análise detalhada será mostrada no modal */}
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            {type === 'etf' ? (
              <BarChart3 className="w-10 h-10 text-[#0090d8]" />
            ) : (
              <Building2 className="w-10 h-10 text-[#0090d8]" />
            )}
          </div>
          
          <h3 className="text-2xl font-light text-[#202636] mb-4">
            {state.selectedAsset ? `Analisando ${state.selectedAsset}` : 'Selecione um Ativo'}
          </h3>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {state.selectedAsset 
              ? 'Visualize métricas detalhadas, gráficos de performance histórica e insights gerados por IA.'
              : 'Volte para a tabela de resultados e clique em qualquer ativo para ver a análise completa.'
            }
          </p>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              className={`${ScreenerDesignSystem.components.button.sizes.lg} flex items-center gap-2`}
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar aos Resultados
            </Button>
            
            {state.selectedAsset && (
              <Button
                onClick={() => onStateChange({ showDetailsModal: true })}
                className={`${ScreenerDesignSystem.components.button.primary} ${ScreenerDesignSystem.components.button.sizes.lg} flex items-center gap-2`}
              >
                <Eye className="w-4 h-4" />
                Ver Análise Detalhada
              </Button>
            )}
          </div>
        </div>

        {/* Lead Magnet para Portfolio Master */}
        <LeadMagnets 
          type="portfolio_analysis" 
          position="between_results" 
          currentPage={1}
          totalResults={state.totalCount}
        />

        {/* Navegação final */}
        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/portfolio-master'}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-[#202636] mb-2">Criar Portfolio</h4>
                <p className="text-sm text-gray-600">Monte uma carteira otimizada com estes ativos</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/consultoria'}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-[#202636] mb-2">Consultoria</h4>
                <p className="text-sm text-gray-600">Receba orientação especializada</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/comparador'}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-[#202636] mb-2">Comparar</h4>
                <p className="text-sm text-gray-600">Compare ativos lado a lado</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const UnifiedScreener: React.FC<UnifiedScreenerProps> = ({ 
  type, 
  initialStep = 1 
}) => {
  const [state, setState] = useState<ScreenerState>({
    currentStep: initialStep,
    filters: type === 'etf' ? {
      searchTerm: '',
      assetclass: '',
      onlyComplete: false
    } : {
      search_term: '',
      sector: '',
      industry: '',
      market_cap_min: null,
      market_cap_max: null,
      pe_ratio_min: null,
      pe_ratio_max: null,
      dividend_yield_min: null,
      dividend_yield_max: null,
      returns_12m_min: null,
      returns_12m_max: null,
      volatility_min: null,
      volatility_max: null,
      employees_min: null,
      employees_max: null,
      size_category: '',
      only_complete: false
    },
    results: [],
    loading: false,
    error: null,
    selectedAsset: null,
    showDetailsModal: false,
    sortBy: type === 'etf' ? 'returns_12m' : 'returns_12m',
    sortOrder: 'desc',
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const updateState = (updates: Partial<ScreenerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const fetchResults = async () => {
    try {
      updateState({ loading: true, error: null });
      
      const endpoint = type === 'etf' ? '/api/etfs/screener' : '/api/stocks/screener';
      // Mapear parâmetros para formato correto da API
      const apiParams: Record<string, string> = {
        page: state.currentPage.toString(),
        limit: '20'
      };

      // APIs usam formatos diferentes para sort
      if (type === 'etf') {
        apiParams.sort_by = state.sortBy;
        apiParams.sort_order = state.sortOrder.toUpperCase(); // ETFs API espera maiúsculo
      } else {
        apiParams.sortBy = state.sortBy;
        apiParams.sortOrder = state.sortOrder; // Stocks API aceita minúsculo
      }

      // Adicionar filtros com mapeamento correto para cada API
      Object.entries(state.filters)
        .filter(([_, value]) => value !== '' && value !== null && value !== false)
        .forEach(([key, value]) => {
          // Mapear nomes de parâmetros para compatibilidade entre APIs
          let apiKey = key;
          
          if (type === 'etf') {
            // API de ETFs usa snake_case
            if (key === 'searchTerm') apiKey = 'search_term';
            if (key === 'minReturns12m') apiKey = 'returns_12m_min';
            if (key === 'maxReturns12m') apiKey = 'returns_12m_max';
            if (key === 'minExpenseRatio') apiKey = 'expense_ratio_min';
            if (key === 'maxExpenseRatio') apiKey = 'expense_ratio_max';
            if (key === 'minTotalAssets') apiKey = 'total_assets_min';
            if (key === 'maxTotalAssets') apiKey = 'total_assets_max';
          } else {
            // API de Stocks usa camelCase
            if (key === 'search_term') apiKey = 'searchTerm';
            if (key === 'returns_12m_min') apiKey = 'minReturns12m';
            if (key === 'returns_12m_max') apiKey = 'maxReturns12m';
          }
          
          apiParams[apiKey] = String(value);
        });

      const params = new URLSearchParams(apiParams);

      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // API de Stocks retorna { success: true, stocks: [...] }
      // API de ETFs retorna { etfs: [...] } diretamente
      if (data.success === false) {
        throw new Error(data.error || 'Erro ao buscar resultados');
      }
      
      updateState({
        results: data.stocks || data.etfs || [],
        totalCount: data.totalCount || 0,
        totalPages: Math.ceil((data.totalCount || 0) / 20)
      });
      
    } catch (error) {
      console.error('Erro na busca:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        results: [],
        totalCount: 0,
        totalPages: 1
      });
    } finally {
      updateState({ loading: false });
    }
  };

  const handleSearch = async () => {
    await fetchResults();
    if (state.currentStep === 1) {
      updateState({ currentStep: 2 });
    }
  };

  const canNavigateToStep = (step: number): boolean => {
    switch (step) {
      case 1: return true;
      case 2: return state.results.length > 0;
      case 3: return state.results.length > 0;
      default: return false;
    }
  };

  const handleStepClick = (step: 1 | 2 | 3) => {
    if (canNavigateToStep(step)) {
      updateState({ currentStep: step });
    }
  };

  const handleNext = () => {
    if (state.currentStep < 3) {
      updateState({ currentStep: (state.currentStep + 1) as 1 | 2 | 3 });
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      updateState({ currentStep: (state.currentStep - 1) as 1 | 2 | 3 });
    }
  };

  // Carregar dados iniciais quando o componente monta
  useEffect(() => {
    fetchResults();
  }, []);

  // Buscar resultados quando filtros mudarem (apenas se já houve uma busca inicial)
  useEffect(() => {
    if (state.results.length > 0 && state.currentStep >= 2) {
      fetchResults();
    }
  }, [state.sortBy, state.sortOrder, state.currentPage]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={ScreenerDesignSystem.typography.hero}>
            {type === 'etf' ? 'ETF' : 'Stock'}
            <span className="block text-[#0090d8]">Screener</span>
          </h1>
          <p className={`${ScreenerDesignSystem.typography.subtitle} max-w-3xl mx-auto mt-6`}>
            Descubra os {type === 'etf' ? 'ETFs' : 'ações'} perfeitos usando nossa plataforma 
            inteligente de análise e filtros avançados.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator 
          currentStep={state.currentStep}
          onStepClick={handleStepClick}
          canNavigateToStep={canNavigateToStep}
        />

        {/* Step Content */}
        <StepContent
          step={state.currentStep}
          type={type}
          state={state}
          onStateChange={updateState}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSearch={handleSearch}
        />

        {/* Modal de Detalhes Aprimorado */}
        {state.selectedAsset && (
          <EnhancedUnifiedDetailsModal
            type={type}
            symbol={state.selectedAsset}
            isOpen={state.showDetailsModal}
            onClose={() => updateState({ 
              showDetailsModal: false,
              selectedAsset: null 
            })}
            onAddToPortfolio={(symbol) => {
              // Integrar com Portfolio Master
              window.location.href = `/portfolio-master?add=${symbol}`;
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedScreener;
