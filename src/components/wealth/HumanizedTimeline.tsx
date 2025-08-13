"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  RefreshCw,
  Camera,
  Upload,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react'

interface TimelineEvent {
  id: string
  event_type: string
  event_date: string
  payload: any
  created_at: string
}

interface HumanizedTimelineProps {
  portfolioId?: string
  userId?: string
}

// Função para humanizar eventos da timeline
const humanizeEvent = (event: TimelineEvent) => {
  const date = new Date(event.event_date).toLocaleDateString('pt-BR')
  const payload = event.payload || {}

  const eventMap: Record<string, any> = {
    'PLAN_CREATED': {
      icon: Sparkles,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Você criou seu plano de investimentos!',
      description: `Plano "${payload.plan_name}" criado com ${payload.etf_count} ETFs`,
      emoji: ''
    },
    'TRADE_EXECUTED': {
      icon: payload.side === 'BUY' ? Plus : Minus,
      color: payload.side === 'BUY' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200',
      title: payload.side === 'BUY' ? 'Você comprou mais ETFs!' : 'Você vendeu ETFs',
      description: `${payload.side === 'BUY' ? 'Comprou' : 'Vendeu'} ${payload.quantity} cotas de ${payload.etf_symbol} por $${payload.total_amount?.toFixed(2)}`,
      emoji: ''
    },
    'CONTRIBUTION_ADDED': {
      icon: DollarSign,
      color: 'bg-green-100 text-green-800 border-green-200',
      title: 'Você adicionou dinheiro!',
      description: `Aporte de $${payload.amount?.toLocaleString()} distribuído automaticamente`,
      emoji: ''
    },
    'REBALANCE_EXECUTED': {
      icon: Target,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      title: 'Sua carteira foi rebalanceada!',
      description: `Carteira ajustada para manter o equilíbrio ideal`,
      emoji: ''
    },
    'AUTO_DEPOSITS_CONFIGURED': {
      icon: Settings,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Depósitos automáticos configurados!',
      description: `$${payload.monthly_amount} todo dia ${payload.day_of_month} do mês`,
      emoji: ''
    },
    'AUTO_REBALANCE_CONFIGURED': {
      icon: Settings,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      title: 'Rebalanceamento automático ativado!',
      description: `Carteira será ajustada automaticamente quando sair da faixa`,
      emoji: ''
    },
    'DIVIDEND_RECEIVED': {
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      title: 'Você recebeu dividendos!',
      description: `$${payload.amount?.toFixed(2)} de dividendos de ${payload.etf_symbol}`,
      emoji: ''
    },
    'PERFORMANCE_MILESTONE': {
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800 border-green-200',
      title: 'Marco de performance atingido!',
      description: `Sua carteira ${payload.milestone_type === 'gain' ? 'ganhou' : 'atingiu'} ${payload.value}`,
      emoji: ''
    }
  }

  const eventConfig = eventMap[event.event_type] || {
    icon: Calendar,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    title: 'Evento registrado',
    description: event.event_type,
    emoji: '📝'
  }

  return {
    ...eventConfig,
    date,
    originalEvent: event
  }
}

export default function HumanizedTimeline({ portfolioId, userId }: HumanizedTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'important'>('all')

  useEffect(() => {
    fetchTimeline()
  }, [portfolioId, userId])

  const fetchTimeline = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      if (portfolioId) params.append('portfolio_id', portfolioId)

      const response = await fetch(`/api/wealth/timeline?${params}`)
      const result = await response.json()

      if (result.success) {
        setEvents(result.data)
      }
    } catch (error) {
      console.error('Erro ao buscar timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar eventos importantes
  const importantEventTypes = [
    'PLAN_CREATED',
    'TRADE_EXECUTED', 
    'CONTRIBUTION_ADDED',
    'REBALANCE_EXECUTED',
    'DIVIDEND_RECEIVED',
    'PERFORMANCE_MILESTONE'
  ]

  const filteredEvents = filter === 'important' 
    ? events.filter(event => importantEventTypes.includes(event.event_type))
    : events

  const humanizedEvents = filteredEvents.map(humanizeEvent)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Carregando histórico...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Sua jornada de investimentos
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tudo
            </Button>
            <Button
              variant={filter === 'important' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('important')}
            >
              Só o importante
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {humanizedEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhum evento ainda</p>
            <p className="text-sm text-gray-400">
              Seus investimentos e ações aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {humanizedEvents.map((event, index) => {
              const Icon = event.icon
              return (
                <div key={event.originalEvent.id} className="flex items-start space-x-4">
                  {/* Linha temporal */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${event.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {index < humanizedEvents.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Conteúdo do evento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {event.emoji} {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {event.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
