/**
 * Sistema de Cache para Respostas IA - Dashboard ETF Curator
 * FASE 4: Otimização de Performance
 */

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // time to live em milissegundos
  hits: number;
}

interface CacheStats {
  total_entries: number;
  cache_hits: number;
  cache_misses: number;
  hit_rate: number;
  memory_usage_mb: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0
  };

  // TTL padrão por tipo de dados (em minutos)
  private defaultTTL = {
    intent_classification: 30 * 60 * 1000,    // 30 minutos
    etf_comparison: 15 * 60 * 1000,           // 15 minutos
    market_data: 5 * 60 * 1000,              // 5 minutos
    news: 10 * 60 * 1000,                    // 10 minutos
    analytics: 60 * 60 * 1000,               // 1 hora
    insights: 30 * 60 * 1000,                // 30 minutos
    portfolio_optimization: 20 * 60 * 1000   // 20 minutos
  };

  /**
   * Gera chave de cache baseada nos parâmetros
   */
  generateKey(type: string, params: any): string {
    const sortedParams = JSON.stringify(params, Object.keys(params).sort());
    return `${type}:${this.hashString(sortedParams)}`;
  }

  /**
   * Hash simples para gerar chaves consistentes
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Busca dados no cache
   */
  get(type: string, params: any): any | null {
    const key = this.generateKey(type, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      console.log(`🔍 Cache MISS: ${key}`);
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      console.log(`⏰ Cache EXPIRED: ${key}`);
      return null;
    }

    // Cache hit
    entry.hits++;
    this.stats.hits++;
    console.log(`✅ Cache HIT: ${key} (${entry.hits} hits)`);
    return entry.data;
  }

  /**
   * Armazena dados no cache
   */
  set(type: string, params: any, data: any, customTTL?: number): void {
    const key = this.generateKey(type, params);
    const ttl = customTTL || this.defaultTTL[type as keyof typeof this.defaultTTL] || (15 * 60 * 1000);

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };

    this.cache.set(key, entry);
    console.log(`💾 Cache SET: ${key} (TTL: ${Math.round(ttl / 1000 / 60)}min)`);

    // Limpeza automática se cache ficar muito grande
    if (this.cache.size > 1000) {
      this.cleanup();
    }
  }

  /**
   * Remove entrada específica do cache
   */
  delete(type: string, params: any): boolean {
    const key = this.generateKey(type, params);
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      console.log(`🗑️ Cache DELETE: ${key}`);
    }
    
    return deleted;
  }

  /**
   * Limpa entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    console.log(`🧹 Cache CLEANUP: ${cleanedCount} entradas removidas`);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    console.log(`🔥 Cache CLEAR: ${size} entradas removidas`);
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): CacheStats {
    const memoryUsage = this.estimateMemoryUsage();
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      total_entries: this.cache.size,
      cache_hits: this.stats.hits,
      cache_misses: this.stats.misses,
      hit_rate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      memory_usage_mb: memoryUsage
    };
  }

  /**
   * Estima uso de memória do cache
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry).length * 2; // Aproximação em bytes (UTF-16)
    }
    
    return Math.round(totalSize / 1024 / 1024 * 100) / 100; // MB com 2 decimais
  }

  /**
   * Lista entradas por popularidade
   */
  getPopularEntries(limit: number = 10): Array<{key: string; hits: number; age_minutes: number}> {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit)
      .map(entry => ({
        key: entry.key,
        hits: entry.hits,
        age_minutes: Math.round((Date.now() - entry.timestamp) / 1000 / 60)
      }));

    return entries;
  }

  /**
   * Pré-aquece cache com dados comuns
   */
  async warmup(): Promise<void> {
    console.log('🔥 Iniciando cache warmup...');
    
    // Pré-carregar dados comuns que são frequentemente solicitados
    const commonRequests = [
      { type: 'etf_comparison', params: { etfs: ['SPY', 'VTI'] } },
      { type: 'etf_comparison', params: { etfs: ['QQQ', 'VGT'] } },
      { type: 'market_data', params: { symbols: ['SPY', 'QQQ', 'VTI', 'BND'] } },
      { type: 'analytics', params: { type: 'overview', timeframe: 'month' } }
    ];

    // Simular dados para warmup
    for (const request of commonRequests) {
      const mockData = this.generateMockData(request.type);
      this.set(request.type, request.params, mockData);
    }

    console.log(`✅ Cache warmup concluído: ${commonRequests.length} entradas pré-carregadas`);
  }

  /**
   * Gera dados mock para warmup
   */
  private generateMockData(type: string): any {
    switch (type) {
      case 'etf_comparison':
        return { comparison_result: 'mock_data', generated_at: Date.now() };
      case 'market_data':
        return { prices: { SPY: 450.25, QQQ: 375.80 }, updated_at: Date.now() };
      case 'analytics':
        return { metrics: { total_conversations: 47 }, generated_at: Date.now() };
      default:
        return { mock_data: true, type, generated_at: Date.now() };
    }
  }
}

// Instância singleton
export const responseCache = new ResponseCache();

// Middleware para APIs
export function withCache<T>(
  type: string,
  params: any,
  fetchFunction: () => Promise<T>,
  customTTL?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Tentar buscar no cache
      const cachedData = responseCache.get(type, params);
      
      if (cachedData) {
        resolve(cachedData);
        return;
      }

      // Cache miss - buscar dados
      const startTime = Date.now();
      const data = await fetchFunction();
      const executionTime = Date.now() - startTime;

      // Armazenar no cache
      responseCache.set(type, params, data, customTTL);
      
      console.log(`⚡ API executada em ${executionTime}ms e cacheada`);
      resolve(data);

    } catch (error) {
      reject(error);
    }
  });
}

// Função para invalidar cache relacionado
export function invalidateRelatedCache(type: string): void {
  const keysToDelete: string[] = [];
  
  for (const key of responseCache['cache'].keys()) {
    if (key.startsWith(type)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => {
    responseCache['cache'].delete(key);
  });
  
  console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for type: ${type}`);
}

// Auto-cleanup a cada 30 minutos
setInterval(() => {
  responseCache.cleanup();
}, 30 * 60 * 1000);

export default responseCache;

