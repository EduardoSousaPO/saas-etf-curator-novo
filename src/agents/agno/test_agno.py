#!/usr/bin/env python3
"""
Teste básico para verificar se o sistema Agno funciona
"""

print("🔍 Testando sistema Agno...")

# Teste 1: Verificar se Agno está instalado
try:
    import agno
    print("✅ Framework Agno encontrado")
    print(f"   Versão: {getattr(agno, '__version__', 'desconhecida')}")
except ImportError as e:
    print(f"❌ Framework Agno não encontrado: {e}")
    print("   Tentando instalar Agno...")
    import subprocess
    import sys
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "agno"])
        print("✅ Agno instalado com sucesso")
        import agno
    except Exception as install_error:
        print(f"❌ Erro ao instalar Agno: {install_error}")

# Teste 2: Verificar OpenAI API Key
import os
openai_key = os.environ.get('OPENAI_API_KEY')
if openai_key:
    print(f"✅ OpenAI API Key encontrada: {openai_key[:10]}...")
else:
    print("❌ OpenAI API Key não encontrada")

# Teste 3: Tentar importar VistaETFAgentSystem
try:
    from VistaETFAgentSystem import vista_etf_system
    print("✅ VistaETFAgentSystem importado com sucesso")
    
    # Teste básico
    status = vista_etf_system.get_system_status()
    print(f"✅ Sistema status: {status}")
    
except Exception as e:
    print(f"❌ Erro ao importar VistaETFAgentSystem: {e}")
    import traceback
    traceback.print_exc()

print("🏁 Teste concluído") 