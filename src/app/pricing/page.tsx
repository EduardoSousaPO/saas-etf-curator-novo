'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Star, Crown, Globe, TrendingUp } from 'lucide-react';
import { PLAN_CONFIGS, SubscriptionPlan, calculateAnnualFee } from '@/types/subscriptions';

const handleSelectPlan = async (plan: SubscriptionPlan, assets?: number) => {
  try {
    // Verificar se o usuário está autenticado
    const authResponse = await fetch('/api/auth/status');
    const authData = await authResponse.json();
    
    if (!authData.success || !authData.session) {
      alert('Você precisa estar logado para assinar um plano. Redirecionando para login...');
      window.location.href = '/auth/login';
      return;
    }

    const response = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        planId: plan, 
        userId: authData.session.user_id,
        assetsUnderManagement: assets,
        userEmail: authData.session.email,
        userName: authData.session.email // Usar email como nome por enquanto
      })
    });

    const data = await response.json();
    
    if (data.success && data.checkout_url) {
      window.location.href = data.checkout_url;
    } else if (data.success && data.redirect) {
      window.location.href = data.redirect;
    } else if (data.success && data.message) {
      alert(data.message);
    } else {
      throw new Error(data.error || 'Erro ao processar plano');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao processar solicitação. Tente novamente.');
  }
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedAssets, setSelectedAssets] = useState<Record<string, number>>({
    WEALTH: 200000,
    OFFSHORE: 1000000
  });

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
        {/* Hero Section - Minimalista */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-light text-gray-900 mb-6">
                Planos & Preços
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Escolha o plano ideal para seu perfil de investimento. 
                Desde análises básicas até consultoria especializada.
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
                  <Button 
                    className="w-full bg-gray-600 hover:bg-gray-700" 
                    size="lg"
                    onClick={() => handleSelectPlan('STARTER')}
                  >
                    Começar Grátis
                  </Button>
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
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    onClick={() => handleSelectPlan('PRO')}
                  >
                    {billingCycle === 'annual' ? 'Assinar Pro Anual' : 'Assinar Pro'}
                  </Button>
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
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    size="lg"
                    onClick={() => handleSelectPlan('WEALTH', selectedAssets.WEALTH)}
                  >
                    Solicitar Análise
                  </Button>
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
                  
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    size="lg"
                    onClick={() => handleSelectPlan('OFFSHORE', selectedAssets.OFFSHORE)}
                  >
                    Solicitar Contato
                  </Button>
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