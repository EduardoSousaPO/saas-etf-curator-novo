#!/usr/bin/env python3
"""
Teste para verificar se o sistema está usando dados reais do Supabase
"""

import sys
import os
import json
from datetime import datetime

# Configurar OpenAI API Key
os.environ['OPENAI_API_KEY'] = "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"

# Configurar Supabase (da mesma forma que no .env.local)
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTc3MzM5MCwiZXhwIjoyMDM3MzQ5MzkwfQ.QfKUdYwYNl0HcSr9jdEYiVlmPQJmYzYZGKWxBc9KZQY"

print("🔍 Testando dados reais do Supabase...")

try:
    from VistaETFAgentSystem import vista_etf_system
    
    # Teste específico para dados reais
    user_message = "Liste 5 ETFs americanos reais do banco de dados com seus símbolos exatos"
    user_id = "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
    
    print(f"📝 Enviando mensagem: {user_message}")
    response = vista_etf_system.chat(user_message, user_id)
    
    print("✅ Resposta do sistema:")
    print("=" * 80)
    print(response)
    print("=" * 80)
    
    # Verificar se contém ETFs americanos reais
    american_etfs = ['VTI', 'SPY', 'QQQ', 'AGG', 'BND', 'AAAU', 'ACWI']
    brazilian_etfs = ['IMAB11', 'FIXA11', 'BOVB11', 'IVVB11']
    
    has_american = any(etf in response for etf in american_etfs)
    has_brazilian = any(etf in response for etf in brazilian_etfs)
    
    print(f"\n📊 Análise da resposta:")
    print(f"✅ Contém ETFs americanos reais: {has_american}")
    print(f"❌ Contém ETFs brasileiros fictícios: {has_brazilian}")
    
    if has_american and not has_brazilian:
        print("🎉 SUCESSO: Sistema usando dados reais!")
    elif has_brazilian:
        print("❌ PROBLEMA: Sistema ainda usando dados fictícios brasileiros")
    else:
        print("⚠️ INCONCLUSIVO: Não foi possível determinar a fonte dos dados")
    
except Exception as e:
    print(f"❌ Erro no teste: {e}")
    import traceback
    traceback.print_exc() 