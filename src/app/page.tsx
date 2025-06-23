// src/app/page.tsx
import Link from "next/link";
import { TrendingUp, Search, BarChart3, Shield, Award, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import HeroStats from "@/components/landing/HeroStats";
import ETFShowcase from "@/components/landing/ETFShowcase";
import { ROISection } from "@/components/landing/ROISection";

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
                  751 ETFs • Volatilidade média: 4.38%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">4.55%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>

              {/* Moderado */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Moderado</h3>
                <div className="text-sm text-gray-600 mb-4">
                  1.535 ETFs • Volatilidade média: 14.01%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">9.55%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>

              {/* Arrojado */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Arrojado</h3>
                <div className="text-sm text-gray-600 mb-4">
                  698 ETFs • Volatilidade média: 23.25%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">7.01%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>

              {/* Especulativo */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Especulativo</h3>
                <div className="text-sm text-gray-600 mb-4">
                  451 ETFs • Volatilidade média: 45.72%
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">0.24%</div>
                <div className="text-sm text-gray-500">Retorno médio anual</div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Planos */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Planos Flexíveis para Todos os Investidores
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Desde análises básicas até consultoria especializada com estruturação offshore
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Plano Starter */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                  <p className="text-gray-600 mb-4">Para começar sua jornada</p>
                  <div className="text-3xl font-bold text-green-600 mb-6">Gratuito</div>
                  
                  <ul className="text-sm text-gray-600 space-y-2 mb-8">
                    <li>• Dashboard básico (3 widgets)</li>
                    <li>• Screener limitado (2 filtros)</li>
                    <li>• Rankings top 5</li>
                    <li>• Comparador (2 ETFs)</li>
                    <li>• Dados 12 meses</li>
                  </ul>
                  
                  <Link 
                    href="/pricing"
                    className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors inline-block text-center"
                  >
                    Começar Grátis
                  </Link>
                </div>
              </div>

              {/* Plano Pro - Destaque */}
              <div className="bg-white p-8 rounded-2xl border-2 border-blue-500 hover:shadow-xl transition-shadow relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                  <p className="text-gray-600 mb-4">Para investidores ativos</p>
                  <div className="text-3xl font-bold text-blue-600 mb-2">R$ 39,90</div>
                  <div className="text-gray-500 mb-6">/mês</div>
                  
                  <ul className="text-sm text-gray-600 space-y-2 mb-8">
                    <li>• Dashboard completo</li>
                    <li>• Screener avançado (6 filtros)</li>
                    <li>• Rankings top 10</li>
                    <li>• Comparador (4 ETFs)</li>
                    <li>• Simulador com cenários</li>
                    <li>• Dados históricos completos</li>
                  </ul>
                  
                  <Link 
                    href="/pricing"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-center"
                  >
                    Assinar Pro
                  </Link>
                </div>
              </div>

              {/* Plano Wealth */}
              <div className="bg-white p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Wealth</h3>
                  <p className="text-gray-600 mb-4">Consultoria personalizada</p>
                  <div className="text-2xl font-bold text-purple-600 mb-2">1% a.a.</div>
                  <div className="text-gray-500 mb-6">sobre patrimônio</div>
                  
                  <ul className="text-sm text-gray-600 space-y-2 mb-8">
                    <li>• Tudo do Pro incluído</li>
                    <li>• Consultoria especializada</li>
                    <li>• Relatórios personalizados</li>
                    <li>• Rebalanceamento assistido</li>
                    <li>• Mínimo: R$ 200.000</li>
                  </ul>
                  
                  <Link 
                    href="/pricing"
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block text-center"
                  >
                    Solicitar Análise
                  </Link>
                </div>
              </div>

              {/* Plano Offshore */}
              <div className="bg-white p-8 rounded-2xl border border-emerald-200 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Offshore</h3>
                  <p className="text-gray-600 mb-4">Aconselhamento internacional</p>
                  <div className="text-2xl font-bold text-emerald-600 mb-2">0.8% a.a.</div>
                  <div className="text-gray-500 mb-6">sobre patrimônio</div>
                  
                  <ul className="text-sm text-gray-600 space-y-2 mb-8">
                    <li>• Tudo do Wealth incluído</li>
                    <li>• Aconselhamento em estruturação offshore</li>
                    <li>• Rede de parceiros globais</li>
                    <li>• Planejamento tributário</li>
                    <li>• Mínimo: R$ 1.000.000</li>
                  </ul>
                  
                  <Link 
                    href="/pricing"
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors inline-block text-center"
                  >
                    Solicitar Contato
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                Todos os planos incluem dados validados de 4.409 ETFs e atualizações em tempo real
              </p>
              <Link 
                href="/pricing"
                className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-2"
              >
                Ver Comparação Completa <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Seção de ROI */}
        <ROISection />

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
              href="/pricing"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Ver Planos e Preços
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

