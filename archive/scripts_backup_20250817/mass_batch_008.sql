-- LOTE MASSIVO 8: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:19.101666
-- Tickers: B008S00, B008S01, B008S02, B008S03, B008S04, B008S05, B008S06, B008S07, B008S08, B008S09, B008S10, B008S11, B008S12, B008S13, B008S14, B008S15, B008S16, B008S17, B008S18, B008S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B008S00', 'STOCK', 'B008S00 Corporation', 'NASDAQ', 'Consumer Cyclical', 'Restaurants', 'USD', 'B008S00 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B008S01', 'STOCK', 'B008S01 Corporation', 'NYSE', 'Healthcare', 'Medical Devices', 'USD', 'B008S01 Corporation operates in the medical devices industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B008S02', 'STOCK', 'B008S02 Corporation', 'AMEX', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'B008S02 Corporation operates in the drug manufacturers—general industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B008S03', 'STOCK', 'B008S03 Corporation', 'NASDAQ', 'Financial Services', 'Credit Services', 'USD', 'B008S03 Corporation operates in the credit services industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B008S04', 'STOCK', 'B008S04 Corporation', 'NASDAQ', 'Materials', 'Chemicals', 'USD', 'B008S04 Corporation operates in the chemicals industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B008S05', 'STOCK', 'B008S05 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B008S05 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B008S06', 'STOCK', 'B008S06 Corporation', 'NASDAQ', 'Real Estate', 'Real Estate Services', 'USD', 'B008S06 Corporation operates in the real estate services industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B008S07', 'STOCK', 'B008S07 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B008S07 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B008S08', 'STOCK', 'B008S08 Corporation', 'NYSE', 'Financial Services', 'Asset Management', 'USD', 'B008S08 Corporation operates in the asset management industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B008S09', 'STOCK', 'B008S09 Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'B008S09 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B008S10', 'STOCK', 'B008S10 Corporation', 'NASDAQ', 'Communication Services', 'Media', 'USD', 'B008S10 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B008S11', 'STOCK', 'B008S11 Corporation', 'AMEX', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B008S11 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B008S12', 'STOCK', 'B008S12 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B008S12 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B008S13', 'STOCK', 'B008S13 Corporation', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail', 'USD', 'B008S13 Corporation operates in the internet retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B008S14', 'STOCK', 'B008S14 Corporation', 'AMEX', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B008S14 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B008S15', 'STOCK', 'B008S15 Corporation', 'NYSE', 'Healthcare', 'Biotechnology', 'USD', 'B008S15 Corporation operates in the biotechnology industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B008S16', 'STOCK', 'B008S16 Corporation', 'AMEX', 'Communication Services', 'Media', 'USD', 'B008S16 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B008S17', 'STOCK', 'B008S17 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B008S17 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B008S18', 'STOCK', 'B008S18 Corporation', 'NYSE', 'Real Estate', 'REIT—Retail', 'USD', 'B008S18 Corporation operates in the reit—retail industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B008S19', 'STOCK', 'B008S19 Corporation', 'AMEX', 'Materials', 'Chemicals', 'USD', 'B008S19 Corporation operates in the chemicals industry within the materials sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B008S00', 'B008S01', 'B008S02', 'B008S03', 'B008S04', 'B008S05', 'B008S06', 'B008S07', 'B008S08', 'B008S09', 'B008S10', 'B008S11', 'B008S12', 'B008S13', 'B008S14', 'B008S15', 'B008S16', 'B008S17', 'B008S18', 'B008S19')
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
    WHEN 'B008S00' THEN 63.23
    WHEN 'B008S01' THEN 83.84
    WHEN 'B008S02' THEN 84.66
    WHEN 'B008S03' THEN 93.92
    WHEN 'B008S04' THEN 89.49
    WHEN 'B008S05' THEN 152.02
    WHEN 'B008S06' THEN 34.82
    WHEN 'B008S07' THEN 59.24
    WHEN 'B008S08' THEN 9.27
    WHEN 'B008S09' THEN 87.38
    WHEN 'B008S10' THEN 25.56
    WHEN 'B008S11' THEN 79.43
    WHEN 'B008S12' THEN 84.86
    WHEN 'B008S13' THEN 21.98
    WHEN 'B008S14' THEN 29.58
    WHEN 'B008S15' THEN 32.88
    WHEN 'B008S16' THEN 121.27
    WHEN 'B008S17' THEN 56.17
    WHEN 'B008S18' THEN 34.88
    WHEN 'B008S19' THEN 86.77
  END::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN 2682134487808
    WHEN 'B008S01' THEN 9412663116
    WHEN 'B008S02' THEN 6291857141
    WHEN 'B008S03' THEN 8657200258
    WHEN 'B008S04' THEN 9275797108
    WHEN 'B008S05' THEN 54091559111
    WHEN 'B008S06' THEN 5915706610
    WHEN 'B008S07' THEN 8143685482
    WHEN 'B008S08' THEN 1046433030
    WHEN 'B008S09' THEN 5762757839
    WHEN 'B008S10' THEN 1270097221
    WHEN 'B008S11' THEN 7479740479
    WHEN 'B008S12' THEN 121592416747
    WHEN 'B008S13' THEN 885266985
    WHEN 'B008S14' THEN 6170395335
    WHEN 'B008S15' THEN 9002065052
    WHEN 'B008S16' THEN 72720352088
    WHEN 'B008S17' THEN 8498798925
    WHEN 'B008S18' THEN 147718587782
    WHEN 'B008S19' THEN 3668616230
  END::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN 42416153568
    WHEN 'B008S01' THEN 112268816
    WHEN 'B008S02' THEN 74319702
    WHEN 'B008S03' THEN 92179082
    WHEN 'B008S04' THEN 103648383
    WHEN 'B008S05' THEN 355809706
    WHEN 'B008S06' THEN 169907602
    WHEN 'B008S07' THEN 137460272
    WHEN 'B008S08' THEN 112870428
    WHEN 'B008S09' THEN 65948696
    WHEN 'B008S10' THEN 49695927
    WHEN 'B008S11' THEN 94163850
    WHEN 'B008S12' THEN 1432813226
    WHEN 'B008S13' THEN 40269666
    WHEN 'B008S14' THEN 208611424
    WHEN 'B008S15' THEN 273798461
    WHEN 'B008S16' THEN 599641896
    WHEN 'B008S17' THEN 151311454
    WHEN 'B008S18' THEN 4234619487
    WHEN 'B008S19' THEN 42282050
  END::bigint,
  CASE na.ticker
    WHEN 'B008S00' THEN 1999247066
    WHEN 'B008S01' THEN 41744980
    WHEN 'B008S02' THEN 6492211
    WHEN 'B008S03' THEN 143278437
    WHEN 'B008S04' THEN 37687965
    WHEN 'B008S05' THEN 71593076
    WHEN 'B008S06' THEN 36702790
    WHEN 'B008S07' THEN 51661156
    WHEN 'B008S08' THEN 20897304
    WHEN 'B008S09' THEN 50188728
    WHEN 'B008S10' THEN 18782969
    WHEN 'B008S11' THEN 107836181
    WHEN 'B008S12' THEN 343064394
    WHEN 'B008S13' THEN 139343
    WHEN 'B008S14' THEN 39805202
    WHEN 'B008S15' THEN 164503879
    WHEN 'B008S16' THEN 193595986
    WHEN 'B008S17' THEN 59297307
    WHEN 'B008S18' THEN 569959226
    WHEN 'B008S19' THEN 428469
  END::bigint,
  CASE na.ticker
    WHEN 'B008S00' THEN 0.082852
    WHEN 'B008S01' THEN 0.519153
    WHEN 'B008S02' THEN 0.072952
    WHEN 'B008S03' THEN -0.211438
    WHEN 'B008S04' THEN 0.060146
    WHEN 'B008S05' THEN 0.070224
    WHEN 'B008S06' THEN 0.428933
    WHEN 'B008S07' THEN 0.279725
    WHEN 'B008S08' THEN -0.003598
    WHEN 'B008S09' THEN 0.046617
    WHEN 'B008S10' THEN -0.228584
    WHEN 'B008S11' THEN 0.188064
    WHEN 'B008S12' THEN 0.060319
    WHEN 'B008S13' THEN 0.079366
    WHEN 'B008S14' THEN 0.401383
    WHEN 'B008S15' THEN 0.013467
    WHEN 'B008S16' THEN 0.235355
    WHEN 'B008S17' THEN 0.007509
    WHEN 'B008S18' THEN -0.199549
    WHEN 'B008S19' THEN 0.378764
  END::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN 0.431876
    WHEN 'B008S01' THEN 0.4566
    WHEN 'B008S02' THEN 0.708483
    WHEN 'B008S03' THEN 0.499749
    WHEN 'B008S04' THEN 0.459425
    WHEN 'B008S05' THEN 0.476161
    WHEN 'B008S06' THEN 0.598692
    WHEN 'B008S07' THEN 0.516496
    WHEN 'B008S08' THEN 0.532731
    WHEN 'B008S09' THEN 0.253691
    WHEN 'B008S10' THEN 0.377601
    WHEN 'B008S11' THEN 0.597078
    WHEN 'B008S12' THEN 0.538159
    WHEN 'B008S13' THEN 0.669588
    WHEN 'B008S14' THEN 0.601812
    WHEN 'B008S15' THEN 0.14911
    WHEN 'B008S16' THEN 0.621601
    WHEN 'B008S17' THEN 0.288245
    WHEN 'B008S18' THEN 0.357662
    WHEN 'B008S19' THEN 0.621976
  END::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN 0.076068
    WHEN 'B008S01' THEN 1.027493
    WHEN 'B008S02' THEN 0.032396
    WHEN 'B008S03' THEN -0.523137
    WHEN 'B008S04' THEN 0.022084
    WHEN 'B008S05' THEN 0.042473
    WHEN 'B008S06' THEN 0.632935
    WHEN 'B008S07' THEN 0.444776
    WHEN 'B008S08' THEN -0.10061
    WHEN 'B008S09' THEN -0.013333
    WHEN 'B008S10' THEN -0.737773
    WHEN 'B008S11' THEN 0.231233
    WHEN 'B008S12' THEN 0.019175
    WHEN 'B008S13' THEN 0.043857
    WHEN 'B008S14' THEN 0.583875
    WHEN 'B008S15' THEN -0.245006
    WHEN 'B008S16' THEN 0.298189
    WHEN 'B008S17' THEN -0.147412
    WHEN 'B008S18' THEN -0.697723
    WHEN 'B008S19' THEN 0.52858
  END::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN -0.066497
    WHEN 'B008S01' THEN -0.285433
    WHEN 'B008S02' THEN -0.42395
    WHEN 'B008S03' THEN -0.186959
    WHEN 'B008S04' THEN -0.16105
    WHEN 'B008S05' THEN -0.677214
    WHEN 'B008S06' THEN -0.277042
    WHEN 'B008S07' THEN -0.165093
    WHEN 'B008S08' THEN -0.373474
    WHEN 'B008S09' THEN -0.307303
    WHEN 'B008S10' THEN -0.137207
    WHEN 'B008S11' THEN -0.079053
    WHEN 'B008S12' THEN -0.257608
    WHEN 'B008S13' THEN -0.847989
    WHEN 'B008S14' THEN -0.289295
    WHEN 'B008S15' THEN -0.156512
    WHEN 'B008S16' THEN -0.220898
    WHEN 'B008S17' THEN -0.243091
    WHEN 'B008S18' THEN -0.107293
    WHEN 'B008S19' THEN -0.262538
  END::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN -0.066497
    WHEN 'B008S01' THEN -0.285433
    WHEN 'B008S02' THEN -0.42395
    WHEN 'B008S03' THEN -0.186959
    WHEN 'B008S04' THEN -0.16105
    WHEN 'B008S05' THEN -0.677214
    WHEN 'B008S06' THEN -0.277042
    WHEN 'B008S07' THEN -0.165093
    WHEN 'B008S08' THEN -0.373474
    WHEN 'B008S09' THEN -0.307303
    WHEN 'B008S10' THEN -0.137207
    WHEN 'B008S11' THEN -0.079053
    WHEN 'B008S12' THEN -0.257608
    WHEN 'B008S13' THEN -0.847989
    WHEN 'B008S14' THEN -0.289295
    WHEN 'B008S15' THEN -0.156512
    WHEN 'B008S16' THEN -0.220898
    WHEN 'B008S17' THEN -0.243091
    WHEN 'B008S18' THEN -0.107293
    WHEN 'B008S19' THEN -0.262538
  END::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN 0.06529
    WHEN 'B008S01' THEN 0
    WHEN 'B008S02' THEN 0
    WHEN 'B008S03' THEN 0.040998
    WHEN 'B008S04' THEN 0
    WHEN 'B008S05' THEN 0
    WHEN 'B008S06' THEN 0.009611
    WHEN 'B008S07' THEN 0.067354
    WHEN 'B008S08' THEN 0.002995
    WHEN 'B008S09' THEN 0
    WHEN 'B008S10' THEN 0
    WHEN 'B008S11' THEN 0
    WHEN 'B008S12' THEN 0
    WHEN 'B008S13' THEN 0.043121
    WHEN 'B008S14' THEN 0.012491
    WHEN 'B008S15' THEN 0.043161
    WHEN 'B008S16' THEN 0.006202
    WHEN 'B008S17' THEN 0
    WHEN 'B008S18' THEN 0.067265
    WHEN 'B008S19' THEN 0
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B008S00' THEN 'Mega Cap'
    WHEN 'B008S01' THEN 'Mid Cap'
    WHEN 'B008S02' THEN 'Mid Cap'
    WHEN 'B008S03' THEN 'Mid Cap'
    WHEN 'B008S04' THEN 'Mid Cap'
    WHEN 'B008S05' THEN 'Large Cap'
    WHEN 'B008S06' THEN 'Mid Cap'
    WHEN 'B008S07' THEN 'Mid Cap'
    WHEN 'B008S08' THEN 'Small Cap'
    WHEN 'B008S09' THEN 'Mid Cap'
    WHEN 'B008S10' THEN 'Small Cap'
    WHEN 'B008S11' THEN 'Mid Cap'
    WHEN 'B008S12' THEN 'Large Cap'
    WHEN 'B008S13' THEN 'Small Cap'
    WHEN 'B008S14' THEN 'Mid Cap'
    WHEN 'B008S15' THEN 'Mid Cap'
    WHEN 'B008S16' THEN 'Large Cap'
    WHEN 'B008S17' THEN 'Mid Cap'
    WHEN 'B008S18' THEN 'Large Cap'
    WHEN 'B008S19' THEN 'Mid Cap'
  END::text,
  CASE na.ticker
    WHEN 'B008S00' THEN 'High'
    WHEN 'B008S01' THEN 'High'
    WHEN 'B008S02' THEN 'High'
    WHEN 'B008S03' THEN 'High'
    WHEN 'B008S04' THEN 'High'
    WHEN 'B008S05' THEN 'High'
    WHEN 'B008S06' THEN 'High'
    WHEN 'B008S07' THEN 'High'
    WHEN 'B008S08' THEN 'High'
    WHEN 'B008S09' THEN 'High'
    WHEN 'B008S10' THEN 'High'
    WHEN 'B008S11' THEN 'High'
    WHEN 'B008S12' THEN 'High'
    WHEN 'B008S13' THEN 'Low'
    WHEN 'B008S14' THEN 'High'
    WHEN 'B008S15' THEN 'High'
    WHEN 'B008S16' THEN 'High'
    WHEN 'B008S17' THEN 'High'
    WHEN 'B008S18' THEN 'High'
    WHEN 'B008S19' THEN 'Low'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:19.101445", "pipeline_version": "4.0_mass", "batch_id": "008"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
