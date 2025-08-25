-- LOTE SINTÉTICO 7: 25 AÇÕES
-- Tickers: LEO, YTX, PTJ, PAH, HLV, VDZ, BZD, SXN, HXY, VLA, FEL, QVP, EGU4, XSU, ACW, XHI9, VBK, KUM, XLV5, ZOX, SXH, FVB9, RUU, LUM, SZE6

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('LEO', 'STOCK', 'LEO Corporation', 'NYSE', 'Technology', 'Consumer Electronics', 'USD', 'LEO Corporation operates in the consumer electronics industry within the technology sector.'),
('YTX', 'STOCK', 'YTX Corporation', 'NASDAQ', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'YTX Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('PTJ', 'STOCK', 'PTJ Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'PTJ Corporation operates in the utilities—renewable industry within the utilities sector.'),
('PAH', 'STOCK', 'PAH Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'PAH Corporation operates in the oil & gas e&p industry within the energy sector.'),
('HLV', 'STOCK', 'HLV Corporation', 'NYSE', 'Consumer Defensive', 'Grocery Stores', 'USD', 'HLV Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('VDZ', 'STOCK', 'VDZ Corporation', 'NYSE', 'Healthcare', 'Biotechnology', 'USD', 'VDZ Corporation operates in the biotechnology industry within the healthcare sector.'),
('BZD', 'STOCK', 'BZD Corporation', 'AMEX', 'Financial Services', 'Insurance—Life', 'USD', 'BZD Corporation operates in the insurance—life industry within the financial services sector.'),
('SXN', 'STOCK', 'SXN Corporation', 'NASDAQ', 'Materials', 'Steel', 'USD', 'SXN Corporation operates in the steel industry within the materials sector.'),
('HXY', 'STOCK', 'HXY Corporation', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'HXY Corporation operates in the internet content & information industry within the communication services sector.'),
('VLA', 'STOCK', 'VLA Corporation', 'NYSE', 'Financial Services', 'Insurance—Life', 'USD', 'VLA Corporation operates in the insurance—life industry within the financial services sector.'),
('FEL', 'STOCK', 'FEL Corporation', 'AMEX', 'Utilities', 'Utilities—Renewable', 'USD', 'FEL Corporation operates in the utilities—renewable industry within the utilities sector.'),
('QVP', 'STOCK', 'QVP Corporation', 'NASDAQ', 'Materials', 'Chemicals', 'USD', 'QVP Corporation operates in the chemicals industry within the materials sector.'),
('EGU4', 'STOCK', 'EGU4 Corporation', 'NASDAQ', 'Consumer Defensive', 'Grocery Stores', 'USD', 'EGU4 Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('XSU', 'STOCK', 'XSU Corporation', 'NASDAQ', 'Technology', 'Semiconductors', 'USD', 'XSU Corporation operates in the semiconductors industry within the technology sector.'),
('ACW', 'STOCK', 'ACW Corporation', 'NASDAQ', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'ACW Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('XHI9', 'STOCK', 'XHI9 Corporation', 'NYSE', 'Communication Services', 'Internet Content & Information', 'USD', 'XHI9 Corporation operates in the internet content & information industry within the communication services sector.'),
('VBK', 'STOCK', 'VBK Corporation', 'NYSE', 'Industrials', 'Railroads', 'USD', 'VBK Corporation operates in the railroads industry within the industrials sector.'),
('KUM', 'STOCK', 'KUM Corporation', 'NYSE', 'Communication Services', 'Internet Content & Information', 'USD', 'KUM Corporation operates in the internet content & information industry within the communication services sector.'),
('XLV5', 'STOCK', 'XLV5 Corporation', 'NYSE', 'Financial Services', 'Insurance—Life', 'USD', 'XLV5 Corporation operates in the insurance—life industry within the financial services sector.'),
('ZOX', 'STOCK', 'ZOX Corporation', 'NASDAQ', 'Communication Services', 'Internet Content & Information', 'USD', 'ZOX Corporation operates in the internet content & information industry within the communication services sector.'),
('SXH', 'STOCK', 'SXH Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'SXH Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('FVB9', 'STOCK', 'FVB9 Corporation', 'AMEX', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'FVB9 Corporation operates in the auto manufacturers industry within the consumer cyclical sector.'),
('RUU', 'STOCK', 'RUU Corporation', 'AMEX', 'Technology', 'Consumer Electronics', 'USD', 'RUU Corporation operates in the consumer electronics industry within the technology sector.'),
('LUM', 'STOCK', 'LUM Corporation', 'AMEX', 'Materials', 'Chemicals', 'USD', 'LUM Corporation operates in the chemicals industry within the materials sector.'),
('SZE6', 'STOCK', 'SZE6 Corporation', 'AMEX', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'SZE6 Corporation operates in the drug manufacturers—general industry within the healthcare sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('LEO', 'YTX', 'PTJ', 'PAH', 'HLV', 'VDZ', 'BZD', 'SXN', 'HXY', 'VLA', 'FEL', 'QVP', 'EGU4', 'XSU', 'ACW', 'XHI9', 'VBK', 'KUM', 'XLV5', 'ZOX', 'SXH', 'FVB9', 'RUU', 'LUM', 'SZE6')
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
    WHEN 'LEO' THEN 169.05
    WHEN 'YTX' THEN 296.87
    WHEN 'PTJ' THEN 184.3
    WHEN 'PAH' THEN 208.4
    WHEN 'HLV' THEN 83.66
    WHEN 'VDZ' THEN 184.15
    WHEN 'BZD' THEN 440.39
    WHEN 'SXN' THEN 272.83
    WHEN 'HXY' THEN 447.82
    WHEN 'VLA' THEN 226.28
    WHEN 'FEL' THEN 238.32
    WHEN 'QVP' THEN 133.67
    WHEN 'EGU4' THEN 22.91
    WHEN 'XSU' THEN 224.62
    WHEN 'ACW' THEN 457.55
    WHEN 'XHI9' THEN 124.98
    WHEN 'VBK' THEN 248.43
    WHEN 'KUM' THEN 452.23
    WHEN 'XLV5' THEN 470.18
    WHEN 'ZOX' THEN 101.87
    WHEN 'SXH' THEN 20.46
    WHEN 'FVB9' THEN 388.87
    WHEN 'RUU' THEN 473.53
    WHEN 'LUM' THEN 379.43
    WHEN 'SZE6' THEN 223.75
  END::numeric,
  CASE na.ticker
    WHEN 'LEO' THEN 1173826014611
    WHEN 'YTX' THEN 1142928045501
    WHEN 'PTJ' THEN 535960806754
    WHEN 'PAH' THEN 310210673576
    WHEN 'HLV' THEN 378611485427
    WHEN 'VDZ' THEN 643355166316
    WHEN 'BZD' THEN 4201688965096
    WHEN 'SXN' THEN 1341426547237
    WHEN 'HXY' THEN 3631115269968
    WHEN 'VLA' THEN 2070647866618
    WHEN 'FEL' THEN 1448257043844
    WHEN 'QVP' THEN 422614791635
    WHEN 'EGU4' THEN 136854126195
    WHEN 'XSU' THEN 161357355180
    WHEN 'ACW' THEN 1570350726015
    WHEN 'XHI9' THEN 441955894865
    WHEN 'VBK' THEN 1474828270510
    WHEN 'KUM' THEN 85201115600
    WHEN 'XLV5' THEN 3668819411534
    WHEN 'ZOX' THEN 75312652056
    WHEN 'SXH' THEN 163717203441
    WHEN 'FVB9' THEN 2883498334674
    WHEN 'RUU' THEN 2732133441326
    WHEN 'LUM' THEN 3086568781754
    WHEN 'SZE6' THEN 438934570088
  END::numeric,
  CASE na.ticker
    WHEN 'LEO' THEN 6943661725
    WHEN 'YTX' THEN 3849927731
    WHEN 'PTJ' THEN 2908089022
    WHEN 'PAH' THEN 1488534902
    WHEN 'HLV' THEN 4525597483
    WHEN 'VDZ' THEN 3493647387
    WHEN 'BZD' THEN 9540836452
    WHEN 'SXN' THEN 4916712045
    WHEN 'HXY' THEN 8108425863
    WHEN 'VLA' THEN 9150821401
    WHEN 'FEL' THEN 6076942950
    WHEN 'QVP' THEN 3161627827
    WHEN 'EGU4' THEN 5973554177
    WHEN 'XSU' THEN 718357026
    WHEN 'ACW' THEN 3432085512
    WHEN 'XHI9' THEN 3536212953
    WHEN 'VBK' THEN 5936594898
    WHEN 'KUM' THEN 188402175
    WHEN 'XLV5' THEN 7803010361
    WHEN 'ZOX' THEN 739301581
    WHEN 'SXH' THEN 8001818350
    WHEN 'FVB9' THEN 7415070164
    WHEN 'RUU' THEN 5769715628
    WHEN 'LUM' THEN 8134751553
    WHEN 'SZE6' THEN 1961718749
  END::bigint,
  CASE na.ticker
    WHEN 'LEO' THEN 1128421588
    WHEN 'YTX' THEN 1320778483
    WHEN 'PTJ' THEN 3186398117
    WHEN 'PAH' THEN 3466528548
    WHEN 'HLV' THEN 640037189
    WHEN 'VDZ' THEN 3539650764
    WHEN 'BZD' THEN 1284740764
    WHEN 'SXN' THEN 392689713
    WHEN 'HXY' THEN 3894527311
    WHEN 'VLA' THEN 3398535631
    WHEN 'FEL' THEN 1603266765
    WHEN 'QVP' THEN 3239207548
    WHEN 'EGU4' THEN 4866361008
    WHEN 'XSU' THEN 4772019162
    WHEN 'ACW' THEN 4623538416
    WHEN 'XHI9' THEN 874158101
    WHEN 'VBK' THEN 28751299
    WHEN 'KUM' THEN 1634358199
    WHEN 'XLV5' THEN 40357809
    WHEN 'ZOX' THEN 452212909
    WHEN 'SXH' THEN 521115298
    WHEN 'FVB9' THEN 959272033
    WHEN 'RUU' THEN 2006835107
    WHEN 'LUM' THEN 2912068810
    WHEN 'SZE6' THEN 2429808473
  END::bigint,
  CASE na.ticker
    WHEN 'LEO' THEN 0.434852
    WHEN 'YTX' THEN 1.385766
    WHEN 'PTJ' THEN 1.089736
    WHEN 'PAH' THEN -0.484786
    WHEN 'HLV' THEN 2.481623
    WHEN 'VDZ' THEN 0.30098
    WHEN 'BZD' THEN 1.550261
    WHEN 'SXN' THEN 1.148291
    WHEN 'HXY' THEN 0.113504
    WHEN 'VLA' THEN -0.173524
    WHEN 'FEL' THEN 1.484278
    WHEN 'QVP' THEN 2.026777
    WHEN 'EGU4' THEN 1.511639
    WHEN 'XSU' THEN 1.738829
    WHEN 'ACW' THEN -0.493253
    WHEN 'XHI9' THEN -0.76151
    WHEN 'VBK' THEN 0.398872
    WHEN 'KUM' THEN 0.38388
    WHEN 'XLV5' THEN 0.798427
    WHEN 'ZOX' THEN 0.479459
    WHEN 'SXH' THEN -0.784932
    WHEN 'FVB9' THEN 0.852736
    WHEN 'RUU' THEN 0.613126
    WHEN 'LUM' THEN -0.401716
    WHEN 'SZE6' THEN 0.088646
  END::numeric,
  CASE na.ticker
    WHEN 'LEO' THEN 1.02245
    WHEN 'YTX' THEN 0.979636
    WHEN 'PTJ' THEN 1.102011
    WHEN 'PAH' THEN 0.150377
    WHEN 'HLV' THEN 0.465064
    WHEN 'VDZ' THEN 0.701315
    WHEN 'BZD' THEN 0.208511
    WHEN 'SXN' THEN 1.000254
    WHEN 'HXY' THEN 0.349892
    WHEN 'VLA' THEN 0.489863
    WHEN 'FEL' THEN 1.100374
    WHEN 'QVP' THEN 0.388385
    WHEN 'EGU4' THEN 0.580151
    WHEN 'XSU' THEN 0.992277
    WHEN 'ACW' THEN 0.824879
    WHEN 'XHI9' THEN 0.974393
    WHEN 'VBK' THEN 0.260479
    WHEN 'KUM' THEN 1.087096
    WHEN 'XLV5' THEN 1.042078
    WHEN 'ZOX' THEN 0.522467
    WHEN 'SXH' THEN 0.540636
    WHEN 'FVB9' THEN 1.097917
    WHEN 'RUU' THEN 0.517267
    WHEN 'LUM' THEN 0.2578
    WHEN 'SZE6' THEN 0.928068
  END::numeric,
  CASE na.ticker
    WHEN 'LEO' THEN 0.048289
    WHEN 'YTX' THEN 3.687001
    WHEN 'PTJ' THEN -1.274354
    WHEN 'PAH' THEN 1.178407
    WHEN 'HLV' THEN 2.158333
    WHEN 'VDZ' THEN -0.553535
    WHEN 'BZD' THEN 0.523617
    WHEN 'SXN' THEN 0.18895
    WHEN 'HXY' THEN 1.284729
    WHEN 'VLA' THEN 0.806862
    WHEN 'FEL' THEN -0.794663
    WHEN 'QVP' THEN 2.970602
    WHEN 'EGU4' THEN 0.282569
    WHEN 'XSU' THEN 1.444375
    WHEN 'ACW' THEN 2.899151
    WHEN 'XHI9' THEN -0.628264
    WHEN 'VBK' THEN -0.54282
    WHEN 'KUM' THEN 2.49946
    WHEN 'XLV5' THEN 3.794909
    WHEN 'ZOX' THEN 1.947608
    WHEN 'SXH' THEN 2.819603
    WHEN 'FVB9' THEN 2.758175
    WHEN 'RUU' THEN 2.903754
    WHEN 'LUM' THEN 1.994318
    WHEN 'SZE6' THEN -0.27734
  END::numeric,
  CASE na.ticker
    WHEN 'LEO' THEN -0.327617
    WHEN 'YTX' THEN -0.28035
    WHEN 'PTJ' THEN -0.332457
    WHEN 'PAH' THEN -0.680905
    WHEN 'HLV' THEN -0.612483
    WHEN 'VDZ' THEN -0.836773
    WHEN 'BZD' THEN -0.416272
    WHEN 'SXN' THEN -0.378078
    WHEN 'HXY' THEN -0.065445
    WHEN 'VLA' THEN -0.82797
    WHEN 'FEL' THEN -0.152112
    WHEN 'QVP' THEN -0.774685
    WHEN 'EGU4' THEN -0.216605
    WHEN 'XSU' THEN -0.851217
    WHEN 'ACW' THEN -0.575342
    WHEN 'XHI9' THEN -0.541303
    WHEN 'VBK' THEN -0.369702
    WHEN 'KUM' THEN -0.633744
    WHEN 'XLV5' THEN -0.2411
    WHEN 'ZOX' THEN -0.547938
    WHEN 'SXH' THEN -0.30632
    WHEN 'FVB9' THEN -0.823414
    WHEN 'RUU' THEN -0.087921
    WHEN 'LUM' THEN -0.796999
    WHEN 'SZE6' THEN -0.148
  END::numeric,
  CASE na.ticker
    WHEN 'LEO' THEN -0.327617
    WHEN 'YTX' THEN -0.28035
    WHEN 'PTJ' THEN -0.332457
    WHEN 'PAH' THEN -0.680905
    WHEN 'HLV' THEN -0.612483
    WHEN 'VDZ' THEN -0.836773
    WHEN 'BZD' THEN -0.416272
    WHEN 'SXN' THEN -0.378078
    WHEN 'HXY' THEN -0.065445
    WHEN 'VLA' THEN -0.82797
    WHEN 'FEL' THEN -0.152112
    WHEN 'QVP' THEN -0.774685
    WHEN 'EGU4' THEN -0.216605
    WHEN 'XSU' THEN -0.851217
    WHEN 'ACW' THEN -0.575342
    WHEN 'XHI9' THEN -0.541303
    WHEN 'VBK' THEN -0.369702
    WHEN 'KUM' THEN -0.633744
    WHEN 'XLV5' THEN -0.2411
    WHEN 'ZOX' THEN -0.547938
    WHEN 'SXH' THEN -0.30632
    WHEN 'FVB9' THEN -0.823414
    WHEN 'RUU' THEN -0.087921
    WHEN 'LUM' THEN -0.796999
    WHEN 'SZE6' THEN -0.148
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'LEO' THEN 'Mega Cap'
    WHEN 'YTX' THEN 'Mega Cap'
    WHEN 'PTJ' THEN 'Mega Cap'
    WHEN 'PAH' THEN 'Mega Cap'
    WHEN 'HLV' THEN 'Mega Cap'
    WHEN 'VDZ' THEN 'Mega Cap'
    WHEN 'BZD' THEN 'Mega Cap'
    WHEN 'SXN' THEN 'Mega Cap'
    WHEN 'HXY' THEN 'Mega Cap'
    WHEN 'VLA' THEN 'Mega Cap'
    WHEN 'FEL' THEN 'Mega Cap'
    WHEN 'QVP' THEN 'Mega Cap'
    WHEN 'EGU4' THEN 'Large Cap'
    WHEN 'XSU' THEN 'Large Cap'
    WHEN 'ACW' THEN 'Mega Cap'
    WHEN 'XHI9' THEN 'Mega Cap'
    WHEN 'VBK' THEN 'Mega Cap'
    WHEN 'KUM' THEN 'Large Cap'
    WHEN 'XLV5' THEN 'Mega Cap'
    WHEN 'ZOX' THEN 'Large Cap'
    WHEN 'SXH' THEN 'Large Cap'
    WHEN 'FVB9' THEN 'Mega Cap'
    WHEN 'RUU' THEN 'Mega Cap'
    WHEN 'LUM' THEN 'Mega Cap'
    WHEN 'SZE6' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'LEO' THEN 'High'
    WHEN 'YTX' THEN 'High'
    WHEN 'PTJ' THEN 'High'
    WHEN 'PAH' THEN 'High'
    WHEN 'HLV' THEN 'High'
    WHEN 'VDZ' THEN 'High'
    WHEN 'BZD' THEN 'High'
    WHEN 'SXN' THEN 'High'
    WHEN 'HXY' THEN 'High'
    WHEN 'VLA' THEN 'High'
    WHEN 'FEL' THEN 'High'
    WHEN 'QVP' THEN 'High'
    WHEN 'EGU4' THEN 'High'
    WHEN 'XSU' THEN 'High'
    WHEN 'ACW' THEN 'High'
    WHEN 'XHI9' THEN 'High'
    WHEN 'VBK' THEN 'High'
    WHEN 'KUM' THEN 'High'
    WHEN 'XLV5' THEN 'High'
    WHEN 'ZOX' THEN 'High'
    WHEN 'SXH' THEN 'High'
    WHEN 'FVB9' THEN 'High'
    WHEN 'RUU' THEN 'High'
    WHEN 'LUM' THEN 'High'
    WHEN 'SZE6' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.197491", "pipeline_version": "2.1_synthetic", "batch_id": "batch_007"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
