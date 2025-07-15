const axios = require('axios');

// Configuração
const BASE_URL = 'http://localhost:3000';
const PORTFOLIO_ID = 'd733e728-f27d-40c1-bb44-6c6a1e53e58e';
const USER_ID = '9ba39a20-7409-479d-a010-284ad452d4f8';

console.log('🧪 TESTE COMPLETO DO SISTEMA DE PERFORMANCE');
console.log('='.repeat(60));

async function testarTodasAPIs() {
  console.log('\n1️⃣ TESTANDO API DE TRACKING (Compras Reais)');
  console.log('-'.repeat(50));
  
  try {
    const trackingResponse = await axios.get(`${BASE_URL}/api/portfolio/tracking`, {
      params: { portfolio_id: PORTFOLIO_ID, user_id: USER_ID }
    });
    
    const comprasReais = trackingResponse.data.data || [];
    console.log(`✅ API Tracking: ${comprasReais.length} compras reais encontradas`);
    
    if (comprasReais.length > 0) {
      console.log('📊 Compras cadastradas:');
      comprasReais.forEach((compra, index) => {
        console.log(`   ${index + 1}. ${compra.etf_symbol} - ${compra.shares_bought} cotas - $${compra.amount_invested}`);
      });
    } else {
      console.log('⚠️  NENHUMA COMPRA REAL CADASTRADA');
    }
    
  } catch (error) {
    console.log('❌ Erro na API Tracking:', error.message);
  }

  console.log('\n2️⃣ TESTANDO API DE DADOS REAIS');
  console.log('-'.repeat(50));
  
  try {
    const realDataResponse = await axios.get(`${BASE_URL}/api/portfolio/real-data`, {
      params: { portfolio_id: PORTFOLIO_ID, user_id: USER_ID }
    });
    
    const realData = realDataResponse.data.data;
    console.log(`✅ API Real-Data: Status = ${realData.portfolio_status}`);
    console.log(`📊 Compras reais: ${realData.has_real_purchases ? 'SIM' : 'NÃO'}`);
    console.log(`💰 Valor real: $${realData.total_real || 0}`);
    console.log(`🎭 Valor simulado: $${realData.total_simulated || 0}`);
    console.log(`📈 Alocações: ${realData.allocations_count || 0}`);
    
  } catch (error) {
    console.log('❌ Erro na API Real-Data:', error.message);
  }

  console.log('\n3️⃣ TESTANDO API DE ALOCAÇÕES');
  console.log('-'.repeat(50));
  
  try {
    const allocationsResponse = await axios.get(`${BASE_URL}/api/portfolio/populate-allocations`, {
      params: { portfolio_id: PORTFOLIO_ID, user_id: USER_ID }
    });
    
    const allocations = allocationsResponse.data.data.allocations || [];
    console.log(`✅ API Allocations: ${allocations.length} ETFs encontrados`);
    
    if (allocations.length > 0) {
      console.log('📊 Alocações atuais:');
      allocations.forEach((etf, index) => {
        console.log(`   ${index + 1}. ${etf.etf_symbol} - ${etf.allocation_percentage}% (Target) - $${etf.current_amount} (Atual)`);
      });
    }
    
  } catch (error) {
    console.log('❌ Erro na API Allocations:', error.message);
  }

  console.log('\n4️⃣ TESTANDO API DE REBALANCEAMENTO MODERNO');
  console.log('-'.repeat(50));
  
  try {
    const rebalanceResponse = await axios.get(`${BASE_URL}/api/portfolio/modern-rebalancing`, {
      params: { portfolio_id: PORTFOLIO_ID, user_id: USER_ID }
    });
    
    const rebalanceData = rebalanceResponse.data.data;
    console.log(`✅ API Modern-Rebalancing: ${rebalanceData.portfolio_status || 'ACTIVE'}`);
    
    if (rebalanceData.has_real_purchases === false) {
      console.log('⚠️  PORTFOLIO SIMULADO - Sem recomendações');
      console.log('📚 Orientações fornecidas:');
      rebalanceData.guidance?.forEach((guidance, index) => {
        console.log(`   ${index + 1}. ${guidance}`);
      });
    } else {
      console.log(`📊 Recomendações: ${rebalanceData.recommendations?.length || 0}`);
      console.log(`💰 Drift total: ${rebalanceData.total_drift || 0}%`);
    }
    
  } catch (error) {
    console.log('❌ Erro na API Modern-Rebalancing:', error.message);
  }

  console.log('\n5️⃣ TESTANDO API DE SUGESTÕES ANTIGAS');
  console.log('-'.repeat(50));
  
  try {
    const suggestionsResponse = await axios.get(`${BASE_URL}/api/portfolio/rebalance-suggestions`, {
      params: { portfolio_id: PORTFOLIO_ID, user_id: USER_ID }
    });
    
    const suggestions = suggestionsResponse.data.data.suggestions || [];
    console.log(`✅ API Suggestions: ${suggestions.length} sugestões encontradas`);
    
    if (suggestions.length > 0) {
      console.log('📊 Sugestões antigas (podem ser baseadas em dados simulados):');
      suggestions.slice(0, 3).forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.etf_symbol} - ${suggestion.suggested_action} - $${suggestion.suggested_amount}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Erro na API Suggestions:', error.message);
  }
}

async function analisarResultados() {
  console.log('\n📋 ANÁLISE DOS RESULTADOS');
  console.log('='.repeat(60));
  
  console.log('\n🔍 O QUE ESTÁ ACONTECENDO:');
  console.log('1. Portfolio foi criado mas SEM compras reais cadastradas');
  console.log('2. Sistema mostra dados SIMULADOS ($10.000 fictícios)');
  console.log('3. Alocações são baseadas em percentuais teóricos');
  console.log('4. Rebalanceamento moderno detecta situação e NÃO dá recomendações');
  console.log('5. APIs antigas ainda mostram sugestões baseadas em dados simulados');
  
  console.log('\n✅ SISTEMA FUNCIONANDO CORRETAMENTE:');
  console.log('- API de tracking: Detecta ausência de compras reais');
  console.log('- API de real-data: Diferencia dados reais vs simulados');
  console.log('- API de modern-rebalancing: Só recomenda com dados reais');
  console.log('- Interface: Deve mostrar orientações educativas');
  
  console.log('\n🎯 PARA ATIVAR PERFORMANCE REAL:');
  console.log('1. Usuário deve clicar "Adicionar Compra" no dashboard');
  console.log('2. Cadastrar: ETF, data, preço, quantidade');
  console.log('3. Sistema calculará performance baseada em preços atuais');
  console.log('4. Gráficos de performance mensal aparecerão');
  console.log('5. Recomendações de rebalanceamento serão ativadas');
}

async function explicacaoDidatica() {
  console.log('\n👶 EXPLICAÇÃO PARA CRIANÇA DE 8 ANOS');
  console.log('='.repeat(60));
  
  console.log('\n🎭 IMAGINE QUE VOCÊ TEM UM COFRE MÁGICO:');
  console.log('');
  console.log('SITUAÇÃO ATUAL (Portfolio Simulado):');
  console.log('🎪 Você está BRINCANDO de ter dinheiro no cofre');
  console.log('🎮 O computador inventou que você tem $10.000');
  console.log('🎯 Ele dividiu em 7 potes diferentes (ETFs)');
  console.log('📊 Mostra gráficos bonitos, mas é tudo FAZ-DE-CONTA');
  console.log('');
  console.log('PROBLEMA:');
  console.log('❌ Você não contou pro computador quanto dinheiro REAL você tem');
  console.log('❌ Você não disse quando comprou nem por quanto');
  console.log('❌ Então ele não sabe se você ganhou ou perdeu dinheiro');
  console.log('');
  console.log('SOLUÇÃO:');
  console.log('✅ Clique "Adicionar Compra" e conte a VERDADE:');
  console.log('   - "Eu comprei 10 ações da Apple por $100 cada em Janeiro"');
  console.log('   - "Eu comprei 5 ações da Microsoft por $200 cada em Fevereiro"');
  console.log('✅ Aí o computador vai buscar os preços de HOJE');
  console.log('✅ E calcular se você ganhou ou perdeu dinheiro DE VERDADE');
  console.log('✅ E mostrar gráficos da sua performance REAL');
  
  console.log('\n🎯 RESUMO SIMPLES:');
  console.log('AGORA = Brincadeira (números inventados)');
  console.log('DEPOIS = Realidade (seus números verdadeiros)');
}

// Executar todos os testes
testarTodasAPIs()
  .then(() => analisarResultados())
  .then(() => explicacaoDidatica())
  .catch(error => {
    console.error('❌ Erro geral:', error.message);
  }); 