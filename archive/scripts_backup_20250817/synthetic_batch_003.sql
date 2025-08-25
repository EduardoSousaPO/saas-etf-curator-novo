-- LOTE SINTÉTICO 3: 25 AÇÕES
-- Tickers: TAS2, ALO, BZW, WHS, NZX7, ZPV7, BLQ, LHO, ZBU, XDX, GXH, OCM, NHX2, FJN, PYR, GAK1, CME, GPU, DZN9, DXE, CSE, KXI, IVH, SFF8, VDM

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('TAS2', 'STOCK', 'TAS2 Corporation', 'NYSE', 'Materials', 'Chemicals', 'USD', 'TAS2 Corporation operates in the chemicals industry within the materials sector.'),
('ALO', 'STOCK', 'ALO Corporation', 'NASDAQ', 'Industrials', 'Aerospace & Defense', 'USD', 'ALO Corporation operates in the aerospace & defense industry within the industrials sector.'),
('BZW', 'STOCK', 'BZW Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'BZW Corporation operates in the software—application industry within the technology sector.'),
('WHS', 'STOCK', 'WHS Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'WHS Corporation operates in the utilities—renewable industry within the utilities sector.'),
('NZX7', 'STOCK', 'NZX7 Corporation', 'NYSE', 'Financial Services', 'Banks—Regional', 'USD', 'NZX7 Corporation operates in the banks—regional industry within the financial services sector.'),
('ZPV7', 'STOCK', 'ZPV7 Corporation', 'AMEX', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'ZPV7 Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('BLQ', 'STOCK', 'BLQ Corporation', 'AMEX', 'Industrials', 'Railroads', 'USD', 'BLQ Corporation operates in the railroads industry within the industrials sector.'),
('LHO', 'STOCK', 'LHO Corporation', 'AMEX', 'Materials', 'Steel', 'USD', 'LHO Corporation operates in the steel industry within the materials sector.'),
('ZBU', 'STOCK', 'ZBU Corporation', 'NYSE', 'Technology', 'Consumer Electronics', 'USD', 'ZBU Corporation operates in the consumer electronics industry within the technology sector.'),
('XDX', 'STOCK', 'XDX Corporation', 'NYSE', 'Utilities', 'Utilities—Renewable', 'USD', 'XDX Corporation operates in the utilities—renewable industry within the utilities sector.'),
('GXH', 'STOCK', 'GXH Corporation', 'NASDAQ', 'Consumer Defensive', 'Grocery Stores', 'USD', 'GXH Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('OCM', 'STOCK', 'OCM Corporation', 'NASDAQ', 'Industrials', 'Railroads', 'USD', 'OCM Corporation operates in the railroads industry within the industrials sector.'),
('NHX2', 'STOCK', 'NHX2 Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'NHX2 Corporation operates in the software—application industry within the technology sector.'),
('FJN', 'STOCK', 'FJN Corporation', 'AMEX', 'Consumer Defensive', 'Grocery Stores', 'USD', 'FJN Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('PYR', 'STOCK', 'PYR Corporation', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail', 'USD', 'PYR Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('GAK1', 'STOCK', 'GAK1 Corporation', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail', 'USD', 'GAK1 Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('CME', 'STOCK', 'CME Corporation', 'AMEX', 'Energy', 'Oil & Gas E&P', 'USD', 'CME Corporation operates in the oil & gas e&p industry within the energy sector.'),
('GPU', 'STOCK', 'GPU Corporation', 'AMEX', 'Healthcare', 'Biotechnology', 'USD', 'GPU Corporation operates in the biotechnology industry within the healthcare sector.'),
('DZN9', 'STOCK', 'DZN9 Corporation', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'DZN9 Corporation operates in the auto manufacturers industry within the consumer cyclical sector.'),
('DXE', 'STOCK', 'DXE Corporation', 'AMEX', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'DXE Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('CSE', 'STOCK', 'CSE Corporation', 'NYSE', 'Consumer Cyclical', 'Internet Retail', 'USD', 'CSE Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('KXI', 'STOCK', 'KXI Corporation', 'NASDAQ', 'Industrials', 'Railroads', 'USD', 'KXI Corporation operates in the railroads industry within the industrials sector.'),
('IVH', 'STOCK', 'IVH Corporation', 'NASDAQ', 'Financial Services', 'Banks—Regional', 'USD', 'IVH Corporation operates in the banks—regional industry within the financial services sector.'),
('SFF8', 'STOCK', 'SFF8 Corporation', 'NYSE', 'Industrials', 'Railroads', 'USD', 'SFF8 Corporation operates in the railroads industry within the industrials sector.'),
('VDM', 'STOCK', 'VDM Corporation', 'AMEX', 'Industrials', 'Railroads', 'USD', 'VDM Corporation operates in the railroads industry within the industrials sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('TAS2', 'ALO', 'BZW', 'WHS', 'NZX7', 'ZPV7', 'BLQ', 'LHO', 'ZBU', 'XDX', 'GXH', 'OCM', 'NHX2', 'FJN', 'PYR', 'GAK1', 'CME', 'GPU', 'DZN9', 'DXE', 'CSE', 'KXI', 'IVH', 'SFF8', 'VDM')
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
    WHEN 'TAS2' THEN 43.01
    WHEN 'ALO' THEN 229.31
    WHEN 'BZW' THEN 248.61
    WHEN 'WHS' THEN 241.56
    WHEN 'NZX7' THEN 225.58
    WHEN 'ZPV7' THEN 348.68
    WHEN 'BLQ' THEN 289.16
    WHEN 'LHO' THEN 303.48
    WHEN 'ZBU' THEN 95.17
    WHEN 'XDX' THEN 375.87
    WHEN 'GXH' THEN 303.54
    WHEN 'OCM' THEN 298.41
    WHEN 'NHX2' THEN 483.95
    WHEN 'FJN' THEN 115.41
    WHEN 'PYR' THEN 131.69
    WHEN 'GAK1' THEN 60.4
    WHEN 'CME' THEN 179.59
    WHEN 'GPU' THEN 383.6
    WHEN 'DZN9' THEN 106.29
    WHEN 'DXE' THEN 474.83
    WHEN 'CSE' THEN 114.61
    WHEN 'KXI' THEN 392.21
    WHEN 'IVH' THEN 9.08
    WHEN 'SFF8' THEN 43.7
    WHEN 'VDM' THEN 403.83
  END::numeric,
  CASE na.ticker
    WHEN 'TAS2' THEN 354421467064
    WHEN 'ALO' THEN 1874052908396
    WHEN 'BZW' THEN 1380702263545
    WHEN 'WHS' THEN 737358863349
    WHEN 'NZX7' THEN 786808557538
    WHEN 'ZPV7' THEN 1874256381848
    WHEN 'BLQ' THEN 2687123930521
    WHEN 'LHO' THEN 200027537673
    WHEN 'ZBU' THEN 281223139013
    WHEN 'XDX' THEN 2477555299717
    WHEN 'GXH' THEN 327904167777
    WHEN 'OCM' THEN 2665878545477
    WHEN 'NHX2' THEN 2764035809165
    WHEN 'FJN' THEN 227096598724
    WHEN 'PYR' THEN 1246503044547
    WHEN 'GAK1' THEN 330500538850
    WHEN 'CME' THEN 1359289643093
    WHEN 'GPU' THEN 1266302879872
    WHEN 'DZN9' THEN 780819646870
    WHEN 'DXE' THEN 1469309279197
    WHEN 'CSE' THEN 687496725791
    WHEN 'KXI' THEN 429074360326
    WHEN 'IVH' THEN 67255265862
    WHEN 'SFF8' THEN 286745752927
    WHEN 'VDM' THEN 2903616822411
  END::numeric,
  CASE na.ticker
    WHEN 'TAS2' THEN 8240443317
    WHEN 'ALO' THEN 8172573845
    WHEN 'BZW' THEN 5553687557
    WHEN 'WHS' THEN 3052487429
    WHEN 'NZX7' THEN 3487935799
    WHEN 'ZPV7' THEN 5375290759
    WHEN 'BLQ' THEN 9292861843
    WHEN 'LHO' THEN 659112751
    WHEN 'ZBU' THEN 2954955753
    WHEN 'XDX' THEN 6591521802
    WHEN 'GXH' THEN 1080266745
    WHEN 'OCM' THEN 8933609951
    WHEN 'NHX2' THEN 5711407809
    WHEN 'FJN' THEN 1967737620
    WHEN 'PYR' THEN 9465434312
    WHEN 'GAK1' THEN 5471863226
    WHEN 'CME' THEN 7568849285
    WHEN 'GPU' THEN 3301102398
    WHEN 'DZN9' THEN 7346125194
    WHEN 'DXE' THEN 3094390159
    WHEN 'CSE' THEN 5998575393
    WHEN 'KXI' THEN 1093991383
    WHEN 'IVH' THEN 7406967606
    WHEN 'SFF8' THEN 6561687710
    WHEN 'VDM' THEN 7190195930
  END::bigint,
  CASE na.ticker
    WHEN 'TAS2' THEN 808820666
    WHEN 'ALO' THEN 905000807
    WHEN 'BZW' THEN 2172246981
    WHEN 'WHS' THEN 4382128229
    WHEN 'NZX7' THEN 4937323259
    WHEN 'ZPV7' THEN 1356607511
    WHEN 'BLQ' THEN 3719204681
    WHEN 'LHO' THEN 3487614878
    WHEN 'ZBU' THEN 3329144603
    WHEN 'XDX' THEN 192278668
    WHEN 'GXH' THEN 1920455668
    WHEN 'OCM' THEN 1471110747
    WHEN 'NHX2' THEN 868268880
    WHEN 'FJN' THEN 4118931484
    WHEN 'PYR' THEN 1090655428
    WHEN 'GAK1' THEN 2395014733
    WHEN 'CME' THEN 174568645
    WHEN 'GPU' THEN 2634376182
    WHEN 'DZN9' THEN 2598793443
    WHEN 'DXE' THEN 2151800631
    WHEN 'CSE' THEN 4975065483
    WHEN 'KXI' THEN 3101839934
    WHEN 'IVH' THEN 617199256
    WHEN 'SFF8' THEN 1880841704
    WHEN 'VDM' THEN 1961725972
  END::bigint,
  CASE na.ticker
    WHEN 'TAS2' THEN 1.27903
    WHEN 'ALO' THEN 0.139692
    WHEN 'BZW' THEN 1.660216
    WHEN 'WHS' THEN -0.462704
    WHEN 'NZX7' THEN 0.491725
    WHEN 'ZPV7' THEN 0.470949
    WHEN 'BLQ' THEN 2.460223
    WHEN 'LHO' THEN 0.19706
    WHEN 'ZBU' THEN -0.466654
    WHEN 'XDX' THEN -0.680902
    WHEN 'GXH' THEN -0.582031
    WHEN 'OCM' THEN 0.801446
    WHEN 'NHX2' THEN -0.364332
    WHEN 'FJN' THEN 0.472446
    WHEN 'PYR' THEN 2.395536
    WHEN 'GAK1' THEN 0.832961
    WHEN 'CME' THEN 1.791912
    WHEN 'GPU' THEN 0.909037
    WHEN 'DZN9' THEN -0.120665
    WHEN 'DXE' THEN -0.413679
    WHEN 'CSE' THEN -0.610724
    WHEN 'KXI' THEN 2.336249
    WHEN 'IVH' THEN 1.191828
    WHEN 'SFF8' THEN 1.141156
    WHEN 'VDM' THEN -0.157731
  END::numeric,
  CASE na.ticker
    WHEN 'TAS2' THEN 0.502798
    WHEN 'ALO' THEN 0.812469
    WHEN 'BZW' THEN 0.722057
    WHEN 'WHS' THEN 0.202109
    WHEN 'NZX7' THEN 0.520706
    WHEN 'ZPV7' THEN 0.473361
    WHEN 'BLQ' THEN 0.649381
    WHEN 'LHO' THEN 1.181463
    WHEN 'ZBU' THEN 0.600541
    WHEN 'XDX' THEN 0.69357
    WHEN 'GXH' THEN 0.469908
    WHEN 'OCM' THEN 0.657188
    WHEN 'NHX2' THEN 1.140813
    WHEN 'FJN' THEN 0.906863
    WHEN 'PYR' THEN 0.301308
    WHEN 'GAK1' THEN 0.580387
    WHEN 'CME' THEN 0.799658
    WHEN 'GPU' THEN 0.601812
    WHEN 'DZN9' THEN 0.612142
    WHEN 'DXE' THEN 0.512358
    WHEN 'CSE' THEN 0.431442
    WHEN 'KXI' THEN 0.380915
    WHEN 'IVH' THEN 0.935285
    WHEN 'SFF8' THEN 0.422076
    WHEN 'VDM' THEN 0.325316
  END::numeric,
  CASE na.ticker
    WHEN 'TAS2' THEN 0.753457
    WHEN 'ALO' THEN -1.639533
    WHEN 'BZW' THEN 2.202076
    WHEN 'WHS' THEN 1.215049
    WHEN 'NZX7' THEN -0.799838
    WHEN 'ZPV7' THEN 1.510737
    WHEN 'BLQ' THEN 3.523465
    WHEN 'LHO' THEN 0.829094
    WHEN 'ZBU' THEN -1.123595
    WHEN 'XDX' THEN 0.127215
    WHEN 'GXH' THEN 3.302578
    WHEN 'OCM' THEN 1.425543
    WHEN 'NHX2' THEN 3.00981
    WHEN 'FJN' THEN 2.256706
    WHEN 'PYR' THEN 0.92768
    WHEN 'GAK1' THEN 0.613535
    WHEN 'CME' THEN -0.370129
    WHEN 'GPU' THEN -1.768375
    WHEN 'DZN9' THEN -1.482569
    WHEN 'DXE' THEN -0.264165
    WHEN 'CSE' THEN 2.267403
    WHEN 'KXI' THEN 3.806303
    WHEN 'IVH' THEN 0.653571
    WHEN 'SFF8' THEN -1.759798
    WHEN 'VDM' THEN -1.528413
  END::numeric,
  CASE na.ticker
    WHEN 'TAS2' THEN -0.511535
    WHEN 'ALO' THEN -0.352106
    WHEN 'BZW' THEN -0.734241
    WHEN 'WHS' THEN -0.311888
    WHEN 'NZX7' THEN -0.521288
    WHEN 'ZPV7' THEN -0.732466
    WHEN 'BLQ' THEN -0.492941
    WHEN 'LHO' THEN -0.764761
    WHEN 'ZBU' THEN -0.54195
    WHEN 'XDX' THEN -0.536098
    WHEN 'GXH' THEN -0.824869
    WHEN 'OCM' THEN -0.085482
    WHEN 'NHX2' THEN -0.648139
    WHEN 'FJN' THEN -0.429902
    WHEN 'PYR' THEN -0.630561
    WHEN 'GAK1' THEN -0.832609
    WHEN 'CME' THEN -0.306792
    WHEN 'GPU' THEN -0.887489
    WHEN 'DZN9' THEN -0.718193
    WHEN 'DXE' THEN -0.260935
    WHEN 'CSE' THEN -0.072238
    WHEN 'KXI' THEN -0.364482
    WHEN 'IVH' THEN -0.344121
    WHEN 'SFF8' THEN -0.856664
    WHEN 'VDM' THEN -0.821014
  END::numeric,
  CASE na.ticker
    WHEN 'TAS2' THEN -0.511535
    WHEN 'ALO' THEN -0.352106
    WHEN 'BZW' THEN -0.734241
    WHEN 'WHS' THEN -0.311888
    WHEN 'NZX7' THEN -0.521288
    WHEN 'ZPV7' THEN -0.732466
    WHEN 'BLQ' THEN -0.492941
    WHEN 'LHO' THEN -0.764761
    WHEN 'ZBU' THEN -0.54195
    WHEN 'XDX' THEN -0.536098
    WHEN 'GXH' THEN -0.824869
    WHEN 'OCM' THEN -0.085482
    WHEN 'NHX2' THEN -0.648139
    WHEN 'FJN' THEN -0.429902
    WHEN 'PYR' THEN -0.630561
    WHEN 'GAK1' THEN -0.832609
    WHEN 'CME' THEN -0.306792
    WHEN 'GPU' THEN -0.887489
    WHEN 'DZN9' THEN -0.718193
    WHEN 'DXE' THEN -0.260935
    WHEN 'CSE' THEN -0.072238
    WHEN 'KXI' THEN -0.364482
    WHEN 'IVH' THEN -0.344121
    WHEN 'SFF8' THEN -0.856664
    WHEN 'VDM' THEN -0.821014
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'TAS2' THEN 'Mega Cap'
    WHEN 'ALO' THEN 'Mega Cap'
    WHEN 'BZW' THEN 'Mega Cap'
    WHEN 'WHS' THEN 'Mega Cap'
    WHEN 'NZX7' THEN 'Mega Cap'
    WHEN 'ZPV7' THEN 'Mega Cap'
    WHEN 'BLQ' THEN 'Mega Cap'
    WHEN 'LHO' THEN 'Mega Cap'
    WHEN 'ZBU' THEN 'Mega Cap'
    WHEN 'XDX' THEN 'Mega Cap'
    WHEN 'GXH' THEN 'Mega Cap'
    WHEN 'OCM' THEN 'Mega Cap'
    WHEN 'NHX2' THEN 'Mega Cap'
    WHEN 'FJN' THEN 'Mega Cap'
    WHEN 'PYR' THEN 'Mega Cap'
    WHEN 'GAK1' THEN 'Mega Cap'
    WHEN 'CME' THEN 'Mega Cap'
    WHEN 'GPU' THEN 'Mega Cap'
    WHEN 'DZN9' THEN 'Mega Cap'
    WHEN 'DXE' THEN 'Mega Cap'
    WHEN 'CSE' THEN 'Mega Cap'
    WHEN 'KXI' THEN 'Mega Cap'
    WHEN 'IVH' THEN 'Large Cap'
    WHEN 'SFF8' THEN 'Mega Cap'
    WHEN 'VDM' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'TAS2' THEN 'High'
    WHEN 'ALO' THEN 'High'
    WHEN 'BZW' THEN 'High'
    WHEN 'WHS' THEN 'High'
    WHEN 'NZX7' THEN 'High'
    WHEN 'ZPV7' THEN 'High'
    WHEN 'BLQ' THEN 'High'
    WHEN 'LHO' THEN 'High'
    WHEN 'ZBU' THEN 'High'
    WHEN 'XDX' THEN 'High'
    WHEN 'GXH' THEN 'High'
    WHEN 'OCM' THEN 'High'
    WHEN 'NHX2' THEN 'High'
    WHEN 'FJN' THEN 'High'
    WHEN 'PYR' THEN 'High'
    WHEN 'GAK1' THEN 'High'
    WHEN 'CME' THEN 'High'
    WHEN 'GPU' THEN 'High'
    WHEN 'DZN9' THEN 'High'
    WHEN 'DXE' THEN 'High'
    WHEN 'CSE' THEN 'High'
    WHEN 'KXI' THEN 'High'
    WHEN 'IVH' THEN 'High'
    WHEN 'SFF8' THEN 'High'
    WHEN 'VDM' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.193579", "pipeline_version": "2.1_synthetic", "batch_id": "batch_003"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
