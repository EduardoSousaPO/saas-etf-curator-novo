"use client";

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Não Processado
          </h1>
          <p className="text-gray-600">
            Ocorreu um problema com o seu pagamento. Não se preocupe, você pode tentar novamente.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Possíveis motivos:</h3>
          <ul className="text-sm text-red-700 text-left space-y-1">
            <li>• Dados do cartão incorretos</li>
            <li>• Limite insuficiente</li>
            <li>• Problema temporário no banco</li>
            <li>• Pagamento cancelado pelo usuário</li>
          </ul>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => router.push('/pricing')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Precisa de ajuda?</span>
          </div>
          
          <div className="space-y-2 text-xs text-gray-500">
            <p>
              Entre em contato conosco pelo email{' '}
              <a href="mailto:suporte@etfcurator.com" className="text-blue-600 hover:underline">
                suporte@etfcurator.com
              </a>
            </p>
            <p>Ou pelo WhatsApp: (11) 99999-9999</p>
          </div>
        </div>
      </div>
    </div>
  );
} 