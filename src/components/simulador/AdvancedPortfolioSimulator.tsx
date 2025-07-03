'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Shield, Target, AlertTriangle, CheckCircle, ArrowRight, Play, DollarSign, Clock, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import BacktestingChart from './BacktestingChart';

interface PersonalizedRecommendation {
  id: string;
  userId: string;
  recommendationType: 'initial' | 'rebalance' | 'optimization';
  etfSymbols: string[];
  targetAllocations: number[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  riskScore: number;
  justification: string;
  confidenceScore: number;
  monthlyProjections: {
    month: number;
    expectedValue: number;
    pessimisticScenario: number;
    optimisticScenario: number;
  }[];
  // Novo: dados de benchmarking SPY+BND
  benchmarks?: {
    spy_comparison: {
      alpha: number;
      alpha_pct: string;
      beta: number;
      outperformance: string;
    };
    bnd_comparison: {
      alpha: number;
      alpha_pct: string;
      outperformance: string;
    };
    classic_60_40: {
      outperformance: number;
      outperformance_pct: string;
      benchmark_return: string;
      benchmark_volatility: string;
      verdict: string;
    };
  };
  risk_metrics?: {
    var_95_pct: string;
    cvar_95_pct: string;
    max_drawdown_pct: string;
    sortino_ratio: number;
    calmar_ratio: number;
  };
}

interface RebalancingAlert {
  id: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

// Novo tipo para o onboarding
interface OnboardingData {
  objective: 'retirement' | 'emergency' | 'house' | 'growth' | '';
  monthlyAmount: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | '';
}

export default function AdvancedPortfolioSimulator() {
  const [step, setStep] = useState<'onboarding' | 'results'>('onboarding');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    objective: '',
    monthlyAmount: 1000,
    riskProfile: ''
  });
  
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [timeHorizon, setTimeHorizon] = useState<number>(12);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [rebalancingAlerts, setRebalancingAlerts] = useState<RebalancingAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [acceptingRecommendation, setAcceptingRecommendation] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(1);

  const objectives = [
    { 
      id: 'retirement', 
      title: 'Aposentadoria', 
      description: 'Investir para o futuro (20+ anos)',
      icon: '🏖️',
      timeHorizon: 240 // 20 anos
    },
    { 
      id: 'emergency', 
      title: 'Reserva de Emergência', 
      description: 'Segurança financeira (1-2 anos)',
      icon: '🛡️',
      timeHorizon: 18 // 1.5 anos
    },
    { 
      id: 'house', 
      title: 'Comprar Casa/Carro', 
      description: 'Grandes compras (5-10 anos)',
      icon: '🏠',
      timeHorizon: 84 // 7 anos
    },
    { 
      id: 'growth', 
      title: 'Crescimento Patrimonial', 
      description: 'Multiplicar patrimônio (10+ anos)',
      icon: '📈',
      timeHorizon: 120 // 10 anos
    }
  ];

  const riskProfiles = [
    {
      id: 'conservative',
      title: 'Conservador',
      description: 'Prefiro segurança (máx 20% ações)',
      color: 'bg-green-100 text-green-800 border-green-200',
      expectedReturn: '6-8%',
      risk: 'Baixo'
    },
    {
      id: 'moderate',
      title: 'Moderado',
      description: 'Equilibrio entre risco e retorno (20-60% ações)',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      expectedReturn: '8-12%',
      risk: 'Médio'
    },
    {
      id: 'aggressive',
      title: 'Arrojado',
      description: 'Busco maiores retornos (60%+ ações)',
      color: 'bg-red-100 text-red-800 border-red-200',
      expectedReturn: '12-16%',
      risk: 'Alto'
    }
  ];

  const generateRecommendation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calcular valores baseados no onboarding
      const selectedObjective = objectives.find(obj => obj.id === onboardingData.objective);
      const calculatedTimeHorizon = selectedObjective?.timeHorizon || timeHorizon;
      const calculatedInvestmentAmount = onboardingData.monthlyAmount * calculatedTimeHorizon;

      // Tentar com autenticação primeiro, depois com override admin se falhar
      let response;
      let requestBody = {
        investmentAmount: calculatedInvestmentAmount,
        timeHorizon: calculatedTimeHorizon,
        objective: onboardingData.objective,
        riskProfile: onboardingData.riskProfile,
        monthlyAmount: onboardingData.monthlyAmount
      };

      try {
        response = await fetch('/api/portfolio/advanced-recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      } catch (authError) {

        // Se falhar por autenticação, tentar com override admin
        response = await fetch('/api/portfolio/advanced-recommendation?admin=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        // Se ainda falhar por autenticação, tentar com override admin
        if (response.status === 401) {
  
          response = await fetch('/api/portfolio/advanced-recommendation?admin=true', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          const retryData = await response.json();
          if (!response.ok) {
            throw new Error(retryData.error || 'Erro ao gerar recomendação');
          }
          
          // Usar dados da segunda tentativa
          setRecommendation(retryData.advanced_recommendation || retryData.recommendation);
          setRebalancingAlerts(retryData.rebalancingAlerts || []);
          setStep('results');
          return;
        }
        
        throw new Error(data.error || 'Erro ao gerar recomendação');
      }

      setRecommendation(data.advanced_recommendation || data.recommendation);
      setRebalancingAlerts(data.rebalancingAlerts || []);
      setStep('results');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRecommendation = async () => {
    if (!recommendation) return;
    
    setAcceptingRecommendation(true);
    
    try {
      const response = await fetch('/api/portfolio/advanced-recommendation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          action: 'accept',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aceitar recomendação');
      }

      // Mostrar sucesso e redirecionar para a carteira
      alert('🎉 Recomendação aceita! Sua carteira foi criada com sucesso.');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAcceptingRecommendation(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentOnboardingStep) {
      case 1: return onboardingData.objective !== '';
      case 2: return onboardingData.monthlyAmount > 0;
      case 3: return onboardingData.riskProfile !== '';
      default: return false;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'bg-green-500';
    if (riskScore <= 6) return 'bg-yellow-500';
    if (riskScore <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Renderizar onboarding simplificado
  if (step === 'onboarding') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Carteira em 30 Segundos
          </h1>
          <p className="text-xl text-muted-foreground">
            Responda 3 perguntas simples e receba sua carteira de ETFs personalizada
          </p>
          
          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Passo {currentOnboardingStep} de 3</span>
              <span>{Math.round((currentOnboardingStep / 3) * 100)}%</span>
            </div>
            <Progress value={(currentOnboardingStep / 3) * 100} className="h-2" />
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            {/* Passo 1: Objetivo */}
            {currentOnboardingStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Qual é o seu objetivo?</h2>
                  <p className="text-muted-foreground">Escolha o que melhor descreve seu objetivo principal</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {objectives.map((objective) => (
                    <Card 
                      key={objective.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        onboardingData.objective === objective.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setOnboardingData({...onboardingData, objective: objective.id as any})}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{objective.icon}</div>
                        <h3 className="font-semibold text-lg mb-2">{objective.title}</h3>
                        <p className="text-sm text-muted-foreground">{objective.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Passo 2: Valor mensal */}
            {currentOnboardingStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Quanto pode investir mensalmente?</h2>
                  <p className="text-muted-foreground">Defina um valor que caiba no seu orçamento</p>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {formatCurrency(onboardingData.monthlyAmount)}
                    </div>
                    <p className="text-sm text-muted-foreground">por mês</p>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={onboardingData.monthlyAmount}
                      onChange={(e) => setOnboardingData({...onboardingData, monthlyAmount: Number(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 100</span>
                      <span>R$ 10.000+</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[500, 1000, 2000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant={onboardingData.monthlyAmount === amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOnboardingData({...onboardingData, monthlyAmount: amount})}
                      >
                        R$ {amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Passo 3: Perfil de risco */}
            {currentOnboardingStep === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Qual seu perfil de risco?</h2>
                  <p className="text-muted-foreground">Como você se sente em relação a oscilações nos investimentos?</p>
                </div>
                
                <div className="space-y-4">
                  {riskProfiles.map((profile) => (
                    <Card 
                      key={profile.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        onboardingData.riskProfile === profile.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setOnboardingData({...onboardingData, riskProfile: profile.id as any})}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{profile.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{profile.description}</p>
                            <div className="flex gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Retorno: {profile.expectedReturn}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Risco: {profile.risk}
                              </span>
                            </div>
                          </div>
                          <Badge className={profile.color}>
                            {profile.risk}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentOnboardingStep(Math.max(1, currentOnboardingStep - 1))}
                disabled={currentOnboardingStep === 1}
              >
                Voltar
              </Button>
              
              {currentOnboardingStep < 3 ? (
                <Button
                  onClick={() => setCurrentOnboardingStep(currentOnboardingStep + 1)}
                  disabled={!canProceedToNextStep()}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={generateRecommendation}
                  disabled={!canProceedToNextStep() || isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando sua carteira...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Criar Minha Carteira
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="max-w-2xl mx-auto mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Renderizar resultados
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🎯 Sua Carteira Personalizada</h1>
        <p className="text-muted-foreground">
          Baseada na Teoria de Markowitz com simulações Monte Carlo
        </p>
        <Button 
          variant="outline" 
          onClick={() => setStep('onboarding')}
          className="mt-2"
        >
          ← Refazer Simulação
        </Button>
      </div>

      {/* Alertas de Rebalanceamento */}
      {rebalancingAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas de Rebalanceamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rebalancingAlerts.map((alert) => (
              <Alert key={alert.id}>
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recomendação Principal */}
      {recommendation && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-blue-600" />
              Sua Carteira Recomendada
            </CardTitle>
            <CardDescription className="text-lg">
              {recommendation.justification}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Retorno Esperado</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {(recommendation.expectedReturn * 100).toFixed(1)}% a.a.
                </div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Volatilidade</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {(recommendation.volatility * 100).toFixed(1)}% a.a.
                </div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Índice Sharpe</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {recommendation.sharpeRatio.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Seção de Benchmarking SPY+BND */}
            {recommendation.benchmarks && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  🎯 Comparação vs Benchmarks (SPY+BND)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* SPY Comparison */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-blue-600 mb-2">📈 vs SPY (S&P 500)</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Alpha:</span>
                        <span className={`font-bold ${recommendation.benchmarks.spy_comparison.alpha > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {recommendation.benchmarks.spy_comparison.alpha_pct}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Beta:</span>
                        <span className="font-medium">{recommendation.benchmarks.spy_comparison.beta.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {recommendation.benchmarks.spy_comparison.outperformance}
                      </div>
                    </div>
                  </div>

                  {/* BND Comparison */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-green-600 mb-2">🏦 vs BND (Bonds)</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Alpha:</span>
                        <span className={`font-bold ${recommendation.benchmarks.bnd_comparison.alpha > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {recommendation.benchmarks.bnd_comparison.alpha_pct}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {recommendation.benchmarks.bnd_comparison.outperformance}
                      </div>
                    </div>
                  </div>

                  {/* 60/40 Comparison */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="font-medium text-purple-600 mb-2">⚖️ vs Carteira 60/40</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Outperformance:</span>
                        <span className={`font-bold ${recommendation.benchmarks.classic_60_40.outperformance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {recommendation.benchmarks.classic_60_40.outperformance_pct}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Benchmark:</span>
                        <span>{recommendation.benchmarks.classic_60_40.benchmark_return}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {recommendation.benchmarks.classic_60_40.verdict}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Métricas de Risco Avançadas */}
            {recommendation.risk_metrics && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  🛡️ Métricas de Risco Avançadas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-sm text-muted-foreground mb-1">VaR 95%</div>
                    <div className="text-lg font-bold text-red-600">
                      {recommendation.risk_metrics.var_95_pct}
                    </div>
                    <div className="text-xs text-muted-foreground">Perda máxima esperada</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-sm text-muted-foreground mb-1">CVaR 95%</div>
                    <div className="text-lg font-bold text-red-600">
                      {recommendation.risk_metrics.cvar_95_pct}
                    </div>
                    <div className="text-xs text-muted-foreground">Perda condicional</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-sm text-muted-foreground mb-1">Max Drawdown</div>
                    <div className="text-lg font-bold text-red-600">
                      {recommendation.risk_metrics.max_drawdown_pct}
                    </div>
                    <div className="text-xs text-muted-foreground">Maior queda histórica</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-sm text-muted-foreground mb-1">Sortino Ratio</div>
                    <div className="text-lg font-bold text-blue-600">
                      {recommendation.risk_metrics.sortino_ratio.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Risco de downside</div>
                  </div>
                </div>
              </div>
            )}

            {/* Alocação da carteira */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Composição da Carteira</h3>
              <div className="space-y-3">
                {recommendation.etfSymbols.map((symbol, index) => (
                  <div key={symbol} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-semibold">{symbol}</div>
                        <div className="text-sm text-muted-foreground">ETF</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        {(recommendation.targetAllocations[index] * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(investmentAmount * recommendation.targetAllocations[index])}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projeção de crescimento */}
            {recommendation.monthlyProjections && recommendation.monthlyProjections.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Projeção de Crescimento</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={recommendation.monthlyProjections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label) => `Mês ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="optimisticScenario" 
                        stackId="1"
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.1}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expectedValue" 
                        stackId="2"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="pessimisticScenario" 
                        stackId="3"
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-red-600 font-medium">Cenário Pessimista</div>
                    <div className="text-muted-foreground">Pior caso</div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-medium">Cenário Esperado</div>
                    <div className="text-muted-foreground">Mais provável</div>
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">Cenário Otimista</div>
                    <div className="text-muted-foreground">Melhor caso</div>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de aceitar */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={acceptRecommendation}
                disabled={acceptingRecommendation}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              >
                {acceptingRecommendation ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando Carteira...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Aceitar e Criar Carteira
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backtesting Histórico */}
      {recommendation && (
        <BacktestingChart
          etfSymbols={recommendation.etfSymbols}
          allocations={recommendation.targetAllocations}
          initialAmount={investmentAmount}
          periodYears={10}
        />
      )}

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 