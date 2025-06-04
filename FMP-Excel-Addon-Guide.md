# Guia Completo: Como Usar o Add-on FMP no Excel

## O que é o Add-on FMP?
O Add-on FMP (Financial Modeling Prep) para Excel permite acessar dados financeiros, cotações, métricas, ratings, holdings e muito mais diretamente do Excel, usando fórmulas personalizadas. Ideal para análise de ETFs, ações, fundos e outros ativos, com atualização em tempo real e integração direta com a API FMP.

## Pré-requisitos
- Microsoft Excel 2016 ou superior (Windows ou Mac)
- Conta Microsoft para instalar o add-in
- Chave de API FMP (registre-se em https://site.financialmodelingprep.com/dashboard)
- Conexão com a internet

## 1. Instalação do Add-on FMP
1. [Acesse o Excel Tool](https://appsource.microsoft.com/en-us/product/office/WA200003535?src=office)
2. Clique em "Get it now" e faça login com sua conta Microsoft.
3. Clique em "Open in Excel" para abrir o Excel.
4. Permita o carregamento do plugin clicando em "Allow and Continue". O menu "FMP" aparecerá na barra do Excel.
5. Clique em "FMP" para acessar as opções do add-on.
6. Clique em "Snow Taskpane" para autenticar com sua API Key da FMP (disponível no seu [Dashboard](https://site.financialmodelingprep.com/dashboard)).
7. Após salvar a chave, você já pode usar as funções FMP no Excel.

## 2. Dicas de Uso e Performance
- Todas as funções começam com `=FMP.`
- O Excel mostra um popup com as assinaturas das funções.
- Para transformar o resultado de uma função em valor fixo, use o botão "Convert to Value" no menu FMP.
- Para grandes volumes de dados, utilize funções em lote (ex: `BATCHQUOTE`, `KEYMETRICSBULK`).
- Use cabeçalhos para limitar os campos retornados e acelerar a consulta.
- Evite fórmulas voláteis em excesso para não sobrecarregar o Excel.

## 3. Principais Funções FMP para ETFs

| Função                        | Descrição                                              | Exemplo de uso |
|-------------------------------|--------------------------------------------------------|----------------|
| `ETFINFORMATION`              | Informações detalhadas do ETF (nome, AUM, gestora, etc)| `=FMP.ETFINFORMATION("SPY")` |
| `ETFSECTOREXPOSURE`           | Exposição setorial do ETF                              | `=FMP.ETFSECTOREXPOSURE("SPY")` |
| `ETFCOUNTRYWEIGHTINGS`        | Exposição geográfica                                   | `=FMP.ETFCOUNTRYWEIGHTINGS("SPY")` |
| `ETFHOLDINGS`                 | Principais posições do ETF                             | `=FMP.ETFHOLDINGS("SPY")` |
| `ETFHOLDINGDATES`             | Datas de atualização das holdings                      | `=FMP.ETFHOLDINGDATES("SPY")` |
| `QUOTE`                       | Preço, variação, volume, etc.                          | `=FMP.QUOTE("SPY")` |
| `KEYMETRICS`                  | Métricas financeiras importantes                       | `=FMP.KEYMETRICS("SPY")` |
| `RATING`                      | Rating do ETF                                         | `=FMP.RATING("SPY")` |
| `ETFLIST`                     | Lista todos os ETFs disponíveis                        | `=FMP.ETFLIST()` |
| `BATCHQUOTE`                  | Cotações em lote                                       | `=FMP.BATCHQUOTE("SPY;IVV;VOO")` |
| `KEYMETRICSBULK`              | Métricas em lote                                       | `=FMP.KEYMETRICSBULK()` |

### Exemplos Detalhados

#### 1. Informações Gerais do ETF
```excel
=FMP.ETFINFORMATION("SPY")
```
Retorna: Nome, categoria, gestora, AUM, data de criação, etc.

#### 2. Exposição Setorial
```excel
=FMP.ETFSECTOREXPOSURE("SPY")
```
Retorna: Percentual de cada setor (tecnologia, saúde, financeiro, etc).

#### 3. Exposição Geográfica
```excel
=FMP.ETFCOUNTRYWEIGHTINGS("SPY")
```
Retorna: Percentual de exposição por país.

#### 4. Principais Holdings
```excel
=FMP.ETFHOLDINGS("SPY")
```
Retorna: Lista das principais empresas/ativos do ETF.

#### 5. Datas de Holdings
```excel
=FMP.ETFHOLDINGDATES("SPY")
```
Retorna: Datas de atualização das holdings.

#### 6. Cotações e Métricas
```excel
=FMP.QUOTE("SPY")
=FMP.KEYMETRICS("SPY")
=FMP.RATING("SPY")
```
Retorna: Preço atual, variação, volume, métricas financeiras, rating.

#### 7. Consultas em Lote
```excel
=FMP.BATCHQUOTE("SPY;IVV;VOO")
=FMP.KEYMETRICSBULK()
```
Retorna: Dados para múltiplos ETFs de uma vez.

### Parâmetros Úteis
- **symbol**: código do ETF (ex: "SPY")
- **headers**: campos específicos a retornar (ex: "symbol,name,price")
- **limit**: número de registros (ex: 1, 5, 10)
- **date**: data de referência (para funções históricas)

## 4. Exemplos Avançados

### Buscar apenas campos específicos
```excel
=FMP.QUOTE("SPY";;"symbol,name,price,changesPercentage")
```

### Buscar holdings em data específica
```excel
=FMP.ETFHOLDINGS("SPY";;"2023-09-30")
```

### Listar todos os ETFs disponíveis
```excel
=FMP.ETFLIST()
```

### Buscar métricas para vários ETFs
```excel
=FMP.BATCHQUOTE("SPY;IVV;VOO")
```

## 5. Automação e Dicas para Grandes Volumes
- Use fórmulas em lote para processar centenas de símbolos.
- Combine com tabelas dinâmicas para análises rápidas.
- Utilize filtros e validação de dados para evitar erros de símbolo.
- Para atualizar dados manualmente, use o botão "Refresh" do Excel.

## 6. Resolução de Problemas
- Se o add-on não aparecer, verifique se está habilitado em "Add-Ins" do Excel.
- Para recarregar o add-on: Menu FMP > Snow Taskpane > botão "i" > Reload.
- Se funções não retornarem dados, confira se a API Key está correta e se o símbolo está correto.
- Para funções que exigem cabeçalhos, inclua-os, por exemplo:
  ```excel
  =FMP.QUOTE("AAPL";;"symbol,name,price,changesPercentage,change,dayLow")
  ```
- Se receber erro de limite, aguarde alguns minutos e tente novamente (a API tem limites de requisição).
- Para dúvidas, consulte a [documentação oficial](https://site.financialmodelingprep.com/developer/docs/excel-add-on#installation-guide).

## 7. Perguntas Frequentes (FAQ)

**1. O add-on funciona no Excel Online?**
- Sim, desde que o add-in esteja instalado e você esteja autenticado.

**2. Posso usar no Mac?**
- Sim, desde que seja uma versão compatível do Excel.

**3. Como limito os campos retornados?**
- Use o parâmetro `headers` nas funções, ex: `=FMP.QUOTE("SPY";;"symbol,price")`

**4. Como faço para atualizar todos os dados de uma vez?**
- Use o botão "Refresh All" do Excel ou reabra a planilha.

**5. Como exportar os dados para outro sistema?**
- Após usar "Convert to Value", salve como CSV ou use VBA para automação.

## 8. Links Úteis
- [Documentação Oficial FMP Excel Add-on](https://site.financialmodelingprep.com/developer/docs/excel-add-on#installation-guide)
- [Lista Completa de Funções](https://site.financialmodelingprep.com/developer/docs/excel-add-on#list-of-functions)
- [Dashboard para API Key](https://site.financialmodelingprep.com/dashboard)
- [Exemplos de Fórmulas](https://site.financialmodelingprep.com/developer/docs/excel-add-on#list-of-functions)

---

*Guia gerado automaticamente a partir da documentação oficial FMP (2025). Última atualização: junho/2025.* 