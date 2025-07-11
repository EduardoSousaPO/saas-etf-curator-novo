// src/app/api/analytics/filter-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, timestamp, totalFilters } = body;

    // Validar dados
    if (!Array.isArray(filters) || !timestamp) {
      return NextResponse.json(
        { error: 'Dados inválidos para analytics' },
        { status: 400 }
      );
    }

    // Salvar analytics no banco (opcional - criar tabela se necessário)
    try {
      await supabase.from('filter_analytics').insert({
        filters_used: filters,
        total_filters: totalFilters || 0,
        timestamp: timestamp,
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.log('Analytics DB save failed (table may not exist):', dbError);
    }

    // Log para analytics simples (pode ser enviado para serviços externos)
    console.log('Filter Analytics:', {
      timestamp,
      totalFilters,
      mostUsedFilters: filters.slice(0, 5), // Top 5 filters
      sessionData: {
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Analytics tracked successfully' 
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Erro interno no tracking de analytics' },
      { status: 500 }
    );
  }
} 