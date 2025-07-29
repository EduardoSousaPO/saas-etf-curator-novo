import { APIResult, UserIntent, FormattedResponse, UserContext } from '../../types/agents';
import { getLLMService } from '../../lib/ai/llm-integration';

export class WriterAgent {
  private llmService: any;

  constructor() {
    this.llmService = getLLMService();
    console.log('✍️ WriterAgent inicializado com GPT-4');
  }

  async formatResponse(apiResult: APIResult, intent: UserIntent, context?: UserContext): Promise<FormattedResponse> {
    try {
      console.log(`✍️ Formatando resposta: ${intent}`, {
        success: apiResult.success,
        hasData: !!apiResult.data
      });

      let formattedContent = '';
      let insights: string[] = [];

      if (!apiResult.success) {
        return this.formatErrorResponse(apiResult, intent, context);
      }

      // Usar GPT-4 para formatação da resposta
      try {
        formattedContent = await this.llmService.formatResponse(apiResult.data, intent, context);
        insights = await this.generateInsightsWithGPT(apiResult.data, intent);
      } catch (llmError) {
        console.warn('⚠️ Erro no GPT-4, usando formatação de fallback:', llmError);
        // Fallback para formatação baseada em templates
        formattedContent = await this.formatResponseFallback(apiResult.data, intent);
        insights = this.generateInsightsFallback(apiResult.data, intent);
      }

      const nextSteps = this.suggestNextSteps(intent, apiResult.data, context);

      return {
        content: formattedContent,
        insights,
        nextSteps,
        metadata: {
          intent,
          timestamp: new Date().toISOString(),
          dataSource: apiResult.source,
          userPlan: context?.subscriptionPlan,
          processingTime: apiResult.processingTime,
          llmUsed: true
        }
      };

    } catch (error) {
      console.error('❌ Erro na formatação da resposta:', error);
      return this.formatErrorResponse({
        success: false,
        data: { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        source: 'writer_agent',
        timestamp: new Date(),
        processingTime: 0
      }, intent, context);
    }
  }

  private async generateInsightsWithGPT(data: any, intent: UserIntent): Promise<string[]> {
    try {
      const systemPrompt = `Você é um especialista em análise de dados financeiros e ETFs.

Analise os dados fornecidos e gere 3-5 insights práticos e acionáveis.

Diretrizes para insights:
1. Seja específico e quantitativo quando possível
2. Foque em informações que ajudem na tomada de decisão
3. Use linguagem clara e objetiva
4. Destaque riscos e oportunidades
5. Cada insight deve ser uma frase completa

Tipo de análise: ${intent}
Dados: ${JSON.stringify(data, null, 2)}

Responda APENAS com um array JSON de strings:
["insight 1", "insight 2", "insight 3"]`;

      const response = await this.llmService.generateResponse({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Gere os insights baseados nos dados fornecidos.' }
        ],
        temperature: 0.7,
        maxTokens: 500
      });

      const parsed = JSON.parse(response.content);
      return Array.isArray(parsed) ? parsed.slice(0, 5) : [response.content];

    } catch (error) {
      console.warn('⚠️ Erro na geração de insights com GPT-4:', error);
      return this.generateInsightsFallback(data, intent);
    }
  }

  // Fallback para formatação sem GPT-4
  private async formatResponseFallback(data: any, intent: UserIntent): Promise<string> {
    switch (intent) {
      case UserIntent.PORTFOLIO_OPTIMIZATION:
        return this.formatPortfolioOptimization(data);
      case UserIntent.ETF_SCREENING:
        return this.formatETFScreening(data);
      case UserIntent.ETF_COMPARISON:
        return this.formatETFComparison(data);
      case UserIntent.MARKET_ANALYSIS:
        return this.formatMarketAnalysis(data);
      case UserIntent.RANKINGS_ANALYSIS:
        return this.formatRankingsAnalysis(data);
      case UserIntent.EDUCATIONAL:
        return this.formatEducationalContent(data);
      case UserIntent.REBALANCING:
        return this.formatRebalancingAdvice(data);
      default:
        return this.formatGenericResponse(data);
    }
  }

  private async formatPortfolioOptimization(data: any): Promise<string> {
    const { portfolio, metrics, projections } = data;
    
    return `
## 📊 Otimização de Portfolio Concluída

### 🎯 Composição Recomendada:
${portfolio.allocations.map((alloc: any) => 
  `• **${alloc.symbol}** (${(alloc.percentage * 100).toFixed(1)}%): ${alloc.name}
    - Expense Ratio: ${(alloc.expense_ratio * 100).toFixed(2)}% a.a.
    - Retorno 12m: ${(alloc.returns_12m * 100).toFixed(1)}%
    - Volatilidade: ${(alloc.volatility * 100).toFixed(1)}%
    - Setor: ${alloc.sector}`
).join('\n\n')}

### 📈 Métricas do Portfolio:
- **Retorno Esperado:** ${(metrics.expectedReturn * 100).toFixed(1)}% ao ano
- **Volatilidade:** ${(metrics.volatility * 100).toFixed(1)}%
- **Índice Sharpe:** ${metrics.sharpeRatio.toFixed(2)}
- **Custo Total:** ${(metrics.totalExpenseRatio * 100).toFixed(2)}% ao ano
- **Máximo Drawdown:** ${(metrics.maxDrawdown * 100).toFixed(1)}%

### 🔮 Projeções (12 meses):
- **Cenário Pessimista (15%):** ${this.formatCurrency(projections.pessimistic)}
- **Cenário Esperado (50%):** ${this.formatCurrency(projections.expected)}
- **Cenário Otimista (85%):** ${this.formatCurrency(projections.optimistic)}

### 💡 Justificativa:
Esta composição foi otimizada usando a **Teoria Moderna de Portfólio de Markowitz**, balanceando risco e retorno de acordo com seu perfil. A diversificação entre diferentes classes de ativos e regiões geográficas oferece proteção contra volatilidade excessiva.

${this.getInvestmentDisclaimer()}
    `;
  }

  private async formatETFScreening(data: any): Promise<string> {
    const { etfs, totalCount, appliedFilters } = data;
    
    return `
## 🔍 Resultados do Screening de ETFs

**${totalCount} ETFs encontrados** com os filtros aplicados.

### 🏆 Top ETFs Recomendados:
${etfs.slice(0, 10).map((etf: any, index: number) => 
  `${index + 1}. **${etf.symbol}** - ${etf.name}
     • Patrimônio: ${this.formatCurrency(etf.totalasset)}
     • Expense Ratio: ${(etf.expense_ratio * 100).toFixed(2)}%
     • Retorno 12m: ${(etf.returns_12m * 100).toFixed(1)}%
     • Dividend Yield: ${(etf.dividend_yield * 100).toFixed(1)}%
     • Volatilidade: ${(etf.volatility * 100).toFixed(1)}%
     • Setor: ${etf.sector || 'N/A'}`
).join('\n\n')}

### 🎯 Filtros Aplicados:
${this.formatAppliedFilters(appliedFilters)}

### 📊 Análise dos Resultados:
Os ETFs listados foram selecionados com base em critérios quantitativos rigorosos, priorizando **baixos custos**, **boa liquidez** e **performance consistente**. Todos atendem aos filtros especificados e representam opções sólidas para investimento.

${this.getInvestmentDisclaimer()}
    `;
  }

  private async formatETFComparison(data: any): Promise<string> {
    const { comparison } = data;
    
    return `
## ⚖️ Comparação Detalhada de ETFs

### 📊 Tabela Comparativa:
| Métrica | ${comparison.map((etf: any) => `**${etf.symbol}**`).join(' | ')} |
|---------|${comparison.map(() => '----------').join('|')}|
| **Nome** | ${comparison.map((etf: any) => etf.name).join(' | ')} |
| **Expense Ratio** | ${comparison.map((etf: any) => `${(etf.expense_ratio * 100).toFixed(2)}%`).join(' | ')} |
| **Retorno 12m** | ${comparison.map((etf: any) => `${(etf.returns_12m * 100).toFixed(1)}%`).join(' | ')} |
| **Volatilidade** | ${comparison.map((etf: any) => `${(etf.volatility * 100).toFixed(1)}%`).join(' | ')} |
| **Dividend Yield** | ${comparison.map((etf: any) => `${(etf.dividend_yield * 100).toFixed(1)}%`).join(' | ')} |
| **Patrimônio** | ${comparison.map((etf: any) => this.formatCurrency(etf.totalasset)).join(' | ')} |

### 🎯 Análise Comparativa:
${this.generateComparisonAnalysis(comparison)}

### 🏆 Recomendação:
${this.generateComparisonRecommendation(comparison)}

${this.getInvestmentDisclaimer()}
    `;
  }

  private async formatMarketAnalysis(data: any): Promise<string> {
    const { marketMetrics, trends, sectors } = data;
    
    return `
## 📈 Análise de Mercado de ETFs

### 📊 Métricas Gerais:
- **Total de ETFs Analisados:** ${marketMetrics.totalETFs.toLocaleString()}
- **Patrimônio Total:** ${this.formatCurrency(marketMetrics.totalAUM)}
- **Expense Ratio Médio:** ${(marketMetrics.avgExpenseRatio * 100).toFixed(2)}%
- **Retorno Médio 12m:** ${(marketMetrics.avgReturns12m * 100).toFixed(1)}%

### 🔥 Tendências Identificadas:
${trends.map((trend: any) => 
  `• **${trend.category}:** ${trend.description}
    - Performance: ${(trend.performance * 100).toFixed(1)}%`
).join('\n')}

### 🏭 Análise Setorial:
${sectors.map((sector: any) => 
  `• **${sector.name}:** ${sector.etfCount} ETFs disponíveis
    - Retorno Médio: ${(sector.avgReturn * 100).toFixed(1)}%
    - Volatilidade Média: ${(sector.avgVolatility * 100).toFixed(1)}%`
).join('\n')}

### 💡 Insights de Mercado:
O mercado de ETFs continua em expansão, com foco crescente em **baixos custos** e **diversificação global**. Setores de tecnologia lideram em performance, enquanto bonds oferecem estabilidade em cenários de incerteza.
    `;
  }

  private async formatRankingsAnalysis(data: any): Promise<string> {
    const { rankings, criteria, totalEvaluated } = data;
    
    return `
## 🏆 Rankings de ETFs

### 📊 Critério de Avaliação: ${this.translateCriteria(criteria)}
**${totalEvaluated} ETFs avaliados**

### 🥇 Top Performers:
${rankings.map((etf: any, index: number) => 
  `${index + 1}. **${etf.symbol}** - ${etf.name}
     • Score: ${etf.score}/10
     • Retorno 12m: ${(etf.returns_12m * 100).toFixed(1)}%`
).join('\n')}

### 🎯 Metodologia:
O ranking foi calculado considerando múltiplos fatores quantitativos, incluindo performance histórica, consistência de retornos, custos e liquidez. Os ETFs no topo demonstram excelência no critério selecionado.
    `;
  }

  private async formatEducationalContent(data: any): Promise<string> {
    const { query, type } = data;
    
    // Conteúdo educativo baseado na query
    const educationalContent = this.generateEducationalExplanation(query);
    
    return `
## 🎓 Explicação: ${query}

${educationalContent}

### 📚 Conceitos Relacionados:
• **Diversificação:** Redução de risco através de múltiplos investimentos
• **Expense Ratio:** Taxa anual cobrada pelo ETF
• **Liquidez:** Facilidade de compra e venda
• **Tracking Error:** Diferença entre ETF e seu índice de referência

### 💡 Exemplo Prático:
${this.generatePracticalExample(query)}

### 📖 Para Saber Mais:
Explore nossa seção de **Rankings** para ver ETFs que exemplificam esses conceitos, ou use o **Screener** para encontrar ETFs específicos.
    `;
  }

  private async formatRebalancingAdvice(data: any): Promise<string> {
    return `
## ⚖️ Sugestões de Rebalanceamento

### 📊 Análise Atual:
Seu portfolio será analisado para identificar desvios da alocação ideal.

### 🎯 Recomendações:
• Revisar alocações trimestralmente
• Rebalancear quando desvio > 5% da alocação target
• Considerar custos de transação
• Usar novos aportes para rebalanceamento

### 💡 Estratégia:
O rebalanceamento sistemático ajuda a manter o perfil de risco desejado e pode melhorar retornos de longo prazo através da disciplina de "comprar baixo, vender alto".
    `;
  }

  private async formatGenericResponse(data: any): Promise<string> {
    return `
## ✅ Processamento Concluído

${JSON.stringify(data, null, 2)}

Análise processada com sucesso. Para mais detalhes, utilize funcionalidades específicas como Portfolio Master, Screener ou Rankings.
    `;
  }

  private formatErrorResponse(apiResult: APIResult, intent: UserIntent, context?: UserContext): FormattedResponse {
    const errorData = apiResult.data as any;
    
    let content = '';
    let insights: string[] = [];
    let nextSteps: string[] = [];

    if (errorData?.error === 'PERMISSION_DENIED') {
      content = `
## 🔒 Acesso Restrito

A funcionalidade **${this.translateIntent(intent)}** não está disponível no seu plano atual (**${errorData.currentPlan}**).

### 🚀 Para Acessar Esta Funcionalidade:
Faça upgrade para o plano **${errorData.requiredPlan}** e desbloqueie:
• Análises avançadas de portfolio
• Otimização científica de investimentos  
• Ferramentas profissionais de rebalanceamento
• Relatórios personalizados

[🔥 **Fazer Upgrade Agora**](${errorData.upgradeUrl})
      `;
      
      insights = [
        `Plano atual: ${errorData.currentPlan}`,
        `Plano necessário: ${errorData.requiredPlan}`,
        'Upgrade disponível com benefícios imediatos'
      ];
      
      nextSteps = [
        'Considerar upgrade do plano',
        'Explorar funcionalidades gratuitas',
        'Entrar em contato para mais informações'
      ];
    } else {
      content = `
## ❌ Erro no Processamento

Ocorreu um problema ao processar sua solicitação:
**${errorData?.message || 'Erro desconhecido'}**

### 🔧 Possíveis Soluções:
• Tente reformular sua pergunta
• Verifique sua conexão com a internet
• Aguarde alguns momentos e tente novamente

Se o problema persistir, nossa equipe de suporte está disponível para ajudar.
      `;
      
      insights = ['Erro temporário detectado', 'Sistema em funcionamento normal'];
      nextSteps = ['Tentar novamente', 'Reformular pergunta', 'Contatar suporte'];
    }

    return {
      content,
      insights,
      nextSteps,
      metadata: {
        intent,
        timestamp: new Date().toISOString(),
        isError: true,
        errorCode: errorData?.error,
        userPlan: context?.subscriptionPlan,
        llmUsed: false
      }
    };
  }

  // Métodos auxiliares para geração de insights (fallback)
  private generateInsightsFallback(data: any, intent: UserIntent): string[] {
    const insights: string[] = [];
    
    switch (intent) {
      case UserIntent.PORTFOLIO_OPTIMIZATION:
        const { metrics, portfolio } = data;
        if (metrics.sharpeRatio > 1.0) {
          insights.push('📈 Excelente relação risco-retorno (Sharpe > 1.0)');
        }
        if (metrics.totalExpenseRatio < 0.005) {
          insights.push('💰 Portfolio com custos muito baixos (< 0.5% a.a.)');
        }
        if (portfolio.allocations.length >= 4) {
          insights.push('🎯 Boa diversificação com múltiplas classes de ativos');
        }
        break;

      case UserIntent.ETF_SCREENING:
        const { totalCount, etfs } = data;
        if (totalCount > 50) {
          insights.push('🔍 Muitas opções encontradas - considere filtros mais específicos');
        } else if (totalCount < 5) {
          insights.push('⚠️ Poucos resultados - considere relaxar alguns filtros');
        } else {
          insights.push('✅ Número ideal de opções para análise detalhada');
        }
        break;

      default:
        insights.push('📊 Análise processada com sucesso');
        insights.push('💡 Dados organizados para tomada de decisão');
    }
    
    return insights.length > 0 ? insights : ['Análise concluída com sucesso'];
  }

  private suggestNextSteps(intent: UserIntent, data: any, context?: UserContext): string[] {
    const baseSteps: Record<UserIntent, string[]> = {
      [UserIntent.PORTFOLIO_OPTIMIZATION]: [
        'Revisar a alocação sugerida',
        'Simular diferentes cenários de risco',
        'Considerar implementação gradual',
        'Agendar revisão trimestral'
      ],
      [UserIntent.ETF_SCREENING]: [
        'Analisar detalhes dos ETFs selecionados',
        'Comparar com benchmarks relevantes',
        'Verificar histórico de performance',
        'Avaliar adequação ao seu perfil'
      ],
      [UserIntent.ETF_COMPARISON]: [
        'Aprofundar análise do ETF recomendado',
        'Verificar correlação com portfolio atual',
        'Considerar custos de transação',
        'Avaliar timing de entrada'
      ],
      [UserIntent.MARKET_ANALYSIS]: [
        'Monitorar tendências identificadas',
        'Ajustar portfolio conforme insights',
        'Acompanhar setores em destaque',
        'Revisar estratégia de alocação'
      ],
      [UserIntent.EDUCATIONAL]: [
        'Aplicar conceito na prática',
        'Explorar temas relacionados',
        'Usar ferramentas de screening',
        'Buscar exemplos no mercado'
      ],
      [UserIntent.RANKINGS_ANALYSIS]: [
        'Investigar ETFs top-ranked',
        'Comparar com holdings atuais',
        'Analisar metodologia do ranking',
        'Considerar diversificação'
      ],
      [UserIntent.REBALANCING]: [
        'Calcular custos de rebalanceamento',
        'Definir cronograma de revisão',
        'Implementar gradualmente',
        'Monitorar desvios futuros'
      ],
      [UserIntent.PROJECT_MANAGEMENT]: [
        'Salvar configurações',
        'Definir alertas',
        'Agendar revisões',
        'Documentar estratégia'
      ],
      [UserIntent.ERROR]: [
        'Tentar novamente',
        'Reformular pergunta',
        'Contatar suporte'
      ]
    };

    return baseSteps[intent] || ['Explorar mais funcionalidades', 'Consultar especialista'];
  }

  // Métodos utilitários (mantidos do código original)
  private formatCurrency(value: number, currency: string = 'USD'): string {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(1)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }

  private formatAppliedFilters(filters: any): string {
    const filterDescriptions: string[] = [];
    
    if (filters.sector) filterDescriptions.push(`Setor: ${filters.sector}`);
    if (filters.maxExpenseRatio) filterDescriptions.push(`Taxa máxima: ${(filters.maxExpenseRatio * 100).toFixed(2)}%`);
    if (filters.minAUM) filterDescriptions.push(`Patrimônio mínimo: ${this.formatCurrency(filters.minAUM)}`);
    if (filters.sortBy) filterDescriptions.push(`Ordenado por: ${this.translateSortBy(filters.sortBy)}`);
    
    return filterDescriptions.length > 0 
      ? filterDescriptions.map(desc => `• ${desc}`).join('\n')
      : '• Nenhum filtro específico aplicado';
  }

  private generateComparisonAnalysis(comparison: any[]): string {
    const analysis: string[] = [];
    
    // Análise de performance
    const bestPerformer = comparison.reduce((best, current) => 
      current.returns_12m > best.returns_12m ? current : best
    );
    analysis.push(`**Performance:** ${bestPerformer.symbol} lidera com ${(bestPerformer.returns_12m * 100).toFixed(1)}% em 12 meses.`);
    
    // Análise de custos
    const cheapest = comparison.reduce((lowest, current) => 
      current.expense_ratio < lowest.expense_ratio ? current : lowest
    );
    analysis.push(`**Custos:** ${cheapest.symbol} oferece a menor taxa (${(cheapest.expense_ratio * 100).toFixed(2)}%).`);
    
    // Análise de tamanho
    const largest = comparison.reduce((biggest, current) => 
      current.totalasset > biggest.totalasset ? current : biggest
    );
    analysis.push(`**Liquidez:** ${largest.symbol} possui maior patrimônio (${this.formatCurrency(largest.totalasset)}).`);
    
    return analysis.join('\n\n');
  }

  private generateComparisonRecommendation(comparison: any[]): string {
    // Lógica simples de recomendação baseada em score composto
    const scored = comparison.map(etf => ({
      ...etf,
      score: (etf.returns_12m * 0.4) + ((1 - etf.expense_ratio) * 0.3) + ((etf.totalasset / 1e12) * 0.3)
    }));
    
    const recommended = scored.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return `Baseado na análise de **performance**, **custos** e **liquidez**, recomendamos **${recommended.symbol}** como a opção mais equilibrada para a maioria dos investidores.`;
  }

  private generateEducationalExplanation(query: string): string {
    const explanations: Record<string, string> = {
      'expense ratio': `
**Expense Ratio** é a taxa anual cobrada por um ETF para cobrir seus custos operacionais, expressa como percentual do patrimônio.

### Como Funciona:
• **0.03%** = R$ 3 por ano para cada R$ 10.000 investidos
• **0.50%** = R$ 50 por ano para cada R$ 10.000 investidos

### Por que Importa:
• Impacta diretamente seu retorno líquido
• Diferença de 0.20% pode representar milhares de reais ao longo do tempo
• ETFs passivos geralmente têm custos menores que fundos ativos

### Benchmark:
• **Excelente:** < 0.10%
• **Bom:** 0.10% - 0.30%  
• **Aceitável:** 0.30% - 0.60%
• **Alto:** > 0.60%
      `,
      'dividend yield': `
**Dividend Yield** representa a rentabilidade anual dos dividendos pagos por um ETF, expressa como percentual do preço atual.

### Cálculo:
Dividend Yield = (Dividendos Anuais ÷ Preço Atual) × 100

### Características:
• **ETFs de Dividendos:** 2% - 6% típico
• **ETFs de Crescimento:** 0% - 2% típico
• **REITs ETFs:** 3% - 8% típico

### Considerações:
• Yield alto pode indicar preço deprimido
• Foque na sustentabilidade dos dividendos
• Considere crescimento dos dividendos ao longo do tempo
      `,
      'volatilidade': `
**Volatilidade** mede a variação dos preços de um investimento ao longo do tempo, indicando o nível de risco.

### Interpretação:
• **Baixa (< 15%):** Investimentos mais estáveis
• **Moderada (15% - 25%):** Risco equilibrado
• **Alta (> 25%):** Maior potencial de ganhos e perdas

### Tipos:
• **Histórica:** Baseada em dados passados
• **Implícita:** Expectativa do mercado para o futuro

### Aplicação Prática:
• Use para dimensionar posição no portfolio
• Combine ativos de diferentes volatilidades
• Considere seu horizonte de investimento
      `
    };
    
    const key = Object.keys(explanations).find(k => query.toLowerCase().includes(k));
    return key ? explanations[key] : `
**${query}** é um conceito importante no mundo dos investimentos em ETFs.

Esta explicação detalhada será desenvolvida com base em pesquisas atualizadas e melhores práticas do mercado. 

Para informações mais específicas, utilize nossas ferramentas de **Screener** e **Comparação** para ver exemplos práticos deste conceito aplicado a ETFs reais.
    `;
  }

  private generatePracticalExample(query: string): string {
    if (query.toLowerCase().includes('expense ratio')) {
      return `
**Exemplo:** Comparando dois ETFs similares:
• **ETF A:** Expense ratio 0.03% - Custo anual de R$ 30 para R$ 100.000
• **ETF B:** Expense ratio 0.75% - Custo anual de R$ 750 para R$ 100.000

**Diferença:** R$ 720 por ano, que ao longo de 20 anos pode representar mais de R$ 20.000 em custos adicionais!
      `;
    }
    
    return `Utilize nosso **Screener** para encontrar ETFs que exemplificam este conceito na prática.`;
  }

  private translateIntent(intent: UserIntent): string {
    const translations: Record<UserIntent, string> = {
      [UserIntent.PORTFOLIO_OPTIMIZATION]: 'Otimização de Portfolio',
      [UserIntent.ETF_SCREENING]: 'Screening de ETFs',
      [UserIntent.ETF_COMPARISON]: 'Comparação de ETFs',
      [UserIntent.MARKET_ANALYSIS]: 'Análise de Mercado',
      [UserIntent.EDUCATIONAL]: 'Conteúdo Educativo',
      [UserIntent.RANKINGS_ANALYSIS]: 'Análise de Rankings',
      [UserIntent.REBALANCING]: 'Rebalanceamento',
      [UserIntent.PROJECT_MANAGEMENT]: 'Gestão de Projetos',
      [UserIntent.ERROR]: 'Erro do Sistema'
    };
    
    return translations[intent] || intent;
  }

  private translateCriteria(criteria: string): string {
    const translations: Record<string, string> = {
      'returns_12m': 'Retorno 12 Meses',
      'sharpe_ratio': 'Índice Sharpe',
      'expense_ratio': 'Taxa de Administração',
      'dividend_yield': 'Dividend Yield',
      'volatilidade': 'Volatilidade'
    };
    
    return translations[criteria] || criteria;
  }

  private translateSortBy(sortBy: string): string {
    const translations: Record<string, string> = {
      'returns_12m': 'Retorno 12m',
      'expense_ratio': 'Taxa de Administração',
      'totalasset': 'Patrimônio',
      'dividend_yield': 'Dividend Yield',
      'volatilidade': 'Volatilidade'
    };
    
    return translations[sortBy] || sortBy;
  }

  // Health check
  private getInvestmentDisclaimer(): string {
    return `
---
⚠️ **IMPORTANTE - DISCLAIMER DE INVESTIMENTOS:**
*Esta análise é apenas para fins educacionais e informativos. Não constitui consultoria de investimento, recomendação de compra ou venda de valores mobiliários. Investimentos em ETFs envolvem riscos, incluindo possível perda do capital investido. Rentabilidade passada não garante resultados futuros. Consulte sempre um profissional qualificado antes de tomar decisões de investimento.*
    `;
  }

  getStatus(): { status: string; timestamp: string; llmProvider?: string } {
    const llmStats = this.llmService?.getStats();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      llmProvider: llmStats?.provider || 'GPT-4'
    };
  }
} 