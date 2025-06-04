import { useState } from 'react';
import { Check, Star, Loader2 } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  period: string;
  recommended?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan: (planId: string) => Promise<void>;
}

export default function PricingCard({ plan, onSelectPlan }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async () => {
    setIsLoading(true);
    try {
      await onSelectPlan(plan.id);
    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative rounded-2xl p-8 shadow-lg transition-all duration-200 hover:shadow-xl ${
      plan.recommended 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 scale-105' 
        : 'bg-white border border-gray-200 hover:border-blue-300'
    }`}>
      {plan.recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Mais Popular
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className={`text-2xl font-bold mb-2 ${
          plan.recommended ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {plan.name}
        </h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        
        <div className="flex items-baseline justify-center">
          <span className="text-sm text-gray-500">R$</span>
          <span className={`text-4xl font-bold mx-1 ${
            plan.recommended ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {plan.price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-gray-500">/ mês</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <Check className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
              plan.recommended ? 'text-blue-600' : 'text-green-500'
            }`} />
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleSelectPlan}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
          plan.recommended
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          'Assinar Agora'
        )}
      </button>

      {plan.recommended && (
        <div className="mt-4 text-center">
          <p className="text-xs text-blue-600 font-medium">
            💰 Melhor custo-benefício
          </p>
        </div>
      )}
    </div>
  );
} 