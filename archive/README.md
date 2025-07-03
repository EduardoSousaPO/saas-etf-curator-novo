# 📁 Arquivo do Projeto ETF Curator

Este diretório contém todos os arquivos históricos do projeto ETF Curator que foram utilizados durante o desenvolvimento e execução dos pipelines de dividendos.

## 📊 Resumo da Limpeza

**Data da Organização**: 30 de junho de 2025  
**Arquivos Organizados**: 375 arquivos  
**Status**: Todos os pipelines foram executados com sucesso ✅

### 📈 Estatísticas Finais do Banco
- **ETFs no banco**: 1.370 (após limpeza de liquidez)
- **Cobertura de dividendos**: 77.37% (1.060 ETFs)
- **Batches executados**: 157 batches MCP + 137 batches SQL
- **Volume médio**: 2.5M por dia
- **AUM médio**: $9.2B

## 🗂️ Estrutura do Arquivo

### `/executed_batches/`
Contém todos os scripts SQL de atualização de dividendos que foram executados com sucesso.

#### `/executed_batches/sql_batches/`
- **batch_001_update.sql** até **batch_137_update.sql** (137 arquivos)
- **dividends_complete_update.sql** e variações
- **mega_batch_next_10.sql**
- Scripts SQL de atualização em lote dos dividendos

#### `/executed_batches/mcp_batches/`  
- **mcp_batch_050.sql** até **mcp_batch_157.sql** (108 arquivos)
- Batches executados via MCP Supabase
- Continuação dos batches SQL tradicionais

#### `/executed_batches/execute_all_mcp_batches.txt`
Log histórico da execução de todos os batches MCP

### `/legacy_scripts/`
Scripts Python e utilitários que cumpriram seu propósito.

#### `/legacy_scripts/dividend_pipelines/`
Scripts relacionados ao pipeline de dividendos:
- **dividends_pipeline_production.py** - Pipeline principal de produção
- **update_dividends_*.py** - Várias versões de scripts de atualização
- **batch_execute_dividends.py** - Executor de batches
- **check_dividends.py** - Verificador de dividendos

#### `/legacy_scripts/utilities/`
Scripts utilitários e de teste:
- **execute_all_*.py** - Scripts de execução em massa
- **test_connection*.py** - Testes de conexão
- **generate_complete_sql.py** - Gerador de SQL
- **cleanup_project.py** - Script de limpeza
- **test_insert_query.sql** - Queries de teste

### `/logs/`
Logs históricos de execução dos pipelines e operações.

#### Logs de Pipeline:
- **complete_mcp_pipeline_*.log** - Logs do pipeline MCP completo
- **dividends_pipeline_full.log** - Log completo do pipeline de dividendos
- **dividends_production.log** - Log de produção dos dividendos

#### Logs de Inserção:
- **insert_all_etfs_*.log** - Logs de inserção de ETFs
- **execute_all_batches_*.log** - Logs de execução de batches
- **mass_insert_all_etfs_*.log** - Logs de inserção em massa

### `/reports/`
Relatórios e checkpoints gerados durante a execução dos pipelines.

#### Relatórios de Pipeline:
- **complete_pipeline_results_v2_*.json** - Resultados completos do pipeline
- **dividends_pipeline_*.json** - Relatórios do pipeline de dividendos

#### Checkpoints de Dividendos:
- **dividends_checkpoint_*.json** - Checkpoints periódicos do processo
- **dividends_update_report_*.json** - Relatórios de atualização
- **dividends_*_summary_*.txt** - Resumos textuais das operações

### `/data_sources/`
Dados originais e arquivos de importação utilizados no projeto.

#### Dados Originais:
- **etfs_eua_original.xlsx** - Planilha original dos ETFs americanos
- **etfs_import_*.csv** - Arquivos CSV de importação gerados

## 🎯 Contexto Histórico

### Fases do Projeto

1. **Fase 1 - Batches SQL Tradicionais** (batch_001 - batch_137)
   - Execução via scripts Python com psycopg2
   - 137 batches executados com sucesso
   - Cobertura inicial de dividendos

2. **Fase 2 - Migração para MCP** (mcp_batch_050 - mcp_batch_157)  
   - Migração para MCP Supabase
   - 108 batches adicionais
   - Melhoria na cobertura de dividendos

3. **Fase 3 - Limpeza e Auditoria**
   - Remoção de 2.110 ETFs com baixa liquidez
   - Sistema de backup e auditoria implementado
   - Organização do projeto

### Resultados Alcançados

✅ **Pipeline de dividendos concluído**  
✅ **1.370 ETFs líquidos no banco**  
✅ **77.37% de cobertura de dividendos**  
✅ **Sistema de auditoria implementado**  
✅ **Projeto organizado e limpo**

## 🔧 Scripts Ativos

Os seguintes scripts permanecem ativos no projeto:

- `scripts/database_maintenance.py` - Sistema de manutenção automática
- `database_config.json` - Configurações do sistema
- `docs/DATABASE_AUDIT_SYSTEM.md` - Documentação do sistema

## 📝 Notas Importantes

- **Todos os arquivos neste diretório são históricos** e não devem ser modificados
- **Os batches já foram executados** e os dados estão no banco
- **Não execute novamente** os scripts de dividendos sem necessidade
- **Para manutenção**, use o sistema implementado em `scripts/database_maintenance.py`

## 🚀 Próximos Passos

1. **Implementar coleta de expense ratios** para resolver issue crítico
2. **Buscar inception dates** via APIs financeiras
3. **Configurar alertas automáticos** para o sistema de auditoria
4. **Criar dashboard de monitoramento** do banco de dados

---
*Arquivo criado automaticamente durante a limpeza do projeto ETF Curator*  
*Para questões sobre o histórico, consulte os logs de auditoria no banco de dados* 