"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  RotateCcw,
  ArrowRight,
  Star,
  Target
} from 'lucide-react';
import { Quiz as QuizType, Question, LearningProgress } from '@/lib/learning/content';

interface QuizProps {
  quiz: QuizType;
  courseId: string;
  onComplete: (score: number, passed: boolean) => void;
  onRetake?: () => void;
}

interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

export default function Quiz({ quiz, courseId, onComplete, onRetake }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [dragItems, setDragItems] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    // Timer opcional de 30 segundos por questão
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (currentQuestion?.type === 'drag_drop' && currentQuestion.options) {
      setDragItems([...currentQuestion.options].sort(() => Math.random() - 0.5));
    }
  }, [currentQuestion]);

  const handleAnswer = (answer: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (!showExplanation) {
      // Mostrar explicação primeiro
      setShowExplanation(true);
      return;
    }

    // Avaliar resposta
    const userAnswer = userAnswers[currentQuestion.id];
    const isCorrect = checkAnswer(currentQuestion, userAnswer);
    
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer: userAnswer || '',
      isCorrect,
      points: isCorrect ? currentQuestion.points : 0
    };

    setAnswers(prev => [...prev, answer]);

    if (isLastQuestion) {
      // Calcular resultado final
      const totalPoints = [...answers, answer].reduce((sum, a) => sum + a.points, 0);
      const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const score = Math.round((totalPoints / maxPoints) * 100);
      const passed = score >= quiz.passingScore;
      
      // Salvar progresso
      LearningProgress.completeQuiz('demo_user', courseId, score);
      
      setShowResults(true);
      onComplete(score, passed);
    } else {
      // Próxima questão
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
      setTimeLeft(30); // Reset timer
    }
  };

  const checkAnswer = (question: Question, userAnswer: string | string[]): boolean => {
    if (!userAnswer) return false;

    if (question.type === 'drag_drop') {
      const correct = question.correctAnswer as string[];
      const user = userAnswer as string[];
      return JSON.stringify(correct) === JSON.stringify(user);
    }

    if (Array.isArray(question.correctAnswer)) {
      const user = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      return question.correctAnswer.every(ans => user.includes(ans));
    }

    return question.correctAnswer === userAnswer;
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setUserAnswers({});
    setShowResults(false);
    setShowExplanation(false);
    setTimeLeft(30);
    onRetake?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const totalPoints = answers.reduce((sum, a) => sum + a.points, 0);
    const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const score = Math.round((totalPoints / maxPoints) * 100);
    const passed = score >= quiz.passingScore;
    const correctAnswers = answers.filter(a => a.isCorrect).length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <Award className="w-10 h-10 text-green-600" />
            ) : (
              <Target className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h2 className={`text-2xl font-bold mb-2 ${
            passed ? 'text-green-600' : 'text-red-600'
          }`}>
            {passed ? 'Parabéns! Você passou!' : 'Não foi dessa vez...'}
          </h2>

          <div className="mb-6">
            <div className={`text-4xl font-bold mb-2 ${
              passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {score}%
            </div>
            <p className="text-gray-600">
              {correctAnswers} de {totalQuestions} questões corretas
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Necessário: {quiz.passingScore}% para aprovação
            </p>
          </div>

          {/* Breakdown das questões */}
          <div className="mb-6 space-y-3">
            {quiz.questions.map((question, index) => {
              const answer = answers[index];
              return (
                <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Questão {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    {answer?.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {answer?.points || 0}/{question.points}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ações */}
          <div className="flex justify-center space-x-4">
            {!passed && quiz.retakeAllowed && (
              <button
                onClick={handleRetake}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>
            )}
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar ao Curso
            </button>
          </div>

          {passed && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <Star className="w-5 h-5" />
                <span className="font-medium">Você ganhou {totalPoints} pontos!</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quiz</h2>
            <p className="text-gray-600">
              Questão {currentQuestionIndex + 1} de {totalQuestions}
            </p>
          </div>
          
          {timeLeft !== null && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h3>

        {/* Question Type Rendering */}
        <div className="mb-8">
          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    userAnswers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {userAnswers[currentQuestion.id] === option && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`p-6 border rounded-lg transition-colors ${
                    userAnswers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {option === 'Verdadeiro' ? '✅' : '❌'}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'fill_blank' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Digite sua resposta..."
                value={(userAnswers[currentQuestion.id] as string) || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {currentQuestion.type === 'drag_drop' && (
            <DragDropQuestion
              question={currentQuestion}
              items={dragItems}
              onAnswer={handleAnswer}
              currentAnswer={userAnswers[currentQuestion.id] as string[]}
            />
          )}
        </div>

        {/* Explanation (shown after answering) */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  checkAnswer(currentQuestion, userAnswers[currentQuestion.id])
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {checkAnswer(currentQuestion, userAnswers[currentQuestion.id]) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    {checkAnswer(currentQuestion, userAnswers[currentQuestion.id]) 
                      ? 'Correto!' 
                      : 'Incorreto'}
                  </h4>
                  <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {currentQuestion.points} {currentQuestion.points === 1 ? 'ponto' : 'pontos'}
          </div>
          
          <button
            onClick={handleNext}
            disabled={!userAnswers[currentQuestion.id]}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>
              {showExplanation 
                ? (isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão')
                : 'Confirmar Resposta'
              }
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Componente para questões de arrastar e soltar
function DragDropQuestion({ 
  question, 
  items, 
  onAnswer, 
  currentAnswer 
}: {
  question: Question;
  items: string[];
  onAnswer: (answer: string[]) => void;
  currentAnswer?: string[];
}) {
  const [orderedItems, setOrderedItems] = useState<string[]>(currentAnswer || []);
  const [availableItems, setAvailableItems] = useState<string[]>(
    items.filter(item => !currentAnswer?.includes(item))
  );

  const handleDrop = (item: string, index: number) => {
    const newOrdered = [...orderedItems];
    newOrdered.splice(index, 0, item);
    
    setOrderedItems(newOrdered);
    setAvailableItems(prev => prev.filter(i => i !== item));
    onAnswer(newOrdered);
  };

  const handleRemove = (item: string, index: number) => {
    const newOrdered = orderedItems.filter((_, i) => i !== index);
    setOrderedItems(newOrdered);
    setAvailableItems(prev => [...prev, item]);
    onAnswer(newOrdered);
  };

  return (
    <div className="space-y-6">
      {/* Available Items */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Itens disponíveis:</h4>
        <div className="flex flex-wrap gap-2">
          {availableItems.map((item, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg cursor-move hover:bg-blue-200 transition-colors"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Organize na ordem correta:</h4>
        <div className="space-y-2">
          {Array.from({ length: question.options?.length || 4 }).map((_, index) => (
            <div
              key={index}
              className="h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center px-4 hover:border-blue-400 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const item = e.dataTransfer.getData('text/plain');
                if (item && !orderedItems[index]) {
                  handleDrop(item, index);
                }
              }}
            >
              {orderedItems[index] ? (
                <div
                  className="px-3 py-1 bg-green-100 text-green-800 rounded cursor-pointer"
                  onClick={() => handleRemove(orderedItems[index], index)}
                >
                  {orderedItems[index]} ✕
                </div>
              ) : (
                <span className="text-gray-400">Solte aqui... (posição {index + 1})</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 