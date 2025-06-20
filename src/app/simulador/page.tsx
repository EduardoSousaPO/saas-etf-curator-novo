"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RequireAuth from '@/components/auth/RequireAuth';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { useAuth } from '@/hooks/useAuth';
import { currencyService } from '@/lib/currency';
import { 
  Calculator, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  PieChart,
  Lightbulb,
  Zap,
  Globe
} from 'lucide-react';

interface SimulationInput {
  monthlyInvestment: number;
  monthlyInvestmentCurrency: 'BRL' | 'USD';
  initialAmount: number;
  initialAmountCurrency: 'BRL' | 'USD';
  targetAmount: number;
  targetAmountCurrency: 'BRL' | 'USD';
  timeHorizon: number; // em anos
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

interface SimulationResult {
  finalAmount: number;
  finalAmountUSD: number;
  monthsToGoal: number;
  totalContributed: number;
  totalContributedUSD: number;
  totalGains: number;
  totalGainsUSD: number;
  monthlyNeeded: number;
  monthlyNeededUSD: number;
  isRealistic: boolean;
  dollarExposure: number;
  suggestedETFs: string[];
}

interface ETFSuggestion {
  symbol: string;
  name: string;
  allocation: number;
  reason: string;
  risk: 'low' | 'medium' | 'high';
}

export default function SimulatorPage() {
  const { profile } = useAuth();
  const [input, setInput] = useState<SimulationInput>({
    monthlyInvestment: 1000,
    monthlyInvestmentCurrency: 'BRL',
    initialAmount: 10000,
    initialAmountCurrency: 'BRL',
    targetAmount: 1000000,
    targetAmountCurrency: 'BRL',
    timeHorizon: 15,
    riskProfile: 'moderate'
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [suggestions, setSuggestions] = useState<ETFSuggestion[]>([]);

  useEffect(() => {
    // Carregar dados do perfil se disponível
    if (profile) {
      setInput(prev => ({
        ...prev,
        monthlyInvestment: profile.monthly_investment || prev.monthlyInvestment,
        initialAmount: profile.total_patrimony || prev.initialAmount,
        targetAmount: 1000000, // Meta padrão já que target_amount não existe no UserProfile
        riskProfile: profile.profile?.toLowerCase() as any || prev.riskProfile
      }));
    }
  }, [profile]);

  useEffect(() => {
    calculateSimulation();
  }, [input]);

  const convertToUSD = async (amount: number, currency: 'BRL' | 'USD'): Promise<number> => {
    if (currency === 'USD') return amount;
    return await currencyService.convertBRLToUSD(amount);
  };

  const calculateSimulation = async () => {
    
    try {
      // Taxas de retorno baseadas no perfil de risco (ETFs americanos)
      const returnRates = {
        conservative: 0.06, // 6% ao ano
        moderate: 0.08,     // 8% ao ano
        aggressive: 0.12    // 12% ao ano
      };

      const annualReturn = returnRates[input.riskProfile];
      const monthlyReturn = annualReturn / 12;
      
      // Converter valores para USD para cálculos (ETFs são em USD)
      const monthlyInvestmentUSD = await convertToUSD(input.monthlyInvestment, input.monthlyInvestmentCurrency);
      const initialAmountUSD = await convertToUSD(input.initialAmount, input.initialAmountCurrency);
      const targetAmountUSD = await convertToUSD(input.targetAmount, input.targetAmountCurrency);
      
      // Cálculo de juros compostos em USD
      const months = input.timeHorizon * 12;
      let currentAmountUSD = initialAmountUSD;
      let totalContributedUSD = initialAmountUSD;
      
      // Simular crescimento mês a mês
      for (let i = 0; i < months; i++) {
        currentAmountUSD = currentAmountUSD * (1 + monthlyReturn) + monthlyInvestmentUSD;
        totalContributedUSD += monthlyInvestmentUSD;
      }

      const totalGainsUSD = currentAmountUSD - totalContributedUSD;
      
      // Calcular quanto tempo para atingir a meta
      let monthsToGoal = 0;
      let tempAmountUSD = initialAmountUSD;
      
      while (tempAmountUSD < targetAmountUSD && monthsToGoal < 600) { // máximo 50 anos
        tempAmountUSD = tempAmountUSD * (1 + monthlyReturn) + monthlyInvestmentUSD;
        monthsToGoal++;
      }

      // Calcular aporte mensal necessário para atingir a meta no prazo
      const monthlyNeededUSD = calculateMonthlyNeeded(
        initialAmountUSD,
        targetAmountUSD,
        input.timeHorizon,
        annualReturn
      );

      // Converter valores de volta para BRL para exibição
      const finalAmountBRL = await currencyService.convertUSDToBRL(currentAmountUSD);
      const totalContributedBRL = await currencyService.convertUSDToBRL(totalContributedUSD);
      const totalGainsBRL = await currencyService.convertUSDToBRL(totalGainsUSD);
      const monthlyNeededBRL = await currencyService.convertUSDToBRL(monthlyNeededUSD);

      const result: SimulationResult = {
        finalAmount: finalAmountBRL,
        finalAmountUSD: currentAmountUSD,
        monthsToGoal,
        totalContributed: totalContributedBRL,
        totalContributedUSD,
        totalGains: totalGainsBRL,
        totalGainsUSD,
        monthlyNeeded: monthlyNeededBRL,
        monthlyNeededUSD,
        isRealistic: monthsToGoal <= input.timeHorizon * 12,
        dollarExposure: currentAmountUSD,
        suggestedETFs: getSuggestedETFs(input.riskProfile)
      };

      setResult(result);
      generateETFSuggestions(input.riskProfile);
    } catch (error) {
      console.error('Erro no cálculo da simulação:', error);
    }
  };

  const calculateMonthlyNeeded = (initial: number, target: number, years: number, annualReturn: number): number => {
    const months = years * 12;
    const monthlyReturn = annualReturn / 12;
    
    // Fórmula para calcular PMT (pagamento mensal)
    const futureValueInitial = initial * Math.pow(1 + monthlyReturn, months);
    const remainingAmount = target - futureValueInitial;
    
    if (remainingAmount <= 0) return 0;
    
    const pmt = remainingAmount / (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn));
    return Math.max(0, pmt);
  };

  const getSuggestedETFs = (riskProfile: string): string[] => {
    const etfs = {
      conservative: ['SCHZ', 'BND', 'VTI', 'SCHD'],
      moderate: ['VTI', 'VXUS', 'BND', 'VNQ'],
      aggressive: ['QQQ', 'VTI', 'VXUS', 'ARKK']
    };
    return etfs[riskProfile as keyof typeof etfs] || etfs.moderate;
  };

  const generateETFSuggestions = (riskProfile: string) => {
    const suggestions: ETFSuggestion[] = [];
    
    switch (riskProfile) {
      case 'conservative':
        suggestions.push(
          { symbol: 'BND', name: 'Vanguard Total Bond Market', allocation: 40, reason: 'Estabilidade e renda', risk: 'low' },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market', allocation: 35, reason: 'Diversificação ampla', risk: 'medium' },
          { symbol: 'SCHD', name: 'Schwab US Dividend Equity', allocation: 25, reason: 'Dividendos consistentes', risk: 'low' }
        );
        break;
      case 'moderate':
        suggestions.push(
          { symbol: 'VTI', name: 'Vanguard Total Stock Market', allocation: 40, reason: 'Base sólida do portfólio', risk: 'medium' },
          { symbol: 'VXUS', name: 'Vanguard Total International Stock', allocation: 30, reason: 'Diversificação internacional', risk: 'medium' },
          { symbol: 'BND', name: 'Vanguard Total Bond Market', allocation: 20, reason: 'Redução de volatilidade', risk: 'low' },
          { symbol: 'VNQ', name: 'Vanguard Real Estate', allocation: 10, reason: 'Proteção contra inflação', risk: 'medium' }
        );
        break;
      case 'aggressive':
        suggestions.push(
          { symbol: 'QQQ', name: 'Invesco QQQ Trust', allocation: 35, reason: 'Crescimento tecnológico', risk: 'high' },
          { symbol: 'VTI', name: 'Vanguard Total Stock Market', allocation: 30, reason: 'Diversificação ampla', risk: 'medium' },
          { symbol: 'VXUS', name: 'Vanguard Total International Stock', allocation: 25, reason: 'Oportunidades globais', risk: 'medium' },
          { symbol: 'ARKK', name: 'ARK Innovation ETF', allocation: 10, reason: 'Inovação disruptiva', risk: 'high' }
        );
        break;
    }
    
    setSuggestions(suggestions);
  };

  const formatYears = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${remainingMonths} meses`;
    if (remainingMonths === 0) return `${years} anos`;
    return `${years} anos e ${remainingMonths} meses`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return 'N/A';
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calculator className="w-8 h-8 mr-3 text-blue-600" />
              Simulador Inteligente
            </h1>
            <p className="text-gray-600 mt-2">
              Descubra quanto investir e em que ETFs para atingir seus objetivos
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  <strong>💡 Importante:</strong> ETFs são negociados em dólares (USD). 
                  Use os conversores abaixo para calcular em reais ou dólares.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configurações da Simulação */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Seus Objetivos
                </h2>

                <div className="space-y-6">
                  {/* Quanto investir por mês */}
                  <CurrencyInput
                    label="💰 Quanto posso investir por mês?"
                    value={input.monthlyInvestment}
                    onChange={(value, currency) => setInput({
                      ...input, 
                      monthlyInvestment: value,
                      monthlyInvestmentCurrency: currency
                    })}
                    placeholder="1.000,00"
                  />

                  {/* Valor inicial */}
                  <CurrencyInput
                    label="🏦 Quanto já tenho investido?"
                    value={input.initialAmount}
                    onChange={(value, currency) => setInput({
                      ...input, 
                      initialAmount: value,
                      initialAmountCurrency: currency
                    })}
                    placeholder="10.000,00"
                  />

                  {/* Meta financeira */}
                  <CurrencyInput
                    label="🎯 Qual minha meta financeira?"
                    value={input.targetAmount}
                    onChange={(value, currency) => setInput({
                      ...input, 
                      targetAmount: value,
                      targetAmountCurrency: currency
                    })}
                    placeholder="1.000.000,00"
                  />

                  {/* Prazo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏰ Em quantos anos quero atingir?
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={input.timeHorizon}
                      onChange={(e) => setInput({...input, timeHorizon: Number(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1 ano</span>
                      <span className="font-medium text-blue-600">{input.timeHorizon} anos</span>
                      <span>30 anos</span>
                    </div>
                  </div>

                  {/* Perfil de risco */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      ⚖️ Qual seu perfil de risco?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'conservative', label: 'Conservador', desc: '6% ao ano', color: 'green' },
                        { value: 'moderate', label: 'Moderado', desc: '8% ao ano', color: 'blue' },
                        { value: 'aggressive', label: 'Arrojado', desc: '12% ao ano', color: 'red' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setInput({...input, riskProfile: option.value as any})}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            input.riskProfile === option.value
                              ? `border-${option.color}-500 bg-${option.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultados da Simulação */}
            <div className="space-y-6">
              {result && (
                <>
                  {/* Resultado Principal */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Resultado da Simulação
                    </h2>

                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {currencyService.formatCurrency(result.finalAmount, 'BRL')}
                        </div>
                        <div className="text-sm text-gray-600">Valor Final (BRL)</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {currencyService.formatCurrency(result.finalAmountUSD, 'USD')} em dólares
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {currencyService.formatCurrency(result.totalGains, 'BRL')}
                        </div>
                        <div className="text-sm text-gray-600">Ganhos (BRL)</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {currencyService.formatCurrency(result.totalGainsUSD, 'USD')} em dólares
                        </div>
                      </div>
                    </div>

                    {/* Status da Meta */}
                    <div className={`p-4 rounded-lg border-l-4 ${
                      result.isRealistic ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
                    }`}>
                      <div className="flex items-center mb-2">
                        {result.isRealistic ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        )}
                        <h3 className="font-medium text-gray-900">
                          {result.isRealistic ? 'Meta Atingível!' : 'Ajuste Necessário'}
                        </h3>
                      </div>
                      
                      {result.isRealistic ? (
                        <p className="text-sm text-gray-600">
                          Você atingirá sua meta em {formatYears(result.monthsToGoal)}
                        </p>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">
                            Para atingir sua meta em {input.timeHorizon} anos, você precisa investir:
                          </p>
                          <p className="font-bold text-lg text-yellow-700">
                            {currencyService.formatCurrency(result.monthlyNeeded, 'BRL')}/mês
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({currencyService.formatCurrency(result.monthlyNeededUSD, 'USD')}/mês em dólares)
                          </p>
                          <p className="mt-2">
                            Ou levará {formatYears(result.monthsToGoal)} com o aporte atual
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sugestões de ETFs */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                      Carteira Sugerida (em USD)
                    </h2>

                    <div className="space-y-4">
                      {suggestions.map((etf, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <h3 className="font-medium text-gray-900 mr-2">{etf.symbol}</h3>
                                <span className={`text-xs px-2 py-1 rounded ${getRiskColor(etf.risk)}`}>
                                  {getRiskLabel(etf.risk)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{etf.name}</p>
                              <p className="text-xs text-gray-500">{etf.reason}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{etf.allocation}%</div>
                              <div className="text-sm text-gray-600">
                                {currencyService.formatCurrency((result.finalAmountUSD * etf.allocation) / 100, 'USD')}
                              </div>
                              <div className="text-xs text-gray-500">
                                ≈ {currencyService.formatCurrency(((result.finalAmount * etf.allocation) / 100), 'BRL')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Barra de alocação */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${etf.allocation}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Dicas para Brasileiros</h4>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• ETFs são negociados em dólares americanos (USD)</li>
                        <li>• Considere o impacto do câmbio nos seus investimentos</li>
                        <li>• Rebalanceie sua carteira a cada 6 meses</li>
                        <li>• Mantenha disciplina nos aportes mensais</li>
                        <li>• Reavalie seus objetivos anualmente</li>
                      </ul>
                    </div>
                  </div>

                  {/* Ação Rápida */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center mb-4">
                      <Zap className="w-6 h-6 mr-2" />
                      <h3 className="text-lg font-semibold">Pronto para começar?</h3>
                    </div>
                    <p className="mb-4 opacity-90">
                      Encontre os melhores ETFs para sua carteira e comece a investir hoje mesmo.
                    </p>
                    <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center">
                      Ver ETFs Recomendados
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
} 