import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Forçar o uso do cliente Windows
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 Teste de saúde - Windows');
    
    // Teste básico de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`;
    
    // Contar ETFs
    const etfCount = await prisma.etf_list.count();
    
    // Buscar uma amostra
    const sampleETF = await prisma.etf_list.findFirst({
      select: {
        symbol: true,
        name: true,
        assetclass: true
      }
    });

    const response = {
      success: true,
      message: 'Conexão com banco funcionando!',
      platform: 'Windows',
      timestamp: new Date().toISOString(),
      data: {
        database_test: result,
        etf_count: etfCount,
        sample_etf: sampleETF,
        environment: {
          node_version: process.version,
          platform: process.platform,
          arch: process.arch
        }
      }
    };

    console.log('✅ Teste de saúde passou!');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro no teste de saúde:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        platform: 'Windows'
      },
      { status: 500 }
    );
  }
} 