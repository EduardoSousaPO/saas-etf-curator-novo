#!/usr/bin/env python3
"""
Teste final das APIs do módulo de ações
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:3000"

def log_result(test_name, success, details):
    """Log resultado do teste"""
    status = "✅ PASS" if success else "❌ FAIL"
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {status} - {test_name}")
    if details:
        print(f"    {details}")

def test_api(endpoint, expected_fields=None):
    """Testa endpoint da API"""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if expected_fields and isinstance(data, dict):
                missing_fields = [field for field in expected_fields if field not in data]
                if missing_fields:
                    return False, f"Campos ausentes: {missing_fields}"
            
            if isinstance(data, list) and len(data) > 0:
                return True, f"Retornou {len(data)} registros"
            elif isinstance(data, dict):
                return True, f"Retornou objeto com {len(data)} campos"
            else:
                return True, "Resposta válida"
        else:
            return False, f"Status {response.status_code}: {response.text[:100]}"
            
    except Exception as e:
        return False, f"Erro: {str(e)}"

def main():
    print("🚀 TESTE FINAL DAS APIs DO MÓDULO DE AÇÕES")
    print("=" * 60)
    
    # Testes das APIs principais
    tests = [
        ("/api/stocks/screener", ["stocks", "total"]),
        ("/api/stocks/screener?sector=Technology", ["stocks", "total"]),
        ("/api/stocks/rankings", ["rankings"]),
        ("/api/stocks/comparator?symbols=AAPL,MSFT", None),
        ("/api/stocks/details/AAPL", ["ticker", "name"]),
        ("/api/stocks/details/AMD", ["ticker", "name"]),
    ]
    
    passed = 0
    total = len(tests)
    
    for endpoint, expected_fields in tests:
        success, details = test_api(endpoint, expected_fields)
        log_result(f"API {endpoint}", success, details)
        if success:
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 RESULTADO FINAL: {passed}/{total} testes passaram")
    print(f"📈 Taxa de sucesso: {passed/total*100:.1f}%")
    
    if passed == total:
        print("🎉 TODOS OS TESTES PASSARAM - MÓDULO DE AÇÕES FUNCIONAL!")
    else:
        print("⚠️  Alguns testes falharam - Verificar implementação")

if __name__ == "__main__":
    main()




