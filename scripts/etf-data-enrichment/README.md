# 🚀 ETF Data Enrichment Pipeline

Pipeline automatizado para enriquecimento de dados de ETFs usando APIs gratuitas e web scraping.

## 📋 **Visão Geral**

Este pipeline enriquece a base de dados de ETFs com informações adicionais obtidas de múltiplas fontes gratuitas:

- **Yahoo Finance** (via yfinance Python)
- **Alpha Vantage** (API gratuita)
- **Financial Modeling Prep** (API gratuita)
- **Cálculos próprios** de métricas de risco

## 🎯 **Campos Enriquecidos**

### Dados Básicos
- Holdings count (número de ativos)
- Beta 12m
- Tracking error
- Morningstar rating
- Sustainability rating

### Métricas de Performance
- Volatilidade calculada
- Sharpe ratio calculado
- Maximum drawdown
- VaR (Value at Risk) 5%
- Retorno anualizado

### Dados Financeiros
- P/E Ratio
- Price-to-Sales Ratio
- Price-to-Book Ratio
- Dividend Yield
- Market Cap
- Enterprise Value

## 🛠️ **Configuração**

### 1. Dependências

```bash
# Node.js packages
npm install @supabase/supabase-js axios

# Python packages
pip install yfinance pandas numpy
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# APIs gratuitas (opcionais)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FMP_API_KEY=your_fmp_key
```

### 3. APIs Gratuitas

#### Alpha Vantage
- **Site**: https://www.alphavantage.co/
- **Limite**: 5 calls/minuto, 500 calls/dia
- **Dados**: Fundamentals, ratios financeiros

#### Financial Modeling Prep
- **Site**: https://financialmodelingprep.com/
- **Limite**: 250 calls/dia (gratuito)
- **Dados**: Profile, métricas, ratios

## 🚀 **Uso**

### Execução Básica

```bash
# Processar 100 ETFs em lotes de 10
node enrichment-pipeline.js

# Personalizar lote e quantidade
node enrichment-pipeline.js 20 200
```

### Parâmetros

1. **Batch Size** (padrão: 10)
   - Número de ETFs processados simultaneamente
   - Recomendado: 5-15 para respeitar rate limits

2. **Max ETFs** (padrão: 100)
   - Número máximo de ETFs para processar
   - Use valores menores para testes

### Exemplo de Execução

```bash
# Teste com poucos ETFs
node enrichment-pipeline.js 5 20

# Produção (respeitando limits)
node enrichment-pipeline.js 10 500
```

## 📊 **Monitoramento**

### Logs em Tempo Real

O pipeline exibe logs detalhados:

```
🚀 Iniciando Pipeline de Enriquecimento de ETFs
📊 Processando até 100 ETFs em lotes de 10
📋 Encontrados 85 ETFs para enriquecimento

🔄 Processando lote 1/9
🔄 Processando SPY...
✅ SPY enriquecido com 8 campos
🔄 Processando QQQ...
⚠️ Yahoo Finance falhou para QQQ: timeout
✅ QQQ enriquecido com 5 campos
```

### Arquivo de Log

Cada execução gera um log JSON:

```json
{
  "symbol": "SPY",
  "status": "success",
  "fields_updated": 8,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## 🔧 **Estratégia de Rate Limits**

### Delays Implementados
- **30 segundos** entre lotes
- **Retry logic** para APIs temporariamente indisponíveis
- **Fallback** entre diferentes fontes de dados

### Recomendações
- Execute durante madrugada para menor concorrência
- Use batch sizes pequenos (5-10) para APIs gratuitas
- Monitor logs para identificar rate limits atingidos

## 📈 **Métricas de Sucesso**

### Completude Atual (Base ETF Curator)
- **Total ETFs**: 1.370
- **Expense Ratio**: 68% completo
- **Holdings Count**: 0.8% completo ⚠️
- **Beta**: 0% completo ⚠️
- **Tracking Error**: 0% completo ⚠️
- **Morningstar Rating**: 10% completo ⚠️

### Meta Pós-Pipeline
- **Holdings Count**: 80%+ completo
- **Beta**: 70%+ completo
- **Tracking Error**: 60%+ completo
- **Morningstar Rating**: 40%+ completo

## 🛡️ **Tratamento de Erros**

### Erros Comuns

1. **Rate Limit Exceeded**
   ```
   ⚠️ Rate limit Alpha Vantage para SPY
   ```
   **Solução**: Aguardar ou usar outra fonte

2. **Python/yfinance Error**
   ```
   ❌ Python script falhou: ModuleNotFoundError
   ```
   **Solução**: `pip install yfinance`

3. **Supabase Connection Error**
   ```
   ❌ Variáveis de ambiente do Supabase não configuradas
   ```
   **Solução**: Verificar `.env`

### Recovery Automático
- Pipeline continua mesmo com erros individuais
- Dados parciais são salvos
- Log completo de sucessos/falhas

## 📋 **Cronograma Recomendado**

### Execução Diária
```bash
# Cron job para execução automática
0 2 * * * cd /path/to/scripts && node enrichment-pipeline.js 10 100
```

### Execução Semanal (Completa)
```bash
# Sábados às 3h - processar todos os ETFs
0 3 * * 6 cd /path/to/scripts && node enrichment-pipeline.js 5 1500
```

## 🔍 **Validação de Dados**

### Queries de Verificação

```sql
-- Verificar completude após pipeline
SELECT 
  COUNT(*) as total,
  COUNT(beta_12m) as has_beta,
  COUNT(holdingscount) as has_holdings,
  COUNT(tracking_error) as has_tracking_error,
  ROUND(COUNT(beta_12m)::numeric / COUNT(*) * 100, 1) as beta_completion_pct
FROM etfs_ativos_reais;

-- ETFs enriquecidos hoje
SELECT symbol, last_enrichment_date, enrichment_status
FROM etfs_ativos_reais 
WHERE last_enrichment_date::date = CURRENT_DATE
ORDER BY last_enrichment_date DESC;
```

## 🚨 **Troubleshooting**

### Pipeline Não Inicia
1. Verificar Node.js instalado (`node --version`)
2. Verificar Python instalado (`python --version`)
3. Verificar variáveis de ambiente
4. Verificar conexão com Supabase

### Poucos Dados Coletados
1. Verificar rate limits das APIs
2. Verificar chaves de API válidas
3. Verificar símbolos de ETF corretos
4. Verificar conexão de rede

### Performance Lenta
1. Reduzir batch size
2. Aumentar delays entre lotes
3. Executar em horários de menor tráfego
4. Usar apenas APIs mais rápidas

## 📚 **Próximos Passos**

1. **Adicionar mais fontes**:
   - Scraping de ETF.com
   - Scraping de Morningstar
   - API do Federal Reserve (FRED)

2. **Melhorar métricas**:
   - Correlação entre ETFs
   - Análise de holdings overlap
   - ESG scores

3. **Automação**:
   - Deploy em servidor
   - Monitoramento via alertas
   - Dashboard de status

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Verificar logs de execução
2. Consultar seção de troubleshooting
3. Verificar documentação das APIs
4. Testar com batch size menor

---

**Criado por**: ETF Curator Team  
**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0 