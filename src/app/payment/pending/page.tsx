'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams?.get('payment_id');

  useEffect(() => {
    if (paymentId) {
      setPaymentData({
        id: paymentId,
        status: 'pending'
      });
      setLoading(false);
    }
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Clock className="w-16 h-16 text-yellow-600 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-700">
            Pagamento Pendente
          </CardTitle>
          <CardDescription>
            Seu pagamento está sendo processado
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">
              O que está acontecendo?
            </h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li>• Pagamento em análise pela operadora</li>
              <li>• Pode levar alguns minutos para aprovar</li>
              <li>• Você receberá uma notificação por email</li>
              <li>• Boleto bancário pode levar até 3 dias úteis</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">
              Próximos passos:
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Aguarde a confirmação por email</li>
              <li>• Verifique sua caixa de entrada</li>
              <li>• Acesse sua conta para ver o status</li>
              <li>• Entre em contato se demorar muito</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Acessar Minha Conta
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar Status
            </Button>
            
            <Button 
              onClick={() => router.push('/')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>

          {paymentId && (
            <div className="text-xs text-gray-500 text-center">
              ID do Pagamento: {paymentId}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 