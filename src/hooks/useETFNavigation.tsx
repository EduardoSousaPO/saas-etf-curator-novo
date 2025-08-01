'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface ETFNavigationOptions {
  openInNewTab?: boolean;
  showModal?: boolean;
  onModalOpen?: (symbol: string) => void;
  onModalClose?: () => void;
}

export function useETFNavigation(options: ETFNavigationOptions = {}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedETFSymbol, setSelectedETFSymbol] = useState<string | null>(null);

  const navigateToETF = (symbol: string) => {
    if (!symbol) return;

    const normalizedSymbol = symbol.toUpperCase();

    if (options.showModal) {
      setSelectedETFSymbol(normalizedSymbol);
      setIsModalOpen(true);
      options.onModalOpen?.(normalizedSymbol);
    } else if (options.openInNewTab) {
      // Abrir em nova aba
      window.open(`/etf/${normalizedSymbol}`, '_blank', 'noopener,noreferrer');
    } else {
      // Navegar na mesma aba
      router.push(`/etf/${normalizedSymbol}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedETFSymbol(null);
    options.onModalClose?.();
  };

  return {
    navigateToETF,
    isModalOpen,
    selectedETFSymbol,
    closeModal,
    // Função de conveniência para clique
    handleETFClick: (symbol: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToETF(symbol);
    }
  };
} 