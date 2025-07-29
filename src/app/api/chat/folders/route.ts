import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Buscar todas as pastas do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeItems = searchParams.get('includeItems') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    console.log(`📁 Buscando pastas para usuário: ${userId}`);

    // Query base para pastas
    let query = supabase
      .from('chat_folders')
      .select(`
        id,
        name,
        type,
        description,
        icon,
        color,
        position,
        is_default,
        is_custom,
        metadata,
        created_at,
        updated_at
        ${includeItems ? `, chat_folder_items(
          id,
          title,
          summary,
          content_type,
          is_favorite,
          is_archived,
          view_count,
          created_at,
          last_accessed
        )` : ''}
      `)
      .or(`user_id.eq.${userId},user_id.is.null`) // Pastas do usuário + pastas padrão
      .order('position', { ascending: true });

    const { data: folders, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar pastas:', error);
      return NextResponse.json({ error: 'Erro ao buscar pastas' }, { status: 500 });
    }

    // Se não tem pastas personalizadas, criar as padrão para o usuário
    if (!folders || folders.length === 0) {
      await createDefaultFolders(userId);
      
      // Buscar novamente após criar
      const { data: newFolders, error: newError } = await query;
      if (newError) {
        console.error('❌ Erro ao buscar pastas após criação:', newError);
        return NextResponse.json({ error: 'Erro ao buscar pastas' }, { status: 500 });
      }
      
      console.log(`✅ Pastas padrão criadas para usuário: ${userId}`);
      return NextResponse.json({ folders: newFolders || [] });
    }

    console.log(`✅ ${folders.length} pastas encontradas para usuário: ${userId}`);
    return NextResponse.json({ folders });

  } catch (error) {
    console.error('❌ Erro interno ao buscar pastas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova pasta personalizada
export async function POST(request: NextRequest) {
  try {
    const { userId, name, description, icon, color, type } = await request.json();

    if (!userId || !name) {
      return NextResponse.json({ 
        error: 'userId e name são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`📁 Criando pasta personalizada: ${name} para usuário: ${userId}`);

    // Buscar a maior posição atual
    const { data: maxPositionData } = await supabase
      .from('chat_folders')
      .select('position')
      .eq('user_id', userId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPositionData?.[0]?.position || 0) + 1;

    // Criar pasta personalizada
    const { data: folder, error } = await supabase
      .from('chat_folders')
      .insert({
        user_id: userId,
        name: name.substring(0, 100),
        type: type || 'custom',
        description: description?.substring(0, 500),
        icon: icon || '📁',
        color: color || '#3B82F6',
        position: nextPosition,
        is_default: false,
        is_custom: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar pasta:', error);
      return NextResponse.json({ error: 'Erro ao criar pasta' }, { status: 500 });
    }

    console.log(`✅ Pasta criada: ${folder.id}`);
    return NextResponse.json({ folder });

  } catch (error) {
    console.error('❌ Erro interno ao criar pasta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar pasta
export async function PUT(request: NextRequest) {
  try {
    const { folderId, userId, name, description, icon, color, position } = await request.json();

    if (!folderId || !userId) {
      return NextResponse.json({ 
        error: 'folderId e userId são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`📁 Atualizando pasta: ${folderId} para usuário: ${userId}`);

    // Verificar se a pasta pertence ao usuário
    const { data: existingFolder, error: checkError } = await supabase
      .from('chat_folders')
      .select('id, is_default')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingFolder) {
      return NextResponse.json({ error: 'Pasta não encontrada' }, { status: 404 });
    }

    // Não permitir editar pastas padrão (apenas customizadas)
    if (existingFolder.is_default) {
      return NextResponse.json({ 
        error: 'Pastas padrão não podem ser editadas' 
      }, { status: 403 });
    }

    // Atualizar pasta
    const updateData: any = {};
    if (name) updateData.name = name.substring(0, 100);
    if (description !== undefined) updateData.description = description?.substring(0, 500);
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (position !== undefined) updateData.position = position;

    const { data: folder, error } = await supabase
      .from('chat_folders')
      .update(updateData)
      .eq('id', folderId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar pasta:', error);
      return NextResponse.json({ error: 'Erro ao atualizar pasta' }, { status: 500 });
    }

    console.log(`✅ Pasta atualizada: ${folder.id}`);
    return NextResponse.json({ folder });

  } catch (error) {
    console.error('❌ Erro interno ao atualizar pasta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover pasta personalizada
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const userId = searchParams.get('userId');

    if (!folderId || !userId) {
      return NextResponse.json({ 
        error: 'folderId e userId são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`📁 Removendo pasta: ${folderId} para usuário: ${userId}`);

    // Verificar se a pasta pertence ao usuário e não é padrão
    const { data: existingFolder, error: checkError } = await supabase
      .from('chat_folders')
      .select('id, is_default, is_custom')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingFolder) {
      return NextResponse.json({ error: 'Pasta não encontrada' }, { status: 404 });
    }

    // Não permitir remover pastas padrão
    if (existingFolder.is_default || !existingFolder.is_custom) {
      return NextResponse.json({ 
        error: 'Pastas padrão não podem ser removidas' 
      }, { status: 403 });
    }

    // Remover pasta (itens serão removidos automaticamente por CASCADE)
    const { error } = await supabase
      .from('chat_folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erro ao remover pasta:', error);
      return NextResponse.json({ error: 'Erro ao remover pasta' }, { status: 500 });
    }

    console.log(`✅ Pasta removida: ${folderId}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro interno ao remover pasta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função auxiliar para criar pastas padrão para novos usuários
async function createDefaultFolders(userId: string) {
  const defaultFolders = [
    {
      user_id: userId,
      name: 'Portfólios',
      type: 'portfolios',
      description: 'Análises e simulações de carteiras de investimento',
      icon: '💼',
      position: 1,
      is_default: true
    },
    {
      user_id: userId,
      name: 'Comparações',
      type: 'comparisons',
      description: 'Comparativos entre ETFs e fundos',
      icon: '⚖️',
      position: 2,
      is_default: true
    },
    {
      user_id: userId,
      name: 'Screeners & Pesquisas',
      type: 'screeners',
      description: 'Filtros e consultas de ETFs salvos',
      icon: '🔍',
      position: 3,
      is_default: true
    },
    {
      user_id: userId,
      name: 'Educação & Explicações',
      type: 'education',
      description: 'Conceitos e explicações sobre investimentos',
      icon: '📖',
      position: 4,
      is_default: true
    },
    {
      user_id: userId,
      name: 'Compras & Operações',
      type: 'operations',
      description: 'Simulações de compra e venda',
      icon: '🛒',
      position: 5,
      is_default: true
    },
    {
      user_id: userId,
      name: 'Relatórios & Alertas',
      type: 'reports',
      description: 'Relatórios gerados e alertas configurados',
      icon: '📑',
      position: 6,
      is_default: true
    },
    {
      user_id: userId,
      name: 'Favoritos',
      type: 'favorites',
      description: 'Itens marcados como favoritos',
      icon: '⭐',
      position: 7,
      is_default: true
    }
  ];

  const { error } = await supabase
    .from('chat_folders')
    .insert(defaultFolders);

  if (error) {
    console.error('❌ Erro ao criar pastas padrão:', error);
    throw error;
  }
} 