
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK301', 'STOCK', 'Consumer Cyclical Corp 301', 'AMEX', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #301')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 54.15, 63283842981, 43.79, 25.89, 0.23, -55.45, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK301' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK302', 'STOCK', 'Consumer Cyclical Corp 302', 'NASDAQ', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #302')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 112.12, 366185815377, 18.03, 59.93, 0.68, -25.26, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK302' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK303', 'STOCK', 'Materials Corp 303', 'NASDAQ', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #303')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 450.46, 34365729797, -1.83, 73.97, -0.98, -67.1, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK303' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK304', 'STOCK', 'Financial Services Corp 304', 'NASDAQ', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #304')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 339.82, 96016889266, -6.03, 17.5, -0.13, -55.43, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK304' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK305', 'STOCK', 'Technology Corp 305', 'NYSE', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #305')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 340.64, 144722397863, -4.94, 69.19, 1.42, -33.87, 1.95, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK305' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK306', 'STOCK', 'Materials Corp 306', 'NASDAQ', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #306')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 428.3, 436630339961, 77.57, 78.9, 0.82, -79.0, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK306' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK307', 'STOCK', 'Consumer Cyclical Corp 307', 'NASDAQ', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #307')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 454.97, 1646349923, 13.54, 25.34, 0.17, -9.35, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK307' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK308', 'STOCK', 'Consumer Cyclical Corp 308', 'NASDAQ', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #308')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 313.48, 100438233143, 5.94, 56.86, 1.83, -20.68, 4.16, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK308' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK309', 'STOCK', 'Utilities Corp 309', 'NYSE', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #309')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 381.11, 44699797869, 70.71, 73.12, 1.72, -25.96, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK309' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK310', 'STOCK', 'Utilities Corp 310', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #310')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 122.22, 485697784968, -49.16, 70.47, -0.05, -23.5, 5.03, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK310' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK311', 'STOCK', 'Technology Corp 311', 'NYSE', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #311')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 265.19, 361343055235, -27.2, 23.9, -0.26, -24.65, 3.86, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK311' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK312', 'STOCK', 'Healthcare Corp 312', 'NASDAQ', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #312')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 403.36, 74837724158, -22.55, 28.16, 1.57, -77.38, 1.83, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK312' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK313', 'STOCK', 'Real Estate Corp 313', 'NASDAQ', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #313')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 181.43, 183428459513, 77.56, 74.18, 1.92, -24.73, 3.81, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK313' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK314', 'STOCK', 'Healthcare Corp 314', 'AMEX', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #314')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 400.79, 301735105604, 45.82, 62.94, 2.27, -14.41, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK314' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK315', 'STOCK', 'Industrials Corp 315', 'AMEX', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #315')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 6.64, 39115444931, -21.35, 76.94, 0.13, -58.51, 7.62, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK315' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK316', 'STOCK', 'Consumer Cyclical Corp 316', 'NYSE', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #316')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 118.01, 11117762783, 2.79, 68.93, 1.53, -43.86, 0.52, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK316' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK317', 'STOCK', 'Utilities Corp 317', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #317')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 291.99, 46539522912, 57.23, 35.26, 2.58, -14.24, 7.83, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK317' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK318', 'STOCK', 'Industrials Corp 318', 'NASDAQ', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #318')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 98.27, 112705637948, 88.32, 51.21, -0.86, -65.6, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK318' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK319', 'STOCK', 'Financial Services Corp 319', 'NYSE', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #319')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 329.77, 292530930485, 45.45, 42.55, 2.67, -76.66, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK319' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK320', 'STOCK', 'Communication Services Corp 320', 'NYSE', 'Communication Services', 'Communication Services', 'Synthetic stock for testing purposes - Communication Services company #320')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 466.28, 487343954637, 28.22, 23.96, 2.31, -12.81, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK320' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK321', 'STOCK', 'Consumer Defensive Corp 321', 'AMEX', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #321')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 404.01, 158741762122, -46.16, 30.1, 0.02, -56.63, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK321' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK322', 'STOCK', 'Consumer Defensive Corp 322', 'NYSE', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #322')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 34.0, 474429678772, -26.43, 66.73, 0.2, -65.15, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK322' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK323', 'STOCK', 'Energy Corp 323', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #323')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 469.57, 446683306929, 88.93, 55.44, -0.22, -34.82, 1.75, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK323' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK324', 'STOCK', 'Financial Services Corp 324', 'NYSE', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #324')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 108.2, 219356058303, -5.25, 13.14, -0.88, -62.39, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK324' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK325', 'STOCK', 'Financial Services Corp 325', 'AMEX', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #325')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 85.82, 182388891397, 38.72, 69.23, 1.07, -56.65, 0.85, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK325' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;
