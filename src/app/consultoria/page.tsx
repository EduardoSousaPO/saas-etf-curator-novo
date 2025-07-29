"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Phone, Mail, DollarSign, CheckCircle, User, Shield } from 'lucide-react'

interface TimeSlot {
  time: string
  available: boolean
}

interface DaySchedule {
  date: string
  day: string
  slots: TimeSlot[]
}

export default function ConsultoriaPage() {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    valorInvestimento: '',
    experiencia: '',
    horarioPreferencia: '',
    observacoes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Gerar próximos 14 dias úteis com horários disponíveis
  const generateSchedule = (): DaySchedule[] => {
    const schedule: DaySchedule[] = []
    const today = new Date()
    const daysToGenerate = 14
    let addedDays = 0
    let currentDate = new Date(today)

    while (addedDays < daysToGenerate) {
      currentDate.setDate(today.getDate() + addedDays + 1)
      
      // Pular fins de semana
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const dayName = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })
        
        const slots: TimeSlot[] = [
          { time: '09:00', available: Math.random() > 0.3 },
          { time: '10:00', available: Math.random() > 0.3 },
          { time: '11:00', available: Math.random() > 0.3 },
          { time: '14:00', available: Math.random() > 0.3 },
          { time: '15:00', available: Math.random() > 0.3 },
          { time: '16:00', available: Math.random() > 0.3 },
          { time: '17:00', available: Math.random() > 0.3 },
        ]

        schedule.push({
          date: dateStr,
          day: dayName,
          slots
        })
      }
      addedDays++
    }

    return schedule
  }

  const schedule = generateSchedule()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const agendamentoData = {
        ...formData,
        dataAgendamento: selectedDate,
        horarioAgendamento: selectedTime
      }

      const response = await fetch('/api/consultoria/agendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendamentoData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao agendar consultoria')
      }

      if (result.success) {
        console.log('✅ Agendamento confirmado:', result.agendamento)
        setIsSubmitted(true)
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('❌ Erro ao agendar consultoria:', error)
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                Agendamento Confirmado!
              </h2>
              <div className="space-y-3 text-green-700">
                <p>
                  <strong>Data:</strong> {formatDate(selectedDate)} às {selectedTime}
                </p>
                <p>
                  <strong>Consultor:</strong> Especialista CVM Certificado
                </p>
                <p className="text-sm">
                  Você receberá um email de confirmação com o link da videochamada em até 30 minutos.
                </p>
              </div>
              <div className="mt-6">
                <Button 
                  onClick={() => window.location.href = '/portfolio-master'}
                  className="text-white hover:opacity-90 transition-opacity duration-300"
                  style={{ backgroundColor: '#0090d8' }}
                >
                  Voltar ao Portfolio Master
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header com Navegação */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-200">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 mr-8">
              Vista
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Início
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Planos
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login" 
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Entrar
            </Link>
            <Link 
              href="/auth/register" 
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors duration-300"
              style={{ backgroundColor: '#0090d8' }}
            >
              Cadastrar
            </Link>
          </div>
        </div>
        
        {/* Header Principal */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-6" style={{ color: '#202636' }}>
            Wealth Management Especializada
          </h1>
          <p className="text-xl text-black max-w-3xl mx-auto font-light leading-relaxed">
            Agende uma consulta 1x1 com nosso especialista certificado CVM para implementar sua carteira de ETFs
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3" style={{ color: '#0090d8' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#202636' }}>Certificação CVM</h3>
              <p className="text-sm text-black">
                Consultores certificados pela Comissão de Valores Mobiliários
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3" style={{ color: '#0090d8' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#202636' }}>Implementação Completa</h3>
              <p className="text-sm text-black">
                Abertura de conta, compra dos ETFs e acompanhamento
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6 text-center">
              <User className="h-8 w-8 mx-auto mb-3" style={{ color: '#0090d8' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#202636' }}>Atendimento 1x1</h3>
              <p className="text-sm text-black">
                Consultoria personalizada para seu perfil e objetivos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Calendário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Escolha Data e Horário
              </CardTitle>
              <CardDescription>
                Selecione um horário disponível para sua consultoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.map((day) => (
                  <div key={day.date} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium capitalize">{day.day}</h4>
                        <p className="text-sm text-gray-500">{formatDate(day.date)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {day.slots.map((slot) => (
                        <Button
                          key={`${day.date}-${slot.time}`}
                          variant={
                            selectedDate === day.date && selectedTime === slot.time
                              ? "default"
                              : slot.available
                              ? "outline"
                              : "secondary"
                          }
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => {
                            if (slot.available) {
                              setSelectedDate(day.date)
                              setSelectedTime(slot.time)
                            }
                          }}
                          className="text-xs"
                          style={selectedDate === day.date && selectedTime === slot.time ? { backgroundColor: '#0090d8', borderColor: '#0090d8' } : {}}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
              <CardDescription>
                Informações básicas para personalizar sua consultoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Agendamento Selecionado */}
                {selectedDate && selectedTime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {formatDate(selectedDate)} às {selectedTime}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valorInvestimento">Valor a Investir *</Label>
                    <Select onValueChange={(value) => setFormData({...formData, valorInvestimento: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o valor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10k-50k">R$ 10.000 - R$ 50.000</SelectItem>
                        <SelectItem value="50k-100k">R$ 50.000 - R$ 100.000</SelectItem>
                        <SelectItem value="100k-500k">R$ 100.000 - R$ 500.000</SelectItem>
                        <SelectItem value="500k-1m">R$ 500.000 - R$ 1.000.000</SelectItem>
                        <SelectItem value="1m+">Acima de R$ 1.000.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experiencia">Experiência com Investimentos</Label>
                    <Select onValueChange={(value) => setFormData({...formData, experiencia: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seu nível de experiência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="horarioPreferencia">Horário de Preferência</Label>
                    <Select onValueChange={(value) => setFormData({...formData, horarioPreferencia: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Quando prefere contato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manha">Manhã (9h-12h)</SelectItem>
                        <SelectItem value="tarde">Tarde (14h-18h)</SelectItem>
                        <SelectItem value="qualquer">Qualquer horário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações (Opcional)</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Alguma informação adicional que gostaria de compartilhar..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full text-white hover:opacity-90 transition-opacity duration-300"
                  style={{ backgroundColor: '#0090d8' }}
                  disabled={!selectedDate || !selectedTime || !formData.nome || !formData.email || !formData.telefone || !formData.valorInvestimento || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Agendando...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Consultoria
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  * Campos obrigatórios. Ao agendar, você concorda com nossos termos de uso.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 