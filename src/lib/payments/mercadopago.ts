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
      pro: {
        id: 'pro',
        name: 'ETF Curator Pro',
        description: 'Acesso completo às funcionalidades de análise de ETFs',
        price: 39.90,
        currency: 'BRL',
        features: [
          'Screener avançado ilimitado',
          'Rankings completos',
          'Comparação detalhada',
          'Análise de risco',
          'Alertas personalizados',
          'Suporte prioritário'
        ],
        period: 'monthly'
      },
      wealth: {
        id: 'wealth',
        name: 'ETF Curator Wealth',
        description: 'Consultoria personalizada para patrimônios altos',
        price: 0, // Taxa baseada em patrimônio
        currency: 'BRL',
        features: [
          'Tudo do plano Pro',
          'Consultoria dedicada',
          'Análise personalizada',
          'Relatórios customizados',
          'Suporte VIP'
        ],
        period: 'monthly'
      },
      offshore: {
        id: 'offshore',
        name: 'ETF Curator Offshore',
        description: 'Aconselhamento para investimentos internacionais',
        price: 0, // Taxa baseada em patrimônio
        currency: 'BRL',
        features: [
          'Tudo do plano Wealth',
          'Estratégias offshore',
          'Estruturação internacional',
          'Rede de parceiros globais',
          'Aconselhamento completo'
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