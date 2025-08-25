#!/usr/bin/env python3
"""
Executor via API REST do Supabase
Aplica dados usando requisições HTTP diretas
"""

import json
import time
import requests
from datetime import datetime

class SupabaseAPIExecutor:
    def __init__(self):
        self.start_time = datetime.now()
        self.execution_log = []
        
        # Configurações da API Supabase
        self.base_url = "https://kpjbshzqpqnbdxvtgzau.supabase.co"
        self.api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwamJzaHpxcHFuYmR4dnRnemF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NTI1NzYsImV4cCI6MjA1MTUyODU3Nn0.4lJhxnOPJCGJXhTCECOKFOxgdZdXQhwKLNWKPGJGGJE"
        
        self.headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
    def log_event(self, event_type, message, data=None):
        """Registra eventos da execução"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'elapsed_seconds': (datetime.now() - self.start_time).total_seconds(),
            'type': event_type,
            'message': message,
            'data': data or {}
        }
        self.execution_log.append(event)
        print(f"[{event['elapsed_seconds']:.1f}s] {event_type}: {message}")
        
    def test_api_connection(self):
        """Testa conexão com a API Supabase"""
        self.log_event("API_TEST", "Testando conexão com API Supabase")
        
        try:
            # Testar com query simples
            url = f"{self.base_url}/rest/v1/stocks_ativos_reais"
            params = {"select": "count", "limit": 1}
            
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            
            if response.status_code == 200:
                self.log_event("API_SUCCESS", "✅ Conexão API OK")
                return True
            else:
                self.log_event("API_ERROR", f"❌ Erro API: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_event("API_ERROR", f"❌ Erro conexão: {str(e)}")
            return False
            
    def get_current_stock_count(self):
        """Obtém contagem atual de ações"""
        try:
            url = f"{self.base_url}/rest/v1/stocks_ativos_reais"
            params = {"select": "ticker", "limit": 1000}
            
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data)
                self.log_event("COUNT_SUCCESS", f"📊 Contagem atual: {count} ações")
                return count
            else:
                self.log_event("COUNT_ERROR", f"❌ Erro contagem: {response.status_code}")
                return None
                
        except Exception as e:
            self.log_event("COUNT_ERROR", f"❌ Erro: {str(e)}")
            return None
            
    def insert_assets_batch(self, assets_data):
        """Insere lote de assets via API"""
        self.log_event("INSERT_ASSETS", f"Inserindo {len(assets_data)} assets")
        
        try:
            url = f"{self.base_url}/rest/v1/assets_master"
            
            response = requests.post(url, headers=self.headers, json=assets_data, timeout=60)
            
            if response.status_code in [200, 201]:
                self.log_event("INSERT_SUCCESS", f"✅ {len(assets_data)} assets inseridos")
                return True
            else:
                self.log_event("INSERT_ERROR", f"❌ Erro inserção: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_event("INSERT_ERROR", f"❌ Erro: {str(e)}")
            return False
            
    def create_sample_batch(self, batch_size=10):
        """Cria lote de exemplo para teste"""
        assets = []
        
        for i in range(batch_size):
            asset = {
                "ticker": f"TEST{i:03d}",
                "asset_type": "STOCK",
                "name": f"Test Corporation {i:03d}",
                "exchange": "NASDAQ",
                "sector": "Technology",
                "industry": "Software—Application",
                "currency": "USD",
                "business_description": f"Test Corporation {i:03d} operates in the software industry."
            }
            assets.append(asset)
            
        return assets
        
    def execute_sample_insertion(self):
        """Executa inserção de amostra para teste"""
        self.log_event("SAMPLE_START", "Iniciando inserção de amostra")
        
        # Testar conexão
        if not self.test_api_connection():
            return {'success': False, 'error': 'Falha na conexão API'}
            
        # Obter contagem inicial
        initial_count = self.get_current_stock_count()
        
        # Criar e inserir lote de teste
        sample_assets = self.create_sample_batch(5)
        
        success = self.insert_assets_batch(sample_assets)
        
        if success:
            # Aguardar e verificar resultado
            time.sleep(2)
            final_count = self.get_current_stock_count()
            
            if final_count and initial_count:
                added = final_count - initial_count
                self.log_event("SAMPLE_COMPLETE", f"✅ Inserção concluída: +{added} ações")
                return {
                    'success': True,
                    'initial_count': initial_count,
                    'final_count': final_count,
                    'added': added
                }
            else:
                return {'success': True, 'note': 'Inserção executada, contagem não disponível'}
        else:
            return {'success': False, 'error': 'Falha na inserção'}
            
    def refresh_materialized_view(self):
        """Atualiza a Materialized View via função RPC"""
        self.log_event("REFRESH_MV", "Atualizando Materialized View")
        
        try:
            # Tentar via função RPC personalizada (se existir)
            url = f"{self.base_url}/rest/v1/rpc/refresh_stocks_view"
            
            response = requests.post(url, headers=self.headers, json={}, timeout=60)
            
            if response.status_code == 200:
                self.log_event("REFRESH_SUCCESS", "✅ Materialized View atualizada")
                return True
            else:
                self.log_event("REFRESH_ERROR", f"❌ Erro refresh: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_event("REFRESH_ERROR", f"❌ Erro: {str(e)}")
            return False

def main():
    """Função principal"""
    print("🚀 EXECUTOR VIA API SUPABASE")
    print("=" * 40)
    
    executor = SupabaseAPIExecutor()
    
    try:
        executor.log_event("STARTUP", "Iniciando executor via API")
        
        # Executar inserção de amostra
        results = executor.execute_sample_insertion()
        
        # Tentar atualizar Materialized View
        executor.refresh_materialized_view()
        
        # Relatório final
        print("\n" + "=" * 40)
        print("📊 RESUMO DA EXECUÇÃO:")
        print(f"   ✅ Sucesso: {results['success']}")
        if results['success'] and 'added' in results:
            print(f"   📈 Ações adicionadas: {results['added']}")
            print(f"   📊 Total final: {results['final_count']}")
        print("=" * 40)
        
        # Salvar relatório
        with open('scripts/api_execution_report.json', 'w', encoding='utf-8') as f:
            json.dump({
                'results': results,
                'execution_log': executor.execution_log
            }, f, indent=2, ensure_ascii=False)
            
        return results
        
    except Exception as e:
        executor.log_event("CRITICAL_ERROR", f"Erro crítico: {str(e)}")
        raise

if __name__ == "__main__":
    main()
