'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, MapPin, ArrowRight, AlertCircle, DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Dados de autenticação
    email: '',
    password: '',
    confirmPassword: '',
    
    // Dados pessoais
    full_name: '',
    phone: '',
    birth_date: '',
    country: 'Brasil',
    
    // Perfil de investidor
    investment_experience: 'iniciante',
    risk_tolerance: 5,
    monthly_investment: '',
    total_patrimony: '',
    
    // Preferências
    email_notifications: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Nome completo é obrigatório';
    } else if (formData.full_name.length < 3) {
      newErrors.full_name = 'Nome deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.birth_date) {
      newErrors.birth_date = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.birth_date = 'Você deve ter pelo menos 18 anos';
      }
    }

    if (!formData.monthly_investment) {
      newErrors.monthly_investment = 'Valor mensal é obrigatório';
    } else if (parseFloat(formData.monthly_investment) <= 0) {
      newErrors.monthly_investment = 'Valor deve ser maior que zero';
    }

    if (!formData.total_patrimony) {
      newErrors.total_patrimony = 'Patrimônio total é obrigatório';
    } else if (parseFloat(formData.total_patrimony) <= 0) {
      newErrors.total_patrimony = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const userData = {
        full_name: formData.full_name,
        phone: formData.phone,
        birth_date: formData.birth_date,
        country: formData.country,
        investment_experience: formData.investment_experience,
        risk_tolerance: formData.risk_tolerance,
        monthly_investment: parseFloat(formData.monthly_investment),
        total_patrimony: parseFloat(formData.total_patrimony),
        email_notifications: formData.email_notifications
      };

      const { user, error } = await signUp(formData.email, formData.password, userData);
      
      if (error) {
        console.error('Erro detalhado no registro:', error);
        
        // Tratamento específico de erros
        if (error.message?.includes('email') && error.message?.includes('already')) {
          setErrors({ email: 'Este email já está cadastrado' });
          setStep(1);
        } else if (error.message?.includes('password')) {
          setErrors({ password: 'Senha não atende aos critérios de segurança' });
          setStep(1);
        } else if (error.message?.includes('weak_password')) {
          setErrors({ password: 'Senha muito fraca. Use pelo menos 8 caracteres com letras e números' });
          setStep(1);
        } else if (error.message?.includes('invalid_email')) {
          setErrors({ email: 'Formato de email inválido' });
          setStep(1);
        } else {
          toast.error(`Erro no registro: ${error.message || 'Erro desconhecido'}`);
        }
        return;
      }

      if (user) {
        setRegistrationComplete(true);
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      }
    } catch (error) {
      console.error('Erro inesperado no registro:', error);
      toast.error('Erro inesperado no registro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const countries = [
    'Brasil', 'Estados Unidos', 'Canadá', 'Reino Unido', 'Alemanha', 
    'França', 'Espanha', 'Itália', 'Portugal', 'Argentina', 'Chile', 'Outro'
  ];

  const experienceLevels = [
    { value: 'iniciante', label: 'Iniciante - Pouca ou nenhuma experiência' },
    { value: 'intermediario', label: 'Intermediário - Alguma experiência' },
    { value: 'avancado', label: 'Avançado - Experiência significativa' }
  ];

  // Tela de confirmação de registro
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                ETF<span className="font-light">Curator</span>
              </h1>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Conta criada com sucesso!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Enviamos um email de confirmação para <strong>{formData.email}</strong>. 
                              Clique no link para ativar sua conta e começar a usar o Vista.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 font-medium"
                style={{ backgroundColor: '#0090d8' }}
              >
                Ir para Login
              </button>
              
              <Link
                href="/"
                className="block w-full text-gray-600 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Voltar ao Início
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Não recebeu o email? Verifique sua caixa de spam ou{' '}
              <button 
                onClick={() => setRegistrationComplete(false)}
                className="text-blue-600 hover:underline"
              >
                tente novamente
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              ETF<span className="font-light">Curator</span>
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Criar sua conta
          </h2>
          <p className="text-gray-600">
            {step === 1 ? 'Dados básicos e credenciais' : 'Perfil de investidor'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Etapa {step} de 2
            </span>
            <span className="text-sm text-gray-500">
              {step === 1 ? 'Dados pessoais' : 'Perfil de investidor'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%`, backgroundColor: '#0090d8' }}
            />
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                {/* Nome Completo */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-opacity-100 transition-colors ${
                        errors.full_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': '#0090d8', '--tw-ring-opacity': '0.5' } as any}
                      onFocus={(e) => e.target.style.borderColor = '#0090d8'}
                      onBlur={(e) => e.target.style.borderColor = errors.full_name ? '#fca5a5' : '#d1d5db'}
                      placeholder="Seu nome completo"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.full_name && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.full_name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="(11) 99999-9999"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 8 caracteres com pelo menos 1 maiúscula, 1 minúscula e 1 número
                  </p>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Data de Nascimento */}
                <div>
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.birth_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.birth_date && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.birth_date}
                    </div>
                  )}
                </div>

                {/* País */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={isSubmitting}
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experiência de Investimento */}
                <div>
                  <label htmlFor="investment_experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experiência em Investimentos
                  </label>
                  <select
                    id="investment_experience"
                    value={formData.investment_experience}
                    onChange={(e) => handleInputChange('investment_experience', e.target.value)}
                    className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tolerância ao Risco */}
                <div>
                  <label htmlFor="risk_tolerance" className="block text-sm font-medium text-gray-700 mb-2">
                    Tolerância ao Risco (1-10)
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Conservador</span>
                    <input
                      id="risk_tolerance"
                      type="range"
                      min="1"
                      max="10"
                      value={formData.risk_tolerance}
                      onChange={(e) => handleInputChange('risk_tolerance', parseInt(e.target.value))}
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-500">Agressivo</span>
                    <span className="text-sm font-medium text-gray-700 w-8 text-center">
                      {formData.risk_tolerance}
                    </span>
                  </div>
                </div>

                {/* Investimento Mensal */}
                <div>
                  <label htmlFor="monthly_investment" className="block text-sm font-medium text-gray-700 mb-2">
                    Investimento Mensal (R$) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="monthly_investment"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monthly_investment}
                      onChange={(e) => handleInputChange('monthly_investment', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.monthly_investment ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="1000.00"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.monthly_investment && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.monthly_investment}
                    </div>
                  )}
                </div>

                {/* Patrimônio Total */}
                <div>
                  <label htmlFor="total_patrimony" className="block text-sm font-medium text-gray-700 mb-2">
                    Patrimônio Total (R$) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="total_patrimony"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_patrimony}
                      onChange={(e) => handleInputChange('total_patrimony', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.total_patrimony ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="50000.00"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.total_patrimony && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.total_patrimony}
                    </div>
                  )}
                </div>

                {/* Notificações por Email */}
                <div className="flex items-center">
                  <input
                    id="email_notifications"
                    type="checkbox"
                    checked={formData.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-700">
                    Receber notificações por email sobre atualizações e recomendações
                  </label>
                </div>
              </>
            )}

            {/* Botões de Navegação */}
            <div className="flex space-x-4 pt-6">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 font-medium"
                  style={{ backgroundColor: '#0090d8' }}
                  disabled={isSubmitting}
                >
                  Voltar
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0090d8' }}
              >
                {isSubmitting || loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {step === 1 ? 'Próximo' : 'Criar Conta'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 