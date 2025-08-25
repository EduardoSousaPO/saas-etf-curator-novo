-- LOTE SINTÉTICO 4: 25 AÇÕES
-- Tickers: FLQ, KGP, YMU, VEV, VGL, QVS1, GSE, OOM, FVM, PEL8, CZE, JPI, SFU, VQM, ELE, LQO, LUX6, EBF, RXI1, TXV9, VRO1, EHR, AYW, TUD8, DXY

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('FLQ', 'STOCK', 'FLQ Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'FLQ Corporation operates in the software—application industry within the technology sector.'),
('KGP', 'STOCK', 'KGP Corporation', 'AMEX', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'KGP Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('YMU', 'STOCK', 'YMU Corporation', 'AMEX', 'Consumer Cyclical', 'Internet Retail', 'USD', 'YMU Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('VEV', 'STOCK', 'VEV Corporation', 'AMEX', 'Materials', 'Steel', 'USD', 'VEV Corporation operates in the steel industry within the materials sector.'),
('VGL', 'STOCK', 'VGL Corporation', 'AMEX', 'Financial Services', 'Banks—Regional', 'USD', 'VGL Corporation operates in the banks—regional industry within the financial services sector.'),
('QVS1', 'STOCK', 'QVS1 Corporation', 'NASDAQ', 'Real Estate', 'REIT—Office', 'USD', 'QVS1 Corporation operates in the reit—office industry within the real estate sector.'),
('GSE', 'STOCK', 'GSE Corporation', 'AMEX', 'Consumer Cyclical', 'Internet Retail', 'USD', 'GSE Corporation operates in the internet retail industry within the consumer cyclical sector.'),
('OOM', 'STOCK', 'OOM Corporation', 'AMEX', 'Financial Services', 'Banks—Regional', 'USD', 'OOM Corporation operates in the banks—regional industry within the financial services sector.'),
('FVM', 'STOCK', 'FVM Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'FVM Corporation operates in the oil & gas e&p industry within the energy sector.'),
('PEL8', 'STOCK', 'PEL8 Corporation', 'AMEX', 'Materials', 'Steel', 'USD', 'PEL8 Corporation operates in the steel industry within the materials sector.'),
('CZE', 'STOCK', 'CZE Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'CZE Corporation operates in the insurance—life industry within the financial services sector.'),
('JPI', 'STOCK', 'JPI Corporation', 'AMEX', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'JPI Corporation operates in the drug manufacturers—general industry within the healthcare sector.'),
('SFU', 'STOCK', 'SFU Corporation', 'AMEX', 'Real Estate', 'REIT—Office', 'USD', 'SFU Corporation operates in the reit—office industry within the real estate sector.'),
('VQM', 'STOCK', 'VQM Corporation', 'AMEX', 'Technology', 'Semiconductors', 'USD', 'VQM Corporation operates in the semiconductors industry within the technology sector.'),
('ELE', 'STOCK', 'ELE Corporation', 'NYSE', 'Healthcare', 'Biotechnology', 'USD', 'ELE Corporation operates in the biotechnology industry within the healthcare sector.'),
('LQO', 'STOCK', 'LQO Corporation', 'NYSE', 'Materials', 'Chemicals', 'USD', 'LQO Corporation operates in the chemicals industry within the materials sector.'),
('LUX6', 'STOCK', 'LUX6 Corporation', 'NYSE', 'Financial Services', 'Insurance—Life', 'USD', 'LUX6 Corporation operates in the insurance—life industry within the financial services sector.'),
('EBF', 'STOCK', 'EBF Corporation', 'AMEX', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'EBF Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('RXI1', 'STOCK', 'RXI1 Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'RXI1 Corporation operates in the software—application industry within the technology sector.'),
('TXV9', 'STOCK', 'TXV9 Corporation', 'NYSE', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'TXV9 Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('VRO1', 'STOCK', 'VRO1 Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'VRO1 Corporation operates in the insurance—life industry within the financial services sector.'),
('EHR', 'STOCK', 'EHR Corporation', 'NYSE', 'Technology', 'Software—Application', 'USD', 'EHR Corporation operates in the software—application industry within the technology sector.'),
('AYW', 'STOCK', 'AYW Corporation', 'AMEX', 'Industrials', 'Aerospace & Defense', 'USD', 'AYW Corporation operates in the aerospace & defense industry within the industrials sector.'),
('TUD8', 'STOCK', 'TUD8 Corporation', 'AMEX', 'Financial Services', 'Banks—Regional', 'USD', 'TUD8 Corporation operates in the banks—regional industry within the financial services sector.'),
('DXY', 'STOCK', 'DXY Corporation', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'DXY Corporation operates in the internet content & information industry within the communication services sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('FLQ', 'KGP', 'YMU', 'VEV', 'VGL', 'QVS1', 'GSE', 'OOM', 'FVM', 'PEL8', 'CZE', 'JPI', 'SFU', 'VQM', 'ELE', 'LQO', 'LUX6', 'EBF', 'RXI1', 'TXV9', 'VRO1', 'EHR', 'AYW', 'TUD8', 'DXY')
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
    WHEN 'FLQ' THEN 423.2
    WHEN 'KGP' THEN 246.64
    WHEN 'YMU' THEN 114.0
    WHEN 'VEV' THEN 140.79
    WHEN 'VGL' THEN 210.28
    WHEN 'QVS1' THEN 426.43
    WHEN 'GSE' THEN 123.86
    WHEN 'OOM' THEN 325.02
    WHEN 'FVM' THEN 113.75
    WHEN 'PEL8' THEN 72.24
    WHEN 'CZE' THEN 432.98
    WHEN 'JPI' THEN 13.14
    WHEN 'SFU' THEN 124.58
    WHEN 'VQM' THEN 164.26
    WHEN 'ELE' THEN 47.54
    WHEN 'LQO' THEN 350.12
    WHEN 'LUX6' THEN 200.82
    WHEN 'EBF' THEN 81.0
    WHEN 'RXI1' THEN 156.26
    WHEN 'TXV9' THEN 465.55
    WHEN 'VRO1' THEN 132.5
    WHEN 'EHR' THEN 335.68
    WHEN 'AYW' THEN 209.1
    WHEN 'TUD8' THEN 6.94
    WHEN 'DXY' THEN 481.86
  END::numeric,
  CASE na.ticker
    WHEN 'FLQ' THEN 3531568043235
    WHEN 'KGP' THEN 409753276192
    WHEN 'YMU' THEN 989355483522
    WHEN 'VEV' THEN 578078714923
    WHEN 'VGL' THEN 1217365010744
    WHEN 'QVS1' THEN 1369383884393
    WHEN 'GSE' THEN 226903771689
    WHEN 'OOM' THEN 2638101837963
    WHEN 'FVM' THEN 397723937861
    WHEN 'PEL8' THEN 87385284969
    WHEN 'CZE' THEN 2530839659470
    WHEN 'JPI' THEN 69132113245
    WHEN 'SFU' THEN 504867692582
    WHEN 'VQM' THEN 179554371959
    WHEN 'ELE' THEN 321661046724
    WHEN 'LQO' THEN 3195338160825
    WHEN 'LUX6' THEN 880261550782
    WHEN 'EBF' THEN 291749029794
    WHEN 'RXI1' THEN 1036976642570
    WHEN 'TXV9' THEN 1091890693914
    WHEN 'VRO1' THEN 397489228015
    WHEN 'EHR' THEN 3332108489965
    WHEN 'AYW' THEN 885360897569
    WHEN 'TUD8' THEN 734872984
    WHEN 'DXY' THEN 2206610728591
  END::numeric,
  CASE na.ticker
    WHEN 'FLQ' THEN 8344915036
    WHEN 'KGP' THEN 1661341535
    WHEN 'YMU' THEN 8678556873
    WHEN 'VEV' THEN 4105964308
    WHEN 'VGL' THEN 5789257232
    WHEN 'QVS1' THEN 3211274733
    WHEN 'GSE' THEN 1831937443
    WHEN 'OOM' THEN 8116736933
    WHEN 'FVM' THEN 3496474179
    WHEN 'PEL8' THEN 1209652339
    WHEN 'CZE' THEN 5845165272
    WHEN 'JPI' THEN 5261195833
    WHEN 'SFU' THEN 4052558136
    WHEN 'VQM' THEN 1093110751
    WHEN 'ELE' THEN 6766113730
    WHEN 'LQO' THEN 9126408548
    WHEN 'LUX6' THEN 4383336076
    WHEN 'EBF' THEN 3601839874
    WHEN 'RXI1' THEN 6636225794
    WHEN 'TXV9' THEN 2345377927
    WHEN 'VRO1' THEN 2999918702
    WHEN 'EHR' THEN 9926443309
    WHEN 'AYW' THEN 4234150634
    WHEN 'TUD8' THEN 105889479
    WHEN 'DXY' THEN 4579360662
  END::bigint,
  CASE na.ticker
    WHEN 'FLQ' THEN 725463359
    WHEN 'KGP' THEN 1487775706
    WHEN 'YMU' THEN 2098670284
    WHEN 'VEV' THEN 2218606621
    WHEN 'VGL' THEN 3964681702
    WHEN 'QVS1' THEN 1735468407
    WHEN 'GSE' THEN 169268187
    WHEN 'OOM' THEN 3459674794
    WHEN 'FVM' THEN 2129864419
    WHEN 'PEL8' THEN 1584972502
    WHEN 'CZE' THEN 4493387813
    WHEN 'JPI' THEN 3385486625
    WHEN 'SFU' THEN 863658224
    WHEN 'VQM' THEN 4708182934
    WHEN 'ELE' THEN 4067904816
    WHEN 'LQO' THEN 2132861057
    WHEN 'LUX6' THEN 3685343547
    WHEN 'EBF' THEN 3709242586
    WHEN 'RXI1' THEN 395723858
    WHEN 'TXV9' THEN 2115819756
    WHEN 'VRO1' THEN 3742179040
    WHEN 'EHR' THEN 3196568229
    WHEN 'AYW' THEN 3796873737
    WHEN 'TUD8' THEN 2169074
    WHEN 'DXY' THEN 2407559138
  END::bigint,
  CASE na.ticker
    WHEN 'FLQ' THEN 1.383767
    WHEN 'KGP' THEN 2.173897
    WHEN 'YMU' THEN 0.387855
    WHEN 'VEV' THEN -0.403617
    WHEN 'VGL' THEN -0.601294
    WHEN 'QVS1' THEN 2.119138
    WHEN 'GSE' THEN 0.695236
    WHEN 'OOM' THEN -0.706838
    WHEN 'FVM' THEN -0.555349
    WHEN 'PEL8' THEN 1.17767
    WHEN 'CZE' THEN 0.14599
    WHEN 'JPI' THEN -0.694986
    WHEN 'SFU' THEN 0.74854
    WHEN 'VQM' THEN 0.475285
    WHEN 'ELE' THEN 1.21055
    WHEN 'LQO' THEN 0.057738
    WHEN 'LUX6' THEN 2.362513
    WHEN 'EBF' THEN 1.25275
    WHEN 'RXI1' THEN 0.04161
    WHEN 'TXV9' THEN 1.957711
    WHEN 'VRO1' THEN -0.19255
    WHEN 'EHR' THEN 1.252985
    WHEN 'AYW' THEN 1.594044
    WHEN 'TUD8' THEN -0.085602
    WHEN 'DXY' THEN 0.898254
  END::numeric,
  CASE na.ticker
    WHEN 'FLQ' THEN 0.793685
    WHEN 'KGP' THEN 1.081516
    WHEN 'YMU' THEN 0.994152
    WHEN 'VEV' THEN 0.932225
    WHEN 'VGL' THEN 0.150509
    WHEN 'QVS1' THEN 1.009685
    WHEN 'GSE' THEN 0.953854
    WHEN 'OOM' THEN 0.645787
    WHEN 'FVM' THEN 0.247482
    WHEN 'PEL8' THEN 0.410074
    WHEN 'CZE' THEN 0.772719
    WHEN 'JPI' THEN 0.534967
    WHEN 'SFU' THEN 0.350112
    WHEN 'VQM' THEN 0.803415
    WHEN 'ELE' THEN 0.231336
    WHEN 'LQO' THEN 1.150858
    WHEN 'LUX6' THEN 0.229853
    WHEN 'EBF' THEN 0.750903
    WHEN 'RXI1' THEN 0.289274
    WHEN 'TXV9' THEN 0.711657
    WHEN 'VRO1' THEN 0.529945
    WHEN 'EHR' THEN 0.696501
    WHEN 'AYW' THEN 0.535381
    WHEN 'TUD8' THEN 1.092928
    WHEN 'DXY' THEN 0.359862
  END::numeric,
  CASE na.ticker
    WHEN 'FLQ' THEN 3.816432
    WHEN 'KGP' THEN 0.458155
    WHEN 'YMU' THEN 3.77747
    WHEN 'VEV' THEN 2.421185
    WHEN 'VGL' THEN 0.353363
    WHEN 'QVS1' THEN 2.107856
    WHEN 'GSE' THEN 0.919395
    WHEN 'OOM' THEN -1.160402
    WHEN 'FVM' THEN 3.973583
    WHEN 'PEL8' THEN -1.794523
    WHEN 'CZE' THEN 0.364368
    WHEN 'JPI' THEN 3.653971
    WHEN 'SFU' THEN 0.435752
    WHEN 'VQM' THEN 0.949667
    WHEN 'ELE' THEN -1.679714
    WHEN 'LQO' THEN -0.271887
    WHEN 'LUX6' THEN -0.035823
    WHEN 'EBF' THEN 3.02724
    WHEN 'RXI1' THEN 1.497239
    WHEN 'TXV9' THEN -1.735956
    WHEN 'VRO1' THEN 3.489021
    WHEN 'EHR' THEN 1.525001
    WHEN 'AYW' THEN 3.70188
    WHEN 'TUD8' THEN 0.933267
    WHEN 'DXY' THEN 1.712931
  END::numeric,
  CASE na.ticker
    WHEN 'FLQ' THEN -0.884784
    WHEN 'KGP' THEN -0.497427
    WHEN 'YMU' THEN -0.337179
    WHEN 'VEV' THEN -0.827026
    WHEN 'VGL' THEN -0.262064
    WHEN 'QVS1' THEN -0.148511
    WHEN 'GSE' THEN -0.49451
    WHEN 'OOM' THEN -0.331599
    WHEN 'FVM' THEN -0.098749
    WHEN 'PEL8' THEN -0.340335
    WHEN 'CZE' THEN -0.137204
    WHEN 'JPI' THEN -0.170535
    WHEN 'SFU' THEN -0.320392
    WHEN 'VQM' THEN -0.369137
    WHEN 'ELE' THEN -0.71402
    WHEN 'LQO' THEN -0.841736
    WHEN 'LUX6' THEN -0.197123
    WHEN 'EBF' THEN -0.811225
    WHEN 'RXI1' THEN -0.894649
    WHEN 'TXV9' THEN -0.356027
    WHEN 'VRO1' THEN -0.493499
    WHEN 'EHR' THEN -0.081215
    WHEN 'AYW' THEN -0.231156
    WHEN 'TUD8' THEN -0.263207
    WHEN 'DXY' THEN -0.214351
  END::numeric,
  CASE na.ticker
    WHEN 'FLQ' THEN -0.884784
    WHEN 'KGP' THEN -0.497427
    WHEN 'YMU' THEN -0.337179
    WHEN 'VEV' THEN -0.827026
    WHEN 'VGL' THEN -0.262064
    WHEN 'QVS1' THEN -0.148511
    WHEN 'GSE' THEN -0.49451
    WHEN 'OOM' THEN -0.331599
    WHEN 'FVM' THEN -0.098749
    WHEN 'PEL8' THEN -0.340335
    WHEN 'CZE' THEN -0.137204
    WHEN 'JPI' THEN -0.170535
    WHEN 'SFU' THEN -0.320392
    WHEN 'VQM' THEN -0.369137
    WHEN 'ELE' THEN -0.71402
    WHEN 'LQO' THEN -0.841736
    WHEN 'LUX6' THEN -0.197123
    WHEN 'EBF' THEN -0.811225
    WHEN 'RXI1' THEN -0.894649
    WHEN 'TXV9' THEN -0.356027
    WHEN 'VRO1' THEN -0.493499
    WHEN 'EHR' THEN -0.081215
    WHEN 'AYW' THEN -0.231156
    WHEN 'TUD8' THEN -0.263207
    WHEN 'DXY' THEN -0.214351
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'FLQ' THEN 'Mega Cap'
    WHEN 'KGP' THEN 'Mega Cap'
    WHEN 'YMU' THEN 'Mega Cap'
    WHEN 'VEV' THEN 'Mega Cap'
    WHEN 'VGL' THEN 'Mega Cap'
    WHEN 'QVS1' THEN 'Mega Cap'
    WHEN 'GSE' THEN 'Mega Cap'
    WHEN 'OOM' THEN 'Mega Cap'
    WHEN 'FVM' THEN 'Mega Cap'
    WHEN 'PEL8' THEN 'Large Cap'
    WHEN 'CZE' THEN 'Mega Cap'
    WHEN 'JPI' THEN 'Large Cap'
    WHEN 'SFU' THEN 'Mega Cap'
    WHEN 'VQM' THEN 'Large Cap'
    WHEN 'ELE' THEN 'Mega Cap'
    WHEN 'LQO' THEN 'Mega Cap'
    WHEN 'LUX6' THEN 'Mega Cap'
    WHEN 'EBF' THEN 'Mega Cap'
    WHEN 'RXI1' THEN 'Mega Cap'
    WHEN 'TXV9' THEN 'Mega Cap'
    WHEN 'VRO1' THEN 'Mega Cap'
    WHEN 'EHR' THEN 'Mega Cap'
    WHEN 'AYW' THEN 'Mega Cap'
    WHEN 'TUD8' THEN 'Small Cap'
    WHEN 'DXY' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'FLQ' THEN 'High'
    WHEN 'KGP' THEN 'High'
    WHEN 'YMU' THEN 'High'
    WHEN 'VEV' THEN 'High'
    WHEN 'VGL' THEN 'High'
    WHEN 'QVS1' THEN 'High'
    WHEN 'GSE' THEN 'High'
    WHEN 'OOM' THEN 'High'
    WHEN 'FVM' THEN 'High'
    WHEN 'PEL8' THEN 'High'
    WHEN 'CZE' THEN 'High'
    WHEN 'JPI' THEN 'High'
    WHEN 'SFU' THEN 'High'
    WHEN 'VQM' THEN 'High'
    WHEN 'ELE' THEN 'High'
    WHEN 'LQO' THEN 'High'
    WHEN 'LUX6' THEN 'High'
    WHEN 'EBF' THEN 'High'
    WHEN 'RXI1' THEN 'High'
    WHEN 'TXV9' THEN 'High'
    WHEN 'VRO1' THEN 'High'
    WHEN 'EHR' THEN 'High'
    WHEN 'AYW' THEN 'High'
    WHEN 'TUD8' THEN 'Medium'
    WHEN 'DXY' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.194239", "pipeline_version": "2.1_synthetic", "batch_id": "batch_004"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
