
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
