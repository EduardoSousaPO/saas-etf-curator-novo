'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (paymentId) {
      setPaymentData({
        id: paymentId,
        status: 'failed'
      });
      setLoading(false);
    }
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Pagamento Não Aprovado
          </CardTitle>
          <CardDescription>
            Não foi possível processar seu pagamento
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">
              Possíveis motivos:
            </h3>
            <ul className="space-y-2 text-sm text-red-700">
              <li>• Dados do cartão incorretos</li>
              <li>• Limite insuficiente</li>
              <li>• Problema na operadora</li>
              <li>• Pagamento cancelado pelo usuário</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">
              O que fazer agora?
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Verifique os dados do cartão</li>
              <li>• Confirme o limite disponível</li>
              <li>• Tente novamente em alguns minutos</li>
              <li>• Entre em contato com nosso suporte</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/pricing')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
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