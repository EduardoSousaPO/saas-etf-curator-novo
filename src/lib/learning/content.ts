export interface LearningContent {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'analysis' | 'strategy' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutos
  requiredProfile?: string[];
  prerequisites?: string[];
  content: CourseModule[];
  quiz: Quiz;
  rewards: {
    points: number;
    badge?: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  type: 'text' | 'video' | 'interactive' | 'example';
  content: string;
  interactiveData?: InteractiveData;
  example?: ExampleData;
}

export interface InteractiveData {
  type: 'calculation' | 'comparison' | 'slider';
  data: any;
}

export interface ExampleData {
  title: string;
  description: string;
  data: {
    etfs?: any[];
    calculation?: any;
    scenario?: any;
  };
}

export interface Quiz {
  id: string;
  questions: Question[];
  passingScore: number;
  retakeAllowed: boolean;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'drag_drop';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface UserProgress {
  userId: string;
  completedCourses: string[];
  courseProgress: Record<string, {
    moduleProgress: string[];
    quizAttempts: number;
    lastQuizScore?: number;
    completed: boolean;
    completedAt?: Date;
  }>;
  totalPoints: number;
  badges: string[];
  currentStreak: number;
  lastActivity: Date;
}

export const LEARNING_COURSES: LearningContent[] = [
  {
    id: 'etf_basics',
    title: 'Fundamentos dos ETFs',
    description: 'Aprenda o que são ETFs, como funcionam e por que são importantes para sua carteira.',
    category: 'basics',
    difficulty: 'beginner',
    estimatedTime: 15,
    requiredProfile: ['beginner'],
    content: [
      {
        id: 'what_is_etf',
        title: 'O que é um ETF?',
        type: 'text',
        content: `Um ETF (Exchange Traded Fund) é um fundo de investimento negociado na bolsa como se fosse uma ação. 

Os ETFs permitem que você invista em uma cesta diversificada de ativos com uma única compra. Por exemplo, ao comprar cotas do IVVB11, você está investindo indiretamente nas 500 maiores empresas americanas.

**Principais características:**
- Negociação em tempo real na bolsa
- Diversificação automática
- Baixas taxas de administração
- Transparência dos holdings
- Liquidez alta`
      },
      {
        id: 'etf_benefits',
        title: 'Vantagens dos ETFs',
        type: 'text',
        content: `**1. Diversificação Instantânea**
Com um único ETF, você pode ter exposição a centenas ou milhares de ativos diferentes.

**2. Baixo Custo**
ETFs geralmente têm expense ratios muito menores que fundos ativos (0.1% vs 2%+).

**3. Flexibilidade**
Pode ser comprado e vendido a qualquer momento durante o horário de funcionamento da bolsa.

**4. Transparência**
Você sabe exatamente em que o fundo investe, com holdings divulgados diariamente.

**5. Eficiência Tributária**
ETFs são mais eficientes em termos de impostos que fundos mútuos tradicionais.`
      },
      {
        id: 'types_of_etfs',
        title: 'Tipos de ETFs',
        type: 'interactive',
        content: 'Explore os diferentes tipos de ETFs disponíveis no mercado.',
        interactiveData: {
          type: 'comparison',
          data: {
            types: [
              {
                name: 'ETFs de Índice',
                description: 'Replicam índices como S&P 500, Ibovespa',
                examples: ['IVVB11', 'BOVA11'],
                riskLevel: 'Moderado'
              },
              {
                name: 'ETFs Setoriais',
                description: 'Focam em setores específicos',
                examples: ['Tecnologia', 'Saúde', 'Energia'],
                riskLevel: 'Alto'
              },
              {
                name: 'ETFs de Renda Fixa',
                description: 'Investem em títulos e bonds',
                examples: ['Tesouro', 'Corporativos'],
                riskLevel: 'Baixo'
              }
            ]
          }
        }
      },
      {
        id: 'etf_example',
        title: 'Exemplo Prático',
        type: 'example',
        content: 'Vamos analisar um ETF real para entender na prática.',
        example: {
          title: 'Análise do IVVB11',
          description: 'ETF que replica o índice S&P 500',
          data: {
            etfs: [{
              symbol: 'IVVB11',
              name: 'iShares Core S&P 500',
              expense_ratio: 0.09,
              holdings: 500,
              top_holdings: ['Apple', 'Microsoft', 'Amazon']
            }]
          }
        }
      }
    ],
    quiz: {
      id: 'etf_basics_quiz',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'O que significa a sigla ETF?',
          options: [
            'Electronic Trading Fund',
            'Exchange Traded Fund', 
            'Equity Transfer Fund',
            'European Trading Fund'
          ],
          correctAnswer: 'Exchange Traded Fund',
          explanation: 'ETF significa Exchange Traded Fund, ou seja, um fundo negociado na bolsa.',
          points: 10
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'ETFs podem ser comprados e vendidos apenas no final do dia.',
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: 'Falso',
          explanation: 'ETFs são negociados em tempo real durante o horário de funcionamento da bolsa, ao contrário de fundos mútuos.',
          points: 10
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'Qual é a principal vantagem dos ETFs em relação aos fundos ativos?',
          options: [
            'Sempre têm melhor performance',
            'Menores taxas de administração',
            'São mais seguros',
            'Não têm volatilidade'
          ],
          correctAnswer: 'Menores taxas de administração',
          explanation: 'ETFs passivos geralmente têm expense ratios muito menores que fundos ativos, o que aumenta o retorno líquido do investidor.',
          points: 15
        }
      ],
      passingScore: 70,
      retakeAllowed: true
    },
    rewards: {
      points: 100,
      badge: 'ETF Básico'
    }
  },
  {
    id: 'understanding_metrics',
    title: 'Entendendo Métricas de ETFs',
    description: 'Aprenda a interpretar as principais métricas para avaliar ETFs.',
    category: 'analysis',
    difficulty: 'intermediate',
    estimatedTime: 25,
    prerequisites: ['etf_basics'],
    content: [
      {
        id: 'expense_ratio',
        title: 'Expense Ratio (Taxa de Administração)',
        type: 'text',
        content: `O Expense Ratio é uma das métricas mais importantes ao escolher um ETF.

**O que é:**
Percentual anual cobrado pelo fundo para cobrir custos operacionais.

**Como calcular o impacto:**
- ETF A: Expense ratio 0.1% = R$ 10 por ano para cada R$ 10.000
- ETF B: Expense ratio 0.5% = R$ 50 por ano para cada R$ 10.000

**Regra geral:**
- Excelente: < 0.2%
- Bom: 0.2% - 0.5%
- Aceitável: 0.5% - 1.0%
- Alto: > 1.0%

**Dica importante:** Uma diferença de 0.5% ao ano pode significar milhares de reais a menos após 20 anos devido ao efeito dos juros compostos.`
      },
      {
        id: 'tracking_error',
        title: 'Tracking Error',
        type: 'text',
        content: `Tracking Error mede o quão bem um ETF replica seu índice de referência.

**O que significa:**
Diferença entre o retorno do ETF e o retorno do índice que ele tenta replicar.

**Como interpretar:**
- Tracking Error baixo (< 0.5%): ETF replica bem o índice
- Tracking Error alto (> 1%): ETF pode ter problemas de gestão

**Causas de Tracking Error:**
1. Taxas de administração
2. Custos de rebalanceamento
3. Dividendos retidos temporariamente
4. Replicação por amostragem (não compra todos os ativos)

**Por que é importante:**
Se você quer exposição ao S&P 500, precisa de um ETF que realmente acompanhe o índice.`
      },
      {
        id: 'volume_liquidity',
        title: 'Volume e Liquidez',
        type: 'interactive',
        content: 'Entenda a importância do volume de negociação.',
        interactiveData: {
          type: 'slider',
          data: {
            scenario: 'volume_impact',
            description: 'Veja como o volume afeta o spread bid-ask',
            ranges: {
              volume: [100000, 10000000],
              spread: [0.1, 2.0]
            }
          }
        }
      }
    ],
    quiz: {
      id: 'metrics_quiz',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'Um ETF com expense ratio de 0.8% é considerado:',
          options: ['Excelente', 'Bom', 'Aceitável', 'Alto'],
          correctAnswer: 'Aceitável',
          explanation: 'Um expense ratio de 0.8% está na faixa aceitável (0.5% - 1.0%), mas não é ideal.',
          points: 10
        },
        {
          id: 'q2',
          type: 'fill_blank',
          question: 'Se um ETF tem expense ratio de 0.3% e você investe R$ 50.000, pagará R$ _____ de taxa por ano.',
          options: [],
          correctAnswer: '150',
          explanation: 'R$ 50.000 × 0.3% = R$ 150 por ano em taxas.',
          points: 15
        },
        {
          id: 'q3',
          type: 'true_false',
          question: 'Um tracking error alto sempre indica que o ETF é ruim.',
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: 'Falso',
          explanation: 'Tracking error alto pode ser justificado se o ETF usa estratégias de otimização ou se o índice é difícil de replicar.',
          points: 10
        }
      ],
      passingScore: 75,
      retakeAllowed: true
    },
    rewards: {
      points: 150,
      badge: 'Analista Junior'
    }
  },
  {
    id: 'portfolio_construction',
    title: 'Construção de Carteira com ETFs',
    description: 'Aprenda a construir uma carteira diversificada usando ETFs.',
    category: 'strategy',
    difficulty: 'advanced',
    estimatedTime: 30,
    prerequisites: ['etf_basics', 'understanding_metrics'],
    content: [
      {
        id: 'asset_allocation',
        title: 'Alocação de Ativos',
        type: 'text',
        content: `A alocação de ativos é a decisão mais importante para o sucesso de longo prazo.

**Regra dos 100:**
100 - sua idade = % em ações
Ex: 30 anos → 70% ações, 30% renda fixa

**Alocação por Perfil:**

**Conservador:**
- 30% Ações
- 60% Renda Fixa
- 10% Alternativos

**Moderado:**
- 60% Ações
- 30% Renda Fixa
- 10% Alternativos

**Arrojado:**
- 80% Ações
- 15% Renda Fixa
- 5% Alternativos

**Diversificação Geográfica:**
- Mercado doméstico: 60%
- Mercados desenvolvidos: 30%
- Mercados emergentes: 10%`
      },
      {
        id: 'rebalancing',
        title: 'Rebalanceamento',
        type: 'interactive',
        content: 'Simule o impacto do rebalanceamento na sua carteira.',
        interactiveData: {
          type: 'calculation',
          data: {
            scenario: 'rebalancing_simulation',
            initial_allocation: [60, 40],
            market_changes: [20, -10],
            rebalancing_frequency: ['Mensal', 'Trimestral', 'Anual']
          }
        }
      }
    ],
    quiz: {
      id: 'portfolio_quiz',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'Segundo a regra dos 100, uma pessoa de 25 anos deveria ter que % em ações?',
          options: ['65%', '70%', '75%', '80%'],
          correctAnswer: '75%',
          explanation: '100 - 25 = 75% em ações é a sugestão da regra dos 100.',
          points: 10
        },
        {
          id: 'q2',
          type: 'drag_drop',
          question: 'Organize os ETFs por ordem de risco (menor para maior):',
          options: ['ETF de Bonds', 'ETF S&P 500', 'ETF Small Caps', 'ETF Mercados Emergentes'],
          correctAnswer: ['ETF de Bonds', 'ETF S&P 500', 'ETF Small Caps', 'ETF Mercados Emergentes'],
          explanation: 'Bonds têm menor risco, seguidos por large caps, small caps e mercados emergentes.',
          points: 20
        }
      ],
      passingScore: 80,
      retakeAllowed: true
    },
    rewards: {
      points: 200,
      badge: 'Estrategista'
    }
  }
];

export const LEARNING_BADGES = [
  {
    id: 'etf_basic',
    name: 'ETF Básico',
    description: 'Completou o curso básico de ETFs',
    icon: '🎓'
  },
  {
    id: 'analyst_junior',
    name: 'Analista Junior',
    description: 'Domina métricas de análise de ETFs',
    icon: '📊'
  },
  {
    id: 'strategist',
    name: 'Estrategista',
    description: 'Sabe construir carteiras diversificadas',
    icon: '🎯'
  },
  {
    id: 'speed_learner',
    name: 'Aprendiz Rápido',
    description: 'Completou 3 cursos em uma semana',
    icon: '⚡'
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Obteve 100% em todos os quizzes',
    icon: '💎'
  }
];

// Funções utilitárias para gerenciar progresso
export class LearningProgress {
  static getProgress(userId: string): UserProgress | null {
    const saved = localStorage.getItem(`learning_progress_${userId}`);
    return saved ? JSON.parse(saved) : null;
  }

  static saveProgress(userId: string, progress: UserProgress): void {
    localStorage.setItem(`learning_progress_${userId}`, JSON.stringify(progress));
  }

  static initializeProgress(userId: string): UserProgress {
    const progress: UserProgress = {
      userId,
      completedCourses: [],
      courseProgress: {},
      totalPoints: 0,
      badges: [],
      currentStreak: 0,
      lastActivity: new Date()
    };
    
    this.saveProgress(userId, progress);
    return progress;
  }

  static completeModule(userId: string, courseId: string, moduleId: string): void {
    const progress = this.getProgress(userId) || this.initializeProgress(userId);
    
    if (!progress.courseProgress[courseId]) {
      progress.courseProgress[courseId] = {
        moduleProgress: [],
        quizAttempts: 0,
        completed: false
      };
    }

    if (!progress.courseProgress[courseId].moduleProgress.includes(moduleId)) {
      progress.courseProgress[courseId].moduleProgress.push(moduleId);
    }

    progress.lastActivity = new Date();
    this.saveProgress(userId, progress);
  }

  static completeQuiz(userId: string, courseId: string, score: number): void {
    const progress = this.getProgress(userId) || this.initializeProgress(userId);
    const course = LEARNING_COURSES.find(c => c.id === courseId);
    
    if (!course) return;

    if (!progress.courseProgress[courseId]) {
      progress.courseProgress[courseId] = {
        moduleProgress: [],
        quizAttempts: 0,
        completed: false
      };
    }

    progress.courseProgress[courseId].quizAttempts++;
    progress.courseProgress[courseId].lastQuizScore = score;

    if (score >= course.quiz.passingScore) {
      progress.courseProgress[courseId].completed = true;
      progress.courseProgress[courseId].completedAt = new Date();
      
      if (!progress.completedCourses.includes(courseId)) {
        progress.completedCourses.push(courseId);
        progress.totalPoints += course.rewards.points;
        
        if (course.rewards.badge && !progress.badges.includes(course.rewards.badge)) {
          progress.badges.push(course.rewards.badge);
        }
      }
    }

    progress.lastActivity = new Date();
    this.saveProgress(userId, progress);
  }

  static getAvailableCourses(userId: string): LearningContent[] {
    const progress = this.getProgress(userId);
    
    return LEARNING_COURSES.filter(course => {
      if (!course.prerequisites) return true;
      
      return course.prerequisites.every(prereq => 
        progress?.completedCourses.includes(prereq)
      );
    });
  }

  static getCourseProgress(userId: string, courseId: string): number {
    const progress = this.getProgress(userId);
    const course = LEARNING_COURSES.find(c => c.id === courseId);
    
    if (!progress || !course) return 0;
    
    const courseProgress = progress.courseProgress[courseId];
    if (!courseProgress) return 0;
    
    const totalModules = course.content.length + 1; // +1 para o quiz
    const completedModules = courseProgress.moduleProgress.length;
    const quizCompleted = courseProgress.completed ? 1 : 0;
    
    return ((completedModules + quizCompleted) / totalModules) * 100;
  }
} 