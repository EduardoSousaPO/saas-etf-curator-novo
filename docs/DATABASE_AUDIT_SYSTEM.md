# Sistema de Auditoria e Backup Inteligente - ETF Curator

## Visão Geral

Este documento descreve o sistema completo de auditoria, backup e monitoramento de qualidade dos dados implementado no banco de dados ETF Curator.

## 📊 Status Atual do Banco de Dados

### Tabelas Principais
- **etfs_ativos_reais**: 1.370 ETFs líquidos e ativos (tabela principal)
- **etf_rankings**: 29 rankings válidos (após limpeza de órfãos)
- **etf_prices**: 5 registros de preços históricos
- **historic_etfs_dividends**: 3 registros de dividendos históricos
- **etfs_removidos_backup**: 2.110 ETFs removidos por baixa liquidez

### Tabelas de Sistema
- **user_profiles**: 0 usuários (sistema em desenvolvimento)
- **subscriptions**: 0 assinaturas
- **payments**: 0 pagamentos
- **portfolio_***: Tabelas vazias (funcionalidades futuras)

## 🔧 Componentes do Sistema de Auditoria

### 1. Tabelas de Controle

#### `database_audit_log`
Registra todas as operações importantes no banco:
```sql
- id: UUID único
- audit_type: 'backup', 'cleanup', 'maintenance', 'data_quality'
- table_name: Nome da tabela afetada
- operation: 'INSERT', 'UPDATE', 'DELETE', 'BACKUP', 'RESTORE'
- records_affected: Número de registros afetados
- old_values/new_values: Valores antes/depois (JSONB)
- metadata: Dados adicionais (JSONB)
- severity: 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
- message: Descrição da operação
- performed_by: Quem executou
- created_at: Timestamp
```

#### `backup_config`
Configuração de backup para cada tabela:
```sql
- table_name: Nome da tabela
- backup_enabled: Se backup está ativo
- backup_frequency: 'hourly', 'daily', 'weekly', 'monthly'
- retention_days: Dias para manter backups
- backup_conditions: Condições para backup automático (JSONB)
- last_backup_at: Último backup realizado
- is_critical: Se é tabela crítica
```

#### `data_quality_metrics`
Métricas de qualidade dos dados:
```sql
- table_name: Nome da tabela
- metric_name: Nome da métrica
- metric_value: Valor atual
- metric_threshold: Limite aceitável
- status: 'OK', 'WARNING', 'CRITICAL'
- details: Detalhes da métrica (JSONB)
- checked_at: Timestamp da verificação
```

### 2. Funções Automatizadas

#### `create_table_backup(table_name, suffix)`
Cria backup de uma tabela:
- Gera nome único com timestamp
- Cria cópia completa da tabela
- Registra estatísticas no log de auditoria
- Atualiza configuração de backup

#### `run_data_quality_check()`
Executa verificação completa de qualidade:
- Verifica dados faltantes
- Analisa cobertura de dividendos
- Identifica problemas de liquidez
- Registra métricas e alertas

#### `cleanup_old_backups()`
Remove backups antigos automaticamente:
- Baseado na configuração de retenção
- Libera espaço em disco
- Registra operações de limpeza

### 3. Views de Monitoramento

#### `v_database_health_summary`
Resumo de saúde do banco de dados:
- Contadores de registros por tabela
- Estatísticas de qualidade
- Datas de última atualização

#### `v_backup_status`
Status dos backups:
- Última execução de backup
- Status (OK, OVERDUE, NEVER_BACKED_UP)
- Tamanho dos backups
- Configurações ativas

## 🚨 Issues Críticos Identificados

### 1. Dados Faltantes em ETFs (CRÍTICO)
- **Expense Ratio**: 99.20% faltando (1.359 de 1.370 ETFs)
- **Inception Date**: 99.05% faltando (1.357 de 1.370 ETFs)

### 2. Dados Órfãos Removidos
- **ETF Rankings**: 31 rankings órfãos removidos
- Referenciavam ETFs que foram removidos na limpeza de liquidez

## 📋 Configurações de Backup por Tabela

### Tabelas Críticas (Backup Diário/Horário)
```
etfs_ativos_reais: daily, 90 dias retenção
user_profiles: daily, 365 dias retenção  
subscriptions: hourly, 365 dias retenção
payments: hourly, 2555 dias retenção (7 anos compliance)
etf_rankings: daily, 30 dias retenção
```

### Tabelas Secundárias (Backup Semanal)
```
etf_prices: daily, 365 dias retenção
historic_etfs_dividends: weekly, 365 dias retenção
portfolio_*: weekly/daily, 90-180 dias retenção
```

## 🔍 Métricas de Qualidade Monitoradas

### ETFs Ativos Reais
1. **missing_expense_ratio_percentage**: < 5% aceitável
2. **missing_inception_date_percentage**: < 10% aceitável  
3. **dividend_coverage_percentage**: > 70% desejável
4. **low_liquidity_percentage**: < 5% aceitável

### Thresholds de Alerta
- **OK**: Dentro dos parâmetros normais
- **WARNING**: Próximo ao limite, requer atenção
- **CRITICAL**: Fora dos limites, ação imediata necessária

## 🛠️ Comandos de Manutenção

### Backup Manual
```sql
SELECT create_table_backup('etfs_ativos_reais', 'manual_backup');
```

### Verificação de Qualidade
```sql
SELECT run_data_quality_check();
```

### Limpeza de Backups
```sql
SELECT cleanup_old_backups();
```

### Status do Sistema
```sql
SELECT * FROM v_backup_status;
SELECT * FROM v_database_health_summary;
```

### Ver Issues Atuais
```sql
SELECT * FROM data_quality_metrics 
WHERE status IN ('CRITICAL', 'WARNING')
ORDER BY status DESC;
```

## 📈 Próximos Passos Recomendados

### 1. Correção de Dados Faltantes
- Implementar pipeline para coletar expense ratios
- Buscar inception dates via APIs financeiras
- Priorizar ETFs com maior volume/AUM

### 2. Automação
- Configurar triggers para backup automático
- Implementar alertas por email para issues críticos
- Criar dashboard de monitoramento

### 3. Expansão do Sistema
- Adicionar métricas de performance
- Implementar versionamento de dados
- Criar sistema de rollback automático

## 🔐 Segurança e Compliance

### Retenção de Dados
- **Pagamentos**: 7 anos (compliance financeiro)
- **Dados de usuários**: 1 ano (LGPD)
- **Dados de mercado**: 1 ano (análises históricas)
- **Logs de auditoria**: 90 dias

### Backup e Recuperação
- Backups automáticos baseados em criticidade
- Teste de recuperação mensal recomendado
- Armazenamento redundante para tabelas críticas

## 📞 Suporte e Manutenção

Para questões sobre o sistema de auditoria:
1. Consultar logs em `database_audit_log`
2. Verificar métricas em `data_quality_metrics`
3. Usar views de monitoramento para status geral
4. Executar funções de manutenção conforme necessário

---
*Documentação gerada em: {{ current_date }}*
*Versão do sistema: 1.0*
*Última auditoria: {{ last_audit_date }}* 