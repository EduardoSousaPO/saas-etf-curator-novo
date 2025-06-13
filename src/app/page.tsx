// src/app/page.tsx
import Link from "next/link";
import { TrendingUp, Search, BarChart3, Shield, Award, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import HeroStats from "@/components/landing/HeroStats";
import ETFShowcase from "@/components/landing/ETFShowcase";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section com Dados Reais */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold text-gray-900 mb-6">
                ETF<span className="font-light">Curator</span>
              </h1>
              <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Análise inteligente de ETFs americanos com dados reais. 
                Rankings baseados em performance e screener avançado para encontrar os melhores fundos.
              </p>
              
              {/* Estatísticas Dinâmicas */}
              <HeroStats />

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/onboarding"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Começar Análise Gratuita
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/screener"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                >
                  Explorar ETFs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Top ETFs Showcase Dinâmico */}
        <ETFShowcase />

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ferramentas Profissionais
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Análise completa baseada em dados reais de milhares de ETFs americanos
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Rankings */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Rankings Inteligentes</h3>
                <p className="text-gray-600 mb-6">
                  Rankings baseados em performance real, risco e índice Sharpe de milhares de ETFs
                </p>
                <Link 
                  href="/rankings"
                  className="text-blue-600 font-semibold hover:text-blue-700 flex items-center justify-center gap-2"
                >
                  Ver Rankings <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Screener */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Screener Avançado</h3>
                <p className="text-gray-600 mb-6">
                  Filtre ETFs por retorno, volatilidade, dividendos e mais de 15 critérios
                </p>
                <Link 
                  href="/screener"
                  className="text-green-600 font-semibold hover:text-green-700 flex items-center justify-center gap-2"
                >
                  Explorar ETFs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Comparador */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Comparação Detalhada</h3>
                <p className="text-gray-600 mb-6">
                  Compare até 4 ETFs lado a lado com métricas completas e gráficos
                </p>
                <Link 
                  href="/comparador"
                  className="text-purple-600 font-semibold hover:text-purple-700 flex items-center justify-center gap-2"
                >
                  Comparar ETFs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Perfis de Investidor */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Para Todos os Perfis de Investidor
              </h2>
              <p className="text-lg text-gray-600">
                Baseado em análise de volatilidade de milhares de ETFs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Conservador */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Conservador</h3>
                <div className="text-sm text-gray-600 mb-4">
                  1.674 ETFs • Volatilidade média: 8.56%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">7.40%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>

              {/* Moderado */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Moderado</h3>
                <div className="text-sm text-gray-600 mb-4">
                  1.121 ETFs • Volatilidade média: 19.28%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">8.77%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>

              {/* Arrojado */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Arrojado</h3>
                <div className="text-sm text-gray-600 mb-4">
                  337 ETFs • Volatilidade média: 28.98%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">5.03%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>

              {/* Especulativo */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Especulativo</h3>
                <div className="text-sm text-gray-600 mb-4">
                  255 ETFs • Volatilidade média: 51.25%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">8.98%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Comece Sua Análise Agora
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Descubra os melhores ETFs para seu perfil com base em dados reais de performance e risco
            </p>
            <Link 
              href="/onboarding"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Iniciar Análise Gratuita
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 px-6 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> As informações apresentadas são baseadas em dados históricos e não constituem 
              recomendação de investimento. Rentabilidade passada não garante resultados futuros. 
              Consulte sempre um profissional qualificado antes de investir.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export const metadata = {
  title: "ETF Curator | Análise Inteligente de ETFs Americanos",
  description: "Descubra, compare e otimize sua carteira de ETFs com dados reais, rankings, screener avançado e comparador detalhado.",
  keywords: [
    "ETF", "investimento", "finanças", "fundos", "bolsa de valores", "curadoria de ETFs", "screener de ETFs", "comparador de ETFs", "dados em tempo real"
  ],
  openGraph: {
    title: "ETF Curator | Análise Inteligente de ETFs Americanos",
    description: "Descubra, compare e otimize sua carteira de ETFs com dados reais, rankings, screener avançado e comparador detalhado.",
    url: "https://etfcurator.com.br/",
    siteName: "ETF Curator",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/image/visao_geral_planilha_etfs/etfcurator_og.png",
        width: 1200,
        height: 630,
        alt: "ETF Curator - Curadoria Inteligente de ETFs",
        type: "image/png"
      }
    ]
  }
};

