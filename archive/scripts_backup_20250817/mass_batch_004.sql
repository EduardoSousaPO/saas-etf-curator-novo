-- LOTE MASSIVO 4: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:07.783127
-- Tickers: B004S00, B004S01, B004S02, B004S03, B004S04, B004S05, B004S06, B004S07, B004S08, B004S09, B004S10, B004S11, B004S12, B004S13, B004S14, B004S15, B004S16, B004S17, B004S18, B004S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B004S00', 'STOCK', 'B004S00 Corporation', 'NASDAQ', 'Real Estate', 'REIT—Residential', 'USD', 'B004S00 Corporation operates in the reit—residential industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B004S01', 'STOCK', 'B004S01 Corporation', 'AMEX', 'Technology', 'Software—Infrastructure', 'USD', 'B004S01 Corporation operates in the software—infrastructure industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B004S02', 'STOCK', 'B004S02 Corporation', 'AMEX', 'Communication Services', 'Telecom Services', 'USD', 'B004S02 Corporation operates in the telecom services industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B004S03', 'STOCK', 'B004S03 Corporation', 'AMEX', 'Consumer Cyclical', 'Internet Retail', 'USD', 'B004S03 Corporation operates in the internet retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B004S04', 'STOCK', 'B004S04 Corporation', 'NASDAQ', 'Consumer Cyclical', 'Apparel Retail', 'USD', 'B004S04 Corporation operates in the apparel retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B004S05', 'STOCK', 'B004S05 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B004S05 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B004S06', 'STOCK', 'B004S06 Corporation', 'NASDAQ', 'Materials', 'Copper', 'USD', 'B004S06 Corporation operates in the copper industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B004S07', 'STOCK', 'B004S07 Corporation', 'AMEX', 'Communication Services', 'Media', 'USD', 'B004S07 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B004S08', 'STOCK', 'B004S08 Corporation', 'NASDAQ', 'Healthcare', 'Medical Devices', 'USD', 'B004S08 Corporation operates in the medical devices industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B004S09', 'STOCK', 'B004S09 Corporation', 'AMEX', 'Healthcare', 'Biotechnology', 'USD', 'B004S09 Corporation operates in the biotechnology industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B004S10', 'STOCK', 'B004S10 Corporation', 'NYSE', 'Financial Services', 'Credit Services', 'USD', 'B004S10 Corporation operates in the credit services industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B004S11', 'STOCK', 'B004S11 Corporation', 'NASDAQ', 'Real Estate', 'REIT—Residential', 'USD', 'B004S11 Corporation operates in the reit—residential industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B004S12', 'STOCK', 'B004S12 Corporation', 'AMEX', 'Communication Services', 'Media', 'USD', 'B004S12 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B004S13', 'STOCK', 'B004S13 Corporation', 'NASDAQ', 'Financial Services', 'Banks—Regional', 'USD', 'B004S13 Corporation operates in the banks—regional industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B004S14', 'STOCK', 'B004S14 Corporation', 'AMEX', 'Communication Services', 'Entertainment', 'USD', 'B004S14 Corporation operates in the entertainment industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B004S15', 'STOCK', 'B004S15 Corporation', 'NYSE', 'Communication Services', 'Entertainment', 'USD', 'B004S15 Corporation operates in the entertainment industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B004S16', 'STOCK', 'B004S16 Corporation', 'AMEX', 'Consumer Defensive', 'Household Products', 'USD', 'B004S16 Corporation operates in the household products industry within the consumer defensive sector, providing innovative solutions and services to customers worldwide.'),
('B004S17', 'STOCK', 'B004S17 Corporation', 'NASDAQ', 'Real Estate', 'REIT—Residential', 'USD', 'B004S17 Corporation operates in the reit—residential industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B004S18', 'STOCK', 'B004S18 Corporation', 'AMEX', 'Industrials', 'Aerospace & Defense', 'USD', 'B004S18 Corporation operates in the aerospace & defense industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B004S19', 'STOCK', 'B004S19 Corporation', 'NASDAQ', 'Healthcare', 'Medical Devices', 'USD', 'B004S19 Corporation operates in the medical devices industry within the healthcare sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B004S00', 'B004S01', 'B004S02', 'B004S03', 'B004S04', 'B004S05', 'B004S06', 'B004S07', 'B004S08', 'B004S09', 'B004S10', 'B004S11', 'B004S12', 'B004S13', 'B004S14', 'B004S15', 'B004S16', 'B004S17', 'B004S18', 'B004S19')
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
    WHEN 'B004S00' THEN 69.77
    WHEN 'B004S01' THEN 46.61
    WHEN 'B004S02' THEN 74.38
    WHEN 'B004S03' THEN 18.52
    WHEN 'B004S04' THEN 100.62
    WHEN 'B004S05' THEN 83.03
    WHEN 'B004S06' THEN 400.33
    WHEN 'B004S07' THEN 21.35
    WHEN 'B004S08' THEN 113.04
    WHEN 'B004S09' THEN 65.77
    WHEN 'B004S10' THEN 126.57
    WHEN 'B004S11' THEN 72.29
    WHEN 'B004S12' THEN 119.5
    WHEN 'B004S13' THEN 84.09
    WHEN 'B004S14' THEN 41.24
    WHEN 'B004S15' THEN 19.37
    WHEN 'B004S16' THEN 87.87
    WHEN 'B004S17' THEN 144.74
    WHEN 'B004S18' THEN 70.72
    WHEN 'B004S19' THEN 8.15
  END::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN 2474329007
    WHEN 'B004S01' THEN 166282667731
    WHEN 'B004S02' THEN 6844706036
    WHEN 'B004S03' THEN 412760639
    WHEN 'B004S04' THEN 161273083618
    WHEN 'B004S05' THEN 4497236438
    WHEN 'B004S06' THEN 2195567036735
    WHEN 'B004S07' THEN 105483615886
    WHEN 'B004S08' THEN 177296075505
    WHEN 'B004S09' THEN 1075464793922
    WHEN 'B004S10' THEN 145310890279
    WHEN 'B004S11' THEN 2096930875
    WHEN 'B004S12' THEN 25126348987
    WHEN 'B004S13' THEN 100075946781
    WHEN 'B004S14' THEN 1809279004
    WHEN 'B004S15' THEN 5369008200
    WHEN 'B004S16' THEN 9860917971
    WHEN 'B004S17' THEN 14137380904
    WHEN 'B004S18' THEN 173353519826
    WHEN 'B004S19' THEN 1924672735
  END::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN 35462936
    WHEN 'B004S01' THEN 3567703523
    WHEN 'B004S02' THEN 92021611
    WHEN 'B004S03' THEN 22289583
    WHEN 'B004S04' THEN 1602867391
    WHEN 'B004S05' THEN 54165433
    WHEN 'B004S06' THEN 5484425404
    WHEN 'B004S07' THEN 4940125336
    WHEN 'B004S08' THEN 1568398591
    WHEN 'B004S09' THEN 16351133439
    WHEN 'B004S10' THEN 1148087218
    WHEN 'B004S11' THEN 29007694
    WHEN 'B004S12' THEN 210262023
    WHEN 'B004S13' THEN 1190145625
    WHEN 'B004S14' THEN 43867403
    WHEN 'B004S15' THEN 277148740
    WHEN 'B004S16' THEN 112223165
    WHEN 'B004S17' THEN 97673074
    WHEN 'B004S18' THEN 2451325481
    WHEN 'B004S19' THEN 236192125
  END::bigint,
  CASE na.ticker
    WHEN 'B004S00' THEN 34217836
    WHEN 'B004S01' THEN 1145686815
    WHEN 'B004S02' THEN 92092286
    WHEN 'B004S03' THEN 6242411
    WHEN 'B004S04' THEN 953265841
    WHEN 'B004S05' THEN 2231607
    WHEN 'B004S06' THEN 1045075477
    WHEN 'B004S07' THEN 159142000
    WHEN 'B004S08' THEN 718045740
    WHEN 'B004S09' THEN 940221369
    WHEN 'B004S10' THEN 320740772
    WHEN 'B004S11' THEN 12282918
    WHEN 'B004S12' THEN 327523215
    WHEN 'B004S13' THEN 1457401153
    WHEN 'B004S14' THEN 11909252
    WHEN 'B004S15' THEN 35829551
    WHEN 'B004S16' THEN 181262609
    WHEN 'B004S17' THEN 277623861
    WHEN 'B004S18' THEN 1538711118
    WHEN 'B004S19' THEN 36062924
  END::bigint,
  CASE na.ticker
    WHEN 'B004S00' THEN 0.192418
    WHEN 'B004S01' THEN -0.009192
    WHEN 'B004S02' THEN -0.153852
    WHEN 'B004S03' THEN 0.029035
    WHEN 'B004S04' THEN 0.055599
    WHEN 'B004S05' THEN -0.297645
    WHEN 'B004S06' THEN 0.045782
    WHEN 'B004S07' THEN 0.082997
    WHEN 'B004S08' THEN 0.491893
    WHEN 'B004S09' THEN -0.010571
    WHEN 'B004S10' THEN -0.264385
    WHEN 'B004S11' THEN -0.389795
    WHEN 'B004S12' THEN 0.321489
    WHEN 'B004S13' THEN -0.108376
    WHEN 'B004S14' THEN 0.433649
    WHEN 'B004S15' THEN -0.402215
    WHEN 'B004S16' THEN 0.386157
    WHEN 'B004S17' THEN 0.624342
    WHEN 'B004S18' THEN 0.537005
    WHEN 'B004S19' THEN -0.19547
  END::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN 0.345661
    WHEN 'B004S01' THEN 0.262155
    WHEN 'B004S02' THEN 0.530437
    WHEN 'B004S03' THEN 0.532523
    WHEN 'B004S04' THEN 0.227583
    WHEN 'B004S05' THEN 0.41385
    WHEN 'B004S06' THEN 0.240541
    WHEN 'B004S07' THEN 0.61189
    WHEN 'B004S08' THEN 0.195445
    WHEN 'B004S09' THEN 0.790346
    WHEN 'B004S10' THEN 0.479358
    WHEN 'B004S11' THEN 0.702324
    WHEN 'B004S12' THEN 0.641312
    WHEN 'B004S13' THEN 0.378597
    WHEN 'B004S14' THEN 0.738776
    WHEN 'B004S15' THEN 0.540368
    WHEN 'B004S16' THEN 0.493317
    WHEN 'B004S17' THEN 0.476761
    WHEN 'B004S18' THEN 0.198738
    WHEN 'B004S19' THEN 0.664311
  END::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN 0.412015
    WHEN 'B004S01' THEN -0.225789
    WHEN 'B004S02' THEN -0.384309
    WHEN 'B004S03' THEN -0.039369
    WHEN 'B004S04' THEN 0.0246
    WHEN 'B004S05' THEN -0.840026
    WHEN 'B004S06' THEN -0.017536
    WHEN 'B004S07' THEN 0.053926
    WHEN 'B004S08' THEN 2.260958
    WHEN 'B004S09' THEN -0.076639
    WHEN 'B004S10' THEN -0.655845
    WHEN 'B004S11' THEN -0.6262
    WHEN 'B004S12' THEN 0.423333
    WHEN 'B004S13' THEN -0.418322
    WHEN 'B004S14' THEN 0.519303
    WHEN 'B004S15' THEN -0.836865
    WHEN 'B004S16' THEN 0.681422
    WHEN 'B004S17' THEN 1.204676
    WHEN 'B004S18' THEN 2.450484
    WHEN 'B004S19' THEN -0.369511
  END::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN -0.506537
    WHEN 'B004S01' THEN -0.164369
    WHEN 'B004S02' THEN -0.336511
    WHEN 'B004S03' THEN -0.32353
    WHEN 'B004S04' THEN -0.260445
    WHEN 'B004S05' THEN -0.227472
    WHEN 'B004S06' THEN -0.228912
    WHEN 'B004S07' THEN -0.640261
    WHEN 'B004S08' THEN -0.064534
    WHEN 'B004S09' THEN -0.871059
    WHEN 'B004S10' THEN -0.218092
    WHEN 'B004S11' THEN -0.326639
    WHEN 'B004S12' THEN -0.778242
    WHEN 'B004S13' THEN -0.09603
    WHEN 'B004S14' THEN -0.119455
    WHEN 'B004S15' THEN -0.24128
    WHEN 'B004S16' THEN -0.192543
    WHEN 'B004S17' THEN -0.318569
    WHEN 'B004S18' THEN -0.217975
    WHEN 'B004S19' THEN -0.408646
  END::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN -0.506537
    WHEN 'B004S01' THEN -0.164369
    WHEN 'B004S02' THEN -0.336511
    WHEN 'B004S03' THEN -0.32353
    WHEN 'B004S04' THEN -0.260445
    WHEN 'B004S05' THEN -0.227472
    WHEN 'B004S06' THEN -0.228912
    WHEN 'B004S07' THEN -0.640261
    WHEN 'B004S08' THEN -0.064534
    WHEN 'B004S09' THEN -0.871059
    WHEN 'B004S10' THEN -0.218092
    WHEN 'B004S11' THEN -0.326639
    WHEN 'B004S12' THEN -0.778242
    WHEN 'B004S13' THEN -0.09603
    WHEN 'B004S14' THEN -0.119455
    WHEN 'B004S15' THEN -0.24128
    WHEN 'B004S16' THEN -0.192543
    WHEN 'B004S17' THEN -0.318569
    WHEN 'B004S18' THEN -0.217975
    WHEN 'B004S19' THEN -0.408646
  END::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN 0.070701
    WHEN 'B004S01' THEN 0.077749
    WHEN 'B004S02' THEN 0.009654
    WHEN 'B004S03' THEN 0.013651
    WHEN 'B004S04' THEN 0
    WHEN 'B004S05' THEN 0.064127
    WHEN 'B004S06' THEN 0.070648
    WHEN 'B004S07' THEN 0.053314
    WHEN 'B004S08' THEN 0
    WHEN 'B004S09' THEN 0.054076
    WHEN 'B004S10' THEN 0.001107
    WHEN 'B004S11' THEN 0.078252
    WHEN 'B004S12' THEN 0.035681
    WHEN 'B004S13' THEN 0.016488
    WHEN 'B004S14' THEN 0.008383
    WHEN 'B004S15' THEN 0
    WHEN 'B004S16' THEN 0
    WHEN 'B004S17' THEN 0.039289
    WHEN 'B004S18' THEN 0.043321
    WHEN 'B004S19' THEN 0.070083
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B004S00' THEN 'Mid Cap'
    WHEN 'B004S01' THEN 'Large Cap'
    WHEN 'B004S02' THEN 'Mid Cap'
    WHEN 'B004S03' THEN 'Small Cap'
    WHEN 'B004S04' THEN 'Large Cap'
    WHEN 'B004S05' THEN 'Mid Cap'
    WHEN 'B004S06' THEN 'Mega Cap'
    WHEN 'B004S07' THEN 'Large Cap'
    WHEN 'B004S08' THEN 'Large Cap'
    WHEN 'B004S09' THEN 'Mega Cap'
    WHEN 'B004S10' THEN 'Large Cap'
    WHEN 'B004S11' THEN 'Mid Cap'
    WHEN 'B004S12' THEN 'Large Cap'
    WHEN 'B004S13' THEN 'Large Cap'
    WHEN 'B004S14' THEN 'Small Cap'
    WHEN 'B004S15' THEN 'Mid Cap'
    WHEN 'B004S16' THEN 'Mid Cap'
    WHEN 'B004S17' THEN 'Large Cap'
    WHEN 'B004S18' THEN 'Large Cap'
    WHEN 'B004S19' THEN 'Small Cap'
  END::text,
  CASE na.ticker
    WHEN 'B004S00' THEN 'High'
    WHEN 'B004S01' THEN 'High'
    WHEN 'B004S02' THEN 'High'
    WHEN 'B004S03' THEN 'High'
    WHEN 'B004S04' THEN 'High'
    WHEN 'B004S05' THEN 'Medium'
    WHEN 'B004S06' THEN 'High'
    WHEN 'B004S07' THEN 'High'
    WHEN 'B004S08' THEN 'High'
    WHEN 'B004S09' THEN 'High'
    WHEN 'B004S10' THEN 'High'
    WHEN 'B004S11' THEN 'High'
    WHEN 'B004S12' THEN 'High'
    WHEN 'B004S13' THEN 'High'
    WHEN 'B004S14' THEN 'High'
    WHEN 'B004S15' THEN 'High'
    WHEN 'B004S16' THEN 'High'
    WHEN 'B004S17' THEN 'High'
    WHEN 'B004S18' THEN 'High'
    WHEN 'B004S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:07.782933", "pipeline_version": "4.0_mass", "batch_id": "004"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
