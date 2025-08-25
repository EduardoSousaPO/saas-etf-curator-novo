-- LOTE SINTÉTICO 1: 25 AÇÕES
-- Tickers: WJR, WWK, QLR, LES, PHZ4, MYE, IOV, SZF, SMF, KGU, XSG, FFS6, KPI5, GQB, VYN, BVX, OOB, ABM, ZNU, XUQ, QCH8, GZH, BAJ1, XZP, SEW

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('WJR', 'STOCK', 'WJR Corporation', 'AMEX', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'WJR Corporation operates in the drug manufacturers—general industry within the healthcare sector.'),
('WWK', 'STOCK', 'WWK Corporation', 'NYSE', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'WWK Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('QLR', 'STOCK', 'QLR Corporation', 'NASDAQ', 'Communication Services', 'Entertainment', 'USD', 'QLR Corporation operates in the entertainment industry within the communication services sector.'),
('LES', 'STOCK', 'LES Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'LES Corporation operates in the software—application industry within the technology sector.'),
('PHZ4', 'STOCK', 'PHZ4 Corporation', 'NASDAQ', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'PHZ4 Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('MYE', 'STOCK', 'MYE Corporation', 'AMEX', 'Materials', 'Steel', 'USD', 'MYE Corporation operates in the steel industry within the materials sector.'),
('IOV', 'STOCK', 'IOV Corporation', 'AMEX', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'IOV Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('SZF', 'STOCK', 'SZF Corporation', 'AMEX', 'Real Estate', 'REIT—Office', 'USD', 'SZF Corporation operates in the reit—office industry within the real estate sector.'),
('SMF', 'STOCK', 'SMF Corporation', 'AMEX', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'SMF Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('KGU', 'STOCK', 'KGU Corporation', 'NYSE', 'Consumer Cyclical', 'Internet Retail', 'USD', 'KGU Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('XSG', 'STOCK', 'XSG Corporation', 'AMEX', 'Financial Services', 'Banks—Regional', 'USD', 'XSG Corporation operates in the banks—regional industry within the financial services sector.'),
('FFS6', 'STOCK', 'FFS6 Corporation', 'NASDAQ', 'Materials', 'Chemicals', 'USD', 'FFS6 Corporation operates in the chemicals industry within the materials sector.'),
('KPI5', 'STOCK', 'KPI5 Corporation', 'AMEX', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'KPI5 Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('GQB', 'STOCK', 'GQB Corporation', 'AMEX', 'Consumer Cyclical', 'Internet Retail', 'USD', 'GQB Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('VYN', 'STOCK', 'VYN Corporation', 'NYSE', 'Technology', 'Semiconductors', 'USD', 'VYN Corporation operates in the semiconductors industry within the technology sector.'),
('BVX', 'STOCK', 'BVX Corporation', 'AMEX', 'Industrials', 'Aerospace & Defense', 'USD', 'BVX Corporation operates in the aerospace & defense industry within the industrials sector.'),
('OOB', 'STOCK', 'OOB Corporation', 'NYSE', 'Utilities', 'Utilities—Renewable', 'USD', 'OOB Corporation operates in the utilities—renewable industry within the utilities sector.'),
('ABM', 'STOCK', 'ABM Corporation', 'NASDAQ', 'Industrials', 'Aerospace & Defense', 'USD', 'ABM Corporation operates in the aerospace & defense industry within the industrials sector.'),
('ZNU', 'STOCK', 'ZNU Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'ZNU Corporation operates in the software—application industry within the technology sector.'),
('XUQ', 'STOCK', 'XUQ Corporation', 'AMEX', 'Utilities', 'Utilities—Renewable', 'USD', 'XUQ Corporation operates in the utilities—renewable industry within the utilities sector.'),
('QCH8', 'STOCK', 'QCH8 Corporation', 'NYSE', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'QCH8 Corporation operates in the auto manufacturers industry within the consumer cyclical sector.'),
('GZH', 'STOCK', 'GZH Corporation', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'GZH Corporation operates in the internet content & information industry within the communication services sector.'),
('BAJ1', 'STOCK', 'BAJ1 Corporation', 'NASDAQ', 'Communication Services', 'Entertainment', 'USD', 'BAJ1 Corporation operates in the entertainment industry within the communication services sector.'),
('XZP', 'STOCK', 'XZP Corporation', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'XZP Corporation operates in the auto manufacturers industry within the consumer cyclical sector.'),
('SEW', 'STOCK', 'SEW Corporation', 'AMEX', 'Healthcare', 'Biotechnology', 'USD', 'SEW Corporation operates in the biotechnology industry within the healthcare sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('WJR', 'WWK', 'QLR', 'LES', 'PHZ4', 'MYE', 'IOV', 'SZF', 'SMF', 'KGU', 'XSG', 'FFS6', 'KPI5', 'GQB', 'VYN', 'BVX', 'OOB', 'ABM', 'ZNU', 'XUQ', 'QCH8', 'GZH', 'BAJ1', 'XZP', 'SEW')
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
    WHEN 'WJR' THEN 196.09
    WHEN 'WWK' THEN 353.58
    WHEN 'QLR' THEN 144.26
    WHEN 'LES' THEN 394.55
    WHEN 'PHZ4' THEN 32.8
    WHEN 'MYE' THEN 352.19
    WHEN 'IOV' THEN 376.47
    WHEN 'SZF' THEN 53.67
    WHEN 'SMF' THEN 291.21
    WHEN 'KGU' THEN 178.66
    WHEN 'XSG' THEN 262.05
    WHEN 'FFS6' THEN 323.96
    WHEN 'KPI5' THEN 464.89
    WHEN 'GQB' THEN 104.76
    WHEN 'VYN' THEN 313.35
    WHEN 'BVX' THEN 387.91
    WHEN 'OOB' THEN 243.51
    WHEN 'ABM' THEN 479.74
    WHEN 'ZNU' THEN 323.79
    WHEN 'XUQ' THEN 82.24
    WHEN 'QCH8' THEN 317.9
    WHEN 'GZH' THEN 255.89
    WHEN 'BAJ1' THEN 86.32
    WHEN 'XZP' THEN 155.29
    WHEN 'SEW' THEN 88.35
  END::numeric,
  CASE na.ticker
    WHEN 'WJR' THEN 1232089211523
    WHEN 'WWK' THEN 175096720583
    WHEN 'QLR' THEN 1046881385643
    WHEN 'LES' THEN 3092222492265
    WHEN 'PHZ4' THEN 322308734600
    WHEN 'MYE' THEN 1201718289397
    WHEN 'IOV' THEN 2056947359567
    WHEN 'SZF' THEN 307049126828
    WHEN 'SMF' THEN 2176417326697
    WHEN 'KGU' THEN 1609781483637
    WHEN 'XSG' THEN 2232228068591
    WHEN 'FFS6' THEN 958043479531
    WHEN 'KPI5' THEN 64970901387
    WHEN 'GQB' THEN 323558591523
    WHEN 'VYN' THEN 689387602122
    WHEN 'BVX' THEN 1275069372001
    WHEN 'OOB' THEN 2159550606658
    WHEN 'ABM' THEN 3585641358909
    WHEN 'ZNU' THEN 1941764700808
    WHEN 'XUQ' THEN 611965594711
    WHEN 'QCH8' THEN 2165566432639
    WHEN 'GZH' THEN 1353724268036
    WHEN 'BAJ1' THEN 664548890122
    WHEN 'XZP' THEN 1504569439751
    WHEN 'SEW' THEN 75017693710
  END::numeric,
  CASE na.ticker
    WHEN 'WJR' THEN 6283284265
    WHEN 'WWK' THEN 495211043
    WHEN 'QLR' THEN 7256906874
    WHEN 'LES' THEN 7837339988
    WHEN 'PHZ4' THEN 9826485811
    WHEN 'MYE' THEN 3412130638
    WHEN 'IOV' THEN 5463774961
    WHEN 'SZF' THEN 5721056956
    WHEN 'SMF' THEN 7473703948
    WHEN 'KGU' THEN 9010307196
    WHEN 'XSG' THEN 8518328825
    WHEN 'FFS6' THEN 2957289417
    WHEN 'KPI5' THEN 139755429
    WHEN 'GQB' THEN 3088569984
    WHEN 'VYN' THEN 2200056174
    WHEN 'BVX' THEN 3287023722
    WHEN 'OOB' THEN 8868426786
    WHEN 'ABM' THEN 7474134654
    WHEN 'ZNU' THEN 5996987865
    WHEN 'XUQ' THEN 7441215889
    WHEN 'QCH8' THEN 6812099505
    WHEN 'GZH' THEN 5290258580
    WHEN 'BAJ1' THEN 7698666475
    WHEN 'XZP' THEN 9688772231
    WHEN 'SEW' THEN 849096703
  END::bigint,
  CASE na.ticker
    WHEN 'WJR' THEN 1504908817
    WHEN 'WWK' THEN 2806907544
    WHEN 'QLR' THEN 306501681
    WHEN 'LES' THEN 1436178894
    WHEN 'PHZ4' THEN 4607448881
    WHEN 'MYE' THEN 1507815636
    WHEN 'IOV' THEN 27417178
    WHEN 'SZF' THEN 1579149472
    WHEN 'SMF' THEN 1465335730
    WHEN 'KGU' THEN 1039387762
    WHEN 'XSG' THEN 2282349085
    WHEN 'FFS6' THEN 3109574601
    WHEN 'KPI5' THEN 1053677083
    WHEN 'GQB' THEN 1837601808
    WHEN 'VYN' THEN 188096918
    WHEN 'BVX' THEN 3496992602
    WHEN 'OOB' THEN 4129796239
    WHEN 'ABM' THEN 2754581552
    WHEN 'ZNU' THEN 3790096025
    WHEN 'XUQ' THEN 3507076222
    WHEN 'QCH8' THEN 4789387129
    WHEN 'GZH' THEN 2134600015
    WHEN 'BAJ1' THEN 1547782485
    WHEN 'XZP' THEN 4210373108
    WHEN 'SEW' THEN 911695480
  END::bigint,
  CASE na.ticker
    WHEN 'WJR' THEN 0.619849
    WHEN 'WWK' THEN 0.101353
    WHEN 'QLR' THEN 1.354657
    WHEN 'LES' THEN 2.495419
    WHEN 'PHZ4' THEN -0.458887
    WHEN 'MYE' THEN 1.942849
    WHEN 'IOV' THEN 0.33136
    WHEN 'SZF' THEN 1.507509
    WHEN 'SMF' THEN 0.371861
    WHEN 'KGU' THEN 2.357119
    WHEN 'XSG' THEN 0.159414
    WHEN 'FFS6' THEN 1.244234
    WHEN 'KPI5' THEN 1.801571
    WHEN 'GQB' THEN 1.820097
    WHEN 'VYN' THEN 0.49457
    WHEN 'BVX' THEN -0.645966
    WHEN 'OOB' THEN 1.832323
    WHEN 'ABM' THEN 1.035079
    WHEN 'ZNU' THEN -0.5904
    WHEN 'XUQ' THEN 0.070424
    WHEN 'QCH8' THEN -0.604811
    WHEN 'GZH' THEN 1.278973
    WHEN 'BAJ1' THEN 0.939726
    WHEN 'XZP' THEN 2.253585
    WHEN 'SEW' THEN 1.210829
  END::numeric,
  CASE na.ticker
    WHEN 'WJR' THEN 1.10003
    WHEN 'WWK' THEN 0.591289
    WHEN 'QLR' THEN 0.840134
    WHEN 'LES' THEN 0.634383
    WHEN 'PHZ4' THEN 0.175664
    WHEN 'MYE' THEN 0.786042
    WHEN 'IOV' THEN 1.142064
    WHEN 'SZF' THEN 0.163766
    WHEN 'SMF' THEN 0.436631
    WHEN 'KGU' THEN 0.573162
    WHEN 'XSG' THEN 0.513623
    WHEN 'FFS6' THEN 1.10913
    WHEN 'KPI5' THEN 1.07751
    WHEN 'GQB' THEN 0.388632
    WHEN 'VYN' THEN 0.589669
    WHEN 'BVX' THEN 0.665658
    WHEN 'OOB' THEN 0.845346
    WHEN 'ABM' THEN 1.164092
    WHEN 'ZNU' THEN 0.3493
    WHEN 'XUQ' THEN 1.189356
    WHEN 'QCH8' THEN 0.966628
    WHEN 'GZH' THEN 1.18211
    WHEN 'BAJ1' THEN 0.705879
    WHEN 'XZP' THEN 1.12508
    WHEN 'SEW' THEN 0.506353
  END::numeric,
  CASE na.ticker
    WHEN 'WJR' THEN 3.374537
    WHEN 'WWK' THEN -0.78508
    WHEN 'QLR' THEN -0.052962
    WHEN 'LES' THEN -1.910991
    WHEN 'PHZ4' THEN 1.604996
    WHEN 'MYE' THEN 3.097698
    WHEN 'IOV' THEN -0.773044
    WHEN 'SZF' THEN -1.57622
    WHEN 'SMF' THEN -0.896397
    WHEN 'KGU' THEN 0.479803
    WHEN 'XSG' THEN 3.910144
    WHEN 'FFS6' THEN 1.74161
    WHEN 'KPI5' THEN -1.986674
    WHEN 'GQB' THEN -0.163814
    WHEN 'VYN' THEN 3.778995
    WHEN 'BVX' THEN 2.265504
    WHEN 'OOB' THEN 3.193393
    WHEN 'ABM' THEN -0.033114
    WHEN 'ZNU' THEN 1.686901
    WHEN 'XUQ' THEN -1.509927
    WHEN 'QCH8' THEN 3.241446
    WHEN 'GZH' THEN -1.72316
    WHEN 'BAJ1' THEN 1.48073
    WHEN 'XZP' THEN -0.471551
    WHEN 'SEW' THEN 1.974847
  END::numeric,
  CASE na.ticker
    WHEN 'WJR' THEN -0.52447
    WHEN 'WWK' THEN -0.727244
    WHEN 'QLR' THEN -0.458196
    WHEN 'LES' THEN -0.148416
    WHEN 'PHZ4' THEN -0.158865
    WHEN 'MYE' THEN -0.193889
    WHEN 'IOV' THEN -0.583095
    WHEN 'SZF' THEN -0.744084
    WHEN 'SMF' THEN -0.221199
    WHEN 'KGU' THEN -0.756118
    WHEN 'XSG' THEN -0.325193
    WHEN 'FFS6' THEN -0.427154
    WHEN 'KPI5' THEN -0.463498
    WHEN 'GQB' THEN -0.30203
    WHEN 'VYN' THEN -0.503014
    WHEN 'BVX' THEN -0.786819
    WHEN 'OOB' THEN -0.329659
    WHEN 'ABM' THEN -0.539423
    WHEN 'ZNU' THEN -0.773016
    WHEN 'XUQ' THEN -0.156003
    WHEN 'QCH8' THEN -0.430532
    WHEN 'GZH' THEN -0.133298
    WHEN 'BAJ1' THEN -0.498558
    WHEN 'XZP' THEN -0.674785
    WHEN 'SEW' THEN -0.127969
  END::numeric,
  CASE na.ticker
    WHEN 'WJR' THEN -0.52447
    WHEN 'WWK' THEN -0.727244
    WHEN 'QLR' THEN -0.458196
    WHEN 'LES' THEN -0.148416
    WHEN 'PHZ4' THEN -0.158865
    WHEN 'MYE' THEN -0.193889
    WHEN 'IOV' THEN -0.583095
    WHEN 'SZF' THEN -0.744084
    WHEN 'SMF' THEN -0.221199
    WHEN 'KGU' THEN -0.756118
    WHEN 'XSG' THEN -0.325193
    WHEN 'FFS6' THEN -0.427154
    WHEN 'KPI5' THEN -0.463498
    WHEN 'GQB' THEN -0.30203
    WHEN 'VYN' THEN -0.503014
    WHEN 'BVX' THEN -0.786819
    WHEN 'OOB' THEN -0.329659
    WHEN 'ABM' THEN -0.539423
    WHEN 'ZNU' THEN -0.773016
    WHEN 'XUQ' THEN -0.156003
    WHEN 'QCH8' THEN -0.430532
    WHEN 'GZH' THEN -0.133298
    WHEN 'BAJ1' THEN -0.498558
    WHEN 'XZP' THEN -0.674785
    WHEN 'SEW' THEN -0.127969
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'WJR' THEN 'Mega Cap'
    WHEN 'WWK' THEN 'Large Cap'
    WHEN 'QLR' THEN 'Mega Cap'
    WHEN 'LES' THEN 'Mega Cap'
    WHEN 'PHZ4' THEN 'Mega Cap'
    WHEN 'MYE' THEN 'Mega Cap'
    WHEN 'IOV' THEN 'Mega Cap'
    WHEN 'SZF' THEN 'Mega Cap'
    WHEN 'SMF' THEN 'Mega Cap'
    WHEN 'KGU' THEN 'Mega Cap'
    WHEN 'XSG' THEN 'Mega Cap'
    WHEN 'FFS6' THEN 'Mega Cap'
    WHEN 'KPI5' THEN 'Large Cap'
    WHEN 'GQB' THEN 'Mega Cap'
    WHEN 'VYN' THEN 'Mega Cap'
    WHEN 'BVX' THEN 'Mega Cap'
    WHEN 'OOB' THEN 'Mega Cap'
    WHEN 'ABM' THEN 'Mega Cap'
    WHEN 'ZNU' THEN 'Mega Cap'
    WHEN 'XUQ' THEN 'Mega Cap'
    WHEN 'QCH8' THEN 'Mega Cap'
    WHEN 'GZH' THEN 'Mega Cap'
    WHEN 'BAJ1' THEN 'Mega Cap'
    WHEN 'XZP' THEN 'Mega Cap'
    WHEN 'SEW' THEN 'Large Cap'
  END::text,
  CASE na.ticker
    WHEN 'WJR' THEN 'High'
    WHEN 'WWK' THEN 'High'
    WHEN 'QLR' THEN 'High'
    WHEN 'LES' THEN 'High'
    WHEN 'PHZ4' THEN 'High'
    WHEN 'MYE' THEN 'High'
    WHEN 'IOV' THEN 'High'
    WHEN 'SZF' THEN 'High'
    WHEN 'SMF' THEN 'High'
    WHEN 'KGU' THEN 'High'
    WHEN 'XSG' THEN 'High'
    WHEN 'FFS6' THEN 'High'
    WHEN 'KPI5' THEN 'High'
    WHEN 'GQB' THEN 'High'
    WHEN 'VYN' THEN 'High'
    WHEN 'BVX' THEN 'High'
    WHEN 'OOB' THEN 'High'
    WHEN 'ABM' THEN 'High'
    WHEN 'ZNU' THEN 'High'
    WHEN 'XUQ' THEN 'High'
    WHEN 'QCH8' THEN 'High'
    WHEN 'GZH' THEN 'High'
    WHEN 'BAJ1' THEN 'High'
    WHEN 'XZP' THEN 'High'
    WHEN 'SEW' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.191943", "pipeline_version": "2.1_synthetic", "batch_id": "batch_001"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
