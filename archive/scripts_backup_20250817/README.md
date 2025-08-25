# 🔧 Scripts Ativos - ETF Curator

Esta pasta contém apenas os scripts ativos e necessários para o funcionamento atual do sistema ETF Curator.

## 📊 **Scripts Ativos**

### 🔄 **Sistema de Manutenção**
- **`database_maintenance.py`** - Sistema automático de manutenção do banco
  - Backups automáticos configuráveis
  - Verificação de qualidade dos dados
  - Limpeza de dados antigos
  - Monitoramento de saúde do sistema
  - Agendamento com schedule

### 📈 **Sistema de Rankings**
- **`populate_rankings.js`** - Popular rankings de ETFs
  - Top returns 12m, sharpe ratio, dividend yield
  - Highest volume, lowest volatility
  - Filtros inteligentes de qualidade
  
- **`update_rankings_cron.js`** - Atualização semanal automática
  - Cron job para rankings
  - Verificação de última atualização
  - Execução apenas quando necessário

### 🔍 **Sistema de Enriquecimento**
- **`enrich_etf_metrics.js`** - Enriquecimento de métricas de ETFs
  - Coleta via APIs (Yahoo Finance, Alpha Vantage, etc.)
  - Cálculo de métricas financeiras
  - Validação de dados
  
- **`advanced_data_enrichment.js`** - Enriquecimento avançado
  - Processamento em lote
  - Rate limiting inteligente
  - Checkpoints de progresso
  
- **`run_enrichment_process.js`** - Interface interativa
  - Menu de opções para enriquecimento
  - Análise de dados faltantes
  - Processo completo automatizado

### 🏗️ **Pipeline Estruturado**
- **`etf-pipeline/`** - Sistema de pipeline modular
  - `main.js` - Orquestrador principal
  - `config.js` - Configurações centralizadas
  - `collectors/` - Coletores de dados
  - `processors/` - Processadores de métricas
  - `database/` - Esquemas e migrations
  - `utils/` - Utilitários e logger

## 🗂️ **Arquivos Históricos Movidos**

Todos os scripts históricos foram organizados em `/archive/scripts_historicos/`:

### 📁 **`/archive/scripts_historicos/pipelines/`**
- Scripts Python de inserção e execução (25+ arquivos)
- Scripts JavaScript de pipeline históricos (8+ arquivos)
- Scripts de análise e processamento já executados

### 📁 **`/archive/scripts_historicos/dados_historicos/`**
- **11.57 MB** de dados históricos JSON
- Resultados de coletas já processadas
- Dados históricos de SPY, QQQ, VTI

### 📁 **`/archive/scripts_historicos/`**
- Scripts de setup e configuração (create_rankings_table.js)
- Documentação e prompts históricos
- Scripts SQL de exemplo

## 🎯 **Uso dos Scripts**

### 🔄 **Manutenção Diária**
```bash
python scripts/database_maintenance.py
```

### 📊 **Atualizar Rankings**
```bash
node scripts/populate_rankings.js
```

### 🔍 **Enriquecer Dados**
```bash
node scripts/run_enrichment_process.js
```

### 🏗️ **Pipeline Completo**
```bash
cd scripts/etf-pipeline
node main.js
```

## ⚙️ **Configuração**

### 📋 **Pré-requisitos**
- Node.js 18+
- Python 3.8+
- Dependências: `npm install` e `pip install -r requirements.txt`

### 🔑 **Variáveis de Ambiente**
```env
# APIs de dados financeiros
ALPHA_VANTAGE_API_KEY=your_key
POLYGON_API_KEY=your_key
FMP_API_KEY=your_key

# Banco de dados
SUPABASE_PROJECT_ID=your_project_id
```

### 📅 **Agendamento Recomendado**
- **Manutenção**: Diária às 02:00
- **Rankings**: Semanal aos domingos
- **Enriquecimento**: Conforme necessidade

## 🚀 **Próximos Passos**

1. **Configurar agendamento** dos scripts de manutenção
2. **Implementar coleta** de expense ratios e inception dates
3. **Criar dashboard** de monitoramento
4. **Automatizar** processo de enriquecimento

---

*Scripts organizados em 30/06/2025 - Projeto ETF Curator*  
*Para scripts históricos, consulte `/archive/scripts_historicos/`* 