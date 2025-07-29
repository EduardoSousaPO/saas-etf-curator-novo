#!/usr/bin/env python3
"""
Script de Teste - Integração dos Agentes Vista ETF Assistant
Testa todas as funcionalidades principais via APIs
"""

import asyncio
import json
import time
import requests
from typing import Dict, Any, List
from dataclasses import dataclass
from datetime import datetime

# Configuração
BASE_URL = "http://localhost:3000"
TEST_USER_ID = "test_user_integration"

@dataclass
class TestResult:
    test_name: str
    success: bool
    response_time: float
    details: str
    api_endpoint: str
    error_message: str = ""

class APITester:
    """Testador de APIs do ETF Curator"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.results: List[TestResult] = []
    
    def log_result(self, result: TestResult):
        """Log do resultado do teste"""
        status = "✅ PASSOU" if result.success else "❌ FALHOU"
        print(f"{status} | {result.test_name} | {result.response_time:.2f}s")
        if not result.success:
            print(f"   Erro: {result.error_message}")
        self.results.append(result)
    
    def test_api_endpoint(self, endpoint: str, method: str = "GET", 
                         payload: Dict = None, test_name: str = "") -> TestResult:
        """Teste genérico de endpoint"""
        start_time = time.time()
        
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == "POST":
                response = requests.post(url, json=payload, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=payload, timeout=30)
            else:
                response = requests.get(url, timeout=30)
            
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    return TestResult(
                        test_name=test_name,
                        success=True,
                        response_time=response_time,
                        details=f"Status: {response.status_code}, Data keys: {list(data.keys()) if isinstance(data, dict) else 'Non-dict response'}",
                        api_endpoint=endpoint
                    )
                except json.JSONDecodeError:
                    return TestResult(
                        test_name=test_name,
                        success=True,
                        response_time=response_time,
                        details=f"Status: {response.status_code}, Response: {response.text[:100]}...",
                        api_endpoint=endpoint
                    )
            else:
                return TestResult(
                    test_name=test_name,
                    success=False,
                    response_time=response_time,
                    details=f"Status: {response.status_code}",
                    api_endpoint=endpoint,
                    error_message=f"HTTP {response.status_code}: {response.text[:200]}"
                )
                
        except Exception as e:
            response_time = time.time() - start_time
            return TestResult(
                test_name=test_name,
                success=False,
                response_time=response_time,
                details="Exception occurred",
                api_endpoint=endpoint,
                error_message=str(e)
            )

class AgentIntegrationTester:
    """Testador específico para integração dos agentes"""
    
    def __init__(self, base_url: str):
        self.api_tester = APITester(base_url)
        self.base_url = base_url
    
    def test_screener_api(self):
        """Teste da API do Screener"""
        print("\n🔍 TESTANDO API DO SCREENER...")
        
        # Teste 1: Screener básico
        result = self.api_tester.test_api_endpoint(
            "/api/etfs/screener?search_term=technology&limit=5",
            test_name="Screener - Filtro Tecnologia"
        )
        self.api_tester.log_result(result)
        
        # Teste 2: Screener com filtros avançados
        result = self.api_tester.test_api_endpoint(
            "/api/etfs/screener?assetclass=Equity&expense_ratio_max=0.5&limit=10",
            test_name="Screener - Filtros Avançados"
        )
        self.api_tester.log_result(result)
        
        # Teste 3: Screener com preset
        result = self.api_tester.test_api_endpoint(
            "/api/etfs/screener?filter_preset=low_cost&sort_preset=performance",
            test_name="Screener - Presets"
        )
        self.api_tester.log_result(result)
    
    def test_portfolio_master_api(self):
        """Teste da API do Portfolio Master"""
        print("\n💼 TESTANDO API DO PORTFOLIO MASTER...")
        
        # Teste 1: Criação de portfolio conservador
        payload = {
            "objective": "retirement",
            "investmentAmount": 50000,
            "monthlyContribution": 1000,
            "riskProfile": "conservative",
            "timeHorizon": 120,
            "preferences": {
                "currency": "USD",
                "maxETFs": 6,
                "includeInternational": True
            }
        }
        
        result = self.api_tester.test_api_endpoint(
            "/api/portfolio/unified-master",
            method="POST",
            payload=payload,
            test_name="Portfolio Master - Criação Conservadora"
        )
        self.api_tester.log_result(result)
        
        # Teste 2: Recálculo dinâmico
        recalc_payload = {
            "selectedETFs": ["VTI", "BND", "VXUS"],
            "investmentAmount": 25000,
            "riskProfile": "moderate",
            "objective": "growth",
            "currency": "USD"
        }
        
        result = self.api_tester.test_api_endpoint(
            "/api/portfolio/unified-master",
            method="PUT",
            payload=recalc_payload,
            test_name="Portfolio Master - Recálculo Dinâmico"
        )
        self.api_tester.log_result(result)
    
    def test_comparador_api(self):
        """Teste da API do Comparador"""
        print("\n⚖️ TESTANDO API DO COMPARADOR...")
        
        # Teste 1: Comparação de ETFs específicos
        result = self.api_tester.test_api_endpoint(
            "/api/etfs/details/VTI",
            test_name="Comparador - Detalhes ETF Individual"
        )
        self.api_tester.log_result(result)
        
        # Teste 2: Comparação múltipla (se existir endpoint)
        result = self.api_tester.test_api_endpoint(
            "/api/etfs/comparator?symbols=VTI,SPY,QQQ",
            test_name="Comparador - Múltiplos ETFs"
        )
        self.api_tester.log_result(result)
    
    def test_rankings_api(self):
        """Teste da API de Rankings"""
        print("\n🏆 TESTANDO API DE RANKINGS...")
        
        # Teste 1: Rankings gerais
        result = self.api_tester.test_api_endpoint(
            "/api/etfs/rankings",
            test_name="Rankings - Geral"
        )
        self.api_tester.log_result(result)
        
        # Teste 2: Rankings por categoria
        result = self.api_tester.test_api_endpoint(
            "/api/etfs/rankings?category=performance&limit=10",
            test_name="Rankings - Por Categoria"
        )
        self.api_tester.log_result(result)
    
    def test_dashboard_apis(self):
        """Teste das APIs do Dashboard"""
        print("\n📊 TESTANDO APIs DO DASHBOARD...")
        
        # Teste 1: Métricas do sistema
        result = self.api_tester.test_api_endpoint(
            "/api/analytics/system-metrics",
            test_name="Dashboard - Métricas Sistema"
        )
        self.api_tester.log_result(result)
        
        # Teste 2: Performance dos agentes
        result = self.api_tester.test_api_endpoint(
            "/api/analytics/agent-performance",
            test_name="Dashboard - Performance Agentes"
        )
        self.api_tester.log_result(result)
        
        # Teste 3: Métricas de mercado
        result = self.api_tester.test_api_endpoint(
            "/api/market/metrics",
            test_name="Dashboard - Métricas Mercado"
        )
        self.api_tester.log_result(result)
    
    def test_chat_agents_integration(self):
        """Teste da integração dos agentes via chat"""
        print("\n🤖 TESTANDO INTEGRAÇÃO DOS AGENTES VIA CHAT...")
        
        # Teste 1: Chat básico
        payload = {
            "message": "Olá, como você pode me ajudar?",
            "user_id": TEST_USER_ID
        }
        
        result = self.api_tester.test_api_endpoint(
            "/api/chat/agents",
            method="POST",
            payload=payload,
            test_name="Chat - Mensagem Básica"
        )
        self.api_tester.log_result(result)
        
        # Teste 2: Solicitação de screening
        payload = {
            "message": "Me mostre ETFs de tecnologia com baixa taxa",
            "user_id": TEST_USER_ID
        }
        
        result = self.api_tester.test_api_endpoint(
            "/api/chat/agents",
            method="POST",
            payload=payload,
            test_name="Chat - Screening via NLP"
        )
        self.api_tester.log_result(result)
        
        # Teste 3: Otimização de portfolio
        payload = {
            "message": "Crie uma carteira conservadora com R$ 50.000 para aposentadoria",
            "user_id": TEST_USER_ID
        }
        
        result = self.api_tester.test_api_endpoint(
            "/api/chat/agents",
            method="POST",
            payload=payload,
            test_name="Chat - Otimização Portfolio via NLP"
        )
        self.api_tester.log_result(result)
        
        # Teste 4: Funcionalidades específicas via PUT
        payload = {
            "action": "analyze_etf",
            "params": {
                "symbol": "VTI",
                "user_id": TEST_USER_ID
            }
        }
        
        result = self.api_tester.test_api_endpoint(
            "/api/chat/agents",
            method="PUT",
            payload=payload,
            test_name="Chat - Análise ETF Específica"
        )
        self.api_tester.log_result(result)
        
        # Teste 5: Screening via PUT
        payload = {
            "action": "screen_etfs",
            "params": {
                "criteria": {
                    "max_expense_ratio": 0.3,
                    "min_return": 5,
                    "sector": "Technology"
                },
                "user_id": TEST_USER_ID
            }
        }
        
        result = self.api_tester.test_api_endpoint(
            "/api/chat/agents",
            method="PUT",
            payload=payload,
            test_name="Chat - Screening Estruturado"
        )
        self.api_tester.log_result(result)
    
    def test_health_checks(self):
        """Teste de health checks"""
        print("\n🏥 TESTANDO HEALTH CHECKS...")
        
        # Teste 1: Health check geral
        result = self.api_tester.test_api_endpoint(
            "/api/health",
            test_name="Health Check - Geral"
        )
        self.api_tester.log_result(result)
        
        # Teste 2: Status dos agentes
        result = self.api_tester.test_api_endpoint(
            "/api/chat/agents",
            method="GET",
            test_name="Health Check - Agentes"
        )
        self.api_tester.log_result(result)
    
    def run_all_tests(self):
        """Executar todos os testes"""
        print("🚀 INICIANDO TESTES DE INTEGRAÇÃO DOS AGENTES VISTA ETF ASSISTANT")
        print("=" * 80)
        
        start_time = time.time()
        
        # Executar todos os testes
        self.test_health_checks()
        self.test_screener_api()
        self.test_portfolio_master_api()
        self.test_comparador_api()
        self.test_rankings_api()
        self.test_dashboard_apis()
        self.test_chat_agents_integration()
        
        # Relatório final
        total_time = time.time() - start_time
        self.generate_report(total_time)
    
    def generate_report(self, total_time: float):
        """Gerar relatório final dos testes"""
        print("\n" + "=" * 80)
        print("📊 RELATÓRIO FINAL DOS TESTES")
        print("=" * 80)
        
        total_tests = len(self.api_tester.results)
        passed_tests = len([r for r in self.api_tester.results if r.success])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"⏱️  Tempo Total: {total_time:.2f}s")
        print(f"🧪 Total de Testes: {total_tests}")
        print(f"✅ Testes Aprovados: {passed_tests}")
        print(f"❌ Testes Falharam: {failed_tests}")
        print(f"📈 Taxa de Sucesso: {success_rate:.1f}%")
        
        # Detalhes dos testes que falharam
        if failed_tests > 0:
            print("\n❌ TESTES QUE FALHARAM:")
            for result in self.api_tester.results:
                if not result.success:
                    print(f"   • {result.test_name} - {result.error_message}")
        
        # Tempo médio de resposta
        response_times = [r.response_time for r in self.api_tester.results if r.success]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            print(f"⚡ Tempo Médio de Resposta: {avg_response_time:.2f}s")
        
        # Recomendações
        print("\n💡 RECOMENDAÇÕES:")
        if success_rate >= 90:
            print("   🎉 Excelente! Sistema está funcionando muito bem.")
        elif success_rate >= 70:
            print("   👍 Bom! Alguns ajustes podem melhorar a estabilidade.")
        else:
            print("   ⚠️  Atenção! Várias APIs precisam de correção.")
        
        # Salvar relatório em arquivo
        self.save_report_to_file(total_time, success_rate)
    
    def save_report_to_file(self, total_time: float, success_rate: float):
        """Salvar relatório em arquivo"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"test_report_{timestamp}.json"
        
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "total_time": total_time,
            "success_rate": success_rate,
            "total_tests": len(self.api_tester.results),
            "passed_tests": len([r for r in self.api_tester.results if r.success]),
            "failed_tests": len([r for r in self.api_tester.results if not r.success]),
            "results": [
                {
                    "test_name": r.test_name,
                    "success": r.success,
                    "response_time": r.response_time,
                    "api_endpoint": r.api_endpoint,
                    "error_message": r.error_message,
                    "details": r.details
                }
                for r in self.api_tester.results
            ]
        }
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            print(f"📄 Relatório salvo em: {filename}")
        except Exception as e:
            print(f"⚠️  Erro ao salvar relatório: {e}")

def main():
    """Função principal"""
    tester = AgentIntegrationTester(BASE_URL)
    tester.run_all_tests()

if __name__ == "__main__":
    main() 