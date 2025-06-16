# Documentação do Banco de Dados — etf-curator (Versão Simplificada)

Este documento descreve as tabelas essenciais do banco de dados do projeto **etf-curator** após a simplificação focada em Rankings e Screener. O banco foi otimizado para manter apenas os dados fundamentais necessários para as funcionalidades core.

---

## 📊 **Visão Geral do Banco Simplificado**

**Total de Tabelas**: 5 tabelas essenciais  
**Tamanho Total**: ~688 MB  
**ETFs Cadastrados**: 4.409 ETFs  
**Cobertura de Métricas**: 4.253 ETFs (96.5%)  
**Registros Históricos**: 3.7M preços + 106K dividendos  

---

## 🗂 **Tabelas Essenciais**

### 1. `etf_list`
**Descrição:** Cadastro mestre de todos os ETFs disponíveis na plataforma.  
**Tamanho:** 5.2 MB | **Registros:** 4.409 ETFs

| Coluna                | Tipo      | Descrição                                                                 |
|-----------------------|-----------|---------------------------------------------------------------------------|
| symbol                | String    | **Chave Primária** - Símbolo único do ETF (ex: "SPY", "QQQ")             |
| name                  | String?   | Nome completo do ETF (ex: "SPDR S&P 500 ETF Trust")                      |
| description           | String?   | Descrição detalhada do ETF e sua estratégia de investimento               |
| isin                  | String?   | Código ISIN internacional do ETF                                          |
| assetclass            | String?   | Classe de ativo (Equity, Fixed Income, Commodities, Real Estate, etc.)   |
| securitycusip         | String?   | Código CUSIP americano do ETF                                             |
| domicile              | String?   | País de domicílio/registro do ETF (ex: "US", "IE")                       |
| website               | String?   | Site oficial do ETF ou gestora                                            |
| etfcompany            | String?   | Nome da gestora do ETF (ex: "BlackRock", "Vanguard", "State Street")     |
| expenseratio          | Decimal?  | Taxa de administração anual em % (ex: 0.03 = 0.03%)                      |
| assetsundermanagement | Decimal?  | Patrimônio líquido sob gestão em USD                                      |
| avgvolume             | Decimal?  | Volume médio diário negociado (últimos 30 dias)                          |
| inceptiondate         | Date?     | Data de lançamento/início do ETF                                          |
| nav                   | Decimal?  | Valor patrimonial líquido por cota em USD                                 |
| navcurrency           | String?   | Moeda do NAV (geralmente "USD")                                           |
| holdingscount         | Int?      | Número total de ativos na carteira do ETF                                 |
| updatedat             | Timestamp?| Data/hora da última atualização dos dados                                 |
| sectorslist           | Json?     | Lista de setores de exposição do ETF (formato JSON)                       |

**Uso Principal:**
- Base para todas as consultas de ETFs no Screener
- Fonte de dados para Rankings por gestora, classe de ativo, etc.
- Relaciona-se com todas as outras tabelas via `symbol`

---

### 2. `calculated_metrics`
**Descrição:** Métricas financeiras calculadas para análise de performance e risco.  
**Tamanho:** 1.9 MB | **Registros:** 4.253 ETFs com métricas

| Coluna               | Tipo     | Descrição                                              |
|----------------------|----------|--------------------------------------------------------|
| symbol               | String   | **Chave Primária** - Símbolo do ETF (FK para etf_list)|
| returns_12m          | Decimal? | Retorno acumulado em 12 meses (%)                     |
| returns_24m          | Decimal? | Retorno acumulado em 24 meses (%)                     |
| returns_36m          | Decimal? | Retorno acumulado em 36 meses (%)                     |
| returns_5y           | Decimal? | Retorno acumulado em 5 anos (%)                       |
| ten_year_return      | Decimal? | Retorno acumulado em 10 anos (%)                      |
| volatility_12m       | Decimal? | Volatilidade anualizada 12 meses (%)                  |
| volatility_24m       | Decimal? | Volatilidade anualizada 24 meses (%)                  |
| volatility_36m       | Decimal? | Volatilidade anualizada 36 meses (%)                  |
| ten_year_volatility  | Decimal? | Volatilidade anualizada 10 anos (%)                   |
| sharpe_12m           | Decimal? | Índice Sharpe 12 meses (retorno/risco)                |
| sharpe_24m           | Decimal? | Índice Sharpe 24 meses                                |
| sharpe_36m           | Decimal? | Índice Sharpe 36 meses                                |
| ten_year_sharpe      | Decimal? | Índice Sharpe 10 anos                                 |
| max_drawdown         | Decimal? | Máxima queda histórica desde o pico (%)               |
| dividends_12m        | Decimal? | Total de dividendos pagos em 12 meses (USD)           |
| dividends_24m        | Decimal? | Total de dividendos pagos em 24 meses (USD)           |
| dividends_36m        | Decimal? | Total de dividendos pagos em 36 meses (USD)           |
| dividends_all_time   | Decimal? | Total de dividendos pagos desde o início (USD)        |

**Uso Principal:**
- **Rankings**: Ordenação por performance, risco, Sharpe ratio
- **Screener**: Filtros por retorno, volatilidade, dividendos
- **Comparação**: Análise side-by-side de métricas entre ETFs

---

### 3. `etf_prices`
**Descrição:** Histórico completo de preços diários dos ETFs.  
**Tamanho:** 671 MB | **Registros:** 3.7M cotações históricas

| Coluna     | Tipo     | Descrição                                 |
|------------|----------|-------------------------------------------|
| symbol     | String   | **Chave Composta** - Símbolo do ETF      |
| date       | Date     | **Chave Composta** - Data da cotação     |
| open       | Decimal? | Preço de abertura do dia (USD)           |
| high       | Decimal? | Preço máximo do dia (USD)                |
| low        | Decimal? | Preço mínimo do dia (USD)                |
| close      | Decimal? | Preço de fechamento do dia (USD)         |
| volume     | Decimal? | Volume total negociado no dia             |
| nav        | Decimal? | Net Asset Value oficial do dia (USD)     |
| return_1m  | Decimal? | Retorno 1 mês (pré-calculado, %)         |
| return_3m  | Decimal? | Retorno 3 meses (pré-calculado, %)       |
| return_1y  | Decimal? | Retorno 1 ano (pré-calculado, %)         |
| adj_close  | Decimal? | Preço ajustado por splits/dividendos      |

**Uso Principal:**
- **Cálculo de Métricas**: Base para calculated_metrics
- **Análises Históricas**: Gráficos de performance temporal
- **Backtesting**: Simulações de investimento histórico

---

### 4. `etf_dividends`
**Descrição:** Histórico completo de dividendos pagos pelos ETFs.  
**Tamanho:** 10 MB | **Registros:** 106.634 pagamentos de dividendos

| Coluna       | Tipo     | Descrição                                 |
|--------------|----------|-------------------------------------------|
| symbol       | String   | **Chave Composta** - Símbolo do ETF      |
| date         | Date     | **Chave Composta** - Data do pagamento   |
| dividend     | Decimal? | Valor bruto do dividendo por cota (USD)  |
| adj_dividend | Decimal? | Valor ajustado por splits (USD)          |
| label        | String?  | Tipo/descrição do evento (ex: "Dividend")|

**Uso Principal:**
- **Cálculo de Dividend Yield**: Para métricas de renda
- **Rankings por Dividendos**: ETFs com maior distribuição
- **Análise de Renda**: Histórico de pagamentos para investidores

---

### 5. `etf_holdings`
**Descrição:** Composição detalhada da carteira de cada ETF.  
**Tamanho:** 24 KB | **Registros:** 0 (tabela preparada para dados futuros)

| Coluna         | Tipo     | Descrição                                 |
|----------------|----------|-------------------------------------------|
| symbol         | String   | **Chave Composta** - Símbolo do ETF      |
| holding_symbol | String   | **Chave Composta** - Símbolo do ativo    |
| holding_name   | String?  | Nome completo do ativo na carteira       |
| weight         | Decimal? | Peso do ativo na carteira (%)            |
| shares         | Decimal? | Quantidade de ações/cotas detidas         |
| market_value   | Decimal? | Valor de mercado da posição (USD)        |

**Uso Principal:**
- **Análise de Composição**: Top holdings de cada ETF
- **Diversificação**: Análise de concentração de ativos
- **Transparência**: Detalhamento da carteira para investidores

---

## 🔗 **Relacionamentos Entre Tabelas**

```
etf_list (symbol)
    ├── calculated_metrics (symbol) [1:1]
    ├── etf_prices (symbol) [1:N]
    ├── etf_dividends (symbol) [1:N]
    └── etf_holdings (symbol) [1:N]
```

**Integridade Referencial:**
- Todas as tabelas referenciam `etf_list.symbol` como chave estrangeira
- `calculated_metrics` tem relação 1:1 com `etf_list`
- Demais tabelas têm relação 1:N (um ETF, muitos registros históricos)

---

## 🎯 **Funcionalidades Suportadas**

### **Rankings** (`/rankings`)
- **Dados Utilizados**: `etf_list` + `calculated_metrics`
- **Ordenações**: Por retorno, volatilidade, Sharpe, dividendos, AUM
- **Filtros**: Por gestora, classe de ativo, tamanho

### **Screener** (`/screener`)
- **Dados Utilizados**: `etf_list` + `calculated_metrics`
- **Filtros Disponíveis**:
  - Performance: retornos 12m, 24m, 36m, 10 anos
  - Risco: volatilidade, max drawdown, Sharpe ratio
  - Fundamentais: expense ratio, AUM, volume
  - Dividendos: dividend yield, pagamentos históricos

### **APIs de Dados** (`/api/data/`)
- **ETF Individual**: Dados completos de um ETF específico
- **Bulk Data**: Múltiplos ETFs com filtros
- **Métricas**: Endpoint dedicado para calculated_metrics

---

## 📈 **Performance e Otimizações**

**Índices Principais:**
- `etf_list.symbol` (Primary Key)
- `calculated_metrics.symbol` (Primary Key + FK)
- `etf_prices(symbol, date)` (Composite Primary Key)
- `etf_dividends(symbol, date)` (Composite Primary Key)

**Consultas Otimizadas:**
- Rankings: ~200-400ms para 4.409 ETFs
- Screener: ~300-500ms com filtros complexos
- ETF Individual: ~50-100ms para dados completos

---

## 🔄 **Atualização de Dados**

**Frequência de Atualização:**
- `etf_prices`: Diária (após fechamento do mercado)
- `etf_dividends`: Conforme pagamentos ocorrem
- `calculated_metrics`: Recalculada semanalmente
- `etf_list`: Mensal (novos ETFs, mudanças de dados)
- `etf_holdings`: Trimestral (quando disponível)

**Scripts de Atualização:**
- `scripts/update_etf_data.ts`: Atualização geral
- `scripts/fetch_etf_historical_prices.js`: Preços históricos
- `scripts/populate_etf_list_from_fmp.js`: Dados mestres

---

## 💾 **Backup e Segurança**

**Backup Automático**: Supabase gerencia backups diários  
**Row Level Security**: Desabilitado (dados públicos)  
**Acesso**: Somente leitura para aplicação web  
**Retenção**: Dados históricos mantidos indefinidamente  

---

*Última atualização: Dezembro 2024 - Versão Simplificada pós-limpeza do banco* 