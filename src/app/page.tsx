// src/app/page.tsx
"use client";

import Link from "next/link";
import { TrendingUp, Search, BarChart3, Shield, Award, ArrowRight, Star, CheckCircle, Users, TrendingDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import HeroStats from "@/components/landing/HeroStats";
import ETFShowcase from "@/components/landing/ETFShowcase";
import { ROISection } from "@/components/landing/ROISection";
import { useAuth } from "@/hooks/useAuth";

// Componente de Debug temporário
function AuthDebug() {
  const { user, loading, profile } = useAuth();
  
  return (
    <div className="fixed top-20 right-4 bg-yellow-100 border border-yellow-300 p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug Auth</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
        <p><strong>User:</strong> {user ? 'Logado' : 'Não logado'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Profile:</strong> {profile ? 'Existe' : 'Não existe'}</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
      
      {/* Teste direto dos botões */}
      <div className="mt-4 pt-3 border-t border-yellow-300">
        <p className="font-bold text-yellow-800 mb-2">Teste Direto:</p>
        {loading ? (
          <p className="text-yellow-700">⏳ Carregando...</p>
        ) : user ? (
          <p className="text-green-700">✅ Usuário logado: {user.email}</p>
        ) : (
          <div className="space-y-2">
            <p className="text-red-700">❌ Usuário não logado</p>
            <Link 
              href="/auth/login"
              className="block bg-blue-600 text-white px-3 py-1 rounded text-center text-sm hover:bg-blue-700"
            >
              Entrar (Teste)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* DEBUG: Componente de debug */}
      <AuthDebug />
      
      {/* DEBUG: Botão de teste temporário */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link 
          href="/auth/login"
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
        >
          🔧 Debug: Entrar
        </Link>
      </div>
      
      <main className="pt-16">
        {/* Hero Section Melhorado - Inspirado em YC Startups */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                Dados Científicos • Mais de 4.400 ETFs Analisados
              </div>
              
              <h1 className="text-6xl font-bold text-gray-900 mb-6">
                Liberte Seu <span className="text-blue-600">Patrimônio</span> com
                <br />
                <span className="font-light">Ciência de Dados</span>
              </h1>
              
              <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                <strong>Pare de perder dinheiro com "achismos".</strong> Use nossa análise científica de ETFs americanos 
                para multiplicar seus ganhos e conquistar liberdade financeira através de decisões baseadas em dados reais.
              </p>

              {/* Value Props */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">96.5% dos ETFs com métricas completas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Análise científica anti-viés</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Rankings automáticos baseados em performance</span>
                </div>
              </div>
              
              {/* Estatísticas Dinâmicas */}
              <HeroStats />

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/onboarding"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  Descobrir Meus ETFs Ideais
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/screener"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 transition-colors text-lg"
                >
                  Ver Análise Gratuita
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Usado por investidores em 12+ países</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Análises atualizadas diariamente</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Problema/Solução - Inspirado em YC */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  O Problema: Você Está Perdendo Dinheiro
                </h2>
                <div className="space-y-4 text-lg text-gray-600">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <p><strong>95% dos investidores</strong> escolhem ETFs baseados em "dicas" e perdem dinheiro</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <p><strong>Análises superficiais</strong> ignoram métricas críticas como Sharpe Ratio e Max Drawdown</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <p><strong>Viés emocional</strong> faz você comprar no topo e vender no fundo</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  A Solução: Ciência de Dados
                </h2>
                <div className="space-y-4 text-lg text-gray-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p><strong>Análise quantitativa</strong> de 4.409 ETFs com 15+ métricas por fundo</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p><strong>Rankings automáticos</strong> baseados em performance real, não marketing</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p><strong>Decisões racionais</strong> que multiplicam seu patrimônio ao longo do tempo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top ETFs Showcase Dinâmico */}
        <ETFShowcase />

        {/* Social Proof Section */}
        <section className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Confiado por Investidores Inteligentes
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="font-bold text-gray-900 mb-2">Análise Científica</h3>
                  <p className="text-gray-600">Metodologia baseada em dados acadêmicos e validação estatística</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="font-bold text-gray-900 mb-2">Dados Seguros</h3>
                  <p className="text-gray-600">Informações criptografadas e protegidas por padrões bancários</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="font-bold text-gray-900 mb-2">Transparência Total</h3>
                  <p className="text-gray-600">Todas as métricas e metodologias são abertas e auditáveis</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ferramentas que Multiplicam Resultados
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cada ferramenta foi desenvolvida para eliminar vieses e maximizar seus retornos através de análise científica
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Rankings */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Rankings Anti-Viés</h3>
                <p className="text-gray-600 mb-6">
                  <strong>Pare de seguir "gurus".</strong> Rankings automáticos baseados em Sharpe Ratio, 
                  retorno ajustado ao risco e análise quantitativa pura.
                </p>
                <Link 
                  href="/rankings"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Ver Top ETFs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Screener */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Screener Científico</h3>
                <p className="text-gray-600 mb-6">
                  <strong>Encontre diamantes escondidos.</strong> Filtre 4.409 ETFs por 15+ métricas 
                  avançadas que os bancos usam internamente.
                </p>
                <Link 
                  href="/screener"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Descobrir ETFs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Comparador */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Comparação Profissional</h3>
                <p className="text-gray-600 mb-6">
                  <strong>Decisões baseadas em fatos.</strong> Compare até 4 ETFs com métricas 
                  que realmente importam para maximizar seus ganhos.
                </p>
                <Link 
                  href="/comparador"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Comparar Agora <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Perfis de Investidor Melhorados */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Retornos Reais por Perfil de Risco
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Baseado em análise científica de <strong>2.117 ETFs</strong> com dados validados. 
                Descubra qual perfil multiplica seu patrimônio mais eficientemente.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Conservador */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Conservador</h3>
                <div className="space-y-2 mb-6 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retorno Anual:</span>
                    <span className="font-semibold text-green-600">+8.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volatilidade:</span>
                    <span className="font-semibold text-blue-600">6.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Drawdown:</span>
                    <span className="font-semibold text-red-600">-4.2%</span>
                  </div>
                </div>
                <Link 
                  href="/simulador?perfil=conservador"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block relative z-10"
                >
                  Simular Portfolio
                </Link>
              </div>

              {/* Moderado */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10"></div>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Moderado</h3>
                <div className="space-y-2 mb-6 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retorno Anual:</span>
                    <span className="font-semibold text-green-600">+11.4%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volatilidade:</span>
                    <span className="font-semibold text-blue-600">12.1%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Drawdown:</span>
                    <span className="font-semibold text-red-600">-12.8%</span>
                  </div>
                </div>
                <Link 
                  href="/simulador?perfil=moderado"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center block relative z-10"
                >
                  Simular Portfolio
                </Link>
              </div>

              {/* Arrojado */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-full -mr-10 -mt-10"></div>
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Arrojado</h3>
                <div className="space-y-2 mb-6 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retorno Anual:</span>
                    <span className="font-semibold text-green-600">+15.7%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volatilidade:</span>
                    <span className="font-semibold text-blue-600">18.9%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Drawdown:</span>
                    <span className="font-semibold text-red-600">-24.1%</span>
                  </div>
                </div>
                <Link 
                  href="/simulador?perfil=arrojado"
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors text-center block relative z-10"
                >
                  Simular Portfolio
                </Link>
              </div>

              {/* Personalizado */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Personalizado</h3>
                <p className="text-gray-600 mb-6 text-sm relative z-10">
                  Crie seu próprio portfolio baseado em suas preferências específicas e objetivos únicos.
                </p>
                <Link 
                  href="/onboarding"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center block relative z-10"
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <ROISection />

        {/* CTA Final */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pare de Perder Dinheiro com Achismos
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de investidores que já descobriram como multiplicar 
              seu patrimônio usando ciência de dados ao invés de "dicas de guru".
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/onboarding"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                Descobrir Meus ETFs Ideais
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/screener"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg"
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

