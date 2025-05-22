// src/types.ts
// Common types used throughout the application

// ETF type definition based on our data structure
export interface ETF {
  id?: string;
  symbol: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  exchange?: string | null;
  inception_date?: string | null;
  total_assets?: number | null;
  volume?: number | null;
  ten_year_return?: number | null;
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  returns_3y?: number | null;
  returns_5y?: number | null;
  volatility_12m?: number | null;
  volatility_24m?: number | null;
  volatility_36m?: number | null;
  ten_year_volatility?: number | null;
  sharpe_12m?: number | null;
  sharpe_24m?: number | null;
  sharpe_36m?: number | null;
  ten_year_sharpe?: number | null;
  max_drawdown?: number | null;
  dividends_12m?: number | null;
  dividends_24m?: number | null;
  dividends_36m?: number | null;
  dividends_all_time?: number | null;
  dividend_yield?: number | null;
  expense_ratio?: number | null;
  pe_ratio?: number | null;
  price_to_book?: number | null;
  average_market_cap?: number | null;
  number_of_holdings?: number | null;
  beta_3y?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  [key: string]: any; // Para compatibilidade com acesso dinâmico
} 