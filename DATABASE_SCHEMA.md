# Documentação do Banco de Dados — etf-curator

Este documento descreve todas as tabelas, colunas, significados e usos do banco de dados do projeto **etf-curator**. Ele foi gerado automaticamente a partir do schema do Prisma, rotas de API e helpers do projeto.

---

## Tabelas Principais

### 1. `etf_list`
**Descrição:** Cadastro mestre dos ETFs disponíveis na plataforma.

| Coluna                | Tipo      | Descrição                                                                 |
|-----------------------|-----------|---------------------------------------------------------------------------|
| symbol                | String    | Símbolo do ETF (chave primária).                                         |
| name                  | String?   | Nome completo do ETF.                                                     |
| description           | String?   | Descrição do ETF (pode conter dados enriquecidos FMP).                    |
| isin                  | String?   | Código ISIN do ETF.                                                       |
| assetclass            | String?   | Classe de ativo (ex: Equity, Fixed Income, Commodities, etc). Substitui a antiga coluna "category". |
| securitycusip         | String?   | Código CUSIP do ETF.                                                      |
| domicile              | String?   | País de domicílio do ETF.                                                 |
| website               | String?   | Site oficial do ETF.                                                      |
| etfcompany            | String?   | Gestora do ETF.                                                           |
| expenseratio          | Decimal?  | Taxa de administração anual.                                              |
| assetsundermanagement | Decimal?  | Patrimônio líquido sob gestão.                                            |
| avgvolume             | Decimal?  | Volume médio negociado.                                                   |
| inceptiondate         | Date?     | Data de início do ETF.                                                    |
| nav                   | Decimal?  | Valor patrimonial líquido por cota.                                       |
| navcurrency           | String?   | Moeda do NAV.                                                             |
| holdingscount         | Int?      | Número de ativos na carteira.                                             |
| updatedat             | Timestamp?| Data/hora da última atualização.                                          |
| sectorslist           | Json?     | Lista de setores (quando disponível).                                     |

**Uso:**
- Base para todas as consultas de ETFs.
- Relaciona-se com métricas, preços, dividendos e holdings.
- Usada em todas as rotas de screening, comparação, rankings e enriquecimento.

---

### 2. `calculated_metrics`
**Descrição:** Métricas financeiras calculadas para cada ETF.

| Coluna               | Tipo     | Descrição                                              |
|----------------------|----------|--------------------------------------------------------|
| symbol               | String   | Símbolo do ETF (chave primária, FK para etf_list).     |
| returns_12m          | Decimal? | Retorno acumulado em 12 meses.                         |
| returns_24m          | Decimal? | Retorno acumulado em 24 meses.                         |
| returns_36m          | Decimal? | Retorno acumulado em 36 meses.                         |
| returns_5y           | Decimal? | Retorno acumulado em 5 anos.                           |
| ten_year_return      | Decimal? | Retorno acumulado em 10 anos.                          |
| volatility_12m       | Decimal? | Volatilidade anualizada 12 meses.                      |
| volatility_24m       | Decimal? | Volatilidade anualizada 24 meses.                      |
| volatility_36m       | Decimal? | Volatilidade anualizada 36 meses.                      |
| ten_year_volatility  | Decimal? | Volatilidade anualizada 10 anos.                       |
| sharpe_12m           | Decimal? | Sharpe ratio 12 meses.                                 |
| sharpe_24m           | Decimal? | Sharpe ratio 24 meses.                                 |
| sharpe_36m           | Decimal? | Sharpe ratio 36 meses.                                 |
| ten_year_sharpe      | Decimal? | Sharpe ratio 10 anos.                                  |
| max_drawdown         | Decimal? | Máxima queda histórica.                                |
| dividends_12m        | Decimal? | Dividendos pagos em 12 meses.                          |
| dividends_24m        | Decimal? | Dividendos pagos em 24 meses.                          |
| dividends_36m        | Decimal? | Dividendos pagos em 36 meses.                          |
| dividends_all_time   | Decimal? | Dividendos pagos desde o início.                       |

**Uso:**
- Usada para rankings, screening, comparação e enriquecimento.
- Calculada a partir de preços históricos e dividendos (tabelas etf_prices e etf_dividends).
- Exposta em rotas como `/api/etfs/screener`, `/api/etfs/enhanced`, `/api/etfs/compare`.

---

### 3. `etf_prices`
**Descrição:** Histórico diário de preços dos ETFs.

| Coluna     | Tipo     | Descrição                                 |
|------------|----------|-------------------------------------------|
| symbol     | String   | Símbolo do ETF (FK para etf_list).        |
| date       | Date     | Data da cotação.                          |
| open       | Decimal? | Preço de abertura.                        |
| high       | Decimal? | Preço máximo.                             |
| low        | Decimal? | Preço mínimo.                             |
| close      | Decimal? | Preço de fechamento.                      |
| volume     | Decimal? | Volume negociado.                         |
| nav        | Decimal? | NAV do dia.                               |
| return_1m  | Decimal? | Retorno 1 mês (pré-calculado, opcional).  |
| return_3m  | Decimal? | Retorno 3 meses (pré-calculado, opcional).|
| return_1y  | Decimal? | Retorno 1 ano (pré-calculado, opcional).  |
| adj_close  | Decimal? | Preço ajustado.                           |

**Uso:**
- Base para cálculo de retornos, volatilidade, sharpe, drawdown.
- Usada em scripts de enriquecimento e análises históricas.

---

### 4. `etf_dividends`
**Descrição:** Histórico de dividendos pagos por cada ETF.

| Coluna       | Tipo     | Descrição                                 |
|--------------|----------|-------------------------------------------|
| symbol       | String   | Símbolo do ETF (FK para etf_list).        |
| date         | Date     | Data do pagamento.                        |
| dividend     | Decimal? | Valor do dividendo.                       |
| adj_dividend | Decimal? | Valor ajustado do dividendo.              |
| label        | String?  | Descrição/identificador do evento.         |

**Uso:**
- Base para cálculo de dividendos acumulados e dividend yield.
- Usada em métricas e exibição de histórico ao usuário.

---

### 5. `etf_holdings`
**Descrição:** Composição da carteira de cada ETF (holdings).

| Coluna         | Tipo     | Descrição                                 |
|----------------|----------|-------------------------------------------|
| symbol         | String   | Símbolo do ETF (FK para etf_list).        |
| holding_symbol | String   | Símbolo do ativo na carteira.             |
| holding_name   | String?  | Nome do ativo.                            |
| weight         | Decimal? | Peso do ativo na carteira (%).            |
| shares         | Decimal? | Quantidade de cotas/ações.                |
| market_value   | Decimal? | Valor de mercado do ativo.                |

**Uso:**
- Exibição da composição dos ETFs.
- Análises de diversificação e exposição setorial/geográfica.

---

### 6. `portfolios` e `portfolio_holdings`
**Descrição:** Controle de portfólios de usuários e suas posições em ETFs.

#### `portfolios`
| Coluna      | Tipo     | Descrição                                 |
|-------------|----------|-------------------------------------------|
| id          | String   | ID do portfólio (UUID).                   |
| user_id     | String   | ID do usuário dono do portfólio.          |
| name        | String   | Nome do portfólio.                        |
| description | String?  | Descrição do portfólio.                   |
| created_at  | DateTime?| Data de criação.                          |
| updated_at  | DateTime?| Data de atualização.                      |

#### `portfolio_holdings`
| Coluna        | Tipo     | Descrição                                 |
|---------------|----------|-------------------------------------------|
| id            | String   | ID da posição (UUID).                     |
| portfolio_id  | String   | ID do portfólio (FK para portfolios).     |
| etf_symbol    | String   | Símbolo do ETF (FK para etf_list).        |
| shares        | Decimal  | Quantidade de cotas.                      |
| average_cost  | Decimal  | Preço médio de compra.                    |
| current_price | Decimal? | Preço atual (atualizado periodicamente).  |
| purchase_date | DateTime?| Data da compra.                           |
| created_at    | DateTime?| Data de criação.                          |
| updated_at    | DateTime?| Data de atualização.                      |

**Uso:**
- Permite que usuários criem e gerenciem portfólios personalizados.
- Usado em rotas de portfólio, análises de risco e sugestões de rebalanceamento.

---

### 7. `etf_correlations`
**Descrição:** Armazena coeficientes de correlação entre pares de ETFs.

| Coluna                  | Tipo     | Descrição                                 |
|-------------------------|----------|-------------------------------------------|
| id                      | String   | ID da correlação (UUID).                  |
| etf_a_symbol            | String   | Símbolo do ETF A.                         |
| etf_b_symbol            | String   | Símbolo do ETF B.                         |
| correlation_coefficient | Decimal  | Coeficiente de correlação (-1 a 1).       |
| period_days             | Int      | Período em dias usado no cálculo.         |
| calculation_date        | Date?    | Data do cálculo.                          |
| data_points             | Int      | Número de pontos de dados usados.         |
| r_squared               | Decimal? | R² do ajuste.                             |
| created_at              | DateTime?| Data de criação.                          |
| updated_at              | DateTime?| Data de atualização.                      |

**Uso:**
- Análises de diversificação, risco e sugestões de portfólio.
- Exposta em rotas de analytics/correlations.

---

### 8. `sector_analysis`
**Descrição:** Métricas agregadas por setor de ETFs.

| Coluna                | Tipo     | Descrição                                 |
|-----------------------|----------|-------------------------------------------|
| id                    | String   | ID da análise (UUID).                     |
| sector_name           | String   | Nome do setor.                            |
| analysis_date         | Date?    | Data da análise.                          |
| total_etfs            | Int?     | Número de ETFs no setor.                  |
| avg_return_1m         | Decimal? | Retorno médio 1 mês.                      |
| avg_return_3m         | Decimal? | Retorno médio 3 meses.                    |
| avg_return_6m         | Decimal? | Retorno médio 6 meses.                    |
| avg_return_12m        | Decimal? | Retorno médio 12 meses.                   |
| avg_volatility        | Decimal? | Volatilidade média.                       |
| avg_sharpe_ratio      | Decimal? | Sharpe médio.                             |
| avg_dividend_yield    | Decimal? | Dividend yield médio.                     |
| total_assets          | Decimal? | Patrimônio total do setor.                |
| best_performer_symbol | String?  | Símbolo do melhor ETF do setor.           |
| worst_performer_symbol| String?  | Símbolo do pior ETF do setor.             |
| created_at            | DateTime?| Data de criação.                          |
| updated_at            | DateTime?| Data de atualização.                      |

**Uso:**
- Exibição de rankings e análises setoriais.
- Exposta em rotas de analytics/correlations.

---

### 9. `user_subscriptions`, `payment_history`, `user_usage_tracking`
**Descrição:** Controle de assinaturas, pagamentos e uso de recursos pelos usuários.

#### `user_subscriptions`
| Coluna                  | Tipo     | Descrição                                 |
|-------------------------|----------|-------------------------------------------|
| id                      | String   | ID da assinatura (UUID).                  |
| user_id                 | String   | ID do usuário (único).                    |
| plan_id                 | String   | Plano contratado (free, pro, enterprise). |
| status                  | String   | Status da assinatura.                     |
| current_period_start    | DateTime?| Início do período atual.                  |
| current_period_end      | DateTime?| Fim do período atual.                     |
| payment_method          | String?  | Método de pagamento.                      |
| payment_provider        | String?  | Provedor de pagamento.                    |
| external_subscription_id| String?  | ID externo do provedor.                   |
| created_at              | DateTime?| Data de criação.                          |
| updated_at              | DateTime?| Data de atualização.                      |

#### `payment_history`
| Coluna              | Tipo     | Descrição                                 |
|---------------------|----------|-------------------------------------------|
| id                  | String   | ID do pagamento (UUID).                   |
| user_id             | String   | ID do usuário.                            |
| subscription_id     | String?  | ID da assinatura.                         |
| plan_id             | String   | Plano relacionado.                        |
| amount              | Decimal  | Valor pago.                               |
| currency            | String?  | Moeda.                                    |
| status              | String   | Status do pagamento.                      |
| payment_method      | String?  | Método de pagamento.                      |
| payment_provider    | String?  | Provedor de pagamento.                    |
| external_payment_id | String?  | ID externo do pagamento.                  |
| payment_date        | DateTime?| Data do pagamento.                        |
| created_at          | DateTime?| Data de criação.                          |

#### `user_usage_tracking`
| Coluna           | Tipo     | Descrição                                 |
|------------------|----------|-------------------------------------------|
| id               | String   | ID do registro (UUID).                    |
| user_id          | String   | ID do usuário.                            |
| date             | Date?    | Data do uso.                              |
| ai_queries_count | Int?     | Número de queries de IA.                  |
| api_calls_count  | Int?     | Número de chamadas de API.                |
| created_at       | DateTime?| Data de criação.                          |
| updated_at       | DateTime?| Data de atualização.                      |

**Uso:**
- Controle de planos, pagamentos e limites de uso.
- Usado em rotas de pagamentos, assinatura e analytics.

---

## Relacionamentos e Fluxos
- **etf_list** é a tabela central, relacionada a todas as demais do domínio ETF.
- **calculated_metrics** referencia **etf_list** por symbol.
- **etf_prices**, **etf_dividends**, **etf_holdings** usam symbol como FK para **etf_list**.
- **portfolios** e **portfolio_holdings** permitem que usuários criem carteiras personalizadas de ETFs.
- **etf_correlations** armazena relações estatísticas entre pares de ETFs.
- **sector_analysis** agrega métricas por setor.
- **user_subscriptions**, **payment_history** e **user_usage_tracking** controlam o acesso, pagamentos e uso da plataforma.

---

## Exemplos de Uso no Projeto
- **Screening e Rankings:** `/api/etfs/screener`, `/api/etfs/rankings` usam `etf_list` e `calculated_metrics` para filtrar e ranquear ETFs.
- **Comparação:** `/api/etfs/compare` faz merge de dados cadastrais e métricas para múltiplos ETFs.
- **Enriquecimento:** Scripts Python/Node.js e rotas `/api/etfs/enhanced` atualizam e enriquecem os dados das tabelas.
- **Portfólios:** Rotas `/api/portfolios` e helpers permitem criar, consultar e analisar portfólios de usuário.
- **Analytics:** `/api/analytics/correlations` e `/api/analytics/sector_analysis` usam tabelas de correlação e análise setorial.
- **Pagamentos e Assinaturas:** Rotas `/api/payments`, `/api/stripe-webhook` usam as tabelas de assinatura e histórico de pagamentos.

---

## Observações
- O banco utiliza Postgres, com Prisma Client para acesso e manipulação.
- Algumas tabelas possuem Row Level Security (RLS) ativado.
- O schema pode evoluir; consulte sempre este arquivo e o schema.prisma para atualizações.

---

*Gerado automaticamente para integração com manus.ai e onboarding de novos desenvolvedores.* 