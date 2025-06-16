# ETFCurator - MVP (Refatorado com Prisma)

Bem-vindo ao ETFCurator! Esta aplicação web SaaS foi desenvolvida para ajudar investidores a analisar e comparar ETFs.

**IMPORTANTE: Configuração do Prisma Pós-Download**

Este projeto foi refatorado para usar o Prisma como ORM para interagir com seu banco de dados Supabase (PostgreSQL). Devido a dificuldades em conectar ao seu banco de dados diretamente do meu ambiente de desenvolvimento, a integração do Prisma foi feita com um `schema.prisma` provisório. **Você DEVE executar alguns passos localmente para finalizar a configuração do Prisma antes de rodar a aplicação pela primeira vez.**

## Stack Tecnológica Principal

*   **Frontend & Backend:** Next.js 14 (App Router)
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS + shadcn/ui
*   **Banco de Dados:** Supabase (PostgreSQL)
*   **ORM:** Prisma
*   **Autenticação:** Supabase Auth (E-mail/Senha, Google OAuth)
*   **Pagamentos:** Stripe (Checkout, Webhooks, PIX para BRL)
*   **Linting/Formatting:** ESLint, Prettier, Husky

## Funcionalidades do MVP

*   Autenticação de usuários (Supabase Auth).
*   Importação de dados de ETFs via planilha Excel (`.xlsx`).
*   Screener dinâmico de ETFs com múltiplos filtros.
*   Rankings de ETFs baseados em diversas métricas.
*   Comparador de até 4 ETFs com tabelas e gráficos (Recharts).
*   Insights textuais automáticos na comparação.
*   Planos de assinatura (Free, Pro) com Stripe Checkout.
*   Webhook do Stripe para sincronização de status de assinatura.
*   Landing Page com design minimalista (Tesla-style).
*   Onboarding Wizard para novos usuários (PT-BR).
*   Modo Claro/Escuro.
*   Estrutura para internacionalização (PT-BR como padrão).
*   Páginas de Termos de Serviço e Política de Privacidade (placeholders).

## Configuração do Ambiente Local (Pós-Download)

Siga estes passos CUIDADOSAMENTE para configurar e rodar o projeto localmente:

1.  **Descompacte o Projeto:**
    *   Extraia o arquivo `etfcurator_final_prisma.zip` para uma pasta no seu computador.

2.  **Instale as Dependências:**
    *   Abra um terminal ou prompt de comando na raiz da pasta do projeto (`etfcurator`).
    *   Execute: `npm install --legacy-peer-deps` (o `--legacy-peer-deps` é para contornar possíveis conflitos de versão entre as dependências, especialmente `react-joyride`).

3.  **Configure o Supabase:**
    *   **Crie um Projeto Supabase:** Se ainda não o fez, crie um novo projeto em [supabase.com](https://supabase.com/).
    *   **Execute os Scripts SQL:**
        *   No painel do seu projeto Supabase, vá para "SQL Editor".
        *   Copie e cole o conteúdo do arquivo `supabase/migrations/0000_initial_schema.sql` (que está dentro da pasta do projeto) e execute-o. Este script cria as tabelas `profiles`, `etfs`, `lifetime_codes`, `affiliates`, `presets` e a função `handle_new_user` com o trigger.
        *   Em seguida, copie e cole o conteúdo do arquivo `supabase/migrations/0001_update_rpc_filter_etfs.sql` e execute-o. Este script atualiza a função `rpc_filter_etfs` (embora com Prisma, esta função RPC pode se tornar menos central, o schema original a incluía).
    *   **Configure a Autenticação (Supabase Auth):**
        *   No painel do Supabase, vá para "Authentication" -> "Providers".
        *   Habilite "Email" e "Google".
        *   Para o Google, você precisará configurar as credenciais OAuth no Google Cloud Console e inseri-las no Supabase. Siga a documentação do Supabase para isso.
        *   Em "Authentication" -> "URL Configuration", certifique-se de que o "Site URL" está configurado para `http://localhost:3000` para desenvolvimento local. Adicione URLs de produção aqui quando for fazer o deploy.

4.  **Configure as Variáveis de Ambiente (`.env`):**
    *   Na raiz do projeto, renomeie o arquivo `.env.example` para `.env` (ou crie um novo arquivo `.env` se não existir após a descompactação).
    *   Abra o arquivo `.env` e preencha TODAS as variáveis:

        ```env
        # Prisma / Supabase Database Connection
        # IMPORTANTE: Use a string de conexão DIRETA do seu banco Supabase (porta 5432)
        # Substitua [YOUR-PASSWORD] pela sua senha do banco (Catolico0204, conforme informado)
        # Substitua [YOUR-PROJECT-SUBDOMAIN] pelo subdomínio do seu projeto Supabase (ex: db.tdhsjxodzvlsbmyaovvv)
        DATABASE_URL="postgresql://postgres:Catolico0204@db.tdhsjxodzvlsbmyaovvv.supabase.co:5432/postgres?schema=public&sslmode=require"

        # Supabase Auth (ainda necessário para autenticação)
        NEXT_PUBLIC_SUPABASE_URL="COLE_AQUI_SUA_SUPABASE_URL_DO_PAINEL_SUPABASE"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="COLE_AQUI_SUA_SUPABASE_ANON_KEY_DO_PAINEL_SUPABASE"
        # SUPABASE_SERVICE_ROLE_KEY="COLE_AQUI_SUA_SUPABASE_SERVICE_ROLE_KEY" # Necessário para algumas operações de admin no Supabase, se usadas.

        # Stripe
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_SUA_CHAVE_PUBLICAVEL_STRIPE"
        STRIPE_SECRET_KEY="sk_test_SUA_CHAVE_SECRETA_STRIPE"
        STRIPE_WEBHOOK_SECRET="whsec_SEU_SEGREDO_DO_WEBHOOK_STRIPE_PARA_TESTES_LOCAIS" # Use `stripe listen --forward-to localhost:3000/api/stripe-webhook`
        STRIPE_PRICE_ID_PRO_BRL="price_ID_DO_SEU_PLANO_PRO_EM_BRL_NO_STRIPE"
        STRIPE_PRICE_ID_PRO_USD="price_ID_DO_SEU_PLANO_PRO_EM_USD_NO_STRIPE"
        ```
    *   **Obtenha as chaves do Supabase:** No painel do seu projeto Supabase, vá para "Project Settings" -> "API".
    *   **Obtenha as chaves do Stripe:** Crie produtos e preços no seu painel Stripe ([dashboard.stripe.com](https://dashboard.stripe.com/)) para os planos "Pro BRL" e "Pro USD". Obtenha suas chaves de API (publicável e secreta) e o ID dos preços.
    *   **Webhook do Stripe:** Para testar webhooks localmente, instale a Stripe CLI e use o comando `stripe listen --forward-to localhost:3000/api/stripe-webhook`. A CLI fornecerá um segredo de webhook (`whsec_...`) para você usar em `STRIPE_WEBHOOK_SECRET`.

5.  **Finalize a Configuração do Prisma (MUITO IMPORTANTE):**
    *   Com o arquivo `.env` corretamente configurado com sua `DATABASE_URL` real:
    *   No terminal, na raiz do projeto, execute:
        ```bash
        npx prisma db pull
        ```
        Este comando irá ler a estrutura do seu banco de dados Supabase (que você configurou no passo 3) e **ATUALIZARÁ** o arquivo `prisma/schema.prisma` com a estrutura exata do seu banco. Isso é crucial.
    *   Após o `db pull` ser bem-sucedido, execute:
        ```bash
        npx prisma generate
        ```
        Este comando irá gerar/atualizar o Prisma Client (`node_modules/@prisma/client`) com base no `schema.prisma` que acabou de ser atualizado.

6.  **Popule o Banco de Dados com sua Planilha Excel:**
    *   Após a configuração do Prisma e com a aplicação rodando (próximo passo):
    *   Acesse a rota de administração (você precisará criar uma interface para isso ou usar uma ferramenta como Postman para enviar o arquivo para `/api/import-xlsx`).
    *   O componente `ImportSpreadsheetForm.tsx` (em `src/components/admin/`) pode ser integrado a uma página de admin protegida para facilitar o upload.
    *   **Certifique-se de que o usuário que fará o upload tenha permissão de administrador** (a lógica de verificação de admin na rota `/api/import-xlsx` precisa ser implementada ou ajustada conforme sua gestão de usuários).

7.  **Rode a Aplicação em Modo de Desenvolvimento:**
    *   No terminal, na raiz do projeto, execute:
        ```bash
        npm run dev
        ```
    *   Abra seu navegador e acesse `http://localhost:3000`.

## Scripts Úteis

*   `npm run dev`: Inicia o servidor de desenvolvimento.
*   `npm run build`: Compila a aplicação para produção.
*   `npm run start`: Inicia o servidor de produção (após `npm run build`).
*   `npm run lint`: Executa o ESLint.
*   `npm run format`: Formata o código com Prettier.
*   `npx prisma studio`: Abre o Prisma Studio para visualizar e gerenciar seus dados.

## Deploy na Vercel

*   O projeto está configurado para deploy na Vercel.
*   Conecte seu repositório GitHub/GitLab/Bitbucket à Vercel.
*   Configure as mesmas variáveis de ambiente (do arquivo `.env`) nas configurações do projeto na Vercel.
*   **Importante para o Deploy com Prisma:** A Vercel executa `prisma generate` automaticamente durante o build se detectar um `schema.prisma`. Certifique-se de que sua `DATABASE_URL` na Vercel esteja correta e acessível.
*   O script `vercel.sh` fornecido pode ser usado como referência para um deploy manual via Vercel CLI, mas o ideal é usar a integração Git da Vercel.

## Estrutura de Pastas (Principais)

```
etfcurator/
├── prisma/                 # Configuração e schema do Prisma
│   └── schema.prisma
├── public/                 # Arquivos estáticos
├── scripts/                # Scripts utilitários (importação, etc.)
├── src/
│   ├── app/                # Rotas do App Router (Next.js 14)
│   │   ├── api/            # Rotas de API
│   │   ├── (auth)/         # Rotas de autenticação
│   │   ├── (main)/         # Rotas principais da aplicação (screener, comparator, etc.)
│   │   └── page.tsx        # Landing Page
│   │   └── layout.tsx      # Layout principal
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── auth/
│   │   ├── comparator/
│   │   ├── landing/
│   │   ├── layout/
│   │   ├── onboarding/
│   │   ├── pricing/
│   │   └── screener/
│   ├── lib/                # Bibliotecas, helpers, clientes (Supabase, Prisma, Stripe)
│   ├── styles/             # Estilos globais
│   └── types/              # Definições de tipos TypeScript
├── .env.example            # Exemplo de variáveis de ambiente
├── .eslintrc.json          # Configuração do ESLint
├── .gitignore
├── next.config.mjs         # Configuração do Next.js
├── package.json
├── postcss.config.js
├── README.md               # Este arquivo
├── tailwind.config.ts
└── tsconfig.json
```

Lembre-se de que a transição para o Prisma foi feita com um schema provisório. O passo de executar `npx prisma db pull` localmente é **ESSENCIAL** para que a aplicação funcione corretamente com a estrutura real do seu banco de dados Supabase.

Se encontrar qualquer problema durante a configuração, revise os passos e as mensagens de erro no terminal. Boa sorte!

# Documentação de Portfólios no ETFCurator

## Tabela portfolio_holdings

A tabela `portfolio_holdings` foi populada com dados de exemplo para os 50 ETFs disponíveis na aplicação. Esta tabela armazena as participações (holdings) de ETFs nos portfólios dos usuários e é fundamental para a funcionalidade de gestão de portfólios da plataforma.

### Estrutura da Tabela

A tabela `portfolio_holdings` contém as seguintes colunas:
- `id`: UUID, identificador único da participação
- `portfolio_id`: UUID, referência ao portfólio ao qual a participação pertence
- `etf_symbol`: String, símbolo do ETF
- `shares`: Decimal, quantidade de cotas
- `average_cost`: Decimal, custo médio de aquisição
- `current_price`: Decimal, preço atual do ETF
- `purchase_date`: Data de compra
- `created_at`: Data de criação do registro
- `updated_at`: Data de atualização do registro

### População da Tabela

Foi criado um script (`scripts/populate-portfolio-holdings.js`) que:
1. Busca usuários existentes no banco de dados
2. Para cada usuário, cria de 1 a 3 portfólios
3. Para cada portfólio, adiciona de 5 a 10 ETFs aleatórios
4. Cada ETF é adicionado com:
   - Quantidade aleatória entre 1 e 20 cotas
   - Preço médio de compra aleatório entre 50 e 500
   - Preço atual com variação de ±20% do preço de compra
   - Data de compra aleatória nos últimos 2 anos

## Uso na Aplicação

As informações da tabela `portfolio_holdings` são utilizadas nas seguintes funcionalidades:

### 1. Dashboard do Usuário

No componente `PortfolioOverviewWidget` da página de dashboard (`src/app/dashboard/page.tsx`), os dados dos portfólios são utilizados para exibir:
- Performance total do portfólio
- Retorno percentual
- ETF com melhor desempenho
- Nível de risco do portfólio

### 2. API de Portfólios

A API de portfólios (`src/app/api/portfolios/route.ts`) fornece endpoints para:
- Buscar todos os portfólios de um usuário com estatísticas de performance
- Buscar um portfólio específico com todas as suas participações
- Adicionar novas participações a um portfólio
- Excluir participações ou portfólios inteiros

### 3. Simulação e Análise

Os dados dos portfólios também são utilizados para:
- Calcular pesos percentuais de cada ETF no portfólio
- Estimar retorno total e percentual
- Analisar a diversificação e risco do portfólio
- Fornecer recomendações personalizadas baseadas na composição atual

## Como Utilizar a Funcionalidade

A funcionalidade de portfólios permite que os usuários:
1. Criem múltiplos portfólios
2. Adicionem ETFs aos seus portfólios com informações de quantidade e preço de compra
3. Visualizem estatísticas de performance
4. Comparem diferentes portfólios
5. Recebam recomendações personalizadas para otimização

Estas funcionalidades são centrais para a proposta de valor do ETFCurator, permitindo que os usuários não apenas explorem e comparem ETFs, mas também gerenciem seus investimentos de forma integrada na plataforma.

## Scripts de População do Banco de Dados

O ETFCurator requer dados iniciais no banco de dados para seu funcionamento completo. Para facilitar este processo, foram criados os seguintes scripts:

### Scripts Individuais

1. **import-all-etfs.js** - Importa todos os símbolos de ETFs do arquivo `symbols_etfs_eua.xlsx` para a tabela `etfs`.
2. **enrich-etfs.js** - Enriquece os ETFs com métricas adicionais como retornos, volatilidade, etc.
3. **calculate-etf-correlations.js** - Calcula e armazena as correlações entre pares de ETFs.
4. **populate-all-holdings.js** - Cria portfólios e adiciona ETFs a eles para demonstração.
5. **generate-portfolio-risk-analysis.js** - Gera análises de risco para os portfólios existentes.

### Script Unificado

Para facilitar o processo completo, use o script unificado:

```bash
node scripts/populate-all-database.js
```

Este script executará todos os scripts individuais na ordem correta.

### Dependências Necessárias

Certifique-se de instalar as dependências necessárias:

```bash
npm install @prisma/client dotenv xlsx axios --legacy-peer-deps
```

### Notas Importantes

- A execução completa pode levar vários minutos devido ao grande volume de dados.
- Se você tiver uma chave API para o Financial Modeling Prep (FMP), adicione-a ao arquivo `.env` como `FMP_API_KEY=sua_chave_aqui` para obter dados reais.
- Sem a chave API, o sistema usará dados simulados.

# ETF Curator

Sistema de curadoria e análise de ETFs com IA.

## Status do Deploy
- Repositório agora é público para melhor integração com Vercel
- Últimas correções: ESLint e dotenv movidos para dependencies
- Corrigido: Propriedade 'difficulty' removida do ContextualGlossary
- Corrigido: Versão da API do Stripe atualizada para 2025-05-28.basil

