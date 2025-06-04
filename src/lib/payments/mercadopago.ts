import { MercadoPagoConfig, Preference } from 'mercadopago';

interface PaymentItem {  id: string;  title: string;  quantity: number;  currency_id: string;  unit_price: number;}

interface CreatePreferenceData {
  items: PaymentItem[];
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  notification_url?: string;
  external_reference?: string;
}

class MercadoPagoService {
  private client: MercadoPagoConfig;
  private preference: Preference;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });

    this.preference = new Preference(this.client);
  }

  async createPaymentPreference(data: CreatePreferenceData) {
    try {
      const preferenceData = {
        items: data.items,
        back_urls: data.back_urls || {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
        },
        auto_return: data.auto_return || 'approved' as const,
        payment_methods: {
          excluded_payment_methods: data.payment_methods?.excluded_payment_methods || [],
          excluded_payment_types: data.payment_methods?.excluded_payment_types || [],
          installments: data.payment_methods?.installments || 12
        },
        notification_url: data.notification_url || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        external_reference: data.external_reference,
        statement_descriptor: 'ETF CURATOR',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      };

      const response = await this.preference.create({ body: preferenceData });
      
      return {
        success: true,
        preference_id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (error) {
      console.error('Erro ao criar preferência no Mercado Pago:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Planos de assinatura disponíveis
  static getSubscriptionPlans() {
    return {
      basic: {
        id: 'basic',
        name: 'ETF Curator Basic',
        description: 'Acesso às funcionalidades básicas de análise de ETFs',
        price: 29.90,
        currency: 'BRL',
        features: [
          'Comparação de até 4 ETFs',
          'Rankings atualizados',
          'Análise básica de risco',
          'Glossário contextual',
          'Suporte por email'
        ],
        period: 'monthly'
      },
      premium: {
        id: 'premium',
        name: 'ETF Curator Premium',
        description: 'Análise avançada com IA e recursos exclusivos',
        price: 59.90,
        currency: 'BRL',
        features: [
          'Tudo do plano Basic',
          'Análise IA ilimitada',
          'Assistente virtual 24/7',
          'Alertas personalizados',
          'Dashboard personalizado',
          'Relatórios em PDF',
          'Suporte prioritário'
        ],
        period: 'monthly',
        recommended: true
      },
      professional: {
        id: 'professional',
        name: 'ETF Curator Professional',
        description: 'Para investidores profissionais e assessores',
        price: 119.90,
        currency: 'BRL',
        features: [
          'Tudo do plano Premium',
          'API de acesso aos dados',
          'Simulador de carteiras',
          'Backtesting avançado',
          'White-label disponível',
          'Consultoria mensal',
          'Suporte dedicado'
        ],
        period: 'monthly'
      }
    };
  }

  static getPlanById(planId: string) {
    const plans = this.getSubscriptionPlans();
    return plans[planId as keyof typeof plans] || null;
  }
}

export default MercadoPagoService;
export type { PaymentItem, CreatePreferenceData }; 