-- LOTE MASSIVO 10: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:24.020523
-- Tickers: B010S00, B010S01, B010S02, B010S03, B010S04, B010S05, B010S06, B010S07, B010S08, B010S09, B010S10, B010S11, B010S12, B010S13, B010S14, B010S15, B010S16, B010S17, B010S18, B010S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B010S00', 'STOCK', 'B010S00 Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'B010S00 Corporation operates in the software—application industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B010S01', 'STOCK', 'B010S01 Corporation', 'NYSE', 'Communication Services', 'Telecom Services', 'USD', 'B010S01 Corporation operates in the telecom services industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B010S02', 'STOCK', 'B010S02 Corporation', 'AMEX', 'Financial Services', 'Credit Services', 'USD', 'B010S02 Corporation operates in the credit services industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B010S03', 'STOCK', 'B010S03 Corporation', 'AMEX', 'Materials', 'Steel', 'USD', 'B010S03 Corporation operates in the steel industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B010S04', 'STOCK', 'B010S04 Corporation', 'NASDAQ', 'Real Estate', 'Real Estate Services', 'USD', 'B010S04 Corporation operates in the real estate services industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B010S05', 'STOCK', 'B010S05 Corporation', 'NASDAQ', 'Financial Services', 'Banks—Regional', 'USD', 'B010S05 Corporation operates in the banks—regional industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B010S06', 'STOCK', 'B010S06 Corporation', 'AMEX', 'Real Estate', 'REIT—Office', 'USD', 'B010S06 Corporation operates in the reit—office industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B010S07', 'STOCK', 'B010S07 Corporation', 'NASDAQ', 'Industrials', 'Railroads', 'USD', 'B010S07 Corporation operates in the railroads industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B010S08', 'STOCK', 'B010S08 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B010S08 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B010S09', 'STOCK', 'B010S09 Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'B010S09 Corporation operates in the software—application industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B010S10', 'STOCK', 'B010S10 Corporation', 'NYSE', 'Financial Services', 'Banks—Regional', 'USD', 'B010S10 Corporation operates in the banks—regional industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B010S11', 'STOCK', 'B010S11 Corporation', 'AMEX', 'Financial Services', 'Insurance—Life', 'USD', 'B010S11 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B010S12', 'STOCK', 'B010S12 Corporation', 'NYSE', 'Communication Services', 'Media', 'USD', 'B010S12 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B010S13', 'STOCK', 'B010S13 Corporation', 'NYSE', 'Utilities', 'Utilities—Diversified', 'USD', 'B010S13 Corporation operates in the utilities—diversified industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B010S14', 'STOCK', 'B010S14 Corporation', 'NASDAQ', 'Industrials', 'Industrial Distribution', 'USD', 'B010S14 Corporation operates in the industrial distribution industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B010S15', 'STOCK', 'B010S15 Corporation', 'NYSE', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B010S15 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B010S16', 'STOCK', 'B010S16 Corporation', 'NYSE', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B010S16 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B010S17', 'STOCK', 'B010S17 Corporation', 'AMEX', 'Technology', 'Software—Infrastructure', 'USD', 'B010S17 Corporation operates in the software—infrastructure industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B010S18', 'STOCK', 'B010S18 Corporation', 'AMEX', 'Utilities', 'Utilities—Diversified', 'USD', 'B010S18 Corporation operates in the utilities—diversified industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B010S19', 'STOCK', 'B010S19 Corporation', 'NYSE', 'Industrials', 'Industrial Distribution', 'USD', 'B010S19 Corporation operates in the industrial distribution industry within the industrials sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B010S00', 'B010S01', 'B010S02', 'B010S03', 'B010S04', 'B010S05', 'B010S06', 'B010S07', 'B010S08', 'B010S09', 'B010S10', 'B010S11', 'B010S12', 'B010S13', 'B010S14', 'B010S15', 'B010S16', 'B010S17', 'B010S18', 'B010S19')
  AND asset_type = 'STOCK'
)
INSERT INTO stock_metrics_snapshot (
  asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
  volume_avg_30d, returns_12m, volatility_12m, sharpe_12m, max_drawdown,
  max_drawdown_12m, dividend_yield_12m, dividends_12m, dividends_24m,
  dividends_36m, dividends_all_time, size_category, liquidity_category, source_meta
)
SELECT 
  na.id,
  '2025-08-17'::date,
  CASE na.ticker
    WHEN 'B010S00' THEN 280.41
    WHEN 'B010S01' THEN 19.75
    WHEN 'B010S02' THEN 118.06
    WHEN 'B010S03' THEN 241.78
    WHEN 'B010S04' THEN 21.21
    WHEN 'B010S05' THEN 171.58
    WHEN 'B010S06' THEN 5.15
    WHEN 'B010S07' THEN 56.61
    WHEN 'B010S08' THEN 1.97
    WHEN 'B010S09' THEN 43.09
    WHEN 'B010S10' THEN 27.61
    WHEN 'B010S11' THEN 19.82
    WHEN 'B010S12' THEN 97.71
    WHEN 'B010S13' THEN 168.3
    WHEN 'B010S14' THEN 16.64
    WHEN 'B010S15' THEN 37.36
    WHEN 'B010S16' THEN 43.18
    WHEN 'B010S17' THEN 106.09
    WHEN 'B010S18' THEN 18.01
    WHEN 'B010S19' THEN 40.64
  END::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN 2867750235650
    WHEN 'B010S01' THEN 1538873852
    WHEN 'B010S02' THEN 35158429762
    WHEN 'B010S03' THEN 2234978307536
    WHEN 'B010S04' THEN 8713117143
    WHEN 'B010S05' THEN 87334221094
    WHEN 'B010S06' THEN 1504003733
    WHEN 'B010S07' THEN 8049197737
    WHEN 'B010S08' THEN 1943495415
    WHEN 'B010S09' THEN 3935979793
    WHEN 'B010S10' THEN 8691510933
    WHEN 'B010S11' THEN 340042780
    WHEN 'B010S12' THEN 4751099375
    WHEN 'B010S13' THEN 188348560956
    WHEN 'B010S14' THEN 1523110516
    WHEN 'B010S15' THEN 1959588223
    WHEN 'B010S16' THEN 362892445
    WHEN 'B010S17' THEN 182638362503
    WHEN 'B010S18' THEN 1944945888
    WHEN 'B010S19' THEN 663116883
  END::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN 10226923849
    WHEN 'B010S01' THEN 77912605
    WHEN 'B010S02' THEN 297801309
    WHEN 'B010S03' THEN 9243882200
    WHEN 'B010S04' THEN 410762590
    WHEN 'B010S05' THEN 509005393
    WHEN 'B010S06' THEN 291989523
    WHEN 'B010S07' THEN 142182918
    WHEN 'B010S08' THEN 986881128
    WHEN 'B010S09' THEN 91337593
    WHEN 'B010S10' THEN 314761584
    WHEN 'B010S11' THEN 17152588
    WHEN 'B010S12' THEN 48622255
    WHEN 'B010S13' THEN 1119155713
    WHEN 'B010S14' THEN 91550985
    WHEN 'B010S15' THEN 52453517
    WHEN 'B010S16' THEN 8403407
    WHEN 'B010S17' THEN 1721578566
    WHEN 'B010S18' THEN 107987741
    WHEN 'B010S19' THEN 16317753
  END::bigint,
  CASE na.ticker
    WHEN 'B010S00' THEN 1740204271
    WHEN 'B010S01' THEN 3883085
    WHEN 'B010S02' THEN 131865523
    WHEN 'B010S03' THEN 475638542
    WHEN 'B010S04' THEN 94817032
    WHEN 'B010S05' THEN 1302711966
    WHEN 'B010S06' THEN 17467035
    WHEN 'B010S07' THEN 74842415
    WHEN 'B010S08' THEN 13406770
    WHEN 'B010S09' THEN 78446300
    WHEN 'B010S10' THEN 67394066
    WHEN 'B010S11' THEN 1509377
    WHEN 'B010S12' THEN 66741497
    WHEN 'B010S13' THEN 617917215
    WHEN 'B010S14' THEN 15367353
    WHEN 'B010S15' THEN 15129185
    WHEN 'B010S16' THEN 563674
    WHEN 'B010S17' THEN 1348572256
    WHEN 'B010S18' THEN 15974024
    WHEN 'B010S19' THEN 11211982
  END::bigint,
  CASE na.ticker
    WHEN 'B010S00' THEN -0.171743
    WHEN 'B010S01' THEN -0.260833
    WHEN 'B010S02' THEN -0.018225
    WHEN 'B010S03' THEN -0.156162
    WHEN 'B010S04' THEN 0.160925
    WHEN 'B010S05' THEN -0.16284
    WHEN 'B010S06' THEN -0.17294
    WHEN 'B010S07' THEN 0.526186
    WHEN 'B010S08' THEN 0.224366
    WHEN 'B010S09' THEN 0.026656
    WHEN 'B010S10' THEN 0.203816
    WHEN 'B010S11' THEN 0.251033
    WHEN 'B010S12' THEN -0.078185
    WHEN 'B010S13' THEN 0.103506
    WHEN 'B010S14' THEN 0.276657
    WHEN 'B010S15' THEN 0.155119
    WHEN 'B010S16' THEN 0.12946
    WHEN 'B010S17' THEN 0.319137
    WHEN 'B010S18' THEN 0.319329
    WHEN 'B010S19' THEN 0.062547
  END::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN 0.773558
    WHEN 'B010S01' THEN 0.130534
    WHEN 'B010S02' THEN 0.476282
    WHEN 'B010S03' THEN 0.597348
    WHEN 'B010S04' THEN 0.656728
    WHEN 'B010S05' THEN 0.426664
    WHEN 'B010S06' THEN 0.710094
    WHEN 'B010S07' THEN 0.631462
    WHEN 'B010S08' THEN 0.442387
    WHEN 'B010S09' THEN 0.241892
    WHEN 'B010S10' THEN 0.733272
    WHEN 'B010S11' THEN 0.171831
    WHEN 'B010S12' THEN 0.578081
    WHEN 'B010S13' THEN 0.709312
    WHEN 'B010S14' THEN 0.530252
    WHEN 'B010S15' THEN 0.480247
    WHEN 'B010S16' THEN 0.733444
    WHEN 'B010S17' THEN 0.63539
    WHEN 'B010S18' THEN 0.131353
    WHEN 'B010S19' THEN 0.401388
  END::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN -0.286654
    WHEN 'B010S01' THEN -2.381237
    WHEN 'B010S02' THEN -0.143245
    WHEN 'B010S03' THEN -0.345128
    WHEN 'B010S04' THEN 0.168906
    WHEN 'B010S05' THEN -0.498847
    WHEN 'B010S06' THEN -0.313959
    WHEN 'B010S07' THEN 0.7541
    WHEN 'B010S08' THEN 0.394149
    WHEN 'B010S09' THEN -0.096506
    WHEN 'B010S10' THEN 0.209766
    WHEN 'B010S11' THEN 1.169946
    WHEN 'B010S12' THEN -0.221742
    WHEN 'B010S13' THEN 0.075433
    WHEN 'B010S14' THEN 0.427451
    WHEN 'B010S15' THEN 0.218886
    WHEN 'B010S16' THEN 0.108339
    WHEN 'B010S17' THEN 0.423577
    WHEN 'B010S18' THEN 2.050427
    WHEN 'B010S19' THEN 0.03126
  END::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN -0.854592
    WHEN 'B010S01' THEN -0.066103
    WHEN 'B010S02' THEN -0.430421
    WHEN 'B010S03' THEN -0.612701
    WHEN 'B010S04' THEN -0.274392
    WHEN 'B010S05' THEN -0.317574
    WHEN 'B010S06' THEN -0.262689
    WHEN 'B010S07' THEN -0.891417
    WHEN 'B010S08' THEN -0.159485
    WHEN 'B010S09' THEN -0.076445
    WHEN 'B010S10' THEN -0.879586
    WHEN 'B010S11' THEN -0.166241
    WHEN 'B010S12' THEN -0.813364
    WHEN 'B010S13' THEN -0.673011
    WHEN 'B010S14' THEN -0.198295
    WHEN 'B010S15' THEN -0.266923
    WHEN 'B010S16' THEN -0.392617
    WHEN 'B010S17' THEN -0.857096
    WHEN 'B010S18' THEN -0.052768
    WHEN 'B010S19' THEN -0.180741
  END::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN -0.854592
    WHEN 'B010S01' THEN -0.066103
    WHEN 'B010S02' THEN -0.430421
    WHEN 'B010S03' THEN -0.612701
    WHEN 'B010S04' THEN -0.274392
    WHEN 'B010S05' THEN -0.317574
    WHEN 'B010S06' THEN -0.262689
    WHEN 'B010S07' THEN -0.891417
    WHEN 'B010S08' THEN -0.159485
    WHEN 'B010S09' THEN -0.076445
    WHEN 'B010S10' THEN -0.879586
    WHEN 'B010S11' THEN -0.166241
    WHEN 'B010S12' THEN -0.813364
    WHEN 'B010S13' THEN -0.673011
    WHEN 'B010S14' THEN -0.198295
    WHEN 'B010S15' THEN -0.266923
    WHEN 'B010S16' THEN -0.392617
    WHEN 'B010S17' THEN -0.857096
    WHEN 'B010S18' THEN -0.052768
    WHEN 'B010S19' THEN -0.180741
  END::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN 0.079015
    WHEN 'B010S01' THEN 0
    WHEN 'B010S02' THEN 0
    WHEN 'B010S03' THEN 0.066412
    WHEN 'B010S04' THEN 0.050008
    WHEN 'B010S05' THEN 0.048226
    WHEN 'B010S06' THEN 0.024861
    WHEN 'B010S07' THEN 0.057482
    WHEN 'B010S08' THEN 0.053336
    WHEN 'B010S09' THEN 0.021266
    WHEN 'B010S10' THEN 0.03459
    WHEN 'B010S11' THEN 0.035878
    WHEN 'B010S12' THEN 0
    WHEN 'B010S13' THEN 0.079574
    WHEN 'B010S14' THEN 0.036802
    WHEN 'B010S15' THEN 0.074167
    WHEN 'B010S16' THEN 0.035414
    WHEN 'B010S17' THEN 0
    WHEN 'B010S18' THEN 0.078044
    WHEN 'B010S19' THEN 0
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B010S00' THEN 'Mega Cap'
    WHEN 'B010S01' THEN 'Small Cap'
    WHEN 'B010S02' THEN 'Large Cap'
    WHEN 'B010S03' THEN 'Mega Cap'
    WHEN 'B010S04' THEN 'Mid Cap'
    WHEN 'B010S05' THEN 'Large Cap'
    WHEN 'B010S06' THEN 'Small Cap'
    WHEN 'B010S07' THEN 'Mid Cap'
    WHEN 'B010S08' THEN 'Small Cap'
    WHEN 'B010S09' THEN 'Mid Cap'
    WHEN 'B010S10' THEN 'Mid Cap'
    WHEN 'B010S11' THEN 'Small Cap'
    WHEN 'B010S12' THEN 'Mid Cap'
    WHEN 'B010S13' THEN 'Large Cap'
    WHEN 'B010S14' THEN 'Small Cap'
    WHEN 'B010S15' THEN 'Small Cap'
    WHEN 'B010S16' THEN 'Small Cap'
    WHEN 'B010S17' THEN 'Large Cap'
    WHEN 'B010S18' THEN 'Small Cap'
    WHEN 'B010S19' THEN 'Small Cap'
  END::text,
  CASE na.ticker
    WHEN 'B010S00' THEN 'High'
    WHEN 'B010S01' THEN 'Medium'
    WHEN 'B010S02' THEN 'High'
    WHEN 'B010S03' THEN 'High'
    WHEN 'B010S04' THEN 'High'
    WHEN 'B010S05' THEN 'High'
    WHEN 'B010S06' THEN 'High'
    WHEN 'B010S07' THEN 'High'
    WHEN 'B010S08' THEN 'High'
    WHEN 'B010S09' THEN 'High'
    WHEN 'B010S10' THEN 'High'
    WHEN 'B010S11' THEN 'Medium'
    WHEN 'B010S12' THEN 'High'
    WHEN 'B010S13' THEN 'High'
    WHEN 'B010S14' THEN 'High'
    WHEN 'B010S15' THEN 'High'
    WHEN 'B010S16' THEN 'Medium'
    WHEN 'B010S17' THEN 'High'
    WHEN 'B010S18' THEN 'High'
    WHEN 'B010S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:24.020258", "pipeline_version": "4.0_mass", "batch_id": "010"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
