# Documentação do Banco de Dados - ETF Curator

## 📊 Visão Geral

O banco de dados do **ETF Curator** é uma aplicação SaaS focada em análise e curadoria de ETFs (Exchange-Traded Funds), construída sobre o **Supabase** (PostgreSQL). O sistema oferece diferentes planos de assinatura com funcionalidades específicas para análise de investimentos, desde usuários iniciantes até gestores de patrimônio de alto valor.

### Estatísticas Gerais
- **Total de ETFs catalogados**: 4.409
- **Usuários registrados**: 2
- **Planos ativos**: STARTER, PRO, WEALTH, OFFSHORE
- **Maiores ETFs por patrimônio**: VTI ($1.8T), VOO ($1.4T), SPY ($603B)

---

## 🏗️ Arquitetura do Banco

### Schemas Principais
- **`auth`**: Gerenciamento de autenticação e usuários (Supabase Auth)
- **`public`**: Dados da aplicação (ETFs, métricas, assinaturas, perfis)

---

## 📋 Tabelas Detalhadas

## 🔐 Schema `auth` - Sistema de Autenticação

### `auth.users`
**Propósito**: Tabela principal de usuários do sistema de autenticação Supabase.

**Colunas Principais**:
- `id` (UUID, PK): Identificador único do usuário
- `email` (VARCHAR): Email do usuário
- `encrypted_password` (VARCHAR): Senha criptografada
- `email_confirmed_at` (TIMESTAMPTZ): Data de confirmação do email
- `created_at` (TIMESTAMPTZ): Data de criação da conta
- `raw_user_meta_data` (JSONB): Metadados personalizados do usuário
- `is_super_admin` (BOOLEAN): Flag de super administrador
- `phone` (TEXT): Número de telefone (opcional)
- `last_sign_in_at` (TIMESTAMPTZ): Último login

**Relacionamentos**: Conecta com todas as tabelas de perfil e assinatura na aplicação.

### `auth.sessions`
**Propósito**: Gerencia sessões ativas dos usuários.

**Colunas Principais**:
- `id` (UUID, PK): ID da sessão
- `user_id` (UUID, FK): Referência ao usuário
- `created_at` (TIMESTAMPTZ): Criação da sessão
- `updated_at` (TIMESTAMPTZ): Última atualização
- `ip` (INET): Endereço IP da sessão
- `user_agent` (TEXT): Navegador/dispositivo

### `auth.refresh_tokens`
**Propósito**: Armazena tokens para renovação de autenticação JWT.

### Outras Tabelas Auth
- `auth.identities`: Identidades associadas (OAuth, etc.)
- `auth.audit_log_entries`: Log de auditoria de ações
- `auth.mfa_factors`: Fatores de autenticação multifator
- `auth.flow_state`: Estados de fluxo PKCE/OAuth

---

## 📈 Schema `public` - Dados da Aplicação

### `etf_list` ⭐ **TABELA PRINCIPAL**
**Propósito**: Catálogo completo de ETFs disponíveis na plataforma.

**Colunas**:
- `symbol` (TEXT, PK): Símbolo do ETF (ex: "VTI", "SPY")
- `name` (TEXT): Nome completo do ETF
- `description` (TEXT): Descrição detalhada
- `isin` (TEXT): Código ISIN internacional
- `assetclass` (TEXT): Classe de ativo (ex: "Large Blend", "Equity")
- `securitycusip` (TEXT): Código CUSIP
- `domicile` (TEXT): País de domicílio
- `website` (TEXT): Site oficial
- `etfcompany` (TEXT): Gestora (ex: "Vanguard", "iShares")
- `expenseratio` (NUMERIC): Taxa de administração (%)
- `totalasset` (NUMERIC): Patrimônio sob gestão (USD) 💰
- `avgvolume` (NUMERIC): Volume médio de negociação
- `inceptiondate` (DATE): Data de lançamento
- `nav` (NUMERIC): Valor patrimonial líquido
- `navcurrency` (TEXT): Moeda do NAV
- `holdingscount` (INTEGER): Número de ativos na carteira
- `updatedat` (TIMESTAMP): Última atualização
- `sectorslist` (JSONB): Lista de setores em JSON

**Dados Exemplo**:
```json
{
  "symbol": "VTI",
  "name": "Vanguard Total Stock Market ETF",
  "assetclass": "Large Blend",
  "etfcompany": "Vanguard",
  "expenseratio": 0.03,
  "totalasset": 1822972575744.0
}
```

### `calculated_metrics_teste` 📊 **MÉTRICAS CALCULADAS**
**Propósito**: Métricas de performance calculadas usando dados do yfinance para análise quantitativa.

**Colunas de Performance**:
- `symbol` (TEXT, PK): Símbolo do ETF
- `returns_12m` (NUMERIC): Retorno acumulado 12 meses (%)
- `returns_24m` (NUMERIC): Retorno acumulado 24 meses (%)
- `returns_36m` (NUMERIC): Retorno acumulado 36 meses (%)
- `returns_5y` (NUMERIC): Retorno acumulado 5 anos (%)
- `ten_year_return` (NUMERIC): Retorno acumulado 10 anos (%)

**Colunas de Risco**:
- `volatility_12m` (NUMERIC): Volatilidade anualizada 12 meses (%)
- `volatility_24m` (NUMERIC): Volatilidade anualizada 24 meses (%)
- `volatility_36m` (NUMERIC): Volatilidade anualizada 36 meses (%)
- `ten_year_volatility` (NUMERIC): Volatilidade anualizada 10 anos (%)
- `max_drawdown` (NUMERIC): Máxima queda desde o pico (%)

**Colunas de Eficiência**:
- `sharpe_12m` (NUMERIC): Índice Sharpe 12 meses
- `sharpe_24m` (NUMERIC): Índice Sharpe 24 meses
- `sharpe_36m` (NUMERIC): Índice Sharpe 36 meses
- `ten_year_sharpe` (NUMERIC): Índice Sharpe 10 anos

**Colunas de Dividendos**:
- `dividends_12m` (NUMERIC): Total dividendos 12 meses (USD)
- `dividends_24m` (NUMERIC): Total dividendos 24 meses (USD)
- `dividends_36m` (NUMERIC): Total dividendos 36 meses (USD)
- `dividends_all_time` (NUMERIC): Total dividendos histórico (USD)

### `etf_rankings` 🏆 **RANKINGS E CATEGORIAS**
**Propósito**: Rankings dos melhores ETFs por categoria específica.

**Colunas**:
- `id` (INTEGER, PK): ID único do ranking
- `category` (VARCHAR): Categoria do ranking
- `rank_position` (INTEGER): Posição no ranking (1º, 2º, etc.)
- `symbol` (VARCHAR): Símbolo do ETF
- `value` (NUMERIC): Valor da métrica
- `percentage_value` (NUMERIC): Valor em percentual
- `updated_at` (TIMESTAMPTZ): Última atualização

**Categorias Disponíveis**:
- `highest_volume`: Maior volume de negociação
- `lowest_max_drawdown`: Menor drawdown máximo
- `lowest_volatility_12m`: Menor volatilidade 12 meses
- `top_dividend_yield`: Maior yield de dividendos
- `top_returns_12m`: Maiores retornos 12 meses
- `top_sharpe_12m`: Maior índice Sharpe 12 meses

### `user_profiles` 👤 **PERFIS DE USUÁRIO**
**Propósito**: Perfis detalhados dos usuários com informações de investimento.

**Colunas Pessoais**:
- `id` (UUID, PK, FK→auth.users): ID do usuário
- `full_name` (VARCHAR): Nome completo
- `email` (VARCHAR): Email
- `phone` (VARCHAR): Telefone
- `birth_date` (DATE): Data de nascimento
- `country` (VARCHAR): País
- `preferred_language` (VARCHAR): Idioma preferido (padrão: 'pt-BR')

**Colunas de Investimento**:
- `investor_profile` (JSONB): Perfil de investidor em JSON
- `risk_tolerance` (INTEGER): Tolerância ao risco (1-10)
- `investment_experience` (VARCHAR): Experiência ('iniciante', 'intermediario', 'avancado')
- `monthly_investment` (NUMERIC): Investimento mensal
- `total_patrimony` (NUMERIC): Patrimônio total

**Configurações**:
- `email_notifications` (BOOLEAN): Notificações por email (padrão: true)
- `created_at` (TIMESTAMPTZ): Data de criação
- `updated_at` (TIMESTAMPTZ): Última atualização

### `subscriptions` 💳 **SISTEMA DE ASSINATURAS**
**Propósito**: Gerencia os planos de assinatura dos usuários.

**Colunas Principais**:
- `id` (UUID, PK): ID da assinatura
- `user_id` (UUID, FK→auth.users): ID do usuário
- `plan` (ENUM): Plano da assinatura
- `status` (ENUM): Status da assinatura
- `started_at` (TIMESTAMPTZ): Início da assinatura
- `expires_at` (TIMESTAMPTZ): Expiração
- `cancelled_at` (TIMESTAMPTZ): Data de cancelamento
- `trial_ends_at` (TIMESTAMPTZ): Fim do período trial

**Planos Disponíveis** (`subscription_plan`):
- `STARTER`: Plano básico
- `PRO`: Plano profissional
- `WEALTH`: Plano para gestão de patrimônio (R$ 200k+)
- `OFFSHORE`: Plano offshore internacional (R$ 1M+)

**Status Possíveis** (`subscription_status`):
- `ACTIVE`: Ativa
- `CANCELLED`: Cancelada
- `EXPIRED`: Expirada
- `PENDING`: Pendente
- `TRIAL`: Período de teste

**Colunas Financeiras**:
- `assets_under_management` (NUMERIC): Ativos sob gestão
- `annual_fee` (NUMERIC): Taxa anual
- `monthly_fee` (NUMERIC): Taxa mensal
- `metadata` (JSONB): Metadados adicionais

### `payments` 💰 **SISTEMA DE PAGAMENTOS**
**Propósito**: Registra todos os pagamentos e transações financeiras.

**Colunas**:
- `id` (UUID, PK): ID do pagamento
- `subscription_id` (UUID, FK→subscriptions): ID da assinatura
- `user_id` (UUID, FK→auth.users): ID do usuário
- `amount` (NUMERIC): Valor do pagamento
- `currency` (VARCHAR): Moeda (padrão: 'BRL')
- `status` (ENUM): Status do pagamento
- `method` (ENUM): Método de pagamento
- `period_start` (TIMESTAMPTZ): Início do período
- `period_end` (TIMESTAMPTZ): Fim do período
- `external_payment_id` (VARCHAR): ID externo (Mercado Pago, etc.)
- `external_data` (JSONB): Dados do provedor externo
- `description` (TEXT): Descrição do pagamento
- `paid_at` (TIMESTAMPTZ): Data do pagamento

**Status de Pagamento** (`payment_status`):
- `PENDING`: Pendente
- `PAID`: Pago
- `FAILED`: Falhou
- `REFUNDED`: Reembolsado
- `CANCELLED`: Cancelado

**Métodos de Pagamento** (`payment_method`):
- `MERCADO_PAGO`: Mercado Pago
- `CREDIT_CARD`: Cartão de crédito
- `PIX`: PIX
- `BANK_TRANSFER`: Transferência bancária

### `usage_limits` 📊 **LIMITES DE USO**
**Propósito**: Controla os limites de uso por plano de assinatura.

**Colunas de Limites**:
- `id` (UUID, PK): ID do registro
- `subscription_id` (UUID, FK→subscriptions): ID da assinatura
- `user_id` (UUID, FK→auth.users): ID do usuário
- `screener_queries_limit` (INTEGER): Limite de consultas no screener
- `screener_queries_used` (INTEGER): Consultas utilizadas
- `export_reports_limit` (INTEGER): Limite de exportação de relatórios
- `export_reports_used` (INTEGER): Exportações utilizadas
- `portfolio_simulations_limit` (INTEGER): Limite de simulações
- `portfolio_simulations_used` (INTEGER): Simulações utilizadas
- `ai_analyses_limit` (INTEGER): Limite de análises IA
- `current_ai_analyses` (INTEGER): Análises IA utilizadas
- `api_calls_limit` (INTEGER): Limite de chamadas API
- `api_calls_used` (INTEGER): Chamadas API utilizadas

**Configurações**:
- `advanced_features_enabled` (BOOLEAN): Recursos avançados habilitados
- `period_start` (TIMESTAMPTZ): Início do período
- `period_end` (TIMESTAMPTZ): Fim do período

### `plan_features` ⚙️ **RECURSOS POR PLANO**
**Propósito**: Define os recursos disponíveis para cada plano de assinatura.

**Colunas**:
- `id` (UUID, PK): ID do recurso
- `plan` (ENUM): Plano da assinatura
- `feature_key` (VARCHAR): Chave do recurso
- `feature_name` (VARCHAR): Nome do recurso
- `feature_description` (TEXT): Descrição do recurso
- `is_enabled` (BOOLEAN): Recurso habilitado (padrão: true)
- `limit_value` (INTEGER): Valor limite (se aplicável)

### `wealth_onboarding` 💎 **ONBOARDING WEALTH**
**Propósito**: Processo de onboarding para clientes do plano WEALTH (patrimônio R$ 200k+).

**Colunas**:
- `id` (UUID, PK): ID do processo
- `user_id` (UUID, FK→auth.users): ID do usuário
- `status` (VARCHAR): Status do processo (padrão: 'INITIAL')
- `current_portfolio_value` (NUMERIC): Valor atual da carteira
- `investment_goals` (JSONB): Objetivos de investimento
- `risk_tolerance` (VARCHAR): Tolerância ao risco
- `investment_experience` (VARCHAR): Experiência em investimentos
- `diagnosis_scheduled_at` (TIMESTAMPTZ): Agendamento do diagnóstico
- `presentation_scheduled_at` (TIMESTAMPTZ): Agendamento da apresentação
- `consultant_notes` (JSONB): Anotações do consultor
- `approval_reason` (TEXT): Motivo da aprovação
- `rejection_reason` (TEXT): Motivo da rejeição

### `offshore_onboarding` 🌍 **ONBOARDING OFFSHORE**
**Propósito**: Processo de onboarding para clientes do plano OFFSHORE (patrimônio R$ 1M+).

**Colunas Específicas**:
- `total_assets` (NUMERIC): Total de ativos
- `offshore_goals` (JSONB): Objetivos offshore
- `tax_residency` (VARCHAR): Residência fiscal
- `business_activities` (JSONB): Atividades empresariais
- `compliance_check` (JSONB): Verificação de compliance
- `documentation_status` (JSONB): Status da documentação
- `recommended_structure` (JSONB): Estruturação recomendada
- `estimated_costs` (NUMERIC): Custos estimados
- `structure_meeting_at` (TIMESTAMPTZ): Reunião sobre estrutura

### `contatos_premium` 📞 **CONTATOS PREMIUM**
**Propósito**: Solicitações de contato para planos premium (WEALTH e OFFSHORE).

**Colunas de Contato**:
- `id` (UUID, PK): ID do contato
- `nome` (VARCHAR): Nome completo
- `email` (VARCHAR): Email
- `telefone` (VARCHAR): Telefone
- `whatsapp` (VARCHAR): WhatsApp
- `horario_preferido` (VARCHAR): Horário preferido
- `melhor_dia` (VARCHAR): Melhor dia

**Colunas de Perfil Financeiro**:
- `patrimonio_total` (VARCHAR): Faixa de patrimônio total
- `renda_mensal` (VARCHAR): Faixa de renda mensal
- `experiencia_investimentos` (VARCHAR): Experiência ('iniciante', 'intermediario', 'avancado')
- `objetivo_principal` (TEXT): Objetivo principal
- `horizonte_tempo` (VARCHAR): Horizonte de tempo
- `plano_interesse` (VARCHAR): Plano de interesse ('WEALTH' ou 'OFFSHORE')
- `tem_consultor` (VARCHAR): Possui consultor atual
- `principais_investimentos` (TEXT): Principais investimentos atuais
- `observacoes` (TEXT): Observações adicionais

**Status do Processo**:
- `status` (VARCHAR): Status ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO', 'CONTATADO')

### Tabelas Auxiliares

#### `calculated_metrics_antigo`
**Propósito**: Versão anterior das métricas calculadas (backup/histórico).

#### `_prisma_migrations`
**Propósito**: Controle de migrações do Prisma ORM.

---

## 🔗 Relacionamentos Principais

### Fluxo de Usuário
```
auth.users → user_profiles (1:1)
auth.users → subscriptions (1:N)
auth.users → wealth_onboarding (1:1)
auth.users → offshore_onboarding (1:1)
```

### Fluxo de Assinatura
```
subscriptions → payments (1:N)
subscriptions → usage_limits (1:1)
plan_features → subscriptions (N:1 via plan)
```

### Fluxo de ETFs
```
etf_list → calculated_metrics_teste (1:1 via symbol)
etf_list → etf_rankings (1:N via symbol)
```

---

## 📊 Tipos de Dados Customizados (ENUMs)

### `subscription_plan`
- `STARTER`: Plano básico
- `PRO`: Plano profissional  
- `WEALTH`: Gestão de patrimônio
- `OFFSHORE`: Estruturação offshore

### `subscription_status`
- `ACTIVE`: Ativa
- `CANCELLED`: Cancelada
- `EXPIRED`: Expirada
- `PENDING`: Pendente
- `TRIAL`: Período trial

### `payment_status`
- `PENDING`: Pendente
- `PAID`: Pago
- `FAILED`: Falhou
- `REFUNDED`: Reembolsado
- `CANCELLED`: Cancelado

### `payment_method`
- `MERCADO_PAGO`: Mercado Pago
- `CREDIT_CARD`: Cartão de crédito
- `PIX`: PIX
- `BANK_TRANSFER`: Transferência bancária

---

## 🔒 Segurança e RLS (Row Level Security)

### Tabelas com RLS Habilitado:
- `user_profiles`: Usuários só acessam próprio perfil
- `subscriptions`: Usuários só veem próprias assinaturas
- `payments`: Usuários só veem próprios pagamentos
- `usage_limits`: Usuários só veem próprios limites
- `wealth_onboarding`: Usuários só veem próprio onboarding
- `offshore_onboarding`: Usuários só veem próprio onboarding
- `contatos_premium`: Controle de acesso para contatos

---

## 📈 Métricas e KPIs do Sistema

### Distribuição de Planos (Atual):
- **PRO**: 23 assinaturas (85%)
- **STARTER**: 3 assinaturas (11%)
- **WEALTH**: 1 assinatura (4%)
- **OFFSHORE**: 0 assinaturas

### Top ETFs por Patrimônio:
1. **VTI** - Vanguard Total Stock Market ETF ($1.8T)
2. **VOO** - Vanguard S&P 500 ETF ($1.4T)
3. **SPY** - SPDR S&P 500 ETF Trust ($603B)
4. **IVV** - iShares Core S&P 500 ETF ($582B)
5. **BND** - Vanguard Total Bond Market ETF ($352B)

---

## 🚀 Funcionalidades Principais

### 1. **Screener de ETFs**
- Filtros avançados por métricas
- Rankings por categoria
- Comparação de performance

### 2. **Análise Quantitativa**
- Métricas de risco/retorno
- Índices Sharpe
- Análise de drawdown
- Histórico de dividendos

### 3. **Sistema de Assinaturas**
- 4 níveis de planos
- Controle de limites de uso
- Pagamentos via Mercado Pago
- Recursos por plano

### 4. **Onboarding Premium**
- Processo personalizado para WEALTH
- Estruturação offshore para OFFSHORE
- Agendamento de consultorias
- Acompanhamento de aprovações

---

## 🔧 Considerações Técnicas

### Performance
- Índices em colunas de busca frequente
- Particionamento por data em tabelas de histórico
- Cache de rankings e métricas

### Backup e Recuperação
- Backups automáticos do Supabase
- Retenção de dados históricos
- Versionamento de métricas

### Monitoramento
- Logs de auditoria na tabela `auth.audit_log_entries`
- Métricas de uso por usuário
- Alertas de limites de plano

---

## 📝 Notas de Desenvolvimento

### Atualizações Regulares
- **ETF List**: Dados atualizados via APIs externas
- **Métricas**: Cálculos via yfinance (Python)
- **Rankings**: Regenerados periodicamente

### Integrações
- **Mercado Pago**: Pagamentos
- **yfinance**: Dados de mercado
- **Supabase Auth**: Autenticação
- **Prisma**: ORM para migrações

---

*Documentação gerada em: $(date)*
*Versão do banco: PostgreSQL 15.8.1.091*
*Total de tabelas: 26 (18 public + 8 auth)* 