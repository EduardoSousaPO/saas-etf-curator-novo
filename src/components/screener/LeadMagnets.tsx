'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Crown, 
  TrendingUp, 
  Calendar, 
  Users, 
  Award, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  Shield,
  Zap,
  Target,
  X
} from 'lucide-react';
import ScreenerDesignSystem from './ScreenerDesignSystem';

interface LeadMagnetProps {
  type: 'premium_data' | 'consultation' | 'portfolio_analysis' | 'advanced_features';
  position: 'between_results' | 'sidebar' | 'modal';
  currentPage?: number;
  totalResults?: number;
}

interface PremiumFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  premium?: boolean;
}

const premiumFeatures: PremiumFeature[] = [
  {
    icon: BarChart3,
    title: 'Histórico Completo (20 anos)',
    description: 'Análise profunda com dados históricos extensos',
    premium: true
  },
  {
    icon: TrendingUp,
    title: 'Projeções Futuras',
    description: 'Simulações Monte Carlo personalizadas',
    premium: true
  },
  {
    icon: Award,
    title: 'Sharpe Ratio Avançado',
    description: 'Métricas de risco ajustadas por período',
    premium: true
  },
  {
    icon: Target,
    title: 'Recomendações IA',
    description: 'Sugestões personalizadas baseadas no seu perfil',
    premium: true
  }
];

const PremiumDataMagnet: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <Card className="border-2 border-[#0090d8] bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
    {onClose && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-2 right-2 z-10"
      >
        <X className="w-4 h-4" />
      </Button>
    )}
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#0090d8] rounded-full flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-[#202636]">
              Desbloqueie Dados Premium
            </h3>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
              <Crown className="w-3 h-3 mr-1" />
              PRO
            </Badge>
          </div>
          <p className="text-gray-600 mb-4">
            Acesse análises completas com 20 anos de histórico, projeções futuras 
            e métricas avançadas de risco.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#0090d8] bg-opacity-10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-3 h-3 text-[#0090d8]" />
                </div>
                <span className="text-sm text-gray-700">{feature.title}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button
              className={`${ScreenerDesignSystem.components.button.primary} ${ScreenerDesignSystem.components.button.sizes.md}`}
              onClick={() => window.location.href = '/auth/register?source=screener_premium'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Cadastre-se Grátis
            </Button>
            <Button
              variant="outline"
              className={ScreenerDesignSystem.components.button.sizes.md}
              onClick={() => window.location.href = '/pricing?source=screener'}
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ConsultationMagnet: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 relative overflow-hidden">
    {onClose && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-2 right-2 z-10"
      >
        <X className="w-4 h-4" />
      </Button>
    )}
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-[#202636]">
              Consultoria Personalizada
            </h3>
            <Badge className="bg-green-100 text-green-800">
              <Users className="w-3 h-3 mr-1" />
              1:1
            </Badge>
          </div>
          <p className="text-gray-600 mb-4">
            Transforme sua análise em uma estratégia de investimento personalizada 
            com nossos especialistas certificados CVM.
          </p>
          
          <div className="space-y-2 mb-4">
            {[
              'Análise completa do seu perfil',
              'Estratégia personalizada de alocação',
              'Implementação prática do portfolio',
              'Acompanhamento contínuo'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-300"
              onClick={() => window.location.href = '/consultoria?source=screener'}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Consulta
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/consultoria/como-funciona'}
            >
              Como Funciona
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PortfolioAnalysisMagnet: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 relative overflow-hidden">
    {onClose && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-2 right-2 z-10"
      >
        <X className="w-4 h-4" />
      </Button>
    )}
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-[#202636]">
              Análise Completa do Portfolio
            </h3>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Zap className="w-3 h-3 mr-1" />
              IA
            </Badge>
          </div>
          <p className="text-gray-600 mb-4">
            Descubra como integrar essas análises em um portfolio otimizado 
            usando nossa IA avançada e teoria de Markowitz.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1.370+</div>
              <div className="text-xs text-gray-500">ETFs Analisados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-xs text-gray-500">Ações Premium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5.000</div>
              <div className="text-xs text-gray-500">Simulações</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300"
              onClick={() => window.location.href = '/portfolio-master?source=screener'}
            >
              <Target className="w-4 h-4 mr-2" />
              Criar Portfolio
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/portfolio-master/demo'}
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdvancedFeaturesMagnet: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 relative overflow-hidden">
    {onClose && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-2 right-2 z-10"
      >
        <X className="w-4 h-4" />
      </Button>
    )}
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Star className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-[#202636]">
              Recursos Avançados
            </h3>
            <Badge className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white">
              <Star className="w-3 h-3 mr-1" />
              NOVO
            </Badge>
          </div>
          <p className="text-gray-600 mb-4">
            Acesse ferramentas profissionais de análise quantitativa e 
            comparação avançada entre ativos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {[
              'Comparador Multi-Ativo',
              'Backtesting Avançado',
              'Correlação de Mercado',
              'Alertas Personalizados'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-300"
              onClick={() => window.location.href = '/tools?source=screener'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explorar Ferramentas
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/comparador'}
            >
              Comparador
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const LeadMagnets: React.FC<LeadMagnetProps> = ({ 
  type, 
  position, 
  currentPage = 1, 
  totalResults = 0 
}) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const isDismissed = (magnetType: string) => dismissed.has(magnetType);

  const dismissMagnet = (magnetType: string) => {
    setDismissed(prev => new Set([...prev, magnetType]));
    // Salvar no localStorage para persistir
    localStorage.setItem(`magnet_dismissed_${magnetType}`, 'true');
  };

  // Lógica para mostrar magnets baseado na posição e contexto
  const shouldShowMagnet = () => {
    // Não mostrar se foi dismissado
    if (isDismissed(type)) return false;
    
    // Lógica específica por posição
    switch (position) {
      case 'between_results':
        // Mostrar entre resultados apenas em páginas específicas
        return currentPage === 2 || (currentPage > 3 && currentPage % 3 === 0);
      
      case 'sidebar':
        // Always show in sidebar if not dismissed
        return true;
      
      case 'modal':
        // Show in modal after user has seen some results
        return totalResults > 10;
      
      default:
        return true;
    }
  };

  if (!shouldShowMagnet()) return null;

  const renderMagnet = () => {
    const onClose = position !== 'modal' ? () => dismissMagnet(type) : undefined;
    
    switch (type) {
      case 'premium_data':
        return <PremiumDataMagnet onClose={onClose} />;
      
      case 'consultation':
        return <ConsultationMagnet onClose={onClose} />;
      
      case 'portfolio_analysis':
        return <PortfolioAnalysisMagnet onClose={onClose} />;
      
      case 'advanced_features':
        return <AdvancedFeaturesMagnet onClose={onClose} />;
      
      default:
        return null;
    }
  };

  // Wrapper baseado na posição
  const magnet = renderMagnet();
  
  if (position === 'sidebar') {
    return (
      <div className="sticky top-4 space-y-4">
        {magnet}
      </div>
    );
  }
  
  if (position === 'between_results') {
    return (
      <div className="my-8">
        {magnet}
      </div>
    );
  }
  
  return magnet;
};

// Hook para controlar exibição inteligente de lead magnets
export const useLeadMagnets = (userBehavior: {
  pageViews: number;
  timeOnPage: number;
  scrollDepth: number;
  filtersUsed: number;
  resultsViewed: number;
}) => {
  const [suggestedMagnets, setSuggestedMagnets] = useState<LeadMagnetProps['type'][]>([]);

  React.useEffect(() => {
    const suggestions: LeadMagnetProps['type'][] = [];

    // Usuário engajado mas não convertido
    if (userBehavior.pageViews > 3 && userBehavior.timeOnPage > 120) {
      suggestions.push('consultation');
    }

    // Usuário usando filtros avançados
    if (userBehavior.filtersUsed > 5) {
      suggestions.push('premium_data');
    }

    // Usuário visualizando muitos resultados
    if (userBehavior.resultsViewed > 20) {
      suggestions.push('portfolio_analysis');
    }

    // Usuário com alta profundidade de scroll
    if (userBehavior.scrollDepth > 80) {
      suggestions.push('advanced_features');
    }

    setSuggestedMagnets(suggestions);
  }, [userBehavior]);

  return suggestedMagnets;
};

export default LeadMagnets;

