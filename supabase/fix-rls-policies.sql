-- Script para corrigir políticas RLS (Row Level Security) da tabela ETFs
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está ativado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'etfs' AND schemaname = 'public';

-- 2. Desabilitar RLS temporariamente para ETFs (dados públicos)
ALTER TABLE public.etfs DISABLE ROW LEVEL SECURITY;

-- 3. Garantir permissões SELECT para role anon e authenticated
GRANT SELECT ON public.etfs TO anon;
GRANT SELECT ON public.etfs TO authenticated;
GRANT ALL ON public.etfs TO service_role;

-- 4. Garantir acesso ao schema public
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 5. Se quiser manter RLS ativo com acesso público, use estas políticas:
-- ALTER TABLE public.etfs ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "ETFs são públicos - leitura livre" ON public.etfs
-- FOR SELECT USING (true);

-- CREATE POLICY "Service role pode tudo" ON public.etfs
-- FOR ALL USING (auth.role() = 'service_role');

-- 6. Verificar permissões atuais
SELECT 
  schemaname, 
  tablename, 
  tableowner,
  rowsecurity,
  (SELECT string_agg(privilege_type, ', ') 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'etfs' AND grantee = 'anon') as anon_permissions,
  (SELECT string_agg(privilege_type, ', ') 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'etfs' AND grantee = 'authenticated') as authenticated_permissions
FROM pg_tables 
WHERE tablename = 'etfs' AND schemaname = 'public';

-- 7. Testar consulta
SELECT COUNT(*) as total_etfs FROM public.etfs;
SELECT symbol, name, total_assets FROM public.etfs LIMIT 5; 