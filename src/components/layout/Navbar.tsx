// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient"; // For user session
import React, { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/screener", label: "SCREENER" },
  { href: "/rankings", label: "RANKINGS" },
  { href: "/comparator", label: "COMPARADOR" },
  { href: "/pricing", label: "PLANOS" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    // router.push("/"); // Or handle redirect as needed
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#181A1B]/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-[#1A1A1A] dark:text-white">
            ETFC<span className="text-[#E82127]">urator</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#E82127] dark:hover:text-[#E82127] ${pathname === item.href ? "text-[#E82127] dark:text-[#E82127]" : "text-gray-600 dark:text-gray-300"}`}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {!loading && (
              user ? (
                <Button variant="outline" onClick={handleSignOut} className="dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                  SAIR
                </Button>
              ) : (
                <Button asChild className="bg-[#E82127] hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white">
                  <Link href="/auth">LOGIN</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

