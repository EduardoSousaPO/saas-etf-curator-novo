# 🎯 PROMPTS PERFEITOS PARA CURSOR AI

Este arquivo contém prompts otimizados para executar tarefas específicas no projeto ETF Curator com máxima eficiência.

---

## 🚀 CORREÇÃO CRÍTICA: RANKINGS DE STOCKS COM DADOS REAIS

### **PROBLEMA IDENTIFICADO:**
**EVIDÊNCIA VISUAL:** Rankings de ações exibindo "Nenhuma ação encontrada nesta categoria" em todas as 6 categorias, apesar de existirem **1.385 ações** na tabela `stocks_unified` com **97%+ de dados válidos** (returns_12m, pe_ratio, dividend_yield, volatility).

### **OBJETIVO:**
Implementar rankings funcionais com **10 ações reais por categoria**, algoritmos de seleção baseados em dados da `stocks_unified`, e design Tesla-style minimalista.

### **INVESTIGAÇÃO OBRIGATÓRIA:**
```sql
-- MCP: mcp_supabase_execute_sql
-- 1. Verificar top performers reais
SELECT ticker, name, returns_12m, market_cap 
FROM stocks_unified 
WHERE returns_12m IS NOT NULL AND market_cap > 1000000000
ORDER BY returns_12m DESC LIMIT 10;

-- 2. Verificar dividend champions reais  
SELECT ticker, name, dividend_yield_12m, market_cap
FROM stocks_unified 
WHERE dividend_yield_12m IS NOT NULL AND dividend_yield_12m > 0.02
ORDER BY dividend_yield_12m DESC LIMIT 10;

-- 3. Verificar low volatility reais
SELECT ticker, name, volatility_12m, market_cap
FROM stocks_unified 
WHERE volatility_12m IS NOT NULL AND volatility_12m < 0.25
ORDER BY volatility_12m ASC LIMIT 10;
```

### **CORREÇÃO DA API:**
```typescript
// Arquivo: src/app/api/stocks/rankings/route.ts
// CORRIGIR QUERIES QUEBRADAS - USAR DADOS REAIS

const rankings = {
  best_performers: {
    title: 'Melhor Performance', 
    description: 'Ações com o melhor desempenho nos últimos 12 meses',
    query: supabase
      .from('stocks_unified')
      .select('ticker, name, sector, current_price, market_cap, returns_12m, volatility_12m, snapshot_date')
      .not('returns_12m', 'is', null)
      .gte('market_cap', 1000000000)
      .gte('returns_12m', 0.05) // Mínimo 5% retorno
      .order('returns_12m', { ascending: false, nullsFirst: false })
      .limit(10)
  },

  dividend_champions: {
    title: 'Campeões de Dividendos',
    description: 'Ações que distribuem os maiores dividendos aos acionistas', 
    query: supabase
      .from('stocks_unified')
      .select('ticker, name, sector, current_price, market_cap, dividend_yield_12m, snapshot_date')
      .not('dividend_yield_12m', 'is', null)
      .gte('dividend_yield_12m', 0.015) // Mínimo 1.5% yield
      .gte('market_cap', 500000000)
      .order('dividend_yield_12m', { ascending: false, nullsFirst: false })
      .limit(10)
  },

  low_volatility: {
    title: 'Baixa Volatilidade',
    description: 'Ações com menor risco para investidores conservadores',
    query: supabase
      .from('stocks_unified') 
      .select('ticker, name, sector, current_price, market_cap, volatility_12m, returns_12m, snapshot_date')
      .not('volatility_12m', 'is', null)
      .lte('volatility_12m', 0.30) // Máximo 30% volatilidade
      .gte('market_cap', 2000000000) // Large caps apenas
      .order('volatility_12m', { ascending: true, nullsFirst: false })
      .limit(10)
  },

  // Repetir padrão para growth_stocks, value_stocks, momentum_stocks
};
```

### **DESIGN TESLA-STYLE:**
```jsx
// Arquivo: src/app/stocks/rankings/page.tsx
// APLICAR PADRÕES TESLA.COM

// HEADER MINIMALISTA
<div className="bg-white py-16">
  <div className="max-w-7xl mx-auto px-8">
    <h1 className="text-6xl font-thin text-black mb-6">Rankings de Ações</h1>
    <p className="text-xl text-gray-600 font-light max-w-2xl">
      Descubra as melhores ações americanas organizadas por categoria
    </p>
  </div>
</div>

// CARDS LIMPOS SEM BORDAS
<div className="bg-white py-12 border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-8">
    <h2 className="text-3xl font-light text-black mb-12">{category.title}</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
      {stocks.map((stock, index) => (
        <div key={stock.ticker} className="group cursor-pointer">
          <div className="mb-4">
            <div className="text-4xl font-thin text-gray-400 mb-2">
              {String(index + 1).padStart(2, '0')}
            </div>
            <h3 className="text-xl font-medium text-black">{stock.ticker}</h3>
            <p className="text-gray-600 font-light text-sm truncate">
              {stock.name}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Preço</span>
              <span className="font-medium">${stock.current_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Retorno 12m</span>
              <span className="font-medium text-green-600">
                {formatPercentage(stock.returns_12m)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### **PADRONIZAÇÃO VIA MCP MEMORY:**
```typescript
// MCP: mcp_memory_create_entities
const STOCKS_RANKINGS_RULES = {
  name: "Stocks Rankings Algorithm Rules",
  entityType: "technical_standard", 
  observations: [
    "SEMPRE usar nullsFirst: false em todas as ordenações",
    "SEMPRE aplicar filtros mínimos: market_cap > 500M-2B conforme categoria",
    "SEMPRE limitar a 10 ações por categoria via .limit(10)",
    "best_performers: ORDER BY returns_12m DESC, mínimo 5% retorno",
    "dividend_champions: ORDER BY dividend_yield_12m DESC, mínimo 1.5% yield", 
    "low_volatility: ORDER BY volatility_12m ASC, máximo 30% volatilidade",
    "SEMPRE formatar valores: percentuais com 1 casa decimal",
    "Design Tesla: font-thin, espaçamento generoso, sem bordas arredondadas",
    "SEMPRE testar queries no Supabase antes de implementar"
  ]
}
```

### **VALIDAÇÃO OBRIGATÓRIA:**
```typescript
// TESTE 1: Verificar se dados existem
const testRankingsData = async () => {
  const response = await fetch('/api/stocks/rankings?category=best_performers&limit=10');
  const data = await response.json();
  console.log('📊 Best performers:', data.rankings.stocks.length);
  // Esperado: 10 ações com dados reais
};

// TESTE 2: Verificar todas as categorias
const testAllCategories = async () => {
  const response = await fetch('/api/stocks/rankings');
  const data = await response.json();
  Object.keys(data.rankings).forEach(category => {
    console.log(`📊 ${category}:`, data.rankings[category].stocks.length);
  });
  // Esperado: 6 categorias com 10 ações cada
};
```

### **DOCUMENTAÇÃO:**
```markdown
// Criar: docs/STOCKS_RANKINGS_REAL_DATA_FIX.md

# ANTES: 6 categorias vazias, "Nenhuma ação encontrada"
# DEPOIS: 60 ações reais (10 por categoria) com algoritmos funcionais

## CORREÇÕES:
1. Queries SQL corrigidas com filtros adequados
2. nullsFirst: false aplicado em todas as ordenações  
3. Design Tesla-style implementado (font-thin, espaçamento, sem bordas)
4. Algoritmos de seleção baseados em dados reais da stocks_unified
```

### **MCPs OBRIGATÓRIOS:**
- `mcp_supabase_execute_sql`: Investigar dados e testar queries
- `mcp_memory_create_entities`: Padronizar regras de algoritmos
- `mcp_sequential-thinking`: Análise sistemática do problema

### **RESULTADO ESPERADO:**
- **6 categorias funcionais** com 10 ações cada (total: 60 ações)
- **Design Tesla minimalista** com tipografia leve e espaçamento generoso  
- **Algoritmos reais** baseados em performance, dividendos, volatilidade
- **Interface profissional** comparável a plataformas institucionais

---

*Criado: 25/01/2025*