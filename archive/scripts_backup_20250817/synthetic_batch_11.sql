
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK251', 'STOCK', 'Utilities Corp 251', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #251')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 429.19, 153128901428, -23.1, 43.32, 0.97, -47.11, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK251' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK252', 'STOCK', 'Energy Corp 252', 'AMEX', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #252')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 250.1, 220537014908, -39.96, 40.66, 1.74, -50.85, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK252' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK253', 'STOCK', 'Utilities Corp 253', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #253')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 272.43, 50828683129, -6.17, 67.7, 1.85, -10.25, 3.31, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK253' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK254', 'STOCK', 'Real Estate Corp 254', 'NASDAQ', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #254')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 48.86, 261992818371, -10.62, 20.8, 1.61, -48.21, 1.28, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK254' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK255', 'STOCK', 'Energy Corp 255', 'AMEX', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #255')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 199.59, 450538168232, -32.38, 53.52, 1.88, -12.71, 1.88, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK255' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK256', 'STOCK', 'Consumer Defensive Corp 256', 'NASDAQ', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #256')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 226.62, 253580079933, 33.19, 58.78, -0.67, -78.78, 4.27, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK256' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK257', 'STOCK', 'Energy Corp 257', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #257')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 80.86, 254785362038, 85.04, 66.17, 1.4, -68.62, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK257' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK258', 'STOCK', 'Consumer Defensive Corp 258', 'NYSE', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #258')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 308.04, 183838483485, -5.79, 11.18, -0.58, -25.93, 2.44, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK258' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK259', 'STOCK', 'Consumer Defensive Corp 259', 'NASDAQ', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #259')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 272.37, 32136191650, -16.24, 55.54, -0.26, -7.16, 3.96, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK259' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK260', 'STOCK', 'Communication Services Corp 260', 'NYSE', 'Communication Services', 'Communication Services', 'Synthetic stock for testing purposes - Communication Services company #260')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 357.09, 90979223140, 48.09, 56.04, 2.86, -8.74, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK260' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK261', 'STOCK', 'Technology Corp 261', 'AMEX', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #261')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 446.44, 272972661308, -4.46, 51.91, -0.67, -68.17, 7.72, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK261' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK262', 'STOCK', 'Energy Corp 262', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #262')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 321.24, 127065393801, -43.86, 53.0, 2.27, -16.43, 7.72, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK262' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK263', 'STOCK', 'Real Estate Corp 263', 'AMEX', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #263')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 234.4, 394100516994, 90.59, 39.99, 1.71, -31.73, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK263' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK264', 'STOCK', 'Communication Services Corp 264', 'AMEX', 'Communication Services', 'Communication Services', 'Synthetic stock for testing purposes - Communication Services company #264')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 83.9, 478172450783, 78.92, 52.04, 1.86, -19.35, 5.36, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK264' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK265', 'STOCK', 'Materials Corp 265', 'NYSE', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #265')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 182.14, 143560904953, -3.39, 17.6, 2.15, -43.26, 4.11, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK265' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK266', 'STOCK', 'Materials Corp 266', 'AMEX', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #266')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 52.87, 310899018798, 72.96, 31.75, 2.98, -44.48, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK266' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK267', 'STOCK', 'Industrials Corp 267', 'AMEX', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #267')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 359.53, 38899079329, -10.55, 17.77, 0.03, -39.21, 2.97, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK267' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK268', 'STOCK', 'Consumer Defensive Corp 268', 'NYSE', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #268')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 245.64, 239428873089, 80.25, 57.35, 1.35, -29.44, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK268' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK269', 'STOCK', 'Utilities Corp 269', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #269')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 56.44, 285086077554, 95.89, 39.13, 2.35, -61.61, 4.83, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK269' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK270', 'STOCK', 'Real Estate Corp 270', 'NYSE', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #270')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 456.76, 114360604454, 42.1, 63.59, 1.69, -44.19, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK270' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK271', 'STOCK', 'Communication Services Corp 271', 'NASDAQ', 'Communication Services', 'Communication Services', 'Synthetic stock for testing purposes - Communication Services company #271')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 319.36, 36695598145, 70.81, 57.12, 0.03, -70.22, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK271' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK272', 'STOCK', 'Real Estate Corp 272', 'NYSE', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #272')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 290.44, 327971750563, 28.3, 35.79, 1.28, -53.46, 5.74, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK272' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK273', 'STOCK', 'Technology Corp 273', 'AMEX', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #273')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 459.97, 251842493717, 4.28, 30.14, 1.6, -41.35, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK273' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK274', 'STOCK', 'Healthcare Corp 274', 'AMEX', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #274')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 47.76, 249257678160, 79.15, 11.46, 0.22, -55.15, 2.56, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK274' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK275', 'STOCK', 'Healthcare Corp 275', 'NASDAQ', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #275')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 299.34, 409843322684, 41.02, 53.2, 0.97, -31.2, 6.87, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK275' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;
