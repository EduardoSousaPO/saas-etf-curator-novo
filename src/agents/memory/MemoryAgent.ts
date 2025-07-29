import { ConversationContext, UserContext, MemoryEntry } from '../../types/agents';

export class MemoryAgent {
  private conversationMemory: Map<string, ConversationContext> = new Map();
  private userMemory: Map<string, UserContext> = new Map();
  private globalMemory: Map<string, MemoryEntry> = new Map();

  constructor() {
    console.log('💾 MemoryAgent inicializado');
  }

  async saveConversationContext(context: ConversationContext): Promise<boolean> {
    try {
      console.log(`💾 Salvando contexto da sessão: ${context.sessionId}`);
      
      // Salvar no mapa local (memória volátil)
      this.conversationMemory.set(context.sessionId, {
        ...context,
        lastUpdated: new Date()
      });

      // Simular salvamento persistente (aqui poderia integrar com Supabase)
      const memoryEntry: MemoryEntry = {
        key: `conversation_${context.sessionId}`,
        value: context,
        timestamp: new Date().toISOString()
      };

      this.globalMemory.set(memoryEntry.key, memoryEntry);

      console.log(`✅ Contexto salvo para sessão: ${context.sessionId}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar contexto:', error);
      return false;
    }
  }

  async retrieveContext(sessionId: string): Promise<ConversationContext | null> {
    try {
      console.log(`💾 Recuperando contexto da sessão: ${sessionId}`);
      
      // Tentar recuperar da memória local primeiro
      const localContext = this.conversationMemory.get(sessionId);
      if (localContext) {
        console.log(`✅ Contexto encontrado na memória local`);
        return localContext;
      }

      // Recuperar da memória global
      const globalEntry = this.globalMemory.get(`conversation_${sessionId}`);
      if (globalEntry && globalEntry.value) {
        console.log(`✅ Contexto encontrado na memória global`);
        // Atualizar memória local
        this.conversationMemory.set(sessionId, globalEntry.value as ConversationContext);
        return globalEntry.value as ConversationContext;
      }

      console.log(`⚠️ Contexto não encontrado para sessão: ${sessionId}`);
      return null;

    } catch (error) {
      console.error('❌ Erro ao recuperar contexto:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserContext>): Promise<boolean> {
    try {
      console.log(`💾 Atualizando perfil do usuário: ${userId}`);
      
      const existingProfile = this.userMemory.get(userId) || {} as UserContext;
      
      const updatedProfile: UserContext = {
        ...existingProfile,
        ...updates,
        userId,
        lastUpdated: new Date()
      };

      // Atualizar memória local
      this.userMemory.set(userId, updatedProfile);

      // Salvar na memória global
      const memoryEntry: MemoryEntry = {
        key: `user_profile_${userId}`,
        value: updatedProfile,
        timestamp: new Date().toISOString()
      };

      this.globalMemory.set(memoryEntry.key, memoryEntry);

      console.log(`✅ Perfil atualizado para usuário: ${userId}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return false;
    }
  }

  async getUserProfile(userId: string): Promise<UserContext | null> {
    try {
      console.log(`💾 Recuperando perfil do usuário: ${userId}`);
      
      // Tentar recuperar da memória local
      const localProfile = this.userMemory.get(userId);
      if (localProfile) {
        console.log(`✅ Perfil encontrado na memória local`);
        return localProfile;
      }

      // Recuperar da memória global
      const globalEntry = this.globalMemory.get(`user_profile_${userId}`);
      if (globalEntry && globalEntry.value) {
        console.log(`✅ Perfil encontrado na memória global`);
        // Atualizar memória local
        this.userMemory.set(userId, globalEntry.value as UserContext);
        return globalEntry.value as UserContext;
      }

      console.log(`⚠️ Perfil não encontrado para usuário: ${userId}`);
      return null;

    } catch (error) {
      console.error('❌ Erro ao recuperar perfil:', error);
      return null;
    }
  }

  async analyzeUserPatterns(userId: string): Promise<{
    patterns: string[];
    recommendations: string[];
    analysisDate: string;
  }> {
    try {
      console.log(`🔍 Analisando padrões do usuário: ${userId}`);
      
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        return { 
          patterns: [], 
          recommendations: ['Criar perfil de usuário'], 
          analysisDate: new Date().toISOString() 
        };
      }

      // Analisar histórico de conversas do usuário
      const userConversations = this.getUserConversations(userId);
      
      const patterns = this.identifyPatterns(userConversations, profile);
      const recommendations = this.generateRecommendations(patterns, profile);

      return {
        patterns,
        recommendations,
        analysisDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro na análise de padrões:', error);
      return { 
        patterns: [], 
        recommendations: [], 
        analysisDate: new Date().toISOString() 
      };
    }
  }

  private getUserConversations(userId: string): ConversationContext[] {
    const conversations: ConversationContext[] = [];
    
    // Buscar conversas do usuário em ambas as memórias
    for (const context of this.conversationMemory.values()) {
      if (context.userId === userId) {
        conversations.push(context);
      }
    }
    
    // Buscar também na memória global
    for (const entry of this.globalMemory.values()) {
      if (entry.key.startsWith('conversation_') && entry.value) {
        const context = entry.value as ConversationContext;
        if (context.userId === userId && !conversations.find(c => c.sessionId === context.sessionId)) {
          conversations.push(context);
        }
      }
    }
    
    return conversations.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  private identifyPatterns(conversations: ConversationContext[], profile: UserContext): string[] {
    const patterns: string[] = [];
    
    if (conversations.length === 0) {
      return ['Usuário novo - sem histórico de conversas'];
    }

    // Analisar frequência de intenções
    const intentCounts: Record<string, number> = {};
    conversations.forEach(conv => {
      if (conv.lastIntent) {
        intentCounts[conv.lastIntent] = (intentCounts[conv.lastIntent] || 0) + 1;
      }
    });

    const mostCommonIntent = Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonIntent) {
      patterns.push(`Interesse principal: ${this.translateIntent(mostCommonIntent[0])} (${mostCommonIntent[1]} consultas)`);
    }

    // Analisar frequência de uso
    const totalConversations = conversations.length;
    if (totalConversations > 10) {
      patterns.push('Usuário ativo - alta frequência de uso');
    } else if (totalConversations > 3) {
      patterns.push('Usuário regular - uso moderado');
    } else {
      patterns.push('Usuário iniciante - explorando funcionalidades');
    }

    // Analisar período de atividade
    const firstConversation = conversations[conversations.length - 1];
    const lastConversation = conversations[0];
    const daysSinceFirst = Math.floor(
      (lastConversation.lastUpdated.getTime() - firstConversation.lastUpdated.getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    if (daysSinceFirst > 30) {
      patterns.push('Usuário de longo prazo - mais de 30 dias de uso');
    } else if (daysSinceFirst > 7) {
      patterns.push('Usuário estabelecido - várias semanas de uso');
    } else {
      patterns.push('Usuário recente - primeiros dias de uso');
    }

    // Analisar preferências do perfil
    if (profile.preferences) {
      const { riskTolerance, investmentGoal, preferredSectors } = profile.preferences;
      
      if (riskTolerance) {
        patterns.push(`Perfil de risco: ${this.translateRiskTolerance(riskTolerance)}`);
      }
      
      if (investmentGoal) {
        patterns.push(`Objetivo: ${this.translateInvestmentGoal(investmentGoal)}`);
      }
      
      if (preferredSectors && preferredSectors.length > 0) {
        patterns.push(`Setores de interesse: ${preferredSectors.join(', ')}`);
      }
    }

    return patterns;
  }

  private generateRecommendations(patterns: string[], profile: UserContext): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas no plano de assinatura
    if (profile.subscriptionPlan === 'STARTER') {
      recommendations.push('Considerar upgrade para PRO para acessar otimização de portfolios');
      recommendations.push('Explorar funcionalidades gratuitas de screening e educação');
    } else if (profile.subscriptionPlan === 'PRO') {
      recommendations.push('Explorar funcionalidades de rebalanceamento automático');
      recommendations.push('Considerar upgrade para WEALTH para gestão avançada');
    }

    // Recomendações baseadas em padrões de uso
    const hasPortfolioInterest = patterns.some(p => 
      p.includes('PORTFOLIO_OPTIMIZATION') || p.includes('REBALANCING')
    );
    
    if (hasPortfolioInterest) {
      recommendations.push('Configurar alertas de rebalanceamento');
      recommendations.push('Revisar alocações trimestralmente');
    }

    const hasEducationalInterest = patterns.some(p => 
      p.includes('EDUCATIONAL')
    );
    
    if (hasEducationalInterest) {
      recommendations.push('Explorar conteúdos educativos avançados');
      recommendations.push('Participar de webinars sobre ETFs');
    }

    // Recomendações baseadas no perfil de risco
    if (profile.preferences?.riskTolerance === 'conservative') {
      recommendations.push('Focar em ETFs de bonds e dividendos');
      recommendations.push('Considerar diversificação internacional');
    } else if (profile.preferences?.riskTolerance === 'aggressive') {
      recommendations.push('Explorar ETFs de crescimento e tecnologia');
      recommendations.push('Considerar ETFs de small caps');
    }

    // Recomendação padrão se não há recomendações específicas
    if (recommendations.length === 0) {
      recommendations.push('Explorar diferentes funcionalidades da plataforma');
      recommendations.push('Definir objetivos de investimento claros');
      recommendations.push('Revisar perfil de risco regularmente');
    }

    return recommendations.slice(0, 5); // Limitar a 5 recomendações
  }

  // Métodos utilitários para tradução
  private translateIntent(intent: string): string {
    const translations: Record<string, string> = {
      'PORTFOLIO_OPTIMIZATION': 'Otimização de Portfolio',
      'ETF_SCREENING': 'Filtros de ETFs',
      'ETF_COMPARISON': 'Comparação de ETFs',
      'MARKET_ANALYSIS': 'Análise de Mercado',
      'EDUCATIONAL': 'Educação Financeira',
      'RANKINGS_ANALYSIS': 'Rankings',
      'REBALANCING': 'Rebalanceamento',
      'PROJECT_MANAGEMENT': 'Gestão de Projetos'
    };
    
    return translations[intent] || intent;
  }

  private translateRiskTolerance(risk: string): string {
    const translations: Record<string, string> = {
      'low': 'Conservador',
      'medium': 'Moderado',
      'high': 'Agressivo'
    };
    
    return translations[risk] || risk;
  }

  private translateInvestmentGoal(goal: string): string {
    const translations: Record<string, string> = {
      'retirement': 'Aposentadoria',
      'growth': 'Crescimento',
      'income': 'Renda',
      'preservation': 'Preservação',
      'speculation': 'Especulação'
    };
    
    return translations[goal] || goal;
  }

  // Métodos para estatísticas e limpeza
  getMemoryStats(): {
    conversations: number;
    users: number;
    globalEntries: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    const conversationEntries = Array.from(this.conversationMemory.values());
    const globalEntries = Array.from(this.globalMemory.values());
    
    const allTimestamps = [
      ...conversationEntries.map(c => c.lastUpdated.toISOString()),
      ...globalEntries.map(e => e.timestamp)
    ].sort();

    return {
      conversations: this.conversationMemory.size,
      users: this.userMemory.size,
      globalEntries: this.globalMemory.size,
      oldestEntry: allTimestamps[0] || null,
      newestEntry: allTimestamps[allTimestamps.length - 1] || null
    };
  }

  async cleanupOldEntries(maxAgeHours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    let deletedCount = 0;

    // Limpar conversas antigas da memória local
    for (const [sessionId, context] of this.conversationMemory.entries()) {
      if (context.lastUpdated < cutoffTime) {
        this.conversationMemory.delete(sessionId);
        deletedCount++;
      }
    }

    // Limpar entradas antigas da memória global
    for (const [key, entry] of this.globalMemory.entries()) {
      if (new Date(entry.timestamp) < cutoffTime) {
        this.globalMemory.delete(key);
        deletedCount++;
      }
    }

    console.log(`🧹 Limpeza concluída: ${deletedCount} entradas antigas removidas`);
    return deletedCount;
  }

  // Métodos para busca e consulta
  async searchConversations(query: string, userId?: string): Promise<ConversationContext[]> {
    const allConversations = userId 
      ? this.getUserConversations(userId)
      : Array.from(this.conversationMemory.values());

    const queryLower = query.toLowerCase();
    
    return allConversations.filter(conv => 
      conv.lastMessage?.toLowerCase().includes(queryLower) ||
      conv.lastResponse?.toLowerCase().includes(queryLower) ||
      conv.lastIntent?.toLowerCase().includes(queryLower)
    );
  }

  async exportUserData(userId: string): Promise<{
    profile: UserContext | null;
    conversations: ConversationContext[];
    patterns: any;
  }> {
    const profile = await this.getUserProfile(userId);
    const conversations = this.getUserConversations(userId);
    const patterns = await this.analyzeUserPatterns(userId);

    return {
      profile,
      conversations,
      patterns
    };
  }

  // Health check
  getStatus(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
} 