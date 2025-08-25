-- LOTE MASSIVO 2: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:01.690205
-- Tickers: B002S00, B002S01, B002S02, B002S03, B002S04, B002S05, B002S06, B002S07, B002S08, B002S09, B002S10, B002S11, B002S12, B002S13, B002S14, B002S15, B002S16, B002S17, B002S18, B002S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B002S00', 'STOCK', 'B002S00 Corporation', 'AMEX', 'Financial Services', 'Insurance—Life', 'USD', 'B002S00 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B002S01', 'STOCK', 'B002S01 Corporation', 'NYSE', 'Technology', 'Semiconductors', 'USD', 'B002S01 Corporation operates in the semiconductors industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B002S02', 'STOCK', 'B002S02 Corporation', 'AMEX', 'Industrials', 'Aerospace & Defense', 'USD', 'B002S02 Corporation operates in the aerospace & defense industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B002S03', 'STOCK', 'B002S03 Corporation', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'B002S03 Corporation operates in the internet content & information industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B002S04', 'STOCK', 'B002S04 Corporation', 'AMEX', 'Financial Services', 'Insurance—Life', 'USD', 'B002S04 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B002S05', 'STOCK', 'B002S05 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'B002S05 Corporation operates in the utilities—regulated electric industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B002S06', 'STOCK', 'B002S06 Corporation', 'NASDAQ', 'Materials', 'Copper', 'USD', 'B002S06 Corporation operates in the copper industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B002S07', 'STOCK', 'B002S07 Corporation', 'NASDAQ', 'Financial Services', 'Banks—Regional', 'USD', 'B002S07 Corporation operates in the banks—regional industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B002S08', 'STOCK', 'B002S08 Corporation', 'AMEX', 'Healthcare', 'Biotechnology', 'USD', 'B002S08 Corporation operates in the biotechnology industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B002S09', 'STOCK', 'B002S09 Corporation', 'NASDAQ', 'Communication Services', 'Media', 'USD', 'B002S09 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B002S10', 'STOCK', 'B002S10 Corporation', 'AMEX', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'B002S10 Corporation operates in the auto manufacturers industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B002S11', 'STOCK', 'B002S11 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'B002S11 Corporation operates in the utilities—regulated electric industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B002S12', 'STOCK', 'B002S12 Corporation', 'NASDAQ', 'Consumer Cyclical', 'Restaurants', 'USD', 'B002S12 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B002S13', 'STOCK', 'B002S13 Corporation', 'NYSE', 'Industrials', 'Industrial Distribution', 'USD', 'B002S13 Corporation operates in the industrial distribution industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B002S14', 'STOCK', 'B002S14 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas E&P', 'USD', 'B002S14 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B002S15', 'STOCK', 'B002S15 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B002S15 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B002S16', 'STOCK', 'B002S16 Corporation', 'AMEX', 'Financial Services', 'Banks—Regional', 'USD', 'B002S16 Corporation operates in the banks—regional industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B002S17', 'STOCK', 'B002S17 Corporation', 'AMEX', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'B002S17 Corporation operates in the auto manufacturers industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B002S18', 'STOCK', 'B002S18 Corporation', 'NYSE', 'Consumer Cyclical', 'Apparel Retail', 'USD', 'B002S18 Corporation operates in the apparel retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B002S19', 'STOCK', 'B002S19 Corporation', 'NYSE', 'Communication Services', 'Entertainment', 'USD', 'B002S19 Corporation operates in the entertainment industry within the communication services sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B002S00', 'B002S01', 'B002S02', 'B002S03', 'B002S04', 'B002S05', 'B002S06', 'B002S07', 'B002S08', 'B002S09', 'B002S10', 'B002S11', 'B002S12', 'B002S13', 'B002S14', 'B002S15', 'B002S16', 'B002S17', 'B002S18', 'B002S19')
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
    WHEN 'B002S00' THEN 54.21
    WHEN 'B002S01' THEN 52.27
    WHEN 'B002S02' THEN 79.2
    WHEN 'B002S03' THEN 141.05
    WHEN 'B002S04' THEN 176.6
    WHEN 'B002S05' THEN 174.93
    WHEN 'B002S06' THEN 20.29
    WHEN 'B002S07' THEN 51.16
    WHEN 'B002S08' THEN 42.41
    WHEN 'B002S09' THEN 169.15
    WHEN 'B002S10' THEN 37.48
    WHEN 'B002S11' THEN 11.59
    WHEN 'B002S12' THEN 27.04
    WHEN 'B002S13' THEN 83.77
    WHEN 'B002S14' THEN 23.18
    WHEN 'B002S15' THEN 37.09
    WHEN 'B002S16' THEN 487.08
    WHEN 'B002S17' THEN 128.0
    WHEN 'B002S18' THEN 68.54
    WHEN 'B002S19' THEN 52.8
  END::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN 7448344245
    WHEN 'B002S01' THEN 3638573860
    WHEN 'B002S02' THEN 2989249576419
    WHEN 'B002S03' THEN 34494964471
    WHEN 'B002S04' THEN 133990272800
    WHEN 'B002S05' THEN 60207408152
    WHEN 'B002S06' THEN 8115834903
    WHEN 'B002S07' THEN 19404870088
    WHEN 'B002S08' THEN 3154029492
    WHEN 'B002S09' THEN 1151016512618
    WHEN 'B002S10' THEN 841514636
    WHEN 'B002S11' THEN 9148817545
    WHEN 'B002S12' THEN 481281457
    WHEN 'B002S13' THEN 7865075808
    WHEN 'B002S14' THEN 1393027380
    WHEN 'B002S15' THEN 1978984672
    WHEN 'B002S16' THEN 1956948596121
    WHEN 'B002S17' THEN 19931852342
    WHEN 'B002S18' THEN 7437636297
    WHEN 'B002S19' THEN 167955976381
  END::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN 137392818
    WHEN 'B002S01' THEN 69607997
    WHEN 'B002S02' THEN 37745057160
    WHEN 'B002S03' THEN 244559879
    WHEN 'B002S04' THEN 758742745
    WHEN 'B002S05' THEN 344171765
    WHEN 'B002S06' THEN 399927163
    WHEN 'B002S07' THEN 379332034
    WHEN 'B002S08' THEN 74377029
    WHEN 'B002S09' THEN 6804663660
    WHEN 'B002S10' THEN 22454885
    WHEN 'B002S11' THEN 789202765
    WHEN 'B002S12' THEN 17797181
    WHEN 'B002S13' THEN 93888167
    WHEN 'B002S14' THEN 60083659
    WHEN 'B002S15' THEN 53351587
    WHEN 'B002S16' THEN 4017727977
    WHEN 'B002S17' THEN 155720314
    WHEN 'B002S18' THEN 108512360
    WHEN 'B002S19' THEN 3180805388
  END::bigint,
  CASE na.ticker
    WHEN 'B002S00' THEN 142297097
    WHEN 'B002S01' THEN 41020844
    WHEN 'B002S02' THEN 1057394777
    WHEN 'B002S03' THEN 20732524
    WHEN 'B002S04' THEN 665700744
    WHEN 'B002S05' THEN 200169212
    WHEN 'B002S06' THEN 38126480
    WHEN 'B002S07' THEN 44432831
    WHEN 'B002S08' THEN 16155558
    WHEN 'B002S09' THEN 291288068
    WHEN 'B002S10' THEN 12488680
    WHEN 'B002S11' THEN 37401647
    WHEN 'B002S12' THEN 1150203
    WHEN 'B002S13' THEN 67046576
    WHEN 'B002S14' THEN 13337629
    WHEN 'B002S15' THEN 21985942
    WHEN 'B002S16' THEN 1825197445
    WHEN 'B002S17' THEN 317846241
    WHEN 'B002S18' THEN 4200987
    WHEN 'B002S19' THEN 1095986361
  END::bigint,
  CASE na.ticker
    WHEN 'B002S00' THEN 0.299808
    WHEN 'B002S01' THEN 0.139653
    WHEN 'B002S02' THEN -0.497507
    WHEN 'B002S03' THEN 0.024507
    WHEN 'B002S04' THEN -0.066201
    WHEN 'B002S05' THEN 0.053263
    WHEN 'B002S06' THEN 0.160101
    WHEN 'B002S07' THEN 0.475633
    WHEN 'B002S08' THEN 0.157835
    WHEN 'B002S09' THEN -0.231799
    WHEN 'B002S10' THEN -0.24387
    WHEN 'B002S11' THEN 0.209604
    WHEN 'B002S12' THEN -0.184304
    WHEN 'B002S13' THEN -0.036421
    WHEN 'B002S14' THEN -0.123201
    WHEN 'B002S15' THEN 0.462773
    WHEN 'B002S16' THEN 0.077831
    WHEN 'B002S17' THEN 0.309033
    WHEN 'B002S18' THEN 0.401635
    WHEN 'B002S19' THEN -0.084794
  END::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN 0.218413
    WHEN 'B002S01' THEN 0.3439
    WHEN 'B002S02' THEN 0.278833
    WHEN 'B002S03' THEN 0.546294
    WHEN 'B002S04' THEN 0.303996
    WHEN 'B002S05' THEN 0.480932
    WHEN 'B002S06' THEN 0.628893
    WHEN 'B002S07' THEN 0.787048
    WHEN 'B002S08' THEN 0.313396
    WHEN 'B002S09' THEN 0.793887
    WHEN 'B002S10' THEN 0.253876
    WHEN 'B002S11' THEN 0.470452
    WHEN 'B002S12' THEN 0.727523
    WHEN 'B002S13' THEN 0.428353
    WHEN 'B002S14' THEN 0.549893
    WHEN 'B002S15' THEN 0.580202
    WHEN 'B002S16' THEN 0.470033
    WHEN 'B002S17' THEN 0.66588
    WHEN 'B002S18' THEN 0.515705
    WHEN 'B002S19' THEN 0.476897
  END::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN 1.143746
    WHEN 'B002S01' THEN 0.260695
    WHEN 'B002S02' THEN -1.963566
    WHEN 'B002S03' THEN -0.046665
    WHEN 'B002S04' THEN -0.382244
    WHEN 'B002S05' THEN 0.006785
    WHEN 'B002S06' THEN 0.17507
    WHEN 'B002S07' THEN 0.540797
    WHEN 'B002S08' THEN 0.344085
    WHEN 'B002S09' THEN -0.354961
    WHEN 'B002S10' THEN -1.157534
    WHEN 'B002S11' THEN 0.339258
    WHEN 'B002S12' THEN -0.322057
    WHEN 'B002S13' THEN -0.201752
    WHEN 'B002S14' THEN -0.314971
    WHEN 'B002S15' THEN 0.71143
    WHEN 'B002S16' THEN 0.05921
    WHEN 'B002S17' THEN 0.389009
    WHEN 'B002S18' THEN 0.681853
    WHEN 'B002S19' THEN -0.282647
  END::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN -0.085615
    WHEN 'B002S01' THEN -0.357337
    WHEN 'B002S02' THEN -0.055195
    WHEN 'B002S03' THEN -0.758468
    WHEN 'B002S04' THEN -0.23207
    WHEN 'B002S05' THEN -0.445603
    WHEN 'B002S06' THEN -0.510266
    WHEN 'B002S07' THEN -0.18353
    WHEN 'B002S08' THEN -0.110836
    WHEN 'B002S09' THEN -0.562745
    WHEN 'B002S10' THEN -0.13714
    WHEN 'B002S11' THEN -0.410366
    WHEN 'B002S12' THEN -0.124492
    WHEN 'B002S13' THEN -0.319346
    WHEN 'B002S14' THEN -0.781641
    WHEN 'B002S15' THEN -0.458913
    WHEN 'B002S16' THEN -0.528936
    WHEN 'B002S17' THEN -0.086965
    WHEN 'B002S18' THEN -0.305285
    WHEN 'B002S19' THEN -0.677981
  END::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN -0.085615
    WHEN 'B002S01' THEN -0.357337
    WHEN 'B002S02' THEN -0.055195
    WHEN 'B002S03' THEN -0.758468
    WHEN 'B002S04' THEN -0.23207
    WHEN 'B002S05' THEN -0.445603
    WHEN 'B002S06' THEN -0.510266
    WHEN 'B002S07' THEN -0.18353
    WHEN 'B002S08' THEN -0.110836
    WHEN 'B002S09' THEN -0.562745
    WHEN 'B002S10' THEN -0.13714
    WHEN 'B002S11' THEN -0.410366
    WHEN 'B002S12' THEN -0.124492
    WHEN 'B002S13' THEN -0.319346
    WHEN 'B002S14' THEN -0.781641
    WHEN 'B002S15' THEN -0.458913
    WHEN 'B002S16' THEN -0.528936
    WHEN 'B002S17' THEN -0.086965
    WHEN 'B002S18' THEN -0.305285
    WHEN 'B002S19' THEN -0.677981
  END::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN 0.071279
    WHEN 'B002S01' THEN 0
    WHEN 'B002S02' THEN 0.034321
    WHEN 'B002S03' THEN 0.067674
    WHEN 'B002S04' THEN 0.0759
    WHEN 'B002S05' THEN 0
    WHEN 'B002S06' THEN 0.006226
    WHEN 'B002S07' THEN 0.069414
    WHEN 'B002S08' THEN 0.010798
    WHEN 'B002S09' THEN 0
    WHEN 'B002S10' THEN 0.021202
    WHEN 'B002S11' THEN 0.075714
    WHEN 'B002S12' THEN 0
    WHEN 'B002S13' THEN 0
    WHEN 'B002S14' THEN 0
    WHEN 'B002S15' THEN 0.047078
    WHEN 'B002S16' THEN 0.07366
    WHEN 'B002S17' THEN 0.078274
    WHEN 'B002S18' THEN 0
    WHEN 'B002S19' THEN 0
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B002S00' THEN 'Mid Cap'
    WHEN 'B002S01' THEN 'Mid Cap'
    WHEN 'B002S02' THEN 'Mega Cap'
    WHEN 'B002S03' THEN 'Large Cap'
    WHEN 'B002S04' THEN 'Large Cap'
    WHEN 'B002S05' THEN 'Large Cap'
    WHEN 'B002S06' THEN 'Mid Cap'
    WHEN 'B002S07' THEN 'Large Cap'
    WHEN 'B002S08' THEN 'Mid Cap'
    WHEN 'B002S09' THEN 'Mega Cap'
    WHEN 'B002S10' THEN 'Small Cap'
    WHEN 'B002S11' THEN 'Mid Cap'
    WHEN 'B002S12' THEN 'Small Cap'
    WHEN 'B002S13' THEN 'Mid Cap'
    WHEN 'B002S14' THEN 'Small Cap'
    WHEN 'B002S15' THEN 'Small Cap'
    WHEN 'B002S16' THEN 'Mega Cap'
    WHEN 'B002S17' THEN 'Large Cap'
    WHEN 'B002S18' THEN 'Mid Cap'
    WHEN 'B002S19' THEN 'Large Cap'
  END::text,
  CASE na.ticker
    WHEN 'B002S00' THEN 'High'
    WHEN 'B002S01' THEN 'High'
    WHEN 'B002S02' THEN 'High'
    WHEN 'B002S03' THEN 'High'
    WHEN 'B002S04' THEN 'High'
    WHEN 'B002S05' THEN 'High'
    WHEN 'B002S06' THEN 'High'
    WHEN 'B002S07' THEN 'High'
    WHEN 'B002S08' THEN 'High'
    WHEN 'B002S09' THEN 'High'
    WHEN 'B002S10' THEN 'High'
    WHEN 'B002S11' THEN 'High'
    WHEN 'B002S12' THEN 'Medium'
    WHEN 'B002S13' THEN 'High'
    WHEN 'B002S14' THEN 'High'
    WHEN 'B002S15' THEN 'High'
    WHEN 'B002S16' THEN 'High'
    WHEN 'B002S17' THEN 'High'
    WHEN 'B002S18' THEN 'Medium'
    WHEN 'B002S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:01.689975", "pipeline_version": "4.0_mass", "batch_id": "002"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
