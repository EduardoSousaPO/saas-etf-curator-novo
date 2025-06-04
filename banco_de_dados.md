# Estrutura do Banco de Dados - ETFCurator

## Visão Geral

Este documento descreve a estrutura do banco de dados do ETFCurator, uma plataforma SaaS para análise, comparação e recomendação personalizada de ETFs (Exchange Traded Funds). O banco de dados é gerenciado através do Supabase (PostgreSQL) e utiliza o Prisma como ORM.

## Schemas

O banco de dados está dividido em dois schemas principais:
- `auth`: Gerenciado pelo Supabase Auth, contém tabelas relacionadas à autenticação
- `public`: Contém as tabelas de negócio da aplicação

## Tabelas Principais

### ETFs (`etfs`)

Armazena informações sobre os ETFs disponíveis na plataforma.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único do ETF |
| symbol | text | Ticker de negociação (identificador único) |
| name | text | Nome oficial do ETF |
| description | text | Descrição do objetivo de investimento |
| category | text | Categoria do ETF (ex: Large Blend, Bond) |
| exchange | text | Bolsa onde é negociado |
| inception_date | date | Data de lançamento do ETF |
| total_assets | numeric | Patrimônio total em USD |
| volume | numeric | Volume médio de negociação |
| ten_year_return | numeric | Retorno de 10 anos |
| returns_12m | numeric | Retorno dos últimos 12 meses |
| returns_24m | numeric | Retorno dos últimos 24 meses |
| returns_36m | numeric | Retorno dos últimos 36 meses |
| volatility_12m | numeric | Volatilidade anualizada 12 meses |
| volatility_24m | numeric | Volatilidade anualizada 24 meses |
| volatility_36m | numeric | Volatilidade anualizada 36 meses |
| ten_year_volatility | numeric | Volatilidade anualizada 10 anos |
| sharpe_12m | numeric | Índice Sharpe 12 meses |
| sharpe_24m | numeric | Índice Sharpe 24 meses |
| sharpe_36m | numeric | Índice Sharpe 36 meses |
| ten_year_sharpe | numeric | Índice Sharpe 10 anos |
| max_drawdown | numeric | Máxima queda histórica |
| dividends_12m | numeric | Dividendos últimos 12 meses |
| dividends_24m | numeric | Dividendos últimos 24 meses |
| dividends_36m | numeric | Dividendos últimos 36 meses |
| dividends_all_time | numeric | Dividendos desde o início |
| dividend_yield | numeric | Dividend Yield atual |
| start_date | date | Início da série histórica |
| end_date | date | Fim da série histórica |
| updated_at | timestamptz | Data da última atualização |

**Observações**:
- Valores percentuais são armazenados como decimais (ex: 0.1234 = 12.34%)
- Dados enriquecidos da API FMP são armazenados no campo `description` em formato JSON

### Portfólios (`portfolios`)

Armazena os portfólios criados pelos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único do portfólio |
| user_id | uuid | ID do usuário proprietário |
| name | varchar(100) | Nome do portfólio |
| description | text | Descrição do portfólio |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |

### Holdings de Portfólios (`portfolio_holdings`)

Armazena os ETFs que compõem cada portfólio.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único do holding |
| portfolio_id | uuid | ID do portfólio relacionado |
| etf_symbol | varchar(10) | Símbolo do ETF |
| shares | numeric | Quantidade de cotas |
| average_cost | numeric | Preço médio de compra |
| current_price | numeric | Preço atual |
| purchase_date | timestamptz | Data da compra |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |

### Correlações de ETFs (`etf_correlations`)

Armazena dados de correlação entre pares de ETFs.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| etf_a_symbol | varchar(10) | Símbolo do primeiro ETF |
| etf_b_symbol | varchar(10) | Símbolo do segundo ETF |
| correlation_coefficient | numeric | Coeficiente de correlação (-1 a 1) |
| period_days | integer | Período em dias (padrão 252) |
| calculation_date | date | Data do cálculo |
| data_points | integer | Número de pontos de dados usados |
| r_squared | numeric | Coeficiente de determinação |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |

### Histórico de Pagamentos (`payment_history`)

Registra os pagamentos realizados pelos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único do pagamento |
| user_id | uuid | ID do usuário |
| subscription_id | uuid | ID da assinatura relacionada |
| plan_id | varchar(50) | ID do plano contratado |
| amount | numeric | Valor do pagamento |
| currency | varchar(3) | Moeda (padrão USD) |
| status | varchar(20) | Status do pagamento |
| payment_method | varchar(50) | Método de pagamento |
| payment_provider | varchar(50) | Provedor de pagamento |
| external_payment_id | varchar(255) | ID externo do pagamento |
| payment_date | timestamptz | Data do pagamento |
| created_at | timestamptz | Data de registro |

### Análise de Risco de Portfólio (`portfolio_risk_analysis`)

Armazena análises de risco calculadas para portfólios.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único da análise |
| portfolio_id | uuid | ID do portfólio analisado |
| analysis_date | date | Data da análise |
| total_value | numeric | Valor total do portfólio |
| portfolio_return_1m | numeric | Retorno de 1 mês |
| portfolio_return_3m | numeric | Retorno de 3 meses |
| portfolio_return_12m | numeric | Retorno de 12 meses |
| portfolio_volatility | numeric | Volatilidade anualizada |
| portfolio_sharpe | numeric | Índice Sharpe do portfólio |
| portfolio_beta | numeric | Beta do portfólio |
| diversification_score | numeric | Score de diversificação (0-100) |
| risk_level | varchar(20) | Nível de risco (baixo, médio, alto) |
| sector_exposure | jsonb | Exposição por setor |
| geographic_exposure | jsonb | Exposição geográfica |
| rebalancing_suggestions | jsonb | Sugestões de rebalanceamento |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |

### Análise de Setores (`sector_analysis`)

Armazena dados de análise por setor de mercado.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| sector_name | varchar(100) | Nome do setor |
| analysis_date | date | Data da análise |
| total_etfs | integer | Total de ETFs no setor |
| avg_return_1m | numeric | Retorno médio de 1 mês |
| avg_return_3m | numeric | Retorno médio de 3 meses |
| avg_return_6m | numeric | Retorno médio de 6 meses |
| avg_return_12m | numeric | Retorno médio de 12 meses |
| avg_volatility | numeric | Volatilidade média |
| avg_sharpe_ratio | numeric | Índice Sharpe médio |
| avg_dividend_yield | numeric | Dividend Yield médio |
| total_assets | numeric | Total de ativos no setor |
| best_performer_symbol | varchar(10) | Melhor ETF do setor |
| worst_performer_symbol | varchar(10) | Pior ETF do setor |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |

### Assinaturas de Usuários (`user_subscriptions`)

Gerencia as assinaturas ativas dos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único da assinatura |
| user_id | uuid | ID do usuário |
| plan_id | varchar(50) | ID do plano |
| status | varchar(20) | Status da assinatura |
| current_period_start | timestamptz | Início do período atual |
| current_period_end | timestamptz | Fim do período atual |
| payment_method | varchar(50) | Método de pagamento |
| payment_provider | varchar(50) | Provedor de pagamento |
| external_subscription_id | varchar(255) | ID externo da assinatura |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |

### Rastreamento de Uso (`user_usage_tracking`)

Monitora o uso da plataforma pelos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | ID do usuário |
| date | date | Data do registro |
| ai_queries_count | integer | Número de consultas à IA |
| api_calls_count | integer | Número de chamadas à API |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |

## Tabelas de Visualização (Views)

### Top Correlações Positivas (`top_positive_correlations`)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| etf_a_symbol | varchar | Símbolo do primeiro ETF |
| etf_b_symbol | varchar | Símbolo do segundo ETF |
| correlation_coefficient | numeric | Coeficiente de correlação |
| r_squared | numeric | Coeficiente de determinação |
| data_points | integer | Número de pontos de dados |
| calculation_date | date | Data do cálculo |

### Top Correlações Negativas (`top_negative_correlations`)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| etf_a_symbol | varchar | Símbolo do primeiro ETF |
| etf_b_symbol | varchar | Símbolo do segundo ETF |
| correlation_coefficient | numeric | Coeficiente de correlação |
| r_squared | numeric | Coeficiente de determinação |
| data_points | integer | Número de pontos de dados |
| calculation_date | date | Data do cálculo |

### Estatísticas de Assinaturas (`subscription_stats`)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| plan_id | varchar | ID do plano |
| status | varchar | Status da assinatura |
| user_count | bigint | Contagem de usuários |
| percentage | numeric | Percentual do total |

### Ranking de Performance por Setor (`sector_performance_ranking`)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| sector_name | varchar | Nome do setor |
| total_etfs | integer | Total de ETFs no setor |
| avg_return_12m | numeric | Retorno médio de 12 meses |
| avg_volatility | numeric | Volatilidade média |
| avg_sharpe_ratio | numeric | Índice Sharpe médio |
| total_assets | numeric | Total de ativos no setor |
| best_performer_symbol | varchar | Melhor ETF do setor |
| analysis_date | date | Data da análise |
| performance_rank | bigint | Ranking de performance |
| sharpe_rank | bigint | Ranking por Sharpe |

## Tabelas de Apoio

### Assinantes Ativos (`active_subscribers`)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | ID do usuário |
| plan_id | varchar | ID do plano |
| status | varchar | Status da assinatura |
| current_period_start | timestamptz | Início do período atual |
| current_period_end | timestamptz | Fim do período atual |
| payment_method | varchar | Método de pagamento |
| payment_provider | varchar | Provedor de pagamento |
| external_subscription_id | varchar | ID externo da assinatura |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data da última atualização |
| computed_status | varchar | Status calculado |

## Relações e Constraints

- `portfolios` → `user_id` referencia `auth.users(id)`
- `portfolio_holdings` → `portfolio_id` referencia `portfolios(id)`
- `portfolio_holdings` → `etf_symbol` referencia indiretamente `etfs(symbol)`
- `portfolio_risk_analysis` → `portfolio_id` referencia `portfolios(id)`
- `user_subscriptions` → `user_id` referencia `auth.users(id)`
- `payment_history` → `user_id` referencia `auth.users(id)`
- `payment_history` → `subscription_id` referencia `user_subscriptions(id)`

## População do Banco de Dados

Para o pleno funcionamento do ETFCurator, é necessário que o banco de dados esteja populado com informações de ETFs, correlações, portfólios de exemplo e outros dados. Para facilitar este processo, foram desenvolvidos scripts de automação que realizam a população do banco.

### Scripts Disponíveis

Os seguintes scripts estão disponíveis na pasta `scripts/`:

1. **import-all-etfs.js** - Importa todos os 4.411 ETFs do arquivo `symbols_etfs_eua.xlsx` para a tabela `etfs`.
2. **enrich-etfs.js** - Enriquece os ETFs com métricas adicionais (retornos, volatilidade, Sharpe ratio, etc.).
3. **calculate-etf-correlations.js** - Calcula e armazena as correlações entre pares de ETFs.
4. **populate-all-holdings.js** - Cria portfólios de exemplo e adiciona ETFs a eles.
5. **generate-portfolio-risk-analysis.js** - Gera análises de risco para os portfólios existentes.
6. **populate-all-database.js** - Script unificado que executa todos os acima na sequência correta.

### Como Executar

Para executar a população completa do banco de dados:

```bash
# Instalar dependências necessárias
npm install @prisma/client dotenv xlsx axios --legacy-peer-deps

# Executar o script unificado
node scripts/populate-all-database.js
```

### Tabelas Populadas

Os scripts acima populam as seguintes tabelas:

1. **etfs** - Todos os ETFs disponíveis com suas métricas
2. **etf_correlations** - Correlações entre pares de ETFs
3. **portfolios** - Portfólios de exemplo para usuários
4. **portfolio_holdings** - ETFs presentes em cada portfólio
5. **portfolio_risk_analysis** - Análises de risco geradas para cada portfólio

### Métricas Calculadas

As métricas calculadas e armazenadas incluem:

- **Retornos** (1m, 3m, 12m, 24m, 36m, 10 anos)
- **Volatilidade** (12m, 24m, 36m, 10 anos)
- **Sharpe Ratio** (12m, 24m, 36m, 10 anos)
- **Dividend Yield** (12m, 24m, 36m, histórico)
- **Correlações** entre pares de ETFs
- **Score de diversificação** para portfólios
- **Nível de risco** dos portfólios
- **Exposição setorial e geográfica** dos portfólios
- **Sugestões de rebalanceamento** para portfólios

Estas métricas são utilizadas em várias funcionalidades do aplicativo, como o screener, rankings, comparador e análise de portfólios.

## Conclusão

A estrutura do banco de dados do ETFCurator é robusta e bem modelada para suportar todas as funcionalidades da plataforma. O modelo atende às necessidades de:

1. Armazenamento e atualização de dados de ETFs
2. Gerenciamento de portfólios de usuários
3. Análise de correlação entre ETFs
4. Análise de risco de portfólios
5. Análise setorial de mercado
6. Gestão de assinaturas e pagamentos
7. Monitoramento de uso da plataforma

Os scripts de atualização (como `enrich-etfs-update.js` e `rank-etfs.js`) mantêm os dados atualizados com métricas de performance, risco e outras estatísticas relevantes. 