import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        profile: null,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar perfil do usuário no banco
    let profile: any = null;
    try {
      profile = await prisma.user_profiles.findUnique({
        where: { id: user.id }
      });
    } catch (profileError) {
      console.warn('Erro ao buscar perfil:', profileError);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      profile,
      hasProfile: !!profile,
      profileComplete: !!(profile?.full_name && profile?.investment_experience),
      message: 'Usuário autenticado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao verificar status de autenticação:', error);
    
    return NextResponse.json({
      authenticated: false,
      user: null,
      profile: null,
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar autenticação'
    }, { status: 500 });
  }
} 