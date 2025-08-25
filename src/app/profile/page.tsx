'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Save,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import UnifiedNavbar from '@/components/layout/UnifiedNavbar';

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  country: string;
  investment_experience: string;
  risk_tolerance: number;
  monthly_investment: string;
  total_patrimony: string;
  preferred_language: string;
  email_notifications: boolean;
  investor_profile: {
    objectives: string[];
    time_horizon: string;
    preferred_sectors: string[];
    exclude_sectors: string[];
  };
}

const investmentExperiences = [
  { value: 'iniciante', label: 'Iniciante (0-1 ano)' },
  { value: 'intermediario', label: 'Intermediário (1-5 anos)' },
  { value: 'avancado', label: 'Avançado (5+ anos)' },
  { value: 'profissional', label: 'Profissional/Especialista' }
];

const countries = [
  { value: 'Brasil', label: 'Brasil' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Estados Unidos', label: 'Estados Unidos' },
  { value: 'Outro', label: 'Outro' }
];

// Removidas variáveis não utilizadas no momento

export default function ProfilePage() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    country: 'Brasil',
    investment_experience: 'iniciante',
    risk_tolerance: 5,
    monthly_investment: '',
    total_patrimony: '',
    preferred_language: 'pt-BR',
    email_notifications: true,
    investor_profile: {
      objectives: [],
      time_horizon: 'medio_prazo',
      preferred_sectors: [],
      exclude_sectors: []
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : '',
        country: profile.country || 'Brasil',
        investment_experience: profile.investment_experience || 'iniciante',
        risk_tolerance: profile.risk_tolerance || 5,
        monthly_investment: profile.monthly_investment?.toString() || '',
        total_patrimony: profile.total_patrimony?.toString() || '',
        preferred_language: profile.preferred_language || 'pt-BR',
        email_notifications: profile.email_notifications ?? true,
        investor_profile: {
          objectives: profile.investor_profile?.objectives || [],
          time_horizon: profile.investor_profile?.time_horizon || 'medio_prazo',
          preferred_sectors: profile.investor_profile?.preferred_sectors || [],
          exclude_sectors: profile.investor_profile?.exclude_sectors || []
        }
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        ...formData,
        monthly_investment: formData.monthly_investment ? Number(formData.monthly_investment) : undefined,
        total_patrimony: formData.total_patrimony ? Number(formData.total_patrimony) : undefined,
        birth_date: formData.birth_date || undefined
      };

      const result = await updateProfile(profileData);

      if (result.error) {
        toast.error('Erro ao salvar perfil');
        return;
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro inesperado ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="w-8 h-8 mr-3 text-blue-600" />
            Meu Perfil
          </h1>
          <p className="text-gray-600 mt-2">
            Complete seu perfil para receber recomendações personalizadas de ETFs
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* ALTERADO: Padronizado fonte do título para ficar igual ao texto de instrução */}
              <h3 className="text-gray-600 mt-2">Informações Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                      placeholder="Digite seu email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                    >
                      {countries.map(country => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil de Investidor</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experiência em Investimentos
                    </label>
                    <select
                      value={formData.investment_experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, investment_experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                    >
                      {investmentExperiences.map(exp => (
                        <option key={exp.value} value={exp.value}>
                          {exp.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tolerância ao Risco: {formData.risk_tolerance}
                    </label>
                    {/* ALTERADO: Adicionado estilos customizados para usar cor #0090d8 no slider */}
                    <style jsx>{`
                      .custom-slider::-webkit-slider-thumb {
                        appearance: none;
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: #0090d8;
                        cursor: pointer;
                        box-shadow: 0 0 2px 0 #555;
                      }
                      .custom-slider::-moz-range-thumb {
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: #0090d8;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 0 2px 0 #555;
                      }
                      .custom-slider::-webkit-slider-track {
                        background: #ddd;
                        height: 8px;
                        border-radius: 4px;
                      }
                      .custom-slider::-moz-range-track {
                        background: #ddd;
                        height: 8px;
                        border-radius: 4px;
                      }
                    `}</style>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.risk_tolerance}
                      onChange={(e) => setFormData(prev => ({ ...prev, risk_tolerance: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer custom-slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 - Conservador</span>
                      <span>10 - Muito Arrojado</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investimento Mensal (R$)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.monthly_investment}
                          onChange={(e) => setFormData(prev => ({ ...prev, monthly_investment: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                          placeholder="Ex: 1000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patrimônio Total (R$)
                      </label>
                      <div className="relative">
                        <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.total_patrimony}
                          onChange={(e) => setFormData(prev => ({ ...prev, total_patrimony: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0090d8]"
                          placeholder="Ex: 50000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            {/* ALTERADO: Cor do botão de azul para #0090d8 */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0090d8] hover:bg-[#0090d8]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0090d8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Perfil
                </>
              )}
            </button>
          </div>
        </form>

        {profile && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Perfil Completo
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Seu perfil está configurado e sincronizado.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 