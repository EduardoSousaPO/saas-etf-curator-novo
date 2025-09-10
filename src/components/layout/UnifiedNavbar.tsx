"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import React, { useState, useRef } from "react";
import { 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  TrendingUp, 
  Building2,
  ChevronDown,
  BarChart3,
  Search,
  Zap,
  Users
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  authRequired?: boolean;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

// Navegação unificada com seções ETFs e Stocks
const unifiedNavSections: NavSection[] = [
  {
    title: "ETFs",
    icon: <TrendingUp className="w-4 h-4" />,
    items: [
      { href: "/screener", label: "Screener ETFs", icon: <Search className="w-4 h-4" /> },
      { href: "/rankings", label: "Rankings ETFs", icon: <TrendingUp className="w-4 h-4" /> },
      { href: "/comparador", label: "Comparador ETFs", icon: <Zap className="w-4 h-4" /> },
    ]
  },
  {
    title: "Stocks",
    icon: <Building2 className="w-4 h-4" />,
    items: [
      { href: "/stocks/screener", label: "Screener Stocks", icon: <Search className="w-4 h-4" /> },
      { href: "/stocks/rankings", label: "Rankings Stocks", icon: <TrendingUp className="w-4 h-4" /> },
      { href: "/stocks/comparator", label: "Comparador Stocks", icon: <Zap className="w-4 h-4" /> },
    ]
  }
];

// Navegação geral (não específica de ETFs/Stocks)
const generalNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard Universal", icon: <BarChart3 className="w-4 h-4" />, highlight: true },
  { href: "/portfolio-master", label: "Portfolio Master", icon: <Users className="w-4 h-4" />, highlight: true },
  { href: "/consultoria", label: "Wealth Management", icon: <Users className="w-4 h-4" /> },
  { href: "/chat", label: "Vista AI Chat", icon: <Zap className="w-4 h-4" />, highlight: true },
];

// Navegação pública
const publicNavItems: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/consultoria", label: "Wealth Management", highlight: true },
  { href: "/pricing", label: "Preços", authRequired: true },
];

export default function UnifiedNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  
  // Refs para controle de delay nos dropdowns
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para abrir dropdown com delay mínimo
  const handleDropdownEnter = (sectionTitle: string) => {
    // Cancelar timeout de fechamento se existir
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    
    // Abrir imediatamente se já não estiver aberto
    if (activeSection !== sectionTitle) {
      setActiveSection(sectionTitle);
    }
  };

  // Função para fechar dropdown com delay
  const handleDropdownLeave = () => {
    // Cancelar qualquer timeout anterior
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    
    // Criar novo timeout para fechar após delay
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveSection(null);
      leaveTimeoutRef.current = null;
    }, 300); // 300ms de delay
  };

  // Controle do header retrátil baseado no scroll
  React.useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Se scrollou para baixo mais de 100px, esconder header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsCollapsed(true);
      }
      // Se scrollou para cima ou está próximo do topo, mostrar header
      else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsCollapsed(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Limpar timeouts ao desmontar componente
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getCurrentSection = () => {
    if (pathname.startsWith('/stocks')) return 'Stocks';
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/screener') || 
        pathname.startsWith('/rankings') || pathname.startsWith('/comparador')) {
      return 'ETFs';
    }
    return null;
  };

  return (
    <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${
      isCollapsed ? 'transform -translate-y-full' : 'transform translate-y-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/imagens/Vista logo colorido (3).png" 
                alt="Vista Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-8">
            {user ? (
              <>
                {/* Seções ETFs e Stocks */}
                {unifiedNavSections.map((section) => (
                  <div 
                    key={section.title} 
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(section.title)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        getCurrentSection() === section.title
                          ? 'text-[#202636] bg-gray-50'
                          : 'text-gray-600 hover:text-[#202636] hover:bg-gray-50'
                      }`}
                    >
                      {section.icon}
                      {section.title}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                        activeSection === section.title ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeSection === section.title && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                              isActivePath(item.href)
                                ? 'text-[#202636] bg-gray-50'
                                : 'text-gray-700 hover:text-[#202636] hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveSection(null)}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Navegação Geral */}
                {generalNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      item.highlight 
                        ? 'bg-[#202636] text-white hover:bg-gray-800 rounded-lg border border-[#202636] hover:border-gray-700' 
                        : isActivePath(item.href)
                        ? 'text-[#202636] bg-gray-50 rounded-lg'
                        : 'text-gray-600 hover:text-[#202636] hover:bg-gray-50 rounded-lg'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </>
            ) : (
              /* Navegação Pública */
              publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    item.highlight 
                      ? 'bg-[#202636] text-white hover:bg-gray-800 rounded-lg border border-[#202636] hover:border-gray-700' 
                      : isActivePath(item.href)
                      ? 'text-[#202636] bg-gray-50 rounded-lg'
                      : 'text-gray-600 hover:text-[#202636] hover:bg-gray-50 rounded-lg'
                  }`}
                >
                  {item.label}
                </Link>
              ))
            )}

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[#202636] hover:bg-gray-50"
                >
                    <div className="w-8 h-8 bg-[#202636] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:text-[#202636] hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      Perfil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {!user && !loading && (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-[#202636] px-3 py-2 rounded-md text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[#202636] text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-[#202636] p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {user ? (
              <>
                {unifiedNavSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-md">
                      {section.icon}
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 pl-6 pr-3 py-2 text-sm rounded-md ${
                          isActivePath(item.href)
                            ? 'text-[#0090d8] bg-blue-50'
                            : 'text-gray-600 hover:text-[#0090d8] hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                
                {generalNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
                      isActivePath(item.href)
                        ? 'text-[#0090d8] bg-blue-50'
                        : 'text-gray-600 hover:text-[#0090d8] hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </>
            ) : (
              publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-sm rounded-md ${
                    isActivePath(item.href)
                      ? 'text-[#0090d8] bg-blue-50'
                      : 'text-gray-600 hover:text-[#0090d8] hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

