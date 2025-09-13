import { mcp_perplexity_ask } from '@/lib/mcp-clients';

export interface YahooFinanceData {
  symbol: string;
  currentPrice?: number;
  marketCap?: number;
  peRatio?: number;
  pegRatio?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  volume?: number;
  avgVolume?: number;
  week52High?: number;
  week52Low?: number;
  ytdReturn?: number;
  totalReturn1Y?: number;
  totalReturn3Y?: number;
  totalReturn5Y?: number;
  expenseRatio?: number;
  nav?: number;
  premiumDiscount?: number;
  topHoldings?: string[];
  sectorAllocation?: Record<string, number>;
  analystRating?: string;
  priceTarget?: number;
  revenue?: number;
  revenueGrowth?: number;
  earningsGrowth?: number;
  roe?: number;
  roa?: number;
  bookValue?: number;
  shortInterest?: number;
  lastUpdated?: Date;
}

export interface EnrichedAssetData {
  symbol: string;
  type: 'stock' | 'etf';
  yahooFinanceData?: YahooFinanceData;
  insights?: {
    investmentThesis?: string;
    riskFactors?: string[];
    keyMetrics?: string;
    marketPosition?: string;
    recommendation?: string;
  };
  error?: string;
}

export class PerplexityEnrichmentService {
  private static instance: PerplexityEnrichmentService;
  private cache: Map<string, EnrichedAssetData> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

  static getInstance(): PerplexityEnrichmentService {
    if (!PerplexityEnrichmentService.instance) {
      PerplexityEnrichmentService.instance = new PerplexityEnrichmentService();
    }
    return PerplexityEnrichmentService.instance;
  }

  private getCacheKey(symbol: string, type: 'stock' | 'etf'): string {
    return `${symbol}_${type}`;
  }

  private isValidCacheEntry(entry: EnrichedAssetData): boolean {
    if (!entry.yahooFinanceData?.lastUpdated) return false;
    const now = new Date().getTime();
    const entryTime = entry.yahooFinanceData.lastUpdated.getTime();
    return (now - entryTime) < this.CACHE_DURATION;
  }

  async enrichAssetData(
    symbol: string, 
    type: 'stock' | 'etf',
    basicData?: any
  ): Promise<EnrichedAssetData> {
    const cacheKey = this.getCacheKey(symbol, type);
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCacheEntry(cached)) {
      return cached;
    }

    try {
      console.log(`🔍 Enriquecendo dados para ${symbol} (${type})...`);
      
      // Buscar dados do Yahoo Finance via Perplexity
      const yahooData = await this.fetchYahooFinanceData(symbol, type);
      
      // Buscar insights de investimento
      const insights = await this.generateInvestmentInsights(symbol, type, yahooData, basicData);

      const enrichedData: EnrichedAssetData = {
        symbol,
        type,
        yahooFinanceData: yahooData,
        insights
      };

      // Salvar no cache
      this.cache.set(cacheKey, enrichedData);
      
      console.log(`✅ Dados enriquecidos para ${symbol}`);
      return enrichedData;

    } catch (error) {
      console.error(`❌ Erro ao enriquecer dados para ${symbol}:`, error);
      
      const errorData: EnrichedAssetData = {
        symbol,
        type,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      return errorData;
    }
  }

  private async fetchYahooFinanceData(
    symbol: string, 
    type: 'stock' | 'etf'
  ): Promise<YahooFinanceData> {
    const prompt = type === 'etf' 
      ? `Get current Yahoo Finance data for ETF ${symbol}. Include: current price, NAV, expense ratio, total returns (1Y, 3Y, 5Y), top 5 holdings, sector allocation, dividend yield, beta, volume data, 52-week high/low, YTD return, premium/discount to NAV. Format as structured data.`
      : `Get current Yahoo Finance data for stock ${symbol}. Include: current price, market cap, P/E ratio, PEG ratio, EPS, dividend yield, beta, volume data, 52-week high/low, YTD return, analyst rating, price target, revenue, revenue growth, earnings growth, ROE, ROA, book value. Format as structured data.`;

    const response = await mcp_perplexity_ask({
      messages: [
        {
          role: "system",
          content: "You are a financial data assistant. Provide accurate, current financial data from Yahoo Finance in a structured format. If data is not available, indicate clearly."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Parse da resposta e estruturação dos dados
    return this.parseYahooFinanceResponse(response.result, symbol, type);
  }

  private parseYahooFinanceResponse(
    response: string, 
    symbol: string, 
    type: 'stock' | 'etf'
  ): YahooFinanceData {
    // Implementação básica de parsing
    // Em um cenário real, seria mais sofisticado
    const data: YahooFinanceData = {
      symbol,
      lastUpdated: new Date()
    };

    // Extrair dados numéricos básicos usando regex
    const extractNumber = (pattern: RegExp): number | undefined => {
      const match = response.match(pattern);
      if (match && match[1]) {
        const num = parseFloat(match[1].replace(/[,$%]/g, ''));
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    // Padrões de extração comuns
    data.currentPrice = extractNumber(/(?:current price|price)[:\s]*\$?([\d,]+\.?\d*)/i);
    data.marketCap = extractNumber(/market cap[:\s]*\$?([\d,]+\.?\d*[BMK]?)/i);
    data.peRatio = extractNumber(/p\/e ratio[:\s]*([\d,]+\.?\d*)/i);
    data.dividendYield = extractNumber(/dividend yield[:\s]*([\d,]+\.?\d*)%?/i);
    data.beta = extractNumber(/beta[:\s]*([\d,]+\.?\d*)/i);
    data.ytdReturn = extractNumber(/ytd return[:\s]*(-?[\d,]+\.?\d*)%?/i);

    if (type === 'etf') {
      data.expenseRatio = extractNumber(/expense ratio[:\s]*([\d,]+\.?\d*)%?/i);
      data.nav = extractNumber(/nav[:\s]*\$?([\d,]+\.?\d*)/i);
    }

    return data;
  }

  private async generateInvestmentInsights(
    symbol: string,
    type: 'stock' | 'etf',
    yahooData: YahooFinanceData,
    basicData?: any
  ): Promise<{
    investmentThesis?: string;
    riskFactors?: string[];
    keyMetrics?: string;
    marketPosition?: string;
    recommendation?: string;
  }> {
    const contextInfo = basicData ? `
    Basic data: ${JSON.stringify(basicData)}
    Yahoo Finance data: ${JSON.stringify(yahooData)}
    ` : `Yahoo Finance data: ${JSON.stringify(yahooData)}`;

    const prompt = type === 'etf'
      ? `Analyze ETF ${symbol} and provide investment insights. ${contextInfo}
         
         Provide:
         1. Investment thesis (2-3 sentences)
         2. Key risk factors (3-4 bullet points)
         3. Key metrics summary (1-2 sentences)
         4. Market position (1-2 sentences)
         5. General recommendation (suitable for beginners)
         
         Keep it concise and educational.`
      : `Analyze stock ${symbol} and provide investment insights. ${contextInfo}
         
         Provide:
         1. Investment thesis (2-3 sentences)
         2. Key risk factors (3-4 bullet points)
         3. Key metrics summary (1-2 sentences)
         4. Market position (1-2 sentences)
         5. General recommendation (suitable for beginners)
         
         Keep it concise and educational.`;

    try {
      const response = await mcp_perplexity_ask({
        messages: [
          {
            role: "system",
            content: "You are a financial analyst providing educational investment insights. Be objective, educational, and suitable for beginner investors. Avoid specific buy/sell recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return this.parseInsightsResponse(response.result);
    } catch (error) {
      console.error(`Erro ao gerar insights para ${symbol}:`, error);
      return {};
    }
  }

  private parseInsightsResponse(response: string): {
    investmentThesis?: string;
    riskFactors?: string[];
    keyMetrics?: string;
    marketPosition?: string;
    recommendation?: string;
  } {
    const insights: any = {};

    // Extrair seções usando regex simples
    const extractSection = (sectionName: string): string | undefined => {
      const pattern = new RegExp(`${sectionName}[:\s]*(.*?)(?=\\d+\\.|$)`, 'is');
      const match = response.match(pattern);
      return match ? match[1].trim() : undefined;
    };

    insights.investmentThesis = extractSection('Investment thesis|1\\.');
    insights.keyMetrics = extractSection('Key metrics|3\\.');
    insights.marketPosition = extractSection('Market position|4\\.');
    insights.recommendation = extractSection('recommendation|5\\.');

    // Extrair fatores de risco como array
    const riskSection = extractSection('risk factors|2\\.');
    if (riskSection) {
      insights.riskFactors = riskSection
        .split(/[-•\n]/)
        .filter(item => item.trim().length > 10)
        .map(item => item.trim())
        .slice(0, 4);
    }

    return insights;
  }

  // Método para buscar dados em lote
  async enrichMultipleAssets(
    assets: Array<{ symbol: string; type: 'stock' | 'etf'; basicData?: any }>
  ): Promise<EnrichedAssetData[]> {
    console.log(`🔍 Enriquecendo ${assets.length} ativos em lote...`);
    
    const promises = assets.map(asset => 
      this.enrichAssetData(asset.symbol, asset.type, asset.basicData)
    );

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Erro ao processar ${assets[index].symbol}:`, result.reason);
        return {
          symbol: assets[index].symbol,
          type: assets[index].type,
          error: 'Falha no processamento'
        };
      }
    });
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache do Perplexity limpo');
  }

  // Obter estatísticas do cache
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const perplexityEnrichment = PerplexityEnrichmentService.getInstance();

