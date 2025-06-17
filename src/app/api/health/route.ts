import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const checks: {
    timestamp: string;
    environment: string | undefined;
    checks: any;
    overall?: {
      status: string;
      message: string;
    };
  } = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {} as any
  };

  // 1. Verificar variáveis de ambiente críticas
  checks.checks.environmentVariables = {
    status: 'checking',
    details: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  };

  const envVarsOk = Object.values(checks.checks.environmentVariables.details).every(Boolean);
  checks.checks.environmentVariables.status = envVarsOk ? 'ok' : 'error';
  checks.checks.environmentVariables.message = envVarsOk ? 'Todas as variáveis estão configuradas' : 'Variáveis críticas ausentes';

  // 2. Verificar conexão com Prisma/Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = {
      status: 'ok',
      message: 'Conexão com banco de dados funcionando',
      provider: 'prisma'
    };
  } catch (error) {
    checks.checks.database = {
      status: 'error',
      message: `Falha na conexão com banco: ${error instanceof Error ? error.message : 'Unknown error'}`,
      provider: 'prisma'
    };
  }

  // 3. Verificar conexão com Supabase Auth
  try {
    const { data, error } = await supabase.auth.getSession();
    checks.checks.supabaseAuth = {
      status: error ? 'error' : 'ok',
      message: error ? `Erro Supabase Auth: ${error.message}` : 'Supabase Auth configurado corretamente',
      hasSession: !!data.session
    };
  } catch (error) {
    checks.checks.supabaseAuth = {
      status: 'error',
      message: `Falha ao verificar Supabase Auth: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }

  // 4. Verificar se há dados no banco
  try {
    const etfCount = await prisma.etf_list.count();
    const metricsCount = await prisma.calculated_metrics_teste.count();
    
    checks.checks.dataAvailability = {
      status: (etfCount > 0 && metricsCount > 0) ? 'ok' : 'warning',
      message: `${etfCount} ETFs, ${metricsCount} métricas no banco`,
      details: {
        etfs: etfCount,
        metrics: metricsCount
      }
    };
  } catch (error) {
    checks.checks.dataAvailability = {
      status: 'error',
      message: `Falha ao verificar dados: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }

  // Status geral
  const allChecks = Object.values(checks.checks);
  const hasErrors = allChecks.some((check: any) => check.status === 'error');
  const hasWarnings = allChecks.some((check: any) => check.status === 'warning');

  checks.overall = {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    message: hasErrors ? 'Sistema com problemas críticos' : hasWarnings ? 'Sistema funcionando com avisos' : 'Todos os sistemas funcionando'
  };

  // Retornar status HTTP apropriado
  const statusCode = hasErrors ? 500 : hasWarnings ? 200 : 200;

  return NextResponse.json(checks, { status: statusCode });
} 