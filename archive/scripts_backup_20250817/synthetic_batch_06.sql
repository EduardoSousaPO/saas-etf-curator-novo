
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK126', 'STOCK', 'Utilities Corp 126', 'AMEX', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #126')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 375.87, 117551827633, 12.17, 28.73, 1.31, -55.71, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK126' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK127', 'STOCK', 'Industrials Corp 127', 'NYSE', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #127')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 199.9, 99060950439, 91.47, 49.38, 2.69, -73.6, 7.01, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK127' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK128', 'STOCK', 'Technology Corp 128', 'AMEX', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #128')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 479.83, 267991119831, 79.06, 19.59, 0.88, -64.87, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK128' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK129', 'STOCK', 'Utilities Corp 129', 'NYSE', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #129')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 122.04, 484194634469, 85.86, 66.68, -0.61, -30.87, 0.22, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK129' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK130', 'STOCK', 'Consumer Defensive Corp 130', 'NYSE', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #130')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 418.01, 327390718723, 85.09, 28.04, -0.28, -65.32, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK130' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK131', 'STOCK', 'Utilities Corp 131', 'NYSE', 'Utilities', 'Utilities', 'Synthetic stock for testing purposes - Utilities company #131')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 429.99, 215770366584, 9.83, 45.07, 2.0, -68.31, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK131' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK132', 'STOCK', 'Energy Corp 132', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #132')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 240.35, 265419471121, 30.01, 24.52, 1.75, -34.6, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK132' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK133', 'STOCK', 'Healthcare Corp 133', 'AMEX', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #133')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 396.13, 305954218260, 36.32, 40.13, 2.63, -41.65, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK133' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK134', 'STOCK', 'Consumer Defensive Corp 134', 'AMEX', 'Consumer Defensive', 'Consumer Defensive', 'Synthetic stock for testing purposes - Consumer Defensive company #134')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 443.68, 98680953838, 6.73, 38.08, 0.42, -34.73, 5.93, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK134' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK135', 'STOCK', 'Healthcare Corp 135', 'NYSE', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #135')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 214.05, 301390129926, -44.65, 43.69, -0.63, -75.69, 6.83, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK135' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK136', 'STOCK', 'Communication Services Corp 136', 'NASDAQ', 'Communication Services', 'Communication Services', 'Synthetic stock for testing purposes - Communication Services company #136')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 431.13, 92589235533, 18.23, 46.7, -0.72, -67.93, 6.45, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK136' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK137', 'STOCK', 'Industrials Corp 137', 'AMEX', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #137')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 311.55, 371639097997, -48.26, 16.56, 0.79, -26.26, 6.83, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK137' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK138', 'STOCK', 'Materials Corp 138', 'NASDAQ', 'Materials', 'Materials', 'Synthetic stock for testing purposes - Materials company #138')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 154.93, 363986946000, -13.36, 14.25, 1.2, -37.99, 7.68, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK138' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK139', 'STOCK', 'Industrials Corp 139', 'NASDAQ', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #139')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 422.98, 62180339451, -15.89, 67.08, 1.35, -24.43, 1.3, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK139' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK140', 'STOCK', 'Consumer Cyclical Corp 140', 'AMEX', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #140')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 262.26, 241664311145, 13.72, 17.32, 2.46, -14.79, 6.17, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK140' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK141', 'STOCK', 'Technology Corp 141', 'NYSE', 'Technology', 'Technology', 'Synthetic stock for testing purposes - Technology company #141')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 236.47, 467311893735, 81.69, 41.55, 0.49, -53.14, 6.42, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK141' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK142', 'STOCK', 'Communication Services Corp 142', 'AMEX', 'Communication Services', 'Communication Services', 'Synthetic stock for testing purposes - Communication Services company #142')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 59.03, 83975036460, 77.94, 68.31, 0.65, -24.65, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK142' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK143', 'STOCK', 'Financial Services Corp 143', 'NYSE', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #143')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 318.95, 40815407870, 25.9, 51.65, -0.31, -65.98, 0, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK143' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK144', 'STOCK', 'Healthcare Corp 144', 'NYSE', 'Healthcare', 'Healthcare', 'Synthetic stock for testing purposes - Healthcare company #144')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 347.63, 357594540284, 91.83, 48.63, 2.61, -39.09, 3.01, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK144' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK145', 'STOCK', 'Industrials Corp 145', 'NYSE', 'Industrials', 'Industrials', 'Synthetic stock for testing purposes - Industrials company #145')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 63.23, 189595293681, -33.28, 33.14, 0.27, -54.05, 1.61, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK145' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK146', 'STOCK', 'Consumer Cyclical Corp 146', 'NASDAQ', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #146')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 207.13, 437453732178, 93.68, 22.6, 0.66, -40.39, 5.98, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK146' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK147', 'STOCK', 'Consumer Cyclical Corp 147', 'AMEX', 'Consumer Cyclical', 'Consumer Cyclical', 'Synthetic stock for testing purposes - Consumer Cyclical company #147')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 454.41, 431776449749, 85.61, 72.07, -0.64, -32.14, 2.5, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK147' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK148', 'STOCK', 'Financial Services Corp 148', 'NYSE', 'Financial Services', 'Financial Services', 'Synthetic stock for testing purposes - Financial Services company #148')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 106.53, 61327643219, -27.32, 33.22, 2.26, -71.54, 0.87, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK148' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK149', 'STOCK', 'Energy Corp 149', 'NYSE', 'Energy', 'Energy', 'Synthetic stock for testing purposes - Energy company #149')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 486.69, 492782161165, 16.11, 25.42, 1.33, -65.78, 2.3, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK149' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;


INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('STK150', 'STOCK', 'Real Estate Corp 150', 'NASDAQ', 'Real Estate', 'Real Estate', 'Synthetic stock for testing purposes - Real Estate company #150')
ON CONFLICT (ticker) DO NOTHING;


INSERT INTO stock_metrics_snapshot (asset_id, current_price, market_cap, returns_12m, volatility_12m, sharpe_12m, max_drawdown, dividend_yield_12m, source_meta, snapshot_date)
SELECT a.id, 100.9, 286650018550, -15.87, 75.47, 1.75, -14.4, 7.31, '{"provider": "Synthetic", "generated_at": "2025-01-29"}', CURRENT_DATE
FROM assets_master a WHERE a.ticker = 'STK150' AND a.asset_type = 'STOCK'
ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  returns_12m = EXCLUDED.returns_12m,
  volatility_12m = EXCLUDED.volatility_12m,
  sharpe_12m = EXCLUDED.sharpe_12m,
  max_drawdown = EXCLUDED.max_drawdown,
  dividend_yield_12m = EXCLUDED.dividend_yield_12m;
