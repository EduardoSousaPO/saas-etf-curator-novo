# PLANO DE ENRIQUECIMENTO DE DADOS – TABELA ETFS

## 1. Objetivo
Enriquecer a tabela `etfs` do banco Supabase com dados confiáveis, completos e auditáveis, utilizando múltiplas fontes (FMP, yfinance, scraping) e validação cruzada.

---

## 2. Classificação das Colunas

### **Métricas Estáticas (diretas da API)**
- symbol
- name
- description
- category
- exchange
- inception_date
- expense_ratio
- total_assets
- volume
- pe_ratio
- pb_ratio
- beta
- holdings

### **Métricas Derivadas (calculadas a partir de histórico)**
- returns_12m
- returns_24m
- returns_36m
- returns_5y
- ten_year_return
- volatility_12m
- volatility_24m
- volatility_36m
- ten_year_volatility
- sharpe_12m
- sharpe_24m
- sharpe_36m
- ten_year_sharpe
- max_drawdown
- dividends_12m
- dividends_24m
- dividends_36m
- dividends_all_time
- dividend_yield (se não fornecido direto)

---

## 3. Pipeline de Enriquecimento

### **Etapa 1: Buscar e preencher métricas estáticas**
- Usar API da FMP como fonte principal.
- Complementar com yfinance e scraping (MCP Firecrawl) para campos faltantes.

### **Etapa 2: Buscar histórico de preços e dividendos (últimos 10 anos, até 01/06/2025)**
- Coletar séries históricas de preços ajustados e dividendos.

### **Etapa 3: Calcular métricas derivadas**
- Retornos, volatilidade, sharpe, drawdown, dividendos por período, etc.

### **Etapa 4: Validação cruzada**
- Conferir valores críticos entre FMP, yfinance e scraping.
- Se divergência relevante, logar para revisão manual.
- Registrar fonte dos dados.

---

## 4. Boas Práticas
- Atualizar dados periodicamente.
- Logar divergências e fontes.
- Documentar regras de decisão e cálculo.
- Permitir auditoria e rastreabilidade dos dados.

---

## 5. Observações
- As colunas **id, symbol, name, description, category, exchange** nunca devem ser sobrescritas em limpezas automáticas.
- As demais colunas podem ser limpas ou recalculadas conforme o pipeline.

---

## 6. Sugestão para Contexto no Projeto
- Este arquivo pode ser referenciado em regras do Cursor, README, ou scripts de automação.
- Para garantir contexto em análises futuras, mantenha este planejamento versionado e atualizado.
- Se o Cursor permitir, adicione um link ou referência a este arquivo nas configurações de rules/context. 