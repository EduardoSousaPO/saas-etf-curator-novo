import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
  metric: string;
  children: React.ReactNode;
  className?: string;
}

interface MetricExplanation {
  title: string;
  explanation: string;
  example: string;
  formula?: string;
}

const METRIC_EXPLANATIONS: Record<string, MetricExplanation> = {
  returns_12m: {
    title: 'Retorno 12 meses',
    explanation: 'Percentual de ganho ou perda do ETF nos últimos 12 meses.',
    example: 'Um retorno de 15% significa que R$ 100 investidos se tornaram R$ 115.',
    formula: '((Preço Atual - Preço Inicial) / Preço Inicial) × 100'
  },
  returns_5y: {
    title: 'Retorno 5 anos',
    explanation: 'Retorno acumulado do ETF nos últimos 5 anos.',
    example: 'Retorno de 50% em 5 anos equivale a cerca de 8.4% ao ano.',
  },
  volatility_12m: {
    title: 'Volatilidade 12 meses',
    explanation: 'Medida de quanto o preço do ETF varia em relação à média.',
    example: 'Maior volatilidade = maior risco, mas também maior potencial de retorno.',
    formula: 'Desvio padrão dos retornos diários'
  },
  sharpe_12m: {
    title: 'Índice Sharpe',
    explanation: 'Mede o retorno ajustado ao risco. Quanto maior, melhor.',
    example: 'Sharpe de 1.5 é considerado muito bom, acima de 2.0 é excelente.',
    formula: '(Retorno - Taxa Livre de Risco) / Volatilidade'
  },
  beta: {
    title: 'Beta',
    explanation: 'Sensibilidade do ETF em relação ao mercado.',
    example: 'Beta 1.2 = se mercado sobe 10%, ETF tende a subir 12%.',
    formula: 'Covariância(ETF, Mercado) / Variância(Mercado)'
  },
  max_drawdown: {
    title: 'Drawdown Máximo',
    explanation: 'Maior queda percentual do pico até o vale.',
    example: 'Drawdown de -20% = perda máxima de 20% em algum período.',
  },
  expense_ratio: {
    title: 'Taxa de Administração',
    explanation: 'Custo anual para manter o ETF.',
    example: 'Taxa de 0.5% ao ano reduz seus retornos em 0.5% anualmente.',
  },
  dividend_yield: {
    title: 'Dividend Yield',
    explanation: 'Percentual de dividendos pagos anualmente.',
    example: 'Yield de 4% = a cada R$ 100, você recebe R$ 4 por ano.',
    formula: 'Dividendos Anuais / Preço Atual × 100'
  },
  total_assets: {
    title: 'Patrimônio Líquido',
    explanation: 'Valor total dos ativos sob gestão do ETF.',
    example: 'Maior patrimônio geralmente indica maior liquidez.',
  },
  volume: {
    title: 'Volume de Negociação',
    explanation: 'Quantidade de cotas negociadas diariamente.',
    example: 'Alto volume facilita compra/venda sem afetar o preço.',
  },
  standard_deviation: {
    title: 'Desvio Padrão',
    explanation: 'Medida estatística da volatilidade dos retornos.',
    example: 'Maior desvio = retornos mais dispersos da média.',
  }
};

export default function MetricTooltip({ metric, children, className = '' }: MetricTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const explanation = METRIC_EXPLANATIONS[metric];

  if (!explanation) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className="flex items-center space-x-1 cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
      </div>
      
      {isVisible && (
        <div className="absolute z-20 w-80 p-4 bg-white border rounded-lg shadow-xl top-full left-0 mt-2 border-gray-200">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg text-gray-900">{explanation.title}</h4>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700">{explanation.explanation}</p>
              
              <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">💡 Exemplo:</span> {explanation.example}
                </p>
              </div>
              
              {explanation.formula && (
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">📊 Fórmula:</span> {explanation.formula}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Seta do tooltip */}
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
} 