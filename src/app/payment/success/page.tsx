'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (paymentId) {
      // Aqui você pode fazer uma verificação adicional do status do pagamento
      // Por enquanto, vamos assumir que chegou aqui porque foi aprovado
      setPaymentData({
        id: paymentId,
        status: 'approved',
        plan: 'PRO' // Você pode buscar isso da API
      });
      setLoading(false);
    }
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Pagamento Aprovado!
          </CardTitle>
          <CardDescription>
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">
              O que acontece agora?
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Sua assinatura está ativa imediatamente</li>
              <li>• Acesso completo a todas as funcionalidades do plano</li>
              <li>• Dados atualizados em tempo real</li>
              <li>• Suporte técnico disponível</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Acessar Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              onClick={() => router.push('/screener')}
              variant="outline"
              className="w-full"
            >
              Explorar Screener
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