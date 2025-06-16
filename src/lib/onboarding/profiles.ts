export interface InvestorProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  characteristics: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredCategories: string[];
  recommendedFeatures: string[];
}

export interface OnboardingQuestion {
  id: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  question: string;
  description?: string;
  options?: { value: string; label: string; score?: number }[];
  min?: number;
  max?: number;
  required: boolean;
  category: 'experience' | 'goals' | 'risk' | 'preferences';
}

export interface UserAnswers {
  [questionId: string]: string | string[] | number;
}

export interface ProfileAssessment {
  profile: InvestorProfile;
  confidence: number;
  recommendations: string[];
  nextSteps: string[];
}

export const INVESTOR_PROFILES: InvestorProfile[] = [
  {
    id: 'conservative',
    name: 'Investidor Conservador',
    description: 'Busca preservar capital com risco mínimo e retornos estáveis.',
    icon: '🛡️',
    characteristics: [
      'Prioriza segurança sobre retorno',
      'Prefere investimentos de baixa volatilidade',
      'Foco em preservação de capital',
      'Aceita retornos menores por mais estabilidade'
    ],
    riskTolerance: 'conservative',
    preferredCategories: ['Bond ETFs', 'Money Market', 'Dividend ETFs'],
    recommendedFeatures: [
      'Comparador de ETFs conservadores',
      'Alertas de volatilidade',
      'Análise de risco detalhada',
      'Rastreamento de dividendos'
    ]
  },
  {
    id: 'moderate',
    name: 'Investidor Moderado',
    description: 'Equilibra risco e retorno, diversificando investimentos.',
    icon: '⚖️',
    characteristics: [
      'Busca equilíbrio entre risco e retorno',
      'Diversifica entre diferentes classes',
      'Aceita volatilidade moderada',
      'Foco em crescimento de longo prazo'
    ],
    riskTolerance: 'moderate',
    preferredCategories: ['Broad Market ETFs', 'Sector ETFs', 'International ETFs'],
    recommendedFeatures: [
      'Comparador avançado de ETFs',
      'Simulador de carteira',
      'Análise de correlação',
      'Recomendações personalizadas'
    ]
  },
  {
    id: 'aggressive',
    name: 'Investidor Arrojado',
    description: 'Busca máximo retorno, aceita alta volatilidade e risco.',
    icon: '🚀',
    characteristics: [
      'Busca altos retornos',
      'Aceita alta volatilidade',
      'Foco em crescimento acelerado',
      'Tolerante a perdas de curto prazo'
    ],
    riskTolerance: 'aggressive',
    preferredCategories: ['Growth ETFs', 'Tech ETFs', 'Emerging Markets', 'Crypto ETFs'],
    recommendedFeatures: [
      'Análise de momentum',
      'ETFs de alta performance',
      'Backtesting avançado',
      'Alertas de oportunidades'
    ]
  },
  {
    id: 'beginner',
    name: 'Investidor Iniciante',
    description: 'Começando no mundo dos investimentos, busca aprender.',
    icon: '🌱',
    characteristics: [
      'Novo no mundo dos investimentos',
      'Busca educação financeira',
      'Precisa de orientação',
      'Quer começar com segurança'
    ],
    riskTolerance: 'conservative',
    preferredCategories: ['Broad Market ETFs', 'Index ETFs'],
    recommendedFeatures: [
      'Glossário educativo',
      'Tutoriais interativos',
      'Assistente virtual',
      'Comparações simplificadas'
    ]
  }
];

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'experience',
    type: 'single',
    question: 'Qual é sua experiência com investimentos?',
    description: 'Isso nos ajuda a personalizar as explicações e recomendações.',
    options: [
      { value: 'beginner', label: 'Iniciante - Pouca ou nenhuma experiência', score: 1 },
      { value: 'intermediate', label: 'Intermediário - Invisto há alguns anos', score: 2 },
      { value: 'advanced', label: 'Avançado - Tenho experiência sólida', score: 3 }
    ],
    required: true,
    category: 'experience'
  },
  {
    id: 'investment_goals',
    type: 'multiple',
    question: 'Quais são seus principais objetivos de investimento?',
    description: 'Selecione todas as opções que se aplicam.',
    options: [
      { value: 'retirement', label: 'Aposentadoria', score: 1 },
      { value: 'wealth_building', label: 'Construção de patrimônio', score: 2 },
      { value: 'income', label: 'Geração de renda passiva', score: 1 },
      { value: 'short_term', label: 'Objetivos de curto prazo', score: 0 },
      { value: 'education', label: 'Educação/estudos', score: 1 }
    ],
    required: true,
    category: 'goals'
  },
  {
    id: 'risk_tolerance',
    type: 'scale',
    question: 'Como você reagiria se seus investimentos perdessem 20% do valor em um mês?',
    description: 'Seja honesto sobre sua tolerância ao risco.',
    min: 1,
    max: 5,
    options: [
      { value: '1', label: 'Venderia tudo imediatamente' },
      { value: '2', label: 'Ficaria muito preocupado' },
      { value: '3', label: 'Ficaria nervoso mas manteria' },
      { value: '4', label: 'Manteria com confiança' },
      { value: '5', label: 'Compraria mais aproveitando a queda' }
    ],
    required: true,
    category: 'risk'
  },
  {
    id: 'investment_amount',
    type: 'single',
    question: 'Quanto você pretende investir inicialmente?',
    options: [
      { value: 'small', label: 'Até R$ 1.000', score: 1 },
      { value: 'medium', label: 'R$ 1.000 - R$ 10.000', score: 2 },
      { value: 'large', label: 'R$ 10.000 - R$ 100.000', score: 3 },
      { value: 'very_large', label: 'Mais de R$ 100.000', score: 4 }
    ],
    required: true,
    category: 'preferences'
  },
  {
    id: 'time_horizon',
    type: 'single',
    question: 'Qual é seu horizonte de investimento?',
    description: 'Por quanto tempo pretende manter seus investimentos?',
    options: [
      { value: 'short', label: 'Menos de 2 anos', score: 0 },
      { value: 'medium', label: '2-5 anos', score: 1 },
      { value: 'long', label: '5-10 anos', score: 2 },
      { value: 'very_long', label: 'Mais de 10 anos', score: 3 }
    ],
    required: true,
    category: 'preferences'
  },
  {
    id: 'preferred_sectors',
    type: 'multiple',
    question: 'Quais setores mais te interessam?',
    description: 'Selecione os setores que você gostaria de incluir em seus investimentos.',
    options: [
      { value: 'technology', label: 'Tecnologia', score: 2 },
      { value: 'healthcare', label: 'Saúde', score: 1 },
      { value: 'finance', label: 'Financeiro', score: 1 },
      { value: 'energy', label: 'Energia', score: 2 },
      { value: 'real_estate', label: 'Imóveis (REITs)', score: 1 },
      { value: 'international', label: 'Mercados Internacionais', score: 2 },
      { value: 'broad_market', label: 'Mercado Amplo (S&P 500)', score: 1 }
    ],
    required: false,
    category: 'preferences'
  }
];

// Função para calcular perfil baseado nas respostas
export function calculateInvestorProfile(answers: UserAnswers): ProfileAssessment {
  let totalScore = 0;
  let experienceLevel = 1;
  let riskScore = 1;
  
  // Calcular scores baseado nas respostas
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = ONBOARDING_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;
    
    if (questionId === 'experience') {
      const option = question.options?.find(opt => opt.value === answer);
      experienceLevel = option?.score || 1;
    }
    
    if (questionId === 'risk_tolerance') {
      riskScore = typeof answer === 'number' ? answer : parseInt(answer as string);
    }
    
    if (question.type === 'single') {
      const option = question.options?.find(opt => opt.value === answer);
      totalScore += option?.score || 0;
    }
    
    if (question.type === 'multiple' && Array.isArray(answer)) {
      answer.forEach(value => {
        const option = question.options?.find(opt => opt.value === value);
        totalScore += option?.score || 0;
      });
    }
    
    if (question.type === 'scale') {
      totalScore += typeof answer === 'number' ? answer : parseInt(answer as string);
    }
  });
  
  // Determinar perfil baseado nos scores
  let profileId = 'conservative';
  let confidence = 0.8;
  
  if (experienceLevel === 1 || riskScore <= 2) {
    profileId = experienceLevel === 1 ? 'beginner' : 'conservative';
    confidence = 0.9;
  } else if (riskScore >= 4 && experienceLevel >= 2) {
    profileId = 'aggressive';
    confidence = 0.85;
  } else {
    profileId = 'moderate';
    confidence = 0.8;
  }
  
  const profile = INVESTOR_PROFILES.find(p => p.id === profileId) || INVESTOR_PROFILES[0];
  
  return {
    profile,
    confidence,
    recommendations: generateRecommendations(profile, answers),
    nextSteps: generateNextSteps(profile, answers)
  };
}

function generateRecommendations(profile: InvestorProfile, answers: UserAnswers): string[] {
  const recommendations = [
    `Baseado no seu perfil ${profile.name.toLowerCase()}, recomendamos focar em ${profile.preferredCategories.join(', ')}.`
  ];
  
  if (profile.id === 'beginner') {
    recommendations.push('Comece com ETFs de mercado amplo para diversificação automática.');
    recommendations.push('Use nosso glossário para entender os termos técnicos.');
  }
  
  if (profile.id === 'conservative') {
    recommendations.push('Priorize ETFs com baixa volatilidade e bom histórico de dividendos.');
    recommendations.push('Configure alertas para mudanças significativas de risco.');
  }
  
  if (profile.id === 'moderate') {
    recommendations.push('Diversifique entre diferentes setores e regiões geográficas.');
    recommendations.push('Use nosso simulador de carteira para testar diferentes composições.');
  }
  
  if (profile.id === 'aggressive') {
    recommendations.push('Explore ETFs de setores de crescimento como tecnologia.');
    recommendations.push('Use ferramentas de backtesting para analisar performance histórica.');
  }
  
  return recommendations;
}

function generateNextSteps(profile: InvestorProfile, answers: UserAnswers): string[] {
  return [
    'Explore nosso comparador de ETFs para encontrar opções alinhadas ao seu perfil',
    'Configure seu dashboard personalizado com as métricas mais relevantes',
    'Ative alertas para oportunidades de investimento',
    'Converse com nosso assistente virtual para esclarecer dúvidas'
  ];
} 