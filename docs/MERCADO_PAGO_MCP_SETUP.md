# Configuração do MCP Server do Mercado Pago

## Visão Geral

O MCP Server (Model Context Protocol) do Mercado Pago permite interagir com a API do Mercado Pago usando linguagem natural através de assistentes de IA como o Cursor.

## Pré-requisitos

- ✅ NPM versão 6 ou superior (Atual: v10.9.0)
- ⚠️ NodeJS versão 20 ou superior (Atual: v18.18.0 - **PRECISA ATUALIZAR**)
- ✅ Cursor IDE (ou outro cliente MCP compatível)
- ⚠️ **Credenciais do Mercado Pago** (Access Token)

## Configuração

### 1. Arquivo de Configuração

O arquivo `.cursor/mcp.json` já foi criado com a configuração básica:

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.mercadopago.com/mcp",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer <SEU_ACCESS_TOKEN_AQUI>"
      }
    }
  }
}
```

### 2. Obter Credenciais do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá em **Suas integrações** > **Detalhes da aplicação**
3. Copie o **Access Token** de:
   - **Testes** > **Credenciais de teste** (para desenvolvimento)
   - **Produção** > **Credenciais de produção** (para produção)

### 3. Configurar o Access Token

Substitua `<SEU_ACCESS_TOKEN_AQUI>` no arquivo `.cursor/mcp.json` pelo seu Access Token real:

```json
"AUTH_HEADER": "Bearer APP_USR-1234567890abcdef..."
```

⚠️ **IMPORTANTE**: 
- Nunca exponha sua chave privada em repositórios públicos
- Use sempre HTTPS
- Mantenha as credenciais seguras no servidor

## Ferramentas Disponíveis

### search_documentation

Busca informações na documentação oficial do Mercado Pago.

**Parâmetros:**
- `query` (string, obrigatório): Termo a ser pesquisado
- `language` (string, obrigatório): Idioma da busca
  - `'pt'` (português)
  - `'es'` (espanhol) 
  - `'en'` (inglês)

**Exemplo de prompt:**
```
Busque na documentação do Mercado Pago como integrar o Checkout Pro
```

## Casos de Uso

### 1. Buscar Documentação via IDE

```
Pesquise na documentação do Mercado Pago quais métodos de pagamento estão disponíveis no Brasil
```

### 2. Gerar Código para Integração

```
Implemente a integração do Checkout Pro. 
Consulte a documentação do MCP Server do Mercado Pago para detalhes de implementação.

Após revisar o código da aplicação existente, gere código pronto para produção:

Frontend:
1. Substitua a UI de checkout atual pela interface do Mercado Pago
2. Implemente integração do formulário de pagamento
3. Implemente fluxos de sucesso/falha no cliente

Backend:
1. Configure credenciais e integração SDK na versão mais recente
2. Crie endpoints de processamento de pagamento
3. Implemente tratamento de webhooks com validações

Requisitos:
- Melhores práticas de segurança e validação do Mercado Pago
- Tratamento de erros com códigos de status
- Casos de teste para fluxos críticos
- Documentação inline
- Verifique todos os passos na documentação do MCP Server do Mercado Pago
```

## Verificação da Instalação

1. Reinicie o Cursor
2. Vá em **Configurações** > **MCP Servers**
3. Verifique se `mercadopago-mcp-server` aparece como disponível
4. Se não aparecer, clique no ícone de atualização

## Teste da Integração

Para testar se a integração está funcionando:

```
Busque na documentação do Mercado Pago como integrar o Checkout Pro
```

Se o MCP estiver configurado corretamente, o assistente irá buscar informações diretamente na documentação oficial.

## Solução de Problemas

### MCP Server não aparece nas configurações
- Verifique se o arquivo `.cursor/mcp.json` está correto
- Reinicie o Cursor
- Clique no ícone de atualização nas configurações MCP

### Erro de autenticação
- Verifique se o Access Token está correto
- Confirme se está usando o formato: `Bearer SEU_TOKEN`
- Verifique se o token não expirou

### Erro de conexão
- Verifique sua conexão com a internet
- Confirme se a URL `https://mcp.mercadopago.com/mcp` está acessível

## Links Úteis

- [Documentação MCP Server Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/mcp-server)
- [Credenciais Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/credentials)
- [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro)

## Status

- ✅ Arquivo de configuração criado
- ⚠️ **Pendente**: Configurar Access Token real
- ⚠️ **Pendente**: Testar integração 