import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Não autorizado',
        authenticated: false 
      }, { status: 401 });
    }

    // Verificar se é administrador
    const adminEmails = ['eduspires123@gmail.com'];
    const isAdmin = user.email && adminEmails.includes(user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: isAdmin,
        authenticated: true
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar informações do usuário:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error.message
    }, { status: 500 });
  }
} 