"use client";

import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, Eye, RefreshCw } from 'lucide-react';

export default function PaymentPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Pendente
          </h1>
          <p className="text-gray-600">
            Seu pagamento está sendo processado. Aguarde a confirmação.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Informações importantes:</h3>
          <ul className="text-sm text-yellow-700 text-left space-y-2">
            <li>• Para boletos: prazo de até 3 dias úteis</li>
            <li>• Para transferências: até 24 horas</li>
            <li>• Para cartões: processamento em alguns minutos</li>
            <li>• Você receberá email de confirmação</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Acompanhe seu pagamento</span>
          </div>
          <p className="text-sm text-blue-700">
            Você pode verificar o status do seu pagamento na área do cliente ou aguardar nosso email de confirmação.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => router.refresh()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar Status
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
          <p className="text-xs text-gray-500 mb-3">
            💡 <strong>Dica:</strong> Assim que o pagamento for confirmado, você terá acesso imediato a todos os recursos do seu plano.
          </p>
          
          <div className="text-xs text-gray-500">
            <p>
              Dúvidas? Entre em contato:{' '}
              <a href="mailto:suporte@etfcurator.com" className="text-blue-600 hover:underline">
                suporte@etfcurator.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 