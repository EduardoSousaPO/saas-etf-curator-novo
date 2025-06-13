import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔗 Buscando ETFs populares do banco Supabase...");

    // Símbolos dos ETFs populares usados no simulador
    const popularSymbols = ['VTI', 'BND', 'QQQ', 'VXUS', 'SCHD', 'VNQ', 'GLD'];

    // Buscar dados dos ETFs populares
    const etfList = await prisma.etf_list.findMany({
      where: { 
        symbol: { in: popularSymbols }
      },
      select: {
        symbol: true,
        name: true,
        assetclass: true,
        expenseratio: true,
        assetsundermanagement: true,
        avgvolume: true
      }
    });

    // Buscar métricas calculadas
    const metrics = await prisma.calculated_metrics.findMany({
      where: { 
        symbol: { in: popularSymbols }
      },
      select: {
        symbol: true,
        returns_12m: true,
        volatility_12m: true,
        sharpe_12m: true
      }
    });

    // Combinar dados
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
        total_assets: etf.assetsundermanagement ? Number(etf.assetsundermanagement) : null,
        volume: etf.avgvolume ? Number(etf.avgvolume) : null
      };
    });

    // Se não encontrou todos os ETFs no banco, adicionar dados simulados para os faltantes
    const foundSymbols = popularETFs.map(etf => etf.symbol);
    const missingSymbols = popularSymbols.filter(symbol => !foundSymbols.includes(symbol));

    const fallbackData: { [key: string]: any } = {
      'VTI': {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        assetclass: 'Equity',
        returns_12m: 12.5,
        volatility_12m: 18.2,
        sharpe_12m: 0.68,
        expense_ratio: 0.03
      },
      'BND': {
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        assetclass: 'Fixed Income',
        returns_12m: 2.1,
        volatility_12m: 6.8,
        sharpe_12m: 0.31,
        expense_ratio: 0.05
      },
      'QQQ': {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        assetclass: 'Equity',
        returns_12m: 18.7,
        volatility_12m: 28.5,
        sharpe_12m: 0.66,
        expense_ratio: 0.20
      },
      'VXUS': {
        symbol: 'VXUS',
        name: 'Vanguard Total International Stock ETF',
        assetclass: 'International Equity',
        returns_12m: 8.3,
        volatility_12m: 22.1,
        sharpe_12m: 0.38,
        expense_ratio: 0.08
      },
      'SCHD': {
        symbol: 'SCHD',
        name: 'Schwab US Dividend Equity ETF',
        assetclass: 'Dividend Equity',
        returns_12m: 14.2,
        volatility_12m: 16.8,
        sharpe_12m: 0.85,
        expense_ratio: 0.06
      },
      'VNQ': {
        symbol: 'VNQ',
        name: 'Vanguard Real Estate ETF',
        assetclass: 'Real Estate',
        returns_12m: 6.8,
        volatility_12m: 24.3,
        sharpe_12m: 0.28,
        expense_ratio: 0.12
      },
      'GLD': {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        assetclass: 'Commodities',
        returns_12m: 1.2,
        volatility_12m: 19.5,
        sharpe_12m: 0.06,
        expense_ratio: 0.40
      }
    };

    // Adicionar dados de fallback para símbolos não encontrados
    missingSymbols.forEach(symbol => {
      if (fallbackData[symbol]) {
        popularETFs.push(fallbackData[symbol]);
      }
    });

    console.log(`✅ ${popularETFs.length} ETFs populares carregados (${foundSymbols.length} do banco, ${missingSymbols.length} simulados)`);
    
    return NextResponse.json({
      etfs: popularETFs,
      _source: "supabase_database_with_fallback",
      _message: `${foundSymbols.length} ETFs do banco Supabase, ${missingSymbols.length} dados simulados`,
      _timestamp: new Date().toISOString(),
      _found_in_db: foundSymbols,
      _simulated: missingSymbols
    });

  } catch (error) {
    console.error("❌ Erro ao buscar ETFs populares:", error);
    
    // Fallback completo em caso de erro
    const fallbackETFs = [
      {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        assetclass: 'Equity',
        returns_12m: 12.5,
        volatility_12m: 18.2,
        sharpe_12m: 0.68,
        expense_ratio: 0.03
      },
      {
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        assetclass: 'Fixed Income',
        returns_12m: 2.1,
        volatility_12m: 6.8,
        sharpe_12m: 0.31,
        expense_ratio: 0.05
      },
      {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        assetclass: 'Equity',
        returns_12m: 18.7,
        volatility_12m: 28.5,
        sharpe_12m: 0.66,
        expense_ratio: 0.20
      },
      {
        symbol: 'VXUS',
        name: 'Vanguard Total International Stock ETF',
        assetclass: 'International Equity',
        returns_12m: 8.3,
        volatility_12m: 22.1,
        sharpe_12m: 0.38,
        expense_ratio: 0.08
      },
      {
        symbol: 'SCHD',
        name: 'Schwab US Dividend Equity ETF',
        assetclass: 'Dividend Equity',
        returns_12m: 14.2,
        volatility_12m: 16.8,
        sharpe_12m: 0.85,
        expense_ratio: 0.06
      },
      {
        symbol: 'VNQ',
        name: 'Vanguard Real Estate ETF',
        assetclass: 'Real Estate',
        returns_12m: 6.8,
        volatility_12m: 24.3,
        sharpe_12m: 0.28,
        expense_ratio: 0.12
      },
      {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        assetclass: 'Commodities',
        returns_12m: 1.2,
        volatility_12m: 19.5,
        sharpe_12m: 0.06,
        expense_ratio: 0.40
      }
    ];
    
    return NextResponse.json({
      etfs: fallbackETFs,
      _source: "fallback_data",
      _message: "Dados simulados devido a erro na conexão",
      _error: (error as Error).message,
      _timestamp: new Date().toISOString()
    });
  }
} 