#!/usr/bin/env python3
"""
Teste rápido para verificar problema da segunda pergunta
"""

import sys
import os
import time

# Configurar variáveis de ambiente
os.environ['OPENAI_API_KEY'] = "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"
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTc3MzM5MCwiZXhwIjoyMDM3MzQ5MzkwfQ.QfKUdYwYNl0HcSr9jdEYiVlmPQJmYzYZGKWxBc9KZQY"

def test_quick():
    print("🔍 TESTE RÁPIDO - PROBLEMA SEGUNDA PERGUNTA")
    print("="*50)
    
    try:
        from VistaETFAgentSystem import vista_etf_system
        user_id = "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
        
        # Primeira pergunta
        print("\n1️⃣ PRIMEIRA PERGUNTA:")
        start = time.time()
        response1 = vista_etf_system.chat("Liste 2 ETFs populares", user_id)
        time1 = time.time() - start
        print(f"✅ Sucesso em {time1:.1f}s: {str(response1)[:80]}...")
        
        # Pequena pausa
        time.sleep(2)
        
        # Segunda pergunta (onde ocorria o problema)
        print("\n2️⃣ SEGUNDA PERGUNTA (TESTE CRÍTICO):")
        start = time.time()
        try:
            response2 = vista_etf_system.chat("Qual o melhor ETF tech?", user_id)
            time2 = time.time() - start
            print(f"✅ SUCESSO! Problema resolvido em {time2:.1f}s")
            print(f"📄 Resposta: {str(response2)[:80]}...")
            
            # Terceira pergunta para confirmar
            print("\n3️⃣ TERCEIRA PERGUNTA (CONFIRMAÇÃO):")
            start = time.time()
            response3 = vista_etf_system.chat("Compare VTI vs SPY", user_id)
            time3 = time.time() - start
            print(f"✅ Confirmado em {time3:.1f}s: {str(response3)[:80]}...")
            
            print(f"\n🎉 RESULTADO: PROBLEMA RESOLVIDO!")
            print(f"   Tempos: {time1:.1f}s, {time2:.1f}s, {time3:.1f}s")
            
        except Exception as e:
            time2 = time.time() - start
            print(f"❌ FALHOU após {time2:.1f}s: {e}")
            print("⚠️ PROBLEMA AINDA PERSISTE!")
            
    except Exception as e:
        print(f"❌ Erro na inicialização: {e}")

if __name__ == "__main__":
    test_quick() 