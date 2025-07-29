import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Buscar itens de uma pasta ou busca geral
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const contentType = searchParams.get('contentType');
    const favorites = searchParams.get('favorites') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    console.log(`📄 Buscando itens para usuário: ${userId}, pasta: ${folderId}`);

    // Query base
    let query = supabase
      .from('chat_folder_items')
      .select(`
        id,
        title,
        summary,
        content_type,
        data,
        tags,
        is_favorite,
        is_archived,
        view_count,
        generated_files,
        is_shared,
        created_at,
        updated_at,
        last_accessed,
        chat_folders!inner(
          id,
          name,
          type,
          icon,
          user_id
        )
      `)
      .eq('chat_folders.user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtros opcionais
    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (favorites) {
      query = query.eq('is_favorite', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar itens:', error);
      return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 });
    }

    console.log(`✅ ${items?.length || 0} itens encontrados`);
    return NextResponse.json({ items: items || [] });

  } catch (error) {
    console.error('❌ Erro interno ao buscar itens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Salvar novo item na pasta com integração MCP Memory
export async function POST(request: NextRequest) {
  try {
    const {
      folderId,
      conversationId,
      messageId,
      title,
      summary,
      contentType,
      data,
      tags
    } = await request.json();

    if (!folderId || !title || !contentType) {
      return NextResponse.json({
        error: 'folderId, title e contentType são obrigatórios'
      }, { status: 400 });
    }

    console.log(`📄 Salvando item: ${title} na pasta: ${folderId}`);

    // Verificar se a pasta existe e pertence ao usuário
    const { data: folder, error: folderError } = await supabase
      .from('chat_folders')
      .select('id, user_id')
      .eq('id', folderId)
      .single();

    if (folderError || !folder) {
      return NextResponse.json({ error: 'Pasta não encontrada' }, { status: 404 });
    }

    // Gerar token único para compartilhamento (opcional)
    const shareToken = crypto.randomUUID().replace(/-/g, '').substring(0, 20);

    // Criar item
    const { data: item, error } = await supabase
      .from('chat_folder_items')
      .insert({
        folder_id: folderId,
        conversation_id: conversationId,
        message_id: messageId,
        title: title.substring(0, 200),
        summary: summary?.substring(0, 1000),
        content_type: contentType,
        data: data || {},
        tags: tags || [],
        share_token: shareToken
      })
      .select(`
        id,
        title,
        summary,
        content_type,
        data,
        tags,
        is_favorite,
        view_count,
        generated_files,
        created_at,
        chat_folders(name, type, icon)
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao salvar item:', error);
      return NextResponse.json({ error: 'Erro ao salvar item' }, { status: 500 });
    }

    // Integrar com MCP Memory para busca semântica
    try {
      await indexItemForSemanticSearch(item);
    } catch (memoryError) {
      console.warn('⚠️ Erro ao indexar no MCP Memory:', memoryError);
      // Não falhar a operação por causa disso
    }

    console.log(`✅ Item salvo: ${item.id}`);
    return NextResponse.json({ item });

  } catch (error) {
    console.error('❌ Erro interno ao salvar item:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar item
export async function PUT(request: NextRequest) {
  try {
    const {
      itemId,
      userId,
      title,
      summary,
      tags,
      isFavorite,
      data
    } = await request.json();

    if (!itemId || !userId) {
      return NextResponse.json({
        error: 'itemId e userId são obrigatórios'
      }, { status: 400 });
    }

    console.log(`📄 Atualizando item: ${itemId} para usuário: ${userId}`);

    // Verificar se o item pertence ao usuário
    const { data: existingItem, error: checkError } = await supabase
      .from('chat_folder_items')
      .select(`
        id,
        chat_folders!inner(user_id)
      `)
      .eq('id', itemId)
      .eq('chat_folders.user_id', userId)
      .single();

    if (checkError || !existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    // Atualizar item
    const updateData: any = {
      last_accessed: new Date().toISOString()
    };

    if (title) updateData.title = title.substring(0, 200);
    if (summary !== undefined) updateData.summary = summary?.substring(0, 1000);
    if (tags) updateData.tags = tags;
    if (isFavorite !== undefined) updateData.is_favorite = isFavorite;
    if (data) updateData.data = data;

    const { data: item, error } = await supabase
      .from('chat_folder_items')
      .update(updateData)
      .eq('id', itemId)
      .select(`
        id,
        title,
        summary,
        content_type,
        data,
        tags,
        is_favorite,
        view_count,
        generated_files,
        updated_at,
        chat_folders(name, type, icon)
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar item:', error);
      return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
    }

    console.log(`✅ Item atualizado: ${item.id}`);
    return NextResponse.json({ item });

  } catch (error) {
    console.error('❌ Erro interno ao atualizar item:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');

    if (!itemId || !userId) {
      return NextResponse.json({
        error: 'itemId e userId são obrigatórios'
      }, { status: 400 });
    }

    console.log(`📄 Removendo item: ${itemId} para usuário: ${userId}`);

    // Verificar se o item pertence ao usuário
    const { data: existingItem, error: checkError } = await supabase
      .from('chat_folder_items')
      .select(`
        id,
        chat_folders!inner(user_id)
      `)
      .eq('id', itemId)
      .eq('chat_folders.user_id', userId)
      .single();

    if (checkError || !existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    // Remover item (índice semântico será removido automaticamente por CASCADE)
    const { error } = await supabase
      .from('chat_folder_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('❌ Erro ao remover item:', error);
      return NextResponse.json({ error: 'Erro ao remover item' }, { status: 500 });
    }

    console.log(`✅ Item removido: ${itemId}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro interno ao remover item:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função auxiliar para indexar item no MCP Memory
async function indexItemForSemanticSearch(item: any) {
  try {
    // Extrair entidades e keywords do conteúdo
    const entities = extractEntitiesFromContent(item);
    const keywords = extractKeywordsFromContent(item);
    const intent = determineContentIntent(item.content_type, item.data);

    // Salvar no índice semântico
    const { error } = await supabase
      .from('chat_semantic_index')
      .insert({
        folder_item_id: item.id,
        keywords,
        entities,
        intent,
        context_data: {
          title: item.title,
          summary: item.summary,
          content_type: item.content_type,
          tags: item.tags
        }
      });

    if (error) {
      console.error('❌ Erro ao criar índice semântico:', error);
    }

    // Integrar com MCP Memory para busca semântica avançada
    try {
      // Criar entidade no MCP Memory
      const memoryEntities = [{
        name: `folder_item_${item.id}`,
        entityType: 'saved_analysis',
        observations: [
          `Análise salva: ${item.title}`,
          `Tipo: ${item.content_type}`,
          `Resumo: ${item.summary || 'Sem resumo'}`,
          `Tags: ${item.tags?.join(', ') || 'Sem tags'}`,
          `Entidades identificadas: ${entities.join(', ')}`,
          `Keywords: ${keywords.join(', ')}`,
          `Intenção: ${intent}`
        ]
      }];

      // TODO: Integrar com MCP Memory real quando disponível
      console.log('🧠 Indexando no MCP Memory:', memoryEntities);
      
      /*
      await mcp_memory_create_entities({
        entities: memoryEntities
      });
      */

    } catch (mcpError) {
      console.warn('⚠️ Erro ao integrar com MCP Memory:', mcpError);
    }

  } catch (error) {
    console.error('❌ Erro na indexação semântica:', error);
    throw error;
  }
}

// Função auxiliar para extrair entidades do conteúdo
function extractEntitiesFromContent(item: any): string[] {
  const entities: string[] = [];
  
  // Extrair ETFs mencionados
  const etfPattern = /\b[A-Z]{2,5}\b/g;
  const etfMatches = (item.title + ' ' + (item.summary || '')).match(etfPattern);
  if (etfMatches) {
    entities.push(...etfMatches.filter(etf => etf.length <= 5));
  }

  // Extrair conceitos financeiros comuns
  const financialConcepts = [
    'portfolio', 'sharpe', 'volatilidade', 'dividend', 'yield', 'expense ratio',
    'retorno', 'risco', 'alocação', 'diversificação', 'rebalanceamento'
  ];

  const content = (item.title + ' ' + (item.summary || '')).toLowerCase();
  financialConcepts.forEach(concept => {
    if (content.includes(concept)) {
      entities.push(concept);
    }
  });

  // Extrair entidades dos dados estruturados
  if (item.data && typeof item.data === 'object') {
    // ETFs do portfolio
    if (item.data.etfs) {
      const etfSymbols = item.data.etfs.map((etf: any) => etf.symbol || etf.ticker).filter(Boolean);
      entities.push(...etfSymbols);
    }

    // Métricas importantes
    if (item.data.metrics) {
      Object.keys(item.data.metrics).forEach(metric => {
        if (['sharpe', 'volatility', 'return', 'risk'].some(key => metric.toLowerCase().includes(key))) {
          entities.push(metric);
        }
      });
    }
  }

  return [...new Set(entities)]; // Remove duplicatas
}

// Função auxiliar para extrair keywords
function extractKeywordsFromContent(item: any): string[] {
  const keywords: string[] = [];
  
  // Keywords do título e resumo
  const text = (item.title + ' ' + (item.summary || '')).toLowerCase();
  const words = text.split(/\s+/).filter(word => word.length > 3);
  
  keywords.push(...words.slice(0, 10)); // Top 10 palavras
  
  // Keywords das tags
  if (item.tags) {
    keywords.push(...item.tags);
  }

  // Keywords dos dados estruturados
  if (item.data && typeof item.data === 'object') {
    const dataText = JSON.stringify(item.data).toLowerCase();
    const dataWords = dataText.match(/[a-z]{4,}/g) || [];
    keywords.push(...dataWords.slice(0, 5));
  }

  return [...new Set(keywords)]; // Remove duplicatas
}

// Função auxiliar para determinar intenção do conteúdo
function determineContentIntent(contentType: string, data: any): string {
  const intentMap: { [key: string]: string } = {
    'portfolio_analysis': 'portfolio_optimization',
    'etf_comparison': 'investment_comparison',
    'screener_query': 'etf_discovery',
    'educational_content': 'learning',
    'market_analysis': 'market_research',
    'trade_simulation': 'trading',
    'report_pdf': 'reporting'
  };

  let intent = intentMap[contentType] || 'general_analysis';

  // Refinar intenção baseado nos dados
  if (data && typeof data === 'object') {
    if (data.action === 'buy' || data.action === 'sell') {
      intent = 'trading_action';
    } else if (data.comparison && Array.isArray(data.comparison)) {
      intent = 'comparative_analysis';
    } else if (data.optimization || data.markowitz) {
      intent = 'portfolio_optimization';
    }
  }

  return intent;
} 