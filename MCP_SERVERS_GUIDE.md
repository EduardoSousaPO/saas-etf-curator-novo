# 🚀 Guia dos MCP Servers - ETF Curator

## Instalação Concluída ✅

Foram instalados com sucesso 2 MCP servers para aumentar sua produtividade no Cursor:

### 1. **Raygun MCP Server** - Monitoramento de Erros
### 2. **Vector Search MCP Server** - Pesquisa Semântica Inteligente

---

## 📋 Configuração Atual

### Arquivo `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "mercadopago-mcp-server": { ... },
    "excel": { ... },
    "raygun-mcp-server": {
      "command": "node",
      "args": ["raygun-mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    "vector-search-mcp-server": {
      "command": "node", 
      "args": ["vector-search-mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

---

## 🔧 Raygun MCP Server

### **Funcionalidades:**
- **Monitoramento de erros** em tempo real
- **Crash reporting** detalhado
- **Tracking de eventos** customizados
- **Breadcrumbs** para contexto de debugging
- **Configuração de usuários** para rastreamento

### **Ferramentas Disponíveis:**

#### 1. `raygun_init`
Inicializar o cliente Raygun
```javascript
{
  "api_key": "sua-api-key-raygun",
  "app_version": "1.0.0"
}
```

#### 2. `raygun_send_error`
Enviar erro para monitoramento
```javascript
{
  "error_message": "Erro no portfolio calculation",
  "stack_trace": "Error: Division by zero...",
  "custom_data": {
    "user_id": "123",
    "portfolio_type": "aggressive"
  },
  "tags": ["portfolio", "calculation", "error"]
}
```

#### 3. `raygun_send_exception`
Enviar exceção JavaScript
```javascript
{
  "exception_type": "TypeError",
  "message": "Cannot read property 'length' of undefined",
  "stack_trace": "TypeError: Cannot read...",
  "custom_data": {
    "component": "ETF Selection",
    "user_action": "search_etfs"
  }
}
```

#### 4. `raygun_track_event`
Rastrear eventos customizados
```javascript
{
  "event_name": "portfolio_generated",
  "event_data": {
    "portfolio_type": "moderate",
    "etf_count": 5,
    "total_amount": 50000
  },
  "tags": ["portfolio", "success"]
}
```

#### 5. `raygun_set_user`
Configurar informações do usuário
```javascript
{
  "user_id": "user-123",
  "email": "user@example.com",
  "name": "João Silva",
  "is_anonymous": false
}
```

#### 6. `raygun_breadcrumb`
Adicionar breadcrumb para debugging
```javascript
{
  "message": "User selected aggressive risk profile",
  "category": "user-action",
  "level": "info",
  "custom_data": {
    "risk_profile": "aggressive",
    "timestamp": "2025-01-08T20:00:00Z"
  }
}
```

#### 7. `raygun_health_check`
Verificar status da conexão
```javascript
{}
```

---

## 🔍 Vector Search MCP Server

### **Funcionalidades:**
- **Pesquisa semântica** com OpenAI embeddings
- **Armazenamento vetorial** com ChromaDB
- **Busca por similaridade** avançada
- **Reranking** de resultados
- **Filtros** e **metadados** customizados

### **Ferramentas Disponíveis:**

#### 1. `vector_init`
Inicializar conexões OpenAI + ChromaDB
```javascript
{
  "openai_api_key": "sk-...",
  "chroma_url": "http://localhost:8000",
  "embedding_model": "text-embedding-3-small"
}
```

#### 2. `vector_create_collection`
Criar nova coleção
```javascript
{
  "collection_name": "etf_knowledge_base",
  "metadata": {
    "description": "Base de conhecimento sobre ETFs",
    "version": "1.0"
  }
}
```

#### 3. `vector_list_collections`
Listar coleções disponíveis
```javascript
{}
```

#### 4. `vector_select_collection`
Selecionar coleção ativa
```javascript
{
  "collection_name": "etf_knowledge_base"
}
```

#### 5. `vector_add_documents`
Adicionar documentos à coleção
```javascript
{
  "documents": [
    {
      "id": "spy-overview",
      "content": "SPDR S&P 500 ETF Trust (SPY) é um dos ETFs mais populares...",
      "metadata": {
        "symbol": "SPY",
        "category": "large_cap",
        "expense_ratio": 0.0945
      }
    },
    {
      "id": "qqq-overview", 
      "content": "Invesco QQQ Trust (QQQ) rastreia o índice NASDAQ-100...",
      "metadata": {
        "symbol": "QQQ",
        "category": "technology",
        "expense_ratio": 0.20
      }
    }
  ]
}
```

#### 6. `vector_search`
Buscar documentos por similaridade
```javascript
{
  "query": "ETFs de tecnologia com baixo custo",
  "limit": 5,
  "threshold": 0.7,
  "filters": {
    "category": "technology"
  }
}
```

#### 7. `vector_similarity_search`
Busca avançada com scores
```javascript
{
  "query": "melhores ETFs para aposentadoria",
  "limit": 10,
  "include_distances": true,
  "include_metadata": true,
  "filters": {
    "expense_ratio": {"$lt": 0.5}
  }
}
```

#### 8. `vector_semantic_query`
Consulta semântica avançada
```javascript
{
  "query": "ETFs defensivos para mercado volátil",
  "context": "Investidor conservador buscando proteção contra inflação",
  "limit": 5,
  "semantic_threshold": 0.8,
  "rerank": true
}
```

#### 9. `vector_delete_documents`
Deletar documentos
```javascript
{
  "document_ids": ["spy-overview", "qqq-overview"]
}
```

#### 10. `vector_get_collection_info`
Informações da coleção
```javascript
{
  "include_stats": true
}
```

#### 11. `vector_health_check`
Verificar status das conexões
```javascript
{}
```

---

## 🎯 Casos de Uso Práticos

### **Para o Portfolio Master:**

#### 1. **Monitoramento de Erros**
```javascript
// Rastrear erro na otimização Markowitz
raygun_send_error({
  "error_message": "Markowitz optimization failed",
  "custom_data": {
    "selected_etfs": ["SPY", "QQQ", "BND"],
    "risk_profile": "moderate",
    "investment_amount": 50000
  },
  "tags": ["portfolio", "markowitz", "optimization"]
})
```

#### 2. **Pesquisa Semântica de ETFs**
```javascript
// Buscar ETFs similares para diversificação
vector_semantic_query({
  "query": "ETFs de bonds para carteira conservadora",
  "context": "Investidor aposentado buscando renda fixa",
  "limit": 5,
  "semantic_threshold": 0.8
})
```

#### 3. **Tracking de Eventos de Sucesso**
```javascript
// Rastrear portfolio gerado com sucesso
raygun_track_event({
  "event_name": "portfolio_optimization_success",
  "event_data": {
    "optimization_type": "markowitz",
    "etf_count": 6,
    "expected_return": 8.5,
    "risk_profile": "moderate"
  },
  "tags": ["success", "portfolio", "markowitz"]
})
```

### **Para Desenvolvimento:**

#### 1. **Base de Conhecimento**
```javascript
// Adicionar documentação de APIs
vector_add_documents({
  "documents": [
    {
      "id": "api-portfolio-unified",
      "content": "API /api/portfolio/unified-master permite criar portfolios otimizados...",
      "metadata": {
        "type": "api_documentation",
        "endpoint": "/api/portfolio/unified-master",
        "methods": ["POST", "PUT", "GET"]
      }
    }
  ]
})
```

#### 2. **Debugging Contextual**
```javascript
// Adicionar breadcrumbs para contexto
raygun_breadcrumb({
  "message": "User started portfolio optimization",
  "category": "user-action",
  "level": "info",
  "custom_data": {
    "objective": "retirement",
    "initial_amount": 100000,
    "risk_profile": "conservative"
  }
})
```

---

## 🚀 Como Começar

### **1. Reiniciar o Cursor**
Feche e reabra o Cursor para carregar as novas configurações MCP.

### **2. Verificar Disponibilidade**
No Cursor, os MCP servers aparecerão como ferramentas disponíveis.

### **3. Inicializar Raygun**
```javascript
raygun_init({
  "api_key": "sua-api-key-aqui",
  "app_version": "1.0.0"
})
```

### **4. Inicializar Vector Search**
```javascript
vector_init({
  "openai_api_key": "sk-sua-chave-openai",
  "chroma_url": "http://localhost:8000"
})
```

### **5. Criar Primeira Coleção**
```javascript
vector_create_collection({
  "collection_name": "etf_curator_docs",
  "metadata": {
    "description": "Documentação do ETF Curator",
    "project": "etf-curator"
  }
})
```

---

## 📊 Benefícios Imediatos

### **🔍 Produtividade:**
- **Pesquisa semântica** em documentação
- **Busca inteligente** em base de conhecimento
- **Contextualização** automática de código

### **🛡️ Qualidade:**
- **Monitoramento** proativo de erros
- **Tracking** de eventos críticos
- **Debugging** contextual avançado

### **📈 Insights:**
- **Métricas** de uso em tempo real
- **Análise** de padrões de erro
- **Otimização** baseada em dados

---

## 🔧 Dependências Instaladas

- `@modelcontextprotocol/sdk`
- `@hyperdrive-eng/mcp-nodejs-debugger`
- `raygun4js`
- `chromadb`
- `openai`

---

## 📝 Notas Importantes

1. **Raygun API Key**: Obtenha em [raygun.com](https://raygun.com)
2. **OpenAI API Key**: Obtenha em [platform.openai.com](https://platform.openai.com)
3. **ChromaDB**: Instale localmente ou use serviço hospedado
4. **Reiniciar Cursor**: Necessário após mudanças na configuração MCP

---

## 🎉 Pronto para Usar!

Seus MCP servers estão **instalados** e **configurados**. Reinicie o Cursor e comece a usar as novas funcionalidades para aumentar sua produtividade no desenvolvimento do ETF Curator!

**Status: ✅ COMPLETO** 