"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RequireAuth from '@/components/auth/RequireAuth';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { useAuth } from '@/hooks/useAuth';
import { currencyService } from '@/lib/currency';
import { 
  Calculator, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  PieChart,
  Lightbulb,
  Zap,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SimulationInput {
  monthlyInvestment: number;
  monthlyInvestmentCurrency: 'BRL' | 'USD';
  initialAmount: number;
  initialAmountCurrency: 'BRL' | 'USD';
  targetAmount: number;
  targetAmountCurrency: 'BRL' | 'USD';
  timeHorizon: number; // em anos
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

interface SimulationResult {
  finalAmount: number;
  finalAmountUSD: number;
  monthsToGoal: number;
  totalContributed: number;
  totalContributedUSD: number;
  totalGains: number;
  totalGainsUSD: number;
  monthlyNeeded: number;
  monthlyNeededUSD: number;
  isRealistic: boolean;
  dollarExposure: number;
  suggestedETFs: string[];
}

interface ETFSuggestion {
  symbol: string;
  name: string;
  allocation: number;
  reason: string;
  risk: 'low' | 'medium' | 'high';
}

export default function SimuladorRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionamento automático após 3 segundos
    const timer = setTimeout(() => {
      router.push('/portfolio-master');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push('/portfolio-master');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 border-blue-200 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            🚀 Funcionalidade Aprimorada!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-lg text-muted-foreground">
              O <strong>Simulador</strong> foi unificado com outras funcionalidades em uma experiência ainda melhor:
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-600 mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5" />
                🎯 ETF Portfolio Master
              </h3>
              <p className="text-sm text-muted-foreground">
                Simulação + Recomendações + Análise Avançada em um só lugar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-green-600">✅ Base Real</div>
              <div className="text-muted-foreground">1.370 ETFs reais</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-blue-600">📊 Métricas Avançadas</div>
              <div className="text-muted-foreground">VaR, Sortino, Sharpe</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-purple-600">🎯 Onboarding 3 Etapas</div>
              <div className="text-muted-foreground">30 segundos</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Ir para Portfolio Master
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Redirecionamento automático em 3 segundos...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 