import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Buscando ETFs populares...");

    // Lista de ETFs populares conhecidos
    const popularSymbols = [
      'VTI', 'BND', 'QQQ', 'VXUS', 'SCHD', 'VNQ', 'GLD', 
      'SPY', 'VOO', 'VEA', 'VWO', 'IEFA', 'AGG', 'TLT'
    ];

    // Buscar ETFs populares usando a view active_etfs
    const etfList = await prisma.$queryRaw<any[]>`
      SELECT 
        symbol, name, assetclass, expenseratio, totalasset, avgvolume,
        returns_12m, volatility_12m, sharpe_12m,
        size_category, liquidity_category, etf_type
      FROM etfs_ativos_reais
      WHERE symbol = ANY(${popularSymbols})
      ORDER BY totalasset DESC
    `;

    console.log(`📊 ETFs encontrados no banco: ${etfList.length} de ${popularSymbols.length} solicitados`);

    if (etfList.length === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhum ETF popular encontrado no banco de dados');
      return NextResponse.json({
        success: false,
        error: 'Nenhum ETF popular encontrado no banco de dados',
        message: 'Banco deve conter dados dos ETFs populares. Verificar processo de importação de dados.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log(`📊 Métricas encontradas: ${etfList.filter(etf => etf.returns_12m).length} de ${etfList.length} ETFs`);

    // Processar dados dos ETFs
    const processedETFs = etfList.map(etf => ({
      symbol: etf.symbol,
      name: etf.name || `${etf.symbol} ETF`,
      assetclass: etf.assetclass || 'Unknown',
      expense_ratio: Number(etf.expenseratio) || 0,
      total_assets: Number(etf.totalasset) || 0,
      volume: Number(etf.avgvolume) || 0,
      returns_12m: etf.returns_12m ? Number(etf.returns_12m) : null,
      volatility_12m: etf.volatility_12m ? Number(etf.volatility_12m) : null,
      sharpe_12m: etf.sharpe_12m ? Number(etf.sharpe_12m) : null,
      size_category: etf.size_category,
      liquidity_category: etf.liquidity_category,
      etf_type: etf.etf_type
    }));

    console.log(`✅ Processamento concluído: ${processedETFs.length} ETFs populares`);

    return NextResponse.json({
      success: true,
      data: processedETFs,
      count: processedETFs.length,
      source: 'active_etfs_view',
      message: 'ETFs populares carregados com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erro crítico ao buscar ETFs populares:", error);
    
    return NextResponse.json({
      success: false,
      error: `Erro ao buscar ETFs populares: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: 'Falha na consulta ao banco de dados. Verificar conexão e estrutura.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 