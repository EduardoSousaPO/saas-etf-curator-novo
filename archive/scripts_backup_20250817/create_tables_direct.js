#!/usr/bin/env node

/**
 * Script para criar tabelas diretamente no banco de dados
 * Usando queries SQL diretas através do cliente Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTables() {
  console.log('🚀 Criando tabelas do sistema de tracking e rebalanceamento...\n');

  // 1. Criar tabela user_portfolio_allocations
  console.log('📋 Criando tabela user_portfolio_allocations...');
  const { data: data1, error: error1 } = await supabase
    .from('user_portfolio_allocations')
    .select('id')
    .limit(1);

  if (error1 && error1.code === '42P01') {
    console.log('❌ Tabela user_portfolio_allocations não existe, precisa ser criada manualmente');
    console.log('Execute este SQL no painel do Supabase:');
    console.log(`
CREATE TABLE user_portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_name VARCHAR(100) NOT NULL,
  objective VARCHAR(50) NOT NULL,
  risk_profile VARCHAR(20) NOT NULL,
  initial_amount DECIMAL(12,2) NOT NULL,
  monthly_contribution DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  time_horizon INTEGER NOT NULL DEFAULT 5,
  rebalance_threshold DECIMAL(5,2) DEFAULT 5.0,
  auto_rebalance BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_portfolio_allocations_user_id ON user_portfolio_allocations(user_id);
CREATE INDEX idx_user_portfolio_allocations_is_active ON user_portfolio_allocations(is_active);
    `);
  } else {
    console.log('✅ Tabela user_portfolio_allocations já existe');
  }

  // 2. Criar tabela portfolio_allocations
  console.log('\n📋 Criando tabela portfolio_allocations...');
  const { data: data2, error: error2 } = await supabase
    .from('portfolio_allocations')
    .select('id')
    .limit(1);

  if (error2 && error2.code === '42P01') {
    console.log('❌ Tabela portfolio_allocations não existe, precisa ser criada manualmente');
    console.log('Execute este SQL no painel do Supabase:');
    console.log(`
CREATE TABLE portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
  etf_symbol VARCHAR(10) NOT NULL,
  allocation_percentage DECIMAL(5,2) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolio_allocations_portfolio_id ON portfolio_allocations(portfolio_id);
CREATE INDEX idx_portfolio_allocations_user_id ON portfolio_allocations(user_id);
    `);
  } else {
    console.log('✅ Tabela portfolio_allocations já existe');
  }

  // 3. Criar tabela portfolio_tracking
  console.log('\n📋 Criando tabela portfolio_tracking...');
  const { data: data3, error: error3 } = await supabase
    .from('portfolio_tracking')
    .select('id')
    .limit(1);

  if (error3 && error3.code === '42P01') {
    console.log('❌ Tabela portfolio_tracking não existe, precisa ser criada manualmente');
    console.log('Execute este SQL no painel do Supabase:');
    console.log(`
CREATE TABLE portfolio_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
  etf_symbol VARCHAR(10) NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(10,4) NOT NULL,
  shares_bought DECIMAL(12,6) NOT NULL,
  amount_invested DECIMAL(12,2) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolio_tracking_portfolio_id ON portfolio_tracking(portfolio_id);
CREATE INDEX idx_portfolio_tracking_user_id ON portfolio_tracking(user_id);
CREATE INDEX idx_portfolio_tracking_etf_symbol ON portfolio_tracking(etf_symbol);
    `);
  } else {
    console.log('✅ Tabela portfolio_tracking já existe');
  }

  // 4. Criar tabela rebalance_suggestions
  console.log('\n📋 Criando tabela rebalance_suggestions...');
  const { data: data4, error: error4 } = await supabase
    .from('rebalance_suggestions')
    .select('id')
    .limit(1);

  if (error4 && error4.code === '42P01') {
    console.log('❌ Tabela rebalance_suggestions não existe, precisa ser criada manualmente');
    console.log('Execute este SQL no painel do Supabase:');
    console.log(`
CREATE TABLE rebalance_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
  etf_symbol VARCHAR(10) NOT NULL,
  current_allocation DECIMAL(5,2) NOT NULL,
  target_allocation DECIMAL(5,2) NOT NULL,
  deviation DECIMAL(5,2) NOT NULL,
  suggested_action VARCHAR(10) NOT NULL CHECK (suggested_action IN ('BUY', 'SELL', 'HOLD')),
  suggested_amount DECIMAL(12,2),
  suggested_shares DECIMAL(12,6),
  priority INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rebalance_suggestions_portfolio_id ON rebalance_suggestions(portfolio_id);
CREATE INDEX idx_rebalance_suggestions_user_id ON rebalance_suggestions(user_id);
CREATE INDEX idx_rebalance_suggestions_status ON rebalance_suggestions(status);
    `);
  } else {
    console.log('✅ Tabela rebalance_suggestions já existe');
  }

  console.log('\n🎉 Verificação concluída!');
  console.log('\n📝 INSTRUÇÕES:');
  console.log('1. Se alguma tabela não existir, copie o SQL correspondente');
  console.log('2. Acesse o painel do Supabase: https://supabase.com/dashboard');
  console.log('3. Vá para SQL Editor e execute os comandos');
  console.log('4. Execute este script novamente para verificar');
}

createTables().catch(console.error); 