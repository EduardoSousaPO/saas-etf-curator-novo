"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Target, DollarSign, TrendingUp, Shield, BarChart3, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Tipos para o onboarding
interface UserProfile {
  name: string;
  age: number;
  experience: 'iniciante' | 'intermediario' | 'avancado';
  riskTolerance: number; // 1-10
  investmentGoal: 'preservacao' | 'crescimento' | 'renda' | 'especulativo';
  timeHorizon: 'curto' | 'medio' | 'longo'; // < 2 anos, 2-5 anos, > 5 anos
  monthlyInvestment: number;
  currentPortfolio: number;
}

interface InvestorProfile {
  type: 'conservador' | 'moderado' | 'arrojado' | 'iniciante';
  name: string;
  description: string;
  volatilityRange: string;
  expectedReturn: string;
  etfCount: number;
  icon: React.ReactNode;
  color: string;
  sampleETFs: string[];
}

const investorProfiles: InvestorProfile[] = [
  {
    type: 'conservador',
    name: 'Conservador',
    description: 'Prioriza preservação de capital com baixo risco',
    volatilityRange: '< 15%',
    expectedReturn: '7.40%',
    etfCount: 1674,
    icon: <Shield className="w-8 h-8" />,
    color: 'blue',
    sampleETFs: ['SGOV', 'SHV', 'BND', 'SCHD']
  },
  {
    type: 'moderado',
    name: 'Moderado',
    description: 'Equilibra crescimento e segurança',
    volatilityRange: '15-25%',
    expectedReturn: '8.77%',
    etfCount: 1121,
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'green',
    sampleETFs: ['VTI', 'VOO', 'SPY', 'IVV']
  },
  {
    type: 'arrojado',
    name: 'Arrojado',
    description: 'Busca crescimento com maior tolerância ao risco',
    volatilityRange: '25-35%',
    expectedReturn: '5.03%',
    etfCount: 337,
    icon: <BarChart3 className="w-8 h-8" />,
    color: 'orange',
    sampleETFs: ['QQQ', 'VGT', 'ARKK', 'ARKG']
  },
  {
    type: 'iniciante',
    name: 'Iniciante',
    description: 'Começando a investir, foco em aprendizado',
    volatilityRange: '10-20%',
    expectedReturn: '8.00%',
    etfCount: 500,
    icon: <User className="w-8 h-8" />,
    color: 'purple',
    sampleETFs: ['VTI', 'BND', 'VEA', 'VWO']
  }
];

export default function OnboardingPage() {
  const { user, profile: authProfile, updateProfile: updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [recommendedProfile, setRecommendedProfile] = useState<InvestorProfile | null>(null);
  const [saving, setSaving] = useState(false);

  // Carregar dados do usuário autenticado ou localStorage
  useEffect(() => {
    if (authProfile) {
      // Carregar dados do usuário autenticado
      setUserProfile({
        name: authProfile.name || '',
        age: authProfile.age || 0,
        experience: authProfile.experience as any || 'iniciante',
        riskTolerance: authProfile.risk_tolerance || 5,
        investmentGoal: authProfile.objective as any || 'crescimento',
        timeHorizon: authProfile.time_horizon as any || 'medio',
        monthlyInvestment: authProfile.monthly_investment || 1000,
        currentPortfolio: authProfile.total_patrimony || 10000
      });
    } else {
      // Fallback para localStorage se não estiver autenticado
      const savedProfile = localStorage.getItem('etf-curator-profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    }
  }, [authProfile]);

  // Salvar dados (priorizar banco se autenticado, senão localStorage)
  const saveProfile = async (profileData: Partial<UserProfile>) => {
    if (user && updateUserProfile) {
      try {
        setSaving(true);
        await updateUserProfile({
          full_name: profileData.name || '',
          age: profileData.age || 0,
          investment_experience: profileData.experience || 'iniciante',
          risk_tolerance: profileData.riskTolerance || 5,
          objective: profileData.investmentGoal || 'crescimento',
          time_horizon: profileData.timeHorizon || 'medio',
          monthly_investment: profileData.monthlyInvestment || 1000,
          total_patrimony: profileData.currentPortfolio || 10000,
          profile: recommendedProfile?.name || 'Moderado'
        });
      } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        // Fallback para localStorage em caso de erro
        localStorage.setItem('etf-curator-profile', JSON.stringify({
          ...profileData,
          profile: recommendedProfile?.name || 'Moderado'
        }));
      } finally {
        setSaving(false);
      }
    } else {
      // Salvar no localStorage se não estiver autenticado
      localStorage.setItem('etf-curator-profile', JSON.stringify({
        ...profileData,
        profile: recommendedProfile?.name || 'Moderado'
      }));
    }
  };

  // Atualizar perfil localmente
  useEffect(() => {
    if (Object.keys(userProfile).length > 0) {
      // Salvar apenas no localStorage para mudanças em tempo real
      // O banco será atualizado apenas no final do onboarding
      if (!user) {
        localStorage.setItem('etf-curator-profile', JSON.stringify(userProfile));
      }
    }
  }, [userProfile, user]);

  // Algoritmo de scoring para determinar perfil
  const calculateProfile = (): InvestorProfile => {
    let score = 0;
    
    // Experiência (0-3 pontos)
    if (userProfile.experience === 'iniciante') score += 0;
    else if (userProfile.experience === 'intermediario') score += 1.5;
    else score += 3;

    // Tolerância ao risco (0-4 pontos)
    score += (userProfile.riskTolerance || 5) * 0.4;

    // Objetivo de investimento (0-3 pontos)
    if (userProfile.investmentGoal === 'preservacao') score += 0;
    else if (userProfile.investmentGoal === 'renda') score += 1;
    else if (userProfile.investmentGoal === 'crescimento') score += 2;
    else score += 3;

    // Horizonte temporal (0-2 pontos)
    if (userProfile.timeHorizon === 'curto') score += 0;
    else if (userProfile.timeHorizon === 'medio') score += 1;
    else score += 2;

    // Determinar perfil baseado no score (0-12)
    if (userProfile.experience === 'iniciante') return investorProfiles[3]; // Iniciante
    else if (score <= 4) return investorProfiles[0]; // Conservador
    else if (score <= 8) return investorProfiles[1]; // Moderado
    else return investorProfiles[2]; // Arrojado
  };

  const nextStep = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calcular perfil recomendado
      const profile = calculateProfile();
      setRecommendedProfile(profile);
      
      // Salvar perfil completo no banco/localStorage
      const completeProfile = {
        ...userProfile,
        profile: profile.name
      };
      
      await saveProfile(completeProfile);
      setCurrentStep(7); // Página de resultado
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <User className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vamos nos conhecer!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Primeiro, conte-nos um pouco sobre você
            </p>
            
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual seu nome?
                </label>
                <input
                  type="text"
                  value={userProfile.name || ''}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual sua idade?
                </label>
                <input
                  type="number"
                  value={userProfile.age || ''}
                  onChange={(e) => updateProfile({ age: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sua idade"
                  min="18"
                  max="100"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Experiência com Investimentos</h2>
            <p className="text-lg text-gray-600 mb-8">
              Qual seu nível de experiência com ETFs e investimentos?
            </p>
            
            <div className="max-w-2xl mx-auto grid gap-4">
              {[
                { value: 'iniciante', label: 'Iniciante', desc: 'Nunca investi ou tenho pouca experiência' },
                { value: 'intermediario', label: 'Intermediário', desc: 'Já invisto há alguns anos e entendo o básico' },
                { value: 'avancado', label: 'Avançado', desc: 'Tenho experiência sólida e conhecimento técnico' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateProfile({ experience: option.value as any })}
                  className={`p-6 border-2 rounded-xl text-left transition-all ${
                    userProfile.experience === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <Target className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Objetivo de Investimento</h2>
            <p className="text-lg text-gray-600 mb-8">
              Qual seu principal objetivo ao investir em ETFs?
            </p>
            
            <div className="max-w-2xl mx-auto grid gap-4">
              {[
                { value: 'preservacao', label: 'Preservação de Capital', desc: 'Proteger meu dinheiro da inflação com baixo risco' },
                { value: 'renda', label: 'Geração de Renda', desc: 'Receber dividendos regulares dos meus investimentos' },
                { value: 'crescimento', label: 'Crescimento de Capital', desc: 'Fazer meu dinheiro crescer no longo prazo' },
                { value: 'especulativo', label: 'Ganhos Especulativos', desc: 'Buscar altos retornos com maior risco' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateProfile({ investmentGoal: option.value as any })}
                  className={`p-6 border-2 rounded-xl text-left transition-all ${
                    userProfile.investmentGoal === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tolerância ao Risco</h2>
            <p className="text-lg text-gray-600 mb-8">
              Em uma escala de 1 a 10, qual sua tolerância a perdas temporárias?
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={userProfile.riskTolerance || 5}
                  onChange={(e) => updateProfile({ riskTolerance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1 - Muito Baixa</span>
                  <span>10 - Muito Alta</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {userProfile.riskTolerance || 5}
                </div>
                <div className="text-sm text-gray-600">
                  {userProfile.riskTolerance && userProfile.riskTolerance <= 3 && "Prefiro segurança, mesmo com retornos menores"}
                  {userProfile.riskTolerance && userProfile.riskTolerance >= 4 && userProfile.riskTolerance <= 6 && "Aceito algum risco por retornos moderados"}
                  {userProfile.riskTolerance && userProfile.riskTolerance >= 7 && userProfile.riskTolerance <= 8 && "Aceito risco significativo por maiores retornos"}
                  {userProfile.riskTolerance && userProfile.riskTolerance >= 9 && "Aceito alto risco por potenciais altos retornos"}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-orange-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Horizonte de Investimento</h2>
            <p className="text-lg text-gray-600 mb-8">
              Por quanto tempo pretende manter seus investimentos?
            </p>
            
            <div className="max-w-2xl mx-auto grid gap-4">
              {[
                { value: 'curto', label: 'Curto Prazo', desc: 'Menos de 2 anos - Preciso do dinheiro em breve' },
                { value: 'medio', label: 'Médio Prazo', desc: '2 a 5 anos - Tenho objetivos específicos' },
                { value: 'longo', label: 'Longo Prazo', desc: 'Mais de 5 anos - Investindo para o futuro' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateProfile({ timeHorizon: option.value as any })}
                  className={`p-6 border-2 rounded-xl text-left transition-all ${
                    userProfile.timeHorizon === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Capacidade de Investimento</h2>
            <p className="text-lg text-gray-600 mb-8">
              Quanto você pretende investir mensalmente?
            </p>
            
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investimento mensal (USD)
                </label>
                <input
                  type="number"
                  value={userProfile.monthlyInvestment || ''}
                  onChange={(e) => updateProfile({ monthlyInvestment: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patrimônio atual para investir (USD)
                </label>
                <input
                  type="number"
                  value={userProfile.currentPortfolio || ''}
                  onChange={(e) => updateProfile({ currentPortfolio: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 10000"
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seu Perfil de Investidor</h2>
            <p className="text-lg text-gray-600 mb-8">
              Baseado em suas respostas, identificamos seu perfil ideal
            </p>
            
            {recommendedProfile && (
              <div className="max-w-2xl mx-auto">
                <div className={`p-8 border-2 border-${recommendedProfile.color}-500 bg-${recommendedProfile.color}-50 rounded-2xl mb-8`}>
                  <div className={`w-20 h-20 bg-${recommendedProfile.color}-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white`}>
                    {recommendedProfile.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Perfil {recommendedProfile.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {recommendedProfile.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">Volatilidade Típica</div>
                      <div className="text-lg font-semibold">{recommendedProfile.volatilityRange}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Retorno Médio</div>
                      <div className="text-lg font-semibold text-green-600">{recommendedProfile.expectedReturn}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">ETFs Disponíveis</div>
                      <div className="text-lg font-semibold">{recommendedProfile.etfCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">ETFs Sugeridos</div>
                      <div className="text-sm font-medium">{recommendedProfile.sampleETFs.join(', ')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        Ir para Dashboard
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => window.location.href = '/screener'}
                    className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Explorar ETFs
                  </button>
                </div>
                
                {user && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Perfil sincronizado com sua conta!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Seus dados estão seguros e acessíveis em qualquer dispositivo.
                    </p>
                  </div>
                )}
                
                {!user && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <User className="w-5 h-5" />
                      <span className="font-medium">Crie uma conta para sincronizar seus dados</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1 mb-3">
                      Mantenha seu perfil seguro e acesse de qualquer lugar.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = '/auth/register'}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Criar Conta
                      </button>
                      <button
                        onClick={() => window.location.href = '/auth/login'}
                        className="border border-blue-600 text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                      >
                        Fazer Login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress Bar */}
        {currentStep <= 6 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                Etapa {currentStep} de 6
              </span>
              <span className="text-sm font-medium text-gray-500">
                {Math.round((currentStep / 6) * 100)}% completo
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep <= 6 && (
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>

            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!userProfile.name || !userProfile.age)) ||
                (currentStep === 2 && !userProfile.experience) ||
                (currentStep === 3 && !userProfile.investmentGoal) ||
                (currentStep === 4 && !userProfile.riskTolerance) ||
                (currentStep === 5 && !userProfile.timeHorizon) ||
                (currentStep === 6 && (!userProfile.monthlyInvestment || !userProfile.currentPortfolio))
              }
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                (currentStep === 1 && (!userProfile.name || !userProfile.age)) ||
                (currentStep === 2 && !userProfile.experience) ||
                (currentStep === 3 && !userProfile.investmentGoal) ||
                (currentStep === 4 && !userProfile.riskTolerance) ||
                (currentStep === 5 && !userProfile.timeHorizon) ||
                (currentStep === 6 && (!userProfile.monthlyInvestment || !userProfile.currentPortfolio))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === 6 ? 'Finalizar' : 'Próximo'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 