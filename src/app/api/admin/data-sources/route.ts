import { NextRequest, NextResponse } from 'next/server';
import { dataSourceManager } from '@/lib/data/data-sources';

export async function GET() {
  try {
    const status = await dataSourceManager.getSourcesStatus();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sources: status,
      summary: {
        total: status.length,
        available: status.filter(s => s.available).length,
        unavailable: status.filter(s => !s.available).length
      }
    });
  } catch (error) {
    console.error('Data sources status error:', error);
    return NextResponse.json(
      { error: 'Failed to get data sources status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbol } = body;

    if (action === 'refresh' && symbol) {
      // Força atualização de um ETF específico
      const refreshedData = await dataSourceManager.refreshETFData(symbol);
      
      if (refreshedData) {
        return NextResponse.json({
          success: true,
          symbol,
          data: refreshedData,
          message: `ETF ${symbol} data refreshed successfully`
        });
      } else {
        return NextResponse.json(
          { error: `Failed to refresh data for ${symbol}` },
          { status: 404 }
        );
      }
    }

    if (action === 'test') {
      // Testa conectividade com todas as fontes
      const testResults: Array<{
        source: string;
        available: boolean;
        lastUpdate: string | null;
        tested_at: string;
      }> = [];
      
      for (const source of await dataSourceManager.getSourcesStatus()) {
        testResults.push({
          source: source.source,
          available: source.available,
          lastUpdate: source.lastUpdate,
          tested_at: new Date().toISOString()
        });
      }

      return NextResponse.json({
        success: true,
        test_results: testResults,
        message: 'Data sources connectivity tested'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: refresh, test' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Data sources admin error:', error);
    return NextResponse.json(
      { error: 'Failed to execute admin action' },
      { status: 500 }
    );
  }
} 