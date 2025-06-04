import React from 'react';
import { InvestorProfile } from '@/lib/onboarding/profiles';
import { ETF } from '@/types';

export interface CoachingSession {
  id: string;
  userId: string;
  topic: CoachingTopic;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
  userResponses: Record<string, any>;
}

export interface CoachingTopic {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'risk_management' | 'portfolio_construction' | 'market_analysis' | 'advanced_strategies';
  estimatedDuration: number; // em minutos
  prerequisites: string[];
  lessons: CoachingLesson[];
}

export interface CoachingLesson {
  id: string;
  title: string;
  content: string;
  type: 'explanation' | 'interactive' | 'quiz' | 'simulation' | 'reflection';
  duration: number; // em minutos
  resources: LearningResource[];
  exercises?: Exercise[];
  quiz?: QuizQuestion[];
}

export interface LearningResource {
  type: 'article' | 'video' | 'calculator' | 'chart' | 'example';
  title: string;
  url?: string;
  content?: string;
  data?: any;
}

export interface Exercise {
  id: string;
  question: string;
  type: 'scenario' | 'calculation' | 'selection' | 'reflection';
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  relatedETFs?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface CoachingInsight {
  type: 'knowledge_gap' | 'strength' | 'suggestion' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  action?: {
    text: string;
    path: string;
  };
}

export interface PersonalizedPath {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  topics: CoachingTopic[];
  reasoning: string[];
}

class CoachingEngine {
  
  // Gerar caminho de aprendizado personalizado
  generatePersonalizedPath(
    profile: InvestorProfile,
    currentKnowledge?: any,
    goals?: string[]
  ): PersonalizedPath {
    const topics: CoachingTopic[] = [];
    const reasoning: string[] = [];

    // Tópicos baseados no perfil de risco
    if (profile.riskTolerance === 'conservative') {
      reasoning.push('Perfil conservador detectado - foco em gestão de risco e preservação de capital');
      topics.push(this.getTopicById('risk-management-basics'));
      topics.push(this.getTopicById('bond-etfs-deep-dive'));
      topics.push(this.getTopicById('dividend-strategies'));
    } else if (profile.riskTolerance === 'aggressive') {
      reasoning.push('Perfil agressivo detectado - foco em estratégias de crescimento e análise avançada');
      topics.push(this.getTopicById('growth-strategies'));
      topics.push(this.getTopicById('sector-rotation'));
      topics.push(this.getTopicById('volatility-trading'));
    } else {
      reasoning.push('Perfil moderado - caminho equilibrado entre segurança e crescimento');
      topics.push(this.getTopicById('balanced-portfolio'));
      topics.push(this.getTopicById('diversification-strategies'));
      topics.push(this.getTopicById('rebalancing-techniques'));
    }

    // Tópicos baseados na experiência
    if (profile.id === 'beginner') {
      reasoning.push('Iniciante identificado - começando com fundamentos essenciais');
      topics.unshift(this.getTopicById('etf-basics'));
      topics.unshift(this.getTopicById('investing-fundamentals'));
    }

    const totalTime = topics.reduce((sum, topic) => sum + topic.estimatedDuration, 0);

    return {
      id: `path-${Date.now()}`,
      title: `Jornada Personalizada - ${profile.name}`,
      description: `Caminho de aprendizado otimizado para seu perfil de investidor`,
      estimatedTime: totalTime,
      topics,
      reasoning
    };
  }

  // Analisar progresso e gerar insights
  analyzeProgress(
    sessions: CoachingSession[],
    profile: InvestorProfile
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    // Análise de completude
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgProgress = sessions.reduce((sum, s) => sum + s.progress, 0) / sessions.length;

    if (completedSessions.length === 0 && sessions.length > 0) {
      insights.push({
        type: 'suggestion',
        title: '🎯 Continue sua jornada de aprendizado',
        description: 'Você começou algumas lições. Que tal completar uma para ganhar impulso?',
        actionable: true,
        action: {
          text: 'Continuar Lição',
          path: '/coaching/continue'
        }
      });
    }

    if (avgProgress > 80) {
      insights.push({
        type: 'strength',
        title: '🌟 Excelente progresso!',
        description: 'Você está dominando bem os conceitos. Considere tópicos mais avançados.',
        actionable: true,
        action: {
          text: 'Explorar Avançado',
          path: '/coaching/advanced'
        }
      });
    }

    // Análise de lacunas de conhecimento
    const basicTopics = sessions.filter(s => s.topic.category === 'basics');
    if (basicTopics.length === 0 && profile.id !== 'beginner') {
      insights.push({
        type: 'knowledge_gap',
        title: '📚 Fortaleça os fundamentos',
        description: 'Revisar conceitos básicos pode melhorar significativamente seus investimentos.',
        actionable: true,
        action: {
          text: 'Revisar Básicos',
          path: '/coaching/basics'
        }
      });
    }

    return insights;
  }

  // Gerar lição personalizada usando IA
  async generatePersonalizedLesson(
    topic: string,
    profile: InvestorProfile,
    currentMarketData: ETF[]
  ): Promise<CoachingLesson> {
    const prompt = `
Crie uma lição educativa personalizada sobre "${topic}" para um investidor com perfil ${profile.name}.

PERFIL DO USUÁRIO:
- Tolerância ao risco: ${profile.riskTolerance}
- Características: ${profile.characteristics.join(', ')}
- Categorias preferidas: ${profile.preferredCategories.join(', ')}

CONTEXTO DO MERCADO:
- ETFs disponíveis: ${currentMarketData.slice(0, 10).map(e => e.symbol).join(', ')}

FORMATO DA LIÇÃO:
1. Explicação conceitual clara e prática
2. Exemplos usando ETFs reais do mercado atual
3. Exercício interativo
4. Quiz de verificação (3 perguntas)
5. Recursos adicionais

A lição deve ser:
- Adequada ao nível do investidor
- Contextualizada com exemplos reais
- Interativa e envolvente
- Focada em aplicação prática

Responda em formato JSON com a estrutura da lição.
    `;

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: 'coaching_lesson',
          model: 'gpt-4'
        })
      });

      if (!response.ok) {
        throw new Error('Falha na geração da lição');
      }

      const lessonData = await response.json();
      
      return {
        id: `lesson-${Date.now()}`,
        title: lessonData.title || topic,
        content: lessonData.content || 'Conteúdo em desenvolvimento',
        type: 'explanation',
        duration: 15,
        resources: lessonData.resources || [],
        exercises: lessonData.exercises || [],
        quiz: lessonData.quiz || []
      };
    } catch (error) {
      console.error('Erro ao gerar lição:', error);
      return this.getFallbackLesson(topic);
    }
  }

  // Avaliar resposta do usuário e dar feedback
  evaluateUserResponse(
    exercise: Exercise,
    userAnswer: string,
    profile: InvestorProfile
  ): {
    correct: boolean;
    feedback: string;
    nextRecommendation?: string;
    additionalResources?: LearningResource[];
  } {
    const correct = exercise.correctAnswer === userAnswer;
    
    let feedback = correct 
      ? '✅ Correto! ' + exercise.explanation
      : '❌ Não exatamente. ' + exercise.explanation;

    // Feedback personalizado baseado no perfil
    if (!correct && profile.id === 'beginner') {
      feedback += '\n\n💡 Dica: Como iniciante, foque primeiro em entender os conceitos básicos antes de partir para estratégias mais complexas.';
    }

    let nextRecommendation;
    if (!correct) {
      nextRecommendation = 'Revisar o conceito com um exemplo prático';
    } else if (profile.riskTolerance === 'aggressive') {
      nextRecommendation = 'Explorar estratégias mais avançadas sobre este tema';
    }

    return {
      correct,
      feedback,
      nextRecommendation,
      additionalResources: correct ? [] : this.getRelevantResources(exercise.id)
    };
  }

  // Métodos auxiliares
  private getTopicById(id: string): CoachingTopic {
    const topics: Record<string, CoachingTopic> = {
      'etf-basics': {
        id: 'etf-basics',
        title: 'Fundamentos dos ETFs',
        description: 'Entenda o que são ETFs, como funcionam e suas vantagens',
        category: 'basics',
        estimatedDuration: 30,
        prerequisites: [],
        lessons: []
      },
      'risk-management-basics': {
        id: 'risk-management-basics',
        title: 'Gestão de Risco para Conservadores',
        description: 'Estratégias para preservar capital e minimizar riscos',
        category: 'risk_management',
        estimatedDuration: 45,
        prerequisites: ['etf-basics'],
        lessons: []
      },
      'growth-strategies': {
        id: 'growth-strategies',
        title: 'Estratégias de Crescimento',
        description: 'Como identificar e aproveitar oportunidades de crescimento',
        category: 'advanced_strategies',
        estimatedDuration: 60,
        prerequisites: ['etf-basics', 'portfolio-construction'],
        lessons: []
      }
      // ... mais tópicos
    };

    return topics[id] || topics['etf-basics'];
  }

  private getFallbackLesson(topic: string): CoachingLesson {
    return {
      id: `fallback-${Date.now()}`,
      title: `Introdução a ${topic}`,
      content: `Este é um tópico importante para o desenvolvimento do seu conhecimento em investimentos.`,
      type: 'explanation',
      duration: 15,
      resources: [],
      exercises: [],
      quiz: []
    };
  }

  private getRelevantResources(exerciseId: string): LearningResource[] {
    return [
      {
        type: 'article',
        title: 'Guia Detalhado sobre o Conceito',
        content: 'Explicação aprofundada do tópico com exemplos práticos'
      },
      {
        type: 'calculator',
        title: 'Calculadora Interativa',
        content: 'Ferramenta para praticar os cálculos'
      }
    ];
  }
}

export const coachingEngine = new CoachingEngine();

// Hook para usar o sistema de coaching
export function useCoaching(profile: InvestorProfile | null) {
  const [personalizedPath, setPersonalizedPath] = React.useState<PersonalizedPath | null>(null);
  const [currentSession, setCurrentSession] = React.useState<CoachingSession | null>(null);
  const [insights, setInsights] = React.useState<CoachingInsight[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!profile) return;

    setLoading(true);
    
    try {
      // Gerar caminho personalizado
      const path = coachingEngine.generatePersonalizedPath(profile);
      setPersonalizedPath(path);

      // Simular sessões existentes
      const mockSessions: CoachingSession[] = [
        {
          id: 'session-1',
          userId: 'user-1',
          topic: path.topics[0],
          level: profile.id === 'beginner' ? 'beginner' : 'intermediate',
          status: 'active',
          progress: 60,
          currentStep: 3,
          totalSteps: 5,
          startedAt: new Date(Date.now() - 86400000), // 1 dia atrás
          userResponses: {}
        }
      ];

      // Analisar progresso
      const sessionInsights = coachingEngine.analyzeProgress(mockSessions, profile);
      setInsights(sessionInsights);
      
      if (mockSessions.length > 0) {
        setCurrentSession(mockSessions[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar coaching:', error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return {
    personalizedPath,
    currentSession,
    insights,
    loading,
    generateLesson: coachingEngine.generatePersonalizedLesson.bind(coachingEngine),
    evaluateResponse: coachingEngine.evaluateUserResponse.bind(coachingEngine)
  };
} 