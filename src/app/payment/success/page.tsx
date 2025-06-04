"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Home, CreditCard } from 'lucide-react';
import MercadoPagoService from '@/lib/payments/mercadopago';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      const planDetails = MercadoPagoService.getPlanById(planId);
      setPlan(planDetails);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Aprovado! 🎉
          </h1>
          <p className="text-gray-600">
            Sua assinatura foi ativada com sucesso.
          </p>
        </div>

        {plan && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Plano Ativado:</span>
              <CreditCard className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-green-900">{plan.name}</h3>
            <p className="text-sm text-green-700">
              R$ {plan.price.toFixed(2).replace('.', ',')} / mês
            </p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-3">✅ O que você ganhou:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {plan?.features?.slice(0, 4).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/comparator')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            Começar a Usar
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Você receberá um email de confirmação em breve com os detalhes da sua assinatura.
          </p>
        </div>
      </div>
    </div>
  );
} 