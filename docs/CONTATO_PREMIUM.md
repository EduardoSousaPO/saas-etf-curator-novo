# Sistema de Contato Premium - ETF Curator

## Visão Geral

O sistema de contato premium foi desenvolvido para capturar leads qualificados interessados nos planos **WEALTH** e **OFFSHORE** do ETF Curator. Baseado na documentação dos planos de assinatura, implementa um processo seletivo estruturado com qualificação de patrimônio e objetivos.

## Funcionalidades Implementadas

### 1. Página de Contato (`/contato`)
- **Formulário em 4 etapas** com validação progressiva
- **Processo seletivo** baseado na documentação dos planos
- **Qualificação financeira** com faixas de patrimônio
- **Coleta de preferências** de contato (horário, WhatsApp, etc.)
- **Interface responsiva** seguindo o design system do app

### 2. API de Processamento (`/api/contato`)
- **Endpoint POST** para receber dados do formulário
- **Validação de dados** obrigatórios
- **Integração com Supabase** para armazenamento
- **Tratamento de erros** robusto
- **Endpoint GET** para administração

### 3. Página de Administração (`/admin/contatos`)
- **Dashboard administrativo** para visualizar leads
- **Filtros por status** (Pendente, Em Análise, Aprovado, etc.)
- **Informações detalhadas** de cada contato
- **Links diretos** para email, telefone e WhatsApp
- **Interface organizada** por categorias

### 4. Banco de Dados
- **Tabela `contatos_premium`** com estrutura completa
- **Índices otimizados** para performance
- **RLS (Row Level Security)** configurado
- **Triggers automáticos** para updated_at

## Fluxo do Processo

### 1. Usuário Acessa `/contato`
- Página apresenta os planos WEALTH e OFFSHORE
- Explica o processo seletivo em 4 etapas
- Mostra credenciais (CVM, transparência, etc.)

### 2. Preenchimento do Formulário
**Etapa 1 - Dados Pessoais:**
- Nome completo
- Email
- Telefone
- WhatsApp (opcional)
- Horário preferido para contato
- Melhor dia da semana

**Etapa 2 - Qualificação Financeira:**
- Patrimônio total (faixas: 200k-500k, 500k-1M, 1M-2M, 2M-5M, 5M+)
- Experiência (Iniciante, Intermediário, Avançado)
- Plano de interesse (WEALTH ou OFFSHORE)

**Etapa 3 - Objetivos:**
- Objetivo principal (texto livre)
- Horizonte de tempo (1-2 anos, 3-5 anos, 5-10 anos, 10+ anos)

**Etapa 4 - Confirmação:**
- Revisão dos dados
- Informações sobre próximos passos

### 3. Processamento Backend
- Validação de dados obrigatórios
- Inserção no banco de dados
- Retorno de confirmação para o usuário
- Status inicial: "PENDENTE"

### 4. Administração
- Equipe acessa `/admin/contatos`
- Visualiza leads por status
- Tem acesso a todas as informações coletadas
- Pode filtrar e gerenciar contatos

## Estrutura de Dados

### Tabela `contatos_premium`
```sql
- id (UUID, PK)
- nome (VARCHAR, NOT NULL)
- email (VARCHAR, NOT NULL)
- telefone (VARCHAR, NOT NULL)
- whatsapp (VARCHAR, opcional)
- horario_preferido (VARCHAR, opcional)
- melhor_dia (VARCHAR, opcional)
- patrimonio_total (VARCHAR, NOT NULL)
- renda_mensal (VARCHAR, opcional)
- experiencia_investimentos (VARCHAR, NOT NULL)
- objetivo_principal (TEXT, NOT NULL)
- horizonte_tempo (VARCHAR, NOT NULL)
- plano_interesse (VARCHAR, NOT NULL) - CHECK: WEALTH ou OFFSHORE
- tem_consultor (VARCHAR, opcional)
- principais_investimentos (TEXT, opcional)
- observacoes (TEXT, opcional)
- status (VARCHAR, DEFAULT 'PENDENTE')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Status Possíveis
- **PENDENTE**: Recém-recebido, aguardando análise
- **EM_ANALISE**: Sendo avaliado pela equipe
- **APROVADO**: Qualificado para o plano
- **CONTATADO**: Equipe já fez contato inicial
- **REJEITADO**: Não atende aos critérios

## Configuração e Deploy

### 1. Banco de Dados
Execute o script SQL para criar a tabela:
```bash
# Executar no Supabase SQL Editor
supabase/create-contatos-premium-table.sql
```

### 2. Variáveis de Ambiente
Certifique-se de que estão configuradas:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Teste Local
```bash
# Servidor deve estar rodando
npm run dev

# Acessar páginas
http://localhost:3001/contato
http://localhost:3001/admin/contatos
```

## Integração com Pricing

O sistema está integrado com a página de pricing (`/pricing`). Quando usuários clicam em "Solicitar Análise" ou "Solicitar Contato" para planos WEALTH/OFFSHORE, são redirecionados para `/contato`.

### Código de Integração
```javascript
// src/app/api/subscriptions/checkout/route.ts
if (plan.type === 'contact') {
  return NextResponse.json({
    success: true,
    type: 'contact',
    redirectUrl: '/contato',
    message: contactMessage,
    upgrade: !!existingSubscription
  });
}
```

## Próximos Passos

### 1. Notificações
- [ ] Email automático para a equipe quando novo contato é recebido
- [ ] Email de confirmação para o usuário
- [ ] Integração com Slack/Discord para notificações

### 2. CRM Integration
- [ ] Integração com HubSpot/Pipedrive
- [ ] Sincronização automática de leads
- [ ] Tracking de conversão

### 3. Analytics
- [ ] Métricas de conversão por etapa
- [ ] Análise de abandono no formulário
- [ ] Dashboard de performance

### 4. Automação
- [ ] Qualificação automática baseada em critérios
- [ ] Agendamento automático de reuniões
- [ ] Sequência de email marketing

## Métricas Importantes

### KPIs para Monitorar
- **Taxa de conversão** (visitantes → formulário preenchido)
- **Qualidade dos leads** (patrimônio vs plano interesse)
- **Tempo de resposta** da equipe
- **Taxa de aprovação** no processo seletivo
- **Conversão final** (contato → cliente)

### Relatórios Sugeridos
- Leads por semana/mês
- Distribuição por faixa de patrimônio
- Planos mais solicitados (WEALTH vs OFFSHORE)
- Experiência dos leads
- Fontes de tráfego mais qualificadas

## Manutenção

### Backup de Dados
```sql
-- Backup regular da tabela
SELECT * FROM contatos_premium ORDER BY created_at DESC;
```

### Limpeza de Dados
```sql
-- Remover contatos antigos rejeitados (opcional)
DELETE FROM contatos_premium 
WHERE status = 'REJEITADO' 
AND created_at < NOW() - INTERVAL '6 months';
```

### Monitoramento
- Verificar logs de erro regularmente
- Monitorar performance da API
- Validar integridade dos dados coletados

---

**Desenvolvido para ETF Curator - Sistema de Curadoria Inteligente de ETFs** 