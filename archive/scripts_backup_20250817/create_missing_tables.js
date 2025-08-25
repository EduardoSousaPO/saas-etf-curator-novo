#!/usr/bin/env node

/**
 * Script para verificar e criar tabelas faltantes no banco de dados
 * Usado para completar o sistema de tracking e rebalanceamento
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`❌ Erro ao verificar tabela ${tableName}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`❌ Erro ao verificar tabela ${tableName}:`, error);
    return false;
  }
}

async function executeSQL(sql, description) {
  try {
    console.log(`🔄 ${description}...`);
    
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: sql
    });
    
    if (error) {
      console.error(`❌ Erro: ${error.message}`);
      return false;
    }
    
    console.log(`✅ ${description} - Concluído`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar SQL: ${error.message}`);
    return false;
  }
}

async function createPortfolioTrackingTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS portfolio_tracking (
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

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_portfolio_id ON portfolio_tracking(portfolio_id);
    CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_user_id ON portfolio_tracking(user_id);
    CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_etf_symbol ON portfolio_tracking(etf_symbol);
    CREATE INDEX IF NOT EXISTS idx_portfolio_tracking_purchase_date ON portfolio_tracking(purchase_date);

    -- Trigger para atualizar updated_at
    CREATE OR REPLACE FUNCTION update_portfolio_tracking_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_portfolio_tracking_updated_at ON portfolio_tracking;
    CREATE TRIGGER trigger_update_portfolio_tracking_updated_at
      BEFORE UPDATE ON portfolio_tracking
      FOR EACH ROW
      EXECUTE FUNCTION update_portfolio_tracking_updated_at();
  `;

  return await executeSQL(sql, 'Criando tabela portfolio_tracking');
}

async function createRebalanceSuggestionsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS rebalance_suggestions (
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

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_portfolio_id ON rebalance_suggestions(portfolio_id);
    CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_user_id ON rebalance_suggestions(user_id);
    CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_status ON rebalance_suggestions(status);
    CREATE INDEX IF NOT EXISTS idx_rebalance_suggestions_priority ON rebalance_suggestions(priority);

    -- Trigger para atualizar updated_at
    CREATE OR REPLACE FUNCTION update_rebalance_suggestions_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_rebalance_suggestions_updated_at ON rebalance_suggestions;
    CREATE TRIGGER trigger_update_rebalance_suggestions_updated_at
      BEFORE UPDATE ON rebalance_suggestions
      FOR EACH ROW
      EXECUTE FUNCTION update_rebalance_suggestions_updated_at();
  `;

  return await executeSQL(sql, 'Criando tabela rebalance_suggestions');
}

async function createUserPortfolioAllocationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS user_portfolio_allocations (
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

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_user_portfolio_allocations_user_id ON user_portfolio_allocations(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_portfolio_allocations_is_active ON user_portfolio_allocations(is_active);
    CREATE INDEX IF NOT EXISTS idx_user_portfolio_allocations_objective ON user_portfolio_allocations(objective);

    -- Trigger para atualizar updated_at
    CREATE OR REPLACE FUNCTION update_user_portfolio_allocations_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_user_portfolio_allocations_updated_at ON user_portfolio_allocations;
    CREATE TRIGGER trigger_update_user_portfolio_allocations_updated_at
      BEFORE UPDATE ON user_portfolio_allocations
      FOR EACH ROW
      EXECUTE FUNCTION update_user_portfolio_allocations_updated_at();
  `;

  return await executeSQL(sql, 'Criando tabela user_portfolio_allocations');
}

async function createPortfolioAllocationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS portfolio_allocations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      portfolio_id UUID NOT NULL REFERENCES user_portfolio_allocations(id) ON DELETE CASCADE,
      etf_symbol VARCHAR(10) NOT NULL,
      allocation_percentage DECIMAL(5,2) NOT NULL,
      target_amount DECIMAL(12,2) NOT NULL,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_portfolio_id ON portfolio_allocations(portfolio_id);
    CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_user_id ON portfolio_allocations(user_id);
    CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_etf_symbol ON portfolio_allocations(etf_symbol);

    -- Constraint para garantir que a soma das alocações seja 100%
    CREATE OR REPLACE FUNCTION check_allocation_sum()
    RETURNS TRIGGER AS $$
    DECLARE
      total_allocation DECIMAL(5,2);
    BEGIN
      SELECT SUM(allocation_percentage) INTO total_allocation
      FROM portfolio_allocations
      WHERE portfolio_id = NEW.portfolio_id;
      
      IF total_allocation > 100.00 THEN
        RAISE EXCEPTION 'Total de alocações não pode exceder 100%';
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_check_allocation_sum ON portfolio_allocations;
    CREATE TRIGGER trigger_check_allocation_sum
      AFTER INSERT OR UPDATE ON portfolio_allocations
      FOR EACH ROW
      EXECUTE FUNCTION check_allocation_sum();

    -- Trigger para atualizar updated_at
    CREATE OR REPLACE FUNCTION update_portfolio_allocations_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_portfolio_allocations_updated_at ON portfolio_allocations;
    CREATE TRIGGER trigger_update_portfolio_allocations_updated_at
      BEFORE UPDATE ON portfolio_allocations
      FOR EACH ROW
      EXECUTE FUNCTION update_portfolio_allocations_updated_at();
  `;

  return await executeSQL(sql, 'Criando tabela portfolio_allocations');
}

async function main() {
  console.log('🚀 Iniciando verificação e criação de tabelas...\n');

  const tables = [
    { name: 'user_portfolio_allocations', createFunction: createUserPortfolioAllocationsTable },
    { name: 'portfolio_allocations', createFunction: createPortfolioAllocationsTable },
    { name: 'portfolio_tracking', createFunction: createPortfolioTrackingTable },
    { name: 'rebalance_suggestions', createFunction: createRebalanceSuggestionsTable }
  ];

  for (const table of tables) {
    console.log(`📋 Verificando tabela ${table.name}...`);
    
    const exists = await checkTableExists(table.name);
    
    if (exists) {
      console.log(`✅ Tabela ${table.name} já existe\n`);
    } else {
      console.log(`❌ Tabela ${table.name} não encontrada, criando...`);
      const success = await table.createFunction();
      
      if (success) {
        console.log(`✅ Tabela ${table.name} criada com sucesso\n`);
      } else {
        console.log(`❌ Falha ao criar tabela ${table.name}\n`);
      }
    }
  }

  console.log('🎉 Verificação concluída!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 