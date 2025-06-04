"use client";

import { TrendingUp, Shield, Zap, BarChart3, Target, Brain } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Rankings Inteligentes",
    description: "Classificações automáticas baseadas em performance, risco e qualidade dos ETFs.",
  },
  {
    icon: Shield,
    title: "Análise de Riscos",
    description: "Avaliação completa de volatilidade, drawdown e correlações para decisões seguras.",
  },
  {
    icon: Brain,
    title: "IA Avançada",
    description: "Algoritmos de machine learning para identificar tendências e oportunidades.",
  },
  {
    icon: BarChart3,
    title: "Comparação Detalhada",
    description: "Compare múltiplos ETFs lado a lado com métricas detalhadas e visualizações.",
  },
  {
    icon: Target,
    title: "Screener Preciso",
    description: "Filtre ETFs por dezenas de critérios para encontrar exatamente o que procura.",
  },
  {
    icon: Zap,
    title: "Dados em Tempo Real",
    description: "Informações atualizadas continuamente para decisões baseadas em dados frescos.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">
            Tecnologia Avançada
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-light">
            Ferramentas poderosas para análise profissional de ETFs, 
            desenvolvidas para investidores que buscam precisão e eficiência.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-white dark:group-hover:text-black transition-colors duration-300" />
                </div>
              </div>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-light">Sistema operacional 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
} 