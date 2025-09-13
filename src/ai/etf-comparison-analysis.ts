/**
 * Análise Comparativa de ETFs - Vista AI Chat
 * Gera análises detalhadas usando dados diretos do Supabase
 */

import { SupportedLanguage, LanguageUtils } from './language-detector';

/**
 * Gera análise comparativa de ETFs usando dados diretos do Supabase
 */
export function generateETFComparisonAnalysis(etfData: any[], language: SupportedLanguage): string {
  const isPortuguese = LanguageUtils.isPortuguese(language);
  
  if (!etfData || etfData.length === 0) {
    return isPortuguese 
      ? "Não foi possível encontrar dados para os ETFs solicitados."
      : "Could not find data for the requested ETFs.";
  }
  
  const symbols = etfData.map(etf => etf.symbol).join(' vs ');
  
  // Encontrar melhores em cada categoria
  const lowestExpense = etfData.reduce((min, etf) => 
    (etf.expenseratio || 999) < (min.expenseratio || 999) ? etf : min, etfData[0]);
  const bestReturn = etfData.reduce((max, etf) => 
    (etf.returns_12m || -999) > (max.returns_12m || -999) ? etf : max, etfData[0]);
  const largestAssets = etfData.reduce((max, etf) => 
    (etf.totalasset || 0) > (max.totalasset || 0) ? etf : max, etfData[0]);
  
  if (isPortuguese) {
    return `
📊 **Comparação de ETFs: ${symbols}**
*Dados diretos da base completa de 1.370 ETFs*

${etfData.map((etf, i) => `
**${i + 1}. ${etf.symbol} - ${etf.name || 'N/A'}**
- **Taxa de Administração:** ${etf.expenseratio ? etf.expenseratio.toFixed(2) + '%' : 'N/A'}
- **Retorno 12m:** ${etf.returns_12m ? etf.returns_12m.toFixed(1) + '%' : 'N/A'}
- **Volatilidade:** ${etf.volatility_12m ? etf.volatility_12m.toFixed(1) + '%' : 'N/A'}
- **Sharpe Ratio:** ${etf.sharpe_12m ? etf.sharpe_12m.toFixed(2) : 'N/A'}
- **Patrimônio:** ${etf.totalasset ? '$' + (etf.totalasset / 1000000000).toFixed(1) + 'B' : 'N/A'}
- **Rating Morningstar:** ${etf.morningstar_rating || 'N/A'}
`).join('\n')}

**💡 Análise Comparativa:**
- **🏆 Menor Taxa:** ${lowestExpense.symbol} (${lowestExpense.expenseratio?.toFixed(2) || 'N/A'}%)
- **📈 Melhor Performance:** ${bestReturn.symbol} (${bestReturn.returns_12m?.toFixed(1) || 'N/A'}%)
- **💰 Maior Liquidez:** ${largestAssets.symbol} ($${(largestAssets.totalasset / 1000000000)?.toFixed(1) || 'N/A'}B)

**🎯 Recomendação:** Para uma análise mais detalhada, considere fatores como seu perfil de risco, objetivo de investimento e horizonte temporal.

Gostaria de criar uma carteira otimizada com estes ETFs?`;
  } else {
    return `
📊 **ETF Comparison: ${symbols}**
*Direct data from complete database of 1,370 ETFs*

${etfData.map((etf, i) => `
**${i + 1}. ${etf.symbol} - ${etf.name || 'N/A'}**
- **Expense Ratio:** ${etf.expenseratio ? etf.expenseratio.toFixed(2) + '%' : 'N/A'}
- **12m Return:** ${etf.returns_12m ? etf.returns_12m.toFixed(1) + '%' : 'N/A'}
- **Volatility:** ${etf.volatility_12m ? etf.volatility_12m.toFixed(1) + '%' : 'N/A'}
- **Sharpe Ratio:** ${etf.sharpe_12m ? etf.sharpe_12m.toFixed(2) : 'N/A'}
- **Assets:** ${etf.totalasset ? '$' + (etf.totalasset / 1000000000).toFixed(1) + 'B' : 'N/A'}
- **Morningstar Rating:** ${etf.morningstar_rating || 'N/A'}
`).join('\n')}

**💡 Comparative Analysis:**
- **🏆 Lowest Cost:** ${lowestExpense.symbol} (${lowestExpense.expenseratio?.toFixed(2) || 'N/A'}%)
- **📈 Best Performance:** ${bestReturn.symbol} (${bestReturn.returns_12m?.toFixed(1) || 'N/A'}%)
- **💰 Highest Liquidity:** ${largestAssets.symbol} ($${(largestAssets.totalasset / 1000000000)?.toFixed(1) || 'N/A'}B)

**🎯 Recommendation:** For a detailed analysis, consider factors like your risk profile, investment objective, and time horizon.

Would you like to create an optimized portfolio with these ETFs?`;
  }
}
