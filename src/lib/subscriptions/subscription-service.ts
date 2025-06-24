import { supabase } from '@/lib/supabaseClient';
import { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionStatus,
  PlanFeature,
  UsageLimits,
  WealthOnboarding,
  OffshoreOnboarding,
  calculateAnnualFee,
  calculateMonthlyFee,
  getPlanConfig
} from '@/types/subscriptions';

export class SubscriptionService {
  
  // Buscar assinatura ativa do usuário
  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      console.log('🔍 Buscando assinatura para usuário:', userId);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erro na query de assinatura:', error);
        throw error;
      }

      if (error && error.code === 'PGRST116') {
        console.log('⚠️ Nenhuma assinatura ativa encontrada para o usuário');
      } else {
        console.log('✅ Assinatura encontrada:', data?.plan, data?.status);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar assinatura:', error);
      return null;
    }
  }

  // Buscar todas as assinaturas do usuário
  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      return [];
    }
  }

  // Criar nova assinatura
  static async createSubscription(
    userId: string, 
    plan: SubscriptionPlan,
    assetsUnderManagement?: number
  ): Promise<Subscription | null> {
    try {
      const planConfig = getPlanConfig(plan);
      let subscriptionData: any = {
        user_id: userId,
        plan,
        status: 'PENDING' as SubscriptionStatus
      };

      // Para planos fee-based, calcular taxas
      if (planConfig.priceType === 'fee_based' && assetsUnderManagement) {
        const annualFee = calculateAnnualFee(plan, assetsUnderManagement);
        const monthlyFee = calculateMonthlyFee(plan, assetsUnderManagement);
        
        subscriptionData = {
          ...subscriptionData,
          assets_under_management: assetsUnderManagement,
          annual_fee: annualFee,
          monthly_fee: monthlyFee
        };
      }

      // Para plano Starter, ativar imediatamente
      if (plan === 'STARTER') {
        subscriptionData.status = 'ACTIVE';
        subscriptionData.started_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;

      // Criar limites de uso iniciais
      if (data) {
        await this.createInitialUsageLimits(data.id, userId, plan);
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      return null;
    }
  }

  // Atualizar status da assinatura
  static async updateSubscriptionStatus(
    subscriptionId: string, 
    status: SubscriptionStatus
  ): Promise<boolean> {
    try {
      const updateData: any = { status };
      
      if (status === 'ACTIVE') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'CANCELLED') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId);

      return !error;
    } catch (error) {
      console.error('Erro ao atualizar status da assinatura:', error);
      return false;
    }
  }

  // Buscar features do plano
  static async getPlanFeatures(plan: SubscriptionPlan): Promise<PlanFeature[]> {
    try {
      const { data, error } = await supabase
        .from('plan_features')
        .select('*')
        .eq('plan', plan);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar features do plano:', error);
      return [];
    }
  }

  // Verificar se usuário pode acessar funcionalidade
  static async canUserAccessFeature(userId: string, featureKey: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        // Usuário sem assinatura = plano STARTER
        const starterFeatures = await this.getPlanFeatures('STARTER');
        const feature = starterFeatures.find(f => f.feature_key === featureKey);
        return feature?.is_enabled ?? false;
      }

      const features = await this.getPlanFeatures(subscription.plan);
      const feature = features.find(f => f.feature_key === featureKey);
      return feature?.is_enabled ?? false;
    } catch (error) {
      console.error('Erro ao verificar acesso à funcionalidade:', error);
      return false;
    }
  }

  // Buscar limites de uso atuais
  static async getCurrentUsageLimits(userId: string): Promise<UsageLimits | null> {
    try {
      const now = new Date();
      const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', userId)
        .gte('period_start', startOfPeriod)
        .lte('period_end', endOfPeriod)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar limites de uso:', error);
      return null;
    }
  }

  // Incrementar uso de funcionalidade
  static async incrementUsage(
    userId: string, 
    usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations'
  ): Promise<boolean> {
    try {
      const limits = await this.getCurrentUsageLimits(userId);
      if (!limits) return false;

      const fieldName = `${usageType}_used`;
      const currentValue = limits[fieldName as keyof UsageLimits] as number || 0;

      const { error } = await supabase
        .from('usage_limits')
        .update({ [fieldName]: currentValue + 1 })
        .eq('id', limits.id);

      return !error;
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
      return false;
    }
  }

  // Verificar se usuário atingiu limite
  static async hasReachedLimit(
    userId: string, 
    usageType: 'screener_queries' | 'export_reports' | 'portfolio_simulations'
  ): Promise<boolean> {
    try {
      const limits = await this.getCurrentUsageLimits(userId);
      if (!limits) return false;

      const limitField = `${usageType}_limit`;
      const usedField = `${usageType}_used`;
      
      const limit = limits[limitField as keyof UsageLimits] as number;
      const used = limits[usedField as keyof UsageLimits] as number;

      // Se não há limite definido, não há restrição
      if (!limit) return false;

      return used >= limit;
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      return false;
    }
  }

  // Criar limites de uso iniciais
  private static async createInitialUsageLimits(
    subscriptionId: string, 
    userId: string, 
    plan: SubscriptionPlan
  ): Promise<void> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      let limits: any = {
        subscription_id: subscriptionId,
        user_id: userId,
        period_start: startOfMonth.toISOString(),
        period_end: endOfMonth.toISOString(),
        screener_queries_used: 0,
        export_reports_used: 0,
        portfolio_simulations_used: 0
      };

      // Definir limites baseados no plano
      if (plan === 'STARTER') {
        limits.screener_queries_limit = 20;
        limits.export_reports_limit = 0; // Sem exportação
        limits.portfolio_simulations_limit = null; // Ilimitado
      } else {
        // Planos pagos têm limites mais generosos ou ilimitados
        limits.screener_queries_limit = null; // Ilimitado
        limits.export_reports_limit = null; // Ilimitado
        limits.portfolio_simulations_limit = null; // Ilimitado
      }

      await supabase
        .from('usage_limits')
        .insert(limits);
    } catch (error) {
      console.error('Erro ao criar limites iniciais:', error);
    }
  }

  // Wealth Onboarding
  static async createWealthOnboarding(userId: string): Promise<WealthOnboarding | null> {
    try {
      const { data, error } = await supabase
        .from('wealth_onboarding')
        .insert({ user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar onboarding Wealth:', error);
      return null;
    }
  }

  static async getWealthOnboarding(userId: string): Promise<WealthOnboarding | null> {
    try {
      const { data, error } = await supabase
        .from('wealth_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar onboarding Wealth:', error);
      return null;
    }
  }

  static async updateWealthOnboarding(
    userId: string, 
    updates: Partial<WealthOnboarding>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wealth_onboarding')
        .update(updates)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Erro ao atualizar onboarding Wealth:', error);
      return false;
    }
  }

  // Offshore Onboarding
  static async createOffshoreOnboarding(userId: string): Promise<OffshoreOnboarding | null> {
    try {
      const { data, error } = await supabase
        .from('offshore_onboarding')
        .insert({ user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar onboarding Offshore:', error);
      return null;
    }
  }

  static async getOffshoreOnboarding(userId: string): Promise<OffshoreOnboarding | null> {
    try {
      const { data, error } = await supabase
        .from('offshore_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar onboarding Offshore:', error);
      return null;
    }
  }

  static async updateOffshoreOnboarding(
    userId: string, 
    updates: Partial<OffshoreOnboarding>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('offshore_onboarding')
        .update(updates)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Erro ao atualizar onboarding Offshore:', error);
      return false;
    }
  }
} 