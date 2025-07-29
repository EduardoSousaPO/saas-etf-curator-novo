// SISTEMA AUTOMATIZADO DE ATUALIZAÇÃO DE DADOS ETF
// Utiliza MCP Perplexity AI para manter dados sempre atualizados

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ETFEnrichmentData {
  symbol: string;
  top_10_holdings: any[];
  sector_allocation: Record<string, number>;
  morningstar_rating: number;
  sustainability_rating: number;
  net_flows_30d: number;
  recent_news_sentiment: number;
  holdings_concentration: number;
}

export class ETFAutoUpdater {
  private perplexityApiKey: string;
  
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY!;
  }

  // Função principal de atualização automatizada
  async runDailyUpdate(): Promise<void> {
    console.log('🚀 Iniciando atualização automatizada de ETFs...');
    
    try {
      // 1. Buscar ETFs que precisam de atualização (>7 dias sem update)
      const etfsToUpdate = await this.getETFsNeedingUpdate();
      console.log(`📊 Encontrados ${etfsToUpdate.length} ETFs para atualização`);

      // 2. Processar em lotes de 10 ETFs
      const batchSize = 10;
      for (let i = 0; i < etfsToUpdate.length; i += batchSize) {
        const batch = etfsToUpdate.slice(i, i + batchSize);
        await this.processBatch(batch);
        
        // Aguardar 2 segundos entre lotes para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('✅ Atualização automatizada concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro na atualização automatizada:', error);
      throw error;
    }
  }

  // Buscar ETFs que precisam de atualização
  private async getETFsNeedingUpdate(): Promise<string[]> {
    const { data, error } = await supabase
      .from('etfs_ativos_reais')
      .select('symbol')
      .or('last_enrichment_date.is.null,last_enrichment_date.lt.' + 
           new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('totalasset', { ascending: false })
      .limit(100); // Priorizar ETFs com maior patrimônio

    if (error) throw error;
    return data?.map(etf => etf.symbol) || [];
  }

  // Processar lote de ETFs
  private async processBatch(symbols: string[]): Promise<void> {
    console.log(`🔄 Processando lote: ${symbols.join(', ')}`);

    // Usar Perplexity AI para coletar dados
    const enrichmentData = await this.collectDataFromPerplexity(symbols);

    // Aplicar dados no banco
    for (const data of enrichmentData) {
      await this.updateETFData(data);
    }
  }

  // Coletar dados via Perplexity AI
  private async collectDataFromPerplexity(symbols: string[]): Promise<ETFEnrichmentData[]> {
    const prompt = `
Colete dados atualizados dos ETFs: ${symbols.join(', ')}

Para cada ETF, forneça em formato JSON:
1. Top 5 holdings (ticker, name, weight %)
2. Alocação por setor (top 5 setores com %)
3. Morningstar rating (1-5)
4. Sustainability rating ESG (1-5)
5. Net flows últimos 30 dias (milhões USD)
6. Sentiment de notícias recentes (-1 a +1)
7. Concentração dos top 10 holdings (%)

Formato JSON estruturado para processamento automático.
    `;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'system', content: 'Você é um especialista em ETFs que coleta dados precisos.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.1,
        }),
      });

      const result = await response.json();
      return this.parsePerplexityResponse(result.choices[0].message.content, symbols);
    } catch (error) {
      console.error('❌ Erro ao coletar dados da Perplexity:', error);
      return [];
    }
  }

  // Parser da resposta da Perplexity AI
  private parsePerplexityResponse(content: string, symbols: string[]): ETFEnrichmentData[] {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];

      const data = JSON.parse(jsonMatch[0]);
      
      return symbols.map(symbol => ({
        symbol,
        top_10_holdings: data[symbol]?.holdings || [],
        sector_allocation: data[symbol]?.sectors || {},
        morningstar_rating: data[symbol]?.morningstar_rating || null,
        sustainability_rating: data[symbol]?.sustainability_rating || null,
        net_flows_30d: data[symbol]?.net_flows_30d || null,
        recent_news_sentiment: data[symbol]?.sentiment || null,
        holdings_concentration: data[symbol]?.concentration || null,
      }));
    } catch (error) {
      console.error('❌ Erro ao parsear resposta da Perplexity:', error);
      return [];
    }
  }

  // Atualizar dados do ETF no banco
  private async updateETFData(data: ETFEnrichmentData): Promise<void> {
    try {
      const updateData: any = {
        last_enrichment_date: new Date().toISOString(),
        enrichment_status: 'updated',
      };

      // Adicionar apenas dados válidos
      if (data.top_10_holdings.length > 0) {
        updateData.top_10_holdings = data.top_10_holdings;
      }
      if (Object.keys(data.sector_allocation).length > 0) {
        updateData.sector_allocation = data.sector_allocation;
      }
      if (data.morningstar_rating) {
        updateData.morningstar_rating = data.morningstar_rating;
      }
      if (data.sustainability_rating) {
        updateData.sustainability_rating = data.sustainability_rating;
      }
      if (data.net_flows_30d !== null) {
        updateData.net_flows_30d = data.net_flows_30d;
      }
      if (data.recent_news_sentiment !== null) {
        updateData.recent_news_sentiment = data.recent_news_sentiment;
      }
      if (data.holdings_concentration !== null) {
        updateData.holdings_concentration = data.holdings_concentration;
      }

      const { error } = await supabase
        .from('etfs_ativos_reais')
        .update(updateData)
        .eq('symbol', data.symbol);

      if (error) {
        console.error(`❌ Erro ao atualizar ${data.symbol}:`, error);
      } else {
        console.log(`✅ ${data.symbol} atualizado com sucesso`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${data.symbol}:`, error);
    }
  }

  // Gerar relatório de atualização
  async generateUpdateReport(): Promise<any> {
    const { data, error } = await supabase
      .from('etfs_ativos_reais')
      .select(`
        symbol,
        last_enrichment_date,
        enrichment_status,
        morningstar_rating,
        sustainability_rating,
        recent_news_sentiment
      `)
      .not('last_enrichment_date', 'is', null)
      .order('last_enrichment_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    return {
      total_enriched: data?.length || 0,
      last_update: data?.[0]?.last_enrichment_date || null,
      coverage: {
        morningstar: data?.filter(etf => etf.morningstar_rating).length || 0,
        esg: data?.filter(etf => etf.sustainability_rating).length || 0,
        sentiment: data?.filter(etf => etf.recent_news_sentiment !== null).length || 0,
      },
      recent_updates: data?.slice(0, 10) || [],
    };
  }
}

// Função para executar via cron job ou API
export async function runETFAutoUpdate() {
  const updater = new ETFAutoUpdater();
  await updater.runDailyUpdate();
  return await updater.generateUpdateReport();
} 