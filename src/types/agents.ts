// Tipos para o sistema de agentes de IA do ETF Curator

export enum UserIntent {
  PORTFOLIO_OPTIMIZATION = 'optimize_portfolio',
  ETF_SCREENING = 'screen_etfs',
  ETF_COMPARISON = 'compare_etfs',
  MARKET_ANALYSIS = 'analyze_market',
  EDUCATIONAL = 'explain_concept',
  PROJECT_MANAGEMENT = 'manage_project',
  RANKINGS_ANALYSIS = 'analyze_rankings',
  REBALANCING = 'rebalance_portfolio',
  ERROR = 'error'
}

export interface ExecutionPlan {
  intent: UserIntent;
  parameters: Record<string, any>;
  executionSteps: string[];
  requiredAPIs: string[];
  confidence?: number;
  timestamp?: Date;
  userContext?: UserContext;
}

export interface UserContext {
  userId: string;
  subscriptionPlan: 'STARTER' | 'PRO' | 'WEALTH' | 'OFFSHORE';
  preferences?: UserPreferences;
  portfolios?: PortfolioSummary[];
  lastUpdated?: Date;
}

export interface UserPreferences {
  language: string;
  currency: 'USD' | 'BRL';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  investmentGoal?: string;
  preferredSectors?: string[];
  timeHorizon?: string;
}

export interface PortfolioSummary {
  id: string;
  name: string;
  totalValue: number;
  lastUpdated: Date;
}

export interface APIResult {
  success: boolean;
  data: any;
  source?: string;
  timestamp?: Date;
  processingTime?: number;
  metadata?: {
    processingTime: number;
    apisCalled: string[];
    intent: UserIntent;
  };
  error?: string;
}

export interface MemoryEntry {
  key: string;
  value: any;
  timestamp: string;
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  timestamp: Date;
  messages: Message[];
  extractedEntities: Entity[];
  userPreferences: UserPreferences;
  projectsReferenced: string[];
  duration?: number;
  primaryIntent?: UserIntent;
  lastUpdated: Date;
  lastMessage?: string;
  lastResponse?: string;
  lastIntent?: string;
  messageCount?: number;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    intent?: UserIntent;
    executedAPIs?: string[];
    processingTime?: number;
  };
}

export interface Entity {
  name: string;
  type: string;
  confidence: number;
  value: any;
}

export interface SavedProject {
  id: string;
  name: string;
  type: 'portfolio' | 'analysis' | 'strategy';
  data: any;
  createdAt: Date;
  lastAccessed: Date;
  tags: string[];
  userId: string;
}

// Mapeamento de APIs por intenção
export const API_MAPPINGS = {
  [UserIntent.PORTFOLIO_OPTIMIZATION]: {
    endpoint: '/api/portfolio/unified-master',
    requiredParams: ['objective', 'riskProfile', 'investment'],
    optionalParams: ['currency', 'constraints']
  },
  [UserIntent.ETF_SCREENING]: {
    endpoint: '/api/etfs/screener',
    requiredParams: ['filters'],
    optionalParams: ['sortBy', 'limit']
  },
  [UserIntent.ETF_COMPARISON]: {
    endpoint: '/api/etfs/comparator',
    requiredParams: ['symbols'],
    optionalParams: ['metrics']
  },
  [UserIntent.RANKINGS_ANALYSIS]: {
    endpoint: '/api/etfs/rankings',
    requiredParams: ['category'],
    optionalParams: ['limit']
  },
  [UserIntent.MARKET_ANALYSIS]: {
    endpoint: '/api/market/metrics',
    requiredParams: [],
    optionalParams: ['timeframe']
  },
  [UserIntent.REBALANCING]: {
    endpoint: '/api/portfolio/rebalance',
    requiredParams: ['portfolioId'],
    optionalParams: ['threshold']
  }
};

// Matriz de permissões por plano
export const PERMISSION_MATRIX = {
  [UserIntent.PORTFOLIO_OPTIMIZATION]: ['STARTER', 'PRO', 'WEALTH', 'OFFSHORE'],
  [UserIntent.ETF_SCREENING]: ['PRO', 'WEALTH', 'OFFSHORE'],
  [UserIntent.ETF_COMPARISON]: ['STARTER', 'PRO', 'WEALTH', 'OFFSHORE'],
  [UserIntent.MARKET_ANALYSIS]: ['PRO', 'WEALTH', 'OFFSHORE'],
  [UserIntent.EDUCATIONAL]: ['STARTER', 'PRO', 'WEALTH', 'OFFSHORE'],
  [UserIntent.PROJECT_MANAGEMENT]: ['WEALTH', 'OFFSHORE'],
  [UserIntent.RANKINGS_ANALYSIS]: ['STARTER', 'PRO', 'WEALTH', 'OFFSHORE'],
  [UserIntent.REBALANCING]: ['WEALTH', 'OFFSHORE']
};

export interface AgentResponse {
  content: string;
  metadata?: {
    intent: UserIntent;
    confidence: number;
    executedAPIs: string[];
    processingTime: number;
    sources?: string[];
  };
  suggestions?: string[];
  followUpActions?: string[];
}

export interface FormattedResponse {
  content: string;
  insights: string[];
  nextSteps: string[];
  metadata?: {
    intent: UserIntent;
    timestamp: string;
    dataSource?: string;
    userPlan?: string;
    processingTime?: number;
    totalApiTime?: number;
    isError?: boolean;
    error?: string;
    errorCode?: string;
    agentsUsed?: string[];
    sessionId?: string;
    messageCount?: number;
    originalMessage?: string;
    llmUsed?: boolean;
  };
}

export interface AuditLog {
  userId: string;
  sessionId: string;
  intent: UserIntent;
  apisCalled: string[];
  processingTime: number;
  success: boolean;
  error?: string;
  timestamp: Date;
  userPlan: string;
} 