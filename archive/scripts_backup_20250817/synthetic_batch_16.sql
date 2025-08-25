
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK376', 'STOCK', 'Materials Corp 376', 'AMEX', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #376')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 489.9, 279783292520, 51.76, 78.34, 0.44, -22.44, 5.77, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK376' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK377', 'STOCK', 'Real Estate Corp 377', 'NASDAQ', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #377')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 113.48, 416768636063, 79.2, 60.61, 2.91, -39.15, 3.8, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK377' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK378', 'STOCK', 'Technology Corp 378', 'NASDAQ', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #378')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 355.58, 470074424933, -19.54, 56.84, -0.06, -9.45, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK378' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK379', 'STOCK', 'Financial Services Corp 379', 'NASDAQ', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #379')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 160.86, 400908093822, -3.07, 46.37, -0.84, -56.06, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK379' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK380', 'STOCK', 'Technology Corp 380', 'NASDAQ', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #380')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 268.35, 178369699298, 13.18, 51.56, 1.31, -54.38, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK380' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK381', 'STOCK', 'Materials Corp 381', 'AMEX', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #381')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 106.26, 135159481252, 15.24, 66.92, 0.8, -72.76, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK381' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK382', 'STOCK', 'Real Estate Corp 382', 'NASDAQ', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #382')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 332.77, 278800607000, -22.34, 74.44, 0.28, -47.19, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK382' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK383', 'STOCK', 'Utilities Corp 383', 'NASDAQ', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #383')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 315.57, 427409475540, 94.97, 11.6, -0.51, -63.3, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK383' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK384', 'STOCK', 'Materials Corp 384', 'NYSE', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #384')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 355.96, 16352907487, 96.33, 53.19, 0.17, -59.17, 6.02, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK384' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK385', 'STOCK', 'Utilities Corp 385', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #385')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 423.5, 431972004089, -36.88, 17.63, -0.48, -20.34, 4.73, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK385' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK386', 'STOCK', 'Financial Services Corp 386', 'AMEX', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #386')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 424.47, 113782865154, 89.05, 64.83, 2.81, -11.14, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK386' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK387', 'STOCK', 'Financial Services Corp 387', 'NASDAQ', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #387')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 493.65, 414896830372, 20.76, 55.06, 0.0, -21.68, 7.51, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK387' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK388', 'STOCK', 'Financial Services Corp 388', 'NYSE', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #388')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 263.37, 359149347253, 16.67, 54.46, 1.22, -77.6, 5.24, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK388' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK389', 'STOCK', 'Consumer Cyclical Corp 389', 'NYSE', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #389')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 70.2, 193089977619, 70.49, 17.05, -0.48, -33.6, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK389' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK390', 'STOCK', 'Energy Corp 390', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #390')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 320.12, 421014552691, 3.18, 56.26, -0.92, -43.03, 5.58, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK390' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK391', 'STOCK', 'Healthcare Corp 391', 'AMEX', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #391')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 206.86, 396151070024, -43.0, 18.98, -0.12, -16.15, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK391' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK392', 'STOCK', 'Utilities Corp 392', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #392')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 52.77, 16053940294, -43.43, 57.36, 2.91, -31.35, 3.59, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK392' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK393', 'STOCK', 'Healthcare Corp 393', 'AMEX', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #393')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 41.72, 31822837214, 73.37, 50.95, 1.72, -43.6, 7.42, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK393' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK394', 'STOCK', 'Materials Corp 394', 'NASDAQ', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #394')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 44.39, 406801989810, 85.3, 34.9, 0.51, -42.89, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK394' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK395', 'STOCK', 'Healthcare Corp 395', 'AMEX', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #395')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 101.36, 62838549427, -14.61, 55.52, 0.78, -5.47, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK395' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK396', 'STOCK', 'Energy Corp 396', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #396')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 104.2, 141434167726, -16.48, 67.65, -0.28, -76.54, 2.47, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK396' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK397', 'STOCK', 'Consumer Cyclical Corp 397', 'NYSE', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #397')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 258.27, 266613075167, 46.14, 21.54, 1.53, -53.15, 5.43, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK397' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK398', 'STOCK', 'Financial Services Corp 398', 'NASDAQ', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #398')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 226.98, 177426054162, 78.64, 20.38, 2.06, -11.98, 3.79, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK398' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK399', 'STOCK', 'Real Estate Corp 399', 'AMEX', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #399')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 88.68, 382828473219, 1.75, 56.69, -0.99, -64.21, 4.86, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK399' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK400', 'STOCK', 'Consumer Cyclical Corp 400', 'NASDAQ', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #400')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 461.13, 145087927881, -41.54, 44.74, 0.68, -36.07, 5.05, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK400' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;
