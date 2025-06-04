"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Shield, 
  Brain,
  Lightbulb,
  Settings
} from 'lucide-react';
import { ProfileAssessment } from '@/lib/onboarding/profiles';
import ContextualGlossary from '@/components/ui/ContextualGlossary';

interface ProfileResultProps {
  assessment: ProfileAssessment;
  onContinue: () => void;
}

export default function ProfileResult({ assessment, onContinue }: ProfileResultProps) {
  const router = useRouter();
  const { profile, confidence, recommendations, nextSteps } = assessment;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Muito Alta';
    if (confidence >= 0.8) return 'Alta';
    return 'Moderada';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header de Sucesso */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Perfil Identificado!</h1>
          <p className="text-green-100">
            Analisamos suas respostas e criamos um perfil personalizado para você.
          </p>
        </div>

        <div className="p-8">
          {/* Perfil Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full text-4xl mb-4">
              {profile.icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
            <div className="text-xl text-gray-600 mb-4">
              <ContextualGlossary>{profile.description}</ContextualGlossary>
            </div>
            
            {/* Confiança do Assessment */}
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm text-gray-700">
                Confiança: <span className={`font-semibold ${getConfidenceColor(confidence)}`}>
                  {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
                </span>
              </span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Características do Perfil */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Características do seu perfil</h3>
                </div>
                <ul className="space-y-3">
                  {profile.characteristics.map((characteristic, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <ContextualGlossary>{characteristic}</ContextualGlossary>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Categorias recomendadas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredCategories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      <ContextualGlossary>{category}</ContextualGlossary>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recomendações */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center mb-4">
                  <Brain className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Recomendações personalizadas</h3>
                </div>
                <ul className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <ContextualGlossary>{recommendation}</ContextualGlossary>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Settings className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Recursos recomendados</h3>
                </div>
                <div className="space-y-2">
                  {profile.recommendedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">
                        <ContextualGlossary>{feature}</ContextualGlossary>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Próximos Passos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              🚀 Próximos passos recomendados
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onContinue}
              className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Começar a usar ETF Curator
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button
              onClick={() => router.push('/comparator')}
              className="flex items-center justify-center px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200"
            >
              Explorar Comparador
            </button>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              💡 Seu perfil foi salvo automaticamente e você pode alterá-lo a qualquer momento nas configurações.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 