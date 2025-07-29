import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Buscar histórico de conversas do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    console.log(`📚 Buscando histórico de conversas para usuário: ${userId}`);

    // Buscar conversas do usuário ordenadas por data
    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select(`
        id,
        title,
        last_message,
        created_at,
        updated_at,
        chat_messages (
          id,
          content,
          sender,
          intent,
          insights,
          next_steps,
          metadata,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar conversas:', error);
      return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 });
    }

    // Formatar dados para o frontend
    const formattedConversations = conversations?.map(conv => ({
      id: conv.id,
      title: conv.title,
      lastMessage: conv.last_message,
      timestamp: new Date(conv.updated_at),
      messages: conv.chat_messages?.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
        intent: msg.intent,
        insights: msg.insights,
        nextSteps: msg.next_steps,
        metadata: msg.metadata
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) || []
    })) || [];

    console.log(`✅ ${formattedConversations.length} conversas encontradas`);

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    });

  } catch (error) {
    console.error('❌ Erro na API de conversas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const { userId, title, firstMessage } = await request.json();

    if (!userId || !title || !firstMessage) {
      return NextResponse.json({ 
        error: 'userId, title e firstMessage são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`💬 Criando nova conversa para usuário: ${userId}`);

    // Criar nova conversa
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title: title.substring(0, 100), // Limitar título
        last_message: firstMessage.substring(0, 200) // Limitar preview
      })
      .select()
      .single();

    if (convError) {
      console.error('❌ Erro ao criar conversa:', convError);
      return NextResponse.json({ error: 'Erro ao criar conversa' }, { status: 500 });
    }

    console.log(`✅ Conversa criada: ${conversation.id}`);

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        lastMessage: conversation.last_message,
        timestamp: new Date(conversation.created_at),
        messages: []
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar conversa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar conversa (título, última mensagem)
export async function PUT(request: NextRequest) {
  try {
    const { conversationId, title, lastMessage } = await request.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId é obrigatório' }, { status: 400 });
    }

    console.log(`📝 Atualizando conversa: ${conversationId}`);

    const updateData: any = {};
    if (title) updateData.title = title.substring(0, 100);
    if (lastMessage) updateData.last_message = lastMessage.substring(0, 200);

    const { data, error } = await supabase
      .from('chat_conversations')
      .update(updateData)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar conversa:', error);
      return NextResponse.json({ error: 'Erro ao atualizar conversa' }, { status: 500 });
    }

    console.log(`✅ Conversa atualizada: ${conversationId}`);

    return NextResponse.json({
      conversation: {
        id: data.id,
        title: data.title,
        lastMessage: data.last_message,
        timestamp: new Date(data.updated_at)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar conversa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir conversa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');

    if (!conversationId || !userId) {
      return NextResponse.json({ 
        error: 'conversationId e userId são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`🗑️ Excluindo conversa: ${conversationId}`);

    // Verificar se a conversa pertence ao usuário
    const { data: conversation, error: checkError } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (checkError || !conversation) {
      return NextResponse.json({ 
        error: 'Conversa não encontrada ou não autorizada' 
      }, { status: 404 });
    }

    // Excluir conversa (mensagens são excluídas automaticamente por CASCADE)
    const { error: deleteError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('❌ Erro ao excluir conversa:', deleteError);
      return NextResponse.json({ error: 'Erro ao excluir conversa' }, { status: 500 });
    }

    console.log(`✅ Conversa excluída: ${conversationId}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao excluir conversa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 