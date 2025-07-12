'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Clock, Shield } from 'lucide-react';

export function ROISection() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Título da seção */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              O Investimento Que Se Paga Sozinho
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como nossos clientes recuperam o investimento nos planos em apenas algumas decisões
            </p>
          </div>

          {/* Cards de ROI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center bg-white shadow-lg">
              <CardHeader>
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Plano Pro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: '#202636' }}>R$ 97,0/mês</div>
                  <div className="text-sm" style={{ color: '#202636' }}>
                    Com 1 ETF certo você já recebe mais que o dobro do plano
                  </div>
                  <div className="text-xs text-gray-500 mt-4">
                    ROI médio: 847% no primeiro ano
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center bg-white shadow-lg">
              <CardHeader>
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Plano Wealth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: '#0090d8' }}>1% a.a.</div>
                  <div className="text-sm" style={{ color: '#0090d8' }}>
                    Consultoria especializada que gera alpha de 3-5% a.a. acima do benchmark
                  </div>
                  <div className="text-xs text-gray-500 mt-4">
                    Valor agregado: R$ 6.000 - R$ 10.000 anuais
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center bg-white shadow-lg">
              <CardHeader>
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Economia de Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: '#202636' }}>40h/mês</div>
                  <div className="text-sm" style={{ color: '#202636' }}>
                    Tempo economizado em pesquisa e análise manual
                  </div>
                  <div className="text-xs text-gray-500 mt-4">
                    Valor: R$ 2.000 - R$ 8.000/mês
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center bg-white shadow-lg">
              <CardHeader>
                <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Proteção Offshore</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: '#0090d8' }}>0.8% a.a.</div>
                  <div className="text-sm" style={{ color: '#0090d8' }}>
                    Estruturação que pode economizar 15-27.5% em impostos
                  </div>
                  <div className="text-xs text-gray-500 mt-4">
                    Economia: R$ 150.000 - R$ 275.000 anuais
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculadora simples de ROI */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-6">
              Veja o que você ganha
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2">Com Plano Starter (Gratuito)</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Análise básica limitada</div>
                  <div>• Decisões baseadas em dados parciais</div>
                  <div>• Risco de escolhas subótimas</div>
                </div>
                <div className="mt-4 text-red-600 font-semibold">
                  Custo de oportunidade: R$ 500 - R$ 2.000/mês
                </div>
              </div>
              
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 text-blue-900">Com Plano Pro</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>• Análise completa e precisa</div>
                  <div>• Decisões otimizadas</div>
                  <div>• Screener avançado</div>
                </div>
                <div className="mt-4 text-green-600 font-semibold">
                  Ganho líquido: R$ 460 - R$ 1.960/mês
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#202636' }}>
                <h4 className="font-semibold text-lg mb-2 text-white">Com Plano Wealth</h4>
                <div className="space-y-2 text-sm text-white">
                  <div>• Consultoria especializada</div>
                  <div>• Estratégias personalizadas</div>
                  <div>• Acompanhamento dedicado</div>
                </div>
                <div className="mt-4 text-green-400 font-semibold">
                  Alpha gerado: 3-5% a.a. adicional
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-4">
              Pronto para multiplicar seus resultados?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/pricing" 
                className="text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#202636' }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#1a1f2e';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#202636';
                }}
              >
                Quero ser PRO
              </a>
              <a 
                href="#" 
                className="text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#0090d8' }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#007bb8';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#0090d8';
                }}
              >
                Começar Grátis Agora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 