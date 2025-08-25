-- LOTE MASSIVO 7: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:16.826152
-- Tickers: B007S00, B007S01, B007S02, B007S03, B007S04, B007S05, B007S06, B007S07, B007S08, B007S09, B007S10, B007S11, B007S12, B007S13, B007S14, B007S15, B007S16, B007S17, B007S18, B007S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B007S00', 'STOCK', 'B007S00 Corporation', 'AMEX', 'Materials', 'Chemicals', 'USD', 'B007S00 Corporation operates in the chemicals industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B007S01', 'STOCK', 'B007S01 Corporation', 'NASDAQ', 'Consumer Cyclical', 'Restaurants', 'USD', 'B007S01 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B007S02', 'STOCK', 'B007S02 Corporation', 'AMEX', 'Technology', 'Semiconductors', 'USD', 'B007S02 Corporation operates in the semiconductors industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B007S03', 'STOCK', 'B007S03 Corporation', 'NYSE', 'Materials', 'Gold', 'USD', 'B007S03 Corporation operates in the gold industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B007S04', 'STOCK', 'B007S04 Corporation', 'NYSE', 'Industrials', 'Railroads', 'USD', 'B007S04 Corporation operates in the railroads industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B007S05', 'STOCK', 'B007S05 Corporation', 'AMEX', 'Technology', 'Software—Application', 'USD', 'B007S05 Corporation operates in the software—application industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B007S06', 'STOCK', 'B007S06 Corporation', 'AMEX', 'Industrials', 'Railroads', 'USD', 'B007S06 Corporation operates in the railroads industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B007S07', 'STOCK', 'B007S07 Corporation', 'NYSE', 'Industrials', 'Aerospace & Defense', 'USD', 'B007S07 Corporation operates in the aerospace & defense industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B007S08', 'STOCK', 'B007S08 Corporation', 'NYSE', 'Consumer Cyclical', 'Internet Retail', 'USD', 'B007S08 Corporation operates in the internet retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B007S09', 'STOCK', 'B007S09 Corporation', 'AMEX', 'Materials', 'Copper', 'USD', 'B007S09 Corporation operates in the copper industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B007S10', 'STOCK', 'B007S10 Corporation', 'AMEX', 'Consumer Defensive', 'Household Products', 'USD', 'B007S10 Corporation operates in the household products industry within the consumer defensive sector, providing innovative solutions and services to customers worldwide.'),
('B007S11', 'STOCK', 'B007S11 Corporation', 'AMEX', 'Consumer Defensive', 'Food Distribution', 'USD', 'B007S11 Corporation operates in the food distribution industry within the consumer defensive sector, providing innovative solutions and services to customers worldwide.'),
('B007S12', 'STOCK', 'B007S12 Corporation', 'NASDAQ', 'Real Estate', 'REIT—Office', 'USD', 'B007S12 Corporation operates in the reit—office industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B007S13', 'STOCK', 'B007S13 Corporation', 'NYSE', 'Technology', 'Software—Infrastructure', 'USD', 'B007S13 Corporation operates in the software—infrastructure industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B007S14', 'STOCK', 'B007S14 Corporation', 'AMEX', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'B007S14 Corporation operates in the oil & gas refining & marketing industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B007S15', 'STOCK', 'B007S15 Corporation', 'NYSE', 'Communication Services', 'Telecom Services', 'USD', 'B007S15 Corporation operates in the telecom services industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B007S16', 'STOCK', 'B007S16 Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'B007S16 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B007S17', 'STOCK', 'B007S17 Corporation', 'NYSE', 'Technology', 'Consumer Electronics', 'USD', 'B007S17 Corporation operates in the consumer electronics industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B007S18', 'STOCK', 'B007S18 Corporation', 'NYSE', 'Materials', 'Chemicals', 'USD', 'B007S18 Corporation operates in the chemicals industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B007S19', 'STOCK', 'B007S19 Corporation', 'NYSE', 'Consumer Cyclical', 'Internet Retail', 'USD', 'B007S19 Corporation operates in the internet retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B007S00', 'B007S01', 'B007S02', 'B007S03', 'B007S04', 'B007S05', 'B007S06', 'B007S07', 'B007S08', 'B007S09', 'B007S10', 'B007S11', 'B007S12', 'B007S13', 'B007S14', 'B007S15', 'B007S16', 'B007S17', 'B007S18', 'B007S19')
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
    WHEN 'B007S00' THEN 30.75
    WHEN 'B007S01' THEN 26.03
    WHEN 'B007S02' THEN 49.74
    WHEN 'B007S03' THEN 152.47
    WHEN 'B007S04' THEN 51.57
    WHEN 'B007S05' THEN 85.56
    WHEN 'B007S06' THEN 43.48
    WHEN 'B007S07' THEN 18.86
    WHEN 'B007S08' THEN 58.23
    WHEN 'B007S09' THEN 19.24
    WHEN 'B007S10' THEN 40.19
    WHEN 'B007S11' THEN 5.75
    WHEN 'B007S12' THEN 13.22
    WHEN 'B007S13' THEN 34.72
    WHEN 'B007S14' THEN 36.07
    WHEN 'B007S15' THEN 177.32
    WHEN 'B007S16' THEN 9.28
    WHEN 'B007S17' THEN 66.8
    WHEN 'B007S18' THEN 22.57
    WHEN 'B007S19' THEN 62.93
  END::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN 1677346548
    WHEN 'B007S01' THEN 7884264074
    WHEN 'B007S02' THEN 3492637316
    WHEN 'B007S03' THEN 178068344442
    WHEN 'B007S04' THEN 5358514360
    WHEN 'B007S05' THEN 7961434198
    WHEN 'B007S06' THEN 5069175774
    WHEN 'B007S07' THEN 6512595650
    WHEN 'B007S08' THEN 10247595077
    WHEN 'B007S09' THEN 773600232
    WHEN 'B007S10' THEN 1370426710
    WHEN 'B007S11' THEN 629073128
    WHEN 'B007S12' THEN 799386274
    WHEN 'B007S13' THEN 5052029142
    WHEN 'B007S14' THEN 373002268
    WHEN 'B007S15' THEN 68239401115
    WHEN 'B007S16' THEN 1436485032
    WHEN 'B007S17' THEN 9037150855
    WHEN 'B007S18' THEN 4427470230
    WHEN 'B007S19' THEN 6445104087
  END::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN 54556197
    WHEN 'B007S01' THEN 302939904
    WHEN 'B007S02' THEN 70211359
    WHEN 'B007S03' THEN 1167928929
    WHEN 'B007S04' THEN 103905871
    WHEN 'B007S05' THEN 93049018
    WHEN 'B007S06' THEN 116595327
    WHEN 'B007S07' THEN 345321476
    WHEN 'B007S08' THEN 175972709
    WHEN 'B007S09' THEN 40215942
    WHEN 'B007S10' THEN 34097884
    WHEN 'B007S11' THEN 109380693
    WHEN 'B007S12' THEN 60477836
    WHEN 'B007S13' THEN 145528630
    WHEN 'B007S14' THEN 10340148
    WHEN 'B007S15' THEN 384847427
    WHEN 'B007S16' THEN 154838039
    WHEN 'B007S17' THEN 135282881
    WHEN 'B007S18' THEN 196201628
    WHEN 'B007S19' THEN 102411241
  END::bigint,
  CASE na.ticker
    WHEN 'B007S00' THEN 9304615
    WHEN 'B007S01' THEN 125054204
    WHEN 'B007S02' THEN 20238381
    WHEN 'B007S03' THEN 1788504509
    WHEN 'B007S04' THEN 54538997
    WHEN 'B007S05' THEN 89048187
    WHEN 'B007S06' THEN 13165750
    WHEN 'B007S07' THEN 115280536
    WHEN 'B007S08' THEN 197451339
    WHEN 'B007S09' THEN 7199322
    WHEN 'B007S10' THEN 6003816
    WHEN 'B007S11' THEN 1220127
    WHEN 'B007S12' THEN 282555
    WHEN 'B007S13' THEN 19901400
    WHEN 'B007S14' THEN 1852644
    WHEN 'B007S15' THEN 251928137
    WHEN 'B007S16' THEN 12062513
    WHEN 'B007S17' THEN 52882514
    WHEN 'B007S18' THEN 58969814
    WHEN 'B007S19' THEN 44114081
  END::bigint,
  CASE na.ticker
    WHEN 'B007S00' THEN 0.047204
    WHEN 'B007S01' THEN 0.432577
    WHEN 'B007S02' THEN 0.470047
    WHEN 'B007S03' THEN -0.21239
    WHEN 'B007S04' THEN -0.091894
    WHEN 'B007S05' THEN -0.408831
    WHEN 'B007S06' THEN -0.022357
    WHEN 'B007S07' THEN -0.063183
    WHEN 'B007S08' THEN 0.045447
    WHEN 'B007S09' THEN -0.126697
    WHEN 'B007S10' THEN 0.043712
    WHEN 'B007S11' THEN -0.044881
    WHEN 'B007S12' THEN -0.556872
    WHEN 'B007S13' THEN -0.158212
    WHEN 'B007S14' THEN -0.035579
    WHEN 'B007S15' THEN 0.20084
    WHEN 'B007S16' THEN 0.127121
    WHEN 'B007S17' THEN -0.047364
    WHEN 'B007S18' THEN 0.077037
    WHEN 'B007S19' THEN 0.165479
  END::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN 0.531114
    WHEN 'B007S01' THEN 0.139395
    WHEN 'B007S02' THEN 0.170478
    WHEN 'B007S03' THEN 0.152606
    WHEN 'B007S04' THEN 0.446419
    WHEN 'B007S05' THEN 0.373346
    WHEN 'B007S06' THEN 0.642728
    WHEN 'B007S07' THEN 0.618311
    WHEN 'B007S08' THEN 0.251673
    WHEN 'B007S09' THEN 0.353759
    WHEN 'B007S10' THEN 0.773929
    WHEN 'B007S11' THEN 0.180964
    WHEN 'B007S12' THEN 0.489257
    WHEN 'B007S13' THEN 0.30996
    WHEN 'B007S14' THEN 0.393307
    WHEN 'B007S15' THEN 0.519176
    WHEN 'B007S16' THEN 0.435775
    WHEN 'B007S17' THEN 0.413483
    WHEN 'B007S18' THEN 0.330255
    WHEN 'B007S19' THEN 0.235782
  END::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN -0.005265
    WHEN 'B007S01' THEN 2.744545
    WHEN 'B007S02' THEN 2.463934
    WHEN 'B007S03' THEN -1.719395
    WHEN 'B007S04' THEN -0.31785
    WHEN 'B007S05' THEN -1.228969
    WHEN 'B007S06' THEN -0.112578
    WHEN 'B007S07' THEN -0.183052
    WHEN 'B007S08' THEN -0.018092
    WHEN 'B007S09' THEN -0.499485
    WHEN 'B007S10' THEN -0.008125
    WHEN 'B007S11' THEN -0.52431
    WHEN 'B007S12' THEN -1.240395
    WHEN 'B007S13' THEN -0.671738
    WHEN 'B007S14' THEN -0.217587
    WHEN 'B007S15' THEN 0.290537
    WHEN 'B007S16' THEN 0.176974
    WHEN 'B007S17' THEN -0.235474
    WHEN 'B007S18' THEN 0.081867
    WHEN 'B007S19' THEN 0.489772
  END::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN -0.479905
    WHEN 'B007S01' THEN -0.146732
    WHEN 'B007S02' THEN -0.121306
    WHEN 'B007S03' THEN -0.159647
    WHEN 'B007S04' THEN -0.339905
    WHEN 'B007S05' THEN -0.513406
    WHEN 'B007S06' THEN -0.356088
    WHEN 'B007S07' THEN -0.09796
    WHEN 'B007S08' THEN -0.340837
    WHEN 'B007S09' THEN -0.113163
    WHEN 'B007S10' THEN -0.690268
    WHEN 'B007S11' THEN -0.132198
    WHEN 'B007S12' THEN -0.404431
    WHEN 'B007S13' THEN -0.190433
    WHEN 'B007S14' THEN -0.209234
    WHEN 'B007S15' THEN -0.231024
    WHEN 'B007S16' THEN -0.46464
    WHEN 'B007S17' THEN -0.4149
    WHEN 'B007S18' THEN -0.349532
    WHEN 'B007S19' THEN -0.10163
  END::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN -0.479905
    WHEN 'B007S01' THEN -0.146732
    WHEN 'B007S02' THEN -0.121306
    WHEN 'B007S03' THEN -0.159647
    WHEN 'B007S04' THEN -0.339905
    WHEN 'B007S05' THEN -0.513406
    WHEN 'B007S06' THEN -0.356088
    WHEN 'B007S07' THEN -0.09796
    WHEN 'B007S08' THEN -0.340837
    WHEN 'B007S09' THEN -0.113163
    WHEN 'B007S10' THEN -0.690268
    WHEN 'B007S11' THEN -0.132198
    WHEN 'B007S12' THEN -0.404431
    WHEN 'B007S13' THEN -0.190433
    WHEN 'B007S14' THEN -0.209234
    WHEN 'B007S15' THEN -0.231024
    WHEN 'B007S16' THEN -0.46464
    WHEN 'B007S17' THEN -0.4149
    WHEN 'B007S18' THEN -0.349532
    WHEN 'B007S19' THEN -0.10163
  END::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN 0
    WHEN 'B007S01' THEN 0
    WHEN 'B007S02' THEN 0.076911
    WHEN 'B007S03' THEN 0
    WHEN 'B007S04' THEN 0
    WHEN 'B007S05' THEN 0
    WHEN 'B007S06' THEN 0.047084
    WHEN 'B007S07' THEN 0.00708
    WHEN 'B007S08' THEN 0.07969
    WHEN 'B007S09' THEN 0.057876
    WHEN 'B007S10' THEN 0
    WHEN 'B007S11' THEN 0
    WHEN 'B007S12' THEN 0.060888
    WHEN 'B007S13' THEN 0.077666
    WHEN 'B007S14' THEN 0.069433
    WHEN 'B007S15' THEN 0
    WHEN 'B007S16' THEN 0
    WHEN 'B007S17' THEN 0.001262
    WHEN 'B007S18' THEN 0
    WHEN 'B007S19' THEN 0.065917
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B007S00' THEN 'Small Cap'
    WHEN 'B007S01' THEN 'Mid Cap'
    WHEN 'B007S02' THEN 'Mid Cap'
    WHEN 'B007S03' THEN 'Large Cap'
    WHEN 'B007S04' THEN 'Mid Cap'
    WHEN 'B007S05' THEN 'Mid Cap'
    WHEN 'B007S06' THEN 'Mid Cap'
    WHEN 'B007S07' THEN 'Mid Cap'
    WHEN 'B007S08' THEN 'Large Cap'
    WHEN 'B007S09' THEN 'Small Cap'
    WHEN 'B007S10' THEN 'Small Cap'
    WHEN 'B007S11' THEN 'Small Cap'
    WHEN 'B007S12' THEN 'Small Cap'
    WHEN 'B007S13' THEN 'Mid Cap'
    WHEN 'B007S14' THEN 'Small Cap'
    WHEN 'B007S15' THEN 'Large Cap'
    WHEN 'B007S16' THEN 'Small Cap'
    WHEN 'B007S17' THEN 'Mid Cap'
    WHEN 'B007S18' THEN 'Mid Cap'
    WHEN 'B007S19' THEN 'Mid Cap'
  END::text,
  CASE na.ticker
    WHEN 'B007S00' THEN 'High'
    WHEN 'B007S01' THEN 'High'
    WHEN 'B007S02' THEN 'High'
    WHEN 'B007S03' THEN 'High'
    WHEN 'B007S04' THEN 'High'
    WHEN 'B007S05' THEN 'High'
    WHEN 'B007S06' THEN 'High'
    WHEN 'B007S07' THEN 'High'
    WHEN 'B007S08' THEN 'High'
    WHEN 'B007S09' THEN 'High'
    WHEN 'B007S10' THEN 'High'
    WHEN 'B007S11' THEN 'Medium'
    WHEN 'B007S12' THEN 'Low'
    WHEN 'B007S13' THEN 'High'
    WHEN 'B007S14' THEN 'Medium'
    WHEN 'B007S15' THEN 'High'
    WHEN 'B007S16' THEN 'High'
    WHEN 'B007S17' THEN 'High'
    WHEN 'B007S18' THEN 'High'
    WHEN 'B007S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:16.825948", "pipeline_version": "4.0_mass", "batch_id": "007"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
