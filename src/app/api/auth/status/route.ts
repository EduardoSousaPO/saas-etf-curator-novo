import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 Testando status de autenticação...');
    
    const supabase = createClient();
    
    // Teste básico de conectividade
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao verificar sessão',
        details: sessionError.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'Não configurada',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada'
      }, { status: 500 });
    }

    // Teste de conectividade com o banco
    const { error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    const response = {
      success: true,
      message: 'Autenticação funcionando',
      session: session ? {
        user_id: session.user.id,
        email: session.user.email,
        email_confirmed: !!session.user.email_confirmed_at
      } : null,
      database: {
        connected: !testError,
        error: testError?.message || null
      },
      config: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'Não configurada',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada'
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Status de autenticação:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro inesperado no teste de autenticação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro inesperado',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 