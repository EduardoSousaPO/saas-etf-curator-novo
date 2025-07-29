#!/usr/bin/env python3
"""
Teste abrangente para validar diferentes cenários do sistema Vista ETF
"""

import sys
import os
import json
import asyncio
from datetime import datetime

# Configurar variáveis de ambiente
os.environ['OPENAI_API_KEY'] = "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"
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTc3MzM5MCwiZXhwIjoyMDM3MzQ5MzkwfQ.QfKUdYwYNl0HcSr9jdEYiVlmPQJmYzYZGKWxBc9KZQY"

class ComprehensiveETFTester:
    def __init__(self):
        self.user_id = "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
        self.vista_system = None
        self.test_results = []
        
    def setup(self):
        """Inicializar sistema"""
        try:
            from VistaETFAgentSystem import vista_etf_system
            self.vista_system = vista_etf_system
            print("✅ Sistema Vista carregado")
            return True
        except Exception as e:
            print(f"❌ Erro: {e}")
            return False
    
    def run_chat_test(self, name: str, query: str, expected_patterns: list, avoid_patterns: list = None):
        """Executar teste de chat com validação"""
        print(f"\n🧪 {name}")
        print(f"📝 {query}")
        print("-" * 60)
        
        try:
            response = self.vista_system.chat(query, self.user_id)
            print(f"📄 Resposta: {response[:200]}...")
            
            # Verificar padrões esperados
            found_expected = sum(1 for pattern in expected_patterns if pattern.lower() in response.lower())
            expected_score = found_expected / len(expected_patterns) if expected_patterns else 1
            
            # Verificar padrões a evitar
            avoid_patterns = avoid_patterns or []
            found_avoid = sum(1 for pattern in avoid_patterns if pattern.lower() in response.lower())
            avoid_score = 1 - (found_avoid / len(avoid_patterns)) if avoid_patterns else 1
            
            # Score final
            final_score = (expected_score + avoid_score) / 2
            success = final_score >= 0.7
            
            print(f"📊 Esperados: {found_expected}/{len(expected_patterns)}, Evitados: {found_avoid}/{len(avoid_patterns)}")
            print(f"🎯 {'✅ PASSOU' if success else '❌ FALHOU'} (Score: {final_score:.2f})")
            
            self.test_results.append({
                'name': name,
                'success': success,
                'score': final_score,
                'response_length': len(response)
            })
            
            return success
            
        except Exception as e:
            print(f"❌ Erro: {e}")
            self.test_results.append({
                'name': name,
                'success': False,
                'score': 0.0,
                'response_length': 0
            })
            return False

def main():
    """Executar testes abrangentes"""
    print("🚀 TESTES ABRANGENTES DO SISTEMA VISTA ETF")
    print("=" * 80)
    
    tester = ComprehensiveETFTester()
    
    if not tester.setup():
        print("❌ Falha no setup")
        return False
    
    # TESTE 1: Informações básicas de ETF
    tester.run_chat_test(
        "TESTE 1: Informações ETF Específico",
        "Me dê informações sobre o ETF SPY",
        expected_patterns=['SPY', 'S&P 500', 'expense', 'SPDR'],
        avoid_patterns=['IMAB11', 'FIXA11', 'BOVB11']
    )
    
    # TESTE 2: Comparação de ETFs
    tester.run_chat_test(
        "TESTE 2: Comparação de ETFs",
        "Compare SPY vs VTI",
        expected_patterns=['SPY', 'VTI', 'comparação', 'diferença'],
        avoid_patterns=['brasileiro', 'IMAB11']
    )
    
    # TESTE 3: Screening por critérios
    tester.run_chat_test(
        "TESTE 3: Screening por Critérios",
        "Liste ETFs de baixo custo (expense ratio < 0.1%)",
        expected_patterns=['expense ratio', 'baixo custo', 'VTI', 'VOO'],
        avoid_patterns=['IMAB11', 'FIXA11', 'brasileiro']
    )
    
    # TESTE 4: Análise setorial
    tester.run_chat_test(
        "TESTE 4: Análise Setorial",
        "Sugira ETFs do setor de tecnologia",
        expected_patterns=['tecnologia', 'QQQ', 'XLK', 'setor'],
        avoid_patterns=['IMAB11', 'brasileiro']
    )
    
    # TESTE 5: Educação financeira
    tester.run_chat_test(
        "TESTE 5: Educação Financeira",
        "O que é expense ratio e por que é importante?",
        expected_patterns=['expense ratio', 'taxa', 'custo', 'importante'],
        avoid_patterns=['IMAB11', 'brasileiro']
    )
    
    # TESTE 6: Carteira conservadora
    tester.run_chat_test(
        "TESTE 6: Criação de Carteira",
        "Crie uma carteira conservadora com ETFs americanos",
        expected_patterns=['carteira', 'conservadora', 'AGG', 'BND', 'diversificação'],
        avoid_patterns=['IMAB11', 'FIXA11', 'BOVB11', 'brasileiro']
    )
    
    # TESTE 7: Análise de risco
    tester.run_chat_test(
        "TESTE 7: Análise de Risco",
        "Qual ETF tem menor volatilidade: VTI ou QQQ?",
        expected_patterns=['VTI', 'QQQ', 'volatilidade', 'risco'],
        avoid_patterns=['IMAB11', 'brasileiro']
    )
    
    # TESTE 8: Dividendos
    tester.run_chat_test(
        "TESTE 8: ETFs de Dividendos",
        "Sugira ETFs com bons dividendos",
        expected_patterns=['dividendos', 'SCHD', 'VYM', 'renda'],
        avoid_patterns=['IMAB11', 'brasileiro']
    )
    
    # TESTE 9: Mercados emergentes
    tester.run_chat_test(
        "TESTE 9: Mercados Emergentes",
        "Como investir em mercados emergentes via ETFs?",
        expected_patterns=['emergentes', 'EEM', 'VWO', 'internacional'],
        avoid_patterns=['IMAB11', 'brasileiro']
    )
    
    # TESTE 10: Estratégia de investimento
    tester.run_chat_test(
        "TESTE 10: Estratégia de Investimento",
        "Qual estratégia para jovem investidor de 25 anos?",
        expected_patterns=['jovem', 'estratégia', 'longo prazo', 'crescimento'],
        avoid_patterns=['IMAB11', 'brasileiro']
    )
    
    # Gerar relatório final
    print("\n" + "=" * 80)
    print("📊 RELATÓRIO FINAL DOS TESTES ABRANGENTES")
    print("=" * 80)
    
    total_tests = len(tester.test_results)
    passed_tests = sum(1 for test in tester.test_results if test['success'])
    avg_score = sum(test['score'] for test in tester.test_results) / total_tests if total_tests > 0 else 0
    
    print(f"📈 Taxa de Sucesso: {(passed_tests/total_tests)*100:.1f}% ({passed_tests}/{total_tests})")
    print(f"📊 Score Médio: {avg_score:.2f}")
    print(f"📝 Total de Testes: {total_tests}")
    
    print("\n📋 RESULTADOS DETALHADOS:")
    for i, test in enumerate(tester.test_results, 1):
        status = "✅" if test['success'] else "❌"
        print(f"{i:2d}. {status} {test['name']} (Score: {test['score']:.2f})")
    
    print("\n🎯 AVALIAÇÃO FINAL:")
    if avg_score >= 0.8:
        print("🎉 EXCELENTE! Sistema funcionando perfeitamente com dados reais")
        result = "EXCELENTE"
    elif avg_score >= 0.6:
        print("✅ BOM! Sistema funcionando bem, pequenos ajustes necessários")
        result = "BOM"
    elif avg_score >= 0.4:
        print("⚠️ REGULAR! Sistema precisa de melhorias significativas")
        result = "REGULAR"
    else:
        print("❌ RUIM! Sistema com problemas sérios")
        result = "RUIM"
    
    # Salvar relatório
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_tests': total_tests,
        'passed_tests': passed_tests,
        'success_rate': (passed_tests/total_tests)*100,
        'average_score': avg_score,
        'evaluation': result,
        'test_results': tester.test_results
    }
    
    with open('comprehensive_test_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Relatório salvo em: comprehensive_test_report.json")
    
    return avg_score >= 0.6

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 