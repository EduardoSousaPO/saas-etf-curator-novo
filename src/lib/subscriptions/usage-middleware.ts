import { SubscriptionService } from './subscription-service';

export type UsageType = 'screener_queries' | 'export_reports' | 'portfolio_simulations';

export class UsageMiddleware {
  
  // Verificar se usuário pode executar ação
  static async checkUsageLimit(
    userId: string, 
    usageType: UsageType
  ): Promise<{ allowed: boolean; message?: string; remaining?: number }> {
    try {
      // Verificar se atingiu limite
      const hasReachedLimit = await SubscriptionService.hasReachedLimit(userId, usageType);
      
      if (hasReachedLimit) {
        const subscription = await SubscriptionService.getUserSubscription(userId);
        const planName = subscription?.plan || 'STARTER';
        
        return {
          allowed: false,
          message: `Limite de ${this.getUsageDisplayName(usageType)} atingido para o plano ${planName}. Faça upgrade para continuar.`
        };
      }

      // Buscar limite atual para mostrar quantos restam
      const limits = await SubscriptionService.getCurrentUsageLimits(userId);
      if (limits) {
        const limitField = `${usageType}_limit` as keyof typeof limits;
        const usedField = `${usageType}_used` as keyof typeof limits;
        
        const limit = limits[limitField] as number;
        const used = limits[usedField] as number;
        
        const remaining = limit ? limit - used : null;
        
        return {
          allowed: true,
          remaining: remaining || undefined
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Erro ao verificar limite de uso:', error);
      return { allowed: true }; // Em caso de erro, permitir uso
    }
  }

  // Executar ação com incremento de uso
  static async executeWithUsageTracking<T>(
    userId: string,
    usageType: UsageType,
    action: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      // Verificar limite antes de executar
      const limitCheck = await this.checkUsageLimit(userId, usageType);
      
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.message
        };
      }

      // Executar ação
      const result = await action();

      // Incrementar uso após sucesso
      await SubscriptionService.incrementUsage(userId, usageType);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Erro ao executar ação com tracking:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Verificar se usuário pode acessar funcionalidade
  static async checkFeatureAccess(
    userId: string, 
    featureKey: string
  ): Promise<{ allowed: boolean; message?: string }> {
    try {
      const canAccess = await SubscriptionService.canUserAccessFeature(userId, featureKey);
      
      if (!canAccess) {
        const subscription = await SubscriptionService.getUserSubscription(userId);
        const planName = subscription?.plan || 'STARTER';
        
        return {
          allowed: false,
          message: `Esta funcionalidade não está disponível no plano ${planName}. Faça upgrade para acessar.`
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Erro ao verificar acesso à funcionalidade:', error);
      return { allowed: true }; // Em caso de erro, permitir acesso
    }
  }

  // Obter nome amigável do tipo de uso
  private static getUsageDisplayName(usageType: UsageType): string {
    const displayNames = {
      'screener_queries': 'consultas no screener',
      'export_reports': 'exportações de relatórios',
      'portfolio_simulations': 'simulações de carteira'
    };
    
    return displayNames[usageType] || usageType;
  }

  // Obter estatísticas de uso do usuário
  static async getUserUsageStats(userId: string): Promise<{
    screenerQueries: { used: number; limit: number | null };
    exportReports: { used: number; limit: number | null };
    portfolioSimulations: { used: number; limit: number | null };
    periodStart: string;
    periodEnd: string;
  } | null> {
    try {
      const limits = await SubscriptionService.getCurrentUsageLimits(userId);
      
      if (!limits) {
        return null;
      }

      return {
        screenerQueries: {
          used: limits.screener_queries_used,
          limit: limits.screener_queries_limit
        },
        exportReports: {
          used: limits.export_reports_used,
          limit: limits.export_reports_limit
        },
        portfolioSimulations: {
          used: limits.portfolio_simulations_used,
          limit: limits.portfolio_simulations_limit
        },
        periodStart: limits.period_start,
        periodEnd: limits.period_end
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de uso:', error);
      return null;
    }
  }
} 