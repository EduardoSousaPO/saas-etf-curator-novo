-- LOTE MASSIVO 5: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:10.901135
-- Tickers: B005S00, B005S01, B005S02, B005S03, B005S04, B005S05, B005S06, B005S07, B005S08, B005S09, B005S10, B005S11, B005S12, B005S13, B005S14, B005S15, B005S16, B005S17, B005S18, B005S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B005S00', 'STOCK', 'B005S00 Corporation', 'NYSE', 'Technology', 'Software—Infrastructure', 'USD', 'B005S00 Corporation operates in the software—infrastructure industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B005S01', 'STOCK', 'B005S01 Corporation', 'NYSE', 'Consumer Cyclical', 'Restaurants', 'USD', 'B005S01 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B005S02', 'STOCK', 'B005S02 Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'B005S02 Corporation operates in the software—application industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B005S03', 'STOCK', 'B005S03 Corporation', 'NYSE', 'Real Estate', 'REIT—Office', 'USD', 'B005S03 Corporation operates in the reit—office industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B005S04', 'STOCK', 'B005S04 Corporation', 'NASDAQ', 'Industrials', 'Construction', 'USD', 'B005S04 Corporation operates in the construction industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B005S05', 'STOCK', 'B005S05 Corporation', 'AMEX', 'Financial Services', 'Insurance—Life', 'USD', 'B005S05 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B005S06', 'STOCK', 'B005S06 Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'B005S06 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B005S07', 'STOCK', 'B005S07 Corporation', 'AMEX', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'B005S07 Corporation operates in the drug manufacturers—general industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B005S08', 'STOCK', 'B005S08 Corporation', 'NYSE', 'Financial Services', 'Asset Management', 'USD', 'B005S08 Corporation operates in the asset management industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B005S09', 'STOCK', 'B005S09 Corporation', 'AMEX', 'Real Estate', 'REIT—Residential', 'USD', 'B005S09 Corporation operates in the reit—residential industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B005S10', 'STOCK', 'B005S10 Corporation', 'NYSE', 'Financial Services', 'Banks—Regional', 'USD', 'B005S10 Corporation operates in the banks—regional industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B005S11', 'STOCK', 'B005S11 Corporation', 'AMEX', 'Utilities', 'Utilities—Renewable', 'USD', 'B005S11 Corporation operates in the utilities—renewable industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B005S12', 'STOCK', 'B005S12 Corporation', 'NYSE', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'B005S12 Corporation operates in the auto manufacturers industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B005S13', 'STOCK', 'B005S13 Corporation', 'NYSE', 'Consumer Cyclical', 'Restaurants', 'USD', 'B005S13 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B005S14', 'STOCK', 'B005S14 Corporation', 'NYSE', 'Consumer Cyclical', 'Restaurants', 'USD', 'B005S14 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B005S15', 'STOCK', 'B005S15 Corporation', 'AMEX', 'Financial Services', 'Credit Services', 'USD', 'B005S15 Corporation operates in the credit services industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B005S16', 'STOCK', 'B005S16 Corporation', 'NASDAQ', 'Communication Services', 'Media', 'USD', 'B005S16 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B005S17', 'STOCK', 'B005S17 Corporation', 'NASDAQ', 'Healthcare', 'Medical Devices', 'USD', 'B005S17 Corporation operates in the medical devices industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B005S18', 'STOCK', 'B005S18 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas E&P', 'USD', 'B005S18 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B005S19', 'STOCK', 'B005S19 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas E&P', 'USD', 'B005S19 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B005S00', 'B005S01', 'B005S02', 'B005S03', 'B005S04', 'B005S05', 'B005S06', 'B005S07', 'B005S08', 'B005S09', 'B005S10', 'B005S11', 'B005S12', 'B005S13', 'B005S14', 'B005S15', 'B005S16', 'B005S17', 'B005S18', 'B005S19')
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
    WHEN 'B005S00' THEN 107.52
    WHEN 'B005S01' THEN 49.01
    WHEN 'B005S02' THEN 77.84
    WHEN 'B005S03' THEN 32.22
    WHEN 'B005S04' THEN 169.73
    WHEN 'B005S05' THEN 353.91
    WHEN 'B005S06' THEN 59.27
    WHEN 'B005S07' THEN 169.69
    WHEN 'B005S08' THEN 73.85
    WHEN 'B005S09' THEN 1.09
    WHEN 'B005S10' THEN 59.92
    WHEN 'B005S11' THEN 16.78
    WHEN 'B005S12' THEN 6.38
    WHEN 'B005S13' THEN 149.6
    WHEN 'B005S14' THEN 77.61
    WHEN 'B005S15' THEN 35.47
    WHEN 'B005S16' THEN 38.18
    WHEN 'B005S17' THEN 450.05
    WHEN 'B005S18' THEN 234.77
    WHEN 'B005S19' THEN 57.59
  END::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN 195240372778
    WHEN 'B005S01' THEN 3498613222
    WHEN 'B005S02' THEN 8846398479
    WHEN 'B005S03' THEN 417125424
    WHEN 'B005S04' THEN 138563710483
    WHEN 'B005S05' THEN 2044134632750
    WHEN 'B005S06' THEN 5744753382
    WHEN 'B005S07' THEN 188506367746
    WHEN 'B005S08' THEN 4171256769
    WHEN 'B005S09' THEN 942335355
    WHEN 'B005S10' THEN 60251911680
    WHEN 'B005S11' THEN 3236971741
    WHEN 'B005S12' THEN 628614771
    WHEN 'B005S13' THEN 43908263124
    WHEN 'B005S14' THEN 2330216775
    WHEN 'B005S15' THEN 87183342899
    WHEN 'B005S16' THEN 7316713596
    WHEN 'B005S17' THEN 2931588574404
    WHEN 'B005S18' THEN 2257083637106
    WHEN 'B005S19' THEN 49944799815
  END::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN 1815905970
    WHEN 'B005S01' THEN 71387941
    WHEN 'B005S02' THEN 113649845
    WHEN 'B005S03' THEN 12947270
    WHEN 'B005S04' THEN 816376610
    WHEN 'B005S05' THEN 5775925696
    WHEN 'B005S06' THEN 96924996
    WHEN 'B005S07' THEN 1110916212
    WHEN 'B005S08' THEN 56482067
    WHEN 'B005S09' THEN 868089498
    WHEN 'B005S10' THEN 1005542963
    WHEN 'B005S11' THEN 192863307
    WHEN 'B005S12' THEN 98534245
    WHEN 'B005S13' THEN 293505452
    WHEN 'B005S14' THEN 30025088
    WHEN 'B005S15' THEN 2458286423
    WHEN 'B005S16' THEN 191653308
    WHEN 'B005S17' THEN 6513911148
    WHEN 'B005S18' THEN 9614044021
    WHEN 'B005S19' THEN 867186209
  END::bigint,
  CASE na.ticker
    WHEN 'B005S00' THEN 831534399
    WHEN 'B005S01' THEN 69710818
    WHEN 'B005S02' THEN 64497993
    WHEN 'B005S03' THEN 1995547
    WHEN 'B005S04' THEN 1010126000
    WHEN 'B005S05' THEN 1802463588
    WHEN 'B005S06' THEN 14069515
    WHEN 'B005S07' THEN 1241309676
    WHEN 'B005S08' THEN 15826787
    WHEN 'B005S09' THEN 13638527
    WHEN 'B005S10' THEN 1017414322
    WHEN 'B005S11' THEN 18195013
    WHEN 'B005S12' THEN 7708558
    WHEN 'B005S13' THEN 676503298
    WHEN 'B005S14' THEN 32935696
    WHEN 'B005S15' THEN 800923383
    WHEN 'B005S16' THEN 88071249
    WHEN 'B005S17' THEN 61029801
    WHEN 'B005S18' THEN 1215447239
    WHEN 'B005S19' THEN 271957277
  END::bigint,
  CASE na.ticker
    WHEN 'B005S00' THEN 0.064978
    WHEN 'B005S01' THEN 0.28051
    WHEN 'B005S02' THEN 0.332498
    WHEN 'B005S03' THEN -0.182401
    WHEN 'B005S04' THEN 0.153565
    WHEN 'B005S05' THEN 0.085392
    WHEN 'B005S06' THEN 0.111338
    WHEN 'B005S07' THEN 0.275452
    WHEN 'B005S08' THEN -0.32013
    WHEN 'B005S09' THEN 0.114795
    WHEN 'B005S10' THEN -0.232209
    WHEN 'B005S11' THEN 0.124767
    WHEN 'B005S12' THEN -0.152763
    WHEN 'B005S13' THEN -0.028485
    WHEN 'B005S14' THEN -0.151044
    WHEN 'B005S15' THEN -0.065689
    WHEN 'B005S16' THEN -0.15575
    WHEN 'B005S17' THEN 0.218572
    WHEN 'B005S18' THEN 0.460593
    WHEN 'B005S19' THEN 0.366776
  END::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN 0.428968
    WHEN 'B005S01' THEN 0.722197
    WHEN 'B005S02' THEN 0.759817
    WHEN 'B005S03' THEN 0.320314
    WHEN 'B005S04' THEN 0.582429
    WHEN 'B005S05' THEN 0.181391
    WHEN 'B005S06' THEN 0.519497
    WHEN 'B005S07' THEN 0.568352
    WHEN 'B005S08' THEN 0.620921
    WHEN 'B005S09' THEN 0.348335
    WHEN 'B005S10' THEN 0.51234
    WHEN 'B005S11' THEN 0.354108
    WHEN 'B005S12' THEN 0.369999
    WHEN 'B005S13' THEN 0.505751
    WHEN 'B005S14' THEN 0.698581
    WHEN 'B005S15' THEN 0.271945
    WHEN 'B005S16' THEN 0.126707
    WHEN 'B005S17' THEN 0.242458
    WHEN 'B005S18' THEN 0.749237
    WHEN 'B005S19' THEN 0.374975
  END::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN 0.034916
    WHEN 'B005S01' THEN 0.319179
    WHEN 'B005S02' THEN 0.371798
    WHEN 'B005S03' THEN -0.725541
    WHEN 'B005S04' THEN 0.177816
    WHEN 'B005S05' THEN 0.195117
    WHEN 'B005S06' THEN 0.118071
    WHEN 'B005S07' THEN 0.396676
    WHEN 'B005S08' THEN -0.596099
    WHEN 'B005S09' THEN 0.186014
    WHEN 'B005S10' THEN -0.550824
    WHEN 'B005S11' THEN 0.211142
    WHEN 'B005S12' THEN -0.548011
    WHEN 'B005S13' THEN -0.155185
    WHEN 'B005S14' THEN -0.287789
    WHEN 'B005S15' THEN -0.425415
    WHEN 'B005S16' THEN -1.623818
    WHEN 'B005S17' THEN 0.695265
    WHEN 'B005S18' THEN 0.548014
    WHEN 'B005S19' THEN 0.844792
  END::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN -0.438369
    WHEN 'B005S01' THEN -0.601923
    WHEN 'B005S02' THEN -0.414083
    WHEN 'B005S03' THEN -0.387185
    WHEN 'B005S04' THEN -0.14281
    WHEN 'B005S05' THEN -0.162609
    WHEN 'B005S06' THEN -0.473144
    WHEN 'B005S07' THEN -0.090965
    WHEN 'B005S08' THEN -0.154669
    WHEN 'B005S09' THEN -0.053554
    WHEN 'B005S10' THEN -0.254266
    WHEN 'B005S11' THEN -0.464432
    WHEN 'B005S12' THEN -0.518021
    WHEN 'B005S13' THEN -0.625826
    WHEN 'B005S14' THEN -0.776677
    WHEN 'B005S15' THEN -0.186929
    WHEN 'B005S16' THEN -0.175356
    WHEN 'B005S17' THEN -0.086548
    WHEN 'B005S18' THEN -0.776709
    WHEN 'B005S19' THEN -0.239098
  END::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN -0.438369
    WHEN 'B005S01' THEN -0.601923
    WHEN 'B005S02' THEN -0.414083
    WHEN 'B005S03' THEN -0.387185
    WHEN 'B005S04' THEN -0.14281
    WHEN 'B005S05' THEN -0.162609
    WHEN 'B005S06' THEN -0.473144
    WHEN 'B005S07' THEN -0.090965
    WHEN 'B005S08' THEN -0.154669
    WHEN 'B005S09' THEN -0.053554
    WHEN 'B005S10' THEN -0.254266
    WHEN 'B005S11' THEN -0.464432
    WHEN 'B005S12' THEN -0.518021
    WHEN 'B005S13' THEN -0.625826
    WHEN 'B005S14' THEN -0.776677
    WHEN 'B005S15' THEN -0.186929
    WHEN 'B005S16' THEN -0.175356
    WHEN 'B005S17' THEN -0.086548
    WHEN 'B005S18' THEN -0.776709
    WHEN 'B005S19' THEN -0.239098
  END::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN 0
    WHEN 'B005S01' THEN 0.070672
    WHEN 'B005S02' THEN 0.030253
    WHEN 'B005S03' THEN 0.03543
    WHEN 'B005S04' THEN 0
    WHEN 'B005S05' THEN 0
    WHEN 'B005S06' THEN 0.004394
    WHEN 'B005S07' THEN 0.012945
    WHEN 'B005S08' THEN 0.059014
    WHEN 'B005S09' THEN 0.010518
    WHEN 'B005S10' THEN 0.056731
    WHEN 'B005S11' THEN 0.019473
    WHEN 'B005S12' THEN 0.041961
    WHEN 'B005S13' THEN 0.008961
    WHEN 'B005S14' THEN 0.065377
    WHEN 'B005S15' THEN 0
    WHEN 'B005S16' THEN 0
    WHEN 'B005S17' THEN 0
    WHEN 'B005S18' THEN 0.058615
    WHEN 'B005S19' THEN 0.050398
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B005S00' THEN 'Large Cap'
    WHEN 'B005S01' THEN 'Mid Cap'
    WHEN 'B005S02' THEN 'Mid Cap'
    WHEN 'B005S03' THEN 'Small Cap'
    WHEN 'B005S04' THEN 'Large Cap'
    WHEN 'B005S05' THEN 'Mega Cap'
    WHEN 'B005S06' THEN 'Mid Cap'
    WHEN 'B005S07' THEN 'Large Cap'
    WHEN 'B005S08' THEN 'Mid Cap'
    WHEN 'B005S09' THEN 'Small Cap'
    WHEN 'B005S10' THEN 'Large Cap'
    WHEN 'B005S11' THEN 'Mid Cap'
    WHEN 'B005S12' THEN 'Small Cap'
    WHEN 'B005S13' THEN 'Large Cap'
    WHEN 'B005S14' THEN 'Mid Cap'
    WHEN 'B005S15' THEN 'Large Cap'
    WHEN 'B005S16' THEN 'Mid Cap'
    WHEN 'B005S17' THEN 'Mega Cap'
    WHEN 'B005S18' THEN 'Mega Cap'
    WHEN 'B005S19' THEN 'Large Cap'
  END::text,
  CASE na.ticker
    WHEN 'B005S00' THEN 'High'
    WHEN 'B005S01' THEN 'High'
    WHEN 'B005S02' THEN 'High'
    WHEN 'B005S03' THEN 'Medium'
    WHEN 'B005S04' THEN 'High'
    WHEN 'B005S05' THEN 'High'
    WHEN 'B005S06' THEN 'High'
    WHEN 'B005S07' THEN 'High'
    WHEN 'B005S08' THEN 'High'
    WHEN 'B005S09' THEN 'High'
    WHEN 'B005S10' THEN 'High'
    WHEN 'B005S11' THEN 'High'
    WHEN 'B005S12' THEN 'High'
    WHEN 'B005S13' THEN 'High'
    WHEN 'B005S14' THEN 'High'
    WHEN 'B005S15' THEN 'High'
    WHEN 'B005S16' THEN 'High'
    WHEN 'B005S17' THEN 'High'
    WHEN 'B005S18' THEN 'High'
    WHEN 'B005S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:10.900910", "pipeline_version": "4.0_mass", "batch_id": "005"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
