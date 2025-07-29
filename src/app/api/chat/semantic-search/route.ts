import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Busca semântica usando MCP Memory + índice local
export async function POST(request: NextRequest) {
  try {
    const { query, userId, limit = 10, contentTypes, folders } = await request.json();

    if (!query || !userId) {
      return NextResponse.json({ 
        error: 'query e userId são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`🔍 Busca semântica para usuário: ${userId}, query: "${query}"`);

    // 1. Busca no índice semântico local
    const localResults = await searchLocalSemanticIndex(query, userId, limit, contentTypes, folders);

    // 2. Busca no MCP Memory (quando disponível)
    let memoryResults: MemorySearchResult[] = [];
    try {
      memoryResults = await searchMCPMemory(query, userId);
    } catch (error) {
      console.warn('⚠️ MCP Memory não disponível:', error);
    }

    // 3. Combinar e ranquear resultados
    const combinedResults = combineAndRankResults(localResults, memoryResults, query);

    // 4. Buscar dados completos dos itens encontrados
    const enrichedResults = await enrichResultsWithFullData(combinedResults, userId);

    console.log(`✅ ${enrichedResults.length} resultados encontrados na busca semântica`);

    return NextResponse.json({
      results: enrichedResults,
      query,
      total: enrichedResults.length,
      sources: {
        local: localResults.length,
        memory: memoryResults.length
      }
    });

  } catch (error) {
    console.error('❌ Erro na busca semântica:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET - Busca simples por keywords
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || !userId) {
      return NextResponse.json({ 
        error: 'query e userId são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`🔍 Busca simples para usuário: ${userId}, query: "${query}"`);

    // Busca simples por keywords no índice semântico
    const { data: results, error } = await supabase
      .from('chat_semantic_index')
      .select(`
        folder_item_id,
        keywords,
        entities,
        intent,
        context_data,
        chat_folder_items!inner(
          id,
          title,
          summary,
          content_type,
          data,
          tags,
          is_favorite,
          created_at,
          chat_folders!inner(
            id,
            name,
            type,
            icon,
            user_id
          )
        )
      `)
      .eq('chat_folder_items.chat_folders.user_id', userId)
      .or(`keywords.cs.{${query}},entities.cs.{${query}}`)
      .limit(limit);

    if (error) {
      console.error('❌ Erro na busca simples:', error);
      return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }

    console.log(`✅ ${results?.length || 0} resultados encontrados na busca simples`);

    return NextResponse.json({
      results: results || [],
      query,
      total: results?.length || 0
    });

  } catch (error) {
    console.error('❌ Erro na busca simples:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função para busca no índice semântico local
async function searchLocalSemanticIndex(
  query: string, 
  userId: string, 
  limit: number, 
  contentTypes?: string[], 
  folders?: string[]
) {
  try {
    // Extrair keywords da query
    const queryKeywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Query base
    let supabaseQuery = supabase
      .from('chat_semantic_index')
      .select(`
        folder_item_id,
        keywords,
        entities,
        intent,
        context_data,
        chat_folder_items!inner(
          id,
          title,
          summary,
          content_type,
          data,
          tags,
          is_favorite,
          created_at,
          chat_folders!inner(
            id,
            name,
            type,
            icon,
            user_id
          )
        )
      `)
      .eq('chat_folder_items.chat_folders.user_id', userId);

    // Filtros por tipo de conteúdo
    if (contentTypes && contentTypes.length > 0) {
      supabaseQuery = supabaseQuery.in('chat_folder_items.content_type', contentTypes);
    }

    // Filtros por pastas
    if (folders && folders.length > 0) {
      supabaseQuery = supabaseQuery.in('chat_folder_items.folder_id', folders);
    }

    // Busca por keywords ou entities
    const keywordConditions = queryKeywords.map(keyword => 
      `keywords.cs.{${keyword}},entities.cs.{${keyword}}`
    ).join(',');

    if (keywordConditions) {
      supabaseQuery = supabaseQuery.or(keywordConditions);
    }

    const { data: results, error } = await supabaseQuery.limit(limit);

    if (error) {
      console.error('❌ Erro na busca local:', error);
      return [];
    }

    // Calcular score de relevância
    return (results || []).map(result => ({
      ...result,
      relevance_score: calculateRelevanceScore(result, queryKeywords),
      source: 'local'
    }));

  } catch (error) {
    console.error('❌ Erro na busca local:', error);
    return [];
  }
}

// Função para busca no MCP Memory (placeholder para integração futura)
async function searchMCPMemory(query: string, userId: string): Promise<MemorySearchResult[]> {
  try {
    // Integração real com MCP Memory
    console.log('🧠 Buscando no MCP Memory:', { query, userId });
    
    // Buscar nós relacionados ao usuário e query
    const searchQuery = `user:${userId} ${query}`;
    
    // Simular busca no MCP Memory - TODO: Implementar chamada real
    // const memoryResults = await mcp_memory_search_nodes({
    //   query: searchQuery
    // });
    
    // Por enquanto, retornar resultados simulados baseados no padrão de busca
    const mockMemoryResults = await searchMockMemoryNodes(searchQuery, userId);
    
    return mockMemoryResults.map(result => ({
      ...result,
      source: 'memory',
      relevance_score: result.confidence || 0.5
    }));
    
  } catch (error) {
    console.warn('⚠️ MCP Memory não disponível:', error);
    return [];
  }
}

// Interface para resultados de busca de memória
interface MemorySearchResult {
  id: string;
  name: string;
  entityType: string;
  observations: string[];
  confidence: number;
  folder_item_id: null;
  keywords: string[];
  entities: string[];
  intent: string;
}

// Função simulada para MCP Memory (será substituída pela real)
async function searchMockMemoryNodes(query: string, userId: string): Promise<MemorySearchResult[]> {
  // Simular busca em memória persistente do usuário
  const mockNodes = [
    {
      id: 'memory_node_1',
      name: 'etf_analysis_memory',
      entityType: 'saved_analysis',
      observations: [
        'Usuário frequentemente analisa ETFs de tecnologia',
        'Interesse em baixo expense ratio',
        'Preferência por ETFs da Vanguard e iShares'
      ],
      confidence: 0.8,
      folder_item_id: null,
      keywords: ['technology', 'expense_ratio', 'vanguard', 'ishares'],
      entities: ['VTI', 'QQQ', 'SCHD'],
      intent: 'portfolio_optimization'
    },
    {
      id: 'memory_node_2', 
      name: 'user_preferences',
      entityType: 'user_behavior',
      observations: [
        'Busca frequente por ETFs de dividendos',
        'Interesse em análises de risco-retorno',
        'Prefere portfolios diversificados'
      ],
      confidence: 0.7,
      folder_item_id: null,
      keywords: ['dividends', 'risk', 'return', 'diversification'],
      entities: ['SCHD', 'VYM', 'HDV'],
      intent: 'income_generation'
    }
  ];

  // Filtrar baseado na query
  const queryLower = query.toLowerCase();
  const relevantNodes = mockNodes.filter(node => {
    const nodeText = (node.observations.join(' ') + ' ' + node.keywords.join(' ')).toLowerCase();
    return queryLower.split(' ').some(word => nodeText.includes(word));
  });

  return relevantNodes;
}

// Função para combinar e ranquear resultados
function combineAndRankResults(localResults: any[], memoryResults: any[], query: string) {
  const combined = [...localResults, ...memoryResults];
  
  // Ordenar por score de relevância
  return combined
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
    .slice(0, 20); // Limitar a 20 resultados máximo
}

// Função para enriquecer resultados com dados completos
async function enrichResultsWithFullData(results: any[], userId: string) {
  if (!results.length) return [];

  try {
    // Extrair IDs dos itens
    const itemIds = results
      .map(r => r.chat_folder_items?.id || r.folder_item_id)
      .filter(Boolean);

    if (!itemIds.length) return [];

    // Buscar dados completos
    const { data: fullItems, error } = await supabase
      .from('chat_folder_items')
      .select(`
        id,
        title,
        summary,
        content_type,
        data,
        tags,
        is_favorite,
        is_archived,
        view_count,
        generated_files,
        created_at,
        updated_at,
        last_accessed,
        chat_folders!inner(
          id,
          name,
          type,
          icon,
          color,
          user_id
        )
      `)
      .in('id', itemIds)
      .eq('chat_folders.user_id', userId);

    if (error) {
      console.error('❌ Erro ao enriquecer resultados:', error);
      return results;
    }

    // Combinar com scores de relevância
    return (fullItems || []).map(item => {
      const result = results.find(r => 
        (r.chat_folder_items?.id || r.folder_item_id) === item.id
      );
      
      return {
        ...item,
        relevance_score: result?.relevance_score || 0,
        source: result?.source || 'local',
        matched_keywords: result?.keywords || [],
        matched_entities: result?.entities || []
      };
    });

  } catch (error) {
    console.error('❌ Erro ao enriquecer resultados:', error);
    return results;
  }
}

// Função para calcular score de relevância
function calculateRelevanceScore(result: any, queryKeywords: string[]): number {
  let score = 0;
  
  const keywords = result.keywords || [];
  const entities = result.entities || [];
  const title = result.chat_folder_items?.title?.toLowerCase() || '';
  const summary = result.chat_folder_items?.summary?.toLowerCase() || '';
  
  // Score por keywords matching
  queryKeywords.forEach(keyword => {
    if (keywords.includes(keyword)) score += 2;
    if (entities.includes(keyword)) score += 3;
    if (title.includes(keyword)) score += 1.5;
    if (summary.includes(keyword)) score += 1;
  });
  
  // Bonus por favoritos
  if (result.chat_folder_items?.is_favorite) score += 0.5;
  
  // Bonus por views
  const views = result.chat_folder_items?.view_count || 0;
  score += Math.min(views * 0.1, 1); // Máximo +1 por popularidade
  
  // Penalidade por idade (itens mais recentes são mais relevantes)
  const daysOld = result.chat_folder_items?.created_at ? 
    (Date.now() - new Date(result.chat_folder_items.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
  score -= Math.min(daysOld * 0.01, 1); // Máximo -1 por idade
  
  return Math.max(score, 0);
} 