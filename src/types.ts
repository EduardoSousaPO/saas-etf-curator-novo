// src/types.ts
// Common types used throughout the application

// ETF type definition based on our database schema
export interface ETF {
  id?: string;
  symbol: string;
  
  // Dados básicos (tabela etf_list)
  name?: string | null;
  description?: string | null;
  assetclass?: string | null;
  etfcompany?: string | null;
  
  // Dados financeiros básicos (tabela etf_list)
  expense_ratio?: number | null;        // expenseratio
  total_assets?: number | null;         // assetsundermanagement
  volume?: number | null;               // avgvolume
  avgvolume?: number | null;            // avgvolume (campo adicional)
  inception_date?: string | null;       // inceptiondate
  nav?: number | null;                  // nav
  holdings_count?: number | null;       // holdingscount
  
  // Métricas de retorno (tabela calculated_metrics)
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  returns_5y?: number | null;
  ten_year_return?: number | null;
  
  // Métricas de volatilidade (tabela calculated_metrics)
  volatility_12m?: number | null;
  volatility_24m?: number | null;
  volatility_36m?: number | null;
  ten_year_volatility?: number | null;
  
  // Métricas de Sharpe (tabela calculated_metrics)
  sharpe_12m?: number | null;
  sharpe_24m?: number | null;
  sharpe_36m?: number | null;
  ten_year_sharpe?: number | null;
  
  // Outras métricas (tabela calculated_metrics)
  max_drawdown?: number | null;
  dividends_12m?: number | null;
  dividends_24m?: number | null;
  dividends_36m?: number | null;
  dividends_all_time?: number | null;
  
  // Campos calculados/derivados
  dividend_yield?: number | null;
  
  // Campos legados (manter para compatibilidade)
  pe_ratio?: number | null;
  price_to_book?: number | null;
  average_market_cap?: number | null;
  number_of_holdings?: number | null;
  beta_3y?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  
  [key: string]: any; // Para compatibilidade com acesso dinâmico
} 