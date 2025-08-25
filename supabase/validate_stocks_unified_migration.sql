-- ===============================================
-- 🔍 VALIDAÇÃO COMPLETA DA MIGRAÇÃO STOCKS_UNIFIED
-- ===============================================
-- Data: Janeiro 2025
-- Objetivo: Validar integridade e completude da migração
-- Escopo: Verificar se todos os dados foram preservados corretamente
-- ===============================================

-- ===============================================
-- 📊 1. VALIDAÇÃO DE CONTAGENS BÁSICAS
-- ===============================================

SELECT '🔢 CONTAGEM DE REGISTROS' as categoria;

WITH migration_counts AS (
    SELECT 
        (SELECT COUNT(*) FROM assets_master WHERE asset_type = 'STOCK') as original_stocks,
        (SELECT COUNT(*) FROM stock_metrics_snapshot) as original_metrics,
        (SELECT COUNT(*) FROM stocks_unified) as unified_stocks
)
SELECT 
    original_stocks,
    original_metrics, 
    unified_stocks,
    CASE 
        WHEN unified_stocks = original_stocks AND unified_stocks = original_metrics THEN '✅ CONTAGENS CORRETAS'
        WHEN unified_stocks = original_stocks THEN '✅ STOCKS OK, ⚠️ VERIFICAR METRICS'
        ELSE '❌ DISCREPÂNCIA NAS CONTAGENS'
    END as status_contagem
FROM migration_counts;

-- ===============================================
-- 📊 2. VALIDAÇÃO DE INTEGRIDADE REFERENCIAL
-- ===============================================

SELECT '🔗 INTEGRIDADE REFERENCIAL' as categoria;

-- Verificar se todos os tickers são únicos
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT ticker) as unique_tickers,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT ticker) THEN '✅ SEM DUPLICATAS'
        ELSE '❌ DUPLICATAS ENCONTRADAS'
    END as uniqueness_status
FROM stocks_unified;

-- Verificar se todos os assets_master.stocks têm correspondência
WITH missing_stocks AS (
    SELECT am.ticker, am.name
    FROM assets_master am
    LEFT JOIN stocks_unified su ON am.ticker = su.ticker
    WHERE am.asset_type = 'STOCK' AND su.ticker IS NULL
)
SELECT 
    COUNT(*) as missing_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODOS OS STOCKS MIGRADOS'
        ELSE '❌ STOCKS FALTANDO: ' || STRING_AGG(ticker, ', ')
    END as missing_status
FROM missing_stocks;

-- ===============================================
-- 📊 3. VALIDAÇÃO DE COMPLETUDE DOS CAMPOS CRÍTICOS
-- ===============================================

SELECT '📈 COMPLETUDE DOS CAMPOS CRÍTICOS' as categoria;

SELECT 
    -- Campos de identificação
    COUNT(CASE WHEN ticker IS NOT NULL AND ticker != '' THEN 1 END) as ticker_count,
    ROUND(COUNT(CASE WHEN ticker IS NOT NULL AND ticker != '' THEN 1 END) * 100.0 / COUNT(*), 1) as ticker_pct,
    
    COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as name_count,
    ROUND(COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) * 100.0 / COUNT(*), 1) as name_pct,
    
    -- Campos de mercado
    COUNT(CASE WHEN current_price IS NOT NULL AND current_price > 0 THEN 1 END) as price_count,
    ROUND(COUNT(CASE WHEN current_price IS NOT NULL AND current_price > 0 THEN 1 END) * 100.0 / COUNT(*), 1) as price_pct,
    
    COUNT(CASE WHEN market_cap IS NOT NULL AND market_cap > 0 THEN 1 END) as mcap_count,
    ROUND(COUNT(CASE WHEN market_cap IS NOT NULL AND market_cap > 0 THEN 1 END) * 100.0 / COUNT(*), 1) as mcap_pct,
    
    -- Campos de performance
    COUNT(CASE WHEN returns_12m IS NOT NULL THEN 1 END) as returns_12m_count,
    ROUND(COUNT(CASE WHEN returns_12m IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as returns_12m_pct,
    
    -- IA Vertical
    COUNT(CASE WHEN ai_investment_thesis IS NOT NULL AND ai_investment_thesis != '' THEN 1 END) as ai_thesis_count,
    ROUND(COUNT(CASE WHEN ai_investment_thesis IS NOT NULL AND ai_investment_thesis != '' THEN 1 END) * 100.0 / COUNT(*), 1) as ai_thesis_pct,
    
    COUNT(*) as total_records
FROM stocks_unified;

-- ===============================================
-- 📊 4. VALIDAÇÃO DOS CAMPOS MANTIDOS CONFORME SOLICITAÇÃO
-- ===============================================

SELECT '✅ CAMPOS SOLICITADOS PELO USUÁRIO' as categoria;

SELECT 
    -- Campos que o usuário solicitou manter
    COUNT(CASE WHEN returns_24m IS NOT NULL THEN 1 END) as returns_24m_count,
    ROUND(COUNT(CASE WHEN returns_24m IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as returns_24m_pct,
    
    COUNT(CASE WHEN pb_ratio IS NOT NULL THEN 1 END) as pb_ratio_count,
    ROUND(COUNT(CASE WHEN pb_ratio IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as pb_ratio_pct,
    
    COUNT(CASE WHEN ps_ratio IS NOT NULL THEN 1 END) as ps_ratio_count,
    ROUND(COUNT(CASE WHEN ps_ratio IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as ps_ratio_pct,
    
    COUNT(CASE WHEN peg_ratio IS NOT NULL THEN 1 END) as peg_ratio_count,
    ROUND(COUNT(CASE WHEN peg_ratio IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as peg_ratio_pct,
    
    COUNT(CASE WHEN ten_year_return IS NOT NULL THEN 1 END) as ten_year_return_count,
    ROUND(COUNT(CASE WHEN ten_year_return IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as ten_year_return_pct,
    
    COUNT(CASE WHEN ten_year_volatility IS NOT NULL THEN 1 END) as ten_year_volatility_count,
    ROUND(COUNT(CASE WHEN ten_year_volatility IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as ten_year_volatility_pct,
    
    COUNT(CASE WHEN ten_year_sharpe IS NOT NULL THEN 1 END) as ten_year_sharpe_count,
    ROUND(COUNT(CASE WHEN ten_year_sharpe IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as ten_year_sharpe_pct,
    
    COUNT(CASE WHEN roi IS NOT NULL THEN 1 END) as roi_count,
    ROUND(COUNT(CASE WHEN roi IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as roi_pct,
    
    COUNT(CASE WHEN dividends_all_time IS NOT NULL THEN 1 END) as dividends_all_time_count,
    ROUND(COUNT(CASE WHEN dividends_all_time IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as dividends_all_time_pct,
    
    COUNT(*) as total_records
FROM stocks_unified;

-- ===============================================
-- 📊 5. VALIDAÇÃO DE CONSISTÊNCIA DOS DADOS
-- ===============================================

SELECT '🔍 CONSISTÊNCIA DOS DADOS' as categoria;

-- Verificar dados inconsistentes
SELECT 
    'INCONSISTÊNCIAS DETECTADAS' as tipo,
    COUNT(CASE WHEN current_price IS NOT NULL AND current_price <= 0 THEN 1 END) as precos_negativos,
    COUNT(CASE WHEN market_cap IS NOT NULL AND market_cap <= 0 THEN 1 END) as market_cap_negativo,
    COUNT(CASE WHEN shares_outstanding IS NOT NULL AND shares_outstanding <= 0 THEN 1 END) as shares_negativo,
    COUNT(CASE WHEN pe_ratio IS NOT NULL AND pe_ratio < 0 THEN 1 END) as pe_negativo,
    COUNT(CASE WHEN dividend_yield_12m IS NOT NULL AND dividend_yield_12m < 0 THEN 1 END) as dividend_yield_negativo,
    COUNT(CASE WHEN roe IS NOT NULL AND (roe < -100 OR roe > 100) THEN 1 END) as roe_fora_range,
    COUNT(CASE WHEN profit_margin IS NOT NULL AND (profit_margin < -100 OR profit_margin > 100) THEN 1 END) as profit_margin_fora_range
FROM stocks_unified;

-- Verificar campos calculáveis
SELECT 
    'CAMPOS CALCULÁVEIS' as tipo,
    COUNT(CASE WHEN current_price IS NOT NULL AND shares_outstanding IS NOT NULL AND market_cap IS NULL THEN 1 END) as market_cap_calculavel,
    COUNT(CASE WHEN dividends_12m IS NOT NULL AND current_price IS NOT NULL AND dividend_yield_12m IS NULL THEN 1 END) as dividend_yield_calculavel
FROM stocks_unified;

-- ===============================================
-- 📊 6. VALIDAÇÃO POR SETOR
-- ===============================================

SELECT '🏭 DISTRIBUIÇÃO POR SETOR' as categoria;

SELECT 
    sector,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM stocks_unified), 1) as percentage,
    COUNT(CASE WHEN current_price IS NOT NULL THEN 1 END) as with_price,
    COUNT(CASE WHEN pe_ratio IS NOT NULL THEN 1 END) as with_pe,
    COUNT(CASE WHEN ai_investment_thesis IS NOT NULL THEN 1 END) as with_ai
FROM stocks_unified
WHERE sector IS NOT NULL
GROUP BY sector
ORDER BY count DESC
LIMIT 10;

-- ===============================================
-- 📊 7. TOP STOCKS PARA VALIDAÇÃO VISUAL
-- ===============================================

SELECT '🏆 TOP 10 STOCKS PARA VALIDAÇÃO' as categoria;

SELECT 
    ticker,
    name,
    sector,
    market_cap,
    current_price,
    returns_12m,
    pe_ratio,
    CASE WHEN ai_investment_thesis IS NOT NULL THEN '✅ IA' ELSE '❌' END as has_ai,
    CASE WHEN returns_24m IS NOT NULL THEN '✅ 24M' ELSE '❌' END as has_returns_24m,
    CASE WHEN pb_ratio IS NOT NULL THEN '✅ PB' ELSE '❌' END as has_pb_ratio,
    last_updated
FROM stocks_unified
WHERE market_cap IS NOT NULL
ORDER BY market_cap DESC
LIMIT 10;

-- ===============================================
-- 📊 8. STOCKS COM DADOS INCOMPLETOS
-- ===============================================

SELECT '⚠️ STOCKS COM DADOS CRÍTICOS FALTANDO' as categoria;

SELECT 
    ticker,
    name,
    sector,
    CASE WHEN current_price IS NULL THEN '❌ PRICE' ELSE '✅' END as price_status,
    CASE WHEN market_cap IS NULL THEN '❌ MCAP' ELSE '✅' END as mcap_status,
    CASE WHEN returns_12m IS NULL THEN '❌ RET12M' ELSE '✅' END as returns_status,
    CASE WHEN pe_ratio IS NULL THEN '❌ PE' ELSE '✅' END as pe_status,
    CASE WHEN ai_investment_thesis IS NULL THEN '❌ AI' ELSE '✅' END as ai_status
FROM stocks_unified
WHERE current_price IS NULL 
   OR market_cap IS NULL 
   OR returns_12m IS NULL 
   OR pe_ratio IS NULL 
   OR ai_investment_thesis IS NULL
ORDER BY ticker
LIMIT 20;

-- ===============================================
-- 📊 9. RESUMO FINAL DA VALIDAÇÃO
-- ===============================================

SELECT '🎯 RESUMO FINAL DA VALIDAÇÃO' as categoria;

WITH validation_summary AS (
    SELECT 
        COUNT(*) as total_stocks,
        COUNT(CASE WHEN ticker IS NOT NULL THEN 1 END) as with_ticker,
        COUNT(CASE WHEN current_price IS NOT NULL THEN 1 END) as with_price,
        COUNT(CASE WHEN market_cap IS NOT NULL THEN 1 END) as with_mcap,
        COUNT(CASE WHEN returns_12m IS NOT NULL THEN 1 END) as with_returns,
        COUNT(CASE WHEN pe_ratio IS NOT NULL THEN 1 END) as with_pe,
        COUNT(CASE WHEN ai_investment_thesis IS NOT NULL THEN 1 END) as with_ai,
        
        -- Campos solicitados pelo usuário
        COUNT(CASE WHEN returns_24m IS NOT NULL THEN 1 END) as with_returns_24m,
        COUNT(CASE WHEN pb_ratio IS NOT NULL THEN 1 END) as with_pb_ratio,
        COUNT(CASE WHEN ps_ratio IS NOT NULL THEN 1 END) as with_ps_ratio,
        COUNT(CASE WHEN peg_ratio IS NOT NULL THEN 1 END) as with_peg_ratio,
        COUNT(CASE WHEN ten_year_return IS NOT NULL THEN 1 END) as with_ten_year_return,
        COUNT(CASE WHEN roi IS NOT NULL THEN 1 END) as with_roi,
        COUNT(CASE WHEN dividends_all_time IS NOT NULL THEN 1 END) as with_dividends_all_time
    FROM stocks_unified
)
SELECT 
    total_stocks as "Total de Ações",
    ROUND(with_ticker * 100.0 / total_stocks, 1) || '% com Ticker' as "Identificação",
    ROUND(with_price * 100.0 / total_stocks, 1) || '% com Preço' as "Dados de Mercado",
    ROUND(with_returns * 100.0 / total_stocks, 1) || '% com Retornos' as "Performance",
    ROUND(with_pe * 100.0 / total_stocks, 1) || '% com P/E' as "Fundamentais",
    ROUND(with_ai * 100.0 / total_stocks, 1) || '% com IA' as "IA Vertical",
    
    -- Status dos campos solicitados
    ROUND(with_returns_24m * 100.0 / total_stocks, 1) || '% returns_24m' as "Campo Solicitado 1",
    ROUND(with_pb_ratio * 100.0 / total_stocks, 1) || '% pb_ratio' as "Campo Solicitado 2",
    ROUND(with_ps_ratio * 100.0 / total_stocks, 1) || '% ps_ratio' as "Campo Solicitado 3",
    ROUND(with_peg_ratio * 100.0 / total_stocks, 1) || '% peg_ratio' as "Campo Solicitado 4",
    ROUND(with_ten_year_return * 100.0 / total_stocks, 1) || '% ten_year_return' as "Campo Solicitado 5",
    ROUND(with_roi * 100.0 / total_stocks, 1) || '% roi' as "Campo Solicitado 6",
    ROUND(with_dividends_all_time * 100.0 / total_stocks, 1) || '% dividends_all_time' as "Campo Solicitado 7"
FROM validation_summary;

-- ===============================================
-- 🎉 STATUS FINAL DA MIGRAÇÃO
-- ===============================================

WITH final_status AS (
    SELECT 
        COUNT(*) as migrated_count,
        (SELECT COUNT(*) FROM assets_master WHERE asset_type = 'STOCK') as expected_count
    FROM stocks_unified
)
SELECT 
    CASE 
        WHEN migrated_count = expected_count THEN '🎉 MIGRAÇÃO COMPLETA E BEM-SUCEDIDA!'
        WHEN migrated_count > 0 THEN '⚠️ MIGRAÇÃO PARCIAL - VERIFICAR DISCREPÂNCIAS'
        ELSE '❌ FALHA NA MIGRAÇÃO - TABELA VAZIA'
    END as status_final,
    migrated_count || ' de ' || expected_count || ' ações migradas' as detalhes
FROM final_status;

-- ===============================================
-- 📋 PRÓXIMOS PASSOS RECOMENDADOS
-- ===============================================

SELECT '📋 PRÓXIMOS PASSOS' as categoria;

SELECT 
    'ESTRATÉGIAS DE PREENCHIMENTO RECOMENDADAS' as acao,
    '1. Calcular returns_24m, ten_year_* via stock_prices_daily' as passo_1,
    '2. Buscar pb_ratio, ps_ratio, peg_ratio via yfinance' as passo_2,
    '3. Calcular roi a partir de fundamentais existentes' as passo_3,
    '4. Somar dividends_all_time do histórico' as passo_4,
    '5. Implementar pipeline de atualização automática' as passo_5;
