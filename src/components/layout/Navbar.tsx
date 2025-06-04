// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient"; // For user session
import React, { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/rankings", label: "Rankings" },
  { href: "/screener", label: "Screener" },
  { href: "/comparator", label: "Comparar" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Tesla style */}
          <Link href="/" className="text-2xl font-light tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            ETF<span className="font-normal">Curator</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-all duration-200 relative ${
                  pathname === item.href 
                    ? "text-gray-900 dark:text-white" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black dark:bg-white"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {!loading && (
              user ? (
                <Button 
                  variant="outline" 
                  onClick={handleSignOut} 
                  className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none font-medium"
                >
                  Sair
                </Button>
              ) : (
                <Button 
                  asChild 
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none font-medium px-6"
                >
                  <Link href="/auth">Entrar</Link>
                </Button>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/20 dark:border-gray-800/20">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    pathname === item.href 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200/20 dark:border-gray-800/20">
                <ThemeToggle />
                {!loading && (
                  user ? (
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut} 
                      size="sm"
                      className="border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    >
                      Sair
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      size="sm"
                      className="bg-black dark:bg-white text-white dark:text-black rounded-none"
                    >
                      <Link href="/auth">Entrar</Link>
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

