
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK276', 'STOCK', 'Healthcare Corp 276', 'NASDAQ', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #276')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 89.74, 246196232775, 65.69, 44.67, -0.67, -38.86, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK276' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK277', 'STOCK', 'Energy Corp 277', 'NASDAQ', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #277')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 18.76, 323813144889, 86.12, 36.35, -0.91, -41.99, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK277' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK278', 'STOCK', 'Communication Services Corp 278', 'NYSE', 'Communication Services', 'Communication Services', 'Synthetic stock for testing purposes - Communication Services company #278')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 196.33, 138906776337, -7.69, 24.3, 2.17, -21.26, 1.87, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK278' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK279', 'STOCK', 'Materials Corp 279', 'NYSE', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #279')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 88.74, 410618172039, -20.71, 27.3, 0.81, -43.45, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK279' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK280', 'STOCK', 'Financial Services Corp 280', 'NYSE', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #280')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 126.86, 245660879931, 28.2, 66.72, 0.04, -65.18, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK280' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK281', 'STOCK', 'Industrials Corp 281', 'NYSE', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #281')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 42.61, 340272899201, -27.65, 10.61, 0.51, -5.65, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK281' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK282', 'STOCK', 'Utilities Corp 282', 'NASDAQ', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #282')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 276.37, 160597314494, -16.29, 18.71, -0.69, -59.98, 7.38, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK282' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK283', 'STOCK', 'Financial Services Corp 283', 'AMEX', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #283')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 69.05, 15103719870, 95.59, 48.0, -0.74, -39.26, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK283' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK284', 'STOCK', 'Energy Corp 284', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #284')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 166.3, 39541750257, 4.19, 45.31, 1.14, -62.57, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK284' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK285', 'STOCK', 'Consumer Cyclical Corp 285', 'NASDAQ', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #285')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 487.85, 370247144728, 90.56, 37.65, 0.73, -48.11, 3.62, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK285' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK286', 'STOCK', 'Real Estate Corp 286', 'AMEX', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #286')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 162.91, 100508691851, -21.75, 16.38, 1.09, -58.24, 2.48, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK286' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK287', 'STOCK', 'Technology Corp 287', 'NYSE', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #287')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 482.11, 185420574829, 77.0, 61.92, 2.3, -79.0, 6.41, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK287' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK288', 'STOCK', 'Consumer Defensive Corp 288', 'AMEX', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #288')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 376.98, 215521097735, -23.13, 12.18, 1.92, -77.02, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK288' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK289', 'STOCK', 'Financial Services Corp 289', 'AMEX', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #289')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 325.4, 296606417939, 18.95, 48.42, 1.99, -61.15, 0.71, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK289' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK290', 'STOCK', 'Financial Services Corp 290', 'AMEX', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #290')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 279.0, 335331578816, -36.76, 15.1, 1.25, -27.49, 6.18, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK290' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK291', 'STOCK', 'Consumer Defensive Corp 291', 'NASDAQ', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #291')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 274.11, 215416749951, 9.95, 25.53, 0.01, -8.56, 4.1, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK291' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK292', 'STOCK', 'Energy Corp 292', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #292')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 440.1, 321103165796, 82.68, 26.27, 1.81, -35.13, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK292' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK293', 'STOCK', 'Real Estate Corp 293', 'AMEX', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #293')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 425.14, 129449290346, -8.49, 43.11, 1.74, -20.45, 6.82, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK293' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK294', 'STOCK', 'Real Estate Corp 294', 'NASDAQ', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #294')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 479.75, 43830044391, -10.33, 68.03, 1.35, -36.28, 5.28, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK294' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK295', 'STOCK', 'Utilities Corp 295', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #295')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 140.02, 430445835742, 69.36, 25.37, 0.43, -45.96, 0.8, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK295' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK296', 'STOCK', 'Healthcare Corp 296', 'AMEX', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #296')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 457.94, 113544692216, -2.55, 29.31, 1.38, -70.13, 1.14, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK296' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK297', 'STOCK', 'Industrials Corp 297', 'NASDAQ', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #297')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 367.2, 370712326476, -41.05, 70.51, 0.14, -46.82, 5.0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK297' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK298', 'STOCK', 'Industrials Corp 298', 'NASDAQ', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #298')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 190.6, 128426578157, 61.54, 20.09, 0.39, -36.31, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK298' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK299', 'STOCK', 'Healthcare Corp 299', 'NASDAQ', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #299')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 301.7, 18850081017, 8.77, 78.75, 2.71, -73.16, 0.71, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK299' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK300', 'STOCK', 'Materials Corp 300', 'NASDAQ', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #300')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 341.02, 150466209839, 35.23, 72.22, 2.11, -30.61, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK300' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;
