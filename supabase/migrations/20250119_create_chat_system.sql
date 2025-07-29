-- Migração: Sistema de Chat IA para ETF Curator
-- Data: 2025-01-19
-- Descrição: Criar tabelas para histórico de conversas e mensagens do chat IA

-- 1. Tabela para histórico de conversas
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title TEXT NOT NULL,
    last_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela para mensagens individuais
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    intent TEXT,
    insights JSONB,
    next_steps JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id 
ON public.chat_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at 
ON public.chat_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id 
ON public.chat_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
ON public.chat_messages(created_at DESC);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para chat_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can create their own conversations" 
ON public.chat_conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can update their own conversations" 
ON public.chat_conversations FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can delete their own conversations" 
ON public.chat_conversations FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 6. Políticas RLS para chat_messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages from their conversations" 
ON public.chat_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.chat_conversations 
        WHERE id = chat_messages.conversation_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    )
);

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
CREATE POLICY "Users can create messages in their conversations" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_conversations 
        WHERE id = chat_messages.conversation_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    )
);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar updated_at nas conversas
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at 
    BEFORE UPDATE ON public.chat_conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_chat_updated_at();

-- 9. Comentários para documentação
COMMENT ON TABLE public.chat_conversations IS 'Histórico de conversas do chat IA do ETF Curator';
COMMENT ON TABLE public.chat_messages IS 'Mensagens individuais das conversas do chat IA';
COMMENT ON COLUMN public.chat_conversations.user_id IS 'ID do usuário (NULL para usuários não autenticados)';
COMMENT ON COLUMN public.chat_conversations.title IS 'Título da conversa baseado na primeira mensagem';
COMMENT ON COLUMN public.chat_conversations.last_message IS 'Preview da última mensagem';
COMMENT ON COLUMN public.chat_messages.sender IS 'Remetente: user ou assistant';
COMMENT ON COLUMN public.chat_messages.intent IS 'Intenção classificada pelo PlannerAgent';
COMMENT ON COLUMN public.chat_messages.insights IS 'Insights gerados pelo WriterAgent';
COMMENT ON COLUMN public.chat_messages.next_steps IS 'Próximos passos sugeridos';
COMMENT ON COLUMN public.chat_messages.metadata IS 'Metadados adicionais (tempo de processamento, modelo usado, etc.)';

-- 10. Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO public.chat_conversations (user_id, title, last_message) 
-- VALUES (NULL, 'Conversa de Exemplo', 'Como otimizar meu portfolio?');

-- Verificação final
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'chat_%'; 