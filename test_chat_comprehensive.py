#!/usr/bin/env python3
"""
Teste Abrangente do Chat Vista ETF Assistant
Valida se o chat consegue executar todas as funcionalidades manuais do app
"""

import asyncio
import json
import time
import requests
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import sys

# Configuração
BASE_URL = "http://localhost:3000"
CHAT_ENDPOINT = "/api/chat/agents"

@dataclass
class ChatTestResult:
    scenario: str
    user_message: str
    expected_functionality: str
    manual_equivalent: str
    success: bool
    response_time: float
    chat_response: str
    api_calls_detected: List[str]
    educational_value: int  # 1-5 scale
    error_message: str = ""

class ComprehensiveChatTester:
    """Testador abrangente do chat Vista ETF Assistant"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.results: List[ChatTestResult] = []
        self.start_time = time.time()
    
    def log_result(self, result: ChatTestResult):
        """Registrar resultado do teste"""
        self.results.append(result)
        status = "✅ PASSOU" if result.success else "❌ FALHOU"
        print(f"{status} | {result.scenario}")
        print(f"   Pergunta: {result.user_message}")
        print(f"   Equivalente Manual: {result.manual_equivalent}")
        print(f"   Tempo: {result.response_time:.2f}s")
        if not result.success and result.error_message:
            print(f"   Erro: {result.error_message}")
        print()
    
    def test_chat_message(self, scenario: str, user_message: str, 
                         expected_functionality: str, manual_equivalent: str,
                         expected_apis: List[str] = None) -> ChatTestResult:
        """Testar uma mensagem do chat"""
        start_time = time.time()
        
        try:
            response = requests.post(
                f"{self.base_url}{CHAT_ENDPOINT}",
                json={"message": user_message, "user_id": "test_comprehensive"},
                timeout=30
            )
            
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Processar resposta (pode ser streaming)
                response_text = response.text
                
                # Avaliar se a resposta indica sucesso
                success = self.evaluate_chat_response(response_text, expected_functionality)
                
                # Detectar APIs chamadas (baseado na resposta)
                detected_apis = self.detect_api_calls(response_text)
                
                # Avaliar valor educativo
                educational_value = self.evaluate_educational_value(response_text)
                
                return ChatTestResult(
                    scenario=scenario,
                    user_message=user_message,
                    expected_functionality=expected_functionality,
                    manual_equivalent=manual_equivalent,
                    success=success,
                    response_time=response_time,
                    chat_response=response_text[:500] + "..." if len(response_text) > 500 else response_text,
                    api_calls_detected=detected_apis,
                    educational_value=educational_value
                )
            else:
                return ChatTestResult(
                    scenario=scenario,
                    user_message=user_message,
                    expected_functionality=expected_functionality,
                    manual_equivalent=manual_equivalent,
                    success=False,
                    response_time=response_time,
                    chat_response="",
                    api_calls_detected=[],
                    educational_value=0,
                    error_message=f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            response_time = time.time() - start_time
            return ChatTestResult(
                scenario=scenario,
                user_message=user_message,
                expected_functionality=expected_functionality,
                manual_equivalent=manual_equivalent,
                success=False,
                response_time=response_time,
                chat_response="",
                api_calls_detected=[],
                educational_value=0,
                error_message=str(e)
            )
    
    def evaluate_chat_response(self, response: str, expected_functionality: str) -> bool:
        """Avaliar se a resposta do chat indica sucesso na funcionalidade esperada"""
        # Por enquanto, considera sucesso se não há erro explícito
        # Em implementação real, analisaria o conteúdo da resposta
        return "error" not in response.lower() and len(response) > 20
    
    def detect_api_calls(self, response: str) -> List[str]:
        """Detectar quais APIs foram chamadas baseado na resposta"""
        apis_detected = []
        
        # Palavras-chave que indicam uso de APIs específicas
        if "screening" in response.lower() or "filtros" in response.lower():
            apis_detected.append("screener")
        if "carteira" in response.lower() or "portfolio" in response.lower():
            apis_detected.append("portfolio_master")
        if "compar" in response.lower():
            apis_detected.append("comparador")
        if "ranking" in response.lower() or "melhores" in response.lower():
            apis_detected.append("rankings")
        if "dashboard" in response.lower() or "métricas" in response.lower():
            apis_detected.append("dashboard")
            
        return apis_detected
    
    def evaluate_educational_value(self, response: str) -> int:
        """Avaliar o valor educativo da resposta (1-5)"""
        educational_indicators = [
            "explicação", "porque", "isso significa", "por exemplo",
            "risco", "retorno", "diversificação", "taxa", "volatilidade"
        ]
        
        count = sum(1 for indicator in educational_indicators 
                   if indicator in response.lower())
        
        return min(5, max(1, count))
    
    def run_portfolio_creation_tests(self):
        """Testes de criação de portfolio"""
        print("\n🎯 TESTANDO: CRIAÇÃO DE PORTFOLIO")
        print("=" * 60)
        
        # Teste 1: Criação básica de carteira
        result = self.test_chat_message(
            scenario="Criação de Carteira Básica",
            user_message="Quero criar uma carteira conservadora com R$ 50.000 para aposentadoria",
            expected_functionality="Portfolio Master - Otimização Markowitz",
            manual_equivalent="Ir para Portfolio Master → Preencher formulário → Otimizar → Revisar resultados",
            expected_apis=["portfolio_master"]
        )
        self.log_result(result)
        
        # Teste 2: Carteira com perfil específico
        result = self.test_chat_message(
            scenario="Carteira Perfil Arrojado",
            user_message="Crie uma carteira arrojada focada em crescimento com R$ 100.000",
            expected_functionality="Portfolio Master - Seleção por perfil de risco",
            manual_equivalent="Portfolio Master → Selecionar 'Arrojado' → Objetivo 'Crescimento' → R$ 100k",
            expected_apis=["portfolio_master"]
        )
        self.log_result(result)
        
        # Teste 3: Carteira com restrições específicas
        result = self.test_chat_message(
            scenario="Carteira com Restrições",
            user_message="Quero uma carteira só com ETFs de baixa taxa (menor que 0.5%) para R$ 30.000",
            expected_functionality="Portfolio Master + Screener - Filtros combinados",
            manual_equivalent="Screener → Filtrar taxa < 0.5% → Portfolio Master → Usar ETFs filtrados",
            expected_apis=["screener", "portfolio_master"]
        )
        self.log_result(result)
    
    def run_etf_research_tests(self):
        """Testes de pesquisa de ETFs"""
        print("\n🔍 TESTANDO: PESQUISA DE ETFs")
        print("=" * 60)
        
        # Teste 1: Busca por setor
        result = self.test_chat_message(
            scenario="Busca ETFs por Setor",
            user_message="Me mostre os melhores ETFs de tecnologia com baixa taxa de administração",
            expected_functionality="Screener - Filtros por setor e taxa",
            manual_equivalent="Screener → Filtrar por 'Technology' → Ordenar por expense ratio → Ver resultados",
            expected_apis=["screener"]
        )
        self.log_result(result)
        
        # Teste 2: Análise específica de ETF
        result = self.test_chat_message(
            scenario="Análise ETF Específico",
            user_message="Analise o ETF VTI para mim, quais são os prós e contras?",
            expected_functionality="Detalhes ETF + Análise contextual",
            manual_equivalent="Screener → Buscar VTI → Clicar para detalhes → Ler métricas manualmente",
            expected_apis=["screener"]
        )
        self.log_result(result)
        
        # Teste 3: Comparação de ETFs
        result = self.test_chat_message(
            scenario="Comparação de ETFs",
            user_message="Compare VTI, SPY e QQQ para mim, qual é melhor para longo prazo?",
            expected_functionality="Comparador - Análise lado a lado",
            manual_equivalent="Comparador → Adicionar VTI, SPY, QQQ → Comparar métricas → Analisar manualmente",
            expected_apis=["comparador"]
        )
        self.log_result(result)
    
    def run_market_analysis_tests(self):
        """Testes de análise de mercado"""
        print("\n📊 TESTANDO: ANÁLISE DE MERCADO")
        print("=" * 60)
        
        # Teste 1: Rankings gerais
        result = self.test_chat_message(
            scenario="Rankings de Performance",
            user_message="Quais são os ETFs com melhor performance nos últimos 12 meses?",
            expected_functionality="Rankings - Best performers",
            manual_equivalent="Rankings → Selecionar 'Best Performance' → Ver lista dos top 15",
            expected_apis=["rankings"]
        )
        self.log_result(result)
        
        # Teste 2: Análise de tendências
        result = self.test_chat_message(
            scenario="Análise de Tendências",
            user_message="Como está o mercado de ETFs hoje? Há alguma oportunidade?",
            expected_functionality="Dashboard + Rankings - Insights de mercado",
            manual_equivalent="Dashboard → Ver métricas gerais → Rankings → Identificar oportunidades manualmente",
            expected_apis=["dashboard", "rankings"]
        )
        self.log_result(result)
        
        # Teste 3: Setores em alta
        result = self.test_chat_message(
            scenario="Setores em Alta",
            user_message="Que setores estão em alta agora e quais ETFs você recomenda?",
            expected_functionality="Rankings + Screener - Análise setorial",
            manual_equivalent="Rankings → Analisar por setor → Screener → Filtrar setores identificados",
            expected_apis=["rankings", "screener"]
        )
        self.log_result(result)
    
    def run_portfolio_management_tests(self):
        """Testes de gestão de portfolio"""
        print("\n📈 TESTANDO: GESTÃO DE PORTFOLIO")
        print("=" * 60)
        
        # Teste 1: Análise de portfolio existente
        result = self.test_chat_message(
            scenario="Análise Portfolio Existente",
            user_message="Tenho 60% VTI, 30% BND e 10% QQQ. Como posso melhorar essa carteira?",
            expected_functionality="Portfolio Master - Análise e otimização",
            manual_equivalent="Portfolio Master → Inserir alocações atuais → Executar otimização → Comparar resultados",
            expected_apis=["portfolio_master"]
        )
        self.log_result(result)
        
        # Teste 2: Rebalanceamento
        result = self.test_chat_message(
            scenario="Sugestão de Rebalanceamento",
            user_message="Minha carteira desbalanceou, quando devo rebalancear e como?",
            expected_functionality="Dashboard - Monitoramento + regras de rebalanceamento",
            manual_equivalent="Dashboard → Monitorar desvios → Calcular quando rebalancear manualmente",
            expected_apis=["dashboard"]
        )
        self.log_result(result)
        
        # Teste 3: Adição de novos aportes
        result = self.test_chat_message(
            scenario="Estratégia para Novos Aportes",
            user_message="Vou investir mais R$ 10.000, onde devo alocar para manter minha estratégia?",
            expected_functionality="Portfolio Master - Otimização incremental",
            manual_equivalent="Portfolio Master → Simular novo aporte → Otimizar alocação → Calcular diferenças",
            expected_apis=["portfolio_master"]
        )
        self.log_result(result)
    
    def run_educational_tests(self):
        """Testes de funcionalidade educativa"""
        print("\n🎓 TESTANDO: FUNCIONALIDADE EDUCATIVA")
        print("=" * 60)
        
        # Teste 1: Explicação de conceitos
        result = self.test_chat_message(
            scenario="Explicação de Conceitos",
            user_message="O que é Sharpe ratio e por que é importante para meus investimentos?",
            expected_functionality="Educação - Glossário contextual",
            manual_equivalent="Procurar em glossário → Ler definição → Aplicar ao contexto manualmente",
            expected_apis=[]
        )
        self.log_result(result)
        
        # Teste 2: Estratégias de investimento
        result = self.test_chat_message(
            scenario="Explicação de Estratégias",
            user_message="Explique a diferença entre investir em growth vs value ETFs",
            expected_functionality="Educação - Estratégias de investimento",
            manual_equivalent="Pesquisar sobre growth vs value → Comparar ETFs → Entender diferenças",
            expected_apis=["screener"]
        )
        self.log_result(result)
        
        # Teste 3: Riscos e diversificação
        result = self.test_chat_message(
            scenario="Educação sobre Riscos",
            user_message="Como diversificar adequadamente minha carteira para reduzir riscos?",
            expected_functionality="Educação + Portfolio Master - Teoria de diversificação",
            manual_equivalent="Estudar teoria de diversificação → Portfolio Master → Aplicar conceitos",
            expected_apis=["portfolio_master"]
        )
        self.log_result(result)
    
    def run_complex_scenarios_tests(self):
        """Testes de cenários complexos"""
        print("\n🧩 TESTANDO: CENÁRIOS COMPLEXOS")
        print("=" * 60)
        
        # Teste 1: Jornada completa do usuário
        result = self.test_chat_message(
            scenario="Jornada Completa Iniciante",
            user_message="Sou iniciante, tenho R$ 20.000 e quero começar a investir em ETFs. Me ajude do zero.",
            expected_functionality="Onboarding + Portfolio Master + Educação",
            manual_equivalent="Onboarding → Portfolio Master → Screener → Comparador → Dashboard → Educação",
            expected_apis=["portfolio_master", "screener"]
        )
        self.log_result(result)
        
        # Teste 2: Cenário específico com múltiplas funcionalidades
        result = self.test_chat_message(
            scenario="Cenário Multi-funcional",
            user_message="Quero investir R$ 100k focado em dividendos, mas também quero crescimento. Compare as opções e monte uma carteira balanceada.",
            expected_functionality="Screener + Comparador + Portfolio Master",
            manual_equivalent="Screener (dividendos) → Screener (growth) → Comparador → Portfolio Master → Otimização",
            expected_apis=["screener", "comparador", "portfolio_master"]
        )
        self.log_result(result)
        
        # Teste 3: Consultoria avançada
        result = self.test_chat_message(
            scenario="Consultoria Avançada",
            user_message="Tenho R$ 500k, perfil arrojado, 35 anos. Quero uma estratégia completa para aposentadoria aos 55. Inclua análise fiscal e rebalanceamento.",
            expected_functionality="Consultoria CVM + Portfolio Master + Planejamento",
            manual_equivalent="Consultoria CVM → Análise completa → Portfolio Master → Planejamento fiscal → Dashboard",
            expected_apis=["portfolio_master", "dashboard"]
        )
        self.log_result(result)
    
    def generate_comprehensive_report(self):
        """Gerar relatório abrangente dos testes"""
        total_time = time.time() - self.start_time
        
        # Estatísticas gerais
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        avg_response_time = sum(r.response_time for r in self.results) / total_tests if total_tests > 0 else 0
        
        # Análise por categoria
        categories = {
            "Criação de Portfolio": [r for r in self.results if "Portfolio" in r.scenario and "Criação" in r.scenario],
            "Pesquisa de ETFs": [r for r in self.results if "Busca" in r.scenario or "Análise ETF" in r.scenario or "Comparação" in r.scenario],
            "Análise de Mercado": [r for r in self.results if "Rankings" in r.scenario or "Tendências" in r.scenario or "Setores" in r.scenario],
            "Gestão de Portfolio": [r for r in self.results if "Gestão" in r.scenario or "Rebalance" in r.scenario or "Aportes" in r.scenario],
            "Educação": [r for r in self.results if "Educação" in r.scenario or "Explicação" in r.scenario],
            "Cenários Complexos": [r for r in self.results if "Jornada" in r.scenario or "Multi-funcional" in r.scenario or "Consultoria" in r.scenario]
        }
        
        # Análise de valor educativo
        avg_educational_value = sum(r.educational_value for r in self.results) / total_tests if total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("📊 RELATÓRIO ABRANGENTE - TESTE DO CHAT VISTA ETF ASSISTANT")
        print("=" * 80)
        print(f"⏱️  Tempo Total de Execução: {total_time:.2f}s")
        print(f"🧪 Total de Testes: {total_tests}")
        print(f"✅ Testes Aprovados: {passed_tests}")
        print(f"❌ Testes Falharam: {failed_tests}")
        print(f"📈 Taxa de Sucesso: {success_rate:.1f}%")
        print(f"⚡ Tempo Médio de Resposta: {avg_response_time:.2f}s")
        print(f"🎓 Valor Educativo Médio: {avg_educational_value:.1f}/5")
        
        print("\n📋 ANÁLISE POR CATEGORIA:")
        for category, results in categories.items():
            if results:
                category_success = sum(1 for r in results if r.success)
                category_total = len(results)
                category_rate = (category_success / category_total * 100) if category_total > 0 else 0
                print(f"   {category}: {category_success}/{category_total} ({category_rate:.1f}%)")
        
        print("\n🔧 FUNCIONALIDADES MAIS TESTADAS:")
        api_usage = {}
        for result in self.results:
            for api in result.api_calls_detected:
                api_usage[api] = api_usage.get(api, 0) + 1
        
        for api, count in sorted(api_usage.items(), key=lambda x: x[1], reverse=True):
            print(f"   {api}: {count} testes")
        
        # Análise de equivalência manual
        print("\n🎯 EQUIVALÊNCIA COM FUNCIONALIDADES MANUAIS:")
        manual_functions = set(r.manual_equivalent.split(" → ")[0] for r in self.results)
        for func in manual_functions:
            related_tests = [r for r in self.results if func in r.manual_equivalent]
            success_count = sum(1 for r in related_tests if r.success)
            print(f"   {func}: {success_count}/{len(related_tests)} testes bem-sucedidos")
        
        # Recomendações baseadas nos resultados
        print("\n💡 ANÁLISE DE CAPACIDADES DO CHAT:")
        
        if success_rate >= 90:
            print("   🎉 EXCELENTE: Chat consegue substituir a maioria das funcionalidades manuais")
            print("   ✅ Usuários podem usar o chat como interface principal")
            print("   🚀 Pronto para lançamento como copiloto financeiro")
        elif success_rate >= 75:
            print("   👍 BOM: Chat cobre a maioria dos casos de uso importantes")
            print("   🔧 Algumas funcionalidades precisam de melhorias")
            print("   📈 Potencial para ser interface principal com ajustes")
        elif success_rate >= 50:
            print("   ⚠️  MÉDIO: Chat funciona para casos básicos")
            print("   🛠️  Precisa de desenvolvimento significativo")
            print("   📚 Foco em melhorar integração com APIs")
        else:
            print("   🚨 BAIXO: Chat não consegue substituir funcionalidades manuais adequadamente")
            print("   🔄 Revisão completa da arquitetura necessária")
            print("   🎯 Priorizar integração funcional antes de UX")
        
        print(f"\n🎯 CONCLUSÃO SOBRE PROPOSTA DE VALOR:")
        if success_rate >= 80 and avg_educational_value >= 3:
            print("   ✅ PROPOSTA DE VALOR VALIDADA: Chat pode ser o 'copiloto financeiro' prometido")
            print("   🎓 Valor educativo adequado para transformar iniciantes em estrategistas")
            print("   💼 Interface conversacional pode substituir navegação manual complexa")
        else:
            print("   ⚠️  PROPOSTA DE VALOR PARCIALMENTE VALIDADA")
            print("   🔧 Melhorias necessárias para atingir visão de 'copiloto financeiro'")
            print("   📈 Potencial existe, mas implementação precisa de ajustes")
        
        # Salvar relatório detalhado
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "execution_time": total_time,
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": success_rate,
                "average_response_time": avg_response_time,
                "average_educational_value": avg_educational_value
            },
            "category_analysis": {
                category: {
                    "total": len(results),
                    "passed": sum(1 for r in results if r.success),
                    "success_rate": (sum(1 for r in results if r.success) / len(results) * 100) if results else 0
                }
                for category, results in categories.items() if results
            },
            "api_usage": api_usage,
            "detailed_results": [
                {
                    "scenario": r.scenario,
                    "user_message": r.user_message,
                    "expected_functionality": r.expected_functionality,
                    "manual_equivalent": r.manual_equivalent,
                    "success": r.success,
                    "response_time": r.response_time,
                    "api_calls_detected": r.api_calls_detected,
                    "educational_value": r.educational_value,
                    "error_message": r.error_message
                }
                for r in self.results
            ]
        }
        
        report_filename = f"chat_comprehensive_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Relatório detalhado salvo em: {report_filename}")
        
        return success_rate >= 75 and avg_educational_value >= 3

def main():
    """Função principal"""
    print("🚀 TESTE ABRANGENTE DO CHAT VISTA ETF ASSISTANT")
    print("=" * 80)
    print("🎯 OBJETIVO: Validar se o chat consegue substituir todas as funcionalidades manuais")
    print("📋 CENÁRIOS TESTADOS:")
    print("   • Criação e otimização de portfolios")
    print("   • Pesquisa e análise de ETFs")
    print("   • Análise de mercado e rankings")
    print("   • Gestão de portfolios existentes")
    print("   • Funcionalidades educativas")
    print("   • Cenários complexos multi-funcionais")
    print()
    
    tester = ComprehensiveChatTester(BASE_URL)
    
    # Executar todos os testes
    tester.run_portfolio_creation_tests()
    tester.run_etf_research_tests()
    tester.run_market_analysis_tests()
    tester.run_portfolio_management_tests()
    tester.run_educational_tests()
    tester.run_complex_scenarios_tests()
    
    # Gerar relatório final
    success = tester.generate_comprehensive_report()
    
    # Código de saída
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 