-- LOTE SINTÉTICO 8: 25 AÇÕES
-- Tickers: ZPN5, QNV, BNH, CUI, TVS, HNA, KTZ, NOY, CBW, KTL, GXY9, CDY, JFU, KTU, GMZ, KEX2, WPD, IGO, LGO, MEA, JSJ3, GFE, PFB, SZG4, RHG

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('ZPN5', 'STOCK', 'ZPN5 Corporation', 'AMEX', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'ZPN5 Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('QNV', 'STOCK', 'QNV Corporation', 'AMEX', 'Technology', 'Software—Application', 'USD', 'QNV Corporation operates in the software—application industry within the technology sector.'),
('BNH', 'STOCK', 'BNH Corporation', 'AMEX', 'Real Estate', 'REIT—Residential', 'USD', 'BNH Corporation operates in the reit—residential industry within the real estate sector.'),
('CUI', 'STOCK', 'CUI Corporation', 'NYSE', 'Industrials', 'Railroads', 'USD', 'CUI Corporation operates in the railroads industry within the industrials sector.'),
('TVS', 'STOCK', 'TVS Corporation', 'NASDAQ', 'Consumer Defensive', 'Grocery Stores', 'USD', 'TVS Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('HNA', 'STOCK', 'HNA Corporation', 'NYSE', 'Utilities', 'Utilities—Renewable', 'USD', 'HNA Corporation operates in the utilities—renewable industry within the utilities sector.'),
('KTZ', 'STOCK', 'KTZ Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'KTZ Corporation operates in the insurance—life industry within the financial services sector.'),
('NOY', 'STOCK', 'NOY Corporation', 'NYSE', 'Real Estate', 'REIT—Office', 'USD', 'NOY Corporation operates in the reit—office industry within the real estate sector.'),
('CBW', 'STOCK', 'CBW Corporation', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'CBW Corporation operates in the auto manufacturers industry within the consumer cyclical sector.'),
('KTL', 'STOCK', 'KTL Corporation', 'NYSE', 'Materials', 'Steel', 'USD', 'KTL Corporation operates in the steel industry within the materials sector.'),
('GXY9', 'STOCK', 'GXY9 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'GXY9 Corporation operates in the utilities—renewable industry within the utilities sector.'),
('CDY', 'STOCK', 'CDY Corporation', 'AMEX', 'Consumer Cyclical', 'Auto Manufacturers', 'USD', 'CDY Corporation operates in the auto manufacturers industry within the consumer cyclical sector.'),
('JFU', 'STOCK', 'JFU Corporation', 'NYSE', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'JFU Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('KTU', 'STOCK', 'KTU Corporation', 'NYSE', 'Financial Services', 'Banks—Regional', 'USD', 'KTU Corporation operates in the banks—regional industry within the financial services sector.'),
('GMZ', 'STOCK', 'GMZ Corporation', 'NASDAQ', 'Financial Services', 'Insurance—Life', 'USD', 'GMZ Corporation operates in the insurance—life industry within the financial services sector.'),
('KEX2', 'STOCK', 'KEX2 Corporation', 'NASDAQ', 'Communication Services', 'Entertainment', 'USD', 'KEX2 Corporation operates in the entertainment industry within the communication services sector.'),
('WPD', 'STOCK', 'WPD Corporation', 'NASDAQ', 'Real Estate', 'REIT—Office', 'USD', 'WPD Corporation operates in the reit—office industry within the real estate sector.'),
('IGO', 'STOCK', 'IGO Corporation', 'NASDAQ', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'IGO Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('LGO', 'STOCK', 'LGO Corporation', 'NASDAQ', 'Materials', 'Steel', 'USD', 'LGO Corporation operates in the steel industry within the materials sector.'),
('MEA', 'STOCK', 'MEA Corporation', 'NYSE', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'MEA Corporation operates in the drug manufacturers—general industry within the healthcare sector.'),
('JSJ3', 'STOCK', 'JSJ3 Corporation', 'NYSE', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'JSJ3 Corporation operates in the utilities—regulated electric industry within the utilities sector.'),
('GFE', 'STOCK', 'GFE Corporation', 'AMEX', 'Industrials', 'Railroads', 'USD', 'GFE Corporation operates in the railroads industry within the industrials sector.'),
('PFB', 'STOCK', 'PFB Corporation', 'AMEX', 'Energy', 'Oil & Gas E&P', 'USD', 'PFB Corporation operates in the oil & gas e&p industry within the energy sector.'),
('SZG4', 'STOCK', 'SZG4 Corporation', 'AMEX', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'SZG4 Corporation operates in the drug manufacturers—general industry within the healthcare sector.'),
('RHG', 'STOCK', 'RHG Corporation', 'NYSE', 'Healthcare', 'Biotechnology', 'USD', 'RHG Corporation operates in the biotechnology industry within the healthcare sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('ZPN5', 'QNV', 'BNH', 'CUI', 'TVS', 'HNA', 'KTZ', 'NOY', 'CBW', 'KTL', 'GXY9', 'CDY', 'JFU', 'KTU', 'GMZ', 'KEX2', 'WPD', 'IGO', 'LGO', 'MEA', 'JSJ3', 'GFE', 'PFB', 'SZG4', 'RHG')
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
    WHEN 'ZPN5' THEN 193.95
    WHEN 'QNV' THEN 26.43
    WHEN 'BNH' THEN 388.83
    WHEN 'CUI' THEN 248.96
    WHEN 'TVS' THEN 49.21
    WHEN 'HNA' THEN 85.91
    WHEN 'KTZ' THEN 62.3
    WHEN 'NOY' THEN 390.55
    WHEN 'CBW' THEN 355.99
    WHEN 'KTL' THEN 434.66
    WHEN 'GXY9' THEN 265.4
    WHEN 'CDY' THEN 133.06
    WHEN 'JFU' THEN 33.15
    WHEN 'KTU' THEN 333.85
    WHEN 'GMZ' THEN 119.59
    WHEN 'KEX2' THEN 282.91
    WHEN 'WPD' THEN 125.72
    WHEN 'IGO' THEN 386.75
    WHEN 'LGO' THEN 459.9
    WHEN 'MEA' THEN 317.94
    WHEN 'JSJ3' THEN 73.49
    WHEN 'GFE' THEN 348.93
    WHEN 'PFB' THEN 397.73
    WHEN 'SZG4' THEN 426.2
    WHEN 'RHG' THEN 454.14
  END::numeric,
  CASE na.ticker
    WHEN 'ZPN5' THEN 384380693269
    WHEN 'QNV' THEN 9969607862
    WHEN 'BNH' THEN 3338645228931
    WHEN 'CUI' THEN 1284288180696
    WHEN 'TVS' THEN 317809969092
    WHEN 'HNA' THEN 119701799967
    WHEN 'KTZ' THEN 147023031512
    WHEN 'NOY' THEN 3376940573992
    WHEN 'CBW' THEN 1775182228421
    WHEN 'KTL' THEN 1374491365838
    WHEN 'GXY9' THEN 964198720714
    WHEN 'CDY' THEN 991214620025
    WHEN 'JFU' THEN 101223147156
    WHEN 'KTU' THEN 2058359933674
    WHEN 'GMZ' THEN 757318974029
    WHEN 'KEX2' THEN 519253591419
    WHEN 'WPD' THEN 331206973949
    WHEN 'IGO' THEN 789409028544
    WHEN 'LGO' THEN 2872431153087
    WHEN 'MEA' THEN 495430255854
    WHEN 'JSJ3' THEN 629188345510
    WHEN 'GFE' THEN 2397396217808
    WHEN 'PFB' THEN 2619722823235
    WHEN 'SZG4' THEN 3850633972830
    WHEN 'RHG' THEN 2441322217284
  END::numeric,
  CASE na.ticker
    WHEN 'ZPN5' THEN 1981854567
    WHEN 'QNV' THEN 377208016
    WHEN 'BNH' THEN 8586387956
    WHEN 'CUI' THEN 5158612551
    WHEN 'TVS' THEN 6458239567
    WHEN 'HNA' THEN 1393339541
    WHEN 'KTZ' THEN 2359920249
    WHEN 'NOY' THEN 8646628022
    WHEN 'CBW' THEN 4986607007
    WHEN 'KTL' THEN 3162221888
    WHEN 'GXY9' THEN 3633001962
    WHEN 'CDY' THEN 7449380881
    WHEN 'JFU' THEN 3053488602
    WHEN 'KTU' THEN 6165523240
    WHEN 'GMZ' THEN 6332627929
    WHEN 'KEX2' THEN 1835402041
    WHEN 'WPD' THEN 2634481180
    WHEN 'IGO' THEN 2041135174
    WHEN 'LGO' THEN 6245773327
    WHEN 'MEA' THEN 1558250789
    WHEN 'JSJ3' THEN 8561550490
    WHEN 'GFE' THEN 6870708216
    WHEN 'PFB' THEN 6586686504
    WHEN 'SZG4' THEN 9034805192
    WHEN 'RHG' THEN 5375704006
  END::bigint,
  CASE na.ticker
    WHEN 'ZPN5' THEN 2801590102
    WHEN 'QNV' THEN 302477306
    WHEN 'BNH' THEN 4183284018
    WHEN 'CUI' THEN 276974008
    WHEN 'TVS' THEN 202826746
    WHEN 'HNA' THEN 3938162663
    WHEN 'KTZ' THEN 4002714082
    WHEN 'NOY' THEN 696188984
    WHEN 'CBW' THEN 3523361625
    WHEN 'KTL' THEN 4706528134
    WHEN 'GXY9' THEN 1733003492
    WHEN 'CDY' THEN 846961000
    WHEN 'JFU' THEN 1182940008
    WHEN 'KTU' THEN 3804490187
    WHEN 'GMZ' THEN 3549058134
    WHEN 'KEX2' THEN 4025922356
    WHEN 'WPD' THEN 4612277347
    WHEN 'IGO' THEN 4893283643
    WHEN 'LGO' THEN 3988075403
    WHEN 'MEA' THEN 369561152
    WHEN 'JSJ3' THEN 719922191
    WHEN 'GFE' THEN 3987199175
    WHEN 'PFB' THEN 1732562676
    WHEN 'SZG4' THEN 1448527592
    WHEN 'RHG' THEN 4044365769
  END::bigint,
  CASE na.ticker
    WHEN 'ZPN5' THEN 0.705492
    WHEN 'QNV' THEN -0.763473
    WHEN 'BNH' THEN -0.292284
    WHEN 'CUI' THEN 2.404629
    WHEN 'TVS' THEN 0.035965
    WHEN 'HNA' THEN 2.239657
    WHEN 'KTZ' THEN -0.432225
    WHEN 'NOY' THEN 0.738498
    WHEN 'CBW' THEN -0.428004
    WHEN 'KTL' THEN 0.075493
    WHEN 'GXY9' THEN 1.107409
    WHEN 'CDY' THEN 0.907598
    WHEN 'JFU' THEN 1.644065
    WHEN 'KTU' THEN 0.221384
    WHEN 'GMZ' THEN 1.764505
    WHEN 'KEX2' THEN -0.189488
    WHEN 'WPD' THEN -0.237896
    WHEN 'IGO' THEN 0.368694
    WHEN 'LGO' THEN -0.571763
    WHEN 'MEA' THEN 1.33888
    WHEN 'JSJ3' THEN -0.634783
    WHEN 'GFE' THEN 1.657552
    WHEN 'PFB' THEN 0.699595
    WHEN 'SZG4' THEN 2.271757
    WHEN 'RHG' THEN -0.584718
  END::numeric,
  CASE na.ticker
    WHEN 'ZPN5' THEN 0.261993
    WHEN 'QNV' THEN 0.471496
    WHEN 'BNH' THEN 1.091678
    WHEN 'CUI' THEN 0.476598
    WHEN 'TVS' THEN 0.312457
    WHEN 'HNA' THEN 0.587847
    WHEN 'KTZ' THEN 0.899792
    WHEN 'NOY' THEN 0.26362
    WHEN 'CBW' THEN 1.197353
    WHEN 'KTL' THEN 0.191215
    WHEN 'GXY9' THEN 0.18711
    WHEN 'CDY' THEN 0.587506
    WHEN 'JFU' THEN 1.01228
    WHEN 'KTU' THEN 0.887931
    WHEN 'GMZ' THEN 1.049825
    WHEN 'KEX2' THEN 0.687335
    WHEN 'WPD' THEN 0.243779
    WHEN 'IGO' THEN 0.365139
    WHEN 'LGO' THEN 0.969119
    WHEN 'MEA' THEN 0.991392
    WHEN 'JSJ3' THEN 0.736767
    WHEN 'GFE' THEN 0.408915
    WHEN 'PFB' THEN 0.30953
    WHEN 'SZG4' THEN 0.205617
    WHEN 'RHG' THEN 0.21811
  END::numeric,
  CASE na.ticker
    WHEN 'ZPN5' THEN -0.530551
    WHEN 'QNV' THEN -0.333247
    WHEN 'BNH' THEN 2.016322
    WHEN 'CUI' THEN 1.708136
    WHEN 'TVS' THEN -0.451901
    WHEN 'HNA' THEN 0.08801
    WHEN 'KTZ' THEN -1.876851
    WHEN 'NOY' THEN 2.257153
    WHEN 'CBW' THEN -0.8832
    WHEN 'KTL' THEN 3.126286
    WHEN 'GXY9' THEN 0.703362
    WHEN 'CDY' THEN -1.221616
    WHEN 'JFU' THEN 2.279508
    WHEN 'KTU' THEN 3.585322
    WHEN 'GMZ' THEN 2.754717
    WHEN 'KEX2' THEN 1.575388
    WHEN 'WPD' THEN -1.447922
    WHEN 'IGO' THEN -0.688212
    WHEN 'LGO' THEN 1.465009
    WHEN 'MEA' THEN 1.04572
    WHEN 'JSJ3' THEN 3.384152
    WHEN 'GFE' THEN 0.690337
    WHEN 'PFB' THEN 0.660135
    WHEN 'SZG4' THEN 3.783786
    WHEN 'RHG' THEN 1.89673
  END::numeric,
  CASE na.ticker
    WHEN 'ZPN5' THEN -0.356764
    WHEN 'QNV' THEN -0.276156
    WHEN 'BNH' THEN -0.193228
    WHEN 'CUI' THEN -0.085415
    WHEN 'TVS' THEN -0.58947
    WHEN 'HNA' THEN -0.114755
    WHEN 'KTZ' THEN -0.157255
    WHEN 'NOY' THEN -0.819227
    WHEN 'CBW' THEN -0.245539
    WHEN 'KTL' THEN -0.810552
    WHEN 'GXY9' THEN -0.167754
    WHEN 'CDY' THEN -0.767384
    WHEN 'JFU' THEN -0.405821
    WHEN 'KTU' THEN -0.789245
    WHEN 'GMZ' THEN -0.102307
    WHEN 'KEX2' THEN -0.763765
    WHEN 'WPD' THEN -0.434753
    WHEN 'IGO' THEN -0.263338
    WHEN 'LGO' THEN -0.384876
    WHEN 'MEA' THEN -0.164558
    WHEN 'JSJ3' THEN -0.086502
    WHEN 'GFE' THEN -0.244027
    WHEN 'PFB' THEN -0.658212
    WHEN 'SZG4' THEN -0.714492
    WHEN 'RHG' THEN -0.711439
  END::numeric,
  CASE na.ticker
    WHEN 'ZPN5' THEN -0.356764
    WHEN 'QNV' THEN -0.276156
    WHEN 'BNH' THEN -0.193228
    WHEN 'CUI' THEN -0.085415
    WHEN 'TVS' THEN -0.58947
    WHEN 'HNA' THEN -0.114755
    WHEN 'KTZ' THEN -0.157255
    WHEN 'NOY' THEN -0.819227
    WHEN 'CBW' THEN -0.245539
    WHEN 'KTL' THEN -0.810552
    WHEN 'GXY9' THEN -0.167754
    WHEN 'CDY' THEN -0.767384
    WHEN 'JFU' THEN -0.405821
    WHEN 'KTU' THEN -0.789245
    WHEN 'GMZ' THEN -0.102307
    WHEN 'KEX2' THEN -0.763765
    WHEN 'WPD' THEN -0.434753
    WHEN 'IGO' THEN -0.263338
    WHEN 'LGO' THEN -0.384876
    WHEN 'MEA' THEN -0.164558
    WHEN 'JSJ3' THEN -0.086502
    WHEN 'GFE' THEN -0.244027
    WHEN 'PFB' THEN -0.658212
    WHEN 'SZG4' THEN -0.714492
    WHEN 'RHG' THEN -0.711439
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'ZPN5' THEN 'Mega Cap'
    WHEN 'QNV' THEN 'Mid Cap'
    WHEN 'BNH' THEN 'Mega Cap'
    WHEN 'CUI' THEN 'Mega Cap'
    WHEN 'TVS' THEN 'Mega Cap'
    WHEN 'HNA' THEN 'Large Cap'
    WHEN 'KTZ' THEN 'Large Cap'
    WHEN 'NOY' THEN 'Mega Cap'
    WHEN 'CBW' THEN 'Mega Cap'
    WHEN 'KTL' THEN 'Mega Cap'
    WHEN 'GXY9' THEN 'Mega Cap'
    WHEN 'CDY' THEN 'Mega Cap'
    WHEN 'JFU' THEN 'Large Cap'
    WHEN 'KTU' THEN 'Mega Cap'
    WHEN 'GMZ' THEN 'Mega Cap'
    WHEN 'KEX2' THEN 'Mega Cap'
    WHEN 'WPD' THEN 'Mega Cap'
    WHEN 'IGO' THEN 'Mega Cap'
    WHEN 'LGO' THEN 'Mega Cap'
    WHEN 'MEA' THEN 'Mega Cap'
    WHEN 'JSJ3' THEN 'Mega Cap'
    WHEN 'GFE' THEN 'Mega Cap'
    WHEN 'PFB' THEN 'Mega Cap'
    WHEN 'SZG4' THEN 'Mega Cap'
    WHEN 'RHG' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'ZPN5' THEN 'High'
    WHEN 'QNV' THEN 'High'
    WHEN 'BNH' THEN 'High'
    WHEN 'CUI' THEN 'High'
    WHEN 'TVS' THEN 'High'
    WHEN 'HNA' THEN 'High'
    WHEN 'KTZ' THEN 'High'
    WHEN 'NOY' THEN 'High'
    WHEN 'CBW' THEN 'High'
    WHEN 'KTL' THEN 'High'
    WHEN 'GXY9' THEN 'High'
    WHEN 'CDY' THEN 'High'
    WHEN 'JFU' THEN 'High'
    WHEN 'KTU' THEN 'High'
    WHEN 'GMZ' THEN 'High'
    WHEN 'KEX2' THEN 'High'
    WHEN 'WPD' THEN 'High'
    WHEN 'IGO' THEN 'High'
    WHEN 'LGO' THEN 'High'
    WHEN 'MEA' THEN 'High'
    WHEN 'JSJ3' THEN 'High'
    WHEN 'GFE' THEN 'High'
    WHEN 'PFB' THEN 'High'
    WHEN 'SZG4' THEN 'High'
    WHEN 'RHG' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.198449", "pipeline_version": "2.1_synthetic", "batch_id": "batch_008"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
