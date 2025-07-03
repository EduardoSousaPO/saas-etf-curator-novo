import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface AgendamentoData {
  nome: string
  email: string
  telefone: string
  valorInvestimento: string
  experiencia?: string
  horarioPreferencia?: string
  observacoes?: string
  dataAgendamento: string
  horarioAgendamento: string
}

export async function POST(request: NextRequest) {
  try {
    const data: AgendamentoData = await request.json()

    // Validação básica
    if (!data.nome || !data.email || !data.telefone || !data.valorInvestimento || 
        !data.dataAgendamento || !data.horarioAgendamento) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar data (não pode ser no passado)
    const agendamentoDate = new Date(data.dataAgendamento + 'T' + data.horarioAgendamento + ':00')
    const now = new Date()
    if (agendamentoDate <= now) {
      return NextResponse.json(
        { success: false, error: 'Data de agendamento deve ser no futuro' },
        { status: 400 }
      )
    }

    // Salvar no banco de dados (simulado por enquanto)
    const agendamento = {
      id: `agenda_${Date.now()}`,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      valor_investimento: data.valorInvestimento,
      experiencia: data.experiencia || 'não informado',
      horario_preferencia: data.horarioPreferencia || 'qualquer',
      observacoes: data.observacoes || '',
      data_agendamento: data.dataAgendamento,
      horario_agendamento: data.horarioAgendamento,
      status: 'agendado',
      created_at: new Date().toISOString(),
      tipo_consultoria: 'implementacao_portfolio'
    }

    // Log para acompanhamento
    console.log('📅 Novo agendamento de consultoria:', {
      id: agendamento.id,
      nome: data.nome,
      email: data.email,
      valor: data.valorInvestimento,
      data: `${data.dataAgendamento} às ${data.horarioAgendamento}`,
      timestamp: new Date().toISOString()
    })

    // Simular envio de email de confirmação
    await enviarEmailConfirmacao(agendamento)

    // Simular notificação para equipe
    await notificarEquipeComercial(agendamento)

    return NextResponse.json({
      success: true,
      agendamento: {
        id: agendamento.id,
        data: data.dataAgendamento,
        horario: data.horarioAgendamento,
        status: 'confirmado'
      },
      message: 'Agendamento realizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar agendamento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para enviar email de confirmação
async function enviarEmailConfirmacao(agendamento: any) {
  // Simular envio de email
  console.log('📧 Email de confirmação enviado para:', agendamento.email)
  console.log('📧 Dados do agendamento:', {
    nome: agendamento.nome,
    data: agendamento.data_agendamento,
    horario: agendamento.horario_agendamento
  })
  
  // Aqui você integraria com um serviço de email real como:
  // - SendGrid
  // - Resend
  // - Amazon SES
  // - Mailgun
  
  return Promise.resolve()
}

// Função para notificar equipe comercial
async function notificarEquipeComercial(agendamento: any) {
  // Simular notificação
  console.log('🔔 Notificação para equipe comercial:', {
    tipo: 'novo_agendamento_consultoria',
    lead: {
      nome: agendamento.nome,
      email: agendamento.email,
      telefone: agendamento.telefone,
      valor_investimento: agendamento.valor_investimento,
      agendamento: `${agendamento.data_agendamento} às ${agendamento.horario_agendamento}`
    },
    prioridade: agendamento.valor_investimento.includes('500k') || 
                agendamento.valor_investimento.includes('1m') ? 'alta' : 'normal'
  })

  // Aqui você integraria com:
  // - Slack
  // - Microsoft Teams  
  // - WhatsApp Business
  // - CRM (HubSpot, Pipedrive, etc.)
  
  return Promise.resolve()
}

export async function GET(request: NextRequest) {
  try {
    // Endpoint para listar horários disponíveis
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Data não fornecida' },
        { status: 400 }
      )
    }

    // Simular horários disponíveis para a data
    const availableSlots = [
      { time: '09:00', available: Math.random() > 0.3 },
      { time: '10:00', available: Math.random() > 0.3 },
      { time: '11:00', available: Math.random() > 0.3 },
      { time: '14:00', available: Math.random() > 0.3 },
      { time: '15:00', available: Math.random() > 0.3 },
      { time: '16:00', available: Math.random() > 0.3 },
      { time: '17:00', available: Math.random() > 0.3 },
    ]

    return NextResponse.json({
      success: true,
      date,
      slots: availableSlots
    })

  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 