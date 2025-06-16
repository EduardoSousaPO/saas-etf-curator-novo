export interface MetricCategory {
  label: string;
  icon: string;
  metrics: string[];
  description: string;
}

export const ETF_METRIC_CATEGORIES = {
  performance: {
    label: 'Desempenho',
    icon: '📈',
    metrics: ['returns_12m', 'returns_5y', 'sharpe_12m', 'beta'],
    description: 'Métricas relacionadas ao retorno e performance histórica'
  },
  risk: {
    label: 'Risco',
    icon: '⚠️',
    metrics: ['volatility_12m', 'max_drawdown'],
    description: 'Indicadores de risco e volatilidade em diferentes períodos'
  },
  fundamentals: {
    label: 'Fundamentos',
    icon: '💰',
    metrics: ['total_assets', 'expense_ratio', 'dividend_yield', 'volume', 'pe_ratio', 'pb_ratio'],
    description: 'Características fundamentais do ETF'
  },
  composition: {
    label: 'Composição',
    icon: '🔍',
    metrics: ['top_holdings', 'sector_allocation', 'geographic_exposure'],
    description: 'Detalhes sobre a composição e holdings'
  }
} as const;

export type CategoryKey = keyof typeof ETF_METRIC_CATEGORIES; 