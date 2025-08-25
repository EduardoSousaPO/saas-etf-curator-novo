
                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('CLDI', 'STOCK', 'Calidi Biotherapeutics', 'NYSE', 'Biotechnology & Medical Research', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('AMD', 'STOCK', 'Advanced Micro Devices', 'NASDAQ', 'Semiconductors & Semiconductor Equipment', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('DNN', 'STOCK', 'Denison Mines', 'NYSE', 'Uranium', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BBAI', 'STOCK', 'BigBear.ai Holdings', 'NYSE', 'Software & IT Services', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('AAL', 'STOCK', 'American Airlines Group', 'NASDAQ', 'Passenger Transportation Services', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('DRRX', 'STOCK', 'DURECT Corporation', 'NASDAQ', 'Pharmaceuticals', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('SMCI', 'STOCK', 'Super Micro Computer', 'NASDAQ', 'Computers, Phones & Household Electronics', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('AMDL', 'STOCK', 'GrnShs:2x Lg AMD Dly', 'NASDAQ', 'ETF/Leveraged', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('ADAP', 'STOCK', 'Adaptimmune Therapeutics', 'NASDAQ', 'Pharmaceuticals', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BMNR', 'STOCK', 'Bitmine Immersion Technologies', 'NYSE', 'Financial Technology', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('F', 'STOCK', 'Ford Motor Company', 'NYSE', 'Automobiles & Auto Parts', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BTBT', 'STOCK', 'Bit Digital', 'NASDAQ', 'Financial Technology', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('CAN', 'STOCK', 'Canaan Inc', 'NASDAQ', 'Financial Technology', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('AAPL', 'STOCK', 'Apple Inc', 'NASDAQ', 'Computers, Phones & Household Electronics', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('CASK', 'STOCK', 'Heritage Distilling', 'NASDAQ', 'Beverages', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('CSX', 'STOCK', 'CSX Corporation', 'NASDAQ', 'Freight & Logistics Services', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('MARA', 'STOCK', 'MARA Holdings', 'NASDAQ', 'Financial Technology', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BTG', 'STOCK', 'B2Gold Corp', 'NYSE', 'Metals & Mining', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('LIDR', 'STOCK', 'AEye Inc', 'NASDAQ', 'Electronic Equipment & Parts', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('ACHR', 'STOCK', 'Archer Aviation', 'NYSE', 'Aerospace & Defense', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('NU', 'STOCK', 'Nu Holdings Ltd', 'NYSE', 'Banking Services', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BITF', 'STOCK', 'Bitfarms Ltd', 'NASDAQ', 'Financial Technology', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('AMZN', 'STOCK', 'Amazon.com Inc', 'NASDAQ', 'Diversified Retail', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BTE', 'STOCK', 'Baytex Energy', 'NYSE', 'Oil & Gas', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('MRK', 'STOCK', 'Merck & Co Inc', 'NYSE', 'Pharmaceuticals', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BCS', 'STOCK', 'Barclays PLC', 'NYSE', 'Banking Services', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BBD', 'STOCK', 'Banco Bradesco', 'NYSE', 'Banking Services', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('ADIL', 'STOCK', 'Adial Pharmaceuticals', 'NASDAQ', 'Biotechnology & Medical Research', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('BULL', 'STOCK', 'Webull Corporation', 'NASDAQ', 'Financial Technology', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                

                INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, currency, business_description)
                VALUES ('ABP', 'STOCK', 'Abpro Holdings', 'NASDAQ', 'Biotechnology & Medical Research', 'USD', 'Validated via Perplexity AI MCP')
                ON CONFLICT (ticker) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    updated_at = now();
                