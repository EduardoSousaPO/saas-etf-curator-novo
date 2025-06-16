import { InvestorProfile } from '@/lib/onboarding/profiles';

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  component: string;
  priority: number;
  size: 'small' | 'medium' | 'large';
  category: 'overview' | 'analysis' | 'recommendations' | 'education';
  requiredProfile?: string[];
}

export interface PersonalizedDashboard {
  widgets: DashboardWidget[];
  layout: {
    primary: DashboardWidget[];
    secondary: DashboardWidget[];
    sidebar: DashboardWidget[];
  };
  recommendations: string[];
}

export const AVAILABLE_WIDGETS: DashboardWidget[] = [
  {
    id: 'portfolio_overview',
    title: 'Visão Geral da Carteira',
    description: 'Resumo do seu portfólio com performance e alocação',
    component: 'PortfolioOverview',
    priority: 10,
    size: 'large',
    category: 'overview'
  },
  {
    id: 'market_summary',
    title: 'Resumo do Mercado',
    description: 'Principais indicadores e movimentos do mercado',
    component: 'MarketSummary',
    priority: 8,
    size: 'medium',
    category: 'overview'
  },
  {
    id: 'top_etfs',
    title: 'ETFs em Destaque',
    description: 'ETFs com melhor performance recente',
    component: 'TopETFs',
    priority: 7,
    size: 'medium',
    category: 'analysis'
  },
  {
    id: 'risk_analysis',
    title: 'Análise de Risco',
    description: 'Métricas de risco da sua carteira',
    component: 'RiskAnalysis',
    priority: 9,
    size: 'medium',
    category: 'analysis',
    requiredProfile: ['conservative', 'moderate']
  },
  {
    id: 'momentum_tracker',
    title: 'Rastreador de Momentum',
    description: 'ETFs com momentum positivo',
    component: 'MomentumTracker',
    priority: 6,
    size: 'medium',
    category: 'analysis',
    requiredProfile: ['aggressive']
  },
  {
    id: 'dividend_calendar',
    title: 'Calendário de Dividendos',
    description: 'Próximos pagamentos de dividendos',
    component: 'DividendCalendar',
    priority: 5,
    size: 'small',
    category: 'analysis',
    requiredProfile: ['conservative']
  },
  {
    id: 'ai_recommendations',
    title: 'Recomendações IA',
    description: 'Sugestões personalizadas baseadas em IA',
    component: 'AIRecommendations',
    priority: 8,
    size: 'large',
    category: 'recommendations'
  },
  {
    id: 'educational_content',
    title: 'Conteúdo Educativo',
    description: 'Artigos e tutoriais sobre investimentos',
    component: 'EducationalContent',
    priority: 4,
    size: 'small',
    category: 'education',
    requiredProfile: ['beginner']
  },
  {
    id: 'sector_performance',
    title: 'Performance por Setor',
    description: 'Análise de performance dos diferentes setores',
    component: 'SectorPerformance',
    priority: 6,
    size: 'medium',
    category: 'analysis'
  },
  {
    id: 'volatility_tracker',
    title: 'Monitor de Volatilidade',
    description: 'Acompanhe a volatilidade dos seus ETFs',
    component: 'VolatilityTracker',
    priority: 7,
    size: 'small',
    category: 'analysis',
    requiredProfile: ['conservative', 'moderate']
  },
  {
    id: 'growth_opportunities',
    title: 'Oportunidades de Crescimento',
    description: 'ETFs com potencial de crescimento elevado',
    component: 'GrowthOpportunities',
    priority: 7,
    size: 'medium',
    category: 'recommendations',
    requiredProfile: ['aggressive', 'moderate']
  },
  {
    id: 'quick_compare',
    title: 'Comparação Rápida',
    description: 'Compare até 3 ETFs rapidamente',
    component: 'QuickCompare',
    priority: 5,
    size: 'small',
    category: 'analysis'
  }
];

export function personalizeScheduler(profile: InvestorProfile): PersonalizedDashboard {
  // Filtrar widgets baseado no perfil
  const filteredWidgets = AVAILABLE_WIDGETS.filter(widget => {
    if (!widget.requiredProfile) return true;
    return widget.requiredProfile.includes(profile.id);
  });

  // Ordenar por prioridade e perfil
  const prioritizedWidgets = filteredWidgets.sort((a, b) => {
    // Dar prioridade extra para widgets que correspondem ao perfil
    let aScore = a.priority;
    let bScore = b.priority;

    if (a.requiredProfile?.includes(profile.id)) aScore += 3;
    if (b.requiredProfile?.includes(profile.id)) bScore += 3;

    return bScore - aScore;
  });

  // Organizar layout baseado no perfil
  const layout = organizeLayout(prioritizedWidgets, profile);

  // Gerar recomendações personalizadas
  const recommendations = generateDashboardRecommendations(profile);

  return {
    widgets: prioritizedWidgets,
    layout,
    recommendations
  };
}

function organizeLayout(widgets: DashboardWidget[], profile: InvestorProfile) {
  const primary: DashboardWidget[] = [];
  const secondary: DashboardWidget[] = [];
  const sidebar: DashboardWidget[] = [];

  // Sempre incluir visão geral da carteira como primário
  const portfolioOverview = widgets.find(w => w.id === 'portfolio_overview');
  if (portfolioOverview) primary.push(portfolioOverview);

  // Configuração específica por perfil
  switch (profile.id) {
    case 'beginner':
      // Iniciantes precisam de educação e simplicidade
      primary.push(...widgets.filter(w => 
        ['educational_content', 'market_summary'].includes(w.id)
      ).slice(0, 2));
      secondary.push(...widgets.filter(w => 
        ['top_etfs', 'quick_compare'].includes(w.id)
      ));
      sidebar.push(...widgets.filter(w => 
        w.category === 'education' && !primary.includes(w)
      ));
      break;

    case 'conservative':
      // Conservadores focam em risco e dividendos
      primary.push(...widgets.filter(w => 
        ['risk_analysis', 'dividend_calendar'].includes(w.id)
      ));
      secondary.push(...widgets.filter(w => 
        ['market_summary', 'volatility_tracker'].includes(w.id)
      ));
      sidebar.push(...widgets.filter(w => 
        w.category === 'analysis' && w.size === 'small'
      ));
      break;

    case 'moderate':
      // Moderados querem equilíbrio
      primary.push(...widgets.filter(w => 
        ['ai_recommendations', 'sector_performance'].includes(w.id)
      ));
      secondary.push(...widgets.filter(w => 
        ['top_etfs', 'growth_opportunities'].includes(w.id)
      ));
      sidebar.push(...widgets.filter(w => 
        ['quick_compare', 'volatility_tracker'].includes(w.id)
      ));
      break;

    case 'aggressive':
      // Arrojados querem crescimento e momentum
      primary.push(...widgets.filter(w => 
        ['momentum_tracker', 'growth_opportunities'].includes(w.id)
      ));
      secondary.push(...widgets.filter(w => 
        ['sector_performance', 'ai_recommendations'].includes(w.id)
      ));
      sidebar.push(...widgets.filter(w => 
        w.category === 'recommendations' && w.size === 'small'
      ));
      break;
  }

  // Preencher espaços restantes com widgets não utilizados
  const usedWidgets = [...primary, ...secondary, ...sidebar];
  const remainingWidgets = widgets.filter(w => !usedWidgets.includes(w));

  // Distribuir widgets restantes
  remainingWidgets.forEach(widget => {
    if (widget.size === 'large' && primary.length < 3) {
      primary.push(widget);
    } else if (widget.size === 'medium' && secondary.length < 4) {
      secondary.push(widget);
    } else if (sidebar.length < 6) {
      sidebar.push(widget);
    }
  });

  return { primary, secondary, sidebar };
}

function generateDashboardRecommendations(profile: InvestorProfile): string[] {
  const baseRecommendations = [
    'Configure alertas para os ETFs que mais te interessam',
    'Explore nosso comparador para analisar diferentes opções',
    'Use o assistente IA para esclarecer dúvidas sobre investimentos'
  ];

  const profileSpecificRecommendations: Record<string, string[]> = {
    beginner: [
      'Comece explorando ETFs de mercado amplo para diversificação',
      'Leia nosso conteúdo educativo para entender melhor os investimentos',
      'Use a funcionalidade de simulação antes de investir de verdade'
    ],
    conservative: [
      'Configure alertas de volatilidade para monitorar riscos',
      'Acompanhe o calendário de dividendos dos seus ETFs',
      'Revise regularmente a análise de risco da sua carteira'
    ],
    moderate: [
      'Diversifique entre diferentes setores usando nosso análise',
      'Explore as recomendações de IA para otimizar sua carteira',
      'Compare periodicamente ETFs similares para melhores opções'
    ],
    aggressive: [
      'Monitore oportunidades de crescimento identificadas pela IA',
      'Acompanhe o momentum dos setores de alto crescimento',
      'Use análises avançadas para identificar tendências emergentes'
    ]
  };

  return [
    ...baseRecommendations,
    ...(profileSpecificRecommendations[profile.id] || [])
  ];
}

// Função para salvar configurações personalizadas do usuário
export function saveDashboardPreferences(userId: string, preferences: any) {
  // Por enquanto salvar no localStorage
  // Em produção, salvar no banco de dados
  localStorage.setItem(`dashboard_preferences_${userId}`, JSON.stringify(preferences));
}

// Função para carregar configurações do usuário
export function loadDashboardPreferences(userId: string) {
  const saved = localStorage.getItem(`dashboard_preferences_${userId}`);
  return saved ? JSON.parse(saved) : null;
} 