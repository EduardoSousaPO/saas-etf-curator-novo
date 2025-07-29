"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RequireAuth from '@/components/auth/RequireAuth';
import PortfolioAllocationVisualization from '@/components/dashboard/PortfolioAllocationVisualization';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioId = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/portfolio/save?user_id=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.portfolios?.length > 0) {
          // Pega o primeiro portfolio disponível
          setPortfolioId(data.portfolios[0].id);
        } else {
          setError('Nenhum portfolio encontrado. Crie um portfolio primeiro.');
        }
      } catch (err) {
        console.error('Erro ao buscar portfolios:', err);
        setError('Erro ao carregar portfolios');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioId();
  }, [user?.id]);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <Navbar />
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-20 pt-8">
            <h1 className="text-6xl font-light text-black mb-6">
              Portfolio
            </h1>
            <p className="text-xl text-gray-600 font-light">
              Acompanhe sua carteira de investimentos e otimize suas alocações
            </p>
          </div>

          {/* Portfolio Overview - Interface Tesla */}
          <div className="mb-16">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <span className="ml-4 text-gray-600">Carregando portfolio...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="text-red-600 mb-4">{error}</div>
                <Link href="/portfolio-master" className="text-blue-600 hover:text-blue-800">
                  Criar Portfolio
                </Link>
              </div>
            ) : portfolioId && user?.id ? (
              <PortfolioAllocationVisualization 
                portfolioId={portfolioId} 
                userId={user.id} 
              />
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-600 mb-4">Portfolio não encontrado</div>
                <Link href="/portfolio-master" className="text-blue-600 hover:text-blue-800">
                  Criar Portfolio
                </Link>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Logo e Descrição */}
              <div className="md:col-span-1">
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-2xl font-light" style={{ color: '#202636' }}>Vista</span>
                </div>
                <p className="text-gray-600 font-light leading-relaxed">
                  Plataforma científica para análise e otimização de portfólios de ETFs com metodologia avançada e wealth management.
                </p>
              </div>

              {/* Produtos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Produtos</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/portfolio-master" className="text-gray-600 hover:text-gray-900 font-light">
                      Portfolio Master
                    </Link>
                  </li>
                  <li>
                    <Link href="/screener" className="text-gray-600 hover:text-gray-900 font-light">
                      Screener ETFs
                    </Link>
                  </li>
                  <li>
                    <Link href="/rankings" className="text-gray-600 hover:text-gray-900 font-light">
                      Rankings
                    </Link>
                  </li>
                  <li>
                    <Link href="/comparador" className="text-gray-600 hover:text-gray-900 font-light">
                      Comparador
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Empresa */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Empresa</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/sobre" className="text-gray-600 hover:text-gray-900 font-light">
                      Sobre Nós
                    </Link>
                  </li>
                  <li>
                    <Link href="/contato" className="text-gray-600 hover:text-gray-900 font-light">
                      Contato
                    </Link>
                  </li>
                  <li>
                    <Link href="/consultoria" className="text-gray-600 hover:text-gray-900 font-light">
                      Wealth Management
                    </Link>
                  </li>
                  <li>
                    <Link href="/termos" className="text-gray-600 hover:text-gray-900 font-light">
                      Termos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidade" className="text-gray-600 hover:text-gray-900 font-light">
                      Política de Privacidade
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Conecte-se */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Conecte-se</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center text-gray-600 hover:text-gray-900 font-light">
                    <span className="w-4 h-4 mr-2">📷</span>
                    Instagram
                  </a>
                  <a href="#" className="flex items-center text-gray-600 hover:text-gray-900 font-light">
                    <span className="w-4 h-4 mr-2">💼</span>
                    LinkedIn
                  </a>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Regulamentação CVM</h4>
                  <p className="text-xs text-gray-600 font-light">
                    Vista é uma plataforma de análise de ETFs. Serviços de consultoria são prestados por consultores registrados na CVM conforme Resolução 179/2023.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Copyright */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 font-light">
                <span className="font-medium">Vista</span> © 2024 Vista. Todos os direitos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 font-light">
                  Análise científica de ETFs
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 font-light">
                  Dados em tempo real
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 font-light">
                  Wealth Management
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
} 