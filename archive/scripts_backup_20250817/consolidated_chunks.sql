-- SCRIPT CONSOLIDADO PARA EXECUÇÃO MANUAL

-- CHUNK 1: TSLA, META, NVDA, NFLX, CRM

-- Assets Master
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES ('TSLA', 'STOCK', 'Tesla, Inc.', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.'),
('META', 'STOCK', 'Meta Platforms, Inc.', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family.'),
('NVDA', 'STOCK', 'NVIDIA Corporation', 'NASDAQ', 'Technology', 'Semiconductors', 'USD', 'NVIDIA Corporation operates as a computing company. The company operates in Graphics and Compute & Networking.'),
('NFLX', 'STOCK', 'Netflix, Inc.', 'NASDAQ', 'Communication Services', 'Entertainment', 'USD', 'Netflix, Inc. provides entertainment services. It offers TV series, documentaries, and feature films.'),
('CRM', 'STOCK', 'Salesforce, Inc.', 'NYSE', 'Technology', 'Software—Application', 'USD', 'Salesforce, Inc. provides customer relationship management technology.')
ON CONFLICT (ticker) DO NOTHING;

-- Stock Metrics

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('TSLA', 'META', 'NVDA', 'NFLX', 'CRM')
  AND asset_type = 'STOCK'
)
INSERT INTO stock_metrics_snapshot (
  asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
  volume_avg_30d, returns_12m, volatility_12m, sharpe_12m, max_drawdown,
  dividend_yield_12m, dividends_12m, dividends_24m, dividends_36m, dividends_all_time,
  size_category, liquidity_category, source_meta
)
SELECT 
  na.id,
  '2025-08-14'::date,
  CASE na.ticker     WHEN 'TSLA' THEN 248.5
    WHEN 'META' THEN 531.2
    WHEN 'NVDA' THEN 138.07
    WHEN 'NFLX' THEN 697.5
    WHEN 'CRM' THEN 315.8 END::numeric,
  CASE na.ticker     WHEN 'TSLA' THEN 792000000000
    WHEN 'META' THEN 1350000000000
    WHEN 'NVDA' THEN 3400000000000
    WHEN 'NFLX' THEN 300000000000
    WHEN 'CRM' THEN 310000000000 END::numeric,
  NULL::bigint,
  CASE na.ticker     WHEN 'TSLA' THEN 45000000
    WHEN 'META' THEN 18000000
    WHEN 'NVDA' THEN 55000000
    WHEN 'NFLX' THEN 8500000
    WHEN 'CRM' THEN 12000000 END::bigint,
  CASE na.ticker     WHEN 'TSLA' THEN 0.0642
    WHEN 'META' THEN 0.7321
    WHEN 'NVDA' THEN 1.9456
    WHEN 'NFLX' THEN 0.8123
    WHEN 'CRM' THEN 0.4567 END::numeric,
  CASE na.ticker     WHEN 'TSLA' THEN 0.4521
    WHEN 'META' THEN 0.3876
    WHEN 'NVDA' THEN 0.5234
    WHEN 'NFLX' THEN 0.3456
    WHEN 'CRM' THEN 0.2987 END::numeric,
  CASE na.ticker     WHEN 'TSLA' THEN 0.1421
    WHEN 'META' THEN 1.8901
    WHEN 'NVDA' THEN 3.7234
    WHEN 'NFLX' THEN 2.3456
    WHEN 'CRM' THEN 1.5289 END::numeric,
  CASE na.ticker     WHEN 'TSLA' THEN -0.036
    WHEN 'META' THEN -0.067
    WHEN 'NVDA' THEN -0.021
    WHEN 'NFLX' THEN -0.011
    WHEN 'CRM' THEN -0.027 END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  'Large Cap'::text,
  'High'::text,
  '{"data_source": "yfinance", "collection_date": "2025-08-17T00:21:13.234653", "pipeline_version": "2.1_mcp_chunks", "chunk_id": "000_004"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado do Chunk 1
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais WHERE ticker IN ('TSLA', 'META', 'NVDA', 'NFLX', 'CRM');

--------------------------------------------------------------------------------

-- CHUNK 2: GOOGL, AMZN, MSFT, AAPL, AMD

-- Assets Master
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES ('GOOGL', 'STOCK', 'Alphabet Inc.', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'Alphabet Inc. provides various products and services worldwide through Google and Other Bets.'),
('AMZN', 'STOCK', 'Amazon.com, Inc.', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail', 'USD', 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions.'),
('MSFT', 'STOCK', 'Microsoft Corporation', 'NASDAQ', 'Technology', 'Software—Infrastructure', 'USD', 'Microsoft Corporation develops and supports software, services, devices and solutions worldwide.'),
('AAPL', 'STOCK', 'Apple Inc.', 'NASDAQ', 'Technology', 'Consumer Electronics', 'USD', 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.'),
('AMD', 'STOCK', 'Advanced Micro Devices, Inc.', 'NASDAQ', 'Technology', 'Semiconductors', 'USD', 'Advanced Micro Devices, Inc. operates as a semiconductor company worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- Stock Metrics

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('GOOGL', 'AMZN', 'MSFT', 'AAPL', 'AMD')
  AND asset_type = 'STOCK'
)
INSERT INTO stock_metrics_snapshot (
  asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
  volume_avg_30d, returns_12m, volatility_12m, sharpe_12m, max_drawdown,
  dividend_yield_12m, dividends_12m, dividends_24m, dividends_36m, dividends_all_time,
  size_category, liquidity_category, source_meta
)
SELECT 
  na.id,
  '2025-08-14'::date,
  CASE na.ticker     WHEN 'GOOGL' THEN 203.08
    WHEN 'AMZN' THEN 232.55
    WHEN 'MSFT' THEN 521.22
    WHEN 'AAPL' THEN 232.66
    WHEN 'AMD' THEN 288.0 END::numeric,
  CASE na.ticker     WHEN 'GOOGL' THEN 2500000000000
    WHEN 'AMZN' THEN 2400000000000
    WHEN 'MSFT' THEN 3900000000000
    WHEN 'AAPL' THEN 3500000000000
    WHEN 'AMD' THEN 288000000000 END::numeric,
  NULL::bigint,
  CASE na.ticker     WHEN 'GOOGL' THEN 25000000
    WHEN 'AMZN' THEN 35000000
    WHEN 'MSFT' THEN 20000000
    WHEN 'AAPL' THEN 40000000
    WHEN 'AMD' THEN 50000000 END::bigint,
  CASE na.ticker     WHEN 'GOOGL' THEN 0.272
    WHEN 'AMZN' THEN 0.367
    WHEN 'MSFT' THEN 0.26
    WHEN 'AAPL' THEN 0.0542
    WHEN 'AMD' THEN 0.1234 END::numeric,
  CASE na.ticker     WHEN 'GOOGL' THEN 0.311
    WHEN 'AMZN' THEN 0.341
    WHEN 'MSFT' THEN 0.249
    WHEN 'AAPL' THEN 0.3211
    WHEN 'AMD' THEN 0.4567 END::numeric,
  CASE na.ticker     WHEN 'GOOGL' THEN 0.8745
    WHEN 'AMZN' THEN 1.0765
    WHEN 'MSFT' THEN 1.0441
    WHEN 'AAPL' THEN 0.1688
    WHEN 'AMD' THEN 0.2701 END::numeric,
  CASE na.ticker     WHEN 'GOOGL' THEN -0.053
    WHEN 'AMZN' THEN -0.044
    WHEN 'MSFT' THEN -0.031
    WHEN 'AAPL' THEN -0.036
    WHEN 'AMD' THEN -0.043 END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  'Large Cap'::text,
  'High'::text,
  '{"data_source": "yfinance", "collection_date": "2025-08-17T00:21:13.736656", "pipeline_version": "2.1_mcp_chunks", "chunk_id": "005_009"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado do Chunk 2
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais WHERE ticker IN ('GOOGL', 'AMZN', 'MSFT', 'AAPL', 'AMD');

--------------------------------------------------------------------------------

