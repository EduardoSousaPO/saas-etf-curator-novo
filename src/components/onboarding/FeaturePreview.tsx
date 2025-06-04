"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Search, 
  BarChart3, 
  Bot, 
  GraduationCap,
  Sparkles,
  PlayCircle,
  ChevronRight
} from 'lucide-react';

interface FeaturePreviewProps {
  currentStep: number;
  userAnswers: Record<string, any>;
}

interface FeatureDemo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
  relevantFor: string[];
}

export default function FeaturePreview({ currentStep, userAnswers }: FeaturePreviewProps) {
  
  const features: FeatureDemo[] = [
    {
      id: 'screener',
      title: 'Screener Inteligente',
      description: 'Encontre ETFs perfeitos para seu perfil com filtros avançados',
      icon: <Search className="w-6 h-6" />,
      relevantFor: ['all'],
      preview: (
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">4.410 ETFs encontrados</h4>
            <div className="text-sm text-gray-500">Filtros aplicados: 3</div>
          </div>
          <div className="space-y-2">
            {['SCHD', 'VTI', 'VOO'].map((etf, i) => (
              <div key={etf} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{etf}</span>
                  <div className="text-xs text-gray-500">Dividend Aristocrats</div>
                </div>
                <div className="text-sm text-green-600">+12.5%</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'recommendations',
      title: 'Recomendações IA',
      description: 'Nossa IA analisa seu perfil e sugere ETFs ideais',
      icon: <Bot className="w-6 h-6" />,
      relevantFor: ['conservative', 'moderate', 'aggressive', 'beginner'],
      preview: (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-3">
            <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Recomendações para Você</span>
          </div>
          <div className="space-y-2">
            {[
              { symbol: 'VTI', reason: 'Diversificação total do mercado', confidence: 95 },
              { symbol: 'SCHD', reason: 'Dividendos consistentes', confidence: 87 },
              { symbol: 'QQQ', reason: 'Exposição a tecnologia', confidence: 78 }
            ].map((rec, i) => (
              <div key={rec.symbol} className="bg-white p-2 rounded border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{rec.symbol}</span>
                  <span className="text-xs text-green-600">{rec.confidence}% match</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{rec.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'simulator',
      title: 'Simulador de Carteira',
      description: 'Teste diferentes alocações antes de investir',
      icon: <BarChart3 className="w-6 h-6" />,
      relevantFor: ['moderate', 'aggressive', 'experienced'],
      preview: (
        <div className="bg-white rounded-lg p-4 border">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Carteira Simulada</span>
              <span className="text-xs text-gray-500">Retorno Esperado: +8.5%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div className="bg-blue-600 flex-1"></div>
                <div className="bg-green-600 flex-1"></div>
                <div className="bg-purple-600 flex-1"></div>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                VTI (40%)
              </span>
              <span className="text-gray-600">$4,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                SCHD (35%)
              </span>
              <span className="text-gray-600">$3,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                VXUS (25%)
              </span>
              <span className="text-gray-600">$2,500</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'comparator',
      title: 'Comparador Avançado',
      description: 'Compare ETFs lado a lado com análise detalhada',
      icon: <TrendingUp className="w-6 h-6" />,
      relevantFor: ['experienced', 'aggressive'],
      preview: (
        <div className="bg-white rounded-lg p-4 border">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center">
              <div className="font-medium">VTI</div>
              <div className="text-xs text-gray-500">Total Stock Market</div>
            </div>
            <div className="text-center">
              <div className="font-medium">VOO</div>
              <div className="text-xs text-gray-500">S&P 500</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Retorno 12m</span>
              <div className="flex gap-2">
                <span className="text-green-600">+11.2%</span>
                <span className="text-green-600">+10.8%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Expense Ratio</span>
              <div className="flex gap-2">
                <span>0.03%</span>
                <span>0.03%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Dividend Yield</span>
              <div className="flex gap-2">
                <span>1.8%</span>
                <span>1.6%</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'coaching',
      title: 'Coaching IA',
      description: 'Aprenda com lições personalizadas para seu nível',
      icon: <GraduationCap className="w-6 h-6" />,
      relevantFor: ['beginner', 'conservative'],
      preview: (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-3">
            <GraduationCap className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Sua Jornada de Aprendizado</span>
          </div>
          <div className="space-y-2">
            <div className="bg-white p-2 rounded border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ETFs Básicos</span>
                <span className="text-xs text-green-600">60% completo</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-full bg-green-200 rounded-full h-1 mr-2">
                  <div className="bg-green-600 h-1 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <PlayCircle className="w-3 h-3 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-2 rounded border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm">Gestão de Risco</span>
                <span className="text-xs text-gray-400">Próximo</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Determinar quais features mostrar baseado nas respostas do usuário
  const getRelevantFeatures = (): FeatureDemo[] => {
    const userProfile = userAnswers.riskTolerance || 'moderate';
    const userExperience = userAnswers.experience || 'beginner';
    
    return features.filter(feature => 
      feature.relevantFor.includes('all') || 
      feature.relevantFor.includes(userProfile) ||
      feature.relevantFor.includes(userExperience)
    ).slice(0, 3); // Mostrar no máximo 3 features
  };

  const relevantFeatures = getRelevantFeatures();

  if (currentStep < 3 || relevantFeatures.length === 0) {
    return null; // Não mostrar preview nos primeiros passos
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center mb-4">
        <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Ferramentas Perfeitas para Você
        </h3>
      </div>
      
      <p className="text-gray-600 text-sm mb-6">
        Baseado no seu perfil, essas são as funcionalidades que mais vão te ajudar:
      </p>

      <div className="space-y-6">
        {relevantFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                {feature.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                {feature.preview}
              </div>
            </div>
            
            {index < relevantFeatures.length - 1 && (
              <div className="mt-6 border-b border-gray-100"></div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Pronto para começar?
            </p>
            <p className="text-xs text-blue-700">
              Complete o onboarding e acesse todas essas ferramentas
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </motion.div>
  );
} 