// Script para criar as tabelas do Stocks Wealth AI no Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createStocksWealthTables() {
  console.log('🚀 Iniciando criação das tabelas do Stocks Wealth AI...');

  const tables = [
    {
      name: 'stock_portfolio_plans',
      sql: `
        CREATE TABLE IF NOT EXISTS stock_portfolio_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          name VARCHAR(120) NOT NULL,
          objective VARCHAR(50) NOT NULL,
          risk_profile VARCHAR(20) NOT NULL,
          base_currency VARCHAR(3) DEFAULT 'USD',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_plans_user ON stock_portfolio_plans(user_id);
      `
    },
    {
      name: 'stock_portfolio_versions',
      sql: `
        CREATE TABLE IF NOT EXISTS stock_portfolio_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES stock_portfolio_plans(id) ON DELETE CASCADE,
          version_number INT NOT NULL DEFAULT 1,
          is_active BOOLEAN DEFAULT TRUE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_versions_plan ON stock_portfolio_versions(plan_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_portfolio_versions_unique ON stock_portfolio_versions(plan_id, version_number);
      `
    },
    {
      name: 'stock_portfolio_allocations',
      sql: `
        CREATE TABLE IF NOT EXISTS stock_portfolio_allocations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          version_id UUID NOT NULL REFERENCES stock_portfolio_versions(id) ON DELETE CASCADE,
          stock_symbol VARCHAR(10) NOT NULL,
          allocation_percentage DECIMAL(5,2) NOT NULL,
          target_amount DECIMAL(15,2),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_allocations_version ON stock_portfolio_allocations(version_id);
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_allocations_symbol ON stock_portfolio_allocations(stock_symbol);
      `
    },
    {
      name: 'stock_trades',
      sql: `
        CREATE TABLE IF NOT EXISTS stock_trades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES stock_portfolio_plans(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          stock_symbol VARCHAR(10) NOT NULL,
          trade_type VARCHAR(4) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
          quantity DECIMAL(15,6) NOT NULL,
          price DECIMAL(12,4) NOT NULL,
          total_amount DECIMAL(15,2) NOT NULL,
          trade_date DATE NOT NULL,
          broker VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_trades_plan ON stock_trades(plan_id);
        CREATE INDEX IF NOT EXISTS idx_stock_trades_user ON stock_trades(user_id);
        CREATE INDEX IF NOT EXISTS idx_stock_trades_symbol ON stock_trades(stock_symbol);
        CREATE INDEX IF NOT EXISTS idx_stock_trades_date ON stock_trades(trade_date);
      `
    },
    {
      name: 'stock_timeline_events',
      sql: `
        CREATE TABLE IF NOT EXISTS stock_timeline_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES stock_portfolio_plans(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          event_type VARCHAR(20) NOT NULL,
          event_date TIMESTAMPTZ DEFAULT NOW(),
          stock_symbol VARCHAR(10),
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_plan ON stock_timeline_events(plan_id);
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_user ON stock_timeline_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_type ON stock_timeline_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_date ON stock_timeline_events(event_date);
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📝 Criando tabela: ${table.name}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: table.sql 
      });

      if (error) {
        console.error(`❌ Erro ao criar ${table.name}:`, error);
        // Tentar método alternativo
        console.log(`🔄 Tentando método alternativo para ${table.name}...`);
        
        // Executar cada comando SQL separadamente
        const commands = table.sql.split(';').filter(cmd => cmd.trim());
        
        for (const command of commands) {
          if (command.trim()) {
            const { error: cmdError } = await supabase.rpc('exec_sql', { 
              sql: command.trim() + ';' 
            });
            
            if (cmdError) {
              console.error(`❌ Erro no comando SQL:`, cmdError);
              console.log(`SQL: ${command.trim()}`);
            }
          }
        }
      } else {
        console.log(`✅ Tabela ${table.name} criada com sucesso!`);
      }
    } catch (err) {
      console.error(`💥 Erro inesperado ao criar ${table.name}:`, err);
    }
  }

  console.log('🎉 Processo de criação das tabelas concluído!');
}

// Executar o script
createStocksWealthTables().catch(console.error);



