import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionService } from '@/lib/subscriptions/subscription-service';
import { 
  Subscription, 
  SubscriptionPlan, 
  PlanFeature, 
  UsageLimits,
  WealthOnboarding,
  OffshoreOnboarding,
  getPlanConfig
} from '@/types/subscriptions';

// Verificação de acesso baseada no plano (fallback)
function getPlanBasedAccess(plan: SubscriptionPlan, featureKey: string): boolean {
  const planFeatures: Record<SubscriptionPlan, string[]> = {
    STARTER: [
      'screener_basic',
      'rankings_limited',
      'dashboard_basic'
    ],
    PRO: [
      'screener_advanced',
      'screener_queries_daily', 
      'screener_all_etfs',
      'rankings_top10',
      'export_reports',
      'dashboard_complete',
      'comparator_advanced',
      'portfolio_optimization'
    ],
    WEALTH: [
      'screener_advanced',
      'screener_queries_daily', 
      'screener_all_etfs',
      'rankings_top10',
      'export_reports',
      'dashboard_complete',
      'comparator_advanced',
      'portfolio_optimization',
      'consultant_dedicated',
      'wealth_planning'
    ],
    OFFSHORE: [
      'screener_advanced',
      'screener_queries_daily', 
      'screener_all_etfs',
      'rankings_top10',
      'export_reports',
      'dashboard_complete',
      'comparator_advanced',
      'portfolio_optimization',
      'consultant_dedicated',
      'wealth_planning',
      'offshore_structuring'
    ]
  };
  
  return planFeatures[plan]?.includes(featureKey) ?? false;
}

interface UseSubscriptionReturn {
  // Estado atual
  subscription: Subscription | null;
  currentPlan: SubscriptionPlan;
  features: PlanFeature[];
  usageLimits: UsageLimits | null;
  
  // Estados de loading
  loading: boolean;
  featuresLoading: boolean;
  
  // Funções
  createSubscription: (plan: SubscriptionPlan, assets?: number) => Promise<boolean>;
  canAccessFeature: (featureKey: string) => boolean;
  hasReachedLimit: (usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations') => Promise<boolean>;
  incrementUsage: (usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations') => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  
  // Wealth/Offshore onboarding
  wealthOnboarding: WealthOnboarding | null;
  offshoreOnboarding: OffshoreOnboarding | null;
  createWealthOnboarding: () => Promise<boolean>;
  createOffshoreOnboarding: () => Promise<boolean>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [wealthOnboarding, setWealthOnboarding] = useState<WealthOnboarding | null>(null);
  const [offshoreOnboarding, setOffshoreOnboarding] = useState<OffshoreOnboarding | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [featuresLoading, setFeaturesLoading] = useState(true);

  // Determinar plano atual (padrão STARTER se não tiver assinatura)
  const currentPlan: SubscriptionPlan = subscription?.plan || 'STARTER';

  // Carregar dados iniciais
  const loadSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔄 Carregando dados da assinatura para usuário:', user.id);
      
      // Carregar assinatura ativa
      const userSubscription = await SubscriptionService.getUserSubscription(user.id);
      console.log('📋 Assinatura encontrada:', userSubscription);
      setSubscription(userSubscription);
      
      // Carregar limites de uso
      const limits = await SubscriptionService.getCurrentUsageLimits(user.id);
      console.log('📊 Limites de uso:', limits);
      setUsageLimits(limits);
      
      // Carregar onboarding se aplicável
      if (userSubscription?.plan === 'WEALTH') {
        const wealth = await SubscriptionService.getWealthOnboarding(user.id);
        setWealthOnboarding(wealth);
      }
      
      if (userSubscription?.plan === 'OFFSHORE') {
        const offshore = await SubscriptionService.getOffshoreOnboarding(user.id);
        setOffshoreOnboarding(offshore);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados da assinatura:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar features do plano atual
  const loadPlanFeatures = useCallback(async () => {
    try {
      setFeaturesLoading(true);
      console.log('🔧 Carregando features do plano:', currentPlan);
      const planFeatures = await SubscriptionService.getPlanFeatures(currentPlan);
      console.log('✨ Features carregadas:', planFeatures.length, 'features');
      setFeatures(planFeatures);
    } catch (error) {
      console.error('❌ Erro ao carregar features do plano:', error);
    } finally {
      setFeaturesLoading(false);
    }
  }, [currentPlan]);

  // Criar nova assinatura
  const createSubscription = useCallback(async (
    plan: SubscriptionPlan, 
    assets?: number
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const newSubscription = await SubscriptionService.createSubscription(
        user.id, 
        plan, 
        assets
      );
      
      if (newSubscription) {
        setSubscription(newSubscription);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      return false;
    }
  }, [user?.id]);

  // Verificar se pode acessar funcionalidade
  const canAccessFeature = useCallback((featureKey: string): boolean => {
    // Verificação baseada no plano atual (mais confiável)
    const planBasedAccess = getPlanBasedAccess(currentPlan, featureKey);
    
    console.log(`🔐 canAccessFeature("${featureKey}"):`, {
      currentPlan,
      planBasedAccess,
      featuresCount: features.length,
      features: features.map(f => ({ key: f.feature_key, enabled: f.is_enabled }))
    });
    
    // Se temos features carregadas, usar elas
    if (features.length > 0) {
      const feature = features.find(f => f.feature_key === featureKey);
      const result = feature?.is_enabled ?? planBasedAccess;
      console.log(`✅ Resultado via features: ${result}`);
      return result;
    }
    
    // Fallback para verificação baseada no plano
    console.log(`✅ Resultado via plano: ${planBasedAccess}`);
    return planBasedAccess;
  }, [features, currentPlan]);

  // Verificar se atingiu limite
  const hasReachedLimit = useCallback(async (
    usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations'
  ): Promise<boolean> => {
    if (!user?.id) return false;
    return await SubscriptionService.hasReachedLimit(user.id, usageType);
  }, [user?.id]);

  // Incrementar uso
  const incrementUsage = useCallback(async (
    usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations'
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    const success = await SubscriptionService.incrementUsage(user.id, usageType);
    
    // Atualizar limites localmente
    if (success && usageLimits) {
      const fieldName = `${usageType}_used` as keyof UsageLimits;
      const currentValue = (usageLimits[fieldName] as number) || 0;
      setUsageLimits({
        ...usageLimits,
        [fieldName]: currentValue + 1
      });
    }
    
    return success;
  }, [user?.id, usageLimits]);

  // Atualizar dados da assinatura
  const refreshSubscription = useCallback(async () => {
    await loadSubscriptionData();
  }, [loadSubscriptionData]);

  // Criar onboarding Wealth
  const createWealthOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const onboarding = await SubscriptionService.createWealthOnboarding(user.id);
      if (onboarding) {
        setWealthOnboarding(onboarding);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar onboarding Wealth:', error);
      return false;
    }
  }, [user?.id]);

  // Criar onboarding Offshore
  const createOffshoreOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const onboarding = await SubscriptionService.createOffshoreOnboarding(user.id);
      if (onboarding) {
        setOffshoreOnboarding(onboarding);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar onboarding Offshore:', error);
      return false;
    }
  }, [user?.id]);

  // Efeitos
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  useEffect(() => {
    loadPlanFeatures();
  }, [loadPlanFeatures]);

  return {
    // Estado atual
    subscription,
    currentPlan,
    features,
    usageLimits,
    
    // Estados de loading
    loading,
    featuresLoading,
    
    // Funções
    createSubscription,
    canAccessFeature,
    hasReachedLimit,
    incrementUsage,
    refreshSubscription,
    
    // Wealth/Offshore onboarding
    wealthOnboarding,
    offshoreOnboarding,
    createWealthOnboarding,
    createOffshoreOnboarding
  };
}

// Hook auxiliar para verificar plano específico
export function usePlanCheck() {
  const { currentPlan } = useSubscription();
  
  return {
    isStarter: currentPlan === 'STARTER',
    isPro: currentPlan === 'PRO',
    isWealth: currentPlan === 'WEALTH',
    isOffshore: currentPlan === 'OFFSHORE',
    isPaid: currentPlan !== 'STARTER',
    isFeeBased: currentPlan === 'WEALTH' || currentPlan === 'OFFSHORE',
    planConfig: getPlanConfig(currentPlan)
  };
} 