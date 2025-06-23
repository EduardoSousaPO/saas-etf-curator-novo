'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { formatCurrency } from '@/lib/formatters';
import { calculateAnnualFee, calculateMonthlyFee } from '@/types/subscriptions';

interface FormData {
  currentPortfolioValue: string;
  investmentGoals: {
    timeHorizon: string;
    riskTolerance: string;
    primaryObjective: string;
    secondaryObjectives: string[];
  };
  investmentExperience: string;
  monthlyInvestment: string;
  additionalInfo: string;
}

const steps = [
  { id: 1, title: 'Informações Básicas', description: 'Patrimônio e experiência' },
  { id: 2, title: 'Objetivos de Investimento', description: 'Metas e estratégias' },
  { id: 3, title: 'Confirmação', description: 'Revisão e envio' }
];

export default function WealthOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { wealthOnboarding, createWealthOnboarding } = useSubscription();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    currentPortfolioValue: '',
    investmentGoals: {
      timeHorizon: '',
      riskTolerance: '',
      primaryObjective: '',
      secondaryObjectives: []
    },
    investmentExperience: '',
    monthlyInvestment: '',
    additionalInfo: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/onboarding/wealth');
      return;
    }

    // Se já tem onboarding, redirecionar para status
    if (wealthOnboarding) {
      router.push('/onboarding/wealth/status');
      return;
    }
  }, [user, wealthOnboarding, router]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSecondaryObjectiveToggle = (objective: string) => {
    setFormData(prev => ({
      ...prev,
      investmentGoals: {
        ...prev.investmentGoals,
        secondaryObjectives: prev.investmentGoals.secondaryObjectives.includes(objective)
          ? prev.investmentGoals.secondaryObjectives.filter(o => o !== objective)
          : [...prev.investmentGoals.secondaryObjectives, objective]
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.currentPortfolioValue && 
          parseFloat(formData.currentPortfolioValue.replace(/\D/g, '')) >= 200000 &&
          formData.investmentExperience
        );
      case 2:
        return !!(
          formData.investmentGoals.timeHorizon &&
          formData.investmentGoals.riskTolerance &&
          formData.investmentGoals.primaryObjective
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const portfolioValue = parseFloat(formData.currentPortfolioValue.replace(/\D/g, ''));
      
      // Criar onboarding
      const success = await createWealthOnboarding();
      
      if (success) {
        // Criar assinatura Wealth
        const { createSubscription } = useSubscription();
        await createSubscription('WEALTH', portfolioValue);
        
        router.push('/onboarding/wealth/success');
      } else {
        throw new Error('Erro ao criar onboarding');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const portfolioValue = formData.currentPortfolioValue 
    ? parseFloat(formData.currentPortfolioValue.replace(/\D/g, ''))
    : 0;
  const annualFee = calculateAnnualFee('WEALTH', portfolioValue);
  const monthlyFee = calculateMonthlyFee('WEALTH', portfolioValue);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="portfolio-value">Patrimônio Atual para Investimento *</Label>
        <Input
          id="portfolio-value"
          type="text"
          placeholder="R$ 500.000"
          value={formData.currentPortfolioValue}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            const formatted = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0
            }).format(parseInt(value) || 0);
            handleInputChange('currentPortfolioValue', formatted);
          }}
          className="mt-2"
        />
        {portfolioValue > 0 && portfolioValue < 200000 && (
          <p className="text-sm text-red-600 mt-1">
            Patrimônio mínimo para o plano Wealth: R$ 200.000
          </p>
        )}
        {portfolioValue >= 200000 && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Taxa anual:</strong> {formatCurrency(annualFee)} (1% a.a.)
            </p>
            <p className="text-sm text-green-700">
              <strong>Taxa mensal:</strong> {formatCurrency(monthlyFee)}
            </p>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="experience">Experiência com Investimentos *</Label>
        <Select value={formData.investmentExperience} onValueChange={(value) => handleInputChange('investmentExperience', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione sua experiência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iniciante">Iniciante (menos de 2 anos)</SelectItem>
            <SelectItem value="intermediario">Intermediário (2-5 anos)</SelectItem>
            <SelectItem value="avancado">Avançado (5-10 anos)</SelectItem>
            <SelectItem value="especialista">Especialista (mais de 10 anos)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="monthly-investment">Aporte Mensal Planejado</Label>
        <Input
          id="monthly-investment"
          type="text"
          placeholder="R$ 10.000"
          value={formData.monthlyInvestment}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            const formatted = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0
            }).format(parseInt(value) || 0);
            handleInputChange('monthlyInvestment', formatted);
          }}
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Horizonte de Investimento *</Label>
        <Select value={formData.investmentGoals.timeHorizon} onValueChange={(value) => handleInputChange('investmentGoals.timeHorizon', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione o prazo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="curto">Curto prazo (até 2 anos)</SelectItem>
            <SelectItem value="medio">Médio prazo (2-5 anos)</SelectItem>
            <SelectItem value="longo">Longo prazo (5-10 anos)</SelectItem>
            <SelectItem value="muito-longo">Muito longo prazo (mais de 10 anos)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tolerância ao Risco *</Label>
        <Select value={formData.investmentGoals.riskTolerance} onValueChange={(value) => handleInputChange('investmentGoals.riskTolerance', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione o perfil de risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservador">Conservador</SelectItem>
            <SelectItem value="moderado">Moderado</SelectItem>
            <SelectItem value="arrojado">Arrojado</SelectItem>
            <SelectItem value="agressivo">Agressivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Objetivo Principal *</Label>
        <Select value={formData.investmentGoals.primaryObjective} onValueChange={(value) => handleInputChange('investmentGoals.primaryObjective', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione o objetivo principal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preservacao">Preservação de Capital</SelectItem>
            <SelectItem value="crescimento">Crescimento de Patrimônio</SelectItem>
            <SelectItem value="renda">Geração de Renda</SelectItem>
            <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
            <SelectItem value="educacao">Educação dos Filhos</SelectItem>
            <SelectItem value="imovel">Compra de Imóvel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Objetivos Secundários</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            'Diversificação Internacional',
            'Proteção Inflacionária',
            'Liquidez Imediata',
            'Otimização Tributária',
            'ESG/Sustentabilidade',
            'Tecnologia/Inovação'
          ].map((objective) => (
            <button
              key={objective}
              type="button"
              onClick={() => handleSecondaryObjectiveToggle(objective)}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                formData.investmentGoals.secondaryObjectives.includes(objective)
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {objective}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="additional-info">Informações Adicionais</Label>
        <Textarea
          id="additional-info"
          placeholder="Conte-nos mais sobre seus objetivos, restrições ou preferências específicas..."
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          className="mt-2"
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Resumo da Solicitação</h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Patrimônio:</span> {formData.currentPortfolioValue}
          </div>
          <div>
            <span className="font-medium">Taxa anual:</span> {formatCurrency(annualFee)} (1% a.a.)
          </div>
          <div>
            <span className="font-medium">Taxa mensal:</span> {formatCurrency(monthlyFee)}
          </div>
          <div>
            <span className="font-medium">Experiência:</span> {formData.investmentExperience}
          </div>
          <div>
            <span className="font-medium">Horizonte:</span> {formData.investmentGoals.timeHorizon}
          </div>
          <div>
            <span className="font-medium">Perfil de risco:</span> {formData.investmentGoals.riskTolerance}
          </div>
          <div>
            <span className="font-medium">Objetivo principal:</span> {formData.investmentGoals.primaryObjective}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-3">Próximos Passos</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Análise gratuita do seu perfil</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Retorno em até 48 horas</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Agendamento de reunião de apresentação</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Crown className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Plano Wealth</h1>
            <p className="text-gray-600 mt-2">
              Consultoria especializada com consultor CVM dedicado
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  {step.id < steps.length && (
                    <div className="w-8 h-px bg-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && 'Informações Básicas'}
                {currentStep === 2 && 'Objetivos de Investimento'}
                {currentStep === 3 && 'Confirmação'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Informe seu patrimônio atual e experiência com investimentos'}
                {currentStep === 2 && 'Defina seus objetivos e estratégias de investimento'}
                {currentStep === 3 && 'Revise suas informações antes de enviar'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>
                
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Enviando...' : 'Solicitar Análise'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 