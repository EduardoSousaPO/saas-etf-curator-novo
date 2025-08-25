-- LOTE SINTÉTICO 5: 25 AÇÕES
-- Tickers: XJI1, MPK, JTF9, CRE1, DBK, EXV, VXG, CTR9, JAS, QFO, HCP, IZC, QMX, YTL, ZNU5, MQJ9, HLO, XEA, HAN, VVH4, NRR, HVA, MXZ5, IPW6, LIV

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('XJI1', 'STOCK', 'XJI1 Corporation', 'AMEX', 'Technology', 'Consumer Electronics', 'USD', 'XJI1 Corporation operates in the consumer electronics industry within the technology sector.'),
('MPK', 'STOCK', 'MPK Corporation', 'NASDAQ', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'MPK Corporation operates in the drug manufacturers—general industry within the healthcare sector.'),
('JTF9', 'STOCK', 'JTF9 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'JTF9 Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('CRE1', 'STOCK', 'CRE1 Corporation', 'NASDAQ', 'Technology', 'Semiconductors', 'USD', 'CRE1 Corporation operates in the semiconductors industry within the technology sector.'),
('DBK', 'STOCK', 'DBK Corporation', 'NYSE', 'Materials', 'Steel', 'USD', 'DBK Corporation operates in the steel industry within the materials sector.'),
('EXV', 'STOCK', 'EXV Corporation', 'NASDAQ', 'Healthcare', 'Biotechnology', 'USD', 'EXV Corporation operates in the biotechnology industry within the healthcare sector.'),
('VXG', 'STOCK', 'VXG Corporation', 'NASDAQ', 'Technology', 'Semiconductors', 'USD', 'VXG Corporation operates in the semiconductors industry within the technology sector.'),
('CTR9', 'STOCK', 'CTR9 Corporation', 'NYSE', 'Financial Services', 'Insurance—Life', 'USD', 'CTR9 Corporation operates in the insurance—life industry within the financial services sector.'),
('JAS', 'STOCK', 'JAS Corporation', 'NYSE', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'JAS Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('QFO', 'STOCK', 'QFO Corporation', 'NASDAQ', 'Real Estate', 'REIT—Residential', 'USD', 'QFO Corporation operates in the reit—residential industry within the real estate sector.'),
('HCP', 'STOCK', 'HCP Corporation', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'HCP Corporation operates in the auto manufacturers industry within the consumer cyclical sector.'),
('IZC', 'STOCK', 'IZC Corporation', 'NASDAQ', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'IZC Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('QMX', 'STOCK', 'QMX Corporation', 'NASDAQ', 'Consumer Defensive', 'Grocery Stores', 'USD', 'QMX Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('YTL', 'STOCK', 'YTL Corporation', 'NASDAQ', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'YTL Corporation operates in the drug manufacturers—general industry within the healthcare sector.'),
('ZNU5', 'STOCK', 'ZNU5 Corporation', 'NYSE', 'Communication Services', 'Internet Content & Information', 'USD', 'ZNU5 Corporation operates in the internet content & information industry within the communication services sector.'),
('MQJ9', 'STOCK', 'MQJ9 Corporation', 'NYSE', 'Financial Services', 'Banks—Regional', 'USD', 'MQJ9 Corporation operates in the banks—regional industry within the financial services sector.'),
('HLO', 'STOCK', 'HLO Corporation', 'AMEX', 'Industrials', 'Aerospace & Defense', 'USD', 'HLO Corporation operates in the aerospace & defense industry within the industrials sector.'),
('XEA', 'STOCK', 'XEA Corporation', 'NYSE', 'Consumer Cyclical', 'Internet Retail', 'USD', 'XEA Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('HAN', 'STOCK', 'HAN Corporation', 'AMEX', 'Technology', 'Software—Application', 'USD', 'HAN Corporation operates in the software—application industry within the technology sector.'),
('VVH4', 'STOCK', 'VVH4 Corporation', 'NASDAQ', 'Healthcare', 'Biotechnology', 'USD', 'VVH4 Corporation operates in the biotechnology industry within the healthcare sector.'),
('NRR', 'STOCK', 'NRR Corporation', 'NYSE', 'Utilities', 'Utilities—Renewable', 'USD', 'NRR Corporation operates in the utilities—renewable industry within the utilities sector.'),
('HVA', 'STOCK', 'HVA Corporation', 'NASDAQ', 'Industrials', 'Aerospace & Defense', 'USD', 'HVA Corporation operates in the aerospace & defense industry within the industrials sector.'),
('MXZ5', 'STOCK', 'MXZ5 Corporation', 'AMEX', 'Real Estate', 'REIT—Residential', 'USD', 'MXZ5 Corporation operates in the reit—residential industry within the real estate sector.'),
('IPW6', 'STOCK', 'IPW6 Corporation', 'NYSE', 'Utilities', 'Utilities—Renewable', 'USD', 'IPW6 Corporation operates in the utilities—renewable industry within the utilities sector.'),
('LIV', 'STOCK', 'LIV Corporation', 'AMEX', 'Industrials', 'Railroads', 'USD', 'LIV Corporation operates in the railroads industry within the industrials sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('XJI1', 'MPK', 'JTF9', 'CRE1', 'DBK', 'EXV', 'VXG', 'CTR9', 'JAS', 'QFO', 'HCP', 'IZC', 'QMX', 'YTL', 'ZNU5', 'MQJ9', 'HLO', 'XEA', 'HAN', 'VVH4', 'NRR', 'HVA', 'MXZ5', 'IPW6', 'LIV')
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
  '2025-08-14'::date,
  CASE na.ticker
    WHEN 'XJI1' THEN 428.56
    WHEN 'MPK' THEN 194.43
    WHEN 'JTF9' THEN 484.11
    WHEN 'CRE1' THEN 154.18
    WHEN 'DBK' THEN 226.08
    WHEN 'EXV' THEN 71.05
    WHEN 'VXG' THEN 380.07
    WHEN 'CTR9' THEN 39.3
    WHEN 'JAS' THEN 89.87
    WHEN 'QFO' THEN 417.22
    WHEN 'HCP' THEN 20.74
    WHEN 'IZC' THEN 239.01
    WHEN 'QMX' THEN 456.97
    WHEN 'YTL' THEN 92.16
    WHEN 'ZNU5' THEN 356.36
    WHEN 'MQJ9' THEN 324.51
    WHEN 'HLO' THEN 298.71
    WHEN 'XEA' THEN 36.48
    WHEN 'HAN' THEN 180.3
    WHEN 'VVH4' THEN 134.56
    WHEN 'NRR' THEN 379.19
    WHEN 'HVA' THEN 314.36
    WHEN 'MXZ5' THEN 131.74
    WHEN 'IPW6' THEN 465.63
    WHEN 'LIV' THEN 253.61
  END::numeric,
  CASE na.ticker
    WHEN 'XJI1' THEN 793260990523
    WHEN 'MPK' THEN 1211009488028
    WHEN 'JTF9' THEN 3124589078256
    WHEN 'CRE1' THEN 667718775869
    WHEN 'DBK' THEN 1950797296942
    WHEN 'EXV' THEN 119109611798
    WHEN 'VXG' THEN 1584030307154
    WHEN 'CTR9' THEN 57117353439
    WHEN 'JAS' THEN 96735580634
    WHEN 'QFO' THEN 1872082457474
    WHEN 'HCP' THEN 111606171063
    WHEN 'IZC' THEN 698005436898
    WHEN 'QMX' THEN 499597528397
    WHEN 'YTL' THEN 103495308042
    WHEN 'ZNU5' THEN 609327358121
    WHEN 'MQJ9' THEN 2902079991137
    WHEN 'HLO' THEN 1293943343488
    WHEN 'XEA' THEN 7945066350
    WHEN 'HAN' THEN 446567477948
    WHEN 'VVH4' THEN 1322305714763
    WHEN 'NRR' THEN 997036114788
    WHEN 'HVA' THEN 3046719979411
    WHEN 'MXZ5' THEN 959073342509
    WHEN 'IPW6' THEN 4256944012375
    WHEN 'LIV' THEN 2062716099670
  END::numeric,
  CASE na.ticker
    WHEN 'XJI1' THEN 1850991671
    WHEN 'MPK' THEN 6228511485
    WHEN 'JTF9' THEN 6454295673
    WHEN 'CRE1' THEN 4330774263
    WHEN 'DBK' THEN 8628792007
    WHEN 'EXV' THEN 1676419589
    WHEN 'VXG' THEN 4167733068
    WHEN 'CTR9' THEN 1453367772
    WHEN 'JAS' THEN 1076394577
    WHEN 'QFO' THEN 4487039110
    WHEN 'HCP' THEN 5381204005
    WHEN 'IZC' THEN 2920402648
    WHEN 'QMX' THEN 1093282991
    WHEN 'YTL' THEN 1122995964
    WHEN 'ZNU5' THEN 1709864626
    WHEN 'MQJ9' THEN 8942960128
    WHEN 'HLO' THEN 4331771094
    WHEN 'XEA' THEN 217792389
    WHEN 'HAN' THEN 2476802429
    WHEN 'VVH4' THEN 9826885514
    WHEN 'NRR' THEN 2629383989
    WHEN 'HVA' THEN 9691818232
    WHEN 'MXZ5' THEN 7280046626
    WHEN 'IPW6' THEN 9142331921
    WHEN 'LIV' THEN 8133417845
  END::bigint,
  CASE na.ticker
    WHEN 'XJI1' THEN 3001548010
    WHEN 'MPK' THEN 4455308140
    WHEN 'JTF9' THEN 4254535359
    WHEN 'CRE1' THEN 2166495452
    WHEN 'DBK' THEN 2294669431
    WHEN 'EXV' THEN 1863354922
    WHEN 'VXG' THEN 479618628
    WHEN 'CTR9' THEN 1785481945
    WHEN 'JAS' THEN 55726543
    WHEN 'QFO' THEN 911186803
    WHEN 'HCP' THEN 3901792832
    WHEN 'IZC' THEN 1593296042
    WHEN 'QMX' THEN 2235503955
    WHEN 'YTL' THEN 4358447767
    WHEN 'ZNU5' THEN 2851963862
    WHEN 'MQJ9' THEN 3026721301
    WHEN 'HLO' THEN 2571708853
    WHEN 'XEA' THEN 185109925
    WHEN 'HAN' THEN 952216669
    WHEN 'VVH4' THEN 2035581714
    WHEN 'NRR' THEN 3626611149
    WHEN 'HVA' THEN 708984138
    WHEN 'MXZ5' THEN 4877084321
    WHEN 'IPW6' THEN 4360322006
    WHEN 'LIV' THEN 4300038884
  END::bigint,
  CASE na.ticker
    WHEN 'XJI1' THEN 2.495236
    WHEN 'MPK' THEN 2.049215
    WHEN 'JTF9' THEN 1.749651
    WHEN 'CRE1' THEN 1.923954
    WHEN 'DBK' THEN -0.654898
    WHEN 'EXV' THEN 0.940153
    WHEN 'VXG' THEN 1.435094
    WHEN 'CTR9' THEN 0.212439
    WHEN 'JAS' THEN 0.482107
    WHEN 'QFO' THEN -0.205204
    WHEN 'HCP' THEN 0.295679
    WHEN 'IZC' THEN -0.319817
    WHEN 'QMX' THEN 0.176432
    WHEN 'YTL' THEN 2.241707
    WHEN 'ZNU5' THEN 0.71637
    WHEN 'MQJ9' THEN -0.203476
    WHEN 'HLO' THEN 0.475455
    WHEN 'XEA' THEN 2.150322
    WHEN 'HAN' THEN 1.687502
    WHEN 'VVH4' THEN 0.019344
    WHEN 'NRR' THEN -0.199321
    WHEN 'HVA' THEN 1.167817
    WHEN 'MXZ5' THEN 2.104144
    WHEN 'IPW6' THEN 1.175787
    WHEN 'LIV' THEN 0.03592
  END::numeric,
  CASE na.ticker
    WHEN 'XJI1' THEN 0.915357
    WHEN 'MPK' THEN 1.151433
    WHEN 'JTF9' THEN 0.989691
    WHEN 'CRE1' THEN 1.144366
    WHEN 'DBK' THEN 0.48386
    WHEN 'EXV' THEN 0.672718
    WHEN 'VXG' THEN 0.222036
    WHEN 'CTR9' THEN 0.714498
    WHEN 'JAS' THEN 1.136687
    WHEN 'QFO' THEN 1.166937
    WHEN 'HCP' THEN 0.531371
    WHEN 'IZC' THEN 0.37667
    WHEN 'QMX' THEN 0.318585
    WHEN 'YTL' THEN 0.88597
    WHEN 'ZNU5' THEN 1.057788
    WHEN 'MQJ9' THEN 0.164104
    WHEN 'HLO' THEN 0.762972
    WHEN 'XEA' THEN 0.598338
    WHEN 'HAN' THEN 0.733918
    WHEN 'VVH4' THEN 0.264821
    WHEN 'NRR' THEN 0.512725
    WHEN 'HVA' THEN 0.975356
    WHEN 'MXZ5' THEN 0.241374
    WHEN 'IPW6' THEN 0.438504
    WHEN 'LIV' THEN 0.318743
  END::numeric,
  CASE na.ticker
    WHEN 'XJI1' THEN 2.893468
    WHEN 'MPK' THEN -1.371876
    WHEN 'JTF9' THEN 2.240908
    WHEN 'CRE1' THEN 0.747337
    WHEN 'DBK' THEN -1.042056
    WHEN 'EXV' THEN 0.930871
    WHEN 'VXG' THEN 3.991775
    WHEN 'CTR9' THEN 3.443324
    WHEN 'JAS' THEN 1.789322
    WHEN 'QFO' THEN 0.015855
    WHEN 'HCP' THEN -1.349529
    WHEN 'IZC' THEN 3.231122
    WHEN 'QMX' THEN 2.716199
    WHEN 'YTL' THEN 2.716962
    WHEN 'ZNU5' THEN -1.123953
    WHEN 'MQJ9' THEN -0.558691
    WHEN 'HLO' THEN 2.527081
    WHEN 'XEA' THEN 3.291484
    WHEN 'HAN' THEN 1.391404
    WHEN 'VVH4' THEN 0.113881
    WHEN 'NRR' THEN -1.980288
    WHEN 'HVA' THEN -0.448598
    WHEN 'MXZ5' THEN -0.996407
    WHEN 'IPW6' THEN -0.241416
    WHEN 'LIV' THEN 1.278645
  END::numeric,
  CASE na.ticker
    WHEN 'XJI1' THEN -0.599401
    WHEN 'MPK' THEN -0.050625
    WHEN 'JTF9' THEN -0.053222
    WHEN 'CRE1' THEN -0.804199
    WHEN 'DBK' THEN -0.521478
    WHEN 'EXV' THEN -0.059947
    WHEN 'VXG' THEN -0.301404
    WHEN 'CTR9' THEN -0.190546
    WHEN 'JAS' THEN -0.595019
    WHEN 'QFO' THEN -0.548905
    WHEN 'HCP' THEN -0.892616
    WHEN 'IZC' THEN -0.809102
    WHEN 'QMX' THEN -0.149128
    WHEN 'YTL' THEN -0.199467
    WHEN 'ZNU5' THEN -0.378858
    WHEN 'MQJ9' THEN -0.677613
    WHEN 'HLO' THEN -0.110033
    WHEN 'XEA' THEN -0.48826
    WHEN 'HAN' THEN -0.494567
    WHEN 'VVH4' THEN -0.501026
    WHEN 'NRR' THEN -0.409581
    WHEN 'HVA' THEN -0.437703
    WHEN 'MXZ5' THEN -0.295019
    WHEN 'IPW6' THEN -0.110266
    WHEN 'LIV' THEN -0.709717
  END::numeric,
  CASE na.ticker
    WHEN 'XJI1' THEN -0.599401
    WHEN 'MPK' THEN -0.050625
    WHEN 'JTF9' THEN -0.053222
    WHEN 'CRE1' THEN -0.804199
    WHEN 'DBK' THEN -0.521478
    WHEN 'EXV' THEN -0.059947
    WHEN 'VXG' THEN -0.301404
    WHEN 'CTR9' THEN -0.190546
    WHEN 'JAS' THEN -0.595019
    WHEN 'QFO' THEN -0.548905
    WHEN 'HCP' THEN -0.892616
    WHEN 'IZC' THEN -0.809102
    WHEN 'QMX' THEN -0.149128
    WHEN 'YTL' THEN -0.199467
    WHEN 'ZNU5' THEN -0.378858
    WHEN 'MQJ9' THEN -0.677613
    WHEN 'HLO' THEN -0.110033
    WHEN 'XEA' THEN -0.48826
    WHEN 'HAN' THEN -0.494567
    WHEN 'VVH4' THEN -0.501026
    WHEN 'NRR' THEN -0.409581
    WHEN 'HVA' THEN -0.437703
    WHEN 'MXZ5' THEN -0.295019
    WHEN 'IPW6' THEN -0.110266
    WHEN 'LIV' THEN -0.709717
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'XJI1' THEN 'Mega Cap'
    WHEN 'MPK' THEN 'Mega Cap'
    WHEN 'JTF9' THEN 'Mega Cap'
    WHEN 'CRE1' THEN 'Mega Cap'
    WHEN 'DBK' THEN 'Mega Cap'
    WHEN 'EXV' THEN 'Large Cap'
    WHEN 'VXG' THEN 'Mega Cap'
    WHEN 'CTR9' THEN 'Large Cap'
    WHEN 'JAS' THEN 'Large Cap'
    WHEN 'QFO' THEN 'Mega Cap'
    WHEN 'HCP' THEN 'Large Cap'
    WHEN 'IZC' THEN 'Mega Cap'
    WHEN 'QMX' THEN 'Mega Cap'
    WHEN 'YTL' THEN 'Large Cap'
    WHEN 'ZNU5' THEN 'Mega Cap'
    WHEN 'MQJ9' THEN 'Mega Cap'
    WHEN 'HLO' THEN 'Mega Cap'
    WHEN 'XEA' THEN 'Mid Cap'
    WHEN 'HAN' THEN 'Mega Cap'
    WHEN 'VVH4' THEN 'Mega Cap'
    WHEN 'NRR' THEN 'Mega Cap'
    WHEN 'HVA' THEN 'Mega Cap'
    WHEN 'MXZ5' THEN 'Mega Cap'
    WHEN 'IPW6' THEN 'Mega Cap'
    WHEN 'LIV' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'XJI1' THEN 'High'
    WHEN 'MPK' THEN 'High'
    WHEN 'JTF9' THEN 'High'
    WHEN 'CRE1' THEN 'High'
    WHEN 'DBK' THEN 'High'
    WHEN 'EXV' THEN 'High'
    WHEN 'VXG' THEN 'High'
    WHEN 'CTR9' THEN 'High'
    WHEN 'JAS' THEN 'High'
    WHEN 'QFO' THEN 'High'
    WHEN 'HCP' THEN 'High'
    WHEN 'IZC' THEN 'High'
    WHEN 'QMX' THEN 'High'
    WHEN 'YTL' THEN 'High'
    WHEN 'ZNU5' THEN 'High'
    WHEN 'MQJ9' THEN 'High'
    WHEN 'HLO' THEN 'High'
    WHEN 'XEA' THEN 'High'
    WHEN 'HAN' THEN 'High'
    WHEN 'VVH4' THEN 'High'
    WHEN 'NRR' THEN 'High'
    WHEN 'HVA' THEN 'High'
    WHEN 'MXZ5' THEN 'High'
    WHEN 'IPW6' THEN 'High'
    WHEN 'LIV' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.195392", "pipeline_version": "2.1_synthetic", "batch_id": "batch_005"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
