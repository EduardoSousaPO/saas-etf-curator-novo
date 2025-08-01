// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import React, { useState, useEffect } from "react";
import { Menu, X, LogOut, Settings } from "lucide-react";

// Navegação para usuários não autenticados (público)
const publicNavItems: Array<{href: string, label: string, highlight?: boolean, authRequired?: boolean}> = [
  { href: "/", label: "Início" },
  { href: "/consultoria", label: "Wealth Management", highlight: true },
  { href: "/pricing", label: "Preços", authRequired: true },
];

// Navegação para usuários autenticados (privado) - REMOVIDO item "Perfil"
const privateNavItems: Array<{href: string, label: string, highlight?: boolean, authRequired?: boolean}> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/comparador", label: "Comparador" },
  { href: "/portfolio-master", label: "Portfolio Master" },
  { href: "/consultoria", label: "Wealth Management" },
  { href: "/rankings", label: "Rankings" },
  { href: "/screener", label: "Screener" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  
  // Escolher navegação baseada no status de autenticação
  const navItems = user ? privateNavItems : publicNavItems;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      
      // Forçar limpeza do localStorage e redirecionamento (apenas no cliente)
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Em caso de erro, forçar limpeza mesmo assim
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  const handleClearSession = () => {
    // Verificar se estamos no cliente
    if (typeof window !== 'undefined') {
      // Limpar todos os dados de autenticação
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar cookies manualmente
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Recarregar a página
      window.location.href = '/';
    }
  };

  // Renderização condicional mais clara
  const renderAuthButtons = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <span className="text-sm text-gray-500">Carregando...</span>
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex items-center space-x-4">
          {/* Nome do usuário como botão que leva para /profile */}
          <Link
            href="/profile"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#0090d8] transition-colors cursor-pointer"
          >
            {profile?.name || user.email?.split('@')[0]}
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            Sair
          </button>
        </div>
      );
    }

    // Usuário não autenticado - BOTÕES PRINCIPAIS
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/auth/login"
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          Entrar
        </Link>
        <Link
          href="/auth/register"
          className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: '#202636' }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = '#1a1f2e';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = '#202636';
          }}
        >
          Cadastrar
        </Link>
      </div>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Vista colorido */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/imagens/Vista logo colorido (3).png" 
              alt="Vista Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              // Se o item requer autenticação e o usuário não está logado, não renderizar
              if (item.authRequired && !user) {
                return null;
              }
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    // Scroll para seção de preços se for o link "Preços"
                    if (item.href === "/pricing" && pathname === "/") {
                      e.preventDefault();
                      const pricingSection = document.getElementById('pricing-section');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className={`text-sm font-medium transition-all duration-200 relative ${
                    item.highlight
                      ? "hover:text-[#202636] font-semibold"
                      : pathname === item.href 
                        ? "text-gray-900 dark:text-white" 
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  style={item.highlight ? { color: '#202636' } : {}}
                >
                  {item.label}
                  {pathname === item.href && (
                    <div className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      item.highlight ? "bg-blue-600 dark:bg-blue-400" : "bg-black dark:bg-white"
                    }`}></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/20 dark:border-gray-800/20">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => {
                // Se o item requer autenticação e o usuário não está logado, não renderizar
                if (item.authRequired && !user) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      // Scroll para seção de preços se for o link "Preços"
                      if (item.href === "/pricing" && pathname === "/") {
                        e.preventDefault();
                        const pricingSection = document.getElementById('pricing-section');
                        if (pricingSection) {
                          pricingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className={`text-base font-medium transition-colors ${
                      item.highlight
                        ? "font-semibold"
                        : pathname === item.href 
                          ? "text-gray-900 dark:text-white" 
                          : "text-gray-600 dark:text-gray-400"
                    }`}
                    style={item.highlight ? { color: '#202636' } : {}}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200/20 dark:border-gray-800/20">
                {user ? (
                  <div className="space-y-3">
                    {/* Nome do usuário como botão clicável para /profile */}
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-base font-medium text-gray-600 dark:text-gray-400"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                      style={{ backgroundColor: '#202636' }}
                    >
                      Cadastrar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

