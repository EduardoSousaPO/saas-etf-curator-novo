"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, DollarSign, Calendar, TrendingUp, Building2, BarChart3 } from 'lucide-react'

interface UniversalTradeEntryProps {
  planId: string
  onClose: () => void
  onSuccess: () => void
}

export default function UniversalTradeEntry({ planId, onClose, onSuccess }: UniversalTradeEntryProps) {
  const [tradeData, setTradeData] = useState({
    symbol: '',
    asset_type: 'ETF' as 'ETF' | 'STOCK',
    action: 'BUY' as 'BUY' | 'SELL',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Por enquanto, simular sucesso
      // Na implementação real, fazer chamada para API unificada
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Registrando operação:', {
        planId,
        ...tradeData,
        quantity: parseFloat(tradeData.quantity),
        price: parseFloat(tradeData.price)
      })

      onSuccess()
    } catch (err) {
      setError('Erro ao registrar operação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Registrar Operação
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Ativo */}
            <div className="space-y-2">
              <Label htmlFor="asset_type">Tipo de Ativo</Label>
              <Select
                value={tradeData.asset_type}
                onValueChange={(value: 'ETF' | 'STOCK') => 
                  setTradeData(prev => ({ ...prev, asset_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETF">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      ETF
                    </div>
                  </SelectItem>
                  <SelectItem value="STOCK">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-green-600" />
                      Stock
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Símbolo */}
            <div className="space-y-2">
              <Label htmlFor="symbol">
                Símbolo {tradeData.asset_type === 'ETF' ? 'do ETF' : 'da Ação'}
              </Label>
              <Input
                id="symbol"
                value={tradeData.symbol}
                onChange={(e) => setTradeData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder={tradeData.asset_type === 'ETF' ? 'Ex: VTI, SPY' : 'Ex: AAPL, MSFT'}
                required
              />
            </div>

            {/* Ação */}
            <div className="space-y-2">
              <Label htmlFor="action">Operação</Label>
              <Select
                value={tradeData.action}
                onValueChange={(value: 'BUY' | 'SELL') => 
                  setTradeData(prev => ({ ...prev, action: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Compra
                    </div>
                  </SelectItem>
                  <SelectItem value="SELL">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                      Venda
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {tradeData.asset_type === 'ETF' ? 'Cotas' : 'Ações'}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={tradeData.quantity}
                  onChange={(e) => setTradeData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Preço (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={tradeData.price}
                  onChange={(e) => setTradeData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">Data da Operação</Label>
              <Input
                id="date"
                type="date"
                value={tradeData.date}
                onChange={(e) => setTradeData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Input
                id="notes"
                value={tradeData.notes}
                onChange={(e) => setTradeData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas sobre a operação..."
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Resumo */}
            {tradeData.symbol && tradeData.quantity && tradeData.price && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Resumo:</strong> {tradeData.action === 'BUY' ? 'Comprar' : 'Vender'} {' '}
                  {tradeData.quantity} {tradeData.asset_type === 'ETF' ? 'cotas' : 'ações'} de {' '}
                  {tradeData.symbol} por ${tradeData.price} cada
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  <strong>Total:</strong> ${(parseFloat(tradeData.quantity) * parseFloat(tradeData.price)).toFixed(2)}
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Registrando...' : 'Registrar Operação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



