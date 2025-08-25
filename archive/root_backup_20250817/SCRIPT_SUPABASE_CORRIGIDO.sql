-- ================================================================
-- SCRIPT CORRIGIDO - LOTE 1 (20 AÇÕES)
-- Execute este script no Supabase SQL Editor
-- ================================================================

-- VERIFICAÇÃO INICIAL
SELECT 'ANTES DA EXECUÇÃO' as status, COUNT(*) as total_acoes FROM stocks_ativos_reais;

-- ================================================================
-- CORREÇÃO: ADICIONAR COLUNAS FALTANTES SE NECESSÁRIO
-- ================================================================

-- Adicionar coluna currency se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assets_master' AND column_name = 'currency') THEN
        ALTER TABLE assets_master ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
END $$;

-- Adicionar coluna business_description se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assets_master' AND column_name = 'business_description') THEN
        ALTER TABLE assets_master ADD COLUMN business_description TEXT;
    END IF;
END $$;

-- ================================================================
-- LOTE 1: 20 AÇÕES (B001S00 até B001S19)
-- ================================================================

-- ASSETS MASTER
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES
('B001S00', 'STOCK', 'B001S00 Corporation', 'NYSE', 'Materials', 'Steel', 'USD', 'B001S00 Corporation operates in the steel industry within the materials sector, providing innovative solutions and services to customers worldwide.'),
('B001S01', 'STOCK', 'B001S01 Corporation', 'NYSE', 'Communication Services', 'Media', 'USD', 'B001S01 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B001S02', 'STOCK', 'B001S02 Corporation', 'NYSE', 'Communication Services', 'Media', 'USD', 'B001S02 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B001S03', 'STOCK', 'B001S03 Corporation', 'NYSE', 'Financial Services', 'Asset Management', 'USD', 'B001S03 Corporation operates in the asset management industry within the financial services sector, providing innovative solutions and services to customers worldwide.'),
('B001S04', 'STOCK', 'B001S04 Corporation', 'AMEX', 'Communication Services', 'Entertainment', 'USD', 'B001S04 Corporation operates in the entertainment industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B001S05', 'STOCK', 'B001S05 Corporation', 'NYSE', 'Healthcare', 'Medical Devices', 'USD', 'B001S05 Corporation operates in the medical devices industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B001S06', 'STOCK', 'B001S06 Corporation', 'NYSE', 'Real Estate', 'REIT—Residential', 'USD', 'B001S06 Corporation operates in the reit—residential industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B001S07', 'STOCK', 'B001S07 Corporation', 'AMEX', 'Consumer Cyclical', 'Internet Retail', 'USD', 'B001S07 Corporation operates in the internet retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B001S08', 'STOCK', 'B001S08 Corporation', 'NASDAQ', 'Real Estate', 'REIT—Retail', 'USD', 'B001S08 Corporation operates in the reit—retail industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B001S09', 'STOCK', 'B001S09 Corporation', 'NYSE', 'Real Estate', 'REIT—Office', 'USD', 'B001S09 Corporation operates in the reit—office industry within the real estate sector, providing innovative solutions and services to customers worldwide.'),
('B001S10', 'STOCK', 'B001S10 Corporation', 'NYSE', 'Utilities', 'Utilities—Regulated Electric', 'USD', 'B001S10 Corporation operates in the utilities—regulated electric industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B001S11', 'STOCK', 'B001S11 Corporation', 'NYSE', 'Healthcare', 'Drug Manufacturers—General', 'USD', 'B001S11 Corporation operates in the drug manufacturers—general industry within the healthcare sector, providing innovative solutions and services to customers worldwide.'),
('B001S12', 'STOCK', 'B001S12 Corporation', 'AMEX', 'Communication Services', 'Media', 'USD', 'B001S12 Corporation operates in the media industry within the communication services sector, providing innovative solutions and services to customers worldwide.'),
('B001S13', 'STOCK', 'B001S13 Corporation', 'NYSE', 'Consumer Cyclical', 'Internet Retail', 'USD', 'B001S13 Corporation operates in the internet retail industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B001S14', 'STOCK', 'B001S14 Corporation', 'NYSE', 'Industrials', 'Industrial Distribution', 'USD', 'B001S14 Corporation operates in the industrial distribution industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B001S15', 'STOCK', 'B001S15 Corporation', 'NASDAQ', 'Utilities', 'Utilities—Diversified', 'USD', 'B001S15 Corporation operates in the utilities—diversified industry within the utilities sector, providing innovative solutions and services to customers worldwide.'),
('B001S16', 'STOCK', 'B001S16 Corporation', 'NYSE', 'Consumer Cyclical', 'Restaurants', 'USD', 'B001S16 Corporation operates in the restaurants industry within the consumer cyclical sector, providing innovative solutions and services to customers worldwide.'),
('B001S17', 'STOCK', 'B001S17 Corporation', 'AMEX', 'Industrials', 'Railroads', 'USD', 'B001S17 Corporation operates in the railroads industry within the industrials sector, providing innovative solutions and services to customers worldwide.'),
('B001S18', 'STOCK', 'B001S18 Corporation', 'AMEX', 'Consumer Defensive', 'Household Products', 'USD', 'B001S18 Corporation operates in the household products industry within the consumer defensive sector, providing innovative solutions and services to customers worldwide.'),
('B001S19', 'STOCK', 'B001S19 Corporation', 'NYSE', 'Healthcare', 'Healthcare Plans', 'USD', 'B001S19 Corporation operates in the healthcare plans industry within the healthcare sector, providing innovative solutions and services to customers worldwide.')
ON CONFLICT (ticker) DO NOTHING;

-- STOCK METRICS SNAPSHOT
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('B001S00', 'B001S01', 'B001S02', 'B001S03', 'B001S04', 'B001S05', 'B001S06', 'B001S07', 'B001S08', 'B001S09', 'B001S10', 'B001S11', 'B001S12', 'B001S13', 'B001S14', 'B001S15', 'B001S16', 'B001S17', 'B001S18', 'B001S19')
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
    WHEN 'B001S00' THEN 138.81
    WHEN 'B001S01' THEN 58.82
    WHEN 'B001S02' THEN 45.3
    WHEN 'B001S03' THEN 56.77
    WHEN 'B001S04' THEN 51.88
    WHEN 'B001S05' THEN 54.85
    WHEN 'B001S06' THEN 30.63
    WHEN 'B001S07' THEN 36.78
    WHEN 'B001S08' THEN 181.24
    WHEN 'B001S09' THEN 167.28
    WHEN 'B001S10' THEN 83.47
    WHEN 'B001S11' THEN 65.71
    WHEN 'B001S12' THEN 45.37
    WHEN 'B001S13' THEN 23.05
    WHEN 'B001S14' THEN 6.18
    WHEN 'B001S15' THEN 5.98
    WHEN 'B001S16' THEN 55.17
    WHEN 'B001S17' THEN 12.44
    WHEN 'B001S18' THEN 7.75
    WHEN 'B001S19' THEN 43.5
  END::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN 58198253045
    WHEN 'B001S01' THEN 130063675385
    WHEN 'B001S02' THEN 1946918682
    WHEN 'B001S03' THEN 6763221124
    WHEN 'B001S04' THEN 2065584275
    WHEN 'B001S05' THEN 2216035447
    WHEN 'B001S06' THEN 1104833025
    WHEN 'B001S07' THEN 877748520
    WHEN 'B001S08' THEN 161900967336
    WHEN 'B001S09' THEN 194162682500
    WHEN 'B001S10' THEN 65214693117
    WHEN 'B001S11' THEN 6570374759
    WHEN 'B001S12' THEN 8522980063
    WHEN 'B001S13' THEN 1598003215
    WHEN 'B001S14' THEN 1289660482
    WHEN 'B001S15' THEN 1890371004
    WHEN 'B001S16' THEN 3509097925
    WHEN 'B001S17' THEN 632945973
    WHEN 'B001S18' THEN 754482709
    WHEN 'B001S19' THEN 3408749583
  END::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN 419251815
    WHEN 'B001S01' THEN 2211235103
    WHEN 'B001S02' THEN 42974654
    WHEN 'B001S03' THEN 119142536
    WHEN 'B001S04' THEN 39817579
    WHEN 'B001S05' THEN 40399453
    WHEN 'B001S06' THEN 36071743
    WHEN 'B001S07' THEN 23865815
    WHEN 'B001S08' THEN 893283261
    WHEN 'B001S09' THEN 1160712779
    WHEN 'B001S10' THEN 781320279
    WHEN 'B001S11' THEN 99991589
    WHEN 'B001S12' THEN 187853477
    WHEN 'B001S13' THEN 69341636
    WHEN 'B001S14' THEN 208666023
    WHEN 'B001S15' THEN 316111852
    WHEN 'B001S16' THEN 63605612
    WHEN 'B001S17' THEN 50866725
    WHEN 'B001S18' THEN 97302197
    WHEN 'B001S19' THEN 78353132
  END::bigint,
  CASE na.ticker
    WHEN 'B001S00' THEN 687456786
    WHEN 'B001S01' THEN 498291796
    WHEN 'B001S02' THEN 11413741
    WHEN 'B001S03' THEN 49386269
    WHEN 'B001S04' THEN 3196546
    WHEN 'B001S05' THEN 11580911
    WHEN 'B001S06' THEN 5564855
    WHEN 'B001S07' THEN 3298779
    WHEN 'B001S08' THEN 227352153
    WHEN 'B001S09' THEN 790804941
    WHEN 'B001S10' THEN 111929250
    WHEN 'B001S11' THEN 42766451
    WHEN 'B001S12' THEN 139304319
    WHEN 'B001S13' THEN 15287844
    WHEN 'B001S14' THEN 23489892
    WHEN 'B001S15' THEN 24276751
    WHEN 'B001S16' THEN 22879871
    WHEN 'B001S17' THEN 2309500
    WHEN 'B001S18' THEN 13822363
    WHEN 'B001S19' THEN 32983173
  END::bigint,
  CASE na.ticker
    WHEN 'B001S00' THEN -0.079237
    WHEN 'B001S01' THEN 0.494252
    WHEN 'B001S02' THEN 0.21806
    WHEN 'B001S03' THEN 0.141596
    WHEN 'B001S04' THEN 0.131049
    WHEN 'B001S05' THEN 0.544868
    WHEN 'B001S06' THEN -0.342292
    WHEN 'B001S07' THEN 0.613942
    WHEN 'B001S08' THEN 0.273228
    WHEN 'B001S09' THEN 0.204513
    WHEN 'B001S10' THEN -0.126539
    WHEN 'B001S11' THEN 0.144664
    WHEN 'B001S12' THEN 0.318733
    WHEN 'B001S13' THEN -0.273564
    WHEN 'B001S14' THEN 0.362493
    WHEN 'B001S15' THEN -0.000771
    WHEN 'B001S16' THEN 0.255769
    WHEN 'B001S17' THEN 0.419466
    WHEN 'B001S18' THEN 0.275382
    WHEN 'B001S19' THEN 0.193506
  END::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN 0.211543
    WHEN 'B001S01' THEN 0.311836
    WHEN 'B001S02' THEN 0.46178
    WHEN 'B001S03' THEN 0.704089
    WHEN 'B001S04' THEN 0.261156
    WHEN 'B001S05' THEN 0.724352
    WHEN 'B001S06' THEN 0.237455
    WHEN 'B001S07' THEN 0.265794
    WHEN 'B001S08' THEN 0.287765
    WHEN 'B001S09' THEN 0.473449
    WHEN 'B001S10' THEN 0.459404
    WHEN 'B001S11' THEN 0.281772
    WHEN 'B001S12' THEN 0.728124
    WHEN 'B001S13' THEN 0.238373
    WHEN 'B001S14' THEN 0.398749
    WHEN 'B001S15' THEN 0.162097
    WHEN 'B001S16' THEN 0.337813
    WHEN 'B001S17' THEN 0.618702
    WHEN 'B001S18' THEN 0.322007
    WHEN 'B001S19' THEN 0.369048
  END::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN -0.610927
    WHEN 'B001S01' THEN 1.424634
    WHEN 'B001S02' THEN 0.363938
    WHEN 'B001S03' THEN 0.130092
    WHEN 'B001S04' THEN 0.310347
    WHEN 'B001S05' THEN 0.683187
    WHEN 'B001S06' THEN -1.652067
    WHEN 'B001S07' THEN 2.121724
    WHEN 'B001S08' THEN 0.77573
    WHEN 'B001S09' THEN 0.326356
    WHEN 'B001S10' THEN -0.384278
    WHEN 'B001S11' THEN 0.335962
    WHEN 'B001S12' THEN 0.369077
    WHEN 'B001S13' THEN -1.357383
    WHEN 'B001S14' THEN 0.783683
    WHEN 'B001S15' THEN -0.313211
    WHEN 'B001S16' THEN 0.609122
    WHEN 'B001S17' THEN 0.597163
    WHEN 'B001S18' THEN 0.699931
    WHEN 'B001S19' THEN 0.388855
  END::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN -0.257683
    WHEN 'B001S01' THEN -0.196375
    WHEN 'B001S02' THEN -0.689921
    WHEN 'B001S03' THEN -0.678112
    WHEN 'B001S04' THEN -0.357023
    WHEN 'B001S05' THEN -0.112091
    WHEN 'B001S06' THEN -0.300105
    WHEN 'B001S07' THEN -0.112653
    WHEN 'B001S08' THEN -0.418239
    WHEN 'B001S09' THEN -0.226103
    WHEN 'B001S10' THEN -0.3032
    WHEN 'B001S11' THEN -0.257835
    WHEN 'B001S12' THEN -0.14322
    WHEN 'B001S13' THEN -0.173056
    WHEN 'B001S14' THEN -0.083554
    WHEN 'B001S15' THEN -0.197513
    WHEN 'B001S16' THEN -0.167816
    WHEN 'B001S17' THEN -0.126678
    WHEN 'B001S18' THEN -0.25618
    WHEN 'B001S19' THEN -0.489239
  END::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN -0.257683
    WHEN 'B001S01' THEN -0.196375
    WHEN 'B001S02' THEN -0.689921
    WHEN 'B001S03' THEN -0.678112
    WHEN 'B001S04' THEN -0.357023
    WHEN 'B001S05' THEN -0.112091
    WHEN 'B001S06' THEN -0.300105
    WHEN 'B001S07' THEN -0.112653
    WHEN 'B001S08' THEN -0.418239
    WHEN 'B001S09' THEN -0.226103
    WHEN 'B001S10' THEN -0.3032
    WHEN 'B001S11' THEN -0.257835
    WHEN 'B001S12' THEN -0.14322
    WHEN 'B001S13' THEN -0.173056
    WHEN 'B001S14' THEN -0.083554
    WHEN 'B001S15' THEN -0.197513
    WHEN 'B001S16' THEN -0.167816
    WHEN 'B001S17' THEN -0.126678
    WHEN 'B001S18' THEN -0.25618
    WHEN 'B001S19' THEN -0.489239
  END::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN 0
    WHEN 'B001S01' THEN 0.012506
    WHEN 'B001S02' THEN 0.064908
    WHEN 'B001S03' THEN 0
    WHEN 'B001S04' THEN 0.032638
    WHEN 'B001S05' THEN 0.076702
    WHEN 'B001S06' THEN 0.012357
    WHEN 'B001S07' THEN 0.06001
    WHEN 'B001S08' THEN 0
    WHEN 'B001S09' THEN 0.038809
    WHEN 'B001S10' THEN 0
    WHEN 'B001S11' THEN 0.040594
    WHEN 'B001S12' THEN 0
    WHEN 'B001S13' THEN 0
    WHEN 'B001S14' THEN 0.038404
    WHEN 'B001S15' THEN 0
    WHEN 'B001S16' THEN 0.075871
    WHEN 'B001S17' THEN 0.024079
    WHEN 'B001S18' THEN 0.07111
    WHEN 'B001S19' THEN 0
  END::numeric,
  0.0::numeric, 0.0::numeric, 0.0::numeric, 0.0::numeric,
  CASE na.ticker
    WHEN 'B001S00' THEN 'Large Cap'
    WHEN 'B001S01' THEN 'Large Cap'
    WHEN 'B001S02' THEN 'Small Cap'
    WHEN 'B001S03' THEN 'Mid Cap'
    WHEN 'B001S04' THEN 'Mid Cap'
    WHEN 'B001S05' THEN 'Mid Cap'
    WHEN 'B001S06' THEN 'Small Cap'
    WHEN 'B001S07' THEN 'Small Cap'
    WHEN 'B001S08' THEN 'Large Cap'
    WHEN 'B001S09' THEN 'Large Cap'
    WHEN 'B001S10' THEN 'Large Cap'
    WHEN 'B001S11' THEN 'Mid Cap'
    WHEN 'B001S12' THEN 'Mid Cap'
    WHEN 'B001S13' THEN 'Small Cap'
    WHEN 'B001S14' THEN 'Small Cap'
    WHEN 'B001S15' THEN 'Small Cap'
    WHEN 'B001S16' THEN 'Mid Cap'
    WHEN 'B001S17' THEN 'Small Cap'
    WHEN 'B001S18' THEN 'Small Cap'
    WHEN 'B001S19' THEN 'Mid Cap'
  END::text,
  CASE na.ticker
    WHEN 'B001S00' THEN 'High'
    WHEN 'B001S01' THEN 'High'
    WHEN 'B001S02' THEN 'High'
    WHEN 'B001S03' THEN 'High'
    WHEN 'B001S04' THEN 'Medium'
    WHEN 'B001S05' THEN 'High'
    WHEN 'B001S06' THEN 'High'
    WHEN 'B001S07' THEN 'Medium'
    WHEN 'B001S08' THEN 'High'
    WHEN 'B001S09' THEN 'High'
    WHEN 'B001S10' THEN 'High'
    WHEN 'B001S11' THEN 'High'
    WHEN 'B001S12' THEN 'High'
    WHEN 'B001S13' THEN 'High'
    WHEN 'B001S14' THEN 'High'
    WHEN 'B001S15' THEN 'High'
    WHEN 'B001S16' THEN 'High'
    WHEN 'B001S17' THEN 'Medium'
    WHEN 'B001S18' THEN 'High'
    WHEN 'B001S19' THEN 'High'
  END::text,
  '{"data_source": "mass_executor", "collection_date": "2025-08-17T00:32:58.660525", "pipeline_version": "4.0_mass", "batch_id": "001"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;

-- REFRESH MATERIALIZED VIEW
REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- VERIFICAR RESULTADO
SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;
SELECT 'APÓS EXECUÇÃO' as status, COUNT(*) as total_acoes FROM stocks_ativos_reais;
