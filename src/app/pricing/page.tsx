// src/app/pricing/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  Check, 
  Star, 
  Crown, 
  Building2,
  Loader2,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    etf_alerts: number;
    portfolios: number;
    ai_queries_daily: number;
    advanced_analytics: boolean;
    email_notifications: boolean;
    api_access: boolean;
  };
}

interface UserUsage {
  alerts_used: number;
  portfolios_used: number;
  ai_queries_today: number;
  last_updated: Date;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // Mock user ID - em produção, pegar do sistema de autenticação
  const userId = "user-123";

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      const response = await fetch(`/api/payments/create-subscription?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
        setActivePlan(data.active_plan);
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de pricing:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = async (planId: string) => {
    if (activePlan?.id === planId) {
      toast.success('Este já é seu plano atual');
      return;
    }

    setProcessingPlan(planId);
    
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plan_id: planId,
          payment_method: 'card'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadPricingData(); // Recarregar dados
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Falha ao processar assinatura');
      }
    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatLimit = (value: number): string => {
    return value === -1 ? 'Ilimitado' : value.toString();
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Star className="w-6 h-6" />;
      case 'pro': return <Crown className="w-6 h-6" />;
      case 'enterprise': return <Building2 className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'border-gray-200 bg-white';
      case 'pro': return 'border-blue-500 bg-blue-50 relative';
      case 'enterprise': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha seu Plano
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desbloqueie todo o potencial do ETF Curator com análises avançadas, 
              alertas ilimitados e recursos premium
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Current Usage */}
        {usage && activePlan && (
          <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seu Uso Atual</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {usage.alerts_used} / {formatLimit(activePlan.limits.etf_alerts)}
                </div>
                <div className="text-sm text-gray-600">Alertas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {usage.portfolios_used} / {formatLimit(activePlan.limits.portfolios)}
                </div>
                <div className="text-sm text-gray-600">Portfolios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {usage.ai_queries_today} / {formatLimit(activePlan.limits.ai_queries_daily)}
                </div>
                <div className="text-sm text-gray-600">Consultas AI Hoje</div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border-2 p-8 ${getPlanColor(plan.id)}`}
            >
              {/* Popular Badge */}
              {plan.id === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  plan.id === 'free' ? 'bg-gray-100 text-gray-600' :
                  plan.id === 'pro' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600">/{plan.interval === 'monthly' ? 'mês' : 'ano'}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Limits */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Limites</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alertas:</span>
                    <span className="font-medium">{formatLimit(plan.limits.etf_alerts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Portfolios:</span>
                    <span className="font-medium">{formatLimit(plan.limits.portfolios)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultas AI/dia:</span>
                    <span className="font-medium">{formatLimit(plan.limits.ai_queries_daily)}</span>
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className={`w-4 h-4 ${plan.limits.advanced_analytics ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.limits.advanced_analytics ? 'text-gray-700' : 'text-gray-400'}`}>
                    Analytics Avançadas
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className={`w-4 h-4 ${plan.limits.email_notifications ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.limits.email_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                    Notificações Email
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className={`w-4 h-4 ${plan.limits.api_access ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${plan.limits.api_access ? 'text-gray-700' : 'text-gray-400'}`}>
                    Acesso à API
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => selectPlan(plan.id)}
                disabled={activePlan?.id === plan.id || processingPlan === plan.id}
                className={`w-full py-3 ${
                  activePlan?.id === plan.id
                    ? 'bg-green-600 hover:bg-green-700'
                    : plan.id === 'pro'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : plan.id === 'enterprise'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {processingPlan === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : activePlan?.id === plan.id ? (
                  'Plano Atual'
                ) : plan.id === 'free' ? (
                  'Começar Grátis'
                ) : (
                  'Assinar Agora'
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso mudar de plano a qualquer momento?
              </h3>
              <p className="text-gray-600 text-sm">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As mudanças são aplicadas imediatamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                O que acontece se exceder os limites?
              </h3>
              <p className="text-gray-600 text-sm">
                Você será notificado quando se aproximar dos limites. Para continuar usando 
                as funcionalidades, será necessário fazer upgrade do plano.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Os dados são atualizados em tempo real?
              </h3>
              <p className="text-gray-600 text-sm">
                Sim, todos os planos incluem acesso aos dados em tempo real de mais de 3.120 ETFs, 
                com 255+ ETFs tendo dados premium enriquecidos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Existe garantia de reembolso?
              </h3>
              <p className="text-gray-600 text-sm">
                Oferecemos garantia de 30 dias para todos os planos pagos. 
                Se não estiver satisfeito, reembolsamos 100% do valor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

