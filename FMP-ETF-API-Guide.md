# Guia Prático: APIs FMP para Encontrar e Extrair Dados de ETFs

> **Fonte:** [Documentação Oficial FMP - API Reference](https://site.financialmodelingprep.com/developer/docs/stable)

---

## Sumário
- [Introdução](#introdução)
- [Como usar a API FMP](#como-usar-a-api-fmp)
- [1. Buscar e Listar ETFs](#1-buscar-e-listar-etfs)
- [2. Informações Detalhadas de ETFs](#2-informações-detalhadas-de-etfs)
- [3. Holdings e Composição](#3-holdings-e-composição)
- [4. Exposição Setorial e Geográfica](#4-exposição-setorial-e-geográfica)
- [5. Cotações e Métricas](#5-cotações-e-métricas)
- [6. Endpoints em Lote (Bulk)](#6-endpoints-em-lote-bulk)
- [7. Exemplos de Uso](#7-exemplos-de-uso)
- [8. Dicas e Boas Práticas](#8-dicas-e-boas-práticas)
- [9. Links Úteis](#9-links-úteis)

---

## Introdução
A Financial Modeling Prep (FMP) oferece uma API robusta para consulta de dados de ETFs: símbolos, perfis, holdings, exposições, métricas, cotações, histórico e muito mais. Este guia mostra como encontrar e extrair informações de ETFs usando os principais endpoints, com exemplos práticos e dicas para uso eficiente.

## Como usar a API FMP
- **Todas as requisições exigem sua API Key:**
  - Adicione `?apikey=YOUR_API_KEY` ao final da URL (ou `&apikey=...` se já houver parâmetros).
- **Base URL:**
  - `https://financialmodelingprep.com/stable/`

---

## 1. Buscar e Listar ETFs

### Listar todos os ETFs disponíveis
- **Endpoint:** `/etf-list`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/etf-list?apikey=YOUR_API_KEY
  ```
- **Resposta:**
  ```json
  [
    { "symbol": "SPY", "name": "SPDR S&P 500 ETF Trust" },
    ...
  ]
  ```

### Buscar ETF por nome ou símbolo
- **Endpoint:** `/search-symbol?query=...`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/search-symbol?query=SPY&apikey=YOUR_API_KEY
  ```
- **Resposta:**
  ```json
  [
    { "symbol": "SPY", "name": "SPDR S&P 500 ETF Trust", ... }
  ]
  ```

---

## 2. Informações Detalhadas de ETFs

### Informações gerais do ETF
- **Endpoint:** `/etf/info?symbol=SYMBOL`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/etf/info?symbol=SPY&apikey=YOUR_API_KEY
  ```
- **Campos comuns:** nome, categoria, gestora, AUM (total assets), data de criação, expense ratio, etc.
- **Resposta:**
  ```json
  [
    {
      "symbol": "SPY",
      "name": "SPDR S&P 500 ETF Trust",
      "aum": 400000000000,
      "expenseRatio": 0.09,
      ...
    }
  ]
  ```

### Cotações e preço em tempo real
- **Endpoint:** `/batch-etf-quotes`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/batch-etf-quotes?symbols=SPY,IVV,VOO&apikey=YOUR_API_KEY
  ```
- **Resposta:**
  ```json
  [
    { "symbol": "SPY", "price": 500.12, ... },
    ...
  ]
  ```

---

## 3. Holdings e Composição

### Listar holdings do ETF
- **Endpoint:** `/etf/holdings?symbol=SYMBOL`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/etf/holdings?symbol=SPY&apikey=YOUR_API_KEY
  ```
- **Resposta:**
  ```json
  [
    { "asset": "AAPL", "weight": 7.2, ... },
    ...
  ]
  ```

### Datas de atualização das holdings
- **Endpoint:** `/etf/holdings-dates?symbol=SYMBOL`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/etf/holdings-dates?symbol=SPY&apikey=YOUR_API_KEY
  ```

---

## 4. Exposição Setorial e Geográfica

### Exposição por setor
- **Endpoint:** `/etf/sector-weightings?symbol=SYMBOL`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/etf/sector-weightings?symbol=SPY&apikey=YOUR_API_KEY
  ```
- **Resposta:**
  ```json
  [
    { "sector": "Technology", "weight": 28.5 }, ...
  ]
  ```

### Exposição por país
- **Endpoint:** `/etf/country-weightings?symbol=SYMBOL`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/etf/country-weightings?symbol=SPY&apikey=YOUR_API_KEY
  ```
- **Resposta:**
  ```json
  [
    { "country": "United States", "weight": 95.2 }, ...
  ]
  ```

---

## 5. Cotações e Métricas

### Cotações em tempo real
- **Endpoint:** `/batch-etf-quotes?symbols=...`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/batch-etf-quotes?symbols=SPY,IVV,VOO&apikey=YOUR_API_KEY
  ```

### Métricas financeiras e key metrics
- **Endpoint:** `/key-metrics?symbol=SYMBOL`
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/key-metrics?symbol=SPY&apikey=YOUR_API_KEY
  ```
- **Campos:** dividend yield, P/E, beta, sharpe, etc.

---

## 6. Endpoints em Lote (Bulk)

- **Profile Bulk:** `/profile-bulk?part=0` — Perfis de várias empresas/ETFs.
- **ETF Holder Bulk:** `/etf-holder-bulk?part=1` — Holdings de vários ETFs.
- **Key Metrics TTM Bulk:** `/key-metrics-ttm-bulk` — Métricas de vários ativos.
- **Exemplo:**
  ```http
  GET https://financialmodelingprep.com/stable/profile-bulk?part=0&apikey=YOUR_API_KEY
  ```

---

## 7. Exemplos de Uso

### Buscar todos os ETFs e extrair informações detalhadas
```bash
# 1. Listar todos os ETFs
curl "https://financialmodelingprep.com/stable/etf-list?apikey=YOUR_API_KEY"

# 2. Buscar informações detalhadas de um ETF
curl "https://financialmodelingprep.com/stable/etf/info?symbol=SPY&apikey=YOUR_API_KEY"

# 3. Listar holdings
curl "https://financialmodelingprep.com/stable/etf/holdings?symbol=SPY&apikey=YOUR_API_KEY"

# 4. Exposição setorial
curl "https://financialmodelingprep.com/stable/etf/sector-weightings?symbol=SPY&apikey=YOUR_API_KEY"
```

### Exemplo de resposta (holdings):
```json
[
  { "asset": "AAPL", "weight": 7.2 },
  { "asset": "MSFT", "weight": 6.5 },
  ...
]
```

---

## 8. Dicas e Boas Práticas
- Sempre consulte a [documentação oficial](https://site.financialmodelingprep.com/developer/docs/stable) para detalhes e atualizações.
- Use endpoints em lote para grandes volumes de dados.
- Combine filtros (ex: `isEtf=true` no screener) para refinar buscas.
- Respeite os limites de requisição da sua API Key.
- Teste as URLs no navegador ou com ferramentas como Postman/cURL.

---

## 9. Links Úteis
- [Documentação Oficial FMP](https://site.financialmodelingprep.com/developer/docs/stable)
- [Lista de Endpoints para ETFs](https://site.financialmodelingprep.com/developer/docs/stable#etf-and-mutual-funds)
- [Exemplos de Resposta](https://site.financialmodelingprep.com/developer/docs/stable/etf-list)

---

*Guia gerado automaticamente a partir da documentação oficial FMP (2025). Última atualização: junho/2025.* 