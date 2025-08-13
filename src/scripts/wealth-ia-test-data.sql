-- Script para criar dados fictícios para teste do Dashboard
-- Execute no SQL Editor do Supabase

-- 1. Criar um usuário de teste (assumindo que já existe um usuário)
-- Substitua 'USER_ID_AQUI' pelo ID real de um usuário de teste

-- 2. Criar plano de carteira de teste
INSERT INTO portfolio_plans (id, user_id, name, objective, risk_profile, base_currency) 
VALUES (
  'test-plan-001',
  'USER_ID_AQUI', -- Substituir pelo user_id real
  'Carteira Crescimento Moderado',
  'growth',
  'moderate',
  'USD'
);

-- 3. Criar versão do plano
INSERT INTO portfolio_plan_versions (id, plan_id, version, notes) 
VALUES (
  'test-version-001',
  'test-plan-001',
  1,
  'Versão inicial criada pelo Portfolio Master com foco em crescimento de longo prazo'
);

-- 4. Criar alocações alvo
INSERT INTO portfolio_target_allocations (plan_version_id, etf_symbol, allocation_percentage, band_lower, band_upper) 
VALUES 
  ('test-version-001', 'SPY', 40.0, 5.0, 5.0),
  ('test-version-001', 'QQQ', 25.0, 5.0, 5.0),
  ('test-version-001', 'VTI', 20.0, 5.0, 5.0),
  ('test-version-001', 'VXUS', 10.0, 5.0, 5.0),
  ('test-version-001', 'BND', 5.0, 5.0, 5.0);

-- 5. Criar carteira do usuário
INSERT INTO user_portfolio_allocations (id, user_id, portfolio_name, etf_symbols, target_allocations, current_allocations, invested_amounts, total_invested, is_active) 
VALUES (
  'test-portfolio-001',
  'USER_ID_AQUI', -- Substituir pelo user_id real
  'Carteira Crescimento Moderado',
  '["SPY", "QQQ", "VTI", "VXUS", "BND"]'::jsonb,
  '{"SPY": 40, "QQQ": 25, "VTI": 20, "VXUS": 10, "BND": 5}'::jsonb,
  '{"SPY": 42, "QQQ": 23, "VTI": 22, "VXUS": 8, "BND": 5}'::jsonb,
  '{"SPY": 21000, "QQQ": 11500, "VTI": 11000, "VXUS": 4000, "BND": 2500}'::jsonb,
  50000,
  true
);

-- 6. Criar trades de exemplo
INSERT INTO trades (user_id, portfolio_id, etf_symbol, side, trade_date, quantity, price, currency, source) 
VALUES 
  -- Compras iniciais
  ('USER_ID_AQUI', 'test-portfolio-001', 'SPY', 'BUY', '2024-01-15', 50, 420.00, 'USD', 'manual'),
  ('USER_ID_AQUI', 'test-portfolio-001', 'QQQ', 'BUY', '2024-01-16', 30, 383.33, 'USD', 'manual'),
  ('USER_ID_AQUI', 'test-portfolio-001', 'VTI', 'BUY', '2024-01-17', 45, 244.44, 'USD', 'manual'),
  ('USER_ID_AQUI', 'test-portfolio-001', 'VXUS', 'BUY', '2024-01-18', 80, 50.00, 'USD', 'manual'),
  ('USER_ID_AQUI', 'test-portfolio-001', 'BND', 'BUY', '2024-01-19', 31, 80.65, 'USD', 'manual'),
  
  -- Aportes mensais
  ('USER_ID_AQUI', 'test-portfolio-001', 'SPY', 'BUY', '2024-02-15', 5, 425.00, 'USD', 'monthly_contribution'),
  ('USER_ID_AQUI', 'test-portfolio-001', 'QQQ', 'BUY', '2024-02-16', 3, 385.00, 'USD', 'monthly_contribution'),
  ('USER_ID_AQUI', 'test-portfolio-001', 'VTI', 'BUY', '2024-02-17', 4, 246.00, 'USD', 'monthly_contribution'),
  
  -- Rebalanceamento
  ('USER_ID_AQUI', 'test-portfolio-001', 'QQQ', 'SELL', '2024-03-01', 2, 390.00, 'USD', 'rebalancing'),
  ('USER_ID_AQUI', 'test-portfolio-001', 'VXUS', 'BUY', '2024-03-01', 15, 52.00, 'USD', 'rebalancing');

-- 7. Criar cashflows correspondentes
INSERT INTO cashflows (user_id, portfolio_id, flow_date, amount, currency, flow_type, metadata) 
VALUES 
  -- Aporte inicial
  ('USER_ID_AQUI', 'test-portfolio-001', '2024-01-14', -50000, 'USD', 'CONTRIBUTION', '{"type": "initial_investment"}'::jsonb),
  
  -- Aportes mensais
  ('USER_ID_AQUI', 'test-portfolio-001', '2024-02-14', -3000, 'USD', 'CONTRIBUTION', '{"type": "monthly_contribution"}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', '2024-03-14', -3000, 'USD', 'CONTRIBUTION', '{"type": "monthly_contribution"}'::jsonb),
  
  -- Dividendos recebidos
  ('USER_ID_AQUI', 'test-portfolio-001', '2024-03-20', 125.50, 'USD', 'DIVIDEND', '{"etf_symbol": "SPY", "dividend_per_share": 1.51}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', '2024-03-21', 45.30, 'USD', 'DIVIDEND', '{"etf_symbol": "VTI", "dividend_per_share": 0.92}'::jsonb);

-- 8. Criar aportes programados
INSERT INTO planned_contributions (user_id, portfolio_id, amount, currency, scheduled_date, status, recommendation) 
VALUES 
  ('USER_ID_AQUI', 'test-portfolio-001', 3000, 'USD', '2024-04-15', 'PLANNED', '{"distribution": {"SPY": 1200, "QQQ": 750, "VTI": 600, "VXUS": 300, "BND": 150}}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', 5000, 'USD', '2024-05-15', 'PLANNED', '{"distribution": {"SPY": 2000, "QQQ": 1250, "VTI": 1000, "VXUS": 500, "BND": 250}}'::jsonb);

-- 9. Criar eventos da timeline
INSERT INTO timeline_events (user_id, portfolio_id, event_type, payload) 
VALUES 
  ('USER_ID_AQUI', 'test-portfolio-001', 'PLAN_CREATED', '{"plan_name": "Carteira Crescimento Moderado", "etf_count": 5}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', 'IMPLEMENTATION_STARTED', '{"initial_amount": 50000, "currency": "USD"}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', 'BULK_TRADES_IMPORTED', '{"total_trades": 5, "source": "initial_setup"}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', 'CONTRIBUTION_ADDED', '{"amount": 3000, "currency": "USD"}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', 'REBALANCING_EXECUTED', '{"trades_count": 2, "reason": "band_deviation"}'::jsonb),
  ('USER_ID_AQUI', 'test-portfolio-001', 'DIVIDEND_RECEIVED', '{"total_amount": 170.80, "etfs": ["SPY", "VTI"]}'::jsonb);

-- 10. Criar run de implementação
INSERT INTO portfolio_implementation_runs (plan_id, plan_version_id, user_id, status, priority_json) 
VALUES (
  'test-plan-001',
  'test-version-001',
  'USER_ID_AQUI',
  'COMPLETED',
  '[
    {"etf_symbol": "SPY", "target_percentage": 40, "priority": 95, "reason": "Core holding - alta alocação"},
    {"etf_symbol": "QQQ", "target_percentage": 25, "priority": 85, "reason": "Growth exposure"},
    {"etf_symbol": "VTI", "target_percentage": 20, "priority": 75, "reason": "Broad market diversification"},
    {"etf_symbol": "VXUS", "target_percentage": 10, "priority": 65, "reason": "International exposure"},
    {"etf_symbol": "BND", "target_percentage": 5, "priority": 55, "reason": "Fixed income stability"}
  ]'::jsonb
);

-- Instruções para uso:
-- 1. Substitua 'USER_ID_AQUI' pelo ID real de um usuário de teste
-- 2. Execute este script no SQL Editor do Supabase
-- 3. Acesse /wealth-dashboard para ver os dados de teste
-- 4. Teste as funcionalidades de aportes, trades e dashboard

-- Para limpar os dados de teste depois:
-- DELETE FROM timeline_events WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM planned_contributions WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM cashflows WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM trades WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM portfolio_implementation_runs WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM portfolio_target_allocations WHERE plan_version_id = 'test-version-001';
-- DELETE FROM portfolio_plan_versions WHERE plan_id = 'test-plan-001';
-- DELETE FROM portfolio_plans WHERE id = 'test-plan-001';
-- DELETE FROM user_portfolio_allocations WHERE id = 'test-portfolio-001';


