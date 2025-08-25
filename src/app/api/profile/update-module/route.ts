import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { selected_module } = await request.json();

    // Validar módulo
    const validModules = ['etfs', 'stocks'];
    if (!validModules.includes(selected_module)) {
      return NextResponse.json(
        { error: 'Módulo inválido' },
        { status: 400 }
      );
    }

    // Obter usuário da sessão
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    // Extrair token do header
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Atualizar perfil do usuário
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ selected_module })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      return NextResponse.json(
        { error: 'Erro ao salvar módulo selecionado' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      selected_module
    });

  } catch (error) {
    console.error('Erro na API update-module:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

