#!/usr/bin/env python3
"""
FASE 7: Testes & QA - Módulo de Ações Completo
Teste abrangente de todas as funcionalidades implementadas
"""

import requests
import json
import time
import sys
from datetime import datetime

class StocksModuleCompleteTest:
    """Teste completo do módulo de ações"""
    
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.api_base = f"{self.base_url}/api/stocks"
        self.test_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
    def log_test(self, test_name, passed, details=None):
        """Log resultado do teste"""
        self.results['total_tests'] += 1
        if passed:
            self.results['passed'] += 1
            print(f"✅ {test_name}")
        else:
            self.results['failed'] += 1
            error_msg = f"❌ {test_name}"
            if details:
                error_msg += f" - {details}"
            print(error_msg)
            self.results['errors'].append(error_msg)
            
    def test_server_health(self):
        """Teste 1: Servidor está rodando"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            self.log_test("Servidor de desenvolvimento ativo", response.status_code == 200)
        except Exception as e:
            self.log_test("Servidor de desenvolvimento ativo", False, str(e))
    
    def test_screener_api_basic(self):
        """Teste 2: API Screener - Funcionamento básico"""
        try:
            response = requests.get(f"{self.api_base}/screener?limit=10", timeout=10)
            if response.status_code == 200:
                data = response.json()
                stocks = data.get('stocks', [])
                self.log_test("Screener API - Resposta básica", len(stocks) > 0)
                self.log_test("Screener API - Estrutura de dados", 
                            'symbol' in stocks[0] if stocks else False)
            else:
                self.log_test("Screener API - Resposta básica", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_test("Screener API - Resposta básica", False, str(e))
    
    def test_screener_filters(self):
        """Teste 3: API Screener - Filtros específicos"""
        test_filters = [
            ("sector=Technology", "Filtro por setor"),
            ("market_cap_min=100", "Filtro market cap mínimo"),
            ("pe_ratio_max=30", "Filtro P/E máximo"),
            ("dividend_yield_min=2", "Filtro dividend yield"),
            ("only_complete=true", "Apenas dados completos")
        ]
        
        for filter_param, test_name in test_filters:
            try:
                response = requests.get(f"{self.api_base}/screener?{filter_param}&limit=5", timeout=10)
                self.log_test(f"Screener - {test_name}", response.status_code == 200)
            except Exception as e:
                self.log_test(f"Screener - {test_name}", False, str(e))
    
    def test_details_api(self):
        """Teste 4: API Details - Dados detalhados"""
        for symbol in self.test_symbols[:3]:  # Testar apenas 3 para velocidade
            try:
                response = requests.get(f"{self.api_base}/details/{symbol}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ['symbol', 'company_name', 'financial_data', 'performance']
                    has_required = all(field in data for field in required_fields)
                    self.log_test(f"Details API - {symbol}", has_required)
                else:
                    self.log_test(f"Details API - {symbol}", False, f"Status {response.status_code}")
            except Exception as e:
                self.log_test(f"Details API - {symbol}", False, str(e))
            time.sleep(0.5)  # Rate limiting
    
    def test_rankings_api(self):
        """Teste 5: API Rankings - Categorias"""
        try:
            # Teste todos os rankings
            response = requests.get(f"{self.api_base}/rankings?category=all&limit=5", timeout=15)
            if response.status_code == 200:
                data = response.json()
                rankings = data.get('rankings', {})
                self.log_test("Rankings API - Resposta geral", len(rankings) > 0)
                
                # Testar categorias específicas
                categories = ['best_performers', 'value_stocks', 'growth_stocks', 'dividend_champions']
                for category in categories:
                    if category in rankings:
                        stocks = rankings[category].get('stocks', [])
                        self.log_test(f"Rankings - {category}", isinstance(stocks, list))
                    else:
                        self.log_test(f"Rankings - {category}", False, "Categoria não encontrada")
            else:
                self.log_test("Rankings API - Resposta geral", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_test("Rankings API - Resposta geral", False, str(e))
    
    def test_comparator_api(self):
        """Teste 6: API Comparator - Comparação múltipla"""
        try:
            symbols = ','.join(self.test_symbols[:3])
            response = requests.get(f"{self.api_base}/comparator?symbols={symbols}", timeout=15)
            if response.status_code == 200:
                data = response.json()
                stocks = data.get('stocks', [])
                summary = data.get('summary', {})
                comparison_stats = data.get('comparison_stats', {})
                
                self.log_test("Comparator API - Múltiplas ações", len(stocks) == 3)
                self.log_test("Comparator API - Estatísticas comparativas", bool(comparison_stats))
                self.log_test("Comparator API - Resumo", bool(summary))
            else:
                self.log_test("Comparator API - Múltiplas ações", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_test("Comparator API - Múltiplas ações", False, str(e))
    
    def test_data_quality(self):
        """Teste 7: Qualidade dos dados"""
        try:
            response = requests.get(f"{self.api_base}/screener?limit=20", timeout=10)
            if response.status_code == 200:
                data = response.json()
                stocks = data.get('stocks', [])
                
                if stocks:
                    # Verificar campos essenciais
                    essential_fields = ['symbol', 'company_name', 'sector', 'stock_price']
                    complete_stocks = 0
                    
                    for stock in stocks:
                        if all(field in stock and stock[field] is not None for field in essential_fields):
                            complete_stocks += 1
                    
                    completeness = (complete_stocks / len(stocks)) * 100
                    self.log_test("Qualidade dos dados - Campos essenciais", completeness >= 70)
                    self.log_test("Qualidade dos dados - Dados financeiros", 
                                any(stock.get('market_cap') for stock in stocks))
                else:
                    self.log_test("Qualidade dos dados - Campos essenciais", False, "Nenhum dado encontrado")
            else:
                self.log_test("Qualidade dos dados - Campos essenciais", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_test("Qualidade dos dados - Campos essenciais", False, str(e))
    
    def test_performance(self):
        """Teste 8: Performance das APIs"""
        performance_tests = [
            (f"{self.api_base}/screener?limit=10", "Screener", 3.0),
            (f"{self.api_base}/details/AAPL", "Details", 2.0),
            (f"{self.api_base}/rankings?category=best_performers&limit=5", "Rankings", 3.0),
        ]
        
        for url, test_name, max_time in performance_tests:
            try:
                start_time = time.time()
                response = requests.get(url, timeout=max_time + 1)
                end_time = time.time()
                
                response_time = end_time - start_time
                passed = response.status_code == 200 and response_time <= max_time
                
                details = f"{response_time:.2f}s (max: {max_time}s)" if not passed else f"{response_time:.2f}s"
                self.log_test(f"Performance - {test_name}", passed, details if not passed else None)
            except Exception as e:
                self.log_test(f"Performance - {test_name}", False, str(e))
    
    def test_error_handling(self):
        """Teste 9: Tratamento de erros"""
        error_tests = [
            (f"{self.api_base}/details/INVALID_SYMBOL", "Símbolo inválido", 404),
            (f"{self.api_base}/comparator?symbols=", "Parâmetros vazios", 400),
            (f"{self.api_base}/rankings?category=invalid", "Categoria inválida", 400),
        ]
        
        for url, test_name, expected_status in error_tests:
            try:
                response = requests.get(url, timeout=10)
                self.log_test(f"Error Handling - {test_name}", response.status_code == expected_status)
            except Exception as e:
                self.log_test(f"Error Handling - {test_name}", False, str(e))
    
    def test_data_consistency(self):
        """Teste 10: Consistência dos dados"""
        try:
            # Buscar mesma ação em diferentes endpoints
            symbol = 'AAPL'
            
            # Via screener
            screener_response = requests.get(f"{self.api_base}/screener?search_term={symbol}&limit=1", timeout=10)
            
            # Via details
            details_response = requests.get(f"{self.api_base}/details/{symbol}", timeout=10)
            
            if screener_response.status_code == 200 and details_response.status_code == 200:
                screener_data = screener_response.json()
                details_data = details_response.json()
                
                screener_stocks = screener_data.get('stocks', [])
                if screener_stocks:
                    screener_stock = screener_stocks[0]
                    
                    # Verificar consistência
                    consistent_symbol = screener_stock.get('symbol') == details_data.get('symbol')
                    consistent_name = screener_stock.get('company_name') == details_data.get('company_name')
                    
                    self.log_test("Consistência - Símbolo", consistent_symbol)
                    self.log_test("Consistência - Nome da empresa", consistent_name)
                else:
                    self.log_test("Consistência - Dados encontrados", False, "Nenhum dado no screener")
            else:
                self.log_test("Consistência - APIs funcionais", False, "Erro nas APIs")
        except Exception as e:
            self.log_test("Consistência - Teste geral", False, str(e))
    
    def generate_report(self):
        """Gerar relatório final"""
        print("\n" + "="*60)
        print("📊 RELATÓRIO FINAL - TESTE MÓDULO DE AÇÕES")
        print("="*60)
        
        print(f"🧪 Total de testes: {self.results['total_tests']}")
        print(f"✅ Testes aprovados: {self.results['passed']}")
        print(f"❌ Testes falharam: {self.results['failed']}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"📈 Taxa de sucesso: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 MÓDULO APROVADO - Qualidade Excelente!")
        elif success_rate >= 75:
            print("✅ MÓDULO APROVADO - Qualidade Boa")
        elif success_rate >= 60:
            print("⚠️ MÓDULO PARCIALMENTE APROVADO - Necessita melhorias")
        else:
            print("❌ MÓDULO REPROVADO - Muitos problemas encontrados")
        
        if self.results['errors']:
            print("\n🔍 ERROS ENCONTRADOS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        print("\n" + "="*60)
        print(f"⏰ Teste concluído em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
    
    def run_all_tests(self):
        """Executar todos os testes"""
        print("🧪 INICIANDO TESTES COMPLETOS DO MÓDULO DE AÇÕES")
        print("="*60)
        print("⏳ Aguardando servidor estabilizar...")
        time.sleep(3)
        
        # Executar todos os testes
        self.test_server_health()
        self.test_screener_api_basic()
        self.test_screener_filters()
        self.test_details_api()
        self.test_rankings_api()
        self.test_comparator_api()
        self.test_data_quality()
        self.test_performance()
        self.test_error_handling()
        self.test_data_consistency()
        
        # Gerar relatório
        self.generate_report()
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = StocksModuleCompleteTest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)




