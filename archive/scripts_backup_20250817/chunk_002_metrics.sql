
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
