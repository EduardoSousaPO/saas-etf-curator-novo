'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Info, 
  BookOpen, 
  Search, 
  X, 
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  Award,
  Building2,
  Percent,
  Calculator,
  Target,
  Activity,
  Zap
} from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
  category?: 'basic' | 'intermediate' | 'advanced';
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: 'performance' | 'risk' | 'fundamentals' | 'etf' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ComponentType<{ className?: string }>;
  example?: string;
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'sharpe-ratio',
    term: 'Sharpe Ratio',
    definition: 'Medida que avalia se o retorno de um investimento compensa o risco assumido. Quanto maior, melhor a relação retorno/risco.',
    category: 'risk',
    difficulty: 'intermediate',
    icon: Award,
    example: 'Sharpe de 1.5 significa que para cada unidade de risco, você ganha 1.5 unidades de retorno.',
    relatedTerms: ['volatility', 'risk-adjusted-return']
  },
  {
    id: 'expense-ratio',
    term: 'Expense Ratio (Taxa de Administração)',
    definition: 'Percentual anual cobrado pelo ETF para cobrir custos operacionais. Impacta diretamente no seu retorno líquido.',
    category: 'etf',
    difficulty: 'beginner',
    icon: Percent,
    example: 'Taxa de 0.5% significa que R$ 5 de cada R$ 1.000 investidos são descontados anualmente.',
    relatedTerms: ['net-return', 'total-cost']
  },
  {
    id: 'pe-ratio',
    term: 'P/E Ratio (Preço/Lucro)',
    definition: 'Indica quantos anos levaria para recuperar o investimento baseado no lucro atual da empresa.',
    category: 'fundamentals',
    difficulty: 'beginner',
    icon: Calculator,
    example: 'P/E de 20x significa que você paga 20 vezes o lucro anual da empresa.',
    relatedTerms: ['valuation', 'earnings']
  },
  {
    id: 'volatility',
    term: 'Volatilidade',
    definition: 'Medida de quanto o preço de um ativo varia ao longo do tempo. Maior volatilidade = maior risco e potencial retorno.',
    category: 'risk',
    difficulty: 'beginner',
    icon: Activity,
    example: 'Volatilidade de 20% significa que o ativo pode variar ±20% em relação à média.',
    relatedTerms: ['standard-deviation', 'risk']
  },
  {
    id: 'dividend-yield',
    term: 'Dividend Yield',
    definition: 'Percentual anual que a empresa paga em dividendos em relação ao preço da ação. Fonte de renda passiva.',
    category: 'fundamentals',
    difficulty: 'beginner',
    icon: DollarSign,
    example: 'Yield de 4% significa que você recebe R$ 40 anuais para cada R$ 1.000 investidos.',
    relatedTerms: ['dividends', 'income-investing']
  },
  {
    id: 'market-cap',
    term: 'Market Cap (Valor de Mercado)',
    definition: 'Valor total de todas as ações de uma empresa no mercado. Indica o tamanho da empresa.',
    category: 'fundamentals',
    difficulty: 'beginner',
    icon: Building2,
    example: 'Market cap de $100B = empresa muito grande (mega cap).',
    relatedTerms: ['company-size', 'liquidity']
  },
  {
    id: 'aum',
    term: 'AUM (Assets Under Management)',
    definition: 'Total de patrimônio que um ETF gerencia. Maior AUM geralmente significa maior liquidez.',
    category: 'etf',
    difficulty: 'beginner',
    icon: BarChart3,
    example: 'AUM de $5B indica um ETF grande e líquido.',
    relatedTerms: ['liquidity', 'trading-volume']
  },
  {
    id: 'beta',
    term: 'Beta',
    definition: 'Mede a sensibilidade de um ativo em relação ao mercado. Beta > 1 = mais volátil que o mercado.',
    category: 'risk',
    difficulty: 'intermediate',
    icon: TrendingUp,
    example: 'Beta de 1.2 significa que se o mercado sobe 10%, o ativo tende a subir 12%.',
    relatedTerms: ['correlation', 'systematic-risk']
  },
  {
    id: 'max-drawdown',
    term: 'Max Drawdown',
    definition: 'Maior queda percentual do pico até o vale. Indica o pior cenário que o investidor enfrentou.',
    category: 'risk',
    difficulty: 'intermediate',
    icon: Shield,
    example: 'Max drawdown de -30% significa que em algum momento você perdeu 30% do valor.',
    relatedTerms: ['risk-management', 'volatility']
  },
  {
    id: 'tracking-error',
    term: 'Tracking Error',
    definition: 'Diferença entre o retorno do ETF e seu índice de referência. Menor é melhor.',
    category: 'etf',
    difficulty: 'advanced',
    icon: Target,
    example: 'Tracking error de 0.1% indica que o ETF segue muito bem seu índice.',
    relatedTerms: ['index-tracking', 'passive-investing']
  }
];

const categoryIcons = {
  performance: TrendingUp,
  risk: Shield,
  fundamentals: Calculator,
  etf: BarChart3,
  general: Lightbulb
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export const EducationalTooltip: React.FC<TooltipProps> = ({ 
  content, 
  title, 
  category = 'basic',
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${positionClasses[position]} z-50`}>
          <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-lg">
            {title && (
              <div className="font-medium mb-1">{title}</div>
            )}
            <div>{content}</div>
            <div className={`absolute ${arrowClasses[position]}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GlossaryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || term.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#0090d8]" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-[#202636]">Glossário Financeiro</h2>
              <p className="text-gray-600">Aprenda os termos essenciais para investir</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-full">
          {/* Sidebar com filtros e lista */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* Filtros */}
            <div className="p-6 border-b border-gray-100">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar termos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todas Categorias</option>
                    <option value="performance">Performance</option>
                    <option value="risk">Risco</option>
                    <option value="fundamentals">Fundamentos</option>
                    <option value="etf">ETFs</option>
                    <option value="general">Geral</option>
                  </select>
                  
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todos Níveis</option>
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de termos */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {filteredTerms.map((term) => {
                  const Icon = term.icon;
                  const CategoryIcon = categoryIcons[term.category];
                  
                  return (
                    <button
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                        selectedTerm?.id === term.id 
                          ? 'border-[#0090d8] bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#0090d8]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#202636] mb-1">{term.term}</div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {term.definition}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`text-xs ${difficultyColors[term.difficulty]}`}>
                                {term.difficulty === 'beginner' ? 'Iniciante' :
                                 term.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <CategoryIcon className="w-3 h-3" />
                                {term.category}
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
                
                {filteredTerms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum termo encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo detalhado */}
          <div className="w-1/2 flex flex-col">
            {selectedTerm ? (
              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Header do termo */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <selectedTerm.icon className="w-6 h-6 text-[#0090d8]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-light text-[#202636] mb-2">
                        {selectedTerm.term}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={`${difficultyColors[selectedTerm.difficulty]}`}>
                          {selectedTerm.difficulty === 'beginner' ? 'Iniciante' :
                           selectedTerm.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </Badge>
                        <Badge variant="outline">
                          {selectedTerm.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Definição */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-[#202636] mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Definição
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedTerm.definition}
                    </p>
                  </div>

                  {/* Exemplo prático */}
                  {selectedTerm.example && (
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Exemplo Prático
                      </h4>
                      <p className="text-blue-700 leading-relaxed">
                        {selectedTerm.example}
                      </p>
                    </div>
                  )}

                  {/* Termos relacionados */}
                  {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#202636] mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Termos Relacionados
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerm.relatedTerms.map((relatedId) => {
                          const relatedTerm = glossaryTerms.find(t => t.id === relatedId);
                          if (!relatedTerm) return null;
                          
                          return (
                            <button
                              key={relatedId}
                              onClick={() => setSelectedTerm(relatedTerm)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:border-[#0090d8] hover:text-[#0090d8] transition-colors"
                            >
                              <relatedTerm.icon className="w-3 h-3" />
                              {relatedTerm.term}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Selecione um termo</p>
                  <p className="text-sm">Clique em qualquer termo da lista para ver detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para mostrar glossário contextual
export const useContextualGlossary = () => {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const openGlossary = () => setIsGlossaryOpen(true);
  const closeGlossary = () => setIsGlossaryOpen(false);

  return {
    isGlossaryOpen,
    openGlossary,
    closeGlossary,
    GlossaryComponent: () => (
      <GlossaryModal isOpen={isGlossaryOpen} onClose={closeGlossary} />
    )
  };
};

export default EducationalTooltip;

