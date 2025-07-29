-- Script de Verificação: Sistema de Chat IA
-- Verificar se as tabelas foram criadas corretamente

-- 1. Verificar existência das tabelas
SELECT 
    table_name,
    table_type,
    is_insertable_into,
    is_typed
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_conversations', 'chat_messages')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela chat_conversations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_conversations'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela chat_messages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- 4. Verificar índices
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('chat_conversations', 'chat_messages')
ORDER BY tablename, indexname;

-- 5. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('chat_conversations', 'chat_messages')
ORDER BY tablename, policyname;

-- 6. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('chat_conversations', 'chat_messages');

-- 7. Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table IN ('chat_conversations', 'chat_messages');

-- 8. Verificar funções relacionadas
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%chat%';

-- 9. Teste básico de inserção (comentado para não executar automaticamente)
/*
-- Teste de inserção
INSERT INTO public.chat_conversations (user_id, title, last_message) 
VALUES (NULL, 'Teste de Conversa', 'Esta é uma mensagem de teste');

-- Verificar se foi inserido
SELECT * FROM public.chat_conversations WHERE title = 'Teste de Conversa';

-- Limpar teste
DELETE FROM public.chat_conversations WHERE title = 'Teste de Conversa';
*/

-- 10. Resumo final
SELECT 
    'Verificação Concluída' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_conversations', 'chat_messages'); 