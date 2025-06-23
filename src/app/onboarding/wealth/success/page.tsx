'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Calendar, Phone, MessageCircle, FileText, ArrowRight } from 'lucide-react';

export default function WealthOnboardingSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Solicitação Enviada com Sucesso! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sua solicitação para o <strong>Plano Wealth</strong> foi recebida. 
              Nossa equipe de consultores CVM está analisando seu perfil.
            </p>
          </div>

          {/* Next Steps Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-6 h-6 text-purple-600 mr-2" />
                Próximos Passos
              </CardTitle>
              <CardDescription>
                Veja o que acontece agora e como será o processo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Análise do Perfil</h3>
                    <p className="text-gray-600 text-sm">
                      Nossa equipe está analisando suas informações e objetivos de investimento.
                    </p>
                    <div className="text-xs text-purple-600 mt-1">⏱️ Em andamento</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Contato Inicial</h3>
                    <p className="text-gray-600 text-sm">
                      Um consultor CVM entrará em contato em até 48 horas para agendar uma reunião.
                    </p>
                    <div className="text-xs text-gray-500 mt-1">📞 Próximas 48h</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reunião de Apresentação</h3>
                    <p className="text-gray-600 text-sm">
                      Apresentação da estratégia personalizada e proposta de investimento.
                    </p>
                    <div className="text-xs text-gray-500 mt-1">🎯 A agendar</div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Início da Consultoria</h3>
                    <p className="text-gray-600 text-sm">
                      Assinatura do contrato e início do acompanhamento dedicado.
                    </p>
                    <div className="text-xs text-gray-500 mt-1">🚀 Após aprovação</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Telefone</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Para dúvidas urgentes
                </p>
                <p className="text-blue-600 font-medium">(11) 9999-9999</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Atendimento prioritário
                </p>
                <p className="text-green-600 font-medium">(11) 9999-9999</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">E-mail</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Suporte especializado
                </p>
                <p className="text-purple-600 font-medium">wealth@etfcurator.com</p>
              </CardContent>
            </Card>
          </div>

          {/* What's Included */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-6 h-6 text-purple-600 mr-2" />
                O que está incluído no Plano Wealth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Consultor CVM dedicado',
                  'Reuniões mensais personalizadas',
                  'WhatsApp prioritário',
                  'Relatórios customizados',
                  'Rebalanceamento trimestral',
                  'Acesso a corretoras premium',
                  'Análise fiscal especializada',
                  'Suporte para grandes patrimônios',
                  'Dashboard completo',
                  'Screener avançado ilimitado',
                  'Simulador com cenários',
                  'Exportação de relatórios'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              Ir para Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={() => router.push('/screener')}
              variant="outline"
              size="lg"
            >
              Explorar ETFs
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Enquanto aguarda o contato, você pode continuar usando todas as funcionalidades 
              do seu plano atual. Sua experiência será automaticamente atualizada após a confirmação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 