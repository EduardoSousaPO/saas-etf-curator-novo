import { Metadata } from 'next'
import RequireAuth from '@/components/auth/RequireAuth'
import AdvancedBenchmark from '@/components/portfolio/AdvancedBenchmark'

export const metadata: Metadata = {
  title: 'Benchmark Avançado | ETF Curator',
  description: 'Análise comparativa avançada de portfolios com benchmarks SPY e BND usando métricas profissionais.',
  keywords: ['benchmark', 'SPY', 'BND', 'análise', 'portfolio', 'comparação', 'métricas']
}

export default function BenchmarkPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Benchmark Avançado
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Compare portfolios otimizados com benchmarks clássicos usando métricas profissionais
            </p>
          </div>
          
          <AdvancedBenchmark />
        </div>
      </div>
    </RequireAuth>
  )
} 