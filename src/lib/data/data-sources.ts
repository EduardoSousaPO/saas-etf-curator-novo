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
      const etf = await prisma.etf_list.findUnique({ where: { symbol } });
      const metrics = await prisma.calculated_metrics_teste.findUnique({ where: { symbol } });
      await prisma.$disconnect();
      if (!etf) return null;
      return {
        ...etf,
        ...metrics,
        data_source: 'database',
        last_updated: new Date(),
        quality_score: this.calculateQualityScore({ ...etf, ...metrics })
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
      const etfList = await prisma.etf_list.findMany({ where: { symbol: { in: symbols } } });
      const metricsList = await prisma.calculated_metrics_teste.findMany({ where: { symbol: { in: symbols } } });
      await prisma.$disconnect();
      const result: Record<string, any> = {};
      etfList.forEach(etf => {
        const metrics = metricsList.find(m => m.symbol === etf.symbol);
        result[etf.symbol] = {
          ...etf,
          ...metrics,
          data_source: 'database',
          last_updated: new Date(),
          quality_score: this.calculateQualityScore({ ...etf, ...metrics })
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
      const result = await prisma.etf_list.findFirst({
        orderBy: { updatedat: 'desc' },
        select: { updatedat: true }
      });
      await prisma.$disconnect();
      return result?.updatedat || null;
    } catch {
      return null;
    }
  }

  private calculateQualityScore(etf: any): number {
    let score = 100;
    
    // Penaliza campos nulos importantes
    if (!etf.name) score -= 20;
    if (!etf.assetclass) score -= 10;
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