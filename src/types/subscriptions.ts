// Tipos para o sistema de assinaturas ETF Curator

export type SubscriptionPlan = 'STARTER' | 'PRO' | 'WEALTH' | 'OFFSHORE';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'TRIAL';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type PaymentMethod = 'MERCADO_PAGO' | 'CREDIT_CARD' | 'PIX' | 'BANK_TRANSFER';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string;
  expires_at?: string;
  cancelled_at?: string;
  trial_ends_at?: string;
  
  // Campos específicos para planos Wealth e Offshore
  assets_under_management?: number;
  annual_fee?: number;
  monthly_fee?: number;
  
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  user_id: string;
  
  // Dados do pagamento
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  
  // Dados do período
  period_start: string;
  period_end: string;
  
  // Integração com Mercado Pago
  external_payment_id?: string;
  external_data?: Record<string, any>;
  
  description?: string;
  metadata?: Record<string, any>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLimits {
  id: string;
  subscription_id: string;
  user_id: string;
  
  // Limites por funcionalidade
  screener_queries_limit?: number;
  screener_queries_used: number;
  
  export_reports_limit?: number;
  export_reports_used: number;
  
  portfolio_simulations_limit?: number;
  portfolio_simulations_used: number;
  
  // Controle de período
  period_start: string;
  period_end: string;
  
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  id: string;
  plan: SubscriptionPlan;
  feature_key: string;
  feature_name: string;
  feature_description?: string;
  is_enabled: boolean;
  limit_value?: number;
  created_at: string;
  updated_at: string;
}

export interface WealthOnboarding {
  id: string;
  user_id: string;
  
  // Status do processo
  status: 'INITIAL' | 'DIAGNOSIS_SCHEDULED' | 'DIAGNOSIS_COMPLETED' | 'PRESENTATION_SCHEDULED' | 'APPROVED' | 'REJECTED';
  
  // Dados do diagnóstico
  current_portfolio_value?: number;
  investment_goals?: Record<string, any>;
  risk_tolerance?: string;
  investment_experience?: string;
  
  // Agendamentos
  diagnosis_scheduled_at?: string;
  presentation_scheduled_at?: string;
  
  // Notas do consultor
  consultant_notes?: Record<string, any>;
  approval_reason?: string;
  rejection_reason?: string;
  
  created_at: string;
  updated_at: string;
}

export interface OffshoreOnboarding {
  id: string;
  user_id: string;
  
  // Status do processo
  status: 'INITIAL' | 'DIAGNOSIS_SCHEDULED' | 'DUE_DILIGENCE' | 'STRUCTURE_PLANNED' | 'APPROVED' | 'REJECTED';
  
  // Dados do diagnóstico offshore
  total_assets?: number;
  offshore_goals?: Record<string, any>;
  tax_residency?: string;
  business_activities?: Record<string, any>;
  
  // Due diligence
  compliance_check?: Record<string, any>;
  documentation_status?: Record<string, any>;
  
  // Estruturação
  recommended_structure?: Record<string, any>;
  estimated_costs?: number;
  
  // Agendamentos
  diagnosis_scheduled_at?: string;
  structure_meeting_at?: string;
  
  // Notas do consultor
  consultant_notes?: Record<string, any>;
  approval_reason?: string;
  rejection_reason?: string;
  
  created_at: string;
  updated_at: string;
}

// Configurações dos planos
export interface PlanConfig {
  name: string;
  description: string;
  price?: number; // Para planos fixos
  priceType: 'free' | 'monthly' | 'fee_based';
  currency: string;
  features: string[];
  limitations?: Record<string, number>;
  minimumAssets?: number;
  feePercentage?: number; // Para planos fee-based
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  STARTER: {
    name: 'Starter',
    description: 'Plano gratuito para começar',
    priceType: 'free',
    currency: 'BRL',
    features: [
      'Dashboard básico (3 widgets)',
      'Screener limitado (2 filtros)',
      'Rankings top 5',
      'Comparador (2 ETFs)',
      'Dados 12 meses'
    ],
    limitations: {
      screener_queries_daily: 20,
      dashboard_widgets: 3,
      comparator_etfs: 2,
      rankings_items: 5,
      historical_months: 12
    }
  },
  PRO: {
    name: 'Pro',
    description: 'Para investidores ativos',
    price: 39.90,
    priceType: 'monthly',
    currency: 'BRL',
    features: [
      'Dashboard completo',
      'Screener avançado (6 filtros)',
      'Rankings top 10',
      'Comparador (4 ETFs)',
      'Simulador com cenários',
      'Dados históricos completos',
      'Exportação ilimitada'
    ]
  },
  WEALTH: {
    name: 'Wealth',
    description: 'Consultoria personalizada',
    priceType: 'fee_based',
    feePercentage: 1.0,
    currency: 'BRL',
    minimumAssets: 200000,
    features: [
      'Todas as funcionalidades Pro',
      'Consultor CVM dedicado',
      'Reuniões mensais',
      'WhatsApp prioritário',
      'Relatórios customizados',
      'Rebalanceamento trimestral',
      'Corretoras premium',
      'Otimização tributária'
    ]
  },
  OFFSHORE: {
    name: 'Offshore',
    description: 'Estruturação internacional',
    priceType: 'fee_based',
    feePercentage: 0.8,
    currency: 'BRL',
    minimumAssets: 1000000,
    features: [
      'Todas as funcionalidades Wealth',
      'Aconselhamento em estruturação offshore',
      'Rede de parceiros internacionais',
      'Compliance fiscal',
      'Aconselhamento em elisão fiscal internacional',
      'Holdings internacionais',
      'Due diligence completa',
      'Banking internacional',
      'Aconselhamento em estratégias de envio de remessas internacionais com menor custo'
    ]
  }
};

// Utilitários
export function getPlanConfig(plan: SubscriptionPlan): PlanConfig {
  return PLAN_CONFIGS[plan];
}

export function calculateAnnualFee(plan: SubscriptionPlan, assets: number): number {
  const config = getPlanConfig(plan);
  if (config.priceType !== 'fee_based' || !config.feePercentage) {
    return 0;
  }
  return (assets * config.feePercentage) / 100;
}

export function calculateMonthlyFee(plan: SubscriptionPlan, assets: number): number {
  return calculateAnnualFee(plan, assets) / 12;
}

export function isFeatureEnabled(features: PlanFeature[], featureKey: string): boolean {
  const feature = features.find(f => f.feature_key === featureKey);
  return feature?.is_enabled ?? false;
}

export function getFeatureLimit(features: PlanFeature[], featureKey: string): number | null {
  const feature = features.find(f => f.feature_key === featureKey);
  return feature?.limit_value ?? null;
}

export function canAccessFeature(
  userPlan: SubscriptionPlan, 
  featureKey: string, 
  features: PlanFeature[]
): boolean {
  const planFeatures = features.filter(f => f.plan === userPlan);
  return isFeatureEnabled(planFeatures, featureKey);
} 