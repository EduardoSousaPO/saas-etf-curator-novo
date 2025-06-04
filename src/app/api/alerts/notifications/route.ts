import { NextRequest, NextResponse } from 'next/server';
import { AlertEngine } from '@/lib/alerts/alert-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const notifications = AlertEngine.getUserNotifications(userId);
    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAllAsRead } = body;

    if (markAllAsRead && userId) {
      // Marcar todas as notificações como lidas
      const count = AlertEngine.markAllNotificationsAsRead(userId);
      return NextResponse.json({ 
        success: true, 
        markedCount: count,
        message: `${count} notificações marcadas como lidas` 
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId é obrigatório' },
        { status: 400 }
      );
    }

    const success = AlertEngine.markNotificationAsRead(notificationId);

    if (!success) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 