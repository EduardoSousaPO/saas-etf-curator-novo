#!/usr/bin/env python3
"""
Teste específico para verificar se o problema de timeout após a segunda pergunta foi corrigido
"""

import sys
import os
import json
import asyncio
import time
from datetime import datetime

# Configurar variáveis de ambiente
os.environ['OPENAI_API_KEY'] = "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"
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTc3MzM5MCwiZXhwIjoyMDM3MzQ5MzkwfQ.QfKUdYwYNl0HcSr9jdEYiVlmPQJmYzYZGKWxBc9KZQY"

class TimeoutFixTester:
    def __init__(self):
        self.user_id = "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
        self.vista_system = None
    
    def initialize_system(self):
        """Inicializar o sistema Vista"""
        try:
            from VistaETFAgentSystem import vista_etf_system
            self.vista_system = vista_etf_system
            print("✅ Sistema Vista inicializado com sucesso")
            return True
        except Exception as e:
            print(f"❌ Erro ao inicializar sistema: {e}")
            return False
    
    def test_single_interaction(self, message: str, test_name: str):
        """Testar uma única interação"""
        print(f"\n🧪 {test_name}")
        print(f"📝 Pergunta: {message}")
        
        start_time = time.time()
        
        try:
            response = self.vista_system.chat(message, self.user_id)
            duration = time.time() - start_time
            
            print(f"⏱️ Tempo de resposta: {duration:.2f}s")
            print(f"📄 Resposta ({len(str(response))} chars): {str(response)[:100]}...")
            
            if duration > 25:
                print("⚠️ AVISO: Resposta demorou mais que 25s")
            else:
                print("✅ Resposta dentro do tempo esperado")
                
            return True, duration
            
        except Exception as e:
            duration = time.time() - start_time
            print(f"❌ ERRO após {duration:.2f}s: {e}")
            return False, duration
    
    def test_sequential_interactions(self):
        """Testar múltiplas interações sequenciais (onde o problema ocorria)"""
        print("\n" + "="*80)
        print("🎯 TESTE SEQUENCIAL - VERIFICANDO PROBLEMA DE TIMEOUT")
        print("="*80)
        
        interactions = [
            ("Liste 3 ETFs americanos populares", "Primeira pergunta"),
            ("Qual é o melhor ETF de tecnologia?", "Segunda pergunta (onde falhava)"),
            ("Compare VTI e SPY", "Terceira pergunta"),
            ("Recomende ETFs para aposentadoria", "Quarta pergunta")
        ]
        
        results = []
        
        for i, (message, test_name) in enumerate(interactions, 1):
            print(f"\n{'='*20} INTERAÇÃO {i}/4 {'='*20}")
            
            success, duration = self.test_single_interaction(message, test_name)
            results.append({
                'interaction': i,
                'test_name': test_name,
                'success': success,
                'duration': duration,
                'message': message
            })
            
            # Pequena pausa entre interações
            time.sleep(1)
        
        return results
    
    def analyze_results(self, results):
        """Analisar os resultados dos testes"""
        print("\n" + "="*80)
        print("📊 ANÁLISE DOS RESULTADOS")
        print("="*80)
        
        successful = [r for r in results if r['success']]
        failed = [r for r in results if not r['success']]
        
        print(f"✅ Sucessos: {len(successful)}/{len(results)}")
        print(f"❌ Falhas: {len(failed)}/{len(results)}")
        
        if len(successful) > 0:
            avg_duration = sum(r['duration'] for r in successful) / len(successful)
            max_duration = max(r['duration'] for r in successful)
            print(f"⏱️ Tempo médio (sucessos): {avg_duration:.2f}s")
            print(f"⏱️ Tempo máximo: {max_duration:.2f}s")
        
        print("\n📋 DETALHES POR INTERAÇÃO:")
        for r in results:
            status = "✅" if r['success'] else "❌"
            print(f"{status} Interação {r['interaction']}: {r['test_name']} - {r['duration']:.2f}s")
        
        # Análise específica do problema original
        if len(results) >= 2:
            second_interaction = results[1]  # Segunda pergunta (onde falhava)
            
            print(f"\n🎯 ANÁLISE ESPECÍFICA - SEGUNDA PERGUNTA:")
            if second_interaction['success']:
                print("✅ PROBLEMA RESOLVIDO! Segunda pergunta funcionou corretamente")
                print(f"   Tempo: {second_interaction['duration']:.2f}s")
            else:
                print("❌ PROBLEMA PERSISTE! Segunda pergunta ainda falha")
                print(f"   Falhou após: {second_interaction['duration']:.2f}s")
        
        # Conclusão geral
        print(f"\n🏁 CONCLUSÃO GERAL:")
        if len(failed) == 0:
            print("🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente")
        elif len(failed) == 1 and failed[0]['interaction'] == 2:
            print("⚠️ PROBLEMA ESPECÍFICO: Apenas segunda pergunta falha (problema original)")
        else:
            print(f"❌ MÚLTIPLOS PROBLEMAS: {len(failed)} interações falharam")
        
        return len(failed) == 0

async def main():
    """Função principal do teste"""
    print("🔍 TESTE DE CORREÇÃO DE TIMEOUT - CHAT IA")
    print("Verificando se o problema de timeout após a segunda pergunta foi corrigido")
    print("="*80)
    
    tester = TimeoutFixTester()
    
    # Inicializar sistema
    if not tester.initialize_system():
        print("❌ Falha na inicialização. Abortando testes.")
        return
    
    # Executar testes sequenciais
    results = tester.test_sequential_interactions()
    
    # Analisar resultados
    all_passed = tester.analyze_results(results)
    
    print("\n" + "="*80)
    if all_passed:
        print("🎉 TESTE CONCLUÍDO COM SUCESSO!")
        print("✅ Problema de timeout foi corrigido")
    else:
        print("❌ TESTE FALHOU!")
        print("⚠️ Problema de timeout ainda persiste")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(main()) 