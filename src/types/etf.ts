// Tipos compartilhados para ETFs
export interface ETF {
  id?: string;
  symbol: string;
  name?: string | null;
  assetclass?: string | null;
  total_assets?: number | null;
  returns_12m?: number | null;
  sharpe_12m?: number | null;
  dividend_yield?: number | null;
  [key: string]: any; // Para outras propriedades possíveis
}

export interface ETFDetails {
  symbol: string;
  name?: string | null;
  description?: string | null;
  assetclass?: string | null;
  etfcompany?: string | null;
  expense_ratio?: number | null;
  volume?: number | null;
  inception_date?: string | null;
  nav?: number | null;
  holdings_count?: number | null;
  totalasset?: number | null;
  returns_12m?: number | null;
  returns_24m?: number | null;
  returns_36m?: number | null;
  ten_year_return?: number | null;
  volatility_12m?: number | null;
  volatility_24m?: number | null;
  volatility_36m?: number | null;
  sharpe_12m?: number | null;
  sharpe_24m?: number | null;
  sharpe_36m?: number | null;
  max_drawdown?: number | null;
  dividends_12m?: number | null;
  dividends_24m?: number | null;
  dividends_36m?: number | null;
  dividends_all_time?: number | null;
} 