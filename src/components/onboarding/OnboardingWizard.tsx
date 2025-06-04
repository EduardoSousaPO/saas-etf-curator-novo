// src/components/onboarding/OnboardingWizard.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Target, User, TrendingUp } from 'lucide-react';
import { 
  ONBOARDING_QUESTIONS, 
  calculateInvestorProfile, 
  UserAnswers, 
  OnboardingQuestion,
  ProfileAssessment 
} from '@/lib/onboarding/profiles';
import ContextualGlossary from '@/components/ui/ContextualGlossary';

interface OnboardingWizardProps {
  onComplete: (assessment: ProfileAssessment) => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const isLastStep = currentStep === ONBOARDING_QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const assessment = calculateInvestorProfile(answers);
      
      // Salvar perfil no localStorage por enquanto
      localStorage.setItem('userProfile', JSON.stringify(assessment));
      
      onComplete(assessment);
    } catch (error) {
      console.error('Erro ao processar onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const isAnswered = (question: OnboardingQuestion): boolean => {
    const answer = answers[question.id];
    if (question.required && !answer) return false;
    if (question.type === 'multiple' && Array.isArray(answer) && answer.length === 0) return false;
    return true;
  };

  const canProceed = isAnswered(currentQuestion);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience':
        return <User className="w-6 h-6" />;
      case 'goals':
        return <Target className="w-6 h-6" />;
      case 'risk':
        return <TrendingUp className="w-6 h-6" />;
      case 'preferences':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header com Progress */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getCategoryIcon(currentQuestion.category)}
              <h1 className="text-2xl font-bold">Vamos conhecer você!</h1>
            </div>
            <span className="text-blue-100 text-sm">
              {currentStep + 1} de {ONBOARDING_QUESTIONS.length}
            </span>
          </div>
          
          {/* Barra de Progresso */}
          <div className="w-full bg-blue-500 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Conteúdo da Pergunta */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  <ContextualGlossary>{currentQuestion.question}</ContextualGlossary>
                </h2>
                {currentQuestion.description && (
                  <p className="text-gray-600">
                    <ContextualGlossary>{currentQuestion.description}</ContextualGlossary>
                  </p>
                )}
              </div>

              {/* Opções de Resposta */}
              <div className="space-y-4">
                {renderQuestionInput(currentQuestion, answers, handleAnswer)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer com Navegação */}
        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Anterior
          </button>

          <div className="flex space-x-2">
            {ONBOARDING_QUESTIONS.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed || isCompleting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCompleting ? (
              'Processando...'
            ) : isLastStep ? (
              'Finalizar'
            ) : (
              <>
                Próximo
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderQuestionInput(
  question: OnboardingQuestion, 
  answers: UserAnswers, 
  onAnswer: (questionId: string, value: string | string[] | number) => void
) {
  const currentAnswer = answers[question.id];

  switch (question.type) {
    case 'single':
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                currentAnswer === option.value 
                  ? 'border-blue-500 bg-blue-50 text-blue-900' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={currentAnswer === option.value}
                onChange={(e) => onAnswer(question.id, e.target.value)}
                className="w-4 h-4 text-blue-600 mr-3"
              />
              <span className="flex-1">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'multiple':
      return (
        <div className="space-y-3">
          {question.options?.map((option) => {
            const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-900' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => {
                    const currentValues = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (e.target.checked) {
                      onAnswer(question.id, [...currentValues, option.value]);
                    } else {
                      onAnswer(question.id, currentValues.filter(v => v !== option.value));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 mr-3"
                />
                <span className="flex-1">{option.label}</span>
              </label>
            );
          })}
        </div>
      );

    case 'scale':
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                  currentAnswer === option.value 
                    ? 'border-blue-500 bg-blue-50 text-blue-900' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) => onAnswer(question.id, parseInt(e.target.value))}
                  className="w-4 h-4 text-blue-600 mr-3"
                />
                <div className="flex items-center space-x-3 flex-1">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

