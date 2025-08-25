-- LOTE MASSIVO 3: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:04.070561
-- Tickers: B003S00, B003S01, B003S02, B003S03, B003S04, B003S05, B003S06, B003S07, B003S08, B003S09, B003S10, B003S11, B003S12, B003S13, B003S14, B003S15, B003S16, B003S17, B003S18, B003S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B003S00', 'STOCK', 'B003S00 Corporation', 'AMEX', 'Materials', 'Gold', 'USD', 'B003S00 Corporation operates in the gold industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B003S01', 'STOCK', 'B003S01 Corporation', 'NYSE', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B003S01 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B003S02', 'STOCK', 'B003S02 Corporation', 'AMEX', 'Materials', 'Copper', 'USD', 'B003S02 Corporation operates in the copper industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B003S03', 'STOCK', 'B003S03 Corporation', 'AMEX', 'Real Estate', 'Real Estate Services', 'USD', 'B003S03 Corporation operates in the real estate services industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B003S04', 'STOCK', 'B003S04 Corporation', 'NYSE', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B003S04 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B003S05', 'STOCK', 'B003S05 Corporation', 'NASDAQ', 'Real Estate', 'Real Estate Services', 'USD', 'B003S05 Corporation operates in the real estate services industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B003S06', 'STOCK', 'B003S06 Corporation', 'NYSE', 'Communication Services', 'Entertainment', 'USD', 'B003S06 Corporation operates in the entertainment industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B003S07', 'STOCK', 'B003S07 Corporation', 'NYSE', 'Consumer Cyclical', 'Restaurants', 'USD', 'B003S07 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B003S08', 'STOCK', 'B003S08 Corporation', 'AMEX', 'Technology', 'Software—Infrastructure', 'USD', 'B003S08 Corporation operates in the software—infrastructure industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B003S09', 'STOCK', 'B003S09 Corporation', 'NASDAQ', 'Materials', 'Steel', 'USD', 'B003S09 Corporation operates in the steel industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B003S10', 'STOCK', 'B003S10 Corporation', 'NYSE', 'Industrials', 'Industrial Distribution', 'USD', 'B003S10 Corporation operates in the industrial distribution industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B003S11', 'STOCK', 'B003S11 Corporation', 'NYSE', 'Real Estate', 'REIT—Retail', 'USD', 'B003S11 Corporation operates in the reit—retail industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B003S12', 'STOCK', 'B003S12 Corporation', 'AMEX', 'Industrials', 'Railroads', 'USD', 'B003S12 Corporation operates in the railroads industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B003S13', 'STOCK', 'B003S13 Corporation', 'NYSE', 'Technology', 'Software—Infrastructure', 'USD', 'B003S13 Corporation operates in the software—infrastructure industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B003S14', 'STOCK', 'B003S14 Corporation', 'NYSE', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B003S14 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B003S15', 'STOCK', 'B003S15 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'B003S15 Corporation operates in the utilities—renewable industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B003S16', 'STOCK', 'B003S16 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B003S16 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B003S17', 'STOCK', 'B003S17 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B003S17 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B003S18', 'STOCK', 'B003S18 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'B003S18 Corporation operates in the utilities—renewable industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B003S19', 'STOCK', 'B003S19 Corporation', 'AMEX', 'Financial Services', 'Credit Services', 'USD', 'B003S19 Corporation operates in the credit services industry within the financial services sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B003S00', 'B003S01', 'B003S02', 'B003S03', 'B003S04', 'B003S05', 'B003S06', 'B003S07', 'B003S08', 'B003S09', 'B003S10', 'B003S11', 'B003S12', 'B003S13', 'B003S14', 'B003S15', 'B003S16', 'B003S17', 'B003S18', 'B003S19')
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
    WHEN 'B003S00' THEN 123.4
    WHEN 'B003S01' THEN 32.22
    WHEN 'B003S02' THEN 447.2
    WHEN 'B003S03' THEN 28.1
    WHEN 'B003S04' THEN 136.38
    WHEN 'B003S05' THEN 79.71
    WHEN 'B003S06' THEN 125.99
    WHEN 'B003S07' THEN 21.4
    WHEN 'B003S08' THEN 125.59
    WHEN 'B003S09' THEN 147.74
    WHEN 'B003S10' THEN 25.71
    WHEN 'B003S11' THEN 52.8
    WHEN 'B003S12' THEN 173.03
    WHEN 'B003S13' THEN 136.06
    WHEN 'B003S14' THEN 40.5
    WHEN 'B003S15' THEN 24.36
    WHEN 'B003S16' THEN 113.81
    WHEN 'B003S17' THEN 29.41
    WHEN 'B003S18' THEN 13.73
    WHEN 'B003S19' THEN 418.94
  END::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN 127351967914
    WHEN 'B003S01' THEN 186505178403
    WHEN 'B003S02' THEN 587587277302
    WHEN 'B003S03' THEN 1077044138
    WHEN 'B003S04' THEN 1204156360485
    WHEN 'B003S05' THEN 3863878527
    WHEN 'B003S06' THEN 20811716340
    WHEN 'B003S07' THEN 1950044069
    WHEN 'B003S08' THEN 41801594790
    WHEN 'B003S09' THEN 182257277859
    WHEN 'B003S10' THEN 543302890
    WHEN 'B003S11' THEN 109026850695
    WHEN 'B003S12' THEN 120160432235
    WHEN 'B003S13' THEN 58404761801
    WHEN 'B003S14' THEN 672024243
    WHEN 'B003S15' THEN 1634861232
    WHEN 'B003S16' THEN 38630288890
    WHEN 'B003S17' THEN 746313584
    WHEN 'B003S18' THEN 495350505
    WHEN 'B003S19' THEN 1172427387266
  END::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN 1032008921
    WHEN 'B003S01' THEN 5787746300
    WHEN 'B003S02' THEN 1313913690
    WHEN 'B003S03' THEN 38329369
    WHEN 'B003S04' THEN 8829620543
    WHEN 'B003S05' THEN 48476583
    WHEN 'B003S06' THEN 165182188
    WHEN 'B003S07' THEN 91115994
    WHEN 'B003S08' THEN 332850311
    WHEN 'B003S09' THEN 1233643908
    WHEN 'B003S10' THEN 21130361
    WHEN 'B003S11' THEN 2065038861
    WHEN 'B003S12' THEN 694429201
    WHEN 'B003S13' THEN 429271166
    WHEN 'B003S14' THEN 16593071
    WHEN 'B003S15' THEN 67111865
    WHEN 'B003S16' THEN 339413893
    WHEN 'B003S17' THEN 25373059
    WHEN 'B003S18' THEN 36071149
    WHEN 'B003S19' THEN 2798552953
  END::bigint,
  CASE na.ticker
    WHEN 'B003S00' THEN 264023845
    WHEN 'B003S01' THEN 742411155
    WHEN 'B003S02' THEN 735679779
    WHEN 'B003S03' THEN 13420322
    WHEN 'B003S04' THEN 223300697
    WHEN 'B003S05' THEN 12306408
    WHEN 'B003S06' THEN 331359983
    WHEN 'B003S07' THEN 10380386
    WHEN 'B003S08' THEN 358061550
    WHEN 'B003S09' THEN 1388827432
    WHEN 'B003S10' THEN 4747753
    WHEN 'B003S11' THEN 683273662
    WHEN 'B003S12' THEN 1518749659
    WHEN 'B003S13' THEN 371308521
    WHEN 'B003S14' THEN 1745986
    WHEN 'B003S15' THEN 24051638
    WHEN 'B003S16' THEN 341837981
    WHEN 'B003S17' THEN 4074489
    WHEN 'B003S18' THEN 240905
    WHEN 'B003S19' THEN 651762660
  END::bigint,
  CASE na.ticker
    WHEN 'B003S00' THEN -0.060087
    WHEN 'B003S01' THEN 0.575913
    WHEN 'B003S02' THEN -0.146313
    WHEN 'B003S03' THEN 0.081167
    WHEN 'B003S04' THEN 0.452377
    WHEN 'B003S05' THEN 0.426075
    WHEN 'B003S06' THEN 0.190027
    WHEN 'B003S07' THEN 0.62246
    WHEN 'B003S08' THEN -0.4057
    WHEN 'B003S09' THEN -0.027734
    WHEN 'B003S10' THEN -0.534448
    WHEN 'B003S11' THEN 0.099022
    WHEN 'B003S12' THEN 0.08202
    WHEN 'B003S13' THEN 0.087102
    WHEN 'B003S14' THEN -0.487322
    WHEN 'B003S15' THEN 0.061204
    WHEN 'B003S16' THEN 0.131897
    WHEN 'B003S17' THEN -0.018975
    WHEN 'B003S18' THEN -0.117263
    WHEN 'B003S19' THEN 0.03534
  END::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN 0.423284
    WHEN 'B003S01' THEN 0.756367
    WHEN 'B003S02' THEN 0.488592
    WHEN 'B003S03' THEN 0.248522
    WHEN 'B003S04' THEN 0.747196
    WHEN 'B003S05' THEN 0.121254
    WHEN 'B003S06' THEN 0.664626
    WHEN 'B003S07' THEN 0.312631
    WHEN 'B003S08' THEN 0.426469
    WHEN 'B003S09' THEN 0.255814
    WHEN 'B003S10' THEN 0.27469
    WHEN 'B003S11' THEN 0.631581
    WHEN 'B003S12' THEN 0.125739
    WHEN 'B003S13' THEN 0.631415
    WHEN 'B003S14' THEN 0.75258
    WHEN 'B003S15' THEN 0.172679
    WHEN 'B003S16' THEN 0.580259
    WHEN 'B003S17' THEN 0.594858
    WHEN 'B003S18' THEN 0.701008
    WHEN 'B003S19' THEN 0.755337
  END::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN -0.260078
    WHEN 'B003S01' THEN 0.695314
    WHEN 'B003S02' THEN -0.401793
    WHEN 'B003S03' THEN 0.125408
    WHEN 'B003S04' THEN 0.538515
    WHEN 'B003S05' THEN 3.101549
    WHEN 'B003S06' THEN 0.210686
    WHEN 'B003S07' THEN 1.831102
    WHEN 'B003S08' THEN -1.068542
    WHEN 'B003S09' THEN -0.30387
    WHEN 'B003S10' THEN -2.127663
    WHEN 'B003S11' THEN 0.077618
    WHEN 'B003S12' THEN 0.254656
    WHEN 'B003S13' THEN 0.05876
    WHEN 'B003S14' THEN -0.713974
    WHEN 'B003S15' THEN 0.064881
    WHEN 'B003S16' THEN 0.141139
    WHEN 'B003S17' THEN -0.115953
    WHEN 'B003S18' THEN -0.238603
    WHEN 'B003S19' THEN -0.019409
  END::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN -0.507212
    WHEN 'B003S01' THEN -0.173962
    WHEN 'B003S02' THEN -0.613677
    WHEN 'B003S03' THEN -0.293774
    WHEN 'B003S04' THEN -0.606509
    WHEN 'B003S05' THEN -0.143531
    WHEN 'B003S06' THEN -0.637517
    WHEN 'B003S07' THEN -0.154979
    WHEN 'B003S08' THEN -0.12129
    WHEN 'B003S09' THEN -0.310237
    WHEN 'B003S10' THEN -0.0908
    WHEN 'B003S11' THEN -0.740248
    WHEN 'B003S12' THEN -0.122895
    WHEN 'B003S13' THEN -0.777818
    WHEN 'B003S14' THEN -0.165167
    WHEN 'B003S15' THEN -0.256095
    WHEN 'B003S16' THEN -0.506854
    WHEN 'B003S17' THEN -0.838286
    WHEN 'B003S18' THEN -0.841101
    WHEN 'B003S19' THEN -0.441825
  END::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN -0.507212
    WHEN 'B003S01' THEN -0.173962
    WHEN 'B003S02' THEN -0.613677
    WHEN 'B003S03' THEN -0.293774
    WHEN 'B003S04' THEN -0.606509
    WHEN 'B003S05' THEN -0.143531
    WHEN 'B003S06' THEN -0.637517
    WHEN 'B003S07' THEN -0.154979
    WHEN 'B003S08' THEN -0.12129
    WHEN 'B003S09' THEN -0.310237
    WHEN 'B003S10' THEN -0.0908
    WHEN 'B003S11' THEN -0.740248
    WHEN 'B003S12' THEN -0.122895
    WHEN 'B003S13' THEN -0.777818
    WHEN 'B003S14' THEN -0.165167
    WHEN 'B003S15' THEN -0.256095
    WHEN 'B003S16' THEN -0.506854
    WHEN 'B003S17' THEN -0.838286
    WHEN 'B003S18' THEN -0.841101
    WHEN 'B003S19' THEN -0.441825
  END::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN 0
    WHEN 'B003S01' THEN 0.00422
    WHEN 'B003S02' THEN 0.010284
    WHEN 'B003S03' THEN 0.036076
    WHEN 'B003S04' THEN 0.064251
    WHEN 'B003S05' THEN 0
    WHEN 'B003S06' THEN 0.055545
    WHEN 'B003S07' THEN 0.035207
    WHEN 'B003S08' THEN 0.053204
    WHEN 'B003S09' THEN 0.038305
    WHEN 'B003S10' THEN 0.045803
    WHEN 'B003S11' THEN 0.011155
    WHEN 'B003S12' THEN 0
    WHEN 'B003S13' THEN 0
    WHEN 'B003S14' THEN 0.026648
    WHEN 'B003S15' THEN 0.032054
    WHEN 'B003S16' THEN 0.078457
    WHEN 'B003S17' THEN 0
    WHEN 'B003S18' THEN 0.002515
    WHEN 'B003S19' THEN 0
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B003S00' THEN 'Large Cap'
    WHEN 'B003S01' THEN 'Large Cap'
    WHEN 'B003S02' THEN 'Mega Cap'
    WHEN 'B003S03' THEN 'Small Cap'
    WHEN 'B003S04' THEN 'Mega Cap'
    WHEN 'B003S05' THEN 'Mid Cap'
    WHEN 'B003S06' THEN 'Large Cap'
    WHEN 'B003S07' THEN 'Small Cap'
    WHEN 'B003S08' THEN 'Large Cap'
    WHEN 'B003S09' THEN 'Large Cap'
    WHEN 'B003S10' THEN 'Small Cap'
    WHEN 'B003S11' THEN 'Large Cap'
    WHEN 'B003S12' THEN 'Large Cap'
    WHEN 'B003S13' THEN 'Large Cap'
    WHEN 'B003S14' THEN 'Small Cap'
    WHEN 'B003S15' THEN 'Small Cap'
    WHEN 'B003S16' THEN 'Large Cap'
    WHEN 'B003S17' THEN 'Small Cap'
    WHEN 'B003S18' THEN 'Small Cap'
    WHEN 'B003S19' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'B003S00' THEN 'High'
    WHEN 'B003S01' THEN 'High'
    WHEN 'B003S02' THEN 'High'
    WHEN 'B003S03' THEN 'High'
    WHEN 'B003S04' THEN 'High'
    WHEN 'B003S05' THEN 'High'
    WHEN 'B003S06' THEN 'High'
    WHEN 'B003S07' THEN 'High'
    WHEN 'B003S08' THEN 'High'
    WHEN 'B003S09' THEN 'High'
    WHEN 'B003S10' THEN 'Medium'
    WHEN 'B003S11' THEN 'High'
    WHEN 'B003S12' THEN 'High'
    WHEN 'B003S13' THEN 'High'
    WHEN 'B003S14' THEN 'Medium'
    WHEN 'B003S15' THEN 'High'
    WHEN 'B003S16' THEN 'High'
    WHEN 'B003S17' THEN 'Medium'
    WHEN 'B003S18' THEN 'Low'
    WHEN 'B003S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:04.070317", "pipeline_version": "4.0_mass", "batch_id": "003"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
