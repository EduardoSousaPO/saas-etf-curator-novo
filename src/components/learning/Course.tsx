"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Star, 
  ChevronRight,
  ChevronLeft,
  Award,
  Eye,
  BarChart3,
  Calculator
} from 'lucide-react';
import { LearningContent, CourseModule, LearningProgress } from '@/lib/learning/content';
import Quiz from './Quiz';
import ContextualGlossary from '@/components/ui/ContextualGlossary';

interface CourseProps {
  course: LearningContent;
  onComplete?: () => void;
}

export default function Course({ course, onComplete }: CourseProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const currentModule = course.content[currentModuleIndex];
  const isLastModule = currentModuleIndex === course.content.length - 1;
  const userId = 'demo_user'; // Em produção, obter do contexto de autenticação

  useEffect(() => {
    loadProgress();
  }, [course.id]);

  useEffect(() => {
    updateProgress();
  }, [completedModules, showQuiz]);

  const loadProgress = () => {
    const userProgress = LearningProgress.getProgress(userId);
    if (userProgress?.courseProgress[course.id]) {
      setCompletedModules(userProgress.courseProgress[course.id].moduleProgress);
    }
  };

  const updateProgress = () => {
    const totalSteps = course.content.length + 1; // +1 para o quiz
    const completedSteps = completedModules.length + (showQuiz ? 1 : 0);
    setProgress((completedSteps / totalSteps) * 100);
  };

  const handleModuleComplete = () => {
    if (!completedModules.includes(currentModule.id)) {
      const updated = [...completedModules, currentModule.id];
      setCompletedModules(updated);
      LearningProgress.completeModule(userId, course.id, currentModule.id);
    }
  };

  const handleNext = () => {
    handleModuleComplete();
    
    if (isLastModule) {
      setShowQuiz(true);
    } else {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (showQuiz) {
      setShowQuiz(false);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
    }
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (passed) {
      onComplete?.();
    }
  };

  const handleModuleSelect = (index: number) => {
    setCurrentModuleIndex(index);
    setShowQuiz(false);
  };

  const isModuleUnlocked = (index: number) => {
    if (index === 0) return true;
    return completedModules.includes(course.content[index - 1].id);
  };

  const getModuleIcon = (module: CourseModule) => {
    switch (module.type) {
      case 'text': return <BookOpen className="w-5 h-5" />;
      case 'video': return <PlayCircle className="w-5 h-5" />;
      case 'interactive': return <BarChart3 className="w-5 h-5" />;
      case 'example': return <Eye className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  if (showQuiz) {
    return (
      <div>
        <Quiz 
          quiz={course.quiz}
          courseId={course.id}
          onComplete={handleQuizComplete}
          onRetake={() => setShowQuiz(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.description}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{course.estimatedTime} min</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {course.difficulty === 'beginner' ? 'Iniciante' :
               course.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progresso do curso</span>
            <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Module Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {course.content.map((module, index) => (
            <button
              key={module.id}
              onClick={() => isModuleUnlocked(index) && handleModuleSelect(index)}
              disabled={!isModuleUnlocked(index)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                index === currentModuleIndex
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : completedModules.includes(module.id)
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : isModuleUnlocked(index)
                  ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              {completedModules.includes(module.id) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                getModuleIcon(module)
              )}
              <span className="text-sm font-medium">{index + 1}. {module.title}</span>
            </button>
          ))}
          <button
            onClick={() => setShowQuiz(true)}
            disabled={completedModules.length < course.content.length}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              completedModules.length >= course.content.length
                ? 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
                : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Quiz Final</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Module Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={currentModule.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            {/* Module Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                {getModuleIcon(currentModule)}
                <h2 className="text-2xl font-bold text-gray-900">{currentModule.title}</h2>
                {completedModules.includes(currentModule.id) && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div className="text-sm text-gray-500">
                Módulo {currentModuleIndex + 1} de {course.content.length}
              </div>
            </div>

            {/* Module Content */}
            <div className="prose prose-lg max-w-none">
              {currentModule.type === 'text' && (
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  <ContextualGlossary>{currentModule.content}</ContextualGlossary>
                </div>
              )}

              {currentModule.type === 'interactive' && currentModule.interactiveData && (
                <InteractiveContent 
                  data={currentModule.interactiveData}
                  content={currentModule.content}
                />
              )}

              {currentModule.type === 'example' && currentModule.example && (
                <ExampleContent example={currentModule.example} />
              )}

              {currentModule.type === 'video' && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Vídeo: {currentModule.title}</p>
                    <p className="text-sm text-gray-500 mt-2">{currentModule.content}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentModuleIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="text-sm text-gray-500">
                {currentModuleIndex + 1} / {course.content.length}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>{isLastModule ? 'Fazer Quiz' : 'Próximo'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informações do Curso</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Módulos</span>
                <span className="font-medium">{course.content.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duração</span>
                <span className="font-medium">{course.estimatedTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pontos</span>
                <span className="font-medium">{course.rewards.points}</span>
              </div>
              {course.rewards.badge && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Badge</span>
                  <span className="font-medium">{course.rewards.badge}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Pré-requisitos</h3>
              <ul className="space-y-1">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    • {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Seu Progresso</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Concluído</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Módulos</span>
                <span className="font-medium">{completedModules.length}/{course.content.length}</span>
              </div>
              {progress === 100 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">Curso concluído!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para conteúdo interativo
function InteractiveContent({ data, content }: { data: any; content: string }) {
  if (data.type === 'comparison') {
    return (
      <div className="space-y-6">
        <p className="text-gray-700">{content}</p>
        <div className="grid md:grid-cols-3 gap-4">
          {data.data.types.map((type: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{type.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{type.description}</p>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">Exemplos:</div>
                {type.examples.map((example: string, idx: number) => (
                  <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {example}
                  </div>
                ))}
                <div className="text-xs font-medium text-blue-600">
                  Risco: {type.riskLevel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'slider') {
    return (
      <div className="space-y-6">
        <p className="text-gray-700">{content}</p>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-medium mb-4">{data.data.description}</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Volume de negociação</label>
              <input 
                type="range" 
                min={data.data.ranges.volume[0]} 
                max={data.data.ranges.volume[1]} 
                className="w-full" 
              />
            </div>
            <div className="text-sm text-gray-600">
              💡 Maior volume = menor spread = melhor preço para você
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-700">{content}</p>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-800">
          <Calculator className="w-5 h-5" />
          <span className="font-medium">Conteúdo Interativo</span>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Este módulo contém elementos interativos para melhor aprendizado.
        </p>
      </div>
    </div>
  );
}

// Componente para exemplos
function ExampleContent({ example }: { example: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Eye className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">{example.title}</h3>
        </div>
        <p className="text-green-700">{example.description}</p>
      </div>

      {example.data.etfs && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Dados do ETF</h4>
          </div>
          {example.data.etfs.map((etf: any, index: number) => (
            <div key={index} className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Símbolo</div>
                  <div className="font-medium">{etf.symbol}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Nome</div>
                  <div className="font-medium">{etf.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Taxa de Administração</div>
                  <div className="font-medium">{etf.expense_ratio}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Holdings</div>
                  <div className="font-medium">{etf.holdings}</div>
                </div>
              </div>
              {etf.top_holdings && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">Principais Holdings:</div>
                  <div className="flex flex-wrap gap-2">
                    {etf.top_holdings.map((holding: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {holding}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 