"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  DollarSign
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface SimplifiedTradeEntryProps {
  portfolioId?: string
  onTradeAdded?: () => void
}

interface ETFOption {
  symbol: string
  name: string
}

export default function SimplifiedTradeEntry({ portfolioId, onTradeAdded }: SimplifiedTradeEntryProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para trade manual simplificado
  const [etfSymbol, setEtfSymbol] = useState('')
  const [operation, setOperation] = useState<'buy' | 'sell'>('buy')
  const [totalAmount, setTotalAmount] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [inputMethod, setInputMethod] = useState<'total' | 'quantity-price'>('total')

  // Calcular automaticamente baseado no método escolhido
  React.useEffect(() => {
    if (inputMethod === 'quantity-price' && quantity && price) {
      const calculatedTotal = (parseFloat(quantity) * parseFloat(price)).toFixed(2)
      setTotalAmount(calculatedTotal)
    }
  }, [quantity, price, inputMethod])

  React.useEffect(() => {
    if (inputMethod === 'total' && totalAmount && price) {
      const calculatedQuantity = (parseFloat(totalAmount) / parseFloat(price)).toFixed(4)
      setQuantity(calculatedQuantity)
    }
  }, [totalAmount, price, inputMethod])
  
  // Estados para busca de ETF
  const [etfSearch, setEtfSearch] = useState('')
  const [etfOptions, setEtfOptions] = useState<ETFOption[]>([])
  const [showETFOptions, setShowETFOptions] = useState(false)

  // Estados para OCR
  const [ocrImage, setOcrImage] = useState<File | null>(null)
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationData, setVerificationData] = useState<any>(null)

  // Buscar ETFs conforme usuário digita
  const searchETFs = async (query: string) => {
    if (query.length < 2) {
      setEtfOptions([])
      setShowETFOptions(false)
      return
    }

    try {
      const response = await fetch(`/api/etfs?search=${encodeURIComponent(query)}&limit=10`)
      const result = await response.json()
      
      if (result.success) {
        setEtfOptions(result.data)
        setShowETFOptions(true)
      }
    } catch (error) {
      console.error('Erro ao buscar ETFs:', error)
    }
  }

  const handleETFSearchChange = (value: string) => {
    setEtfSearch(value)
    setEtfSymbol(value)
    searchETFs(value)
  }

  const selectETF = (etf: ETFOption) => {
    setEtfSymbol(etf.symbol)
    setEtfSearch(`${etf.symbol} - ${etf.name}`)
    setShowETFOptions(false)
  }

  // Registro manual simplificado
  const handleSimpleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !etfSymbol) return

    // Validar baseado no método escolhido
    if (inputMethod === 'total' && !totalAmount) return
    if (inputMethod === 'quantity-price' && (!quantity || !price)) return

    setLoading(true)
    setError(null)

    try {
      let finalQuantity: number
      let finalPrice: number
      let finalTotalAmount: number

      if (inputMethod === 'quantity-price') {
        // Usuário informou quantidade e preço
        finalQuantity = parseFloat(quantity)
        finalPrice = parseFloat(price)
        finalTotalAmount = finalQuantity * finalPrice
      } else {
        // Usuário informou valor total - buscar preço atual para calcular quantidade
        const priceResponse = await fetch(`/api/etfs/price?symbol=${etfSymbol}`)
        const priceResult = await priceResponse.json()
        
        finalPrice = 100 // Preço padrão se não encontrar
        if (priceResult.success && priceResult.data.price) {
          finalPrice = priceResult.data.price
        }

        finalTotalAmount = parseFloat(totalAmount)
        finalQuantity = finalTotalAmount / finalPrice
      }

      const response = await fetch('/api/wealth/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          portfolio_id: portfolioId,
          etf_symbol: etfSymbol.toUpperCase(),
          side: operation.toUpperCase(),
          trade_date: new Date().toISOString().split('T')[0],
          quantity: finalQuantity,
          price: finalPrice,
          currency: 'USD',
          source: inputMethod === 'quantity-price' ? 'manual_quantity_price' : 'manual_total'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // Limpar todos os campos
        setEtfSymbol('')
        setEtfSearch('')
        setTotalAmount('')
        setQuantity('')
        setPrice('')
        setOperation('buy')
        setInputMethod('total')
        setTimeout(() => setSuccess(false), 3000)
        onTradeAdded?.()
      } else {
        setError(result.error || 'Erro ao registrar operação')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  // OCR de imagem
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setOcrImage(file)
    setOcrLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('user_id', user?.id || '')
      if (portfolioId) formData.append('portfolio_id', portfolioId)

      const response = await fetch('/api/wealth/ocr-trade', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setOcrResult(result.data)
        setVerificationData({
          etf_symbol: result.data.etf_symbol || '',
          side: result.data.side || 'BUY',
          quantity: result.data.quantity || '',
          price: result.data.price || '',
          trade_date: result.data.trade_date || new Date().toISOString().split('T')[0],
          currency: result.data.currency || 'USD'
        })
        setShowVerification(true)
        setError(null)
      } else {
        setError(result.error || 'Erro ao processar imagem')
      }
    } catch (error) {
      setError('Erro ao processar imagem')
    } finally {
      setOcrLoading(false)
    }
  }

  const confirmVerifiedTrade = async () => {
    if (!verificationData) return

    setLoading(true)
    try {
      const response = await fetch('/api/wealth/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          portfolio_id: portfolioId,
          etf_symbol: verificationData.etf_symbol.toUpperCase(),
          side: verificationData.side.toUpperCase(),
          trade_date: verificationData.trade_date,
          quantity: parseFloat(verificationData.quantity),
          price: parseFloat(verificationData.price),
          currency: verificationData.currency,
          source: 'ocr_verified'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // Limpar todos os estados do OCR
        setOcrImage(null)
        setOcrResult(null)
        setShowVerification(false)
        setVerificationData(null)
        setTimeout(() => setSuccess(false), 3000)
        onTradeAdded?.()
      } else {
        setError(result.error || 'Erro ao confirmar operação')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const cancelVerification = () => {
    setShowVerification(false)
    setVerificationData(null)
    setOcrResult(null)
  }

  const updateVerificationData = (field: string, value: string) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Operação registrada!
          </h3>
          <p className="text-green-700">
            Sua carteira foi atualizada automaticamente
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="photo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo" className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Tirar foto (mais fácil)</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Digitar manualmente</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Foto da ordem */}
        <TabsContent value="photo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registrar com foto</CardTitle>
              <p className="text-sm text-gray-600">
                Tire uma foto da sua ordem de compra/venda e nossa IA vai extrair os dados automaticamente
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                
                {ocrImage ? (
                  <div className="space-y-4">
                    <img 
                      src={URL.createObjectURL(ocrImage)} 
                      alt="Ordem de compra/venda" 
                      className="max-w-full h-48 object-contain mx-auto rounded"
                    />
                    {ocrLoading ? (
                      <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Analisando imagem com OpenAI GPT-4 Vision...
                        </p>
                      </div>
                    ) : showVerification && verificationData ? (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                          <h4 className="font-semibold text-yellow-800">Verifique os dados extraídos</h4>
                        </div>
                        <p className="text-sm text-yellow-700 mb-4">
                          Nossa IA extraiu os dados abaixo. Verifique se estão corretos e corrija se necessário:
                        </p>
                        
                        <div className="space-y-3">
                          {/* ETF Symbol */}
                          <div>
                            <Label className="text-sm font-medium">ETF</Label>
                            <Input
                              value={verificationData.etf_symbol}
                              onChange={(e) => updateVerificationData('etf_symbol', e.target.value)}
                              placeholder="Ex: SPY, QQQ, VTI"
                              className="mt-1"
                            />
                          </div>

                          {/* Operação */}
                          <div>
                            <Label className="text-sm font-medium">Operação</Label>
                            <Select 
                              value={verificationData.side} 
                              onValueChange={(value) => updateVerificationData('side', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BUY">Compra</SelectItem>
                                <SelectItem value="SELL">Venda</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Quantidade e Preço */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">Quantidade</Label>
                              <Input
                                type="number"
                                value={verificationData.quantity}
                                onChange={(e) => updateVerificationData('quantity', e.target.value)}
                                placeholder="10"
                                step="0.0001"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Preço por cota</Label>
                              <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <Input
                                  type="number"
                                  value={verificationData.price}
                                  onChange={(e) => updateVerificationData('price', e.target.value)}
                                  placeholder="50.00"
                                  step="0.01"
                                  className="pl-8"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Data */}
                          <div>
                            <Label className="text-sm font-medium">Data da operação</Label>
                            <Input
                              type="date"
                              value={verificationData.trade_date}
                              onChange={(e) => updateVerificationData('trade_date', e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          {/* Preview do total */}
                          {verificationData.quantity && verificationData.price && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-blue-900">
                                Valor total: ${(parseFloat(verificationData.quantity) * parseFloat(verificationData.price)).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <Button 
                            onClick={confirmVerifiedTrade}
                            disabled={loading || !verificationData.etf_symbol || !verificationData.quantity || !verificationData.price}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                          >
                            {loading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Confirmar e registrar
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={cancelVerification}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Clique para selecionar uma foto da sua ordem
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Selecionar foto
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Manual simplificado */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registrar manualmente</CardTitle>
              <p className="text-sm text-gray-600">
                Apenas 3 informações simples
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSimpleSubmit} className="space-y-4">
                {/* Campo 1: Qual ETF */}
                <div className="relative">
                  <Label htmlFor="etf-search" className="text-base font-medium">
                    1. Qual ETF você comprou/vendeu?
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="etf-search"
                      type="text"
                      placeholder="Digite o nome ou símbolo (ex: SPY, QQQ, VTI...)"
                      value={etfSearch}
                      onChange={(e) => handleETFSearchChange(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  {/* Opções de ETF */}
                  {showETFOptions && etfOptions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {etfOptions.map((etf) => (
                        <button
                          key={etf.symbol}
                          type="button"
                          onClick={() => selectETF(etf)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                        >
                          <div className="font-medium">{etf.symbol}</div>
                          <div className="text-sm text-gray-600 truncate">{etf.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campo 2: Compra ou venda */}
                <div>
                  <Label className="text-base font-medium">
                    2. Você comprou ou vendeu?
                  </Label>
                  <Select value={operation} onValueChange={(value: 'buy' | 'sell') => setOperation(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">🟢 Comprei (investir mais)</SelectItem>
                      <SelectItem value="sell">🔴 Vendi (retirar dinheiro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo 3: Método de entrada */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    3. Como você quer informar os valores?
                  </Label>
                  
                  <div className="flex space-x-4 mb-4">
                    <Button
                      type="button"
                      variant={inputMethod === 'total' ? 'default' : 'outline'}
                      onClick={() => setInputMethod('total')}
                      className="flex-1"
                    >
                      Valor Total
                    </Button>
                    <Button
                      type="button"
                      variant={inputMethod === 'quantity-price' ? 'default' : 'outline'}
                      onClick={() => setInputMethod('quantity-price')}
                      className="flex-1"
                    >
                      Quantidade + Preço
                    </Button>
                  </div>

                  {/* Opção: Valor Total */}
                  {inputMethod === 'total' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="total-amount" className="text-sm font-medium">
                          Quanto você {operation === 'buy' ? 'gastou' : 'recebeu'} no total?
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="total-amount"
                            type="number"
                            placeholder="500.00"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            className="pl-8"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Sistema calculará a quantidade automaticamente
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Opção: Quantidade + Preço */}
                  {inputMethod === 'quantity-price' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="quantity" className="text-sm font-medium">
                            Quantidade de cotas
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="10"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            step="0.0001"
                            min="0"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price" className="text-sm font-medium">
                            Preço por cota
                          </Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              id="price"
                              type="number"
                              placeholder="50.00"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="pl-8"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {quantity && price && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900">
                            Valor total calculado: ${(parseFloat(quantity) * parseFloat(price)).toFixed(2)}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Sistema calculará o valor total automaticamente
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !etfSymbol || 
                    (inputMethod === 'total' && !totalAmount) ||
                    (inputMethod === 'quantity-price' && (!quantity || !price))
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Registrar operação
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
