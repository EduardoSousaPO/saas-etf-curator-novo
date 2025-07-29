#!/usr/bin/env python3
"""
Teste para simular a chamada da API de chat
"""

import sys
import os
import json
from datetime import datetime

# Configurar OpenAI API Key
os.environ['OPENAI_API_KEY'] = "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"

print("🔍 Testando chat com OpenAI API Key...")

try:
    from VistaETFAgentSystem import vista_etf_system
    
    # Teste de chat
    user_message = "Crie uma carteira conservadora com R$ 100.000"
    user_id = "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
    
    print(f"📝 Enviando mensagem: {user_message}")
    response = vista_etf_system.chat(user_message, user_id)
    
    # Retornar resposta estruturada
    result = {
        "success": True,
        "response": str(response),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    print("✅ Resposta do sistema:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
except Exception as e:
    error_result = {
        "success": False,
        "error": f"Erro no chat: {str(e)}",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    print("❌ Erro:")
    print(json.dumps(error_result, indent=2, ensure_ascii=False))
    import traceback
    traceback.print_exc() 