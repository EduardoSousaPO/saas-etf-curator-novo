const baseURL = 'http://localhost:3001';
const portfolioId = 'd733e728-f27d-40c1-bb44-6c6a1e53e58e';
const userId = '9ba39a20-7409-479d-a010-284ad452d4f8';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🔍 Testando: ${description}`);
    const response = await fetch(`${baseURL}${endpoint}`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Dados:`, JSON.stringify(data, null, 2));
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runCompleteTest() {
  console.log('🚀 TESTE COMPLETO DA SOLUÇÃO IMPLEMENTADA');
  console.log('=' .repeat(50));

  // 1. Testar nova API de dados reais
  const realDataTest = await testAPI(
    `/api/portfolio/real-data?portfolio_id=${portfolioId}&user_id=${userId}`,
    'API de Dados Reais'
  );

  if (realDataTest.success) {
    const realData = realDataTest.data.data;
    console.log('\n📋 ANÁLISE DOS DADOS REAIS:');
    console.log(`   • Portfolio Status: ${realData.portfolio_status}`);
    console.log(`   • Tem compras reais: ${realData.has_real_purchases}`);
    console.log(`   • Total investido real: $${realData.total_invested_real}`);
    console.log(`   • Total investido simulado: $${realData.total_invested_simulated}`);
    console.log(`   • Usando dados reais: ${realData.summary.using_real_data}`);
    console.log(`   • Fonte dos dados: ${realData.summary.data_freshness}`);
    console.log(`   • Total de compras: ${realData.summary.total_purchases}`);
    console.log(`   • Alocações encontradas: ${realData.allocations.length}`);
    
    // Verificar se os dados estão corretos
    if (realData.portfolio_status === 'NEW' && !realData.has_real_purchases) {
      console.log('✅ CORRETO: Portfolio identificado como NOVO sem compras reais');
    } else {
      console.log('❌ PROBLEMA: Portfolio deveria ser identificado como NOVO');
    }
  }

  // 2. Testar API de rebalanceamento moderno
  const rebalanceTest = await testAPI(
    `/api/portfolio/modern-rebalancing?portfolio_id=${portfolioId}&user_id=${userId}`,
    'API de Rebalanceamento Moderno'
  );

  if (rebalanceTest.success) {
    const rebalanceData = rebalanceTest.data.data;
    console.log('\n🔄 ANÁLISE DO REBALANCEAMENTO:');
    
    if (rebalanceData.portfolio_status === 'NEW') {
      console.log('✅ CORRETO: Rebalanceamento identificou portfolio como NOVO');
      console.log(`   • Mensagem: ${rebalanceData.message}`);
      console.log(`   • Orientações: ${rebalanceData.guidance?.length || 0} itens`);
      console.log(`   • Recomendações: ${rebalanceData.recommendations.length} (deve ser 0)`);
      
      if (rebalanceData.recommendations.length === 0) {
        console.log('✅ CORRETO: Nenhuma recomendação para portfolio simulado');
      } else {
        console.log('❌ PROBLEMA: Não deveria haver recomendações para portfolio simulado');
      }
    } else {
      console.log('❌ PROBLEMA: Rebalanceamento deveria identificar portfolio como NOVO');
    }
  }

  // 3. Testar APIs antigas para comparação
  console.log('\n📊 COMPARAÇÃO COM APIS ANTIGAS:');
  
  const oldAllocationsTest = await testAPI(
    `/api/portfolio/populate-allocations?portfolio_id=${portfolioId}&user_id=${userId}`,
    'API Antiga de Alocações'
  );

  const oldSuggestionsTest = await testAPI(
    `/api/portfolio/rebalance-suggestions?portfolio_id=${portfolioId}&user_id=${userId}`,
    'API Antiga de Sugestões'
  );

  const trackingTest = await testAPI(
    `/api/portfolio/tracking?portfolio_id=${portfolioId}&user_id=${userId}`,
    'API de Tracking'
  );

  if (trackingTest.success) {
    const trackingData = trackingTest.data.data;
    console.log(`\n📈 TRACKING DE COMPRAS: ${trackingData.length} compras encontradas`);
    if (trackingData.length === 0) {
      console.log('✅ CORRETO: Nenhuma compra real registrada');
    } else {
      console.log('❌ INESPERADO: Compras encontradas quando não deveria haver');
    }
  }

  // 4. Resumo final
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMO DOS TESTES:');
  console.log(`✅ API Real Data: ${realDataTest.success ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ API Rebalanceamento: ${rebalanceTest.success ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ API Alocações: ${oldAllocationsTest.success ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ API Sugestões: ${oldSuggestionsTest.success ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ API Tracking: ${trackingTest.success ? 'PASSOU' : 'FALHOU'}`);

  // 5. Validação da lógica
  console.log('\n🔍 VALIDAÇÃO DA LÓGICA:');
  if (realDataTest.success && rebalanceTest.success) {
    const realData = realDataTest.data.data;
    const rebalanceData = rebalanceTest.data.data;
    
    const logicCorrect = (
      realData.portfolio_status === 'NEW' &&
      !realData.has_real_purchases &&
      rebalanceData.portfolio_status === 'NEW' &&
      rebalanceData.recommendations.length === 0
    );
    
    if (logicCorrect) {
      console.log('✅ LÓGICA CORRETA: Sistema não mostra recomendações para portfolio simulado');
    } else {
      console.log('❌ LÓGICA INCORRETA: Sistema ainda tem problemas fundamentais');
    }
  }

  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Testar interface no navegador em http://localhost:3000/dashboard');
  console.log('2. Verificar se alertas de portfolio simulado aparecem');
  console.log('3. Testar adição de compra real');
  console.log('4. Verificar se recomendações aparecem após compra real');
}

// Executar teste
runCompleteTest().catch(console.error); 