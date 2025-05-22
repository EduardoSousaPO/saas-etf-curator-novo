// src/components/landing/HeroSection.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full h-[calc(100vh-4rem)] min-h-[500px] md:min-h-[600px] text-center bg-white dark:bg-[#181A1B] overflow-hidden">
      {/* Optional: Background image/video if desired, similar to Tesla 
      <div className="absolute inset-0 z-0">
        <img 
          src="/placeholder-skyline-finance.jpg" // Replace with actual high-res image
          alt="Financial Skyline Background"
          className="object-cover w-full h-full opacity-30 dark:opacity-20"
        />
      </div>
      */}
      <div className="relative z-10 p-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-[#1A1A1A] dark:text-white leading-tight">
          Descubra o Futuro dos Seus Investimentos em ETFs
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-300 md:text-xl">
          ETFCurator oferece as ferramentas mais inteligentes para você analisar, comparar e selecionar os melhores ETFs do mercado com precisão e simplicidade.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto text-lg py-3 px-8 bg-[#E82127] hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold">
            <Link href="/screener">Comece a Analisar</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg py-3 px-8 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white font-semibold">
            <Link href="/pricing">Ver Planos</Link>
          </Button>
        </div>
      </div>
      {/* Optional: Scroll down indicator or subtle animation */}
    </section>
  );
}

