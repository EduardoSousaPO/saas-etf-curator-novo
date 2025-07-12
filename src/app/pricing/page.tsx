'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Star, Crown, Globe, TrendingUp, User, Loader2, Shield, Zap, Target, Users } from 'lucide-react';
import { PLAN_CONFIGS, SubscriptionPlan, calculateAnnualFee } from '@/types/subscriptions';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import RequireAuth from '@/components/auth/RequireAuth';
import { PricingPlans } from '@/components/subscriptions/PricingPlans';
import { CheckCircle, Award } from 'lucide-react';

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedAssets, setSelectedAssets] = useState<Record<string, number>>({
    WEALTH: 200000,
    OFFSHORE: 1000000
  });
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Carregar assinatura atual do usuário
  useEffect(() => {
    if (user && !authLoading) {
      loadCurrentSubscription();
    }
  }, [user, authLoading]);

  const loadCurrentSubscription = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingSubscription(true);
      const response = await fetch(`/api/subscriptions/status?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentSubscription(data.data.subscription);
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(planId);
    
    try {
      console.log(`🚀 Iniciando upgrade para plano: ${planId}`);
      console.log('User ID:', user.id);

      const requestData = {
        planId: planId.toUpperCase(),
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || user.email
      };

      console.log('📤 Enviando dados:', requestData);

      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('📥 Resposta recebida:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        // Processar baseado no tipo de resposta
        switch (data.type) {
          case 'immediate':
            // Plano gratuito ativado imediatamente
            const immediateMessage = data.upgrade 
              ? `🎉 ${data.message} Seu plano foi alterado com sucesso!`
              : data.message || 'Plano ativado com sucesso!';
            toast.success(immediateMessage);
            setTimeout(() => router.push('/dashboard'), 1500);
            break;

          case 'contact':
            // Planos que precisam de contato
            const contactMessage = data.upgrade
              ? `📞 ${data.message} Nossa equipe entrará em contato em breve.`
              : data.message;
            toast.success(contactMessage);
            if (data.redirectUrl) {
              setTimeout(() => router.push(data.redirectUrl), 2000);
            }
            break;

          case 'payment':
            // Planos pagos - redirecionar para checkout
            const paymentMessage = data.upgrade
              ? `💳 ${data.message} Finalize o pagamento para confirmar o upgrade.`
              : data.message || 'Redirecionando para pagamento...';
            toast.success(paymentMessage);
            if (data.checkoutUrl) {
              setTimeout(() => window.location.href = data.checkoutUrl, 1500);
            } else {
              throw new Error('URL de checkout não fornecida');
            }
            break;

          default:
            // Fallback para compatibilidade
            if (data.checkout_url) {
              window.location.href = data.checkout_url;
            } else if (data.redirect) {
              router.push(data.redirect);
            } else {
              toast.success(data.message || 'Operação realizada com sucesso!');
              router.push('/dashboard');
            }
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }

    } catch (error: any) {
      console.error('❌ Erro no upgrade:', error);
      
      // Mensagens de erro específicas
      let errorMessage = 'Erro ao processar solicitação';
      
      if (error.message.includes('409') || error.message.includes('já possui')) {
        errorMessage = `⚠️ ${error.message}`;
      } else if (error.message.includes('400')) {
        errorMessage = '❌ Dados inválidos fornecidos';
      } else if (error.message.includes('503')) {
        errorMessage = '🔧 Serviço de pagamento temporariamente indisponível. Tente novamente em alguns minutos.';
      } else if (error.message.includes('500')) {
        errorMessage = '⚠️ Erro interno do servidor. Nossa equipe foi notificada.';
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  // Função para renderizar botão baseado no estado do usuário
  const renderPlanButton = (plan: SubscriptionPlan, assets?: number) => {
    const config = PLAN_CONFIGS[plan];
    const isCurrentPlan = currentSubscription?.plan === plan;
    const isActive = currentSubscription?.status === 'ACTIVE';
    const isProcessing = processingPlan === plan;
    
    // Se não está logado
    if (!user) {
      return (
        <Button 
          className={`w-full font-semibold ${plan === 'PRO' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                     plan === 'WEALTH' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                     plan === 'OFFSHORE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                     'bg-gray-800 hover:bg-gray-900 text-white'}`}
          size="lg"
          onClick={() => handleUpgrade(plan)}
          disabled={isProcessing}
        >
          {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {plan === 'STARTER' ? 'Começar Grátis' :
           plan === 'PRO' ? (billingCycle === 'annual' ? 'Assinar Pro Anual' : 'Assinar Pro') :
           plan === 'WEALTH' ? 'Solicitar Análise' :
           'Solicitar Contato'}
        </Button>
      );
    }

    // Se é o plano atual e está ativo
    if (isCurrentPlan && isActive) {
      return (
        <div className="space-y-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" 
            size="lg"
            disabled
          >
            ✓ Plano Atual
          </Button>
          <p className="text-xs text-center text-green-600 font-medium">
            Você já possui este plano
          </p>
        </div>
      );
    }

    // Se está logado mas não tem este plano
    return (
      <Button 
        className={`w-full font-semibold ${plan === 'PRO' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                   plan === 'WEALTH' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                   plan === 'OFFSHORE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                   'bg-gray-800 hover:bg-gray-900 text-white'}`}
        size="lg"
        onClick={() => handleUpgrade(plan)}
        disabled={isProcessing}
      >
        {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {plan === 'STARTER' ? 'Mudar para Starter' :
         plan === 'PRO' ? 'Fazer Upgrade para Pro' :
         plan === 'WEALTH' ? 'Fazer Upgrade para Wealth' :
         'Fazer Upgrade para Offshore'}
      </Button>
    );
  };

  // Renderização de preços com desconto anual
  const renderPrice = (plan: SubscriptionPlan) => {
    const config = PLAN_CONFIGS[plan];
    
    if (config.priceType === 'free') {
      return (
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">Gratuito</div>
          <div className="text-sm text-gray-500 mt-1">Para sempre</div>
        </div>
      );
    }
    
    if (config.priceType === 'monthly' && plan === 'PRO') {
      const monthlyPrice = config.price || 0;
      const annualPrice = monthlyPrice * 12 * 0.8; // 20% desconto
      const currentPrice = billingCycle === 'annual' ? annualPrice / 12 : monthlyPrice;
      
      return (
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            R$ {currentPrice.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-sm text-gray-500">
            {billingCycle === 'annual' ? '/mês (cobrado anualmente)' : '/mês'}
          </div>
          {billingCycle === 'annual' && (
            <div className="text-sm text-green-600 font-medium mt-1">
              Economize R$ {(monthlyPrice * 12 - annualPrice).toFixed(2).replace('.', ',')} por ano!
            </div>
          )}
        </div>
      );
    }
    
    if (config.priceType === 'fee_based') {
      const assets = selectedAssets[plan] || config.minimumAssets || 0;
      const annualFee = calculateAnnualFee(plan, assets);
      const monthlyFee = annualFee / 12;
      
      return (
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {config.feePercentage}% a.a.
          </div>
          <div className="text-sm text-gray-600 mt-2">
            sobre patrimônio
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ex: R$ {assets.toLocaleString('pt-BR')} = R$ {monthlyFee.toFixed(2).replace('.', ',')}/mês
          </div>
        </div>
      );
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          
          {/* Hero Section */}
          <div className="text-center mb-20">
            <Badge className="mb-8 px-6 py-2 bg-gray-900 text-white font-light rounded-full">
              Planos Premium
            </Badge>
            <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-8 leading-tight">
              Invista com
              <span className="block text-blue-600">Inteligência</span>
            </h1>
            <p className="text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Acesso completo às ferramentas profissionais de análise e curadoria de ETFs. 
              Transforme sua estratégia de investimento com dados precisos e insights avançados.
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="mb-20">
            <PricingPlans />
          </div>

          {/* Features Comparison */}
          <div className="mb-20">
            <h2 className="text-4xl font-light text-gray-900 text-center mb-16">
              Compare os Recursos
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-8 font-light text-gray-900 text-lg">Recursos</th>
                      <th className="text-center p-8 font-light text-gray-600 text-lg">Gratuito</th>
                      <th className="text-center p-8 font-light text-gray-600 text-lg bg-gray-50">Premium</th>
                      <th className="text-center p-8 font-light text-gray-600 text-lg">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Análise Básica de ETFs</td>
                      <td className="text-center p-8">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-8 bg-gray-50">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-8">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Portfolio Master</td>
                      <td className="text-center p-8">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8 bg-gray-50">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-8">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Simulador Avançado</td>
                      <td className="text-center p-8">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8 bg-gray-50">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-8">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Alertas Personalizados</td>
                      <td className="text-center p-8">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8 bg-gray-50">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-8 font-light text-gray-900">Consultoria CVM</td>
                      <td className="text-center p-8">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8 bg-gray-50">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-8 font-light text-gray-900">Suporte Prioritário</td>
                      <td className="text-center p-8">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8 bg-gray-50">
                        <span className="text-gray-400">—</span>
                      </td>
                      <td className="text-center p-8">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mb-20">
            <h2 className="text-4xl font-light text-gray-900 text-center mb-16">
                              Por que Escolher o Vista?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-300 hover:shadow-md">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Performance Superior</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Algoritmos avançados de otimização baseados na Teoria de Markowitz
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-300 hover:shadow-md">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Gestão de Risco</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Análise detalhada de volatilidade e correlações para proteção do capital
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-300 hover:shadow-md">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Diversificação Global</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Acesso a mais de 1.370 ETFs globais com análise completa
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-300 hover:shadow-md">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Consultoria CVM</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Assessoria profissional certificada pela Comissão de Valores Mobiliários
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-20">
            <h2 className="text-4xl font-light text-gray-900 text-center mb-16">
              Confiado por Investidores
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 font-light mb-6 leading-relaxed">
                  "O Portfolio Master revolucionou minha estratégia de investimento. 
                  Consegui otimizar minha carteira e reduzir riscos significativamente."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-light text-gray-900">Maria Silva</p>
                    <p className="text-sm text-gray-500">Investidora Premium</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 font-light mb-6 leading-relaxed">
                  "Dados precisos e análises profissionais. A plataforma me ajudou 
                  a tomar decisões mais informadas e melhorar meus resultados."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-light text-gray-900">João Santos</p>
                    <p className="text-sm text-gray-500">Investidor Pro</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 font-light mb-6 leading-relaxed">
                  "Interface limpa e funcionalidades avançadas. O simulador de Monte Carlo 
                  é uma ferramenta incrível para projeções de longo prazo."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-light text-gray-900">Ana Costa</p>
                    <p className="text-sm text-gray-500">Investidora Premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-4xl font-light text-gray-900 text-center mb-16">
              Perguntas Frequentes
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Como funciona o período de teste?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Oferecemos 7 dias gratuitos para testar todas as funcionalidades premium. 
                  Cancele a qualquer momento sem compromisso.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Posso cancelar minha assinatura?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Sim, você pode cancelar sua assinatura a qualquer momento através do seu painel 
                  de controle. Não há taxas de cancelamento.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Os dados são atualizados em tempo real?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Nossos dados são atualizados diariamente após o fechamento do mercado. 
                  Preços intraday estão disponíveis para assinantes Pro.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Como funciona a consultoria CVM?
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Nossos consultores certificados pela CVM oferecem assessoria personalizada 
                  para otimizar sua estratégia de investimento em ETFs.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="bg-gray-900 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-light text-white mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl font-light text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de investidores que já transformaram suas carteiras 
                              com o Vista.
            </p>
            <button className="bg-white text-gray-900 px-12 py-4 rounded-xl font-light text-lg transition-all duration-300 hover:bg-gray-100">
              Começar Teste Gratuito
            </button>
          </div>

        </div>
      </div>
    </RequireAuth>
  );
} 