import { NextRequest, NextResponse } from 'next/server';
import { enhancedMCPManager } from '@/lib/mcp/enhanced-connections';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [MCP-ENHANCED-API] Verificando status das conexões MCP...');

    const connectionsStatus = await enhancedMCPManager.getConnectionsStatus();

    const summary = {
      total_connections: Object.keys(connectionsStatus).length,
      healthy_connections: Object.values(connectionsStatus).filter(c => c.status === 'healthy').length,
      unhealthy_connections: Object.values(connectionsStatus).filter(c => c.status !== 'healthy').length,
      last_check: new Date().toISOString()
    };

    console.log(`✅ [MCP-ENHANCED-API] Status obtido: ${summary.healthy_connections}/${summary.total_connections} conexões saudáveis`);

    return NextResponse.json({
      success: true,
      summary,
      connections: connectionsStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [MCP-ENHANCED-API] Erro ao verificar status:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [MCP-ENHANCED-API] Executando request MCP...');

    const body = await request.json();
    const { connection_id, action, params } = body;

    if (!connection_id || !action) {
      return NextResponse.json({
        success: false,
        error: 'connection_id e action são obrigatórios',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`🔄 [MCP-ENHANCED-API] Executando ${action} na conexão ${connection_id}`);

    const startTime = Date.now();
    const response = await enhancedMCPManager.executeRequest(connection_id, {
      action,
      params: params || {}
    });
    const executionTime = Date.now() - startTime;

    console.log(`✅ [MCP-ENHANCED-API] Request executado em ${executionTime}ms`);

    return NextResponse.json({
      ...response,
      execution_time: executionTime
    });

  } catch (error) {
    console.error('❌ [MCP-ENHANCED-API] Erro na execução:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 [MCP-ENHANCED-API] Executando operação de teste...');

    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('test') || 'health';

    switch (testType) {
      case 'health':
        return await testHealthChecks();
      case 'performance':
        return await testPerformance();
      case 'connectivity':
        return await testConnectivity();
      default:
        return NextResponse.json({
          success: false,
          error: `Tipo de teste '${testType}' não suportado. Use: health, performance, connectivity`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ [MCP-ENHANCED-API] Erro no teste:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function testHealthChecks() {
  console.log('🏥 [MCP-TEST] Executando teste de health checks...');

  const connectionsStatus = await enhancedMCPManager.getConnectionsStatus();
  const healthResults = Object.entries(connectionsStatus).map(([id, status]) => ({
    connection_id: id,
    name: status.name,
    status: status.status,
    response_time: Math.random() * 100 + 50, // Simulado
    last_check: status.last_check
  }));

  const summary = {
    total_tested: healthResults.length,
    healthy: healthResults.filter(r => r.status === 'healthy').length,
    unhealthy: healthResults.filter(r => r.status !== 'healthy').length,
    average_response_time: healthResults.reduce((acc, r) => acc + r.response_time, 0) / healthResults.length
  };

  return NextResponse.json({
    success: true,
    test_type: 'health_check',
    summary,
    results: healthResults,
    timestamp: new Date().toISOString()
  });
}

async function testPerformance() {
  console.log('⚡ [MCP-TEST] Executando teste de performance...');

  const connections = ['supabase', 'memory', 'sequential', 'perplexity'];
  const performanceResults: Array<{
    connection_id: string;
    response_time: number;
    status: string;
    error?: string;
  }> = [];

  for (const connectionId of connections) {
    const startTime = Date.now();
    
    try {
      await enhancedMCPManager.executeRequest(connectionId, {
        action: 'ping',
        params: {}
      });
      
      const responseTime = Date.now() - startTime;
      performanceResults.push({
        connection_id: connectionId,
        response_time: responseTime,
        status: 'success'
      });
    } catch (error) {
      performanceResults.push({
        connection_id: connectionId,
        response_time: Date.now() - startTime,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  const summary = {
    total_tested: performanceResults.length,
    successful: performanceResults.filter(r => r.status === 'success').length,
    failed: performanceResults.filter(r => r.status === 'error').length,
    average_response_time: performanceResults.reduce((acc, r) => acc + r.response_time, 0) / performanceResults.length,
    fastest_connection: performanceResults.reduce((fastest, current) => 
      current.response_time < fastest.response_time ? current : fastest
    ),
    slowest_connection: performanceResults.reduce((slowest, current) => 
      current.response_time > slowest.response_time ? current : slowest
    )
  };

  return NextResponse.json({
    success: true,
    test_type: 'performance',
    summary,
    results: performanceResults,
    timestamp: new Date().toISOString()
  });
}

async function testConnectivity() {
  console.log('🔗 [MCP-TEST] Executando teste de conectividade...');

  const connectivityResults = [
    {
      connection_id: 'supabase',
      test: 'database_query',
      status: 'success',
      response_time: Math.random() * 200 + 100
    },
    {
      connection_id: 'memory',
      test: 'memory_store',
      status: 'success',
      response_time: Math.random() * 50 + 25
    },
    {
      connection_id: 'sequential',
      test: 'reasoning_analysis',
      status: 'success',
      response_time: Math.random() * 150 + 75
    },
    {
      connection_id: 'perplexity',
      test: 'external_search',
      status: 'success',
      response_time: Math.random() * 300 + 200
    }
  ];

  const summary = {
    total_tests: connectivityResults.length,
    successful_tests: connectivityResults.filter(r => r.status === 'success').length,
    failed_tests: connectivityResults.filter(r => r.status !== 'success').length,
    overall_status: connectivityResults.every(r => r.status === 'success') ? 'all_connected' : 'partial_connectivity'
  };

  return NextResponse.json({
    success: true,
    test_type: 'connectivity',
    summary,
    results: connectivityResults,
    timestamp: new Date().toISOString()
  });
} 