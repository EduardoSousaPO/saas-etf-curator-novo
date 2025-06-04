"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Clock, 
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Brain,
  Award,
  Lightbulb
} from 'lucide-react';
import { useCoaching } from '@/lib/ai/coaching';
import { InvestorProfile } from '@/lib/onboarding/profiles';

export default function CoachingPage() {
  const [userProfile, setUserProfile] = useState<InvestorProfile | null>(null);
  const { personalizedPath, currentSession, insights, loading } = useCoaching(userProfile);

  useEffect(() => {
    // Carregar perfil do usuário
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setUserProfile(profileData.profile);
    }
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="w-5 h-5" />;
      case 'risk_management': return <Target className="w-5 h-5" />;
      case 'portfolio_construction': return <TrendingUp className="w-5 h-5" />;
      case 'market_analysis': return <Brain className="w-5 h-5" />;
      case 'advanced_strategies': return <Award className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Coaching Financeiro Personalizado
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Para receber coaching personalizado, você precisa completar seu perfil de investidor.
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Completar Perfil
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GraduationCap className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Coaching Financeiro IA
                </h1>
                <p className="text-gray-600 mt-1">
                  Jornada personalizada para {userProfile.name}
                </p>
              </div>
            </div>
            
            {currentSession && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Sessão Ativa</span>
                  <span className="text-sm text-blue-700">{currentSession.progress}%</span>
                </div>
                <div className="w-32 bg-blue-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(currentSession.progress)}`}
                    style={{ width: `${currentSession.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-700 mt-1">{currentSession.topic.title}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Principal - Jornada Personalizada */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sessão Atual */}
            {currentSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <PlayCircle className="w-6 h-6 mr-2 text-green-600" />
                    Continue de onde parou
                  </h2>
                  <div className="text-sm text-gray-500">
                    Etapa {currentSession.currentStep} de {currentSession.totalSteps}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">{currentSession.topic.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{currentSession.topic.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {currentSession.topic.estimatedDuration} min restantes
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Continuar Lição
                    </button>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(currentSession.progress)}`}
                    style={{ width: `${currentSession.progress}%` }}
                  ></div>
                </div>
              </motion.div>
            )}

            {/* Jornada Personalizada */}
            {personalizedPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg border p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-blue-600" />
                  {personalizedPath.title}
                </h2>
                
                <p className="text-gray-600 mb-4">{personalizedPath.description}</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Por que este caminho foi criado para você:</h3>
                  <ul className="space-y-1">
                    {personalizedPath.reasoning.map((reason, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Tópicos da Jornada</h3>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {personalizedPath.estimatedTime} min total
                    </div>
                  </div>
                  
                  {personalizedPath.topics.map((topic, index) => (
                    <div key={topic.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mr-4">
                        {getCategoryIcon(topic.category)}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{topic.title}</h4>
                        <p className="text-sm text-gray-600">{topic.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {topic.estimatedDuration} min
                          {topic.prerequisites.length > 0 && (
                            <span className="ml-3">Requer: {topic.prerequisites.length} pré-requisitos</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {index === 0 ? (
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                            Iniciar
                          </button>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Insights e Progresso */}
          <div className="space-y-6">
            
            {/* Insights do Coaching */}
            {insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg border p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                  Insights Personalizados
                </h3>
                
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      insight.type === 'knowledge_gap' ? 'bg-red-50 border-red-200' :
                      insight.type === 'strength' ? 'bg-green-50 border-green-200' :
                      insight.type === 'suggestion' ? 'bg-blue-50 border-blue-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}>
                      <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      
                      {insight.actionable && insight.action && (
                        <button
                          onClick={() => window.location.href = insight.action!.path}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {insight.action.text} →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Estatísticas de Progresso */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Seu Progresso
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lições Completadas</span>
                  <span className="font-medium">0/5</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo Estudado</span>
                  <span className="font-medium">0h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nível Atual</span>
                  <span className="font-medium capitalize">{userProfile.id}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Próxima Meta</span>
                  <span className="font-medium">Completar Básicos</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Award className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Conquista Desbloqueada</span>
                </div>
                <p className="text-sm text-blue-800">
                  🎯 Primeiro Passo - Você iniciou sua jornada de aprendizado!
                </p>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6"
            >
              <h3 className="font-semibold mb-2">Acelere seu Aprendizado</h3>
              <p className="text-sm mb-4 opacity-90">
                Desbloqueie conteúdo premium e receba coaching 1:1 com especialistas.
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full">
                Upgrade para Pro
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 