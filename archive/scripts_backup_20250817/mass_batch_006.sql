-- LOTE MASSIVO 6: 20 AÇÕES
-- Gerado em: 2025-08-17T00:33:14.691211
-- Tickers: B006S00, B006S01, B006S02, B006S03, B006S04, B006S05, B006S06, B006S07, B006S08, B006S09, B006S10, B006S11, B006S12, B006S13, B006S14, B006S15, B006S16, B006S17, B006S18, B006S19

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B006S00', 'STOCK', 'B006S00 Corporation', 'AMEX', 'Utilities', 'Utilities—Diversified', 'USD', 'B006S00 Corporation operates in the utilities—diversified industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B006S01', 'STOCK', 'B006S01 Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'B006S01 Corporation operates in the software—application industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B006S02', 'STOCK', 'B006S02 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Equipment & Services', 'USD', 'B006S02 Corporation operates in the oil & gas equipment & services industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B006S03', 'STOCK', 'B006S03 Corporation', 'NYSE', 'Financial Services', 'Insurance—Life', 'USD', 'B006S03 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B006S04', 'STOCK', 'B006S04 Corporation', 'AMEX', 'Energy', 'Oil & Gas E&P', 'USD', 'B006S04 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B006S05', 'STOCK', 'B006S05 Corporation', 'NYSE', 'Materials', 'Chemicals', 'USD', 'B006S05 Corporation operates in the chemicals industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B006S06', 'STOCK', 'B006S06 Corporation', 'NYSE', 'Real Estate', 'REIT—Office', 'USD', 'B006S06 Corporation operates in the reit—office industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B006S07', 'STOCK', 'B006S07 Corporation', 'AMEX', 'Utilities', 'Utilities—Renewable', 'USD', 'B006S07 Corporation operates in the utilities—renewable industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B006S08', 'STOCK', 'B006S08 Corporation', 'NYSE', 'Consumer Defensive', 'Food Distribution', 'USD', 'B006S08 Corporation operates in the food distribution industry within the consumer defensive sector, providing innovative solutions and services to customers worldwide.'),
('B006S09', 'STOCK', 'B006S09 Corporation', 'AMEX', 'Communication Services', 'Internet Content & Information', 'USD', 'B006S09 Corporation operates in the internet content & information industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B006S10', 'STOCK', 'B006S10 Corporation', 'NYSE', 'Technology', 'Software—Infrastructure', 'USD', 'B006S10 Corporation operates in the software—infrastructure industry within the technology sector, providing innovative solutions and services to customers worldwide.'),
('B006S11', 'STOCK', 'B006S11 Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'B006S11 Corporation operates in the oil & gas e&p industry within the energy sector, providing innovative solutions and services to customers worldwide.'),
('B006S12', 'STOCK', 'B006S12 Corporation', 'AMEX', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'B006S12 Corporation operates in the auto manufacturers industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B006S13', 'STOCK', 'B006S13 Corporation', 'NASDAQ', 'Materials', 'Gold', 'USD', 'B006S13 Corporation operates in the gold industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B006S14', 'STOCK', 'B006S14 Corporation', 'AMEX', 'Real Estate', 'Real Estate Services', 'USD', 'B006S14 Corporation operates in the real estate services industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B006S15', 'STOCK', 'B006S15 Corporation', 'NASDAQ', 'Consumer Defensive', 'Grocery Stores', 'USD', 'B006S15 Corporation operates in the grocery stores industry within the consumer defensive sector, providing innovative solutions and services to customers worldwide.'),
('B006S16', 'STOCK', 'B006S16 Corporation', 'NYSE', 'Materials', 'Gold', 'USD', 'B006S16 Corporation operates in the gold industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B006S17', 'STOCK', 'B006S17 Corporation', 'NYSE', 'Financial Services', 'Insurance—Life', 'USD', 'B006S17 Corporation operates in the insurance—life industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B006S18', 'STOCK', 'B006S18 Corporation', 'NYSE', 'Materials', 'Copper', 'USD', 'B006S18 Corporation operates in the copper industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B006S19', 'STOCK', 'B006S19 Corporation', 'NYSE', 'Communication Services', 'Telecom Services', 'USD', 'B006S19 Corporation operates in the telecom services industry within the communication services sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B006S00', 'B006S01', 'B006S02', 'B006S03', 'B006S04', 'B006S05', 'B006S06', 'B006S07', 'B006S08', 'B006S09', 'B006S10', 'B006S11', 'B006S12', 'B006S13', 'B006S14', 'B006S15', 'B006S16', 'B006S17', 'B006S18', 'B006S19')
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
    WHEN 'B006S00' THEN 24.28
    WHEN 'B006S01' THEN 43.79
    WHEN 'B006S02' THEN 161.72
    WHEN 'B006S03' THEN 30.03
    WHEN 'B006S04' THEN 86.52
    WHEN 'B006S05' THEN 95.86
    WHEN 'B006S06' THEN 133.83
    WHEN 'B006S07' THEN 245.74
    WHEN 'B006S08' THEN 88.84
    WHEN 'B006S09' THEN 189.9
    WHEN 'B006S10' THEN 45.22
    WHEN 'B006S11' THEN 30.48
    WHEN 'B006S12' THEN 125.72
    WHEN 'B006S13' THEN 82.0
    WHEN 'B006S14' THEN 135.85
    WHEN 'B006S15' THEN 65.53
    WHEN 'B006S16' THEN 23.25
    WHEN 'B006S17' THEN 52.73
    WHEN 'B006S18' THEN 11.65
    WHEN 'B006S19' THEN 80.14
  END::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN 1353027779
    WHEN 'B006S01' THEN 12622867658
    WHEN 'B006S02' THEN 178161511994
    WHEN 'B006S03' THEN 9690026067
    WHEN 'B006S04' THEN 9390257218
    WHEN 'B006S05' THEN 7272087628
    WHEN 'B006S06' THEN 119126097691
    WHEN 'B006S07' THEN 1181773610987
    WHEN 'B006S08' THEN 2729238541
    WHEN 'B006S09' THEN 1489220015072
    WHEN 'B006S10' THEN 1544936586
    WHEN 'B006S11' THEN 7415811172
    WHEN 'B006S12' THEN 149734399082
    WHEN 'B006S13' THEN 91779664899
    WHEN 'B006S14' THEN 183891357919
    WHEN 'B006S15' THEN 32873430999
    WHEN 'B006S16' THEN 1970593725
    WHEN 'B006S17' THEN 199730511159
    WHEN 'B006S18' THEN 1164144164
    WHEN 'B006S19' THEN 3911947317
  END::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN 55725499
    WHEN 'B006S01' THEN 288240057
    WHEN 'B006S02' THEN 1101684329
    WHEN 'B006S03' THEN 322692444
    WHEN 'B006S04' THEN 108531786
    WHEN 'B006S05' THEN 75860083
    WHEN 'B006S06' THEN 890130763
    WHEN 'B006S07' THEN 4808946703
    WHEN 'B006S08' THEN 30719412
    WHEN 'B006S09' THEN 7842270841
    WHEN 'B006S10' THEN 34165816
    WHEN 'B006S11' THEN 243291273
    WHEN 'B006S12' THEN 1190993941
    WHEN 'B006S13' THEN 1119220255
    WHEN 'B006S14' THEN 1353635424
    WHEN 'B006S15' THEN 501656609
    WHEN 'B006S16' THEN 84767350
    WHEN 'B006S17' THEN 3787751859
    WHEN 'B006S18' THEN 99901355
    WHEN 'B006S19' THEN 48811305
  END::bigint,
  CASE na.ticker
    WHEN 'B006S00' THEN 8655130
    WHEN 'B006S01' THEN 119756863
    WHEN 'B006S02' THEN 775992503
    WHEN 'B006S03' THEN 122719636
    WHEN 'B006S04' THEN 102011097
    WHEN 'B006S05' THEN 617621
    WHEN 'B006S06' THEN 1803330344
    WHEN 'B006S07' THEN 301157050
    WHEN 'B006S08' THEN 28907167
    WHEN 'B006S09' THEN 1042724160
    WHEN 'B006S10' THEN 6437332
    WHEN 'B006S11' THEN 28470678
    WHEN 'B006S12' THEN 189409301
    WHEN 'B006S13' THEN 1446285170
    WHEN 'B006S14' THEN 754762166
    WHEN 'B006S15' THEN 473013141
    WHEN 'B006S16' THEN 3753796
    WHEN 'B006S17' THEN 484379405
    WHEN 'B006S18' THEN 20076454
    WHEN 'B006S19' THEN 1191880
  END::bigint,
  CASE na.ticker
    WHEN 'B006S00' THEN 0.313222
    WHEN 'B006S01' THEN -0.20586
    WHEN 'B006S02' THEN 0.236333
    WHEN 'B006S03' THEN 0.38178
    WHEN 'B006S04' THEN 0.249423
    WHEN 'B006S05' THEN 0.21972
    WHEN 'B006S06' THEN -0.278816
    WHEN 'B006S07' THEN -0.037181
    WHEN 'B006S08' THEN 0.035146
    WHEN 'B006S09' THEN 0.614549
    WHEN 'B006S10' THEN -0.191503
    WHEN 'B006S11' THEN -0.088149
    WHEN 'B006S12' THEN 0.487012
    WHEN 'B006S13' THEN -0.306694
    WHEN 'B006S14' THEN -0.043639
    WHEN 'B006S15' THEN -0.249924
    WHEN 'B006S16' THEN 0.223348
    WHEN 'B006S17' THEN 0.246498
    WHEN 'B006S18' THEN 0.037834
    WHEN 'B006S19' THEN -0.21256
  END::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN 0.744403
    WHEN 'B006S01' THEN 0.718316
    WHEN 'B006S02' THEN 0.5432
    WHEN 'B006S03' THEN 0.713028
    WHEN 'B006S04' THEN 0.391608
    WHEN 'B006S05' THEN 0.796043
    WHEN 'B006S06' THEN 0.677901
    WHEN 'B006S07' THEN 0.700297
    WHEN 'B006S08' THEN 0.178518
    WHEN 'B006S09' THEN 0.518315
    WHEN 'B006S10' THEN 0.439762
    WHEN 'B006S11' THEN 0.348934
    WHEN 'B006S12' THEN 0.259138
    WHEN 'B006S13' THEN 0.218808
    WHEN 'B006S14' THEN 0.218017
    WHEN 'B006S15' THEN 0.626651
    WHEN 'B006S16' THEN 0.644651
    WHEN 'B006S17' THEN 0.487143
    WHEN 'B006S18' THEN 0.487539
    WHEN 'B006S19' THEN 0.298761
  END::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN 0.353602
    WHEN 'B006S01' THEN -0.356195
    WHEN 'B006S02' THEN 0.343028
    WHEN 'B006S03' THEN 0.465311
    WHEN 'B006S04' THEN 0.50924
    WHEN 'B006S05' THEN 0.213204
    WHEN 'B006S06' THEN -0.48505
    WHEN 'B006S07' THEN -0.124492
    WHEN 'B006S08' THEN -0.08321
    WHEN 'B006S09' THEN 1.089201
    WHEN 'B006S10' THEN -0.549168
    WHEN 'B006S11' THEN -0.395919
    WHEN 'B006S12' THEN 1.686405
    WHEN 'B006S13' THEN -1.63017
    WHEN 'B006S14' THEN -0.429505
    WHEN 'B006S15' THEN -0.478613
    WHEN 'B006S16' THEN 0.268903
    WHEN 'B006S17' THEN 0.403368
    WHEN 'B006S18' THEN -0.024954
    WHEN 'B006S19' THEN -0.878829
  END::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN -0.168023
    WHEN 'B006S01' THEN -0.4668
    WHEN 'B006S02' THEN -0.230747
    WHEN 'B006S03' THEN -0.6422
    WHEN 'B006S04' THEN -0.501467
    WHEN 'B006S05' THEN -0.809067
    WHEN 'B006S06' THEN -0.855767
    WHEN 'B006S07' THEN -0.436989
    WHEN 'B006S08' THEN -0.111871
    WHEN 'B006S09' THEN -0.763623
    WHEN 'B006S10' THEN -0.290387
    WHEN 'B006S11' THEN -0.509103
    WHEN 'B006S12' THEN -0.244255
    WHEN 'B006S13' THEN -0.307812
    WHEN 'B006S14' THEN -0.234935
    WHEN 'B006S15' THEN -0.333673
    WHEN 'B006S16' THEN -0.646507
    WHEN 'B006S17' THEN -0.568669
    WHEN 'B006S18' THEN -0.708866
    WHEN 'B006S19' THEN -0.063569
  END::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN -0.168023
    WHEN 'B006S01' THEN -0.4668
    WHEN 'B006S02' THEN -0.230747
    WHEN 'B006S03' THEN -0.6422
    WHEN 'B006S04' THEN -0.501467
    WHEN 'B006S05' THEN -0.809067
    WHEN 'B006S06' THEN -0.855767
    WHEN 'B006S07' THEN -0.436989
    WHEN 'B006S08' THEN -0.111871
    WHEN 'B006S09' THEN -0.763623
    WHEN 'B006S10' THEN -0.290387
    WHEN 'B006S11' THEN -0.509103
    WHEN 'B006S12' THEN -0.244255
    WHEN 'B006S13' THEN -0.307812
    WHEN 'B006S14' THEN -0.234935
    WHEN 'B006S15' THEN -0.333673
    WHEN 'B006S16' THEN -0.646507
    WHEN 'B006S17' THEN -0.568669
    WHEN 'B006S18' THEN -0.708866
    WHEN 'B006S19' THEN -0.063569
  END::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN 0.013658
    WHEN 'B006S01' THEN 0.037371
    WHEN 'B006S02' THEN 0.066242
    WHEN 'B006S03' THEN 0.035435
    WHEN 'B006S04' THEN 0.001817
    WHEN 'B006S05' THEN 0.050719
    WHEN 'B006S06' THEN 0.011593
    WHEN 'B006S07' THEN 0.074592
    WHEN 'B006S08' THEN 0
    WHEN 'B006S09' THEN 0
    WHEN 'B006S10' THEN 0.013852
    WHEN 'B006S11' THEN 0.011492
    WHEN 'B006S12' THEN 0.052734
    WHEN 'B006S13' THEN 0.043342
    WHEN 'B006S14' THEN 0.017312
    WHEN 'B006S15' THEN 0
    WHEN 'B006S16' THEN 0.007668
    WHEN 'B006S17' THEN 0
    WHEN 'B006S18' THEN 0.052948
    WHEN 'B006S19' THEN 0
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B006S00' THEN 'Small Cap'
    WHEN 'B006S01' THEN 'Large Cap'
    WHEN 'B006S02' THEN 'Large Cap'
    WHEN 'B006S03' THEN 'Mid Cap'
    WHEN 'B006S04' THEN 'Mid Cap'
    WHEN 'B006S05' THEN 'Mid Cap'
    WHEN 'B006S06' THEN 'Large Cap'
    WHEN 'B006S07' THEN 'Mega Cap'
    WHEN 'B006S08' THEN 'Mid Cap'
    WHEN 'B006S09' THEN 'Mega Cap'
    WHEN 'B006S10' THEN 'Small Cap'
    WHEN 'B006S11' THEN 'Mid Cap'
    WHEN 'B006S12' THEN 'Large Cap'
    WHEN 'B006S13' THEN 'Large Cap'
    WHEN 'B006S14' THEN 'Large Cap'
    WHEN 'B006S15' THEN 'Large Cap'
    WHEN 'B006S16' THEN 'Small Cap'
    WHEN 'B006S17' THEN 'Large Cap'
    WHEN 'B006S18' THEN 'Small Cap'
    WHEN 'B006S19' THEN 'Mid Cap'
  END::text,
  CASE na.ticker
    WHEN 'B006S00' THEN 'High'
    WHEN 'B006S01' THEN 'High'
    WHEN 'B006S02' THEN 'High'
    WHEN 'B006S03' THEN 'High'
    WHEN 'B006S04' THEN 'High'
    WHEN 'B006S05' THEN 'Medium'
    WHEN 'B006S06' THEN 'High'
    WHEN 'B006S07' THEN 'High'
    WHEN 'B006S08' THEN 'High'
    WHEN 'B006S09' THEN 'High'
    WHEN 'B006S10' THEN 'High'
    WHEN 'B006S11' THEN 'High'
    WHEN 'B006S12' THEN 'High'
    WHEN 'B006S13' THEN 'High'
    WHEN 'B006S14' THEN 'High'
    WHEN 'B006S15' THEN 'High'
    WHEN 'B006S16' THEN 'Medium'
    WHEN 'B006S17' THEN 'High'
    WHEN 'B006S18' THEN 'High'
    WHEN 'B006S19' THEN 'Medium'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:33:14.690987", "pipeline_version": "4.0_mass", "batch_id": "006"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
