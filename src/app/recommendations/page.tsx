"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Target, 
  RefreshCw,
  ChevronRight,
  Star,
  AlertCircle,
  Filter,
  ArrowRight
} from 'lucide-react';
import { generateETFRecommendations, RecommendationRequest, RecommendationResponse } from '@/lib/ai/recommendations';
import { InvestorProfile } from '@/lib/onboarding/profiles';
import { ETF } from '@/types';
import ETFRecommendations from '@/components/recommendations/ETFRecommendations';
import AssistantChat from '@/components/assistant/AssistantChat';

export default function RecommendationsPage() {
  const [userProfile, setUserProfile] = useState<InvestorProfile | null>(null);
  const [availableETFs, setAvailableETFs] = useState<ETF[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    sectors: [] as string[],
    regions: [] as string[],
    maxExpenseRatio: 1.0,
    minAssets: 100000000 // $100M
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Carregar perfil do usuário
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setUserProfile(profileData.profile);
      }

      // Carregar ETFs disponíveis
      const etfsResponse = await fetch('/api/etfs');
      if (etfsResponse.ok) {
        const etfs = await etfsResponse.json();
        setAvailableETFs(etfs);
        
        // Se tiver perfil, gerar recomendações automaticamente
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          await generateRecommendations(profileData.profile, etfs);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const generateRecommendations = async (profile?: InvestorProfile, etfs?: ETF[]) => {
    if (!profile && !userProfile) return;
    if (!etfs && availableETFs.length === 0) return;

    setLoading(true);
    
    try {
      const request: RecommendationRequest = {
        profile: profile || userProfile!,
        availableETFs: etfs || availableETFs,
        preferences: Object.keys(preferences).some(key => 
          preferences[key as keyof typeof preferences] !== undefined && 
          (Array.isArray(preferences[key as keyof typeof preferences]) ? 
           (preferences[key as keyof typeof preferences] as any[]).length > 0 : true)
        ) ? preferences : undefined
      };

      const result = await generateETFRecommendations(request);
      setRecommendations(result);
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRecommendations = () => {
    generateRecommendations();
  };

  const updatePreferences = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const redirectToOnboarding = () => {
    window.location.href = '/onboarding';
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Recomendações Personalizadas
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Para receber recomendações de ETFs personalizadas, você precisa completar seu perfil de investidor.
          </p>
          <button
            onClick={redirectToOnboarding}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Completar Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Recomendações Personalizadas
                </h1>
                <p className="text-gray-600">
                  ETFs selecionados especialmente para o seu perfil {userProfile.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              
              <button
                onClick={handleRefreshRecommendations}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{userProfile.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{userProfile.name}</h3>
                  <p className="text-sm text-gray-600">{userProfile.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Tolerância ao risco:</span>
                <span className={`px-2 py-1 rounded text-white ${
                  userProfile.riskTolerance === 'conservative' ? 'bg-green-600' :
                  userProfile.riskTolerance === 'moderate' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {userProfile.riskTolerance === 'conservative' ? 'Conservador' :
                   userProfile.riskTolerance === 'moderate' ? 'Moderado' : 'Arrojado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências Avançadas</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Expense Ratio (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="2.0"
                  min="0.1"
                  value={preferences.maxExpenseRatio}
                  onChange={(e) => updatePreferences('maxExpenseRatio', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patrimônio Mínimo (Mi)
                </label>
                <select
                  value={preferences.minAssets}
                  onChange={(e) => updatePreferences('minAssets', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={50000000}>$50M</option>
                  <option value={100000000}>$100M</option>
                  <option value={500000000}>$500M</option>
                  <option value={1000000000}>$1B</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={handleRefreshRecommendations}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analisando milhares de ETFs para você...</p>
          </div>
        ) : recommendations ? (
          <ETFRecommendations 
            recommendations={recommendations} 
            userProfile={userProfile}
            onRefresh={handleRefreshRecommendations}
          />
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma recomendação disponível
            </h3>
            <p className="text-gray-600 mb-6">
              Clique em "Atualizar" para gerar recomendações baseadas no seu perfil.
            </p>
            <button
              onClick={handleRefreshRecommendations}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gerar Recomendações
            </button>
          </div>
        )}
      </div>

      {/* Assistente Virtual */}
      <AssistantChat />
    </div>
  );
} 