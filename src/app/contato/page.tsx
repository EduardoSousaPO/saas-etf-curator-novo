'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Globe, 
  CheckCircle, 
  Star, 
  Shield, 
  TrendingUp,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  DollarSign,
  Users,
  Award,
  Target,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FormData {
  // Dados pessoais
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  
  // Preferências de contato
  horarioPreferido: 'manha' | 'tarde' | 'noite' | '';
  melhorDia: string;
  
  // Qualificação financeira
  patrimonioTotal: string;
  rendaMensal: string;
  experienciaInvestimentos: 'iniciante' | 'intermediario' | 'avancado' | '';
  
  // Objetivos
  objetivoPrincipal: string;
  horizonteTempo: '1-2-anos' | '3-5-anos' | '5-10-anos' | 'mais-10-anos' | '';
  
  // Plano de interesse
  planoInteresse: 'WEALTH' | 'OFFSHORE' | '';
  
  // Situação atual
  temConsultor: 'sim' | 'nao' | '';
  principaisInvestimentos: string;
  
  // Observações
  observacoes: string;
}

export default function ContatoPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    horarioPreferido: '',
    melhorDia: '',
    patrimonioTotal: '',
    rendaMensal: '',
    experienciaInvestimentos: '',
    objetivoPrincipal: '',
    horizonteTempo: '',
    planoInteresse: '',
    temConsultor: '',
    principaisInvestimentos: '',
    observacoes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('📤 Enviando dados do formulário:', formData);
      
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📥 Resposta recebida:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        toast.success(`🎉 ${data.message}`);
        
        // Reset form
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          whatsapp: '',
          horarioPreferido: '',
          melhorDia: '',
          patrimonioTotal: '',
          rendaMensal: '',
          experienciaInvestimentos: '',
          objetivoPrincipal: '',
          horizonteTempo: '',
          planoInteresse: '',
          temConsultor: '',
          principaisInvestimentos: '',
          observacoes: ''
        });
        setCurrentStep(1);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar solicitação:', error);
      toast.error(`❌ ${error.message || 'Erro ao enviar solicitação. Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nome && formData.email && formData.telefone);
      case 2:
        return !!(formData.patrimonioTotal && formData.experienciaInvestimentos && formData.planoInteresse);
      case 3:
        return !!(formData.objetivoPrincipal && formData.horizonteTempo);
      default:
        return true;
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(numericValue) || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Globe className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Consultoria Premium & Offshore
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Acesso exclusivo aos planos WEALTH e OFFSHORE através de processo seletivo personalizado. 
              Wealth management especializada para patrimônios qualificados.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Crown className="w-6 h-6 text-purple-300 mx-auto mb-2" />
                <div className="text-sm font-medium">WEALTH</div>
                <div className="text-xs text-blue-200">A partir de R$ 200.000</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Globe className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
                <div className="text-sm font-medium">OFFSHORE</div>
                <div className="text-xs text-blue-200">A partir de R$ 1.000.000</div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Overview */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Como Funciona o Processo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Solicitação</h3>
                <p className="text-sm text-gray-600">Preencha o formulário de qualificação com seus dados e objetivos</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Análise</h3>
                <p className="text-sm text-gray-600">Nossa equipe analisa seu perfil e adequação aos nossos serviços</p>
              </div>
              
              <div className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Reunião</h3>
                <p className="text-sm text-gray-600">Diagnóstico GRATUITO e apresentação da proposta personalizada</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">4. Onboarding</h3>
                <p className="text-sm text-gray-600">Início da consultoria especializada e gestão do patrimônio</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Formulário de Qualificação</CardTitle>
                <CardDescription>
                  Processo seletivo para planos WEALTH e OFFSHORE
                </CardDescription>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Etapa {currentStep} de 4
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Step 1: Dados Pessoais */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Mail className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <h3 className="text-xl font-semibold">Dados Pessoais</h3>
                        <p className="text-gray-600">Informações para contato inicial</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome Completo *</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            placeholder="Seu nome completo"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="seu@email.com"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="telefone">Telefone *</Label>
                          <Input
                            id="telefone"
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            placeholder="(11) 99999-9999"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input
                            id="whatsapp"
                            value={formData.whatsapp}
                            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="horarioPreferido">Horário Preferido para Contato</Label>
                          <select
                            id="horarioPreferido"
                            value={formData.horarioPreferido}
                            onChange={(e) => handleInputChange('horarioPreferido', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Selecione...</option>
                            <option value="manha">Manhã (9h às 12h)</option>
                            <option value="tarde">Tarde (13h às 18h)</option>
                            <option value="noite">Noite (19h às 21h)</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label htmlFor="melhorDia">Melhor Dia da Semana</Label>
                          <Input
                            id="melhorDia"
                            value={formData.melhorDia}
                            onChange={(e) => handleInputChange('melhorDia', e.target.value)}
                            placeholder="Ex: Segunda a Sexta"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Qualificação Financeira */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <h3 className="text-xl font-semibold">Qualificação Financeira</h3>
                        <p className="text-gray-600">Informações sobre seu patrimônio e experiência</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="patrimonioTotal">Patrimônio Total Investido *</Label>
                          <select
                            id="patrimonioTotal"
                            value={formData.patrimonioTotal}
                            onChange={(e) => handleInputChange('patrimonioTotal', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Selecione...</option>
                            <option value="200k-500k">R$ 200.000 - R$ 500.000</option>
                            <option value="500k-1M">R$ 500.000 - R$ 1.000.000</option>
                            <option value="1M-2M">R$ 1.000.000 - R$ 2.000.000</option>
                            <option value="2M-5M">R$ 2.000.000 - R$ 5.000.000</option>
                            <option value="5M+">Acima de R$ 5.000.000</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label htmlFor="rendaMensal">Renda Mensal Aproximada</Label>
                          <select
                            id="rendaMensal"
                            value={formData.rendaMensal}
                            onChange={(e) => handleInputChange('rendaMensal', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Selecione...</option>
                            <option value="10k-25k">R$ 10.000 - R$ 25.000</option>
                            <option value="25k-50k">R$ 25.000 - R$ 50.000</option>
                            <option value="50k-100k">R$ 50.000 - R$ 100.000</option>
                            <option value="100k+">Acima de R$ 100.000</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="experienciaInvestimentos">Experiência com Investimentos *</Label>
                          <select
                            id="experienciaInvestimentos"
                            value={formData.experienciaInvestimentos}
                            onChange={(e) => handleInputChange('experienciaInvestimentos', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Selecione...</option>
                            <option value="iniciante">Iniciante (menos de 2 anos)</option>
                            <option value="intermediario">Intermediário (2-5 anos)</option>
                            <option value="avancado">Avançado (mais de 5 anos)</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label htmlFor="planoInteresse">Plano de Interesse *</Label>
                          <select
                            id="planoInteresse"
                            value={formData.planoInteresse}
                            onChange={(e) => handleInputChange('planoInteresse', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Selecione...</option>
                            <option value="WEALTH">WEALTH - Consultoria Premium (R$ 200k+)</option>
                            <option value="OFFSHORE">OFFSHORE - Estruturação Internacional (R$ 1M+)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="principaisInvestimentos">Principais Investimentos Atuais</Label>
                        <Textarea
                          id="principaisInvestimentos"
                          value={formData.principaisInvestimentos}
                          onChange={(e) => handleInputChange('principaisInvestimentos', e.target.value)}
                          placeholder="Ex: Tesouro Direto, CDB, Ações, ETFs, Fundos..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="temConsultor">Atualmente tem consultor de investimentos?</Label>
                        <select
                          id="temConsultor"
                          value={formData.temConsultor}
                          onChange={(e) => handleInputChange('temConsultor', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Selecione...</option>
                          <option value="sim">Sim, tenho consultor</option>
                          <option value="nao">Não, faço tudo sozinho</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Objetivos e Perfil */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Target className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                        <h3 className="text-xl font-semibold">Objetivos e Perfil</h3>
                        <p className="text-gray-600">Seus objetivos financeiros e horizonte de tempo</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="objetivoPrincipal">Objetivo Principal com os Investimentos *</Label>
                        <Textarea
                          id="objetivoPrincipal"
                          value={formData.objetivoPrincipal}
                          onChange={(e) => handleInputChange('objetivoPrincipal', e.target.value)}
                          placeholder="Ex: Aposentadoria, proteção patrimonial, renda passiva, crescimento de capital..."
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="horizonteTempo">Horizonte de Tempo *</Label>
                        <select
                          id="horizonteTempo"
                          value={formData.horizonteTempo}
                          onChange={(e) => handleInputChange('horizonteTempo', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="1-2-anos">1 a 2 anos</option>
                          <option value="3-5-anos">3 a 5 anos</option>
                          <option value="5-10-anos">5 a 10 anos</option>
                          <option value="mais-10-anos">Mais de 10 anos</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="observacoes">Observações Adicionais</Label>
                        <Textarea
                          id="observacoes"
                          value={formData.observacoes}
                          onChange={(e) => handleInputChange('observacoes', e.target.value)}
                          placeholder="Alguma informação adicional que considera importante..."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4: Confirmação */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <h3 className="text-xl font-semibold">Confirmação</h3>
                        <p className="text-gray-600">Revise suas informações antes de enviar</p>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <div><strong>Nome:</strong> {formData.nome}</div>
                        <div><strong>E-mail:</strong> {formData.email}</div>
                        <div><strong>Telefone:</strong> {formData.telefone}</div>
                        <div><strong>Patrimônio:</strong> {formData.patrimonioTotal}</div>
                        <div><strong>Plano de Interesse:</strong> {formData.planoInteresse}</div>
                        <div><strong>Experiência:</strong> {formData.experienciaInvestimentos}</div>
                        <div><strong>Horizonte:</strong> {formData.horizonteTempo}</div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <strong>Próximos Passos:</strong>
                            <ul className="mt-2 space-y-1">
                              <li>• Nossa equipe analisará sua solicitação em até 24 horas</li>
                              <li>• Você receberá um e-mail com o resultado da análise</li>
                              <li>• Se aprovado, agendaremos uma reunião para diagnóstico GRATUITO</li>
                              <li>• O diagnóstico é sem compromisso e sem custo</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                    >
                      Voltar
                    </Button>
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!isStepValid(currentStep)}
                      >
                        Próximo
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-6 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Por que Escolher Nossos Planos Premium?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* WEALTH Benefits */}
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Crown className="w-8 h-8 text-purple-600" />
                    <div>
                      <CardTitle className="text-xl">Plano WEALTH</CardTitle>
                      <CardDescription>Wealth Management Premium</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Consultor CVM dedicado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Reuniões mensais personalizadas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Gestão ativa de carteira</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Planejamento financeiro completo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Acesso a corretoras premium</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Otimização tributária</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Taxa Transparente</div>
                    <div className="text-lg font-bold text-purple-600">1% a.a.</div>
                    <div className="text-xs text-purple-600">sobre patrimônio gerido</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* OFFSHORE Benefits */}
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-8 h-8 text-emerald-600" />
                    <div>
                      <CardTitle className="text-xl">Plano OFFSHORE</CardTitle>
                      <CardDescription>Estruturação Internacional</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Todas as vantagens do WEALTH</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Estruturação offshore especializada</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Rede de parceiros internacionais</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Planejamento sucessório internacional</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Compliance internacional</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Estratégias de elisão fiscal</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                    <div className="text-sm font-medium text-emerald-800">Taxa Especializada</div>
                    <div className="text-lg font-bold text-emerald-600">0,80% a.a.</div>
                    <div className="text-xs text-emerald-600">sobre patrimônio offshore</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">Credenciais e Segurança</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <Shield className="w-12 h-12 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Consultoria CVM</h3>
                <p className="text-sm text-gray-600">Consultores registrados na Comissão de Valores Mobiliários</p>
              </div>
              
              <div className="flex flex-col items-center">
                <Award className="w-12 h-12 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Transparência Total</h3>
                <p className="text-sm text-gray-600">Modelo fee-based sem conflitos de interesse</p>
              </div>
              
              <div className="flex flex-col items-center">
                <Users className="w-12 h-12 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">Processo Seletivo</h3>
                <p className="text-sm text-gray-600">Atendemos apenas clientes qualificados</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 