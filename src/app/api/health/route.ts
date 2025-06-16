import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Health check iniciado...');
    
    // Verificar se DATABASE_URL existe
    const databaseUrl = process.env.DATABASE_URL;
    const hasDatabaseUrl = !!databaseUrl;
    const databaseUrlLength = databaseUrl ? databaseUrl.length : 0;
    
    console.log('📊 DATABASE_URL existe:', hasDatabaseUrl);
    console.log('📊 DATABASE_URL length:', databaseUrlLength);
    
    // Verificar outras variáveis importantes
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      variables: {
        DATABASE_URL: hasDatabaseUrl ? `Configurada (${databaseUrlLength} chars)` : 'Não encontrada',
        NEXTAUTH_SECRET: nextAuthSecret ? 'Configurada' : 'Não encontrada',
        NEXTAUTH_URL: nextAuthUrl || 'Não encontrada'
      },
      message: 'Health check concluído com sucesso'
    };
    
    console.log('✅ Health check response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 