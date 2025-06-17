"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RequireAuth from '@/components/auth/RequireAuth';
import AllocationSlider from '@/components/simulador/AllocationSlider';
import PortfolioMetrics from '@/components/simulador/PortfolioMetrics';
import ScenarioAnalysis from '@/components/simulador/ScenarioAnalysis';
import ETFSelector from '@/components/simulador/ETFSelector';
import { useAuth } from '@/hooks/useAuth';
import { 
  PieChart, 
  Target,
  Calculator,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ETFAllocation {
  symbol: string;
  name: string;
  weight: number;
  assetclass?: string;
  returns_12m?: number;
  volatility_12m?: number;
  sharpe_12m?: number;
  expense_ratio?: number;
}

interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  expenseRatio: number;
  totalAllocation: number;
}

interface UserProfile {
  name: string;
  profile: string;
  riskTolerance: number;
  monthlyInvestment: number;
  totalPatrimony: number;
}

export default function SimuladorPage() {
  const { profile: authProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allocations, setAllocations] = useState<ETFAllocation[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    expectedReturn: 0,
    volatility: 0,
    sharpeRatio: 0,
    expenseRatio: 0,
    totalAllocation: 0
  });
  const [selectedScenario, setSelectedScenario] = useState<'conservador' | 'moderado' | 'otimista' | 'pessimista'>('moderado');
  const [investmentAmount, setInvestmentAmount] = useState(10000);

  // Carregar perfil do usuário
  useEffect(() => {
    if (authProfile) {
      setUserProfile({
        name: authProfile.name || authProfile.full_name || 'Usuário',
        profile: authProfile.profile || 'Moderado',
        riskTolerance: authProfile.risk_tolerance || 5,
        monthlyInvestment: authProfile.monthly_investment || 1000,
        totalPatrimony: authProfile.total_patrimony || 10000
      });
      setInvestmentAmount(authProfile.total_patrimony || 10000);
    } else {
      const savedProfile = localStorage.getItem('etf-curator-profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setInvestmentAmount(profile.totalPatrimony || 10000);
      }
    }
  }, [authProfile]);

  // Recalcular métricas quando alocações mudam
  useEffect(() => {
    calculatePortfolioMetrics();
  }, [allocations]);

  // Adicionar ETF à carteira
  const addETF = (etf: any) => {
    const newAllocation: ETFAllocation = {
      symbol: etf.symbol,
      name: etf.name || etf.symbol,
      weight: 0,
      assetclass: etf.assetclass,
      returns_12m: etf.returns_12m,
      volatility_12m: etf.volatility_12m,
      sharpe_12m: etf.sharpe_12m,
      expense_ratio: etf.expense_ratio
    };

    setAllocations([...allocations, newAllocation]);
  };

  // Remover ETF da carteira
  const removeETF = (symbol: string) => {
    setAllocations(allocations.filter(alloc => alloc.symbol !== symbol));
  };

  // Atualizar peso de um ETF
  const updateWeight = (symbol: string, weight: number) => {
    setAllocations(allocations.map(alloc => 
      alloc.symbol === symbol ? { ...alloc, weight } : alloc
    ));
  };

  // Calcular métricas da carteira
  const calculatePortfolioMetrics = () => {
    if (allocations.length === 0) {
      setPortfolioMetrics({
        expectedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        expenseRatio: 0,
        totalAllocation: 0
      });
      return;
    }

    const totalWeight = allocations.reduce((sum, alloc) => sum + alloc.weight, 0);
    
    // Retorno esperado da carteira
    const expectedReturn = allocations.reduce((sum, alloc) => {
      const weight = alloc.weight / 100;
      const returns = alloc.returns_12m || 0;
      return sum + (weight * returns);
    }, 0);

    // Volatilidade da carteira (simplificada)
    const volatility = Math.sqrt(
      allocations.reduce((sum, alloc) => {
        const weight = alloc.weight / 100;
        const vol = alloc.volatility_12m || 0;
        return sum + (weight * weight * vol * vol);
      }, 0)
    );

    // Sharpe ratio da carteira
    const sharpeRatio = volatility > 0 ? expectedReturn / volatility : 0;

    // Taxa de administração média ponderada
    const expenseRatio = allocations.reduce((sum, alloc) => {
      const weight = alloc.weight / 100;
      const expense = alloc.expense_ratio || 0;
      return sum + (weight * expense);
    }, 0);

    setPortfolioMetrics({
      expectedReturn,
      volatility,
      sharpeRatio,
      expenseRatio,
      totalAllocation: totalWeight
    });
  };

  // Aplicar alocação sugerida baseada no perfil
  const applySuggestedAllocation = () => {
    if (!userProfile || allocations.length === 0) return;

    let suggestions: { [key: string]: number } = {};

    switch (userProfile.profile) {
      case 'Conservador':
        // 60% Renda Fixa, 30% Ações, 10% Internacional
        suggestions = distributeByAssetClass({
          'Fixed Income': 60,
          'Equity': 30,
          'International': 10
        });
        break;
      case 'Moderado':
        // 40% Renda Fixa, 45% Ações, 15% Internacional
        suggestions = distributeByAssetClass({
          'Fixed Income': 40,
          'Equity': 45,
          'International': 15
        });
        break;
      case 'Arrojado':
        // 20% Renda Fixa, 60% Ações, 20% Internacional
        suggestions = distributeByAssetClass({
          'Fixed Income': 20,
          'Equity': 60,
          'International': 20
        });
        break;
      default:
        // Distribuição igual
        const equalWeight = 100 / allocations.length;
        allocations.forEach(alloc => {
          suggestions[alloc.symbol] = equalWeight;
        });
    }

    // Aplicar sugestões
    setAllocations(allocations.map(alloc => ({
      ...alloc,
      weight: suggestions[alloc.symbol] || 0
    })));
  };

  // Distribuir pesos por asset class
  const distributeByAssetClass = (targetAllocation: { [key: string]: number }) => {
    const result: { [key: string]: number } = {};
    
    // Agrupar ETFs por asset class
    const etfsByClass: { [key: string]: ETFAllocation[] } = {};
    allocations.forEach(alloc => {
      const assetClass = alloc.assetclass || 'Other';
      if (!etfsByClass[assetClass]) {
        etfsByClass[assetClass] = [];
      }
      etfsByClass[assetClass].push(alloc);
    });

    // Distribuir pesos
    Object.entries(targetAllocation).forEach(([assetClass, targetWeight]) => {
      const etfsInClass = etfsByClass[assetClass] || [];
      if (etfsInClass.length > 0) {
        const weightPerETF = targetWeight / etfsInClass.length;
        etfsInClass.forEach(etf => {
          result[etf.symbol] = weightPerETF;
        });
      }
    });

    return result;
  };

  // Rebalancear carteira (distribuição igual)
  const rebalancePortfolio = () => {
    if (allocations.length === 0) return;
    
    const equalWeight = 100 / allocations.length;
    setAllocations(allocations.map(alloc => ({
      ...alloc,
      weight: equalWeight
    })));
  };

  // Formatação de valores
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simulador de Carteiras
          </h1>
          <p className="text-gray-600">
            Crie e simule carteiras de ETFs com dados reais e backtesting
          </p>
          {userProfile && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Perfil:</strong> {userProfile.profile} | 
                <strong> Tolerância ao Risco:</strong> {userProfile.riskTolerance}/10 |
                <strong> Valor para Investir:</strong> {formatCurrency(investmentAmount)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Construção da Carteira */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seleção de ETFs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Construir Carteira</h2>
                </div>
                <div className="text-sm text-gray-500">
                  {allocations.length}/10 ETFs
                </div>
              </div>
              
              <ETFSelector
                onSelectETF={addETF}
                selectedSymbols={allocations.map(a => a.symbol)}
                maxSelections={10}
              />
            </div>

            {/* Alocação de Pesos */}
            {allocations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Alocação de Pesos</h2>
                  </div>
                  <div className="flex space-x-2">
                    {userProfile && (
                      <button
                        onClick={applySuggestedAllocation}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                      >
                        Sugestão {userProfile.profile}
                      </button>
                    )}
                    <button
                      onClick={rebalancePortfolio}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                    >
                      Rebalancear
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {allocations.map((allocation) => (
                    <AllocationSlider
                      key={allocation.symbol}
                      allocation={allocation}
                      onWeightChange={updateWeight}
                      onRemove={removeETF}
                    />
                  ))}
                </div>

                {/* Status da Alocação */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Alocado:</span>
                    <div className="flex items-center">
                      <span className={`font-medium ${
                        Math.abs(portfolioMetrics.totalAllocation - 100) < 0.01 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatPercentage(portfolioMetrics.totalAllocation)}
                      </span>
                      {Math.abs(portfolioMetrics.totalAllocation - 100) < 0.01 ? (
                        <CheckCircle className="w-4 h-4 ml-1 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 ml-1 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Análise de Cenários */}
            {allocations.length > 0 && portfolioMetrics.totalAllocation > 90 && (
              <ScenarioAnalysis
                allocations={allocations}
                investmentAmount={investmentAmount}
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
              />
            )}
          </div>

          {/* Sidebar - Métricas e Controles */}
          <div className="space-y-6">
            {/* Valor do Investimento */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Valor do Investimento</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor a Investir (R$)
                  </label>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1000"
                    step="1000"
                  />
                </div>
                
                {userProfile && (
                  <div className="text-xs text-gray-500">
                    <p>Patrimônio atual: {formatCurrency(userProfile.totalPatrimony)}</p>
                    <p>Aporte mensal: {formatCurrency(userProfile.monthlyInvestment)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Métricas da Carteira */}
            {allocations.length > 0 && (
              <PortfolioMetrics
                metrics={portfolioMetrics}
                investmentAmount={investmentAmount}
              />
            )}

            {/* Dicas e Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Dicas</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Diversifique entre diferentes asset classes</p>
                <p>• Mantenha a alocação total em 100%</p>
                <p>• Considere seu perfil de risco</p>
                <p>• Revise periodicamente sua carteira</p>
                <p>• ETFs com Sharpe &gt; 1.0 são preferíveis</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </RequireAuth>
  );
} 