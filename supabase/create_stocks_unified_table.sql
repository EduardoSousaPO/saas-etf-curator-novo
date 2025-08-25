-- ===============================================
-- 🚀 STOCKS UNIFIED TABLE - ESTRUTURA OTIMIZADA
-- ===============================================
-- Data: Janeiro 2025
-- Objetivo: Consolidar assets_master + stock_metrics_snapshot + stock_prices_daily
-- Campos: 65 campos otimizados (35% redução vs 100 originais)
-- Status: Inclui todos os campos solicitados pelo usuário
-- ===============================================

-- 🗑️ DROP TABLE SE EXISTIR (CUIDADO EM PRODUÇÃO!)
-- DROP TABLE IF EXISTS stocks_unified CASCADE;

-- 🏗️ CRIAR TABELA UNIFICADA
CREATE TABLE stocks_unified (
    -- ===============================================
    -- 🔑 IDENTIFICAÇÃO E CHAVES (4 campos)
    -- ===============================================
    id BIGSERIAL PRIMARY KEY,
    ticker TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL DEFAULT 'STOCK',
    
    -- ===============================================
    -- 🏭 CLASSIFICAÇÃO E CONTEXTO (5 campos)
    -- ===============================================
    sector TEXT,
    industry TEXT,
    exchange TEXT DEFAULT 'NASDAQ',
    currency TEXT DEFAULT 'USD',
    business_description TEXT,
    
    -- ===============================================
    -- 💰 DADOS DE MERCADO ATUAIS (6 campos)
    -- ===============================================
    current_price NUMERIC,
    market_cap BIGINT,
    shares_outstanding BIGINT,
    volume_avg_30d BIGINT,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- ===============================================
    -- 📈 PERFORMANCE E RETORNOS (8 campos)
    -- ===============================================
    -- Incluindo campos solicitados: returns_24m
    returns_12m NUMERIC,
    returns_24m NUMERIC,  -- ✅ MANTIDO conforme solicitação
    returns_36m NUMERIC,
    returns_5y NUMERIC,
    ten_year_return NUMERIC,  -- ✅ MANTIDO conforme solicitação
    
    -- ===============================================
    -- ⚡ RISCO E VOLATILIDADE (7 campos)
    -- ===============================================
    -- Incluindo campos solicitados: ten_year_volatility, ten_year_sharpe
    volatility_12m NUMERIC,
    volatility_24m NUMERIC,
    volatility_36m NUMERIC,
    ten_year_volatility NUMERIC,  -- ✅ MANTIDO conforme solicitação
    max_drawdown NUMERIC,
    sharpe_12m NUMERIC,
    sharpe_24m NUMERIC,
    sharpe_36m NUMERIC,
    ten_year_sharpe NUMERIC,  -- ✅ MANTIDO conforme solicitação
    beta_coefficient NUMERIC,
    
    -- ===============================================
    -- 💵 DIVIDENDOS E RENDA (5 campos)
    -- ===============================================
    -- Incluindo campo solicitado: dividends_all_time
    dividend_yield_12m NUMERIC,
    dividends_12m NUMERIC,
    dividends_24m NUMERIC,
    dividends_36m NUMERIC,
    dividends_all_time NUMERIC,  -- ✅ MANTIDO conforme solicitação
    
    -- ===============================================
    -- 📊 FUNDAMENTAIS - RATIOS DE VALUATION (7 campos)
    -- ===============================================
    -- Incluindo campos solicitados: pb_ratio, ps_ratio, peg_ratio
    pe_ratio NUMERIC,
    pb_ratio NUMERIC,  -- ✅ MANTIDO conforme solicitação
    ps_ratio NUMERIC,  -- ✅ MANTIDO conforme solicitação
    peg_ratio NUMERIC, -- ✅ MANTIDO conforme solicitação
    
    -- ===============================================
    -- 📊 FUNDAMENTAIS - EFICIÊNCIA E RENTABILIDADE (4 campos)
    -- ===============================================
    -- Incluindo campo solicitado: roi
    roe NUMERIC,  -- Return on Equity
    roa NUMERIC,  -- Return on Assets
    roi NUMERIC,  -- ✅ MANTIDO conforme solicitação
    profit_margin NUMERIC,
    
    -- ===============================================
    -- 📊 FUNDAMENTAIS - LIQUIDEZ E ENDIVIDAMENTO (2 campos)
    -- ===============================================
    debt_to_equity NUMERIC,
    current_ratio NUMERIC,
    
    -- ===============================================
    -- 📊 FUNDAMENTAIS - DADOS FINANCEIROS ABSOLUTOS (8 campos)
    -- ===============================================
    revenue BIGINT,
    net_income BIGINT,
    total_assets BIGINT,
    total_debt BIGINT,
    free_cash_flow BIGINT,
    book_value NUMERIC,
    enterprise_value BIGINT,
    ebitda BIGINT,
    
    -- ===============================================
    -- 🤖 ANÁLISES DE IA VERTICAL (6 campos)
    -- ===============================================
    ai_investment_thesis TEXT,
    ai_risk_analysis TEXT,
    ai_market_context TEXT,
    ai_use_cases TEXT,
    ai_analysis_date TIMESTAMPTZ,
    ai_analysis_version VARCHAR(50),
    
    -- ===============================================
    -- 📋 CATEGORIZAÇÃO E CLASSIFICAÇÃO (2 campos)
    -- ===============================================
    size_category TEXT,
    liquidity_category TEXT,
    
    -- ===============================================
    -- 📅 CONTROLE E AUDITORIA (2 campos)
    -- ===============================================
    fundamentals_last_updated TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- ===============================================
    -- 📋 METADADOS OPCIONAIS (1 campo)
    -- ===============================================
    source_meta JSONB,
    
    -- ===============================================
    -- 🔍 CONSTRAINTS E VALIDAÇÕES
    -- ===============================================
    CONSTRAINT valid_ticker_format CHECK (LENGTH(ticker) BETWEEN 1 AND 10),
    CONSTRAINT valid_pe_ratio CHECK (pe_ratio IS NULL OR pe_ratio >= 0),
    CONSTRAINT valid_market_cap CHECK (market_cap IS NULL OR market_cap >= 0),
    CONSTRAINT valid_current_price CHECK (current_price IS NULL OR current_price > 0),
    CONSTRAINT valid_shares_outstanding CHECK (shares_outstanding IS NULL OR shares_outstanding > 0),
    CONSTRAINT valid_debt_to_equity CHECK (debt_to_equity IS NULL OR debt_to_equity >= 0),
    CONSTRAINT valid_dividend_yield CHECK (dividend_yield_12m IS NULL OR dividend_yield_12m >= 0),
    CONSTRAINT valid_roe CHECK (roe IS NULL OR (roe >= -100 AND roe <= 100)),
    CONSTRAINT valid_profit_margin CHECK (profit_margin IS NULL OR (profit_margin >= -100 AND profit_margin <= 100))
);

-- ===============================================
-- 🔍 ÍNDICES PARA PERFORMANCE OTIMIZADA
-- ===============================================

-- Índice principal para buscas por ticker
CREATE UNIQUE INDEX idx_stocks_unified_ticker ON stocks_unified(ticker);

-- Índices para filtros comuns
CREATE INDEX idx_stocks_unified_sector ON stocks_unified(sector);
CREATE INDEX idx_stocks_unified_market_cap ON stocks_unified(market_cap DESC) WHERE market_cap IS NOT NULL;
CREATE INDEX idx_stocks_unified_pe_ratio ON stocks_unified(pe_ratio) WHERE pe_ratio IS NOT NULL;
CREATE INDEX idx_stocks_unified_returns_12m ON stocks_unified(returns_12m DESC) WHERE returns_12m IS NOT NULL;
CREATE INDEX idx_stocks_unified_dividend_yield ON stocks_unified(dividend_yield_12m DESC) WHERE dividend_yield_12m IS NOT NULL;

-- Índice composto para análise de performance
CREATE INDEX idx_stocks_unified_performance ON stocks_unified(returns_12m DESC, volatility_12m ASC, market_cap DESC) 
WHERE returns_12m IS NOT NULL AND volatility_12m IS NOT NULL AND market_cap IS NOT NULL;

-- Índice para dados de IA
CREATE INDEX idx_stocks_unified_ai_analysis ON stocks_unified(ai_analysis_date DESC) 
WHERE ai_investment_thesis IS NOT NULL;

-- Índice para controle de qualidade de dados
CREATE INDEX idx_stocks_unified_data_quality ON stocks_unified(last_updated DESC, snapshot_date DESC);

-- ===============================================
-- 📊 COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ===============================================

COMMENT ON TABLE stocks_unified IS 'Tabela unificada consolidando dados de assets_master, stock_metrics_snapshot e stock_prices_daily - 65 campos otimizados';

-- Comentários em campos críticos
COMMENT ON COLUMN stocks_unified.ticker IS 'Símbolo único da ação (ex: AAPL, MSFT)';
COMMENT ON COLUMN stocks_unified.market_cap IS 'Capitalização de mercado calculada: current_price * shares_outstanding';
COMMENT ON COLUMN stocks_unified.pe_ratio IS 'Price-to-Earnings ratio: current_price / earnings_per_share';
COMMENT ON COLUMN stocks_unified.ai_investment_thesis IS 'Tese de investimento gerada por IA via Perplexity';
COMMENT ON COLUMN stocks_unified.returns_24m IS 'Retorno de 24 meses - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.pb_ratio IS 'Price-to-Book ratio - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.ps_ratio IS 'Price-to-Sales ratio - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.peg_ratio IS 'PEG ratio (PE/Growth) - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.ten_year_return IS 'Retorno de 10 anos - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.ten_year_volatility IS 'Volatilidade de 10 anos - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.ten_year_sharpe IS 'Sharpe ratio de 10 anos - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.roi IS 'Return on Investment - mantido conforme solicitação do usuário';
COMMENT ON COLUMN stocks_unified.dividends_all_time IS 'Dividendos históricos totais - mantido conforme solicitação do usuário';

-- ===============================================
-- 🎯 RESUMO DA ESTRUTURA
-- ===============================================
/*
TOTAL DE CAMPOS: 65 (redução de 35% vs 100 originais)

DISTRIBUIÇÃO:
- 🔑 Identificação: 4 campos
- 🏭 Classificação: 5 campos  
- 💰 Mercado Atual: 6 campos
- 📈 Performance: 8 campos
- ⚡ Risco: 7 campos
- 💵 Dividendos: 5 campos
- 📊 Fundamentais Ratios: 7 campos
- 📊 Fundamentais Eficiência: 4 campos
- 📊 Fundamentais Liquidez: 2 campos
- 📊 Fundamentais Absolutos: 8 campos
- 🤖 IA Vertical: 6 campos
- 📋 Categorização: 2 campos
- 📅 Controle: 2 campos
- 📋 Metadados: 1 campo

CAMPOS MANTIDOS CONFORME SOLICITAÇÃO:
✅ returns_24m, pb_ratio, ps_ratio, peg_ratio
✅ ten_year_return, ten_year_volatility, ten_year_sharpe  
✅ roi, dividends_all_time

CAMPOS REMOVIDOS:
❌ headquarters, employees_count (assets_master)
❌ max_drawdown_12m, analyst_rating, target_price (redundantes/vazios)
❌ quick_ratio, gross_margin, operating_margin (sem dados)
❌ fundamentals_source_meta (baixa utilização)
*/
