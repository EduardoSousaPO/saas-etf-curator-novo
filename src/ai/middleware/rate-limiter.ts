/**
 * Rate Limiter para APIs de IA - Dashboard ETF Curator
 * FASE 4: Otimização e controle de tráfego
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitConfig {
  windowMs: number;      // Janela de tempo em ms
  maxRequests: number;   // Máximo de requests por janela
  message?: string;      // Mensagem de erro customizada
  skipSuccessfulRequests?: boolean; // Não contar requests bem-sucedidos
  skipFailedRequests?: boolean;     // Não contar requests com erro
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Muitas requisições. Tente novamente em alguns minutos.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };

    // Limpeza automática a cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Verifica se o usuário pode fazer uma requisição
   */
  checkLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
    const now = Date.now();
    const key = this.generateKey(userId);
    const entry = this.store.get(key);

    if (!entry) {
      // Primeira requisição do usuário
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    // Verificar se a janela expirou
    if (now >= entry.resetTime) {
      // Reset da janela
      entry.count = 1;
      entry.resetTime = now + this.config.windowMs;
      entry.firstRequest = now;

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }

    // Verificar se excedeu o limite
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: this.config.message
      };
    }

    // Incrementar contador
    entry.count++;

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Registra uma requisição (para contagem condicional)
   */
  recordRequest(userId: string, success: boolean): void {
    if (this.config.skipSuccessfulRequests && success) return;
    if (this.config.skipFailedRequests && !success) return;

    // A contagem já foi feita em checkLimit, apenas para logging
    const key = this.generateKey(userId);
    const entry = this.store.get(key);
    
    if (entry) {
      console.log(`🚦 Rate limit - User: ${userId}, Count: ${entry.count}/${this.config.maxRequests}, Reset: ${new Date(entry.resetTime).toLocaleTimeString()}`);
    }
  }

  /**
   * Gera chave única para o usuário
   */
  private generateKey(userId: string): string {
    return `rate_limit:${userId}`;
  }

  /**
   * Remove entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Rate limiter cleanup: ${cleanedCount} entradas removidas`);
    }
  }

  /**
   * Retorna estatísticas do rate limiter
   */
  getStats(): {
    active_users: number;
    total_requests: number;
    avg_requests_per_user: number;
    users_near_limit: number;
  } {
    const now = Date.now();
    let totalRequests = 0;
    let usersNearLimit = 0;

    const activeEntries = Array.from(this.store.values()).filter(entry => now < entry.resetTime);

    activeEntries.forEach(entry => {
      totalRequests += entry.count;
      if (entry.count >= this.config.maxRequests * 0.8) { // 80% do limite
        usersNearLimit++;
      }
    });

    return {
      active_users: activeEntries.length,
      total_requests: totalRequests,
      avg_requests_per_user: activeEntries.length > 0 ? totalRequests / activeEntries.length : 0,
      users_near_limit: usersNearLimit
    };
  }

  /**
   * Reset manual do limite para um usuário
   */
  resetUser(userId: string): boolean {
    const key = this.generateKey(userId);
    const deleted = this.store.delete(key);
    
    if (deleted) {
      console.log(`🔄 Rate limit reset para usuário: ${userId}`);
    }
    
    return deleted;
  }

  /**
   * Obtém informações do limite para um usuário
   */
  getUserInfo(userId: string): {
    current_count: number;
    max_requests: number;
    reset_time: number;
    time_until_reset: number;
  } | null {
    const key = this.generateKey(userId);
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    return {
      current_count: entry.count,
      max_requests: this.config.maxRequests,
      reset_time: entry.resetTime,
      time_until_reset: Math.max(0, entry.resetTime - Date.now())
    };
  }
}

// Configurações diferentes para diferentes tipos de operação
export const chatRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  maxRequests: 50,           // 50 mensagens por 15 minutos
  message: 'Limite de mensagens atingido. Aguarde alguns minutos antes de continuar.'
});

export const insightsRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hora
  maxRequests: 20,           // 20 insights por hora
  message: 'Limite de geração de insights atingido. Aguarde uma hora.'
});

export const exportRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hora
  maxRequests: 10,           // 10 exportações por hora
  message: 'Limite de exportações atingido. Aguarde uma hora.'
});

/**
 * Middleware para Express/Next.js
 */
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return function rateLimitMiddleware(userId: string) {
    const result = limiter.checkLimit(userId);

    if (!result.allowed) {
      throw new Error(result.message || 'Rate limit exceeded');
    }

    return {
      remaining: result.remaining,
      resetTime: result.resetTime,
      headers: {
        'X-RateLimit-Limit': limiter['config'].maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000)
      }
    };
  };
}

/**
 * Função helper para aplicar rate limiting em APIs
 */
export async function withRateLimit<T>(
  limiter: RateLimiter,
  userId: string,
  operation: () => Promise<T>
): Promise<{ data: T; rateLimit: any }> {
  const rateLimitResult = limiter.checkLimit(userId);

  if (!rateLimitResult.allowed) {
    throw new Error(rateLimitResult.message || 'Rate limit exceeded');
  }

  try {
    const data = await operation();
    limiter.recordRequest(userId, true);
    
    return {
      data,
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        limit: limiter['config'].maxRequests
      }
    };
  } catch (error) {
    limiter.recordRequest(userId, false);
    throw error;
  }
}

export default RateLimiter;

