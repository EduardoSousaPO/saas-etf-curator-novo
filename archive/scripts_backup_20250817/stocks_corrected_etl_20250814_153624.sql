-- ETL CORRIGIDO - Específico para AÇÕES (não ETFs)\n-- Gerado em: 2025-08-14 15:36:24.306960\n\n-- CLDI\n
            UPDATE assets_master SET
                business_description = 'Calidi Biotherapeutics, Inc. is a clinical-stage immuno-oncology company. The Company is developing proprietary allogeneic stem cell-based and enveloped virus platforms to potentiate and deliver oncolytic viruses (vaccinia virus and adenovirus) and, potentially, other molecules to cancer patients. It is focused on developing two proprietary stem cell-based platforms and one enveloped vaccinia virus platform designed to protect the oncolytic virus, whether natural or engineered, from neutralization by the patients immune defenses, allowing for greater infection of the tumor cells and leading to a potential improvement in the antitumor activity of oncolytic viruses over traditional naked oncolytic virus therapies. Its product candidates include the CLD-101 product for high grade glioma (HGG), CLD-101 product for Recurrent HGG, CLD-201 product for solid tumors, CLD-301 (AAA) for multiple indications and CLD-400 (RTNova) for certain lung cancer and metastatic solid tumors.',
                website = 'https://www.calidibio.com',
                headquarters = 'San Diego, CA, United States',
                employees_count = 28,
                ceo_name = 'Mr. Andrew C. Jackson',
                industry = 'Biotechnology',
                updated_at = now()
            WHERE ticker = 'CLDI' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'CLDI'),
                CURRENT_DATE,
                5.425000190734863,
                15606207,
                2876720,
                2924489,
                -71.74479179601703,
                194.55854994754378,
                1.156,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:45.102929", "data_type": "stock_specific"}',
                now()
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
            \n\n-- AMD\n
            UPDATE assets_master SET
                business_description = 'Advanced Micro Devices, Inc. É uma empresa global de semicondutores. Ele é focado em computação de alto desempenho, gráficos e tecnologias de visualização. Atua em quatro segmentos. O segmento de Data Center inclui aceleradores de inteligência artificial (IA), unidades de processamento central de servidor (CPUs), unidades de processamento gráfico (GPUs), unidades de processamento de dados (DPUs), matrizes de porta programáveis de campo (FPGAs), placas de interface de rede inteligentes (SmartNICs) e produtos de sistema-on-chip (SoC) adaptativo para data centers. O segmento Cliente inclui principalmente CPUs, APUs e chipsets para desktops e notebooks. O segmento Gaming inclui principalmente GPUs discretas, produtos SoC semi-personalizados e serviços de desenvolvimento. O segmento incorporado inclui CPUs incorporadas, GPUs, APUs, FPGAs, sistema em módulos (SOM) e produtos de SoC adaptáveis. Comercializa e vende seus produtos sob a marca registrada AMD. Seus produtos incluem AMD EPYC, AMD Ryzen, AMD Ryzen PRO, Virtex UltraScale e outros.',
                website = 'https://www.amd.com',
                headquarters = 'Santa Clara, CA, United States',
                employees_count = 28000,
                ceo_name = 'Dr. Lisa T. Su Ph.D.',
                industry = 'Semiconductors',
                updated_at = now()
            WHERE ticker = 'AMD' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AMD'),
                CURRENT_DATE,
                180.44949340820312,
                292840669184,
                1622840064,
                63046022,
                28.20567915325267,
                52.6596928044201,
                1.94,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:47.256784", "data_type": "stock_specific"}',
                now()
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
                asset_id, quarter_date, pe_ratio, peg_ratio, pb_ratio, ps_ratio,
                ev_ebitda, roe, roa, gross_margin, operating_margin, net_margin,
                debt_to_equity, current_ratio, quick_ratio, revenue_growth_yoy,
                earnings_growth_yoy, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AMD'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                107.410416,
                NULL,
                4.9055185,
                9.89302,
                53.957,
                0.04699,
                0.0219,
                0.095740005,
                -0.01275,
                0.095740005,
                6.513,
                2.491,
                1.174,
                0.317,
                2.336,
                '{"source": "yfinance_fundamentals", "collected_at": "2025-08-14T15:35:47.256784"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                peg_ratio = EXCLUDED.peg_ratio,
                pb_ratio = EXCLUDED.pb_ratio,
                ps_ratio = EXCLUDED.ps_ratio,
                ev_ebitda = EXCLUDED.ev_ebitda,
                roe = EXCLUDED.roe,
                roa = EXCLUDED.roa,
                gross_margin = EXCLUDED.gross_margin,
                operating_margin = EXCLUDED.operating_margin,
                net_margin = EXCLUDED.net_margin,
                debt_to_equity = EXCLUDED.debt_to_equity,
                current_ratio = EXCLUDED.current_ratio,
                quick_ratio = EXCLUDED.quick_ratio,
                revenue_growth_yoy = EXCLUDED.revenue_growth_yoy,
                earnings_growth_yoy = EXCLUDED.earnings_growth_yoy,
                source_meta = EXCLUDED.source_meta;
            \n\n-- DNN\n
            UPDATE assets_master SET
                business_description = 'Denison Mines Corp. is a Canada-based uranium exploration and development company focused on the Athabasca Basin region of northern Saskatchewan, Canada. The Company holds a 95% interest in the Wheeler River Project, which is a uranium project. It hosts two uranium deposits: Phoenix and Gryphon. It is located along the eastern edge of the Athabasca Basin in northern Saskatchewan. It holds a 22.5% ownership interest in the McClean Lake joint venture (MLJV), which includes several uranium deposits and the McClean Lake uranium mill. It also holds a 25.17% interest in the Midwest Main and Midwest A deposits, and a 67.41% interest in the Tthe Heldeth Tue (THT) and Huskie deposits on the Waterbury Lake property. The Company, through JCU (Canada) Exploration Company, Limited, holds indirect interests in the Millennium project, the Kiggavik project, and the Christie Lake project. It also offers environmental services. The Company also uses MaxPERF drilling tool technology and systems.',
                website = 'https://denisonmines.com',
                headquarters = 'Toronto, ON, Canada',
                employees_count = NULL,
                ceo_name = 'Mr. David Daniel Cates C.A., C.P.A., MAcc',
                industry = 'Uranium',
                updated_at = now()
            WHERE ticker = 'DNN' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'DNN'),
                CURRENT_DATE,
                2.0285000801086426,
                1818657920,
                896553024,
                71410879,
                29.20382244194526,
                63.013150726897926,
                1.874,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:49.222732", "data_type": "stock_specific"}',
                now()
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
            \n\n-- BBAI\n
            UPDATE assets_master SET
                business_description = 'BigBear.ai Holdings, Inc. is a provider of artificial intelligence (AI)-powered decision intelligence solutions for national security, supply chain management and digital identity. The Company is a technology-led solutions organization, providing both software and services to its customers. It combines subject-matter expertise with technology to connect the enterprise, provide insights on process performance and recommendations for managing risk. It offers computer vision, anomaly/event detection, and descriptive and predictive analytics to support operations and break down silos between vendors and systems. The Companys customers span the public and private sector, including the United States defense and intelligence agencies, border protection, transportation security, manufacturing, distribution and logistics, as well as travel, entertainment and tourism. It also offers software assets that are tailored for digital identity and biometrics, leveraging advanced vision AI technology.',
                website = 'https://bigbear.ai',
                headquarters = 'McLean, VA, United States',
                employees_count = 630,
                ceo_name = 'Mr. Kevin  McAleenan',
                industry = 'Information Technology Services',
                updated_at = now()
            WHERE ticker = 'BBAI' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'BBAI'),
                CURRENT_DATE,
                5.809899806976318,
                2153747456,
                291188992,
                111481917,
                380.1569937033852,
                139.9455720059398,
                3.192,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:51.160881", "data_type": "stock_specific"}',
                now()
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
            \n\n-- AAL\n
            UPDATE assets_master SET
                business_description = 'American Airlines Group Inc. É uma holding. Sua principal atividade de negócios é a operação de uma grande rede aérea, fornecendo transporte aéreo regular para passageiros e carga através de seus hubs em Charlotte, Chicago, Dallas/Fort Worth, Los Angeles, Miami, nova Iorque, Filadélfia, Phoenix e Washington, D.C. e gateways de parceiros, incluindo Londres, Doha, Madrid, Seattle/Tacoma, Sydney e Tóquio, entre outros. Juntamente com suas subsidiárias regionais de companhias aéreas e companhias aéreas regionais terceirizadas que operam como American Eagle. A sua divisão de cargas oferece uma ampla gama de serviços de frete e correio, com instalações e conexões interline disponíveis em todo o mundo. Opera aproximadamente 977 aeronaves principais apoiadas por suas subsidiárias regionais de companhias aéreas e companhias aéreas regionais terceirizadas, que operam juntas mais 585 aeronaves regionais. Suas subsidiárias incluem American Airlines, Inc., Envoy Aviation Group Inc., PSA Airlines, Inc. E Piedmont Airlines, Inc.',
                website = 'https://www.aa.com',
                headquarters = 'Fort Worth, TX, United States',
                employees_count = 138100,
                ceo_name = 'Mr. Robert D. Isom Jr.',
                industry = 'Airlines',
                updated_at = now()
            WHERE ticker = 'AAL' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AAL'),
                CURRENT_DATE,
                12.754400253295898,
                8415723008,
                659828992,
                69233573,
                30.948670975499184,
                55.60692384963035,
                1.431,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:53.080520", "data_type": "stock_specific"}',
                now()
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
                asset_id, quarter_date, pe_ratio, peg_ratio, pb_ratio, ps_ratio,
                ev_ebitda, roe, roa, gross_margin, operating_margin, net_margin,
                debt_to_equity, current_ratio, quick_ratio, revenue_growth_yoy,
                earnings_growth_yoy, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AAL'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                15.18381,
                NULL,
                -2.1746633,
                0.15513583,
                7.298,
                NULL,
                0.027999999,
                0.01045,
                0.08289,
                0.01045,
                NULL,
                0.585,
                0.412,
                0.004,
                -0.1,
                '{"source": "yfinance_fundamentals", "collected_at": "2025-08-14T15:35:53.080520"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                peg_ratio = EXCLUDED.peg_ratio,
                pb_ratio = EXCLUDED.pb_ratio,
                ps_ratio = EXCLUDED.ps_ratio,
                ev_ebitda = EXCLUDED.ev_ebitda,
                roe = EXCLUDED.roe,
                roa = EXCLUDED.roa,
                gross_margin = EXCLUDED.gross_margin,
                operating_margin = EXCLUDED.operating_margin,
                net_margin = EXCLUDED.net_margin,
                debt_to_equity = EXCLUDED.debt_to_equity,
                current_ratio = EXCLUDED.current_ratio,
                quick_ratio = EXCLUDED.quick_ratio,
                revenue_growth_yoy = EXCLUDED.revenue_growth_yoy,
                earnings_growth_yoy = EXCLUDED.earnings_growth_yoy,
                source_meta = EXCLUDED.source_meta;
            \n\n-- DRRX\n
            UPDATE assets_master SET
                business_description = 'DURECT Corporation is a late-stage biopharmaceutical company. The Company is engaged in the development of epigenetic therapies that target dysregulated deoxyribonucleic acid (DNA) methylation to transform the treatment of serious and life-threatening conditions, including acute organ injury. Its lead drug candidate, Larsucosterol binds to and inhibits the activity of DNA methyltransferases, epigenetic enzymes that are elevated and associated with hypermethylation found in alcoholic hepatitis (AH) patients. Larsucosterol is in clinical development for the potential treatment of AH, for which the FDA has granted a Fast Track and a Therapy designation, and metabolic dysfunction-associated steatohepatitis (MASH) is also being explored. Its commercial pharmaceutical product includes POSIMIR (bupivacaine solution) for infiltration use, a non-opioid analgesic utilizing the SABER platform technology. It has developed a proprietary drug product for the treatment of ADHD called Methydur.',
                website = 'https://www.durect.com',
                headquarters = 'Cupertino, CA, United States',
                employees_count = 21,
                ceo_name = 'Dr. James E. Brown D.V.M.',
                industry = 'Drug Manufacturers - Specialty & Generic',
                updated_at = now()
            WHERE ticker = 'DRRX' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'DRRX'),
                CURRENT_DATE,
                1.8949999809265137,
                58825728,
                31042600,
                1981527,
                42.4811969759562,
                254.50229459007323,
                0.845,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:55.007479", "data_type": "stock_specific"}',
                now()
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
            \n\n-- SMCI\n
            UPDATE assets_master SET
                business_description = 'Super Micro Computer, Inc. provides application-optimized Total IT solutions. It delivers rack-scale solutions optimized for various workloads, including artificial intelligence and high-performance computing, where acceleration is critical. It produces a portfolio of server and storage solutions for enterprise data centers, cloud service providers and edge computing (5G Telco, Retail and embedded). Total IT Solutions include complete servers, storage systems, modular blade servers, workstations, full-rack scale solutions, networking devices, server sub-systems, server management and security software. It provides global support and services to help its customers install, upgrade and maintain their computing infrastructure, including liquid-cooling operations. It offers platforms in rackmount, blade, multi-node and embedded form factors, which support single, dual and multiprocessor architectures. Its key product lines include SuperBlade and MicroBlade, SuperStorage, Twin and others.',
                website = 'https://www.supermicro.com',
                headquarters = 'San Jose, CA, United States',
                employees_count = NULL,
                ceo_name = 'Mr. Charles  Liang',
                industry = 'Computer Hardware',
                updated_at = now()
            WHERE ticker = 'SMCI' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'SMCI'),
                CURRENT_DATE,
                45.2599983215332,
                27011981312,
                596817984,
                39438338,
                -21.572027571531272,
                113.27230407056263,
                1.456,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:56.981217", "data_type": "stock_specific"}',
                now()
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
                asset_id, quarter_date, pe_ratio, peg_ratio, pb_ratio, ps_ratio,
                ev_ebitda, roe, roa, gross_margin, operating_margin, net_margin,
                debt_to_equity, current_ratio, quick_ratio, revenue_growth_yoy,
                earnings_growth_yoy, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'SMCI'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                26.940475,
                NULL,
                4.2920814,
                1.2293797,
                20.931,
                0.17899999,
                0.065689996,
                0.04774,
                0.03967,
                0.04774,
                80.677,
                5.317,
                3.218,
                0.075,
                -0.328,
                '{"source": "yfinance_fundamentals", "collected_at": "2025-08-14T15:35:56.981217"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                peg_ratio = EXCLUDED.peg_ratio,
                pb_ratio = EXCLUDED.pb_ratio,
                ps_ratio = EXCLUDED.ps_ratio,
                ev_ebitda = EXCLUDED.ev_ebitda,
                roe = EXCLUDED.roe,
                roa = EXCLUDED.roa,
                gross_margin = EXCLUDED.gross_margin,
                operating_margin = EXCLUDED.operating_margin,
                net_margin = EXCLUDED.net_margin,
                debt_to_equity = EXCLUDED.debt_to_equity,
                current_ratio = EXCLUDED.current_ratio,
                quick_ratio = EXCLUDED.quick_ratio,
                revenue_growth_yoy = EXCLUDED.revenue_growth_yoy,
                earnings_growth_yoy = EXCLUDED.earnings_growth_yoy,
                source_meta = EXCLUDED.source_meta;
            \n\n-- AMDL\n
            UPDATE assets_master SET
                business_description = 'The fund is an actively managed exchange traded fund that attempts to replicate 2 times (200%) the daily percentage change of the underlying stock by entering into financial instruments such as swaps and options on the underlying stock as well as directly purchasing the underlying stock. The fund will aim to primarily obtain its notional exposure against the underlying stock through swap agreements. The fund is non-diversified.',
                website = '',
                headquarters = '',
                employees_count = NULL,
                ceo_name = '',
                industry = '',
                updated_at = now()
            WHERE ticker = 'AMDL' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AMDL'),
                CURRENT_DATE,
                13.229999542236328,
                NULL,
                NULL,
                39537276,
                13.65978652935067,
                105.299985182943,
                NULL,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:35:58.731718", "data_type": "stock_specific"}',
                now()
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
            \n\n-- ADAP\n
            UPDATE assets_master SET
                business_description = 'Adaptimmune Therapeutics PLC is a commercial-stage biopharmaceutical company. The Company is focused on providing cell therapies to people with cancer. The engineered T cell receptor (TCR) platform, which the Company is developing for personalized medicines designed to target and destroy difficult-to-treat solid tumor cancers. It is focused on the commercialization of TECELRA, which is a genetically modified autologous T-cell immunotherapy indicated for the treatment of adults with advanced synovial sarcoma. Its second T-cell immunotherapy, letetresgene autoleucel (lete-cel), targets the NY-ESO antigen in people with synovial sarcoma and myxoid round cell liposarcoma (MRCLS). It has filed an IND for ADP-5701 for a Phase I trial in Head and Neck Cancer in collaboration with Galapagos NV (Galapagos). It has two pre-clinical programs for the development of T-cell therapies directed to PRAME (ADP-600) and CD70 (ADP-520).',
                website = 'https://www.adaptimmune.com',
                headquarters = 'Abingdon, , United Kingdom',
                employees_count = 506,
                ceo_name = 'Mr. Adrian G.  Rawcliffe',
                industry = 'Biotechnology',
                updated_at = now()
            WHERE ticker = 'ADAP' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'ADAP'),
                CURRENT_DATE,
                0.0714000016450882,
                18924714,
                265052000,
                36987413,
                -93.134614974613,
                119.61646355143586,
                NULL,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:00.647027", "data_type": "stock_specific"}',
                now()
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
            \n\n-- BMNR\n
            UPDATE assets_master SET
                business_description = 'Bitmine Immersion Technologies Inc. is a technology company focused on Bitcoin mining using immersion technology, an advanced cooling technique where computers are submerged in specialized oil circulated to keep units operating at optimal ambient temperature. The Company operates in the cryptocurrency mining industry. Its business includes industrial scale digital asset mining, equipment sales and hosting operations. It is engaged in self-mining bitcoin for its own account, as well as hosting third party equipment used in mining of digital asset coins and tokens, specifically bitcoin. It conducts digital asset mining operations using specialized computers equipped with application-specific integrated circuit chips. Its data centers provide power, racks, thermodynamic management (heat dissipation and airflow management), redundant connectivity, 24/7 security, as well as software which provide infrastructure management and custom firmware that improves performance and energy efficiency.',
                website = 'https://bitminetech.io',
                headquarters = 'Las Vegas, NV, United States',
                employees_count = 7,
                ceo_name = 'Mr. Jonathan Robert Bates',
                industry = 'Capital Markets',
                updated_at = now()
            WHERE ticker = 'BMNR' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'BMNR'),
                CURRENT_DATE,
                60.4739990234375,
                10492056576,
                173496992,
                44403201,
                680.3096648185484,
                1628.6139357401355,
                1.351,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:02.581546", "data_type": "stock_specific"}',
                now()
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
            \n\n-- F\n
            UPDATE assets_master SET
                business_description = 'Ford Motor Company é uma empresa automobilística. A empresa desenvolve e entrega caminhões Ford, veículos utilitários esportivos, vans comerciais e carros, e veículos de luxo Lincoln, juntamente com serviços conetados. Os segmentos da empresa incluem Ford Blue, Ford Model e, Ford Pro e Ford Credit. O segmento Ford Blue inclui principalmente a venda de motores de combustão interna Ford e Lincoln (ICE) e veículos híbridos, peças de serviço, acessórios e serviços digitais para clientes de varejo. O segmento Ford Model e inclui principalmente a venda de seus veículos elétricos, peças de serviço, acessórios e serviços digitais para clientes de varejo. O segmento Ford Pro inclui principalmente a venda de veículos Ford e Lincoln, peças de serviço, acessórios e serviços para clientes comerciais, governamentais e de aluguel. O segmento Ford Credit consiste no negócio Ford Credit numa base consolidada, que é principalmente atividades de financiamento e leasing relacionadas com veículos. Suas marcas de veículos são Ford e Lincoln.',
                website = 'https://www.ford.com',
                headquarters = 'Dearborn, MI, United States',
                employees_count = 169000,
                ceo_name = 'Mr. William Clay Ford Jr.',
                industry = 'Auto Manufacturers',
                updated_at = now()
            WHERE ticker = 'F' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'F'),
                CURRENT_DATE,
                11.369999885559082,
                45251006464,
                3909009920,
                67633163,
                20.205348001191737,
                32.23960805386363,
                1.498,
                5.24,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:04.932913", "data_type": "stock_specific"}',
                now()
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
                asset_id, quarter_date, pe_ratio, peg_ratio, pb_ratio, ps_ratio,
                ev_ebitda, roe, roa, gross_margin, operating_margin, net_margin,
                debt_to_equity, current_ratio, quick_ratio, revenue_growth_yoy,
                earnings_growth_yoy, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'F'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                14.576923,
                NULL,
                1.0043283,
                0.24426994,
                20.759,
                0.07152,
                0.00634,
                0.01701,
                0.010720001,
                0.01701,
                355.447,
                1.101,
                0.911,
                0.05,
                NULL,
                '{"source": "yfinance_fundamentals", "collected_at": "2025-08-14T15:36:04.932913"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                peg_ratio = EXCLUDED.peg_ratio,
                pb_ratio = EXCLUDED.pb_ratio,
                ps_ratio = EXCLUDED.ps_ratio,
                ev_ebitda = EXCLUDED.ev_ebitda,
                roe = EXCLUDED.roe,
                roa = EXCLUDED.roa,
                gross_margin = EXCLUDED.gross_margin,
                operating_margin = EXCLUDED.operating_margin,
                net_margin = EXCLUDED.net_margin,
                debt_to_equity = EXCLUDED.debt_to_equity,
                current_ratio = EXCLUDED.current_ratio,
                quick_ratio = EXCLUDED.quick_ratio,
                revenue_growth_yoy = EXCLUDED.revenue_growth_yoy,
                earnings_growth_yoy = EXCLUDED.earnings_growth_yoy,
                source_meta = EXCLUDED.source_meta;
            \n\n-- BTBT\n
            UPDATE assets_master SET
                business_description = 'Bit Digital, Inc. is a global platform for high performance computing (HPC) infrastructure and digital asset production company. The Company is a provider of HPC data centers and cloud-based HPC graphics processing units (GPU) services, which term cloud services, for customers such as artificial intelligence (AI) and machine learning (ML) developers. The Company designs, develops, and operates HPC data centers, through which it offers hosting and colocation services. The Company has four reportable segments: Digital asset mining, Cloud services, Colocation services, and ETH Staking. The Digital asset mining segment is engaged in bitcoin and mining activities. The Cloud services segment provides HPC services to support generative AI workstreams. The Colocation services segment provide customers with physical space, power and cooling within the data center facility. The ETH staking segment is engaged in both native staking and liquid staking.',
                website = 'https://www.bit-digital.com',
                headquarters = 'New York, NY, United States',
                employees_count = 54,
                ceo_name = 'Mr. Samir  Tabar',
                industry = 'Capital Markets',
                updated_at = now()
            WHERE ticker = 'BTBT' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'BTBT'),
                CURRENT_DATE,
                3.1198999881744385,
                998258752,
                319964992,
                53365924,
                7.582754675018233,
                103.44466582088329,
                4.913,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:06.852384", "data_type": "stock_specific"}',
                now()
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
            \n\n-- CAN\n
            UPDATE assets_master SET
                business_description = 'Canaan Inc. provides high performance computing solutions through its proprietary application-specific integrated circuits (ASICs). The Company is a fabless IC designer engaged in the front-end and back-end of IC design. The Company primarily offers its technology and expertise in ASIC applications to Bitcoin mining machines and is also a producer of Bitcoin mining machines in the global market. The Company, through its subsidiaries, independently designs and develops its products in-house, including the design of proprietary ASIC chips for its Bitcoin mining machines. It has in-house production capabilities to assemble both Bitcoin mining machines and artificial intelligence (AI) chips. It assembles its Bitcoin mining machines primarily at its assembly plant located in the Peoples Republic of China (PRC) by integrating the ICs designed by the Company and related components it procures. It also intends to engage in Bitcoin mining through self-owned facilities.',
                website = 'https://investor.canaan-creative.com',
                headquarters = 'Singapore, , Singapore',
                employees_count = 463,
                ceo_name = 'Mr. Nangeng  Zhang',
                industry = 'Computer Hardware',
                updated_at = now()
            WHERE ticker = 'CAN' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'CAN'),
                CURRENT_DATE,
                0.7639999985694885,
                351669760,
                439585984,
                50781006,
                -8.173078989621052,
                122.19751450465415,
                3.253,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:08.803460", "data_type": "stock_specific"}',
                now()
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
            \n\n-- AAPL\n
            UPDATE assets_master SET
                business_description = 'A Apple Inc. Projeta, fabrica e comercializa smartphones, computadores pessoais, tablets, wearables e acessórios, e vende uma variedade de serviços relacionados. Suas categorias de produtos incluem iPhone, Mac, iPad e Wearables, Home e Acessórios. Suas plataformas de software incluem iOS, iPadOS, macOS, watchOS, visionOS, e tvOS. Seus serviços incluem publicidade, AppleCare, serviços em nuvem, conteúdo digital e serviços de pagamento. A empresa opera várias plataformas, incluindo a App Store, que permitem aos clientes descobrir e baixar aplicativos e conteúdo digital, como livros, música, vídeo, jogos e podcasts. Ele também oferece conteúdo digital por meio de serviços baseados em assinatura, incluindo Apple Arcade, Apple e a Apple TV. Seus produtos incluem iPhone 16 Pro, iPhone 16, iPhone 15, iPhone 14, iPhone SE, MacBook Air, MacBook Pro, iMac, Mac mini, Mac Studio, Mac Pro, iPad Pro, iPad Air, AirPods, AirPods Pro, AirPods Max, Apple TV e Apple Vision Pro.',
                website = 'https://www.apple.com',
                headquarters = 'Cupertino, CA, United States',
                employees_count = 150000,
                ceo_name = 'Mr. Timothy D. Cook',
                industry = 'Consumer Electronics',
                updated_at = now()
            WHERE ticker = 'AAPL' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AAPL'),
                CURRENT_DATE,
                232.5399932861328,
                3450986561536,
                14840399872,
                56362921,
                5.36813444759956,
                32.10824376741815,
                1.165,
                0.45,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:11.118392", "data_type": "stock_specific"}',
                now()
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
                asset_id, quarter_date, pe_ratio, peg_ratio, pb_ratio, ps_ratio,
                ev_ebitda, roe, roa, gross_margin, operating_margin, net_margin,
                debt_to_equity, current_ratio, quick_ratio, revenue_growth_yoy,
                earnings_growth_yoy, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'AAPL'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                35.340424,
                NULL,
                52.480247,
                8.445363,
                24.765,
                1.49814,
                0.24545999,
                0.24295999,
                0.29990998,
                0.24295999,
                154.486,
                0.868,
                0.724,
                0.096,
                0.121,
                '{"source": "yfinance_fundamentals", "collected_at": "2025-08-14T15:36:11.118392"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                peg_ratio = EXCLUDED.peg_ratio,
                pb_ratio = EXCLUDED.pb_ratio,
                ps_ratio = EXCLUDED.ps_ratio,
                ev_ebitda = EXCLUDED.ev_ebitda,
                roe = EXCLUDED.roe,
                roa = EXCLUDED.roa,
                gross_margin = EXCLUDED.gross_margin,
                operating_margin = EXCLUDED.operating_margin,
                net_margin = EXCLUDED.net_margin,
                debt_to_equity = EXCLUDED.debt_to_equity,
                current_ratio = EXCLUDED.current_ratio,
                quick_ratio = EXCLUDED.quick_ratio,
                revenue_growth_yoy = EXCLUDED.revenue_growth_yoy,
                earnings_growth_yoy = EXCLUDED.earnings_growth_yoy,
                source_meta = EXCLUDED.source_meta;
            \n\n-- CASK\n
            UPDATE assets_master SET
                business_description = 'Heritage Distilling Holding Company, Inc. is a craft distillery producing, marketing, and selling a diverse line of craft spirits, including whiskeys, vodkas, gins, rums, and ready-to-drink canned cocktails. The Company sells its products through wholesale distribution, directly to consumers through its five owned and operated distilleries and tasting rooms located in Washington and Oregon, and by shipping directly to consumers online were legal. It sells products in the Pacific Northwest with limited distribution in other states throughout the United States. Its operations are spread across national through multiple sales channels, including wholesale, e-commerce, direct-to-consumer (DTC) in 46 states, on-premises venues at its distilleries and tasting rooms, a subscription-based program, and the Tribal Beverage Network (TBN). Its DTC sales also support growing its wholesale volume with its distributors through key national accounts both on-premises and off-premises.',
                website = 'https://heritagedistilling.com',
                headquarters = 'Gig Harbor, WA, United States',
                employees_count = 62,
                ceo_name = 'Mr. Justin B. Stiefel',
                industry = 'Beverages - Wineries & Distilleries',
                updated_at = now()
            WHERE ticker = 'CASK' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'CASK'),
                CURRENT_DATE,
                0.47999998927116394,
                11339472,
                23623900,
                4496885,
                -85.88235365271979,
                142.3334898827846,
                NULL,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:13.612420", "data_type": "stock_specific"}',
                now()
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
            \n\n-- CSX\n
            UPDATE assets_master SET
                business_description = 'A CSX Corporation é uma empresa de transporte. A empresa fornece serviços e soluções de transload ferroviário, intermodal e ferroviário para caminhão para clientes em uma variedade de mercados, incluindo energia, industrial, construção, agricultura e produtos de consumo. Fornece serviços de transporte de mercadorias com base em trilhos, incluindo o serviço ferroviário tradicional, o transporte de contentores e reboques intermodais, bem como outros serviços de transporte, tais como transferências entre camiões e operações de mercadorias a granel. Através de sua subsidiária, a CSX Transportation, Inc. (CSXT), fornece um link para a cadeia de suprimentos de transporte através de sua rede ferroviária de aproximadamente 20 000 rotas e atende grandes centros populacionais em 26 estados a leste do rio Mississippi, do Distrito de Columbia e das províncias canadenses de Ontário e Quebec. A CSXT também está envolvida em vendas imobiliárias, leasing, aquisição e gestão e atividades de desenvolvimento. Ele serve mercadorias, intermodais, carvão e negócios de caminhões.',
                website = 'https://www.csx.com',
                headquarters = 'Jacksonville, FL, United States',
                employees_count = 23500,
                ceo_name = 'Mr. Joseph R. Hinrichs',
                industry = 'Railroads',
                updated_at = now()
            WHERE ticker = 'CSX' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'CSX'),
                CURRENT_DATE,
                36.1713981628418,
                67433615360,
                1864280064,
                18712332,
                10.070888181894055,
                25.390048021041558,
                1.247,
                1.44,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:15.634916", "data_type": "stock_specific"}',
                now()
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
                asset_id, quarter_date, pe_ratio, peg_ratio, pb_ratio, ps_ratio,
                ev_ebitda, roe, roa, gross_margin, operating_margin, net_margin,
                debt_to_equity, current_ratio, quick_ratio, revenue_growth_yoy,
                earnings_growth_yoy, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'CSX'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                22.191042,
                NULL,
                5.4507833,
                4.763943,
                13.053,
                0.24819,
                0.07249,
                0.21915,
                0.36094,
                0.21915,
                159.506,
                0.773,
                0.604,
                -0.034,
                -0.102,
                '{"source": "yfinance_fundamentals", "collected_at": "2025-08-14T15:36:15.634916"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                peg_ratio = EXCLUDED.peg_ratio,
                pb_ratio = EXCLUDED.pb_ratio,
                ps_ratio = EXCLUDED.ps_ratio,
                ev_ebitda = EXCLUDED.ev_ebitda,
                roe = EXCLUDED.roe,
                roa = EXCLUDED.roa,
                gross_margin = EXCLUDED.gross_margin,
                operating_margin = EXCLUDED.operating_margin,
                net_margin = EXCLUDED.net_margin,
                debt_to_equity = EXCLUDED.debt_to_equity,
                current_ratio = EXCLUDED.current_ratio,
                quick_ratio = EXCLUDED.quick_ratio,
                revenue_growth_yoy = EXCLUDED.revenue_growth_yoy,
                earnings_growth_yoy = EXCLUDED.earnings_growth_yoy,
                source_meta = EXCLUDED.source_meta;
            \n\n-- MARA\n
            UPDATE assets_master SET
                business_description = 'MARA Holdings, Inc. is engaged in digital asset compute that develops and deploys technologies. The Company secures the blockchain ledger and supports energy transformation by converting clean, stranded, or otherwise underutilized energy into economic value. It also offers advanced technology solutions to optimize data center operations, including liquid immersion cooling and firmware for bitcoin miners. It is primarily focused on computing for, acquiring, and holding digital assets as a long-term investment. Its core business is bitcoin mining, and it produces, or mines, bitcoin using energy-efficient fleets of specialized computers while providing dispatchable compute as an optionality to the electric grid operators to balance electric demands on the grid. It is also engaged in the sale of data center infrastructure, such as immersion-cooled systems, to third parties operating in the bitcoin ecosystem and the artificial intelligence (AI) and high-performance compute (HPC) sectors.',
                website = 'https://www.mara.com',
                headquarters = 'Hallandale Beach, FL, United States',
                employees_count = 201,
                ceo_name = 'Mr. Frederick G. Thiel',
                industry = 'Capital Markets',
                updated_at = now()
            WHERE ticker = 'MARA' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'MARA'),
                CURRENT_DATE,
                15.345000267028809,
                5684677632,
                370457984,
                43928728,
                1.3540285274594943,
                91.02548549658623,
                6.263,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:17.539238", "data_type": "stock_specific"}',
                now()
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
                asset_id, quarter_date, pe_ratio, peg_ratio, pb_ratio, ps_ratio,
                ev_ebitda, roe, roa, gross_margin, operating_margin, net_margin,
                debt_to_equity, current_ratio, quick_ratio, revenue_growth_yoy,
                earnings_growth_yoy, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'MARA'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                8.25,
                NULL,
                1.1603903,
                7.119998,
                7.585,
                0.18235001,
                0.06371,
                0.85016,
                4.3284297,
                0.85016,
                55.154,
                0.536,
                0.319,
                0.643,
                NULL,
                '{"source": "yfinance_fundamentals", "collected_at": "2025-08-14T15:36:17.539238"}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                peg_ratio = EXCLUDED.peg_ratio,
                pb_ratio = EXCLUDED.pb_ratio,
                ps_ratio = EXCLUDED.ps_ratio,
                ev_ebitda = EXCLUDED.ev_ebitda,
                roe = EXCLUDED.roe,
                roa = EXCLUDED.roa,
                gross_margin = EXCLUDED.gross_margin,
                operating_margin = EXCLUDED.operating_margin,
                net_margin = EXCLUDED.net_margin,
                debt_to_equity = EXCLUDED.debt_to_equity,
                current_ratio = EXCLUDED.current_ratio,
                quick_ratio = EXCLUDED.quick_ratio,
                revenue_growth_yoy = EXCLUDED.revenue_growth_yoy,
                earnings_growth_yoy = EXCLUDED.earnings_growth_yoy,
                source_meta = EXCLUDED.source_meta;
            \n\n-- BTG\n
            UPDATE assets_master SET
                business_description = 'B2Gold Corp. is an international gold producer. The Company is operating gold mines in Mali, Namibia and the Philippines, the Goose Project under construction in northern Canada, and numerous development and exploration projects in various countries, including Mali, Colombia, and Finland. The Fekola Mine is located in southwest Mali, on the border between Mali and Senegal, approximately 500 kilometers due west of the capital city, Bamako. The Masbate Mine is located approximately 360 kilometers southeast of Manila. The Otjikoto Mine is located in the north-central part of Namibia, approximately 300 kilometers north of Windhoek and is a gold producer. The Company also owns the Gramalote Project in Colombia. It also has an interest in the Back River Gold District, which is located in Nunavut, Canada. The Back River Gold District consists of approximately five mineral claims blocks along an 80-kilometer belt. It is engaged in operating Goose Project, which is located in Nunavut, Canada.',
                website = 'https://www.b2gold.com',
                headquarters = 'Vancouver, BC, Canada',
                employees_count = NULL,
                ceo_name = 'Mr. Clive Thomas Johnson',
                industry = 'Gold',
                updated_at = now()
            WHERE ticker = 'BTG' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'BTG'),
                CURRENT_DATE,
                3.845400094985962,
                5101153792,
                1322989952,
                33656334,
                52.45553310927382,
                45.22243044820153,
                0.443,
                2.07,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:19.455830", "data_type": "stock_specific"}',
                now()
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
            \n\n-- LIDR\n
            UPDATE assets_master SET
                business_description = 'AEye, Inc. is a provider of active lidar systems technology for vehicle autonomy, advanced driver-assistance systems (ADAS), and robotic vision applications. Its 4Sight Intelligent Sensing Platform includes a solid-state software-definable active lidar sensor, an adaptive sensing SmartScan architecture to scan dynamic scenes/targets, and a sophisticated signal processing capability that provides precise measurements and imaging for various safety-critical applications. Its active 4Sight Intelligent Sensing Platform leverages principles from automated targeting systems and biomimicry to scan the environment, while intelligently focusing on what matters in order to enable safer, smarter, and faster decisions in complex scenarios. Its technology includes 4Sight for Automotive, and 4Sight for Non-Automotive. It offers Apollo, the 4Sight Flex family of lidar sensors. The Apollo lidar is specifically designed to address system requirements for ADAS and autonomous vehicles (AV) applications.',
                website = 'https://www.aeye.ai',
                headquarters = 'Dover, DE, United States',
                employees_count = 45,
                ceo_name = 'Mr. Matthew  Fisch',
                industry = 'Software - Infrastructure',
                updated_at = now()
            WHERE ticker = 'LIDR' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'LIDR'),
                CURRENT_DATE,
                2.6198999881744385,
                104646928,
                39943100,
                35211393,
                137.09501746173328,
                216.85910339058867,
                3.012,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:21.380900", "data_type": "stock_specific"}',
                now()
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
            \n\n-- ACHR\n
            UPDATE assets_master SET
                business_description = 'Archer Aviation Inc. is an aerospace company. It is engaged in providing customers with advanced aircraft and related technologies and services in the United States and internationally in both the commercial and defense sectors. Its commercial line of business consists of the sale of its commercial aircraft (Archer Direct), such as Midnight, to aircraft operators as well as technologies and services related thereto, including commercial launch (certification, testing, training, demonstration, market survey and early trial operations), and maintenance and repair. Its defense line of business consists of the sale of aircraft and related technologies for defense applications. Its initial product is intended to be a hybrid-propulsion, vertical take-off and landing (VTOL) aircraft. Its Midnight aircraft is designed around its proprietary 12-tilt-6 distributed electric propulsion platform. It carries four passengers plus a pilot. The aircraft is purpose-built for air taxi operations.',
                website = 'https://www.archer.com',
                headquarters = 'San Jose, CA, United States',
                employees_count = 774,
                ceo_name = 'Mr. Adam D. Goldstein',
                industry = 'Aerospace & Defense',
                updated_at = now()
            WHERE ticker = 'ACHR' AND asset_type = 'STOCK';
            \n\n
            INSERT INTO stock_metrics_snapshot (
                asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                volume_avg_30d, returns_12m, volatility_12m, beta_12m,
                dividend_yield_12m, quality_score, size_category, liquidity_category,
                source_meta, calculated_at
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = 'ACHR'),
                CURRENT_DATE,
                9.9350004196167,
                6405108224,
                645025984,
                37200957,
                180.64973239197957,
                102.37041631958041,
                3.087,
                NULL,
                75, -- Score padrão
                'Large Cap', -- Categoria padrão
                'Medium', -- Liquidez padrão
                '{"source": "yfinance", "collected_at": "2025-08-14T15:36:23.306161", "data_type": "stock_specific"}',
                now()
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