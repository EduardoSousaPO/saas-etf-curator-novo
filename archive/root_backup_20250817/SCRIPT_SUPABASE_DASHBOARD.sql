-- ================================================================
-- SCRIPT PARA EXECUÇÃO NO SUPABASE SQL EDITOR (DASHBOARD WEB)
-- Aplicação do massive_stocks_final.sql em chunks menores
-- ================================================================

-- PASSO 1: VERIFICAÇÃO INICIAL DO STATUS ATUAL
SELECT 
  'VERIFICAÇÃO INICIAL' as status,
  'assets_master' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN asset_type = 'STOCK' THEN 1 END) as total_stocks,
  COUNT(CASE WHEN asset_type = 'ETF' THEN 1 END) as total_etfs
FROM assets_master

UNION ALL

SELECT 
  'VERIFICAÇÃO INICIAL' as status,
  'stock_metrics_snapshot' as tabela,
  COUNT(*) as total_registros,
  COUNT(DISTINCT asset_id) as assets_unicos,
  0 as total_etfs
FROM stock_metrics_snapshot

UNION ALL

SELECT 
  'VERIFICAÇÃO INICIAL' as status,
  'stocks_ativos_reais (MV)' as tabela,
  COUNT(*) as total_registros,
  0 as assets_unicos,
  0 as total_etfs
FROM stocks_ativos_reais;

-- ================================================================
-- PASSO 2: APLICAR O CONTEÚDO DO massive_stocks_final.sql
-- 
-- INSTRUÇÕES:
-- 1. Copie TODO o conteúdo do arquivo scripts/massive_stocks_final.sql
-- 2. Cole AQUI ABAIXO (substitua este comentário)
-- 3. Execute o script completo
-- 
-- ATENÇÃO: O arquivo contém apenas INSERT INTO stock_metrics_snapshot
-- Os asset_id 2214-2240 devem existir em assets_master primeiro!
-- ================================================================

-- COLE AQUI O CONTEÚDO DO massive_stocks_final.sql:

-- [CONTEÚDO DO ARQUIVO massive_stocks_final.sql DEVE SER COLADO AQUI]

-- ================================================================
-- PASSO 3: VERIFICAÇÃO PÓS-INSERÇÃO
-- ================================================================

SELECT 
  'VERIFICAÇÃO PÓS-INSERÇÃO' as status,
  'stock_metrics_snapshot' as tabela,
  COUNT(*) as total_registros,
  COUNT(DISTINCT asset_id) as assets_unicos,
  MAX(asset_id) as maior_asset_id
FROM stock_metrics_snapshot;

-- ================================================================
-- PASSO 4: ATUALIZAR MATERIALIZED VIEW
-- ================================================================

REFRESH MATERIALIZED VIEW stocks_ativos_reais;

-- ================================================================
-- PASSO 5: VERIFICAÇÃO FINAL COMPLETA
-- ================================================================

SELECT 
  'RESULTADO FINAL' as status,
  'stocks_ativos_reais' as tabela,
  COUNT(*) as total_acoes_ativas,
  COUNT(CASE WHEN returns_12m IS NOT NULL THEN 1 END) as com_metricas_12m,
  COUNT(CASE WHEN current_price IS NOT NULL THEN 1 END) as com_preco_atual
FROM stocks_ativos_reais;

-- Verificar algumas ações específicas
SELECT 
  ticker,
  company_name,
  current_price,
  returns_12m,
  volatility_12m,
  market_cap,
  snapshot_date
FROM stocks_ativos_reais
WHERE ticker IN ('AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA')
ORDER BY ticker;

-- ================================================================
-- RESULTADO ESPERADO:
-- 
-- ANTES DA EXECUÇÃO:
-- - assets_master: ~39 stocks
-- - stock_metrics_snapshot: ~39 registros
-- - stocks_ativos_reais: ~39 ações
-- 
-- APÓS A EXECUÇÃO (se bem-sucedida):
-- - stock_metrics_snapshot: ~65 registros (+26 novos)
-- - stocks_ativos_reais: Depende dos asset_id existentes
-- 
-- POSSÍVEIS PROBLEMAS:
-- 1. "violates foreign key constraint" - asset_id não existe
-- 2. "Query is too large" - arquivo muito grande
-- 3. "duplicate key value" - registros já existem
-- ================================================================