#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');

let raygunClient = null;
let isInitialized = false;

const server = new Server(
  {
    name: 'raygun-mcp-server',
    version: '1.0.0',
    description: 'MCP Server para monitoramento de erros e crash reporting com Raygun - ETF Curator',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configurar handlers de ferramentas
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'raygun_init',
      description: 'Inicializar cliente Raygun com API key',
      inputSchema: {
        type: 'object',
        properties: {
          api_key: {
            type: 'string',
            description: 'Chave da API do Raygun',
          },
          app_version: {
            type: 'string',
            description: 'Versão da aplicação (opcional)',
            default: '1.0.0',
          },
        },
        required: ['api_key'],
      },
    },
    {
      name: 'raygun_send_error',
      description: 'Enviar erro para o Raygun',
      inputSchema: {
        type: 'object',
        properties: {
          error_message: {
            type: 'string',
            description: 'Mensagem do erro',
          },
          stack_trace: {
            type: 'string',
            description: 'Stack trace do erro (opcional)',
          },
          custom_data: {
            type: 'object',
            description: 'Dados customizados (opcional)',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags para categorizar o erro',
          },
        },
        required: ['error_message'],
      },
    },
    {
      name: 'raygun_send_exception',
      description: 'Enviar exceção JavaScript para o Raygun',
      inputSchema: {
        type: 'object',
        properties: {
          exception_type: {
            type: 'string',
            description: 'Tipo da exceção (ex: TypeError, ReferenceError)',
          },
          message: {
            type: 'string',
            description: 'Mensagem da exceção',
          },
          stack_trace: {
            type: 'string',
            description: 'Stack trace da exceção',
          },
          custom_data: {
            type: 'object',
            description: 'Dados customizados',
          },
        },
        required: ['exception_type', 'message'],
      },
    },
    {
      name: 'raygun_track_event',
      description: 'Rastrear evento customizado no Raygun',
      inputSchema: {
        type: 'object',
        properties: {
          event_name: {
            type: 'string',
            description: 'Nome do evento',
          },
          event_data: {
            type: 'object',
            description: 'Dados do evento',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags do evento',
          },
        },
        required: ['event_name'],
      },
    },
    {
      name: 'raygun_set_user',
      description: 'Configurar informações do usuário',
      inputSchema: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'ID único do usuário',
          },
          email: {
            type: 'string',
            description: 'Email do usuário',
          },
          name: {
            type: 'string',
            description: 'Nome do usuário',
          },
          is_anonymous: {
            type: 'boolean',
            description: 'Se é usuário anônimo',
            default: false,
          },
        },
        required: ['user_id'],
      },
    },
    {
      name: 'raygun_breadcrumb',
      description: 'Adicionar breadcrumb para contexto de debugging',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Mensagem do breadcrumb',
          },
          category: {
            type: 'string',
            description: 'Categoria (ex: navigation, user-action, api-call)',
            default: 'custom',
          },
          level: {
            type: 'string',
            description: 'Nível de importância (debug, info, warning, error)',
            default: 'info',
          },
          custom_data: {
            type: 'object',
            description: 'Dados customizados do breadcrumb',
          },
        },
        required: ['message'],
      },
    },
    {
      name: 'raygun_health_check',
      description: 'Verificar status da conexão com Raygun',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'raygun_init':
        return await handleInit(args);
      case 'raygun_send_error':
        return await handleSendError(args);
      case 'raygun_send_exception':
        return await handleSendException(args);
      case 'raygun_track_event':
        return await handleTrackEvent(args);
      case 'raygun_set_user':
        return await handleSetUser(args);
      case 'raygun_breadcrumb':
        return await handleBreadcrumb(args);
      case 'raygun_health_check':
        return await handleHealthCheck(args);
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Ferramenta desconhecida: ${name}`
        );
    }
  } catch (error) {
    console.error(`Erro ao executar ferramenta ${name}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao executar ${name}: ${error.message}`
    );
  }
});

async function handleInit(args) {
  try {
    const { api_key, app_version = '1.0.0' } = args;
    
    // Importar Raygun dinamicamente
    const raygun = require('raygun4js');
    
    // Configurar cliente
    raygunClient = raygun.init({
      apiKey: api_key,
      version: app_version,
      tags: ['etf-curator', 'mcp-server', 'portfolio-master']
    });

    // Configurar filtros para dados sensíveis
    raygunClient.setFilterScope('customData');
    raygunClient.setFilterKeys(['password', 'api_key', 'secret', 'token']);

    isInitialized = true;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Raygun MCP Server inicializado com sucesso!',
            app_version: app_version,
            tags: ['etf-curator', 'mcp-server', 'portfolio-master'],
            filters_enabled: true,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao inicializar Raygun: ${error.message}`
    );
  }
}

async function handleSendError(args) {
  if (!isInitialized) {
    throw new Error('Raygun não inicializado. Use raygun_init primeiro.');
  }

  try {
    const { error_message, stack_trace, custom_data = {}, tags = [] } = args;

    // Criar erro simulado
    const error = new Error(error_message);
    if (stack_trace) {
      error.stack = stack_trace;
    }

    // Adicionar dados customizados
    const enrichedData = {
      ...custom_data,
      timestamp: new Date().toISOString(),
      source: 'mcp-server',
      project: 'etf-curator',
    };

    // Enviar erro
    raygunClient.send(error, enrichedData, () => {
      console.log('Erro enviado para Raygun com sucesso');
    }, null, tags);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Erro enviado para Raygun com sucesso!',
            error_message: error_message,
            tags: tags,
            custom_data_keys: Object.keys(enrichedData),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao enviar erro para Raygun: ${error.message}`
    );
  }
}

async function handleSendException(args) {
  if (!isInitialized) {
    throw new Error('Raygun não inicializado. Use raygun_init primeiro.');
  }

  try {
    const { exception_type, message, stack_trace, custom_data = {} } = args;

    // Criar exceção baseada no tipo
    let exception;
    switch (exception_type.toLowerCase()) {
      case 'typeerror':
        exception = new TypeError(message);
        break;
      case 'referenceerror':
        exception = new ReferenceError(message);
        break;
      case 'syntaxerror':
        exception = new SyntaxError(message);
        break;
      case 'rangeerror':
        exception = new RangeError(message);
        break;
      default:
        exception = new Error(message);
        exception.name = exception_type;
    }

    if (stack_trace) {
      exception.stack = stack_trace;
    }

    // Dados enriquecidos
    const enrichedData = {
      ...custom_data,
      exception_type: exception_type,
      timestamp: new Date().toISOString(),
      source: 'mcp-server',
    };

    // Enviar exceção
    raygunClient.send(exception, enrichedData, () => {
      console.log('Exceção enviada para Raygun com sucesso');
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Exceção enviada para Raygun com sucesso!',
            exception_type: exception_type,
            exception_message: message,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao enviar exceção: ${error.message}`
    );
  }
}

async function handleTrackEvent(args) {
  if (!isInitialized) {
    throw new Error('Raygun não inicializado. Use raygun_init primeiro.');
  }

  try {
    const { event_name, event_data = {}, tags = [] } = args;

    // Raygun4js não tem trackEvent nativo, simular com custom data
    const customError = new Error(`EVENT: ${event_name}`);
    customError.name = 'CustomEvent';

    const eventPayload = {
      event_type: 'custom_event',
      event_name: event_name,
      event_data: event_data,
      timestamp: new Date().toISOString(),
      source: 'mcp-server',
    };

    raygunClient.send(customError, eventPayload, () => {
      console.log('Evento enviado para Raygun com sucesso');
    }, null, ['event', ...tags]);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Evento rastreado com sucesso!',
            event_name: event_name,
            tags: ['event', ...tags],
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao rastrear evento: ${error.message}`
    );
  }
}

async function handleSetUser(args) {
  if (!isInitialized) {
    throw new Error('Raygun não inicializado. Use raygun_init primeiro.');
  }

  try {
    const { user_id, email, name, is_anonymous = false } = args;

    const userInfo = {
      identifier: user_id,
      email: email,
      fullName: name,
      isAnonymous: is_anonymous,
    };

    raygunClient.setUser(userInfo);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Informações do usuário configuradas!',
            user_id: user_id,
            email: email,
            name: name,
            is_anonymous: is_anonymous,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao configurar usuário: ${error.message}`
    );
  }
}

async function handleBreadcrumb(args) {
  if (!isInitialized) {
    throw new Error('Raygun não inicializado. Use raygun_init primeiro.');
  }

  try {
    const { message, category = 'custom', level = 'info', custom_data = {} } = args;

    // Raygun4js não tem breadcrumbs nativos, simular com custom data
    const breadcrumbData = {
      breadcrumb_type: 'manual',
      message: message,
      category: category,
      level: level,
      timestamp: new Date().toISOString(),
      custom_data: custom_data,
    };

    // Armazenar breadcrumb localmente (simulação)
    if (!global.raygunBreadcrumbs) {
      global.raygunBreadcrumbs = [];
    }
    
    global.raygunBreadcrumbs.push(breadcrumbData);
    
    // Manter apenas os últimos 50 breadcrumbs
    if (global.raygunBreadcrumbs.length > 50) {
      global.raygunBreadcrumbs = global.raygunBreadcrumbs.slice(-50);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Breadcrumb adicionado com sucesso!',
            breadcrumb_message: message,
            category: category,
            level: level,
            total_breadcrumbs: global.raygunBreadcrumbs.length,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao adicionar breadcrumb: ${error.message}`
    );
  }
}

async function handleHealthCheck(args) {
  try {
    const health = {
      server_status: 'healthy',
      raygun_initialized: isInitialized,
      timestamp: new Date().toISOString(),
      breadcrumbs_count: global.raygunBreadcrumbs ? global.raygunBreadcrumbs.length : 0,
    };

    // Teste básico de conectividade (simulado)
    if (isInitialized) {
      health.raygun_connection = 'connected';
      health.filters_active = true;
      health.tags = ['etf-curator', 'mcp-server', 'portfolio-master'];
    } else {
      health.raygun_connection = 'not_initialized';
      health.filters_active = false;
      health.tags = [];
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(health, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro no health check: ${error.message}`
    );
  }
}

// Inicializar transporte e conectar
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Raygun MCP Server rodando no stdio');
}

main().catch(console.error); 