import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Salvar nova mensagem
export async function POST(request: NextRequest) {
  try {
    const { 
      conversationId, 
      content, 
      sender, 
      intent, 
      insights, 
      nextSteps, 
      metadata 
    } = await request.json();

    if (!conversationId || !content || !sender) {
      return NextResponse.json({ 
        error: 'conversationId, content e sender são obrigatórios' 
      }, { status: 400 });
    }

    if (!['user', 'assistant'].includes(sender)) {
      return NextResponse.json({ 
        error: 'sender deve ser "user" ou "assistant"' 
      }, { status: 400 });
    }

    console.log(`💬 Salvando mensagem na conversa: ${conversationId}`);

    // Salvar mensagem
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        content,
        sender,
        intent,
        insights,
        next_steps: nextSteps,
        metadata
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Erro ao salvar mensagem:', messageError);
      return NextResponse.json({ error: 'Erro ao salvar mensagem' }, { status: 500 });
    }

    // Se for mensagem do usuário, atualizar última mensagem da conversa
    if (sender === 'user') {
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ 
          last_message: content.substring(0, 200),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar conversa:', updateError);
        // Não falhar por causa disso
      }
    }

    console.log(`✅ Mensagem salva: ${message.id}`);

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: new Date(message.created_at),
        intent: message.intent,
        insights: message.insights,
        nextSteps: message.next_steps,
        metadata: message.metadata
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET - Buscar mensagens de uma conversa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId é obrigatório' }, { status: 400 });
    }

    console.log(`📚 Buscando mensagens da conversa: ${conversationId}`);

    // Buscar mensagens da conversa
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 });
    }

    // Formatar mensagens
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: new Date(msg.created_at),
      intent: msg.intent,
      insights: msg.insights,
      nextSteps: msg.next_steps,
      metadata: msg.metadata
    })) || [];

    console.log(`✅ ${formattedMessages.length} mensagens encontradas`);

    return NextResponse.json({
      messages: formattedMessages,
      total: formattedMessages.length,
      hasMore: formattedMessages.length === limit
    });

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar mensagem (para edições futuras)
export async function PUT(request: NextRequest) {
  try {
    const { messageId, content, metadata } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'messageId é obrigatório' }, { status: 400 });
    }

    console.log(`📝 Atualizando mensagem: ${messageId}`);

    const updateData: any = {};
    if (content) updateData.content = content;
    if (metadata) updateData.metadata = metadata;

    const { data: message, error } = await supabase
      .from('chat_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar mensagem:', error);
      return NextResponse.json({ error: 'Erro ao atualizar mensagem' }, { status: 500 });
    }

    console.log(`✅ Mensagem atualizada: ${messageId}`);

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: new Date(message.created_at),
        intent: message.intent,
        insights: message.insights,
        nextSteps: message.next_steps,
        metadata: message.metadata
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir mensagem
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'messageId é obrigatório' }, { status: 400 });
    }

    console.log(`🗑️ Excluindo mensagem: ${messageId}`);

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('❌ Erro ao excluir mensagem:', error);
      return NextResponse.json({ error: 'Erro ao excluir mensagem' }, { status: 500 });
    }

    console.log(`✅ Mensagem excluída: ${messageId}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao excluir mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 