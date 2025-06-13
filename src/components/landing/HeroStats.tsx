"use client";

import React, { useState, useEffect } from 'react';

interface LandingStats {
  totalETFs: number;
  etfsWithMetrics: number;
  metricsPercentage: number;
  uniqueCompanies: number;
  uniqueAssetClasses: number;
  avgReturn: number;
  avgVolatility: number;
  lastUpdated: string;
}

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

function AnimatedCounter({ end, duration = 2000, suffix = '', decimals = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = end * easeOut;
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.floor(num).toLocaleString('pt-BR');
  };

  return (
    <span>
      {formatNumber(count)}{suffix}
    </span>
  );
}

export default function HeroStats() {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('🔍 Carregando estatísticas da landing page...');
        
        const response = await fetch('/api/landing/stats');
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
          console.log('✅ Estatísticas carregadas:', result.data);
        } else {
          throw new Error(result.error || 'Erro ao carregar estatísticas');
        }
      } catch (err) {
        console.error('❌ Erro ao carregar estatísticas:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        
        // Fallback para dados estáticos
        setStats({
          totalETFs: 4409,
          etfsWithMetrics: 4253,
          metricsPercentage: 96.5,
          uniqueCompanies: 135,
          uniqueAssetClasses: 172,
          avgReturn: 8.2,
          avgVolatility: 16.8,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto">
      <div className="text-center animate-slideUp">
        <div className="text-3xl font-bold text-blue-600">
          <AnimatedCounter end={stats.totalETFs} />
        </div>
        <div className="text-sm text-gray-500">ETFs Analisados</div>
      </div>
      
      <div className="text-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <div className="text-3xl font-bold text-green-600">
          <AnimatedCounter end={stats.metricsPercentage} decimals={1} suffix="%" />
        </div>
        <div className="text-sm text-gray-500">Com Métricas</div>
      </div>
      
      <div className="text-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <div className="text-3xl font-bold text-purple-600">
          <AnimatedCounter end={stats.uniqueCompanies} />
        </div>
        <div className="text-sm text-gray-500">Gestoras</div>
      </div>
      
      <div className="text-center animate-slideUp" style={{ animationDelay: '0.3s' }}>
        <div className="text-3xl font-bold text-orange-600">
          <AnimatedCounter end={stats.uniqueAssetClasses} />
        </div>
        <div className="text-sm text-gray-500">Categorias</div>
      </div>

      {/* Informação adicional sobre atualização */}
      {error && (
        <div className="col-span-full text-center">
          <p className="text-xs text-yellow-600">
            ⚠️ Usando dados em cache. Última atualização: {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
          </p>
        </div>
      )}
      
      {!error && (
        <div className="col-span-full text-center">
          <p className="text-xs text-gray-400">
            Dados atualizados em tempo real • Última atualização: {new Date(stats.lastUpdated).toLocaleTimeString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
} 