import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      status: 'ok',
      message: 'Servidor funcionando',
      checks: {
        environmentVariables: {
          status: 'ok',
          message: 'Variáveis de ambiente verificadas',
          details: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          }
        },
        server: {
          status: 'ok',
          message: 'Servidor Next.js funcionando',
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      }
    };

    // Verificar se variáveis críticas estão configuradas
    const envVarsOk = Object.values(checks.checks.environmentVariables.details).every(Boolean);
    if (!envVarsOk) {
      checks.checks.environmentVariables.status = 'warning';
      checks.checks.environmentVariables.message = 'Algumas variáveis de ambiente ausentes';
      checks.status = 'warning';
      checks.message = 'Sistema funcionando com avisos';
    }

    return NextResponse.json(checks, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno no health check',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 