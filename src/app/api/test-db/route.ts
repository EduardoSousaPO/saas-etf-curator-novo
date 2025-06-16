import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Teste 1: Conexão básica
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão básica funcionando');
    
    // Teste 2: Verificar se tabela calculated_metrics_teste existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'calculated_metrics_teste'
      );
    `;
    console.log('📊 Tabela calculated_metrics_teste existe:', tableExists);
    
    // Teste 3: Contar registros na tabela
    const count = await prisma.calculated_metrics_teste.count();
    console.log(`📈 Total de registros na calculated_metrics_teste: ${count}`);
    
    // Teste 4: Buscar alguns registros de exemplo
    const samples = await prisma.calculated_metrics_teste.findMany({
      take: 3,
      select: {
        symbol: true,
        returns_12m: true,
        volatility_12m: true,
        sharpe_12m: true
      }
    });
    console.log('📋 Amostras de dados:', samples);
    
    // Teste 5: Verificar tabela etf_list
    const etfCount = await prisma.etf_list.count();
    console.log(`📊 Total de ETFs na etf_list: ${etfCount}`);
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: true,
        tableExists: tableExists,
        metricsCount: count,
        etfCount: etfCount,
        samples: samples
      },
      message: 'Todos os testes de banco passaram!'
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de banco:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 