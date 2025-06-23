'use client';

import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Zap, ArrowRight } from 'lucide-react';
import { useSubscription, usePlanCheck } from '@/hooks/useSubscription';
import { SubscriptionPlan, getPlanConfig } from '@/types/subscriptions';
import { useRouter } from 'next/navigation';

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  requiredPlan?: SubscriptionPlan;
  showUpgrade?: boolean;
}

interface UpgradePromptProps {
  featureKey: string;
  requiredPlan?: SubscriptionPlan;
  title?: string;
  description?: string;
}

const planIcons = {
  STARTER: <Star className="w-5 h-5" />,
  PRO: <Zap className="w-5 h-5" />,
  WEALTH: <Crown className="w-5 h-5" />,
  OFFSHORE: <Crown className="w-5 h-5" />
};

const planColors = {
  STARTER: 'bg-gray-100 text-gray-800',
  PRO: 'bg-blue-100 text-blue-800',
  WEALTH: 'bg-purple-100 text-purple-800',
  OFFSHORE: 'bg-emerald-100 text-emerald-800'
};

export function FeatureGate({ 
  featureKey, 
  children, 
  fallback, 
  requiredPlan,
  showUpgrade = true 
}: FeatureGateProps) {
  const { canAccessFeature, loading } = useSubscription();
  
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center">
        <span className="text-gray-500">Carregando...</span>
      </div>
    );
  }

  const hasAccess = canAccessFeature(featureKey);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    return (
      <UpgradePrompt 
        featureKey={featureKey}
        requiredPlan={requiredPlan}
      />
    );
  }

  return null;
}

export function UpgradePrompt({ 
  featureKey, 
  requiredPlan = 'PRO',
  title,
  description 
}: UpgradePromptProps) {
  const router = useRouter();
  const { currentPlan } = useSubscription();
  const { planConfig } = usePlanCheck();
  
  const targetPlanConfig = getPlanConfig(requiredPlan);
  
  const getFeatureTitle = (key: string): string => {
    const titles: Record<string, string> = {
      'screener_advanced': 'Screener Avançado',
      'export_reports': 'Exportação de Relatórios',
      'dashboard_complete': 'Dashboard Completo',
      'simulator_scenarios': 'Análise de Cenários',
      'rankings_top10': 'Rankings Completos',
      'comparator_advanced': 'Comparador Avançado',
      'consultant_dedicated': 'Consultor Dedicado',
      'offshore_structuring': 'Estruturação Offshore'
    };
    return titles[key] || 'Funcionalidade Premium';
  };

  const getFeatureDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      'screener_advanced': 'Acesse todos os 6 filtros avançados e consultas ilimitadas para encontrar os ETFs perfeitos.',
      'export_reports': 'Exporte relatórios detalhados em PDF e Excel para análises offline.',
      'dashboard_complete': 'Dashboard personalizado com todos os widgets e métricas avançadas.',
      'simulator_scenarios': 'Simule diferentes cenários de mercado e otimize sua carteira.',
      'rankings_top10': 'Visualize os top 10 ETFs em todas as categorias com atualizações em tempo real.',
      'comparator_advanced': 'Compare até 4 ETFs simultaneamente com métricas detalhadas.',
      'consultant_dedicated': 'Tenha um consultor CVM dedicado para orientação personalizada.',
      'offshore_structuring': 'Estruturação completa para investimentos internacionais.'
    };
    return descriptions[key] || 'Esta funcionalidade está disponível apenas em planos superiores.';
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <CardTitle className="text-xl">
          {title || getFeatureTitle(featureKey)}
        </CardTitle>
        
        <CardDescription className="text-center max-w-md mx-auto">
          {description || getFeatureDescription(featureKey)}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {/* Plano atual vs requerido */}
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <Badge className={planColors[currentPlan]} variant="secondary">
              {planIcons[currentPlan]}
              <span className="ml-1">{planConfig.name}</span>
            </Badge>
            <p className="text-xs text-gray-500 mt-1">Atual</p>
          </div>
          
          <ArrowRight className="w-5 h-5 text-gray-400" />
          
          <div className="text-center">
            <Badge className={planColors[requiredPlan]} variant="secondary">
              {planIcons[requiredPlan]}
              <span className="ml-1">{targetPlanConfig.name}</span>
            </Badge>
            <p className="text-xs text-gray-500 mt-1">Necessário</p>
          </div>
        </div>

        {/* Benefícios do upgrade */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">
            O que você ganha com o {targetPlanConfig.name}:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {targetPlanConfig.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                {feature}
              </li>
            ))}
            {targetPlanConfig.features.length > 3 && (
              <li className="text-blue-600 font-medium">
                + {targetPlanConfig.features.length - 3} outros benefícios
              </li>
            )}
          </ul>
        </div>

        {/* Preço */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-900">
            {targetPlanConfig.priceType === 'free' && 'Gratuito'}
            {targetPlanConfig.priceType === 'monthly' && (
              <>R$ {targetPlanConfig.price?.toFixed(2).replace('.', ',')} /mês</>
            )}
            {targetPlanConfig.priceType === 'fee_based' && (
              <>{targetPlanConfig.feePercentage}% a.a. sobre patrimônio</>
            )}
          </div>
          {targetPlanConfig.priceType === 'fee_based' && (
            <p className="text-xs text-blue-700 mt-1">
              Mínimo: R$ {targetPlanConfig.minimumAssets?.toLocaleString('pt-BR')}
            </p>
          )}
        </div>

        {/* Botão de upgrade */}
        <Button 
          onClick={handleUpgrade}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {requiredPlan === 'WEALTH' || requiredPlan === 'OFFSHORE' 
            ? 'Solicitar Consultoria' 
            : 'Fazer Upgrade'
          }
        </Button>

        <p className="text-xs text-gray-500">
          {requiredPlan === 'PRO' && 'Cancele a qualquer momento'}
          {(requiredPlan === 'WEALTH' || requiredPlan === 'OFFSHORE') && 'Diagnóstico gratuito'}
        </p>
      </CardContent>
    </Card>
  );
}

// Hook para verificar limites de uso
export function useUsageLimits() {
  const { usageLimits, hasReachedLimit, incrementUsage } = useSubscription();

  const checkAndExecute = async (
    usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations',
    action: () => Promise<any>
  ) => {
    const reached = await hasReachedLimit(usageType);
    
    if (reached) {
      return {
        success: false,
        error: 'Limite atingido. Faça upgrade para continuar.',
        requiresUpgrade: true
      };
    }

    try {
      const result = await action();
      await incrementUsage(usageType);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  };

  const getRemainingUsage = (usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations') => {
    if (!usageLimits) return null;
    
    const limitField = `${usageType}_limit` as keyof typeof usageLimits;
    const usedField = `${usageType}_used` as keyof typeof usageLimits;
    
    const limit = usageLimits[limitField] as number;
    const used = usageLimits[usedField] as number;
    
    if (!limit) return null; // Ilimitado
    
    return Math.max(0, limit - used);
  };

  return {
    usageLimits,
    checkAndExecute,
    getRemainingUsage,
    hasReachedLimit
  };
} 