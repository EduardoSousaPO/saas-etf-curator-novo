UPDATE etfs_ativos_reais 
    SET dividends_12m = CASE symbol
        WHEN 'GURU' THEN 0.315
    END,
    updatedat = NOW()
    WHERE symbol IN ('GURU');