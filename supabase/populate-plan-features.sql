-- Script para popular as features dos planos de assinatura
-- Executar após criar as tabelas

-- Limpar dados existentes
DELETE FROM plan_features;

-- PLANO STARTER (Gratuito)
INSERT INTO plan_features (plan, feature_key, feature_name, feature_description, is_enabled, limit_value) VALUES
-- Dashboard
('STARTER', 'dashboard_widgets', 'Widgets do Dashboard', 'Acesso limitado a 3 widgets básicos', true, 3),
('STARTER', 'dashboard_basic', 'Dashboard Básico', 'Versão simplificada do dashboard', true, null),

-- Screener
('STARTER', 'screener_basic', 'Screener Básico', 'Acesso limitado a 2 filtros', true, 2),
('STARTER', 'screener_queries_daily', 'Consultas Diárias Screener', 'Máximo 20 consultas por dia', true, 20),

-- Rankings
('STARTER', 'rankings_top5', 'Rankings Top 5', 'Visualização apenas dos top 5 ETFs por categoria', true, 5),
('STARTER', 'rankings_basic', 'Rankings Básicos', 'Acesso aos rankings principais', true, null),

-- Comparador
('STARTER', 'comparator_etfs', 'Comparador de ETFs', 'Comparação de até 2 ETFs simultaneamente', true, 2),

-- Simulador
('STARTER', 'simulator_basic', 'Simulador Básico', 'Simulações básicas sem cenários avançados', true, null),
('STARTER', 'simulator_scenarios', 'Cenários de Simulação', 'Sem acesso a análise de cenários', false, 0),

-- Dados históricos
('STARTER', 'historical_data_months', 'Dados Históricos', 'Acesso limitado a 12 meses de dados', true, 12),

-- Exportação
('STARTER', 'export_reports', 'Exportação de Relatórios', 'Sem acesso a exportação', false, 0),

-- Suporte
('STARTER', 'support_basic', 'Suporte Básico', 'Suporte via FAQ e documentação', true, null);

-- PLANO PRO (R$ 29,90/mês)
INSERT INTO plan_features (plan, feature_key, feature_name, feature_description, is_enabled, limit_value) VALUES
-- Dashboard
('PRO', 'dashboard_widgets', 'Widgets do Dashboard', 'Acesso completo a todos os widgets', true, null),
('PRO', 'dashboard_complete', 'Dashboard Completo', 'Acesso total ao dashboard personalizado', true, null),
('PRO', 'dashboard_currency_conversion', 'Conversão de Moeda', 'Conversão BRL/USD em tempo real', true, null),

-- Screener
('PRO', 'screener_advanced', 'Screener Avançado', 'Acesso a todos os 6 filtros', true, 6),
('PRO', 'screener_queries_daily', 'Consultas Diárias Screener', 'Consultas ilimitadas', true, null),
('PRO', 'screener_all_etfs', 'Base Completa de ETFs', 'Acesso aos 4.409 ETFs validados', true, 4409),

-- Rankings
('PRO', 'rankings_top10', 'Rankings Top 10', 'Visualização completa dos top 10 por categoria', true, 10),
('PRO', 'rankings_all_categories', 'Todas as Categorias', 'Acesso às 6 categorias de rankings', true, 6),
('PRO', 'rankings_real_time', 'Rankings em Tempo Real', 'Atualizações automáticas', true, null),

-- Comparador
('PRO', 'comparator_etfs', 'Comparador de ETFs', 'Comparação de até 4 ETFs simultaneamente', true, 4),
('PRO', 'comparator_advanced_metrics', 'Métricas Avançadas', 'Análise detalhada de performance', true, null),

-- Simulador
('PRO', 'simulator_complete', 'Simulador Completo', 'Acesso total ao simulador de carteiras', true, null),
('PRO', 'simulator_scenarios', 'Análise de Cenários', 'Simulações em diferentes cenários de mercado', true, null),
('PRO', 'simulator_optimization', 'Otimização de Carteira', 'Algoritmos de otimização automática', true, null),

-- Dados históricos
('PRO', 'historical_data_complete', 'Dados Históricos Completos', 'Acesso ilimitado ao histórico', true, null),
('PRO', 'historical_analysis', 'Análise Histórica Avançada', 'Ferramentas de análise técnica', true, null),

-- Exportação
('PRO', 'export_reports', 'Exportação de Relatórios', 'Exportação ilimitada em PDF/Excel', true, null),
('PRO', 'export_data', 'Exportação de Dados', 'Download de dados em CSV', true, null),

-- Suporte
('PRO', 'support_priority', 'Suporte Prioritário', 'Suporte via email com prioridade', true, null),
('PRO', 'support_tutorials', 'Tutoriais Avançados', 'Conteúdo educacional exclusivo', true, null);

-- PLANO WEALTH (1% a.a. do patrimônio)
INSERT INTO plan_features (plan, feature_key, feature_name, feature_description, is_enabled, limit_value) VALUES
-- Todas as features do PRO
('WEALTH', 'dashboard_complete', 'Dashboard Completo', 'Acesso total ao dashboard personalizado', true, null),
('WEALTH', 'screener_advanced', 'Screener Avançado', 'Acesso a todos os filtros', true, null),
('WEALTH', 'rankings_complete', 'Rankings Completos', 'Acesso total aos rankings', true, null),
('WEALTH', 'comparator_advanced', 'Comparador Avançado', 'Comparação ilimitada de ETFs', true, null),
('WEALTH', 'simulator_complete', 'Simulador Completo', 'Acesso total ao simulador', true, null),
('WEALTH', 'historical_data_complete', 'Dados Históricos Completos', 'Acesso ilimitado ao histórico', true, null),
('WEALTH', 'export_unlimited', 'Exportação Ilimitada', 'Exportação sem limites', true, null),

-- Features exclusivas Wealth
('WEALTH', 'consultant_dedicated', 'Consultor CVM Dedicado', 'Consultor especializado exclusivo', true, null),
('WEALTH', 'meetings_monthly', 'Reuniões Mensais', 'Reuniões de acompanhamento mensais', true, 12),
('WEALTH', 'whatsapp_priority', 'WhatsApp Prioritário', 'Atendimento direto via WhatsApp', true, null),
('WEALTH', 'reports_custom', 'Relatórios Customizados', 'Relatórios personalizados mensais', true, null),
('WEALTH', 'rebalancing_quarterly', 'Rebalanceamento Trimestral', 'Rebalanceamento ativo da carteira', true, 4),
('WEALTH', 'brokers_premium', 'Corretoras Premium', 'Acesso a Avenue, XP Internacional, BTG', true, null),
('WEALTH', 'tax_optimization', 'Otimização Tributária', 'Estratégias de otimização fiscal', true, null),
('WEALTH', 'portfolio_management', 'Gestão Ativa', 'Acompanhamento ativo do patrimônio', true, null),
('WEALTH', 'diagnosis_free', 'Diagnóstico Gratuito', 'Análise inicial sem custo', true, null),
('WEALTH', 'minimum_assets', 'Patrimônio Mínimo', 'Mínimo de R$ 200.000', true, 200000);

-- PLANO OFFSHORE (0,80% a.a. do patrimônio)
INSERT INTO plan_features (plan, feature_key, feature_name, feature_description, is_enabled, limit_value) VALUES
-- Todas as features do Wealth
('OFFSHORE', 'wealth_all_features', 'Todas Features Wealth', 'Inclui todos os benefícios do plano Wealth', true, null),

-- Features exclusivas Offshore
('OFFSHORE', 'offshore_structuring', 'Estruturação Offshore', 'Planejamento de estruturas internacionais', true, null),
('OFFSHORE', 'partner_network', 'Rede de Parceiros', 'Advogados, contadores e bancos internacionais', true, null),
('OFFSHORE', 'tax_compliance', 'Compliance Fiscal', 'Apoio em IR e revisões BACEN', true, null),
('OFFSHORE', 'tax_optimization_international', 'Elisão Fiscal Internacional', 'Estratégias de otimização tributária global', true, null),
('OFFSHORE', 'remittance_optimization', 'Otimização de Remessas', 'Estratégias para remessas internacionais', true, null),
('OFFSHORE', 'holding_structures', 'Holdings Internacionais', 'Estruturação de holdings offshore', true, null),
('OFFSHORE', 'due_diligence', 'Due Diligence Completa', 'Análise completa de compliance', true, null),
('OFFSHORE', 'regulatory_support', 'Suporte Regulatório', 'Acompanhamento de mudanças regulatórias', true, null),
('OFFSHORE', 'international_banking', 'Banking Internacional', 'Suporte para abertura de contas no exterior', true, null),
('OFFSHORE', 'minimum_assets', 'Patrimônio Mínimo', 'Mínimo de R$ 1.000.000', true, 1000000),
('OFFSHORE', 'meetings_specialized', 'Reuniões Especializadas', 'Reuniões com especialistas internacionais', true, null);

-- Inserir timestamp de criação
UPDATE plan_features SET created_at = NOW(), updated_at = NOW(); 