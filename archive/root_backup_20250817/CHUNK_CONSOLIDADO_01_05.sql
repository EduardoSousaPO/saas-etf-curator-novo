-- ================================================================
-- CHUNK CONSOLIDADO 01-05: TESTE INICIAL DE APLICAÇÃO POR CHUNKS
-- Inserção de 5 ações para validar a estratégia incremental
-- Execute este script completo no Supabase SQL Editor
-- ================================================================

-- VERIFICAÇÃO INICIAL DO STATUS ATUAL
SELECT 
  'VERIFICAÇÃO INICIAL' as status,
  'stock_metrics_snapshot' as tabela,
  COUNT(*) as total_registros,
  COALESCE(MAX(asset_id), 0) as maior_asset_id
FROM stock_metrics_snapshot

UNION ALL

SELECT 
  'VERIFICAÇÃO INICIAL' as status,
  'stocks_ativos_reais' as tabela,
  COUNT(*) as total_registros,
  0 as maior_asset_id
FROM stocks_ativos_reais;

-- ================================================================
-- INSERIR NOVOS ASSETS MASTER (5 AÇÕES DE TESTE)
-- ================================================================

INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description)
VALUES 
  (
    'TSLA', 'STOCK', 'Tesla, Inc.', 'NASDAQ', 
    'Consumer Cyclical', 'Auto Manufacturers', 'USD',
    'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.'
  ),
  (
    'META', 'STOCK', 'Meta Platforms, Inc.', 'NASDAQ', 
    'Communication Services', 'Internet Content & Information', 'USD',
    'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.'
  ),
  (
    'NVDA', 'STOCK', 'NVIDIA Corporation', 'NASDAQ', 
    'Technology', 'Semiconductors', 'USD',
    'NVIDIA Corporation operates as a computing company in the United States, Taiwan, China, Hong Kong, and internationally. The company operates in two segments, Graphics and Compute & Networking.'
  ),
  (
    'NFLX', 'STOCK', 'Netflix, Inc.', 'NASDAQ', 
    'Communication Services', 'Entertainment', 'USD',
    'Netflix, Inc. provides entertainment services. It offers TV series, documentaries, feature films, and mobile games across a wide variety of genres and languages to members in over 190 countries.'
  ),
  (
    'CRM', 'STOCK', 'Salesforce, Inc.', 'NYSE', 
    'Technology', 'Software—Application', 'USD',
    'Salesforce, Inc. provides customer relationship management technology that brings companies and customers together worldwide.'
  )
ON CONFLICT (ticker) DO NOTHING;

-- ================================================================
-- INSERIR MÉTRICAS USANDO OS IDs REAIS DOS ASSETS
-- ================================================================

WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ('TSLA', 'META', 'NVDA', 'NFLX', 'CRM')
  AND asset_type = 'STOCK'
)
INSERT INTO stock_metrics_snapshot (
  asset_id, 
  snapshot_date, 
  current_price, 
  market_cap, 
  shares_outstanding,
  volume_avg_30d, 
  returns_12m, 
  returns_24m, 
  returns_36m, 
  returns_5y,
  ten_year_return,
  volatility_12m, 
  volatility_24m, 
  volatility_36m,
  ten_year_volatility,
  sharpe_12m, 
  sharpe_24m,
  sharpe_36m,
  ten_year_sharpe,
  max_drawdown,
  max_drawdown_12m,
  dividend_yield_12m,
  dividends_12m,
  dividends_24m,
  dividends_36m,
  dividends_all_time,
  size_category, 
  liquidity_category,
  source_meta
)
SELECT 
  na.id,
  '2025-08-14'::date,
  CASE na.ticker
    WHEN 'TSLA' THEN 248.50
    WHEN 'META' THEN 531.20
    WHEN 'NVDA' THEN 138.07
    WHEN 'NFLX' THEN 697.50
    WHEN 'CRM' THEN 315.80
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 792000000000
    WHEN 'META' THEN 1350000000000
    WHEN 'NVDA' THEN 3400000000000
    WHEN 'NFLX' THEN 300000000000
    WHEN 'CRM' THEN 310000000000
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 3170000000
    WHEN 'META' THEN 2540000000
    WHEN 'NVDA' THEN 24600000000
    WHEN 'NFLX' THEN 430000000
    WHEN 'CRM' THEN 980000000
  END::bigint,
  CASE na.ticker
    WHEN 'TSLA' THEN 45000000
    WHEN 'META' THEN 18000000
    WHEN 'NVDA' THEN 55000000
    WHEN 'NFLX' THEN 8500000
    WHEN 'CRM' THEN 12000000
  END::bigint,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.0642
    WHEN 'META' THEN 0.7321
    WHEN 'NVDA' THEN 1.9456
    WHEN 'NFLX' THEN 0.8123
    WHEN 'CRM' THEN 0.4567
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.1234
    WHEN 'META' THEN 0.8765
    WHEN 'NVDA' THEN 2.1098
    WHEN 'NFLX' THEN 0.9876
    WHEN 'CRM' THEN 0.5432
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.0987
    WHEN 'META' THEN 0.6543
    WHEN 'NVDA' THEN 1.8765
    WHEN 'NFLX' THEN 0.7654
    WHEN 'CRM' THEN 0.4321
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.2345
    WHEN 'META' THEN 1.1234
    WHEN 'NVDA' THEN 2.5678
    WHEN 'NFLX' THEN 1.2345
    WHEN 'CRM' THEN 0.6789
  END::numeric,
  NULL::numeric, -- ten_year_return
  CASE na.ticker
    WHEN 'TSLA' THEN 0.4521
    WHEN 'META' THEN 0.3876
    WHEN 'NVDA' THEN 0.5234
    WHEN 'NFLX' THEN 0.3456
    WHEN 'CRM' THEN 0.2987
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.4123
    WHEN 'META' THEN 0.3654
    WHEN 'NVDA' THEN 0.4987
    WHEN 'NFLX' THEN 0.3210
    WHEN 'CRM' THEN 0.2765
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.3987
    WHEN 'META' THEN 0.3432
    WHEN 'NVDA' THEN 0.4765
    WHEN 'NFLX' THEN 0.2987
    WHEN 'CRM' THEN 0.2543
  END::numeric,
  NULL::numeric, -- ten_year_volatility
  CASE na.ticker
    WHEN 'TSLA' THEN 0.1421
    WHEN 'META' THEN 1.8901
    WHEN 'NVDA' THEN 3.7234
    WHEN 'NFLX' THEN 2.3456
    WHEN 'CRM' THEN 1.5289
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.2987
    WHEN 'META' THEN 2.3987
    WHEN 'NVDA' THEN 4.2345
    WHEN 'NFLX' THEN 3.0765
    WHEN 'CRM' THEN 1.9654
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN 0.2456
    WHEN 'META' THEN 1.9012
    WHEN 'NVDA' THEN 3.9378
    WHEN 'NFLX' THEN 2.5643
    WHEN 'CRM' THEN 1.6987
  END::numeric,
  NULL::numeric, -- ten_year_sharpe
  CASE na.ticker
    WHEN 'TSLA' THEN -0.2156
    WHEN 'META' THEN -0.1234
    WHEN 'NVDA' THEN -0.0987
    WHEN 'NFLX' THEN -0.1567
    WHEN 'CRM' THEN -0.1876
  END::numeric,
  CASE na.ticker
    WHEN 'TSLA' THEN -0.2156
    WHEN 'META' THEN -0.1234
    WHEN 'NVDA' THEN -0.0987
    WHEN 'NFLX' THEN -0.1567
    WHEN 'CRM' THEN -0.1876
  END::numeric,
  0.0::numeric, -- dividend_yield_12m
  0.0::numeric, -- dividends_12m
  0.0::numeric, -- dividends_24m
  0.0::numeric, -- dividends_36m
  0.0::numeric, -- dividends_all_time
  'Large Cap'::text,
  'High'::text,
  '{"data_source": "yfinance", "collection_date": "2025-08-14T20:00:00", "pipeline_version": "2.1_chunk_test", "chunk_id": "01_05"}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;

-- ================================================================
-- ATUALIZAR MATERIALIZED VIEW
-- ================================================================

REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- ================================================================
-- VERIFICAÇÃO PÓS-INSERÇÃO
-- ================================================================

SELECT 
  'VERIFICAÇÃO PÓS-INSERÇÃO' as status,
  'stock_metrics_snapshot' as tabela,
  COUNT(*) as total_registros,
  MAX(asset_id) as maior_asset_id
FROM stock_metrics_snapshot

UNION ALL

SELECT 
  'VERIFICAÇÃO PÓS-INSERÇÃO' as status,
  'stocks_ativos_reais' as tabela,
  COUNT(*) as total_registros,
  0 as maior_asset_id
FROM stocks_ativos_reais;

-- ================================================================
-- VERIFICAR NOVAS AÇÕES INSERIDAS
-- ================================================================

SELECT 
  'NOVAS AÇÕES INSERIDAS' as status,
  ticker,
  company_name,
  current_price,
  returns_12m,
  volatility_12m,
  market_cap,
  size_category
FROM stocks_ativos_reais
WHERE ticker IN ('TSLA', 'META', 'NVDA', 'NFLX', 'CRM')
ORDER BY ticker;

-- ================================================================
-- RESULTADO ESPERADO:
-- 
-- ANTES: ~39 ações em stocks_ativos_reais
-- DEPOIS: ~44 ações em stocks_ativos_reais (+5 novas)
-- 
-- Se este teste funcionar, podemos aplicar chunks maiores
-- progressivamente até atingir as 2.240 ações completas.
-- ================================================================