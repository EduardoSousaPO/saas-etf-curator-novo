// Glossário de termos financeiros para ETFs
export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'retorno' | 'risco' | 'dividendo' | 'geral' | 'técnico';
  relatedTerms?: string[];
  example?: string;
}

export const glossaryTerms: Record<string, GlossaryTerm> = {
  'sharpe_ratio': {
    term: 'Índice Sharpe',
    definition: 'Medida que indica o retorno ajustado ao risco. Quanto maior, melhor a relação entre retorno e risco. Valores acima de 1 são considerados bons.',
    category: 'risco',
    relatedTerms: ['volatilidade', 'retorno']
  },
  'volatility': {
    term: 'Volatilidade',
    definition: 'Medida de variação dos preços do ETF. Quanto maior a volatilidade, maior o risco e maior a oscilação dos preços.',
    category: 'risco',
    relatedTerms: ['sharpe_ratio', 'max_drawdown']
  },
  'max_drawdown': {
    term: 'Max Drawdown',
    definition: 'A perda máxima registrada desde um pico até um vale em um investimento, antes que um novo pico seja alcançado.',
    example: 'Se um ETF caiu de $100 para $70 durante uma crise, seu max drawdown foi de 30%.',
    category: 'risco',
    relatedTerms: ['volatilidade']
  },
  'dividend_yield': {
    term: 'Dividend Yield',
    definition: 'Rendimento anual de dividendos como percentual do preço atual. Indica quanto o ETF paga em dividendos por ano.',
    category: 'dividendo',
    relatedTerms: ['dividendos']
  },
  'expense_ratio': {
    term: 'Taxa de Administração',
    definition: 'Percentual anual cobrado pelo fundo para cobrir custos operacionais. Quanto menor, melhor para o investidor.',
    example: 'Um ETF com taxa de 0,10% cobra $1 por ano para cada $1.000 investidos.',
    category: 'geral',
    relatedTerms: ['retorno', 'performance']
  },
  'aum': {
    term: 'AUM (Assets Under Management)',
    definition: 'Valor total dos ativos sob gestão de um fundo. Indica o tamanho e liquidez do ETF.',
    example: 'Um ETF com AUM de $10 bilhões tem mais liquidez que um com $100 milhões.',
    category: 'geral',
    relatedTerms: ['liquidez', 'volume']
  },
  'volume': {
    term: 'Volume',
    definition: 'Quantidade de ações negociadas em um período. Volume alto indica maior liquidez e facilidade para comprar/vender.',
    example: 'Um ETF com volume diário de 1 milhão de ações é mais líquido que um com 10 mil.',
    category: 'técnico',
    relatedTerms: ['liquidez', 'spread']
  },
  'tracking_error': {
    term: 'Erro de Rastreamento',
    definition: 'Diferença entre o desempenho do ETF e seu índice de referência. Quanto menor, melhor o ETF replica o índice.',
    category: 'técnico',
    relatedTerms: ['índice', 'benchmark']
  },
  'beta': {
    term: 'Beta',
    definition: 'Medida de sensibilidade do ETF em relação ao mercado. Beta = 1 move igual ao mercado, > 1 é mais volátil, < 1 é menos volátil.',
    category: 'risco',
    relatedTerms: ['volatilidade', 'correlação']
  },
  'correlation': {
    term: 'Correlação',
    definition: 'Grau de movimentação conjunta entre dois ativos. Varia de -1 (movem opostamente) a +1 (movem juntos).',
    category: 'técnico',
    relatedTerms: ['diversificação', 'beta']
  }
};

// Função auxiliar para buscar termos
export function getTermDefinition(termKey: string): GlossaryTerm | undefined {
  return glossaryTerms[termKey.toLowerCase()];
}

// Função para buscar termos relacionados
export function getRelatedTerms(termKey: string): GlossaryTerm[] {
  const term = glossaryTerms[termKey.toLowerCase()];
  if (!term || !term.relatedTerms) return [];
  
  return term.relatedTerms
    .map(relatedKey => glossaryTerms[relatedKey.toLowerCase()])
    .filter(Boolean) as GlossaryTerm[];
}

export function findGlossaryTerm(text: string): GlossaryTerm | undefined {
  // Remove pontuação e converte para minúsculo
  const cleanText = text.toLowerCase().replace(/[.,!?;:]/g, '');
  
  return Object.values(glossaryTerms).find(term => {
    const termLower = term.term.toLowerCase();
    // Busca por termo exato ou como palavra completa
    return cleanText === termLower || 
           cleanText.includes(' ' + termLower + ' ') ||
           cleanText.startsWith(termLower + ' ') ||
           cleanText.endsWith(' ' + termLower);
  });
}

export function findAllTermsInText(text: string): { term: GlossaryTerm; position: number }[] {
  const results: { term: GlossaryTerm; position: number }[] = [];
  const words = text.split(/\s+/);
  
  words.forEach((word, index) => {
    const term = findGlossaryTerm(word);
    if (term) {
      results.push({ term, position: index });
    }
  });
  
  return results;
} 