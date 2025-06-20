export interface ExchangeRate {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  varBid: string;
  pctChange: string;
  bid: string;
  ask: string;
  timestamp: string;
  create_date: string;
}

export interface CurrencyData {
  USDBRL: ExchangeRate;
}

class CurrencyService {
  private cache: { data: CurrencyData | null; timestamp: number } = {
    data: null,
    timestamp: 0
  };
  
  private readonly CACHE_DURATION = 60000; // 1 minuto
  private readonly API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

  async getExchangeRate(): Promise<number> {
    try {
      // Verificar cache
      const now = Date.now();
      if (this.cache.data && (now - this.cache.timestamp) < this.CACHE_DURATION) {
        return parseFloat(this.cache.data.USDBRL.bid);
      }

      // Buscar dados atualizados
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error('Falha ao buscar cotação');
      }

      const data: CurrencyData = await response.json();
      
      // Atualizar cache
      this.cache = {
        data,
        timestamp: now
      };

      return parseFloat(data.USDBRL.bid);
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      // Fallback para taxa aproximada se a API falhar
      return 5.50; // Taxa aproximada de fallback
    }
  }

  async convertBRLToUSD(brlAmount: number): Promise<number> {
    const rate = await this.getExchangeRate();
    return brlAmount / rate;
  }

  async convertUSDToBRL(usdAmount: number): Promise<number> {
    const rate = await this.getExchangeRate();
    return usdAmount * rate;
  }

  async getCurrencyInfo(): Promise<{
    rate: number;
    variation: string;
    pctChange: string;
    lastUpdate: string;
  }> {
    try {
      const rate = await this.getExchangeRate();
      const data = this.cache.data;
      
      if (!data) {
        return {
          rate,
          variation: '0.00',
          pctChange: '0.00',
          lastUpdate: new Date().toLocaleString('pt-BR')
        };
      }

      return {
        rate,
        variation: data.USDBRL.varBid,
        pctChange: data.USDBRL.pctChange,
        lastUpdate: data.USDBRL.create_date
      };
    } catch (error) {
      console.error('Erro ao buscar informações da moeda:', error);
      return {
        rate: 5.50,
        variation: '0.00',
        pctChange: '0.00',
        lastUpdate: new Date().toLocaleString('pt-BR')
      };
    }
  }

  formatCurrency(amount: number, currency: 'BRL' | 'USD'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatNumber(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

export const currencyService = new CurrencyService(); 