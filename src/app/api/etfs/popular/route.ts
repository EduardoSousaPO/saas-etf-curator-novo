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

    // Buscar ETFs na base de dados
    const etfList = await prisma.etf_list.findMany({
      where: { 
        symbol: { in: popularSymbols }
      },
      select: {
        symbol: true,
        name: true,
        assetclass: true,
        expenseratio: true,
        totalasset: true,
        avgvolume: true
      }
    });

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

    // Buscar métricas calculadas
    const metrics = await prisma.calculated_metrics_teste.findMany({
      where: { 
        symbol: { in: etfList.map(etf => etf.symbol) }
      },
      select: {
        symbol: true,
        returns_12m: true,
        volatility_12m: true,
        sharpe_12m: true
      }
    });

    console.log(`📊 Métricas encontradas: ${metrics.length} de ${etfList.length} ETFs`);

    // Combinar dados - APENAS ETFs que existem no banco
    const popularETFs = etfList.map(etf => {
      const metric = metrics.find(m => m.symbol === etf.symbol);
      return {
        symbol: etf.symbol,
        name: etf.name || `${etf.symbol} ETF`,
        assetclass: etf.assetclass || 'Unknown',
        returns_12m: metric?.returns_12m ? Number(metric.returns_12m) : 0,
        volatility_12m: metric?.volatility_12m ? Number(metric.volatility_12m) : 0,
        sharpe_12m: metric?.sharpe_12m ? Number(metric.sharpe_12m) : 0,
        expense_ratio: etf.expenseratio ? Number(etf.expenseratio) : 0,
        total_assets: etf.totalasset ? Number(etf.totalasset) : null,
        volume: etf.avgvolume ? Number(etf.avgvolume) : null
      };
    });

    // Verificar se temos dados suficientes
    if (popularETFs.length < 5) {
      console.error('❌ ERRO CRÍTICO: Poucos ETFs populares encontrados no banco');
      return NextResponse.json({
        success: false,
        error: `Apenas ${popularETFs.length} ETFs populares encontrados, mínimo necessário: 5`,
        message: 'Banco deve conter mais ETFs populares. Verificar processo de importação.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const foundSymbols = popularETFs.map(etf => etf.symbol);
    const missingSymbols = popularSymbols.filter(symbol => !foundSymbols.includes(symbol));

    console.log(`✅ ${popularETFs.length} ETFs populares carregados do banco de dados`);
    if (missingSymbols.length > 0) {
      console.log(`⚠️ ETFs não encontrados no banco: ${missingSymbols.join(', ')}`);
    }
    
    return NextResponse.json({
      success: true,
      etfs: popularETFs,
      _source: "real_database_only",
      _message: `${foundSymbols.length} ETFs reais do banco Supabase`,
      _timestamp: new Date().toISOString(),
      _found_in_db: foundSymbols,
      _missing_from_db: missingSymbols
    });

  } catch (error) {
    console.error("❌ ERRO CRÍTICO ao buscar ETFs populares:", error);
    console.error('🚨 PRODUÇÃO DEVE SEMPRE USAR DADOS REAIS - Verificar conexão com Supabase');
    
    // NUNCA usar fallback - sempre retornar erro para forçar correção
    return NextResponse.json({
      success: false,
      error: `Falha ao conectar com banco de dados: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: 'Produção deve sempre usar dados reais do Supabase. Verificar variáveis de ambiente e conexão.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 