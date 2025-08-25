import React from 'react';
import { Metadata } from 'next';
import UnifiedNavbar from '@/components/layout/UnifiedNavbar';
import RequireAuth from '@/components/auth/RequireAuth';
import { StocksScreener } from '@/components/stocks/StocksScreener';

export const metadata: Metadata = {
  title: 'Screener de Ações - Vista',
  description: 'Encontre as melhores ações americanas com filtros avançados por fundamentais, técnicos e análise de IA.',
};

export default function StocksScreenerPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
        
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <h1 className="text-6xl font-light text-black mb-4">Screener de Ações</h1>
              <p className="text-gray-600 text-lg">
                Encontre as melhores ações americanas com filtros avançados por fundamentais, técnicos e análise de IA
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StocksScreener />
        </div>
      </div>
    </RequireAuth>
  );
}




