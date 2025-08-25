#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Teste do Module Selector - Alternância ETFs ↔ Stocks
Valida se a navegação entre módulos está funcionando corretamente
"""

import requests
import time
import json
from datetime import datetime

def test_module_selector():
    """Testa o Module Selector e navegação entre módulos"""
    
    print("🧪 TESTE DO MODULE SELECTOR - ALTERNÂNCIA ETFs ↔ Stocks")
    print("=" * 60)
    
    base_url = "http://localhost:3000"
    results = {
        "tests": [],
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    def test_endpoint(name, url, expected_status=200):
        """Testa um endpoint e registra o resultado"""
        try:
            response = requests.get(f"{base_url}{url}", timeout=10)
            success = response.status_code == expected_status
            
            test_result = {
                "name": name,
                "url": url,
                "status": response.status_code,
                "success": success,
                "response_time": response.elapsed.total_seconds()
            }
            
            results["tests"].append(test_result)
            results["total"] += 1
            
            if success:
                results["passed"] += 1
                print(f"✅ {name}")
            else:
                results["failed"] += 1
                print(f"❌ {name} - Status {response.status_code}")
                
            return success, response
            
        except Exception as e:
            print(f"❌ {name} - Erro: {str(e)}")
            results["tests"].append({
                "name": name,
                "url": url,
                "status": 0,
                "success": False,
                "error": str(e)
            })
            results["total"] += 1
            results["failed"] += 1
            return False, None
    
    print("⏳ Aguardando servidor estabilizar...")
    time.sleep(2)
    
    # Testar páginas principais dos dois módulos
    print("\n🔍 TESTANDO PÁGINAS PRINCIPAIS")
    print("-" * 30)
    
    # Módulo ETFs (existente)
    test_endpoint("Dashboard Principal", "/dashboard")
    test_endpoint("ETFs - Screener", "/screener")
    test_endpoint("ETFs - Rankings", "/rankings")
    test_endpoint("ETFs - Portfolio Master", "/portfolio-master")
    test_endpoint("ETFs - Comparador", "/comparador")
    
    # Módulo Stocks (novo)
    test_endpoint("Stocks - Página Principal", "/stocks")
    test_endpoint("Stocks - Screener", "/stocks/screener")
    test_endpoint("Stocks - Rankings", "/stocks/rankings")
    
    print("\n🔍 TESTANDO APIs DOS MÓDULOS")
    print("-" * 30)
    
    # APIs ETFs (verificar se ainda funcionam)
    test_endpoint("API ETFs - Screener", "/api/etfs/screener?limit=5")
    test_endpoint("API ETFs - Rankings", "/api/etfs/rankings")
    
    # APIs Stocks (novas)
    test_endpoint("API Stocks - Screener", "/api/stocks/screener?limit=5")
    test_endpoint("API Stocks - Rankings", "/api/stocks/rankings")
    test_endpoint("API Stocks - Details AAPL", "/api/stocks/details/AAPL")
    test_endpoint("API Stocks - Comparator", "/api/stocks/comparator?symbols=AAPL,MSFT")
    
    print("\n🔍 TESTANDO FUNCIONALIDADES ESPECÍFICAS")
    print("-" * 30)
    
    # Testar filtros específicos de stocks
    success, response = test_endpoint("Stocks - Filtro Setor", "/api/stocks/screener?sector=Technology&limit=3")
    if success and response:
        try:
            data = response.json()
            if 'stocks' in data and len(data['stocks']) > 0:
                print(f"  ✅ Retornou {len(data['stocks'])} ações do setor Technology")
            else:
                print("  ⚠️ Nenhuma ação retornada para filtro de setor")
        except:
            pass
    
    # Testar rankings específicos de stocks
    success, response = test_endpoint("Stocks - Ranking Best Performers", "/api/stocks/rankings?category=best_performers")
    if success and response:
        try:
            data = response.json()
            if 'rankings' in data and 'stocks' in data['rankings']:
                print(f"  ✅ Ranking retornou {len(data['rankings']['stocks'])} ações")
            else:
                print("  ⚠️ Ranking não retornou dados esperados")
        except:
            pass
    
    print("\n🔍 VALIDAÇÃO DE DADOS")
    print("-" * 30)
    
    # Verificar se temos dados suficientes
    success, response = test_endpoint("Contagem Stocks", "/api/stocks/screener?limit=1")
    if success and response:
        try:
            data = response.json()
            total_count = data.get('totalCount', 0)
            print(f"  📊 Total de ações disponíveis: {total_count}")
            
            if total_count >= 10:
                print("  ✅ Dataset adequado para testes")
                results["passed"] += 1
            else:
                print("  ⚠️ Dataset pequeno - considere aplicar mais dados")
                results["failed"] += 1
            results["total"] += 1
            
        except Exception as e:
            print(f"  ❌ Erro ao verificar contagem: {e}")
            results["failed"] += 1
            results["total"] += 1
    
    # Relatório final
    print("\n" + "=" * 60)
    print("📊 RELATÓRIO FINAL - TESTE MODULE SELECTOR")
    print("=" * 60)
    print(f"🧪 Total de testes: {results['total']}")
    print(f"✅ Testes aprovados: {results['passed']}")
    print(f"❌ Testes falharam: {results['failed']}")
    
    success_rate = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
    print(f"📈 Taxa de sucesso: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 MODULE SELECTOR APROVADO - Qualidade Excelente!")
        status = "APROVADO"
    elif success_rate >= 75:
        print("⚠️ MODULE SELECTOR PARCIALMENTE APROVADO - Necessita melhorias")
        status = "PARCIAL"
    else:
        print("❌ MODULE SELECTOR REPROVADO - Muitos problemas encontrados")
        status = "REPROVADO"
    
    # Erros encontrados
    if results['failed'] > 0:
        print(f"\n🔍 ERROS ENCONTRADOS:")
        for test in results['tests']:
            if not test['success']:
                error_msg = test.get('error', f"Status {test['status']}")
                print(f"  • ❌ {test['name']} - {error_msg}")
    
    print("\n" + "=" * 60)
    print(f"⏰ Teste concluído em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    return status, results

if __name__ == "__main__":
    test_module_selector()



