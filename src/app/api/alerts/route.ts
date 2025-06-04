import { NextRequest, NextResponse } from 'next/server';
import { AlertEngine } from '@/lib/alerts/alert-engine';
import { Alert, AlertType, AlertCondition, NotificationMethod } from '@/lib/alerts/types';
import { prisma } from "@/lib/prisma";

export interface ETFAlert {
  id: string;
  user_id: string;
  etf_symbol: string;
  alert_type: 'price_above' | 'price_below' | 'return_above' | 'return_below' | 'volume_spike' | 'dividend_announcement';
  target_value: number;
  current_value?: number;
  is_active: boolean;
  is_triggered: boolean;
  created_at: Date;
  triggered_at?: Date;
  etf_name?: string;
  message?: string;
}

export interface CreateAlertRequest {
  etf_symbol: string;
  alert_type: ETFAlert['alert_type'];
  target_value: number;
  user_id: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const active = searchParams.get("active");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar alertas do usuário via raw query devido ao schema específico
    const alertsQuery = `
      SELECT 
        id,
        user_id,
        etf_symbol,
        alert_type,
        target_value,
        is_active,
        is_triggered,
        created_at,
        triggered_at
      FROM public.etf_alerts 
      WHERE user_id = $1
      ${active === "true" ? "AND is_active = true" : ""}
      ORDER BY created_at DESC
    `;

    const alerts = await prisma.$queryRawUnsafe(alertsQuery, userId);
    const alertsArray = alerts as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Buscar dados atuais dos ETFs para comparar com alertas
    const symbols = [...new Set(alertsArray.map(alert => alert.etf_symbol))];
    const etfs = symbols.length > 0 ? await prisma.etfs.findMany({
      where: {
        symbol: { in: symbols }
      },
      select: {
        symbol: true,
        name: true,
        returns_12m: true,
        volume: true,
        total_assets: true
      }
    }) : [];

    // Mapear alertas com dados atuais
    const alertsWithData: ETFAlert[] = alertsArray.map(alert => {
      const etf = etfs.find(e => e.symbol === alert.etf_symbol);
      let currentValue: number | undefined;

      // Determinar valor atual baseado no tipo de alerta
      switch (alert.alert_type) {
        case 'return_above':
        case 'return_below':
          currentValue = etf?.returns_12m ? Number(etf.returns_12m) * 100 : undefined;
          break;
        case 'volume_spike':
          currentValue = etf?.volume ? Number(etf.volume) : undefined;
          break;
        default:
          currentValue = undefined;
      }

      return {
        id: alert.id,
        user_id: alert.user_id,
        etf_symbol: alert.etf_symbol,
        alert_type: alert.alert_type as ETFAlert['alert_type'],
        target_value: Number(alert.target_value),
        current_value: currentValue,
        is_active: alert.is_active,
        is_triggered: alert.is_triggered,
        created_at: alert.created_at,
        triggered_at: alert.triggered_at,
        etf_name: etf?.name || undefined,
        message: generateAlertMessage(alert.alert_type as ETFAlert['alert_type'], alert.etf_symbol, Number(alert.target_value))
      };
    });

    return NextResponse.json({
      alerts: alertsWithData,
      total: alertsWithData.length,
      active: alertsWithData.filter(a => a.is_active).length,
      triggered: alertsWithData.filter(a => a.is_triggered).length
    });

  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    return NextResponse.json(
      { error: "Falha ao buscar alertas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAlertRequest = await request.json();
    const { etf_symbol, alert_type, target_value, user_id } = body;

    // Validações
    if (!etf_symbol || !alert_type || target_value === undefined || !user_id) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios: etf_symbol, alert_type, target_value, user_id" },
        { status: 400 }
      );
    }

    // Verificar se o ETF existe
    const etf = await prisma.etfs.findUnique({
      where: { symbol: etf_symbol.toUpperCase() },
      select: { symbol: true, name: true }
    });

    if (!etf) {
      return NextResponse.json(
        { error: `ETF ${etf_symbol} não encontrado` },
        { status: 404 }
      );
    }

    // Verificar limite de alertas por usuário (máximo 20) via raw query
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM public.etf_alerts 
      WHERE user_id = $1 AND is_active = true
    `;
    const countResult = await prisma.$queryRawUnsafe(countQuery, user_id) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    const userAlertsCount = Number(countResult[0]?.count || 0);

    if (userAlertsCount >= 20) {
      return NextResponse.json(
        { error: "Limite de 20 alertas ativos atingido" },
        { status: 400 }
      );
    }

    // Criar alerta via raw query
    const insertQuery = `
      INSERT INTO public.etf_alerts (user_id, etf_symbol, alert_type, target_value, is_active, is_triggered)
      VALUES ($1, $2, $3, $4, true, false)
      RETURNING id, etf_symbol, alert_type, target_value
    `;
    
    const insertResult = await prisma.$queryRawUnsafe(
      insertQuery, 
      user_id, 
      etf_symbol.toUpperCase(), 
      alert_type, 
      target_value
    ) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const alert = insertResult[0];

    return NextResponse.json({
      message: "Alerta criado com sucesso",
      alert: {
        id: alert.id,
        etf_symbol: alert.etf_symbol,
        alert_type: alert.alert_type,
        target_value: Number(alert.target_value),
        etf_name: etf.name,
        message: generateAlertMessage(alert_type, alert.etf_symbol, target_value)
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar alerta:", error);
    return NextResponse.json(
      { error: "Falha ao criar alerta" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get("id");
    const userId = searchParams.get("user_id");

    if (!alertId || !userId) {
      return NextResponse.json(
        { error: "id e user_id são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o alerta pertence ao usuário via raw query
    const checkQuery = `
      SELECT id FROM public.etf_alerts 
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await prisma.$queryRawUnsafe(checkQuery, alertId, userId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (checkResult.length === 0) {
      return NextResponse.json(
        { error: "Alerta não encontrado ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Deletar alerta via raw query
    const deleteQuery = `
      DELETE FROM public.etf_alerts 
      WHERE id = $1 AND user_id = $2
    `;
    await prisma.$queryRawUnsafe(deleteQuery, alertId, userId);

    return NextResponse.json({
      message: "Alerta deletado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao deletar alerta:", error);
    return NextResponse.json(
      { error: "Falha ao deletar alerta" },
      { status: 500 }
    );
  }
}

// Função para gerar mensagem do alerta
function generateAlertMessage(alertType: ETFAlert['alert_type'], symbol: string, targetValue: number): string {
  switch (alertType) {
    case 'price_above':
      return `Notificar quando ${symbol} subir acima de $${targetValue}`;
    case 'price_below':
      return `Notificar quando ${symbol} descer abaixo de $${targetValue}`;
    case 'return_above':
      return `Notificar quando ${symbol} retorno 12m for acima de ${targetValue}%`;
    case 'return_below':
      return `Notificar quando ${symbol} retorno 12m for abaixo de ${targetValue}%`;
    case 'volume_spike':
      return `Notificar quando ${symbol} volume for acima de ${targetValue.toLocaleString()}`;
    case 'dividend_announcement':
      return `Notificar quando ${symbol} anunciar dividendos`;
    default:
      return `Alerta configurado para ${symbol}`;
  }
} 