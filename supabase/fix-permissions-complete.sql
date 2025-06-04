-- Script COMPLETO para resolver problemas de permissão no Supabase
-- Execute este script como SUPERUSER no SQL Editor do Supabase

-- 1. GARANTIR PERMISSÕES NO SCHEMA PUBLIC
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO service_role;

-- 2. GARANTIR PERMISSÕES NA TABELA ETFS ESPECIFICAMENTE
GRANT SELECT ON public.etfs TO anon, authenticated;
GRANT ALL ON public.etfs TO service_role;

-- 3. GARANTIR PERMISSÕES EM TODAS AS TABELAS EXISTENTES NO SCHEMA PUBLIC
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 4. GARANTIR PERMISSÕES EM FUTURAS TABELAS (DEFAULT PRIVILEGES)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- 5. DESABILITAR RLS NA TABELA ETFS (dados públicos)
ALTER TABLE public.etfs DISABLE ROW LEVEL SECURITY;

-- 6. GARANTIR PERMISSÕES EM SEQUENCES (para IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- 7. GARANTIR PERMISSÕES EM FUNCTIONS (se existirem)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- 8. VERIFICAR SE O USUÁRIO POSTGRES TEM PERMISSÕES
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- 9. REFRESH das permissões
NOTIFY pgrst, 'reload schema';

-- 10. VERIFICAÇÕES FINAIS
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'etfs';

-- Verificar permissões atuais
SELECT 
  grantee, 
  privilege_type, 
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name = 'etfs'
ORDER BY grantee, privilege_type;

-- Teste final de acesso
SELECT COUNT(*) as total_etfs, 
       'Acesso liberado com sucesso!' as status 
FROM public.etfs;

-- Exibir primeiro ETF para confirmar dados
SELECT symbol, name, total_assets 
FROM public.etfs 
LIMIT 1; 