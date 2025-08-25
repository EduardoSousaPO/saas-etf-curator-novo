// Script para criar tabelas usando Supabase client diretamente
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Usar a service role key fornecida pelo usuário
const SUPABASE_URL = 'https://nniabnjuwzeqmflrruga.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc4MjY0NSwiZXhwIjoyMDYzMzU4NjQ1fQ.SR2r99mB2ayXkbrr7USbunDD_WnxwHT6V-ow0p29x0E';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createStocksTables() {
  console.log('🚀 Iniciando criação das tabelas do Stocks Wealth AI...');

  const tables = [
    {
      name: 'stock_portfolio_plans',
      sql: `
        CREATE TABLE IF NOT EXISTS public.stock_portfolio_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          name VARCHAR(120) NOT NULL,
          objective VARCHAR(50) NOT NULL,
          risk_profile VARCHAR(20) NOT NULL,
          base_currency VARCHAR(3) DEFAULT 'USD',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_plans_user ON public.stock_portfolio_plans(user_id);
      `
    },
    {
      name: 'stock_portfolio_versions',
      sql: `
        CREATE TABLE IF NOT EXISTS public.stock_portfolio_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES public.stock_portfolio_plans(id) ON DELETE CASCADE,
          version_number INT NOT NULL DEFAULT 1,
          is_active BOOLEAN DEFAULT TRUE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_versions_plan ON public.stock_portfolio_versions(plan_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_portfolio_versions_unique ON public.stock_portfolio_versions(plan_id, version_number);
      `
    },
    {
      name: 'stock_portfolio_allocations',
      sql: `
        CREATE TABLE IF NOT EXISTS public.stock_portfolio_allocations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          version_id UUID NOT NULL REFERENCES public.stock_portfolio_versions(id) ON DELETE CASCADE,
          stock_symbol VARCHAR(10) NOT NULL,
          allocation_percentage DECIMAL(5,2) NOT NULL,
          target_amount DECIMAL(15,2),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_allocations_version ON public.stock_portfolio_allocations(version_id);
        CREATE INDEX IF NOT EXISTS idx_stock_portfolio_allocations_symbol ON public.stock_portfolio_allocations(stock_symbol);
      `
    },
    {
      name: 'stock_trades',
      sql: `
        CREATE TABLE IF NOT EXISTS public.stock_trades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES public.stock_portfolio_plans(id) ON DELETE CASCADE,
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
        CREATE INDEX IF NOT EXISTS idx_stock_trades_plan ON public.stock_trades(plan_id);
        CREATE INDEX IF NOT EXISTS idx_stock_trades_user ON public.stock_trades(user_id);
        CREATE INDEX IF NOT EXISTS idx_stock_trades_symbol ON public.stock_trades(stock_symbol);
        CREATE INDEX IF NOT EXISTS idx_stock_trades_date ON public.stock_trades(trade_date);
      `
    },
    {
      name: 'stock_timeline_events',
      sql: `
        CREATE TABLE IF NOT EXISTS public.stock_timeline_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES public.stock_portfolio_plans(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          event_type VARCHAR(20) NOT NULL,
          event_date TIMESTAMPTZ DEFAULT NOW(),
          stock_symbol VARCHAR(10),
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_plan ON public.stock_timeline_events(plan_id);
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_user ON public.stock_timeline_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_type ON public.stock_timeline_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_stock_timeline_events_date ON public.stock_timeline_events(event_date);
      `
    }
  ];

  // Primeiro, verificar se conseguimos conectar
  try {
    console.log('🔍 Testando conectividade com Supabase...');
    const { data, error } = await supabase
      .from('stocks_unified')
      .select('ticker')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro de conectividade:', error);
      return;
    }
    
    console.log('✅ Conectividade OK!');
  } catch (err) {
    console.error('💥 Erro de conexão:', err);
    return;
  }

  // Tentar executar as queries usando rpc
  for (const table of tables) {
    try {
      console.log(`📝 Criando tabela: ${table.name}...`);
      
      // Dividir em comandos individuais
      const commands = table.sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);
      
      for (const command of commands) {
        console.log(`  ⚡ Executando: ${command.substring(0, 50)}...`);
        
        // Tentar usar rpc para executar SQL raw
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command 
        });

        if (error) {
          console.log(`  ⚠️  Erro com rpc, tentando método alternativo...`);
          
          // Se rpc não funcionar, tentar usando uma query direta
          // Isso pode não funcionar para CREATE TABLE, mas vamos tentar
          const { data: altData, error: altError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1);
            
          if (altError) {
            console.error(`  ❌ Erro alternativo:`, altError);
          } else {
            console.log(`  ℹ️  Método alternativo conectou, mas CREATE TABLE precisa ser manual`);
          }
        } else {
          console.log(`  ✅ Comando executado com sucesso!`);
        }
      }
      
    } catch (err) {
      console.error(`💥 Erro inesperado ao criar ${table.name}:`, err.message);
    }
  }

  console.log('🎉 Script concluído! Verifique o resultado acima.');
  
  // Tentar listar tabelas para verificar
  try {
    console.log('🔍 Verificando tabelas criadas...');
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'stock_%');
    
    if (!error && data) {
      console.log('📋 Tabelas encontradas:', data.map(t => t.table_name));
    } else {
      console.log('ℹ️  Não foi possível verificar tabelas via query');
    }
  } catch (err) {
    console.log('ℹ️  Verificação de tabelas não disponível');
  }
}

// Executar o script
createStocksTables().catch(console.error);
