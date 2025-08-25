-- ETL Pipeline para Ações - Comandos MCP Supabase\n-- Gerado em: 2025-08-14 15:25:57.962099\n-- Projeto: nniabnjuwzeqmflrruga\n\n-- ===== AÇÃO 1: AAPL =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('AAPL', 'STOCK', 'Apple Inc.', 'NASDAQ', 
                'Technology', 'Consumer Electronics', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'AAPL'),
            CURRENT_DATE,
            232.66000366210938,
            3452767567872,
            14840399872,
            56346919,
            5.422527927182452,
            32.10765890837863,
            1.165,
            0.45,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:40.046501"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AAPL'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                35.358665,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:40.046501"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 2: MSFT =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('MSFT', 'STOCK', 'Microsoft Corporation', 'NASDAQ', 
                'Technology', 'Software - Infrastructure', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'MSFT'),
            CURRENT_DATE,
            521.2150268554688,
            3874279915520,
            7433169920,
            18561430,
            25.99222012052904,
            24.933683169426615,
            1.055,
            0.64,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:41.861208"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'MSFT'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                38.212246,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:41.861208"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 3: GOOGL =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('GOOGL', 'STOCK', 'Alphabet Inc.', 'NASDAQ', 
                'Technology', 'Internet Content & Information', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'GOOGL'),
            CURRENT_DATE,
            203.0800018310547,
            2461898375168,
            5816999936,
            36077994,
            27.2455858121859,
            31.05702235849227,
            1.014,
            0.42,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:43.645070"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'GOOGL'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                21.673426,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:43.645070"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 4: AMZN =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('AMZN', 'STOCK', 'Amazon.com Inc.', 'NASDAQ', 
                'Consumer Discretionary', 'Internet Retail', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'AMZN'),
            CURRENT_DATE,
            232.5500030517578,
            2480122363904,
            10664899584,
            43804211,
            36.71369471335455,
            34.08905450187839,
            1.314,
            None,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:45.407929"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AMZN'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                35.449696,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:45.407929"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 5: TSLA =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('TSLA', 'STOCK', 'Tesla Inc.', 'NASDAQ', 
                'Consumer Discretionary', 'Auto Manufacturers', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'TSLA'),
            CURRENT_DATE,
            333.24951171875,
            1074881232896,
            3225449984,
            88852187,
            65.48291967351739,
            71.75589191657625,
            2.331,
            None,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:47.203298"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'TSLA'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                196.0294,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:47.203298"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 6: NVDA =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('NVDA', 'STOCK', 'NVIDIA Corporation', 'NASDAQ', 
                'Technology', 'Semiconductors', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'NVDA'),
            CURRENT_DATE,
            181.6956024169922,
            4431227125760,
            24387600384,
            156433414,
            53.92360245978325,
            52.31817052982132,
            2.145,
            0.02,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:49.015726"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'NVDA'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                58.42444,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:49.015726"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 7: META =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('META', 'STOCK', 'Meta Platforms Inc.', 'NASDAQ', 
                'Technology', 'Internet Content & Information', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'META'),
            CURRENT_DATE,
            782.7000122070312,
            1966252097536,
            2168960000,
            11979124,
            49.09637675219758,
            36.628850627982736,
            1.273,
            0.27,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:51.133343"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'META'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                28.420479,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:51.133343"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 8: BRK-B =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('BRK-B', 'STOCK', 'Berkshire Hathaway Inc.', 'NYSE', 
                'Financial Services', 'Insurance - Diversified', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'BRK-B'),
            CURRENT_DATE,
            476.9100036621094,
            1028609015808,
            1378550016,
            4542507,
            8.766848891460999,
            19.565724443543022,
            0.8,
            None,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:52.984954"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'BRK-B'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                16.354939,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:52.984954"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 9: JNJ =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('JNJ', 'STOCK', 'Johnson & Johnson', 'NYSE', 
                'Healthcare', 'Drug Manufacturers - General', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'JNJ'),
            CURRENT_DATE,
            174.9600067138672,
            421363187712,
            2408339968,
            8392671,
            13.995803715533107,
            19.193554747951826,
            0.399,
            2.98,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:55.131732"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'JNJ'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                18.752413,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:55.131732"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n-- ===== AÇÃO 10: JPM =====\n
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('JPM', 'STOCK', 'JPMorgan Chase & Co.', 'NYSE', 
                'Financial Services', 'Banks - Diversified', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        \n\n
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = 'JPM'),
            CURRENT_DATE,
            292.31500244140625,
            803793207296,
            2749750016,
            8453248,
            42.16093849647091,
            27.55033842651344,
            1.107,
            1.93,
            '{"source": "yfinance", "collected_at": "2025-08-14T15:25:56.961259"}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        \n\n
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'JPM'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                14.998204,
                '{"source": "yfinance_info", "collected_at": "2025-08-14T15:25:56.961259"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            \n\n\n