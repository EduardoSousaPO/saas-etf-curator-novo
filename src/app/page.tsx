// src/app/page.tsx
"use client";

import Link from "next/link";
import { TrendingUp, Search, BarChart3, Shield, Award, ArrowRight, Star, CheckCircle, Users, TrendingDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import HeroStats from "@/components/landing/HeroStats";
import ETFShowcase from "@/components/landing/ETFShowcase";
import { ROISection } from "@/components/landing/ROISection";



export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section Tesla-style */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              {/* Trust Badge Tesla-style */}
              <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-sm border border-gray-100">
                <Star className="w-4 h-4 text-gray-600" />
                Dados Científicos • Mais de 4.400 ETFs Analisados
              </div>
              
              <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-8 leading-tight">
                Liberte Seu Patrimônio dos Limites do Mercado Brasileiro
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                Recomendações de ETFs baseadas no SEU perfil, não no lucro da corretora. Nossa engine elimina o medo de escolher errado. Receba carteiras personalizadas com dados que mostram exatamente como cada ETF vai acelerar seu crescimento patrimonial.
              </p>

              {/* Value Props Tesla-style */}
              <div className="flex flex-wrap justify-center gap-8 mb-16">
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-gray-900" />
                  <span className="font-light">96.5% dos ETFs com métricas completas</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-gray-900" />
                  <span className="font-light">Análise científica anti-viés</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-gray-900" />
                  <span className="font-light">Rankings automáticos baseados em performance</span>
                </div>
              </div>
              
              {/* Estatísticas Dinâmicas */}
              <div className="mb-16">
                <HeroStats />
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  href="/onboarding"
                  className="text-white px-12 py-4 rounded-xl font-light text-lg transition-all duration-300 flex items-center justify-center gap-3"
                  style={{ backgroundColor: '#202636' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#1a1f2e';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#202636';
                  }}
                >
                  Descobrir Meus ETFs Ideais
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/auth/register"
                  className="border border-gray-300 text-gray-700 px-12 py-4 rounded-xl font-light text-lg hover:border-gray-400 hover:bg-white transition-all duration-300"
                >
                  Ver Análise Gratuita
                </Link>
              </div>

              {/* Social Proof Tesla-style */}
              <div className="mt-16 flex items-center justify-center gap-12 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-light">Usado por investidores em 12+ países</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-light">Análises atualizadas diariamente</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Problema/Solução Tesla-style */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl font-light text-gray-900 mb-8">
                  O Problema: Você Está Perdendo Dinheiro
                </h2>
                <div className="space-y-6 text-lg text-gray-600">
                  <div className="flex items-start gap-4">
                    <TrendingDown className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="font-light"><strong className="font-medium">95% dos investidores</strong> escolhem ETFs baseados em "dicas" e perdem dinheiro</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <TrendingDown className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="font-light"><strong className="font-medium">Análises superficiais</strong> ignoram métricas críticas como Sharpe Ratio e Max Drawdown</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <TrendingDown className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="font-light"><strong className="font-medium">Viés emocional</strong> faz você comprar no topo e vender no fundo</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-light text-gray-900 mb-8">
                  A Solução: Ciência de Dados
                </h2>
                <div className="space-y-6 text-lg text-gray-600">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                    <p className="font-light"><strong className="font-medium">Análise quantitativa</strong> de 4.409 ETFs com 15+ métricas por fundo</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                    <p className="font-light"><strong className="font-medium">Rankings automáticos</strong> baseados em performance real, não marketing</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                    <p className="font-light"><strong className="font-medium">Decisões racionais</strong> que multiplicam seu patrimônio ao longo do tempo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top ETFs Showcase Dinâmico */}
        <ETFShowcase />

        {/* Social Proof Section Tesla-style */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-12">
                Confiado por Investidores Inteligentes
              </h2>
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="text-5xl mb-6">🏆</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Análise Científica</h3>
                  <p className="text-gray-600 font-light leading-relaxed">Metodologia baseada em dados acadêmicos e validação estatística</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-6">🔒</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Dados Seguros</h3>
                  <p className="text-gray-600 font-light leading-relaxed">Informações criptografadas e protegidas por padrões bancários</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-6">📊</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Transparência Total</h3>
                  <p className="text-gray-600 font-light leading-relaxed">Todas as métricas e metodologias são abertas e auditáveis</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section Tesla-style */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Ferramentas que Multiplicam Resultados
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed text-center">
                Cada ferramenta foi desenvolvida para eliminar vieses e maximizar seus retornos através de análise de dados
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Rankings */}
              <div className="text-center p-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-6">Rankings Anti-Viés</h3>
                <p className="text-gray-600 mb-8 font-light leading-relaxed">
                  <strong className="font-medium">Pare de seguir "gurus".</strong> Rankings automáticos baseados em Sharpe Ratio, 
                  retorno ajustado ao risco e análise quantitativa pura.
                </p>
                <Link 
                  href="/rankings"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-light hover:bg-gray-800 transition-all duration-300"
                >
                  Ver Top ETFs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Screener */}
              <div className="text-center p-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-6">Screener Científico</h3>
                <p className="text-gray-600 mb-8 font-light leading-relaxed">
                  <strong className="font-medium">Encontre diamantes escondidos.</strong> Filtre 4.409 ETFs por 15+ métricas 
                  avançadas que os bancos usam internamente.
                </p>
                <Link 
                  href="/screener"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-light hover:bg-gray-800 transition-all duration-300"
                >
                  Descobrir ETFs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Comparador */}
              <div className="text-center p-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-6">COMPRADOR PRO</h3>
                <p className="text-gray-600 mb-8 font-light leading-relaxed">
                  <strong className="font-medium">Decisões baseadas em fatos.</strong> Compare até 10 ETFs/métricas que realmente importam para maximizar seus ganhos.
                </p>
                <Link 
                  href="/comparador"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-light hover:bg-gray-800 transition-all duration-300"
                >
                  Comparar Agora <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Perfis de Investidor Tesla-style */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8 leading-tight">
                Seu investimento voltando no mesmo dia
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
                Baseado em análise científica de <strong className="font-medium">2.117 ETFs</strong> com dados validados.<br/>
                Descubra qual perfil multiplica seu patrimônio mais eficientemente.<br/>
                Nossa engine elimina o medo de escolher errado.<br/>
                Receba carteiras personalizadas com dados que mostram exatamente como cada ETF vai acelerar seu crescimento patrimonial.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Conservador */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Conservador</h3>
                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Retorno Anual:</span>
                    <span className="font-medium text-gray-900">+8.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Volatilidade:</span>
                    <span className="font-medium text-gray-900">6.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Max Drawdown:</span>
                    <span className="font-medium text-gray-900">-4.2%</span>
                  </div>
                </div>
                <Link 
                  href="/simulador?perfil=conservador"
                  className="w-full text-white py-3 px-6 rounded-xl font-light transition-all duration-300 text-center block mt-auto"
                  style={{ backgroundColor: '#202636' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#1a1f2e';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#202636';
                  }}
                >
                  Simular Portfolio
                </Link>
              </div>

              {/* Moderado */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Moderado</h3>
                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Retorno Anual:</span>
                    <span className="font-medium text-gray-900">+11.4%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Volatilidade:</span>
                    <span className="font-medium text-gray-900">12.1%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Max Drawdown:</span>
                    <span className="font-medium text-gray-900">-12.8%</span>
                  </div>
                </div>
                <Link 
                  href="/simulador?perfil=moderado"
                  className="w-full text-white py-3 px-6 rounded-xl font-light transition-all duration-300 text-center block mt-auto"
                  style={{ backgroundColor: '#202636' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#1a1f2e';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#202636';
                  }}
                >
                  Simular Portfolio
                </Link>
              </div>

              {/* Arrojado */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Arrojado</h3>
                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Retorno Anual:</span>
                    <span className="font-medium text-gray-900">+15.7%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Volatilidade:</span>
                    <span className="font-medium text-gray-900">18.9%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-light">Max Drawdown:</span>
                    <span className="font-medium text-gray-900">-24.1%</span>
                  </div>
                </div>
                <Link 
                  href="/simulador?perfil=arrojado"
                  className="w-full text-white py-3 px-6 rounded-xl font-light transition-all duration-300 text-center block mt-auto"
                  style={{ backgroundColor: '#202636' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#1a1f2e';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#202636';
                  }}
                >
                  Simular Portfolio
                </Link>
              </div>

              {/* Personalizado */}
              <div className="bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[400px]">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-xl font-light text-white mb-4">Personalizado</h3>
                <p className="text-gray-300 mb-8 text-sm font-light leading-relaxed flex-grow">
                  Crie seu próprio portfolio baseado em suas preferências específicas e objetivos únicos.
                </p>
                <Link 
                  href="/onboarding"
                  className="w-full text-white py-3 px-6 rounded-xl font-light transition-all duration-300 text-center block mt-auto"
                  style={{ backgroundColor: '#202636' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#1a1f2e';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#202636';
                  }}
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <div id="pricing-section">
          <ROISection />
        </div>

        {/* CTA Final Tesla-style */}
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-light text-white mb-8">
              Pare de Perder Dinheiro com Achismos
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Junte-se a milhares de investidores que já descobriram como multiplicar 
              seu patrimônio usando ciência de dados ao invés de "dicas de guru".
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/onboarding"
                className="text-white px-12 py-4 rounded-xl font-light transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                style={{ backgroundColor: '#202636' }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#1a1f2e';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#202636';
                }}
              >
                Descobrir Meus ETFs Ideais
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/auth/register"
                className="border border-gray-600 text-white px-12 py-4 rounded-xl font-light hover:bg-gray-800 transition-all duration-300 text-lg"
              >
                Ver Análise Gratuita
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

