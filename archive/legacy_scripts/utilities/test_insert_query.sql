INSERT INTO etfs_ativos_reais (
            symbol, name, description, isin, assetclass, domicile, website, etfcompany,
            expenseratio, totalasset, avgvolume, inceptiondate, nav, navcurrency, holdingscount,
            returns_12m, volatility_12m, returns_24m, volatility_24m, returns_36m, volatility_36m,
            returns_5y, ten_year_return, ten_year_volatility, sharpe_12m, sharpe_24m, sharpe_36m,
            ten_year_sharpe, max_drawdown, dividends_12m, dividends_24m, dividends_36m,
            dividends_all_time, size_category, liquidity_category, etf_type, updatedat
        ) VALUES (
            'IVVW', 'iShares S&P 500 BuyWrite ETF', 'The index is designed to measure the performance of a strategy of holding the iShares Core S&P 500 ETF while writing (selling) one-month call options primarily on the S&P 500 Index to generate income. The fund seeks to achieve its investment objective by investing a substantial portion of its assets in the underlying fund and options on the option index.', NULL,
            'Derivative Income', NULL, NULL, 'iShares',
            NULL, 41445088, 8327, to_timestamp(1710374400),
            44.86461, 'USD', NULL,
            8.727632812433516, 17.101626949124938, 12.99659414851455, 15.3717105846897,
            12.996615413278079, 15.371724413721788, 12.996615413278079, 12.99659414851455,
            15.371727341398616, 0.3933913909154566, 0.7153786878779264, 0.7153794276627672,
            0.7153779080441334, -16.790002260201554, NULL, NULL,
            NULL, NULL, 'Micro',
            'Very Low', 'Equity', NOW()
        );