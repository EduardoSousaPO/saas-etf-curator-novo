// API para monitoramento do status de enriquecimento
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface EnrichmentStats {
  total_stocks: number
  completeness_rates: Record<string, number>
  missing_counts: Record<string, number>
  priority_analysis: {
    high_priority: number
    medium_priority: number
    low_priority: number
  }
  last_updated: string
}

class EnrichmentMonitor {
  async getDetailedStats(): Promise<EnrichmentStats> {
    // Query para estatísticas detalhadas
    const { data: stocks, error } = await supabase
      .from('stocks_unified')
      .select(`
        ticker,
        market_cap,
        returns_12m,
        returns_24m,
        returns_36m,
        returns_5y,
        ten_year_return,
        volatility_12m,
        volatility_24m,
        volatility_36m,
        ten_year_volatility,
        max_drawdown,
        sharpe_12m,
        sharpe_24m,
        sharpe_36m,
        ten_year_sharpe,
        beta_coefficient,
        dividend_yield_12m,
        dividends_12m,
        dividends_24m,
        dividends_36m,
        dividends_all_time,
        last_updated
      `)

    if (error) {
      throw new Error(`Erro ao buscar dados: ${error.message}`)
    }

    const total = stocks?.length || 0
    
    // Calcular completude para cada métrica
    const metrics = [
      'returns_12m', 'returns_24m', 'returns_36m', 'returns_5y', 'ten_year_return',
      'volatility_12m', 'volatility_24m', 'volatility_36m', 'ten_year_volatility',
      'max_drawdown', 'sharpe_12m', 'sharpe_24m', 'sharpe_36m', 'ten_year_sharpe',
      'beta_coefficient', 'dividend_yield_12m', 'dividends_12m', 'dividends_24m',
      'dividends_36m', 'dividends_all_time'
    ]

    const completeness_rates: Record<string, number> = {}
    const missing_counts: Record<string, number> = {}

    metrics.forEach(metric => {
      const completed = stocks?.filter(stock => stock[metric as keyof typeof stock] !== null).length || 0
      completeness_rates[metric] = Number(((completed / total) * 100).toFixed(2))
      missing_counts[metric] = total - completed
    })

    // Análise por prioridade baseada no market cap
    const high_priority = stocks?.filter(s => s.market_cap && s.market_cap > 1000000000).length || 0
    const medium_priority = stocks?.filter(s => s.market_cap && s.market_cap > 100000000 && s.market_cap <= 1000000000).length || 0
    const low_priority = total - high_priority - medium_priority

    return {
      total_stocks: total,
      completeness_rates,
      missing_counts,
      priority_analysis: {
        high_priority,
        medium_priority,
        low_priority
      },
      last_updated: new Date().toISOString()
    }
  }

  async getRecentActivity(): Promise<any[]> {
    // Buscar ações atualizadas recentemente
    const { data: recent, error } = await supabase
      .from('stocks_unified')
      .select('ticker, last_updated, source_meta')
      .not('last_updated', 'is', null)
      .order('last_updated', { ascending: false })
      .limit(20)

    if (error) {
      throw new Error(`Erro ao buscar atividade recente: ${error.message}`)
    }

    return recent || []
  }

  async getTopIncompleteStocks(): Promise<any[]> {
    // Buscar ações com mais dados faltantes (alta prioridade)
    const { data: stocks, error } = await supabase
      .from('stocks_unified')
      .select(`
        ticker,
        name,
        market_cap,
        returns_24m,
        returns_36m,
        returns_5y,
        ten_year_return,
        volatility_24m,
        ten_year_volatility,
        sharpe_24m,
        ten_year_sharpe
      `)
      .gte('market_cap', 1000000000) // Apenas > $1B
      .or('returns_24m.is.null,returns_36m.is.null,returns_5y.is.null,ten_year_return.is.null')
      .order('market_cap', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error(`Erro ao buscar ações incompletas: ${error.message}`)
    }

    // Calcular score de incompletude
    const scored = stocks?.map(stock => {
      const missing_count = [
        'returns_24m', 'returns_36m', 'returns_5y', 'ten_year_return',
        'volatility_24m', 'ten_year_volatility', 'sharpe_24m', 'ten_year_sharpe'
      ].filter(field => stock[field as keyof typeof stock] === null).length

      return {
        ...stock,
        missing_metrics: missing_count,
        completeness_score: ((8 - missing_count) / 8) * 100
      }
    }).sort((a, b) => a.missing_metrics - b.missing_metrics || (b.market_cap || 0) - (a.market_cap || 0))

    return scored || []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detail = searchParams.get('detail') || 'basic'

    console.log(`📊 Consultando status de enriquecimento (${detail})...`)

    const monitor = new EnrichmentMonitor()

    if (detail === 'full') {
      // Status completo com todas as análises
      const [stats, recent, incomplete] = await Promise.all([
        monitor.getDetailedStats(),
        monitor.getRecentActivity(),
        monitor.getTopIncompleteStocks()
      ])

      return NextResponse.json({
        success: true,
        status: 'operational',
        statistics: stats,
        recent_activity: recent,
        priority_targets: incomplete,
        recommendations: {
          next_batch_size: 100,
          estimated_completion_time: `${Math.ceil(stats.missing_counts.returns_24m / 100)} horas`,
          priority_focus: 'returns_24m, volatility_24m, sharpe_24m'
        },
        timestamp: new Date().toISOString()
      })

    } else {
      // Status básico (mais rápido)
      const stats = await monitor.getDetailedStats()

      // Identificar métricas mais críticas (>90% faltante)
      const critical_metrics = Object.entries(stats.completeness_rates)
        .filter(([_, rate]) => rate < 10)
        .map(([metric, rate]) => ({ metric, completeness: rate }))
        .sort((a, b) => a.completeness - b.completeness)

      return NextResponse.json({
        success: true,
        status: 'operational',
        summary: {
          total_stocks: stats.total_stocks,
          avg_completeness: Number((
            Object.values(stats.completeness_rates).reduce((a, b) => a + b, 0) / 
            Object.values(stats.completeness_rates).length
          ).toFixed(2)),
          critical_metrics: critical_metrics.slice(0, 5),
          high_priority_pending: stats.priority_analysis.high_priority
        },
        last_updated: stats.last_updated
      })
    }

  } catch (error) {
    console.error('❌ Erro ao consultar status:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, target } = body

    console.log(`🎯 Executando ação: ${action} para ${target}`)

    switch (action) {
      case 'mark_priority':
        // Marcar ações como alta prioridade para próximo lote
        // TODO: Implementar sistema de filas de prioridade
        return NextResponse.json({
          success: true,
          message: `${target} marcado como alta prioridade`,
          timestamp: new Date().toISOString()
        })

      case 'reset_metrics':
        // Resetar métricas específicas para recálculo
        if (!target || typeof target !== 'string') {
          throw new Error('Target ticker é obrigatório')
        }

        const resetData = {
          returns_24m: null,
          returns_36m: null,
          returns_5y: null,
          ten_year_return: null,
          volatility_24m: null,
          volatility_36m: null,
          ten_year_volatility: null,
          sharpe_24m: null,
          sharpe_36m: null,
          ten_year_sharpe: null,
          source_meta: {
            reset_date: new Date().toISOString(),
            reset_reason: 'Manual reset for recalculation'
          }
        }

        const { error } = await supabase
          .from('stocks_unified')
          .update(resetData)
          .eq('ticker', target)

        if (error) {
          throw new Error(`Erro ao resetar ${target}: ${error.message}`)
        }

        return NextResponse.json({
          success: true,
          message: `Métricas resetadas para ${target}`,
          timestamp: new Date().toISOString()
        })

      default:
        throw new Error(`Ação não reconhecida: ${action}`)
    }

  } catch (error) {
    console.error('❌ Erro na ação:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



