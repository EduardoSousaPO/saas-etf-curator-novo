-- LOTE SINTÉTICO 6: 25 AÇÕES
-- Tickers: FDS9, MHU, FIL4, GTS, JHO, WQH, FLX, MGL, ECK, JHT, HIB, RZJ, PMD4, DTU3, NBO, BXC, VKI, PVT3, AGG, BMI, OMO, HJO, ZSD, BNC, HST

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('FDS9', 'STOCK', 'FDS9 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'FDS9 Corporation operates in the utilities—renewable industry within the utilities sector.'),
('MHU', 'STOCK', 'MHU Corporation', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'MHU Corporation operates in the internet content & information industry within the communication services sector.'),
('FIL4', 'STOCK', 'FIL4 Corporation', 'NASDAQ', 'Materials', 'Chemicals', 'USD', 'FIL4 Corporation operates in the chemicals industry within the materials sector.'),
('GTS', 'STOCK', 'GTS Corporation', 'NYSE', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'GTS Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('JHO', 'STOCK', 'JHO Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'JHO Corporation operates in the oil & gas e&p industry within the energy sector.'),
('WQH', 'STOCK', 'WQH Corporation', 'NYSE', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'WQH Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('FLX', 'STOCK', 'FLX Corporation', 'NYSE', 'Technology', 'Consumer Electronics', 'USD', 'FLX Corporation operates in the consumer electronics industry within the technology sector.'),
('MGL', 'STOCK', 'MGL Corporation', 'AMEX', 'Financial Services', 'Insurance—Life', 'USD', 'MGL Corporation operates in the insurance—life industry within the financial services sector.'),
('ECK', 'STOCK', 'ECK Corporation', 'NASDAQ', 'Materials', 'Steel', 'USD', 'ECK Corporation operates in the steel industry within the materials sector.'),
('JHT', 'STOCK', 'JHT Corporation', 'AMEX', 'Communication Services', 'Internet Content & Information', 'USD', 'JHT Corporation operates in the internet content & information industry within the communication services sector.'),
('HIB', 'STOCK', 'HIB Corporation', 'NYSE', 'Technology', 'Software—Application', 'USD', 'HIB Corporation operates in the software—application industry within the technology sector.'),
('RZJ', 'STOCK', 'RZJ Corporation', 'NYSE', 'Real Estate', 'REIT—Residential', 'USD', 'RZJ Corporation operates in the reit—residential industry within the real estate sector.'),
('PMD4', 'STOCK', 'PMD4 Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'PMD4 Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('DTU3', 'STOCK', 'DTU3 Corporation', 'NASDAQ', 'Industrials', 'Aerospace & Defense', 'USD', 'DTU3 Corporation operates in the aerospace & defense industry within the industrials sector.'),
('NBO', 'STOCK', 'NBO Corporation', 'NYSE', 'Consumer Defensive', 'Grocery Stores', 'USD', 'NBO Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('BXC', 'STOCK', 'BXC Corporation', 'NASDAQ', 'Technology', 'Semiconductors', 'USD', 'BXC Corporation operates in the semiconductors industry within the technology sector.'),
('VKI', 'STOCK', 'VKI Corporation', 'NASDAQ', 'Energy', 'Oil & Gas E&P', 'USD', 'VKI Corporation operates in the oil & gas e&p industry within the energy sector.'),
('PVT3', 'STOCK', 'PVT3 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'PVT3 Corporation operates in the utilities—renewable industry within the utilities sector.'),
('AGG', 'STOCK', 'AGG Corporation', 'AMEX', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'AGG Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('BMI', 'STOCK', 'BMI Corporation', 'NYSE', 'Communication Services', 'Internet Content & Information', 'USD', 'BMI Corporation operates in the internet content & information industry within the communication services sector.'),
('OMO', 'STOCK', 'OMO Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'OMO Corporation operates in the insurance—life industry within the financial services sector.'),
('HJO', 'STOCK', 'HJO Corporation', 'NASDAQ', 'Energy', 'Oil & Gas E&P', 'USD', 'HJO Corporation operates in the oil & gas e&p industry within the energy sector.'),
('ZSD', 'STOCK', 'ZSD Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'ZSD Corporation operates in the insurance—life industry within the financial services sector.'),
('BNC', 'STOCK', 'BNC Corporation', 'AMEX', 'Communication Services', 'Internet Content & Information', 'USD', 'BNC Corporation operates in the internet content & information industry within the communication services sector.'),
('HST', 'STOCK', 'HST Corporation', 'AMEX', 'Communication Services', 'Internet Content & Information', 'USD', 'HST Corporation operates in the internet content & information industry within the communication services sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('FDS9', 'MHU', 'FIL4', 'GTS', 'JHO', 'WQH', 'FLX', 'MGL', 'ECK', 'JHT', 'HIB', 'RZJ', 'PMD4', 'DTU3', 'NBO', 'BXC', 'VKI', 'PVT3', 'AGG', 'BMI', 'OMO', 'HJO', 'ZSD', 'BNC', 'HST')
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
    WHEN 'FDS9' THEN 366.49
    WHEN 'MHU' THEN 471.59
    WHEN 'FIL4' THEN 61.22
    WHEN 'GTS' THEN 91.25
    WHEN 'JHO' THEN 319.89
    WHEN 'WQH' THEN 146.11
    WHEN 'FLX' THEN 44.69
    WHEN 'MGL' THEN 427.75
    WHEN 'ECK' THEN 24.38
    WHEN 'JHT' THEN 205.12
    WHEN 'HIB' THEN 480.43
    WHEN 'RZJ' THEN 358.26
    WHEN 'PMD4' THEN 183.4
    WHEN 'DTU3' THEN 492.14
    WHEN 'NBO' THEN 198.41
    WHEN 'BXC' THEN 481.18
    WHEN 'VKI' THEN 442.5
    WHEN 'PVT3' THEN 315.15
    WHEN 'AGG' THEN 404.79
    WHEN 'BMI' THEN 158.58
    WHEN 'OMO' THEN 23.89
    WHEN 'HJO' THEN 460.37
    WHEN 'ZSD' THEN 166.08
    WHEN 'BNC' THEN 165.62
    WHEN 'HST' THEN 474.04
  END::numeric,
  CASE na.ticker
    WHEN 'FDS9' THEN 2509855820691
    WHEN 'MHU' THEN 1398879620268
    WHEN 'FIL4' THEN 291906436733
    WHEN 'GTS' THEN 578150613295
    WHEN 'JHO' THEN 2962318017661
    WHEN 'WQH' THEN 1313788984712
    WHEN 'FLX' THEN 44508236519
    WHEN 'MGL' THEN 3586857382707
    WHEN 'ECK' THEN 20580724195
    WHEN 'JHT' THEN 552807713678
    WHEN 'HIB' THEN 3850717997557
    WHEN 'RZJ' THEN 3255556555188
    WHEN 'PMD4' THEN 276322910466
    WHEN 'DTU3' THEN 504832594742
    WHEN 'NBO' THEN 1842142308230
    WHEN 'BXC' THEN 1926995442478
    WHEN 'VKI' THEN 1790107569045
    WHEN 'PVT3' THEN 2196498907785
    WHEN 'AGG' THEN 1249363979325
    WHEN 'BMI' THEN 1379044078686
    WHEN 'OMO' THEN 110067961891
    WHEN 'HJO' THEN 441878059942
    WHEN 'ZSD' THEN 799628933101
    WHEN 'BNC' THEN 705850843648
    WHEN 'HST' THEN 3312256116790
  END::numeric,
  CASE na.ticker
    WHEN 'FDS9' THEN 6848360994
    WHEN 'MHU' THEN 2966304672
    WHEN 'FIL4' THEN 4768154798
    WHEN 'GTS' THEN 6335897132
    WHEN 'JHO' THEN 9260427077
    WHEN 'WQH' THEN 8991780061
    WHEN 'FLX' THEN 995932793
    WHEN 'MGL' THEN 8385405921
    WHEN 'ECK' THEN 844164241
    WHEN 'JHT' THEN 2695045406
    WHEN 'HIB' THEN 8015148924
    WHEN 'RZJ' THEN 9087133800
    WHEN 'PMD4' THEN 1506667996
    WHEN 'DTU3' THEN 1025790618
    WHEN 'NBO' THEN 9284523503
    WHEN 'BXC' THEN 4004728880
    WHEN 'VKI' THEN 4045440834
    WHEN 'PVT3' THEN 6969693504
    WHEN 'AGG' THEN 3086449713
    WHEN 'BMI' THEN 8696204305
    WHEN 'OMO' THEN 4607281787
    WHEN 'HJO' THEN 959832439
    WHEN 'ZSD' THEN 4814721418
    WHEN 'BNC' THEN 4261869603
    WHEN 'HST' THEN 6987292458
  END::bigint,
  CASE na.ticker
    WHEN 'FDS9' THEN 67306916
    WHEN 'MHU' THEN 3989793829
    WHEN 'FIL4' THEN 3838461606
    WHEN 'GTS' THEN 3696204274
    WHEN 'JHO' THEN 3053842392
    WHEN 'WQH' THEN 3340074439
    WHEN 'FLX' THEN 1861805521
    WHEN 'MGL' THEN 2987908817
    WHEN 'ECK' THEN 955410037
    WHEN 'JHT' THEN 1677042431
    WHEN 'HIB' THEN 4686131405
    WHEN 'RZJ' THEN 1993793067
    WHEN 'PMD4' THEN 3653052070
    WHEN 'DTU3' THEN 2221737056
    WHEN 'NBO' THEN 986938752
    WHEN 'BXC' THEN 2752062417
    WHEN 'VKI' THEN 3401835149
    WHEN 'PVT3' THEN 4563860491
    WHEN 'AGG' THEN 1986733076
    WHEN 'BMI' THEN 1512139098
    WHEN 'OMO' THEN 3909375982
    WHEN 'HJO' THEN 809832565
    WHEN 'ZSD' THEN 593371420
    WHEN 'BNC' THEN 2104003107
    WHEN 'HST' THEN 4850436274
  END::bigint,
  CASE na.ticker
    WHEN 'FDS9' THEN 0.977837
    WHEN 'MHU' THEN -0.693481
    WHEN 'FIL4' THEN 1.727046
    WHEN 'GTS' THEN 0.682237
    WHEN 'JHO' THEN -0.783265
    WHEN 'WQH' THEN 0.698409
    WHEN 'FLX' THEN 0.752792
    WHEN 'MGL' THEN 0.524099
    WHEN 'ECK' THEN 1.392958
    WHEN 'JHT' THEN 2.050295
    WHEN 'HIB' THEN 0.15023
    WHEN 'RZJ' THEN 2.275636
    WHEN 'PMD4' THEN 1.110818
    WHEN 'DTU3' THEN 1.976083
    WHEN 'NBO' THEN 1.303229
    WHEN 'BXC' THEN 0.390756
    WHEN 'VKI' THEN 2.041012
    WHEN 'PVT3' THEN 2.233222
    WHEN 'AGG' THEN 1.014231
    WHEN 'BMI' THEN -0.049349
    WHEN 'OMO' THEN -0.328047
    WHEN 'HJO' THEN 1.292389
    WHEN 'ZSD' THEN 2.221704
    WHEN 'BNC' THEN -0.288614
    WHEN 'HST' THEN 0.128176
  END::numeric,
  CASE na.ticker
    WHEN 'FDS9' THEN 0.403898
    WHEN 'MHU' THEN 0.9345
    WHEN 'FIL4' THEN 1.191208
    WHEN 'GTS' THEN 0.534788
    WHEN 'JHO' THEN 0.315575
    WHEN 'WQH' THEN 0.541195
    WHEN 'FLX' THEN 0.982896
    WHEN 'MGL' THEN 1.004403
    WHEN 'ECK' THEN 1.10725
    WHEN 'JHT' THEN 0.538049
    WHEN 'HIB' THEN 0.180569
    WHEN 'RZJ' THEN 0.984864
    WHEN 'PMD4' THEN 0.476808
    WHEN 'DTU3' THEN 0.373708
    WHEN 'NBO' THEN 0.206872
    WHEN 'BXC' THEN 0.784198
    WHEN 'VKI' THEN 0.477734
    WHEN 'PVT3' THEN 0.210803
    WHEN 'AGG' THEN 0.726137
    WHEN 'BMI' THEN 0.771391
    WHEN 'OMO' THEN 0.732571
    WHEN 'HJO' THEN 1.15252
    WHEN 'ZSD' THEN 0.452772
    WHEN 'BNC' THEN 0.357938
    WHEN 'HST' THEN 0.880711
  END::numeric,
  CASE na.ticker
    WHEN 'FDS9' THEN 2.153626
    WHEN 'MHU' THEN -1.426731
    WHEN 'FIL4' THEN -1.354751
    WHEN 'GTS' THEN 0.647481
    WHEN 'JHO' THEN 3.723542
    WHEN 'WQH' THEN 1.469716
    WHEN 'FLX' THEN -0.594472
    WHEN 'MGL' THEN 1.642197
    WHEN 'ECK' THEN -1.761481
    WHEN 'JHT' THEN 0.303062
    WHEN 'HIB' THEN -0.652734
    WHEN 'RZJ' THEN 0.349564
    WHEN 'PMD4' THEN 2.490895
    WHEN 'DTU3' THEN 2.654141
    WHEN 'NBO' THEN 0.653761
    WHEN 'BXC' THEN 2.745424
    WHEN 'VKI' THEN -0.33031
    WHEN 'PVT3' THEN -0.520108
    WHEN 'AGG' THEN 1.466206
    WHEN 'BMI' THEN -1.714016
    WHEN 'OMO' THEN 0.029418
    WHEN 'HJO' THEN 0.957042
    WHEN 'ZSD' THEN 3.815025
    WHEN 'BNC' THEN -0.86787
    WHEN 'HST' THEN 2.696894
  END::numeric,
  CASE na.ticker
    WHEN 'FDS9' THEN -0.838743
    WHEN 'MHU' THEN -0.899791
    WHEN 'FIL4' THEN -0.7495
    WHEN 'GTS' THEN -0.193734
    WHEN 'JHO' THEN -0.341002
    WHEN 'WQH' THEN -0.185703
    WHEN 'FLX' THEN -0.111969
    WHEN 'MGL' THEN -0.168404
    WHEN 'ECK' THEN -0.803618
    WHEN 'JHT' THEN -0.451756
    WHEN 'HIB' THEN -0.561155
    WHEN 'RZJ' THEN -0.086857
    WHEN 'PMD4' THEN -0.250828
    WHEN 'DTU3' THEN -0.44797
    WHEN 'NBO' THEN -0.878947
    WHEN 'BXC' THEN -0.190563
    WHEN 'VKI' THEN -0.862657
    WHEN 'PVT3' THEN -0.432683
    WHEN 'AGG' THEN -0.660517
    WHEN 'BMI' THEN -0.818688
    WHEN 'OMO' THEN -0.374295
    WHEN 'HJO' THEN -0.522353
    WHEN 'ZSD' THEN -0.072852
    WHEN 'BNC' THEN -0.057361
    WHEN 'HST' THEN -0.714903
  END::numeric,
  CASE na.ticker
    WHEN 'FDS9' THEN -0.838743
    WHEN 'MHU' THEN -0.899791
    WHEN 'FIL4' THEN -0.7495
    WHEN 'GTS' THEN -0.193734
    WHEN 'JHO' THEN -0.341002
    WHEN 'WQH' THEN -0.185703
    WHEN 'FLX' THEN -0.111969
    WHEN 'MGL' THEN -0.168404
    WHEN 'ECK' THEN -0.803618
    WHEN 'JHT' THEN -0.451756
    WHEN 'HIB' THEN -0.561155
    WHEN 'RZJ' THEN -0.086857
    WHEN 'PMD4' THEN -0.250828
    WHEN 'DTU3' THEN -0.44797
    WHEN 'NBO' THEN -0.878947
    WHEN 'BXC' THEN -0.190563
    WHEN 'VKI' THEN -0.862657
    WHEN 'PVT3' THEN -0.432683
    WHEN 'AGG' THEN -0.660517
    WHEN 'BMI' THEN -0.818688
    WHEN 'OMO' THEN -0.374295
    WHEN 'HJO' THEN -0.522353
    WHEN 'ZSD' THEN -0.072852
    WHEN 'BNC' THEN -0.057361
    WHEN 'HST' THEN -0.714903
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'FDS9' THEN 'Mega Cap'
    WHEN 'MHU' THEN 'Mega Cap'
    WHEN 'FIL4' THEN 'Mega Cap'
    WHEN 'GTS' THEN 'Mega Cap'
    WHEN 'JHO' THEN 'Mega Cap'
    WHEN 'WQH' THEN 'Mega Cap'
    WHEN 'FLX' THEN 'Large Cap'
    WHEN 'MGL' THEN 'Mega Cap'
    WHEN 'ECK' THEN 'Large Cap'
    WHEN 'JHT' THEN 'Mega Cap'
    WHEN 'HIB' THEN 'Mega Cap'
    WHEN 'RZJ' THEN 'Mega Cap'
    WHEN 'PMD4' THEN 'Mega Cap'
    WHEN 'DTU3' THEN 'Mega Cap'
    WHEN 'NBO' THEN 'Mega Cap'
    WHEN 'BXC' THEN 'Mega Cap'
    WHEN 'VKI' THEN 'Mega Cap'
    WHEN 'PVT3' THEN 'Mega Cap'
    WHEN 'AGG' THEN 'Mega Cap'
    WHEN 'BMI' THEN 'Mega Cap'
    WHEN 'OMO' THEN 'Large Cap'
    WHEN 'HJO' THEN 'Mega Cap'
    WHEN 'ZSD' THEN 'Mega Cap'
    WHEN 'BNC' THEN 'Mega Cap'
    WHEN 'HST' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'FDS9' THEN 'High'
    WHEN 'MHU' THEN 'High'
    WHEN 'FIL4' THEN 'High'
    WHEN 'GTS' THEN 'High'
    WHEN 'JHO' THEN 'High'
    WHEN 'WQH' THEN 'High'
    WHEN 'FLX' THEN 'High'
    WHEN 'MGL' THEN 'High'
    WHEN 'ECK' THEN 'High'
    WHEN 'JHT' THEN 'High'
    WHEN 'HIB' THEN 'High'
    WHEN 'RZJ' THEN 'High'
    WHEN 'PMD4' THEN 'High'
    WHEN 'DTU3' THEN 'High'
    WHEN 'NBO' THEN 'High'
    WHEN 'BXC' THEN 'High'
    WHEN 'VKI' THEN 'High'
    WHEN 'PVT3' THEN 'High'
    WHEN 'AGG' THEN 'High'
    WHEN 'BMI' THEN 'High'
    WHEN 'OMO' THEN 'High'
    WHEN 'HJO' THEN 'High'
    WHEN 'ZSD' THEN 'High'
    WHEN 'BNC' THEN 'High'
    WHEN 'HST' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.196418", "pipeline_version": "2.1_synthetic", "batch_id": "batch_006"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
