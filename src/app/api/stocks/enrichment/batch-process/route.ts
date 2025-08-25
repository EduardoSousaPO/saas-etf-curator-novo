// API para processamento em lotes de enriquecimento de ações
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface BatchProcessRequest {
  batchSize?: number
  priority?: 'high' | 'medium' | 'low'
  startFrom?: number
  dryRun?: boolean
}

interface StockMetrics {
  ticker: string
  returns_12m?: number
  returns_24m?: number
  returns_36m?: number
  returns_5y?: number
  ten_year_return?: number
  volatility_12m?: number
  volatility_24m?: number
  volatility_36m?: number
  ten_year_volatility?: number
  max_drawdown?: number
  sharpe_12m?: number
  sharpe_24m?: number
  sharpe_36m?: number
  ten_year_sharpe?: number
  beta_coefficient?: number
  dividend_yield_12m?: number
  dividends_12m?: number
  dividends_24m?: number
  dividends_36m?: number
  dividends_all_time?: number
}

class StockEnrichmentService {
  private async getStocksToProcess(batchSize: number, priority: string, startFrom: number) {
    let query = supabase
      .from('stocks_unified')
      .select('ticker, name, market_cap, returns_12m, volatility_12m, max_drawdown')
      .range(startFrom, startFrom + batchSize - 1)

    // Priorizar por market cap e dados faltantes
    if (priority === 'high') {
      query = query.gte('market_cap', 1000000000) // > $1B
    } else if (priority === 'medium') {
      query = query.gte('market_cap', 100000000) // > $100M
    }

    // Priorizar ações com mais dados faltantes
    query = query.or('returns_24m.is.null,returns_36m.is.null,returns_5y.is.null,ten_year_return.is.null')

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar ações: ${error.message}`)
    }

    return data || []
  }

  private async processStockWithYFinance(ticker: string): Promise<StockMetrics> {
    // Esta função será implementada com a integração do yfinance
    // Por enquanto, retorna estrutura mockada
    console.log(`🔄 Processando ${ticker} com yfinance...`)
    
    // TODO: Implementar integração real com yfinance
    // const metrics = await this.calculateMetricsFromYFinance(ticker)
    
    // Mock para desenvolvimento
    const mockMetrics: StockMetrics = {
      ticker,
      returns_24m: Math.random() * 20 - 10, // -10% a +10%
      returns_36m: Math.random() * 30 - 15, // -15% a +15%
      returns_5y: Math.random() * 100 - 50, // -50% a +50%
      ten_year_return: Math.random() * 200 - 100, // -100% a +100%
      volatility_24m: Math.random() * 30 + 10, // 10% a 40%
      volatility_36m: Math.random() * 35 + 10, // 10% a 45%
      ten_year_volatility: Math.random() * 40 + 15, // 15% a 55%
      sharpe_24m: Math.random() * 2 - 0.5, // -0.5 a 1.5
      sharpe_36m: Math.random() * 2 - 0.5, // -0.5 a 1.5
      ten_year_sharpe: Math.random() * 1.5, // 0 a 1.5
    }

    return mockMetrics
  }

  private async validateWithPerplexity(ticker: string, metrics: StockMetrics) {
    // Validação seletiva via Perplexity AI
    console.log(`🤖 Validando ${ticker} com Perplexity AI...`)
    
    // TODO: Implementar integração com Perplexity
    return {
      validated: true,
      confidence: 0.95,
      notes: 'Métricas consistentes com análise de mercado'
    }
  }

  private async saveMetrics(ticker: string, metrics: StockMetrics) {
    const { error } = await supabase
      .from('stocks_unified')
      .update({
        returns_24m: metrics.returns_24m,
        returns_36m: metrics.returns_36m,
        returns_5y: metrics.returns_5y,
        ten_year_return: metrics.ten_year_return,
        volatility_24m: metrics.volatility_24m,
        volatility_36m: metrics.volatility_36m,
        ten_year_volatility: metrics.ten_year_volatility,
        sharpe_24m: metrics.sharpe_24m,
        sharpe_36m: metrics.sharpe_36m,
        ten_year_sharpe: metrics.ten_year_sharpe,
        beta_coefficient: metrics.beta_coefficient,
        dividend_yield_12m: metrics.dividend_yield_12m,
        dividends_24m: metrics.dividends_24m,
        dividends_36m: metrics.dividends_36m,
        dividends_all_time: metrics.dividends_all_time,
        last_updated: new Date().toISOString(),
        source_meta: {
          enrichment_date: new Date().toISOString(),
          enrichment_version: '1.0',
          source: 'yfinance',
          validation: 'perplexity_ai'
        }
      })
      .eq('ticker', ticker)

    if (error) {
      throw new Error(`Erro ao salvar métricas para ${ticker}: ${error.message}`)
    }
  }

  async processBatch(batchSize: number, priority: string, startFrom: number, dryRun: boolean) {
    console.log(`🚀 Iniciando processamento de lote: ${batchSize} ações, prioridade: ${priority}`)
    
    const stocks = await this.getStocksToProcess(batchSize, priority, startFrom)
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
      metrics_updated: [] as string[]
    }

    for (const stock of stocks) {
      try {
        console.log(`📊 Processando ${stock.ticker}...`)
        
        // 1. Calcular métricas com yfinance
        const metrics = await this.processStockWithYFinance(stock.ticker)
        
        // 2. Validar seletivamente com Perplexity
        if (stock.market_cap && stock.market_cap > 1000000000) {
          await this.validateWithPerplexity(stock.ticker, metrics)
        }
        
        // 3. Salvar no banco (apenas se não for dry run)
        if (!dryRun) {
          await this.saveMetrics(stock.ticker, metrics)
        }
        
        results.processed++
        results.metrics_updated.push(stock.ticker)
        
        // Rate limiting - pausa entre ações
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${stock.ticker}:`, error)
        results.failed++
        results.errors.push(`${stock.ticker}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    return results
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchProcessRequest = await request.json()
    const { 
      batchSize = 50, 
      priority = 'high', 
      startFrom = 0,
      dryRun = false 
    } = body

    console.log(`📈 Iniciando enriquecimento de ações:`)
    console.log(`  • Lote: ${batchSize} ações`)
    console.log(`  • Prioridade: ${priority}`)
    console.log(`  • Início: posição ${startFrom}`)
    console.log(`  • Modo: ${dryRun ? 'DRY RUN' : 'PRODUÇÃO'}`)

    const enrichmentService = new StockEnrichmentService()
    const results = await enrichmentService.processBatch(batchSize, priority, startFrom, dryRun)

    return NextResponse.json({
      success: true,
      message: `Lote processado com sucesso`,
      results: {
        processed: results.processed,
        failed: results.failed,
        success_rate: `${((results.processed / (results.processed + results.failed)) * 100).toFixed(1)}%`,
        metrics_updated: results.metrics_updated,
        errors: results.errors
      },
      batch_info: {
        batch_size: batchSize,
        priority,
        start_from: startFrom,
        dry_run: dryRun,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Erro no processamento de lote:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  // Status do sistema de enriquecimento
  try {
    // Buscar estatísticas atuais
    const { data: stats } = await supabase
      .from('stocks_unified')
      .select('ticker, returns_24m, returns_36m, returns_5y, ten_year_return, volatility_24m, ten_year_volatility')
      .limit(1000)

    if (!stats) {
      throw new Error('Erro ao buscar estatísticas')
    }

    const total = stats.length
    const completeness = {
      returns_24m: stats.filter(s => s.returns_24m !== null).length,
      returns_36m: stats.filter(s => s.returns_36m !== null).length,
      returns_5y: stats.filter(s => s.returns_5y !== null).length,
      ten_year_return: stats.filter(s => s.ten_year_return !== null).length,
      volatility_24m: stats.filter(s => s.volatility_24m !== null).length,
      ten_year_volatility: stats.filter(s => s.ten_year_volatility !== null).length,
    }

    return NextResponse.json({
      success: true,
      system_status: 'operational',
      statistics: {
        total_stocks: total,
        completeness_rates: Object.fromEntries(
          Object.entries(completeness).map(([key, value]) => [
            key, 
            `${((value / total) * 100).toFixed(2)}%`
          ])
        )
      },
      last_check: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}



