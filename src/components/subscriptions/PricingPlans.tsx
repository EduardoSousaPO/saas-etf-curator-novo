'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Star, Crown, Globe } from 'lucide-react';
import { PLAN_CONFIGS, SubscriptionPlan, calculateAnnualFee } from '@/types/subscriptions';
import { useSubscription, usePlanCheck } from '@/hooks/useSubscription';
import { formatCurrency } from '@/lib/formatters';

interface PricingPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan, assetsUnderManagement?: number) => void;
  showCurrentPlan?: boolean;
}

const planIcons = {
  STARTER: <Star className="w-6 h-6" />,
  PRO: <Check className="w-6 h-6" />,
  WEALTH: <Crown className="w-6 h-6" />,
  OFFSHORE: <Globe className="w-6 h-6" />
};

const planColors = {
  STARTER: 'bg-gray-50 border-gray-200',
  PRO: 'bg-blue-50 border-blue-200',
  WEALTH: 'bg-purple-50 border-purple-200',
  OFFSHORE: 'bg-emerald-50 border-emerald-200'
};

const planBadgeColors = {
  STARTER: 'bg-gray-100 text-gray-800',
  PRO: 'bg-blue-100 text-blue-800',
  WEALTH: 'bg-purple-100 text-purple-800',
  OFFSHORE: 'bg-emerald-100 text-emerald-800'
};

export function PricingPlans({ onSelectPlan, showCurrentPlan = true }: PricingPlansProps) {
  const { currentPlan, loading } = useSubscription();
  const { isPaid } = usePlanCheck();
  const [selectedAssets, setSelectedAssets] = useState<Record<string, number>>({
    WEALTH: 500000,
    OFFSHORE: 2000000
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (onSelectPlan) {
      // Para planos fee-based, usar o valor selecionado pelo usuário
      const assets = plan === 'WEALTH' || plan === 'OFFSHORE' ? selectedAssets[plan] : undefined;
      onSelectPlan(plan, assets);
    }
  };

  const renderPrice = (plan: SubscriptionPlan) => {
    const config = PLAN_CONFIGS[plan];
    
    if (config.priceType === 'free') {
      return (
        <div className="text-3xl font-bold text-green-600">
          Gratuito
        </div>
      );
    }
    
    if (config.priceType === 'monthly') {
      return (
        <div className="text-3xl font-bold">
          {formatCurrency(config.price || 0)}
          <span className="text-lg font-normal text-gray-600">/mês</span>
        </div>
      );
    }
    
    if (config.priceType === 'fee_based') {
      const assets = selectedAssets[plan] || config.minimumAssets || 0;
      const annualFee = calculateAnnualFee(plan, assets);
      const monthlyFee = annualFee / 12;
      
      return (
        <div className="space-y-2">
          <div className="text-2xl font-bold text-purple-600">
            {config.feePercentage}% a.a.
          </div>
          <div className="text-sm text-gray-600">
            Exemplo: {formatCurrency(assets)} = {formatCurrency(monthlyFee)}/mês
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-full"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Título da seção */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Escolha seu plano</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Desde análises básicas até aconselhamento especializado em estruturação offshore
        </p>
        <div className="flex justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="/pricing">Ver Comparação Completa →</a>
          </Button>
        </div>
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(PLAN_CONFIGS).map(([planKey, config]) => {
          const plan = planKey as SubscriptionPlan;
          const isCurrentPlan = currentPlan === plan;
          const isPopular = plan === 'PRO';
          
          return (
            <Card 
              key={plan} 
              className={`relative ${planColors[plan]} ${
                isCurrentPlan ? 'ring-2 ring-blue-500' : ''
              } ${isPopular ? 'scale-105 shadow-lg' : ''}`}
            >
              {/* Badge de plano popular */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              {/* Badge de plano atual */}
              {isCurrentPlan && showCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className={planBadgeColors[plan]}>
                    Atual
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  {planIcons[plan]}
                </div>
                
                <div>
                  <CardTitle className="text-xl font-bold">
                    {config.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {config.description}
                  </CardDescription>
                </div>

                {/* Preço */}
                <div className="py-4">
                  {renderPrice(plan)}
                </div>

                {/* Patrimônio mínimo para planos fee-based */}
                {config.minimumAssets && (
                  <div className="text-sm text-gray-600">
                    Mínimo: {formatCurrency(config.minimumAssets)}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Lista de features */}
                <div className="space-y-3">
                  {config.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitações para plano Starter */}
                {plan === 'STARTER' && config.limitations && (
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Limitações:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• {config.limitations.screener_queries_daily} consultas/dia</div>
                      <div>• {config.limitations.dashboard_widgets} widgets</div>
                      <div>• {config.limitations.historical_months} meses histórico</div>
                    </div>
                  </div>
                )}

                {/* Input de patrimônio para planos fee-based */}
                {(plan === 'WEALTH' || plan === 'OFFSHORE') && !isCurrentPlan && (
                  <div className="space-y-2">
                    <Label htmlFor={`assets-${plan}`} className="text-sm font-medium">
                      Patrimônio Total (R$)
                    </Label>
                    <Input
                      id={`assets-${plan}`}
                      type="number"
                      placeholder={`Mínimo: ${formatCurrency(config.minimumAssets || 0)}`}
                      value={selectedAssets[plan] || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setSelectedAssets(prev => ({
                          ...prev,
                          [plan]: Math.max(value, config.minimumAssets || 0)
                        }));
                      }}
                      min={config.minimumAssets || 0}
                      step={10000}
                      className="text-center"
                    />
                  </div>
                )}

                {/* Botão de ação */}
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Plano Atual' : 
                   plan === 'STARTER' ? 'Começar Grátis' :
                   plan === 'PRO' ? 'Assinar Pro' :
                   plan === 'WEALTH' ? 'Solicitar Análise' :
                   'Solicitar Contato'}
                </Button>

                {/* Informações adicionais para planos premium */}
                {(plan === 'WEALTH' || plan === 'OFFSHORE') && (
                  <div className="text-xs text-gray-500 text-center">
                    {plan === 'WEALTH' ? 
                      'Diagnóstico gratuito • Processo seletivo' :
                      'Estruturação completa • Rede de parceiros'
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <div className="text-center space-y-4 pt-8 border-t">
        <h3 className="text-lg font-semibold">Todos os planos incluem:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">Dados validados de 4.409 ETFs</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">Atualizações em tempo real</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">Suporte técnico</span>
          </div>
        </div>
      </div>
    </div>
  );
} 