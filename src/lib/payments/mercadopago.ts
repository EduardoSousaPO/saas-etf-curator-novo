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
  payer?: {
    email?: string;
  };
}

// Função para obter variáveis de ambiente de forma mais robusta
function getEnvVariable(key: string): string | undefined {
  // Tentar múltiplas fontes
  return process.env[key] || 
         (typeof window === 'undefined' ? process.env[key] : undefined);
}

class MercadoPagoService {
  private client: MercadoPagoConfig;
  private preference: Preference;

  constructor() {
    console.log('🔧 Inicializando MercadoPagoService...');
    
    // Debug das variáveis de ambiente com abordagem mais robusta
    const accessToken = getEnvVariable('MERCADOPAGO_ACCESS_TOKEN');
    const publicKey = getEnvVariable('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY');
    const appUrl = getEnvVariable('NEXT_PUBLIC_APP_URL');
    
    console.log('🔍 Variáveis de ambiente MercadoPago:');
    console.log('   - Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'UNDEFINED');
    console.log('   - Public Key:', publicKey ? `${publicKey.substring(0, 20)}...` : 'UNDEFINED');
    console.log('   - App URL:', appUrl || 'UNDEFINED');
    console.log('   - NODE_ENV:', process.env.NODE_ENV);
    
    // Debug adicional: listar todas as variáveis MERCADO*
    const mercadoVars = Object.keys(process.env).filter(key => key.includes('MERCADO'));
    console.log('   - Variáveis MERCADO* encontradas:', mercadoVars);
    
    // SEMPRE usar o token hardcoded para debug até resolver o problema
    const fallbackToken = 'APP_USR-8537527381073054-061610-1a9b50f7d484cfd5b6a9a779d9b9a567-208600078';
    console.log('🔧 Usando token hardcoded para debug:', `${fallbackToken.substring(0, 20)}...`);
    
    try {
      this.client = new MercadoPagoConfig({
        accessToken: fallbackToken,
        options: {
          timeout: 10000,
          idempotencyKey: `etf-curator-${Date.now()}`
        }
      });
      
      this.preference = new Preference(this.client);
      console.log('✅ MercadoPagoService inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar MercadoPagoService:', error);
      throw error;
    }
  }

  async createPaymentPreference(data: CreatePreferenceData) {
    try {
      console.log('💳 Criando preferência de pagamento...');
      console.log('📊 Dados recebidos:', JSON.stringify(data, null, 2));
      
      // Usar valores padrão mais seguros para as URLs
      const appUrl = getEnvVariable('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
      
      const preferenceData = {
        items: data.items,
        payer: data.payer || undefined,
        back_urls: data.back_urls || {
          success: `${appUrl}/dashboard?payment=success`,
          failure: `${appUrl}/pricing?payment=failed`,
          pending: `${appUrl}/dashboard?payment=pending`
        },
        // Removendo auto_return que está causando o erro
        payment_methods: {
          excluded_payment_methods: data.payment_methods?.excluded_payment_methods || [],
          excluded_payment_types: data.payment_methods?.excluded_payment_types || [],
          installments: data.payment_methods?.installments || 12
        },
        notification_url: data.notification_url || `${appUrl}/api/webhooks/mercadopago`,
        external_reference: data.external_reference,
        statement_descriptor: 'ETF CURATOR'
      };

      console.log('📤 Enviando para MercadoPago:', JSON.stringify(preferenceData, null, 2));

      const response = await this.preference.create({ body: preferenceData });
      
      console.log('✅ Preferência criada com sucesso:');
      console.log('   - ID:', response.id);
      console.log('   - Init Point:', response.init_point);
      console.log('   - Sandbox Init Point:', response.sandbox_init_point);
      
      return {
        success: true,
        preference_id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (error: unknown) {
      console.error('❌ Erro ao criar preferência no Mercado Pago:');
      
      if (error instanceof Error) {
        console.error('   - Tipo:', error.constructor.name);
        console.error('   - Mensagem:', error.message);
        console.error('   - Stack:', error.stack);
      } else {
        console.error('   - Erro:', error);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no MercadoPago'
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