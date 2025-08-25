"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Building2,
  RefreshCw,
  Target
} from 'lucide-react'

interface TimelineEvent {
  id: string
  date: string
  type: 'TRADE' | 'REBALANCE' | 'CONTRIBUTION' | 'DIVIDEND'
  symbol?: string
  asset_type?: 'ETF' | 'STOCK'
  action?: 'BUY' | 'SELL'
  quantity?: number
  price?: number
  amount?: number
  description: string
}

interface UniversalTimelineProps {
  planId: string
  events?: TimelineEvent[]
}

export default function UniversalTimeline({ planId, events = [] }: UniversalTimelineProps) {
  // Dados simulados para demonstração
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'TRADE',
      symbol: 'VTI',
      asset_type: 'ETF',
      action: 'BUY',
      quantity: 10,
      price: 220.50,
      amount: 2205,
      description: 'Compra inicial de VTI - ETF de mercado total'
    },
    {
      id: '2',
      date: '2024-01-10',
      type: 'TRADE',
      symbol: 'AAPL',
      asset_type: 'STOCK',
      action: 'BUY',
      quantity: 5,
      price: 185.20,
      amount: 926,
      description: 'Compra de ações da Apple'
    },
    {
      id: '3',
      date: '2024-01-05',
      type: 'CONTRIBUTION',
      amount: 5000,
      description: 'Aporte mensal de janeiro'
    },
    {
      id: '4',
      date: '2024-01-01',
      type: 'REBALANCE',
      description: 'Rebalanceamento automático do portfolio'
    }
  ]

  const timelineEvents = events.length > 0 ? events : mockEvents

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'TRADE':
        if (event.asset_type === 'ETF') {
          return <BarChart3 className="h-4 w-4 text-blue-600" />
        } else {
          return <Building2 className="h-4 w-4 text-green-600" />
        }
      case 'REBALANCE':
        return <RefreshCw className="h-4 w-4 text-purple-600" />
      case 'CONTRIBUTION':
        return <DollarSign className="h-4 w-4 text-emerald-600" />
      case 'DIVIDEND':
        return <Target className="h-4 w-4 text-orange-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventBadge = (event: TimelineEvent) => {
    switch (event.type) {
      case 'TRADE':
        if (event.action === 'BUY') {
          return <Badge className="bg-green-100 text-green-800">Compra</Badge>
        } else {
          return <Badge className="bg-red-100 text-red-800">Venda</Badge>
        }
      case 'REBALANCE':
        return <Badge className="bg-purple-100 text-purple-800">Rebalanceamento</Badge>
      case 'CONTRIBUTION':
        return <Badge className="bg-emerald-100 text-emerald-800">Aporte</Badge>
      case 'DIVIDEND':
        return <Badge className="bg-orange-100 text-orange-800">Dividendo</Badge>
      default:
        return <Badge variant="secondary">Evento</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline do Portfolio
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum evento registrado ainda</p>
            <p className="text-sm text-gray-500 mt-2">
              Suas operações e atividades aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Ícone */}
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                  {getEventIcon(event)}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEventBadge(event)}
                      <span className="text-sm text-gray-600">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    
                    {event.amount && (
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(event.amount)}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-900 font-medium mb-1">
                    {event.description}
                  </p>

                  {/* Detalhes da operação */}
                  {event.type === 'TRADE' && event.symbol && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {event.asset_type === 'ETF' ? (
                          <BarChart3 className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        {event.symbol}
                      </span>
                      
                      {event.quantity && (
                        <span>
                          {event.quantity} {event.asset_type === 'ETF' ? 'cotas' : 'ações'}
                        </span>
                      )}
                      
                      {event.price && (
                        <span>
                          @ {formatCurrency(event.price)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



