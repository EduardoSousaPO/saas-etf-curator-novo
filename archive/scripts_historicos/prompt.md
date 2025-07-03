# OBJETIVO
Utilizar todos os recursos avançados disponíveis via MCP (Excel, Sequential, Firecrawl, Memory, Supabase, Prisma, web scraping e APIs gratuitas) para construir, a partir do arquivo `C:\Users\edusp\Projetos_App_Desktop\etf_curator\etfcurator\etfs_eua.xlsx`, um pipeline automatizado que:

- **Verifica** quais ETFs presentes na planilha estão ativos atualmente nas bolsas americanas, utilizando yfinance como fonte primária e complementando com scraping e outras APIs gratuitas para alta cobertura.
- **Coleta** o máximo de informações possíveis de cada ETF ativo, baseado nos campos do `.info` do yfinance e campos customizados abaixo.
- **Cria e preenche** uma tabela no banco de dados Supabase chamada `etfs_ativos_reais`, com todas as colunas necessárias.

---

# REQUISITOS ESPECÍFICOS

## 1. Input Inicial
- **Arquivo:** `C:\Users\edusp\Projetos_App_Desktop\etf_curator\etfcurator\etfs_eua.xlsx`
- **Colunas relevantes:** `symbol`, `name` (cada linha = um ETF listado nos EUA)

## 2. Pipeline de Coleta e Verificação
- Ler a planilha via MCP Excel.
- Para cada ETF:
    1. Consultar via yfinance (`yf.Ticker(symbol).info`) para verificar se está ativo (caso contrário, descartar).
    2. Caso yfinance não retorne info suficiente ou esteja offline, complementar via scraping (Firecrawl, BeautifulSoup/Selenium) e APIs gratuitas de ETFs (ex: [ETF.com](https://www.etf.com/), [Morningstar](https://www.morningstar.com/), [etfdb.com](https://etfdb.com/)).
    3. Armazenar cada ETF validado como **ativo** com o máximo de campos abaixo preenchidos.
    4. Utilizar MCP Sequential para garantir execução resiliente, paralelizar onde possível, e Firecrawl/websearch para informações faltantes.

## 3. Banco de Dados (Supabase)
- Criar tabela `etfs_ativos_reais` com os seguintes campos:

    - Name
    - symbol
    - name
    - description
    - isin
    - assetclass
    - securitycusip
    - domicile
    - website
    - etfcompany
    - expenseratio
    - totalasset
    - avgvolume
    - inceptiondate
    - nav
    - navcurrency
    - holdingscount
    - updatedat
    - sectorslist
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
    - size_category
    - liquidity_category
    - etf_type

- Usar Prisma ORM ou Supabase API para CRUD, garantindo update incremental (não sobrescrever dados já preenchidos manualmente).

## 4. Robustez e Logging
- Logar no console e/ou arquivo todos os símbolos processados, motivos de descarte, erros de scraping/api, tentativas de fallback, campos faltantes.
- Utilizar Memory para salvar contexto e facilitar reexecução/incremento futuro.
- Gerar um relatório resumido ao final com:
    - Qtde total de ETFs processados
    - Qtde de ETFs ativos encontrados
    - Campos com maior incidência de dados faltantes (para possíveis futuras rodadas)

## 5. Detalhamento de Output Esperado
- O output final deve ser uma base de dados Supabase completa e pronta para consumo, e opcionalmente um arquivo CSV para auditoria/manual review.
- Código do script modularizado, bem comentado, fácil de entender, com instruções de execução passo a passo para quem está em vibe coding.

---

# EXIGÊNCIAS DE ENGENHARIA DE PROMPTS
- Explicar (em comentários) cada etapa para facilitar leitura e manutenção por não-programadores.
- Antecipar possíveis erros (ex: limites de requisição de API, formatação de data, campos nulos) e sugerir soluções automáticas.
- Sugerir pontos de paralelização e otimização futura para processamento de grandes volumes.
- Se faltar alguma info em APIs/scraping, deixar claro no log e preencher campo com `null`.

---

# TOOLS/AGENTES MCP PARA USAR
- MCP Excel (para leitura da planilha)
- MCP Sequential (para pipeline robusto e orquestração de etapas)
- Firecrawl (web scraping)
- yfinance (API oficial de ETFs)
- Memory (armazenar contexto entre execuções, retomar rodadas futuras)
- Supabase (como DB principal)
- Prisma (ORM para manipulação robusta)
- Web search avançado (para complementar campos não disponíveis via API)
- Logging detalhado

---

# EXEMPLO DE INSTRUÇÃO PARA O CURSOR

Por favor, gere todo o pipeline, scripts e instruções a partir deste contexto.  
Sempre explique cada bloco, escreva de forma clara e didática, use comentários generosos para facilitar meu entendimento e manutenção.  
Crie arquivos ou módulos conforme necessário, e sempre utilize o máximo dos recursos automáticos das MCPs, com logging e resiliência. 






# OBJETIVO

Utilizar todos os recursos avançados disponíveis via MCP (Excel, Sequential, Firecrawl, Memory, Supabase, Prisma, web scraping e APIs gratuitas) para construir, a partir do arquivo  
`C:\Users\edusp\Projetos_App_Desktop\etf_curator\etfcurator\etfs_eua.xlsx`, um pipeline automatizado que:

- **Verifica** quais ETFs presentes na planilha estão ativos atualmente nas bolsas americanas, utilizando yfinance como fonte primária e complementando com scraping e outras APIs gratuitas para alta cobertura.
- **Coleta** o máximo de informações possíveis de cada ETF ativo, baseado nos campos do `.info` do yfinance e campos customizados abaixo.
- **Cria e preenche** três tabelas no banco de dados Supabase:
  1. `etfs_ativos_reais` (dados fundamentais e descritivos do ETF),
  2. `etf_prices` (cotações históricas detalhadas dos ETFs),
  3. `historic_etfs_dividends` (dividendos históricos dos ETFs).

---

# NOVA LÓGICA INCLUÍDA

## Tabelas e métricas históricas

Muitos campos fundamentais da tabela `etfs_ativos_reais` (como *returns*, *volatility*, *sharpe*, *drawdown* e *dividends*) dependem de séries históricas de preços e dividendos.  
Por isso, o pipeline deverá:

- **Para cada ETF ativo:**
    1. Buscar sua **cotação histórica** dos últimos 10 anos (até 15/05/2025).  
       - Se o ETF não tiver 10 anos de histórico, buscar desde sua data de início (inception date).
    2. Buscar sua **histórico de dividendos** desde o início.
    3. **Armazenar** os dados de preço diário na tabela `etf_prices` (colunas: symbol, date, open, high, low, close, adj_close, volume).
    4. **Armazenar** os dividendos na tabela `historic_etfs_dividends` (colunas: symbol, date, dividend).
    5. **Calcular as métricas históricas** de retorno, volatilidade, sharpe, drawdown e dividendos agregados diretamente a partir desses dados e preencher os respectivos campos na tabela `etfs_ativos_reais`.
        - Se faltar alguma métrica por ausência de dados suficientes, preencher com `null` e logar o motivo.

---

# REQUISITOS ESPECÍFICOS (Atualizado)

## 1. Input Inicial
- **Arquivo:** `C:\Users\edusp\Projetos_App_Desktop\etf_curator\etfcurator\etfs_eua.xlsx`
- **Colunas relevantes:** `symbol`, `name`

## 2. Pipeline de Coleta, Verificação e Histórico

- Ler a planilha via MCP Excel.
- Para cada ETF:
    1. Consultar via yfinance (`yf.Ticker(symbol).info`) para verificar se está ativo.
    2. Se ativo:
        - Buscar histórico de preços:
            - 10 anos até 15/05/2025 OU todo histórico desde o início do ETF.
            - Armazenar em `etf_prices`.
        - Buscar histórico de dividendos:
            - Armazenar em `historic_etfs_dividends`.
        - Calcular:
            - **Returns**: 12m, 24m, 36m, 5y, 10y (quando aplicável).
            - **Volatility**: 12m, 24m, 36m, 10y.
            - **Sharpe**: 12m, 24m, 36m, 10y.
            - **Max Drawdown**: período máximo possível.
            - **Dividends**: 12m, 24m, 36m, all time.
            - Preencher campos correspondentes na tabela `etfs_ativos_reais`.
        - Caso não haja histórico suficiente, preencha o máximo possível e marque os demais campos como `null`.

## 3. Banco de Dados (Supabase)

- **Tabela principal**: `etfs_ativos_reais` (campos já listados)
- **Nova tabela 1**: `etf_prices`
    - symbol (string)
    - date (date)
    - open, high, low, close, adj_close (float)
    - volume (int)
- **Nova tabela 2**: `historic_etfs_dividends`
    - symbol (string)
    - date (date)
    - dividend (float)

- Use Prisma ORM/Supabase API para CRUD e atualização incremental, **nunca sobrescreva manualmente preenchido**.

## 4. Robustez, Logging e Relatórios

- Logar todas as etapas: símbolos processados, razões de descarte, falhas de scraping/API, campos não encontrados.
- Se algum campo de métrica histórica não puder ser calculado, registrar o motivo no log e preencher como `null`.
- Gerar relatório final: ETFs processados, ativos, campos faltantes, e log detalhado de tentativas/falhas.

## 5. Detalhamento de Output Esperado

- Base de dados Supabase completa, tabelas separadas para cotações e dividendos.
- Arquivo CSV opcional para auditoria.
- Código comentado, modular, com instruções para execução.
- Documentação didática explicando cada bloco.

---

# ENGENHARIA DE PROMPTS (REFORÇADO)

- Comentar cada etapa do código para fácil manutenção.
- Antecipar possíveis erros (API limits, falta de dados, formatação).
- Sugestões para paralelização e otimização de performance.
- Logging detalhado de tudo.
- Utilizar **Memory** para salvar contexto e facilitar incrementos futuros.

---

# TOOLS/AGENTES MCP PARA USAR

- MCP Excel (leitura da planilha)
- MCP Sequential (orquestração de pipeline)
- Firecrawl (web scraping)
- yfinance (API ETFs)
- Memory (contexto entre execuções)
- Supabase (DB)
- Prisma (ORM)
- Web search avançado (campos faltantes)
- Logging detalhado

