// src/components/landing/HeroSection.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 overflow-hidden">
      {/* Background animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20"></div>
      
      {/* Floating elements - Tesla style */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Main headline - Tesla style typography */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900 dark:text-white mb-6">
          ETF<span className="font-normal text-blue-600 dark:text-blue-400">Curator</span>
        </h1>
        
        <p className="text-xl md:text-2xl lg:text-3xl font-light text-gray-700 dark:text-gray-300 mb-4 max-w-4xl mx-auto">
          O futuro dos investimentos em ETFs
        </p>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto font-light">
          Análise inteligente, comparação avançada e decisões precisas para maximizar seus retornos
        </p>

        {/* Feature highlights - Tesla style */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="font-medium">Rankings Inteligentes</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Análise de Riscos</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="font-medium">IA Avançada</span>
          </div>
        </div>

        {/* CTA Buttons - Tesla minimalist style */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Button 
            asChild 
            size="lg" 
            className="group bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-4 text-lg font-medium rounded-none transition-all duration-300 min-w-[200px]"
          >
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span>Começar Agora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black px-8 py-4 text-lg font-medium rounded-none transition-all duration-300 min-w-[200px]"
          >
            <Link href="/rankings">Ver Rankings</Link>
          </Button>
        </div>

        {/* Stats section - Tesla style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-2">1000+</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">ETFs Analisados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Precisão</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Monitoramento</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}

