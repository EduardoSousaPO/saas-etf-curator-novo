#!/usr/bin/env python3
"""
Testes avançados para validar se o sistema Agno está funcionando com dados reais
"""

import sys
import os
import json
import asyncio
from datetime import datetime

# Configurar variáveis de ambiente
os.environ['OPENAI_API_KEY'] = "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"
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTc3MzM5MCwiZXhwIjoyMDM3MzQ5MzkwfQ.QfKUdYwYNl0HcSr9jdEYiVlmPQJmYzYZGKWxBc9KZQY"

class AdvancedETFTester:
    def __init__(self):
        self.user_id = "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
        self.vista_system = None
        self.test_results = []
        
    def setup(self):
        """Inicializar o sistema Vista"""
        try:
            from VistaETFAgentSystem import vista_etf_system
            self.vista_system = vista_etf_system
            print("✅ Sistema Vista carregado com sucesso")
            return True
        except Exception as e:
            print(f"❌ Erro ao carregar sistema Vista: {e}")
            return False
    
    def run_test(self, test_name: str, query: str, validation_func):
        """Executar um teste e validar resultado"""
        print(f"\n🧪 TESTE: {test_name}")
        print(f"📝 Query: {query}")
        print("-" * 80)
        
        try:
            response = self.vista_system.chat(query, self.user_id)
            print(f"📄 Resposta:\n{response[:500]}{'...' if len(response) > 500 else ''}")
            
            # Executar validação
            result = validation_func(response)
            
            self.test_results.append({
                'test': test_name,
                'query': query,
                'success': result['success'],
                'details': result['details'],
                'response_length': len(response)
            })
            
            status = "✅ PASSOU" if result['success'] else "❌ FALHOU"
            print(f"\n{status}: {result['details']}")
            
        except Exception as e:
            print(f"❌ ERRO: {e}")
            self.test_results.append({
                'test': test_name,
                'query': query,
                'success': False,
                'details': f"Erro: {e}",
                'response_length': 0
            })
    
    def test_1_specific_etf_data(self):
        """Teste 1: Dados específicos de ETF conhecido"""
        def validate(response):
            # Verificar se contém dados específicos do VTI
            indicators = [
                'VTI',
                'Vanguard',
                'Total Stock Market',
                '0.03',  # Expense ratio típico do VTI
                'expense'
            ]
            
            found = sum(1 for indicator in indicators if indicator.lower() in response.lower())
            success = found >= 3
            
            return {
                'success': success,
                'details': f"Encontrou {found}/5 indicadores específicos do VTI"
            }
        
        self.run_test(
            "Dados Específicos ETF (VTI)",
            "Me dê informações detalhadas sobre o ETF VTI, incluindo expense ratio e nome completo",
            validate
        )
    
    def test_2_screening_filters(self):
        """Teste 2: Screening com filtros específicos"""
        def validate(response):
            # Verificar se aplicou filtros corretamente
            indicators = [
                'expense ratio',
                '0.5%',
                'baixo custo',
                'filtro',
                'critério'
            ]
            
            # Verificar se não contém ETFs brasileiros
            brazilian_etfs = ['IMAB11', 'FIXA11', 'BOVB11', 'IVVB11']
            has_brazilian = any(etf in response for etf in brazilian_etfs)
            
            # Verificar se contém ETFs americanos
            american_etfs = ['VTI', 'SPY', 'QQQ', 'AGG', 'BND', 'SCHD', 'VYM']
            has_american = any(etf in response for etf in american_etfs)
            
            found_indicators = sum(1 for indicator in indicators if indicator.lower() in response.lower())
            
            success = found_indicators >= 2 and has_american and not has_brazilian
            
            return {
                'success': success,
                'details': f"Indicadores: {found_indicators}/5, ETFs americanos: {has_american}, ETFs brasileiros: {has_brazilian}"
            }
        
        self.run_test(
            "Screening com Filtros",
            "Liste ETFs com expense ratio menor que 0.5% e ordene por melhor performance",
            validate
        )
    
    def test_3_portfolio_optimization(self):
        """Teste 3: Otimização de carteira"""
        def validate(response):
            # Verificar elementos de otimização
            optimization_terms = [
                'carteira',
                'alocação',
                'diversificação',
                'risco',
                'retorno',
                'markowitz',
                'conservador'
            ]
            
            # Verificar se sugere ETFs reais
            real_etfs = ['VTI', 'SPY', 'QQQ', 'AGG', 'BND', 'SCHD', 'VYM', 'IWM']
            has_real_etfs = any(etf in response for etf in real_etfs)
            
            # Verificar se não sugere ETFs brasileiros fictícios
            fake_etfs = ['IMAB11', 'FIXA11', 'BOVB11', 'IVVB11']
            has_fake_etfs = any(etf in response for etf in fake_etfs)
            
            found_terms = sum(1 for term in optimization_terms if term.lower() in response.lower())
            
            success = found_terms >= 4 and has_real_etfs and not has_fake_etfs
            
            return {
                'success': success,
                'details': f"Termos otimização: {found_terms}/7, ETFs reais: {has_real_etfs}, ETFs fictícios: {has_fake_etfs}"
            }
        
        self.run_test(
            "Otimização de Carteira",
            "Crie uma carteira conservadora de R$ 50.000 usando dados reais do banco",
            validate
        )
    
    def test_4_comparison_analysis(self):
        """Teste 4: Comparação entre ETFs"""
        def validate(response):
            # Verificar se compara corretamente
            comparison_terms = [
                'comparação',
                'versus',
                'diferença',
                'expense ratio',
                'performance',
                'volatilidade'
            ]
            
            # Verificar se menciona os ETFs solicitados
            requested_etfs = ['VTI', 'SPY']
            has_requested = all(etf in response for etf in requested_etfs)
            
            found_terms = sum(1 for term in comparison_terms if term.lower() in response.lower())
            
            success = found_terms >= 3 and has_requested
            
            return {
                'success': success,
                'details': f"Termos comparação: {found_terms}/6, ETFs solicitados: {has_requested}"
            }
        
        self.run_test(
            "Comparação de ETFs",
            "Compare VTI vs SPY usando dados reais, focando em expense ratio e performance",
            validate
        )
    
    def test_5_sector_analysis(self):
        """Teste 5: Análise setorial"""
        def validate(response):
            # Verificar análise setorial
            sector_terms = [
                'tecnologia',
                'setor',
                'análise',
                'tendência',
                'oportunidade'
            ]
            
            # Verificar se sugere ETFs de tecnologia reais
            tech_etfs = ['QQQ', 'XLK', 'VGT', 'FTEC']
            has_tech_etfs = any(etf in response for etf in tech_etfs)
            
            found_terms = sum(1 for term in sector_terms if term.lower() in response.lower())
            
            success = found_terms >= 3 and has_tech_etfs
            
            return {
                'success': success,
                'details': f"Termos setoriais: {found_terms}/5, ETFs tech: {has_tech_etfs}"
            }
        
        self.run_test(
            "Análise Setorial",
            "Analise o setor de tecnologia e sugira ETFs relevantes com dados reais",
            validate
        )
    
    def test_6_data_consistency(self):
        """Teste 6: Consistência dos dados"""
        def validate(response):
            # Verificar se não inventa dados
            suspicious_patterns = [
                'IMAB11',
                'FIXA11', 
                'BOVB11',
                'IVVB11',
                'SMAL11',
                'HFOF11',
                'Tesouro IPCA',
                'iShares IBoxx Corporate'
            ]
            
            # Verificar se usa dados reais
            real_patterns = [
                'dados reais',
                'banco de dados',
                'informações atualizadas',
                'base de dados'
            ]
            
            has_suspicious = any(pattern in response for pattern in suspicious_patterns)
            has_real_indicators = any(pattern.lower() in response.lower() for pattern in real_patterns)
            
            success = not has_suspicious and has_real_indicators
            
            return {
                'success': success,
                'details': f"Padrões suspeitos: {has_suspicious}, Indicadores reais: {has_real_indicators}"
            }
        
        self.run_test(
            "Consistência de Dados",
            "Me explique como você acessa os dados de ETFs e garanta que são dados reais",
            validate
        )
    
    async def test_7_mcp_integration(self):
        """Teste 7: Integração MCP direta"""
        print(f"\n🧪 TESTE: Integração MCP Direta")
        print("-" * 80)
        
        try:
            from MCPRealImplementation import mcp_supabase, get_etf_data, screen_etfs
            
            # Teste 1: Buscar ETF específico
            print("📝 Testando get_etf_data('VTI')...")
            vti_data = await get_etf_data('VTI')
            print(f"✅ VTI data: {vti_data}")
            
            # Teste 2: Screening
            print("\n📝 Testando screen_etfs com filtros...")
            screening_results = await screen_etfs({
                'max_expense_ratio': 0.5,
                'limit': 5
            })
            print(f"✅ Screening: {len(screening_results)} ETFs encontrados")
            for etf in screening_results[:3]:
                print(f"   - {etf.get('symbol', 'N/A')}: {etf.get('name', 'N/A')}")
            
            # Teste 3: Query SQL direta
            print("\n📝 Testando query SQL direta...")
            sql_results = await mcp_supabase.execute_sql_query(
                "SELECT symbol, name, expense_ratio FROM etfs_ativos_reais LIMIT 5"
            )
            print(f"✅ SQL Query: {len(sql_results)} resultados")
            for etf in sql_results:
                print(f"   - {etf.get('symbol', 'N/A')}: {etf.get('expense_ratio', 'N/A')}%")
            
            self.test_results.append({
                'test': 'Integração MCP Direta',
                'query': 'Testes assíncronos MCP',
                'success': len(vti_data) > 0 and len(screening_results) > 0 and len(sql_results) > 0,
                'details': f"VTI: {len(vti_data)} campos, Screening: {len(screening_results)} ETFs, SQL: {len(sql_results)} resultados",
                'response_length': 0
            })
            
        except Exception as e:
            print(f"❌ Erro no teste MCP: {e}")
            import traceback
            traceback.print_exc()
            
            self.test_results.append({
                'test': 'Integração MCP Direta',
                'query': 'Testes assíncronos MCP',
                'success': False,
                'details': f"Erro: {e}",
                'response_length': 0
            })
    
    def generate_report(self):
        """Gerar relatório final dos testes"""
        print("\n" + "="*80)
        print("📊 RELATÓRIO FINAL DOS TESTES AVANÇADOS")
        print("="*80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for test in self.test_results if test['success'])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📈 Taxa de Sucesso: {success_rate:.1f}% ({passed_tests}/{total_tests})")
        print(f"📝 Total de Testes: {total_tests}")
        print(f"✅ Testes Aprovados: {passed_tests}")
        print(f"❌ Testes Falharam: {total_tests - passed_tests}")
        
        print("\n📋 DETALHES POR TESTE:")
        for i, test in enumerate(self.test_results, 1):
            status = "✅" if test['success'] else "❌"
            print(f"{i}. {status} {test['test']}")
            print(f"   {test['details']}")
        
        print("\n🎯 CONCLUSÃO:")
        if success_rate >= 80:
            print("🎉 SISTEMA FUNCIONANDO EXCELENTEMENTE com dados reais!")
        elif success_rate >= 60:
            print("⚠️ Sistema funcionando BEM, mas precisa de alguns ajustes")
        else:
            print("❌ Sistema com PROBLEMAS SÉRIOS - requer correções")
        
        # Salvar relatório em arquivo
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'success_rate': success_rate,
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': total_tests - passed_tests,
            'test_results': self.test_results
        }
        
        with open('advanced_test_report.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório salvo em: advanced_test_report.json")
        
        return success_rate

async def main():
    """Função principal para executar todos os testes"""
    print("🚀 INICIANDO TESTES AVANÇADOS DO SISTEMA VISTA ETF")
    print("="*80)
    
    tester = AdvancedETFTester()
    
    # Setup
    if not tester.setup():
        print("❌ Falha no setup - encerrando testes")
        return
    
    # Executar testes síncronos
    print("\n🔄 EXECUTANDO TESTES SÍNCRONOS...")
    tester.test_1_specific_etf_data()
    tester.test_2_screening_filters()
    tester.test_3_portfolio_optimization()
    tester.test_4_comparison_analysis()
    tester.test_5_sector_analysis()
    tester.test_6_data_consistency()
    
    # Executar testes assíncronos
    print("\n🔄 EXECUTANDO TESTES ASSÍNCRONOS...")
    await tester.test_7_mcp_integration()
    
    # Gerar relatório final
    success_rate = tester.generate_report()
    
    return success_rate

if __name__ == "__main__":
    # Executar testes
    success_rate = asyncio.run(main())
    
    # Exit code baseado no sucesso
    exit_code = 0 if success_rate >= 80 else 1
    exit(exit_code) 