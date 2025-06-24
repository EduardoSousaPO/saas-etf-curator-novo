// src/app/page.tsx
import Link from "next/link";
import { TrendingUp, Search, BarChart3, Shield, Award, ArrowRight, Star, CheckCircle, Users, TrendingDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import HeroStats from "@/components/landing/HeroStats";
import ETFShowcase from "@/components/landing/ETFShowcase";
import { ROISection } from "@/components/landing/ROISection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conservador</h3>
                <div className="text-sm text-gray-600 mb-6 space-y-1">
                  <div>280 ETFs analisados</div>
                  <div>Volatilidade: 11.85%</div>
                  <div>Sharpe Ratio: 0.42</div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">15.58%</div>
                <div className="text-sm text-gray-500 mb-4">Retorno médio anual</div>
                <div className="text-xs text-green-600 font-medium">✓ Baixo risco, retorno consistente</div>
              </div>

              {/* Moderado - DESTAQUE */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl text-white hover:shadow-xl transition-all duration-300 relative overflow-hidden transform hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute top-4 right-4 bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                  MAIS POPULAR
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Moderado</h3>
                <div className="text-sm text-green-100 mb-6 space-y-1">
                  <div>1.087 ETFs analisados</div>
                  <div>Volatilidade: 19.35%</div>
                  <div>Sharpe Ratio: 0.49</div>
                </div>
                <div className="text-4xl font-bold mb-2">18.89%</div>
                <div className="text-sm text-green-100 mb-4">Retorno médio anual</div>
                <div className="text-xs text-yellow-300 font-medium">⭐ Melhor relação risco-retorno</div>
              </div>

              {/* Arrojado */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-full -mr-10 -mt-10"></div>
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Arrojado</h3>
                <div className="text-sm text-gray-600 mb-6 space-y-1">
                  <div>438 ETFs analisados</div>
                  <div>Volatilidade: 30.66%</div>
                  <div>Sharpe Ratio: 0.26</div>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">15.51%</div>
                <div className="text-sm text-gray-500 mb-4">Retorno médio anual</div>
                <div className="text-xs text-orange-600 font-medium">⚡ Alto potencial, maior volatilidade</div>
              </div>

              {/* Especulativo */}
              <div className="bg-white p-8 rounded-2xl border border-red-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full -mr-10 -mt-10"></div>
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Especulativo</h3>
                <div className="text-sm text-gray-600 mb-6 space-y-1">
                  <div>312 ETFs analisados</div>
                  <div>Volatilidade: 67.83%</div>
                  <div>Sharpe Ratio: -0.05</div>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">-4.38%</div>
                <div className="text-sm text-gray-500 mb-4">Retorno médio anual</div>
                <div className="text-xs text-red-600 font-medium">⚠️ Alto risco, retorno negativo</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 mb-6">
                Quer descobrir quais ETFs específicos estão gerando estes retornos?
              </p>
              <Link 
                href="/screener"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver ETFs por Perfil
                <ArrowRight className="w-5 h-5" />
              </Link>
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

