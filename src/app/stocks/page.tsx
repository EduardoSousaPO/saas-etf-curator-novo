'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StocksRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o screener de stocks
    router.replace('/stocks/screener');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}



