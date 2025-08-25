-- LOTE SINTÉTICO 2: 25 AÇÕES
-- Tickers: EGJ, KGV, MGC, TVB4, POY5, BFT8, XKM, DGR, PFU, JIG, MDO, HSM, KLE, KTA, XKV, RDY, QZC, IBD, EYH, ASJ, AQC, SBL, UWW, VCP, AFG

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('EGJ', 'STOCK', 'EGJ Corporation', 'AMEX', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'EGJ Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('KGV', 'STOCK', 'KGV Corporation', 'AMEX', 'Utilities', 'Utilities—Renewable', 'USD', 'KGV Corporation operates in the utilities—renewable industry within the utilities sector.'),
('MGC', 'STOCK', 'MGC Corporation', 'AMEX', 'Consumer Defensive', 'Grocery Stores', 'USD', 'MGC Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('TVB4', 'STOCK', 'TVB4 Corporation', 'AMEX', 'Financial Services', 'Banks—Regional', 'USD', 'TVB4 Corporation operates in the banks—regional industry within the financial services sector.'),
('POY5', 'STOCK', 'POY5 Corporation', 'AMEX', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'POY5 Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('BFT8', 'STOCK', 'BFT8 Corporation', 'AMEX', 'Technology', 'Consumer Electronics', 'USD', 'BFT8 Corporation operates in the consumer electronics industry within the technology sector.'),
('XKM', 'STOCK', 'XKM Corporation', 'NASDAQ', 'Technology', 'Software—Application', 'USD', 'XKM Corporation operates in the software—application industry within the technology sector.'),
('DGR', 'STOCK', 'DGR Corporation', 'NYSE', 'Energy', 'Oil & Gas E&P', 'USD', 'DGR Corporation operates in the oil & gas e&p industry within the energy sector.'),
('PFU', 'STOCK', 'PFU Corporation', 'NYSE', 'Consumer Defensive', 'Grocery Stores', 'USD', 'PFU Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('JIG', 'STOCK', 'JIG Corporation', 'NASDAQ', 'Utilities', 'Utilities—Renewable', 'USD', 'JIG Corporation operates in the utilities—renewable industry within the utilities sector.'),
('MDO', 'STOCK', 'MDO Corporation', 'NASDAQ', 'Industrials', 'Aerospace & Defense', 'USD', 'MDO Corporation operates in the aerospace & defense industry within the industrials sector.'),
('HSM', 'STOCK', 'HSM Corporation', 'NASDAQ', 'Consumer Defensive', 'Grocery Stores', 'USD', 'HSM Corporation operates in the grocery stores industry within the consumer defensive sector.'),
('KLE', 'STOCK', 'KLE Corporation', 'AMEX', 'Real Estate', 'REIT—Residential', 'USD', 'KLE Corporation operates in the reit—residential industry within the real estate sector.'),
('KTA', 'STOCK', 'KTA Corporation', 'AMEX', 'Energy', 'Oil & Gas E&P', 'USD', 'KTA Corporation operates in the oil & gas e&p industry within the energy sector.'),
('XKV', 'STOCK', 'XKV Corporation', 'AMEX', 'Financial Services', 'Banks—Regional', 'USD', 'XKV Corporation operates in the banks—regional industry within the financial services sector.'),
('RDY', 'STOCK', 'RDY Corporation', 'NYSE', 'Industrials', 'Railroads', 'USD', 'RDY Corporation operates in the railroads industry within the industrials sector.'),
('QZC', 'STOCK', 'QZC Corporation', 'NASDAQ', 'Energy', 'Oil & Gas Refining & Marketing', 'USD', 'QZC Corporation operates in the oil & gas refining & marketing industry within the energy sector.'),
('IBD', 'STOCK', 'IBD Corporation', 'AMEX', 'Utilities', 'Utilities—Renewable', 'USD', 'IBD Corporation operates in the utilities—renewable industry within the utilities sector.'),
('EYH', 'STOCK', 'EYH Corporation', 'AMEX', 'Real Estate', 'REIT—Office', 'USD', 'EYH Corporation operates in the reit—office industry within the real estate sector.'),
('ASJ', 'STOCK', 'ASJ Corporation', 'NYSE', 'Communication Services', 'Entertainment', 'USD', 'ASJ Corporation operates in the entertainment industry within the communication services sector.'),
('AQC', 'STOCK', 'AQC Corporation', 'AMEX', 'Technology', 'Semiconductors', 'USD', 'AQC Corporation operates in the semiconductors industry within the technology sector.'),
('SBL', 'STOCK', 'SBL Corporation', 'AMEX', 'Real Estate', 'REIT—Office', 'USD', 'SBL Corporation operates in the reit—office industry within the real estate sector.'),
('UWW', 'STOCK', 'UWW Corporation', 'NYSE', 'Industrials', 'Aerospace & Defense', 'USD', 'UWW Corporation operates in the aerospace & defense industry within the industrials sector.'),
('VCP', 'STOCK', 'VCP Corporation', 'AMEX', 'Consumer Defensive', 'Beverages—Non-Alcoholic', 'USD', 'VCP Corporation operates in the beverages—non-alcoholic industry within the consumer defensive sector.'),
('AFG', 'STOCK', 'AFG Corporation', 'NYSE', 'Utilities', 'Utilities—Renewable', 'USD', 'AFG Corporation operates in the utilities—renewable industry within the utilities sector.')
ON CONFLICT (ticker) DO NOTHING;

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('EGJ', 'KGV', 'MGC', 'TVB4', 'POY5', 'BFT8', 'XKM', 'DGR', 'PFU', 'JIG', 'MDO', 'HSM', 'KLE', 'KTA', 'XKV', 'RDY', 'QZC', 'IBD', 'EYH', 'ASJ', 'AQC', 'SBL', 'UWW', 'VCP', 'AFG')
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
    WHEN 'EGJ' THEN 404.77
    WHEN 'KGV' THEN 408.72
    WHEN 'MGC' THEN 379.14
    WHEN 'TVB4' THEN 349.64
    WHEN 'POY5' THEN 399.04
    WHEN 'BFT8' THEN 143.07
    WHEN 'XKM' THEN 169.74
    WHEN 'DGR' THEN 77.12
    WHEN 'PFU' THEN 208.23
    WHEN 'JIG' THEN 329.69
    WHEN 'MDO' THEN 243.45
    WHEN 'HSM' THEN 451.47
    WHEN 'KLE' THEN 323.76
    WHEN 'KTA' THEN 200.08
    WHEN 'XKV' THEN 311.06
    WHEN 'RDY' THEN 256.42
    WHEN 'QZC' THEN 228.98
    WHEN 'IBD' THEN 355.27
    WHEN 'EYH' THEN 110.63
    WHEN 'ASJ' THEN 142.56
    WHEN 'AQC' THEN 348.72
    WHEN 'SBL' THEN 127.17
    WHEN 'UWW' THEN 450.21
    WHEN 'VCP' THEN 78.02
    WHEN 'AFG' THEN 301.44
  END::numeric,
  CASE na.ticker
    WHEN 'EGJ' THEN 3628526866300
    WHEN 'KGV' THEN 788698975131
    WHEN 'MGC' THEN 887487080411
    WHEN 'TVB4' THEN 3295200608125
    WHEN 'POY5' THEN 317679761933
    WHEN 'BFT8' THEN 1240895408631
    WHEN 'XKM' THEN 127954761834
    WHEN 'DGR' THEN 382504571475
    WHEN 'PFU' THEN 91114767148
    WHEN 'JIG' THEN 2870299160855
    WHEN 'MDO' THEN 2218220358731
    WHEN 'HSM' THEN 3256870650223
    WHEN 'KLE' THEN 662530943647
    WHEN 'KTA' THEN 1516057440504
    WHEN 'XKV' THEN 901535442536
    WHEN 'RDY' THEN 1927800828006
    WHEN 'QZC' THEN 1376053994967
    WHEN 'IBD' THEN 3100219024561
    WHEN 'EYH' THEN 595011684742
    WHEN 'ASJ' THEN 1032812457700
    WHEN 'AQC' THEN 1182590557645
    WHEN 'SBL' THEN 689946451945
    WHEN 'UWW' THEN 2797359119937
    WHEN 'VCP' THEN 698019840263
    WHEN 'AFG' THEN 2302144115034
  END::numeric,
  CASE na.ticker
    WHEN 'EGJ' THEN 8964416499
    WHEN 'KGV' THEN 1929680405
    WHEN 'MGC' THEN 2340789894
    WHEN 'TVB4' THEN 9424552706
    WHEN 'POY5' THEN 796110069
    WHEN 'BFT8' THEN 8673344577
    WHEN 'XKM' THEN 753827983
    WHEN 'DGR' THEN 4959862182
    WHEN 'PFU' THEN 437567916
    WHEN 'JIG' THEN 8706054660
    WHEN 'MDO' THEN 9111605499
    WHEN 'HSM' THEN 7213924846
    WHEN 'KLE' THEN 2046364417
    WHEN 'KTA' THEN 7577256300
    WHEN 'XKV' THEN 2898268638
    WHEN 'RDY' THEN 7518137540
    WHEN 'QZC' THEN 6009494257
    WHEN 'IBD' THEN 8726374376
    WHEN 'EYH' THEN 5378393607
    WHEN 'ASJ' THEN 7244756297
    WHEN 'AQC' THEN 3391232386
    WHEN 'SBL' THEN 5425386899
    WHEN 'UWW' THEN 6213453988
    WHEN 'VCP' THEN 8946678291
    WHEN 'AFG' THEN 7637155371
  END::bigint,
  CASE na.ticker
    WHEN 'EGJ' THEN 4468212175
    WHEN 'KGV' THEN 2535893072
    WHEN 'MGC' THEN 2329363015
    WHEN 'TVB4' THEN 1650598690
    WHEN 'POY5' THEN 3828064935
    WHEN 'BFT8' THEN 1413179993
    WHEN 'XKM' THEN 280563778
    WHEN 'DGR' THEN 15315105
    WHEN 'PFU' THEN 2672191273
    WHEN 'JIG' THEN 2736867073
    WHEN 'MDO' THEN 4987644047
    WHEN 'HSM' THEN 2383126794
    WHEN 'KLE' THEN 1482705129
    WHEN 'KTA' THEN 3381115100
    WHEN 'XKV' THEN 2788635948
    WHEN 'RDY' THEN 1246234813
    WHEN 'QZC' THEN 2661350825
    WHEN 'IBD' THEN 1254934777
    WHEN 'EYH' THEN 2588971860
    WHEN 'ASJ' THEN 895361088
    WHEN 'AQC' THEN 1135217721
    WHEN 'SBL' THEN 2017899543
    WHEN 'UWW' THEN 2187257363
    WHEN 'VCP' THEN 3382764569
    WHEN 'AFG' THEN 4030125187
  END::bigint,
  CASE na.ticker
    WHEN 'EGJ' THEN 2.208796
    WHEN 'KGV' THEN 2.490638
    WHEN 'MGC' THEN 2.14691
    WHEN 'TVB4' THEN -0.1684
    WHEN 'POY5' THEN 1.859344
    WHEN 'BFT8' THEN 1.012467
    WHEN 'XKM' THEN 0.647844
    WHEN 'DGR' THEN 1.660807
    WHEN 'PFU' THEN 0.521614
    WHEN 'JIG' THEN 0.726167
    WHEN 'MDO' THEN 2.014527
    WHEN 'HSM' THEN 0.460523
    WHEN 'KLE' THEN 1.080749
    WHEN 'KTA' THEN 2.442187
    WHEN 'XKV' THEN -0.553565
    WHEN 'RDY' THEN 1.342001
    WHEN 'QZC' THEN 0.282695
    WHEN 'IBD' THEN 1.628855
    WHEN 'EYH' THEN 0.919378
    WHEN 'ASJ' THEN 1.791921
    WHEN 'AQC' THEN 0.989238
    WHEN 'SBL' THEN -0.154142
    WHEN 'UWW' THEN -0.08899
    WHEN 'VCP' THEN 1.249045
    WHEN 'AFG' THEN 2.093389
  END::numeric,
  CASE na.ticker
    WHEN 'EGJ' THEN 0.756547
    WHEN 'KGV' THEN 0.611949
    WHEN 'MGC' THEN 0.306289
    WHEN 'TVB4' THEN 0.394633
    WHEN 'POY5' THEN 0.755539
    WHEN 'BFT8' THEN 1.105523
    WHEN 'XKM' THEN 1.164852
    WHEN 'DGR' THEN 1.170178
    WHEN 'PFU' THEN 0.245512
    WHEN 'JIG' THEN 1.072324
    WHEN 'MDO' THEN 0.302852
    WHEN 'HSM' THEN 0.711203
    WHEN 'KLE' THEN 1.142734
    WHEN 'KTA' THEN 1.17449
    WHEN 'XKV' THEN 0.174629
    WHEN 'RDY' THEN 0.488541
    WHEN 'QZC' THEN 0.176214
    WHEN 'IBD' THEN 0.529403
    WHEN 'EYH' THEN 0.914291
    WHEN 'ASJ' THEN 0.957526
    WHEN 'AQC' THEN 0.283616
    WHEN 'SBL' THEN 0.631672
    WHEN 'UWW' THEN 0.196046
    WHEN 'VCP' THEN 0.515196
    WHEN 'AFG' THEN 0.893873
  END::numeric,
  CASE na.ticker
    WHEN 'EGJ' THEN 1.112956
    WHEN 'KGV' THEN -1.006184
    WHEN 'MGC' THEN 0.461127
    WHEN 'TVB4' THEN 1.415623
    WHEN 'POY5' THEN 3.854976
    WHEN 'BFT8' THEN -1.253003
    WHEN 'XKM' THEN -1.52533
    WHEN 'DGR' THEN 2.259437
    WHEN 'PFU' THEN 3.144756
    WHEN 'JIG' THEN -1.63958
    WHEN 'MDO' THEN 0.394858
    WHEN 'HSM' THEN 3.630345
    WHEN 'KLE' THEN 3.686662
    WHEN 'KTA' THEN 1.79087
    WHEN 'XKV' THEN 3.755591
    WHEN 'RDY' THEN 2.564386
    WHEN 'QZC' THEN 0.259177
    WHEN 'IBD' THEN -1.680958
    WHEN 'EYH' THEN 2.05211
    WHEN 'ASJ' THEN -1.070825
    WHEN 'AQC' THEN -1.703728
    WHEN 'SBL' THEN 0.770588
    WHEN 'UWW' THEN -0.47444
    WHEN 'VCP' THEN -0.784638
    WHEN 'AFG' THEN -0.048695
  END::numeric,
  CASE na.ticker
    WHEN 'EGJ' THEN -0.625219
    WHEN 'KGV' THEN -0.774666
    WHEN 'MGC' THEN -0.591178
    WHEN 'TVB4' THEN -0.841689
    WHEN 'POY5' THEN -0.619835
    WHEN 'BFT8' THEN -0.811171
    WHEN 'XKM' THEN -0.613187
    WHEN 'DGR' THEN -0.386831
    WHEN 'PFU' THEN -0.465976
    WHEN 'JIG' THEN -0.522943
    WHEN 'MDO' THEN -0.19888
    WHEN 'HSM' THEN -0.395216
    WHEN 'KLE' THEN -0.397202
    WHEN 'KTA' THEN -0.765254
    WHEN 'XKV' THEN -0.830393
    WHEN 'RDY' THEN -0.577759
    WHEN 'QZC' THEN -0.82429
    WHEN 'IBD' THEN -0.343942
    WHEN 'EYH' THEN -0.875774
    WHEN 'ASJ' THEN -0.099664
    WHEN 'AQC' THEN -0.788655
    WHEN 'SBL' THEN -0.759539
    WHEN 'UWW' THEN -0.577341
    WHEN 'VCP' THEN -0.11544
    WHEN 'AFG' THEN -0.422664
  END::numeric,
  CASE na.ticker
    WHEN 'EGJ' THEN -0.625219
    WHEN 'KGV' THEN -0.774666
    WHEN 'MGC' THEN -0.591178
    WHEN 'TVB4' THEN -0.841689
    WHEN 'POY5' THEN -0.619835
    WHEN 'BFT8' THEN -0.811171
    WHEN 'XKM' THEN -0.613187
    WHEN 'DGR' THEN -0.386831
    WHEN 'PFU' THEN -0.465976
    WHEN 'JIG' THEN -0.522943
    WHEN 'MDO' THEN -0.19888
    WHEN 'HSM' THEN -0.395216
    WHEN 'KLE' THEN -0.397202
    WHEN 'KTA' THEN -0.765254
    WHEN 'XKV' THEN -0.830393
    WHEN 'RDY' THEN -0.577759
    WHEN 'QZC' THEN -0.82429
    WHEN 'IBD' THEN -0.343942
    WHEN 'EYH' THEN -0.875774
    WHEN 'ASJ' THEN -0.099664
    WHEN 'AQC' THEN -0.788655
    WHEN 'SBL' THEN -0.759539
    WHEN 'UWW' THEN -0.577341
    WHEN 'VCP' THEN -0.11544
    WHEN 'AFG' THEN -0.422664
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
    WHEN 'EGJ' THEN 'Mega Cap'
    WHEN 'KGV' THEN 'Mega Cap'
    WHEN 'MGC' THEN 'Mega Cap'
    WHEN 'TVB4' THEN 'Mega Cap'
    WHEN 'POY5' THEN 'Mega Cap'
    WHEN 'BFT8' THEN 'Mega Cap'
    WHEN 'XKM' THEN 'Large Cap'
    WHEN 'DGR' THEN 'Mega Cap'
    WHEN 'PFU' THEN 'Large Cap'
    WHEN 'JIG' THEN 'Mega Cap'
    WHEN 'MDO' THEN 'Mega Cap'
    WHEN 'HSM' THEN 'Mega Cap'
    WHEN 'KLE' THEN 'Mega Cap'
    WHEN 'KTA' THEN 'Mega Cap'
    WHEN 'XKV' THEN 'Mega Cap'
    WHEN 'RDY' THEN 'Mega Cap'
    WHEN 'QZC' THEN 'Mega Cap'
    WHEN 'IBD' THEN 'Mega Cap'
    WHEN 'EYH' THEN 'Mega Cap'
    WHEN 'ASJ' THEN 'Mega Cap'
    WHEN 'AQC' THEN 'Mega Cap'
    WHEN 'SBL' THEN 'Mega Cap'
    WHEN 'UWW' THEN 'Mega Cap'
    WHEN 'VCP' THEN 'Mega Cap'
    WHEN 'AFG' THEN 'Mega Cap'
  END::text,
  CASE na.ticker
    WHEN 'EGJ' THEN 'High'
    WHEN 'KGV' THEN 'High'
    WHEN 'MGC' THEN 'High'
    WHEN 'TVB4' THEN 'High'
    WHEN 'POY5' THEN 'High'
    WHEN 'BFT8' THEN 'High'
    WHEN 'XKM' THEN 'High'
    WHEN 'DGR' THEN 'High'
    WHEN 'PFU' THEN 'High'
    WHEN 'JIG' THEN 'High'
    WHEN 'MDO' THEN 'High'
    WHEN 'HSM' THEN 'High'
    WHEN 'KLE' THEN 'High'
    WHEN 'KTA' THEN 'High'
    WHEN 'XKV' THEN 'High'
    WHEN 'RDY' THEN 'High'
    WHEN 'QZC' THEN 'High'
    WHEN 'IBD' THEN 'High'
    WHEN 'EYH' THEN 'High'
    WHEN 'ASJ' THEN 'High'
    WHEN 'AQC' THEN 'High'
    WHEN 'SBL' THEN 'High'
    WHEN 'UWW' THEN 'High'
    WHEN 'VCP' THEN 'High'
    WHEN 'AFG' THEN 'High'
  END::text,
  '{"data_source": "synthetic", "collection_date": "2025-08-17T00:22:11.192852", "pipeline_version": "2.1_synthetic", "batch_id": "batch_002"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;


-- Atualizar Materialized View
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- Verificar resultado
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
