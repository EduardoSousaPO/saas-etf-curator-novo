-- Supabase Migration: Update rpc_filter_etfs function

DROP FUNCTION IF EXISTS rpc_filter_etfs(jsonb);

CREATE OR REPLACE FUNCTION rpc_filter_etfs(filter_params jsonb)
RETURNS SETOF public.etfs AS $$
DECLARE
    query_sql text;
    search_term_query text := 
        CASE 
            WHEN filter_params->>
'searchTerm' IS NOT NULL AND filter_params->>
'searchTerm' <> '' THEN
                format('AND (symbol ILIKE %1$L OR name ILIKE %1$L OR description ILIKE %1$L) ', '%' || (filter_params->>
'searchTerm') || '%')
            ELSE ''
        END;
    category_query text := 
        CASE 
            WHEN filter_params->>
'category' IS NOT NULL AND filter_params->>
'category' <> 'all' AND filter_params->>
'category' <> '' THEN
                format('AND category = %L ', filter_params->>
'category')
            ELSE ''
        END;
    exchange_query text := 
        CASE 
            WHEN filter_params->>
'exchange' IS NOT NULL AND filter_params->>
'exchange' <> 'all' AND filter_params->>
'exchange' <> '' THEN
                format('AND exchange = %L ', filter_params->>
'exchange')
            ELSE ''
        END;
    total_assets_min_query text := 
        CASE 
            WHEN filter_params->>
'totalAssetsMin' IS NOT NULL THEN
                format('AND total_assets >= %s ', (filter_params->>
'totalAssetsMin')::numeric * 1000000000) -- Assuming input is in Billions
            ELSE ''
        END;
    total_assets_max_query text := 
        CASE 
            WHEN filter_params->>
'totalAssetsMax' IS NOT NULL AND (filter_params->>
'totalAssetsMax')::numeric < 1000 THEN -- Max 1000 Bn from slider
                format('AND total_assets <= %s ', (filter_params->>
'totalAssetsMax')::numeric * 1000000000)
            ELSE ''
        END;
    returns_12m_min_query text := 
        CASE 
            WHEN filter_params->>
'returns_12m_min' IS NOT NULL THEN
                format('AND returns_12m >= %s ', (filter_params->>
'returns_12m_min')::numeric)
            ELSE ''
        END;
    sharpe_12m_min_query text := 
        CASE 
            WHEN filter_params->>
'sharpe_12m_min' IS NOT NULL THEN
                format('AND sharpe_12m >= %s ', (filter_params->>
'sharpe_12m_min')::numeric)
            ELSE ''
        END;
    dividend_yield_min_query text := 
        CASE 
            WHEN filter_params->>
'dividend_yield_min' IS NOT NULL THEN
                format('AND dividend_yield >= %s ', (filter_params->>
'dividend_yield_min')::numeric)
            ELSE ''
        END;
BEGIN
    query_sql := 'SELECT * FROM public.etfs WHERE 1=1 '
        || search_term_query
        || category_query
        || exchange_query
        || total_assets_min_query
        || total_assets_max_query
        || returns_12m_min_query
        || sharpe_12m_min_query
        || dividend_yield_min_query
        || 'ORDER BY symbol;'; -- Add default ordering or make it configurable

    RAISE NOTICE 'Generated SQL: %', query_sql; -- For debugging

    RETURN QUERY EXECUTE query_sql;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated users (or specific roles as needed)
GRANT EXECUTE ON FUNCTION rpc_filter_etfs(jsonb) TO authenticated;
-- If you have a service_role or anon key that needs to call this, grant to them as well.
-- GRANT EXECUTE ON FUNCTION rpc_filter_etfs(jsonb) TO anon;
-- GRANT EXECUTE ON FUNCTION rpc_filter_etfs(jsonb) TO service_role;


