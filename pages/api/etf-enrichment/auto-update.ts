// API ENDPOINT PARA ATUALIZAÇÃO AUTOMATIZADA DE ETFs
// Executa sistema de enriquecimento via Perplexity AI

import { NextApiRequest, NextApiResponse } from 'next';
import { runETFAutoUpdate, ETFAutoUpdater } from '../../../api/etf-enrichment/auto-update';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verificar autenticação (opcional - para produção)
  const authToken = req.headers.authorization;
  if (process.env.NODE_ENV === 'production' && authToken !== `Bearer ${process.env.AUTO_UPDATE_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    console.log('🚀 Iniciando atualização automatizada via API...');
    const startTime = Date.now();

    // Executar atualização automatizada
    const report = await runETFAutoUpdate();
    
    const executionTime = Date.now() - startTime;
    
    // Retornar relatório de sucesso
    res.status(200).json({
      success: true,
      message: 'Atualização automatizada concluída com sucesso',
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString(),
      report: {
        total_enriched: report.total_enriched,
        last_update: report.last_update,
        coverage: report.coverage,
        recent_updates: report.recent_updates,
      },
    });

  } catch (error: any) {
    console.error('❌ Erro na atualização automatizada:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Configuração para aumentar timeout (importante para atualizações longas)
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 300, // 5 minutos
}; 