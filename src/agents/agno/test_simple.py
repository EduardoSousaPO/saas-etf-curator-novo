import os
import json
from datetime import datetime, timezone

# Configurar variáveis de ambiente
os.environ['OPENAI_API_KEY'] = 'sk-test'  # Placeholder
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'test'  # Placeholder

try:
    from VistaETFAgentSystem import VistaETFSystem
    print("✅ Import funcionou")
    
    vista_system = VistaETFSystem()
    print("✅ Sistema instanciado")
    
    result = {
        "success": True,
        "response": "Sistema funcionando corretamente",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    print("=== RESULTADO FINAL ===")
    print(json.dumps(result))
    print("=== FIM RESULTADO ===")
    
except Exception as e:
    print(f"❌ Erro: {str(e)}")
    result = {
        "success": False,
        "error": str(e),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    print("=== ERRO FINAL ===")
    print(json.dumps(result))
    print("=== FIM ERRO ===") 