#!/usr/bin/env node

/**
 * ETF Data Enrichment Pipeline
 * 
 * Este script enriquece dados de ETFs usando APIs gratuitas:
 * - Yahoo Finance (yfinance via Python)
 * - Alpha Vantage (API gratuita)
 * - Financial Modeling Prep (API gratuita)
 * - Web scraping de sites públicos
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Configuração
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY; // Gratuita
const FMP_API_KEY = process.env.FMP_API_KEY; // Financial Modeling Prep - Gratuita

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class ETFEnrichmentPipeline {
  constructor() {
    this.processedCount = 0;
    this.errorCount = 0;
    this.logFile = path.join(__dirname, `enrichment-log-${new Date().toISOString().slice(0, 10)}.json`);
    this.results = [];
  }

  /**
   * Buscar dados do Yahoo Finance usando yfinance (Python)
   */
  async getYahooFinanceData(symbol) {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import yfinance as yf
import json
import sys

try:
    ticker = yf.Ticker("${symbol}")
    info = ticker.info
    
    # Dados básicos
    data = {
        'beta': info.get('beta'),
        'holdings_count': info.get('holdingsCount'),
        'net_assets': info.get('totalAssets'),
        'expense_ratio': info.get('annualReportExpenseRatio'),
        'yield': info.get('yield'),
        'pe_ratio': info.get('trailingPE'),
        'category': info.get('category'),
        'morningstar_rating': info.get('morningstarRiskRating'),
        'fund_family': info.get('fundFamily'),
        'inception_date': info.get('fundInceptionDate'),
        'last_dividend': info.get('lastDividendValue'),
        'dividend_rate': info.get('dividendRate')
    }
    
    # Histórico de preços para calcular métricas
    hist = ticker.history(period="1y")
    if not hist.empty:
        returns = hist['Close'].pct_change().dropna()
        data['volatility_12m'] = returns.std() * (252 ** 0.5)  # Anualizada
        data['max_drawdown'] = ((hist['Close'] / hist['Close'].cummax()) - 1).min()
    
    print(json.dumps(data, default=str))
    
except Exception as e:
    print(json.dumps({'error': str(e)}))
`;

      const python = spawn('python', ['-c', pythonScript]);
      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output.trim());
            resolve(result);
          } catch (e) {
            reject(new Error(`Erro ao parsear JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`Python script falhou: ${error}`));
        }
      });
    });
  }

  /**
   * Buscar dados do Alpha Vantage (API gratuita)
   */
  async getAlphaVantageData(symbol) {
    if (!ALPHA_VANTAGE_KEY) return null;

    try {
      // Função OVERVIEW para dados fundamentais
      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
      const overviewResponse = await axios.get(overviewUrl);
      
      if (overviewResponse.data.Note) {
        console.log(`⚠️ Rate limit Alpha Vantage para ${symbol}`);
        return null;
      }

      const overview = overviewResponse.data;
      
      return {
        market_cap: overview.MarketCapitalization,
        pe_ratio: overview.PERatio,
        dividend_yield: overview.DividendYield,
        eps: overview.EPS,
        revenue_per_share: overview.RevenuePerShareTTM,
        profit_margin: overview.ProfitMargin,
        operating_margin: overview.OperatingMarginTTM,
        return_on_assets: overview.ReturnOnAssetsTTM,
        return_on_equity: overview.ReturnOnEquityTTM,
        revenue_ttm: overview.RevenueTTM,
        gross_profit_ttm: overview.GrossProfitTTM,
        diluted_eps_ttm: overview.DilutedEPSTTM,
        quarterly_earnings_growth: overview.QuarterlyEarningsGrowthYOY,
        quarterly_revenue_growth: overview.QuarterlyRevenueGrowthYOY,
        analyst_target_price: overview.AnalystTargetPrice,
        trailing_pe: overview.TrailingPE,
        forward_pe: overview.ForwardPE,
        price_to_sales_ratio: overview.PriceToSalesRatioTTM,
        price_to_book_ratio: overview.PriceToBookRatio,
        ev_to_revenue: overview.EVToRevenue,
        ev_to_ebitda: overview.EVToEBITDA,
        beta: overview.Beta,
        week_52_high: overview['52WeekHigh'],
        week_52_low: overview['52WeekLow'],
        moving_average_50: overview['50DayMovingAverage'],
        moving_average_200: overview['200DayMovingAverage'],
        shares_outstanding: overview.SharesOutstanding
      };
    } catch (error) {
      console.error(`❌ Erro Alpha Vantage para ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Buscar dados do Financial Modeling Prep (API gratuita)
   */
  async getFMPData(symbol) {
    if (!FMP_API_KEY) return null;

    try {
      // Profile da empresa
      const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
      const profileResponse = await axios.get(profileUrl);
      
      if (!profileResponse.data || profileResponse.data.length === 0) {
        return null;
      }

      const profile = profileResponse.data[0];

      // Métricas financeiras
      const metricsUrl = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?apikey=${FMP_API_KEY}`;
      const metricsResponse = await axios.get(metricsUrl);
      const metrics = metricsResponse.data?.[0] || {};

      // Ratios financeiros
      const ratiosUrl = `https://financialmodelingprep.com/api/v3/ratios/${symbol}?apikey=${FMP_API_KEY}`;
      const ratiosResponse = await axios.get(ratiosUrl);
      const ratios = ratiosResponse.data?.[0] || {};

      return {
        company_name: profile.companyName,
        sector: profile.sector,
        industry: profile.industry,
        website: profile.website,
        description: profile.description,
        ceo: profile.ceo,
        employees: profile.fullTimeEmployees,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        market_cap: profile.mktCap,
        price: profile.price,
        beta: profile.beta,
        volume_avg: profile.volAvg,
        last_div: profile.lastDiv,
        range: profile.range,
        changes: profile.changes,
        currency: profile.currency,
        exchange_short_name: profile.exchangeShortName,
        
        // Métricas
        pe_ratio: metrics.peRatio,
        price_to_sales_ratio: metrics.priceToSalesRatio,
        price_to_book_ratio: metrics.priceToBookRatio,
        price_to_cash_flow_ratio: metrics.priceToCashFlowRatio,
        enterprise_value: metrics.enterpriseValue,
        ev_to_sales: metrics.evToSales,
        ev_to_ebitda: metrics.evToEbitda,
        debt_to_equity: metrics.debtToEquity,
        debt_to_assets: metrics.debtToAssets,
        net_debt_to_ebitda: metrics.netDebtToEbitda,
        current_ratio: metrics.currentRatio,
        interest_coverage: metrics.interestCoverage,
        income_quality: metrics.incomeQuality,
        dividend_yield: metrics.dividendYield,
        payout_ratio: metrics.payoutRatio,
        sales_general_and_administrative_to_revenue: metrics.salesGeneralAndAdministrativeToRevenue,
        research_and_development_to_revenue: metrics.researchAndDdevelopementToRevenue,
        intangibles_to_total_assets: metrics.intangibleAssetsToTotalAssets,
        capex_to_operating_cash_flow: metrics.capexToOperatingCashFlow,
        capex_to_revenue: metrics.capexToRevenue,
        capex_to_depreciation: metrics.capexToDepreciation,
        stock_based_compensation_to_revenue: metrics.stockBasedCompensationToRevenue,
        graham_number: metrics.grahamNumber,
        roic: metrics.roic,
        return_on_tangible_assets: metrics.returnOnTangibleAssets,
        graham_net_net: metrics.grahamNetNet,
        working_capital: metrics.workingCapital,
        tangible_asset_value: metrics.tangibleAssetValue,
        net_current_asset_value: metrics.netCurrentAssetValue,
        invested_capital: metrics.investedCapital,
        average_receivables: metrics.averageReceivables,
        average_payables: metrics.averagePayables,
        average_inventory: metrics.averageInventory,
        days_sales_outstanding: metrics.daysSalesOutstanding,
        days_payables_outstanding: metrics.daysPayablesOutstanding,
        days_of_inventory_on_hand: metrics.daysOfInventoryOnHand,
        receivables_turnover: metrics.receivablesTurnover,
        payables_turnover: metrics.payablesTurnover,
        inventory_turnover: metrics.inventoryTurnover,
        roe: metrics.roe,
        capex_per_share: metrics.capexPerShare,
        
        // Ratios
        current_ratio_ratios: ratios.currentRatio,
        quick_ratio: ratios.quickRatio,
        cash_ratio: ratios.cashRatio,
        days_of_sales_outstanding: ratios.daysOfSalesOutstanding,
        days_of_inventory_outstanding: ratios.daysOfInventoryOutstanding,
        operating_cycle: ratios.operatingCycle,
        days_of_payables_outstanding: ratios.daysOfPayablesOutstanding,
        cash_conversion_cycle: ratios.cashConversionCycle,
        gross_profit_margin: ratios.grossProfitMargin,
        operating_profit_margin: ratios.operatingProfitMargin,
        pretax_profit_margin: ratios.pretaxProfitMargin,
        net_profit_margin: ratios.netProfitMargin,
        effective_tax_rate: ratios.effectiveTaxRate,
        return_on_assets: ratios.returnOnAssets,
        return_on_equity: ratios.returnOnEquity,
        return_on_capital_employed: ratios.returnOnCapitalEmployed,
        net_income_per_ebt: ratios.netIncomePerEBT,
        ebt_per_ebit: ratios.ebtPerEbit,
        ebit_per_revenue: ratios.ebitPerRevenue,
        debt_ratio: ratios.debtRatio,
        debt_equity_ratio: ratios.debtEquityRatio,
        long_term_debt_to_capitalization: ratios.longTermDebtToCapitalization,
        total_debt_to_capitalization: ratios.totalDebtToCapitalization,
        interest_coverage_ratio: ratios.interestCoverage,
        cash_flow_to_debt_ratio: ratios.cashFlowToDebtRatio,
        company_equity_multiplier: ratios.companyEquityMultiplier,
        receivables_turnover_ratios: ratios.receivablesTurnover,
        payables_turnover_ratios: ratios.payablesTurnover,
        inventory_turnover_ratios: ratios.inventoryTurnover,
        fixed_asset_turnover: ratios.fixedAssetTurnover,
        asset_turnover: ratios.assetTurnover,
        operating_cash_flow_per_share: ratios.operatingCashFlowPerShare,
        free_cash_flow_per_share: ratios.freeCashFlowPerShare,
        cash_per_share: ratios.cashPerShare,
        price_to_book_ratio_ratios: ratios.priceToBookRatio,
        price_to_sales_ratio_ratios: ratios.priceToSalesRatio,
        price_earnings_ratio: ratios.priceEarningsRatio,
        price_to_free_cash_flows_ratio: ratios.priceToFreeCashFlowsRatio,
        price_to_operating_cash_flows_ratio: ratios.priceToOperatingCashFlowsRatio,
        price_cash_flow_ratio: ratios.priceCashFlowRatio,
        price_earnings_to_growth_ratio: ratios.priceEarningsToGrowthRatio,
        price_sales_ratio: ratios.priceSalesRatio,
        dividend_yield_ratios: ratios.dividendYield,
        enterprise_value_multiple: ratios.enterpriseValueMultiple,
        price_fair_value: ratios.priceFairValue
      };
    } catch (error) {
      console.error(`❌ Erro FMP para ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Calcular métricas de risco avançadas
   */
  calculateRiskMetrics(priceHistory) {
    if (!priceHistory || priceHistory.length < 30) return {};

    const returns = [];
    for (let i = 1; i < priceHistory.length; i++) {
      returns.push((priceHistory[i] - priceHistory[i-1]) / priceHistory[i-1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance * 252); // Anualizada

    // Sharpe Ratio (assumindo risk-free rate de 2%)
    const riskFreeRate = 0.02;
    const annualizedReturn = mean * 252;
    const sharpeRatio = (annualizedReturn - riskFreeRate) / volatility;

    // Maximum Drawdown
    let maxDrawdown = 0;
    let peak = priceHistory[0];
    for (let i = 1; i < priceHistory.length; i++) {
      if (priceHistory[i] > peak) {
        peak = priceHistory[i];
      }
      const drawdown = (peak - priceHistory[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // VaR (Value at Risk) - 5%
    const sortedReturns = returns.sort((a, b) => a - b);
    const var5 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];

    return {
      volatility_calculated: volatility,
      sharpe_ratio_calculated: sharpeRatio,
      max_drawdown_calculated: maxDrawdown,
      var_5_percent: var5,
      annual_return_calculated: annualizedReturn
    };
  }

  /**
   * Processar um ETF específico
   */
  async processETF(etf) {
    console.log(`🔄 Processando ${etf.symbol}...`);
    
    try {
      const enrichmentData = {
        symbol: etf.symbol,
        last_enrichment_date: new Date().toISOString(),
        enrichment_status: 'processing'
      };

      // 1. Yahoo Finance Data
      try {
        const yahooData = await this.getYahooFinanceData(etf.symbol);
        if (yahooData && !yahooData.error) {
          Object.assign(enrichmentData, {
            beta_12m: yahooData.beta,
            holdingscount: yahooData.holdings_count || etf.holdingscount,
            volatility_12m: yahooData.volatility_12m || etf.volatility_12m,
            max_drawdown: yahooData.max_drawdown || etf.max_drawdown,
            morningstar_rating: yahooData.morningstar_rating || etf.morningstar_rating
          });
        }
      } catch (error) {
        console.log(`⚠️ Yahoo Finance falhou para ${etf.symbol}: ${error.message}`);
      }

      // 2. Alpha Vantage Data
      try {
        const alphaData = await this.getAlphaVantageData(etf.symbol);
        if (alphaData) {
          Object.assign(enrichmentData, {
            beta_12m: alphaData.beta || enrichmentData.beta_12m,
            tracking_error: alphaData.tracking_error,
            bid_ask_spread: alphaData.bid_ask_spread
          });
        }
      } catch (error) {
        console.log(`⚠️ Alpha Vantage falhou para ${etf.symbol}: ${error.message}`);
      }

             // 3. Financial Modeling Prep Data
       try {
         const fmpData = await this.getFMPData(etf.symbol);
         if (fmpData) {
           Object.assign(enrichmentData, {
             beta_12m: fmpData.beta || enrichmentData.beta_12m,
             holdingscount: fmpData.employees || enrichmentData.holdingscount
             // Removidos campos que não existem na base
           });
         }
       } catch (error) {
         console.log(`⚠️ FMP falhou para ${etf.symbol}: ${error.message}`);
       }

      // 4. Atualizar no banco apenas campos não nulos
      const updateData = {};
      Object.keys(enrichmentData).forEach(key => {
        if (enrichmentData[key] !== null && enrichmentData[key] !== undefined) {
          updateData[key] = enrichmentData[key];
        }
      });

      if (Object.keys(updateData).length > 2) { // Mais que symbol e timestamp
        updateData.enrichment_status = 'completed';
        
        const { error } = await supabase
          .from('etfs_ativos_reais')
          .update(updateData)
          .eq('symbol', etf.symbol);

        if (error) {
          throw error;
        }

        console.log(`✅ ${etf.symbol} enriquecido com ${Object.keys(updateData).length} campos`);
        this.processedCount++;
      } else {
        console.log(`⚠️ ${etf.symbol} - nenhum dado novo encontrado`);
      }

      // Log do resultado
      this.results.push({
        symbol: etf.symbol,
        status: 'success',
        fields_updated: Object.keys(updateData).length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Erro processando ${etf.symbol}:`, error.message);
      this.errorCount++;
      
      this.results.push({
        symbol: etf.symbol,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Executar pipeline completo
   */
  async run(batchSize = 10, maxETFs = 100) {
    console.log('🚀 Iniciando Pipeline de Enriquecimento de ETFs');
    console.log(`📊 Processando até ${maxETFs} ETFs em lotes de ${batchSize}`);

    try {
      // Buscar ETFs que precisam de enriquecimento
      const { data: etfs, error } = await supabase
        .from('etfs_ativos_reais')
        .select('symbol, holdingscount, beta_12m, tracking_error, morningstar_rating')
        .or('beta_12m.is.null,tracking_error.is.null,holdingscount.is.null')
        .limit(maxETFs);

      if (error) throw error;

      console.log(`📋 Encontrados ${etfs.length} ETFs para enriquecimento`);

      // Processar em lotes
      for (let i = 0; i < etfs.length; i += batchSize) {
        const batch = etfs.slice(i, i + batchSize);
        console.log(`\n🔄 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(etfs.length/batchSize)}`);
        
        const promises = batch.map(etf => this.processETF(etf));
        await Promise.allSettled(promises);
        
        // Delay entre lotes para respeitar rate limits
        if (i + batchSize < etfs.length) {
          console.log('⏳ Aguardando 30 segundos para respeitar rate limits...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }

      // Salvar log dos resultados
      await fs.writeFile(this.logFile, JSON.stringify(this.results, null, 2));

      console.log('\n📊 RESUMO DO PIPELINE:');
      console.log(`✅ ETFs processados com sucesso: ${this.processedCount}`);
      console.log(`❌ ETFs com erro: ${this.errorCount}`);
      console.log(`📁 Log salvo em: ${this.logFile}`);

    } catch (error) {
      console.error('❌ Erro no pipeline:', error.message);
      throw error;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const pipeline = new ETFEnrichmentPipeline();
  
  const batchSize = parseInt(process.argv[2]) || 10;
  const maxETFs = parseInt(process.argv[3]) || 100;
  
  pipeline.run(batchSize, maxETFs)
    .then(() => {
      console.log('🎉 Pipeline concluído com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Pipeline falhou:', error.message);
      process.exit(1);
    });
}

module.exports = ETFEnrichmentPipeline; 