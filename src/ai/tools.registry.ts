/**
 * Registry de Tools - Vista ETF AI
 * Mapeia tools para APIs internas e externas
 */

import { z } from 'zod';

// Interface da Tool
export interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<any>;      // Schema Zod para validação
  endpoint?: string;                  // Rota HTTP do backend Vista
  method?: "GET" | "POST" | "PUT";
  usesPerplexity?: boolean;          // true apenas para notícias
  category: 'portfolio' | 'analysis' | 'data' | 'news' | 'config';
  estimatedTimeMs: number;
}

// Base URL das APIs (configurável via env)
const VISTA_API_BASE = process.env.VISTA_API_BASE || process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : 'http://localhost:3001/api';

// Schemas de validação usando Zod
const PortfolioGoalSchema = z.enum(['aposentadoria', 'casa', 'emergencia', 'crescimento']);
const RiskProfileSchema = z.enum(['conservador', 'moderado', 'arrojado']);
const CurrencySchema = z.enum(['BRL', 'USD']);
const RankingCategorySchema = z.enum([
  'BestPerformance', 'RiskAdjusted', 'Income', 
  'Liquidity', 'Downside', 'Stability'
]);

// Registry de Tools
export const TOOLS_REGISTRY: ToolDef[] = [
  // ===== PORTFOLIO TOOLS =====
  {
    name: "portfolio_create_optimized",
    description: "Criar carteira otimizada via Portfolio Master usando teoria de Markowitz",
    category: 'portfolio',
    endpoint: `${VISTA_API_BASE}/portfolio/unified-master`,
    method: "POST",
    estimatedTimeMs: 8000,
    inputSchema: z.object({
      goal: PortfolioGoalSchema,
      risk_profile: RiskProfileSchema,
      amount: z.number().min(1000, "Valor mínimo: R$ 1.000"),
      currency: CurrencySchema,
      time_horizon: z.number().min(1).max(50).optional(),
      simulate: z.boolean().default(true),
      user_id: z.string().optional(),
    }),
  },

  {
    name: "dashboard_performance",
    description: "Obter performance detalhada do dashboard/carteira do usuário",
    category: 'portfolio',
    endpoint: `${VISTA_API_BASE}/wealth/dashboard`,
    method: "GET",
    estimatedTimeMs: 4000,
    inputSchema: z.object({
      portfolio_id: z.string().optional(),
      planId: z.string().optional(),
      period: z.enum(['1M', '3M', '6M', '1Y', '3Y', '5Y', '10Y', 'MAX']).default('1Y'),
      include_projections: z.boolean().default(true),
      user_id: z.string().optional(),
    }),
  },

  {
    name: "rebalance_suggest",
    description: "Sugerir rebalanceamento usando regra 5/25 + alocação de aportes",
    category: 'portfolio',
    endpoint: `${VISTA_API_BASE}/wealth/rebalance`,
    method: "POST",
    estimatedTimeMs: 6000,
    inputSchema: z.object({
      portfolio_id: z.string(),
      planId: z.string().optional(),
      next_contribution: z.number().min(0).optional(),
      rebalance_type: z.enum(['bands', 'hard']).default('bands'),
      simulate: z.boolean().default(true),
    }),
  },

  // ===== ANALYSIS TOOLS =====
  {
    name: "screener_filter",
    description: "Filtrar ETFs usando screener avançado com 50+ critérios",
    category: 'analysis',
    endpoint: `${VISTA_API_BASE}/etfs/screener`,
    method: "POST",
    estimatedTimeMs: 3000,
    inputSchema: z.object({
      filters: z.object({
        // Filtros financeiros
        expense_ratio_max: z.number().min(0).max(3).optional(),
        aum_min: z.number().min(0).optional(),
        nav_min: z.number().min(0).optional(),
        nav_max: z.number().min(0).optional(),
        volume_min: z.number().min(0).optional(),
        
        // Filtros de performance
        returns_1y_min: z.number().optional(),
        returns_3y_min: z.number().optional(),
        returns_5y_min: z.number().optional(),
        volatility_max: z.number().min(0).max(100).optional(),
        sharpe_ratio_min: z.number().optional(),
        max_drawdown_max: z.number().min(0).max(100).optional(),
        
        // Filtros de dividendos
        dividend_yield_min: z.number().min(0).max(20).optional(),
        
        // Filtros de categorização
        category: z.string().optional(),
        region: z.string().optional(),
        sector: z.string().optional(),
        
        // Filtros temporais
        inception_date_before: z.string().optional(),
        data_quality_min: z.number().min(0).max(100).optional(),
      }),
      sort_primary: z.string().default('returns_1y'),
      sort_secondary: z.string().optional(),
      limit: z.number().min(1).max(100).default(15),
      simulate: z.boolean().default(true),
    }),
  },

  {
    name: "compare_etfs",
    description: "Comparar múltiplos ETFs com análise detalhada",
    category: 'analysis',
    endpoint: `${VISTA_API_BASE}/etfs/compare`,
    method: "POST",
    estimatedTimeMs: 5000,
    inputSchema: z.object({
      symbols: z.array(z.string().min(1).max(10))
        .min(2, "Mínimo 2 ETFs para comparação")
        .max(6, "Máximo 6 ETFs para comparação"),
      period: z.enum(['1Y', '3Y', '5Y', '10Y', 'MAX']).default('5Y'),
      metrics: z.array(z.string()).optional(),
      include_correlation: z.boolean().default(true),
      simulate: z.boolean().default(true),
    }),
  },

  {
    name: "performance_analysis",
    description: "Análise de performance histórica detalhada",
    category: 'analysis',
    endpoint: `${VISTA_API_BASE}/market/metrics`,
    method: "POST",
    estimatedTimeMs: 4000,
    inputSchema: z.object({
      symbols: z.array(z.string().min(1).max(10)).min(1),
      period: z.string().default('5Y'),
      benchmarks: z.array(z.string()).optional(),
      simulate: z.boolean().default(true),
    }),
  },

  {
    name: "analyze_correlation",
    description: "Análise de matriz de correlação entre ETFs",
    category: 'analysis',
    endpoint: `${VISTA_API_BASE}/etfs/correlation`,
    method: "POST",
    estimatedTimeMs: 3000,
    inputSchema: z.object({
      symbols: z.array(z.string().min(1).max(10))
        .min(2, "Mínimo 2 ETFs para correlação"),
      period: z.string().default('3Y'),
      simulate: z.boolean().default(true),
    }),
  },

  // ===== DATA TOOLS =====
  {
    name: "rankings_get",
    description: "Obter rankings dinâmicos de ETFs por categoria",
    category: 'data',
    endpoint: `${VISTA_API_BASE}/etfs/rankings`,
    method: "GET",
    estimatedTimeMs: 2000,
    inputSchema: z.object({
      category: RankingCategorySchema,
      limit: z.number().min(1).max(50).default(15),
      time_period: z.string().optional(),
      min_aum: z.number().min(0).optional(),
    }),
  },

  {
    name: "etf_details",
    description: "Obter detalhes completos de um ETF específico",
    category: 'data',
    endpoint: `${VISTA_API_BASE}/etfs/details`,
    method: "GET",
    estimatedTimeMs: 2000,
    inputSchema: z.object({
      symbol: z.string().min(1).max(10),
      include_holdings: z.boolean().default(false),
      include_performance: z.boolean().default(true),
    }),
  },

  // ===== NEWS TOOLS (Perplexity) =====
  {
    name: "perplexity_news_search",
    description: "Buscar notícias recentes sobre ETFs via Perplexity",
    category: 'news',
    usesPerplexity: true,
    estimatedTimeMs: 5000,
    inputSchema: z.object({
      query: z.string().min(3, "Query muito curta"),
      recencyDays: z.number().min(1).max(30).default(7),
      sources: z.array(z.string()).optional(),
      language: z.enum(['pt', 'en']).default('pt'),
      max_results: z.number().min(3).max(10).default(5),
    }),
  },

  // ===== CONFIG TOOLS =====
  {
    name: "alerts_configure",
    description: "Configurar alertas inteligentes para carteira",
    category: 'config',
    endpoint: `${VISTA_API_BASE}/alerts/configure`,
    method: "POST",
    estimatedTimeMs: 3000,
    inputSchema: z.object({
      portfolio_id: z.string(),
      rules: z.array(z.object({
        type: z.enum(['price_change', 'allocation_drift', 'rebalance_needed', 'news_alert']),
        threshold: z.number(),
        condition: z.enum(['above', 'below', 'equals']),
        enabled: z.boolean().default(true),
      })),
      frequency: z.enum(['immediate', 'daily', 'weekly']).default('daily'),
      channels: z.array(z.enum(['email', 'push', 'sms'])).default(['email']),
    }),
  },
];

// Utilitários para trabalhar com tools
export function getToolByName(name: string): ToolDef | undefined {
  return TOOLS_REGISTRY.find(tool => tool.name === name);
}

export function getToolsByCategory(category: ToolDef['category']): ToolDef[] {
  return TOOLS_REGISTRY.filter(tool => tool.category === category);
}

export function validateToolInput(toolName: string, input: any): { success: boolean; data?: any; error?: string } {
  const tool = getToolByName(toolName);
  if (!tool) {
    return { success: false, error: `Tool '${toolName}' não encontrada` };
  }

  try {
    const validatedData = tool.inputSchema.parse(input);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: `Validação falhou: ${errorMessages.join(', ')}` };
    }
    return { success: false, error: 'Erro de validação desconhecido' };
  }
}

export function getToolsForIntent(intentName: string): ToolDef[] {
  // Esta função seria preenchida com base nas intents
  // Por agora, retorna todas as tools (será refinada)
  return TOOLS_REGISTRY;
}

// Configurações de rate limiting por tool
export const TOOL_RATE_LIMITS: Record<string, { callsPerMinute: number; tokensPerCall?: number }> = {
  portfolio_create_optimized: { callsPerMinute: 10 },
  screener_filter: { callsPerMinute: 30 },
  rankings_get: { callsPerMinute: 60 },
  compare_etfs: { callsPerMinute: 20 },
  dashboard_performance: { callsPerMinute: 40 },
  perplexity_news_search: { callsPerMinute: 20, tokensPerCall: 2000 },
};

