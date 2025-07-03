'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import UnifiedPortfolioMaster from '@/components/portfolio/UnifiedPortfolioMaster';
import AdvancedRecommendations from '@/components/portfolio/AdvancedRecommendations';
import { Target, Lightbulb, BarChart3, Sparkles } from 'lucide-react';

export default function RecomendacoesPage() {
  const [activeTab, setActiveTab] = useState('portfolio-master');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 Recomendações Inteligentes
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Combine o poder do Portfolio Master com análises avançadas para criar a carteira perfeita
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="portfolio-master" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Portfolio Master
            </TabsTrigger>
            <TabsTrigger value="advanced-analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análise Avançada
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Master Tab */}
          <TabsContent value="portfolio-master">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Portfolio Master Completo
                </CardTitle>
                <CardContent className="p-0">
                  <UnifiedPortfolioMaster />
                </CardContent>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Advanced Analysis Tab */}
          <TabsContent value="advanced-analysis">
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Análise Técnica Avançada
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    1.370+ ETFs
                  </Badge>
                  <Badge variant="outline" className="text-blue-600">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Scoring IA
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <AdvancedRecommendations />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Comparison Info */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">🎯 Portfolio Master</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Onboarding personalizado (3 etapas)</li>
                  <li>• Seleção interativa de ETFs</li>
                  <li>• Projeções Monte Carlo</li>
                  <li>• Backtesting vs benchmarks</li>
                  <li>• Gráficos visuais completos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-purple-600 mb-2">📊 Análise Avançada</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Sistema de scoring técnico</li>
                  <li>• Análise de 1.370+ ETFs</li>
                  <li>• Métricas quantitativas</li>
                  <li>• Sugestões alternativas</li>
                  <li>• Componentes de qualidade</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 