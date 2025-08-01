import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol?.toUpperCase();
    
    if (!symbol) {
      return NextResponse.json(
        { error: "Símbolo do ETF é obrigatório" },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando detalhes para ETF: ${symbol}`);

    // Buscar dados completos do ETF usando Supabase diretamente
    const { data: etfDetails, error } = await supabase
      .from('etfs_ativos_reais')
      .select(`
        symbol,
        name,
        description,
        assetclass,
        etfcompany,
        expenseratio,
        avgvolume,
        inceptiondate,
        nav,
        navcurrency,
        holdingscount,
        totalasset,
        returns_12m,
        returns_24m,
        returns_36m,
        returns_5y,
        ten_year_return,
        volatility_12m,
        volatility_24m,
        volatility_36m,
        ten_year_volatility,
        sharpe_12m,
        sharpe_24m,
        sharpe_36m,
        ten_year_sharpe,
        max_drawdown,
        dividends_12m,
        dividends_24m,
        dividends_36m,
        dividends_all_time,
        size_category,
        liquidity_category,
        etf_type,
        domicile,
        isin,
        securitycusip,
        website,
        updatedat,
        sectorslist,
        liquidity_rating,
        size_rating,
        beta_12m,
        morningstar_rating,
        top_10_holdings,
        sector_allocation,
        ai_investment_thesis,
        ai_risk_analysis,
        ai_market_context,
        ai_use_cases
      `)
      .eq('symbol', symbol)
      .single();

    if (error) {
      console.error("❌ Erro do Supabase:", error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "ETF não encontrado" },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!etfDetails) {
      return NextResponse.json(
        { error: "ETF não encontrado" },
        { status: 404 }
      );
    }

    console.log(`✅ ETF encontrado: ${etfDetails.symbol}`);

    // Mapear campos para compatibilidade com o frontend
    const mappedData = {
      ...etfDetails,
      expense_ratio: etfDetails.expenseratio,
      volume: etfDetails.avgvolume,
      inception_date: etfDetails.inceptiondate,
      holdings_count: etfDetails.holdingscount,
      cusip: etfDetails.securitycusip,
      // Manter compatibilidade com campos existentes
      ten_year_return: etfDetails.ten_year_return || etfDetails.returns_5y,
      
      // Converter percentuais do banco para formato decimal para o frontend
      returns_12m: etfDetails.returns_12m ? Number(etfDetails.returns_12m) / 100 : null,
      returns_24m: etfDetails.returns_24m ? Number(etfDetails.returns_24m) / 100 : null,
      returns_36m: etfDetails.returns_36m ? Number(etfDetails.returns_36m) / 100 : null,
      returns_5y: etfDetails.returns_5y ? Number(etfDetails.returns_5y) / 100 : null,
      volatility_12m: etfDetails.volatility_12m ? Number(etfDetails.volatility_12m) / 100 : null,
      volatility_24m: etfDetails.volatility_24m ? Number(etfDetails.volatility_24m) / 100 : null,
      volatility_36m: etfDetails.volatility_36m ? Number(etfDetails.volatility_36m) / 100 : null,
      ten_year_volatility: etfDetails.ten_year_volatility ? Number(etfDetails.ten_year_volatility) / 100 : null,
      max_drawdown: etfDetails.max_drawdown ? Number(etfDetails.max_drawdown) / 100 : null,
      
      // Novos campos enriquecidos
      beta_12m: etfDetails.beta_12m,
      morningstar_rating: etfDetails.morningstar_rating,
      top_10_holdings: etfDetails.top_10_holdings,
      sector_allocation: etfDetails.sector_allocation,
      
      // AI Insights
      ai_investment_thesis: etfDetails.ai_investment_thesis,
      ai_risk_analysis: etfDetails.ai_risk_analysis,
      ai_market_context: etfDetails.ai_market_context,
      ai_use_cases: etfDetails.ai_use_cases
    };

    return NextResponse.json({
      success: true,
      data: mappedData
    });

  } catch (error) {
    console.error("❌ Erro ao buscar detalhes do ETF:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 