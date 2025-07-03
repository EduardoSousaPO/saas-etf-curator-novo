# 🚀 ETF Curator - Atualização de Dividendos via PostgreSQL

## 📋 OPÇÃO 3: PYTHON + PSYCOPG2

Este script conecta diretamente ao banco PostgreSQL do Supabase e executa todas as atualizações de dividendos de forma eficiente.

## 🔧 PRÉ-REQUISITOS

### ✅ Já Instalado:
- ✅ Python 3.x
- ✅ psycopg2-binary (instalado automaticamente)
- ✅ Arquivo de dados: `dividends_production_complete_20250627_011735.json`

### 🔑 Informações Necessárias:

**Configuração do Banco (já configurada no script):**
- **Host:** aws-0-us-west-1.pooler.supabase.com
- **Port:** 6543
- **Database:** postgres
- **User:** postgres.nniabnjuwzeqmflrruga
- **Password:** [Será solicitada durante execução]

## 🚀 COMO EXECUTAR

### 1. Execute o Script:
```bash
python update_dividends_psycopg2.py
```

### 2. Digite a Senha:
O script solicitará a senha do banco Supabase. Esta é a senha que você usa para acessar o dashboard do Supabase.

### 3. Confirme a Execução:
O script mostrará quantos ETFs serão atualizados e pedirá confirmação:
```
⚠️ ATENÇÃO: Você está prestes a atualizar 3121 ETFs no banco de produção!
Esta operação irá modificar dados reais no Supabase.

Deseja continuar? (s/N):
```

Digite `s` para continuar.

## 📊 O QUE O SCRIPT FAZ

### 🔄 Processo de Atualização:
1. **Carrega** os dados de dividendos do arquivo JSON
2. **Conecta** diretamente ao PostgreSQL do Supabase
3. **Desabilita** triggers temporariamente para melhor performance
4. **Processa** em batches de 100 ETFs por vez
5. **Executa** queries UPDATE otimizadas
6. **Mostra** progresso em tempo real
7. **Reabilita** triggers após conclusão
8. **Verifica** resultados finais
9. **Salva** relatório detalhado

### 📈 Monitoramento em Tempo Real:
```
[1/32] Processando batch com 100 ETFs...
    ✅ 100 ETFs atualizados: IVVW: $2.5720, MZZ: $0.5310, FLOW: $0.2360 ... e mais 97 ETFs
    ⏱️ Batch concluído em 0.8s

CHECKPOINT: 31.3% concluído
           1000 ETFs atualizados
           0.5 minutos decorridos
           33.3 ETFs/segundo
```

## 🎯 RESULTADOS ESPERADOS

### ✅ Sucesso Total:
- **3.121 ETFs** atualizados com dividendos reais
- **Tempo estimado:** 2-3 minutos
- **Velocidade:** 20-30 ETFs/segundo
- **Taxa de sucesso:** 100%

### 📄 Relatório Final:
```json
{
  "timestamp": "2025-06-27T12:00:00",
  "etfs_atualizados": 3121,
  "total_etfs_banco": 3480,
  "etfs_com_dividendos": 3121,
  "percentual_com_dividendos": 89.7,
  "tempo_total_minutos": 2.5,
  "velocidade_etfs_segundo": 20.8,
  "batches_processados": 32,
  "erros": 0
}
```

## 🔒 SEGURANÇA

### ✅ Medidas de Segurança:
- **Transações:** Cada batch é uma transação separada
- **Rollback:** Em caso de erro, apenas o batch atual é revertido
- **Confirmação:** Solicita confirmação antes de executar
- **Backup:** Não modifica dados existentes, apenas atualiza dividendos
- **Logs:** Registra todas as operações

### ⚠️ Importante:
- Este script modifica dados **REAIS** no banco de produção
- Certifique-se de ter a senha correta do Supabase
- Em caso de erro, apenas os batches com problema são revertidos
- Os dados existentes não são perdidos, apenas atualizados

## 🆘 SOLUÇÃO DE PROBLEMAS

### ❌ Erro de Conexão:
```
❌ Erro ao conectar com o banco: FATAL: password authentication failed
```
**Solução:** Verifique se a senha está correta

### ❌ Arquivo Não Encontrado:
```
❌ Arquivo de dados não encontrado: dividends_production_complete_20250627_011735.json
```
**Solução:** Certifique-se de que o arquivo está no diretório atual

### ❌ Erro de Permissão:
```
❌ Erro no batch X: permission denied for table etfs_ativos_reais
```
**Solução:** Verifique se o usuário tem permissões de UPDATE na tabela

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique as mensagens de erro
2. Confirme a senha do banco
3. Verifique a conexão com internet
4. Consulte os logs detalhados

## 🎉 PRÓXIMOS PASSOS APÓS SUCESSO

1. **Verificar** dados no Supabase Dashboard
2. **Testar** a aplicação Next.js
3. **Validar** rankings e filtros
4. **Fazer** deploy se necessário
5. **Documentar** o processo concluído 