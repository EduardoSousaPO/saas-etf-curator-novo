'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Calendar, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BacktestData {
  date: string;
  portfolioValue: number;
  sp500Value: number;
  nasdaqValue: number;
  portfolioReturn: number;
  sp500Return: number;
  nasdaqReturn: number;
  portfolioCumulativeReturn: number;
  sp500CumulativeReturn: number;
  nasdaqCumulativeReturn: number;
}

interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winRate: number;
  bestMonth: number;
  worstMonth: number;
  beta: number;
  alpha: number;
}

interface BacktestingChartProps {
  etfSymbols: string[];
  allocations: number[];
  initialAmount?: number;
  periodYears?: number;
}

export default function BacktestingChart({ 
  etfSymbols, 
  allocations, 
  initialAmount = 100000,
  periodYears = 10 
}: BacktestingChartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [backtestData, setBacktestData] = useState<BacktestData[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<BacktestMetrics | null>(null);
  const [sp500Metrics, setSp500Metrics] = useState<BacktestMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(periodYears);
  const [error, setError] = useState<string | null>(null);

  const periods = [
    { years: 1, label: '1 Ano' },
    { years: 3, label: '3 Anos' },
    { years: 5, label: '5 Anos' },
    { years: 10, label: '10 Anos' },
    { years: 15, label: '15 Anos' }
  ];

  const runBacktest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/portfolio/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          etfSymbols,
          allocations,
          initialAmount,
          periodYears: selectedPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao executar backtesting');
      }

      setBacktestData(data.backtestData);
      setPortfolioMetrics(data.portfolioMetrics);
      setSp500Metrics(data.sp500Metrics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (etfSymbols.length > 0 && allocations.length > 0) {
      runBacktest();
    }
  }, [etfSymbols, allocations, selectedPeriod]);

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceBadgeColor = (value: number) => {
    return value >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatTooltip = (value: number, name: string) => {
    if (name.includes('Return')) {
      return [formatPercentage(value), name];
    }
    return [formatCurrency(value), name];
  };

  const crisisEvents = [
    { date: '2008-09', name: 'Crise Financeira 2008', color: '#ef4444' },
    { date: '2020-03', name: 'COVID-19', color: '#f97316' },
    { date: '2022-01', name: 'Inflação/Fed', color: '#eab308' }
  ];

  if (isLoading && backtestData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <div>
              <h3 className="font-semibold">Executando Backtesting</h3>
              <p className="text-sm text-muted-foreground">
                Analisando {selectedPeriod} anos de dados históricos...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Backtesting Histórico
              </CardTitle>
              <CardDescription>
                Performance da sua carteira vs índices de referência
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {periods.map((period) => (
                <Button
                  key={period.years}
                  variant={selectedPeriod === period.years ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.years)}
                  disabled={isLoading}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Métricas de Performance */}
      {portfolioMetrics && sp500Metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carteira */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Sua Carteira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Retorno Total</div>
                  <div className={`text-xl font-bold ${getPerformanceColor(portfolioMetrics.totalReturn)}`}>
                    {formatPercentage(portfolioMetrics.totalReturn)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Retorno Anual</div>
                  <div className={`text-xl font-bold ${getPerformanceColor(portfolioMetrics.annualizedReturn)}`}>
                    {formatPercentage(portfolioMetrics.annualizedReturn)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Volatilidade</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(portfolioMetrics.volatility)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                  <div className="text-lg font-semibold">
                    {portfolioMetrics.sharpeRatio.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* S&P 500 */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                S&P 500
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Retorno Total</div>
                  <div className={`text-xl font-bold ${getPerformanceColor(sp500Metrics.totalReturn)}`}>
                    {formatPercentage(sp500Metrics.totalReturn)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Retorno Anual</div>
                  <div className={`text-xl font-bold ${getPerformanceColor(sp500Metrics.annualizedReturn)}`}>
                    {formatPercentage(sp500Metrics.annualizedReturn)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Volatilidade</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(sp500Metrics.volatility)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                  <div className="text-lg font-semibold">
                    {sp500Metrics.sharpeRatio.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparação de Performance */}
      {portfolioMetrics && sp500Metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Diferença de Retorno</div>
                <div className={`text-2xl font-bold ${getPerformanceColor(portfolioMetrics.totalReturn - sp500Metrics.totalReturn)}`}>
                  {portfolioMetrics.totalReturn > sp500Metrics.totalReturn ? '+' : ''}
                  {formatPercentage(portfolioMetrics.totalReturn - sp500Metrics.totalReturn)}
                </div>
                <Badge className={getPerformanceBadgeColor(portfolioMetrics.totalReturn - sp500Metrics.totalReturn)}>
                  {portfolioMetrics.totalReturn > sp500Metrics.totalReturn ? 'Superou' : 'Abaixo'} do S&P 500
                </Badge>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Máximo Drawdown</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatPercentage(portfolioMetrics.maxDrawdown)}
                </div>
                <div className="text-xs text-muted-foreground">
                  vs {formatPercentage(sp500Metrics.maxDrawdown)} (S&P 500)
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Taxa de Acerto</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(portfolioMetrics.winRate)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Meses positivos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico Principal */}
      {backtestData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução Patrimonial ({selectedPeriod} anos)</CardTitle>
            <CardDescription>
              Investimento inicial de {formatCurrency(initialAmount)} - Inclui períodos de crise destacados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="absolute" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="absolute">Valores Absolutos</TabsTrigger>
                <TabsTrigger value="returns">Retornos Acumulados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="absolute" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={backtestData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value, true)}
                      />
                      <Tooltip 
                        formatter={formatTooltip}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="portfolioValue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        name="Sua Carteira"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sp500Value" 
                        stroke="#6b7280" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="S&P 500"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nasdaqValue" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        name="NASDAQ"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="returns" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={backtestData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatPercentage(value)}
                      />
                      <Tooltip 
                        formatter={formatTooltip}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="portfolioCumulativeReturn" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        name="Sua Carteira (%)"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sp500CumulativeReturn" 
                        stroke="#6b7280" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="S&P 500 (%)"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nasdaqCumulativeReturn" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        name="NASDAQ (%)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>

            {/* Eventos de Crise */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Principais Eventos Históricos
              </h4>
              <div className="flex flex-wrap gap-2">
                {crisisEvents.map((event) => (
                  <Badge key={event.date} variant="outline" className="text-xs">
                    {event.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Observe como sua carteira se comportou durante períodos de volatilidade do mercado
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Detalhadas */}
      {portfolioMetrics && sp500Metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Risco Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="text-lg font-semibold">{portfolioMetrics.beta.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">vs mercado</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Alpha</div>
                <div className={`text-lg font-semibold ${getPerformanceColor(portfolioMetrics.alpha)}`}>
                  {formatPercentage(portfolioMetrics.alpha)}
                </div>
                <div className="text-xs text-muted-foreground">vs S&P 500</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Melhor Mês</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatPercentage(portfolioMetrics.bestMonth)}
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Pior Mês</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatPercentage(portfolioMetrics.worstMonth)}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Interpretação dos Resultados</h4>
              <div className="text-sm space-y-1">
                <p><strong>Beta {portfolioMetrics.beta.toFixed(2)}:</strong> {
                  portfolioMetrics.beta > 1 
                    ? 'Carteira mais volátil que o mercado' 
                    : portfolioMetrics.beta < 1 
                      ? 'Carteira menos volátil que o mercado'
                      : 'Carteira com volatilidade similar ao mercado'
                }</p>
                <p><strong>Alpha {formatPercentage(portfolioMetrics.alpha)}:</strong> {
                  portfolioMetrics.alpha > 0 
                    ? 'Carteira gerou retorno extra vs S&P 500' 
                    : 'Carteira ficou abaixo do S&P 500'
                }</p>
                <p><strong>Sharpe {portfolioMetrics.sharpeRatio.toFixed(2)}:</strong> {
                  portfolioMetrics.sharpeRatio > 1 
                    ? 'Excelente relação risco-retorno' 
                    : portfolioMetrics.sharpeRatio > 0.5
                      ? 'Boa relação risco-retorno'
                      : 'Relação risco-retorno pode ser melhorada'
                }</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 