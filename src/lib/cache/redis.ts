// src/lib/cache/redis.ts
import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  // Configurações para desenvolvimento local
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Event handlers para debugging
redis.on('connect', () => {
  console.log('✅ Redis conectado com sucesso');
});

redis.on('error', (err) => {
  console.error('❌ Erro no Redis:', err.message);
});

redis.on('ready', () => {
  console.log('🚀 Redis pronto para uso');
});

// Interface para cache
export interface CacheOptions {
  ttl?: number; // Time to live em segundos (padrão: 5 minutos)
  prefix?: string; // Prefixo para a chave
}

// Classe utilitária para cache
export class CacheManager {
  private redis: Redis;
  private defaultTTL: number = 300; // 5 minutos

  constructor(redisInstance: Redis) {
    this.redis = redisInstance;
  }

  /**
   * Gera uma chave de cache baseada nos parâmetros
   */
  private generateKey(baseKey: string, params: Record<string, any>, prefix?: string): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    const paramString = JSON.stringify(sortedParams);
    const hash = Buffer.from(paramString).toString('base64').slice(0, 16);
    
    const fullKey = prefix ? `${prefix}:${baseKey}:${hash}` : `${baseKey}:${hash}`;
    return fullKey;
  }

  /**
   * Busca dados do cache
   */
  async get<T>(key: string, params: Record<string, any> = {}, options: CacheOptions = {}): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key, params, options.prefix);
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);
        return JSON.parse(cached);
      }
      
      console.log(`❌ Cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      return null;
    }
  }

  /**
   * Armazena dados no cache
   */
  async set<T>(
    key: string, 
    data: T, 
    params: Record<string, any> = {}, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, params, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      
      await this.redis.setex(cacheKey, ttl, JSON.stringify(data));
      console.log(`💾 Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
      return false;
    }
  }

  /**
   * Remove dados específicos do cache
   */
  async delete(key: string, params: Record<string, any> = {}, options: CacheOptions = {}): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, params, options.prefix);
      const result = await this.redis.del(cacheKey);
      console.log(`🗑️ Cache DELETE: ${cacheKey}`);
      return result > 0;
    } catch (error) {
      console.error('Erro ao deletar cache:', error);
      return false;
    }
  }

  /**
   * Remove todos os caches com um padrão específico
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.redis.del(...keys);
      console.log(`🧹 Cache INVALIDATE: ${keys.length} chaves removidas (padrão: ${pattern})`);
      return result;
    } catch (error) {
      console.error('Erro ao invalidar cache:', error);
      return 0;
    }
  }

  /**
   * Verifica se o Redis está conectado
   */
  async isConnected(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: string;
    keys: number;
    hits: number;
    misses: number;
  }> {
    try {
      const info = await this.redis.info('memory');
      const dbsize = await this.redis.dbsize();
      const stats = await this.redis.info('stats');
      
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
      const missesMatch = stats.match(/keyspace_misses:(\d+)/);
      
      return {
        connected: true,
        memory: memoryMatch ? memoryMatch[1] : 'N/A',
        keys: dbsize,
        hits: hitsMatch ? parseInt(hitsMatch[1]) : 0,
        misses: missesMatch ? parseInt(missesMatch[1]) : 0
      };
    } catch (error) {
      return {
        connected: false,
        memory: 'N/A',
        keys: 0,
        hits: 0,
        misses: 0
      };
    }
  }
}

// Instância global do cache manager
export const cacheManager = new CacheManager(redis);

// Função helper para cache com fallback
export async function withCache<T>(
  key: string,
  params: Record<string, any>,
  fetchFunction: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Tentar buscar do cache primeiro
  const cached = await cacheManager.get<T>(key, params, options);
  if (cached !== null) {
    return cached;
  }

  // Se não encontrou no cache, executar a função
  const data = await fetchFunction();
  
  // Salvar no cache para próximas consultas
  await cacheManager.set(key, data, params, options);
  
  return data;
}

export default redis;
