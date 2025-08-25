"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import React, { useState } from "react";
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
  const { user, profile, signOut, loading } = useAuth();

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-[#202636]">Vista</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {/* Seções ETFs e Stocks */}
                {unifiedNavSections.map((section) => (
                  <div key={section.title} className="relative">
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        getCurrentSection() === section.title
                          ? 'text-[#0090d8] bg-blue-50'
                          : 'text-gray-600 hover:text-[#0090d8] hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => setActiveSection(section.title)}
                      onMouseLeave={() => setActiveSection(null)}
                    >
                      {section.icon}
                      {section.title}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeSection === section.title && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                        onMouseEnter={() => setActiveSection(section.title)}
                        onMouseLeave={() => setActiveSection(null)}
                      >
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                              isActivePath(item.href)
                                ? 'text-[#0090d8] bg-blue-50'
                                : 'text-gray-700 hover:text-[#0090d8] hover:bg-gray-50'
                            }`}
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath(item.href)
                        ? 'text-[#0090d8] bg-blue-50'
                        : 'text-gray-600 hover:text-[#0090d8] hover:bg-gray-50'
                    } ${item.highlight ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' : ''}`}
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.href)
                      ? 'text-[#0090d8] bg-blue-50'
                      : 'text-gray-600 hover:text-[#0090d8] hover:bg-gray-50'
                  } ${item.highlight ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' : ''}`}
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
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[#0090d8] hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-[#0090d8] rounded-full flex items-center justify-center">
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
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:text-[#0090d8] hover:bg-gray-50"
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
                  className="text-gray-600 hover:text-[#0090d8] px-3 py-2 rounded-md text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[#0090d8] text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
              className="text-gray-600 hover:text-[#0090d8] p-2"
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

