-- LOTE MASSIVO 9: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:21.881758
-- Tickers: B009S00, B009S01, B009S02, B009S03, B009S04, B009S05, B009S06, B009S07, B009S08, B009S09, B009S10, B009S11, B009S12, B009S13, B009S14, B009S15, B009S16, B009S17, B009S18, B009S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B009S00', 'STOCK', 'B009S00 Corporation', 'AMEX', 'Consumer Cyclical', 'Internet Retail', 'USD', 'B009S00 Corporation operates in the internet retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B009S01', 'STOCK', 'B009S01 Corporation', 'AMEX', 'Communication Services', 'Internet Content & Information', 'USD', 'B009S01 Corporation operates in the internet content & information industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B009S02', 'STOCK', 'B009S02 Corporation', 'NYSE', 'Industrials', 'Construction', 'USD', 'B009S02 Corporation operates in the construction industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B009S03', 'STOCK', 'B009S03 Corporation', 'NYSE', 'Industrials', 'Aerospace & Defense', 'USD', 'B009S03 Corporation operates in the aerospace & defense industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B009S04', 'STOCK', 'B009S04 Corporation', 'NYSE', 'Technology', 'Consumer Electronics', 'USD', 'B009S04 Corporation operates in the consumer electronics industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B009S05', 'STOCK', 'B009S05 Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'B009S05 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B009S06', 'STOCK', 'B009S06 Corporation', 'NYSE', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B009S06 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B009S07', 'STOCK', 'B009S07 Corporation', 'NASDAQ', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'B009S07 Corporation operates in the drug manufacturers—general industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B009S08', 'STOCK', 'B009S08 Corporation', 'NASDAQ', 'Consumer Defensive', 'Household Products', 'USD', 'B009S08 Corporation operates in the household products industry within the consumer defensive sector, providing innovative solutions and services to customers worldwide.'),
('B009S09', 'STOCK', 'B009S09 Corporation', 'NASDAQ', 'Industrials', 'Industrial Distribution', 'USD', 'B009S09 Corporation operates in the industrial distribution industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B009S10', 'STOCK', 'B009S10 Corporation', 'NYSE', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B009S10 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B009S11', 'STOCK', 'B009S11 Corporation', 'AMEX', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'B009S11 Corporation operates in the auto manufacturers industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B009S12', 'STOCK', 'B009S12 Corporation', 'NASDAQ', 'Technology', 'Semiconductors', 'USD', 'B009S12 Corporation operates in the semiconductors industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B009S13', 'STOCK', 'B009S13 Corporation', 'AMEX', 'Materials', 'Chemicals', 'USD', 'B009S13 Corporation operates in the chemicals industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B009S14', 'STOCK', 'B009S14 Corporation', 'NASDAQ', 'Real Estate', 'REIT—Office', 'USD', 'B009S14 Corporation operates in the reit—office industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B009S15', 'STOCK', 'B009S15 Corporation', 'NYSE', 'Financial Services', 'Banks—Regional', 'USD', 'B009S15 Corporation operates in the banks—regional industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B009S16', 'STOCK', 'B009S16 Corporation', 'NYSE', 'Utilities', 'Utilities—Renewable', 'USD', 'B009S16 Corporation operates in the utilities—renewable industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B009S17', 'STOCK', 'B009S17 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'B009S17 Corporation operates in the utilities—regulated electric industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B009S18', 'STOCK', 'B009S18 Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'B009S18 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B009S19', 'STOCK', 'B009S19 Corporation', 'NYSE', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B009S19 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B009S00', 'B009S01', 'B009S02', 'B009S03', 'B009S04', 'B009S05', 'B009S06', 'B009S07', 'B009S08', 'B009S09', 'B009S10', 'B009S11', 'B009S12', 'B009S13', 'B009S14', 'B009S15', 'B009S16', 'B009S17', 'B009S18', 'B009S19')
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
    WHEN 'B009S00' THEN 76.99
    WHEN 'B009S01' THEN 140.81
    WHEN 'B009S02' THEN 46.87
    WHEN 'B009S03' THEN 186.41
    WHEN 'B009S04' THEN 54.56
    WHEN 'B009S05' THEN 137.23
    WHEN 'B009S06' THEN 280.0
    WHEN 'B009S07' THEN 83.05
    WHEN 'B009S08' THEN 162.42
    WHEN 'B009S09' THEN 7.38
    WHEN 'B009S10' THEN 91.26
    WHEN 'B009S11' THEN 134.86
    WHEN 'B009S12' THEN 173.28
    WHEN 'B009S13' THEN 38.18
    WHEN 'B009S14' THEN 164.63
    WHEN 'B009S15' THEN 28.52
    WHEN 'B009S16' THEN 121.27
    WHEN 'B009S17' THEN 27.66
    WHEN 'B009S18' THEN 40.87
    WHEN 'B009S19' THEN 108.73
  END::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN 969552346509
    WHEN 'B009S01' THEN 1458056534793
    WHEN 'B009S02' THEN 121280950069
    WHEN 'B009S03' THEN 131916721069
    WHEN 'B009S04' THEN 158548223431
    WHEN 'B009S05' THEN 1771628364900
    WHEN 'B009S06' THEN 1993338452409
    WHEN 'B009S07' THEN 47382526063
    WHEN 'B009S08' THEN 101760342470
    WHEN 'B009S09' THEN 1531790550
    WHEN 'B009S10' THEN 6511732975
    WHEN 'B009S11' THEN 82262035169
    WHEN 'B009S12' THEN 107028055789
    WHEN 'B009S13' THEN 6065643532
    WHEN 'B009S14' THEN 108243498571
    WHEN 'B009S15' THEN 4211040516
    WHEN 'B009S16' THEN 28265994502
    WHEN 'B009S17' THEN 168104593272
    WHEN 'B009S18' THEN 511594495
    WHEN 'B009S19' THEN 2174703773186
  END::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN 12593358054
    WHEN 'B009S01' THEN 10354645445
    WHEN 'B009S02' THEN 2587606512
    WHEN 'B009S03' THEN 707685970
    WHEN 'B009S04' THEN 2905832071
    WHEN 'B009S05' THEN 12910278296
    WHEN 'B009S06' THEN 7119071016
    WHEN 'B009S07' THEN 570530843
    WHEN 'B009S08' THEN 626523376
    WHEN 'B009S09' THEN 207570708
    WHEN 'B009S10' THEN 71355676
    WHEN 'B009S11' THEN 609978215
    WHEN 'B009S12' THEN 617648836
    WHEN 'B009S13' THEN 158878449
    WHEN 'B009S14' THEN 657483878
    WHEN 'B009S15' THEN 147649563
    WHEN 'B009S16' THEN 233084700
    WHEN 'B009S17' THEN 6078546687
    WHEN 'B009S18' THEN 12516186
    WHEN 'B009S19' THEN 20000926044
  END::bigint,
  CASE na.ticker
    WHEN 'B009S00' THEN 1433509927
    WHEN 'B009S01' THEN 193030844
    WHEN 'B009S02' THEN 1032669471
    WHEN 'B009S03' THEN 561313730
    WHEN 'B009S04' THEN 1863884340
    WHEN 'B009S05' THEN 577744291
    WHEN 'B009S06' THEN 692996657
    WHEN 'B009S07' THEN 781387545
    WHEN 'B009S08' THEN 196907816
    WHEN 'B009S09' THEN 4466784
    WHEN 'B009S10' THEN 76682584
    WHEN 'B009S11' THEN 280692038
    WHEN 'B009S12' THEN 1002232078
    WHEN 'B009S13' THEN 24025792
    WHEN 'B009S14' THEN 528958160
    WHEN 'B009S15' THEN 49889469
    WHEN 'B009S16' THEN 261453164
    WHEN 'B009S17' THEN 872521153
    WHEN 'B009S18' THEN 6711091
    WHEN 'B009S19' THEN 1432507443
  END::bigint,
  CASE na.ticker
    WHEN 'B009S00' THEN 0.379744
    WHEN 'B009S01' THEN 0.236539
    WHEN 'B009S02' THEN -0.095915
    WHEN 'B009S03' THEN 0.649834
    WHEN 'B009S04' THEN 0.18232
    WHEN 'B009S05' THEN -0.008162
    WHEN 'B009S06' THEN 0.459733
    WHEN 'B009S07' THEN 0.379709
    WHEN 'B009S08' THEN 0.140976
    WHEN 'B009S09' THEN -0.13039
    WHEN 'B009S10' THEN 0.129107
    WHEN 'B009S11' THEN -0.137551
    WHEN 'B009S12' THEN 0.190845
    WHEN 'B009S13' THEN -0.029462
    WHEN 'B009S14' THEN -0.158809
    WHEN 'B009S15' THEN -0.356307
    WHEN 'B009S16' THEN -0.40974
    WHEN 'B009S17' THEN 0.296514
    WHEN 'B009S18' THEN 0.056251
    WHEN 'B009S19' THEN -0.021252
  END::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN 0.371509
    WHEN 'B009S01' THEN 0.610329
    WHEN 'B009S02' THEN 0.300028
    WHEN 'B009S03' THEN 0.617338
    WHEN 'B009S04' THEN 0.568928
    WHEN 'B009S05' THEN 0.369105
    WHEN 'B009S06' THEN 0.681478
    WHEN 'B009S07' THEN 0.62305
    WHEN 'B009S08' THEN 0.14203
    WHEN 'B009S09' THEN 0.443876
    WHEN 'B009S10' THEN 0.506062
    WHEN 'B009S11' THEN 0.137305
    WHEN 'B009S12' THEN 0.583012
    WHEN 'B009S13' THEN 0.126382
    WHEN 'B009S14' THEN 0.357569
    WHEN 'B009S15' THEN 0.122332
    WHEN 'B009S16' THEN 0.481678
    WHEN 'B009S17' THEN 0.124938
    WHEN 'B009S18' THEN 0.3843
    WHEN 'B009S19' THEN 0.236128
  END::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN 0.887581
    WHEN 'B009S01' THEN 0.305636
    WHEN 'B009S02' THEN -0.486337
    WHEN 'B009S03' THEN 0.971645
    WHEN 'B009S04' THEN 0.232578
    WHEN 'B009S05' THEN -0.157575
    WHEN 'B009S06' THEN 0.601241
    WHEN 'B009S07' THEN 0.529185
    WHEN 'B009S08' THEN 0.640541
    WHEN 'B009S09' THEN -0.406397
    WHEN 'B009S10' THEN 0.156319
    WHEN 'B009S11' THEN -1.36595
    WHEN 'B009S12' THEN 0.241582
    WHEN 'B009S13' THEN -0.628744
    WHEN 'B009S14' THEN -0.583969
    WHEN 'B009S15' THEN -3.321333
    WHEN 'B009S16' THEN -0.954455
    WHEN 'B009S17' THEN 1.973101
    WHEN 'B009S18' THEN 0.016266
    WHEN 'B009S19' THEN -0.301752
  END::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN -0.375144
    WHEN 'B009S01' THEN -0.69025
    WHEN 'B009S02' THEN -0.209574
    WHEN 'B009S03' THEN -0.178842
    WHEN 'B009S04' THEN -0.509995
    WHEN 'B009S05' THEN -0.308507
    WHEN 'B009S06' THEN -0.399566
    WHEN 'B009S07' THEN -0.576657
    WHEN 'B009S08' THEN -0.065083
    WHEN 'B009S09' THEN -0.65298
    WHEN 'B009S10' THEN -0.714735
    WHEN 'B009S11' THEN -0.132861
    WHEN 'B009S12' THEN -0.05419
    WHEN 'B009S13' THEN -0.060111
    WHEN 'B009S14' THEN -0.398372
    WHEN 'B009S15' THEN -0.109072
    WHEN 'B009S16' THEN -0.658621
    WHEN 'B009S17' THEN -0.051223
    WHEN 'B009S18' THEN -0.369769
    WHEN 'B009S19' THEN -0.187742
  END::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN -0.375144
    WHEN 'B009S01' THEN -0.69025
    WHEN 'B009S02' THEN -0.209574
    WHEN 'B009S03' THEN -0.178842
    WHEN 'B009S04' THEN -0.509995
    WHEN 'B009S05' THEN -0.308507
    WHEN 'B009S06' THEN -0.399566
    WHEN 'B009S07' THEN -0.576657
    WHEN 'B009S08' THEN -0.065083
    WHEN 'B009S09' THEN -0.65298
    WHEN 'B009S10' THEN -0.714735
    WHEN 'B009S11' THEN -0.132861
    WHEN 'B009S12' THEN -0.05419
    WHEN 'B009S13' THEN -0.060111
    WHEN 'B009S14' THEN -0.398372
    WHEN 'B009S15' THEN -0.109072
    WHEN 'B009S16' THEN -0.658621
    WHEN 'B009S17' THEN -0.051223
    WHEN 'B009S18' THEN -0.369769
    WHEN 'B009S19' THEN -0.187742
  END::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN 0.063644
    WHEN 'B009S01' THEN 0.027126
    WHEN 'B009S02' THEN 0
    WHEN 'B009S03' THEN 0
    WHEN 'B009S04' THEN 0
    WHEN 'B009S05' THEN 0.013659
    WHEN 'B009S06' THEN 0.069713
    WHEN 'B009S07' THEN 0.03563
    WHEN 'B009S08' THEN 0.04915
    WHEN 'B009S09' THEN 0.064028
    WHEN 'B009S10' THEN 0.003124
    WHEN 'B009S11' THEN 0
    WHEN 'B009S12' THEN 0.004386
    WHEN 'B009S13' THEN 0.078786
    WHEN 'B009S14' THEN 5.6e-05
    WHEN 'B009S15' THEN 0.02938
    WHEN 'B009S16' THEN 0.052497
    WHEN 'B009S17' THEN 0.029287
    WHEN 'B009S18' THEN 0.055779
    WHEN 'B009S19' THEN 0.065589
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B009S00' THEN 'Mega Cap'
    WHEN 'B009S01' THEN 'Mega Cap'
    WHEN 'B009S02' THEN 'Large Cap'
    WHEN 'B009S03' THEN 'Large Cap'
    WHEN 'B009S04' THEN 'Large Cap'
    WHEN 'B009S05' THEN 'Mega Cap'
    WHEN 'B009S06' THEN 'Mega Cap'
    WHEN 'B009S07' THEN 'Large Cap'
    WHEN 'B009S08' THEN 'Large Cap'
    WHEN 'B009S09' THEN 'Small Cap'
    WHEN 'B009S10' THEN 'Mid Cap'
    WHEN 'B009S11' THEN 'Large Cap'
    WHEN 'B009S12' THEN 'Large Cap'
    WHEN 'B009S13' THEN 'Mid Cap'
    WHEN 'B009S14' THEN 'Large Cap'
    WHEN 'B009S15' THEN 'Mid Cap'
    WHEN 'B009S16' THEN 'Large Cap'
    WHEN 'B009S17' THEN 'Large Cap'
    WHEN 'B009S18' THEN 'Small Cap'
    WHEN 'B009S19' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'B009S00' THEN 'High'
    WHEN 'B009S01' THEN 'High'
    WHEN 'B009S02' THEN 'High'
    WHEN 'B009S03' THEN 'High'
    WHEN 'B009S04' THEN 'High'
    WHEN 'B009S05' THEN 'High'
    WHEN 'B009S06' THEN 'High'
    WHEN 'B009S07' THEN 'High'
    WHEN 'B009S08' THEN 'High'
    WHEN 'B009S09' THEN 'Medium'
    WHEN 'B009S10' THEN 'High'
    WHEN 'B009S11' THEN 'High'
    WHEN 'B009S12' THEN 'High'
    WHEN 'B009S13' THEN 'High'
    WHEN 'B009S14' THEN 'High'
    WHEN 'B009S15' THEN 'High'
    WHEN 'B009S16' THEN 'High'
    WHEN 'B009S17' THEN 'High'
    WHEN 'B009S18' THEN 'High'
    WHEN 'B009S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:21.881522", "pipeline_version": "4.0_mass", "batch_id": "009"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
