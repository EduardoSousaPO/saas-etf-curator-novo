-- ============================================
-- MIGRAÇÃO: SISTEMA DE PASTAS INTELIGENTES
-- Data: 2025-01-19
-- Descrição: Hub vertical para Chat IA do Vista ETF
-- ============================================

-- 1. TABELA DE PASTAS INTELIGENTES
CREATE TABLE IF NOT EXISTS public.chat_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'portfolios', 'comparisons', 'screeners', 'education', 
        'operations', 'reports', 'favorites', 'custom'
    )),
    description TEXT,
    icon VARCHAR(50) DEFAULT '📁',
    color VARCHAR(7) DEFAULT '#3B82F6',
    position INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE ITENS SALVOS NAS PASTAS
CREATE TABLE IF NOT EXISTS public.chat_folder_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES public.chat_folders(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    
    -- Metadados do item
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'portfolio_analysis', 'etf_comparison', 'screener_query', 
        'educational_content', 'market_analysis', 'trade_simulation',
        'report_pdf', 'custom_analysis'
    )),
    
    -- Dados estruturados
    data JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Status e organização
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    
    -- Arquivos gerados
    generated_files JSONB DEFAULT '{}', -- PDFs, CSVs, etc
    
    -- Compartilhamento
    share_token VARCHAR(100) UNIQUE,
    is_shared BOOLEAN DEFAULT false,
    shared_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE BUSCA SEMÂNTICA (MCP Memory Integration)
CREATE TABLE IF NOT EXISTS public.chat_semantic_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_item_id UUID NOT NULL REFERENCES public.chat_folder_items(id) ON DELETE CASCADE,
    
    -- Dados para busca semântica
    content_vector TEXT, -- Representação vetorial do conteúdo
    keywords TEXT[] DEFAULT '{}',
    entities TEXT[] DEFAULT '{}', -- ETFs, métricas, conceitos mencionados
    intent VARCHAR(100), -- Intenção da análise
    
    -- Metadados de contexto
    context_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_chat_folders_user_id ON public.chat_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_folders_type ON public.chat_folders(type);
CREATE INDEX IF NOT EXISTS idx_chat_folders_position ON public.chat_folders(user_id, position);

CREATE INDEX IF NOT EXISTS idx_chat_folder_items_folder_id ON public.chat_folder_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_chat_folder_items_user_lookup ON public.chat_folder_items(folder_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_folder_items_favorites ON public.chat_folder_items(folder_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_chat_folder_items_content_type ON public.chat_folder_items(content_type);
CREATE INDEX IF NOT EXISTS idx_chat_folder_items_tags ON public.chat_folder_items USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_chat_semantic_keywords ON public.chat_semantic_index USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_chat_semantic_entities ON public.chat_semantic_index USING GIN(entities);
CREATE INDEX IF NOT EXISTS idx_chat_semantic_intent ON public.chat_semantic_index(intent);

-- 5. TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_folders_updated_at 
    BEFORE UPDATE ON public.chat_folders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_folder_items_updated_at 
    BEFORE UPDATE ON public.chat_folder_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS (ROW LEVEL SECURITY)
ALTER TABLE public.chat_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_folder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_semantic_index ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_folders
CREATE POLICY "Users can view their own folders" ON public.chat_folders
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can create their own folders" ON public.chat_folders
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can update their own folders" ON public.chat_folders
    FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can delete their own folders" ON public.chat_folders
    FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Políticas para chat_folder_items (via folder ownership)
CREATE POLICY "Users can view items in their folders" ON public.chat_folder_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_folders f 
            WHERE f.id = chat_folder_items.folder_id 
            AND (auth.uid()::text = f.user_id::text OR f.user_id IS NULL)
        )
    );

CREATE POLICY "Users can create items in their folders" ON public.chat_folder_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_folders f 
            WHERE f.id = chat_folder_items.folder_id 
            AND (auth.uid()::text = f.user_id::text OR f.user_id IS NULL)
        )
    );

CREATE POLICY "Users can update items in their folders" ON public.chat_folder_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chat_folders f 
            WHERE f.id = chat_folder_items.folder_id 
            AND (auth.uid()::text = f.user_id::text OR f.user_id IS NULL)
        )
    );

CREATE POLICY "Users can delete items in their folders" ON public.chat_folder_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.chat_folders f 
            WHERE f.id = chat_folder_items.folder_id 
            AND (auth.uid()::text = f.user_id::text OR f.user_id IS NULL)
        )
    );

-- Políticas para chat_semantic_index (via folder_item ownership)
CREATE POLICY "Users can view semantic index for their items" ON public.chat_semantic_index
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_folder_items fi
            JOIN public.chat_folders f ON f.id = fi.folder_id
            WHERE fi.id = chat_semantic_index.folder_item_id 
            AND (auth.uid()::text = f.user_id::text OR f.user_id IS NULL)
        )
    );

CREATE POLICY "Users can create semantic index for their items" ON public.chat_semantic_index
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_folder_items fi
            JOIN public.chat_folders f ON f.id = fi.folder_id
            WHERE fi.id = chat_semantic_index.folder_item_id 
            AND (auth.uid()::text = f.user_id::text OR f.user_id IS NULL)
        )
    );

-- 7. INSERIR PASTAS PADRÃO (para todos os usuários)
INSERT INTO public.chat_folders (name, type, description, icon, position, is_default) VALUES
('Portfólios', 'portfolios', 'Análises e simulações de carteiras de investimento', '💼', 1, true),
('Comparações', 'comparisons', 'Comparativos entre ETFs e fundos', '⚖️', 2, true),
('Screeners & Pesquisas', 'screeners', 'Filtros e consultas de ETFs salvos', '🔍', 3, true),
('Educação & Explicações', 'education', 'Conceitos e explicações sobre investimentos', '📖', 4, true),
('Compras & Operações', 'operations', 'Simulações de compra e venda', '🛒', 5, true),
('Relatórios & Alertas', 'reports', 'Relatórios gerados e alertas configurados', '📑', 6, true),
('Favoritos', 'favorites', 'Itens marcados como favoritos', '⭐', 7, true)
ON CONFLICT DO NOTHING; 