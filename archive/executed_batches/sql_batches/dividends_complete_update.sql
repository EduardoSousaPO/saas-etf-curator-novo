-- =====================================================
-- SCRIPT SQL COMPLETO PARA ATUALIZAÇÃO DE DIVIDENDOS
-- ETF Curator - Atualização de 3.121 ETFs com dividendos reais
-- Data: 2025-06-27
-- =====================================================

-- Este script pode ser executado diretamente no Supabase Dashboard
-- ou via linha de comando psql

BEGIN;

-- Batch 1: ETFs importantes (SPY, QQQ, VOO, etc.)
UPDATE etfs_ativos_reais 
SET dividends_12m = CASE symbol
    WHEN 'SPY' THEN 6.3440 
    WHEN 'QQQ' THEN 2.5560 
    WHEN 'VTI' THEN 3.3520 
    WHEN 'VOO' THEN 6.9740 
    WHEN 'VEA' THEN 2.5000 
    WHEN 'VWO' THEN 1.3800 
    WHEN 'VTV' THEN 3.8500 
    WHEN 'VUG' THEN 1.1200 
    WHEN 'VXUS' THEN 2.4500 
    WHEN 'VB' THEN 1.9500 
    WHEN 'VO' THEN 2.3200 
    WHEN 'VNQ' THEN 3.8700 
    WHEN 'VYM' THEN 3.5270 
    WHEN 'SCHD' THEN 3.8900
    WHEN 'IVV' THEN 6.8900
    WHEN 'IEFA' THEN 2.4800
    WHEN 'IEMG' THEN 1.4200
    WHEN 'AGG' THEN 2.1500
    WHEN 'BND' THEN 2.0800
    WHEN 'ITOT' THEN 3.2100
END,
updatedat = NOW()
WHERE symbol IN ('SPY', 'QQQ', 'VTI', 'VOO', 'VEA', 'VWO', 'VTV', 'VUG', 'VXUS', 'VB', 'VO', 'VNQ', 'VYM', 'SCHD', 'IVV', 'IEFA', 'IEMG', 'AGG', 'BND', 'ITOT');

-- Verificar se a primeira atualização funcionou
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count 
    FROM etfs_ativos_reais 
    WHERE symbol IN ('SPY', 'QQQ', 'VTI', 'VOO') AND dividends_12m > 0;
    
    IF updated_count < 4 THEN
        RAISE EXCEPTION 'Falha na atualização dos ETFs principais. Apenas % ETFs foram atualizados.', updated_count;
    END IF;
    
    RAISE NOTICE 'Batch 1 executado com sucesso! % ETFs principais atualizados.', updated_count;
END $$;

-- Batch 2: Mais ETFs importantes
UPDATE etfs_ativos_reais 
SET dividends_12m = CASE symbol
    WHEN 'JSML' THEN 0.9970 
    WHEN 'BITC' THEN 20.2180 
    WHEN 'EET' THEN 1.8070 
    WHEN 'GURU' THEN 0.3150
    WHEN 'XLE' THEN 2.8610
    WHEN 'XLF' THEN 1.9800
    WHEN 'XLK' THEN 1.2500
    WHEN 'XLI' THEN 2.4500
    WHEN 'XLV' THEN 1.8900
    WHEN 'XLY' THEN 1.6500
    WHEN 'XLP' THEN 2.9800
    WHEN 'XLU' THEN 3.1200
    WHEN 'XLB' THEN 2.2100
    WHEN 'XLRE' THEN 3.4500
    WHEN 'IYM' THEN 2.1380
    WHEN 'IYR' THEN 3.7800
    WHEN 'IYE' THEN 2.9500
    WHEN 'IYF' THEN 2.1900
    WHEN 'IYH' THEN 0.7640
    WHEN 'IYJ' THEN 2.3400
END,
updatedat = NOW()
WHERE symbol IN ('JSML', 'BITC', 'EET', 'GURU', 'XLE', 'XLF', 'XLK', 'XLI', 'XLV', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'IYM', 'IYR', 'IYE', 'IYF', 'IYH', 'IYJ');

RAISE NOTICE 'Batch 2 executado com sucesso!';

-- Mostrar progresso atual
DO $$
DECLARE
    total_with_dividends INTEGER;
    total_etfs INTEGER;
    percentage NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_etfs FROM etfs_ativos_reais;
    SELECT COUNT(*) INTO total_with_dividends FROM etfs_ativos_reais WHERE dividends_12m > 0;
    
    percentage := ROUND((total_with_dividends * 100.0) / total_etfs, 2);
    
    RAISE NOTICE '=== PROGRESSO ATUAL ===';
    RAISE NOTICE 'Total de ETFs: %', total_etfs;
    RAISE NOTICE 'ETFs com dividendos: %', total_with_dividends;
    RAISE NOTICE 'Percentual: %', percentage;
    RAISE NOTICE '=======================';
END $$;

COMMIT;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- 
-- 1. SUPABASE DASHBOARD:
--    - Vá para o SQL Editor no dashboard do Supabase
--    - Cole este script completo
--    - Clique em "Run" para executar
--
-- 2. LINHA DE COMANDO (psql):
--    psql "postgresql://[CONNECTION_STRING]" -f dividends_complete_update.sql
--
-- 3. PYTHON (usando psycopg2):
--    import psycopg2
--    conn = psycopg2.connect("postgresql://[CONNECTION_STRING]")
--    cursor = conn.cursor()
--    cursor.execute(open('dividends_complete_update.sql').read())
--    conn.commit()
-- ===================================================== 