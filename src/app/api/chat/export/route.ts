import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Exportar itens em diferentes formatos
export async function POST(request: NextRequest) {
  try {
    const { 
      itemIds, 
      folderId, 
      userId, 
      format, 
      includeData = true,
      includeTags = true,
      includeMetadata = false 
    } = await request.json();

    if (!userId || !format) {
      return NextResponse.json({ 
        error: 'userId e format são obrigatórios' 
      }, { status: 400 });
    }

    if (!itemIds && !folderId) {
      return NextResponse.json({ 
        error: 'itemIds ou folderId são obrigatórios' 
      }, { status: 400 });
    }

    console.log(`📤 Exportando para usuário: ${userId}, formato: ${format}`);

    // Buscar itens para exportar
    const items = await fetchItemsForExport(userId, itemIds, folderId);

    if (!items.length) {
      return NextResponse.json({ error: 'Nenhum item encontrado para exportar' }, { status: 404 });
    }

    // Processar baseado no formato
    let exportData;
    let contentType;
    let filename;

    switch (format.toLowerCase()) {
      case 'json':
        exportData = generateJSONExport(items, { includeData, includeTags, includeMetadata });
        contentType = 'application/json';
        filename = `vista-etf-export-${Date.now()}.json`;
        break;

      case 'csv':
        exportData = generateCSVExport(items, { includeData, includeTags, includeMetadata });
        contentType = 'text/csv';
        filename = `vista-etf-export-${Date.now()}.csv`;
        break;

      case 'pdf':
        exportData = await generatePDFExport(items, { includeData, includeTags, includeMetadata });
        contentType = 'application/pdf';
        filename = `vista-etf-export-${Date.now()}.pdf`;
        break;

      default:
        return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 });
    }

    // Salvar arquivo gerado nos metadados do item (se for item único)
    if (itemIds && itemIds.length === 1) {
      await updateGeneratedFiles(itemIds[0], format, filename);
    }

    console.log(`✅ Exportação concluída: ${filename}`);

    // Retornar arquivo como download
    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': exportData.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET - Listar arquivos gerados para um item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');

    if (!itemId || !userId) {
      return NextResponse.json({ 
        error: 'itemId e userId são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar arquivos gerados
    const { data: item, error } = await supabase
      .from('chat_folder_items')
      .select(`
        id,
        title,
        generated_files,
        chat_folders!inner(user_id)
      `)
      .eq('id', itemId)
      .eq('chat_folders.user_id', userId)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    const generatedFiles = item.generated_files || {};

    return NextResponse.json({
      itemId: item.id,
      title: item.title,
      files: generatedFiles
    });

  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função para buscar itens para exportação
async function fetchItemsForExport(userId: string, itemIds?: string[], folderId?: string) {
  let query = supabase
    .from('chat_folder_items')
    .select(`
      id,
      title,
      summary,
      content_type,
      data,
      tags,
      is_favorite,
      view_count,
      created_at,
      updated_at,
      last_accessed,
      chat_folders!inner(
        id,
        name,
        type,
        icon,
        color,
        user_id
      )
    `)
    .eq('chat_folders.user_id', userId)
    .eq('is_archived', false);

  if (itemIds && itemIds.length > 0) {
    query = query.in('id', itemIds);
  } else if (folderId) {
    query = query.eq('folder_id', folderId);
  }

  const { data: items, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar itens:', error);
    return [];
  }

  return items || [];
}

// Função para gerar exportação JSON
function generateJSONExport(items: any[], options: any) {
  const exportData = {
    metadata: {
      export_date: new Date().toISOString(),
      total_items: items.length,
      source: 'Vista ETF - Chat IA',
      version: '1.0'
    },
    items: items.map(item => {
      const exportItem: any = {
        id: item.id,
        title: item.title,
        summary: item.summary,
        content_type: item.content_type,
        is_favorite: item.is_favorite,
        view_count: item.view_count,
        created_at: item.created_at,
        updated_at: item.updated_at,
        folder: {
          id: item.chat_folders.id,
          name: item.chat_folders.name,
          type: item.chat_folders.type,
          icon: item.chat_folders.icon
        }
      };

      if (options.includeData && item.data) {
        exportItem.data = item.data;
      }

      if (options.includeTags && item.tags) {
        exportItem.tags = item.tags;
      }

      if (options.includeMetadata) {
        exportItem.metadata = {
          last_accessed: item.last_accessed,
          folder_color: item.chat_folders.color
        };
      }

      return exportItem;
    })
  };

  return JSON.stringify(exportData, null, 2);
}

// Função para gerar exportação CSV
function generateCSVExport(items: any[], options: any) {
  // Headers básicos
  const headers = [
    'ID',
    'Título',
    'Resumo',
    'Tipo de Conteúdo',
    'Pasta',
    'Favorito',
    'Visualizações',
    'Criado em',
    'Atualizado em'
  ];

  if (options.includeTags) {
    headers.push('Tags');
  }

  if (options.includeMetadata) {
    headers.push('Último Acesso');
  }

  // Gerar linhas
  const rows = items.map(item => {
    const row = [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${(item.summary || '').replace(/"/g, '""')}"`,
      item.content_type,
      `"${item.chat_folders.name}"`,
      item.is_favorite ? 'Sim' : 'Não',
      item.view_count,
      new Date(item.created_at).toLocaleDateString('pt-BR'),
      new Date(item.updated_at).toLocaleDateString('pt-BR')
    ];

    if (options.includeTags) {
      row.push(`"${(item.tags || []).join(', ')}"`);
    }

    if (options.includeMetadata) {
      row.push(new Date(item.last_accessed).toLocaleDateString('pt-BR'));
    }

    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Função para gerar exportação PDF (simplificada)
async function generatePDFExport(items: any[], options: any) {
  // Para uma implementação completa, usar biblioteca como puppeteer ou jsPDF
  // Por enquanto, retornar HTML que pode ser convertido em PDF pelo browser
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Vista ETF - Exportação de Análises</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .item { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .item-title { font-size: 18px; font-weight: bold; color: #202636; margin-bottom: 10px; }
    .item-meta { color: #666; font-size: 12px; margin-bottom: 15px; }
    .item-content { line-height: 1.6; }
    .tags { margin-top: 10px; }
    .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; margin-right: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Vista ETF - Análises Exportadas</h1>
    <p>Exportado em: ${new Date().toLocaleString('pt-BR')}</p>
    <p>Total de itens: ${items.length}</p>
  </div>

  ${items.map(item => `
    <div class="item">
      <div class="item-title">${item.title}</div>
      <div class="item-meta">
        📁 ${item.chat_folders.name} | 
        📅 ${new Date(item.created_at).toLocaleDateString('pt-BR')} |
        👁️ ${item.view_count} visualizações
        ${item.is_favorite ? ' | ⭐ Favorito' : ''}
      </div>
      <div class="item-content">
        ${item.summary ? `<p><strong>Resumo:</strong> ${item.summary}</p>` : ''}
        ${options.includeData && item.data ? `
          <p><strong>Dados:</strong></p>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(item.data, null, 2)}
          </pre>
        ` : ''}
      </div>
      ${options.includeTags && item.tags && item.tags.length > 0 ? `
        <div class="tags">
          <strong>Tags:</strong> 
          ${item.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>`;

  return htmlContent;
}

// Função para atualizar arquivos gerados
async function updateGeneratedFiles(itemId: string, format: string, filename: string) {
  try {
    // Buscar arquivos atuais
    const { data: item, error: fetchError } = await supabase
      .from('chat_folder_items')
      .select('generated_files')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar item:', fetchError);
      return;
    }

    const currentFiles = item.generated_files || {};
    const updatedFiles = {
      ...currentFiles,
      [format]: {
        filename,
        generated_at: new Date().toISOString(),
        size: filename.length // Aproximação
      }
    };

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('chat_folder_items')
      .update({ generated_files: updatedFiles })
      .eq('id', itemId);

    if (updateError) {
      console.error('❌ Erro ao atualizar arquivos gerados:', updateError);
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar arquivos gerados:', error);
  }
} 