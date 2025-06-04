// Sistema de abstração para múltiplas fontes de dados - Versão Corrigida
export interface DataSource {
  id: string;
  name: string;
  priority: number;
  isAvailable: () => Promise<boolean>;
  getETFData: (symbol: string) => Promise<any | null>;
  getBulkETFData: (symbols: string[]) => Promise<Record<string, any>>;
  getLastUpdate: () => Promise<Date | null>;
}

// Fonte de dados baseada no sistema atual (Excel/Database)
export class DatabaseDataSource implements DataSource {
  id = 'database';
  name = 'Database (Current)';
  priority = 1; // Prioridade mais alta = fallback seguro

  async isAvailable(): Promise<boolean> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      return true;
    } catch {
      return false;
    }
  }

  async getETFData(symbol: string): Promise<any | null> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const etf = await prisma.etfs.findUnique({
        where: { symbol }
      });
      
      await prisma.$disconnect();
      
      if (!etf) return null;
      
      return {
        symbol: etf.symbol,
        name: etf.name || undefined,
        description: etf.description || undefined,
        category: etf.category || undefined,
        exchange: etf.exchange || undefined,
        inception_date: etf.inception_date ? etf.inception_date.toISOString() : undefined,
        total_assets: etf.total_assets ? Number(etf.total_assets) : undefined,
        volume: etf.volume ? Number(etf.volume) : undefined,
        returns_12m: etf.returns_12m ? Number(etf.returns_12m) : undefined,
        returns_24m: etf.returns_24m ? Number(etf.returns_24m) : undefined,
        returns_36m: etf.returns_36m ? Number(etf.returns_36m) : undefined,
        ten_year_return: etf.ten_year_return ? Number(etf.ten_year_return) : undefined,
        volatility_12m: etf.volatility_12m ? Number(etf.volatility_12m) : undefined,
        volatility_24m: etf.volatility_24m ? Number(etf.volatility_24m) : undefined,
        volatility_36m: etf.volatility_36m ? Number(etf.volatility_36m) : undefined,
        ten_year_volatility: etf.ten_year_volatility ? Number(etf.ten_year_volatility) : undefined,
        max_drawdown: etf.max_drawdown ? Number(etf.max_drawdown) : undefined,
        sharpe_12m: etf.sharpe_12m ? Number(etf.sharpe_12m) : undefined,
        sharpe_24m: etf.sharpe_24m ? Number(etf.sharpe_24m) : undefined,
        sharpe_36m: etf.sharpe_36m ? Number(etf.sharpe_36m) : undefined,
        ten_year_sharpe: etf.ten_year_sharpe ? Number(etf.ten_year_sharpe) : undefined,
        dividends_12m: etf.dividends_12m ? Number(etf.dividends_12m) : undefined,
        dividends_24m: etf.dividends_24m ? Number(etf.dividends_24m) : undefined,
        dividends_36m: etf.dividends_36m ? Number(etf.dividends_36m) : undefined,
        dividends_all_time: etf.dividends_all_time ? Number(etf.dividends_all_time) : undefined,
        dividend_yield: etf.dividend_yield ? Number(etf.dividend_yield) : undefined,
        start_date: etf.start_date ? etf.start_date.toISOString() : undefined,
        end_date: etf.end_date ? etf.end_date.toISOString() : undefined,
        data_source: 'database',
        last_updated: new Date(),
        quality_score: this.calculateQualityScore(etf)
      };
    } catch (error) {
      console.error('Database data source error:', error);
      return null;
    }
  }

  async getBulkETFData(symbols: string[]): Promise<Record<string, any>> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const etfs = await prisma.etfs.findMany({
        where: { symbol: { in: symbols } }
      });
      
      await prisma.$disconnect();
      
      const result: Record<string, any> = {};
      
      etfs.forEach(etf => {
        result[etf.symbol] = {
          symbol: etf.symbol,
          name: etf.name || undefined,
          description: etf.description || undefined,
          category: etf.category || undefined,
          exchange: etf.exchange || undefined,
          inception_date: etf.inception_date ? etf.inception_date.toISOString() : undefined,
          total_assets: etf.total_assets ? Number(etf.total_assets) : undefined,
          volume: etf.volume ? Number(etf.volume) : undefined,
          returns_12m: etf.returns_12m ? Number(etf.returns_12m) : undefined,
          volatility_12m: etf.volatility_12m ? Number(etf.volatility_12m) : undefined,
          dividend_yield: etf.dividend_yield ? Number(etf.dividend_yield) : undefined,
          data_source: 'database',
          last_updated: new Date(),
          quality_score: this.calculateQualityScore(etf)
        };
      });
      
      return result;
    } catch (error) {
      console.error('Database bulk data source error:', error);
      return {};
    }
  }

  async getLastUpdate(): Promise<Date | null> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const result = await prisma.etfs.findFirst({
        orderBy: { updated_at: 'desc' },
        select: { updated_at: true }
      });
      
      await prisma.$disconnect();
      return result?.updated_at || null;
    } catch {
      return null;
    }
  }

  private calculateQualityScore(etf: any): number {
    let score = 100;
    
    // Penaliza campos nulos importantes
    if (!etf.name) score -= 20;
    if (!etf.category) score -= 10;
    if (!etf.total_assets) score -= 15;
    if (!etf.volume) score -= 10;
    if (!etf.returns_12m) score -= 15;
    if (!etf.dividend_yield) score -= 5;
    
    // Verifica consistência de dados
    if (typeof etf.returns_12m === 'number' && Math.abs(etf.returns_12m) > 200) score -= 20;
    if (typeof etf.volatility_12m === 'number' && etf.volatility_12m > 100) score -= 15;
    
    return Math.max(0, score);
  }
}

// Fonte de dados yfinance (via API própria)
export class YFinanceDataSource implements DataSource {
  id = 'yfinance';
  name = 'Yahoo Finance';
  priority = 2; // Prioridade média

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('/api/data/yfinance/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getETFData(symbol: string): Promise<any | null> {
    try {
      const response = await fetch(`/api/data/yfinance/etf/${symbol}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol: data.symbol,
        name: data.longName || data.shortName,
        total_assets: data.totalAssets,
        dividend_yield: data.dividendYield * 100,
        returns_12m: data.returns_12m,
        volatility_12m: data.volatility_12m,
        volume: data.averageVolume,
        beta: data.beta,
        data_source: 'yfinance',
        last_updated: new Date(),
        quality_score: 85
      };
    } catch (error) {
      console.error('YFinance data source error:', error);
      return null;
    }
  }

  async getBulkETFData(symbols: string[]): Promise<Record<string, any>> {
    try {
      const response = await fetch('/api/data/yfinance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      });
      
      if (!response.ok) return {};
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('YFinance bulk data source error:', error);
      return {};
    }
  }

  async getLastUpdate(): Promise<Date | null> {
    return new Date(); // yfinance sempre retorna dados recentes
  }
}

// Gerenciador principal de dados
export class DataSourceManager {
  private sources: DataSource[] = [];
  private cache = new Map<string, { data: any; expires: Date }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  constructor() {
    // Inicializa com fonte atual (compatibilidade total)
    this.sources.push(new DatabaseDataSource());
    this.sources.push(new YFinanceDataSource());
    
    // Ordena por prioridade (maior = melhor)
    this.sources.sort((a, b) => b.priority - a.priority);
  }

  async getETFData(symbol: string): Promise<any | null> {
    // Verifica cache primeiro
    const cached = this.cache.get(symbol);
    if (cached && cached.expires > new Date()) {
      return cached.data;
    }

    // Tenta cada fonte em ordem de prioridade
    for (const source of this.sources) {
      try {
        if (!(await source.isAvailable())) continue;
        
        const data = await source.getETFData(symbol);
        if (data) {
          // Cache o resultado
          this.cache.set(symbol, {
            data: data,
            expires: new Date(Date.now() + this.cacheTimeout)
          });
          
          return data;
        }
      } catch (error) {
        console.error(`Error from ${source.name}:`, error);
        continue;
      }
    }

    return null;
  }

  async getBulkETFData(symbols: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    
    // Verifica cache primeiro
    const uncachedSymbols: string[] = [];
    
    for (const symbol of symbols) {
      const cached = this.cache.get(symbol);
      if (cached && cached.expires > new Date()) {
        result[symbol] = cached.data;
      } else {
        uncachedSymbols.push(symbol);
      }
    }

    if (uncachedSymbols.length === 0) {
      return result;
    }

    // Busca dados não cacheados
    for (const source of this.sources) {
      if (uncachedSymbols.length === 0) break;
      
      try {
        if (!(await source.isAvailable())) continue;
        
        const sourceData = await source.getBulkETFData(uncachedSymbols);
        
        for (const [symbol, data] of Object.entries(sourceData)) {
          if (data && !result[symbol]) {
            result[symbol] = data;
            
            // Cache o resultado
            this.cache.set(symbol, {
              data: data,
              expires: new Date(Date.now() + this.cacheTimeout)
            });
            
            // Remove da lista de não encontrados
            const index = uncachedSymbols.indexOf(symbol);
            if (index > -1) {
              uncachedSymbols.splice(index, 1);
            }
          }
        }
      } catch (error) {
        console.error(`Error from ${source.name}:`, error);
        continue;
      }
    }

    return result;
  }

  // Método para forçar atualização de dados
  async refreshETFData(symbol: string): Promise<any | null> {
    this.cache.delete(symbol);
    return await this.getETFData(symbol);
  }

  // Método para obter status das fontes
  async getSourcesStatus(): Promise<any[]> {
    const status: any[] = [];
    
    for (const source of this.sources) {
      const available = await source.isAvailable();
      const lastUpdate = await source.getLastUpdate();
      
      status.push({
        source: source.name,
        available,
        lastUpdate
      });
    }
    
    return status;
  }
}

// Singleton instance
export const dataSourceManager = new DataSourceManager(); 