#!/usr/bin/env python3
"""
Teste Final Completo - Validação das Fases 1 e 2
Teste abrangente de todas as implementações realizadas
"""

import asyncio
import json
import time
import requests
from typing import Dict, Any, List
from dataclasses import dataclass
from datetime import datetime
import sys

# Configuração
BASE_URL = "http://localhost:3000"
TEST_USER_ID = "test_complete_implementation"

@dataclass
class TestResult:
    phase: str
    test_name: str
    success: bool
    response_time: float
    details: str
    api_endpoint: str
    error_message: str = ""

class CompleteImplementationTester:
    """Testador completo de todas as implementações"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.results: List[TestResult] = []
        self.start_time = time.time()
    
    def log_result(self, result: TestResult):
        """Registrar resultado do teste"""
        self.results.append(result)
        status = "✅ PASSOU" if result.success else "❌ FALHOU"
        print(f"{status} | {result.phase} - {result.test_name} | {result.response_time:.2f}s")
        if not result.success and result.error_message:
            print(f"   Erro: {result.error_message}")
    
    def test_request(self, phase: str, test_name: str, method: str, endpoint: str, 
                    data: Dict = None, expected_status: int = 200) -> TestResult:
        """Executar teste de requisição HTTP"""
        start_time = time.time()
        
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == 'GET':
                response = requests.get(url, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, timeout=30)
            else:
                raise ValueError(f"Método HTTP não suportado: {method}")
            
            response_time = time.time() - start_time
            success = response.status_code == expected_status
            
            details = f"Status: {response.status_code}"
            if success and response.status_code == 200:
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict):
                        details += f", Keys: {list(response_data.keys())}"
                except:
                    details += ", Non-JSON response"
            
            error_message = ""
            if not success:
                error_message = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        error_message += f": {error_data['error']}"
                except:
                    error_message += f": {response.text[:100]}"
            
            return TestResult(
                phase=phase,
                test_name=test_name,
                success=success,
                response_time=response_time,
                details=details,
                api_endpoint=endpoint,
                error_message=error_message
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            return TestResult(
                phase=phase,
                test_name=test_name,
                success=False,
                response_time=response_time,
                details="Exception occurred",
                api_endpoint=endpoint,
                error_message=str(e)
            )
    
    def run_phase_1_tests(self):
        """Executar testes da Fase 1 - Finalização"""
        print("\n🎯 EXECUTANDO TESTES DA FASE 1 - FINALIZAÇÃO")
        print("=" * 60)
        
        # 1.1 - API do Screener
        result = self.test_request(
            "FASE 1", "Screener - Filtro Básico",
            "GET", "/api/etfs/screener?search_term=technology&limit=5"
        )
        self.log_result(result)
        
        result = self.test_request(
            "FASE 1", "Screener - Filtros Avançados",
            "GET", "/api/etfs/screener?assetclass=Equity&expenseratio_max=0.5&limit=10"
        )
        self.log_result(result)
        
        # 1.2 - API do Portfolio Master
        result = self.test_request(
            "FASE 1", "Portfolio Master - Criação",
            "POST", "/api/portfolio/unified-master",
            {
                "objective": "retirement",
                "initial_amount": 50000,
                "monthly_contribution": 1000,
                "risk_profile": "conservative"
            }
        )
        self.log_result(result)
        
        # 1.3 - API do Comparador (CORRIGIDA)
        result = self.test_request(
            "FASE 1", "Comparador - Múltiplos ETFs",
            "GET", "/api/etfs/comparator?symbols=VTI,SPY"
        )
        self.log_result(result)
        
        # 1.4 - API de Rankings
        result = self.test_request(
            "FASE 1", "Rankings - Geral",
            "GET", "/api/rankings"
        )
        self.log_result(result)
        
        # 1.5 - APIs do Dashboard
        result = self.test_request(
            "FASE 1", "Dashboard - Métricas Sistema",
            "GET", "/api/analytics/system-metrics"
        )
        self.log_result(result)
        
        # 1.6 - Health Check dos Agentes (CORRIGIDO)
        result = self.test_request(
            "FASE 1", "Health Check - Agentes",
            "GET", "/api/chat/agents"
        )
        self.log_result(result)
        
        # 1.7 - Chat dos Agentes
        result = self.test_request(
            "FASE 1", "Chat - Mensagem Básica",
            "POST", "/api/chat/agents",
            {
                "message": "Olá, como você pode me ajudar?",
                "user_id": TEST_USER_ID
            }
        )
        self.log_result(result)
    
    def run_phase_2_tests(self):
        """Executar testes da Fase 2 - Implementações Futuras"""
        print("\n🔮 EXECUTANDO TESTES DA FASE 2 - IMPLEMENTAÇÕES FUTURAS")
        print("=" * 60)
        
        # 2.1 - Sistema MCP Enhanced (NOVO)
        result = self.test_request(
            "FASE 2", "MCP Enhanced - Status Conexões",
            "GET", "/api/mcp/enhanced"
        )
        self.log_result(result)
        
        # 2.2 - Teste de Performance MCP
        result = self.test_request(
            "FASE 2", "MCP Enhanced - Teste Performance",
            "PUT", "/api/mcp/enhanced?test=performance"
        )
        self.log_result(result)
        
        # 2.3 - Teste de Conectividade MCP
        result = self.test_request(
            "FASE 2", "MCP Enhanced - Teste Conectividade",
            "PUT", "/api/mcp/enhanced?test=connectivity"
        )
        self.log_result(result)
        
        # 2.4 - Teste de Health Check MCP
        result = self.test_request(
            "FASE 2", "MCP Enhanced - Health Check",
            "PUT", "/api/mcp/enhanced?test=health"
        )
        self.log_result(result)
        
        # 2.5 - Execução de Request MCP
        result = self.test_request(
            "FASE 2", "MCP Enhanced - Execução Request",
            "POST", "/api/mcp/enhanced",
            {
                "connection_id": "supabase",
                "action": "query_etfs",
                "params": {"limit": 5}
            }
        )
        self.log_result(result)
    
    def run_integration_tests(self):
        """Executar testes de integração completa"""
        print("\n🔗 EXECUTANDO TESTES DE INTEGRAÇÃO COMPLETA")
        print("=" * 60)
        
        # Integração 1: Chat → Screener
        result = self.test_request(
            "INTEGRAÇÃO", "Chat para Screener via NLP",
            "POST", "/api/chat/agents",
            {
                "message": "Me mostre ETFs de tecnologia com baixa taxa de administração",
                "user_id": TEST_USER_ID
            }
        )
        self.log_result(result)
        
        # Integração 2: Chat → Portfolio Master
        result = self.test_request(
            "INTEGRAÇÃO", "Chat para Portfolio Master",
            "POST", "/api/chat/agents",
            {
                "message": "Crie uma carteira conservadora com R$ 50.000",
                "user_id": TEST_USER_ID
            }
        )
        self.log_result(result)
        
        # Integração 3: Fluxo Completo
        result = self.test_request(
            "INTEGRAÇÃO", "Fluxo Completo - Análise ETF",
            "PUT", "/api/chat/agents",
            {
                "action": "analyze_etf",
                "params": {
                    "symbol": "VTI",
                    "user_id": TEST_USER_ID
                }
            }
        )
        self.log_result(result)
    
    def generate_final_report(self):
        """Gerar relatório final dos testes"""
        total_time = time.time() - self.start_time
        
        # Estatísticas gerais
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        avg_response_time = sum(r.response_time for r in self.results) / total_tests if total_tests > 0 else 0
        
        # Estatísticas por fase
        phase_stats = {}
        for result in self.results:
            phase = result.phase
            if phase not in phase_stats:
                phase_stats[phase] = {"total": 0, "passed": 0, "failed": 0}
            
            phase_stats[phase]["total"] += 1
            if result.success:
                phase_stats[phase]["passed"] += 1
            else:
                phase_stats[phase]["failed"] += 1
        
        print("\n" + "=" * 80)
        print("📊 RELATÓRIO FINAL - TESTE COMPLETO DE IMPLEMENTAÇÃO")
        print("=" * 80)
        print(f"⏱️  Tempo Total de Execução: {total_time:.2f}s")
        print(f"🧪 Total de Testes: {total_tests}")
        print(f"✅ Testes Aprovados: {passed_tests}")
        print(f"❌ Testes Falharam: {failed_tests}")
        print(f"📈 Taxa de Sucesso: {success_rate:.1f}%")
        print(f"⚡ Tempo Médio de Resposta: {avg_response_time:.2f}s")
        
        print("\n📋 RESULTADOS POR FASE:")
        for phase, stats in phase_stats.items():
            success_rate_phase = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
            print(f"   {phase}: {stats['passed']}/{stats['total']} ({success_rate_phase:.1f}%)")
        
        # Testes que falharam
        failed_results = [r for r in self.results if not r.success]
        if failed_results:
            print("\n❌ TESTES QUE FALHARAM:")
            for result in failed_results:
                print(f"   • {result.phase} - {result.test_name}")
                print(f"     API: {result.api_endpoint}")
                print(f"     Erro: {result.error_message}")
                print()
        
        # Recomendações
        print("\n💡 RECOMENDAÇÕES:")
        if success_rate >= 95:
            print("   🎉 Excelente! Sistema está funcionando muito bem.")
            print("   ✅ Todas as fases implementadas com sucesso.")
            print("   🚀 Pronto para produção!")
        elif success_rate >= 90:
            print("   👍 Muito bom! Pequenos ajustes podem ser necessários.")
            print("   🔧 Verificar testes que falharam.")
        elif success_rate >= 80:
            print("   ⚠️  Sistema funcional, mas precisa de melhorias.")
            print("   🔍 Investigar falhas críticas.")
        else:
            print("   🚨 Sistema precisa de atenção urgente.")
            print("   🛠️  Múltiplas correções necessárias.")
        
        # Salvar relatório
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "execution_time": total_time,
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": success_rate,
                "average_response_time": avg_response_time
            },
            "phase_statistics": phase_stats,
            "detailed_results": [
                {
                    "phase": r.phase,
                    "test_name": r.test_name,
                    "success": r.success,
                    "response_time": r.response_time,
                    "api_endpoint": r.api_endpoint,
                    "error_message": r.error_message,
                    "details": r.details
                }
                for r in self.results
            ]
        }
        
        report_filename = f"complete_implementation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Relatório completo salvo em: {report_filename}")
        
        return success_rate >= 95

def main():
    """Função principal"""
    print("🚀 INICIANDO TESTE COMPLETO DE IMPLEMENTAÇÃO - FASES 1 E 2")
    print("=" * 80)
    print("📋 Testando todas as implementações realizadas:")
    print("   • FASE 1: Finalização (100% taxa de sucesso)")
    print("   • FASE 2: Implementações Futuras (MCP Enhanced)")
    print("   • INTEGRAÇÃO: Fluxos completos end-to-end")
    print()
    
    tester = CompleteImplementationTester(BASE_URL)
    
    # Executar todos os testes
    tester.run_phase_1_tests()
    tester.run_phase_2_tests()
    tester.run_integration_tests()
    
    # Gerar relatório final
    success = tester.generate_final_report()
    
    # Código de saída
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 