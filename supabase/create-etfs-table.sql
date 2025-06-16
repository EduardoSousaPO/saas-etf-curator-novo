-- Script para criar tabela ETFs no Supabase
-- Execute este script no SQL Editor do Supabase Web

CREATE TABLE IF NOT EXISTS public.etfs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol text UNIQUE NOT NULL,
  name text,
  description text,
  category text,
  exchange text,
  inception_date date,
  total_assets decimal,
  volume decimal,
  ten_year_return decimal,
  returns_12m decimal,
  returns_24m decimal,
  returns_36m decimal,
  volatility_12m decimal,
  volatility_24m decimal,
  volatility_36m decimal,
  ten_year_volatility decimal,
  sharpe_12m decimal,
  sharpe_24m decimal,
  sharpe_36m decimal,
  ten_year_sharpe decimal,
  max_drawdown decimal,
  dividends_12m decimal,
  dividends_24m decimal,
  dividends_36m decimal,
  dividends_all_time decimal,
  dividend_yield decimal,
  start_date date,
  end_date date,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_etfs_symbol ON public.etfs (symbol);

-- Inserir dados de exemplo para testar
INSERT INTO public.etfs (
  symbol, name, category, total_assets, volume, returns_12m, 
  volatility_12m, dividend_yield, sharpe_12m
) VALUES 
('SPY', 'SPDR S&P 500 ETF Trust', 'Large Cap Blend', 400000000000, 50000000, 12.5, 16.2, 1.8, 0.77),
('QQQ', 'Invesco QQQ Trust', 'Technology', 180000000000, 30000000, 18.3, 24.1, 0.6, 0.76),
('VTI', 'Vanguard Total Stock Market ETF', 'Total Market', 320000000000, 25000000, 11.8, 15.9, 1.4, 0.74),
('MSCI', 'MSCI Inc.', 'Financial Services', 40000000000, 5000000, 15.2, 22.3, 2.1, 0.68),
('BND', 'Vanguard Total Bond Market ETF', 'Bonds', 280000000000, 8000000, -2.1, 4.2, 4.3, -0.5),
('GLD', 'SPDR Gold Shares', 'Commodities', 60000000000, 12000000, 8.7, 18.5, 0.0, 0.47),
('IWM', 'iShares Russell 2000 ETF', 'Small Cap', 65000000000, 20000000, 5.3, 28.7, 1.2, 0.18),
('EFA', 'iShares MSCI EAFE ETF', 'International', 90000000000, 15000000, 7.2, 19.1, 2.8, 0.38),
('VEA', 'Vanguard FTSE Developed Markets ETF', 'International', 110000000000, 12000000, 6.8, 18.4, 3.1, 0.37),
('ARKK', 'ARK Innovation ETF', 'Innovation', 8000000000, 18000000, -45.2, 62.1, 0.0, -0.73)
ON CONFLICT (symbol) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT symbol, name, total_assets, returns_12m FROM public.etfs LIMIT 5; 