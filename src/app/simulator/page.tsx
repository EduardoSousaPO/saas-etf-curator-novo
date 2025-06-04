"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  PieChart, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  AlertTriangle,
  Plus,
  Play,
  Download,
  Zap
} from 'lucide-react';
import { 
  PortfolioAllocation, 
  PortfolioSimulation, 
  PortfolioSimulator,
  SIMULATION_SCENARIOS 
} from '@/lib/portfolio/simulator';
import { ETF } from '@/types';
import { InvestorProfile } from '@/lib/onboarding/profiles';
import AssistantChat from '@/components/assistant/AssistantChat';

export default function SimulatorPage() {
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(10000);
  const [simulation, setSimulation] = useState<PortfolioSimulation | null>(null);
  const [availableETFs, setAvailableETFs] = useState<ETF[]>([]);
  const [userProfile, setUserProfile] = useState<InvestorProfile | null>(null);
  const [selectedScenario, setSelectedScenario] = useState(SIMULATION_SCENARIOS[0]);
  const [scenarioResults, setScenarioResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'build' | 'analyze' | 'scenarios'>('build');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Carregar ETFs disponíveis
      const etfsResponse = await fetch('/api/etfs');
      if (etfsResponse.ok) {
        const etfs = await etfsResponse.json();
        setAvailableETFs(etfs.slice(0, 50)); // Limitar para demonstração
      }

      // Carregar perfil do usuário
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setUserProfile(profileData.profile);
      }

      // Inicializar com uma alocação exemplo
      setAllocations([
        {
          etfSymbol: 'VTI',
          etfName: 'Vanguard Total Stock Market ETF',
          percentage: 60,
          amount: 6000
        },
        {
          etfSymbol: 'VXUS',
          etfName: 'Vanguard Total International Stock ETF',
          percentage: 30,
          amount: 3000
        },
        {
          etfSymbol: 'BND',
          etfName: 'Vanguard Total Bond Market ETF',
          percentage: 10,
          amount: 1000
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const addAllocation = () => {
    const newAllocation: PortfolioAllocation = {
      etfSymbol: '',
      etfName: '',
      percentage: 0,
      amount: 0
    };
    setAllocations([...allocations, newAllocation]);
  };

  const updateAllocation = (index: number, field: keyof PortfolioAllocation, value: any) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calcular amount baseado na percentage
    if (field === 'percentage') {
      updated[index].amount = (value / 100) * totalAmount;
    }
    // Auto-calcular percentage baseado no amount
    else if (field === 'amount') {
      updated[index].percentage = (value / totalAmount) * 100;
    }

    setAllocations(updated);
  };

  const removeAllocation = (index: number) => {
    const updated = allocations.filter((_, i) => i !== index);
    setAllocations(updated);
  };

  const runSimulation = () => {
    if (allocations.length === 0) {
      alert('Adicione pelo menos um ETF à carteira');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const newSimulation = PortfolioSimulator.createSimulation(
        'Minha Carteira',
        allocations,
        availableETFs,
        'Simulação criada pelo usuário'
      );
      
      setSimulation(newSimulation);
      setStep('analyze');
      setLoading(false);
    }, 1000);
  };

  const runScenarioAnalysis = () => {
    if (!simulation) return;

    setLoading(true);
    
    setTimeout(() => {
      const results = PortfolioSimulator.simulateScenarios(simulation, availableETFs);
      setScenarioResults(results);
      setStep('scenarios');
      setLoading(false);
    }, 1500);
  };

  const optimizeForProfile = () => {
    if (!userProfile || !simulation) return;

    const optimized = PortfolioSimulator.optimizeForProfile(
      allocations,
      userProfile,
      availableETFs
    );
    
    setAllocations(optimized);
    
    // Recalcular amounts
    optimized.forEach((alloc, index) => {
      updateAllocation(index, 'percentage', alloc.percentage);
    });
  };

  const getTotalPercentage = () => {
    return allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'conservative': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'aggressive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'conservative': return <Shield className="w-5 h-5" />;
      case 'moderate': return <BarChart3 className="w-5 h-5" />;
      case 'aggressive': return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calculator className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Simulador de Carteira
                </h1>
                <p className="text-gray-600">
                  Crie e analise diferentes composições de carteira de ETFs
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {userProfile && (
                <button
                  onClick={optimizeForProfile}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  <span>Otimizar para meu perfil</span>
                </button>
              )}
              
              <button
                onClick={runSimulation}
                disabled={loading || allocations.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{loading ? 'Simulando...' : 'Simular Carteira'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'build' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <Calculator className="w-4 h-4" />
              <span>Construir</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'analyze' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <PieChart className="w-4 h-4" />
              <span>Analisar</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'scenarios' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
              <span>Cenários</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Builder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Construir Carteira
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-medium">R$ {totalAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {allocations.map((allocation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-12 gap-4 items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Símbolo (ex: VTI)"
                        value={allocation.etfSymbol}
                        onChange={(e) => updateAllocation(index, 'etfSymbol', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Nome do ETF"
                        value={allocation.etfName}
                        onChange={(e) => updateAllocation(index, 'etfName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          value={allocation.percentage || ''}
                          onChange={(e) => updateAllocation(index, 'percentage', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-6"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        onClick={() => removeAllocation(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={addAllocation}
                  className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Adicionar ETF</span>
                </button>

                {/* Validation */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Total da carteira: {getTotalPercentage().toFixed(1)}%
                  </span>
                  {getTotalPercentage() !== 100 && (
                    <span className="text-sm text-orange-600">
                      ⚠️ Total deve ser 100%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo da Carteira
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ETFs na carteira:</span>
                  <span className="font-medium">{allocations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-medium">R$ {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alocação:</span>
                  <span className="font-medium">{getTotalPercentage().toFixed(1)}%</span>
                </div>
              </div>
              
              {simulation && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Métricas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retorno esperado:</span>
                      <span className="text-green-600 font-medium">
                        {simulation.metrics.expectedReturn.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volatilidade:</span>
                      <span className="text-orange-600 font-medium">
                        {simulation.metrics.volatility.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sharpe Ratio:</span>
                      <span className="text-blue-600 font-medium">
                        {simulation.metrics.sharpeRatio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Assessment */}
            {simulation && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Avaliação de Risco
                </h3>
                
                <div className={`flex items-center space-x-3 mb-4 ${getRiskColor(simulation.risk.riskLevel)}`}>
                  {getRiskIcon(simulation.risk.riskLevel)}
                  <span className="font-medium capitalize">
                    {simulation.risk.riskLevel === 'conservative' ? 'Conservador' :
                     simulation.risk.riskLevel === 'moderate' ? 'Moderado' : 'Arrojado'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {simulation.risk.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-orange-600">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                  
                  {simulation.risk.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-blue-600">
                      <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {simulation && step === 'analyze' && (
              <button
                onClick={runScenarioAnalysis}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{loading ? 'Analisando...' : 'Analisar Cenários'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scenario Results */}
        {step === 'scenarios' && scenarioResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Análise de Cenários
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(scenarioResults).map(([scenarioName, result]: [string, any]) => (
                  <div key={scenarioName} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{scenarioName}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retorno acumulado:</span>
                        <span className={`font-medium ${
                          result.cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.cumulativeReturn.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volatilidade:</span>
                        <span className="text-orange-600 font-medium">
                          {result.volatility.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Drawdown:</span>
                        <span className="text-red-600 font-medium">
                          -{result.maxDrawdown.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sharpe Ratio:</span>
                        <span className="text-blue-600 font-medium">
                          {result.sharpeRatio.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Assistente Virtual */}
      <AssistantChat />
    </div>
  );
} 