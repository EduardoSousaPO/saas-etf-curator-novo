'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ETF } from '@/types/etf';
import ETFDetailCard from '@/components/screener/ETFDetailCard';
import Navbar from '@/components/layout/Navbar';
import RequireAuth from '@/components/auth/RequireAuth';

export default function ETFDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [etf, setETF] = useState<ETF | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbol = params?.symbol as string;

  useEffect(() => {
    if (!symbol) {
      setError('Símbolo do ETF não fornecido');
      setLoading(false);
      return;
    }

    const fetchETFDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/etfs/details/${encodeURIComponent(symbol.toUpperCase())}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('ETF não encontrado');
          } else {
            setError(`Erro ao carregar dados: ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        setETF(data.etf);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar detalhes do ETF:', err);
        setError('Erro ao carregar dados do ETF');
      } finally {
        setLoading(false);
      }
    };

    fetchETFDetails();
  }, [symbol]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes do ETF...</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!etf) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">ETF não encontrado</h1>
              <p className="text-gray-600 mb-4">O ETF {symbol} não foi encontrado em nossa base de dados.</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="relative">
          <ETFDetailCard 
            etf={etf} 
            loading={false} 
            onClose={handleClose}
          />
        </div>
      </div>
    </RequireAuth>
  );
} 