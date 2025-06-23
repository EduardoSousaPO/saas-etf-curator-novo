'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Star, Crown, Globe, TrendingUp, User, Loader2 } from 'lucide-react';
import { PLAN_CONFIGS, SubscriptionPlan, calculateAnnualFee } from '@/types/subscriptions';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
          className={`w-full ${plan === 'PRO' ? 'bg-blue-600 hover:bg-blue-700' : 
                     plan === 'WEALTH' ? 'bg-purple-600 hover:bg-purple-700' :
                     plan === 'OFFSHORE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                     'bg-gray-600 hover:bg-gray-700'}`}
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
            className="w-full bg-green-600 hover:bg-green-700" 
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
        className={`w-full ${plan === 'PRO' ? 'bg-blue-600 hover:bg-blue-700' : 
                   plan === 'WEALTH' ? 'bg-purple-600 hover:bg-purple-700' :
                   plan === 'OFFSHORE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                   'bg-gray-600 hover:bg-gray-700'}`}
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
          <div className="text-4xl font-bold text-green-600">Gratuito</div>
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
          <div className="text-4xl font-bold text-blue-600">
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
          <div className="text-3xl font-bold text-purple-600">
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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-16">
        {/* Informações do usuário logado */}
        {user && (
          <section className="py-8 px-6 bg-blue-50 border-b">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Olá, {user.email}!
                    </h3>
                    <p className="text-sm text-gray-600">
                      {loadingSubscription ? 'Carregando plano atual...' :
                       currentSubscription ? 
                         `Plano atual: ${currentSubscription.plan} (${currentSubscription.status})` :
                         'Nenhum plano ativo'}
                    </p>
                  </div>
                </div>
                {currentSubscription && (
                  <Badge 
                    className={`${currentSubscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                currentSubscription.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}
                  >
                    {currentSubscription.status === 'ACTIVE' ? 'Ativo' :
                     currentSubscription.status === 'PENDING' ? 'Pendente' :
                     currentSubscription.status}
                  </Badge>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Hero Section - Minimalista */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-light text-gray-900 mb-6">
                Planos & Preços
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {user ? 'Gerencie sua assinatura ou faça upgrade para um plano superior.' :
                        'Escolha o plano ideal para seu perfil de investimento. Desde análises básicas até consultoria especializada.'}
              </p>
            </div>
          </div>
        </section>

        {/* Toggle de plano anual/mensal */}
        <section className="pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`font-medium ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-500'}`}>
                Mensal
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-medium ${billingCycle === 'annual' ? 'text-blue-600' : 'text-gray-500'}`}>
                Anual
              </span>
              {billingCycle === 'annual' && (
                <Badge className="bg-green-100 text-green-800">
                  Economize 20%
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Planos - Design minimalista */}
        <section className="pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Starter */}
              <Card className="relative bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center space-y-4 pb-2">
                  <div className="flex justify-center">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <Star className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-light">Starter</CardTitle>
                    <CardDescription className="text-base">Para começar sua jornada</CardDescription>
                  </div>
                  <div className="py-4">
                    {renderPrice('STARTER')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {PLAN_CONFIGS.STARTER.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {renderPlanButton('STARTER')}
                  <p className="text-xs text-center text-gray-500">
                    Sem compromisso • Ative em 30 segundos
                  </p>
                </CardContent>
              </Card>

              {/* Pro - Mais Popular */}
              <Card className="relative bg-white border-blue-200 hover:shadow-xl transition-shadow scale-105 ring-2 ring-blue-500">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1 text-sm font-medium">
                    Mais Popular
                  </Badge>
                </div>
                <CardHeader className="text-center space-y-4 pb-2">
                  <div className="flex justify-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-light">Pro</CardTitle>
                    <CardDescription className="text-base">Para investidores ativos</CardDescription>
                  </div>
                  <div className="py-4">
                    {renderPrice('PRO')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {PLAN_CONFIGS.PRO.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {renderPlanButton('PRO')}
                  <p className="text-xs text-center text-gray-500">
                    Cancele quando quiser • Garantia de 7 dias
                  </p>
                </CardContent>
              </Card>

              {/* Wealth */}
              <Card className="relative bg-white border border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center space-y-4 pb-2">
                  <div className="flex justify-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Crown className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-light">Wealth</CardTitle>
                    <CardDescription className="text-base">Consultoria personalizada</CardDescription>
                  </div>
                  <div className="py-4">
                    {renderPrice('WEALTH')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Mínimo: R$ 200.000
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {PLAN_CONFIGS.WEALTH.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wealth-assets" className="text-sm font-medium">
                      Patrimônio Total (R$)
                    </Label>
                    <Input
                      id="wealth-assets"
                      type="number"
                      placeholder="200.000"
                      value={selectedAssets.WEALTH || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setSelectedAssets(prev => ({
                          ...prev,
                          WEALTH: Math.max(value, 200000)
                        }));
                      }}
                      min={200000}
                      step={10000}
                      className="text-center"
                    />
                  </div>
                  
                  {renderPlanButton('WEALTH', selectedAssets.WEALTH)}
                  <p className="text-xs text-center text-gray-500">
                    Diagnóstico gratuito • Processo seletivo
                  </p>
                </CardContent>
              </Card>

              {/* Offshore */}
              <Card className="relative bg-white border border-emerald-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center space-y-4 pb-2">
                  <div className="flex justify-center">
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <Globe className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-light">Offshore</CardTitle>
                    <CardDescription className="text-base">Aconselhamento internacional</CardDescription>
                  </div>
                  <div className="py-4">
                    {renderPrice('OFFSHORE')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Mínimo: R$ 1.000.000
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {PLAN_CONFIGS.OFFSHORE.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="offshore-assets" className="text-sm font-medium">
                      Patrimônio Total (R$)
                    </Label>
                    <Input
                      id="offshore-assets"
                      type="number"
                      placeholder="1.000.000"
                      value={selectedAssets.OFFSHORE || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setSelectedAssets(prev => ({
                          ...prev,
                          OFFSHORE: Math.max(value, 1000000)
                        }));
                      }}
                      min={1000000}
                      step={50000}
                      className="text-center"
                    />
                  </div>
                  
                  {renderPlanButton('OFFSHORE', selectedAssets.OFFSHORE)}
                  <p className="text-xs text-center text-gray-500">
                    Aconselhamento completo • Rede de parceiros
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section - Minimalista */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-light text-center mb-12">Perguntas Frequentes</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-gray-600">Sim, você pode cancelar sua assinatura a qualquer momento. Para planos anuais, oferecemos reembolso proporcional nos primeiros 30 dias.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium mb-2">Como funciona o plano Wealth?</h3>
                <p className="text-gray-600">Após solicitar análise, nossa equipe fará um diagnóstico completo do seu perfil. Se aprovado, você terá acesso a um consultor CVM dedicado.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium mb-2">O que significa aconselhamento no plano Offshore?</h3>
                <p className="text-gray-600">Fornecemos orientação e estratégias, mas não executamos operações. Conectamos você com nossa rede de parceiros especializados para execução.</p>
              </div>
              <div className="pb-6">
                <h3 className="text-lg font-medium mb-2">Qual a diferença entre plano mensal e anual?</h3>
                <p className="text-gray-600">O plano anual oferece 20% de desconto e é cobrado uma vez por ano. Você pode cancelar a qualquer momento com reembolso proporcional.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 px-6 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> As informações apresentadas são baseadas em dados históricos e não constituem 
              recomendação de investimento. Rentabilidade passada não garante resultados futuros. 
              Consulte sempre um profissional qualificado antes de investir.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
} 