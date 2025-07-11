#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');

let openaiClient = null;
let chromaClient = null;
let activeCollection = null;
let isInitialized = false;
let chromaUrl = 'http://localhost:8000';

const server = new Server(
  {
    name: 'vector-search-mcp-server',
    version: '1.0.0',
    description: 'MCP Server para pesquisa semântica inteligente com OpenAI + ChromaDB - ETF Curator',
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
      name: 'vector_init',
      description: 'Inicializar Vector Search com OpenAI e ChromaDB',
      inputSchema: {
        type: 'object',
        properties: {
          openai_api_key: {
            type: 'string',
            description: 'Chave da API OpenAI',
          },
          chroma_url: {
            type: 'string',
            description: 'URL do ChromaDB (padrão: http://localhost:8000)',
            default: 'http://localhost:8000',
          },
          embedding_model: {
            type: 'string',
            description: 'Modelo de embedding OpenAI',
            default: 'text-embedding-3-small',
          },
        },
        required: ['openai_api_key'],
      },
    },
    {
      name: 'vector_create_collection',
      description: 'Criar nova coleção no ChromaDB',
      inputSchema: {
        type: 'object',
        properties: {
          collection_name: {
            type: 'string',
            description: 'Nome da coleção',
          },
          metadata: {
            type: 'object',
            description: 'Metadados da coleção (opcional)',
          },
          embedding_function: {
            type: 'string',
            description: 'Função de embedding (openai por padrão)',
            default: 'openai',
          },
        },
        required: ['collection_name'],
      },
    },
    {
      name: 'vector_list_collections',
      description: 'Listar todas as coleções disponíveis',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'vector_select_collection',
      description: 'Selecionar coleção ativa para operações',
      inputSchema: {
        type: 'object',
        properties: {
          collection_name: {
            type: 'string',
            description: 'Nome da coleção para ativar',
          },
        },
        required: ['collection_name'],
      },
    },
    {
      name: 'vector_add_documents',
      description: 'Adicionar documentos à coleção ativa',
      inputSchema: {
        type: 'object',
        properties: {
          documents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                content: { type: 'string' },
                metadata: { type: 'object' },
              },
              required: ['id', 'content'],
            },
            description: 'Lista de documentos para adicionar',
          },
        },
        required: ['documents'],
      },
    },
    {
      name: 'vector_search',
      description: 'Buscar documentos por similaridade',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Texto da consulta',
          },
          limit: {
            type: 'number',
            description: 'Número máximo de resultados',
            default: 10,
          },
          threshold: {
            type: 'number',
            description: 'Threshold de similaridade (0.0 a 1.0)',
            default: 0.7,
          },
          filters: {
            type: 'object',
            description: 'Filtros de metadados (opcional)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'vector_similarity_search',
      description: 'Busca avançada com scores de similaridade',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Texto da consulta',
          },
          limit: {
            type: 'number',
            description: 'Número máximo de resultados',
            default: 10,
          },
          include_distances: {
            type: 'boolean',
            description: 'Incluir distâncias nos resultados',
            default: true,
          },
          include_metadata: {
            type: 'boolean',
            description: 'Incluir metadados nos resultados',
            default: true,
          },
          filters: {
            type: 'object',
            description: 'Filtros de metadados',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'vector_semantic_query',
      description: 'Consulta semântica avançada com contexto',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Consulta semântica',
          },
          context: {
            type: 'string',
            description: 'Contexto adicional para a busca',
          },
          limit: {
            type: 'number',
            description: 'Número de resultados',
            default: 5,
          },
          semantic_threshold: {
            type: 'number',
            description: 'Threshold semântico (0.0 a 1.0)',
            default: 0.8,
          },
          rerank: {
            type: 'boolean',
            description: 'Reranquear resultados por relevância',
            default: true,
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'vector_delete_documents',
      description: 'Deletar documentos da coleção ativa',
      inputSchema: {
        type: 'object',
        properties: {
          document_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs dos documentos para deletar',
          },
          filters: {
            type: 'object',
            description: 'Filtros para deletar documentos (alternativa aos IDs)',
          },
        },
      },
    },
    {
      name: 'vector_get_collection_info',
      description: 'Obter informações da coleção ativa',
      inputSchema: {
        type: 'object',
        properties: {
          include_stats: {
            type: 'boolean',
            description: 'Incluir estatísticas detalhadas',
            default: true,
          },
        },
      },
    },
    {
      name: 'vector_health_check',
      description: 'Verificar status das conexões OpenAI e ChromaDB',
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
      case 'vector_init':
        return await handleInit(args);
      case 'vector_create_collection':
        return await handleCreateCollection(args);
      case 'vector_list_collections':
        return await handleListCollections(args);
      case 'vector_select_collection':
        return await handleSelectCollection(args);
      case 'vector_add_documents':
        return await handleAddDocuments(args);
      case 'vector_search':
        return await handleSearch(args);
      case 'vector_similarity_search':
        return await handleSimilaritySearch(args);
      case 'vector_semantic_query':
        return await handleSemanticQuery(args);
      case 'vector_delete_documents':
        return await handleDeleteDocuments(args);
      case 'vector_get_collection_info':
        return await handleGetCollectionInfo(args);
      case 'vector_health_check':
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
    const { openai_api_key, chroma_url = 'http://localhost:8000', embedding_model = 'text-embedding-3-small' } = args;
    
    // Inicializar OpenAI
    const OpenAI = require('openai');
    openaiClient = new OpenAI({
      apiKey: openai_api_key,
    });

    // Inicializar ChromaDB
    const { ChromaApi, Configuration } = require('chromadb');
    const chromaConfig = new Configuration({
      basePath: chroma_url,
    });
    chromaClient = new ChromaApi(chromaConfig);

    // Testar conexões
    await testConnections();

    chromaUrl = chroma_url;
    isInitialized = true;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Vector Search MCP Server inicializado com sucesso!',
            openai_model: embedding_model,
            chroma_url: chroma_url,
            connections: {
              openai: 'connected',
              chroma: 'connected',
            },
            project: 'etf-curator',
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao inicializar Vector Search: ${error.message}`
    );
  }
}

async function testConnections() {
  try {
    // Testar OpenAI
    await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test connection',
    });

    // Testar ChromaDB
    await chromaClient.heartbeat();
  } catch (error) {
    throw new Error(`Erro ao testar conexões: ${error.message}`);
  }
}

async function handleCreateCollection(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  try {
    const { collection_name, metadata = {}, embedding_function = 'openai' } = args;

    const response = await chromaClient.createCollection({
      name: collection_name,
      metadata: {
        ...metadata,
        embedding_function: embedding_function,
        created_at: new Date().toISOString(),
        project: 'etf-curator',
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Coleção criada com sucesso!',
            collection_name: collection_name,
            embedding_function: embedding_function,
            metadata: metadata,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao criar coleção: ${error.message}`
    );
  }
}

async function handleListCollections(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  try {
    const response = await chromaClient.listCollections();
    
    const collections = response.data || [];
    const collectionsInfo = collections.map(collection => ({
      name: collection.name,
      id: collection.id,
      metadata: collection.metadata,
      dimension: collection.dimension,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: `${collections.length} coleções encontradas`,
            collections: collectionsInfo,
            active_collection: activeCollection,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao listar coleções: ${error.message}`
    );
  }
}

async function handleSelectCollection(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  try {
    const { collection_name } = args;

    // Verificar se a coleção existe
    const collections = await chromaClient.listCollections();
    const collection = collections.data.find(c => c.name === collection_name);
    
    if (!collection) {
      throw new Error(`Coleção '${collection_name}' não encontrada`);
    }

    activeCollection = collection_name;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Coleção selecionada com sucesso!',
            active_collection: activeCollection,
            collection_id: collection.id,
            metadata: collection.metadata,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao selecionar coleção: ${error.message}`
    );
  }
}

async function handleAddDocuments(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  if (!activeCollection) {
    throw new Error('Nenhuma coleção ativa. Use vector_select_collection primeiro.');
  }

  try {
    const { documents } = args;

    // Gerar embeddings para todos os documentos
    const embeddings = [];
    for (const doc of documents) {
      const embedding = await openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: doc.content,
      });
      embeddings.push(embedding.data[0].embedding);
    }

    // Preparar dados para ChromaDB
    const ids = documents.map(doc => doc.id);
    const contents = documents.map(doc => doc.content);
    const metadatas = documents.map(doc => ({
      ...doc.metadata,
      content_length: doc.content.length,
      added_at: new Date().toISOString(),
    }));

    // Adicionar à coleção
    await chromaClient.add({
      collectionName: activeCollection,
      ids: ids,
      embeddings: embeddings,
      documents: contents,
      metadatas: metadatas,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Documentos adicionados com sucesso!',
            collection: activeCollection,
            documents_added: documents.length,
            document_ids: ids,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao adicionar documentos: ${error.message}`
    );
  }
}

async function handleSearch(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  if (!activeCollection) {
    throw new Error('Nenhuma coleção ativa. Use vector_select_collection primeiro.');
  }

  try {
    const { query, limit = 10, threshold = 0.7, filters = {} } = args;

    // Gerar embedding da consulta
    const queryEmbedding = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // Buscar no ChromaDB
    const results = await chromaClient.query({
      collectionName: activeCollection,
      queryEmbeddings: [queryEmbedding.data[0].embedding],
      nResults: limit,
      where: Object.keys(filters).length > 0 ? filters : undefined,
    });

    // Processar resultados
    const processedResults = [];
    if (results.data && results.data.length > 0) {
      const result = results.data[0];
      for (let i = 0; i < result.ids.length; i++) {
        const distance = result.distances[i];
        const similarity = 1 - distance; // Converter distância para similaridade
        
        if (similarity >= threshold) {
          processedResults.push({
            id: result.ids[i],
            content: result.documents[i],
            metadata: result.metadatas[i],
            similarity: similarity,
            distance: distance,
          });
        }
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            query: query,
            collection: activeCollection,
            results_count: processedResults.length,
            threshold: threshold,
            results: processedResults,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro na busca: ${error.message}`
    );
  }
}

async function handleSimilaritySearch(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  if (!activeCollection) {
    throw new Error('Nenhuma coleção ativa. Use vector_select_collection primeiro.');
  }

  try {
    const { query, limit = 10, include_distances = true, include_metadata = true, filters = {} } = args;

    // Gerar embedding da consulta
    const queryEmbedding = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // Buscar no ChromaDB
    const results = await chromaClient.query({
      collectionName: activeCollection,
      queryEmbeddings: [queryEmbedding.data[0].embedding],
      nResults: limit,
      where: Object.keys(filters).length > 0 ? filters : undefined,
      includeDistances: include_distances,
      includeMetadata: include_metadata,
    });

    // Processar resultados avançados
    const processedResults = [];
    if (results.data && results.data.length > 0) {
      const result = results.data[0];
      for (let i = 0; i < result.ids.length; i++) {
        const resultItem = {
          id: result.ids[i],
          content: result.documents[i],
          rank: i + 1,
        };

        if (include_distances) {
          resultItem.distance = result.distances[i];
          resultItem.similarity = 1 - result.distances[i];
        }

        if (include_metadata) {
          resultItem.metadata = result.metadatas[i];
        }

        processedResults.push(resultItem);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            query: query,
            collection: activeCollection,
            results_count: processedResults.length,
            include_distances: include_distances,
            include_metadata: include_metadata,
            results: processedResults,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro na busca por similaridade: ${error.message}`
    );
  }
}

async function handleSemanticQuery(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  if (!activeCollection) {
    throw new Error('Nenhuma coleção ativa. Use vector_select_collection primeiro.');
  }

  try {
    const { query, context = '', limit = 5, semantic_threshold = 0.8, rerank = true } = args;

    // Construir consulta semântica enriquecida
    const enrichedQuery = context ? `${context}\n\nConsulta: ${query}` : query;

    // Gerar embedding da consulta enriquecida
    const queryEmbedding = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: enrichedQuery,
    });

    // Buscar no ChromaDB
    const results = await chromaClient.query({
      collectionName: activeCollection,
      queryEmbeddings: [queryEmbedding.data[0].embedding],
      nResults: limit * 2, // Buscar mais para reranking
    });

    // Processar e filtrar resultados
    let processedResults = [];
    if (results.data && results.data.length > 0) {
      const result = results.data[0];
      for (let i = 0; i < result.ids.length; i++) {
        const similarity = 1 - result.distances[i];
        
        if (similarity >= semantic_threshold) {
          processedResults.push({
            id: result.ids[i],
            content: result.documents[i],
            metadata: result.metadatas[i],
            similarity: similarity,
            semantic_score: similarity,
            relevance_rank: i + 1,
          });
        }
      }
    }

    // Reranking semântico (se habilitado)
    if (rerank && processedResults.length > 0) {
      // Implementar reranking básico baseado em palavras-chave
      const queryWords = query.toLowerCase().split(/\s+/);
      processedResults = processedResults.map(result => {
        const contentWords = result.content.toLowerCase();
        const keywordMatches = queryWords.filter(word => contentWords.includes(word)).length;
        const keywordScore = keywordMatches / queryWords.length;
        
        result.rerank_score = (result.similarity * 0.7) + (keywordScore * 0.3);
        return result;
      }).sort((a, b) => b.rerank_score - a.rerank_score);
    }

    // Limitar aos melhores resultados
    processedResults = processedResults.slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            query: query,
            context: context,
            collection: activeCollection,
            results_count: processedResults.length,
            semantic_threshold: semantic_threshold,
            rerank_enabled: rerank,
            results: processedResults,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro na consulta semântica: ${error.message}`
    );
  }
}

async function handleDeleteDocuments(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  if (!activeCollection) {
    throw new Error('Nenhuma coleção ativa. Use vector_select_collection primeiro.');
  }

  try {
    const { document_ids, filters } = args;

    let deleteParams = {
      collectionName: activeCollection,
    };

    if (document_ids && document_ids.length > 0) {
      deleteParams.ids = document_ids;
    } else if (filters && Object.keys(filters).length > 0) {
      deleteParams.where = filters;
    } else {
      throw new Error('Forneça document_ids ou filters para deletar');
    }

    await chromaClient.delete(deleteParams);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: 'Documentos deletados com sucesso!',
            collection: activeCollection,
            deleted_ids: document_ids,
            filters_used: filters,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao deletar documentos: ${error.message}`
    );
  }
}

async function handleGetCollectionInfo(args) {
  if (!isInitialized) {
    throw new Error('Vector Search não inicializado. Use vector_init primeiro.');
  }

  if (!activeCollection) {
    throw new Error('Nenhuma coleção ativa. Use vector_select_collection primeiro.');
  }

  try {
    const { include_stats = true } = args;

    const collection = await chromaClient.getCollection({
      collectionName: activeCollection,
    });

    const info = {
      name: collection.name,
      id: collection.id,
      metadata: collection.metadata,
      dimension: collection.dimension,
    };

    if (include_stats) {
      const count = await chromaClient.count({
        collectionName: activeCollection,
      });
      
      info.document_count = count.data;
      info.embedding_dimension = collection.dimension;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            collection_info: info,
            include_stats: include_stats,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao obter informações da coleção: ${error.message}`
    );
  }
}

async function handleHealthCheck(args) {
  try {
    const health = {
      server_status: 'healthy',
      initialized: isInitialized,
      timestamp: new Date().toISOString(),
      active_collection: activeCollection,
      chroma_url: chromaUrl,
    };

    if (isInitialized) {
      try {
        // Testar OpenAI
        await openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: 'health check',
        });
        health.openai_status = 'connected';
      } catch (error) {
        health.openai_status = 'error';
        health.openai_error = error.message;
      }

      try {
        // Testar ChromaDB
        await chromaClient.heartbeat();
        health.chroma_status = 'connected';
      } catch (error) {
        health.chroma_status = 'error';
        health.chroma_error = error.message;
      }
    } else {
      health.openai_status = 'not_initialized';
      health.chroma_status = 'not_initialized';
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
  console.error('Vector Search MCP Server rodando no stdio');
}

main().catch(console.error); 