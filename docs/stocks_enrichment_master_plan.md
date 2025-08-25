# 📈 PLANO MASTER: ENRIQUECIMENTO COMPLETO DE MÉTRICAS - STOCKS_UNIFIED

## 🎯 OBJETIVO
Completar todas as métricas financeiras para as 1.385 ações na tabela `stocks_unified`, transformando-a em uma base de dados de classe institucional.

## 📊 SITUAÇÃO ATUAL (ANÁLISE DETALHADA)

### ✅ **MÉTRICAS COM BOA COMPLETUDE (>97%)**
- `returns_12m`: 97.69% completo (32 faltantes)
- `volatility_12m`: 97.69% completo (32 faltantes) 
- `max_drawdown`: 97.69% completo (32 faltantes)
- `sharpe_12m`: 97.69% completo (32 faltantes)
- `dividend_yield_12m`: 97.47% completo (35 faltantes)
- `beta_coefficient`: 96.53% completo (48 faltantes)

### ⚠️ **MÉTRICAS CRÍTICAS FALTANTES (>99%)**
- `returns_24m`: 99.57% faltante (1.379 ações)
- `returns_36m`: 99.57% faltante (1.379 ações)
- `returns_5y`: 99.57% faltante (1.379 ações)
- `ten_year_return`: 99.93% faltante (1.384 ações)
- `volatility_24m`: 99.57% faltante (1.379 ações)
- `volatility_36m`: 99.57% faltante (1.379 ações)
- `ten_year_volatility`: 100% faltante (1.385 ações)
- `sharpe_24m`: 99.57% faltante (1.379 ações)
- `sharpe_36m`: 99.57% faltante (1.379 ações)
- `ten_year_sharpe`: 100% faltante (1.385 ações)

## 🚀 ESTRATÉGIA DE ENRIQUECIMENTO

### **FASE 1: PREPARAÇÃO E INFRAESTRUTURA**
1. **Criar Sistema de Pipeline Robusto**
   - Sistema de batches com controle de rate limiting
   - Retry automático com backoff exponencial
   - Logging detalhado e auditoria completa
   - Checkpoint system para recuperação de falhas

2. **Configurar Fontes de Dados**
   - **yfinance**: Dados históricos e métricas calculadas
   - **Perplexity AI**: Validação e análises qualitativas
   - **Backup Sources**: Alpha Vantage, Yahoo Finance diretamente

### **FASE 2: DESENVOLVIMENTO DO PIPELINE**

#### **2.1 Módulo yfinance (Fonte Primária)**
```python
# Estrutura do pipeline
class StockMetricsEnricher:
    def fetch_historical_data(self, ticker, periods=['1y', '2y', '3y', '5y', '10y']):
        # Buscar dados históricos completos
        
    def calculate_returns(self, prices, periods):
        # Calcular returns para todos os períodos
        
    def calculate_volatility(self, prices, periods):
        # Calcular volatilidade anualizada
        
    def calculate_sharpe_ratio(self, returns, volatility, risk_free_rate=0.02):
        # Calcular Sharpe ratio para todos os períodos
        
    def calculate_max_drawdown(self, prices):
        # Calcular maximum drawdown
        
    def calculate_beta(self, stock_prices, market_prices):
        # Calcular beta vs S&P 500
```

#### **2.2 Módulo Perplexity AI (Validação e Análise)**
```python
class PerplexityValidator:
    def validate_metrics(self, ticker, calculated_metrics):
        # Validar métricas calculadas via IA
        
    def get_qualitative_analysis(self, ticker):
        # Buscar análises qualitativas e contexto
```

### **FASE 3: IMPLEMENTAÇÃO POR LOTES**

#### **3.1 Estratégia de Lotes**
- **Lote Teste**: 50 ações (validação completa)
- **Lotes Principais**: 100 ações por lote
- **Total**: 14 lotes de 100 + 1 lote de 85 ações
- **Frequência**: 1 lote por hora (rate limiting)

#### **3.2 Priorização**
1. **Prioridade ALTA**: Ações com `market_cap` > $1B
2. **Prioridade MÉDIA**: Ações com `market_cap` > $100M
3. **Prioridade BAIXA**: Demais ações

### **FASE 4: MÉTRICAS A SEREM CALCULADAS**

#### **4.1 Métricas de Performance**
- `returns_12m`: Retorno 12 meses
- `returns_24m`: Retorno 24 meses  
- `returns_36m`: Retorno 36 meses
- `returns_5y`: Retorno 5 anos
- `ten_year_return`: Retorno 10 anos

#### **4.2 Métricas de Risco**
- `volatility_12m`, `volatility_24m`, `volatility_36m`, `ten_year_volatility`
- `max_drawdown`: Máximo drawdown histórico
- `sharpe_12m`, `sharpe_24m`, `sharpe_36m`, `ten_year_sharpe`
- `beta_coefficient`: Beta vs S&P 500

#### **4.3 Métricas de Dividendos**
- `dividend_yield_12m`: Yield atual
- `dividends_12m`, `dividends_24m`, `dividends_36m`: Dividendos pagos
- `dividends_all_time`: Histórico completo de dividendos

## 🛠️ IMPLEMENTAÇÃO TÉCNICA

### **ARQUITETURA DO SISTEMA**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Scheduler     │───▶│   Data Pipeline   │───▶│   Database      │
│   (Cron Jobs)   │    │   (Python/Node)   │    │   (Supabase)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   External APIs   │
                    │   yfinance        │
                    │   Perplexity AI   │
                    └──────────────────┘
```

### **COMPONENTES PRINCIPAIS**

#### **1. API de Enriquecimento**
```typescript
// /api/stocks/enrichment/batch-process.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { batchSize = 100, priority = 'high' } = req.body;
  
  // Processar lote de ações
  const result = await processStockBatch(batchSize, priority);
  
  return res.json({
    success: true,
    processed: result.processed,
    failed: result.failed,
    metrics_updated: result.metrics
  });
}
```

#### **2. Worker de Processamento**
```python
# scripts/stock_enrichment_worker.py
import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

class StockEnrichmentWorker:
    def __init__(self):
        self.supabase = create_client(url, key)
        self.perplexity = PerplexityClient()
        
    def process_stock(self, ticker):
        try:
            # 1. Buscar dados históricos (10 anos)
            stock = yf.Ticker(ticker)
            hist = stock.history(period="10y", interval="1d")
            
            # 2. Calcular todas as métricas
            metrics = self.calculate_all_metrics(hist)
            
            # 3. Validar via Perplexity (opcional)
            if self.should_validate(ticker):
                validation = self.perplexity.validate_metrics(ticker, metrics)
                metrics['validation_meta'] = validation
            
            # 4. Salvar no banco
            self.save_metrics(ticker, metrics)
            
            return {'success': True, 'ticker': ticker, 'metrics': len(metrics)}
            
        except Exception as e:
            return {'success': False, 'ticker': ticker, 'error': str(e)}
```

### **CRONOGRAMA DE EXECUÇÃO**

#### **SEMANA 1: DESENVOLVIMENTO**
- **Dia 1-2**: Criar pipeline base e testes
- **Dia 3-4**: Implementar cálculos de métricas
- **Dia 5-6**: Integrar Perplexity AI
- **Dia 7**: Testes completos com lote piloto

#### **SEMANA 2-3: EXECUÇÃO PRINCIPAL**
- **Processamento**: 1 lote/hora, 24h/dia
- **Monitoramento**: Logs em tempo real
- **Ajustes**: Otimizações conforme necessário

#### **SEMANA 4: FINALIZAÇÃO**
- **Validação**: Verificar completude dos dados
- **Correções**: Reprocessar ações com falhas
- **Documentação**: Relatório final

## 📈 MÉTRICAS DE SUCESSO

### **TARGETS DE COMPLETUDE**
- **Métricas 12m**: 99.5%+ (atualmente 97.7%)
- **Métricas 24m**: 95%+ (atualmente 0.4%)
- **Métricas 36m**: 90%+ (atualmente 0.4%)
- **Métricas 5y**: 85%+ (atualmente 0.4%)
- **Métricas 10y**: 70%+ (atualmente 0.1%)

### **QUALIDADE DOS DADOS**
- **Validação Rate**: >95% dos dados validados
- **Error Rate**: <5% de falhas por lote
- **Consistency**: Métricas consistentes entre períodos

## 🔧 FERRAMENTAS E TECNOLOGIAS

### **PRINCIPAIS**
- **yfinance**: Biblioteca Python para dados Yahoo Finance
- **pandas/numpy**: Processamento e cálculos
- **Perplexity AI**: Validação e análises qualitativas
- **Supabase**: Armazenamento e queries
- **Node.js/Python**: APIs e workers

### **MONITORAMENTO**
- **Logs estruturados**: JSON com timestamp, ticker, status
- **Dashboard**: Progresso em tempo real
- **Alertas**: Notificações para falhas críticas

## 💰 ESTIMATIVA DE CUSTOS

### **APIs EXTERNAS**
- **yfinance**: Gratuito (rate limited)
- **Perplexity AI**: ~$50-100 (validações seletivas)
- **Backup APIs**: ~$100-200 (se necessário)

### **INFRAESTRUTURA**
- **Processamento**: Computação local/cloud
- **Armazenamento**: Supabase (atual)
- **Total Estimado**: <$300

## 🎯 RESULTADO ESPERADO

### **BASE DE DADOS TRANSFORMADA**
- **1.385 ações** com métricas completas
- **20+ métricas financeiras** por ação
- **Dados históricos** de até 10 anos
- **Qualidade institucional** comparável a Bloomberg/Refinitiv

### **CAPACIDADES HABILITADAS**
- **Screeners avançados** com filtros sofisticados
- **Rankings dinâmicos** por múltiplas métricas
- **Análise de risco** profissional
- **Portfolio optimization** científica
- **IA vertical** para análise de ações

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar estrutura do pipeline** (APIs + Workers)
2. **Implementar cálculos de métricas** com yfinance
3. **Testar com lote piloto** de 50 ações
4. **Executar enriquecimento completo** em lotes
5. **Validar e documentar resultados** finais

**PRAZO TOTAL**: 4 semanas
**INÍCIO IMEDIATO**: Desenvolvimento do pipeline base



