const portfolioId = 'd733e728-f27d-40c1-bb44-6c6a1e53e58e';
const userId = '9ba39a20-7409-479d-a010-284ad452d4f8';

async function testAPI(url, name) {
  console.log(`\n🧪 Testando ${name}...`);
  try {
    const response = await fetch(url);
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Dados encontrados:`, JSON.stringify(data, null, 2));
      return data;
    } else {
      const error = await response.text();
      console.log(`❌ Erro:`, error);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erro de rede:`, error.message);
    return null;
  }
}

async function testAllAPIs() {
  console.log('🚀 TESTE FINAL DAS APIs DO PORTFOLIO TRACKING');
  console.log('=' .repeat(60));
  
  // Teste 1: Portfolio Allocations
  const allocations = await testAPI(
    `http://localhost:3000/api/portfolio/populate-allocations?portfolio_id=${portfolioId}&user_id=${userId}`,
    'Portfolio Allocations'
  );
  
  // Teste 2: Rebalance Suggestions
  const suggestions = await testAPI(
    `http://localhost:3000/api/portfolio/rebalance-suggestions?portfolio_id=${portfolioId}&user_id=${userId}`,
    'Rebalance Suggestions'
  );
  
  // Teste 3: Portfolio Tracking
  const tracking = await testAPI(
    `http://localhost:3000/api/portfolio/tracking?portfolio_id=${portfolioId}&user_id=${userId}`,
    'Portfolio Tracking'
  );
  
  // Teste 4: Debug Endpoint
  const debug = await testAPI(
    `http://localhost:3000/api/debug/portfolio-data?portfolio_id=${portfolioId}&user_id=${userId}`,
    'Debug Endpoint'
  );
  
  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('=' .repeat(60));
  console.log(`📊 Alocações: ${allocations ? 'FUNCIONANDO' : 'FALHA'}`);
  console.log(`📊 Sugestões: ${suggestions ? 'FUNCIONANDO' : 'FALHA'}`);
  console.log(`📊 Tracking: ${tracking ? 'FUNCIONANDO' : 'FALHA'}`);
  console.log(`📊 Debug: ${debug ? 'FUNCIONANDO' : 'FALHA'}`);
  
  console.log('\n🎯 DADOS ESPERADOS (confirmados via MCP Supabase):');
  console.log('- 7 alocações em portfolio_allocations');
  console.log('- 5 sugestões em rebalance_suggestions');
  console.log('- 0 tracking em portfolio_tracking');
  
  console.log('\n🎉 Teste concluído!');
}

testAllAPIs().catch(console.error); 