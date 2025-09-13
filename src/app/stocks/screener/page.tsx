import React from 'react';
import { Metadata } from 'next';
import UnifiedNavbar from '@/components/layout/UnifiedNavbar';
import RequireAuth from '@/components/auth/RequireAuth';
import { UnifiedScreener } from '@/components/screener/UnifiedScreener';

export const metadata: Metadata = {
  title: 'Screener de Ações - Vista',
  description: 'Encontre as melhores ações americanas com filtros avançados por fundamentais, técnicos e análise de IA.',
};

export default function StocksScreenerPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <UnifiedNavbar />
        <UnifiedScreener type="stock" />
      </div>
    </RequireAuth>
  );
}