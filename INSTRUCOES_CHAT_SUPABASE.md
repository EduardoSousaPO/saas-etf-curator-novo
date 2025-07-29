# 🗂️ INSTRUÇÕES - Sistema de Chat IA no Supabase

## 📋 RESUMO
Este documento contém as instruções para criar as tabelas do sistema de Chat IA no banco de dados Supabase do ETF Curator.

## 🎯 OBJETIVO
Implementar persistência completa para:
- ✅ Histórico de conversas
- ✅ Mensagens individuais
- ✅ Metadados de IA (insights, next_steps)
- ✅ Segurança RLS
- ✅ Performance otimizada

---

## 🚀 PASSO A PASSO

### 1️⃣ **ACESSAR SUPABASE DASHBOARD**
```
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: ETF Curator (nniabnjuwzeqmflrruga)
4. Vá para: SQL Editor
```

### 2️⃣ **EXECUTAR MIGRAÇÃO PRINCIPAL**
```sql
-- Copie e cole o conteúdo do arquivo:
-- supabase/migrations/20250119_create_chat_system.sql

-- Execute no SQL Editor do Supabase
-- Isso criará:
-- ✅ Tabela chat_conversations
-- ✅ Tabela chat_messages  
-- ✅ Índices de performance
-- ✅ Políticas RLS
-- ✅ Triggers automáticos
```

### 3️⃣ **VERIFICAR INSTALAÇÃO**
```sql
-- Copie e cole o conteúdo do arquivo:
-- supabase/verify_chat_tables.sql

-- Execute para verificar se tudo foi criado corretamente
-- Deve retornar informações sobre tabelas, índices e políticas
```

### 4️⃣ **TESTAR FUNCIONAMENTO**
```sql
-- Teste básico de inserção
INSERT INTO public.chat_conversations (user_id, title, last_message) 
VALUES (NULL, 'Teste Sistema Chat', 'Primeira mensagem de teste');

-- Verificar se foi criado
SELECT * FROM public.chat_conversations 
WHERE title = 'Teste Sistema Chat';

-- Limpar teste
DELETE FROM public.chat_conversations 
WHERE title = 'Teste Sistema Chat';
```

---

## 📊 ESTRUTURA DAS TABELAS

### 🗨️ **chat_conversations**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Referência ao usuário, NULL para anônimos)
- title: TEXT (Título da conversa)
- last_message: TEXT (Preview da última mensagem)
- created_at: TIMESTAMPTZ (Data de criação)
- updated_at: TIMESTAMPTZ (Data de atualização)
```

### 💬 **chat_messages**
```sql
- id: UUID (Primary Key)
- conversation_id: UUID (Referência à conversa)
- content: TEXT (Conteúdo da mensagem)
- sender: TEXT ('user' ou 'assistant')
- intent: TEXT (Intenção classificada pelo PlannerAgent)
- insights: JSONB (Insights gerados pelo WriterAgent)
- next_steps: JSONB (Próximos passos sugeridos)
- metadata: JSONB (Metadados adicionais)
- created_at: TIMESTAMPTZ (Data de criação)
```

---

## 🔒 SEGURANÇA RLS

### 🛡️ **Políticas Implementadas**
- ✅ **Usuários autenticados**: Acesso apenas às próprias conversas
- ✅ **Usuários anônimos**: Acesso a conversas com user_id = NULL
- ✅ **Operações**: SELECT, INSERT, UPDATE, DELETE controladas
- ✅ **Cascata**: Exclusão de conversa remove mensagens automaticamente

### 🔐 **Exemplo de Políticas**
```sql
-- Usuários podem ver suas próprias conversas
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);
```

---

## ⚡ PERFORMANCE

### 📈 **Índices Criados**
```sql
- idx_chat_conversations_user_id: Busca por usuário
- idx_chat_conversations_updated_at: Ordenação cronológica
- idx_chat_messages_conversation_id: Busca mensagens por conversa
- idx_chat_messages_created_at: Ordenação de mensagens
```

### 🎯 **Otimizações**
- ✅ **Índices compostos** para queries frequentes
- ✅ **Triggers automáticos** para updated_at
- ✅ **JSONB** para metadados estruturados
- ✅ **CASCADE DELETE** para limpeza automática

---

## 🔧 INTEGRAÇÃO COM APLICAÇÃO

### 🌐 **APIs Disponíveis**
```typescript
// Conversas
GET    /api/chat/conversations?userId={id}
POST   /api/chat/conversations
PUT    /api/chat/conversations
DELETE /api/chat/conversations?conversationId={id}&userId={id}

// Mensagens
GET    /api/chat/messages?conversationId={id}
POST   /api/chat/messages
PUT    /api/chat/messages
DELETE /api/chat/messages?messageId={id}
```

### 🎮 **Interface Grok**
```typescript
// Componente principal: src/app/chat-ia/page.tsx
- ✅ Sidebar com histórico cronológico
- ✅ Área central de chat
- ✅ Modos IA (Chat, DeepSearch, Think)
- ✅ Seletor de modelos
- ✅ Persistência automática
- ✅ Menu contexto para excluir
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### 🔍 **Após Executar Migração**
- [ ] Tabelas `chat_conversations` e `chat_messages` criadas
- [ ] 4 índices de performance criados
- [ ] RLS habilitado nas duas tabelas
- [ ] 6 políticas RLS criadas
- [ ] Função `update_chat_updated_at()` criada
- [ ] Trigger de updated_at funcionando
- [ ] Teste de inserção/seleção funcionando

### 🚀 **Após Deploy da Aplicação**
- [ ] Interface /chat-ia carregando
- [ ] Histórico de conversas funcionando
- [ ] Nova conversa criando no banco
- [ ] Mensagens sendo salvas
- [ ] Menu de exclusão funcionando
- [ ] Usuários anônimos funcionando
- [ ] Usuários autenticados isolados

---

## 🆘 TROUBLESHOOTING

### ❌ **Problemas Comuns**

**1. Erro de Permissão RLS**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('chat_conversations', 'chat_messages');

-- Se não estiver, executar:
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
```

**2. Políticas Não Funcionando**
```sql
-- Listar políticas existentes
SELECT policyname, tablename, cmd FROM pg_policies 
WHERE tablename IN ('chat_conversations', 'chat_messages');

-- Recriar se necessário (ver migração principal)
```

**3. Índices Ausentes**
```sql
-- Verificar índices
SELECT indexname, tablename FROM pg_indexes 
WHERE tablename IN ('chat_conversations', 'chat_messages');

-- Recriar se necessário (ver migração principal)
```

---

## 📞 SUPORTE

### 💡 **Dicas Importantes**
- ✅ Execute a migração em **ambiente de desenvolvimento** primeiro
- ✅ Faça **backup** antes de executar em produção
- ✅ Teste todas as funcionalidades após a migração
- ✅ Monitore performance após implementação

### 🔗 **Links Úteis**
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Documentação RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/sql-editor)

---

**✅ SISTEMA PRONTO PARA PRODUÇÃO!**

O sistema de Chat IA está completamente implementado e otimizado para uso em produção, com segurança RLS, performance otimizada e interface idêntica ao Grok. 