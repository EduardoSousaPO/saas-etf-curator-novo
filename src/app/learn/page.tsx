"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Star, 
  TrendingUp,
  Users,
  Target,
  Play,
  CheckCircle,
  Lock,
  Trophy
} from 'lucide-react';
import { LEARNING_COURSES, LEARNING_BADGES, LearningProgress, UserProgress } from '@/lib/learning/content';
import Course from '@/components/learning/Course';
import AssistantChat from '@/components/assistant/AssistantChat';

export default function LearnPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [availableCourses, setAvailableCourses] = useState(LEARNING_COURSES);

  const userId = 'demo_user'; // Em produção, obter do contexto de autenticação

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = () => {
    const progress = LearningProgress.getProgress(userId) || LearningProgress.initializeProgress(userId);
    setUserProgress(progress);
    
    // Filtrar cursos disponíveis baseado nos pré-requisitos
    const available = LearningProgress.getAvailableCourses(userId);
    setAvailableCourses(available);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleCourseComplete = () => {
    loadUserProgress(); // Recarregar progresso
    setSelectedCourse(null); // Voltar para lista de cursos
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'bg-blue-100 text-blue-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      case 'strategy': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'basics': return 'Básicos';
      case 'analysis': return 'Análise';
      case 'strategy': return 'Estratégia';
      case 'advanced': return 'Avançado';
      default: return category;
    }
  };

  if (selectedCourse) {
    const course = LEARNING_COURSES.find(c => c.id === selectedCourse);
    if (!course) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setSelectedCourse(null)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Voltar aos cursos
          </button>
        </div>
        
        <Course 
          course={course} 
          onComplete={handleCourseComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Centro de Aprendizado ETF
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Aprenda sobre ETFs com cursos interativos, quizzes e conteúdo especializado. 
              Desenvolva suas habilidades de investimento do básico ao avançado.
            </p>
          </div>

          {/* Progress Overview */}
          {userProgress && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Cursos Concluídos</p>
                    <p className="text-3xl font-bold">{userProgress.completedCourses.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Pontos Totais</p>
                    <p className="text-3xl font-bold">{userProgress.totalPoints}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Badges Conquistadas</p>
                    <p className="text-3xl font-bold">{userProgress.badges.length}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Sequência Atual</p>
                    <p className="text-3xl font-bold">{userProgress.currentStreak}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Courses List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cursos Disponíveis</h2>
              <p className="text-gray-600">Escolha um curso para começar sua jornada de aprendizado</p>
            </div>

            <div className="space-y-6">
              {availableCourses.map((course, index) => {
                const courseProgress = userProgress ? LearningProgress.getCourseProgress(userId, course.id) : 0;
                const isCompleted = userProgress?.completedCourses.includes(course.id) || false;
                const isLocked = course.prerequisites && 
                  !course.prerequisites.every(prereq => userProgress?.completedCourses.includes(prereq));

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                      isLocked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                          {isCompleted && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          {isLocked && (
                            <Lock className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                            {getDifficultyLabel(course.difficulty)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(course.category)}`}>
                            {getCategoryLabel(course.category)}
                          </span>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{course.estimatedTime} min</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Star className="w-4 h-4" />
                            <span className="text-sm">{course.rewards.points} pontos</span>
                          </div>
                        </div>

                        {courseProgress > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Progresso</span>
                              <span className="text-sm font-medium text-gray-900">{Math.round(courseProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${courseProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {course.prerequisites && course.prerequisites.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">Pré-requisitos:</p>
                            <div className="flex flex-wrap gap-1">
                              {course.prerequisites.map((prereq, idx) => {
                                const prereqCourse = LEARNING_COURSES.find(c => c.id === prereq);
                                const isPrereqCompleted = userProgress?.completedCourses.includes(prereq);
                                return (
                                  <span 
                                    key={idx}
                                    className={`text-xs px-2 py-1 rounded ${
                                      isPrereqCompleted 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {prereqCourse?.title || prereq}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => !isLocked && handleCourseSelect(course.id)}
                        disabled={isLocked}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                          isLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isCompleted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Play className="w-4 h-4" />
                        <span>
                          {isCompleted ? 'Revisar' : courseProgress > 0 ? 'Continuar' : 'Começar'}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suas Conquistas</h3>
              
              {userProgress && userProgress.badges.length > 0 ? (
                <div className="space-y-3">
                  {LEARNING_BADGES
                    .filter(badge => userProgress.badges.includes(badge.name))
                    .map((badge, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{badge.name}</h4>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Complete cursos para ganhar badges!</p>
                </div>
              )}
            </div>

            {/* Learning Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Dicas de Aprendizado</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Complete os módulos em ordem para melhor compreensão</li>
                <li>• Pratique com os quizzes para fixar o conhecimento</li>
                <li>• Use o glossário contextual para termos técnicos</li>
                <li>• Aplique o que aprendeu no comparador de ETFs</li>
              </ul>
            </div>

            {/* Progress Stats */}
            {userProgress && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Taxa de Conclusão</span>
                    <span className="font-medium">
                      {Math.round((userProgress.completedCourses.length / LEARNING_COURSES.length) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tempo Estimado Restante</span>
                    <span className="font-medium">
                      {LEARNING_COURSES
                        .filter(c => !userProgress.completedCourses.includes(c.id))
                        .reduce((sum, c) => sum + c.estimatedTime, 0)} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Última Atividade</span>
                    <span className="font-medium text-sm">
                      {new Date(userProgress.lastActivity).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assistente Virtual */}
      <AssistantChat />
    </div>
  );
} 