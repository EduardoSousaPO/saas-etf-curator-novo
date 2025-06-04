"use client";

import { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import CorrelationMatrix from '@/components/analytics/CorrelationMatrix';
import SectorAnalysis from '@/components/analytics/SectorAnalysis';
import RiskAnalysis from '@/components/analytics/RiskAnalysis';
import DiversificationOptimizer from '@/components/analytics/DiversificationOptimizer';

type TabType = 'correlations' | 'sectors' | 'risk' | 'diversification';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('correlations');

  const tabs = [
    {
      id: 'correlations' as TabType,
      name: 'Correlações',
      icon: BarChart3,
      description: 'Matriz de correlações entre ETFs'
    },
    {
      id: 'sectors' as TabType,
      name: 'Análise Setorial',
      icon: PieChart,
      description: 'Performance por setor'
    },
    {
      id: 'risk' as TabType,
      name: 'Análise de Risco',
      icon: Shield,
      description: 'Métricas de risco e volatilidade'
    },
    {
      id: 'diversification' as TabType,
      name: 'Diversificação',
      icon: Zap,
      description: 'Sugestões de otimização'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'correlations':
        return <CorrelationMatrix />;
      case 'sectors':
        return <SectorAnalysis />;
      case 'risk':
        return <RiskAnalysis />;
      case 'diversification':
        return <DiversificationOptimizer />;
      default:
        return <CorrelationMatrix />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600">Análises avançadas de correlações, risco e diversificação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 py-3 bg-gray-50">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 